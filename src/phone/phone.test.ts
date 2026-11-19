import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone } from "./index";

describe("normalizePhone", () => {
  it.each([
    ["0812-3456-789", "+628123456789"],
    ["+62 812 3456 789", "+628123456789"],
    ["628123456789", "+628123456789"],
    ["(+62) 812.3456.7890", "+6281234567890"],
    ["0812345678", "+62812345678"],
    ["0812345678901", "+62812345678901"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
    expect(isValidPhone(input)).toBe(true);
  });

  it.each([
    [""],
    ["   "],
    ["12345"],
    ["021-555-1234"],
    ["081234567"],
    ["08123456789012"],
    ["+6208123456789"],
    ["++628123456789"],
    ["abc08123456789"],
    ["0812-abc-7890"],
  ])("menolak nomor tidak valid: %j", (input) => {
    expect(normalizePhone(input)).toBeNull();
    expect(isValidPhone(input)).toBe(false);
  });

  it.each([[null], [undefined], [8123456789], [{}]])(
    "melempar TypeError untuk input non-string tanpa membocorkan input",
    (bad) => {
      for (const fn of [normalizePhone, isValidPhone]) {
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
