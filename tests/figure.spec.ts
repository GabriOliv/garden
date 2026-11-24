import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator } from "@playwright/test";
import { PAGES, openIn, rgb } from "./support/site";

const ROOT = join(__dirname, "..");
const ASSETS = "docs/notes/assets";

/**
 * Os 11 SVGs com legenda no topo (spec figure-legend): a altura antes do recorte,
 * se o tema vem de `prefers-color-scheme` e quantas tags o arquivo tinha.
 */
const SVGS: { file: string; height: number; themed: boolean; tags: number }[] = [
  { file: "diagrama-efeito-peltzman-dossier.svg", height: 392, themed: true, tags: 167 },
  { file: "diagrama-jenga-dossier.svg", height: 440, themed: true, tags: 302 },
  { file: "diagrama-sdlc-com-cobertura-dossier.svg", height: 202, themed: true, tags: 163 },
  { file: "diagrama-sdlc-sem-cobertura-dossier.svg", height: 202, themed: true, tags: 159 },
  { file: "efeito-hawthorne-documentacao-dossier.svg", height: 440, themed: true, tags: 228 },
  { file: "hawthorne-blueprint.svg", height: 440, themed: false, tags: 228 },
  { file: "hawthorne-paper.svg", height: 440, themed: false, tags: 228 },
  { file: "hawthorne-void.svg", height: 440, themed: false, tags: 228 },
  { file: "peltzman-blueprint.svg", height: 392, themed: false, tags: 167 },
  { file: "peltzman-paper.svg", height: 392, themed: false, tags: 167 },
  { file: "peltzman-void.svg", height: 392, themed: false, tags: 167 },
];

const read = (file: string) => readFileSync(join(ROOT, ASSETS, file), "utf-8");

test("SVG-01 os 11 SVGs não desenham a legenda nem a régua do topo", () => {
  for (const { file } of SVGS) {
    const svg = read(file);
    expect(svg.includes("FIG."), `${file} sem FIG.`).toBe(false);
    expect(svg.includes("GARDEN · REV A"), `${file} sem GARDEN · REV A`).toBe(false);
    expect(svg.includes('y1="36"'), `${file} sem régua y1=36`).toBe(false);
  }
});

