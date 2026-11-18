export type ZonaWaktu = "WIB" | "WITA" | "WIT";

export interface FormatTanggalOptions {
  /** Zona waktu target untuk konversi input instan (`Date` atau ISO ber-offset). Default: `"WIB"`. */
  zona?: ZonaWaktu;
  /** Sertakan nama hari di depan tanggal (contoh: `"Rabu, 18 November 2026"`). Default: `false`. */
  denganHari?: boolean;
  /** Gunakan nama bulan/hari singkat 3 huruf (contoh: `"18 Nov 2026"`). Default: `false`. */
  singkat?: boolean;
}

export interface FormatWaktuOptions {
  /** Zona waktu target. Default: `"WIB"`. */
  zona?: ZonaWaktu;
  /** Sertakan detik (contoh: `"20:35:10 WIB"`). Default: `false`. */
  denganDetik?: boolean;
  /** Sertakan label zona waktu di belakang jam. Default: `true`. */
  tampilkanZona?: boolean;
}

export interface FormatTanggalWaktuOptions
  extends FormatTanggalOptions,
    FormatWaktuOptions {}

export interface WaktuIndonesia {
  readonly tahun: number;
  readonly bulan: number;
  readonly tanggal: number;
  readonly hari: number;
  readonly jam: number;
  readonly menit: number;
  readonly detik: number;
  readonly zona: ZonaWaktu;
  readonly offset: "+07:00" | "+08:00" | "+09:00";
  readonly iso: string;
}

const NAMA_HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

const NAMA_HARI_SINGKAT = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
] as const;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const NAMA_BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const ZONA_OFFSET_HOURS: Readonly<Record<ZonaWaktu, 7 | 8 | 9>> = {
  WIB: 7,
  WITA: 8,
  WIT: 9,
};

const ZONA_OFFSET_STRING: Readonly<
  Record<ZonaWaktu, "+07:00" | "+08:00" | "+09:00">
> = {
  WIB: "+07:00",
  WITA: "+08:00",
  WIT: "+09:00",
};

const PROVINSI_ZONA: Readonly<Record<string, ZonaWaktu>> = {
  // WIB (Sumatra, Jawa, Kalimantan Barat, Kalimantan Tengah)
  "11": "WIB",
  "12": "WIB",
  "13": "WIB",
  "14": "WIB",
  "15": "WIB",
  "16": "WIB",
  "17": "WIB",
  "18": "WIB",
  "19": "WIB",
  "21": "WIB",
  "31": "WIB",
  "32": "WIB",
  "33": "WIB",
  "34": "WIB",
  "35": "WIB",
  "36": "WIB",
  "61": "WIB",
  "62": "WIB",

  // WITA (Bali, Nusa Tenggara, Kalimantan Selatan/Timur/Utara, Sulawesi)
  "51": "WITA",
  "52": "WITA",
  "53": "WITA",
  "63": "WITA",
  "64": "WITA",
  "65": "WITA",
  "71": "WITA",
  "72": "WITA",
  "73": "WITA",
  "74": "WITA",
  "75": "WITA",
  "76": "WITA",

  // WIT (Maluku, Maluku Utara, Papua & DOB Papua)
  "81": "WIT",
  "82": "WIT",
  "91": "WIT",
  "92": "WIT",
  "93": "WIT",
  "94": "WIT",
  "95": "WIT",
  "96": "WIT",
};

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_OFFSET_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(?:[Zz]|([+-])(\d{2}):?(\d{2}))$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function validateZona(zona: unknown): ZonaWaktu {
  if (zona === undefined) {
    return "WIB";
  }
  if (zona !== "WIB" && zona !== "WITA" && zona !== "WIT") {
    throw new RangeError("Zona waktu harus WIB, WITA, atau WIT");
  }
  return zona;
}

function assertOptionsObject(options: unknown): void {
  if (
    options !== undefined &&
    (typeof options !== "object" || options === null || Array.isArray(options))
  ) {
    throw new TypeError("Opsi harus berupa objek");
  }
}

function assertOptionalBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "boolean") {
    throw new TypeError("Opsi boolean harus berupa boolean");
  }
  return value;
}

