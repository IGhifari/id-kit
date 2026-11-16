const PROVINSI: Readonly<Record<string, string>> = {
  "11": "Aceh",
  "12": "Sumatera Utara",
  "13": "Sumatera Barat",
  "14": "Riau",
  "15": "Jambi",
  "16": "Sumatera Selatan",
  "17": "Bengkulu",
  "18": "Lampung",
  "19": "Kepulauan Bangka Belitung",
  "21": "Kepulauan Riau",
  "31": "DKI Jakarta",
  "32": "Jawa Barat",
  "33": "Jawa Tengah",
  "34": "DI Yogyakarta",
  "35": "Jawa Timur",
  "36": "Banten",
  "51": "Bali",
  "52": "Nusa Tenggara Barat",
  "53": "Nusa Tenggara Timur",
  "61": "Kalimantan Barat",
  "62": "Kalimantan Tengah",
  "63": "Kalimantan Selatan",
  "64": "Kalimantan Timur",
  "65": "Kalimantan Utara",
  "71": "Sulawesi Utara",
  "72": "Sulawesi Tengah",
  "73": "Sulawesi Selatan",
  "74": "Sulawesi Tenggara",
  "75": "Gorontalo",
  "76": "Sulawesi Barat",
  "81": "Maluku",
  "82": "Maluku Utara",
  "91": "Papua",
  "92": "Papua Barat",
  "93": "Papua Selatan",
  "94": "Papua Tengah",
  "95": "Papua Pegunungan",
  "96": "Papua Barat Daya",
};

export type NIKGender = "L" | "P";

export type NIKInvalidReason = "panjang" | "bukan-angka" | "provinsi" | "tanggal";

export type ParseNIKResult =
  | {
      valid: true;
      provinsiKode: string;
      provinsi: string;
      kabKotaKode: string;
      kecamatanKode: string;
      tanggalLahir: string;
      gender: NIKGender;
      urutan: string;
    }
  | {
      valid: false;
      alasan: NIKInvalidReason;
    };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function resolveBirthYear(yy: number): number {
  const currentTwoDigitYear = new Date().getUTCFullYear() % 100;
  return yy > currentTwoDigitYear ? 1900 + yy : 2000 + yy;
}

function isValidUTCDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Mem-parse dan memvalidasi format Nomor Induk Kependudukan (NIK) Indonesia 16 digit.
 *
 * Urutan validasi setelah membuang seluruh whitespace (`\s`):
 * 1. String kosong -> `alasan: "panjang"`
 * 2. Mengandung karakter selain angka -> `alasan: "bukan-angka"`
 * 3. Panjang bukan 16 digit -> `alasan: "panjang"`
 * 4. Kode provinsi tidak dikenal (bukan 38 provinsi resmi Kemendagri) -> `alasan: "provinsi"`
 * 5. Tanggal lahir tidak valid secara kalender UTC (DD 01–31 untuk L, DD 41–71 untuk P) -> `alasan: "tanggal"`
 *
 * Catatan penting dan batasan:
 * - Fungsi ini HANYA memvalidasi format struktur NIK, tidak membuktikan NIK asli atau terdaftar di Dukcapil.
 * - Kode kabupaten/kota dan kecamatan tidak divalidasi dan dikembalikan apa adanya.
 * - Penentuan abad pada tahun 2 digit (`YY`) bersifat heuristik: jika `YY` lebih besar dari
 *   dua digit tahun berjalan (UTC), dianggap abad 1900-an; selain itu dianggap 2000-an.
 */
export function parseNIK(input: string): ParseNIKResult {
  const cleaned = input.replace(/\s+/g, "");

  if (cleaned.length === 0) {
    return { valid: false, alasan: "panjang" };
  }

  if (/\D/.test(cleaned)) {
    return { valid: false, alasan: "bukan-angka" };
  }

  if (cleaned.length !== 16) {
    return { valid: false, alasan: "panjang" };
  }

  const provinsiKode = cleaned.slice(0, 2);
  const provinsi = Object.prototype.hasOwnProperty.call(PROVINSI, provinsiKode)
    ? PROVINSI[provinsiKode]
    : undefined;

  if (!provinsi) {
    return { valid: false, alasan: "provinsi" };
  }

  const kabKotaKode = cleaned.slice(2, 4);
  const kecamatanKode = cleaned.slice(4, 6);
  const rawDay = Number(cleaned.slice(6, 8));
  const month = Number(cleaned.slice(8, 10));
  const yy = Number(cleaned.slice(10, 12));
  const urutan = cleaned.slice(12, 16);

  let gender: NIKGender;
  let day: number;

  if (rawDay >= 1 && rawDay <= 31) {
    gender = "L";
    day = rawDay;
  } else if (rawDay >= 41 && rawDay <= 71) {
    gender = "P";
    day = rawDay - 40;
  } else {
    return { valid: false, alasan: "tanggal" };
  }

  if (month < 1 || month > 12) {
    return { valid: false, alasan: "tanggal" };
  }

  const year = resolveBirthYear(yy);
  if (!isValidUTCDate(year, month, day)) {
    return { valid: false, alasan: "tanggal" };
  }

  return {
    valid: true,
    provinsiKode,
    provinsi,
    kabKotaKode,
    kecamatanKode,
    tanggalLahir: `${year}-${pad2(month)}-${pad2(day)}`,
    gender,
    urutan,
  };
}

/**
 * Memeriksa apakah string memenuhi format NIK 16 digit yang valid.
 *
 * Hanya memvalidasi format struktur (bukan keaslian atau keterdaftaran di Dukcapil).
 */
export function isValidNIK(input: string): boolean {
  return parseNIK(input).valid;
}
