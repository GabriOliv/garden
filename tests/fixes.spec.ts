import { readFileSync, readdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type AxeOptions = ConstructorParameters<typeof AxeBuilder>[0];

/** Toda página do `sitemap.xml` do build de teste, relativa ao `baseURL`. */
const sitemapPaths = () =>
  [...readFileSync("build-test/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname.replace(/^\/garden\/?/, ""),
  );


/** Nível, `id` e texto de cada título do artigo, sem o link de âncora. */
const headings = (page: Page) =>
  page.locator("article h2[id], article h3[id]").evaluateAll((els) =>
    els.map((el) => {
      const copy = el.cloneNode(true) as Element;
      copy.querySelector("a.hash-link")?.remove();
      return [Number(el.tagName[1]), el.id, copy.textContent!.trim()];
    }),
  );

/** `ctfl_01` como estava antes da troca de nível; 2 partes = h2, 3 partes = h3. */
const CTFL_01 = [
  [2, "11-o-que-é-teste", "1.1 O que é teste"],
  [3, "111-objetivos-do-teste", "1.1.1 Objetivos do Teste"],
  [3, "112-teste-e-depuração", "1.1.2 Teste e Depuração"],
  [2, "12-por-que-os-testes-são-necessários", "1.2 Por que os testes são NECESSÁRIOS?"],
  [3, "121-contribuições-para-o-sucesso-dos-testes", "1.2.1 Contribuições para o sucesso dos testes"],
  [3, "122-testes-e-garantia-da-qualidade-qa", "1.2.2 Testes e Garantia da Qualidade (QA)"],
  [3, "123-erros-defeitos-falhas-e-causa-raiz", "1.2.3 Erros, Defeitos, Falhas e Causa Raiz"],
  [2, "13-princípios-de-teste", "1.3 Princípios de Teste"],
  [2, "14-atividades-de-teste-testware-e-papéis-no-teste", "1.4 Atividades de teste, Testware e Papéis no teste"],
  [3, "141-atividades-e-tarefas-de-teste", "1.4.1 Atividades e Tarefas de Teste"],
  [3, "142-processo-de-teste-no-contexto", "1.4.2 Processo de Teste no Contexto"],
  [3, "143-testware", "1.4.3 Testware"],
  [3, "144-rastreabilidade-entre-a-base-de-teste-e-o-testware", "1.4.4 Rastreabilidade entre a Base de Teste e o Testware"],
  [3, "145-papéis-no-teste", "1.4.5 Papéis no Teste"],
  [2, "15-habilidades-essenciais-e-boas-práticas-em-testes", "1.5 Habilidades essenciais e boas práticas em testes"],
  [3, "151-habilidades-genéricas-necessárias-para-testes", "1.5.1 Habilidades genéricas necessárias para testes"],
  [3, "152-abordagem-de-equipe-completa", "1.5.2 Abordagem de equipe completa"],
  [3, "153-independência-dos-testes", "1.5.3 Independência dos testes"],
];

/** README do CT-TAS: os três títulos sem número viram h2. */
const CTTAS_README = [
  [2, "capítulos", "Capítulos"],
  [2, "fluxo-de-estudo", "Fluxo de Estudo"],
  [2, "referências", "Referências"],
];

test("FIX-04 título e âncora mantidos nos títulos que mudaram de nível", async ({ page }) => {
  await page.goto("docs/istqb/ctfl/ctfl_01");
  expect(await headings(page)).toEqual(CTFL_01);
  await page.goto("docs/istqb/cttas");
  expect(await headings(page)).toEqual(CTTAS_README);
});

test("FIX-03 zero heading-order do axe em toda página do sitemap", async ({ page }) => {
  test.setTimeout(240_000);
  const paths = sitemapPaths();
  expect(paths.length).toBeGreaterThan(50);
  const found: string[] = [];
  for (const path of paths) {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page } as unknown as AxeOptions)
      .withRules(["heading-order"])
      .analyze();
    for (const v of violations) {
      for (const n of v.nodes) found.push(`${path}: ${n.target.join(" ")}`);
    }
  }
  expect(found).toEqual([]);
});

/** Arquivos `.md` e `.mdx` de `docs/`, em qualquer profundidade. */
const docFiles = (dir = "docs"): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? docFiles(`${dir}/${e.name}`)
      : /\.mdx?$/.test(e.name)
        ? [`${dir}/${e.name}`]
        : [],
  );

test("FIX-02 nenhum class= em tag JSX dos documentos", async ({ page }) => {
  const found: string[] = [];
  for (const file of docFiles()) {
    let fenced = false;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (line.trimStart().startsWith("```")) fenced = !fenced;
        if (!fenced && /<[A-Za-z][^>]*\sclass=/.test(line)) found.push(`${file}:${i + 1}`);
      });
  }
  expect(found).toEqual([]);

  const warnings: string[] = [];
  page.on("console", (m) => {
    if (m.text().includes("Invalid DOM property `class`")) warnings.push(m.text());
  });
  for (const path of ["docs/notes", "docs/notes/test_coverage_sdlc"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(warnings).toEqual([]);
});
