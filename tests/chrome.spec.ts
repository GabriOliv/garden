import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { parse } from "yaml";

type AxeOptions = ConstructorParameters<typeof AxeBuilder>[0];
import { PAGES, TOKENS, openIn, rgb, type Theme } from "./support/site";

/** Documento com código em linha e blocos de código. */
const DOC = "docs/project/getting_started";
/** Índice de tags: chips com contagem. */
const TAGS = "docs/tags";
/** Página índice de uma categoria do menu lateral. */
const CATEGORY = "docs/istqb/ctfl";

/** `--ds-paper`, `--ds-panel` e `--ds-inverse` de Paper e Void (Dossier 1.0.0). */
const SURFACES: Record<Theme, string[]> = {
  paper: [TOKENS.paper.background, "#e6e6e1", "#0b0c0e"].map(rgb),
  void: [TOKENS.void.background, "#16181d", "#eeeeea"].map(rgb),
};

/** Valores distintos de `prop` em todos os elementos de `selector` (vazio se nenhum). */
const values = (page: Page, selector: string, prop: string, pseudo?: string) =>
  page.evaluate(
    ([s, p, ps]) => [
      ...new Set(
        Array.from(document.querySelectorAll(s)).map((el) =>
          getComputedStyle(el, ps || null).getPropertyValue(p),
        ),
      ),
    ],
    [selector, prop, pseudo ?? ""] as const,
  );

const all = async (page: Page, selectors: string[], prop: string, want: string, pseudo?: string) => {
  for (const s of selectors) {
    await expect
      .poll(() => values(page, s, prop, pseudo), { message: `${s}${pseudo ?? ""} ${prop}` })
      .toEqual([want]);
  }
};

test("CHROME-01 cantos retos no chrome", async ({ page }) => {
  await openIn(page, PAGES.about, "paper");
  await all(
    page,
    [
      "button",
      ".button",
      ".DocSearch-Button",
      ".theme-admonition",
      ".theme-doc-sidebar-container .menu__link",
      ".pagination-nav__link",
      'a[rel="tag"]',
    ],
    "border-radius",
    "0px",
  );

  await openIn(page, DOC, "paper");
  await all(
    page,
    [".theme-code-block", ".theme-code-block pre", ".theme-doc-markdown p code"],
    "border-radius",
    "0px",
  );

  await openIn(page, TAGS, "paper");
  await all(page, ['a[rel="tag"]'], "border-radius", "0px");
  await all(page, ['a[rel="tag"]'], "border-radius", "0px", "::before");
  await all(page, ['a[rel="tag"]'], "border-radius", "0px", "::after");
});

test("CHROME-02 chrome sem sombra", async ({ page }) => {
  await openIn(page, PAGES.about, "paper");
  await all(page, [".navbar", ".theme-admonition", ".pagination-nav__link"], "box-shadow", "none");

  await openIn(page, DOC, "paper");
  await all(page, [".theme-code-block"], "box-shadow", "none");
});

test("CHROME-03 navbar, menu lateral e paginação nas superfícies do tema", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    await openIn(page, PAGES.about, theme);
    for (const s of [".navbar", ".theme-doc-sidebar-container", ".pagination-nav__link"]) {
      await expect(page.locator(s).first()).toBeAttached();
      const outside = async () =>
        (await values(page, s, "background-color")).filter((v) => !SURFACES[theme].includes(v));
      await expect.poll(outside, { message: `${theme} ${s}` }).toEqual([]);
    }
  }
});

/**
 * Fundos não transparentes pintados dentro da navbar e do menu lateral, pseudo-elementos
 * inclusive, fora de `--ds-paper`, `--ds-panel` e `--ds-inverse` do tema ativo. Só o link
 * ativo do menu pode usar `--ds-signal-tint`. Os tokens saem da página, por um elemento de prova.
 */
const offSurface = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement("div");
    document.body.append(probe);
    const token = (name: string) => {
      probe.style.backgroundColor = `var(${name})`;
      return getComputedStyle(probe).backgroundColor;
    };
    const surfaces = ["--ds-paper", "--ds-panel", "--ds-inverse"].map(token);
    const tint = token("--ds-signal-tint");
    probe.remove();

    const transparent = (c: string) => c === "transparent" || /^rgba\(.*,\s*0\)$/.test(c);
    const name = (el: Element) => [el.tagName.toLowerCase(), ...Array.from(el.classList)].join(".");
    const found: string[] = [];
    const scope = ".navbar, .navbar *, .theme-doc-sidebar-container, .theme-doc-sidebar-container *";
    for (const el of Array.from(document.querySelectorAll(scope))) {
      // Só o que está pintado: o fundo do menu móvel fica oculto no desktop.
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const active = el.matches(".theme-doc-sidebar-container .menu__link--active");
      for (const pseudo of [null, "::before", "::after"]) {
        const bg = getComputedStyle(el, pseudo).backgroundColor;
        if (transparent(bg) || surfaces.includes(bg) || (active && !pseudo && bg === tint)) continue;
        found.push(`${name(el)}${pseudo ?? ""} ${bg}`);
      }
    }
    return { found, surfaces };
  });

