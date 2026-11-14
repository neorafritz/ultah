# Untuk Fadilla — Twenty Three & Blooming

Website ucapan ulang tahun ke-23 untuk Fadilla Fitri Azzahra. Dibuat dengan React dan Vite, seluruhnya berjalan di frontend. Empat adegan satu layar penuh dengan navigasi scroll, swipe, keyboard, tombol panah, dan indikator. Tidak ada scroll halaman vertikal.

## Menjalankan

Gunakan Node.js 22 atau 24.

```sh
npm ci
npm run dev
```

## Build produksi

```sh
npm run build
npm run preview
```

Hasil build berada di `dist/`, menggunakan base path relatif agar bisa dipasang pada root domain atau subdirektori. Branch `main` memuat hasil build dan `.cpanel.yml` saja. Kode sumber dikembangkan pada branch lokal `work`.

Deploy cPanel: salin `.cpanel.yml` ke root hasil build. Git Version Control → Update from Remote → Deploy HEAD Commit. Target: `/home/kaizorat/ultah.kaizoratech.com/`.

## Personalisasi

- Ubah nama, ucapan, surat, doa, dan alasan sayang di `src/main.jsx`.
- Ubah warna dan tata letak di `src/style.css`.
- Foto editorial pink lokal: `src/assets/birthday-editorial.png`.
- Isi surat dibagi menjadi tiga halaman; kartu doa memakai tab.
- Animasi menghormati preferensi reduced motion.
- Font dibundel lokal. Musik lembut dihasilkan oleh Web Audio setelah tombol musik ditekan; tidak membutuhkan file audio atau layanan eksternal.
- Tidak memerlukan API key, database, atau variabel lingkungan.
