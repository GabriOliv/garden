import { expect, test, type Locator, type Page } from "@playwright/test";
import { openIn, type Theme } from "./support/site";

/** Largura de celular dos critérios TOUCH. */
const PHONE = { width: 390, height: 800 };
const TAGS = "docs/tags";
const CTFL_01 = "docs/istqb/ctfl/ctfl_01";

/** Caixa do elemento visível; falha se não houver nenhum. */
async function box(loc: Locator) {
  await expect(loc.first()).toBeVisible();
  const b = await loc.first().boundingBox();
  expect(b).not.toBeNull();
  return b!;
}

/** Abre em 390 px com o tema pedido. */
async function openPhone(page: Page, path: string, theme: Theme = "paper") {
  await page.setViewportSize(PHONE);
  await openIn(page, path, theme);
}

/** Cada elemento de `loc` tem pelo menos `min` px de largura e de altura. */
async function eachAtLeast(loc: Locator, min: number) {
  const n = await loc.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const b = await box(loc.nth(i));
    expect(b.width, `item ${i} largura`).toBeGreaterThanOrEqual(min);
    expect(b.height, `item ${i} altura`).toBeGreaterThanOrEqual(min);
  }
}

test("TOUCH-01 botão que abre o menu com pelo menos 44 × 44 px em 390 px", async ({ page }) => {
  await openPhone(page, TAGS);
  const b = await box(page.locator(".navbar__toggle"));
  expect(b.width).toBeGreaterThanOrEqual(44);
  expect(b.height).toBeGreaterThanOrEqual(44);
});

test("TOUCH-02 botão de busca da navbar com pelo menos 44 × 44 px em 390 px", async ({ page }) => {
  await openPhone(page, TAGS);
  const b = await box(page.locator(".navbar .DocSearch-Button:visible"));
  expect(b.width).toBeGreaterThanOrEqual(44);
  expect(b.height).toBeGreaterThanOrEqual(44);
});

test("TOUCH-03 botão de fechar o menu com pelo menos 44 × 44 px, com o menu aberto em 390 px", async ({ page }) => {
  await openPhone(page, TAGS);
  await page.locator(".navbar__toggle").click();
  await expect(page.locator(".navbar-sidebar")).toBeVisible();
  const b = await box(page.locator(".navbar-sidebar__close"));
  expect(b.width).toBeGreaterThanOrEqual(44);
  expect(b.height).toBeGreaterThanOrEqual(44);
});

test("TOUCH-04 botão de modo de cor com pelo menos 44 × 44 px, com o menu aberto em 390 px", async ({ page }) => {
  await openPhone(page, TAGS);
  await page.locator(".navbar__toggle").click();
  await expect(page.locator(".navbar-sidebar")).toBeVisible();
  const toggle = page
    .locator(".navbar-sidebar")
    .getByRole("button", { name: /Mudar entre modo claro e escuro/ });
  const b = await box(toggle);
  expect(b.width).toBeGreaterThanOrEqual(44);
  expect(b.height).toBeGreaterThanOrEqual(44);
});

test("TOUCH-05 cada chip de tag com pelo menos 24 × 24 px em 390 px", async ({ page }) => {
  await openPhone(page, TAGS);
  await eachAtLeast(page.locator('a[rel="tag"]'), 24);
});

test("TOUCH-06 cada link dos breadcrumbs com pelo menos 24 × 24 px em 390 px", async ({ page }) => {
  await openPhone(page, CTFL_01);
  await eachAtLeast(page.locator(".breadcrumbs__link"), 24);
});
