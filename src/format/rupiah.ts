export interface RupiahSingkatOptions {
  /** Jumlah maksimal angka di belakang koma (0–6). Nol di akhir otomatis dibuang. Default: `1`. */
  desimal?: number;
}

const SINGKAT_SKALA: readonly [number, string][] = [
  [1e3, "rb"],
  [1e6, "jt"],
  [1e9, "M"],
  [1e12, "T"],
];

const STRICT_INT_REGEX = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/;

/**
 * Mengurai string format Rupiah Indonesia ke `number`, atau `null` jika tidak valid.
 *
 * Aturan parsing:
 * - Mendukung awalan opsional `"Rp"` / `"Rp."` (case-insensitive) dan tanda minus sebelum atau sesudah `"Rp"`.
 * - Jika memakai titik sebagai pemisah ribuan, wajib berkelompok 3 digit (`"1.250.000"`); format seperti
 *   `"1.50"` ditolak dengan `null` agar format desimal Inggris tidak keliru terurai.
 * - Mendukung koma desimal (`"Rp1.250,50"`) dan akhiran akuntansi `",-"` (`"Rp1.250.000,-"`).
 * - Input non-string melempar `TypeError`.
 */
export function parseRupiah(input: string): number | null {
  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa string");
  }

  let s = input.trim();
  if (s.length === 0) {
    return null;
  }

  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1).trimStart();
  }

  const rpMatch = /^rp\.?/i.exec(s);
  if (rpMatch) {
    s = s.slice(rpMatch[0].length).trimStart();
    if (s.startsWith("-")) {
      if (negative) {
        return null;
      }
      negative = true;
      s = s.slice(1).trimStart();
    }
  }

  if (s.length === 0) {
    return null;
  }

  let intPart = s;
  let decPart = "";

  const commaIndex = s.indexOf(",");
  if (commaIndex !== -1) {
    if (s.indexOf(",", commaIndex + 1) !== -1) {
      return null;
    }
    intPart = s.slice(0, commaIndex);
    const afterComma = s.slice(commaIndex + 1);
    if (afterComma === "-") {
      decPart = "";
    } else if (/^\d+$/.test(afterComma)) {
      decPart = afterComma;
    } else {
      return null;
    }
  }

  if (!STRICT_INT_REGEX.test(intPart)) {
    return null;
  }

  const cleanInt = intPart.replace(/\./g, "");
  const numericStr = decPart ? `${cleanInt}.${decPart}` : cleanInt;
  const value = Number(numericStr);
  if (!Number.isFinite(value)) {
    return null;
  }

  if (value === 0) {
    return 0;
  }

  return negative ? -value : value;
}

/**
 * Memformat angka berhingga ke format Rupiah ringkas bahasa Indonesia
 * (contoh: `"Rp1,5 jt"`, `"-Rp2,5 M"`, `"Rp1.000 T"`).
 *
 * Menggunakan skala `rb`, `jt`, `M`, dan `T` dengan pembulatan naik otomatis antar skala
 * (misalnya `999_950` dengan 1 desimal menjadi `"Rp1 jt"`).
 */
export function rupiahSingkat(
  n: number,
  options?: RupiahSingkatOptions
): string {
  if (typeof n !== "number") {
    throw new TypeError("Input harus berupa number");
  }
  if (!Number.isFinite(n)) {
    throw new RangeError("Input harus berupa angka berhingga");
  }
  if (
    options !== undefined &&
    (typeof options !== "object" || options === null || Array.isArray(options))
  ) {
    throw new TypeError("Opsi harus berupa objek");
  }

  let desimal = 1;
  if (options?.desimal !== undefined) {
    if (typeof options.desimal !== "number") {
      throw new TypeError("Opsi desimal harus berupa number");
    }
    if (!Number.isInteger(options.desimal) || options.desimal < 0 || options.desimal > 6) {
      throw new RangeError("Opsi desimal harus berupa bilangan bulat antara 0 hingga 6");
    }
    desimal = options.desimal;
  }

  if (n === 0) {
    return "Rp0";
  }

  const abs = Math.abs(n);
  const factor = 10 ** desimal;

  let idx = -1;
  for (let i = SINGKAT_SKALA.length - 1; i >= 0; i--) {
    if (abs >= SINGKAT_SKALA[i][0]) {
      idx = i;
      break;
    }
  }

  let scaled = idx === -1 ? abs : abs / SINGKAT_SKALA[idx][0];
  let rounded = Math.round(scaled * factor) / factor;

  while (idx < SINGKAT_SKALA.length - 1 && rounded >= 1000) {
    idx += 1;
    scaled = abs / SINGKAT_SKALA[idx][0];
    rounded = Math.round(scaled * factor) / factor;
  }

  if (rounded === 0) {
    return "Rp0";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: desimal,
  }).format(rounded);
  const suffix = idx === -1 ? "" : ` ${SINGKAT_SKALA[idx][1]}`;
  return `${n < 0 ? "-Rp" : "Rp"}${formatted}${suffix}`;
}
