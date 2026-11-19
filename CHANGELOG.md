# Changelog

Seluruh perubahan penting pada `@ghifari29/id-kit` dicatat di dokumen ini.

## [Unreleased] - Target 1.0.0

### Breaking Changes
- `rupiah`: angka negatif kini diformat menjadi `"-Rp5.000"` (sebelumnya `"Rp-5.000"`), `-0` menjadi `"Rp0"`, input non-number melempar `TypeError`, dan `NaN`/`Infinity` melempar `RangeError`.
- `terbilang`: input non-number kini melempar `TypeError` (sebelumnya `RangeError`), dan mendukung skala `"kuadriliun"` (`1e15`) hingga batas `Number.MAX_SAFE_INTEGER`.
- `normalizePhone` & `isValidPhone`: menolak karakter huruf/simbol tak dikenal (hanya mengizinkan angka, `+`, spasi, `-`, `()`, dan `.`) serta melempar `TypeError` untuk input non-string.
- `parseNIK` & `isValidNIK`: melempar `TypeError` dengan pesan tetap untuk input non-string.

### Ditambahkan
- Test konsistensi lintas modul (`src/consistency.test.ts`) yang memastikan 38 kode dan nama provinsi identik di `nik`, `waktu`, dan `wilayah`.
- Smoke test packaging (`npm run test:exports`) untuk verifikasi ESM, CJS, dan `.d.ts` pada seluruh 10 subpath di CI dan `prepublishOnly`.
- Pembaruan dokumentasi `README.md`, metadata `package.json`, dan `CHANGELOG.md`.

## [0.8.0]
- Tambah modul `wilayah`: `getProvinsi`, `listProvinsi`, `getKabKota`, `listKabKota`, `cariWilayah` (38 provinsi dan 514 kabupaten/kota berdasarkan kode wilayah Kemendagri).

## [0.7.0]
- Tambah modul `waktu`: `formatTanggal`, `formatWaktu`, `formatTanggalWaktu`, `keZonaWaktu`, `zonaWaktuProvinsi` berbasis aritmetika UTC murni (`WIB`/`WITA`/`WIT`).

## [0.6.0]
- Tambah modul `libur`: `cekLibur`, `daftarLibur`, `tahunTersedia` (data SKB 3 Menteri tahun 2025, 2026, dan 2027).

## [0.5.0]
- Tambah modul `npwp`: `parseNPWP`, `isValidNPWP`, `parseNITKU`, `isValidNITKU`.
- Tambah modul `bank`: `getBank`, `listBank` (31 kode bank 3 digit).

## [0.4.0]
- Tambah `detectOperator` pada modul `phone` (40 awalan terverifikasi, hasil operator asal dan grup induk).

## [0.3.0]
- Tambah modul `mask`: `mask`, `maskNIK`, `maskPhone`, `maskAccount`.

## [0.2.0]
- Tambah modul `nik`: `parseNIK`, `isValidNIK` (38 provinsi Kemendagri).

## [0.1.0] - [0.1.1]
- Rilis awal modul `format` (`terbilang`, `rupiah`) dan `phone` (`normalizePhone`, `isValidPhone`).
