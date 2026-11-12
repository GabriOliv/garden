import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";
import { openIn, rgb, type Theme } from "./support/site";

/** Tokens citados nos critérios DOC, LEFT e das tabelas (spec, "Valores dos tokens citados"). */
const T = {
  paper: { panel: "#e6e6e1", ink: "#0b0c0e", inkMuted: "#50535a", rule: "#0b0c0e", ruleSoft: "#c6c7c1", signal: "#002fa7" },
  void: { panel: "#16181d", ink: "#eeeeea", inkMuted: "#9ea1a8", rule: "#eeeeea", ruleSoft: "#2c2f36", signal: "#2b7fff" },
} as const;

const THEMES: Theme[] = ["paper", "void"];
const CTFL_01 = "docs/istqb/ctfl/ctfl_01";
const E2E = "docs/notes/e2e_useful";
const GETTING = "docs/project/getting_started";
// independence_test_article é draft: true, então não é publicado; os critérios usam as páginas publicadas.

const H2 = ".markdown h2";
const WIDE = 1280;

/** Estilo computado de um pseudo-elemento, com a propriedade pedida. */
const pseudo = (loc: Locator, name: "::before" | "::after", prop: string) =>
  loc.evaluateAll(
    (els, [n, p]) => els.map((el) => getComputedStyle(el, n).getPropertyValue(p)),
    [name, prop] as const,
  );

/** Converte a alinhamento escrito no separador da tabela (`:---`, `:---:`, `---:`) em valor de `text-align`. */
function markdownAlignments(file: string): string[][] {
  const tables: string[][] = [];
  let current: string[] | null = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (/^\|\s*:?-+/.test(line)) {
      current = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.startsWith(":") ? "left" : c.endsWith(":") ? "right" : "default"));
      tables.push(current);
    }
  }
  return tables;
}

test("DOC-05 barra de 32 × 6 px em signal acima de cada h2, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, CTFL_01, theme);
    const h2s = page.locator(H2);
    const count = await h2s.count();
    expect(count).toBeGreaterThan(0);
    for (const w of await pseudo(h2s, "::before", "width")) expect(w).toBe("32px");
    for (const h of await pseudo(h2s, "::before", "height")) expect(h).toBe("6px");
    for (const bg of await pseudo(h2s, "::before", "background-color")) expect(bg).toBe(rgb(T[theme].signal));
  }
});

test("DOC-06 h2 em maiúsculas por CSS, com o texto do DOM como escrito, em Paper e em Void", async ({ page }) => {
  // Títulos como escritos no Markdown (o `{#id}` opcional não faz parte do texto).
  const source = readFileSync(`${CTFL_01}.mdx`, "utf8")
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3).replace(/\s*\{#[^}]+\}\s*$/, "").trim());
  for (const theme of THEMES) {
    await openIn(page, CTFL_01, theme);
    const h2s = page.locator(H2);
    const dom = (await h2s.allTextContents()).map((t) => t.replace(/[\s​]+/g, " ").trim());
    expect(dom).toEqual(source);
    for (let i = 0; i < source.length; i++) await expect(h2s.nth(i)).toHaveCSS("text-transform", "uppercase");
  }
});

test("DOC-07 fio de 2 px em rule abaixo de cada h2, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, CTFL_01, theme);
    const h2s = page.locator(H2);
    const n = await h2s.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const h = h2s.nth(i);
      await expect(h).toHaveCSS("border-bottom-width", "2px");
      await expect(h).toHaveCSS("border-bottom-style", "solid");
      await expect(h).toHaveCSS("border-bottom-color", rgb(T[theme].rule));
    }
  }
});

test("DOC-08 h3 a h6 do artigo com text-transform none", async ({ page }) => {
  let checked = 0;
  for (const path of [CTFL_01, E2E, GETTING]) {
    await page.goto(path);
    const minor = page.locator(".markdown :is(h3, h4, h5, h6)");
    const n = await minor.count();
    checked += n;
    for (let i = 0; i < n; i++) await expect(minor.nth(i)).toHaveCSS("text-transform", "none");
  }
  expect(checked).toBeGreaterThan(0);
});

