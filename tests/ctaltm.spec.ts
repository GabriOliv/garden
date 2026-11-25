import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { waitDiagrams } from "./support/site";

// Spec ctal-tm-resumo: CTM-01 a CTM-26.
const ROOT = join(__dirname, "..");
/** Cópia de `tmp/original-ctal-tm/ctal-tm.md` (o `tmp/` não vai para o git). */
const SOURCE = readFileSync(join(__dirname, "support", "ctal-tm-source.md"), "utf-8").split("\n");

/** Capítulos publicados: id do critério de títulos, rota, arquivo, H1 e tag de estágio. */
const CHAPTERS = [
  { n: 1, id: "CTM-01", path: "docs/istqb/ctal-tm/ctaltm_01", file: "docs/istqb/ctal-tm/ctaltm_01.mdx", h1: "1 Gerenciando as Atividades de Teste", stage: "stageB" },
  { n: 2, id: "CTM-02", path: "docs/istqb/ctal-tm/ctaltm_02", file: "docs/istqb/ctal-tm/ctaltm_02.mdx", h1: "2 Gerenciando o Produto", stage: "stageA" },
  { n: 3, id: "CTM-03", path: "docs/istqb/ctal-tm/ctaltm_03", file: "docs/istqb/ctal-tm/ctaltm_03.mdx", h1: "3 Gerenciando a Equipe", stage: "stageA" },
];

const README = "docs/istqb/ctal-tm";
const README_FILE = "docs/istqb/ctal-tm/README.mdx";

/** Arquivos MDX do CTAL-TM publicados. */
const FILES = [README_FILE, ...CHAPTERS.map((c) => c.file)];

/** Linhas da fonte do capítulo `n`: do `# n ` até o próximo `# `. */
const chapter = (n: number): string[] => {
  const start = SOURCE.findIndex((l) => l.startsWith(`# ${n} `));
  const end = SOURCE.findIndex((l, i) => i > start && /^# \d+ /.test(l));
  return SOURCE.slice(start, end === -1 ? undefined : end);
};

/** Linhas fora de bloco de código (` ``` `) e de bloco de fórmula (`$$`). */
const prose = (lines: string[]): string[] => {
  const out: string[] = [];
  let fence = false;
  let math = false;
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith("```")) { fence = !fence; continue; }
    if (fence) continue;
    if (t === "$$") { math = !math; continue; }
    if (math || /^\$\$.*\$\$$/.test(t)) continue;
    out.push(l);
  }
  return out;
};

/** Títulos que o resumo encurtou: texto da fonte → texto da página. */
const RENAMED: Record<string, string> = {
  "1.2.4 Atividades de gerenciamento de testes para vários modelos de ciclo de vida de desenvolvimento de software":
    "1.2.4 Atividades de gerenciamento de testes para vários modelos de ciclo de vida",
};

