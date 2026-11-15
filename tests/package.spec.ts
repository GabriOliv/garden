import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import config from "../docusaurus.config";

// Até T30, o Dossier vem do tarball local em vendor/ (build do Dossier com o bridge).
const LOCAL = "file:vendor/gabrioliv-dossier-local.tgz";

test("PKG-01 Dossier declarado pelo tarball local, com integridade no lockfile", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(pkg.dependencies["@gabrioliv/dossier"]).toBe(LOCAL);

  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  expect(lock.packages[""].dependencies["@gabrioliv/dossier"]).toBe(LOCAL);
  const entry = lock.packages["node_modules/@gabrioliv/dossier"];
  expect(entry.version).toBe("1.0.0");
  expect(entry.resolved).toBe(LOCAL);
  expect(entry.integrity).toMatch(/^sha512-[A-Za-z0-9+/]+={0,2}$/);
});

test("PKG-02 build falha em link quebrado: onBrokenLinks é \"throw\"", () => {
  expect(config.onBrokenLinks).toBe("throw");
});

test("BRIDGE-08 o Garden não tem src/css/chrome.css", () => {
  expect(existsSync("src/css/chrome.css")).toBe(false);
});
