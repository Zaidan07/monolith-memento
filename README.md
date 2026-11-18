# Stella Sora Pick

## Tahap 1 dan 2 · Supabase dan roster Trekker

Pakai Node.js 22 atau lebih baru. Jalankan perintah dari folder ini. Skrip memakai
API Stella Sora dan melakukan upsert berdasarkan `slug`. UUID karakter yang sudah
ada tetap sama dan baris di luar roster API tetap tersimpan. `image_url` memakai
URL ikon dari API dengan portrait sebagai cadangan.

### Cek data dari API

```sh
node scripts/sync-trekkers.mjs --dry-run
```

### Sinkronkan lewat Supabase SQL Editor

```sh
node scripts/sync-trekkers.mjs --sql
```

Snapshot hasil sync juga tersedia di `trekkers.sql`.
Salin SQL dari terminal, tempel di Supabase Dashboard → SQL Editor, lalu klik Run.

### Sinkronkan langsung dari terminal

Salin `.env.example` menjadi `.env.local` dan isi `SUPABASE_SECRET_KEY` dari
Supabase Dashboard → API Keys. Simpan secret key di mesin lokal. Publishable key
digunakan untuk akses publik sesuai policy tabel.

```sh
node --env-file=.env.local scripts/sync-trekkers.mjs --apply
```

## Tahap 3 · Home

Salin `.env.example` ke `.env.local` lalu isi URL dan publishable key Supabase.
Home hanya membutuhkan akses baca, jadi `SUPABASE_SECRET_KEY` boleh kosong.
Jika entri roster belum bisa dibaca, Home tetap tampil tanpa hitungan.

```sh
npm ci
npm run dev
```

Buka http://localhost:3000. Untuk cek build produksi, jalankan `npm run build`.
Untuk Vercel, gunakan preset Next.js dan tambahkan kedua variabel `NEXT_PUBLIC_`
yang sama. Halaman tool dan leaderboard masih menampilkan status pengembangan.

## Tahap 4 · Favorite Trekkers

Buka `/favorite-trekkers`. Tap kartu untuk mengisi slot elemennya, atau drag
kartu ke slot yang cocok. Klik slot untuk memfilter roster dan gunakan tombol ×
untuk menghapus pilihan. Draft tersimpan di browser.

- **Save votes** menyimpan vote ke Supabase. Setiap kombinasi sesi dan Trekker
  hanya dihitung sekali di kategori `favorite-element`. Mengubah draft tidak
  menarik kembali vote yang sudah disimpan.
- **Create share link** menyimpan snapshot pilihan di `shares`. Link dapat dibuka
  dari browser lain tanpa login. Untuk tautan publik, jalankan app di domain publik.
- **Download PNG** mengunduh board dengan kredit. Jika ikon gagal dimuat, PNG
  tetap bisa dibuat dengan inisial karakter.

Fitur ini memakai tabel dan policy `trekkers`, `votes`, dan `shares` dari MD.
Konfigurasi gambar menerima URL StellaSoraAPI atau bucket publik `trekkers`
pada proyek Supabase ini.

## Tahap 5 · Trekker Bingo

Buka `/bingo`. Pilih satu kotak dan tap kartu, atau drag kartu dari roster
ke kotak tujuan. Memindahkan kartu yang sudah ada menukar isi kedua kotak.
Kotak tengah selalu FREE. Draft tersimpan di browser.

Papan lengkap bisa disimpan ke `bingo_boards` dan mencatat vote kategori
`bingo`. Skema MD yang tersedia mengizinkan insert, sehingga susunan berbeda
tersimpan sebagai snapshot baru. Mengirim ulang susunan yang sama dalam satu
sesi memakai ID yang sama. Share link membuat snapshot di `shares`.
Ekspor PNG juga tersedia untuk papan yang baru terisi sebagian.

## Tahap 6 · Top 9 Trekkers