test("DOC-09 células das tabelas sem borda à esquerda e à direita", async ({ page }) => {
  await page.goto(CTFL_01);
  const cells = page.locator(".markdown table th, .markdown table td");
  const n = await cells.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await expect(cells.nth(i)).toHaveCSS("border-left-width", "0px");
    await expect(cells.nth(i)).toHaveCSS("border-right-width", "0px");
  }
});

test("DOC-10 cabeçalho da tabela com fio de 2 px em rule, fundo transparente e texto ink-muted, em Paper e em Void", async ({
  page,
}) => {
  for (const theme of THEMES) {
    await openIn(page, CTFL_01, theme);
    const heads = page.locator(".markdown table thead th");
    const n = await heads.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const th = heads.nth(i);
      await expect(th).toHaveCSS("border-bottom-width", "2px");
      await expect(th).toHaveCSS("border-bottom-color", rgb(T[theme].rule));
      await expect(th).toHaveCSS("background-color", /^rgba\(\d+, \d+, \d+, 0\)$/);
      await expect(th).toHaveCSS("color", rgb(T[theme].inkMuted));
    }
  }
});

test("DOC-11 fio de 1 px em rule-soft sob cada linha do corpo, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, CTFL_01, theme);
    const body = page.locator(".markdown table tbody td");
    const n = await body.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(body.nth(i)).toHaveCSS("border-bottom-width", "1px");
      await expect(body.nth(i)).toHaveCSS("border-bottom-color", rgb(T[theme].ruleSoft));
    }
  }
});

test("DOC-12 a 1280 px cada tabela tem a largura da coluna do artigo", async ({ page }) => {
  await page.setViewportSize({ width: WIDE, height: 900 });
  await page.goto(CTFL_01);
  const column = await page.locator(".markdown").first().boundingBox();
  const tables = page.locator(".markdown table");
  const n = await tables.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const box = await tables.nth(i).boundingBox();
    expect(Math.abs(box!.width - column!.width)).toBeLessThanOrEqual(1);
  }
});

test("DOC-13 alinhamento de cada coluna igual ao escrito no separador do Markdown", async ({ page }) => {
  const want = markdownAlignments(`${CTFL_01}.mdx`);
  await page.goto(CTFL_01);
  const tables = page.locator(".markdown table");
  expect(await tables.count()).toBe(want.length);
  for (let t = 0; t < want.length; t++) {
    const heads = tables.nth(t).locator("thead th");
    for (let c = 0; c < want[t].length; c++) {
      const align = await heads.nth(c).evaluate((el) => getComputedStyle(el).textAlign);
      const expected = want[t][c];
      if (expected === "default") expect(["left", "start"]).toContain(align);
      else expect(align, `tabela ${t + 1}, coluna ${c + 1}`).toBe(expected);
    }
  }
});

test("DOC-14 citação com fio de 2 px no topo e sem borda à esquerda, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, E2E, theme);
    const quote = page.locator(".markdown blockquote");
    await expect(quote).toHaveCount(1);
    await expect(quote).toHaveCSS("border-top-width", "2px");
    await expect(quote).toHaveCSS("border-top-style", "solid");
    await expect(quote).toHaveCSS("border-top-color", rgb(T[theme].rule));
    await expect(quote).toHaveCSS("border-left-width", "0px");
  }
});

