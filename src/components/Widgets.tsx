'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type WidgetProps = {
  stage: number;
  onCircuitChange?: (values: [boolean, boolean, boolean]) => void;
  onInductionChange?: (step: number) => void;
};

const muted: CSSProperties = { color: '#94a9b9', fontSize: 12, lineHeight: 1.7 };
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' };
const stack: CSSProperties = { display: 'grid', gap: 16 };
const card: CSSProperties = { border: '1px solid #27444d', borderRadius: 10, padding: 14, background: '#07151d' };
const cyan = '#6de5df';
const mono: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' };

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="widget" style={stack}><div className="widget-title" style={{ ...mono, fontSize: 11, letterSpacing: '0.13em', color: cyan }}>{title}</div>{children}</div>;
}

function Chip({ selected, children, onClick, disabled = false }: { selected?: boolean; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="btn btn-small btn-secondary" onClick={onClick} disabled={disabled} aria-pressed={selected} style={{ padding: '8px 11px', borderRadius: 7, border: `1px solid ${selected ? cyan : '#2a414d'}`, color: selected ? '#b4fff0' : '#bdcbd3', background: selected ? '#123b40' : '#0c1b25', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1 }}>{children}</button>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return <button type="button" onClick={onChange} aria-pressed={value} style={{ flex: 1, padding: '12px 10px', borderRadius: 10, border: `1px solid ${value ? '#40b8a8' : '#34434b'}`, background: value ? '#0d3a38' : '#111e28', color: value ? '#81f1d9' : '#a3b1bd', cursor: 'pointer' }}><span style={{ ...mono, fontSize: 12 }}>{label}</span><strong style={{ display: 'block', fontSize: 24, marginTop: 3 }}>{value ? '1' : '0'}</strong></button>;
}

const bits = (n: number) => [(n >> 2) & 1, (n >> 1) & 1, n & 1];
const minterms = [2, 3, 7];
const gridTerms = [0, 1, 3, 2, 4, 5, 7, 6];

function groupExpression(group: number[]) {
  return ['P', 'I', 'T'].map((name, i) => {
    const values = group.map(n => bits(n)[i]);
    return values.every(x => x === values[0]) ? name + (values[0] ? '' : '′') : '';
  }).join('') || '1';
}

function validGroup(group: number[]) {
  if (![1, 2, 4, 8].includes(group.length) || !group.every(n => minterms.includes(n))) return false;
  const positions = group.map(n => gridTerms.indexOf(n));
  const rows = [...new Set(positions.map(n => Math.floor(n / 4)))];
  const cols = [...new Set(positions.map(n => n % 4))];
  if (rows.length * cols.length !== positions.length) return false;
  if (![1, 2, 4].includes(cols.length)) return false;
  if (cols.length === 2 && ![1, 3].includes(Math.abs(cols[0] - cols[1]))) return false;
  return rows.every(r => cols.every(c => positions.includes(r * 4 + c)));
}

function Circuit({ onChange }: { onChange?: WidgetProps['onCircuitChange'] }) {
  const [values, setValues] = useState<[boolean, boolean, boolean]>([false, true, false]);
  const [selection, setSelection] = useState<number[]>([]);
  const [groups, setGroups] = useState<number[][]>([]);
  const [message, setMessage] = useState('Klik sel 1 yang bertetangga, lalu simpan kelompok. Satu sel boleh dipakai lagi.');
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  useEffect(() => { changeRef.current?.(values); }, [values]);
  const [p, i, t] = values;
  const output = i && (!p || t);
  const covered = [...new Set(groups.flat())];
  const complete = minterms.every(n => covered.includes(n));
  function toggle(index: number) {
    const next = values.map((v, j) => j === index ? !v : v) as [boolean, boolean, boolean];
    setValues(next);
  }
  function saveGroup() {
    if (!validGroup(selection)) {
      setMessage('Belum cocok. Pilih hanya sel 1 dalam persegi panjang berisi 1, 2, 4, atau 8 sel. Tepi kiri dan kanan juga bertetangga.'); return;
    }
    const normalized = [...selection].sort((a, b) => a - b);
    if (groups.some(g => [...g].sort((a, b) => a - b).join() === normalized.join())) { setMessage('Kelompok ini sudah tersimpan. Cari kelompok lain agar semua sel 1 tercakup.'); return; }
    setGroups([...groups, normalized]); setSelection([]);
    setMessage(`Kelompok valid → ${groupExpression(normalized)}. Variabel yang berubah dalam kelompok dihilangkan.`);
  }
  return <Panel title="01 / CIRCUIT SANDBOX">
    <div className="toggle-row" style={row}>{['P · Pintu', 'I · Kartu', 'T · Waktu'].map((label, index) => <Toggle key={label} label={label} value={values[index]} onChange={() => toggle(index)} />)}</div>
    <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span style={mono}>A = I(P′ + T)</span><strong style={{ color: output ? '#81f1bd' : '#ed888b', fontSize: 13 }}>{output ? '● AKSES TERBUKA' : '● AKSES TERKUNCI'}</strong></div>
    <div style={muted}>Kartu harus aktif. Setelah itu, cukup salah satu: P = 0 atau T = 1.</div>
    <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', ...mono, fontSize: 12 }}><thead><tr>{['P', 'I', 'T', 'A'].map(h => <th key={h} style={{ padding: 7, color: cyan }}>{h}</th>)}</tr></thead><tbody>{Array.from({ length: 8 }, (_, n) => { const b = bits(n); const active = b.every((v, j) => !!v === values[j]); return <tr key={n} style={{ background: active ? '#153c40' : 'transparent' }}>{[...b, Number(minterms.includes(n))].map((v, j) => <td key={j} style={{ textAlign: 'center', padding: 5, borderTop: '1px solid #17303a', color: j === 3 && v ? '#7df0bf' : '#bdccd6' }}>{v}</td>)}</tr>; })}</tbody></table></div>
    <div><div style={{ ...muted, marginBottom: 8 }}>K-MAP · baris P, kolom IT · Gray Code</div><div className="math-grid" style={{ display: 'grid', gridTemplateColumns: '30px repeat(4, 1fr)', gap: 5 }}><span />{['00', '01', '11', '10'].map(label => <span key={label} style={{ ...mono, textAlign: 'center', color: '#90b3bc', fontSize: 12 }}>{label}</span>)}{[0, 1].map(r => <div key={r} style={{ display: 'contents' }}><span style={{ alignSelf: 'center', ...mono }}>{r}</span>{gridTerms.slice(r * 4, r * 4 + 4).map(n => <button key={n} type="button" className="math-cell" aria-label={`P=${bits(n)[0]}, I=${bits(n)[1]}, T=${bits(n)[2]}, nilai ${Number(minterms.includes(n))}`} aria-pressed={selection.includes(n)} onClick={() => setSelection(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])} style={{ padding: '15px 0', borderRadius: 6, border: `1px solid ${selection.includes(n) ? '#e2ff8a' : covered.includes(n) ? '#41a895' : '#23414c'}`, background: selection.includes(n) ? '#3b4930' : covered.includes(n) ? '#133b36' : '#101f29', color: minterms.includes(n) ? '#92f6d3' : '#70838f', cursor: 'pointer', fontSize: 19 }}>{Number(minterms.includes(n))}</button>)}</div>)}</div></div>
    <div style={row}><button type="button" className="btn btn-small" onClick={saveGroup}>Simpan kelompok</button><button type="button" className="btn btn-small btn-secondary" onClick={() => { setGroups([]); setSelection([]); setMessage('Kelompok direset. Mulai dari dua sel 1 pada baris P = 0.'); }}>Reset</button></div>
    <p className="widget-note" role="status" style={muted}>{message}</p>
    {groups.length > 0 && <div style={{ ...card, ...mono, fontSize: 14 }}>{groups.map(g => groupExpression(g)).join(' + ')}<div style={{ ...muted, marginTop: 6 }}>{covered.length}/3 sel 1 tercakup</div></div>}
    {complete && <div className="success-text" style={{ ...card, color: '#8cf0c1' }}>Semua sel 1 tercakup. Bentuk minimal: <strong>P′I + IT = I(P′ + T)</strong>.<div style={{ ...muted, marginTop: 5 }}>Kelompok dua sel pada baris atas memberi P′I. Kelompok vertikal pada kolom 11 memberi IT.</div></div>}
  </Panel>;
}

