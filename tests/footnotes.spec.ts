import { expect, test } from "@playwright/test";
import { openIn, rgb, type Theme } from "./support/site";

// Cores de Paper e Void (spec referencias-dossier, FN-01 a FN-08).
const T = {
  paper: { signal: "#002fa7", inkMuted: "#50535a", rule: "#0b0c0e" },
  void: { signal: "#2b7fff", inkMuted: "#9ea1a8", rule: "#eeeeea" },
} as const;

const SDLC = "docs/notes/test_coverage_sdlc";

/** Estilos das notas de rodapé de `test_coverage_sdlc`, lidos do navegador. */
const read = (page: import("@playwright/test").Page) =>
  page.locator("section[data-footnotes]").evaluate((section) => {
    const ol = section.querySelector(":scope > ol")!;
    const items = Array.from(ol.querySelectorAll(":scope > li"));
    const num = (li: Element) => getComputedStyle(li, "::before");
    const rule = getComputedStyle(ol, "::before");
    const mark = getComputedStyle(document.querySelector("sup > a[data-footnote-ref]")!);
    const h2 = section.querySelector("h2")!;
    return {
      count: items.length,
      nums: items.map((li) => [num(li).content, num(li).color, num(li).fontFamily]),
      text: items.map((li) => [getComputedStyle(li).color, getComputedStyle(li).fontSize]),
      nested: items.flatMap((li) =>
        Array.from(li.querySelectorAll("p, li")).map((el) => [getComputedStyle(el).color, getComputedStyle(el).fontSize]),
      ),
      maxWidth: getComputedStyle(ol).maxWidth,
      rule: [rule.borderTopWidth, rule.borderTopStyle, rule.borderTopColor, rule.width],
      backCount: section.querySelectorAll("a.data-footnote-backref").length,
      backVisible: Array.from(section.querySelectorAll("a.data-footnote-backref")).filter((a) => a.getClientRects().length > 0)
        .length,
      mark: [mark.fontFamily, mark.color, mark.textDecorationLine],
      title: { text: h2.textContent!.replace(/​/g, "").trim(), visible: h2.getClientRects().length > 0 && h2.offsetHeight > 1 },
    };
  });

for (const theme of ["paper", "void"] as Theme[]) {
  test(`FN-01 número da nota de rodapé em mono signal com dois dígitos, em ${theme}`, async ({ page }) => {
    await openIn(page, SDLC, theme);
    const fn = await read(page);
    expect(fn.count).toBe(2);
    for (const [content, color, font] of fn.nums) {
      expect(content).toContain("decimal-leading-zero");
      expect(color).toBe(rgb(T[theme].signal));
      expect(font).toMatch(/IBM Plex Mono/);
    }
  });

  test(`FN-02 texto da nota em ink-muted, tamanho de legenda, até 560 px, em ${theme}`, async ({ page }) => {
    await openIn(page, SDLC, theme);
    const fn = await read(page);
    for (const t of fn.text) expect(t).toEqual([rgb(T[theme].inkMuted), "12px"]);
    expect(fn.maxWidth).toBe("560px");
  });

  test(`FN-03 fio curto de 1 px em ink acima das notas, em ${theme}`, async ({ page }) => {
    await openIn(page, SDLC, theme);
    expect((await read(page)).rule).toEqual(["1px", "solid", rgb(T[theme].rule), "96px"]);
  });

  test(`FN-05 marca da nota no texto em mono signal sem sublinhado, em ${theme}`, async ({ page }) => {
    await openIn(page, SDLC, theme);
    const [font, color, deco] = (await read(page)).mark;
    expect(font).toMatch(/IBM Plex Mono/);
    expect(color).toBe(rgb(T[theme].signal));
    expect(deco).toBe("none");
  });

  test(`FN-08 listas dentro da nota (Fonte, Legenda) com a cor e o tamanho da nota, em ${theme}`, async ({ page }) => {
    await openIn(page, SDLC, theme);
    const { nested } = await read(page);
    expect(nested.length).toBeGreaterThan(4);
    for (const n of nested) expect(n).toEqual([rgb(T[theme].inkMuted), "12px"]);
  });
}

test("FN-04 nenhuma seta de volta visível nas notas de rodapé", async ({ page }) => {
  await openIn(page, SDLC, "paper");
  const fn = await read(page);
  // As setas existem no HTML (uma por nota); só não aparecem.
  expect(fn.backCount).toBe(2);
  expect(fn.backVisible).toBe(0);
});

test("FN-06 o bloco das notas de rodapé mantém o título Footnotes", async ({ page }) => {
  await openIn(page, SDLC, "paper");
  expect((await read(page)).title).toEqual({ text: "Footnotes", visible: true });
});
