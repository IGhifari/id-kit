# Panduan Berkontribusi

Terima kasih atas minatmu membantu pengembangan `@ghifari29/id-kit`.

## Prinsip Proyek

- **Zero runtime dependency**: jangan menambah `dependencies` baru.
- **TypeScript 5.x**: jangan upgrade ke TypeScript 6 sebelum dukungan `.d.ts` di `tsup` teruji penuh.
- **Bahasa Indonesia**: komentar kode, JSDoc, dan dokumentasi ditulis dalam bahasa Indonesia.
- **Privasi data**: jangan pernah memasukkan NIK, NPWP, nomor telepon, atau nomor rekening orang sungguhan di test, issue, atau PR. Selalu gunakan data fiktif, dan jangan mencatat (log) data pribadi maupun menampilkannya di pesan error.

## Pengembangan Lokal

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:exports
```

Semua perintah di atas wajib lulus sebelum mengirim Pull Request. Untuk modul yang menyentuh tanggal atau waktu, pastikan test tetap lulus di berbagai timezone (misalnya `TZ=UTC` dan `TZ=America/New_York`).

## Menambah Modul Baru

Setiap modul baru harus terdaftar di tempat berikut:
1. Folder `src/<modul>/` berisi `index.ts`, implementasi, dan `*.test.ts`.
2. Entry baru di `tsup.config.ts`.
3. Subpath `"./<modul>"` (`types`, `import`, `require`) di `exports` pada `package.json`.
4. Re-export di `src/index.ts`.
5. Daftar ekspor yang diharapkan di `scripts/check-exports.mjs`.
6. Contoh pemakaian, tabel subpath, dan batasan di `README.md`.

## Pemeliharaan Data Berkala

Beberapa modul bergantung pada data publik yang dapat berubah seiring waktu:
- **`libur`**: perbarui tiap tahun setelah SKB 3 Menteri tahun berikutnya terbit, atau jika terjadi revisi di tengah tahun.
- **`bank`**: pantau merger dan rebrand bank; verifikasi minimal di dua sumber berbeda dan situs resmi bank terkait.
- **`phone` (`detectOperator`)**: pantau perubahan alokasi awalan atau pencabutan penomoran dari Komdigi dan operator.
- **`wilayah`**: pantau pemutakhiran data provinsi dan kabupaten/kota dari Kemendagri (pastikan 38 kode provinsi tetap sinkron lintas `nik`, `waktu`, dan `wilayah`).

Setiap pembaruan data wajib mencantumkan sumber resmi yang dicek dan memperbarui tanggal verifikasi di JSDoc serta `README.md`.