Buka `/top-nine`. Tap atau drag kartu dari roster untuk menambahkan Trekker.
Susun ulang lewat drag atau tombol panah. Draft tersimpan di browser.
Setelah sembilan slot terisi, **Save ranking** memperbarui ranking sesi
di `rankings` dan mencatat vote kategori `top9` tanpa duplikasi.
**Create share link** membuat snapshot urutan di `shares`.
**Download PNG** juga tersedia saat ranking baru terisi sebagian.

## Tahap 7 · First Impression vs Now

Buka `/first-impression`, pilih satu Trekker dan isi kedua kesannya, maksimal
240 karakter per kolom. Draft tersimpan terpisah untuk setiap Trekker di browser.

Jalankan `impressions.sql` sekali di Supabase SQL Editor agar **Save impressions**
bisa memperbarui rekaman pada sesi dan Trekker yang sama. Policy menggunakan hash
dari UUID privat yang disimpan browser khusus untuk fitur ini. **Create share link**
menyimpan snapshot publik dan **Download PNG** mengekspor kedua kesan beserta kredit.

## Tahap 8 · Novaria Profile

Buka `/profile` untuk mengisi sembilan jawaban dan melihat pratinjau kartu.
Display name wajib diisi untuk menyimpan, membagikan, atau mengekspor profil.
Draft tersimpan di browser.

Jalankan `profiles.sql` sekali di Supabase SQL Editor untuk mengizinkan
pembaruan profil dari sesi browser yang sama. **Save profile** melakukan upsert
ke `profiles`. **Create share link** membuat snapshot di `shares` dan
**Download PNG** mengunduh kartu dengan kredit.

## Tahap 9 · Leaderboard

Jalankan `leaderboard.sql` sekali di Supabase SQL Editor, lalu buka
`/leaderboard`. Database menghitung vote per Trekker. Overall menjumlahkan
Favorite Trekkers, Bingo, dan Top 9. Filter kategori dan elemen bisa digabung.
Jumlah vote yang sama mendapat peringkat yang sama.

### In-game profile catalogs and artwork

Run `profiles-catalog.sql` in the Supabase SQL Editor to install the 60 normal
titles. The app includes the same catalog locally and can open before the migration.

To sync the Honor artwork, set the existing `SUPABASE_SECRET_KEY` in `.env.local`
and run:

```sh
node --env-file=.env.local scripts/sync-profile-assets.mjs --apply
```

The script writes the normal titles and uploads each available Honor banner and
icon to the public `badges` bucket. Asset names are `<id>-banner.png` and
`<id>-icon.png`. The profile expects public SVG files in `elements` named
`ignis.svg`, `aqua.svg`, `terra.svg`, `ventus.svg`, `lux.svg`, and `umbra.svg`.
Until those files are available, it uses the existing web element symbols.

### Favorite Trekkers element icons

Run the element sync from the project folder with the Supabase secret key in
`.env.local`. The command creates or updates the public `elements` bucket and
uploads the six wiki SVGs under their lowercase names.

```sh
node --env-file=.env.local scripts/sync-elements.mjs --apply
```

### Moment with YOU.

Run `moments.sql` once in Supabase SQL Editor to enable Save moment and shared
links. To populate the public `moments` bucket with the 41 original wiki PNGs,
run this from the project folder with `SUPABASE_SECRET_KEY` in `.env.local`.

```sh
node --env-file=.env.local scripts/sync-moments.mjs --apply
```

The roster is in `data/moments.json`. The script verifies the exact English
Memory Snapshot filenames and uploads them as `<trekker-slug>.png`.
`--dry-run` checks the wiki files without writing to the bucket.

### Preview kartu Home

Untuk mengunggah enam PNG Disc dan CG dari Stella Sora Wiki ke bucket publik
`discs`, jalankan perintah berikut dari folder proyek dengan secret key di
`.env.local`.

```sh
node --env-file=.env.local scripts/sync-discs.mjs --apply
```

URL sumber dan nama file tersimpan di `data/disc-previews.json`.
