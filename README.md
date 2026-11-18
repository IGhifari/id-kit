[![npm](https://img.shields.io/npm/v/@ghifari29/id-kit)](https://www.npmjs.com/package/@ghifari29/id-kit)
[![CI](https://github.com/IGhifari/id-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/IGhifari/id-kit/actions)

# id-kit

Utilitas kecil untuk kebutuhan Indonesia: terbilang, format Rupiah, dan normalisasi nomor telepon.
Tanpa dependency, TypeScript penuh, bisa dipakai offline.

## Instalasi

```bash
npm i @ghifari29/id-kit
```

## Pemakaian

```ts
import { terbilang, rupiah } from "@ghifari29/id-kit/format";
import { normalizePhone, isValidPhone, detectOperator } from "@ghifari29/id-kit/phone";
import { parseNIK, isValidNIK } from "@ghifari29/id-kit/nik";
import { mask, maskNIK, maskPhone, maskAccount } from "@ghifari29/id-kit/mask";
import { parseNPWP, parseNITKU, isValidNPWP, isValidNITKU } from "@ghifari29/id-kit/npwp";
import { getBank, listBank } from "@ghifari29/id-kit/bank";
import { cekLibur, daftarLibur, tahunTersedia } from "@ghifari29/id-kit/libur";
import { formatTanggal, formatWaktu, formatTanggalWaktu, keZonaWaktu, zonaWaktuProvinsi } from "@ghifari29/id-kit/waktu";

terbilang(1250000);
// "satu juta dua ratus lima puluh ribu rupiah"

rupiah(1250000);
// "Rp1.250.000"

normalizePhone("0812-3456-789");
// "+628123456789"

isValidPhone("021-555-1234");
// false

detectOperator("0812-3456-789");
// { valid: true, operator: "Telkomsel", grup: "Telkomsel", prefix: "0812" }

isValidNIK("3171011505900001");
// true

parseNIK("3201025505900002");
// { valid: true, provinsiKode: "32", provinsi: "Jawa Barat", kabKotaKode: "01", kecamatanKode: "02", tanggalLahir: "1990-05-15", gender: "P", urutan: "0002" }

mask("rahasia", { visibleStart: 1, visibleEnd: 1 });
// "r*****a"

maskNIK("3171 0115 0590 0001");
// "3171********0001"

maskPhone("0812-3456-789");
// "+628******789"

maskAccount("123-456-7890");
// "******7890"

parseNPWP("01.234.567.8-901.000");
// { valid: true, jenis: "legacy-15", digit: "012345678901000" }

parseNITKU("0012345678901000000000");
// { valid: true, digit: "0012345678901000000000", npwpInduk: "0012345678901000", jenisInduk: "badan-awalan-0", kodeLokasi: "000000", isPusat: true }

getBank("014");
// { kode: "014", nama: "Bank Central Asia (BCA)" }

cekLibur("2026-08-17");
// { status: "libur-nasional", nama: "Proklamasi Kemerdekaan" }

cekLibur("2099-01-01");
// { status: "data-tidak-tersedia", tahun: 2099 }

formatTanggal("2026-11-18", { denganHari: true });
// "Rabu, 18 November 2026"

formatTanggalWaktu("2026-11-18T13:35:00Z", { zona: "WITA" });
// "18 November 2026, 21:35 WITA"

zonaWaktuProvinsi("64");
// "WITA"
```

## Fitur

- [x] `terbilang`, `rupiah`
- [x] `normalizePhone`, `isValidPhone`
- [x] `parseNIK`, `isValidNIK` (validasi NIK)
- [x] `mask`, `maskNIK`, `maskPhone`, `maskAccount` (masking data pribadi)
- [x] `detectOperator` (deteksi operator seluler asal)
- [x] `parseNPWP`, `isValidNPWP`, `parseNITKU`, `isValidNITKU` (validasi format NPWP & NITKU)
- [x] `getBank`, `listBank` (daftar kode bank 3 digit)
- [x] `cekLibur`, `daftarLibur`, `tahunTersedia` (libur nasional dan cuti bersama)
- [x] `formatTanggal`, `formatWaktu`, `formatTanggalWaktu`, `keZonaWaktu`, `zonaWaktuProvinsi` (format & zona waktu Indonesia)
- [ ] Data wilayah

## Batasan

- `terbilang` hanya mendukung bilangan bulat.
- `normalizePhone` hanya mengecek pola umum nomor seluler, belum memastikan awalan operator.
- `detectOperator` hanya mengidentifikasi **operator asal berdasarkan alokasi awalan**, bukan operator aktif saat ini karena adanya *number portability*, dan `grup` dapat berubah karena merger/akuisisi. Data mengacu pada penomoran Komdigi dan informasi resmi operator (terakhir diverifikasi `2026-11-18`; belum ada satu tabel resmi tunggal yang lengkap). Awalan yang belum terverifikasi (`0834`–`0837`, `0879`, `0893`, `0894`) maupun yang telah dicabut (`0828`, `0868`) sengaja mengembalikan `"awalan-tidak-dikenal"`, sehingga nomor yang valid menurut `isValidPhone` tetap dapat mengembalikan `"awalan-tidak-dikenal"`.
- `parseNIK` dan `isValidNIK` hanya memvalidasi format struktur NIK (bukan bukti keaslian atau keterdaftaran di Dukcapil). Kode kabupaten/kota dan kecamatan tidak divalidasi, dan penentuan abad tahun 2 digit (`YY`) bersifat heuristik terhadap tahun berjalan (UTC).
- Modul `mask` (`mask`, `maskNIK`, `maskPhone`, `maskAccount`) hanya untuk **TAMPILAN** UI, bukan enkripsi atau anonimisasi. Jangan menyimpan data asli di log hanya karena sudah ada fungsi masking. Hanya `mask()` yang menjamin panjang hasil (dalam Unicode code point) sama dengan panjang input.
- `parseNPWP`, `isValidNPWP`, `parseNITKU`, dan `isValidNITKU` hanya memvalidasi format dan panjang (tanpa checksum), bukan bukti terdaftar di DJP. Klasifikasi `"nik"` hanya menunjukkan bentuk cocok dengan NIK, bukan bukti NPWP orang pribadi terdaftar (WNA bukan penduduk tidak memakai NIK); pola `"badan-awalan-0"` (`0 + 15 digit`) hanya berlaku untuk entitas terdaftar sebelum 14 Juli 2022.
- Modul `bank` (`getBank`, `listBank`) diverifikasi pada `2026-11-18` dari sumber sekunder (jaringan switching dan situs bank) karena Bank Indonesia tidak menerbitkan satu tabel terbuka untuk semua kode 3 digit. Daftar bisa usang akibat perubahan nama atau merger—cocokkan dengan sumber resmi bank sebelum dipakai untuk transaksi. Tidak ada validasi panjang nomor rekening, dengan sengaja.
- Modul `libur` (`cekLibur`, `daftarLibur`, `tahunTersedia`) diverifikasi pada `2026-11-18` dari SKB 3 Menteri (Kemenag, Kemnaker, KemenPAN-RB). SKB dapat direvisi di tengah tahun (contoh: pada 2025, satu hari cuti bersama ditambahkan pada Agustus), sehingga data bisa kedaluwarsa dan library membutuhkan rilis baru tiap tahun untuk menambah data tahun berikutnya. Tahun tanpa data menghasilkan `"data-tidak-tersedia"`, bukan `"bukan-libur"`. Ini bukan nasihat hukum mengenai hak cuti atau upah lembur, dan hari libur lokal atau daerah tidak termasuk.
- Modul `waktu` menolak string ISO tanpa zona waktu eksplisit agar tidak bergantung pada zona waktu mesin lokal (`YYYY-MM-DD` hanya diterima pada `formatTanggal`). Konversi memakai offset tetap (`WIB` `+07:00`, `WITA` `+08:00`, `WIT` `+09:00`) tanpa DST. `zonaWaktuProvinsi` menggunakan 38 kode provinsi Kemendagri (`11`–`96`) agar konsisten dengan modul `nik`, bukan kode wilayah kerja statistik BPS yang berbeda di wilayah Papua.

## Berkontribusi

Issue dan pull request sangat diterima. Jalankan `npm test` sebelum mengirim PR.

## Lisensi

MIT