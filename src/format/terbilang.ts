const SATUAN = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam",
    "tujuh", "delapan", "sembilan", "sepuluh", "sebelas",
  ];
  const SKALA: [number, string][] = [
    [1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"], [1e3, "ribu"],
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
      if (n >= nilai) return gabung(`${baca(Math.floor(n / nilai))} ${nama}`, n % nilai);
    }
    return "";
}

export function terbilang(n: number): string {
    if (!Number.isSafeInteger(n)) throw new RangeError("Hanya bilangan bulat yang didukung");
    if (n === 0) return "nol rupiah";
    const hasil = baca(Math.abs(n));
    return `${n < 0 ? "minus " : ""}${hasil} rupiah`;
}

export function rupiah(n: number): string {
    return "Rp" + new Intl.NumberFormat("id-ID").format(n);
}