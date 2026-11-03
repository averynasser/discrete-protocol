# DISCRETE PROTOCOL — LC75

Aplikasi belajar Matematika Diskrit berbahasa Indonesia, dengan tujuh sektor 3D dan mode pengulangan 2D. Materi diverifikasi dari **Tugas Besar 1 Discrete - LC75.pdf**, halaman 1–4.

## Menjalankan hasil clone GitHub

Gunakan Node.js 20.9 atau lebih baru. Dari folder proyek, jalankan:

```powershell
npm ci
npm run build
node scripts/serve.mjs --open
```

Browser akan membuka aplikasi pada `http://127.0.0.1:4173` (atau port berikutnya jika sudah dipakai). Instalasi awal memerlukan internet; setelah build selesai, aplikasi lokal bisa dipakai tanpa internet. Folder `out/` tidak disertakan dalam Git dan dibuat oleh `npm run build`.

Untuk pengembangan dengan pembaruan otomatis, gunakan `npm run dev` setelah `npm ci`.

## Buka hasil build yang sudah tersedia

Jika folder `out/` sudah tersedia, di Windows klik dua kali **BUKA-BELAJAR.cmd** dalam folder ini. Browser terbuka otomatis. Biarkan jendela server tetap terbuka selama belajar. Node.js 20.9 atau lebih baru diperlukan.

Alternatif terminal:

```powershell
node scripts/serve.mjs --open
```

Versi hasil build berada di `out/`. Server lokal menggunakan port 4173, atau port berikutnya jika sudah terpakai. Tidak perlu instalasi dependensi atau internet untuk menjalankan hasil build lokal. Jangan membuka `out/index.html` langsung melalui `file://` karena aset memakai jalur absolut.

## Cara belajar

1. Klik **Mulai belajar**. Baca konsep dari nol dan coba widget interaktif.
2. Klik **Saya paham, bedah soalnya**. Buka setiap langkah seluruh soal asli.
3. Selesaikan **Gatekeeper**: checkpoint semua soal asli dan satu variasi baru. Jawaban salah mendapat petunjuk; tidak ada pengurangan skor.
4. Gerbang berikutnya terbuka setelah semua jawaban dalam sektor tervalidasi. Progres disimpan di browser/perangkat yang sama.
5. **Cram Mode 2D** membuka seluruh 10 soal beserta pembahasan, mematikan 3D, dan menyediakan timer 15 menit. Klik setiap soal untuk membuka jawabannya. Mode ini tidak mengubah progres.

Kontrol dunia: **WASD** bergerak, **Shift** berlari, **Space** melompat, **V** mengganti FPP/TPP, **E** membuka terminal di dekat pemain. Klik kanvas setelah memilih Jelajahi ruangan untuk mengunci mouse. Jika browser membatasi penguncian mouse, tahan klik dan seret untuk mengarahkan kamera. **Esc** melepaskan mouse/menutup panel. **Tab** membuka catatan rumus. Semua materi juga dapat dibuka melalui tombol antarmuka tanpa berjalan di dunia 3D.

## Cakupan dan koreksi sumber

- 7 stage, **35 checkpoint soal asli + 7 variasi**, beserta pembahasan seluruh subsoal 1–10.
- Soal 2: PDF memiliki **delapan input berbeda**, bukan baris duplikat seperti klaim PRD. Output 1 pada **000, 001, 100, 110**; bentuk minimum **x′y′ + xz′**.
- Venn restoran: **15 hanya Pizza, 35 keduanya, 40 hanya Spageti, 160 di luar keduanya**.
- Soal 9b memang menulis gcd(97,13) dan rujukan soal 4.a/4.b yang tidak cocok konteks. Catatan sumber menjelaskan hal ini. Hasil **s = −7, t = 52**, solusi positif terkecil **x = 97** tetap benar.
- Prompt disesuaikan menjadi latihan belajar. Kunci berasal dari penyelesaian matematis terhadap soal, bukan kunci resmi dosen. Variasi selalu diberi label **bukan soal PDF**.
- Pembuktian essay dijelaskan lengkap; penilaian otomatis menguji checkpoint aljabar, bukan menilai bebas seluruh tulisan pembuktian. Berlatih menuliskan alasan lengkap sebelum ujian.
- Sensei menggunakan petunjuk terkurasi secara lokal. Tidak membutuhkan API AI. Persentase readiness adalah penyelesaian latihan, bukan prediksi nilai ujian.
- Daftar mahasiswa pada halaman akhir PDF tidak disertakan atau dipublikasikan.

## Pengembangan

Stack: Next.js App Router, TypeScript, React, Tailwind CSS, Three.js, React Three Fiber, Drei, Zustand persist, KaTeX. Hasil build berupa web statis tanpa backend.

```powershell
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Data pembelajaran: `src/data/lc75-curriculum.ts`. Widget: `src/components/Widgets.tsx`. Dunia 3D: `src/components/World.tsx`.

Model 3D dan karakter menggunakan geometri prosedural. Fuzzy slider dan pemilihan tim divisualisasikan di widget 2D; dunia 3D menampilkan contoh sumber. Tidak ada aset atau font eksternal yang harus diunduh saat belajar.
