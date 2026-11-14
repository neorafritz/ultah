# Untuk Fadilla — Twenty Three & Blooming

Website ucapan ulang tahun ke-23 untuk Fadilla Fitri Azzahra. Dibuat dengan React dan Vite, seluruhnya berjalan di frontend.

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

Hasil build berada di `dist/`, siap dipasang di hosting statis seperti Netlify, Vercel, atau GitHub Pages (sesuaikan base path Vite bila memakai subdirektori).

## Personalisasi

- Ubah nama, ucapan, surat, doa, dan alasan sayang di `src/main.jsx`.
- Ubah warna dan tata letak di `src/style.css`.
- Ilustrasi bunga lokal: `public/botanical.svg`.
- Font dibundel lokal. Musik lembut dihasilkan oleh Web Audio setelah tombol musik ditekan; tidak membutuhkan file audio atau layanan eksternal.
- Tidak memerlukan API key, database, atau variabel lingkungan.