function Logic() {
  const [values, setValues] = useState([true, false, true]);
  const [x, setX] = useState('0');
  const [p, q, r] = values;
  const left = (!p || q) && (!p || r);
  const right = !p || (q && r);
  const integer = x.trim() !== '' && Number.isInteger(Number(x));
  const holds = integer && 1 - Number(x) <= 3 * Number(x);
  return <Panel title="02 / TRUTH VALIDATOR">
    <div style={row}>{['p', 'q', 'r'].map((label, j) => <Toggle key={label} label={label} value={values[j]} onChange={() => setValues(v => v.map((b, k) => k === j ? !b : b))} />)}</div>
    <div style={{ ...card, ...mono, fontSize: 13, lineHeight: 2.2 }}><div>(p → q) ∧ (p → r) <strong style={{ float: 'right', color: cyan }}>{left ? 'T' : 'F'}</strong></div><div>p → (q ∧ r) <strong style={{ float: 'right', color: cyan }}>{right ? 'T' : 'F'}</strong></div></div>
    <p style={muted}>Ubah p, q, r: kedua hasil selalu sama. Implikasi hanya salah saat awalnya True tetapi akibatnya False.</p>
    <table style={{ width: '100%', textAlign: 'center', ...mono, fontSize: 12, borderCollapse: 'collapse' }}><thead><tr>{['pqr', 'Kiri', 'Kanan', 'Sama?'].map(h => <th key={h} style={{ color: cyan, padding: 6 }}>{h}</th>)}</tr></thead><tbody>{Array.from({ length: 8 }, (_, n) => { const [a, b, c] = bits(n).map(Boolean); const l = (!a || b) && (!a || c); const rr = !a || (b && c); return <tr key={n}><td style={{ padding: 5, borderTop: '1px solid #17303a' }}>{bits(n).join('')}</td><td>{Number(l)}</td><td>{Number(rr)}</td><td style={{ color: '#82eac0' }}>✓</td></tr>; })}</tbody></table>
    <div style={card}><label htmlFor="predicate-x" style={{ ...muted, display: 'block' }}>Uji P(x): 1 − x ≤ 3x, dengan x bilangan bulat</label><div style={{ ...row, marginTop: 10 }}><input id="predicate-x" className="field" type="number" step="1" value={x} onChange={e => setX(e.target.value)} style={{ width: 90 }} /><strong style={{ color: holds ? '#7bf0bc' : '#f6a7a2' }}>{integer ? `${1 - Number(x)} ≤ ${3 * Number(x)} → ${holds ? 'True' : 'False'}` : 'Masukkan bilangan bulat'}</strong></div></div>
    <p style={muted}>x = 1 menjadi saksi ∃x P(x). x = 0 menjadi contoh penyangkal ∀x P(x). Ada bilangan bulat yang benar dan ada yang salah.</p>
  </Panel>;
}

