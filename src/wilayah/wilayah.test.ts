import { describe, expect, it } from "vitest";
import {
  cariWilayah,
  getKabKota,
  getProvinsi,
  listKabKota,
  listProvinsi,
} from "./index";

describe("data integritas wilayah", () => {
  it("memuat tepat 38 provinsi dan 514 kabupaten/kota (416 kabupaten + 98 kota)", () => {
    const provs = listProvinsi();
    const kabs = listKabKota();

    expect(provs).toHaveLength(38);
    expect(kabs).toHaveLength(514);
    expect(kabs.filter((k) => k.jenis === "kabupaten")).toHaveLength(416);
    expect(kabs.filter((k) => k.jenis === "kota")).toHaveLength(98);

    const provCodes = new Set(provs.map((p) => p.kode));
    expect(provCodes.size).toBe(38);

    const kabCodes = new Set<string>();
    for (const k of kabs) {
      expect(k.kode).toMatch(/^\d{2}\.\d{2}$/);
      expect(provCodes.has(k.provinsiKode)).toBe(true);
      expect(k.kode.startsWith(`${k.provinsiKode}.`)).toBe(true);
      expect(kabCodes.has(k.kode)).toBe(false);
      kabCodes.add(k.kode);
    }
  });

  it("mengembalikan salinan baru sehingga mutasi pemanggil tidak merusak data", () => {
    const provs = listProvinsi();
    (provs[0] as { nama: string }).nama = "Diubah";
    provs.pop();
    expect(listProvinsi()).toHaveLength(38);
    expect(listProvinsi()[0].nama).toBe("Aceh");

    const kabs = listKabKota("31");
    (kabs[0] as { nama: string }).nama = "Diubah";
    kabs.pop();
    expect(listKabKota("31")).toHaveLength(6);
  });
});

describe("getProvinsi", () => {
  it.each([
    ["11", { kode: "11", nama: "Aceh" }],
    [" 31 ", { kode: "31", nama: "DKI Jakarta" }],
    ["34", { kode: "34", nama: "DI Yogyakarta" }],
    ["96", { kode: "96", nama: "Papua Barat Daya" }],
  ])("mengembalikan provinsi untuk %j", (kode, expected) => {
    expect(getProvinsi(kode)).toEqual(expected);
  });

  it.each([["00"], ["97"], ["99"], ["1"], ["311"], [""], ["ab"]])(
    "mengembalikan null untuk kode tidak dikenal %j",
    (kode) => {
      expect(getProvinsi(kode)).toBeNull();
    }
  );
});

describe("getKabKota dan listKabKota", () => {
  it.each([
    [
      "31.71",
      {
        kode: "31.71",
        provinsiKode: "31",
        nama: "Kota Administrasi Jakarta Pusat",
        jenis: "kota",
      },
    ],
    [
      "3171",
      {
        kode: "31.71",
        provinsiKode: "31",
        nama: "Kota Administrasi Jakarta Pusat",
        jenis: "kota",
      },
    ],
    [
      " 9671 ",
      {
        kode: "96.71",
        provinsiKode: "96",
        nama: "Kota Sorong",
        jenis: "kota",
      },
    ],
    [
      "32.04",
      {
        kode: "32.04",
        provinsiKode: "32",
        nama: "Kabupaten Bandung",
        jenis: "kabupaten",
      },
    ],
    [
      "1602",
      {
        kode: "16.02",
        provinsiKode: "16",
        nama: "Kabupaten Ogan Komering Ilir",
        jenis: "kabupaten",
      },
    ],
  ])("mengembalikan kabupaten/kota untuk %j", (kode, expected) => {
    expect(getKabKota(kode)).toEqual(expected);
  });

  it.each([["31.99"], ["99.01"], ["31.7"], ["31-71"], [""], ["abcd"]])(
    "mengembalikan null untuk kode tidak dikenal/invalid %j",
    (kode) => {
      expect(getKabKota(kode)).toBeNull();
    }
  );

  it("listKabKota memfilter per provinsi dan mengembalikan [] jika tidak dikenal", () => {
    expect(listKabKota("31")).toHaveLength(6);
    expect(listKabKota("96")).toHaveLength(6);
    expect(listKabKota("99")).toEqual([]);
    expect(listKabKota("abc")).toEqual([]);
  });
});

describe("cariWilayah", () => {
  it("mencari case-insensitive, mendukung batas default 20 dan batas kustom", () => {
    const sorong = cariWilayah("sorong");
    expect(sorong).toEqual([
      {
        tingkat: "kabupaten",
        kode: "96.01",
        provinsiKode: "96",
        nama: "Kabupaten Sorong",
      },
      {
        tingkat: "kabupaten",
        kode: "96.02",
        provinsiKode: "96",
        nama: "Kabupaten Sorong Selatan",
      },
      {
        tingkat: "kota",
        kode: "96.71",
        provinsiKode: "96",
        nama: "Kota Sorong",
      },
    ]);

    const jakarta = cariWilayah("jakarta");
    expect(jakarta[0]).toEqual({
      tingkat: "provinsi",
      kode: "31",
      nama: "DKI Jakarta",
    });
    expect(jakarta).toHaveLength(6);

    expect(cariWilayah("kabupaten").length).toBe(20);
    expect(cariWilayah("kabupaten", { batas: 5 })).toHaveLength(5);
    expect(cariWilayah("")).toEqual([]);
    expect(cariWilayah("   ")).toEqual([]);
  });

  it("validasi error untuk input non-string dan batas tidak valid", () => {
    expect(() => getProvinsi(null as unknown as string)).toThrow(TypeError);
    expect(() => getKabKota(123 as unknown as string)).toThrow(TypeError);
    expect(() => listKabKota(31 as unknown as string)).toThrow(TypeError);
    expect(() => cariWilayah(null as unknown as string)).toThrow(TypeError);
    expect(() => cariWilayah("bandung", { batas: "5" as unknown as number })).toThrow(TypeError);
    expect(() => cariWilayah("bandung", { batas: 0 })).toThrow(RangeError);
    expect(() => cariWilayah("bandung", { batas: -1 })).toThrow(RangeError);
    expect(() => cariWilayah("bandung", { batas: 1.5 })).toThrow(RangeError);
  });
});