/** Títulos `##` a `######` da fonte, sem os `#`, com os encurtamentos de `RENAMED`. */
const sourceHeadings = (lines: string[]) =>
  prose(lines).flatMap((l) => {
    const m = l.match(/^#{2,6}\s+(.*\S)\s*$/);
    return m ? [RENAMED[m[1]] ?? m[1]] : [];
  });

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

const articleText = (page: Page) => page.locator("article").first().evaluate((el) => el.textContent ?? "");

/** Nível e texto de cada `h2`/`h3` do artigo, sem o link de âncora. */
const pageHeadings = (page: Page) =>
  page.locator("article h2[id], article h3[id]").evaluateAll((els) =>
    els.map((el) => {
      const copy = el.cloneNode(true) as Element;
      copy.querySelector("a.hash-link")?.remove();
      return { level: Number(el.tagName[1]), text: copy.textContent!.trim() };
    }),
  );

/** Frontmatter de um arquivo MDX como texto. */
const frontmatter = (file: string) => readFileSync(join(ROOT, file), "utf-8").split("---")[1];

/** Espera todos os diagramas Mermaid da página desenharem e devolve o texto de cada um. */
const diagrams = async (page: Page) => {
  await waitDiagrams(page);
  return page.locator(".docusaurus-mermaid-container svg").evaluateAll((els) => els.map((el) => (el.textContent ?? "").replace(/\s+/g, " ")));
};

for (const ch of CHAPTERS) {
  const src = chapter(ch.n);

  test(`${ch.id} capítulo ${ch.n}: H1 e títulos na ordem e com o texto da fonte`, async ({ page }) => {
    await page.goto(ch.path);
    await expect(page.locator("article h1")).toHaveText(ch.h1);
    expect((await pageHeadings(page)).map((h) => h.text)).toEqual(sourceHeadings(src));
  });

  test(`CTM-04 capítulo ${ch.n}: 3 partes em h3, 2 partes em h2`, async ({ page }) => {
    await page.goto(ch.path);
    const hs = await pageHeadings(page);
    expect(hs.length).toBe(sourceHeadings(src).length);
    for (const h of hs) {
      expect(h.level, h.text).toBe(/^\d+\.\d+\.\d+/.test(h.text) ? 3 : 2);
    }
  });

  test(`CTM-06 capítulo ${ch.n}: sem sintaxe Obsidian`, async ({ page }) => {
    await page.goto(ch.path);
    const text = await articleText(page);
    for (const bad of ["[[", "]]", "![[", "[!info]"]) expect(text, bad).not.toContain(bad);
  });

  test(`CTM-09 capítulo ${ch.n}: tags e sidebar_position`, async ({ page }) => {
    const fm = frontmatter(ch.file);
    expect(fm).toMatch(new RegExp(`^sidebar_position: ${ch.n}$`, "m"));
    await page.goto(ch.path);
    for (const tag of [ch.stage, "istqb", "ctaltm", "capitulo"]) {
      await expect(page.locator(`article a[rel="tag"][href$="/docs/tags/${tag}"]`), tag).toHaveCount(1);
    }
    await expect(page.locator('article a[rel="tag"]')).toHaveCount(4);
  });
}

test("CTM-17 quadrantChart Matriz de Poder e Interesse com os 4 quadrantes", async ({ page }) => {
  await page.goto("docs/istqb/ctal-tm/ctaltm_01");
  const texts = await diagrams(page);
  const matrix = texts.filter((t) => t.includes("Matriz de Poder e Interesse"));
  expect(matrix).toHaveLength(1);
  for (const q of ["Promotores", "Latentes", "Apáticos", "Defensores"]) expect(matrix[0]).toContain(q);
  await expect(page.locator(".docusaurus-mermaid-container svg[aria-roledescription='quadrantChart']")).toHaveCount(1);
});

test("CTM-18 figura DFS × BFS logo abaixo da tabela da 1.3.4", async ({ page }) => {
  await page.goto("docs/istqb/ctal-tm/ctaltm_01");
  // Primeiro elemento com imagem depois da tabela DFS × BFS, antes do próximo título.
  const next = await page.locator("article table").filter({ hasText: "DFS (Depth-First)" }).evaluate((table) => {
    let el = table.nextElementSibling;
    while (el && !/^H\d$/.test(el.tagName) && !el.querySelector("img")) el = el.nextElementSibling;
    if (!el || /^H\d$/.test(el.tagName)) return null;
    const img = el.querySelector("img")!;
    return { tag: el.tagName, alt: img.alt, legend: el.querySelector(".garden-fig-legend")?.textContent ?? "" };
  });
  expect(next).not.toBeNull();
  expect(next!.tag).toBe("FIGURE");
  expect(next!.legend).toContain("ORDEM DE EXECUÇÃO: DFS × BFS");
  for (const t of ["DFS", "BFS"]) expect(next!.alt).toContain(t);
});

test("CTM-19 figura do fluxo do defeito com os 5 estados e Fechado como único terminal", async ({ page }) => {
  await page.goto("docs/istqb/ctal-tm/ctaltm_02");
  const fig = page.locator("article figure").filter({ hasText: "FLUXO DE TRABALHO DO DEFEITO" });
  await expect(fig).toHaveCount(1);
  // O SVG pequeno entra inline (`data:`) no build: a figura é conferida pelo texto alternativo.
  const alt = (await fig.locator("img").getAttribute("alt")) ?? "";
  for (const state of ["Aberto", "Em Andamento", "Resolvido", "Fechado", "Rejeitado"]) expect(alt).toContain(state);
  await expect(fig.locator("figcaption")).toContainText("único estado terminal, Fechado");
});

test("CTM-08 as 2 fórmulas da 3.2.2 em KaTeX, iguais à fonte, sem $$ visível", async ({ page }) => {
  await page.goto("docs/istqb/ctal-tm/ctaltm_03");
  // A seção 3.2.2 vai do seu título até o fim do artigo (é a última).
  const formulas = page.locator("article h3[id=\"322-relação-custo-benefício-dos-testes\"] ~ * .katex");
  await expect(formulas).toHaveCount(2);
  await expect(page.locator("article .katex")).toHaveCount(2);
  // Cada fórmula é um bloco `$$` da fonte, inteiro, na ordem da fonte. O resumo deixou de fora a EMD por extenso.
  const source: string[] = [];
  let block: string[] | null = null;
  for (const l of chapter(3)) {
    const t = l.trim();
    const one = t.match(/^\$\$(.+)\$\$$/);
    if (one) source.push(one[1]);
    else if (t === "$$") {
      if (block) { source.push(block.join(" ")); block = null; } else block = [];
    } else if (block) block.push(t);
  }
  expect(source).toHaveLength(3);
  const texts = await formulas.locator(".katex-mathml annotation").allTextContents();
  const want = source.map(squash);
  expect(texts.map(squash)).toEqual(want.filter((f) => texts.map(squash).includes(f)));
  await expect(page.locator(".katex-display")).toHaveCount(2);
  expect(await articleText(page)).not.toContain("$$");
});

test("CTM-20 LineChart Curva de Boehm com os 5 pontos 1, 5, 10, 25 e 100", async ({ page }) => {
  await page.goto("docs/istqb/ctal-tm/ctaltm_03");
  const chart = page.locator("article figure").filter({ hasText: "CURVA DE BOEHM" }).getByRole("img", {
    name: "Curva de Boehm: custo relativo de correção por fase",
  });
  await expect(chart).toHaveCount(1);
  const xs = await page.locator("article figure .ds-lc-xlabel").allTextContents();
  expect(xs.map(squash)).toEqual(["Requisitos", "Design", "Codificação", "Testes", "Produção"]);
  const mdx = readFileSync(join(ROOT, "docs/istqb/ctal-tm/ctaltm_03.mdx"), "utf-8");
  const ys = [...mdx.matchAll(/\{ x: "[^"]+", y: (\d+)/g)].map((m) => Number(m[1]));
  expect(ys).toEqual([1, 5, 10, 25, 100]);
});

test("CTM-23 diagramas do CTAL-TM sem classDef, style, class nem init de tema", () => {
  let total = 0;
  for (const file of FILES) {
    const mdx = readFileSync(join(ROOT, file), "utf-8");
    const blocks = [...mdx.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
    total += blocks.length;
    for (const b of blocks) {
      expect(b, file).not.toMatch(/^\s*(classDef|style|class)\s/m);
      expect(b, file).not.toMatch(/:::\w/);
      expect(b, file).not.toMatch(/%%\{.*theme/);
    }
  }
  expect(total).toBeGreaterThan(0);
});

test("CTM-06 README: sem sintaxe Obsidian", async ({ page }) => {
  await page.goto(README);
  const text = await articleText(page);
  for (const bad of ["[[", "]]", "![[", "[!info]"]) expect(text, bad).not.toContain(bad);
});

test("CTM-10 README: H1 e os h2 Capítulos, Como estudar, Peso de cada capítulo, Fluxo de Estudo e Referências", async ({ page }) => {
  await page.goto(README);
  await expect(page.locator("article h1")).toHaveText("Certified Tester Advanced Level, Test Management");
  expect(await pageHeadings(page)).toEqual([
    { level: 2, text: "Capítulos" },
    { level: 2, text: "Como estudar com este resumo" },
    { level: 2, text: "Peso de cada capítulo" },
    { level: 2, text: "Fluxo de Estudo" },
    { level: 2, text: "Referências" },
  ]);
});

test("CTM-11 README: parágrafos de abertura e a data da certificação", async ({ page }) => {
  await page.goto(README);
  const text = squash(await articleText(page));
  for (const p of [
    "CTAL-TM é uma certificação reconhecida internacionalmente para profissionais de qualidade de software e teste de software. É oferecida pela ISTQB (International Software Testing Qualifications Board) e aborda o gerenciamento de testes. É uma certificação de nível avançado e tem a CTFL como pré-requisito.",
    "A seguir, você encontrará a documentação criada como resumo de estudo para a certificação CTAL-TM.",
    "A única base utilizada para a criação deste material foi o Syllabus da CTAL-TM 3.0, portanto, é recomendado que você consulte o documento oficial para obter informações mais detalhadas.",
    "Consegui a certificação CTAL-TM em 14/09/2026 e resolvi compartilhar o material que criei para estudar.",
  ]) {
    expect(text).toContain(p);
  }
});

test("CTM-12 README: cada link Capítulo N abre ctaltm_0N", async ({ page }) => {
  const links = [
    ["Capítulo 1: Gerenciando as Atividades de Teste", 1],
    ["Capítulo 2: Gerenciando o Produto", 2],
    ["Capítulo 3: Gerenciando a Equipe", 3],
  ] as const;
  for (const [name, n] of links) {
    await page.goto(README);
    await page.locator("article").getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/garden/docs/istqb/ctal-tm/ctaltm_0${n}$`));
    await expect(page.locator("article h1")).toHaveText(CHAPTERS[n - 1].h1);
  }
});

test("CTM-13 README: timeline com Primeira e Segunda Parte", async ({ page }) => {
  await page.goto(README);
  const texts = await diagrams(page);
  expect(texts).toHaveLength(1);
  await expect(page.locator(".docusaurus-mermaid-container svg[aria-roledescription='timeline']")).toHaveCount(1);
  // Cada texto da timeline na ordem; os `tspan` quebram sem espaço, então a comparação ignora espaços.
  const bare = (t: string) => t.replace(/\s+/g, "");
  const drawn = await page
    .locator(".docusaurus-mermaid-container svg text")
    .evaluateAll((els) => els.map((e) => e.textContent ?? ""));
  expect(drawn.map(bare)).toEqual(
    [
      "Primeira Parte", "Capítulo 1", "K2, K3, K4", "Gerenciando as Atividades de Teste",
      "Segunda Parte", "Capítulo 2", "K2, K3, K4", "Gerenciando o Produto",
      "Capítulo 3", "K2, K3, K4", "Gerenciando a Equipe",
      "Revisão", "Revisão final e Simulado", "Timeline de Estudo",
    ].map(bare),
  );
});

test("CTM-14 README: 4 linhas REFERÊNCIA, a última a frase das demais bibliografias", async ({ page }) => {
  await page.goto(README);
  const r = page.locator('h2:text-matches("^Referências")').locator("xpath=following-sibling::*[1]").locator(".ds-field");
  await expect(r).toHaveCount(4);
  expect(await r.locator(".ds-field-label").allInnerTexts()).toEqual(Array(4).fill("REFERÊNCIA"));
  expect((await r.locator(".ds-field-value").allTextContents()).map(squash)).toEqual([
    "Syllabus CTAL-TM 3.0 (BSTQB pt_BR) — Utilizado para a criação deste material.",
    "Syllabus CTAL-TM 3.0 (ISTQB en) — Documento oficial da ISTQB, utilizado para desambiguação de termos.",
    "MermaidJS — Utilizado para a criação de diagramas no markdown.",
    "As demais bibliografias já estão referenciadas adequadamente nos Syllabus.",
  ]);
});

test("CTM-15 README: tags stageB, istqb, ctaltm e readme; tag ctaltm com label CTAL-TM", async ({ page }) => {
  await page.goto(README);
  for (const tag of ["stageB", "istqb", "ctaltm", "readme"]) {
    await expect(page.locator(`article a[rel="tag"][href$="/docs/tags/${tag}"]`), tag).toHaveCount(1);
  }
  await expect(page.locator('article a[rel="tag"]')).toHaveCount(4);
  await page.goto("docs/tags/ctaltm");
  await expect(page.locator("main h1")).toContainText("CTAL-TM");
  // README + 3 capítulos.
  await expect(page.locator("main article")).toHaveCount(4);
});

test("CTM-16 sidebar ISTQB na ordem CTFL, CT-TAS, CTAL-TM", async ({ page }) => {
  await page.goto(README);
  const labels = await page
    .locator(".theme-doc-sidebar-container .theme-doc-sidebar-item-category-level-1 > div > a.menu__link")
    .allTextContents();
  expect(labels.map(squash)).toEqual(["CTFL", "CT-TAS", "CTAL-TM"]);
});

test("CTM-26 a 390 px as 4 páginas não rolam na horizontal; tabela larga rola dentro do bloco", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  let wideTables = 0;
  let wideFormulas = 0;
  for (const path of [README, ...CHAPTERS.map((c) => c.path)]) {
    await page.goto(path);
    await diagrams(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(390);
    const tables = await page.locator("article table").evaluateAll((els) =>
      els.map((t) => ({
        right: t.getBoundingClientRect().right,
        wide: t.scrollWidth > t.clientWidth,
        overflow: getComputedStyle(t).overflowX,
      })),
    );
    for (const [i, t] of tables.entries()) {
      expect(t.right, `${path} tabela ${i + 1} dentro da janela`).toBeLessThanOrEqual(390);
      if (t.wide) expect(["auto", "scroll"], `${path} tabela ${i + 1} rola no bloco`).toContain(t.overflow);
    }
    wideTables += tables.filter((t) => t.wide).length;
    const formulas = await page.locator("article .katex-display").evaluateAll((els) =>
      els.map((f) => ({ wide: f.scrollWidth > f.clientWidth, overflow: getComputedStyle(f).overflowX })),
    );
    for (const [i, f] of formulas.entries()) {
      expect(["auto", "scroll"], `${path} fórmula ${i + 1} rola no bloco`).toContain(f.overflow);
    }
    wideFormulas += formulas.filter((f) => f.wide).length;
    for (const r of await page.locator(".docusaurus-mermaid-container svg").evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().right),
    )) {
      expect(r, `${path} diagrama dentro da janela`).toBeLessThanOrEqual(390);
    }
  }
  // A 390 px há tabela e fórmula mais largas que a coluna: a regra acima mediu casos reais.
  expect(wideTables).toBeGreaterThan(0);
  expect(wideFormulas).toBeGreaterThan(0);
});

test("CTM-27 diagrams devolve um texto por diagrama: README 1, capítulo 1 1, capítulo 2 1, capítulo 3 0", async ({
  page,
}) => {
  const expected: [string, number][] = [
    [README, 1],
    [CHAPTERS[0].path, 1],
    [CHAPTERS[1].path, 1],
    [CHAPTERS[2].path, 0],
  ];
  for (const [path, n] of expected) {
    await page.goto(path);
    const texts = await diagrams(page);
    expect(texts, path).toHaveLength(n);
    for (const t of texts) expect(t.trim(), path).not.toBe("");
  }
});

test("CTM-28 diagrams numa página sem Mermaid devolve lista vazia", async ({ page }) => {
  await page.goto("docs/project/about");
  await expect(page.locator("article h1")).toBeVisible();
  expect(await diagrams(page)).toEqual([]);
});
