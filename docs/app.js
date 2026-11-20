import * as idKit from "./dist/index.js";

const tabsEl = document.getElementById("module-tabs");
const titleEl = document.getElementById("mod-title");
const descEl = document.getElementById("mod-desc");
const subpathEl = document.getElementById("mod-subpath");
const presetsEl = document.getElementById("mod-presets");
const controlsEl = document.getElementById("mod-controls");
const warningEl = document.getElementById("mod-warning");
const outputEl = document.getElementById("mod-output");
const codeEl = document.getElementById("mod-code");
const copyInstallBtn = document.getElementById("copy-install");
const copyCodeBtn = document.getElementById("copy-code");
const themeToggleBtn = document.getElementById("theme-toggle");

function safeCall(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: `${err.name}: ${err.message}` };
  }
}

function formatResult(res) {
  if (!res.ok) return res.error;
  if (typeof res.value === "string") return JSON.stringify(res.value);
  return JSON.stringify(res.value, null, 2);
}

function addResultCard(label, res, statusHint) {
  const card = document.createElement("div");
  card.className = "result-card";
  if (!res.ok || statusHint === "err") {
    card.classList.add("status-err");
  } else if (statusHint === "ok") {
    card.classList.add("status-ok");
  }

  const labelEl = document.createElement("div");
  labelEl.className = "result-label";
  labelEl.textContent = label;

  const valEl = document.createElement("pre");
  valEl.className = "result-value";
  valEl.textContent = formatResult(res);

  card.append(labelEl, valEl);
  outputEl.append(card);
}

function createTextField(labelText, name, value, placeholder = "") {
  const wrap = document.createElement("div");
  wrap.className = "field";

  const label = document.createElement("label");
  label.htmlFor = `field-${name}`;
  label.textContent = labelText;

  const input = document.createElement("input");
  input.id = `field-${name}`;
  input.name = name;
  input.type = "text";
  input.value = value;
  input.placeholder = placeholder;

  wrap.append(label, input);
  return { wrap, input };
}

function createNumberField(labelText, name, value, opts = {}) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  const label = document.createElement("label");
  label.htmlFor = `field-${name}`;
  label.textContent = labelText;

  const input = document.createElement("input");
  input.id = `field-${name}`;
  input.name = name;
  input.type = "number";
  input.value = String(value);
  if (opts.min !== undefined) input.min = String(opts.min);
  if (opts.max !== undefined) input.max = String(opts.max);
  if (opts.step !== undefined) input.step = String(opts.step);

  wrap.append(label, input);
  return { wrap, input };
}

function createSelectField(labelText, name, options, value) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  const label = document.createElement("label");
  label.htmlFor = `field-${name}`;
  label.textContent = labelText;

  const select = document.createElement("select");
  select.id = `field-${name}`;
  select.name = name;

  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === value) o.selected = true;
    select.append(o);
  }

  wrap.append(label, select);
  return { wrap, select };
}

function createCheckbox(labelText, name, checked) {
  const label = document.createElement("label");
  label.className = "checkbox-label";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = name;
  input.checked = checked;

  const span = document.createElement("span");
  span.textContent = labelText;

  label.append(input, span);
  return { wrap: label, input };
}

