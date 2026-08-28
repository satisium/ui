import fs from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const projectRoot = import.meta.dirname;
const bundledPublicDir = path.resolve(projectRoot, "client", "public");
const ownerHostedPublicDir = path.resolve(
  projectRoot,
  "..",
  "..",
  "public",
  "examples",
  "lumen-house"
);
const usesBundledMedia = fs.existsSync(
  path.join(bundledPublicDir, "media", "lumen-house-site-tour-v2.mp4")
);
const configuredBase =
  process.env.LUMEN_BASE_PATH ||
  (usesBundledMedia ? "/" : "/examples/lumen-house/");
const base = configuredBase.endsWith("/")
  ? configuredBase
  : `${configuredBase}/`;
const publicDir = usesBundledMedia ? bundledPublicDir : ownerHostedPublicDir;

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@/components/satisium-ui",
        replacement: path.resolve(projectRoot, "components", "satisium-ui"),
      },
      {
        find: "@",
        replacement: path.resolve(projectRoot, "client", "src"),
      },
    ],
  },
  root: path.resolve(projectRoot, "client"),
  publicDir,
  build: {
    outDir: path.resolve(
      projectRoot,
      process.env.LUMEN_OUT_DIR || "dist/public"
    ),
    emptyOutDir: true,
  },
});