test("DOC-15 texto da citação em Plex Sans Condensed de 32 px, maiúsculo, com aspa em signal", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, E2E, theme);
    const quote = page.locator(".markdown blockquote");
    await expect(quote).toHaveCSS("font-family", /IBM Plex Sans Condensed/);
    await expect(quote).toHaveCSS("font-size", "32px");
    await expect(quote).toHaveCSS("text-transform", "uppercase");
    // A aspa é o ::before do primeiro parágrafo da citação.
    const opening = quote.locator(":scope > :first-child");
    const [content] = await pseudo(opening, "::before", "content");
    expect(content).toContain("“");
    const [color] = await pseudo(opening, "::before", "color");
    expect(color).toBe(rgb(T[theme].signal));
  }
});

test("DOC-16 links do texto do artigo sublinhados em signal, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, E2E, theme);
    const links = page.locator(".markdown :is(p, li, blockquote) a:not(.hash-link)");
    const n = await links.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(links.nth(i)).toHaveCSS("text-decoration-line", "underline");
      await expect(links.nth(i)).toHaveCSS("color", rgb(T[theme].signal));
    }
  }
});

test("DOC-17 a 1280 px, parágrafos e listas com no máximo 68ch e texto de 16 px", async ({ page }) => {
  await page.setViewportSize({ width: WIDE, height: 900 });
  await page.goto(CTFL_01);
  const blocks = page.locator(".markdown > :is(p, ul, ol)");
  const n = await blocks.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const m = await blocks.nth(i).evaluate((el) => {
      // Um "0" com a fonte do bloco mede 1ch; o limite do bloco tem de ser 68 desses.
      const probe = document.createElement("span");
      probe.style.font = getComputedStyle(el).font;
      probe.style.position = "absolute";
      probe.textContent = "0".repeat(100);
      el.appendChild(probe);
      const ch = probe.getBoundingClientRect().width / 100;
      probe.remove();
      return { maxWidth: parseFloat(getComputedStyle(el).maxWidth), ch, size: getComputedStyle(el).fontSize };
    });
    expect(m.size).toBe("16px");
    expect(Math.abs(m.maxWidth - 68 * m.ch)).toBeLessThanOrEqual(1);
  }
});

test("DOC-19 a 390 px, tabela mais larga que a coluna rola na própria caixa, sem rolagem da página", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(CTFL_01);
  const tables = page.locator(".markdown table");
  const n = await tables.count();
  let overflowing = 0;
  for (let i = 0; i < n; i++) {
    const t = tables.nth(i);
    const { scroll, client, overflow } = await t.evaluate((el) => ({
      scroll: el.scrollWidth,
      client: el.clientWidth,
      overflow: getComputedStyle(el).overflowX,
    }));
    if (scroll > client) {
      overflowing++;
      expect(["auto", "scroll"]).toContain(overflow);
    }
  }
  expect(overflowing).toBeGreaterThan(0);
  const doc = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(doc).toBeLessThanOrEqual(0);
});

test("DOC-20 link de âncora do h2 leva a URL ao id do título", async ({ page }) => {
  await page.goto(CTFL_01);
  const h2 = page.locator(H2).nth(1);
  const id = await h2.getAttribute("id");
  expect(id).toBeTruthy();
  await h2.hover();
  await h2.locator("a.hash-link").click();
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${id}`);
  await expect(page.locator(`[id="${id}"]`)).toHaveText(/\S/);
  expect(await page.locator(`[id="${id}"]`).evaluate((el) => el.tagName)).toBe("H2");
});

test("LEFT-05 hr do artigo em rule, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    for (const path of [CTFL_01, E2E, GETTING]) {
      await openIn(page, path, theme);
      const rules = page.locator(".markdown hr");
      const n = await rules.count();
      expect(n, path).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        await expect(rules.nth(i)).toHaveCSS("background-color", rgb(T[theme].rule));
      }
    }
  }
});

test("LEFT-06 código em linha com fundo panel, em Paper e em Void", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, GETTING, theme);
    const inline = page.locator(".markdown :not(pre) > code");
    const n = await inline.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(inline.nth(i)).toHaveCSS("background-color", rgb(T[theme].panel));
    }
  }
});