const MODULES = [
  {
    id: "format",
    label: "format",
    title: "Format Rupiah & Terbilang",
    desc: "Terbilang bilangan bulat hingga kuadriliun, format Rupiah, parse string Rupiah, dan format ringkas.",
    subpath: "@ghifari29/id-kit/format",
    warning:
      "Batasan: terbilang() hanya menerima bilangan bulat aman (Number.isSafeInteger). parseRupiah() mewajibkan titik ribuan berkelompok 3 digit (misal \"1.50\" -> null).",
    state: { angka: "1250000", desimal: 1, rupiahText: "Rp 1.250.000,50" },
    presets: [
      { label: "1.250.000", patch: { angka: "1250000", rupiahText: "Rp 1.250.000,50" } },
      { label: "Negatif -5.000", patch: { angka: "-5000", rupiahText: "-Rp5.000" } },
      { label: "1 Kuadriliun", patch: { angka: "1000000000000000", rupiahText: "Rp. 500.000,-" } },
      { label: "Format Inggris (tolak)", patch: { angka: "999950", rupiahText: "1.50" } },
    ],
    mount(state, onUpdate) {
      const fAngka = createTextField("Angka (untuk terbilang / rupiah / rupiahSingkat)", "angka", state.angka);
      const fDesimal = createNumberField("Desimal rupiahSingkat (0–6)", "desimal", state.desimal, {
        min: 0,
        max: 6,
        step: 1,
      });
      const row = document.createElement("div");
      row.className = "field-row";
      row.append(fAngka.wrap, fDesimal.wrap);

      const fText = createTextField("Teks Rupiah (untuk parseRupiah)", "rupiahText", state.rupiahText);

      controlsEl.append(row, fText.wrap);
      fAngka.input.addEventListener("input", () => onUpdate({ angka: fAngka.input.value }));
      fDesimal.input.addEventListener("input", () =>
        onUpdate({ desimal: Number(fDesimal.input.value) })
      );
      fText.input.addEventListener("input", () => onUpdate({ rupiahText: fText.input.value }));
    },
    render(state) {
      const num = state.angka.trim() === "" ? Number.NaN : Number(state.angka);
      const rRupiah = safeCall(() => idKit.rupiah(num));
      const rTerbilang = safeCall(() => idKit.terbilang(num));
      const rSingkat = safeCall(() => idKit.rupiahSingkat(num, { desimal: state.desimal }));
      const rParse = safeCall(() => idKit.parseRupiah(state.rupiahText));

      addResultCard(`rupiah(${state.angka || "NaN"})`, rRupiah);
      addResultCard(`terbilang(${state.angka || "NaN"})`, rTerbilang);
      addResultCard(`rupiahSingkat(${state.angka || "NaN"}, { desimal: ${state.desimal} })`, rSingkat);
      addResultCard(`parseRupiah(${JSON.stringify(state.rupiahText)})`, rParse);

      return `import { terbilang, rupiah, parseRupiah, rupiahSingkat } from "@ghifari29/id-kit/format";

rupiah(${Number.isFinite(num) ? num : 0});
terbilang(${Number.isSafeInteger(num) ? num : 0});
rupiahSingkat(${Number.isFinite(num) ? num : 0}, { desimal: ${state.desimal} });
parseRupiah(${JSON.stringify(state.rupiahText)});`;
    },
  },
  {
    id: "phone",
    label: "phone",
    title: "Nomor Telepon & Operator Seluler",
    desc: "Normalisasi nomor seluler Indonesia ke +62 dan deteksi operator asal berdasarkan awalan 4 digit.",
    subpath: "@ghifari29/id-kit/phone",
    warning:
      "Batasan: detectOperator() hanya mengidentifikasi operator asal berdasarkan awalan (terverifikasi 2026-11-18), bukan operator saat ini karena number portability. Gunakan nomor fiktif.",
    state: { nomor: "0812-3456-789" },
    presets: [
      { label: "Telkomsel (0812)", patch: { nomor: "0812-3456-789" } },
      { label: "IM3 (+62 857)", patch: { nomor: "+62 857-1234-5678" } },
      { label: "Tri (62895)", patch: { nomor: "6289512345678" } },
      { label: "Smartfren (0881)", patch: { nomor: "0881-2345-678" } },
      { label: "Telepon Rumah (021)", patch: { nomor: "021-555-1234" } },
      { label: "Awalan belum terverifikasi", patch: { nomor: "083412345678" } },
    ],
    mount(state, onUpdate) {
      const fNomor = createTextField("Nomor Telepon (fiktif)", "nomor", state.nomor);
      controlsEl.append(fNomor.wrap);
      fNomor.input.addEventListener("input", () => onUpdate({ nomor: fNomor.input.value }));
    },
    render(state) {
      const rNorm = safeCall(() => idKit.normalizePhone(state.nomor));
      const rValid = safeCall(() => idKit.isValidPhone(state.nomor));
      const rOp = safeCall(() => idKit.detectOperator(state.nomor));

      addResultCard("normalizePhone(input)", rNorm, rNorm.ok && rNorm.value ? "ok" : "err");
      addResultCard("isValidPhone(input)", rValid);
      addResultCard("detectOperator(input)", rOp, rOp.ok && rOp.value.valid ? "ok" : "err");

      return `import { normalizePhone, isValidPhone, detectOperator } from "@ghifari29/id-kit/phone";

normalizePhone(${JSON.stringify(state.nomor)});
isValidPhone(${JSON.stringify(state.nomor)});
detectOperator(${JSON.stringify(state.nomor)});`;
    },
  },
  {
    id: "nik",
    label: "nik",
    title: "Validasi Format NIK",
    desc: "Parse struktur NIK 16 digit (provinsi Kemendagri, kab/kota, kecamatan, tanggal lahir UTC, gender, urutan).",
    subpath: "@ghifari29/id-kit/nik",
    warning:
      "Batasan: HANYA validasi format struktur offline, bukan bukti NIK asli/terdaftar di Dukcapil. Penentuan abad tahun 2 digit bersifat heuristik. Jangan masukkan NIK sungguhan.",
    state: { nik: "3171011505900001" },
    presets: [
      { label: "Laki-laki (DKI Jakarta)", patch: { nik: "3171011505900001" } },
      { label: "Perempuan (+40, Jabar)", patch: { nik: "3201 0255 0590 0002" } },
      { label: "Kabisat 29 Feb 2024", patch: { nik: "3171012902240001" } },
      { label: "31 April (invalid)", patch: { nik: "3171013104900001" } },
      { label: "Provinsi 99 (invalid)", patch: { nik: "9971011505900001" } },
    ],
    mount(state, onUpdate) {
      const fNik = createTextField("NIK 16 digit (fiktif)", "nik", state.nik);
      controlsEl.append(fNik.wrap);
      fNik.input.addEventListener("input", () => onUpdate({ nik: fNik.input.value }));
    },
    render(state) {
      const rValid = safeCall(() => idKit.isValidNIK(state.nik));
      const rParse = safeCall(() => idKit.parseNIK(state.nik));

      addResultCard("isValidNIK(input)", rValid);
      addResultCard("parseNIK(input)", rParse, rParse.ok && rParse.value.valid ? "ok" : "err");

      if (rParse.ok && rParse.value.valid) {
        const info = rParse.value;
        const rKab = safeCall(() => idKit.getKabKota(`${info.provinsiKode}.${info.kabKotaKode}`));
        const rZona = safeCall(() => idKit.zonaWaktuProvinsi(info.provinsiKode));
        addResultCard(
          "Kombinasi lintas modul (wilayah + waktu)",
          {
            ok: true,
            value: {
              kabKota: rKab.ok ? rKab.value?.nama ?? "Kode kab/kota tidak ditemukan" : null,
              zonaWaktu: rZona.ok ? rZona.value : null,
            },
          }
        );
      }

      return `import { isValidNIK, parseNIK } from "@ghifari29/id-kit/nik";

isValidNIK(${JSON.stringify(state.nik)});
parseNIK(${JSON.stringify(state.nik)});`;
    },
  },
  {
    id: "mask",
    label: "mask",
    title: "Masking Data Pribadi",
    desc: "Menyensor string, NIK, nomor HP, dan nomor rekening untuk kebutuhan tampilan UI.",
    subpath: "@ghifari29/id-kit/mask",
    warning:
      "Peringatan Keamanan: Modul mask HANYA untuk TAMPILAN UI, bukan enkripsi atau anonimisasi. Jangan pernah menyimpan data asli di log hanya karena sudah ada fungsi masking.",
    state: {
      text: "rahasia-indonesia",
      visibleStart: 2,
      visibleEnd: 2,
      maskChar: "*",
      nik: "3171 0115 0590 0001",
      phone: "0812-3456-789",
      account: "123-456-7890",
    },
    presets: [
      {
        label: "Contoh Lengkap (fiktif)",
        patch: {
          text: "rahasia-indonesia",
          visibleStart: 2,
          visibleEnd: 2,
          maskChar: "*",
          nik: "3171 0115 0590 0001",
          phone: "0812-3456-789",
          account: "123-456-7890",
        },
      },
      {
        label: "Input Pendek & Rekening < 8",
        patch: {
          text: "1234",
          visibleStart: 2,
          visibleEnd: 2,
          maskChar: "•",
          nik: "3171011505",
          phone: "021-555-1234",
          account: "1234567",
        },
      },
    ],
    mount(state, onUpdate) {
      const fText = createTextField("Teks umum (mask)", "text", state.text);
      const row = document.createElement("div");
      row.className = "field-row";
      const fStart = createNumberField("visibleStart", "visibleStart", state.visibleStart, { min: 0 });
      const fEnd = createNumberField("visibleEnd", "visibleEnd", state.visibleEnd, { min: 0 });
      row.append(fStart.wrap, fEnd.wrap);

      const fChar = createTextField("maskChar (1 karakter)", "maskChar", state.maskChar);
      const fNik = createTextField("NIK fiktif (maskNIK)", "nik", state.nik);
      const fPhone = createTextField("HP fiktif (maskPhone)", "phone", state.phone);
      const fAcc = createTextField("Rekening fiktif (maskAccount)", "account", state.account);

      controlsEl.append(fText.wrap, row, fChar.wrap, fNik.wrap, fPhone.wrap, fAcc.wrap);

      fText.input.addEventListener("input", () => onUpdate({ text: fText.input.value }));
      fStart.input.addEventListener("input", () =>
        onUpdate({ visibleStart: Number(fStart.input.value) })
      );
      fEnd.input.addEventListener("input", () =>
        onUpdate({ visibleEnd: Number(fEnd.input.value) })
      );
      fChar.input.addEventListener("input", () => onUpdate({ maskChar: fChar.input.value }));
      fNik.input.addEventListener("input", () => onUpdate({ nik: fNik.input.value }));
      fPhone.input.addEventListener("input", () => onUpdate({ phone: fPhone.input.value }));
      fAcc.input.addEventListener("input", () => onUpdate({ account: fAcc.input.value }));
    },
    render(state) {
      const rMask = safeCall(() =>
        idKit.mask(state.text, {
          visibleStart: state.visibleStart,
          visibleEnd: state.visibleEnd,
          maskChar: state.maskChar,
        })
      );
      const rNik = safeCall(() => idKit.maskNIK(state.nik));
      const rPhone = safeCall(() => idKit.maskPhone(state.phone));
      const rAcc = safeCall(() => idKit.maskAccount(state.account));

      addResultCard("mask(text, options)", rMask);
      addResultCard("maskNIK(nik)", rNik);
      addResultCard("maskPhone(phone)", rPhone);
      addResultCard("maskAccount(account)", rAcc);

      return `import { mask, maskNIK, maskPhone, maskAccount } from "@ghifari29/id-kit/mask";

mask(${JSON.stringify(state.text)}, { visibleStart: ${state.visibleStart}, visibleEnd: ${state.visibleEnd}, maskChar: ${JSON.stringify(state.maskChar)} });
maskNIK(${JSON.stringify(state.nik)});
maskPhone(${JSON.stringify(state.phone)});
maskAccount(${JSON.stringify(state.account)});`;
    },
  },
  {
    id: "npwp",
    label: "npwp",
    title: "Validasi Format NPWP & NITKU",
    desc: "Mengurai NPWP 15 digit (legacy), 16 digit (NIK, badan awalan 0, atau 16 digit lainnya), dan NITKU 22 digit.",
    subpath: "@ghifari29/id-kit/npwp",
    warning:
      "Batasan: HANYA validasi panjang dan struktur (tanpa checksum), bukan bukti terdaftar di DJP. Gunakan angka fiktif.",
    state: { npwp: "01.234.567.8-901.000", nitku: "0012345678901000000000" },
    presets: [
      { label: "Legacy 15 + NITKU Pusat", patch: { npwp: "01.234.567.8-901.000", nitku: "0012345678901000000000" } },
      { label: "NPWP NIK + NITKU Cabang", patch: { npwp: "3171011505900001", nitku: "3171011505900001-000001" } },
      { label: "Badan Awalan 0", patch: { npwp: "0012345678901000", nitku: "0012345678901000000002" } },
      { label: "16 Digit Lainnya", patch: { npwp: "9912345678901234", nitku: "9912345678901234000001" } },
    ],
    mount(state, onUpdate) {
      const fNpwp = createTextField("NPWP 15/16 digit (fiktif)", "npwp", state.npwp);
      const fNitku = createTextField("NITKU 22 digit (fiktif)", "nitku", state.nitku);
      controlsEl.append(fNpwp.wrap, fNitku.wrap);
      fNpwp.input.addEventListener("input", () => onUpdate({ npwp: fNpwp.input.value }));
      fNitku.input.addEventListener("input", () => onUpdate({ nitku: fNitku.input.value }));
    },
    render(state) {
      const rNpwp = safeCall(() => idKit.parseNPWP(state.npwp));
      const rNitku = safeCall(() => idKit.parseNITKU(state.nitku));

      addResultCard("parseNPWP(npwp)", rNpwp, rNpwp.ok && rNpwp.value.valid ? "ok" : "err");
      addResultCard("parseNITKU(nitku)", rNitku, rNitku.ok && rNitku.value.valid ? "ok" : "err");

      return `import { parseNPWP, parseNITKU } from "@ghifari29/id-kit/npwp";

parseNPWP(${JSON.stringify(state.npwp)});
parseNITKU(${JSON.stringify(state.nitku)});`;
    },
  },
  {
    id: "bank",
    label: "bank",
    title: "Daftar Kode Bank (3 Digit)",
    desc: "Lookup 31 bank populer di Indonesia berdasarkan kode transfer 3 digit.",
    subpath: "@ghifari29/id-kit/bank",
    warning:
      "Batasan: Diverifikasi 2026-11-18 dari sumber sekunder (jaringan switching & situs bank). Tidak ada validasi panjang nomor rekening, dengan sengaja.",
    state: { kode: "014", filter: "" },
    presets: [
      { label: "BCA (014)", patch: { kode: "014" } },
      { label: "OCBC (028)", patch: { kode: "028" } },
      { label: "BSI (451)", patch: { kode: "451" } },
      { label: "SeaBank (535)", patch: { kode: "535" } },
      { label: "Kode Melebur (950)", patch: { kode: "950" } },
    ],
    mount(state, onUpdate) {
      const fKode = createTextField("Kode Bank 3 digit", "kode", state.kode);
      const fFilter = createTextField("Filter listBank() (opsional)", "filter", state.filter, "contoh: syariah, jago, bca");
      controlsEl.append(fKode.wrap, fFilter.wrap);
      fKode.input.addEventListener("input", () => onUpdate({ kode: fKode.input.value }));
      fFilter.input.addEventListener("input", () => onUpdate({ filter: fFilter.input.value }));
    },
    render(state) {
      const rBank = safeCall(() => idKit.getBank(state.kode));
      addResultCard(`getBank(${JSON.stringify(state.kode)})`, rBank, rBank.ok && rBank.value ? "ok" : "err");

      const needle = state.filter.trim().toLowerCase();
      const list = idKit
        .listBank()
        .filter((b) => !needle || b.nama.toLowerCase().includes(needle) || b.kode.includes(needle));
      addResultCard(`listBank() (${list.length} dari 31 bank)`, { ok: true, value: list });

      return `import { getBank, listBank } from "@ghifari29/id-kit/bank";

getBank(${JSON.stringify(state.kode)});
listBank().length; // 31`;
    },
  },
  {
    id: "libur",
    label: "libur",
    title: "Libur Nasional, Cuti Bersama & Hari Kerja",
    desc: "Cek tanggal SKB 3 Menteri (2025–2027), hitung jumlah hari kerja inklusif, dan tambah/kurangi hari kerja.",
    subpath: "@ghifari29/id-kit/libur",
    warning:
      "Batasan: Tahun di luar 2025–2027 mengembalikan status \"data-tidak-tersedia\" (bukan \"bukan-libur\"). SKB bisa direvisi di tengah tahun. Bukan nasihat hukum ketenagakerjaan.",
    state: {
      tanggal: "2026-08-17",
      mulai: "2026-08-14",
      selesai: "2026-08-18",
      tambahHari: 1,
      sabtuKerja: false,
      sertakanCutiBersama: true,
    },
    presets: [
      {
        label: "HUT RI 2026",
        patch: { tanggal: "2026-08-17", mulai: "2026-08-14", selesai: "2026-08-18", tambahHari: 1 },
      },
      {
        label: "Natal & Cuti 2026",
        patch: { tanggal: "2026-12-24", mulai: "2026-12-23", selesai: "2026-12-25", tambahHari: 1 },
      },
      {
        label: "Revisi Cuti 2025",
        patch: { tanggal: "2025-08-18", mulai: "2025-08-15", selesai: "2025-08-19", tambahHari: 1 },
      },
      {
        label: "Tahun Tanpa Data (2028)",
        patch: { tanggal: "2028-01-01", mulai: "2027-12-30", selesai: "2028-01-02", tambahHari: 5 },
      },
    ],
    mount(state, onUpdate) {
      const fTanggal = createTextField("cekLibur(tanggal) — YYYY-MM-DD", "tanggal", state.tanggal);
      const row1 = document.createElement("div");
      row1.className = "field-row";
      const fMulai = createTextField("Mulai (YYYY-MM-DD)", "mulai", state.mulai);
      const fSelesai = createTextField("Selesai (YYYY-MM-DD)", "selesai", state.selesai);
      row1.append(fMulai.wrap, fSelesai.wrap);

      const fTambah = createNumberField("tambahHariKerja(mulai, jumlahHari)", "tambahHari", state.tambahHari, {
        step: 1,
      });

      const cbGroup = document.createElement("div");
      cbGroup.className = "checkbox-group";
      const cbSabtu = createCheckbox("sabtuKerja (6 hari kerja)", "sabtuKerja", state.sabtuKerja);
      const cbCuti = createCheckbox(
        "sertakanCutiBersama",
        "sertakanCutiBersama",
        state.sertakanCutiBersama
      );
      cbGroup.append(cbSabtu.wrap, cbCuti.wrap);

      controlsEl.append(fTanggal.wrap, row1, fTambah.wrap, cbGroup);

      fTanggal.input.addEventListener("input", () => onUpdate({ tanggal: fTanggal.input.value }));
      fMulai.input.addEventListener("input", () => onUpdate({ mulai: fMulai.input.value }));
      fSelesai.input.addEventListener("input", () => onUpdate({ selesai: fSelesai.input.value }));
      fTambah.input.addEventListener("input", () =>
        onUpdate({ tambahHari: Number(fTambah.input.value) })
      );
      cbSabtu.input.addEventListener("change", () =>
        onUpdate({ sabtuKerja: cbSabtu.input.checked })
      );
      cbCuti.input.addEventListener("change", () =>
        onUpdate({ sertakanCutiBersama: cbCuti.input.checked })
      );
    },
    render(state) {
      const opts = {
        sabtuKerja: state.sabtuKerja,
        sertakanCutiBersama: state.sertakanCutiBersama,
      };
      const rCek = safeCall(() => idKit.cekLibur(state.tanggal));
      const rHitung = safeCall(() => idKit.hitungHariKerja(state.mulai, state.selesai, opts));
      const rTambah = safeCall(() => idKit.tambahHariKerja(state.mulai, state.tambahHari, opts));
      const rTahun = safeCall(() => idKit.tahunTersedia());

      addResultCard(`cekLibur(${JSON.stringify(state.tanggal)})`, rCek);
      addResultCard("hitungHariKerja(mulai, selesai, options)", rHitung);
      addResultCard("tambahHariKerja(mulai, jumlahHari, options)", rTambah);
      addResultCard("tahunTersedia()", rTahun);

      return `import { cekLibur, hitungHariKerja, tambahHariKerja } from "@ghifari29/id-kit/libur";

cekLibur(${JSON.stringify(state.tanggal)});
hitungHariKerja(${JSON.stringify(state.mulai)}, ${JSON.stringify(state.selesai)}, ${JSON.stringify(opts)});
tambahHariKerja(${JSON.stringify(state.mulai)}, ${state.tambahHari}, ${JSON.stringify(opts)});`;
    },
  },
  {
    id: "waktu",
    label: "waktu",
    title: "Format Tanggal & Zona Waktu Indonesia",
    desc: "Format tanggal/waktu dan konversi UTC murni ke WIB (+07:00), WITA (+08:00), atau WIT (+09:00).",
    subpath: "@ghifari29/id-kit/waktu",
    warning:
      "Batasan: String ISO tanpa zona waktu eksplisit ditolak dengan RangeError (\"YYYY-MM-DD\" hanya diterima di formatTanggal). zonaWaktuProvinsi() memakai 38 kode Kemendagri.",
    state: {
      input: "2026-11-18T13:35:10Z",
      zona: "WIB",
      kodeProvinsi: "64",
      denganHari: true,
      singkat: false,
      denganDetik: false,
      tampilkanZona: true,
    },
    presets: [
      { label: "ISO UTC", patch: { input: "2026-11-18T13:35:10Z", zona: "WIB", kodeProvinsi: "31" } },
      { label: "Batas Tahun Baru", patch: { input: "2026-12-31T17:00:00Z", zona: "WIB", kodeProvinsi: "64" } },
      { label: "Tanggal Murni (formatTanggal)", patch: { input: "2026-11-18", zona: "WITA", kodeProvinsi: "96" } },
      { label: "Tanpa Offset (error)", patch: { input: "2026-11-18T20:35:00", zona: "WIB", kodeProvinsi: "11" } },
    ],
    mount(state, onUpdate) {
      const fInput = createTextField("Input Date ISO (dengan Z / ±HH:MM) atau YYYY-MM-DD", "input", state.input);
      const row = document.createElement("div");
      row.className = "field-row";
      const fZona = createSelectField(
        "Zona Waktu",
        "zona",
        [
          { value: "WIB", label: "WIB (+07:00)" },
          { value: "WITA", label: "WITA (+08:00)" },
          { value: "WIT", label: "WIT (+09:00)" },
        ],
        state.zona
      );
      const fProv = createTextField("Kode Provinsi 2 digit", "kodeProvinsi", state.kodeProvinsi);
      row.append(fZona.wrap, fProv.wrap);

      const cbGroup = document.createElement("div");
      cbGroup.className = "checkbox-group";
      const cbHari = createCheckbox("denganHari", "denganHari", state.denganHari);
      const cbSingkat = createCheckbox("singkat", "singkat", state.singkat);
      const cbDetik = createCheckbox("denganDetik", "denganDetik", state.denganDetik);
      const cbZona = createCheckbox("tampilkanZona", "tampilkanZona", state.tampilkanZona);
      cbGroup.append(cbHari.wrap, cbSingkat.wrap, cbDetik.wrap, cbZona.wrap);

      controlsEl.append(fInput.wrap, row, cbGroup);

      fInput.input.addEventListener("input", () => onUpdate({ input: fInput.input.value }));
      fZona.select.addEventListener("change", () => onUpdate({ zona: fZona.select.value }));
      fProv.input.addEventListener("input", () =>
        onUpdate({ kodeProvinsi: fProv.input.value })
      );
      cbHari.input.addEventListener("change", () => onUpdate({ denganHari: cbHari.input.checked }));
      cbSingkat.input.addEventListener("change", () => onUpdate({ singkat: cbSingkat.input.checked }));
      cbDetik.input.addEventListener("change", () =>
        onUpdate({ denganDetik: cbDetik.input.checked })
      );
      cbZona.input.addEventListener("change", () =>
        onUpdate({ tampilkanZona: cbZona.input.checked })
      );
    },
    render(state) {
      const rTanggal = safeCall(() =>
        idKit.formatTanggal(state.input, {
          zona: state.zona,
          denganHari: state.denganHari,
          singkat: state.singkat,
        })
      );
      const rWaktu = safeCall(() =>
        idKit.formatWaktu(state.input, {
          zona: state.zona,
          denganDetik: state.denganDetik,
          tampilkanZona: state.tampilkanZona,
        })
      );
      const rGabung = safeCall(() =>
        idKit.formatTanggalWaktu(state.input, {
          zona: state.zona,
          denganHari: state.denganHari,
          singkat: state.singkat,
          denganDetik: state.denganDetik,
          tampilkanZona: state.tampilkanZona,
        })
      );
      const rKonversi = safeCall(() => idKit.keZonaWaktu(state.input, state.zona));
      const rProv = safeCall(() => idKit.zonaWaktuProvinsi(state.kodeProvinsi));

      addResultCard("formatTanggal(input, options)", rTanggal);
      addResultCard("formatWaktu(input, options)", rWaktu);
      addResultCard("formatTanggalWaktu(input, options)", rGabung);
      addResultCard(`keZonaWaktu(input, ${JSON.stringify(state.zona)})`, rKonversi);
      addResultCard(`zonaWaktuProvinsi(${JSON.stringify(state.kodeProvinsi)})`, rProv);

      return `import { formatTanggal, formatTanggalWaktu, keZonaWaktu, zonaWaktuProvinsi } from "@ghifari29/id-kit/waktu";

formatTanggal(${JSON.stringify(state.input)}, { zona: ${JSON.stringify(state.zona)}, denganHari: ${state.denganHari}, singkat: ${state.singkat} });
formatTanggalWaktu(${JSON.stringify(state.input)}, { zona: ${JSON.stringify(state.zona)}, denganDetik: ${state.denganDetik} });
keZonaWaktu(${JSON.stringify(state.input)}, ${JSON.stringify(state.zona)});
zonaWaktuProvinsi(${JSON.stringify(state.kodeProvinsi)});`;
    },
  },
  {
    id: "wilayah",
    label: "wilayah",
    title: "Data Wilayah Kemendagri (38 Provinsi & 514 Kab/Kota)",
    desc: "Lookup provinsi, kabupaten/kota (format bertitik \"31.71\" atau rapat \"3171\"), dan pencarian nama wilayah.",
    subpath: "@ghifari29/id-kit/wilayah",
    warning:
      "Batasan: Data terakhir diverifikasi 2026-11-18 berdasarkan kode wilayah Kemendagri. Belum mencakup kecamatan, kelurahan/desa, serta kode wilayah kerja statistik BPS.",
    state: { query: "sorong", kodeKab: "3171", provFilter: "96", batas: 20 },
    presets: [
      { label: "Sorong (96.71)", patch: { query: "sorong", kodeKab: "96.71", provFilter: "96" } },
      { label: "Jakarta (3171)", patch: { query: "jakarta", kodeKab: "3171", provFilter: "31" } },
      { label: "Bandung (32.04)", patch: { query: "bandung", kodeKab: "32.04", provFilter: "32" } },
    ],
    mount(state, onUpdate) {
      const fQuery = createTextField("cariWilayah(query)", "query", state.query, "contoh: sorong");
      const row = document.createElement("div");
      row.className = "field-row";
      const fKab = createTextField("getKabKota(kode)", "kodeKab", state.kodeKab, "31.71 atau 3171");
      const fBatas = createNumberField("options.batas", "batas", state.batas, { min: 1, max: 100 });
      row.append(fKab.wrap, fBatas.wrap);

      const provOpts = idKit.listProvinsi().map((p) => ({
        value: p.kode,
        label: `${p.kode} — ${p.nama}`,
      }));
      const fProv = createSelectField("listKabKota(provinsiKode)", "provFilter", provOpts, state.provFilter);

      controlsEl.append(fQuery.wrap, row, fProv.wrap);

      fQuery.input.addEventListener("input", () => onUpdate({ query: fQuery.input.value }));
      fKab.input.addEventListener("input", () => onUpdate({ kodeKab: fKab.input.value }));
      fBatas.input.addEventListener("input", () => onUpdate({ batas: Number(fBatas.input.value) }));
      fProv.select.addEventListener("change", () => onUpdate({ provFilter: fProv.select.value }));
    },
    render(state) {
      const rCari = safeCall(() => idKit.cariWilayah(state.query, { batas: state.batas }));
      const rKab = safeCall(() => idKit.getKabKota(state.kodeKab));
      const rList = safeCall(() => idKit.listKabKota(state.provFilter));

      addResultCard(
        `cariWilayah(${JSON.stringify(state.query)}, { batas: ${state.batas} })`,
        rCari
      );
      addResultCard(`getKabKota(${JSON.stringify(state.kodeKab)})`, rKab);
      addResultCard(
        `listKabKota(${JSON.stringify(state.provFilter)}) (${rList.ok ? rList.value.length : 0} wilayah)`,
        rList
      );

      return `import { getKabKota, listKabKota, cariWilayah } from "@ghifari29/id-kit/wilayah";

getKabKota(${JSON.stringify(state.kodeKab)});
listKabKota(${JSON.stringify(state.provFilter)});
cariWilayah(${JSON.stringify(state.query)}, { batas: ${state.batas} });`;
    },
  },
];

