import { expect, test, type Page } from "@playwright/test";
import { PAGES, drawing } from "./support/site";

const START = "Comece a Leitura";

test("PAGE-01 home mostra título, frase, animação e o link", async ({ page }) => {
  await page.goto(PAGES.home);
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1, name: "QA Garden" })).toBeVisible();
  await expect(main.getByText("Uma Coleção de Notas em Evolução")).toBeVisible();
  const flask = main.locator('img[alt="Site Logo"]:visible');
  await expect(flask).toBeVisible();
  await expect
    .poll(() => flask.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(main.getByRole("link", { name: START })).toBeVisible();
});

test("PAGE-02 Comece a Leitura abre a página do projeto", async ({ page }) => {
  await page.goto(PAGES.home);
  await page.locator("main").getByRole("link", { name: START }).click();
  await expect(page).toHaveURL(/\/garden\/docs\/project\/?$/);
  await expect(page.getByRole("heading", { level: 2, name: "Certificações" })).toBeVisible();
});

test("PAGE-05 um único link Comece a Leitura em 390 px e em 1280 px", async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(PAGES.home);
    const links = page.getByRole("link", { name: START });
    await expect(links.first()).toBeVisible();
    await expect
      .poll(() =>
        links.evaluateAll(
          (els) => els.filter((el) => (el as HTMLElement).getClientRects().length > 0).length,
        ),
      )
      .toBe(1);
  }
});

