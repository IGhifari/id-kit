import { describe, expect, it } from "vitest";
import { parseRupiah, rupiahSingkat } from "./index";

describe("parseRupiah", () => {
  it.each([
    ["Rp1.250.000", 1250000],
    ["Rp 1.250.000", 1250000],
    ["Rp. 1.250.000", 1250000],
    ["rp500.000", 500000],
    ["Rp 1.250.000,50", 1250000.5],
    ["Rp. 1.250.000,-", 1250000],
    ["Rp0", 0],
    ["-Rp0", 0],
    ["-Rp5.000", -5000],
    ["Rp-5.000", -5000],
    ["- Rp 5.000,25", -5000.25],
    ["1250000", 1250000],
    ["1.250.000", 1250000],
    ["0,75", 0.75],
    ["  Rp 2.500,-  ", 2500],
  ])("mengurai %j -> %s", (input, expected) => {
    const res = parseRupiah(input);
    expect(res).toBe(expected);
    if (expected === 0) {
      expect(Object.is(res, 0)).toBe(true);
    }
  });

  it.each([
    [""],
    ["   "],
    ["Rp"],
    ["Rp."],
    ["Rp-"],
    ["-Rp-5.000"],
    ["Rp1.50"],
    ["1.50"],
    ["1.23.456"],
    ["1234.567"],
    ["Rp1.000,"],
    ["Rp1.000,-50"],
    ["Rp1.000,50,00"],
    ["USD 100"],
    ["Rp1.250abc"],
  ])("menolak format tidak valid %j dengan null", (input) => {
    expect(parseRupiah(input)).toBeNull();
  });

  it.each([[null], [undefined], [1250000], [{}]])(
    "melempar TypeError untuk input non-string",
    (bad) => {
      expect(() => parseRupiah(bad as unknown as string)).toThrow(TypeError);
    }
  );
});

describe("rupiahSingkat", () => {
  it.each([
    [0, undefined, "Rp0"],
    [-0, undefined, "Rp0"],
    [-0.01, { desimal: 1 }, "Rp0"],
    [950, undefined, "Rp950"],
    [999.96, { desimal: 1 }, "Rp1 rb"],
    [1_000, undefined, "Rp1 rb"],
    [1_500, undefined, "Rp1,5 rb"],
    [999_950, { desimal: 1 }, "Rp1 jt"],
    [1_000_000, undefined, "Rp1 jt"],
    [1_250_000, undefined, "Rp1,3 jt"],
    [1_250_000, { desimal: 2 }, "Rp1,25 jt"],
    [1_250_000, { desimal: 0 }, "Rp1 jt"],
    [-1_500_000, undefined, "-Rp1,5 jt"],
    [999_950_000, { desimal: 1 }, "Rp1 M"],
    [2_500_000_000, undefined, "Rp2,5 M"],
    [999_950_000_000, { desimal: 1 }, "Rp1 T"],
    [1_200_000_000_000, undefined, "Rp1,2 T"],
    [1_000_000_000_000_000, undefined, "Rp1.000 T"],
    [-2_500_000_000, undefined, "-Rp2,5 M"],
  ] as const)("memformat %s dengan opsi %j -> %s", (input, options, expected) => {
    expect(rupiahSingkat(input, options)).toBe(expected);
  });

  it.each([
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    [Number.NEGATIVE_INFINITY, undefined],
    [1_000, { desimal: -1 }],
    [1_000, { desimal: 7 }],
    [1_000, { desimal: 1.5 }],
    [1_000, { desimal: Number.NaN }],
  ])("melempar RangeError untuk angka/opsi tidak valid (%s, %j)", (n, opts) => {
    expect(() => rupiahSingkat(n, opts)).toThrow(RangeError);
  });

  it("melempar TypeError untuk tipe input atau opsi salah", () => {
    expect(() => rupiahSingkat("1000" as unknown as number)).toThrow(TypeError);
    expect(() => rupiahSingkat(null as unknown as number)).toThrow(TypeError);
    expect(() => rupiahSingkat(1000, null as unknown as { desimal: number })).toThrow(TypeError);
    expect(() => rupiahSingkat(1000, { desimal: "1" as unknown as number })).toThrow(TypeError);
  });
});
