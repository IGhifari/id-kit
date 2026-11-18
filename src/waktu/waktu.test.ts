import { describe, expect, it } from "vitest";
import {
  formatTanggal,
  formatTanggalWaktu,
  formatWaktu,
  keZonaWaktu,
  zonaWaktuProvinsi,
  type ZonaWaktu,
} from "./index";

describe("keZonaWaktu dan konversi antar-WIB/WITA/WIT", () => {
  it.each([
    [
      "2026-11-18T13:35:10Z",
      "WIB",
      {
        tahun: 2026,
        bulan: 11,
        tanggal: 18,
        hari: 3,
        jam: 20,
        menit: 35,
        detik: 10,
        zona: "WIB",
        offset: "+07:00",
        iso: "2026-11-18T20:35:10+07:00",
      },
    ],
    [
      "2026-11-18T13:35:10Z",
      "WITA",
      {
        tahun: 2026,
        bulan: 11,
        tanggal: 18,
        hari: 3,
        jam: 21,
        menit: 35,
        detik: 10,
        zona: "WITA",
        offset: "+08:00",
        iso: "2026-11-18T21:35:10+08:00",
      },
    ],
    [
      "2026-11-18T13:35:10Z",
      "WIT",
      {
        tahun: 2026,
        bulan: 11,
        tanggal: 18,
        hari: 3,
        jam: 22,
        menit: 35,
        detik: 10,
        zona: "WIT",
        offset: "+09:00",
        iso: "2026-11-18T22:35:10+09:00",
      },
    ],
    [
      "2026-11-18T22:00:00+07:00",
      "WIT",
      {
        tahun: 2026,
        bulan: 11,
        tanggal: 19,
        hari: 4,
        jam: 0,
        menit: 0,
        detik: 0,
        zona: "WIT",
        offset: "+09:00",
        iso: "2026-11-19T00:00:00+09:00",
      },
    ],
    [
      "2026-11-19T00:30:00+09:00",
      "WIB",
      {
        tahun: 2026,
        bulan: 11,
        tanggal: 18,
        hari: 3,
        jam: 22,
        menit: 30,
        detik: 0,
        zona: "WIB",
        offset: "+07:00",
        iso: "2026-11-18T22:30:00+07:00",
      },
    ],
  ] as const)("mengonversi %s ke %s", (input, zona, expected) => {
    expect(keZonaWaktu(input, zona)).toEqual(expected);
    expect(keZonaWaktu(new Date(input), zona)).toEqual(expected);
  });

  it.each([
    ["2026-11-18T16:59:59Z", "WIB", "2026-11-18T23:59:59+07:00"],
    ["2026-11-18T17:00:00Z", "WIB", "2026-11-19T00:00:00+07:00"],
    ["2026-04-30T17:00:00Z", "WIB", "2026-05-01T00:00:00+07:00"],
    ["2026-12-31T17:00:00Z", "WIB", "2027-01-01T00:00:00+07:00"],
    ["2024-02-28T17:00:00Z", "WIB", "2024-02-29T00:00:00+07:00"],
    ["2025-02-28T17:00:00Z", "WIB", "2025-03-01T00:00:00+07:00"],
    ["2000-02-28T16:00:00Z", "WITA", "2000-02-29T00:00:00+08:00"],
  ] as const)("menangani batas hari, bulan, tahun, dan kabisat: %s (%s)", (input, zona, iso) => {
    expect(keZonaWaktu(input, zona).iso).toBe(iso);
  });
});

describe("formatTanggal, formatWaktu, formatTanggalWaktu", () => {
  it.each([
    ["2026-11-18", undefined, "18 November 2026"],
    ["2026-11-18", { denganHari: true }, "Rabu, 18 November 2026"],
    ["2026-08-17", { denganHari: true, singkat: true }, "Sen, 17 Agu 2026"],
    ["2024-02-29", { denganHari: true }, "Kamis, 29 Februari 2024"],
    ["2026-11-18T17:00:00Z", { zona: "WIB", denganHari: true }, "Kamis, 19 November 2026"],
    ["2026-12-31T16:30:00Z", { zona: "WITA", denganHari: true }, "Jumat, 1 Januari 2027"],
    [new Date("2026-05-01T00:00:00+07:00"), { singkat: true }, "1 Mei 2026"],
  ] as const)("formatTanggal(%j)", (input, options, expected) => {
    expect(formatTanggal(input, options)).toBe(expected);
  });

  it.each([
    ["2026-11-18T13:35:09Z", undefined, "20:35 WIB"],
    ["2026-11-18T13:35:09Z", { denganDetik: true }, "20:35:09 WIB"],
    ["2026-11-18T13:35:09Z", { zona: "WITA", tampilkanZona: false }, "21:35"],
    ["2026-11-18T13:35:09Z", { zona: "WIT", denganDetik: true }, "22:35:09 WIT"],
    [new Date("2026-11-18T00:05:00Z"), { zona: "WIB" }, "07:05 WIB"],
  ] as const)("formatWaktu(%j)", (input, options, expected) => {
    expect(formatWaktu(input, options)).toBe(expected);
  });

  it.each([
    ["2026-11-18T13:35:09Z", undefined, "18 November 2026, 20:35 WIB"],
    [
      "2026-12-31T17:05:09Z",
      { zona: "WIB", denganHari: true, singkat: true, denganDetik: true },
      "Jum, 1 Jan 2027, 00:05:09 WIB",
    ],
    [
      "2026-11-18T15:00:00+07:00",
      { zona: "WIT", denganHari: true, tampilkanZona: false },
      "Rabu, 18 November 2026, 17:00",
    ],
  ] as const)("formatTanggalWaktu(%j)", (input, options, expected) => {
    expect(formatTanggalWaktu(input, options)).toBe(expected);
  });
});

