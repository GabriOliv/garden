import { expect, test, type Locator, type Page } from "@playwright/test";
import { PAGES } from "./support/site";

/** Os estágios com página de tag (nenhuma nota usa `stageC`), com os textos da spec. */
const STAGES = [
  { tag: "stageA", name: "Semente", label: "Estágio A · Semente", note: PAGES.about },
  { tag: "stageB", name: "Broto", label: "Estágio B · Broto", note: "docs/notes/hawthorne_effect_on_documentation" },
  { tag: "stageD", name: "Fruto", label: "Estágio D · Fruto", note: PAGES.peltzman },
] as const;

/** Chip de uma tag pelo fim do `href`. */
const chip = (scope: Page | Locator, tag: string) =>
  scope.locator(`a[rel="tag"][href$="/docs/tags/${tag}"]`);

const footer = (page: Page) => page.locator("article footer");

/** O ícone de 16 px vem antes do nome, na mesma linha. */
const expectIconThenName = async (link: Locator, name: string) => {
  const svg = link.locator("svg");
  await expect(svg).toHaveCount(1);
  const icon = await svg.boundingBox();
  expect(icon?.width).toBe(16);
  expect(icon?.height).toBe(16);
  const text = await link.getByText(name, { exact: true }).boundingBox();
  expect(text, `nome "${name}" visível no chip`).not.toBeNull();
  expect(icon!.x + icon!.width).toBeLessThanOrEqual(text!.x);
};

test("TAGS-01 chip de estágio com o ícone de 16 px e o nome", async ({ page }) => {
  for (const { tag, name, note } of STAGES) {
    await page.goto(note);
    await expectIconThenName(chip(footer(page), tag), name);
  }
  await page.goto("docs/tags");
  for (const { tag, name } of STAGES) await expectIconThenName(chip(page, tag), name);
});

test("TAGS-02 nome acessível do chip no rodapé é o label, sem repetir o nome", async ({ page }) => {
  for (const { tag, label, note } of STAGES) {
    await page.goto(note);
    const link = chip(footer(page), tag);
    await expect(link).toHaveAccessibleName(new RegExp(`^${label}$`));
    await expect(link.locator("svg")).toHaveAttribute("aria-hidden", "true");
  }
});

test("TAGS-09 nome acessível do chip no índice com o número de documentos", async ({ page }) => {
  for (const { tag, label } of STAGES) {
    // Contagem independente do chip: os documentos listados na página da tag.
    await page.goto(`docs/tags/${tag}`);
    const n = await page.locator("main article").count();
    expect(n).toBeGreaterThan(0);

    await page.goto("docs/tags");
    await expect(chip(page, tag)).toHaveAccessibleName(new RegExp(`^${label} ${n}$`));
  }
});

/** Os grupos do índice de tags: título e `href` dos chips, em ordem. */
const groups = (page: Page) =>
  page.locator("main article").evaluateAll((els) =>
    els.map((el) => ({
      title: el.querySelector("h2")!.textContent!.replace(/​/g, "").trim(),
      hrefs: [...el.querySelectorAll('a[rel="tag"]')].map((a) => a.getAttribute("href")),
    })),
  );

test("TAGS-07 primeiro grupo Estágios, com A, B e D nesta ordem e sem C", async ({ page }) => {
  await page.goto("docs/tags");
  const [first] = await groups(page);
  expect(first.title).toBe("Estágios");
  expect(first.hrefs).toEqual(
    ["stageA", "stageB", "stageD"].map((t) => `/garden/docs/tags/${t}`),
  );
});

test("TAGS-08 nenhum chip de estágio nos grupos de letra", async ({ page }) => {
  await page.goto("docs/tags");
  const [, ...letters] = await groups(page);
  expect(letters.length).toBeGreaterThan(0);
  for (const g of letters) {
    expect(g.title).toMatch(/^\p{L}$/u);
    expect(g.hrefs.filter((h) => /\/docs\/tags\/stage[A-D]$/.test(h!))).toEqual([]);
    expect(g.hrefs.length).toBeGreaterThan(0);
  }
});
