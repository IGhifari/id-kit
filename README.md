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
import { normalizePhone, isValidPhone } from "@ghifari29/id-kit/phone";

terbilang(1250000);
// "satu juta dua ratus lima puluh ribu rupiah"

rupiah(1250000);
// "Rp1.250.000"

normalizePhone("0812-3456-789");
// "+628123456789"

isValidPhone("021-555-1234");
// false
```

## Fitur

- [x] `terbilang`, `rupiah`
- [x] `normalizePhone`, `isValidPhone`
- [ ] Deteksi operator seluler
- [ ] Validasi NIK
- [ ] Validasi NPWP dan nomor rekening
- [ ] Libur nasional dan cuti bersama
- [ ] Data wilayah

## Batasan

- `terbilang` hanya mendukung bilangan bulat.
- `normalizePhone` hanya mengecek pola umum nomor seluler, belum memastikan awalan operator.

## Berkontribusi

Issue dan pull request sangat diterima. Jalankan `npm test` sebelum mengirim PR.

## Lisensi

MIT