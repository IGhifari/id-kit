const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

const SKALA: readonly [number, string][] = [
  [1e15, "kuadriliun"],
  [1e12, "triliun"],
  [1e9, "miliar"],
  [1e6, "juta"],
  [1e3, "ribu"],
];

function gabung(depan: string, sisa: number): string {
  return sisa ? `${depan} ${baca(sisa)}` : depan;
}

function baca(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return gabung(`${SATUAN[Math.floor(n / 10)]} puluh`, n % 10);
  if (n < 200) return gabung("seratus", n - 100);
  if (n < 1000) return gabung(`${SATUAN[Math.floor(n / 100)]} ratus`, n % 100);
  if (n < 2000) return gabung("seribu", n - 1000);
  for (const [nilai, nama] of SKALA) {
    if (n >= nilai) {
      return gabung(`${baca(Math.floor(n / nilai))} ${nama}`, n % nilai);
    }
  }
  return "";
}

/**
 * Mengubah bilangan bulat aman (`Number.isSafeInteger`, hingga skala kuadriliun)
 * menjadi teks terbilang bahasa Indonesia berakhiran `"rupiah"`.
 */
export function terbilang(n: number): string {
  if (typeof n !== "number") {
    throw new TypeError("Input harus berupa number");
  }
  if (!Number.isSafeInteger(n)) {
    throw new RangeError("Hanya bilangan bulat aman yang didukung");
  }
  if (n === 0) return "nol rupiah";
  const hasil = baca(Math.abs(n));
  return `${n < 0 ? "minus " : ""}${hasil} rupiah`;
}

/**
 * Memformat angka berhingga menjadi format Rupiah Indonesia (contoh: `"Rp1.250.000"`, `"-Rp5.000"`).
 */
export function rupiah(n: number): string {
  if (typeof n !== "number") {
    throw new TypeError("Input harus berupa number");
  }
  if (!Number.isFinite(n)) {
    throw new RangeError("Input harus berupa angka berhingga");
  }
  if (n === 0) return "Rp0";
  const formatted = new Intl.NumberFormat("id-ID").format(Math.abs(n));
  return n < 0 ? `-Rp${formatted}` : `Rp${formatted}`;
}
