export interface BankInfo {
  readonly kode: string;
  readonly nama: string;
}

/**
 * Daftar kode bank 3 digit populer di Indonesia.
 *
 * Catatan penting & batasan:
 * - Tabel diverifikasi pada 2026-11-18 dari sumber sekunder (jaringan switching nasional dan situs resmi bank).
 *   Bank Indonesia tidak menerbitkan satu tabel terbuka untuk seluruh kode transfer 3 digit.
 * - Bank sering berganti nama atau melakukan merger sehingga daftar ini dapat usang. Cocokkan kembali
 *   dengan sumber resmi bank terkait sebelum dipakai untuk transaksi.
 * - Tidak ada validasi panjang nomor rekening, dengan sengaja.
 */
export const BANKS: readonly BankInfo[] = [
  { kode: "002", nama: "Bank Rakyat Indonesia (BRI)" },
  { kode: "008", nama: "Bank Mandiri" },
  { kode: "009", nama: "Bank Negara Indonesia (BNI)" },
  { kode: "011", nama: "Bank Danamon" },
  { kode: "013", nama: "Bank Permata" },
  { kode: "014", nama: "Bank Central Asia (BCA)" },
  { kode: "016", nama: "Bank Maybank Indonesia" },
  { kode: "019", nama: "Bank Panin" },
  { kode: "022", nama: "Bank CIMB Niaga" },
  { kode: "023", nama: "Bank UOB Indonesia" },
  { kode: "028", nama: "OCBC" },
  { kode: "046", nama: "Bank DBS Indonesia" },
  { kode: "087", nama: "Bank HSBC Indonesia" },
  { kode: "147", nama: "Bank Muamalat Indonesia" },
  { kode: "153", nama: "Bank Sinarmas" },
  { kode: "200", nama: "Bank Tabungan Negara (BTN)" },
  { kode: "213", nama: "Bank SMBC Indonesia" },
  { kode: "426", nama: "Bank Mega" },
  { kode: "441", nama: "KB Bank" },
  { kode: "451", nama: "Bank Syariah Indonesia (BSI)" },
  { kode: "459", nama: "Krom Bank Indonesia" },
  { kode: "472", nama: "Bank Saqu Indonesia" },
  { kode: "490", nama: "Bank Neo Commerce" },
  { kode: "494", nama: "Bank Raya Indonesia" },
  { kode: "501", nama: "BCA Digital" },
  { kode: "535", nama: "SeaBank Indonesia" },
  { kode: "536", nama: "BCA Syariah" },
  { kode: "542", nama: "Bank Jago" },
  { kode: "553", nama: "Bank Hibank Indonesia" },
  { kode: "562", nama: "Superbank" },
  { kode: "567", nama: "Allo Bank" },
];

const BANK_BY_CODE = new Map<string, BankInfo>(
  BANKS.map((bank) => [bank.kode, bank])
);

/**
 * Mencari informasi bank berdasarkan kode bank 3 digit.
 *
 * Spasi di awal dan akhir di-trim terlebih dahulu, lalu wajib tepat 3 digit angka (tanpa pengisian nol di depan).
 * Tabel diverifikasi 2026-11-18 dari sumber sekunder (jaringan switching dan situs bank); Bank Indonesia tidak
 * menerbitkan satu tabel terbuka. Bank sering ganti nama sehingga daftar bisa usang—cocokkan dengan sumber
 * resmi bank sebelum dipakai untuk transaksi. Tidak ada validasi panjang nomor rekening, dengan sengaja.
 */
export function getBank(kode: string): BankInfo | null {
  if (typeof kode !== "string") {
    throw new TypeError("Kode bank harus berupa string");
  }

  const trimmed = kode.trim();
  if (!/^\d{3}$/.test(trimmed)) {
    return null;
  }

  const found = BANK_BY_CODE.get(trimmed);
  return found ? { ...found } : null;
}

/**
 * Mengembalikan seluruh daftar bank yang tersedia dalam modul ini.
 *
 * Tabel diverifikasi 2026-11-18 dari sumber sekunder (jaringan switching dan situs bank); Bank Indonesia tidak
 * menerbitkan satu tabel terbuka. Tidak ada validasi panjang nomor rekening, dengan sengaja.
 */
export function listBank(): BankInfo[] {
  return BANKS.map((bank) => ({ ...bank }));
}
