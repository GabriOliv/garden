import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { openIn, rgb, type Theme } from "./support/site";

// Spec referencias-dossier: REF-01 a REF-12.
const ROOT = join(__dirname, "..");
const E2E = "docs/notes/e2e_useful";

const T = {
  paper: { ink: "#0b0c0e", inkMuted: "#50535a", signal: "#002fa7", rule: "#0b0c0e", ruleSoft: "#c6c7c1" },
  void: { ink: "#eeeeea", inkMuted: "#9ea1a8", signal: "#2b7fff", rule: "#eeeeea", ruleSoft: "#2c2f36" },
} as const;

/** Texto das seções de referências antes da feature (commit f04e9fd), por arquivo. */
const BEFORE: Record<string, { heading: string; text: string }> = JSON.parse(
  readFileSync(join(__dirname, "support", "references-before.json"), "utf-8"),
);

/** Palavras de um trecho de MDX, sem a marcação: listas, ênfase, links, tags e o atributo `tipo`. */
const words = (mdx: string): string[] =>
  mdx
    .replace(/<\/?Referencias>|<\/Referencia>/g, " ")
    .replace(/<Referencia tipo="[^"]*"(?: tema="([^"]*)")?>/g, (_, tema) => ` ${tema ?? ""} `)
    .replace(/^\s*- (Artigos|Livros|Contexto psicológico):\s*$/gm, " ")
    .replace(/^\s*- /gm, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|_/g, "")
    .split(/\s+/)
    .filter(Boolean);