test("SVG-02 viewBox começa em y=40 e a altura perde 40", () => {
  for (const { file, height } of SVGS) {
    const root = read(file).match(/<svg\b[^>]*>/)![0];
    const h = height - 40;
    expect(root.match(/viewBox="([^"]*)"/)![1].split(/\s+/).map(Number), `${file} viewBox`).toEqual([0, 40, 800, h]);
    expect(Number(root.match(/\sheight="([^"]*)"/)![1]), `${file} height`).toBe(h);
    expect(Number(root.match(/\swidth="([^"]*)"/)![1]), `${file} width`).toBe(800);
  }
});

test("SVG-03 tema mantido e só as 3 tags da legenda saem do desenho", () => {
  for (const { file, themed, tags } of SVGS) {
    const svg = read(file);
    expect(svg.includes("prefers-color-scheme"), `${file} tema`).toBe(themed);
    expect(svg.match(/<[a-zA-Z]/g)!.length, `${file} tags`).toBe(tags - 3);
  }
});

const SDLC = "docs/notes/test_coverage_sdlc";
const JENGA = "docs/notes/software_ongoing_manual_testing";
const HAWTHORNE = "docs/notes/hawthorne_effect_on_documentation";

/** Legendas esperadas por nota, na ordem da página (FIG-04, FIG-05). */
const LEGENDS: [string, string[]][] = [
  [SDLC, ["FIG. 01 — SDLC SEM COBERTURA DE TESTES", "FIG. 02 — SDLC COM COBERTURA DE TESTES"]],
  [JENGA, ["FIG. 01 — JENGA AO LONGO DO TEMPO"]],
  // AD-020: o Mermaid vem antes do SVG na nota Peltzman (FIG-10).
  [PAGES.peltzman, ["FIG. 01 — SDLC COM NOVA CAMADA DE QUALIDADE", "FIG. 02 — EFEITO PELTZMAN · CENTRALIZAÇÃO DA RESPONSABILIDADE"]],
  [HAWTHORNE, ["FIG. 01 — EFEITO HAWTHORNE NA DOCUMENTAÇÃO"]],
];

const FIG = "article figure.garden-fig";
const LEGEND = `${FIG} > .garden-fig-legend`;

/** Caixa de um elemento na página. */
const box = (l: Locator) => l.evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);

/** A imagem visível de uma figura: a outra versão do tema fica escondida (IMG-13). */
const image = (fig: Locator) => fig.locator("img:visible");

/** O desenho de uma figura: a imagem ou o diagrama Mermaid (AD-020). */
const drawing = (fig: Locator) => fig.locator("img:visible, .docusaurus-mermaid-container");

for (const theme of ["paper", "void"] as const) {
  const ink = theme === "paper" ? "#0b0c0e" : "#eeeeea";
  const muted = theme === "paper" ? "#50535a" : "#9ea1a8";

  test(`FIG-01 legenda acima da imagem, mono 500 11px, caixa alta, ink-muted, GARDEN · REV A à direita, em ${theme}`, async ({ page }) => {
    for (const [path, legends] of LEGENDS) {
      await openIn(page, path, theme);
      await expect(page.locator(LEGEND)).toHaveCount(legends.length);
      for (const fig of await page.locator(FIG).all()) {
        const legend = fig.locator(".garden-fig-legend");
        const [title, meta] = [legend.locator("> span").nth(0), legend.locator("> span").nth(1)];
        await expect(meta).toHaveText("GARDEN · REV A");
        for (const span of [title, meta]) {
          const s = await span.evaluate((el) => {
            const c = getComputedStyle(el);
            return [c.fontFamily, c.fontWeight, c.fontSize, c.textTransform, c.color];
          });
          expect(s[0]).toContain("IBM Plex Mono");
          expect(s.slice(1)).toEqual(["500", "11px", "uppercase", rgb(muted)]);
        }
        const [t, m] = [await box(title), await box(meta)];
        expect(m.left, `${path} meta à direita do título`).toBeGreaterThan(t.left);
        expect((await box(legend)).bottom, `${path} legenda acima da imagem`).toBeLessThanOrEqual((await box(drawing(fig))).top + 0.5);
      }
    }
  });

  test(`FIG-02 régua de 2 px em ink entre a legenda e a imagem, em ${theme}`, async ({ page }) => {
    for (const [path] of LEGENDS) {
      await openIn(page, path, theme);
      for (const fig of await page.locator(FIG).all()) {
        const legend = fig.locator(".garden-fig-legend");
        const b = await legend.evaluate((el) => {
          const c = getComputedStyle(el);
          return [c.borderBottomWidth, c.borderBottomStyle, c.borderBottomColor];
        });
        expect(b, path).toEqual(["2px", "solid", rgb(ink)]);
      }
    }
  });
}

test("FIG-03 texto e régua recuados 3% da largura da figura de cada lado, e a imagem ocupa a figura", async ({ page }) => {
  for (const [path] of LEGENDS) {
    await page.goto(path);
    // A figura Mermaid não tem recuo (FIG-12).
    for (const fig of await page.locator(FIG).filter({ has: page.locator("img") }).all()) {
      const f = await box(fig);
      const l = await box(fig.locator(".garden-fig-legend"));
      const i = await box(image(fig));
      expect(Math.abs(l.left - (f.left + 0.03 * f.width)), `${path} esquerda`).toBeLessThanOrEqual(1);
      expect(Math.abs(f.right - 0.03 * f.width - l.right), `${path} direita`).toBeLessThanOrEqual(1);
      expect(Math.abs(i.width - f.width), `${path} imagem na largura da figura`).toBeLessThanOrEqual(1);
    }
  }
});

test("FIG-04 FIG-05 numeração pela ordem da página e títulos exatos", async ({ page }) => {
  for (const [path, legends] of LEGENDS) {
    await page.goto(path);
    const seen: string[] = [];
    for (const legend of await page.locator(LEGEND).all()) {
      seen.push((await legend.locator("> span").first().textContent())!.replace(/\s+/g, " ").trim());
    }
    expect(seen, path).toEqual(legends);
  }
});

test("FIG-06 frase descritiva abaixo da imagem, corpo de texto em ink, com a mesma nota de rodapé", async ({ page }) => {
  const CAPTIONS: [string, string[], string[]][] = [
    [SDLC, ["Iteração de desenvolvimento sem cobertura de testes", "Iteração de desenvolvimento com cobertura de testes"], ["1", "2"]],
    [JENGA, ['Jenga ao longo do tempo: o risco de depender de testes manuais em softwares "ongoing"'], []],
  ];
  await openIn(page, SDLC, "paper");
  for (const [path, texts, refs] of CAPTIONS) {
    await page.goto(path);
    const figs = await page.locator(FIG).all();
    expect(figs).toHaveLength(texts.length);
    for (const [k, fig] of figs.entries()) {
      const cap = fig.locator("> figcaption");
      await expect(cap).toHaveCount(1);
      const ref = cap.locator("a[data-footnote-ref]");
      const own = await cap.evaluate((el) => {
        const copy = el.cloneNode(true) as Element;
        copy.querySelectorAll("sup").forEach((s) => s.remove());
        return copy.textContent!.replace(/\s+/g, " ").trim();
      });
      expect(own, path).toBe(texts[k]);
      if (refs[k]) {
        await expect(ref).toHaveCount(1);
        expect(Number(await ref.textContent()), `${path} nota`).toBe(Number(refs[k]));
        await expect(page.locator(await ref.getAttribute("href").then((h) => h!))).toHaveCount(1);
      } else await expect(ref).toHaveCount(0);
      const s = await cap.evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.fontFamily, c.fontSize, c.lineHeight, c.fontWeight, c.color];
      });
      expect(s[0], `${path} família sans`).toMatch(/^"?IBM Plex Sans"?,/);
      expect(s.slice(1), path).toEqual(["14px", "21px", "400", rgb("#0b0c0e")]);
      expect((await box(cap)).top, `${path} frase abaixo da imagem`).toBeGreaterThanOrEqual((await box(image(fig))).bottom - 0.5);
    }
  }
});

