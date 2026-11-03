export interface Question {
  id: string;
  prompt: string;
  formula?: string;
  steps: string[];
  answer: string;
  acceptedAnswers?: string[];
  hint: string;
  kind?: 'original' | 'variation';
}

export interface StageModule {
  stageId: number;
  sectorName: string;
  title: string;
  subtitle: string;
  loCode: 'LO1' | 'LO2';
  pdfQuestionNumbers: number[];
  minutes: number;
  accent: string;
  conceptZero: {
    title: string;
    eli5Explanation: string;
    formulas: string[];
    commonTraps: string[];
  };
  pdfQuestions: Question[];
  variation: Question;
  sourceNote?: string;
  interactiveWidgetType: string;
  coordinates3D: [number, number, number];
}

/**
 * Verified against Tugas Besar 1 Discrete - LC75.pdf, academic year 2026/2027,
 * pp. 1–4. Page 2 was rendered and visually inspected for question 2.
 * Prompts are faithful learning adaptations; checkpoint instructions specify
 * the answer format. The original essay solutions are in steps.
 * All variation questions are original practice, explicitly not from the PDF.
 * The student roster on pp. 5–6 is intentionally not included.
 */
export const sourceInfo = {
  title: 'Tugas Besar 1 Discrete - LC75.pdf',
  pages: '1–4',
  totalPoints: 100,
  questionPoints: [4, 6, 10, 10, 15, 20, 5, 10, 15, 5],
  verified: '2026-11-04',
  note: 'Materi dan pembahasan merujuk soal PDF; latihan variasi dibuat untuk menguji pemahaman. Checkpoint melatih bagian inti jawaban essay, bukan penilaian otomatis pembuktian lengkap.',
};

