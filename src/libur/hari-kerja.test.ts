import { describe, expect, it } from "vitest";
import { hitungHariKerja, tambahHariKerja } from "./index";

describe("hitungHariKerja", () => {
  it.each([
    ["2026-08-18", "2026-08-18", undefined, { valid: true, hariKerja: 1, totalHari: 1 }],
    ["2026-08-17", "2026-08-17", undefined, { valid: true, hariKerja: 0, totalHari: 1 }],
    ["2026-08-15", "2026-08-15", undefined, { valid: true, hariKerja: 0, totalHari: 1 }],
    ["2026-08-15", "2026-08-15", { sabtuKerja: true }, { valid: true, hariKerja: 1, totalHari: 1 }],
    // 14 Agu (Jum), 15 Agu (Sab), 16 Agu (Min), 17 Agu (Sen - Kemerdekaan), 18 Agu (Sel)
    ["2026-08-14", "2026-08-18", undefined, { valid: true, hariKerja: 2, totalHari: 5 }],
    ["2026-08-14", "2026-08-18", { sabtuKerja: true }, { valid: true, hariKerja: 3, totalHari: 5 }],
    // 2026-12-24 adalah cuti bersama (Kamis), 25 Des libur nasional (Jumat)
    ["2026-12-23", "2026-12-25", undefined, { valid: true, hariKerja: 1, totalHari: 3 }],
    ["2026-12-23", "2026-12-25", { sertakanCutiBersama: false }, { valid: true, hariKerja: 2, totalHari: 3 }],
    // Lintas tahun 2025 -> 2026 (31 Des 2025 Rab, 1 Jan 2026 Kam [libur], 2 Jan 2026 Jum)
    ["2025-12-31", "2026-01-02", undefined, { valid: true, hariKerja: 2, totalHari: 3 }],
  ] as const)("menghitung rentang %s s/d %s (%j)", (mulai, selesai, options, expected) => {
    expect(hitungHariKerja(mulai, selesai, options)).toEqual(expected);
  });

  it.each([
    ["2024-12-30", "2025-01-02", 2024],
    ["2027-12-28", "2028-01-03", 2028],
    ["2099-01-01", "2099-01-05", 2099],
  ])("mengembalikan data-tidak-tersedia untuk rentang %s..%s (tahun %i)", (mulai, selesai, tahun) => {
    expect(hitungHariKerja(mulai, selesai)).toEqual({
      valid: false,
      alasan: "data-tidak-tersedia",
      tahun,
    });
  });

  it("melempar error sesuai tipe untuk input dan rentang tidak valid", () => {
    expect(() => hitungHariKerja("2026-08-18", "2026-08-17")).toThrow(RangeError);
    expect(() => hitungHariKerja("2026-02-29", "2026-03-01")).toThrow(RangeError);
    expect(() => hitungHariKerja("2026-08-10", "2026-8-12")).toThrow(RangeError);
    expect(() => hitungHariKerja(null as unknown as string, "2026-08-10")).toThrow(TypeError);
    expect(() => hitungHariKerja("2026-08-10", 123 as unknown as string)).toThrow(TypeError);
    expect(() =>
      hitungHariKerja("2026-08-10", "2026-08-12", { sabtuKerja: "ya" as unknown as boolean })
    ).toThrow(TypeError);
  });
});

describe("tambahHariKerja", () => {
  it.each([
    ["2026-08-14", 0, undefined, { valid: true, tanggal: "2026-08-14" }],
    // 14 Agu (Jum) + 1 hari kerja melewati 15 (Sab), 16 (Min), 17 (Sen - libur) -> 18 Agu (Sel)
    ["2026-08-14", 1, undefined, { valid: true, tanggal: "2026-08-18" }],
    ["2026-08-14", 1, { sabtuKerja: true }, { valid: true, tanggal: "2026-08-15" }],
    // Mundur: 18 Agu (Sel) - 1 hari kerja -> 14 Agu (Jum)
    ["2026-08-18", -1, undefined, { valid: true, tanggal: "2026-08-14" }],
    // 23 Des 2026 (Rab) + 1 melewati 24 (cuti bersama), 25 (Natal), 26 (Sab), 27 (Min) -> 28 Des (Sen)
    ["2026-12-23", 1, undefined, { valid: true, tanggal: "2026-12-28" }],
    ["2026-12-23", 1, { sertakanCutiBersama: false }, { valid: true, tanggal: "2026-12-24" }],
    // Lintas tahun 2026 -> 2027 (31 Des 2026 Kam + 1 -> 4 Jan 2027 Sen karena 1 Jan libur, 2 Sab, 3 Min)
    ["2026-12-31", 1, undefined, { valid: true, tanggal: "2027-01-04" }],
    // Mundur lintas tahun 2026 -> 2025 (2 Jan 2026 Jum - 1 -> 31 Des 2025 Rab)
    ["2026-01-02", -1, undefined, { valid: true, tanggal: "2025-12-31" }],
  ] as const)("tambahHariKerja(%s, %i, %j)", (mulai, jumlah, options, expected) => {
    expect(tambahHariKerja(mulai, jumlah, options)).toEqual(expected);
  });

  it.each([
    ["2024-12-31", 0, 2024],
    ["2025-01-02", -2, 2024],
    ["2027-12-31", 1, 2028],
    ["2099-01-01", 3, 2099],
  ])("mengembalikan data-tidak-tersedia saat %s digeser %i (tahun %i)", (mulai, jumlah, tahun) => {
    expect(tambahHariKerja(mulai, jumlah)).toEqual({
      valid: false,
      alasan: "data-tidak-tersedia",
      tahun,
    });
  });

  it("melempar error sesuai tipe untuk input tidak valid", () => {
    expect(() => tambahHariKerja("2026-04-31", 1)).toThrow(RangeError);
    expect(() => tambahHariKerja("2026-08-14", 1.5)).toThrow(RangeError);
    expect(() => tambahHariKerja("2026-08-14", Number.NaN)).toThrow(RangeError);
    expect(() => tambahHariKerja(null as unknown as string, 1)).toThrow(TypeError);
    expect(() => tambahHariKerja("2026-08-14", "1" as unknown as number)).toThrow(TypeError);
  });
});
