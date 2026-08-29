import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      ui: "src/ui.ts",
      webhooks: "src/webhooks.ts",
      cli: "src/cli/index.ts",
    },
    format: ["esm"],
    dts: true,
    clean: true,
  },
]);
