import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { PAGES, TOKENS, drawing, openIn, rgb } from "./support/site";

/** As quatro tags de estágio, com os textos da spec. */
const STAGE_TAGS = [
  { tag: "stageA", label: "Estágio A · Semente", description: "Artigos Iniciais" },
  { tag: "stageB", label: "Estágio B · Broto", description: "Artigos Melhorados" },
  { tag: "stageC", label: "Estágio C · Árvore", description: "Artigos Intermediários" },
  { tag: "stageD", label: "Estágio D · Fruto", description: "Artigos Completos" },
] as const;

/**
 * Estágios com página de tag. Nenhuma nota usa `stageC` hoje, e o Docusaurus
 * só cria a página de uma tag que tem documento.
 */
const PUBLISHED = STAGE_TAGS.filter((s) => s.tag !== "stageC");

const EMOJI = /\p{Extended_Pictographic}/u;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("STAGE-05 título da aba das páginas de estágio em texto", async ({ page }) => {
  for (const { tag, label } of PUBLISHED) {
    await page.goto(`docs/tags/${tag}`);
    await expect(page).toHaveTitle(new RegExp(escape(label)));
    expect(await page.title()).not.toMatch(EMOJI);
  }
});

test("STAGE-06 descrição das tags de estágio sem emoji", async ({ page }) => {
  for (const { tag, description } of PUBLISHED) {
    await page.goto(`docs/tags/${tag}`);
    await expect(page.locator("main header p")).toHaveText(description);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      description,
    );
  }
});

/** Chip de uma tag pelo fim do `href`. */
const chip = (scope: Page | Locator, tag: string) =>
  scope.locator(`a[rel="tag"][href$="/docs/tags/${tag}"]`);

/** Rodapé de tags de um documento. */
const footer = (page: Page) => page.locator("article footer");

const byTag = (tag: string) => STAGE_TAGS.find((s) => s.tag === tag)!;

/** Uma nota com cada estágio publicado. */
const NOTE_OF = {
  stageA: PAGES.about,
  stageB: "docs/notes/hawthorne_effect_on_documentation",
  stageD: PAGES.peltzman,
} as const;

const expectIcon16 = async (link: Locator) => {
  const svg = link.locator("svg");
  await expect(svg).toHaveCount(1);
  const box = await svg.boundingBox();
  expect(box?.width).toBe(16);
  expect(box?.height).toBe(16);
};

test("STAGE-01 chip de estágio só com o StageIcon de 16 px", async ({ page }) => {
  await page.goto(PAGES.peltzman);
  const doc = chip(footer(page), "stageD");
  await expectIcon16(doc);
  await expect(doc).toHaveText("", { useInnerText: true });

  await page.goto("docs/tags");
  const stageChips = page.locator('a[rel="tag"][href*="/docs/tags/stage"]');
  await expect
    .poll(() => stageChips.evaluateAll((as) => as.map((a) => a.getAttribute("href"))))
    .toEqual(PUBLISHED.map((s) => `/garden/docs/tags/${s.tag}`));
  for (const { tag } of PUBLISHED) {
    const link = chip(page, tag);
    await expectIcon16(link);
    // Só a contagem fica visível: nenhum texto do label e nenhum emoji.
    await expect(link).toHaveText(/^\d+$/, { useInnerText: true });
  }
});

test("STAGE-02 nome acessível do chip de estágio", async ({ page }) => {
  for (const { tag, label } of PUBLISHED) {
    await page.goto(NOTE_OF[tag as keyof typeof NOTE_OF]);
    await expect(chip(footer(page), tag)).toHaveAccessibleName(label);
  }
});

test("STAGE-12 nome acessível do chip de estágio no índice de tags com a contagem", async ({
  page,
}) => {
  for (const { tag, label } of PUBLISHED) {
    // Contagem independente do chip: os documentos listados na página da tag.
    await page.goto(`docs/tags/${tag}`);
    const n = await page.locator("main article").count();
    expect(n).toBeGreaterThan(0);

    await page.goto("docs/tags");
    await expect(chip(page, tag)).toHaveAccessibleName(`${label} ${n}`);
  }
});

test("STAGE-03 clicar no chip abre a página da tag de estágio", async ({ page }) => {
  await page.goto(PAGES.peltzman);
  await chip(footer(page), "stageD").click();
  await expect(page).toHaveURL(/\/garden\/docs\/tags\/stageD$/);
  await expect(page.locator("h1")).toContainText(byTag("stageD").label);

  for (const { tag, label } of PUBLISHED) {
    await page.goto("docs/tags");
    await chip(page, tag).click();
    await expect(page).toHaveURL(new RegExp(`/garden/docs/tags/${tag}$`));
    await expect(page.locator("h1")).toContainText(label);
  }
});

