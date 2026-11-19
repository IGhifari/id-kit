import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const pkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
);
const require = createRequire(import.meta.url);

const expectedFunctions = {
  ".": [
    "terbilang",
    "rupiah",
    "parseRupiah",
    "rupiahSingkat",
    "normalizePhone",
    "isValidPhone",
    "detectOperator",
    "parseNIK",
    "isValidNIK",
    "mask",
    "maskNIK",
    "maskPhone",
    "maskAccount",
    "parseNPWP",
    "isValidNPWP",
    "parseNITKU",
    "isValidNITKU",
    "getBank",
    "listBank",
    "cekLibur",
    "daftarLibur",
    "tahunTersedia",
    "hitungHariKerja",
    "tambahHariKerja",
    "formatTanggal",
    "formatWaktu",
    "formatTanggalWaktu",
    "keZonaWaktu",
    "zonaWaktuProvinsi",
    "getProvinsi",
    "listProvinsi",
    "getKabKota",
    "listKabKota",
    "cariWilayah",
  ],
  "./format": ["terbilang", "rupiah", "parseRupiah", "rupiahSingkat"],
  "./phone": ["normalizePhone", "isValidPhone", "detectOperator"],
  "./nik": ["parseNIK", "isValidNIK"],
  "./mask": ["mask", "maskNIK", "maskPhone", "maskAccount"],
  "./npwp": ["parseNPWP", "isValidNPWP", "parseNITKU", "isValidNITKU"],
  "./bank": ["getBank", "listBank"],
  "./libur": [
    "cekLibur",
    "daftarLibur",
    "tahunTersedia",
    "hitungHariKerja",
    "tambahHariKerja",
  ],
  "./waktu": [
    "formatTanggal",
    "formatWaktu",
    "formatTanggalWaktu",
    "keZonaWaktu",
    "zonaWaktuProvinsi",
  ],
  "./wilayah": [
    "getProvinsi",
    "listProvinsi",
    "getKabKota",
    "listKabKota",
    "cariWilayah",
  ],
};

const exportEntries = Object.entries(pkg.exports);
assert.equal(
  exportEntries.length,
  Object.keys(expectedFunctions).length,
  "Jumlah subpath exports di package.json tidak cocok dengan expectedFunctions"
);

for (const [subpath, target] of exportEntries) {
  const esmPath = path.resolve(rootDir, target.import);
  const cjsPath = path.resolve(rootDir, target.require);
  const dtsPath = path.resolve(rootDir, target.types);

  assert.ok(fs.existsSync(esmPath), `ESM hilang untuk ${subpath}: ${esmPath}`);
  assert.ok(fs.existsSync(cjsPath), `CJS hilang untuk ${subpath}: ${cjsPath}`);
  assert.ok(fs.existsSync(dtsPath), `DTS hilang untuk ${subpath}: ${dtsPath}`);

  const esmMod = await import(pathToFileURL(esmPath).href);
  const cjsMod = require(cjsPath);

  const esmKeys = Object.keys(esmMod).sort();
  const cjsKeys = Object.keys(cjsMod).sort();
  assert.deepEqual(
    esmKeys,
    cjsKeys,
    `Ekspor ESM dan CJS berbeda pada subpath ${subpath}`
  );

  for (const fnName of expectedFunctions[subpath]) {
    assert.equal(
      typeof esmMod[fnName],
      "function",
      `ESM ${subpath} tidak mengekspor fungsi ${fnName}`
    );
    assert.equal(
      typeof cjsMod[fnName],
      "function",
      `CJS ${subpath} tidak mengekspor fungsi ${fnName}`
    );
  }
}

// Smoke test fungsional pada hasil build ESM & CJS
const formatEsm = await import(
  pathToFileURL(path.resolve(rootDir, pkg.exports["./format"].import)).href
);
assert.equal(formatEsm.rupiah(-5000), "-Rp5.000");
assert.equal(formatEsm.terbilang(1e15), "satu kuadriliun rupiah");
assert.equal(formatEsm.parseRupiah("Rp1.250.000,50"), 1250000.5);
assert.equal(formatEsm.rupiahSingkat(1_500_000), "Rp1,5 jt");

const wilayahCjs = require(
  path.resolve(rootDir, pkg.exports["./wilayah"].require)
);
assert.equal(wilayahCjs.listProvinsi().length, 38);
assert.equal(wilayahCjs.listKabKota().length, 514);
assert.equal(wilayahCjs.getKabKota("3171").kode, "31.71");

const liburEsm = await import(
  pathToFileURL(path.resolve(rootDir, pkg.exports["./libur"].import)).href
);
assert.deepEqual(liburEsm.hitungHariKerja("2026-08-14", "2026-08-18"), {
  valid: true,
  hariKerja: 2,
  totalHari: 5,
});
assert.deepEqual(liburEsm.tambahHariKerja("2026-08-14", 1), {
  valid: true,
  tanggal: "2026-08-18",
});

console.log(`Exports smoke test OK (${exportEntries.length} subpaths ESM + CJS + DTS)`);
