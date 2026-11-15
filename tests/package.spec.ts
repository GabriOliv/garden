import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import config from "../docusaurus.config";

const RELEASE =
  "https://github.com/GabriOliv/dossier/releases/download/v1.1.0/gabrioliv-dossier-1.1.0.tgz";

test("REL-01 Dossier declarado pela URL da release 1.1.0", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(pkg.dependencies["@gabrioliv/dossier"]).toBe(RELEASE);
  expect(existsSync("vendor")).toBe(false);
});

test("REL-02 lockfile registra o integrity do tarball da release 1.1.0", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  expect(lock.packages[""].dependencies["@gabrioliv/dossier"]).toBe(RELEASE);
  const entry = lock.packages["node_modules/@gabrioliv/dossier"];
  expect(entry.version).toBe("1.1.0");
  expect(entry.resolved).toBe(RELEASE);
  expect(entry.integrity).toMatch(/^sha512-[A-Za-z0-9+/]+={0,2}$/);
});

test("PKG-02 build falha em link quebrado: onBrokenLinks é \"throw\"", () => {
  expect(config.onBrokenLinks).toBe("throw");
});

test("BRIDGE-08 o Garden não tem src/css/chrome.css", () => {
  expect(existsSync("src/css/chrome.css")).toBe(false);
});
