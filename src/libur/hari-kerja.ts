import { cekLibur, daftarLibur, parseISODateParts } from "./libur";

export interface HariKerjaOptions {
  /** Apakah hari Sabtu dihitung sebagai hari kerja (pola 6 hari kerja). Default: `false`. */
  sabtuKerja?: boolean;
  /** Apakah cuti bersama SKB 3 Menteri dianggap bukan hari kerja. Default: `true`. */
  sertakanCutiBersama?: boolean;
}

export type HitungHariKerjaResult =
  | {
      valid: true;
      hariKerja: number;
      totalHari: number;
    }
  | {
      valid: false;
      alasan: "data-tidak-tersedia";
      tahun: number;
    };

export type TambahHariKerjaResult =
  | {
      valid: true;
      tanggal: string;
    }
  | {
      valid: false;
      alasan: "data-tidak-tersedia";
      tahun: number;
    };

const DAY_MS = 86_400_000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatUTCDate(utcMs: number): string {
  const dt = new Date(utcMs);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function parseOptions(options: HariKerjaOptions | undefined): {
  sabtuKerja: boolean;
  sertakanCutiBersama: boolean;
} {
  if (
    options !== undefined &&
    (typeof options !== "object" || options === null || Array.isArray(options))
  ) {
    throw new TypeError("Opsi harus berupa objek");
  }

  const sabtuKerja = options?.sabtuKerja ?? false;
  const sertakanCutiBersama = options?.sertakanCutiBersama ?? true;

  if (typeof sabtuKerja !== "boolean" || typeof sertakanCutiBersama !== "boolean") {
    throw new TypeError("Opsi boolean harus berupa boolean");
  }

  return { sabtuKerja, sertakanCutiBersama };
}

function isWorkingDayUTC(
  utcMs: number,
  isoDate: string,
  sabtuKerja: boolean,
  sertakanCutiBersama: boolean
): { ok: true; working: boolean } | { ok: false; tahun: number } {
  const day = new Date(utcMs).getUTCDay();
  const status = cekLibur(isoDate);

  if (status.status === "data-tidak-tersedia") {
    return { ok: false, tahun: status.tahun };
  }

  if (day === 0 || (!sabtuKerja && day === 6)) {
    return { ok: true, working: false };
  }

  if (status.status === "libur-nasional") {
    return { ok: true, working: false };
  }

  if (status.status === "cuti-bersama" && sertakanCutiBersama) {
    return { ok: true, working: false };
  }

  return { ok: true, working: true };
}

/**
 * Menghitung jumlah hari kerja pada rentang inklusif `[mulai, selesai]` (format `"YYYY-MM-DD"`).
 *
 * Menggunakan aritmetika UTC murni serta data SKB 3 Menteri dari `cekLibur`. Jika rentang
 * menyentuh tahun yang datanya belum tersedia, mengembalikan `{ valid: false, alasan: "data-tidak-tersedia", tahun }`
 * agar tidak menganggap tahun tanpa data sebagai hari kerja biasa.
 */
export function hitungHariKerja(
  mulai: string,
  selesai: string,
  options?: HariKerjaOptions
): HitungHariKerjaResult {
  if (typeof mulai !== "string" || typeof selesai !== "string") {
    throw new TypeError("Tanggal harus berupa string");
  }

  const { sabtuKerja, sertakanCutiBersama } = parseOptions(options);
  const start = parseISODateParts(mulai);
  const end = parseISODateParts(selesai);

  if (start.utcMs > end.utcMs) {
    throw new RangeError("Tanggal mulai tidak boleh lebih besar dari tanggal selesai");
  }

  for (let tahun = start.year; tahun <= end.year; tahun++) {
    if (daftarLibur(tahun) === null) {
      return { valid: false, alasan: "data-tidak-tersedia", tahun };
    }
  }

  let hariKerja = 0;
  let totalHari = 0;

  for (let cursor = start.utcMs; cursor <= end.utcMs; cursor += DAY_MS) {
    totalHari += 1;
    const iso = formatUTCDate(cursor);
    const check = isWorkingDayUTC(cursor, iso, sabtuKerja, sertakanCutiBersama);
    if (!check.ok) {
      return { valid: false, alasan: "data-tidak-tersedia", tahun: check.tahun };
    }
    if (check.working) {
      hariKerja += 1;
    }
  }

  return { valid: true, hariKerja, totalHari };
}

/**
 * Menambahkan (atau mengurangi jika negatif) sejumlah hari kerja dari tanggal `mulai` (`"YYYY-MM-DD"`).
 *
 * Jika `jumlahHari === 0`, mengembalikan tanggal `mulai` apa adanya selama tahunnya tersedia.
 * Jika tanggal awal atau langkah pergeseran menyentuh tahun tanpa data SKB, mengembalikan
 * `{ valid: false, alasan: "data-tidak-tersedia", tahun }`.
 */
export function tambahHariKerja(
  mulai: string,
  jumlahHari: number,
  options?: HariKerjaOptions
): TambahHariKerjaResult {
  if (typeof mulai !== "string") {
    throw new TypeError("Tanggal harus berupa string");
  }
  if (typeof jumlahHari !== "number") {
    throw new TypeError("Jumlah hari harus berupa number");
  }
  if (!Number.isSafeInteger(jumlahHari)) {
    throw new RangeError("Jumlah hari harus berupa bilangan bulat aman");
  }

  const { sabtuKerja, sertakanCutiBersama } = parseOptions(options);
  const start = parseISODateParts(mulai);

  if (daftarLibur(start.year) === null) {
    return { valid: false, alasan: "data-tidak-tersedia", tahun: start.year };
  }

  if (jumlahHari === 0) {
    return { valid: true, tanggal: mulai };
  }

  const step = jumlahHari > 0 ? 1 : -1;
  let remaining = Math.abs(jumlahHari);
  let cursor = start.utcMs;

  while (remaining > 0) {
    cursor += step * DAY_MS;
    const iso = formatUTCDate(cursor);
    const check = isWorkingDayUTC(cursor, iso, sabtuKerja, sertakanCutiBersama);
    if (!check.ok) {
      return { valid: false, alasan: "data-tidak-tersedia", tahun: check.tahun };
    }
    if (check.working) {
      remaining -= 1;
    }
  }

  return { valid: true, tanggal: formatUTCDate(cursor) };
}
