import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidNIK, parseNIK } from "./index";

describe("parseNIK", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [
      "3171011505900001",
      {
        valid: true,
        provinsiKode: "31",
        provinsi: "DKI Jakarta",
        kabKotaKode: "71",
        kecamatanKode: "01",
        tanggalLahir: "1990-05-15",
        gender: "L",
        urutan: "0001",
      },
    ],
    [
      "3201025505900002",
      {
        valid: true,
        provinsiKode: "32",
        provinsi: "Jawa Barat",
        kabKotaKode: "01",
        kecamatanKode: "02",
        tanggalLahir: "1990-05-15",
        gender: "P",
        urutan: "0002",
      },
    ],
    [
      " 3404 0141\t0101\n0009 ",
      {
        valid: true,
        provinsiKode: "34",
        provinsi: "DI Yogyakarta",
        kabKotaKode: "04",
        kecamatanKode: "01",
        tanggalLahir: "2001-01-01",
        gender: "P",
        urutan: "0009",
      },
    ],
    [
      "1901017112990003",
      {
        valid: true,
        provinsiKode: "19",
        provinsi: "Kepulauan Bangka Belitung",
        kabKotaKode: "01",
        kecamatanKode: "01",
        tanggalLahir: "1999-12-31",
        gender: "P",
        urutan: "0003",
      },
    ],
    [
      "9601010101200004",
      {
        valid: true,
        provinsiKode: "96",
        provinsi: "Papua Barat Daya",
        kabKotaKode: "01",
        kecamatanKode: "01",
        tanggalLahir: "2020-01-01",
        gender: "L",
        urutan: "0004",
      },
    ],
  ])("mem-parse NIK valid: %s", (input, expected) => {
    expect(parseNIK(input)).toEqual(expected);
    expect(isValidNIK(input)).toBe(true);
  });

  it.each([
    ["5201010101950001", "Nusa Tenggara Barat"],
    ["5301010101950001", "Nusa Tenggara Timur"],
    ["2101010101950001", "Kepulauan Riau"],
  ])("mengembalikan nama provinsi resmi Kemendagri (%s)", (input, provinsi) => {
    const res = parseNIK(input);
    expect(res).toMatchObject({ valid: true, provinsi });
  });

  it.each([
    ["3171012902240001", "2024-02-29", "L"],
    ["3171016902000001", "2000-02-29", "P"],
    ["3171012902960001", "1996-02-29", "L"],
  ])("menerima 29 Februari pada tahun kabisat: %s", (input, tanggalLahir, gender) => {
    expect(parseNIK(input)).toMatchObject({
      valid: true,
      tanggalLahir,
      gender,
    });
  });

  it.each([
    ["3171010101000001", "2000-01-01"],
    ["3171010101260001", "2026-01-01"],
    ["3171010101270001", "1927-01-01"],
    ["3171010101990001", "1999-01-01"],
  ])("menentukan batas abad YY terhadap tahun 2026: %s -> %s", (input, tanggalLahir) => {
    expect(parseNIK(input)).toMatchObject({
      valid: true,
      tanggalLahir,
    });
  });

  it.each([
    ["", "panjang"],
    ["   \t\n ", "panjang"],
    ["317101150590000", "panjang"],
    ["31710115059000012", "panjang"],
    ["317101150590000a", "bukan-angka"],
    ["317101150590000a1", "bukan-angka"],
    ["3171-0115-0590-0001", "bukan-angka"],
    ["0071011505900001", "provinsi"],
    ["9971011505900001", "provinsi"],
    ["9971019999900001", "provinsi"],
    ["3171010005900001", "tanggal"],
    ["3171013205900001", "tanggal"],
    ["3171014005900001", "tanggal"],
    ["3171017205900001", "tanggal"],
    ["3171011500900001", "tanggal"],
    ["3171011513900001", "tanggal"],
    ["3171013104900001", "tanggal"],
    ["3171013002900001", "tanggal"],
    ["3171012902230001", "tanggal"],
    ["3171016902230001", "tanggal"],
  ] as const)("menolak %j dengan alasan %s", (input, alasan) => {
    expect(parseNIK(input)).toEqual({ valid: false, alasan });
    expect(isValidNIK(input)).toBe(false);
  });

  it.each([[null], [undefined], [3171011505900001], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (bad) => {
      for (const fn of [parseNIK, isValidNIK]) {
        expect(() => fn(bad as unknown as string)).toThrow(TypeError);
        try {
          fn(bad as unknown as string);
        } catch (err) {
          expect((err as Error).message).not.toContain(String(bad));
        }
      }
    }
  );
});