describe("penanganan error", () => {
  it.each([
    ["2026-11-18T20:35:00"],
    ["2026-02-30T10:00:00Z"],
    ["2026-04-31"],
    ["2025-02-29"],
    ["18-11-2026"],
    [""],
    ["bukan-tanggal"],
  ])("formatTanggal melempar RangeError untuk string invalid/tanpa offset: %j", (bad) => {
    expect(() => formatTanggal(bad)).toThrow(RangeError);
  });

  it.each([
    ["2026-11-18"],
    ["2026-11-18T20:35:00"],
    ["2026-02-29T10:00:00Z"],
    [""],
  ])("formatWaktu, formatTanggalWaktu, dan keZonaWaktu menolak %j dengan RangeError", (bad) => {
    expect(() => formatWaktu(bad)).toThrow(RangeError);
    expect(() => formatTanggalWaktu(bad)).toThrow(RangeError);
    expect(() => keZonaWaktu(bad, "WIB")).toThrow(RangeError);
  });

  it("melempar RangeError untuk Invalid Date dan zona tidak valid dengan pesan konsisten", () => {
    const invalidDate = new Date("invalid");
    expect(() => formatTanggal(invalidDate)).toThrow(RangeError);
    expect(() => keZonaWaktu(invalidDate, "WIB")).toThrow(RangeError);

    expect(() => keZonaWaktu("2026-11-18T10:00:00Z", "UTC" as ZonaWaktu)).toThrow(RangeError);
    expect(() => formatTanggal("2026-11-18", { zona: "GMT" as ZonaWaktu })).toThrow(RangeError);
  });

  it.each([[null], [undefined], [123456], [{}]])(
    "melempar TypeError untuk input dan kode provinsi non-didukung",
    (bad) => {
      expect(() => formatTanggal(bad as unknown as string)).toThrow(TypeError);
      expect(() => formatWaktu(bad as unknown as string)).toThrow(TypeError);
      expect(() => formatTanggalWaktu(bad as unknown as string)).toThrow(TypeError);
      expect(() => keZonaWaktu(bad as unknown as string, "WIB")).toThrow(TypeError);
      expect(() => zonaWaktuProvinsi(bad as unknown as string)).toThrow(TypeError);
    }
  );
});

describe("zonaWaktuProvinsi (38 kode provinsi Kemendagri)", () => {
  it.each([
    ["11", "WIB"],
    ["12", "WIB"],
    ["13", "WIB"],
    ["14", "WIB"],
    ["15", "WIB"],
    ["16", "WIB"],
    ["17", "WIB"],
    ["18", "WIB"],
    ["19", "WIB"],
    ["21", "WIB"],
    ["31", "WIB"],
    ["32", "WIB"],
    ["33", "WIB"],
    ["34", "WIB"],
    ["35", "WIB"],
    ["36", "WIB"],
    ["61", "WIB"],
    ["62", "WIB"],
    ["51", "WITA"],
    ["52", "WITA"],
    ["53", "WITA"],
    ["63", "WITA"],
    ["64", "WITA"],
    ["65", "WITA"],
    ["71", "WITA"],
    ["72", "WITA"],
    ["73", "WITA"],
    ["74", "WITA"],
    ["75", "WITA"],
    ["76", "WITA"],
    ["81", "WIT"],
    ["82", "WIT"],
    ["91", "WIT"],
    ["92", "WIT"],
    ["93", "WIT"],
    ["94", "WIT"],
    ["95", "WIT"],
    ["96", "WIT"],
  ] as const)("kode provinsi %s -> %s", (kode, zona) => {
    expect(zonaWaktuProvinsi(kode)).toBe(zona);
  });

  it("menerima spasi di tepi dan mengembalikan null untuk kode tidak dikenal", () => {
    expect(zonaWaktuProvinsi(" 31 ")).toBe("WIB");
    expect(zonaWaktuProvinsi("00")).toBeNull();
    expect(zonaWaktuProvinsi("97")).toBeNull();
    expect(zonaWaktuProvinsi("99")).toBeNull();
    expect(zonaWaktuProvinsi("1")).toBeNull();
    expect(zonaWaktuProvinsi("")).toBeNull();
  });
});
