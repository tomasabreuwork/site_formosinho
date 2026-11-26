import { defineConfig } from "vite";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/* A v2 é publicada numa subpasta do GitHub Pages:
   https://tomasabreuwork.github.io/site_formosinho/v2/ */
const BASE = "/site_formosinho/v2/";

/* Copia os descodificadores Draco do three.js para dist/draco/,
   para que um .glb comprimido carregue sem depender de uma CDN. */
const copyDraco = () => ({
  name: "copy-draco",
  apply: "build",
  closeBundle() {
    const from = resolve("node_modules/three/examples/jsm/libs/draco/gltf");
    if (existsSync(from)) cpSync(from, resolve("dist/draco"), { recursive: true });
  },
});

export default defineConfig({
  base: BASE,
  plugins: [copyDraco()],
  build: { target: "es2020", assetsInlineLimit: 0, chunkSizeWarningLimit: 900 },
  server: { fs: { allow: [".."] } }, // em desenvolvimento, deixa ler js/gallery-data.js e fonts/ da v1
});
