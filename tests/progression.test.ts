import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { stages } from '../src/data/lc75-curriculum';
import { checkAnswer } from '../src/lib/answers';

type StoreModule = typeof import('../src/lib/store');
let useProgress: StoreModule['useProgress'];
let unlockedStage: StoreModule['unlockedStage'];
const persisted = new Map<string, string>();
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

// Provide the same synchronous Storage contract the browser uses before
// Zustand's persistence middleware is loaded. This tests real store actions.
before(async () => {
  const storage: Storage = {
    get length() { return persisted.size; },
    clear() { persisted.clear(); },
    getItem(key) { return persisted.get(key) ?? null; },
    key(index) { return [...persisted.keys()][index] ?? null; },
    removeItem(key) { persisted.delete(key); },
    setItem(key, value) { persisted.set(key, value); },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: { localStorage: storage }, configurable: true });
  ({ useProgress, unlockedStage } = await import('../src/lib/store'));
});

beforeEach(() => useProgress.getState().reset());

after(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

function prepareWalkthrough(stageId: number) {
  const stage = stages[stageId - 1];
  useProgress.getState().learn(stageId);
  for (const q of stage.pdfQuestions) useProgress.getState().walk(q.id);
}

function solveAll(stageId: number) {
  const stage = stages[stageId - 1];
  for (const q of [...stage.pdfQuestions, stage.variation]) useProgress.getState().solve(q.id);
}

test('a stage must be learned before walkthrough, solving, or completion', () => {
  const first = stages[0];
  const state = () => useProgress.getState();
  state().walk(first.pdfQuestions[0].id);
  state().solve(first.pdfQuestions[0].id);
  state().solve(first.variation.id);
  state().complete(1);
  assert.deepEqual(state().walked, []);
  assert.deepEqual(state().solved, []);
  assert.deepEqual(state().completed, []);

  state().learn(1);
  state().learn(1);
  state().walk(first.pdfQuestions[0].id);
  state().walk(first.pdfQuestions[0].id);
  assert.deepEqual(state().learned, [1]);
  assert.deepEqual(state().walked, [first.pdfQuestions[0].id]);

  state().learn(2);
  state().walk(stages[1].pdfQuestions[0].id);
  assert.deepEqual(state().learned, [1], 'a locked next stage cannot be learned');
  assert.equal(state().walked.length, 1);
});

test('every original walkthrough must be finished before any gatekeeper answer counts', () => {
  const first = stages[0];
  useProgress.getState().learn(1);
  for (const q of first.pdfQuestions.slice(0, -1)) useProgress.getState().walk(q.id);
  useProgress.getState().solve(first.pdfQuestions[0].id);
  useProgress.getState().solve(first.variation.id);
  assert.deepEqual(useProgress.getState().solved, []);

  useProgress.getState().walk(first.pdfQuestions.at(-1)!.id);
  useProgress.getState().solve(first.pdfQuestions[0].id);
  useProgress.getState().solve(first.variation.id);
  useProgress.getState().solve(first.variation.id);
  assert.deepEqual(useProgress.getState().solved, [first.pdfQuestions[0].id, first.variation.id]);
});

test('all originals without the variation cannot unlock the next stage', () => {
  const first = stages[0];
  prepareWalkthrough(1);
  for (const q of first.pdfQuestions) useProgress.getState().solve(q.id);
  useProgress.getState().complete(1);
  assert.deepEqual(useProgress.getState().completed, []);
  assert.equal(unlockedStage(useProgress.getState().completed), 1);

  useProgress.getState().solve(first.variation.id);
  useProgress.getState().complete(1);
  useProgress.getState().complete(1);
  assert.deepEqual(useProgress.getState().completed, [1]);
  assert.equal(unlockedStage(useProgress.getState().completed), 2);
});

test('the variation cannot substitute for an unfinished original checkpoint', () => {
  const first = stages[0];
  prepareWalkthrough(1);
  for (const q of first.pdfQuestions.slice(0, -1)) useProgress.getState().solve(q.id);
  useProgress.getState().solve(first.variation.id);
  useProgress.getState().complete(1);
  assert.deepEqual(useProgress.getState().completed, []);
  useProgress.getState().solve(first.pdfQuestions.at(-1)!.id);
  useProgress.getState().complete(1);
  assert.deepEqual(useProgress.getState().completed, [1]);
});

test('seven sectors unlock sequentially and locked stages cannot be selected', () => {
  assert.equal(unlockedStage([]), 1);
  assert.equal(unlockedStage([2, 3]), 1, 'completion gaps must not unlock stages');
  assert.equal(unlockedStage([1, 3]), 2);
  assert.equal(unlockedStage([1, 2, 3, 4, 5, 6, 7]), 7);

  for (const stage of stages) {
    const stageId = stage.stageId;
    assert.equal(unlockedStage(useProgress.getState().completed), stageId);
    if (stageId < 7) {
      const next = stages[stageId];
      useProgress.getState().setStage(stageId + 1);
      useProgress.getState().learn(stageId + 1);
      useProgress.getState().walk(next.pdfQuestions[0].id);
      useProgress.getState().solve(next.variation.id);
      useProgress.getState().complete(stageId + 1);
      assert.ok(!useProgress.getState().learned.includes(stageId + 1));
      assert.ok(!useProgress.getState().solved.includes(next.variation.id));
      assert.ok(!useProgress.getState().completed.includes(stageId + 1));
    }
    useProgress.getState().setStage(stageId);
    assert.equal(useProgress.getState().activeStage, stageId);
    prepareWalkthrough(stageId);
    solveAll(stageId);
    useProgress.getState().complete(stageId);
  }
  assert.deepEqual(useProgress.getState().completed, [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(useProgress.getState().solved.length, 42);
  assert.equal(unlockedStage(useProgress.getState().completed), 7);
});

test('unknown question IDs and out-of-range stage IDs do not change progress', () => {
  prepareWalkthrough(1);
  const snapshot = {
    learned: [...useProgress.getState().learned],
    walked: [...useProgress.getState().walked],
    solved: [...useProgress.getState().solved],
    completed: [...useProgress.getState().completed],
    activeStage: useProgress.getState().activeStage,
  };
  useProgress.getState().walk('not-a-question');
  useProgress.getState().solve('not-a-question');
  for (const invalid of [0, -1, 8, NaN, Infinity]) {
    useProgress.getState().learn(invalid);
    useProgress.getState().complete(invalid);
    useProgress.getState().setStage(invalid);
  }
  for (const key of Object.keys(snapshot) as Array<keyof typeof snapshot>) {
    assert.deepEqual(useProgress.getState()[key], snapshot[key]);
  }
});

test('reset clears stored progress and returns the player to stage one', () => {
  prepareWalkthrough(1);
  solveAll(1);
  useProgress.getState().complete(1);
  useProgress.getState().setStage(2);
  useProgress.getState().learn(2);
  assert.equal(useProgress.getState().activeStage, 2);
  assert.ok(persisted.has('discrete-protocol-lc75-v1'));

  useProgress.getState().reset();
  const state = useProgress.getState();
  assert.deepEqual(state.learned, []);
  assert.deepEqual(state.walked, []);
  assert.deepEqual(state.solved, []);
  assert.deepEqual(state.completed, []);
  assert.equal(state.activeStage, 1);
  const saved = JSON.parse(persisted.get('discrete-protocol-lc75-v1')!);
  assert.deepEqual(saved.state, { learned: [], walked: [], solved: [], completed: [], activeStage: 1 });
  assert.equal(saved.version, 1);
});

test('power-set answers accept reordered subsets and reordered members', () => {
  const expected = '{∅,{6},{9},{6,9}}';
  assert.ok(checkAnswer('{{9,6},{9},∅,{6}}', expected));
  assert.ok(checkAnswer('{ {9}, {6,9}, {6}, {} }', expected));
  assert.ok(checkAnswer('{{6,9},{9},{6},\\emptyset}', expected));
  assert.ok(checkAnswer('{∅,{6},{9},{9,6},{6}}', expected), 'set duplicates do not change membership');
  assert.ok(checkAnswer('{9,6}', '6,9', ['{6,9}']));
});

test('set normalization preserves nesting and does not accept missing or extra subsets', () => {
  const expected = '{∅,{6},{9},{6,9}}';
  assert.ok(!checkAnswer('{{6},{9},{6,9}}', expected));
  assert.ok(!checkAnswer('{{∅},{6},{9},{6,9}}', expected), 'empty set is not the singleton containing the empty set');
  assert.ok(!checkAnswer('{∅,{6},{9},{6,9},{7}}', expected));
  assert.ok(!checkAnswer('{∅,6,9,{6,9}}', expected), 'numbers and singleton subsets differ');
  assert.ok(!checkAnswer('∅', '{∅}'));
  assert.ok(checkAnswer('{}', '∅'));
});

test('ordered numeric answers are not mistaken for sets or decimal numbers', () => {
  assert.ok(!checkAnswer('52,-7', '-7,52'));
  assert.ok(!checkAnswer('-7.52', '-7,52'), 'a decimal is not a pair of Bezout coefficients');
  assert.ok(!checkAnswer('0.9,0.6,0.4,0.9,0.7', '0.6,0.9,0.4,0.9,0.7'));
  assert.ok(checkAnswer('0,4', '0.4'), 'a decimal comma remains valid against a scalar decimal answer');
});
