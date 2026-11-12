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

test("ASSET-02 as páginas de hoje exibem os itens 04 a 14", async ({ page }) => {
  // home: itens 12 a 14 (o 01 foi trocado, IMG-01)
  await page.goto(PAGES.home);
  for (const item of [12, 13, 14]) {
    await expectLoaded(page, imgOf(page, item), `home item ${item}`);
  }

  // Comece a Leitura: banners do topo por largura e tema (os itens 02 e 03 foram trocados, IMG-03 e IMG-04)
  const banners = {
    390: { paper: [4], void: [5] },
    1280: { paper: [6, 8, 10], void: [7, 9, 11] },
  } as const;
  for (const width of [390, 1280] as const) {
    for (const theme of ["paper", "void"] as const) {
      await page.setViewportSize({ width, height: 844 });
      await openIn(page, PAGES.start, theme);
      for (const item of banners[width][theme]) {
        await expectLoaded(page, imgOf(page, item), `${width}px ${theme} item ${item}`);
      }
    }
  }
});