test("PAGE-03 home mostra os três blocos com ilustração e frase", async ({ page }) => {
  await page.goto(PAGES.home);
  const blocks = [
    ["Notas", "banner-grafo-dossier", "Teorias e artigos sobre diversos tópicos de Garantia de Qualidade."],
    ["Estudos de Certificações", "banner-automato-dossier", "Resumos e materiais de estudo usados para fazer certificações."],
    ["Evolução", "banner-filotaxia-dossier", "Documentação separada em níveis de evolução e experiência."],
  ];
  const main = page.locator("main");
  for (const [title, art, phrase] of blocks) {
    const block = main
      .locator("section > div > div", {
        has: page.getByRole("heading", { level: 2, name: title, exact: true }),
      })
      .first();
    await expect(block.getByText(phrase)).toBeVisible();
    const img = block.locator(`img[src$="/${art}.svg"]`);
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
});

const ITEMS = [
  ["CTFL", "CTFL - Certified Tester Foundation Level", "Primeira certificação da ISTQB para a carreira de Teste de Software.", "banner-flask-dossier", "/garden/docs/istqb/ctfl"],
  ["CT-TAS", "CT-TAS - Test Automation Strategy", "Certificação de Especialização para perspectiva estratégica sobre a automação de testes.", "banner-flask-dossier", "/garden/docs/istqb/cttas"],
  ["Notas", "Notas", "Notas sobre QA, Teste ou Computação em geral.", "banner-flask-qa-dossier", "/garden/docs/notes"],
] as const;

test("PAGE-04 home e Comece a Leitura sem card, button, shadow nem cor em style", async ({ page }) => {
  for (const path of [PAGES.home, PAGES.start]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const found = await page.locator("main").evaluate((main) => {
      const bad: string[] = [];
      for (const el of [main, ...Array.from(main.querySelectorAll("*"))]) {
        const cls = Array.from(el.classList).filter(
          (c) => c === "card" || c === "button" || c.startsWith("shadow--"),
        );
        if (cls.length) bad.push(`${el.tagName}.${cls.join(".")}`);
        const style = el.getAttribute("style") ?? "";
        if (/color|background/i.test(style)) bad.push(`${el.tagName}[style=${style}]`);
      }
      return bad;
    });
    expect(found, path).toEqual([]);
  }
});

test("PAGE-06 seções Certificações, Documentações e Organização por Evolução em ordem", async ({ page }) => {
  await page.goto(PAGES.start);
  // textContent: o texto do DOM como escrito (DOC-06); innerText segue o text-transform: uppercase.
  const titles = await page.locator("main h2").allTextContents();
  expect(titles.map((t) => t.replace(/[\s​]+$/, ""))).toEqual([
    "Certificações",
    "Documentações",
    "Organização por Evolução",
  ]);
});

test("PAGE-07 itens CTFL, CT-TAS e Notas com imagem e descrição", async ({ page }) => {
  await page.goto(PAGES.start);
  for (const [key, title, description, image] of ITEMS) {
    const item = page.locator(`main [data-item="${key}"]`);
    await expect(item.getByRole("heading", { level: 3, name: title, exact: true })).toBeVisible();
    await expect(item.getByText(description, { exact: true })).toBeVisible();
    const img = item.locator("img");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", new RegExp(`${image}.*\\.svg$`));
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("PAGE-08 Leia Mais abre CTFL, CT-TAS e Notas", async ({ page }) => {
  for (const [key, , , , url] of ITEMS) {
    await page.goto(PAGES.start);
    await page.locator(`main [data-item="${key}"]`).getByRole("link", { name: "Leia Mais" }).click();
    await expect(page).toHaveURL(new RegExp(`${url}/?$`));
  }
});

/** Tabela que vem depois do h2 `heading`. */
const tableAfter = (page: Page, heading: string) =>
  page
    .locator("article h2", { hasText: heading })
    .locator("xpath=following::table[1]");

test("PAGE-13 tabela de Organização dos Conteúdos com StageIcon de 48 px, leitura e definição", async ({ page }) => {
  await page.goto(PAGES.about);
  const rows = tableAfter(page, "Organização dos Conteúdos").locator("tbody tr");
  await expect(rows).toHaveCount(4);
  const expected = [
    ["Iniciais", "Artigos em construção que começam a explorar um tema."],
    ["Melhorados", "Artigos que foram revisados e melhorados."],
    ["Intermediários", "Artigos que estão em um nível intermediário de revisão."],
    ["Completos", "Artigos que estão maduros e completos."],
  ];
  for (const [i, [reading, definition]] of expected.entries()) {
    const row = rows.nth(i);
    await expect(row.locator("td").nth(1)).toHaveText(`${reading}${definition}`);
    const box = await row.locator("td").first().locator("svg").boundingBox();
    expect(box?.width).toBe(48);
    expect(box?.height).toBe(48);
    await expect(row.getByText(/[🌱🌿🌲🍎]/u)).toHaveCount(0);
  }
});

test("PAGE-14 ícones da tabela do Sobre com o nome acessível do estágio", async ({ page }) => {
  await page.goto(PAGES.about);
  const table = tableAfter(page, "Organização dos Conteúdos");
  const names = ["Estágio A · Semente", "Estágio B · Broto", "Estágio C · Árvore", "Estágio D · Fruto"];
  for (const [i, name] of names.entries()) {
    await expect(table.locator("tbody tr").nth(i).getByRole("img", { name, exact: true })).toBeVisible();
  }
});

test("PAGE-15 tabela Objetivos do Projeto mantém emojis e textos", async ({ page }) => {
  await page.goto(PAGES.about);
  const cells = tableAfter(page, "Objetivos do Projeto").locator("tbody td");
  await expect(cells).toHaveText([
    "🌱 Cultivar ideias, pensamentos e conhecimentos",
    "❌ Ser um conteúdo perfeito",
    "🌍 Compartilhar aprendizado de forma pública",
    "❌ Ser um caderno privado",
    "📝 Estar constantemente em edição",
    "❌ Ser um conteúdo estático",
    "📚 Aprimorar a habilidade como Technical Writer",
    "❌ Ser completamente explicativo",
    "📖 Documentar o processo de aprendizado em GIT",
    "❌ Ser um tutorial passo a passo",
    "🚀 Estimular a criatividade e experimentação",
    "❌ Ser restritivo e limitado",
    "🧪 Melhorar entendimento sobre QA",
    "❌ Ser artigo de referência",
  ]);
});

const LEGEND = [
  ["A", "Semente", "Iniciais", "Artigos em construção que começam a explorar um tema."],
  ["B", "Broto", "Melhorados", "Artigos que foram revisados e melhorados."],
  ["C", "Árvore", "Intermediários", "Artigos que estão em um nível intermediário de revisão."],
  ["D", "Fruto", "Completos", "Artigos que estão maduros e completos."],
] as const;

test("PAGE-09 legenda com os quatro estágios em ordem, ícone de 48 px, nome, leitura e definição", async ({ page }) => {
  // Referência independente da legenda: o StageIcon de 48 px nomeado de cada estágio no "Sobre".
  await page.goto(PAGES.about);
  const table = tableAfter(page, "Organização dos Conteúdos");
  const expected: Record<string, string> = {};
  for (const [stage, name] of LEGEND) {
    expected[stage] = await drawing(table.getByRole("img", { name: `Estágio ${stage} · ${name}`, exact: true }));
  }
  expect(new Set(Object.values(expected)).size, "quatro desenhos distintos no Sobre").toBe(4);

  await page.goto(PAGES.start);
  const items = page.locator("main [data-stage]");
  await expect(items).toHaveCount(4);
  for (const [i, [stage, name, reading, definition]] of LEGEND.entries()) {
    const item = items.nth(i);
    await expect(item).toHaveAttribute("data-stage", stage);
    await expect(item.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
    await expect(item.getByText(reading, { exact: true })).toBeVisible();
    await expect(item.getByText(definition, { exact: true })).toBeVisible();
    const icon = item.locator("svg").first();
    const box = await icon.boundingBox();
    expect(box?.width).toBe(48);
    expect(box?.height).toBe(48);
    expect(await drawing(icon), `ícone do estágio ${stage}`).toBe(expected[stage]);
  }
  const drawn = await Promise.all([0, 1, 2, 3].map((i) => drawing(items.nth(i).locator("svg").first())));
  expect(new Set(drawn).size, "quatro ícones distintos na legenda").toBe(4);
});

test("PAGE-10 definições dos estágios de A a D", async ({ page }) => {
  await page.goto(PAGES.start);
  const texts = await page.locator("main [data-stage] p").allInnerTexts();
  expect(texts.filter((t) => LEGEND.some((l) => l[3] === t))).toEqual(LEGEND.map((l) => l[3]));
});

test("PAGE-11 ícones de 48 px da legenda com aria-hidden", async ({ page }) => {
  await page.goto(PAGES.start);
  const icons = page.locator("main [data-stage] svg");
  await expect(icons).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(icons.nth(i)).toHaveAttribute("aria-hidden", "true");
  }
});

test("PAGE-12 Veja Todos abre a página da tag de cada estágio, inclusive o D", async ({ page }) => {
  for (const [stage] of LEGEND) {
    await page.goto(PAGES.start);
    await page.locator(`main [data-stage="${stage}"]`).getByRole("link", { name: "Veja Todos" }).click();
    await expect(page).toHaveURL(new RegExp(`/garden/docs/tags/stage${stage}/?$`));
    if (stage === "C") {
      // nenhum documento tem a tag stageC: a página é o 404 do Docusaurus
      await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
    } else {
      await expect(page.locator("main h1")).toContainText(/marcados? com/);
    }
  }
});
