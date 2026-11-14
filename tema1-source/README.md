# Bluehour Birthday Story

Template ulang tahun frontend-only dengan enam adegan anime slice-of-life, latar biru, dan layout yang responsif. Halaman yang sudah dibangun tersedia di `/tema1/`, sehingga situs utama di root domain tetap terpisah.

## Personalisasi

Ubah placeholder `[Nama Pacarmu]`, `[Namamu]`, dan `[Usia]` serta teks cerita di `src/data/story.js`. Ganti enam ilustrasi WebP di `src/assets/story/` untuk membuat versi cerita lain. Objek kue transparan PNG di `src/assets/objects/` menjadi interaksi utama: sentuh kue untuk memadamkan lilin dan membuka surat.

## Menjalankan dan membangun

Gunakan Node.js 22 atau 24.

```sh
npm ci
npm run dev
```

Buka `/tema1/` pada alamat server lokal. Untuk menghasilkan situs production:

```sh
npm run build
```

Vite menulis hasil build ke direktori `../tema1/`. Konfigurasi deployment cPanel di root repo menyalin hasil ini ke `public_html/tema1/` sambil mempertahankan halaman utama di root domain.
