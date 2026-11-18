import { normalizePhone } from "./index";

export type OperatorBrand =
  | "Telkomsel"
  | "IM3"
  | "Tri"
  | "XL"
  | "AXIS"
  | "Smartfren";

export type OperatorGroup =
  | "Telkomsel"
  | "Indosat Ooredoo Hutchison"
  | "XLSmart";

export type DetectOperatorReason = "format" | "awalan-tidak-dikenal";

export type DetectOperatorResult =
  | {
      valid: true;
      operator: OperatorBrand;
      grup: OperatorGroup;
      prefix: string;
    }
  | {
      valid: false;
      alasan: DetectOperatorReason;
    };

export interface OperatorPrefixEntry {
  readonly prefix: string;
  readonly operator: OperatorBrand;
  readonly grup: OperatorGroup;
}

/**
 * Daftar awalan nomor seluler Indonesia (format lokal 4 digit) beserta merek dan grup induknya.
 *
 * Sumber data: penomoran Komdigi dan informasi resmi operator (terakhir diverifikasi 2026-11-18).
 * Catatan: tidak tersedia satu tabel resmi publik tunggal yang lengkap untuk seluruh blok aktif.
 * Awalan yang belum terverifikasi (`0834`–`0837`, `0879`, `0893`, `0894`) dan yang telah dicabut
 * (`0828`, `0868`) sengaja tidak dimasukkan.
 */
export const OPERATOR_PREFIXES: readonly OperatorPrefixEntry[] = [
  { prefix: "0811", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0812", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0813", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0821", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0822", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0823", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0851", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0852", operator: "Telkomsel", grup: "Telkomsel" },
  { prefix: "0853", operator: "Telkomsel", grup: "Telkomsel" },

  { prefix: "0814", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0815", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0816", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0855", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0856", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0857", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0858", operator: "IM3", grup: "Indosat Ooredoo Hutchison" },

  { prefix: "0895", operator: "Tri", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0896", operator: "Tri", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0897", operator: "Tri", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0898", operator: "Tri", grup: "Indosat Ooredoo Hutchison" },
  { prefix: "0899", operator: "Tri", grup: "Indosat Ooredoo Hutchison" },

  { prefix: "0817", operator: "XL", grup: "XLSmart" },
  { prefix: "0818", operator: "XL", grup: "XLSmart" },
  { prefix: "0819", operator: "XL", grup: "XLSmart" },
  { prefix: "0859", operator: "XL", grup: "XLSmart" },
  { prefix: "0877", operator: "XL", grup: "XLSmart" },
  { prefix: "0878", operator: "XL", grup: "XLSmart" },

  { prefix: "0831", operator: "AXIS", grup: "XLSmart" },
  { prefix: "0832", operator: "AXIS", grup: "XLSmart" },
  { prefix: "0833", operator: "AXIS", grup: "XLSmart" },
  { prefix: "0838", operator: "AXIS", grup: "XLSmart" },

  { prefix: "0881", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0882", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0883", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0884", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0885", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0886", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0887", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0888", operator: "Smartfren", grup: "XLSmart" },
  { prefix: "0889", operator: "Smartfren", grup: "XLSmart" },
];

const SORTED_PREFIXES: readonly OperatorPrefixEntry[] = [...OPERATOR_PREFIXES].sort(
  (a, b) => b.prefix.length - a.prefix.length || a.prefix.localeCompare(b.prefix)
);

/**
 * Mendeteksi operator seluler asal berdasarkan awalan nomor telepon Indonesia.
 *
 * Catatan penting & batasan:
 * - Hasil menunjukkan **operator asal berdasarkan alokasi awalan**, bukan operator aktif saat ini,
 *   karena nomor dapat berpindah operator melalui *number portability*.
 * - Field `grup` adalah perusahaan induk saat data diverifikasi dan dapat berubah karena merger/akuisisi.
 * - Data awalan mengacu pada penomoran Komdigi dan informasi resmi operator
 *   (terakhir diverifikasi 2026-11-18); tidak ada satu tabel resmi tunggal yang lengkap.
 * - Hanya menerima nomor seluler yang lolos `normalizePhone`; telepon rumah dan format tidak valid
 *   mengembalikan `{ valid: false, alasan: "format" }`.
 */
export function detectOperator(input: string): DetectOperatorResult {
  if (typeof input !== "string") {
    throw new TypeError("Input harus berupa string");
  }

  const normalized = normalizePhone(input);
  if (!normalized) {
    return { valid: false, alasan: "format" };
  }

  const localNumber = "0" + normalized.slice(3);
  const matched = SORTED_PREFIXES.find((entry) =>
    localNumber.startsWith(entry.prefix)
  );

  if (!matched) {
    return { valid: false, alasan: "awalan-tidak-dikenal" };
  }

  return {
    valid: true,
    operator: matched.operator,
    grup: matched.grup,
    prefix: matched.prefix,
  };
}
