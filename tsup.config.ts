import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "src/index.ts",
        format: "src/format/index.ts",
        phone: "src/phone/index.ts",
        nik: "src/nik/index.ts",
        mask: "src/mask/index.ts",
        npwp: "src/npwp/index.ts",
        bank: "src/bank/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
});