function isValidUTCDateParts(year: number, month: number, day: number): boolean {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

function parseDateOnlyParts(input: string): {
  tahun: number;
  bulan: number;
  tanggal: number;
  hari: number;
} | null {
  const match = DATE_ONLY_REGEX.exec(input);
  if (!match) {
    return null;
  }
  const tahun = Number(match[1]);
  const bulan = Number(match[2]);
  const tanggal = Number(match[3]);
  if (!isValidUTCDateParts(tahun, bulan, tanggal)) {
    throw new RangeError("Format tanggal atau waktu tidak valid");
  }
  const hari = new Date(Date.UTC(tahun, bulan - 1, tanggal)).getUTCDay();
  return { tahun, bulan, tanggal, hari };
}

function parseInstantToUTCMs(input: Date | string): number {
  if (input instanceof Date) {
    const ms = input.getTime();
    if (!Number.isFinite(ms)) {
      throw new RangeError("Format tanggal atau waktu tidak valid");
    }
    return ms;
  }

  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa Date atau string ISO yang valid");
  }

  const match = ISO_OFFSET_REGEX.exec(input);
  if (!match) {
    throw new RangeError("Format tanggal atau waktu tidak valid");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] !== undefined ? Number(match[6]) : 0;
  const ms =
    match[7] !== undefined ? Number(match[7].slice(0, 3).padEnd(3, "0")) : 0;

  if (
    !isValidUTCDateParts(year, month, day) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new RangeError("Format tanggal atau waktu tidak valid");
  }

  let offsetMinutes = 0;
  if (match[8] !== undefined) {
    const sign = match[8] === "+" ? 1 : -1;
    const offHours = Number(match[9]);
    const offMins = Number(match[10]);
    if (offHours > 23 || offMins > 59) {
      throw new RangeError("Format tanggal atau waktu tidak valid");
    }
    offsetMinutes = sign * (offHours * 60 + offMins);
  }

  return (
    Date.UTC(year, month - 1, day, hour, minute, second, ms) -
    offsetMinutes * 60_000
  );
}

function formatDateParts(
  parts: { tahun: number; bulan: number; tanggal: number; hari: number },
  denganHari: boolean,
  singkat: boolean
): string {
  const bulanNama = singkat
    ? NAMA_BULAN_SINGKAT[parts.bulan - 1]
    : NAMA_BULAN[parts.bulan - 1];
  const tanggalText = `${parts.tanggal} ${bulanNama} ${parts.tahun}`;
  if (!denganHari) {
    return tanggalText;
  }
  const hariNama = singkat
    ? NAMA_HARI_SINGKAT[parts.hari]
    : NAMA_HARI[parts.hari];
  return `${hariNama}, ${tanggalText}`;
}

function formatTimeParts(
  parts: { jam: number; menit: number; detik: number; zona: ZonaWaktu },
  denganDetik: boolean,
  tampilkanZona: boolean
): string {
  const base = denganDetik
    ? `${pad2(parts.jam)}:${pad2(parts.menit)}:${pad2(parts.detik)}`
    : `${pad2(parts.jam)}:${pad2(parts.menit)}`;
  return tampilkanZona ? `${base} ${parts.zona}` : base;
}

/**
 * Mengonversi `Date` atau string ISO ber-offset eksplisit (`Z` / `±HH:MM`) ke zona waktu Indonesia
 * (`WIB`, `WITA`, atau `WIT`) menggunakan aritmetika UTC murni tanpa bergantung pada zona waktu mesin lokal.
 */
export function keZonaWaktu(
  input: Date | string,
  zona: ZonaWaktu = "WIB"
): WaktuIndonesia {
  const targetZona = validateZona(zona);
  const utcMs = parseInstantToUTCMs(input);
  const offsetHours = ZONA_OFFSET_HOURS[targetZona];
  const shifted = new Date(utcMs + offsetHours * 3_600_000);

  const tahun = shifted.getUTCFullYear();
  const bulan = shifted.getUTCMonth() + 1;
  const tanggal = shifted.getUTCDate();
  const hari = shifted.getUTCDay();
  const jam = shifted.getUTCHours();
  const menit = shifted.getUTCMinutes();
  const detik = shifted.getUTCSeconds();
  const offset = ZONA_OFFSET_STRING[targetZona];

  return {
    tahun,
    bulan,
    tanggal,
    hari,
    jam,
    menit,
    detik,
    zona: targetZona,
    offset,
    iso: `${pad4(tahun)}-${pad2(bulan)}-${pad2(tanggal)}T${pad2(jam)}:${pad2(menit)}:${pad2(detik)}${offset}`,
  };
}

