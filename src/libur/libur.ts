import { DATA_LIBUR, type LiburItem } from "./data";

export type CekLiburResult =
  | { status: "libur-nasional"; nama: string }
  | { status: "cuti-bersama"; nama: string }
  | { status: "bukan-libur" }
  | { status: "data-tidak-tersedia"; tahun: number };

const LIBUR_INDEX = new Map<number, ReadonlyMap<string, LiburItem>>(
  Object.entries(DATA_LIBUR).map(([yearKey, items]) => [
    Number(yearKey),
    new Map(items.map((item) => [item.tanggal, item])),
  ])
);

const AVAILABLE_YEARS: readonly number[] = [...LIBUR_INDEX.keys()].sort(
  (a, b) => a - b
);

function parseStrictISODate(tanggal: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    throw new RangeError("Format tanggal harus YYYY-MM-DD yang valid");
  }

  const year = Number(tanggal.slice(0, 4));
  const month = Number(tanggal.slice(5, 7));
  const day = Number(tanggal.slice(8, 10));

  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new RangeError("Format tanggal harus YYYY-MM-DD yang valid");
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("Format tanggal harus YYYY-MM-DD yang valid");
  }

  return year;
}

/**
 * Memeriksa apakah tanggal (`"YYYY-MM-DD"`) merupakan hari libur nasional atau cuti bersama
 * menurut SKB 3 Menteri (Kemenag, Kemnaker, KemenPAN-RB).
 *
 * Catatan penting & batasan:
 * - Data terakhir diverifikasi pada 2026-11-18. SKB dapat direvisi di tengah tahun, dan data
 *   tahun berikutnya memerlukan pembaruan rilis library.
 * - Tahun tanpa data mengembalikan `{ status: "data-tidak-tersedia", tahun }`, BUKAN `"bukan-libur"`.
 * - Libur nasional dan cuti bersama dipisahkan. Cuti bersama tidak selalu mengikat semua sektor
 *   (bukan nasihat hukum mengenai hak cuti atau upah lembur).
 * - Modul ini tidak menentukan akhir pekan dan tidak menghitung hari kerja; tanggal libur yang
 *   jatuh di akhir pekan tetap dikembalikan sebagai libur. Hari libur lokal/daerah tidak termasuk.
 */
export function cekLibur(tanggal: string): CekLiburResult {
  if (typeof tanggal !== "string") {
    throw new TypeError("Tanggal harus berupa string");
  }

  const tahun = parseStrictISODate(tanggal);
  const yearMap = LIBUR_INDEX.get(tahun);

  if (!yearMap) {
    return { status: "data-tidak-tersedia", tahun };
  }

  const found = yearMap.get(tanggal);
  if (!found) {
    return { status: "bukan-libur" };
  }

  return { status: found.jenis, nama: found.nama };
}

/**
 * Mengembalikan daftar libur nasional dan cuti bersama untuk tahun tertentu,
 * atau `null` jika data tahun tersebut belum/tidak tersedia.
 *
 * Sumber data: SKB 3 Menteri (terakhir diverifikasi 2026-11-18). Tidak mencakup hari libur lokal/daerah.
 */
export function daftarLibur(tahun: number): LiburItem[] | null {
  if (typeof tahun !== "number") {
    throw new TypeError("Tahun harus berupa number");
  }

  if (!Number.isInteger(tahun)) {
    throw new RangeError("Tahun harus berupa bilangan bulat");
  }

  if (!Object.prototype.hasOwnProperty.call(DATA_LIBUR, tahun)) {
    return null;
  }

  return DATA_LIBUR[tahun].map((item) => ({ ...item }));
}

/**
 * Mengembalikan daftar tahun yang datanya tersedia pada modul ini (terurut menaik).
 */
export function tahunTersedia(): number[] {
  return [...AVAILABLE_YEARS];
}