let activeId = MODULES[0].id;
let currentCode = "";

function renderOutputs(mod) {
  outputEl.textContent = "";
  currentCode = mod.render(mod.state);
  codeEl.textContent = currentCode;
}

function selectModule(id) {
  activeId = id;
  const mod = MODULES.find((m) => m.id === id) ?? MODULES[0];

  for (const btn of tabsEl.querySelectorAll(".tab-btn")) {
    btn.classList.toggle("active", btn.dataset.id === mod.id);
  }

  titleEl.textContent = mod.title;
  descEl.textContent = mod.desc;
  subpathEl.textContent = mod.subpath;
  warningEl.textContent = mod.warning;

  presetsEl.textContent = "";
  for (const preset of mod.presets) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-btn";
    btn.textContent = preset.label;
    btn.addEventListener("click", () => {
      Object.assign(mod.state, preset.patch);
      selectModule(mod.id);
    });
    presetsEl.append(btn);
  }

  controlsEl.textContent = "";
  mod.mount(mod.state, (patch) => {
    Object.assign(mod.state, patch);
    renderOutputs(mod);
  });

  renderOutputs(mod);
}

for (const mod of MODULES) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tab-btn";
  btn.dataset.id = mod.id;
  btn.textContent = mod.label;
  btn.addEventListener("click", () => selectModule(mod.id));
  tabsEl.append(btn);
}

function setupCopy(button, getText) {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getText());
      const prev = button.textContent;
      button.textContent = "Tersalin!";
      setTimeout(() => {
        button.textContent = prev;
      }, 1200);
    } catch {
      button.textContent = "Gagal salin";
    }
  });
}

setupCopy(copyInstallBtn, () => "npm i @ghifari29/id-kit");
setupCopy(copyCodeBtn, () => currentCode);

themeToggleBtn.addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  themeToggleBtn.textContent = next === "dark" ? "Mode Terang" : "Mode Gelap";
});

selectModule(activeId);