const proofSteps = [
  { title: 'Basis', body: 'n = 0: 6⁰ − 1 = 0 = 5 × 0. Domino pertama berdiri.' },
  { title: 'Hipotesis', body: 'Untuk suatu k ≥ 0, asumsikan 6ᵏ − 1 = 5m, m ∈ ℤ. Jadi 6ᵏ = 5m + 1.' },
  { title: 'Langkah induksi', body: '6ᵏ⁺¹ − 1 = 6(5m + 1) − 1 = 5(6m + 1). Domino berikutnya pasti jatuh.' },
];
function Induction({ onChange }: { onChange?: WidgetProps['onInductionChange'] }) {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState('Pilih langkah pertama untuk membuktikan 6ⁿ − 1 habis dibagi 5.');
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  useEffect(() => { changeRef.current?.(step); }, [step]);
  function choose(index: number) {
    if (index !== step) { setFeedback(index < step ? 'Langkah itu sudah selesai. Lanjutkan rantai pembuktiannya.' : `Belum saatnya. Kita perlu ${proofSteps[step]?.title.toLowerCase()} terlebih dahulu.`); return; }
    setFeedback(proofSteps[index].body); setStep(step + 1);
  }
  return <Panel title="03 / INDUCTION BRIDGE">
    <div style={{ ...card, display: 'flex', gap: 10, height: 110, alignItems: 'end', justifyContent: 'center', overflow: 'hidden' }} aria-label={`${step} dari 3 langkah pembuktian selesai`}>{Array.from({ length: 7 }, (_, j) => <div key={j} style={{ width: 22, height: 52 + j * 3, borderRadius: 4, background: step === 3 || j < step ? 'linear-gradient(#a5f5c9,#28746e)' : 'linear-gradient(#35536a,#152839)', transform: step === 3 ? 'rotate(54deg)' : 'none', transformOrigin: 'bottom right', transition: `transform .55s ${j * .1}s, background .4s`, boxShadow: step === 3 ? '0 0 20px #41e3b73b' : 'none' }} />)}</div>
    <div style={row}>{[2, 0, 1].map(index => <Chip key={index} selected={index < step} disabled={step === 3} onClick={() => choose(index)}>{index < step ? '✓ ' : ''}{proofSteps[index].title}</Chip>)}</div>
    <p role="status" style={{ ...muted, color: step === 3 ? '#91f3c9' : '#b3c7d0' }}>{feedback}</p>
    {proofSteps.slice(0, step).map((s, j) => <div key={s.title} style={card}><strong style={{ color: cyan, fontSize: 13 }}>0{j + 1} / {s.title}</strong><p style={muted}>{s.body}</p></div>)}
    {step === 3 && <div style={{ ...card, color: '#8bf1c3', fontSize: 13 }}>Terbukti untuk setiap n ≥ 0. Basis memulai rantai; langkah induksi membuat rantai berlanjut tanpa batas.</div>}
    <button type="button" className="btn btn-small btn-secondary" onClick={() => { setStep(0); setFeedback('Mulai lagi dari domino pertama: basis.'); }}>Ulangi pembuktian</button>
  </Panel>;
}