/** A seção de referências de um arquivo, do título até o próximo `---`, nota de rodapé ou título. */
const section = (file: string): string => {
  const lines = readFileSync(join(ROOT, file), "utf-8").split("\n");
  const i = lines.findIndex((l) => /^##+ *Refer/.test(l));
  const end = lines.findIndex((l, k) => k > i && /^(---\s*$|\[\^|#{1,6} )/.test(l));
  return lines.slice(i + 1, end === -1 ? undefined : end).join("\n");
};

/** As linhas do FieldList logo depois do título de referências. */
const rows = (page: Page): Locator =>
  page.locator('h2:text-matches("^Referências")').locator("xpath=following-sibling::*[1]").locator(".ds-field");

test("REF-01 referências de E2E como FieldList record, uma linha por referência, na ordem de hoje", async ({ page }) => {
  await page.goto(E2E);
  const list = page.locator('h2:text-matches("^Referências")').locator("xpath=following-sibling::*[1]");
  await expect(list.locator("dl.ds-fields")).toHaveCount(1);
  const r = rows(page);
  await expect(r).toHaveCount(4);
  const starts = ["VOCKE, Ham.", "Cypress. Why Cypress?", "AXELROD, Arnon.", "CRISPIN, Lisa; GREGORY, Janet."];
  for (const [i, start] of starts.entries()) {
    expect((await r.nth(i).locator(".ds-field-value").innerText()).trim().startsWith(start), start).toBe(true);
  }
});

test("REF-02 rótulo no singular: ARTIGO, ARTIGO, LIVRO, LIVRO", async ({ page }) => {
  await page.goto(E2E);
  expect(await rows(page).locator(".ds-field-label").allInnerTexts()).toEqual(["ARTIGO", "ARTIGO", "LIVRO", "LIVRO"]);
});

test("REF-04 cada arquivo convertido mantém as palavras da seção de referências", () => {
  for (const [file, before] of Object.entries(BEFORE)) {
    const now = section(file);
    if (!now.includes("<Referencias>")) continue;
    expect(words(now), file).toEqual(words(before.text));
  }
});

for (const theme of ["paper", "void"] as Theme[]) {
  test(`REF-05 comentário abaixo da citação, em ink-muted e menor, em ${theme}`, async ({ page }) => {
    await openIn(page, E2E, theme);
    const value = rows(page).first().locator(".ds-field-value");
    const [cite, note] = await value.locator("p").evaluateAll((ps) =>
      ps.map((p) => ({ top: p.getBoundingClientRect().top, color: getComputedStyle(p).color, size: parseFloat(getComputedStyle(p).fontSize) })),
    );
    expect(note.top).toBeGreaterThan(cite.top);
    expect(cite.color).toBe(rgb(T[theme].ink));
    expect(note.color).toBe(rgb(T[theme].inkMuted));
    expect(note.size).toBeLessThan(cite.size);
  });

  test(`REF-09 texto, links e fios das referências só com tokens, em ${theme}`, async ({ page }) => {
    await openIn(page, E2E, theme);
    const allowed = new Set([...Object.values(T[theme]).map(rgb), "rgba(0, 0, 0, 0)"]);
    const paints = await rows(page).evaluateAll((els) =>
      els.flatMap((row) =>
        [row, ...Array.from(row.querySelectorAll("*"))].flatMap((el) => {
          const cs = getComputedStyle(el);
          const out = [cs.color];
          if (parseFloat(cs.borderBottomWidth) > 0) out.push(cs.borderBottomColor);
          if (parseFloat(cs.borderTopWidth) > 0) out.push(cs.borderTopColor);
          return out;
        }),
      ),
    );
    expect(paints.filter((c) => !allowed.has(c))).toEqual([]);
  });
}

test("REF-06 link cujo texto é a URL mostra host e caminho, cortados em 44 com …, e mantém o href", async ({ page }) => {
  await page.goto(E2E);
  const expected = [
    ["martinfowler.com/articles/practical-test-py…", "https://martinfowler.com/articles/practical-test-pyramid.html#End-to-endTests"],
    ["docs.cypress.io/app/get-started/why-cypress", "https://docs.cypress.io/app/get-started/why-cypress#Component-Testing"],
    ["doi.org/10.1007/978-1-4842-3832-5", "https://doi.org/10.1007/978-1-4842-3832-5"],
  ];
  const links = await rows(page)
    .locator("a")
    .evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute("href")]));
  expect(links).toEqual(expected);
});

test("REF-08 em 390 px o rótulo fica acima da citação, sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(E2E);
  const r = rows(page);
  for (let i = 0; i < (await r.count()); i++) {
    const label = (await r.nth(i).locator(".ds-field-label").boundingBox())!;
    const value = (await r.nth(i).locator(".ds-field-value").boundingBox())!;
    expect(label.y + label.height, `linha ${i}`).toBeLessThanOrEqual(value.y + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("REF-11 referência sem link mostra só citação e comentário, sem linha vazia", async ({ page }) => {
  await page.goto(E2E);
  const crispin = rows(page).nth(3).locator(".ds-field-value");
  await expect(crispin.locator("a")).toHaveCount(0);
  const texts = await crispin.locator(":scope > div > *").allInnerTexts();
  expect(texts.length).toBe(2);
  for (const t of texts) expect(t.trim().length).toBeGreaterThan(0);
});

test("REF-12 link com texto próprio fica como está", async ({ page }) => {
  await page.goto("exemplos/referencias");
  const link = page
    .locator('h2:text-is("Componente escolhido")')
    .locator("xpath=following-sibling::*")
    .locator(".ds-field a")
    .first();
  await expect(link).toHaveText("Practical Test Pyramid");
  await expect(link).toHaveAttribute("href", "https://martinfowler.com/articles/practical-test-pyramid.html");
});

test("REF-02 rótulos da nota Peltzman: ARTIGO e CONTEXTO PSICOLÓGICO", async ({ page }) => {
  await page.goto("docs/notes/peltzman_effect");
  expect(await rows(page).locator(".ds-field-label").allInnerTexts()).toEqual(["ARTIGO", "CONTEXTO PSICOLÓGICO"]);
});

test("REF-03 READMEs do CTFL e do CT-TAS: rótulo REFERÊNCIA em toda linha, inclusive a frase final", async ({ page }) => {
  for (const path of ["docs/istqb/ctfl", "docs/istqb/cttas"]) {
    await page.goto(path);
    const r = rows(page);
    await expect(r).toHaveCount(4);
    expect(await r.locator(".ds-field-label").allInnerTexts(), path).toEqual(Array(4).fill("REFERÊNCIA"));
    await expect(r.nth(3).locator(".ds-field-value")).toHaveText(
      "As demais bibliografias já estão referenciadas adequadamente nos Syllabus.",
    );
  }
});

for (const theme of ["paper", "void"] as Theme[]) {
  test(`REF-07 subtemas do Hawthorne como comentário acima da citação, em ${theme}`, async ({ page }) => {
    await openIn(page, "docs/notes/hawthorne_effect_on_documentation", theme);
    const r = rows(page);
    await expect(r).toHaveCount(2);
    for (const [i, [tema, cite]] of [
      ["Efeito Hawthorne:", "Gordon Diaper (1990)"],
      ["Documentação e Qualidade de Software", "D. L. Parnas and P. C. Clements"],
    ].entries()) {
      const [first, second] = await r
        .nth(i)
        .locator(".ds-field-value p")
        .evaluateAll((ps) =>
          ps.slice(0, 2).map((p) => ({ text: p.textContent!.trim(), top: p.getBoundingClientRect().top, color: getComputedStyle(p).color })),
        );
      expect(first.text).toBe(tema);
      expect(first.color).toBe(rgb(T[theme].inkMuted));
      expect(second.text.startsWith(cite)).toBe(true);
      expect(second.top).toBeGreaterThan(first.top);
    }
  });
}

test("REF-10 os 10 documentos escrevem as referências com <Referencias>, sem lista Markdown sob o título", () => {
  expect(Object.keys(BEFORE)).toHaveLength(10);
  for (const file of Object.keys(BEFORE)) {
    const now = section(file);
    expect(now.trim().startsWith("<Referencias>"), file).toBe(true);
    expect(now.trim().endsWith("</Referencias>"), file).toBe(true);
    expect(/^\s*- /m.test(now), `${file} sem lista Markdown`).toBe(false);
  }
});

test("REF-03 rascunhos com lista ABNT simples: toda referência com tipo Referência", () => {
  for (const file of [
    "docs/notes/metas_reducao_bugs_efeito_cobra.mdx",
    "docs/notes/testes_flaky_efeito_nocebo.mdx",
    "docs/notes/suite_testes_zeigarnik_cronico.mdx",
  ]) {
    const tipos = [...section(file).matchAll(/<Referencia tipo="([^"]*)"/g)].map((m) => m[1]);
    expect(tipos.length, file).toBeGreaterThan(4);
    expect(new Set(tipos), file).toEqual(new Set(["Referência"]));
  }
});