export const stages: StageModule[] = [
  {
    stageId: 1,
    sectorName: 'The Access Vault',
    title: 'Boolean & K-Map',
    subtitle: 'Nyalakan logika. Buka akses pertama.',
    loCode: 'LO1',
    pdfQuestionNumbers: [1, 2],
    minutes: 20,
    accent: '#56e5ef',
    coordinates3D: [0, 0, 0],
    interactiveWidgetType: 'KMAP_AND_CIRCUIT',
    sourceNote: 'Koreksi PRD setelah memeriksa PDF halaman 2: tabel soal 2 memiliki delapan input berbeda, tanpa baris duplikat. Output 1 ada pada 000, 001, 100, dan 110. Jadi hasil sederhananya x′y′ + xz′. Bobot soal 1 = 4 dan soal 2 = 6 poin.',
    conceptZero: {
      title: 'Sakelar kecil, keputusan besar',
      eli5Explanation: 'Bayangkan setiap variabel sebagai sakelar: 1 berarti benar/nyala, 0 berarti salah/mati. AND menuntut semua syarat menyala. OR cukup satu. NOT membalik sakelar. Untuk membuat rumus dari tabel, ambil hanya baris output 1: input 0 diberi aksen (NOT), input 1 tidak. Kalikan variabel dalam satu baris, lalu jumlahkan semua baris terpilih. Pada K-Map, tempatkan baris berdekatan menurut Gray Code 00, 01, 11, 10. Kelompokkan 1 dalam persegi panjang berukuran 1, 2, 4, atau 8; variabel yang berubah dibuang, yang tetap dipertahankan.',
      formulas: [String.raw`0'=1,\quad 1'=0`, String.raw`A=PIT+P'I`, String.raw`A=P'I+IT=I(P'+T)`, String.raw`f(x,y,z)=\Sigma m(0,1,4,6)=x'y'+xz'`],
      commonTraps: ['OR bukan penjumlahan biasa: 1 OR 1 tetap 1.', 'Kolom K-Map harus 00, 01, 11, 10; bukan urutan biner biasa.', 'Tepi kiri dan kanan K-Map bertetangga. Kelompok tidak boleh diagonal atau berisi 0.', 'Kelompok boleh tumpang tindih. Tujuannya menutup seluruh 1 dengan kelompok besar.', 'Jangan menyalin klaim typo soal 2 dari PRD: tabel PDF aslinya konsisten.'],
    },
    pdfQuestions: [
      {
        id: '1a',
        prompt: 'Sistem akses: P = pintu terbuka, I = kartu valid, T = jam kerja. Akses diizinkan jika kartu valid dan pintu terbuka saat jam kerja, ATAU pintu tertutup dan kartu valid tanpa memedulikan waktu. Tuliskan ekspresi A; gunakan aksen untuk NOT.',
        formula: String.raw`A=(P\land I\land T)\lor(\neg P\land I)`,
        steps: ['Kondisi pertama memakai AND: P · I · T.', 'Kondisi kedua: P = 0 dan I = 1. T boleh 0 atau 1, sehingga cukup P′I.', 'Gabungkan kedua kondisi memakai OR: A = PIT + P′I.'],
        answer: "PIT+P'I",
        acceptedAnswers: ["P'I+PIT", "I(P'+T)", "P'I+IT", "IT+P'I", "I(T+P')"],
        hint: 'Waktu tidak penting pada kondisi kedua, jadi variabel T tidak perlu muncul dalam suku P′I.',
      },
      {
        id: '1b',
        prompt: 'Buat tabel kebenaran sistem akses untuk urutan input PIT = 000, 001, 010, 011, 100, 101, 110, 111. Masukkan delapan nilai A berurutan, dipisah koma.',
        steps: ['000 → 0; 001 → 0: kartu tidak valid.', '010 → 1; 011 → 1: pintu tertutup dan kartu valid.', '100 → 0; 101 → 0: kartu tidak valid.', '110 → 0: pintu terbuka di luar jam kerja. 111 → 1: seluruh syarat pertama terpenuhi.', 'Kolom output berurutan: 0,0,1,1,0,0,0,1.'],
        answer: '0,0,1,1,0,0,0,1',
        acceptedAnswers: ['00110001'],
        hint: 'Ada tepat tiga baris output 1: PIT = 010, 011, dan 111.',
      },
      {
        id: '1c',
        prompt: 'Susun K-Map akses: baris P = 0 lalu 1; kolom IT = 00, 01, 11, 10. Masukkan empat nilai baris atas lalu empat nilai baris bawah, dipisah koma.',
        formula: String.raw`\begin{array}{c|cccc}P\backslash IT&00&01&11&10\\\hline 0&0&0&1&1\\1&0&0&1&0\end{array}`,
        steps: ['Baris atas adalah P = 0: 000, 001, 011, 010. Nilainya 0,0,1,1.', 'Baris bawah adalah P = 1: 100, 101, 111, 110. Nilainya 0,0,1,0.', 'Urutan IT menggunakan Gray Code agar sel tetangga hanya berbeda satu bit.'],
        answer: '0,0,1,1,0,0,1,0',
        acceptedAnswers: ['00110010', '0,0,1,1;0,0,1,0'],
        hint: 'Hati-hati: kolom ketiga adalah 11, bukan 10. Tabel biasa dan K-Map memakai urutan berbeda.',
      },
      {
        id: '1d',
        prompt: 'Sederhanakan A menggunakan K-Map dan susun gerbang AND, OR, NOT. Checkpoint: masukkan ekspresi minimum berbentuk jumlah dua suku, atau bentuk faktornya.',
        formula: String.raw`A=P'I+IT=I(P'+T)`,
        steps: ['Kelompok 010 dan 011: P = 0 dan I = 1 tetap; T berubah. Hasilnya P′I.', 'Kelompok 011 dan 111: I = 1 dan T = 1 tetap; P berubah. Hasilnya IT.', 'OR kedua suku: A = P′I + IT. Faktorkan I: A = I(P′ + T).', 'Rangkaian bentuk faktor: P → NOT; gabungkan P′ dan T dengan OR; gabungkan hasil OR dan I dengan AND.'],
        answer: "P'I+IT",
        acceptedAnswers: ["IT+P'I", "I(P'+T)", "I(T+P')", "(P'+T)I"],
        hint: 'Sel 011 boleh dipakai dua kali. Dua pasangan menghasilkan P′I dan IT.',
      },
      {
        id: '2i',
        prompt: 'Tabel PDF: xyz→output adalah 111→0, 110→1, 101→0, 100→1, 011→0, 010→0, 001→1, 000→1. Tentukan SOP kanonik. Checkpoint: masukkan nomor minterm output 1 dalam urutan naik.',
        formula: String.raw`f=xyz'+xy'z'+x'y'z+x'y'z'=\Sigma m(0,1,4,6)`,
        steps: ['Ambil hanya baris 110, 100, 001, 000 yang output-nya 1.', '110 memberi xyz′; 100 memberi xy′z′; 001 memberi x′y′z; 000 memberi x′y′z′.', 'Jumlahkan: f = xyz′ + xy′z′ + x′y′z + x′y′z′.', 'Nomor minterm adalah nilai biner xyz: 6, 4, 1, 0; urutan naik 0,1,4,6.'],
        answer: '0,1,4,6',
        acceptedAnswers: ['{0,1,4,6}', 'm(0,1,4,6)', 'Σm(0,1,4,6)'],
        hint: 'Jangan memakai angka dari PRD yang belum diperiksa. Di PDF, 001 bernilai 1 dan 010 bernilai 0.',
      },
      {
        id: '2ii',
        prompt: 'Gunakan K-Map untuk menyederhanakan f = Σm(0,1,4,6). Baris x = 0,1; kolom yz = 00,01,11,10. Masukkan ekspresi minimum; gunakan aksen untuk NOT.',
        formula: String.raw`\begin{array}{c|cccc}x\backslash yz&00&01&11&10\\\hline 0&1&1&0&0\\1&1&0&0&1\end{array}\qquad f=x'y'+xz'`,
        steps: ['Isi baris x = 0 dengan 1,1,0,0 dan baris x = 1 dengan 1,0,0,1.', 'Pasangkan 000 dengan 001: x = 0 dan y = 0 tetap → x′y′.', 'Pasangkan 100 dengan 110 melewati tepi kiri-kanan: x = 1 dan z = 0 tetap → xz′.', 'Semua 1 tertutup, sehingga f = x′y′ + xz′.'],
        answer: "x'y'+xz'",
        acceptedAnswers: ["xz'+x'y'", "y'x'+z'x", "z'x+y'x"],
        hint: 'Pada baris bawah, kolom paling kiri dan paling kanan bertetangga. Pasangan itu menghilangkan y.',
      },
    ],
    variation: {
      id: 'v1', kind: 'variation',
      prompt: 'Latihan variasi (bukan soal PDF): sebuah fungsi tiga variabel memiliki minterm 0,1,2,3. Sederhanakan dengan K-Map; urutan bit adalah xyz.',
      formula: String.raw`g(x,y,z)=\Sigma m(0,1,2,3)`,
      steps: ['Minterm 0,1,2,3 semuanya memiliki x = 0.', 'y dan z mencakup seluruh kemungkinan, jadi keduanya hilang dalam satu kelompok empat.', 'Hasilnya g = x′.'],
      answer: "x'", acceptedAnswers: ['¬x', 'not x'],
      hint: 'Apa satu-satunya bit yang tidak pernah berubah pada 000, 001, 010, dan 011?',
    },
  },
  {
    stageId: 2,
    sectorName: 'The Tribunal Chamber',
    title: 'Proposisi & Kuantor',
    subtitle: 'Uji janji, argumen, dan kebenaran.',
    loCode: 'LO1', pdfQuestionNumbers: [3, 4], minutes: 18, accent: '#a3a0ff',
    coordinates3D: [0, 0, -22], interactiveWidgetType: 'TRUTH_TABLE_VALIDATOR',
    sourceNote: 'Sumber: PDF halaman 2, soal 3 dan 4; masing-masing 10 poin. Domain kuantor adalah seluruh bilangan bulat, termasuk nol dan bilangan negatif.',
    conceptZero: {
      title: 'Logika sebagai janji yang bisa diuji',
      eli5Explanation: '“Jika p maka q” seperti janji: hanya dilanggar jika p benar tetapi q salah. Ekuivalen berarti dua pernyataan punya hasil sama pada setiap kemungkinan input. Argumen valid berarti tidak ada keadaan ketika semua premis benar tetapi kesimpulannya salah. Untuk kuantor, ∀ berarti semua anggota domain harus lulus, sedangkan ∃ cukup satu contoh. Dua ∃ dalam satu kalimat boleh memakai contoh x yang berbeda.',
      formulas: [String.raw`p\to q\equiv\neg p\lor q`, String.raw`(p\to q)\land(p\to r)\equiv p\to(q\land r)`, String.raw`P(x):1-x\le3x\iff x\ge\tfrac14`, String.raw`x\in\mathbb Z\implies(P(x)\iff x\ge1)`],
      commonTraps: ['Implikasi hanya salah pada True → False. False → False justru benar.', 'Satu baris berbeda cukup untuk membantah ekuivalensi.', 'Valid tidak berarti setiap premis selalu benar: periksa baris ketika semua premis benar.', '∀x P(x) ∨ ∀x ¬P(x) berbeda dari ∀x (P(x) ∨ ¬P(x)).', 'Dua kuantor ∃ yang terpisah tidak harus memakai saksi x yang sama.'],
    },
    pdfQuestions: [
      {
        id: '3a', prompt: 'Periksa dengan tabel kebenaran apakah (p → q) ∧ (p → r) ekuivalen dengan p → (q ∧ r). Jawab “ekuivalen” atau “tidak ekuivalen”.',
        formula: String.raw`(p\to q)\land(p\to r)\stackrel{?}{\equiv}p\to(q\land r)`,
        steps: ['Pakai urutan pqr = 000,001,010,011,100,101,110,111.', 'Kolom p→q: 1,1,1,1,0,0,1,1. Kolom p→r: 1,1,1,1,0,1,0,1.', 'Gabungan AND keduanya: 1,1,1,1,0,0,0,1.', 'Kolom q∧r: 0,0,0,1,0,0,0,1. Kolom p→(q∧r): 1,1,1,1,0,0,0,1.', 'Kedua kolom terakhir identik pada delapan baris. Maka ekuivalen.'],
        answer: 'ekuivalen', acceptedAnswers: ['equivalent', 'ya'], hint: 'Ketika p = 0 kedua sisi selalu benar. Ketika p = 1 kedua sisi menuntut q dan r sama-sama benar.',
      },
      {
        id: '3b', prompt: 'Jika Budi menang renang maka ia membeli sepatu baru. Jika Budi menjual motor maka ia membeli sepatu baru. Kesimpulan: jika Budi menang renang atau menjual motor, ia membeli sepatu baru. Apakah argumen ini valid?',
        formula: String.raw`p\to r,\ q\to r\ \vdash\ (p\lor q)\to r`,
        steps: ['Definisikan p = menang renang, q = menjual motor, r = membeli sepatu.', 'Urutan pqr = 000,001,010,011,100,101,110,111.', 'Premis p→r: 1,1,1,1,0,1,0,1. Premis q→r: 1,1,0,1,1,1,0,1.', 'Kesimpulan (p∨q)→r: 1,1,0,1,0,1,0,1.', 'Baris dengan kedua premis benar adalah 000,001,011,101,111. Pada semuanya kesimpulan benar.', 'Tidak ada contoh penyangkal; argumen valid. Secara kasus: bila p benar, premis pertama memberi r; bila q benar, premis kedua memberi r.'],
        answer: 'valid', acceptedAnswers: ['ya', 'argumen valid'], hint: 'Cari baris dengan kedua premis 1 dan kesimpulan 0. Jika tidak ada, argumennya valid.',
      },
      {
        id: '4a', prompt: 'P(x) berarti 1 − x ≤ 3x, dengan x bilangan bulat. Tentukan nilai kebenaran P(1). Jawab True atau False.',
        formula: String.raw`P(1):1-1\le3(1)`,
        steps: ['Ganti x dengan 1.', '1 − 1 = 0, sedangkan 3 × 1 = 3.', '0 ≤ 3 benar, jadi P(1) True.'], answer: 'True', acceptedAnswers: ['benar', '1', 'T'], hint: 'Tanda ≤ berarti lebih kecil ATAU sama dengan.',
      },
      {
        id: '4b', prompt: 'Pada domain bilangan bulat dan P(x): 1 − x ≤ 3x, tentukan nilai ∃x P(x) ∧ ∃x ¬P(x).',
        formula: String.raw`(\exists x\,P(x))\land(\exists x\,\neg P(x))`,
        steps: ['P(x) benar untuk semua bilangan bulat x ≥ 1 dan salah untuk x ≤ 0.', 'Saksi untuk ∃x P(x): x = 1.', 'Saksi untuk ∃x ¬P(x): x = 0.', 'Kedua pernyataan eksistensial benar, sehingga True AND True = True.'], answer: 'True', acceptedAnswers: ['benar', '1', 'T'], hint: 'Dua simbol ∃ dapat menggunakan dua nilai x yang berbeda. Coba 1 dan 0.',
      },
      {
        id: '4c', prompt: 'Pada domain bilangan bulat dan P(x): 1 − x ≤ 3x, tentukan nilai ∀x P(x) ∨ ∀x ¬P(x).',
        formula: String.raw`(\forall x\,P(x))\lor(\forall x\,\neg P(x))`,
        steps: ['∀x P(x) salah, karena x = 0 menghasilkan 1 ≤ 0 yang salah.', '∀x ¬P(x) juga salah, karena x = 1 membuat P(x) benar.', 'False OR False = False.'], answer: 'False', acceptedAnswers: ['salah', '0', 'F'], hint: 'Ini berarti “semuanya benar ATAU semuanya salah”. Ada bilangan yang benar dan ada yang salah, jadi kedua klaim universal gagal.',
      },
      {
        id: '4d', prompt: 'P(x) berarti 1 − x ≤ 3x. Tentukan nilai P(0).', formula: String.raw`P(0):1-0\le3(0)`,
        steps: ['Masukkan x = 0.', 'Diperoleh 1 ≤ 0.', 'Pernyataan ini salah, jadi P(0) False.'], answer: 'False', acceptedAnswers: ['salah', '0', 'F'], hint: 'Bilangan 1 tidak lebih kecil atau sama dengan 0.',
      },
      {
        id: '4e', prompt: 'Pada domain bilangan bulat dan P(x): 1 − x ≤ 3x, tentukan nilai ∃x P(x).', formula: String.raw`\exists x\in\mathbb Z:\ 1-x\le3x`,
        steps: ['Cukup temukan satu bilangan bulat yang membuat P(x) benar.', 'Ambil x = 1: 0 ≤ 3.', 'Satu saksi cukup; pernyataannya True.'], answer: 'True', acceptedAnswers: ['benar', '1', 'T'], hint: '∃ tidak meminta semua bilangan lulus. Satu contoh, misalnya x = 1, sudah cukup.',
      },
    ],
    variation: {
      id: 'v2', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): Q(x) berarti 5 − x ≤ 2x, dengan x bilangan bulat. Berapa bilangan bulat terkecil yang membuat Q(x) benar?',
      formula: String.raw`5-x\le2x,\quad x\in\mathbb Z`,
      steps: ['Pindahkan −x ke kanan: 5 ≤ 3x.', 'Bagi dengan 3: x ≥ 5/3.', 'Bilangan bulat terkecil yang memenuhi adalah 2.'], answer: '2', hint: 'Hasil 5/3 bukan bilangan bulat; naikkan ke bilangan bulat pertama yang memenuhi.',
    },
  },
  {
    stageId: 3, sectorName: 'The Induction Bridge', title: 'Bukti & Induksi', subtitle: 'Bangun jembatan, satu alasan setiap langkah.',
    loCode: 'LO1', pdfQuestionNumbers: [5], minutes: 20, accent: '#ffba72', coordinates3D: [0, 0, -44], interactiveWidgetType: 'INDUCTION_STEPPER',
    sourceNote: 'Sumber: PDF halaman 2, soal 5 (15 poin). Soal 5c dimulai pada n ≥ 0, sehingga basis n = 0 perlu dicakup. Jawaban essay harus menyertakan alasan, bukan hanya hasil checkpoint.',
    conceptZero: {
      title: 'Bukti berarti menjelaskan kenapa selalu benar',
      eli5Explanation: 'Menguji 3 atau 4 contoh belum membuktikan “untuk semua”. Tulis bilangan genap sebagai 2k dan ganjil sebagai 2k+1, dengan k bilangan bulat. Bukti langsung mengubah syarat menjadi bentuk yang diminta. Kontraposisi membuktikan “jika bukan kesimpulan, maka bukan syarat”. Induksi seperti domino: domino pertama jatuh, dan setiap domino yang jatuh pasti menjatuhkan berikutnya. Keduanya diperlukan agar seluruh deret jatuh.',
      formulas: [String.raw`n\text{ genap}\iff n=2k,\quad n\text{ ganjil}\iff n=2k+1`, String.raw`P\to Q\equiv\neg Q\to\neg P`, String.raw`P(0),\quad P(k)\Rightarrow P(k+1)`, String.raw`6^{k+1}-1=6(6^k-1)+5`],
      commonTraps: ['Kontraposisi ¬Q → ¬P berbeda dari konvers Q → P.', 'Nyatakan k atau m bilangan bulat, agar faktor kelipatan memang sah.', 'Hipotesis induksi adalah asumsi untuk satu k sembarang, bukan kesimpulan untuk seluruh n.', 'Basis n = 1 saja tidak membuktikan kasus n = 0 yang diminta soal.', 'Nol habis dibagi 5 karena 0 = 5 × 0.'],
    },
    pdfQuestions: [
      {
        id: '5a', prompt: 'Buktikan: untuk setiap bilangan bulat n, jika n ganjil maka n² + 3 habis dibagi 4. Ambil n = 2k+1. Checkpoint: isi faktor dalam 4( … ). Gunakan k^2 untuk pangkat.',
        formula: String.raw`(2k+1)^2+3=4\left(\boxed{\phantom{k^2+k+1}}\right)`,
        steps: ['Misalkan n ganjil. Ada k ∈ Z sehingga n = 2k + 1.', 'n² + 3 = (2k + 1)² + 3 = 4k² + 4k + 1 + 3.', 'Gabungkan konstanta: 4k² + 4k + 4 = 4(k² + k + 1).', 'Karena k² + k + 1 bilangan bulat, n² + 3 adalah kelipatan 4. Terbukti.'],
        answer: 'k^2+k+1', acceptedAnswers: ['k²+k+1', 'k*k+k+1'], hint: 'Jangan lupa suku tengah 4k saat mengembangkan (2k + 1)².',
      },
      {
        id: '5b', prompt: 'Buktikan: jika 7n + 4 genap maka n genap. Gunakan kontraposisi n ganjil ⇒ 7n + 4 ganjil. Ambil n = 2k+1. Checkpoint: isi faktor dalam 2( … ) + 1.',
        formula: String.raw`7(2k+1)+4=2\left(\boxed{\phantom{7k+5}}\right)+1`,
        steps: ['Kontraposisi: jika n tidak genap (ganjil), maka 7n + 4 tidak genap (ganjil).', 'Ambil n = 2k + 1 dengan k ∈ Z.', '7n + 4 = 7(2k + 1) + 4 = 14k + 11.', 'Tulis sebagai 2(7k + 5) + 1. Karena 7k + 5 bulat, hasilnya ganjil.', 'Kontraposisi terbukti, sehingga pernyataan semula terbukti.'],
        answer: '7k+5', acceptedAnswers: ['7*k+5', '5+7k'], hint: 'Pisahkan 11 menjadi 10 + 1 agar satu angka 1 tetap berada di luar faktor 2.',
      },
      {
        id: '5c', prompt: 'Buktikan dengan induksi bahwa 6ⁿ − 1 habis dibagi 5 untuk setiap bilangan bulat n ≥ 0. Asumsikan 6ᵏ − 1 = 5m. Checkpoint: isi faktor dalam 6ᵏ⁺¹ − 1 = 5( … ).',
        formula: String.raw`6^{k+1}-1=6(5m+1)-1=5\left(\boxed{\phantom{6m+1}}\right)`,
        steps: ['Basis n = 0: 6⁰ − 1 = 0 = 5 × 0, sehingga benar.', 'Hipotesis: untuk k ≥ 0, andaikan 6ᵏ − 1 = 5m dengan m ∈ Z. Maka 6ᵏ = 5m + 1.', 'Langkah induksi: 6ᵏ⁺¹ − 1 = 6 · 6ᵏ − 1 = 6(5m + 1) − 1.', 'Sederhanakan: 30m + 6 − 1 = 30m + 5 = 5(6m + 1).', '6m + 1 adalah bilangan bulat. Maka benar untuk k + 1; bersama basis, terbukti untuk seluruh n ≥ 0.'],
        answer: '6m+1', acceptedAnswers: ['6*m+1', '1+6m'], hint: 'Setelah substitusi, 6 − 1 menjadi 5. Faktorkan 5 dari 30m + 5.',
      },
    ],
    variation: {
      id: 'v3', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): buktikan 4ⁿ − 1 habis dibagi 3. Jika hipotesisnya 4ᵏ − 1 = 3m, isi faktor dalam 4ᵏ⁺¹ − 1 = 3( … ).',
      formula: String.raw`4^{k+1}-1=4(3m+1)-1=3(\ ?\ )`,
      steps: ['Basis n = 0 memberi 0, kelipatan 3.', 'Hipotesis 4ᵏ = 3m + 1.', '4ᵏ⁺¹ − 1 = 12m + 4 − 1 = 12m + 3 = 3(4m + 1).'], answer: '4m+1', acceptedAnswers: ['4*m+1', '1+4m'], hint: 'Ikuti pola yang sama: ganti 6 dengan 4 dan pembagi 5 dengan 3.',
    },
  },
  {
    stageId: 4, sectorName: 'The Venn Biodome', title: 'Himpunan & Venn', subtitle: 'Hitung sekali. Jangan gandakan irisan.',
    loCode: 'LO2', pdfQuestionNumbers: [6], minutes: 16, accent: '#88e1aa', coordinates3D: [0, 0, -66], interactiveWidgetType: 'VENN_SIMULATOR',
    sourceNote: 'Sumber: PDF halaman 2–3, soal 6 (20 poin). Dalam visual restoran, zona saling lepas adalah pizza saja 15, keduanya 35, spageti saja 40, dan di luar keduanya 160; jumlahnya 250.',
    conceptZero: {
      title: 'Himpunan itu kotak berisi anggota unik',
      eli5Explanation: 'Gabungan mengambil semua anggota dari dua kotak tanpa menghitung nama yang sama dua kali. Irisan mengambil yang ada di keduanya. Selisih A − B menyimpan anggota A yang bukan anggota B. Beda setangkup mengambil anggota yang ada tepat di satu kotak. Himpunan kuasa berisi semua pilihan subset, termasuk pilihan kosong dan seluruh himpunan. Untuk menghitung gabungan dua kelompok, jumlahkan ukurannya lalu kurangi irisan yang tadi terhitung dua kali.',
      formulas: [String.raw`A\triangle B=(A\setminus B)\cup(B\setminus A)`, String.raw`|\mathcal P(X)|=2^{|X|}`, String.raw`|P\cup S|=|P|+|S|-|P\cap S|`, String.raw`|U\setminus(P\cup S)|=|U|-|P\cup S|`],
      commonTraps: ['1 bukan bilangan prima.', 'Anggota yang sama ditulis sekali saja dalam himpunan.', 'A − B berbeda dari B − A.', 'Himpunan kosong ∅ berbeda dari {∅}, himpunan yang memiliki satu anggota.', '50 pemesan pizza sudah termasuk 35 pemesan keduanya; zona pizza saja berisi 15.'],
    },
    pdfQuestions: [
      {
        id: '6a.i', prompt: 'U = {1,…,10}, A = anggota U yang habis dibagi 3, B = bilangan prima di U. Daftarkan A ∪ B dalam urutan naik, dipisah koma.', formula: String.raw`A=\{3,6,9\},\quad B=\{2,3,5,7\},\quad A\cup B=?`,
        steps: ['Kelipatan 3 dalam U: A = {3,6,9}.', 'Bilangan prima dalam U: B = {2,3,5,7}.', 'Gabungkan seluruh anggota tanpa mengulang 3: {2,3,5,6,7,9}.'], answer: '2,3,5,6,7,9', acceptedAnswers: ['{2,3,5,6,7,9}'], hint: 'Gabungan mengambil anggota dari salah satu atau kedua himpunan.',
      },
      {
        id: '6a.ii', prompt: 'Dengan A = {3,6,9} dan B = {2,3,5,7}, daftarkan anggota A ∩ B.', formula: String.raw`A\cap B=?`,
        steps: ['Cari anggota yang muncul pada A dan B.', 'Hanya 3 yang ada pada keduanya.', 'A ∩ B = {3}.'], answer: '3', acceptedAnswers: ['{3}'], hint: '6 dan 9 bukan bilangan prima, jadi tidak termasuk irisan.',
      },
      {
        id: '6a.iii', prompt: 'Dengan A = {3,6,9} dan B = {2,3,5,7}, daftarkan anggota A − B dalam urutan naik.', formula: String.raw`A\setminus B=?`,
        steps: ['Mulai dari seluruh anggota A: 3,6,9.', 'Buang yang juga berada di B, yaitu 3.', 'Tersisa {6,9}.'], answer: '6,9', acceptedAnswers: ['{6,9}'], hint: 'Mulai dari A saja; anggota B di luar A tidak pernah dimasukkan.',
      },
      {
        id: '6a.iv', prompt: 'Dengan A = {3,6,9} dan B = {2,3,5,7}, daftarkan anggota beda setangkup A Δ B dalam urutan naik.', formula: String.raw`A\triangle B=?`,
        steps: ['A − B = {6,9}.', 'B − A = {2,5,7}.', 'Gabungkan keduanya: {2,5,6,7,9}. Anggota irisan, yaitu 3, tidak disertakan.'], answer: '2,5,6,7,9', acceptedAnswers: ['{2,5,6,7,9}'], hint: 'Beda setangkup berarti tepat satu kelompok. Buang anggota irisan dari gabungan.',
      },
      {
        id: '6a.v', prompt: 'Tentukan himpunan kuasa P(A − B), dengan A − B = {6,9}. Masukkan semua subset memakai format {∅,{6},{9},{6,9}}.', formula: String.raw`\mathcal P(\{6,9\})=?`,
        steps: ['Subset tanpa anggota: ∅.', 'Subset beranggota satu: {6} dan {9}.', 'Subset beranggota dua: {6,9}.', 'Jadi P(A − B) = {∅,{6},{9},{6,9}}. Jumlahnya 2² = 4 subset.'],
        answer: '{∅,{6},{9},{6,9}}', acceptedAnswers: ['{{},{6},{9},{6,9}}', '∅,{6},{9},{6,9}', '{empty,{6},{9},{6,9}}'], hint: 'Jangan lupa subset kosong dan himpunan utuh. Anggota himpunan kuasa berupa himpunan, bukan angka saja.',
      },
      {
        id: '6b', prompt: 'Ada 250 tamu restoran. Sebanyak 50 memesan pizza, 75 spageti, dan 35 keduanya. Berapa tamu yang tidak memesan pizza maupun spageti?', formula: String.raw`250-(50+75-35)=?`,
        steps: ['50 + 75 menghitung 35 pemesan keduanya dua kali.', 'Gabungan pemesan pizza atau spageti = 50 + 75 − 35 = 90.', 'Tidak memesan keduanya berarti di luar gabungan: 250 − 90 = 160.', 'Cek zona terpisah: pizza saja 15, keduanya 35, spageti saja 40, di luar 160. Total 250.'], answer: '160', acceptedAnswers: ['160 tamu', '160 orang'], hint: 'Kurangi irisan sekali saat menghitung gabungan, lalu kurangi gabungan dari total tamu.',
      },
    ],
    variation: {
      id: 'v4', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): dari 120 peserta, 45 menyukai teh, 60 kopi, dan 20 keduanya. Berapa peserta yang tidak menyukai teh maupun kopi?',
      formula: String.raw`120-(45+60-20)=?`,
      steps: ['Gabungan = 45 + 60 − 20 = 85.', 'Di luar gabungan = 120 − 85 = 35.'], answer: '35', hint: 'Peserta yang menyukai keduanya terhitung dua kali ketika 45 dan 60 dijumlahkan.',
    },
  },
  {
    stageId: 5, sectorName: 'The Combinatorics War Room', title: 'Kombinasi & Tim', subtitle: 'Pilih anggota. Pecah syarat menjadi kasus.',
    loCode: 'LO2', pdfQuestionNumbers: [7, 10], minutes: 18, accent: '#e8ca78', coordinates3D: [0, 0, -88], interactiveWidgetType: 'COMBINATION_BUILDER',
    sourceNote: 'Sumber: PDF halaman 3–4. Soal 7 dan 10 masing-masing 5 poin. Kata “dipilih secara acak” di soal 7a meminta banyak cara, bukan peluang.',
    conceptZero: {
      title: 'Tim yang sama tetap satu tim',
      eli5Explanation: 'Memilih Andi lalu Budi menghasilkan tim yang sama dengan memilih Budi lalu Andi. Karena urutan tidak penting, gunakan kombinasi C(n,r). Kalau membuat pilihan dari dua kelompok sekaligus, kalikan banyak caranya. Kalau membagi menjadi kasus yang tidak tumpang tindih, jumlahkan. Untuk “setidaknya satu”, sering lebih mudah menghitung semua tim lalu mengurangi tim yang tidak memiliki anggota tersebut. Anggota wajib sudah mengisi satu kursi; anggota dilarang keluar dari kandidat.',
      formulas: [String.raw`\binom nr=\frac{n!}{r!(n-r)!}`, String.raw`N_{\ge1}=N_{\mathrm{total}}-N_0`, String.raw`\binom{10}{5}=252`, String.raw`\binom52\binom{20}2=1900`],
      commonTraps: ['Kombinasi untuk memilih tim tanpa jabatan; jangan gunakan permutasi.', '“Paling banyak 3 wanita” mencakup 0, 1, 2, dan 3 wanita.', 'Aturan kali memerlukan pilihan yang memang dapat dipasangkan; “dan” bukan aturan kali tanpa memeriksa konteks.', 'Andi wajib dan Bonita dilarang berarti tersisa 8 kandidat untuk 4 kursi, bukan 9 untuk 4.', 'Setidaknya satu medali berbeda dari tepat satu medali.'],
    },
    pdfQuestions: [
      {
        id: '7a', prompt: 'Dari 10 karyawan (6 pria, 4 wanita), berapa cara memilih tim 5 orang tanpa syarat tambahan?', formula: String.raw`\binom{10}{5}=?`,
        steps: ['Urutan anggota tim tidak penting, jadi gunakan kombinasi.', 'C(10,5) = (10 × 9 × 8 × 7 × 6)/(5 × 4 × 3 × 2 × 1).', '30240/120 = 252 cara.'], answer: '252', hint: 'Hitung C(10,5), bukan 10 × 9 × 8 × 7 × 6 saja.',
      },
      {
        id: '7b', prompt: 'Dari 6 pria dan 4 wanita dipilih 5 anggota tim. Berapa cara jika paling banyak 3 wanita?', formula: String.raw`\binom{10}{5}-\binom44\binom61=?`,
        steps: ['Semua tim: C(10,5) = 252.', 'Satu-satunya kasus terlarang adalah 4 wanita dan 1 pria.', 'Tim terlarang = C(4,4) × C(6,1) = 6.', 'Tim diizinkan = 252 − 6 = 246.', 'Alternatif per kasus: C(4,0)C(6,5) + C(4,1)C(6,4) + C(4,2)C(6,3) + C(4,3)C(6,2) = 6 + 60 + 120 + 60 = 246.'], answer: '246', hint: '“Paling banyak” mencakup nol. Cara tercepat: buang kasus empat wanita dari seluruh tim.',
      },
      {
        id: '7c', prompt: 'Andi dan Bonita termasuk dalam 10 karyawan. Tim berisi 5 orang; Andi wajib ikut dan Bonita dilarang. Berapa banyak tim yang dapat dibentuk?', formula: String.raw`\binom{10-2}{5-1}=\binom84=?`,
        steps: ['Andi sudah menempati 1 dari 5 kursi.', 'Keluarkan Andi dari kandidat tambahan dan keluarkan Bonita karena dilarang.', 'Tersisa 8 kandidat untuk mengisi 4 kursi.', 'C(8,4) = 70 cara.'], answer: '70', hint: 'Jangan menghitung Andi sebagai kandidat lagi setelah kursinya dipastikan.',
      },
      {
        id: '10a', prompt: 'Klub memiliki 25 anggota: 5 mantan peraih medali dan 20 bukan peraih medali. Berapa cara membentuk tim 4 orang dengan tepat 2 peraih medali? Masukkan angka tanpa pemisah ribuan.', formula: String.raw`\binom52\binom{20}2=?`,
        steps: ['Pilih 2 dari 5 peraih medali: C(5,2) = 10.', 'Dua kursi tersisa wajib berasal dari 20 non-medali: C(20,2) = 190.', 'Pasangkan kedua pilihan: 10 × 190 = 1900.'], answer: '1900', acceptedAnswers: ['1.900'], hint: 'Tepat dua medali berarti dua kursi lainnya harus non-medali, bukan diambil dari 23 orang tersisa.',
      },
      {
        id: '10b', prompt: 'Klub memiliki 25 anggota, termasuk 5 peraih medali. Berapa cara memilih tim 4 orang dengan setidaknya satu peraih medali? Masukkan angka tanpa pemisah ribuan.', formula: String.raw`\binom{25}{4}-\binom{20}{4}=?`,
        steps: ['Hitung seluruh tim 4 orang: C(25,4) = 12650.', 'Tim tanpa medali seluruhnya diambil dari 20 non-medali: C(20,4) = 4845.', 'Setidaknya satu medali = 12650 − 4845 = 7805.'], answer: '7805', acceptedAnswers: ['7.805'], hint: 'Komplemen “setidaknya satu” adalah “tidak ada sama sekali”, bukan “tepat satu”.',
      },
    ],
    variation: {
      id: 'v5', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): dari 12 anggota, 3 adalah mentor. Berapa cara memilih tim 4 orang yang berisi setidaknya satu mentor?', formula: String.raw`\binom{12}{4}-\binom94=?`,
      steps: ['Semua tim = C(12,4) = 495.', 'Tanpa mentor = C(9,4) = 126.', 'Dengan setidaknya satu mentor = 495 − 126 = 369.'], answer: '369', hint: 'Ada 9 anggota non-mentor. Kurangi tim yang semuanya berasal dari 9 orang ini.',
    },
  },
  {
    stageId: 6, sectorName: 'The Neural Fuzzy Lab', title: 'Fungsi & Fuzzy', subtitle: 'Dari pasangan pasti ke derajat keanggotaan.',
    loCode: 'LO2', pdfQuestionNumbers: [8], minutes: 16, accent: '#ed9bc8', coordinates3D: [0, 0, -110], interactiveWidgetType: 'FUZZY_SLIDERS',
    sourceNote: 'Sumber: PDF halaman 3–4, soal 8 (10 poin). Urutan orang pada seluruh vektor fuzzy: Alice, Brian, Fred, Oscar, Rita. Bilangan desimal memakai titik dan dipisahkan koma.',
    conceptZero: {
      title: 'Panah fungsi dan pengukur 0 sampai 1',
      eli5Explanation: 'Fungsi memberi tepat satu hasil untuk setiap input. Injektif berarti dua input berbeda tidak pernah mendapat hasil sama. Surjektif berarti setiap target dalam kodomain mendapat setidaknya satu panah. Bijektif memenuhi keduanya. Fuzzy set tidak hanya berkata masuk atau tidak masuk: setiap orang mendapat angka 0 sampai 1. Komplemen membalik skala dengan 1 − nilai. Gabungan mengambil maksimum; irisan mengambil minimum. Lakukan perhitungan satu orang pada satu waktu.',
      formulas: [String.raw`f(a)=f(b)\Rightarrow a=b\quad\text{(injektif)}`, String.raw`f(A)=B\quad\text{(surjektif)}`, String.raw`\mu_{\bar F}(x)=1-\mu_F(x)`, String.raw`\mu_{F\cup R}(x)=\max(\mu_F(x),\mu_R(x))`, String.raw`\mu_{F\cap R}(x)=\min(\mu_F(x),\mu_R(x))`],
      commonTraps: ['Kodomain B bukan hanya angka yang muncul sebagai hasil. Angka 7 tetap anggota B meskipun tidak dipakai.', 'Satu target dengan beberapa panah cukup untuk menggagalkan injektif.', 'Fuzzy union memakai maksimum, bukan jumlah atau rata-rata.', 'Derajat keanggotaan bukan otomatis peluang.', 'Jangan tertukar antara urutan Alice, Brian, Fred, Oscar, Rita.'],
    },
    pdfQuestions: [
      {
        id: '8a', prompt: 'A = {p,q,r,s,t,u,v,w}, B = {1,2,3,4,5,6,7}. f(p)=4, f(q)=5, f(r)=1, f(s)=2, f(t)=2, f(u)=3, f(v)=6, f(w)=2. Apakah fungsi injektif, surjektif, bijektif? Jawab tiga nilai ya/tidak berurutan, dipisah koma.',
        formula: String.raw`f(A)=\{1,2,3,4,5,6\}\subsetneq B`,
        steps: ['Injektif? Tidak. Input s, t, dan w sama-sama dipetakan ke 2.', 'Surjektif? Tidak. Angka 7 dalam kodomain B tidak menerima panah.', 'Bijektif? Tidak, karena tidak injektif dan tidak surjektif.', 'Jawaban berurutan: tidak,tidak,tidak.'], answer: 'tidak,tidak,tidak', acceptedAnswers: ['false,false,false', '0,0,0', 'tidak injektif,tidak surjektif,tidak bijektif'], hint: 'Perhatikan target 2 yang dipakai berulang dan target 7 yang tidak pernah dipakai.',
      },
      {
        id: '8b.F', prompt: 'F = {0.6 Alice, 0.9 Brian, 0.4 Fred, 0.1 Oscar, 0.5 Rita}. Tentukan komplemen F. Masukkan lima derajat keanggotaan sesuai urutan nama, gunakan titik desimal dan koma pemisah.', formula: String.raw`\mu_{\bar F}=1-\mu_F`,
        steps: ['Alice: 1 − 0.6 = 0.4. Brian: 1 − 0.9 = 0.1.', 'Fred: 1 − 0.4 = 0.6. Oscar: 1 − 0.1 = 0.9.', 'Rita: 1 − 0.5 = 0.5.', 'Komplemen F = {0.4 Alice, 0.1 Brian, 0.6 Fred, 0.9 Oscar, 0.5 Rita}.'], answer: '0.4,0.1,0.6,0.9,0.5', hint: 'Komplemen setiap angka adalah 1 dikurangi angka tersebut.',
      },
      {
        id: '8b.R', prompt: 'R = {0.4 Alice, 0.8 Brian, 0.2 Fred, 0.9 Oscar, 0.7 Rita}. Tentukan komplemen R. Masukkan lima derajat sesuai urutan nama.', formula: String.raw`\mu_{\bar R}=1-\mu_R`,
        steps: ['Alice: 0.6. Brian: 0.2.', 'Fred: 0.8. Oscar: 0.1.', 'Rita: 0.3.', 'Komplemen R = {0.6 Alice, 0.2 Brian, 0.8 Fred, 0.1 Oscar, 0.3 Rita}.'], answer: '0.6,0.2,0.8,0.1,0.3', hint: 'Cek setiap pasangan: nilai asal ditambah komplemennya harus tepat 1.',
      },
      {
        id: '8b.union', prompt: 'Urutan Alice, Brian, Fred, Oscar, Rita. F = (0.6,0.9,0.4,0.1,0.5), R = (0.4,0.8,0.2,0.9,0.7). Tentukan F ∪ R; masukkan lima angka berurutan.', formula: String.raw`\mu_{F\cup R}(x)=\max(\mu_F(x),\mu_R(x))`,
        steps: ['Alice: max(0.6,0.4)=0.6; Brian: max(0.9,0.8)=0.9.', 'Fred: max(0.4,0.2)=0.4; Oscar: max(0.1,0.9)=0.9.', 'Rita: max(0.5,0.7)=0.7.', 'Gabungan = {0.6 Alice, 0.9 Brian, 0.4 Fred, 0.9 Oscar, 0.7 Rita}.'], answer: '0.6,0.9,0.4,0.9,0.7', hint: 'Ambil nilai lebih besar untuk orang yang sama; jangan menjumlahkan kedua nilai.',
      },
      {
        id: '8b.intersection', prompt: 'Urutan Alice, Brian, Fred, Oscar, Rita. F = (0.6,0.9,0.4,0.1,0.5), R = (0.4,0.8,0.2,0.9,0.7). Tentukan F ∩ R; masukkan lima angka berurutan.', formula: String.raw`\mu_{F\cap R}(x)=\min(\mu_F(x),\mu_R(x))`,
        steps: ['Alice: min(0.6,0.4)=0.4; Brian: min(0.9,0.8)=0.8.', 'Fred: min(0.4,0.2)=0.2; Oscar: min(0.1,0.9)=0.1.', 'Rita: min(0.5,0.7)=0.5.', 'Irisan = {0.4 Alice, 0.8 Brian, 0.2 Fred, 0.1 Oscar, 0.5 Rita}.'], answer: '0.4,0.8,0.2,0.1,0.5', hint: 'Irisan menuntut kedua sifat, sehingga gunakan nilai yang lebih kecil.',
      },
    ],
    variation: {
      id: 'v6', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): seseorang memiliki derajat terkenal 0.3 dan kaya 0.8. Berapa derajat pada komplemen F, gabungan F ∪ R, dan irisan F ∩ R? Jawab tiga angka berurutan.',
      formula: String.raw`\mu_F=0.3,\quad\mu_R=0.8`,
      steps: ['Komplemen F = 1 − 0.3 = 0.7.', 'Gabungan = max(0.3,0.8) = 0.8.', 'Irisan = min(0.3,0.8) = 0.3.'], answer: '0.7,0.8,0.3', hint: 'Urutannya: 1 − F, maksimum, lalu minimum.',
    },
  },
  {
    stageId: 7, sectorName: 'The Cryptographic Core', title: 'Euclid & Modulo', subtitle: 'Temukan invers. Pecahkan kode terakhir.',
    loCode: 'LO2', pdfQuestionNumbers: [9], minutes: 20, accent: '#7cbaf1', coordinates3D: [0, 0, -132], interactiveWidgetType: 'EUCLIDEAN_SOLVER',
    sourceNote: 'PDF halaman 4 soal 9b menulis “hasil dalam soal 4.a” dan gcd(97,13), sementara 9c merujuk “4.b”. Rujukan tersebut tidak cocok dengan konteks. Di sini pembahasan memakai hasil 9a–9b; gcd(97,13) juga bernilai 1, sehingga pasangan s = −7, t = 52 tetap memenuhi persamaan yang tercetak.',
    conceptZero: {
      title: 'Modulo adalah sisa, bukan pecahan',
      eli5Explanation: 'FPB adalah pembagi terbesar yang sama-sama membagi dua bilangan. Algoritma Euclidean berulang kali membagi bilangan besar dengan yang kecil dan mengganti pasangan dengan bilangan kecil serta sisanya. Saat sisa nol, pembagi terakhir adalah FPB. Untuk invers modulo, jalankan persamaan sisa ke belakang sampai 1 menjadi kombinasi dua bilangan awal. Kongruensi ax ≡ b (mod m) berarti ax dan b punya sisa sama saat dibagi m. Jika FPB(a,m) membagi b, solusi ada.',
      formulas: [String.raw`a=qm+r,\quad0\le r<m`, String.raw`\gcd(a,m)=\gcd(m,r)`, String.raw`s\cdot141+t\cdot19=1`, String.raw`19^{-1}\equiv52\pmod{141}`, String.raw`ax\equiv b\pmod m\text{ dapat diselesaikan}\iff\gcd(a,m)\mid b`],
      commonTraps: ['FPB adalah sisa terakhir yang bukan nol, bukan sisa nol.', 'Simpan semua persamaan Euclidean untuk substitusi mundur.', 'Untuk urutan s·141 + t·19, invers 19 adalah t, bukan s.', '520 belum wakil terkecil modulo 141; kurangi kelipatan 141.', 'Jangan membagi kongruensi sembarang: invers ada hanya jika FPB koefisien dan modulus adalah 1.'],
    },
    pdfQuestions: [
      {
        id: '9a', prompt: 'Gunakan algoritma Euclidean untuk menghitung FPB dari a = 19 dan m = 141. Masukkan nilai FPB.', formula: String.raw`\gcd(19,141)=?`,
        steps: ['141 = 7 × 19 + 8.', '19 = 2 × 8 + 3.', '8 = 2 × 3 + 2.', '3 = 1 × 2 + 1.', '2 = 2 × 1 + 0. Sisa terakhir bukan nol adalah 1, jadi FPB = 1.'], answer: '1', hint: 'Teruskan pembagian sampai sisanya nol; ambil sisa tepat sebelum nol.',
      },
      {
        id: '9b', prompt: 'Cari bilangan bulat s dan t yang memenuhi persamaan tercetak gcd(97,13) = s·141 + t·19. Karena gcd(97,13)=1, gunakan substitusi mundur dari 9a. Masukkan s,t untuk pasangan hasil algoritma.', formula: String.raw`1=s\cdot141+t\cdot19`,
        steps: ['Mulai dari 1 = 3 − 2.', 'Ganti 2 = 8 − 2·3: 1 = 3·3 − 8.', 'Ganti 3 = 19 − 2·8: 1 = 3·19 − 7·8.', 'Ganti 8 = 141 − 7·19: 1 = 3·19 − 7(141 − 7·19).', 'Gabungkan: 1 = −7·141 + 52·19. Jadi s = −7 dan t = 52.', 'Cek: −987 + 988 = 1. Pasangan lain juga sah: s = −7 + 19k, t = 52 − 141k, untuk k ∈ Z. Checkpoint ini meminta pasangan dari substitusi di atas.'],
        answer: '-7,52', acceptedAnswers: ['s=-7,t=52', 's = -7 dan t = 52'], hint: 'Urutan koefisien penting: s mengalikan 141, t mengalikan 19. Periksa bahwa hasil penjumlahannya 1.',
      },
      {
        id: '9c', prompt: 'Tentukan apakah 19x ≡ 10 (mod 141) punya solusi, lalu nilai positif terkecilnya. Checkpoint: masukkan nilai positif terkecil x.', formula: String.raw`19x\equiv10\pmod{141}`,
        steps: ['FPB(19,141) = 1 membagi 10, jadi solusi ada.', 'Dari −7·141 + 52·19 = 1, invers 19 modulo 141 adalah 52.', 'Kalikan kongruensi dengan 52: x ≡ 520 (mod 141).', '520 = 3·141 + 97, maka x ≡ 97 (mod 141).', 'Seluruh solusi adalah x = 97 + 141k, k ∈ Z. Nilai positif terkecil 97.', 'Cek: 19·97 = 1843 = 13·141 + 10.'], answer: '97', hint: 'Gunakan invers 52, bukan koefisien −7. Setelah 52 × 10, cari sisa pembagian oleh 141.',
      },
    ],
    variation: {
      id: 'v7', kind: 'variation', prompt: 'Latihan variasi (bukan soal PDF): tentukan nilai positif terkecil x yang memenuhi 7x ≡ 3 (mod 26).', formula: String.raw`7x\equiv3\pmod{26}`,
      steps: ['26 = 3·7 + 5; 7 = 1·5 + 2; 5 = 2·2 + 1.', 'Substitusi mundur: 1 = 5 − 2(7 − 5) = 3·5 − 2·7 = 3·26 − 11·7.', 'Invers 7 adalah −11 ≡ 15 (mod 26).', 'x ≡ 15·3 = 45 ≡ 19 (mod 26). Cek: 7·19 = 133 = 5·26 + 3.'], answer: '19', hint: 'Invers 7 modulo 26 adalah 15 karena 7 × 15 = 105 = 4 × 26 + 1.',
    },
  },
];
