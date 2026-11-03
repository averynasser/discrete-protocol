import test from 'node:test';
import assert from 'node:assert/strict';
import { stages, sourceInfo } from '../src/data/lc75-curriculum';
import { checkAnswer } from '../src/lib/answers';

const original = stages.flatMap(stage => stage.pdfQuestions);
const all = stages.flatMap(stage => [...stage.pdfQuestions, stage.variation]);
const question = (id: string) => {
  const found = all.find(item => item.id === id);
  assert.ok(found, `Missing question ${id}`);
  return found;
};
const validates = (id: string, candidate: string) => {
  const q = question(id);
  return checkAnswer(candidate, q.answer, q.acceptedAnswers);
};
const choose = (n: number, r: number): number => {
  let value = 1;
  for (let k = 1; k <= r; k++) value = value * (n - r + k) / k;
  return Math.round(value);
};

test('curriculum covers all ten PDF questions and keeps seven variations distinct', () => {
  assert.equal(stages.length, 7);
  assert.equal(original.length, 35);
  assert.equal(all.length, 42);
  assert.deepEqual([...new Set(stages.flatMap(s => s.pdfQuestionNumbers))].sort((a,b) => a-b), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(all.map(q => q.id)).size, all.length);
  assert.equal(sourceInfo.questionPoints.reduce((a,b) => a+b,0), 100);
  for (const [index, stage] of stages.entries()) {
    assert.deepEqual(stage.coordinates3D, [0,0,index === 0 ? 0 : -22*index]);
    assert.equal(stage.variation.kind, 'variation');
    assert.match(stage.variation.prompt, /bukan soal PDF/);
    assert.ok(stage.pdfQuestions.every(q => q.kind !== 'variation'));
  }
});

test('every checkpoint has an accepted answer, a useful guide, and rejects blanks', () => {
  for (const q of all) {
    assert.ok(validates(q.id, q.answer), `${q.id} rejects its displayed answer`);
    assert.ok(!validates(q.id, '   '), `${q.id} accepts blank input`);
    assert.ok(q.steps.length >= 2, `${q.id} lacks a worked solution`);
    assert.ok(q.hint.length >= 20, `${q.id} lacks explanatory feedback`);
    for (const accepted of q.acceptedAnswers ?? []) assert.ok(validates(q.id, accepted), q.id);
  }
});

test('access truth table and Gray-code K-map match the described security rules', () => {
  const access = (p:number,i:number,t:number) => Number(Boolean((p && i && t) || (!p && i)));
  const table = Array.from({length:8}, (_,n) => access((n>>2)&1,(n>>1)&1,n&1));
  assert.ok(validates('1b', table.join(',')));
  const gray = [[0,0],[0,1],[1,1],[1,0]];
  const map = [0,1].flatMap(p => gray.map(([i,t]) => access(p,i,t)));
  assert.ok(validates('1c', map.join(',')));
  assert.ok(!validates('1b', '0,0,1,1,0,0,1,1'), '110 must remain denied');
});

test('question 2 uses the visually verified PDF rows, not the incorrect PRD table', () => {
  // Independent transcription of PDF page 2, in ascending binary input order.
  const pdfOutput = [1,1,0,0,1,0,1,0];
  const minterms = pdfOutput.flatMap((value,index) => value ? [index] : []);
  assert.ok(validates('2i', minterms.join(',')));
  assert.ok(!validates('2i', '0,2,4,6'), 'PRD minterms must not be accepted');
  for (let n=0;n<8;n++) {
    const x=(n>>2)&1,y=(n>>1)&1,z=n&1;
    const simplified=Number(Boolean((!x&&!y)||(x&&!z)));
    assert.equal(simplified,pdfOutput[n], `xyz=${n.toString(2).padStart(3,'0')}`);
  }
  assert.ok(validates('2ii', "xz'+x'y'"));
  assert.ok(!validates('2ii', "z'"));
});

