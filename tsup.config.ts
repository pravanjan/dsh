import { defineConfig } from "tsup";

export default [
  // CLI binary — includes shebang, bundles React/Ink
  defineConfig({
    entry: { devtool: "bin/devtool.ts" },
    format: ["esm"],
    target: "node20",
    dts: false,
    clean: true,
    banner: { js: "#!/usr/bin/env node" },
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    esbuildOptions(opts) {
      opts.jsx = "transform";
      opts.jsxFactory = "React.createElement";
      opts.jsxFragment = "React.Fragment";
    },
  }),
  // Library entry — type declarations, no shebang
  defineConfig({
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node20",
    dts: true,
    clean: false,
    outDir: "dist",
    splitting: false,
    sourcemap: false,
  }),
];
