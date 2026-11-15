import { expect, test, type Locator, type Page } from "@playwright/test";
import { PAGES, TOKENS, openIn, rgb, type Theme } from "./support/site";

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
      hrefs: Array.from(el.querySelectorAll('a[rel="tag"]')).map((a) => a.getAttribute("href")),
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

/** Os chips de cada tema (`index` e notas), com os tokens de texto e de sinal do tema. */
const THEMES: Theme[] = ["paper", "void"];

test("TAGS-03 ícones A, B e C em ink e o fruto D em signal, nos dois temas", async ({ page }) => {
  for (const theme of THEMES) {
    for (const { tag, note } of STAGES) {
      await openIn(page, note, theme);
      const link = chip(footer(page), tag);
      if (tag === "stageD") {
        const fruit = link.locator("svg circle");
        await expect(fruit).toHaveCount(1);
        await expect(fruit).toHaveCSS("fill", rgb(TOKENS[theme].signal));
      } else {
        const paints = await link.evaluate((a) =>
          Array.from(a.querySelectorAll("svg *:not(title)")).map((el) => {
            const s = getComputedStyle(el);
            return s.stroke !== "none" ? s.stroke : s.fill;
          }),
        );
        expect(paints.length).toBeGreaterThan(0);
        for (const paint of paints) expect(paint).toBe(rgb(TOKENS[theme].text));
      }
    }
  }
});

test("TAGS-04 texto e borda de 1 px de todo chip em ink, com fundo transparente, nos dois temas", async ({ page }) => {
  for (const theme of THEMES) {
    await openIn(page, "docs/tags", theme);
    const chips = page.locator('a[rel="tag"]');
    const n = await chips.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const c = chips.nth(i);
      await expect(c).toHaveCSS("color", rgb(TOKENS[theme].text));
      await expect(c).toHaveCSS("background-color", /^rgba\(\d+, \d+, \d+, 0\)$/);
      for (const edge of ["top", "right", "bottom", "left"]) {
        await expect(c).toHaveCSS(`border-${edge}-width`, "1px");
        await expect(c).toHaveCSS(`border-${edge}-color`, rgb(TOKENS[theme].text));
      }
    }
  }
});

test("TAGS-05 chip é retângulo, sem ponta nem furo dos pseudo-elementos do Infima", async ({ page }) => {
  await openIn(page, "docs/tags", "paper");
  const chips = page.locator('a[rel="tag"]');
  const n = await chips.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const c = chips.nth(i);
    await expect(c).toHaveCSS("border-radius", "0px");
    for (const pseudo of ["::before", "::after"] as const) {
      const content = await c.evaluate((el, ps) => getComputedStyle(el, ps).content, pseudo);
      expect(["none", "normal"], `${pseudo} do chip ${i}`).toContain(content);
    }
  }
});

test("TAGS-06 contagem de documentos dentro do chip, depois do nome, no índice de tags", async ({ page }) => {
  await openIn(page, "docs/tags", "paper");
  const chips = page.locator('a[rel="tag"]');
  const n = await chips.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    // Último texto do chip é a contagem; o texto anterior com letras é o nome.
    const m = await chips.nth(i).evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const texts: Text[] = [];
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        if (t.textContent!.trim()) texts.push(t as Text);
      }
      const last = texts[texts.length - 1];
      const name = texts.slice(0, -1).reverse().find((t) => /\p{L}/u.test(t.textContent!));
      const rect = (t: Text) => {
        const r = document.createRange();
        r.selectNodeContents(t);
        const b = r.getBoundingClientRect();
        return { left: b.left, right: b.right };
      };
      const c = el.getBoundingClientRect();
      return {
        lastText: last?.textContent?.trim() ?? "",
        hasName: Boolean(name),
        name: name ? rect(name) : null,
        count: rect(last),
        chip: { left: c.left, right: c.right },
      };
    });
    expect(m.lastText, `chip ${i} termina em número`).toMatch(/^\d+$/);
    expect(m.hasName, `chip ${i} tem nome antes da contagem`).toBe(true);
    expect(m.count.left, `chip ${i} contagem depois do nome`).toBeGreaterThanOrEqual(m.name!.right - 1);
    expect(m.count.left, `chip ${i} contagem dentro do chip`).toBeGreaterThanOrEqual(m.chip.left);
    expect(m.count.right, `chip ${i} contagem dentro do chip`).toBeLessThanOrEqual(m.chip.right + 1);
  }
});