test("CHROME-12 fundos internos da navbar e do menu lateral em tokens", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    await openIn(page, PAGES.about, theme);
    const sidebar = page.locator(".theme-doc-sidebar-container");
    await expect(sidebar.getByRole("button", { name: "Recolher painel lateral" })).toBeVisible();
    await expect(sidebar.locator(".menu__link--active").first()).toBeVisible();
    await expect(page.locator(".navbar .DocSearch-Button-Key").first()).toBeVisible();
    // A prova resolve os tokens do tema ativo: o fundo da página é `--ds-paper`.
    expect((await offSurface(page)).surfaces[0], theme).toBe(rgb(TOKENS[theme].background));
    await expect.poll(async () => (await offSurface(page)).found, { message: theme }).toEqual([]);

    // Com o ponteiro sobre um link não ativo do menu e sobre o botão de modo de cor, em 1280 px.
    const hovered: [string, Locator][] = [
      ["link do menu", sidebar.locator(".theme-doc-sidebar-item-link .menu__link:not(.menu__link--active)").first()],
      ["modo de cor", page.locator(".navbar").getByRole("button", { name: /Mudar entre modo claro e escuro/ })],
    ];
    for (const [label, target] of hovered) {
      await target.hover();
      // A transição do fundo termina antes da leitura.
      await target.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))));
      await expect
        .poll(async () => (await offSurface(page)).found, { message: `${theme} hover ${label}` })
        .toEqual([]);
    }

    // Na página índice de uma categoria, a linha da categoria fica ativa.
    await openIn(page, CATEGORY, theme);
    await expect(page.locator(".theme-doc-sidebar-container .menu__list-item-collapsible--active")).toBeVisible();
    await expect
      .poll(async () => (await offSurface(page)).found, { message: `${theme} ${CATEGORY}` })
      .toEqual([]);
  }
});

/** `--ds-focus-ring` da spec, no formato de `getComputedStyle`. */
const RING: Record<Theme, string> = {
  paper: `${rgb("#f4f4f1")} 0px 0px 0px 2px, ${rgb("#002fa7")} 0px 0px 0px 4px`,
  void: `${rgb("#0a0b0d")} 0px 0px 0px 2px, ${rgb("#2b7fff")} 0px 0px 0px 4px`,
};

type Target = ReturnType<Page["locator"]>;

/** Aperta Tab até o foco chegar em `target`. */
const tabTo = async (page: Page, target: Target) => {
  for (let i = 0; i < 400; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Tab não chegou ao alvo");
};

const shadow = (target: Target) => target.evaluate((el) => getComputedStyle(el).boxShadow);

/** Link do conteúdo, botões (tema e busca) e item do menu lateral focados por Tab; depois, um clique. */
const focusRing = async (page: Page, theme: Theme) => {
  await openIn(page, PAGES.peltzman, theme);
  const toggle = page.getByRole("button", { name: /Mudar entre modo claro e escuro/ });
  const targets = {
    link: page.locator(".theme-doc-markdown a[href]:not(.hash-link)").first(),
    button: toggle,
    search: page.getByRole("button", { name: /^Buscar/ }),
    menu: page.locator(".theme-doc-sidebar-container .menu__link").first(),
  };
  for (const [name, target] of Object.entries(targets)) {
    await tabTo(page, target);
    await expect.poll(() => shadow(target), { message: `${theme} ${name}` }).toBe(RING[theme]);
  }

  await page.locator(".theme-doc-markdown h1").click();
  await toggle.click();
  await expect(toggle).toBeFocused();
  expect(await shadow(toggle), "clique com o mouse").toBe("none");
};

test("CHROME-04 anel de foco do teclado em Paper", async ({ page }) => {
  await focusRing(page, "paper");
});

test("CHROME-05 anel de foco do teclado em Void", async ({ page }) => {
  await focusRing(page, "void");
});

const firstFamily = (target: Target) =>
  target.evaluate((el) =>
    getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, ""),
  );
const transform = (target: Target) => target.evaluate((el) => getComputedStyle(el).textTransform);

test("CHROME-06 chip de tag em IBM Plex Mono e maiúsculas por CSS", async ({ page }) => {
  const tags = parse(readFileSync("docs/tags.yml", "utf8")) as Record<string, { label: string }>;
  await openIn(page, PAGES.about, "paper");
  const chip = page.locator('a[rel="tag"][href$="/tags/projeto"]');
  await expect(chip).toHaveText(tags.projeto.label);
  expect(await chip.evaluate((el) => el.textContent)).toBe(tags.projeto.label);
  await expect.poll(() => firstFamily(chip)).toBe("IBM Plex Mono");
  expect(await transform(chip)).toBe("uppercase");
});

