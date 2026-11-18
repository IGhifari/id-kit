import { parseNIK } from "../nik";

export type NPWPJenis =
  | "legacy-15"
  | "nik"
  | "badan-awalan-0"
  | "16-digit-lainnya";

export type NPWPInvalidReason = "panjang" | "bukan-angka";

export type ParseNPWPResult =
  | {
      valid: true;
      jenis: NPWPJenis;
      digit: string;
    }
  | {
      valid: false;
      alasan: NPWPInvalidReason;
    };

export type ParseNITKUResult =
  | {
      valid: true;
      digit: string;
      npwpInduk: string;
      jenisInduk: Exclude<NPWPJenis, "legacy-15">;
      kodeLokasi: string;
      isPusat: boolean;
    }
  | {
      valid: false;
      alasan: NPWPInvalidReason;
    };

function assertString(input: unknown): asserts input is string {
  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa string");
  }
}

function cleanInput(input: string): string {
  return input.replace(/[\s.-]+/g, "");
}

function classify16Digit(digit: string): Exclude<NPWPJenis, "legacy-15"> {
  if (parseNIK(digit).valid) {
    return "nik";
  }
  if (digit.startsWith("0")) {
    return "badan-awalan-0";
  }
  return "16-digit-lainnya";
}

/**
 * Mem-parse dan memvalidasi format Nomor Pokok Wajib Pajak (NPWP) Indonesia 15 atau 16 digit.
 *
 * Whitespace (`\s`), titik (`.`), dan tanda hubung (`-`) dibuang sebelum pemeriksaan.
 *
 * Klasifikasi hasil valid:
 * - `"legacy-15"`: NPWP 15 digit format lama (legacy).
 * - `"nik"`: NPWP 16 digit yang bentuknya cocok dengan format NIK (`parseNIK`). Ini hanya berarti
 *   bentuknya cocok NIK, bukan bukti bahwa NPWP orang pribadi tersebut terdaftar; WNA bukan penduduk
 *   tidak memakai NIK.
 * - `"badan-awalan-0"`: NPWP 16 digit diawali `"0"` (pola `0 + 15 digit` lama), yang hanya berlaku
 *   untuk entitas terdaftar sebelum 14 Juli 2022.
 * - `"16-digit-lainnya"`: NPWP 16 digit selain kedua pola di atas.
 *
 * Catatan & batasan:
 * - Ini HANYA validasi format dan panjang (tanpa checksum), bukan bukti NPWP terdaftar di DJP.
 * - Input 22 digit ditolak dengan `alasan: "panjang"`; gunakan `parseNITKU` untuk format NITKU 22 digit.
 */
export function parseNPWP(input: string): ParseNPWPResult {
  assertString(input);

  const cleaned = cleanInput(input);
  if (cleaned.length === 0) {
    return { valid: false, alasan: "panjang" };
  }

  if (/\D/.test(cleaned)) {
    return { valid: false, alasan: "bukan-angka" };
  }

  if (cleaned.length === 15) {
    return { valid: true, jenis: "legacy-15", digit: cleaned };
  }

  if (cleaned.length === 16) {
    return { valid: true, jenis: classify16Digit(cleaned), digit: cleaned };
  }

  return { valid: false, alasan: "panjang" };
}

/**
 * Memeriksa apakah string memenuhi format NPWP 15 atau 16 digit.
 *
 * Hanya memvalidasi format dan panjang (bukan bukti NPWP terdaftar di DJP).
 */
export function isValidNPWP(input: string): boolean {
  return parseNPWP(input).valid;
}

/**
 * Mem-parse dan memvalidasi format Nomor Identitas Tempat Kegiatan Usaha (NITKU) 22 digit.
 *
 * Whitespace (`\s`), titik (`.`), dan tanda hubung (`-`) dibuang sebelum pemeriksaan.
 * Format NITKU terdiri dari 16 digit NPWP induk/pusat dan 6 digit kode lokasi (`"000000"` = pusat).
 *
 * Catatan: hanya memvalidasi format dan panjang (tanpa checksum), bukan bukti NITKU terdaftar di DJP.
 */
export function parseNITKU(input: string): ParseNITKUResult {
  assertString(input);

  const cleaned = cleanInput(input);
  if (cleaned.length === 0) {
    return { valid: false, alasan: "panjang" };
  }

  if (/\D/.test(cleaned)) {
    return { valid: false, alasan: "bukan-angka" };
  }

  if (cleaned.length !== 22) {
    return { valid: false, alasan: "panjang" };
  }

  const npwpInduk = cleaned.slice(0, 16);
  const kodeLokasi = cleaned.slice(16, 22);

  return {
    valid: true,
    digit: cleaned,
    npwpInduk,
    jenisInduk: classify16Digit(npwpInduk),
    kodeLokasi,
    isPusat: kodeLokasi === "000000",
  };
}

/**
 * Memeriksa apakah string memenuhi format NITKU 22 digit.
 *
 * Hanya memvalidasi format dan panjang (bukan bukti NITKU terdaftar di DJP).
 */
export function isValidNITKU(input: string): boolean {
  return parseNITKU(input).valid;
}
