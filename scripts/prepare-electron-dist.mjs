// Runs after `tsc -p tsconfig.electron.json`. Three jobs:
//   1. Drop a package.json into dist-electron/ declaring { "type": "commonjs" }
//      so Node/Electron treats the compiled .js files as CommonJS even
//      though the project root package.json declares "type": "module".
//   2. Copy the static renderer pages (splash/offline/crash HTML) that
//      electron/main.ts loads with loadFile() — tsc only compiles .ts.
//   3. Give dist-electron/ its OWN node_modules containing ONLY what the
//      compiled main process actually requires at runtime (electron-log,
//      electron-updater, and their transitive deps) — installed fresh via
//      `npm install` rather than copied from the root node_modules.
//
// Why #3 matters: the root package.json's "dependencies" also lists every
// package the *web app* needs (react, firebase, vite, etc.), because that's
// the same package.json `npm run build` uses. electron-builder auto-bundles
// everything listed there by default, which is how a shell that just loads
// a URL ended up shipping ~600MB of unrelated web dependencies. Giving
// dist-electron its own minimal package.json + install sidesteps that
// entirely — Node's module resolution walks up from
// dist-electron/electron/main.js to dist-electron/node_modules just fine.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distElectron = path.join(root, "dist-electron");

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));

const RUNTIME_DEPS = ["electron-log", "electron-updater"];
const runtimeDependencies = {};
for (const dep of RUNTIME_DEPS) {
  const version = rootPkg.dependencies?.[dep];
  if (!version) {
    console.warn(`prepare-electron-dist: "${dep}" missing from root package.json dependencies — skipping.`);
    continue;
  }
  runtimeDependencies[dep] = version;
}

fs.mkdirSync(distElectron, { recursive: true });
fs.writeFileSync(
  path.join(distElectron, "package.json"),
  JSON.stringify(
    {
      name: "bolt-desktop-runtime",
      version: rootPkg.version || "1.0.0",
      private: true,
      type: "commonjs",
      dependencies: runtimeDependencies,
    },
    null,
    2
  )
);

const rendererSrc = path.join(root, "electron", "renderer");
const rendererDest = path.join(distElectron, "electron", "renderer");
fs.mkdirSync(rendererDest, { recursive: true });
for (const file of fs.readdirSync(rendererSrc)) {
  fs.copyFileSync(path.join(rendererSrc, file), path.join(rendererDest, file));
}

console.log("Installing minimal runtime dependencies into dist-electron/node_modules ...");
execSync("npm install --omit=dev --no-audit --no-fund --no-package-lock", {
  cwd: distElectron,
  stdio: "inherit",
});

console.log("dist-electron prepared: module type set, renderer assets copied, runtime deps isolated.");
