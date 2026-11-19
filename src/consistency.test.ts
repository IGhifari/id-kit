import { describe, expect, it } from "vitest";
import { parseNIK } from "./nik";
import { zonaWaktuProvinsi } from "./waktu";
import { listProvinsi } from "./wilayah";

describe("konsistensi 38 provinsi lintas modul (nik, waktu, wilayah)", () => {
  it("semua 38 kode dan nama provinsi identik di wilayah, nik, dan waktu", () => {
    const provs = listProvinsi();
    expect(provs).toHaveLength(38);

    for (const prov of provs) {
      const nikFiktif = `${prov.kode}01011505900001`;
      const parsed = parseNIK(nikFiktif);
      expect(parsed.valid).toBe(true);
      if (parsed.valid) {
        expect(parsed.provinsiKode).toBe(prov.kode);
        expect(parsed.provinsi).toBe(prov.nama);
      }

      const zona = zonaWaktuProvinsi(prov.kode);
      expect(zona).not.toBeNull();
    }

    // Pastikan tidak ada kode 2 digit lain di luar 38 provinsi yang diterima nik atau waktu
    const validCodes = new Set(provs.map((p) => p.kode));
    for (let i = 0; i <= 99; i++) {
      const code = String(i).padStart(2, "0");
      if (validCodes.has(code)) continue;
      expect(parseNIK(`${code}01011505900001`)).toEqual({
        valid: false,
        alasan: "provinsi",
      });
      expect(zonaWaktuProvinsi(code)).toBeNull();
    }
  });
});
