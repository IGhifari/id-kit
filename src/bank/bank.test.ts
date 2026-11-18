import { describe, expect, it } from "vitest";
import { getBank, listBank } from "./index";

describe("listBank", () => {
  it("berisi tepat 31 bank tanpa kode ganda dan semua kode tepat 3 digit angka", () => {
    const banks = listBank();
    expect(banks).toHaveLength(31);

    const seen = new Set<string>();
    for (const bank of banks) {
      expect(bank.kode).toMatch(/^\d{3}$/);
      expect(seen.has(bank.kode)).toBe(false);
      seen.add(bank.kode);
    }
  });
});

describe("getBank", () => {
  it.each([
    ["002", { kode: "002", nama: "Bank Rakyat Indonesia (BRI)" }],
    ["008", { kode: "008", nama: "Bank Mandiri" }],
    [" 014 ", { kode: "014", nama: "Bank Central Asia (BCA)" }],
    ["028", { kode: "028", nama: "OCBC" }],
    ["213", { kode: "213", nama: "Bank SMBC Indonesia" }],
    ["441", { kode: "441", nama: "KB Bank" }],
    ["451", { kode: "451", nama: "Bank Syariah Indonesia (BSI)" }],
    ["535", { kode: "535", nama: "SeaBank Indonesia" }],
    ["542", { kode: "542", nama: "Bank Jago" }],
  ])("mengembalikan data bank untuk kode dikenal %j", (kode, expected) => {
    expect(getBank(kode)).toEqual(expected);
  });

  it.each([
    ["484"],
    ["950"],
    ["422"],
    ["427"],
    ["145"],
    ["999"],
    [""],
    ["   "],
    ["14"],
    ["0014"],
    ["01a"],
    ["abc"],
  ])("mengembalikan null untuk kode tidak dikenal atau bukan 3 digit %j", (kode) => {
    expect(getBank(kode)).toBeNull();
  });

  it.each([[null], [undefined], [14], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      expect(() => getBank(badInput as unknown as string)).toThrow(TypeError);
      try {
        getBank(badInput as unknown as string);
      } catch (err) {
        expect((err as Error).message).not.toContain(String(badInput));
      }
    }
  );
});
