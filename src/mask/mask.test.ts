import { describe, expect, it } from "vitest";
import { mask, maskAccount, maskNIK, maskPhone } from "./index";

describe("mask", () => {
  it.each([
    ["rahasia", undefined, "*******"],
    ["12345678", { visibleStart: 2, visibleEnd: 2 }, "12****78"],
    ["12345678", { visibleStart: 3 }, "123*****"],
    ["12345678", { visibleEnd: 4 }, "****5678"],
    ["12345678", { visibleStart: 2, visibleEnd: 2, maskChar: "#" }, "12####78"],
    ["12345678", { visibleStart: 1, visibleEnd: 1, maskChar: "•" }, "1••••••8"],
    ["12345678", { visibleStart: 2, visibleEnd: 2, maskChar: "🔒" }, "12🔒🔒🔒🔒78"],
  ])("menyensor %j dengan opsi %j -> %s", (input, options, expected) => {
    const result = mask(input, options);
    expect(result).toBe(expected);
    expect(Array.from(result).length).toBe(Array.from(input).length);
  });

  it.each([
    ["123", { visibleStart: 2, visibleEnd: 2 }, "***"],
    ["1234", { visibleStart: 2, visibleEnd: 2 }, "****"],
    ["12", { visibleStart: 2, visibleEnd: 0 }, "**"],
    ["12", { visibleStart: 0, visibleEnd: 2 }, "**"],
    ["a", { visibleStart: 1, visibleEnd: 1 }, "*"],
  ])("menyensor penuh jika panjang <= visibleStart + visibleEnd (%j)", (input, options, expected) => {
    const result = mask(input, options);
    expect(result).toBe(expected);
    expect(Array.from(result).length).toBe(Array.from(input).length);
  });

  it.each([
    ["", undefined, ""],
    ["", { visibleStart: 2, visibleEnd: 2 }, ""],
    ["😀ab", undefined, "***"],
    ["😀abcd", { visibleStart: 1, visibleEnd: 1 }, "😀***d"],
    ["a😀bc🔒", { visibleStart: 1, visibleEnd: 1 }, "a***🔒"],
  ])("menangani string kosong dan Unicode code point (%j)", (input, options, expected) => {
    const result = mask(input, options);
    expect(result).toBe(expected);
    expect(Array.from(result).length).toBe(Array.from(input).length);
  });

  it.each([
    [{ visibleStart: -1 }],
    [{ visibleEnd: -1 }],
    [{ visibleStart: 1.5 }],
    [{ visibleEnd: 2.3 }],
    [{ visibleStart: Number.NaN }],
    [{ visibleEnd: Number.NaN }],
    [{ visibleStart: Number.POSITIVE_INFINITY }],
    [{ visibleEnd: Number.NEGATIVE_INFINITY }],
  ])("melempar RangeError untuk opsi hitung tidak valid: %j", (options) => {
    expect(() => mask("rahasia-uji", options)).toThrow(RangeError);
    try {
      mask("rahasia-uji", options);
    } catch (err) {
      expect((err as Error).message).not.toContain("rahasia-uji");
    }
  });

  it.each([[""], ["**"], ["ab"], ["😀a"], ["👨‍👩‍👧"]])(
    "melempar RangeError jika maskChar bukan tepat satu code point: %j",
    (maskChar) => {
      expect(() => mask("123456", { maskChar })).toThrow(RangeError);
    }
  );

  it.each([[null], [undefined], [123456], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (badInput) => {
      for (const fn of [mask, maskNIK, maskPhone, maskAccount]) {
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

describe("maskNIK", () => {
  it.each([
    ["3171011505900001", "3171********0001"],
    ["3171 0115 0590 0001", "3171********0001"],
    [" 3201\t0255\n0590 0002 ", "3201********0002"],
  ])("menyensor NIK valid fiktif: %j -> %s", (input, expected) => {
    expect(maskNIK(input)).toBe(expected);
  });

  it.each([
    ["", ""],
    ["317101150590000", "***************"],
    ["31710115059000012", "*****************"],
    ["317101150590000a", "****************"],
    ["3171-0115-0590-0001", "*******************"],
    ["3171 0115 0590", "**************"],
  ])("menyensor penuh NIK tidak dikenali: %j", (input, expected) => {
    const result = maskNIK(input);
    expect(result).toBe(expected);
    expect(/^\**$/.test(result)).toBe(true);
  });
});

describe("maskPhone", () => {
  it.each([
    ["0812-3456-789", "+628******789"],
    ["+62 812 3456 7890", "+628*******890"],
    ["62812345678", "+628*****678"],
    ["0812345678901", "+628********901"],
  ])("menyensor nomor HP valid fiktif: %j -> %s", (input, expected) => {
    expect(maskPhone(input)).toBe(expected);
  });

  it.each([
    ["", ""],
    ["021-555-1234", "************"],
    ["12345", "*****"],
    ["08123456", "********"],
    ["0812-abc-7890", "*************"],
    ["😀0812", "*****"],
  ])("menyensor penuh nomor HP tidak valid: %j", (input, expected) => {
    const result = maskPhone(input);
    expect(result).toBe(expected);
    expect(/^\**$/.test(result)).toBe(true);
  });
});

describe("maskAccount", () => {
  it.each([
    ["12345678", "****5678"],
    ["1234567890", "******7890"],
    ["123-456-7890", "******7890"],
    [" 1234 5678 9012 ", "********9012"],
  ])("menyensor rekening valid fiktif: %j -> %s", (input, expected) => {
    expect(maskAccount(input)).toBe(expected);
  });

  it.each([
    ["", ""],
    ["1234", "****"],
    ["12345", "*****"],
    ["1234567", "*******"],
    ["123-456-7", "*********"],
    ["1234abcd", "********"],
    ["123-456-789a", "************"],
  ])("menyensor penuh rekening pendek atau non-angka: %j", (input, expected) => {
    const result = maskAccount(input);
    expect(result).toBe(expected);
    expect(/^\**$/.test(result)).toBe(true);
  });
});