test('proposition and quantified statement answers survive exhaustive truth checks', () => {
  const implies=(p:boolean,q:boolean)=>!p||q;
  for (const p of [false,true]) for (const q of [false,true]) for (const r of [false,true]) {
    assert.equal(implies(p,q)&&implies(p,r),implies(p,q&&r));
    if (implies(p,r)&&implies(q,r)) assert.ok(implies(p||q,r));
  }
  assert.ok(validates('3a','ekuivalen'));
  assert.ok(validates('3b','valid'));
  const p=(x:number)=>1-x<=3*x;
  assert.ok(validates('4a',String(p(1))));
  assert.ok(validates('4d',String(p(0))));
  assert.ok(validates('4b','True'));
  assert.ok(validates('4c','False'));
  assert.ok(validates('4e','True'));
});

test('proof checkpoints match algebra for negative, zero, and positive integers', () => {
  for(let k=-10;k<=10;k++) {
    assert.equal((2*k+1)**2+3,4*(k*k+k+1));
    assert.equal(7*(2*k+1)+4,2*(7*k+5)+1);
    assert.equal(6*(5*k+1)-1,5*(6*k+1));
    assert.equal(4*(3*k+1)-1,3*(4*k+1));
  }
  assert.equal(6**0-1,0);
  assert.ok(validates('5a','k^2+k+1'));
  assert.ok(validates('5b','7k+5'));
  assert.ok(validates('5c','6m+1'));
});

test('set operations and inclusion-exclusion preserve disjoint population counts', () => {
  const A=[3,6,9], B=[2,3,5,7];
  const union=[...new Set([...A,...B])].sort((a,b)=>a-b);
  const intersection=A.filter(x=>B.includes(x));
  const difference=A.filter(x=>!B.includes(x));
  const symmetric=union.filter(x=>!(A.includes(x)&&B.includes(x)));
  assert.ok(validates('6a.i',union.join(',')));
  assert.ok(validates('6a.ii',intersection.join(',')));
  assert.ok(validates('6a.iii',difference.join(',')));
  assert.ok(validates('6a.iv',symmetric.join(',')));
  assert.ok(validates('6b',String(250-(50+75-35))));
  assert.equal((50-35)+35+(75-35)+160,250);
  assert.ok(!validates('6b','125'));
});

test('combination answers match independently computed counts and complements', () => {
  assert.ok(validates('7a',String(choose(10,5))));
  const byCases=[0,1,2,3].reduce((total,w)=>total+choose(4,w)*choose(6,5-w),0);
  assert.ok(validates('7b',String(byCases)));
  assert.ok(validates('7c',String(choose(8,4))));
  assert.ok(validates('10a',String(choose(5,2)*choose(20,2))));
  assert.ok(validates('10b',String(choose(25,4)-choose(20,4))));
  assert.ok(validates('v5',String(choose(12,4)-choose(9,4))));
});

test('fuzzy answers use pointwise complement, maximum, and minimum', () => {
  const F=[0.6,0.9,0.4,0.1,0.5],R=[0.4,0.8,0.2,0.9,0.7];
  const format=(numbers:number[])=>numbers.map(n=>Number(n.toFixed(1))).join(',');
  assert.ok(validates('8b.F',format(F.map(n=>1-n))));
  assert.ok(validates('8b.R',format(R.map(n=>1-n))));
  assert.ok(validates('8b.union',format(F.map((n,i)=>Math.max(n,R[i])))));
  assert.ok(validates('8b.intersection',format(F.map((n,i)=>Math.min(n,R[i])))));
  assert.ok(!validates('8b.union','1,1.7,0.6,1,1.2'));
});

test('Euclidean, Bezout, and modular solution answers meet the original equations', () => {
  const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
  assert.ok(validates('9a',String(gcd(19,141))));
  assert.equal(gcd(97,13),1);
  const [s,t]=question('9b').answer.split(',').map(Number);
  assert.equal(s*141+t*19,1);
  assert.equal((19*t)%141,1);
  const x=Number(question('9c').answer);
  assert.equal((19*x)%141,10);
  assert.ok(x>0&&x<141);
  for(let smaller=1;smaller<x;smaller++) assert.notEqual((19*smaller)%141,10);
  assert.equal((7*Number(question('v7').answer))%26,3);
});
