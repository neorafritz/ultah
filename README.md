# Happy Birthday, Fadilla

Website ucapan ulang tahun ke-23 untuk Fadilla Fitri Azzahra. Dibuat dengan React dan Vite, seluruhnya berjalan di frontend. Enam adegan satu layar penuh membentuk cerita ulang tahun; bab “Bunga untukmu” membuka perangkai buket 2D yang bisa disentuh dan disusun sendiri.

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

Hasil build berada di `dist/` dan menggunakan base path relatif agar bisa dipasang pada root domain atau subdirektori.

Source tema utama berada di `src/`. Untuk memperbarui hasil situs root, salin `dist/index.html` ke `index.html` dan isi `dist/assets/` ke `assets/`. Jangan membangun `/tema1/` dari source ini; template tersebut memiliki project terpisah di `tema1-source/`.

`.cpanel.yml` menyalin `index.html`, `assets/`, dan build `/tema1/` ke hosting. Setelah hasil build root diperbarui, Git Version Control → Update from Remote → Deploy HEAD Commit. Target: `/home/kaizorat/ultah.kaizoratech.com/`.

## Personalisasi

- Ubah nama, ucapan, dan pesan ulang tahun di `src/main.jsx`.
- Ubah warna dan tata letak di `src/style.css`.
- Enam ilustrasi anime halus dalam format WebP: `src/assets/story/`. Tiap adegan memakai ilustrasi yang berbeda; adegan malam dan ending menampilkan kamar mereka di dua rumah yang terpisah.
- Perangkai buket berada di `src/components/InteractiveBouquet.jsx` dan `src/components/InteractiveBouquet.css`. Setiap bunga adalah elemen SVG mandiri dengan batang Bézier yang tetap tertambat saat bunga dipindah.
- Bunga dapat dipindah, diputar, diubah warna dan urutan lapisannya, ditambah, atau dihapus. Kertas dan pita punya pilihan warna serta gaya. Undo, redo, reset, simpan lokal, dan impor/ekspor JSON tersedia.
- Adegan ulang tahun interaktif: merangkai buket dan meniup lilin membuka ucapan romantis.
- Animasi menghormati preferensi reduced motion.
- Font dibundel lokal. Musik lembut dihasilkan oleh Web Audio setelah tombol musik ditekan; tidak membutuhkan file audio atau layanan eksternal.
- Tidak memerlukan API key, database, atau variabel lingkungan.
