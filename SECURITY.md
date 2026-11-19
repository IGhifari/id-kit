# Kebijakan Keamanan

## Versi yang Didukung

| Versi | Didukung |
| --- | --- |
| `1.x` | Ya |
| `< 1.0.0` | Tidak |

## Melaporkan Celah Keamanan

Jangan melaporkan kerentanan keamanan melalui public issue.

Laporkan secara privat melalui GitHub Security Advisories:
https://github.com/IGhifari/id-kit/security/advisories/new

Sertakan langkah reproduksi, versi `@ghifari29/id-kit`, dan dampak yang teramati. **Jangan menyertakan data pribadi sungguhan** (NIK, NPWP, nomor HP, atau nomor rekening asli) dalam laporan.

## Catatan Ruang Lingkup Keamanan

- Modul `mask` (`mask`, `maskNIK`, `maskPhone`, `maskAccount`) dibuat **hanya untuk tampilan UI**, bukan enkripsi atau anonimisasi.
- Modul `nik`, `npwp`, `phone`, `bank`, `libur`, dan `wilayah` bersifat offline dan hanya memvalidasi format atau lookup data statis, bukan verifikasi keaslian ke instansi resmi.
