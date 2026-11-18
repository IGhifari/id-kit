import { describe, expect, it } from "vitest";
import { detectOperator, OPERATOR_PREFIXES } from "./operator";

describe("OPERATOR_PREFIXES", () => {
  it("tidak memiliki awalan ganda dan seluruh awalan tepat 4 digit berawalan 08", () => {
    const seen = new Set<string>();
    for (const entry of OPERATOR_PREFIXES) {
      expect(entry.prefix).toMatch(/^08\d{2}$/);
      expect(seen.has(entry.prefix)).toBe(false);
      seen.add(entry.prefix);
    }
  });
});

describe("detectOperator", () => {
  it.each([
    ["0812-3456-789", "Telkomsel", "Telkomsel", "0812"],
    ["+62 812 3456 789", "Telkomsel", "Telkomsel", "0812"],
    ["6285151234567", "Telkomsel", "Telkomsel", "0851"],
    ["0857-1234-5678", "IM3", "Indosat Ooredoo Hutchison", "0857"],
    ["+62 815 1234 5678", "IM3", "Indosat Ooredoo Hutchison", "0815"],
    ["628561234567", "IM3", "Indosat Ooredoo Hutchison", "0856"],
    ["0895-1234-5678", "Tri", "Indosat Ooredoo Hutchison", "0895"],
    ["+6289612345678", "Tri", "Indosat Ooredoo Hutchison", "0896"],
    ["62 899 1234 5678", "Tri", "Indosat Ooredoo Hutchison", "0899"],
    ["0817-1234-567", "XL", "XLSmart", "0817"],
    ["+6287712345678", "XL", "XLSmart", "0877"],
    ["6285912345678", "XL", "XLSmart", "0859"],
    ["0838-1234-5678", "AXIS", "XLSmart", "0838"],
    ["+62 831-1234-5678", "AXIS", "XLSmart", "0831"],
    ["628321234567", "AXIS", "XLSmart", "0832"],
    ["0881-1234-5678", "Smartfren", "XLSmart", "0881"],
    ["+6288812345678", "Smartfren", "XLSmart", "0888"],
    ["62 889-1234-5678", "Smartfren", "XLSmart", "0889"],
  ] as const)(
    "mendeteksi operator asal untuk nomor fiktif %s",
    (input, operator, grup, prefix) => {
      expect(detectOperator(input)).toEqual({
        valid: true,
        operator,
        grup,
        prefix,
      });
    }
  );

  it.each([
    ["081012345678"],
    ["084112345678"],
    ["087012345678"],
    ["082812345678"],
    ["086812345678"],
    ["083412345678"],
    ["083512345678"],
    ["083612345678"],
    ["083712345678"],
    ["087912345678"],
    ["089312345678"],
    ["089412345678"],
  ])("menolak awalan tidak dikenal, dicabut, atau belum terverifikasi: %s", (input) => {
    expect(detectOperator(input)).toEqual({
      valid: false,
      alasan: "awalan-tidak-dikenal",
    });
  });

  it.each([
    [""],
    ["   "],
    ["021-555-1234"],
    ["12345"],
    ["0812345"],
    ["bukan-nomor"],
  ])("menolak format tidak valid atau telepon rumah: %j", (input) => {
    expect(detectOperator(input)).toEqual({
      valid: false,
      alasan: "format",
    });
  });

  it.each([[null], [undefined], [8123456789], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      expect(() => detectOperator(badInput as unknown as string)).toThrow(TypeError);
      try {
        detectOperator(badInput as unknown as string);
      } catch (err) {
        expect((err as Error).message).not.toContain(String(badInput));
      }
    }
  );
});
