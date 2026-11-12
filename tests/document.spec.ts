import { expect, test } from "@playwright/test";
import { TOKENS, openIn, rgb, type Theme } from "./support/site";

/** `--ds-inverse` e `--ds-on-inverse` de cada tema (tokens.css do Dossier). */
const BAND = {
  paper: { inverse: "#0b0c0e", on: "#f4f4f1" },
  void: { inverse: "#eeeeea", on: "#0a0b0d" },
} as const;

const THEMES: Theme[] = ["paper", "void"];

const CTFL_01 = "docs/istqb/ctfl/ctfl_01";
const E2E = "docs/notes/e2e_useful";
const ABOUT = "docs/project/about";
// O documento de 61 caracteres (suite_testes_zeigarnik_cronico) não é publicado; este é o título mais longo do build.
const LONG = "docs/istqb/cttas/cttas_04";

test("DOC-01 título em um único h1, em faixa inversa", async ({ page }) => {
  for (const theme of THEMES) {
    for (const path of [CTFL_01, E2E]) {
      await openIn(page, path, theme);
      await expect(page.locator("h1")).toHaveCount(1);
      const h1 = page.locator("header.ds-header .ds-header-band h1");
      await expect(h1).toHaveCount(1);
      const band = page.locator("header.ds-header .ds-header-band");
      await expect(band).toHaveCSS("background-color", rgb(BAND[theme].inverse));
      await expect(h1).toHaveCSS("color", rgb(BAND[theme].on));
    }
  }
});

test("DOC-02 título da faixa em maiúsculas por CSS, com o texto do DOM como escrito", async ({
  page,
}) => {
  for (const [path, title] of [
    [CTFL_01, "1 Fundamentos de Teste"],
    [E2E, "E2E é Útil?"],
  ]) {
    await page.goto(path);
    const h1 = page.locator("h1");
    await expect(h1).toHaveText(title);
    await expect(h1).toHaveCSS("text-transform", "uppercase");
  }
});

test("DOC-03 rótulo da seção abaixo da faixa, em Plex Mono, maiúsculo e em signal", async ({
  page,
}) => {
  for (const theme of THEMES) {
    for (const [path, label] of [
      [ABOUT, "Sobre"],
      [E2E, "Notas"],
      [CTFL_01, "ISTQB"],
    ]) {
      await openIn(page, path, theme);
      const kicker = page.locator("header.ds-header .ds-header-kicker");
      await expect(kicker).toHaveText(label);
      await expect(kicker).toHaveCSS("text-transform", "uppercase");
      await expect(kicker).toHaveCSS("font-family", /IBM Plex Mono/);
      await expect(kicker).toHaveCSS("color", rgb(TOKENS[theme].signal));
      const [band, meta] = await Promise.all([
        page.locator(".ds-header-band").boundingBox(),
        page.locator(".ds-header-meta").boundingBox(),
      ]);
      expect(meta!.y).toBeGreaterThanOrEqual(band!.y + band!.height);
    }
  }
});

test("DOC-18 título longo quebra dentro da faixa, sem rolagem horizontal em 390 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(LONG);
  const h1 = page.locator("h1");
  await expect(h1).toHaveText("4 Estratégias Organizacionais de Implantação e Liberação para Automação de Teste");
  const m = await page.evaluate(() => {
    const h = document.querySelector("h1")!;
    const band = document.querySelector(".ds-header-band")!.getBoundingClientRect();
    const r = h.getBoundingClientRect();
    return {
      lines: Math.round(r.height / parseFloat(getComputedStyle(h).lineHeight)),
      inside: r.left >= band.left && r.right <= band.right,
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(m.lines).toBeGreaterThan(1);
  expect(m.inside).toBe(true);
  expect(m.scroll).toBeLessThanOrEqual(0);
});

test("DOC-04 sem rótulo quando o título é igual a ele, com um único h1 na faixa", async ({
  page,
}) => {
  // Título sintético "Notas" = rótulo da navbar: sem kicker.
  await page.goto("docs/notes");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header.ds-header .ds-header-band h1")).toHaveText("Notas");
  await expect(page.locator(".ds-header-kicker")).toHaveCount(0);

  // Título sintético "Comece a Leitura" difere de "Sobre": com kicker.
  await page.goto("docs/project");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header.ds-header .ds-header-band h1")).toHaveText("Comece a Leitura");
  await expect(page.locator(".ds-header-kicker")).toHaveText("Sobre");
});
