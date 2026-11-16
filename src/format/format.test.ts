import { describe, it, expect } from "vitest";
import { terbilang, rupiah } from "./index";

describe("terbilang", () => {
  it.each([
    [0, "nol rupiah"],
    [11, "sebelas rupiah"],
    [100, "seratus rupiah"],
    [1000, "seribu rupiah"],
    [2015, "dua ribu lima belas rupiah"],
    [1250000, "satu juta dua ratus lima puluh ribu rupiah"],
    [-5, "minus lima rupiah"],
  ])("%i", (input, expected) => {
    expect(terbilang(input)).toBe(expected);
  });
});

describe("rupiah", () => {
  it("memakai titik sebagai pemisah ribuan", () => {
    expect(rupiah(1250000)).toBe("Rp1.250.000");
  });
});