const setResults: Record<string, number[]> = { 'A ∪ B': [2, 3, 5, 6, 7, 9], 'A ∩ B': [3], 'A − B': [6, 9], 'A △ B': [2, 5, 6, 7, 9] };
function Sets() {
  const [op, setOp] = useState('A ∪ B');
  const result = setResults[op];
  return <Panel title="04 / VENN OBSERVATORY">
    <div style={{ ...mono, fontSize: 13, lineHeight: 1.9 }}>A = {'{3, 6, 9}'}<br />B = {'{2, 3, 5, 7}'}</div>
    <div style={row}>{Object.keys(setResults).map(o => <Chip key={o} selected={op === o} onClick={() => setOp(o)}>{o}</Chip>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>{Array.from({ length: 10 }, (_, j) => j + 1).map(n => <div key={n} style={{ padding: 12, textAlign: 'center', borderRadius: 7, color: result.includes(n) ? '#9df7c9' : '#69818e', background: result.includes(n) ? '#173f3a' : '#10202b', border: `1px solid ${result.includes(n) ? '#45b59a' : '#1c3541'}` }}>{n}</div>)}</div>
    <div style={{ ...card, ...mono, color: cyan }}>{op} = {'{'}{result.join(', ')}{'}'}</div>
    {op === 'A − B' && <p style={muted}>Power set-nya: P({'{6, 9}'}) = {'{∅, {6}, {9}, {6, 9}}'}. Dua anggota menghasilkan 2² = 4 subset, termasuk himpunan kosong.</p>}
    <svg role="img" aria-label="Diagram Venn restoran: pizza saja 15, keduanya 35, spageti saja 40, tidak keduanya 160" viewBox="0 0 400 230" style={{ width: '100%', border: '1px solid #25414c', borderRadius: 10, background: '#081a23' }}><text x="18" y="25" fill="#9fb8c6" fontSize="12">U = 250 TAMU</text><circle cx="155" cy="119" r="72" fill="#15ada332" stroke="#58c8bc" /><circle cx="247" cy="119" r="72" fill="#7678da29" stroke="#9294ed" /><text x="121" y="111" fill="#8de9d1" fontSize="11" textAnchor="middle">PIZZA SAJA</text><text x="121" y="138" fill="#c8fff0" fontSize="24" textAnchor="middle">15</text><text x="201" y="128" fill="#e1faff" fontSize="23" textAnchor="middle">35</text><text x="280" y="111" fill="#c5c5f9" fontSize="10" textAnchor="middle">SPAGETI SAJA</text><text x="280" y="138" fill="#e6e4ff" fontSize="24" textAnchor="middle">40</text><text x="20" y="211" fill="#91a5b4" fontSize="12">DI LUAR KEDUANYA: 160</text></svg>
    <p style={muted}>50 pemesan pizza sudah termasuk 35 pemesan keduanya; 75 pemesan spageti juga. Karena itu, zona pizza saja = 15 dan spageti saja = 40. Total gabungan = 15 + 35 + 40 = 90; sisanya 250 − 90 = 160.</p>
  </Panel>;
}

const members = [
  { name: 'Andi', gender: 'P' }, { name: 'Bima', gender: 'P' }, { name: 'Candra', gender: 'P' }, { name: 'Deni', gender: 'P' }, { name: 'Eko', gender: 'P' }, { name: 'Fajar', gender: 'P' },
  { name: 'Bonita', gender: 'W' }, { name: 'Citra', gender: 'W' }, { name: 'Dina', gender: 'W' }, { name: 'Elsa', gender: 'W' },
];
function combinations(n: number, r: number) { if (r < 0 || r > n) return 0; let value = 1; for (let j = 1; j <= Math.min(r, n - r); j++) value = value * (n - j + 1) / j; return Math.round(value); }

function Teams() {
  const [mode, setMode] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Pilih 5 orang. Urutan klik tidak mengubah tim.');
  const [medals, setMedals] = useState(2);
  const women = members.filter(m => m.gender === 'W' && chosen.includes(m.name)).length;
  const valid = chosen.length === 5 && (mode !== 1 || women <= 3) && (mode !== 2 || (chosen.includes('Andi') && !chosen.includes('Bonita')));
  function pick(name: string) {
    if (mode === 2 && ['Andi', 'Bonita'].includes(name)) return;
    if (chosen.includes(name)) { setChosen(chosen.filter(n => n !== name)); setFeedback('Kursi dikosongkan. Pilih anggota pengganti.'); return; }
    if (chosen.length >= 5) { setFeedback('Tim sudah berisi 5 orang. Lepas satu anggota sebelum memilih pengganti.'); return; }
    setChosen([...chosen, name]); setFeedback('Anggota dipilih. P = pria, W = wanita.');
  }
  return <Panel title="05 / TEAM BUILDER">
    <div style={row}>{['Bebas', 'Maks. 3 wanita', 'Andi ✓ · Bonita ×'].map((label, index) => <Chip key={label} selected={mode === index} onClick={() => { setMode(index); setChosen(index === 2 ? ['Andi'] : []); setFeedback(index === 2 ? 'Andi mengisi 1 kursi. Bonita dikeluarkan dari kandidat. Pilih 4 dari 8 sisanya.' : 'Pilih 5 orang untuk membentuk tim.'); }}>{label}</Chip>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>{members.map(m => <button key={m.name} type="button" onClick={() => pick(m.name)} disabled={mode === 2 && ['Andi', 'Bonita'].includes(m.name)} aria-pressed={chosen.includes(m.name)} style={{ ...card, padding: 10, display: 'flex', alignItems: 'center', gap: 10, color: chosen.includes(m.name) ? '#a6f8d1' : '#b0c4cf', borderColor: chosen.includes(m.name) ? '#4bb697' : '#25404c', opacity: mode === 2 && m.name === 'Bonita' ? .4 : 1, cursor: mode === 2 && ['Andi', 'Bonita'].includes(m.name) ? 'default' : 'pointer' }}><span style={{ display: 'grid', placeItems: 'center', background: m.gender === 'W' ? '#3d304d' : '#183e4d', borderRadius: 6, width: 30, height: 30, fontSize: 11 }}>{m.gender}</span><span style={{ fontSize: 12 }}>{m.name}</span><span style={{ marginLeft: 'auto' }}>{chosen.includes(m.name) ? '✓' : mode === 2 && m.name === 'Bonita' ? '×' : '+'}</span></button>)}</div>
    <div style={{ ...row, justifyContent: 'space-between', fontSize: 13 }}><span>{chosen.length}/5 kursi · {women} wanita</span><strong style={{ color: valid ? '#86f0bc' : '#d4b87b' }}>{chosen.length === 5 ? valid ? 'Tim memenuhi syarat' : 'Syarat belum terpenuhi' : 'Tim belum lengkap'}</strong></div>
    <p role="status" style={muted}>{feedback}</p>
    <div style={{ ...card, ...mono, color: cyan, fontSize: 14 }}>{['C(10,5) = 252 tim', 'C(10,5) − C(4,4)C(6,1) = 246 tim', 'C(8,4) = 70 tim'][mode]}</div>
    <p style={muted}>Nama selain Andi dan Bonita adalah label avatar latihan. Hanya jumlah 6 pria, 4 wanita, serta syarat soal yang menentukan banyak tim.</p>
    <div style={card}><label htmlFor="medal-count" style={{ ...muted, display: 'block' }}>Soal 10 · pilih 4 dari 5 peraih medali + 20 nonmedali</label><div style={{ ...row, marginTop: 10 }}><span style={muted}>Tepat</span><select id="medal-count" className="field" value={medals} onChange={e => setMedals(Number(e.target.value))}>{[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}</select><span style={muted}>peraih medali</span></div><p style={{ ...mono, color: cyan, fontSize: 13 }}>C(5,{medals}) × C(20,{4 - medals}) = {(combinations(5, medals) * combinations(20, 4 - medals)).toLocaleString('id-ID')}</p><p style={muted}>Setidaknya satu: C(25,4) − C(20,4) = 7.805 tim.</p></div>
  </Panel>;
}

const fuzzyNames = ['Alice', 'Brian', 'Fred', 'Oscar', 'Rita'];
const originalF = [.6, .9, .4, .1, .5];
const originalR = [.4, .8, .2, .9, .7];
function Fuzzy() {
  const [f, setF] = useState(originalF);
  const [r, setR] = useState(originalR);
  const [person, setPerson] = useState(0);
  const changed = f.some((v, j) => v !== originalF[j]) || r.some((v, j) => v !== originalR[j]);
  return <Panel title="06 / FUZZY MEMBERSHIP LAB">
    <div style={row}>{fuzzyNames.map((name, j) => <Chip key={name} selected={person === j} onClick={() => setPerson(j)}>{name}</Chip>)}</div>
    <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>{([{ label: 'F · Ketenaran', values: f, setter: setF, color: '#72e4ce' }, { label: 'R · Kekayaan', values: r, setter: setR, color: '#9f96f3' }]).map(({ label, values, setter, color }) => <div key={label}><label style={{ ...muted, color, display: 'block' }}>{label}<div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}><div style={{ height: 100, width: 42, border: `1px solid ${color}`, borderRadius: '8px 8px 16px 16px', position: 'relative', overflow: 'hidden', background: '#091820' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${values[person] * 100}%`, background: color, opacity: .65, transition: 'height .2s' }} /></div></div><input type="range" aria-label={`${label} ${fuzzyNames[person]}`} min="0" max="1" step="0.1" value={values[person]} onChange={e => setter(values.map((v, j) => j === person ? Number(e.target.value) : v))} style={{ width: '100%', accentColor: color }} /><strong style={{ display: 'block', textAlign: 'center', fontSize: 19 }}>{values[person].toFixed(1)}</strong></label></div>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{[{ label: 'F̄ = 1 − F', value: 1 - f[person] }, { label: 'R̄ = 1 − R', value: 1 - r[person] }, { label: 'F ∪ R = max', value: Math.max(f[person], r[person]) }, { label: 'F ∩ R = min', value: Math.min(f[person], r[person]) }].map(item => <div key={item.label} style={card}><div style={muted}>{item.label}</div><strong style={{ color: cyan, fontSize: 22 }}>{item.value.toFixed(1)}</strong></div>)}</div>
    <div style={row}><span style={{ ...muted, color: changed ? '#e6bd7f' : '#91dcbf' }}>{changed ? 'Simulasi: nilai sudah diubah dari PDF' : 'Nilai asli dari soal 8b'}</span><button type="button" className="btn btn-small btn-secondary" onClick={() => { setF(originalF); setR(originalR); }}>Reset nilai PDF</button></div>
    <div style={card}><div style={{ ...mono, fontSize: 12, lineHeight: 2, color: '#b4c7d2' }}>p → 4 · q → 5 · r → 1 · s → 2<br />t → 2 · u → 3 · v → 6 · w → 2</div><p style={muted}><span style={{ color: '#f1c38d' }}>Tidak injektif:</span> s, t, w menuju angka 2 yang sama.<br /><span style={{ color: '#f1c38d' }}>Tidak surjektif:</span> anggota kodomain 7 tidak dituju.<br />Karena itu, fungsi juga tidak bijektif.</p></div>
  </Panel>;
}

const euclid = [
  { a: 141, b: 19, q: 7, r: 8 }, { a: 19, b: 8, q: 2, r: 3 }, { a: 8, b: 3, q: 2, r: 2 }, { a: 3, b: 2, q: 1, r: 1 }, { a: 2, b: 1, q: 2, r: 0 },
];
function Euclid() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('Isi sisa pembagian. Sisa selalu ≥ 0 dan lebih kecil dari pembaginya.');
  const [candidate, setCandidate] = useState('');
  const current = euclid[step];
  const x = Number(candidate);
  const validCandidate = candidate.trim() !== '' && Number.isSafeInteger(x);
  const remainder = validCandidate ? Number(((19n * BigInt(x)) % 141n + 141n) % 141n) : null;
  function check() {
    if (!current) return;
    if (answer.trim() === '' || Number(answer) !== current.r) { setFeedback(`Coba hitung ${current.a} − (${current.q} × ${current.b}). Itulah sisanya.`); return; }
    setStep(step + 1); setAnswer(''); setFeedback(current.r === 0 ? 'Sisa 0: berhenti. Sisa terakhir yang bukan nol adalah 1, jadi FPB = 1.' : `Benar, sisanya ${current.r}. Sekarang pembagi ${current.b} menjadi angka besar, dan sisa ${current.r} menjadi pembagi.`);
  }
  return <Panel title="07 / EUCLIDEAN CONSOLE">
    <div style={{ ...card, ...mono, fontSize: 14, lineHeight: 2.2 }}>{euclid.slice(0, step).map((s, j) => <div key={j} style={{ color: '#82debf' }}>{s.a} = {s.q} × {s.b} + {s.r} <span style={{ float: 'right' }}>✓</span></div>)}{current && <form onSubmit={e => { e.preventDefault(); check(); }}><label htmlFor="euclid-remainder" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span>{current.a} = {current.q} × {current.b} +</span><input id="euclid-remainder" aria-label="Sisa pembagian" className="field" type="number" min="0" step="1" value={answer} onChange={e => setAnswer(e.target.value)} style={{ width: 66 }} /><button type="submit" className="btn btn-small">Cek</button></label></form>}{step === 0 && <div style={muted}>Langkah 1 dari 5</div>}</div>
    <p role="status" style={muted}>{feedback}</p>
    {step === 5 && <><div style={card}><strong style={{ color: cyan, fontSize: 13 }}>SUBSTITUSI MUNDUR</strong><div style={{ ...mono, fontSize: 12, lineHeight: 2, marginTop: 10 }}>1 = 3 − 2<br />= 3 − (8 − 2 × 3)<br />= 3 × 3 − 8<br />= 3(19 − 2 × 8) − 8<br />= 3 × 19 − 7 × 8<br />= 3 × 19 − 7(141 − 7 × 19)<br /><span style={{ color: '#9bf6c9' }}>= −7 × 141 + 52 × 19</span></div></div><p style={muted}>Invers 19 modulo 141 adalah 52. Maka 19x ≡ 10 menjadi x ≡ 520 ≡ 97 (mod 141). Semua solusi: x = 97 + 141k, k ∈ ℤ.</p></>}
    <div style={card}><label htmlFor="modulo-x" style={{ ...muted, display: 'block' }}>Uji kandidat x untuk 19x ≡ 10 (mod 141)</label><div style={{ ...row, marginTop: 10 }}><input id="modulo-x" className="field" type="number" step="1" value={candidate} onChange={e => setCandidate(e.target.value)} placeholder="Nilai x" style={{ width: 100 }} /><span style={{ ...mono, fontSize: 13, color: remainder === 10 ? '#8bf1c3' : '#c2cbd4' }}>{validCandidate ? `Sisa = ${remainder} ${remainder === 10 ? '✓ Solusi' : '≠ 10'}` : 'Masukkan bilangan bulat'}</span></div></div>
    <button type="button" className="btn btn-small btn-secondary" onClick={() => { setStep(0); setAnswer(''); setFeedback('Ulangi algoritma mulai dari 141 dibagi 19.'); }}>Ulangi algoritma</button>
  </Panel>;
}

export default function StageWidget({ stage, onCircuitChange, onInductionChange }: WidgetProps) {
  switch (stage) {
    case 1: return <Circuit onChange={onCircuitChange} />;
    case 2: return <Logic />;
    case 3: return <Induction onChange={onInductionChange} />;
    case 4: return <Sets />;
    case 5: return <Teams />;
    case 6: return <Fuzzy />;
    case 7: return <Euclid />;
    default: return null;
  }
}
