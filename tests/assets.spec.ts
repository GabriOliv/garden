import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { PAGES, openIn } from "./support/site";

type Asset = { item: number; path: string; sha256: string };

/** Itens 04 a 18 e 20 a 29 de `legacy-assets.md`, com o sha256 do commit d45fc13. */
const ASSETS: Asset[] = JSON.parse(
  readFileSync(join(__dirname, "support", "legacy-assets.json"), "utf-8"),
);
const ROOT = join(__dirname, "..");

/** Parte do nome do arquivo que sobrevive ao hash do webpack: nome sem a extensão. */
const stem = (item: number) => {
  const path = ASSETS.find((a) => a.item === item)!.path;
  return path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
};

/** A imagem está visível, tem largura natural e o arquivo responde 200. */
async function expectLoaded(page: Page, img: Locator, label: string) {
  await img.scrollIntoViewIfNeeded();
  await expect(img, label).toBeVisible();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth), { message: label })
    .toBeGreaterThan(0);
  const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
  const response = await page.request.get(src);
  expect(response.status(), `${label} ${src}`).toBe(200);
}

const imgOf = (page: Page, item: number) =>
  page.locator(`main img[src*="${stem(item)}"]`).first();

test("ASSET-01 os 22 arquivos legado existem no caminho e com o sha256 de d45fc13", () => {
  expect(ASSETS).toHaveLength(22);
  for (const { path, sha256 } of ASSETS) {
    const digest = createHash("sha256").update(readFileSync(join(ROOT, path))).digest("hex");
    expect(digest, path).toBe(sha256);
  }
});

test("ASSET-02 os itens 04 a 14 seguem servidos no caminho de hoje", async ({ request }) => {
  // As páginas trocaram esses undraw por banners do Dossier (IMG-12, AD-012); os arquivos ficam no site.
  for (const { item, path } of ASSETS.filter((a) => a.item >= 4 && a.item <= 14)) {
    const url = path.replace(/^static\//, "");
    expect((await request.get(url)).status(), `item ${item} ${url}`).toBe(200);
  }
});
