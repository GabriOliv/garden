import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PAGES, openIn } from "./support/site";

const PKG = join(__dirname, "..", "node_modules", "@gabrioliv", "dossier", "dist", "assets");
const ROOT = join(__dirname, "..");

/** A cópia no Garden é igual, byte a byte, ao arquivo do pacote. */
const sameAsPackage = (copy: string, original: string) =>
  expect(readFileSync(join(ROOT, copy)).equals(readFileSync(join(PKG, original))), copy).toBe(true);

const FLASK = (theme: string) => `flask-garden-001-dossier-${theme}.svg`;

test("IMG-01 home em Paper mostra o frasco -paper.svg do pacote", async ({ page }) => {
  await openIn(page, PAGES.home, "paper");
  const flask = page.locator(`main img[src$="/${FLASK("paper")}"]`);
  await expect(flask).toBeVisible();
  await expect.poll(() => flask.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(`main img[src$="/${FLASK("void")}"]:visible`)).toHaveCount(0);
  sameAsPackage(`static/img/dossier/${FLASK("paper")}`, `animations/${FLASK("paper")}`);
});

test("IMG-02 home em Void mostra o frasco -void.svg do pacote", async ({ page }) => {
  await openIn(page, PAGES.home, "void");
  const flask = page.locator(`main img[src$="/${FLASK("void")}"]`);
  await expect(flask).toBeVisible();
  await expect.poll(() => flask.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(`main img[src$="/${FLASK("paper")}"]:visible`)).toHaveCount(0);
  sameAsPackage(`static/img/dossier/${FLASK("void")}`, `animations/${FLASK("void")}`);
});

/** O `img` de um card de "Comece a Leitura" tem o arquivo `stem` e carrega. */
const expectBanner = async (page: Page, item: string, stem: string) => {
  const img = page.locator(`main [data-item="${item}"] img`);
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", new RegExp(`/${stem}[^/]*\\.svg$`));
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
};

test("IMG-03 cards CTFL e CT-TAS com banner-flask-dossier.svg", async ({ page }) => {
  await page.goto(PAGES.start);
  for (const item of ["CTFL", "CT-TAS"]) await expectBanner(page, item, "banner-flask-dossier");
  sameAsPackage("docs/project/assets/banner/banner-flask-dossier.svg", "banners/banner-flask-dossier.svg");
});

test("IMG-04 card Notas com banner-flask-qa-dossier.svg", async ({ page }) => {
  await page.goto(PAGES.start);
  await expectBanner(page, "Notas", "banner-flask-qa-dossier");
  sameAsPackage("docs/project/assets/banner/banner-flask-qa-dossier.svg", "banners/banner-flask-qa-dossier.svg");
});
