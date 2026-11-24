import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import config from "../docusaurus.config";

const RELEASE =
  "https://github.com/GabriOliv/dossier/releases/download/v1.2.0/gabrioliv-dossier-1.2.0.tgz";
const INTEGRITY =
  "sha512-FbIQJWZvJS6ll58O7DCNuB8zjB3qvAKKF4DjusHV9n5dvJKjekJcjbMMvx0W40dQJjioIiMbUz2Rc3GBOplG1A==";

test("REL-01 Dossier declarado pela URL da release 1.2.0", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(pkg.dependencies["@gabrioliv/dossier"]).toBe(RELEASE);
  expect(existsSync("vendor")).toBe(false);
});

test("REL-02 lockfile registra o integrity do tarball da release 1.2.0", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  expect(lock.packages[""].dependencies["@gabrioliv/dossier"]).toBe(RELEASE);
  const entry = lock.packages["node_modules/@gabrioliv/dossier"];
  expect(entry.version).toBe("1.2.0");
  expect(entry.resolved).toBe(RELEASE);
  expect(entry.integrity).toBe(INTEGRITY);
});

test("PKG-02 build falha em link quebrado: onBrokenLinks é \"throw\"", () => {
  expect(config.onBrokenLinks).toBe("throw");
});

test("BRIDGE-08 o Garden não tem src/css/chrome.css", () => {
  expect(existsSync("src/css/chrome.css")).toBe(false);
});

test("BRIDGE-09 custom.css sem as regras de quadrantChart, xychart e KaTeX que o bridge 1.2.0 entrega", () => {
  const css = readFileSync("src/css/custom.css", "utf8");
  expect(css).not.toContain(".quadrant rect");
  expect(css).not.toContain(".katex-display");
  expect(css).not.toMatch(/xychart"\]\s+\.background/);
  expect(css).not.toMatch(/xychart"\]\s+path/);
  expect(css).not.toMatch(/xychart"\]\s+\.plot path/);
});

test("BRIDGE-10 custom.css mantém o texto do xychart em ink", () => {
  const css = readFileSync("src/css/custom.css", "utf8");
  expect(css).toMatch(/svg\[aria-roledescription="xychart"\] text \{\s*fill: var\(--ds-ink\) !important;\s*\}/);
});
