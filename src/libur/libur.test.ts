import { describe, expect, it } from "vitest";
import { DATA_LIBUR } from "./data";
import { cekLibur, daftarLibur, tahunTersedia } from "./index";

describe("DATA_LIBUR integritas dan jumlah", () => {
  it("memiliki tahun tersedia tepat [2025, 2026, 2027]", () => {
    expect(tahunTersedia()).toEqual([2025, 2026, 2027]);
  });

  it.each([
    [2025, 28, 17, 11],
    [2026, 25, 17, 8],
    [2027, 26, 18, 8],
  ])(
    "tahun %i memiliki total %i entri (%i libur-nasional + %i cuti-bersama)",
    (tahun, total, liburNasional, cutiBersama) => {
      const items = daftarLibur(tahun);
      expect(items).not.toBeNull();
      expect(items).toHaveLength(total);
      expect(items!.filter((x) => x.jenis === "libur-nasional")).toHaveLength(liburNasional);
      expect(items!.filter((x) => x.jenis === "cuti-bersama")).toHaveLength(cutiBersama);
    }
  );

  it("seluruh entri memiliki tanggal kalender valid, unik per tahun, terurut naik, dan jenis sah", () => {
    for (const [yearKey, items] of Object.entries(DATA_LIBUR)) {
      const year = Number(yearKey);
      const seen = new Set<string>();
      let prev = "";

      for (const item of items) {
        expect(item.tanggal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(item.tanggal.startsWith(`${yearKey}-`)).toBe(true);
        expect(item.nama.trim().length).toBeGreaterThan(0);
        expect(["libur-nasional", "cuti-bersama"]).toContain(item.jenis);

        const m = Number(item.tanggal.slice(5, 7));
        const d = Number(item.tanggal.slice(8, 10));
        const dt = new Date(Date.UTC(year, m - 1, d));
        expect(dt.getUTCFullYear()).toBe(year);
        expect(dt.getUTCMonth()).toBe(m - 1);
        expect(dt.getUTCDate()).toBe(d);

        expect(seen.has(item.tanggal)).toBe(false);
        seen.add(item.tanggal);
        expect(item.tanggal > prev).toBe(true);
        prev = item.tanggal;
      }
    }
  });
});

describe("cekLibur", () => {
  it.each([
    ["2025-01-01", { status: "libur-nasional", nama: "Tahun Baru 2025 Masehi" }],
    ["2025-08-17", { status: "libur-nasional", nama: "Proklamasi Kemerdekaan" }],
    ["2025-08-18", { status: "cuti-bersama", nama: "HUT ke-80 Kemerdekaan Republik Indonesia" }],
    ["2026-03-21", { status: "libur-nasional", nama: "Hari Raya Idulfitri 1447 Hijriah" }],
    ["2026-12-24", { status: "cuti-bersama", nama: "Kelahiran Yesus Kristus" }],
    ["2026-12-25", { status: "libur-nasional", nama: "Kelahiran Yesus Kristus" }],
    ["2027-01-05", { status: "libur-nasional", nama: "Isra Mikraj Nabi Muhammad SAW 1448 Hijriah" }],
    ["2027-03-25", { status: "cuti-bersama", nama: "Wafat Yesus Kristus" }],
    ["2027-05-01", { status: "libur-nasional", nama: "Hari Buruh Internasional" }],
    ["2027-05-18", { status: "cuti-bersama", nama: "Hari Raya Iduladha 1448 Hijriah" }],
    ["2027-05-19", { status: "cuti-bersama", nama: "Hari Raya Waisak 2571 BE" }],
    ["2027-12-26", { status: "libur-nasional", nama: "Isra Mikraj Nabi Muhammad SAW 1449 Hijriah" }],
  ])("mengembalikan status libur terverifikasi untuk %s", (tanggal, expected) => {
    expect(cekLibur(tanggal)).toEqual(expected);
  });

  it.each([["2025-02-10"], ["2026-07-15"], ["2026-12-28"], ["2027-04-01"]])(
    "mengembalikan bukan-libur untuk tanggal biasa pada tahun tersedia: %s",
    (tanggal) => {
      expect(cekLibur(tanggal)).toEqual({ status: "bukan-libur" });
    }
  );

  it.each([
    ["2010-01-01", 2010],
    ["2024-02-29", 2024],
    ["2028-01-01", 2028],
    ["2099-12-31", 2099],
    ["1000-01-01", 1000],
    ["9999-12-31", 9999],
  ])("mengembalikan data-tidak-tersedia untuk tahun tanpa data: %s", (tanggal, tahun) => {
    expect(cekLibur(tanggal)).toEqual({ status: "data-tidak-tersedia", tahun });
  });

  it.each([
    [""],
    ["   "],
    [" 2026-01-01 "],
    ["2026-1-1"],
    ["2026/01/01"],
    ["0999-01-01"],
    ["0050-01-01"],
    ["2026-00-01"],
    ["2026-13-01"],
    ["2026-04-31"],
    ["2025-02-29"],
    ["2026-02-29"],
    ["2026-01-00"],
    ["2026-01-32"],
  ])("melempar RangeError tanpa membocorkan input untuk %j", (badDate) => {
    expect(() => cekLibur(badDate)).toThrow(RangeError);
    if (badDate !== "") {
      try {
        cekLibur(badDate);
      } catch (err) {
        expect((err as Error).message).not.toContain(badDate);
      }
    }
  });

  it.each([[null], [undefined], [20260101], [new Date("2026-01-01")]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      expect(() => cekLibur(badInput as unknown as string)).toThrow(TypeError);
      try {
        cekLibur(badInput as unknown as string);
      } catch (err) {
        expect((err as Error).message).not.toContain(String(badInput));
      }
    }
  );
});

describe("daftarLibur dan tahunTersedia", () => {
  it.each([[2010], [2024], [2028], [2099]])(
    "daftarLibur mengembalikan null untuk tahun tanpa data: %i",
    (tahun) => {
      expect(daftarLibur(tahun)).toBeNull();
    }
  );

  it.each([[Number.NaN], [2026.5], [Number.POSITIVE_INFINITY]])(
    "daftarLibur melempar RangeError untuk bukan bilangan bulat: %s",
    (badYear) => {
      expect(() => daftarLibur(badYear)).toThrow(RangeError);
    }
  );

  it.each([[null], [undefined], ["2026"]])(
    "daftarLibur melempar TypeError untuk input non-number",
    (badInput) => {
      expect(() => daftarLibur(badInput as unknown as number)).toThrow(TypeError);
    }
  );

  it("mengembalikan salinan baru agar data internal tidak termutasi", () => {
    const tahun = tahunTersedia();
    tahun.push(2099);
    expect(tahunTersedia()).toEqual([2025, 2026, 2027]);

    const list = daftarLibur(2026)!;
    (list[0] as { nama: string }).nama = "Diubah";
    list.pop();
    expect(daftarLibur(2026)).toHaveLength(25);
    expect(daftarLibur(2026)![0].nama).toBe("Tahun Baru 2026 Masehi");
  });
});
