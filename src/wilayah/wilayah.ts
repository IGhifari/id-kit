import { DATA_KAB_KOTA, DATA_PROVINSI } from "./data";

export type KabKotaJenis = "kabupaten" | "kota";

export interface ProvinsiInfo {
  readonly kode: string;
  readonly nama: string;
}

export interface KabKotaInfo {
  readonly kode: string;
  readonly provinsiKode: string;
  readonly nama: string;
  readonly jenis: KabKotaJenis;
}

export interface CariWilayahOptions {
  /** Batas maksimum jumlah hasil yang dikembalikan. Default: `20`. */
  batas?: number;
}

export type WilayahSearchItem =
  | {
      readonly tingkat: "provinsi";
      readonly kode: string;
      readonly nama: string;
    }
  | {
      readonly tingkat: KabKotaJenis;
      readonly kode: string;
      readonly provinsiKode: string;
      readonly nama: string;
    };

const PROVINSI_LIST: readonly ProvinsiInfo[] = DATA_PROVINSI.map(
  ([kode, nama]) => ({ kode, nama })
);

const PROVINSI_MAP = new Map<string, ProvinsiInfo>(
  PROVINSI_LIST.map((p) => [p.kode, p])
);

const KAB_KOTA_LIST: readonly KabKotaInfo[] = DATA_KAB_KOTA.map(
  ([kode, nama]) => ({
    kode,
    provinsiKode: kode.slice(0, 2),
    nama,
    jenis: nama.startsWith("Kota ") ? "kota" : "kabupaten",
  })
);

const KAB_KOTA_MAP = new Map<string, KabKotaInfo>(
  KAB_KOTA_LIST.map((k) => [k.kode, k])
);

const KAB_KOTA_BY_PROV = new Map<string, readonly KabKotaInfo[]>();
for (const k of KAB_KOTA_LIST) {
  const arr = KAB_KOTA_BY_PROV.get(k.provinsiKode);
  if (arr) {
    (arr as KabKotaInfo[]).push(k);
  } else {
    KAB_KOTA_BY_PROV.set(k.provinsiKode, [k]);
  }
}

function assertString(input: unknown, message: string): asserts input is string {
  if (typeof input !== "string") {
    throw new TypeError(message);
  }
}

function normalizeKabKotaKode(kode: string): string | null {
  const trimmed = kode.trim();
  if (/^\d{2}\.\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed.slice(0, 2)}.${trimmed.slice(2, 4)}`;
  }
  return null;
}

/**
 * Mencari provinsi berdasarkan kode wilayah Kemendagri 2 digit (contoh: `"31"`).
 *
 * Spasi di awal/akhir di-trim terlebih dahulu. Mengembalikan `null` jika format bukan 2 digit atau
 * kode tidak ditemukan. Data terakhir diverifikasi 2026-11-18 dan tidak mencakup kode wilayah BPS.
 */
export function getProvinsi(kode: string): ProvinsiInfo | null {
  assertString(kode, "Kode provinsi harus berupa string");

  const trimmed = kode.trim();
  if (!/^\d{2}$/.test(trimmed)) {
    return null;
  }

  const found = PROVINSI_MAP.get(trimmed);
  return found ? { ...found } : null;
}

/**
 * Mengembalikan salinan daftar seluruh 38 provinsi di Indonesia (kode wilayah Kemendagri).
 */
export function listProvinsi(): ProvinsiInfo[] {
  return PROVINSI_LIST.map((p) => ({ ...p }));
}

/**
 * Mencari kabupaten/kota berdasarkan kode wilayah Kemendagri (`"31.71"`) atau 4 digit rapat (`"3171"`).
 *
 * Kode dinormalkan ke format `"PP.KK"`. Mengembalikan `null` jika tidak ditemukan atau format tidak sesuai.
 * Data terakhir diverifikasi 2026-11-18 (514 kabupaten/kota); belum mencakup kecamatan dan kelurahan/desa.
 */
export function getKabKota(kode: string): KabKotaInfo | null {
  assertString(kode, "Kode kabupaten/kota harus berupa string");

  const normalized = normalizeKabKotaKode(kode);
  if (!normalized) {
    return null;
  }

  const found = KAB_KOTA_MAP.get(normalized);
  return found ? { ...found } : null;
}

/**
 * Mengembalikan daftar kabupaten/kota di Indonesia, atau difilter berdasarkan `provinsiKode` 2 digit.
 *
 * Jika `provinsiKode` tidak ditemukan, mengembalikan array kosong `[]`.
 */
export function listKabKota(provinsiKode?: string): KabKotaInfo[] {
  if (provinsiKode === undefined) {
    return KAB_KOTA_LIST.map((k) => ({ ...k }));
  }

  assertString(provinsiKode, "Kode provinsi harus berupa string");

  const trimmed = provinsiKode.trim();
  if (!/^\d{2}$/.test(trimmed)) {
    return [];
  }

  const list = KAB_KOTA_BY_PROV.get(trimmed);
  return list ? list.map((k) => ({ ...k })) : [];
}

/**
 * Mencari provinsi dan kabupaten/kota berdasarkan potongan nama (case-insensitive).
 *
 * Query kosong menghasilkan `[]`. Default maksimum `20` hasil (dapat diatur via `options.batas`).
 */
export function cariWilayah(
  query: string,
  options?: CariWilayahOptions
): WilayahSearchItem[] {
  assertString(query, "Query pencarian harus berupa string");

  if (
    options !== undefined &&
    (typeof options !== "object" || options === null || Array.isArray(options))
  ) {
    throw new TypeError("Opsi harus berupa objek");
  }

  let batas = 20;
  if (options?.batas !== undefined) {
    if (typeof options.batas !== "number") {
      throw new TypeError("Batas hasil harus berupa number");
    }
    if (!Number.isInteger(options.batas) || options.batas < 1) {
      throw new RangeError("Batas hasil harus berupa bilangan bulat positif");
    }
    batas = options.batas;
  }

  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }

  const results: WilayahSearchItem[] = [];

  for (const p of PROVINSI_LIST) {
    if (p.nama.toLowerCase().includes(needle)) {
      results.push({ tingkat: "provinsi", kode: p.kode, nama: p.nama });
      if (results.length >= batas) {
        return results;
      }
    }
  }

  for (const k of KAB_KOTA_LIST) {
    if (k.nama.toLowerCase().includes(needle)) {
      results.push({
        tingkat: k.jenis,
        kode: k.kode,
        provinsiKode: k.provinsiKode,
        nama: k.nama,
      });
      if (results.length >= batas) {
        return results;
      }
    }
  }

  return results;
}
