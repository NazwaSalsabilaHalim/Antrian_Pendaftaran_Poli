# Antrian Pendaftaran — Frontend React

Frontend baru (React + Vite) untuk sistem antrian pendaftaran, menggantikan tampilan
PHP/jQuery lama. Backend/data tetap memakai database & server PHP yang sama.

## 1. Pasang folder API baru di server PHP lama

Salin folder `react-api/` (satu paket dengan project ini, di luar folder `antrian-react/`)
ke **root project PHP lama**, sejajar dengan `index_btn.php`, `counter_lib.php`, dll.

```
antrian_pendaftaran/          <- root project PHP lama
├── index_btn.php
├── counter_lib.php
├── connectdb.php
├── ...
└── react-api/                <- taruh di sini
    ├── config.php
    ├── tombol.php
    ├── counter.php
    ├── ambil_nomor.php
    ├── tekan_counter.php
    ├── panggil_ulang.php
    ├── display_queue.php
    ├── panggil_konfirmasi.php
    └── statistik.php
```

Buka `react-api/config.php` dan sesuaikan 4 nilai kredensial database
(`$DB_HOST`, `$DB_USER`, `$DB_PASS`, `$DB_NAME`) dengan yang ada di `connectdb.php`.

**Kenapa dibuat API baru, bukan pakai file PHP lama langsung?**
Wrapper database lama (`db.mysql.php`) memakai fungsi `mysql_*()` yang sudah
dihapus total sejak PHP 7. Supaya React ini pasti bisa jalan berapa pun versi
PHP di server, endpoint baru di `react-api/` pakai koneksi `mysqli` sendiri dan
prepared statement (sekalian menutup celah SQL injection yang ada di beberapa
query lama).

Struk cetak tetap memakai `index_btn.php?exe=cetak_struk` yang asli (dibuka
lewat `window.open`, sama seperti aplikasi lama) karena isinya murni logika
format printer thermal, tidak menyentuh database.

## 2. Jalankan React

```bash
cd antrian-react
npm install
cp .env.example .env
# edit .env, isi VITE_API_BASE dengan alamat root project PHP di atas
npm run dev
```

Buka `http://localhost:5173`.

## 3. Halaman yang tersedia

| Route | Fungsi | Setara file lama |
|---|---|---|
| `/ambil-nomor` | Mesin ambil nomor (pasien) | `index.php` + `index_btn.php` |
| `/loket` | Panggil nomor oleh petugas | `counter.php` + `counter_lib.php` |
| `/display` | Layar TV + suara panggilan | `display/index.php` |
| `/dashboard` | **Baru** — statistik antrian real-time per jenis pasien & per loket, auto-refresh tiap 15 detik, bisa lihat histori tanggal lain | — |

## 4. Build untuk produksi

```bash
npm run build
```

Hasil build ada di folder `dist/`, tinggal upload ke hosting statis atau
diletakkan sebagai subfolder di server PHP yang sama.

## Catatan / batasan

- Suara panggilan di layar TV memakai file mp3 yang sudah ada di
  `display/sounds_jelek/`, jadi folder itu harus tetap ada & bisa diakses
  publik dari server PHP.
- Browser modern mewajibkan interaksi pengguna sebelum audio bisa diputar
  otomatis — makanya ada tombol "Aktifkan Audio" sekali di awal, sama seperti
  perilaku aplikasi lama.
- CORS diizinkan dari semua origin (`*`) di `react-api/config.php` supaya mudah
  saat development. Kalau sudah production, sebaiknya ganti ke domain React
  yang sebenarnya saja.
