import { describe, it, expect } from "vitest";
import { terbilang, rupiah } from "./index";

describe("terbilang", () => {
  it.each([
    [0, "nol rupiah"],
    [-0, "nol rupiah"],
    [11, "sebelas rupiah"],
    [100, "seratus rupiah"],
    [1000, "seribu rupiah"],
    [2015, "dua ribu lima belas rupiah"],
    [1250000, "satu juta dua ratus lima puluh ribu rupiah"],
    [1_000_000_000, "satu miliar rupiah"],
    [1_000_000_000_000, "satu triliun rupiah"],
    [1_000_000_000_000_000, "satu kuadriliun rupiah"],
    [
      2_000_000_000_000_001,
      "dua kuadriliun satu rupiah",
    ],
    [-5, "minus lima rupiah"],
  ])("%i", (input, expected) => {
    expect(terbilang(input)).toBe(expected);
  });

  it.each([
    [1.5],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
    [Number.NEGATIVE_INFINITY],
    [Number.MAX_SAFE_INTEGER + 1],
  ])("melempar RangeError untuk %s", (bad) => {
    expect(() => terbilang(bad)).toThrow(RangeError);
  });

  it.each([[null], [undefined], ["1000"], [{}]])(
    "melempar TypeError untuk input non-number",
    (bad) => {
      expect(() => terbilang(bad as unknown as number)).toThrow(TypeError);
    }
  );
});

describe("rupiah", () => {
  it.each([
    [0, "Rp0"],
    [-0, "Rp0"],
    [1250000, "Rp1.250.000"],
    [-5000, "-Rp5.000"],
    [-1250000, "-Rp1.250.000"],
    [1250.5, "Rp1.250,5"],
  ])("memformat %s -> %s", (input, expected) => {
    expect(rupiah(input)).toBe(expected);
  });

  it.each([[Number.NaN], [Number.POSITIVE_INFINITY], [Number.NEGATIVE_INFINITY]])(
    "melempar RangeError untuk %s",
    (bad) => {
      expect(() => rupiah(bad)).toThrow(RangeError);
    }
  );

  it.each([[null], [undefined], ["5000"], [{}]])(
    "melempar TypeError untuk input non-number",
    (bad) => {
      expect(() => rupiah(bad as unknown as number)).toThrow(TypeError);
    }
  );
});
