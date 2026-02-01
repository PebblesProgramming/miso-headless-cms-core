import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      ui: "src/ui.ts",
      cli: "src/cli/index.ts",
    },
    format: ["esm"],
    dts: true,
    clean: true,
  },
]);