test("FIG-07 em 390 px a legenda quebra linha e a página não rola na horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const [path] of LEGENDS) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(390);
    for (const legend of await page.locator(LEGEND).all()) {
      const l = await box(legend);
      expect(l.right, `${path} legenda dentro da janela`).toBeLessThanOrEqual(390);
      // Nenhum título cabe numa linha de 390 px junto de GARDEN · REV A: a legenda quebra (linha de 14 px).
      expect(l.height, `${path} legenda em mais de uma linha`).toBeGreaterThanOrEqual(28 + 8);
      for (const span of await legend.locator("> span").all()) {
        expect((await box(span)).right, `${path} texto dentro da legenda`).toBeLessThanOrEqual(l.right + 0.5);
      }
    }
  }
});

test("FIG-09 figura sem frase não tem figcaption", async ({ page }) => {
  for (const [path, count] of [[PAGES.peltzman, 2], [HAWTHORNE, 1]] as const) {
    await page.goto(path);
    await expect(page.locator(FIG)).toHaveCount(count);
    await expect(page.locator(`${FIG} figcaption`)).toHaveCount(0);
  }
});

/** A figura Mermaid da nota Peltzman (AD-020): a primeira, sem imagem. */
const mermaidFig = (page: import("@playwright/test").Page) =>
  page.locator(FIG).filter({ has: page.locator(".docusaurus-mermaid-container") });

test("FIG-10 Peltzman: FIG. 01 sobre o Mermaid e FIG. 02 sobre o SVG", async ({ page }) => {
  await page.goto(PAGES.peltzman);
  const figs = await page.locator(FIG).all();
  expect(figs).toHaveLength(2);
  await expect(figs[0].locator(".docusaurus-mermaid-container svg")).toBeAttached();
  await expect(figs[0].locator(".garden-fig-legend > span").first()).toHaveText("FIG. 01 — SDLC COM NOVA CAMADA DE QUALIDADE");
  await expect(figs[0].locator(".garden-fig-legend > span").nth(1)).toHaveText("GARDEN · REV A");
  await expect(figs[1].locator("img:visible")).toHaveAttribute("src", /\/diagrama-efeito-peltzman-dossier[^/]*\.svg(#.*)?$/);
  await expect(figs[1].locator(".garden-fig-legend > span").first()).toHaveText(
    "FIG. 02 — EFEITO PELTZMAN · CENTRALIZAÇÃO DA RESPONSABILIDADE",
  );
});

test("FIG-11 figura Mermaid sem figcaption e sem a frase fora da legenda", async ({ page }) => {
  await page.goto(PAGES.peltzman);
  const fig = mermaidFig(page);
  await expect(fig).toHaveCount(1);
  await expect(fig.locator("figcaption")).toHaveCount(0);
  await expect(page.locator("article figcaption")).toHaveCount(0);
  const outside = await page.locator("article").evaluate((el) => {
    const copy = el.cloneNode(true) as Element;
    copy.querySelectorAll(".garden-fig-legend").forEach((l) => l.remove());
    return /SDLC com nova camada de qualidade/i.test(copy.textContent!);
  });
  expect(outside).toBe(false);
});

test("FIG-12 legenda da figura Mermaid na largura toda, sem recuo", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(PAGES.peltzman);
    const fig = mermaidFig(page);
    const f = await box(fig);
    const l = await box(fig.locator(".garden-fig-legend"));
    expect(Math.abs(l.left - f.left), `${width} esquerda`).toBeLessThanOrEqual(1);
    expect(Math.abs(f.right - l.right), `${width} direita`).toBeLessThanOrEqual(1);
  }
});

test("FIG-13 bloco mermaid da nota Peltzman igual ao de 2101504 e diagrama desenhado", async ({ page }) => {
  const mdx = readFileSync(join(ROOT, "docs/notes/peltzman_effect.mdx"), "utf-8");
  const block = mdx.match(/```mermaid\n[\s\S]*?\n\s*```/)![0];
  expect(createHash("sha256").update(block).digest("hex")).toBe(
    "ecf04b3de37ce4c5e24107b1b074e0b4345798be1ff403a13d7ab65a24466ec0",
  );
  await page.goto(PAGES.peltzman);
  await expect(mermaidFig(page).locator(".docusaurus-mermaid-container svg g.node").first()).toBeAttached();
});

test("FIG-14 as 5 notas com <Figure> usam o Figure do Garden, sem figure.ds-fig do Dossier", async ({ page }) => {
  for (const [note, legends] of [
    ["peltzman_effect", 2],
    ["hawthorne_effect_on_documentation", 1],
    ["test_coverage_sdlc", 2],
    ["software_ongoing_manual_testing", 1],
    ["e2e_useful", 1],
  ] as [string, number][]) {
    await page.goto(`docs/notes/${note}`);
    await expect(page.locator("article .garden-fig-legend"), note).toHaveCount(legends);
    await expect(page.locator("article figure.ds-fig"), note).toHaveCount(0);
  }
});