test("STAGE-07 ícones A e B na cor do texto ao redor", async ({ page }) => {
  for (const tag of ["stageA", "stageB"] as const) {
    await page.goto(NOTE_OF[tag]);
    const link = chip(footer(page), tag);
    await expect(link.locator("svg")).toHaveCount(1);
    const { text, paints } = await link.evaluate((a) => ({
      text: getComputedStyle(a).color,
      paints: Array.from(a.querySelectorAll("svg *:not(title)")).map((el) => {
        const s = getComputedStyle(el);
        return s.stroke !== "none" ? s.stroke : s.fill;
      }),
    }));
    expect(paints.length).toBeGreaterThan(0);
    for (const paint of paints) expect(paint).toBe(text);
  }
});

test("STAGE-08 fruto do estágio D em signal, trocando com o modo de cor", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "paper");
  const fruit = chip(footer(page), "stageD").locator("svg circle");
  const fill = () => fruit.evaluate((el) => getComputedStyle(el).fill);
  await expect.poll(fill).toBe(rgb(TOKENS.paper.signal));

  // Marca a janela: se a página recarregar, a marca some.
  await page.evaluate(() => ((window as unknown as { stay: boolean }).stay = true));
  const toggle = page.getByRole("button", { name: /Mudar entre modo claro e escuro/ });
  const html = page.locator("html");
  await expect(async () => {
    if ((await html.getAttribute("data-theme")) !== "dark") await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark", { timeout: 1000 });
  }).toPass();
  await expect.poll(fill).toBe(rgb(TOKENS.void.signal));
  expect(await page.evaluate(() => (window as unknown as { stay?: boolean }).stay)).toBe(true);
});

test("STAGE-09 tag que não é de estágio mostra o texto, sem ícone", async ({ page }) => {
  // A nota do Efeito Peltzman tem o chip do estágio D e a tag `qa` de `docs/tags.yml`.
  await page.goto(PAGES.peltzman);
  const link = chip(footer(page), "qa");
  await expect(link).toHaveText("QA", { useInnerText: true });
  await expect(link.locator("svg")).toHaveCount(0);
  await link.click();
  await expect(page).toHaveURL(/\/garden\/docs\/tags\/qa$/);
  await expect(page.locator("h1")).toContainText('"QA"');
});

test("STAGE-10 SVG do estágio no HTML estático do build", () => {
  const html = readFileSync(join("build-test", "docs", "notes", "peltzman_effect.html"), "utf8");
  const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  const stageD = anchors.filter(
    (a) => /\brel="tag"/.test(a) && /\bhref="\/garden\/docs\/tags\/stageD"/.test(a),
  );
  expect(stageD.length).toBeGreaterThan(0);
  for (const a of stageD) expect(a).toContain("<svg");
});

/** Título do original em pt-BR, a partir do número de documentos da página. */
const tagPageTitle = (n: number, label: string) =>
  n === 1 ? `Um documento marcado com "${label}"` : `${n} documentos marcados com "${label}"`;

test("STAGE-04 ícone decorativo antes do nome no título da página de estágio", async ({
  page,
}) => {
  // Referência independente do título: o ícone do chip no rodapé de uma nota, cujo nome fixa o estágio.
  const expected: Record<string, string> = {};
  for (const { tag, label } of PUBLISHED) {
    await page.goto(NOTE_OF[tag as keyof typeof NOTE_OF]);
    expected[tag] = await drawing(footer(page).getByRole("img", { name: label, exact: true }));
  }
  expect(new Set(Object.values(expected)).size, "desenhos distintos nos chips").toBe(PUBLISHED.length);

  for (const { tag, label, description } of PUBLISHED) {
    await page.goto(`docs/tags/${tag}`);
    const h1 = page.locator("main h1");
    const svg = h1.locator("svg");
    await expect(svg).toHaveCount(1);
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(await drawing(svg), `ícone do título de ${tag}`).toBe(expected[tag]);
    const box = await svg.boundingBox();
    expect(box?.width).toBe(16);
    expect(box?.height).toBe(16);
    const { before, after } = await h1.evaluate((h) => {
      const icon = h.querySelector("svg")!;
      const head = document.createRange();
      head.setStart(h, 0);
      head.setEndBefore(icon);
      const tail = document.createRange();
      tail.setStartAfter(icon);
      tail.setEnd(h, h.childNodes.length);
      return { before: head.toString(), after: tail.toString() };
    });
    expect(before).not.toContain(label);
    expect(after).toContain(label);

    // Título, aba, descrição e lista continuam como no original.
    const n = await page.locator("main article").count();
    expect(n).toBeGreaterThan(0);
    await expect(h1).toHaveText(tagPageTitle(n, label));
    await expect(page).toHaveTitle(`${tagPageTitle(n, label)} | Garden`);
    await expect(page.locator("main header p")).toHaveText(description);
    await expect(page.locator("main header a")).toHaveAttribute("href", "/garden/docs/tags");
  }

  await page.goto("docs/tags/qa");
  const h1 = page.locator("main h1");
  await expect(h1.locator("svg")).toHaveCount(0);
  const n = await page.locator("main article").count();
  expect(n).toBeGreaterThan(0);
  await expect(h1).toHaveText(tagPageTitle(n, "QA"));
});