test("CHROME-07 cabeçalho de tabela Markdown em IBM Plex Mono e maiúsculas por CSS", async ({
  page,
}) => {
  const mdx = readFileSync("docs/project/about.mdx", "utf8");
  const header = mdx.split("\n").find((l) => l.trim().startsWith("|"))!;
  const written = header.split("|").map((c) => c.trim()).filter(Boolean);
  expect(written.length).toBeGreaterThan(0);

  await openIn(page, PAGES.about, "paper");
  const th = page.locator(".theme-doc-markdown table").first().locator("th");
  expect(await th.evaluateAll((els) => els.map((el) => el.textContent))).toEqual(written);
  for (let i = 0; i < written.length; i++) {
    await expect.poll(() => firstFamily(th.nth(i))).toBe("IBM Plex Mono");
    expect(await transform(th.nth(i))).toBe("uppercase");
  }
});

/** Página de exemplo com os cinco tipos de admonition (só no build de teste). */
const ADMONITIONS = "exemplos/chrome";

/** `--ds-ink`, `--ds-signal`, `--ds-paper`, `--ds-panel` e `--ds-signal-tint` (Dossier 1.0.0). */
const INK_SIGNAL: Record<Theme, string[]> = {
  paper: [TOKENS.paper.text, TOKENS.paper.signal].map(rgb),
  void: [TOKENS.void.text, TOKENS.void.signal].map(rgb),
};
const FILLS: Record<Theme, string[]> = {
  paper: [TOKENS.paper.background, "#e6e6e1", "#d7dff3"].map(rgb),
  void: [TOKENS.void.background, "#16181d", "#101a3c"].map(rgb),
};
/** `--ds-contrast-error` da spec. */
const ERROR: Record<Theme, string> = { paper: rgb("#b42318"), void: rgb("#ff6a55") };

/** Cores das quatro bordas, do título e do fundo de uma admonition. */
const admonition = (page: Page, type: string) =>
  page
    .locator(`.theme-admonition-${type}`)
    .first()
    .evaluate((el) => {
      const s = getComputedStyle(el);
      const title = getComputedStyle(el.firstElementChild!);
      return {
        border: [
          ...new Set([s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor]),
        ],
        title: title.color,
        background: s.backgroundColor,
      };
    });

test("CHROME-08 admonitions note, tip, info e warning só com tokens", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    await openIn(page, ADMONITIONS, theme);
    for (const type of ["note", "tip", "info", "warning"]) {
      const at = `${theme} ${type}`;
      await expect(page.locator(`.theme-admonition-${type}`)).toHaveCount(1);
      await expect
        .poll(async () => (await admonition(page, type)).border.filter((c) => !INK_SIGNAL[theme].includes(c)), {
          message: `${at} borda`,
        })
        .toEqual([]);
      const { title, background } = await admonition(page, type);
      expect(INK_SIGNAL[theme], `${at} título`).toContain(title);
      expect(FILLS[theme], `${at} fundo`).toContain(background);
    }
  }
});

test("CHROME-09 admonition danger em contrast-error", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of [PAGES.about, ADMONITIONS]) {
      await openIn(page, path, theme);
      await expect(page.locator(".theme-admonition-danger")).toHaveCount(1);
      await expect
        .poll(() => admonition(page, "danger"), { message: `${theme} ${path}` })
        .toMatchObject({ border: [ERROR[theme]], title: ERROR[theme] });
    }
  }
});

test("CHROME-10 contraste sem violações nas cinco páginas, em Paper e em Void", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const found: string[] = [];
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const [name, path] of Object.entries(PAGES)) {
      await openIn(page, path, theme);
      await page.waitForLoadState("networkidle");
      // O lockfile resolve o `playwright-core` do axe em 1.65.0 e o do runner em 1.64.1:
      // em runtime é a mesma página, só os tipos divergem.
      const { violations } = await new AxeBuilder({ page } as unknown as AxeOptions)
        .withRules(["color-contrast"])
        .exclude("pre")
        .exclude(".docusaurus-mermaid-container")
        .exclude("img")
        .analyze();
      for (const v of violations) {
        for (const n of v.nodes) found.push(`${theme} ${name}: ${n.target.join(" ")} | ${n.failureSummary}`);
      }
    }
  }
  expect(found).toEqual([]);
});

test("CHROME-11 sem rolagem horizontal em 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, path] of Object.entries(PAGES)) {
    await openIn(page, path, "paper");
    await page.waitForLoadState("networkidle");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: name })
      .toBeLessThanOrEqual(390);
  }
});

