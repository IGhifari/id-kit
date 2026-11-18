import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidNITKU, isValidNPWP, parseNITKU, parseNPWP } from "./index";

describe("parseNPWP", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["01.234.567.8-901.000", "legacy-15", "012345678901000"],
    ["123456789012345", "legacy-15", "123456789012345"],
    ["3171011505900001", "nik", "3171011505900001"],
    ["3201.0255.0590.0002", "nik", "3201025505900002"],
    ["0012345678901000", "badan-awalan-0", "0012345678901000"],
    ["012.345.678.9-012.000", "badan-awalan-0", "0123456789012000"],
    ["9912345678901234", "16-digit-lainnya", "9912345678901234"],
    ["3171013205900001", "16-digit-lainnya", "3171013205900001"],
  ] as const)("mem-parse NPWP fiktif valid: %s -> %s", (input, jenis, digit) => {
    expect(parseNPWP(input)).toEqual({ valid: true, jenis, digit });
    expect(isValidNPWP(input)).toBe(true);
  });

  it.each([
    ["", "panjang"],
    ["  .- ", "panjang"],
    ["12345678901234", "panjang"],
    ["12345678901234567", "panjang"],
    ["0012345678901000000000", "panjang"],
    ["01.234.567.8-901.00a", "bukan-angka"],
    ["317101150590000X", "bukan-angka"],
    ["12345/6789012345", "bukan-angka"],
  ] as const)("menolak input tidak valid %j dengan alasan %s", (input, alasan) => {
    expect(parseNPWP(input)).toEqual({ valid: false, alasan });
    expect(isValidNPWP(input)).toBe(false);
  });

  it.each([[null], [undefined], [123456789012345], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      for (const fn of [parseNPWP, isValidNPWP]) {
        expect(() => fn(badInput as unknown as string)).toThrow(TypeError);
        try {
          fn(badInput as unknown as string);
        } catch (err) {
          expect((err as Error).message).not.toContain(String(badInput));
        }
      }
    }
  );
});

describe("parseNITKU", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [
      "0012345678901000000000",
      {
        valid: true,
        digit: "0012345678901000000000",
        npwpInduk: "0012345678901000",
        jenisInduk: "badan-awalan-0",
        kodeLokasi: "000000",
        isPusat: true,
      },
    ],
    [
      "3171011505900001-000001",
      {
        valid: true,
        digit: "3171011505900001000001",
        npwpInduk: "3171011505900001",
        jenisInduk: "nik",
        kodeLokasi: "000001",
        isPusat: false,
      },
    ],
    [
      "9912.3456.7890.1234 000002",
      {
        valid: true,
        digit: "9912345678901234000002",
        npwpInduk: "9912345678901234",
        jenisInduk: "16-digit-lainnya",
        kodeLokasi: "000002",
        isPusat: false,
      },
    ],
  ])("mem-parse NITKU fiktif valid: %s", (input, expected) => {
    expect(parseNITKU(input)).toEqual(expected);
    expect(isValidNITKU(input)).toBe(true);
  });

  it.each([
    ["", "panjang"],
    ["0012345678901000", "panjang"],
    ["001234567890100000000", "panjang"],
    ["00123456789010000000001", "panjang"],
    ["0012345678901000-00000a", "bukan-angka"],
  ] as const)("menolak NITKU tidak valid %j dengan alasan %s", (input, alasan) => {
    expect(parseNITKU(input)).toEqual({ valid: false, alasan });
    expect(isValidNITKU(input)).toBe(false);
  });

  it.each([[null], [undefined], [123], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      for (const fn of [parseNITKU, isValidNITKU]) {
        expect(() => fn(badInput as unknown as string)).toThrow(TypeError);
        try {
          fn(badInput as unknown as string);
        } catch (err) {
          expect((err as Error).message).not.toContain(String(badInput));
        }
      }
    }
  );
});