/** Os quatro emojis de estágio que a interface não pode mais mostrar. */
const STAGE_EMOJI = /[🌱🌿🌲🍎]/u;

/** Todos os `.html` de uma pasta, recursivamente. */
const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? htmlFiles(join(dir, e.name))
      : e.name.endsWith(".html")
        ? [join(dir, e.name)]
        : [],
  );

/** HTML do `h2` com `heading` e de tudo que vem depois dele, até o próximo `h2` ou `hr`. */
const sectionHTML = (page: Page, heading: string) =>
  page.locator("article h2", { hasText: heading }).evaluate((h2) => {
    let html = h2.outerHTML;
    for (let el = h2.nextElementSibling; el && !/^(H2|HR)$/.test(el.tagName); el = el.nextElementSibling)
      html += el.outerHTML;
    return html;
  });

/** HTML da tabela que vem depois do `h2` com `heading`. */
const tableHTML = (page: Page, heading: string) =>
  page
    .locator("article h2", { hasText: heading })
    .locator("xpath=following::table[1]")
    .evaluate((t) => t.outerHTML);

test("STAGE-11 nenhum emoji de estágio em chips, páginas de tag, legendas e títulos", async ({
  page,
}) => {
  // Build inteiro, lido do disco: todo chip de tag e todo `<title>`.
  const files = htmlFiles("build-test");
  expect(files.length).toBeGreaterThan(0);
  let chips = 0;
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    for (const [a] of html.matchAll(/<a\b[^>]*\brel="tag"[^>]*>[\s\S]*?<\/a>/g)) {
      chips++;
      expect(a, file).not.toMatch(STAGE_EMOJI);
    }
    for (const [title] of html.matchAll(/<title\b[^>]*>[\s\S]*?<\/title>/g))
      expect(title, file).not.toMatch(STAGE_EMOJI);
  }
  expect(chips).toBeGreaterThan(0);

  // Índice de tags e cada página de tag que ele lista, estágios inclusive.
  await page.goto("docs/tags");
  expect(await page.locator("main").evaluate((m) => m.outerHTML)).not.toMatch(STAGE_EMOJI);
  expect(await page.title()).not.toMatch(STAGE_EMOJI);
  const tagPages = await page
    .locator('main a[rel="tag"]')
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
  for (const { tag } of PUBLISHED) expect(tagPages).toContain(`/garden/docs/tags/${tag}`);
  for (const href of tagPages) {
    await page.goto(href.replace(/^\/garden\//, ""));
    expect(await page.locator("main").evaluate((m) => m.outerHTML), href).not.toMatch(STAGE_EMOJI);
    expect(await page.title(), href).not.toMatch(STAGE_EMOJI);
  }

  // Legenda de "Comece a Leitura".
  await page.goto(PAGES.start);
  const legend = await sectionHTML(page, "Organização por Evolução");
  expect(legend).toContain("Semente");
  expect(legend).not.toMatch(STAGE_EMOJI);
  expect(await page.title()).not.toMatch(STAGE_EMOJI);

  // Tabela de estágios do "Sobre"; a de objetivos prova que a varredura enxerga emoji.
  await page.goto(PAGES.about);
  const stages = await tableHTML(page, "Organização dos Conteúdos");
  expect(stages).toContain("Semente");
  expect(stages).not.toMatch(STAGE_EMOJI);
  expect(await tableHTML(page, "Objetivos do Projeto")).toMatch(STAGE_EMOJI);
  expect(await page.title()).not.toMatch(STAGE_EMOJI);
});
