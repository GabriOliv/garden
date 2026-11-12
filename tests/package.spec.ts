import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import config from "../docusaurus.config";

const URL =
  "https://github.com/GabriOliv/dossier/releases/download/v1.0.0/gabrioliv-dossier-1.0.0.tgz";

test("PKG-01 Dossier declarado pela URL da release, com integridade no lockfile", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(pkg.dependencies["@gabrioliv/dossier"]).toBe(URL);

  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  expect(lock.packages[""].dependencies["@gabrioliv/dossier"]).toBe(URL);
  const entry = lock.packages["node_modules/@gabrioliv/dossier"];
  expect(entry.version).toBe("1.0.0");
  expect(entry.resolved).toBe(URL);
  expect(entry.integrity).toMatch(/^sha512-[A-Za-z0-9+/]+={0,2}$/);
});

test("PKG-02 build falha em link quebrado: onBrokenLinks é \"throw\"", () => {
  expect(config.onBrokenLinks).toBe("throw");
});
