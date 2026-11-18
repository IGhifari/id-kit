import { normalizePhone } from "../phone";

export interface MaskOptions {
  /** Jumlah karakter awal yang tetap ditampilkan. Default: `0`. */
  visibleStart?: number;
  /** Jumlah karakter akhir yang tetap ditampilkan. Default: `0`. */
  visibleEnd?: number;
  /** Karakter pengganti untuk bagian yang disensor (harus tepat 1 Unicode code point). Default: `"*"`. */
  maskChar?: string;
}

function assertString(input: unknown): asserts input is string {
  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa string");
  }
}

function validateVisibleCount(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} harus berupa bilangan bulat non-negatif`);
  }
}

function validateMaskChar(maskChar: string): void {
  if (typeof maskChar !== "string") {
    throw new TypeError("maskChar harus berupa string");
  }
  if (Array.from(maskChar).length !== 1) {
    throw new RangeError("maskChar harus tepat satu karakter Unicode");
  }
}

function fullMask(input: string, maskChar = "*"): string {
  return maskChar.repeat(Array.from(input).length);
}

/**
 * Menyensor string untuk kebutuhan tampilan UI.
 *
 * Catatan keamanan & perilaku:
 * - Hanya untuk tampilan, bukan enkripsi atau anonimisasi.
 * - Jika panjang input (dalam Unicode code point) `<= visibleStart + visibleEnd`, seluruh input disensor.
 * - Hanya `mask()` yang menjamin panjang hasil (dalam code point) sama dengan panjang input.
 * - Panjang dihitung per code point via `Array.from`; grapheme cluster gabungan (seperti bendera atau emoji ZWJ)
 *   dihitung per code point penyusunnya.
 */
export function mask(input: string, options: MaskOptions = {}): string {
  assertString(input);

  const { visibleStart = 0, visibleEnd = 0, maskChar = "*" } = options;
  validateVisibleCount(visibleStart, "visibleStart");
  validateVisibleCount(visibleEnd, "visibleEnd");
  validateMaskChar(maskChar);

  const chars = Array.from(input);
  if (chars.length === 0) {
    return "";
  }

  if (chars.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(chars.length);
  }

  const start = chars.slice(0, visibleStart).join("");
  const end = visibleEnd > 0 ? chars.slice(-visibleEnd).join("") : "";
  const middle = maskChar.repeat(chars.length - visibleStart - visibleEnd);

  return start + middle + end;
}

/**
 * Menyensor NIK 16 digit untuk tampilan UI dengan menampilkan 4 digit awal dan 4 digit akhir.
 *
 * Whitespace (`\s`) dibuang sebelum pemeriksaan. Jika hasilnya bukan tepat 16 digit angka,
 * seluruh input disensor penuh sepanjang input asli (`Array.from(input).length`) tanpa validasi Dukcapil.
 * Hanya untuk tampilan UI, bukan enkripsi atau anonimisasi.
 */
export function maskNIK(input: string): string {
  assertString(input);

  const cleaned = input.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(cleaned)) {
    return fullMask(input);
  }

  return mask(cleaned, { visibleStart: 4, visibleEnd: 4 });
}

/**
 * Menyensor nomor seluler Indonesia untuk tampilan UI dalam format `+628...` dengan 3 digit akhir terlihat.
 *
 * Memakai `normalizePhone` dari modul `phone`. Jika nomor tidak valid, seluruh input disensor penuh
 * sepanjang input asli (`Array.from(input).length`) tanpa melempar error.
 * Hanya untuk tampilan UI, bukan enkripsi atau anonimisasi.
 */
export function maskPhone(input: string): string {
  assertString(input);

  const normalized = normalizePhone(input);
  if (!normalized) {
    return fullMask(input);
  }

  return mask(normalized, { visibleStart: 4, visibleEnd: 3 });
}

/**
 * Menyensor nomor rekening untuk tampilan UI dengan hanya menampilkan 4 digit terakhir.
 *
 * Spasi dan tanda hubung (`-`) dibuang terlebih dahulu. Jika mengandung karakter non-angka atau
 * panjang setelah dibersihkan kurang dari 8 digit, seluruh input disensor penuh sepanjang input asli.
 * Hanya untuk tampilan UI, bukan enkripsi atau anonimisasi.
 */
export function maskAccount(input: string): string {
  assertString(input);

  const cleaned = input.replace(/[\s-]+/g, "");
  if (cleaned.length < 8 || !/^\d+$/.test(cleaned)) {
    return fullMask(input);
  }

  return mask(cleaned, { visibleStart: 0, visibleEnd: 4 });
}
