import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone } from "./index";

describe("normalizePhone", () => {
  it.each([
    ["0812-3456-789", "+628123456789"],
    ["+62 812 3456 789", "+628123456789"],
    ["628123456789", "+628123456789"],
  ])("%s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("menolak nomor tidak valid", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(isValidPhone("021-555-1234")).toBe(false); // telepon rumah
  });
});