/**
 * Memformat tanggal ke bahasa Indonesia (contoh: `"18 November 2026"` atau `"Rabu, 18 November 2026"`).
 *
 * Menerima `Date`, string ISO dengan zona waktu eksplisit (`Z` / `±HH:MM`), atau string tanggal murni
 * `"YYYY-MM-DD"` (dianggap tanggal kalender tanpa pergeseran jam). String ISO tanpa offset ditolak.
 */
export function formatTanggal(
  input: Date | string,
  options?: FormatTanggalOptions
): string {
  assertOptionsObject(options);
  const zona = validateZona(options?.zona);
  const denganHari = assertOptionalBoolean(options?.denganHari, false);
  const singkat = assertOptionalBoolean(options?.singkat, false);

  if (typeof input === "string") {
    const dateOnly = parseDateOnlyParts(input);
    if (dateOnly) {
      return formatDateParts(dateOnly, denganHari, singkat);
    }
  } else if (!(input instanceof Date)) {
    throw new TypeError("Input harus berupa Date atau string tanggal yang valid");
  }

  const parts = keZonaWaktu(input, zona);
  return formatDateParts(parts, denganHari, singkat);
}

/**
 * Memformat waktu (jam) ke zona waktu Indonesia dengan pemisah titik dua (contoh: `"20:35 WIB"`).
 *
 * Menerima `Date` atau string ISO dengan zona waktu eksplisit (`Z` / `±HH:MM`).
 * String `"YYYY-MM-DD"` dan string ISO tanpa offset ditolak dengan `RangeError`.
 */
export function formatWaktu(
  input: Date | string,
  options?: FormatWaktuOptions
): string {
  assertOptionsObject(options);
  const zona = validateZona(options?.zona);
  const denganDetik = assertOptionalBoolean(options?.denganDetik, false);
  const tampilkanZona = assertOptionalBoolean(options?.tampilkanZona, true);

  const parts = keZonaWaktu(input, zona);
  return formatTimeParts(parts, denganDetik, tampilkanZona);
}

/**
 * Memformat tanggal dan waktu sekaligus ke zona waktu Indonesia
 * (contoh: `"18 November 2026, 20:35 WIB"`).
 *
 * Menerima `Date` atau string ISO dengan zona waktu eksplisit (`Z` / `±HH:MM`).
 */
export function formatTanggalWaktu(
  input: Date | string,
  options?: FormatTanggalWaktuOptions
): string {
  assertOptionsObject(options);
  const zona = validateZona(options?.zona);
  const denganHari = assertOptionalBoolean(options?.denganHari, false);
  const singkat = assertOptionalBoolean(options?.singkat, false);
  const denganDetik = assertOptionalBoolean(options?.denganDetik, false);
  const tampilkanZona = assertOptionalBoolean(options?.tampilkanZona, true);

  const parts = keZonaWaktu(input, zona);
  const tanggalText = formatDateParts(parts, denganHari, singkat);
  const waktuText = formatTimeParts(parts, denganDetik, tampilkanZona);
  return `${tanggalText}, ${waktuText}`;
}

/**
 * Mengembalikan zona waktu (`"WIB"`, `"WITA"`, atau `"WIT"`) berdasarkan kode provinsi 2 digit
 * Kemendagri (`"11"`–`"96"`), konsisten dengan kode provinsi pada modul `nik`, atau `null` jika tidak dikenal.
 *
 * Catatan: menggunakan 38 kode provinsi Kemendagri (`"11"`–`"96"`), bukan kode wilayah kerja statistik
 * BPS yang berbeda penomoran di wilayah Papua.
 */
export function zonaWaktuProvinsi(kodeProvinsi: string): ZonaWaktu | null {
  if (typeof kodeProvinsi !== "string") {
    throw new TypeError("Kode provinsi harus berupa string");
  }

  const trimmed = kodeProvinsi.trim();
  if (!/^\d{2}$/.test(trimmed)) {
    return null;
  }

  return Object.prototype.hasOwnProperty.call(PROVINSI_ZONA, trimmed)
    ? PROVINSI_ZONA[trimmed]
    : null;
}