/** Tokens do Dossier por tema, como terceto `r, g, b` (qualquer opacidade conta). */
const TOKEN_RGB: Record<Theme, Set<string>> = {
  paper: new Set(
    ["#f4f4f1", "#e6e6e1", "#0b0c0e", "#c6c7c1", "#50535a", "#002fa7", "#d7dff3", "#b42318"].map(
      (h) => rgb(h).slice(4, -1),
    ),
  ),
  void: new Set(
    ["#0a0b0d", "#16181d", "#eeeeea", "#2c2f36", "#9ea1a8", "#2b7fff", "#101a3c", "#ff6a55"].map(
      (h) => rgb(h).slice(4, -1),
    ),
  ),
};

/** Cores de texto, fundo e borda de `root` e dos seus descendentes, sem SVG (o logo do Algolia). */
const paints = (page: Page, root: string) =>
  page.evaluate((r) => {
    const top = document.querySelector(r);
    if (!top) return [] as string[];
    return [top, ...Array.from(top.querySelectorAll("*"))]
      .filter((el) => !(el instanceof SVGElement))
      .flatMap((el) => {
        const s = getComputedStyle(el);
        return [s.color, s.backgroundColor, s.borderTopColor];
      });
  }, root);

/** Cor de um pintura é de token do tema ou transparente. */
const onTokens = (color: string, theme: Theme) =>
  /, 0\)$/.test(color) || TOKEN_RGB[theme].has(color.match(/\d+/g)!.slice(0, 3).join(", "));

/** O botão de voltar ao topo só aparece ao subir a página: desce, espera o quadro, sobe um pouco. */
async function scrollBackUp(page: Page) {
  // Sem hidratação, o ouvinte de rolagem do botão ainda não está preso.
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 2000));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(2000);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1500);
}

test("LEFT-01 raio 0 em breadcrumbs, categorias do menu, voltar ao topo e modal de busca", async ({ page }) => {
  // As linhas de categoria do menu só existem na barra lateral da categoria CTFL.
  await openIn(page, CATEGORY, "paper");
  await all(page, [".theme-doc-sidebar-container .menu__list-item-collapsible"], "border-radius", "0px");

  await openIn(page, DOC, "paper");
  await scrollBackUp(page);
  await expect(page.locator(".theme-back-to-top-button")).toBeVisible();
  await page.locator(".DocSearch-Button").click();
  await expect(page.locator(".DocSearch-Modal")).toBeVisible();
  await all(
    page,
    [
      ".breadcrumbs__link",
      ".theme-back-to-top-button",
      ".DocSearch-Modal",
      ".DocSearch-SearchBar",
      ".DocSearch-Input",
    ],
    "border-radius",
    "0px",
  );
});

test("LEFT-02 sem box-shadow fora do foco no voltar ao topo e no modal de busca", async ({ page }) => {
  await openIn(page, DOC, "paper");
  await scrollBackUp(page);
  await expect(page.locator(".theme-back-to-top-button")).toBeVisible();
  await page.locator(".DocSearch-Button").click();
  await expect(page.locator(".DocSearch-Modal")).toBeVisible();
  // O campo recebe o foco ao abrir; o critério vale fora do estado de foco.
  await page.locator(".DocSearch-Input").evaluate((el) => (el as HTMLElement).blur());
  await all(
    page,
    [".theme-back-to-top-button", ".DocSearch-Modal", ".DocSearch-SearchBar", ".DocSearch-Input"],
    "box-shadow",
    "none",
  );
});

test("LEFT-04 modal de busca aberto pelo botão e por Ctrl+K só com tokens, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const open of ["button", "ctrl+k"] as const) {
      await openIn(page, DOC, theme);
      if (open === "button") await page.locator(".DocSearch-Button").click();
      else {
        await page.locator("h1").first().click();
        await page.keyboard.press("Control+k");
      }
      await expect(page.locator(".DocSearch-Modal")).toBeVisible();
      const colors = await paints(page, ".DocSearch-Modal");
      expect(colors.length, `${theme} ${open}`).toBeGreaterThan(0);
      expect(
        colors.filter((c) => !onTokens(c, theme)),
        `${theme} ${open} cores fora dos tokens`,
      ).toEqual([]);
    }
  }
});

test("LEFT-07 cards Anterior e Próxima com borda de 1 px em ink, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    await openIn(page, PAGES.peltzman, theme);
    for (const side of [".pagination-nav__link--prev", ".pagination-nav__link--next"]) {
      const card = page.locator(side);
      await expect(card).toHaveCount(1);
      for (const edge of ["top", "right", "bottom", "left"]) {
        await expect(card).toHaveCSS(`border-${edge}-width`, "1px");
        await expect(card).toHaveCSS(`border-${edge}-color`, rgb(TOKENS[theme].text));
      }
    }
  }
});
