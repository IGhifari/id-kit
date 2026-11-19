/**
 * Menormalkan nomor seluler Indonesia ke format internasional `"+628..."`, atau `null` jika tidak valid.
 *
 * Hanya mengizinkan digit angka, `"+"`, spasi, `"-"`, tanda kurung `"()"`, dan titik `"."`.
 * Karakter lain (seperti huruf) ditolak dengan `null`.
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa string");
  }

  if (/[^\d+\s\-().]/.test(input)) {
    return null;
  }

  let d = input.replace(/[\s\-().]+/g, "");
  if (d.startsWith("+62")) d = d.slice(3);
  else if (d.startsWith("62")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  else return null;

  // Nomor seluler Indonesia: diawali 8, total 9-12 digit setelah kode negara
  if (!/^8\d{8,11}$/.test(d)) return null;
  return "+62" + d;
}

/**
 * Memeriksa apakah string memenuhi pola umum nomor seluler Indonesia.
 */
export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

export { detectOperator } from "./operator";
export type {
  OperatorBrand,
  OperatorGroup,
  DetectOperatorReason,
  DetectOperatorResult,
} from "./operator";
