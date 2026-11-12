import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openIn, rgb, type Theme } from "./support/site";

// Mesma tipagem que tests/chrome.spec.ts usa para o AxeBuilder (duas cópias do playwright-core).
type AxeOptions = ConstructorParameters<typeof AxeBuilder>[0];

/** Tokens citados em "Mapa de cores dos diagramas", por tema (spec e tokens.css do Dossier). */
const T = {
  paper: {
    paper: "#f4f4f1", panel: "#e6e6e1", ink: "#0b0c0e", inkMuted: "#50535a", signal: "#002fa7",
    signalTint: "#d7dff3", inverse: "#0b0c0e", onInverse: "#f4f4f1", contrastError: "#b42318",
  },
  void: {
    paper: "#0a0b0d", panel: "#16181d", ink: "#eeeeea", inkMuted: "#9ea1a8", signal: "#2b7fff",
    signalTint: "#101a3c", inverse: "#eeeeea", onInverse: "#0a0b0d", contrastError: "#ff6a55",
  },
} as const;

type Tokens = (typeof T)[Theme];
type Paint = keyof Tokens | "transparent";

/** Uma linha do mapa: página, seletor da forma e o que se espera de fundo, traço e texto. */
type Row = { page: string; sel: string; fill: Paint; stroke?: Paint; strokeWidth?: string; text: Paint };

const CTFL_01 = "docs/istqb/ctfl/ctfl_01";
const PELTZMAN = "docs/notes/peltzman_effect";
const ISTQB = "docs/istqb";

const MAP: Row[] = [
  { page: CTFL_01, sel: ".cluster.error", fill: "paper", stroke: "contrastError", strokeWidth: "2px", text: "ink" },
  { page: CTFL_01, sel: ".node.gra", fill: "paper", text: "ink" },
  { page: CTFL_01, sel: ".node.yel", fill: "panel", text: "ink" },
  { page: CTFL_01, sel: ".node.ora", fill: "inkMuted", text: "paper" },
  { page: CTFL_01, sel: ".node.red", fill: "inverse", text: "onInverse" },
  { page: PELTZMAN, sel: ".node.green", fill: "signalTint", stroke: "signal", text: "ink" },
  { page: PELTZMAN, sel: ".cluster.invisible", fill: "transparent", stroke: "transparent", text: "transparent" },
  { page: ISTQB, sel: ".node:not(.ctal)", fill: "panel", stroke: "ink", text: "ink" },
  { page: ISTQB, sel: ".node.ctal", fill: "signalTint", stroke: "signal", text: "ink" },
  { page: ISTQB, sel: ".cluster.invi", fill: "transparent", stroke: "transparent", text: "transparent" },
];

const TRANSPARENT = /^rgba\(\d+, \d+, \d+, 0\)$/;

const expectPaint = (actual: string, want: Paint, theme: Theme, what: string) =>
  want === "transparent"
    ? expect(actual, what).toMatch(TRANSPARENT)
    : expect(actual, what).toBe(rgb(T[theme][want]));

/** Espera todos os diagramas da página (`n`) renderizados. */
async function openDiagrams(page: Page, path: string, theme: Theme) {
  await openIn(page, path, theme);
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".docusaurus-mermaid-container svg g.node").first()).toBeAttached();
}

test("DIAG-04 cada classe do mapa com os tokens da coluna Depois, em Paper e em Void", async ({
  page,
}) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of [CTFL_01, PELTZMAN, ISTQB]) {
      await openDiagrams(page, path, theme);
      for (const row of MAP.filter((r) => r.page === path)) {
        const shapes = await page
          .locator(`.docusaurus-mermaid-container svg ${row.sel}`)
          .evaluateAll((els) =>
            els.map((g) => {
              const shape = g.querySelector("rect, path, polygon, circle, ellipse")!;
              const label = g.querySelector("span, p, .nodeLabel")!;
              const s = getComputedStyle(shape);
              return {
                fill: s.fill,
                stroke: s.stroke,
                strokeWidth: s.strokeWidth,
                text: getComputedStyle(label).color,
              };
            }),
          );
        const name = `${theme} ${path} ${row.sel}`;
        expect(shapes.length, name).toBeGreaterThan(0);
        for (const s of shapes) {
          expectPaint(s.fill, row.fill, theme, `${name} fundo`);
          if (row.stroke) expectPaint(s.stroke, row.stroke, theme, `${name} traço`);
          if (row.strokeWidth) expect(s.strokeWidth, `${name} largura`).toBe(row.strokeWidth);
          expectPaint(s.text, row.text, theme, `${name} texto`);
        }
      }
    }
  }
});

/** Páginas publicadas com diagrama Mermaid (`draft: true` não é publicado, então fica de fora). */
const DIAGRAM_PAGES = [
  "docs/istqb",
  "docs/istqb/ctfl",
  "docs/istqb/ctfl/ctfl_01",
  "docs/istqb/ctfl/ctfl_04",
  "docs/istqb/cttas",
  "docs/notes/e2e_useful",
  "docs/notes/peltzman_effect",
  "docs/project/getting_started",
];
/** Código de blocos em getting_started e test_coverage_sdlc (CODE-01 a CODE-05). */
const GETTING = "docs/project/getting_started";
const SDLC = "docs/notes/test_coverage_sdlc";
/** Comentários e palavras-chave só aparecem em código Python (SDLC); getting_started tem só bash. */
const CODE_PAGES = [GETTING, SDLC];
/** As 8 páginas do critério LEFT-03. */
const LEFT_PAGES = [
  "",
  "docs/project",
  "docs/project/about",
  "docs/notes",
  SDLC,
  "docs/istqb/ctfl/ctfl_01",
  "docs/tags",
  "docs/tags/stageB",
];

/** Tokens `--ds-*` de cor do tema ativo, como tercetos `r, g, b` (valores lidos de `:root` em execução). */
const tokenTriples = (page: Page) =>
  page.evaluate(() => {
    const names = new Set<string>();
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSStyleRule) {
          for (const prop of Array.from(rule.style)) if (prop.startsWith("--ds-")) names.add(prop);
        }
      }
    }
    const root = getComputedStyle(document.documentElement);
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const out = new Set<string>();
    for (const name of names) {
      const value = root.getPropertyValue(name).trim();
      if (!value || !CSS.supports("color", value)) continue;
      probe.style.color = value;
      const c = getComputedStyle(probe).color;
      out.add(
        c.startsWith("color(srgb")
          ? (c.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => Math.round(parseFloat(v) * 255)).join(", ")
          : c.match(/\d+/g)!.slice(0, 3).join(", "),
      );
    }
    probe.remove();
    return [...out];
  });

/**
 * Cores de texto, fundo, borda, preenchimento e traço de `scope` que não são token nem transparente.
 * `skipSvg` deixa de fora ícones e diagramas (LEFT-03 não conta imagens).
 */
const foreignPaints = (page: Page, scope: string, tokens: string[], skipSvg: boolean) =>
  page.evaluate(
    ([s, toks, noSvg]) => {
      // Chrome devolve cor wide-gamut como color(srgb r g b / a) para alguns tokens com alfa.
      const triple = (c: string) => {
        if (c.startsWith("color(srgb")) {
          return (c.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => Math.round(parseFloat(v) * 255)).join(", ");
        }
        return c.match(/\d+/g)?.slice(0, 3).join(", ") ?? "";
      };
      const isToken = (c: string) => {
        if (c === "transparent" || /, 0\)$|\/ 0\)$/.test(c)) return true;
        return toks.includes(triple(c));
      };
      const bad: string[] = [];
      for (const root of Array.from(document.querySelectorAll(s))) {
        for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
          if (el.closest(".katex, .DocSearch-Logo, img")) continue;
          if (noSvg && el instanceof SVGElement) continue;
          const st = getComputedStyle(el);
          const ownText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
          const paints: string[] = [];
          if (el instanceof SVGElement) {
            // Só as formas e o texto pintam; contêineres herdam cor sem desenhar nada.
            if (/^(rect|path|circle|ellipse|polygon|polyline|line|text|tspan)$/.test(el.tagName)) {
              // Uma line não tem interior: só o traço pinta.
              if (st.fill !== "none" && el.tagName !== "line" && (ownText || el.tagName !== "text")) paints.push(st.fill);
              if (st.stroke !== "none") paints.push(st.stroke);
            }
          } else {
            if (ownText) paints.push(st.color);
            if (st.backgroundColor !== "transparent") paints.push(st.backgroundColor);
            for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
              if (parseFloat(st[`border${side}Width`]) > 0) paints.push(st[`border${side}Color`]);
            }
          }
          for (const c of paints) {
            if (c && !isToken(c)) bad.push(`${el.tagName} ${el.getAttribute("class") ?? ""}: ${c}`);
          }
        }
      }
      return bad;
    },
    [scope, tokens, skipSvg] as const,
  );

test("CODE-01 fundo dos blocos de código em panel, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of CODE_PAGES) {
    await openIn(page, path, theme);
    const blocks = page.locator("pre");
    const n = await blocks.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(blocks.nth(i)).toHaveCSS("background-color", rgb(T[theme].panel));
    }
  }
});

test("CODE-02 comentários de código em ink-muted, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    let total = 0;
    for (const path of CODE_PAGES) {
      await openIn(page, path, theme);
      const comments = page.locator("pre .token.comment");
      const n = await comments.count();
      total += n;
      for (let i = 0; i < n; i++) await expect(comments.nth(i)).toHaveCSS("color", rgb(T[theme].inkMuted));
    }
    // Nem toda página tem comment; o conjunto das páginas tem.
    expect(total).toBeGreaterThan(0);
  }
});

test("CODE-03 palavras-chave de código em signal, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    let total = 0;
    for (const path of CODE_PAGES) {
      await openIn(page, path, theme);
      const keywords = page.locator("pre .token.keyword");
      const n = await keywords.count();
      total += n;
      for (let i = 0; i < n; i++) await expect(keywords.nth(i)).toHaveCSS("color", rgb(T[theme].signal));
    }
    // Nem toda página tem keyword; o conjunto das páginas tem.
    expect(total).toBeGreaterThan(0);
  }
});

test("CODE-04 todo outro texto de código em ink, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of CODE_PAGES) {
    await openIn(page, path, theme);
    const others = page.locator("pre code span:not(.token.comment):not(.token.keyword)");
    const n = await others.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(others.nth(i)).toHaveCSS("color", rgb(T[theme].ink));
    }
  }
});

test("CODE-05 zero color-contrast nos blocos de código de getting_started e test_coverage_sdlc, em Paper e em Void", async ({
  page,
}) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of [GETTING, SDLC]) {
      await openIn(page, path, theme);
      await expect(page.locator("pre")).not.toHaveCount(0);
      const results = await new AxeBuilder({ page } as unknown as AxeOptions)
        .include("pre")
        .withRules(["color-contrast"])
        .analyze();
      expect(results.violations, `${path} ${theme}`).toEqual([]);
    }
  }
});

test("DIAG-01 texto dos diagramas em IBM Plex Sans, em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of ["docs/istqb/ctfl/ctfl_01", "docs/istqb", "docs/notes/peltzman_effect"]) {
      await openIn(page, path, theme);
      await expect(page.locator(".docusaurus-mermaid-container svg g.node").first()).toBeAttached();
      const labels = await page
        .locator(".docusaurus-mermaid-container svg g.node :is(span, p, text)")
        .evaluateAll((els) =>
          els.filter((e) => e.textContent!.trim()).map((e) => getComputedStyle(e).fontFamily),
        );
      expect(labels.length, path).toBeGreaterThan(0);
      for (const f of labels) expect(f, path).toMatch(/IBM Plex Sans/);
    }
  }
});

test("DIAG-02 todo preenchimento, traço e texto dos diagramas só com tokens ou transparente, em Paper e em Void", async ({
  page,
}) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of DIAGRAM_PAGES) {
      await openIn(page, path, theme);
      await expect(page.locator(".docusaurus-mermaid-container svg").first()).toBeAttached();
      const tokens = await tokenTriples(page);
      expect(await foreignPaints(page, ".docusaurus-mermaid-container svg", tokens, false), `${theme} ${path}`).toEqual([]);
    }
  }
});

test("DIAG-03 nós e grupos sem classe com fundo paper ou panel e traço ink, em Paper e em Void", async ({ page }) => {
  // Classes do "Mapa de cores dos diagramas": esses nós e grupos têm cor própria (DIAG-04).
  const CLASSED = ["ctal", "gra", "green", "invi", "invisible", "ora", "red", "yel", "error"];
  for (const theme of ["paper", "void"] as Theme[]) {
    let nodes = 0;
    let clusters = 0;
    for (const path of DIAGRAM_PAGES) {
      await openIn(page, path, theme);
      await expect(page.locator(".docusaurus-mermaid-container svg").first()).toBeAttached();
      const shapes = await page.evaluate((classed) => {
        const plain = (g: Element) => !classed.some((c) => g.classList.contains(c));
        const read = (g: Element, sel: string) =>
          Array.from(g.querySelectorAll(`:scope > ${sel}`)).map((el) => {
            const cs = getComputedStyle(el);
            return { fill: cs.fill, stroke: cs.stroke };
          });
        const svgs = Array.from(document.querySelectorAll(".docusaurus-mermaid-container svg"));
        const all = (sel: string) => svgs.flatMap((svg) => Array.from(svg.querySelectorAll(sel)));
        return {
          nodes: all("g.node").filter(plain).flatMap((g) => read(g, ":is(rect, path, polygon, circle)")),
          clusters: all("g.cluster").filter(plain).flatMap((g) => read(g, "rect")),
        };
      }, CLASSED);
      nodes += shapes.nodes.length;
      clusters += shapes.clusters.length;
      for (const s of [...shapes.nodes, ...shapes.clusters]) {
        expect([rgb(T[theme].paper), rgb(T[theme].panel)], `${theme} ${path} fundo`).toContain(s.fill);
        expect(s.stroke, `${theme} ${path} traço`).toBe(rgb(T[theme].ink));
      }
    }
    expect(nodes, `${theme} nós sem classe`).toBeGreaterThan(0);
    expect(clusters, `${theme} grupos sem classe`).toBeGreaterThan(0);
  }
});

test("DIAG-05 ao trocar o modo de cor, os diagramas passam aos tokens do novo tema", async ({ page }) => {
  await openIn(page, "docs/istqb", "paper");
  const node = page.locator(".docusaurus-mermaid-container svg g.node:not(.ctal) rect, .docusaurus-mermaid-container svg g.node:not(.ctal) polygon").first();
  await expect(node).toHaveCSS("fill", rgb(T.paper.panel));
  const toggle = page.getByRole("button", { name: /Mudar entre modo claro e escuro/ });
  await expect(async () => {
    if ((await page.locator("html").getAttribute("data-theme")) !== "dark") await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark", { timeout: 1000 });
  }).toPass();
  await expect(node).toHaveCSS("fill", rgb(T.void.panel));
});

test("DIAG-06 zero color-contrast nos diagramas das páginas com diagrama, em Paper e em Void", async ({ page }) => {
  test.setTimeout(300_000);
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of DIAGRAM_PAGES) {
      await openIn(page, path, theme);
      await expect(page.locator(".docusaurus-mermaid-container svg").first()).toBeAttached();
      const results = await new AxeBuilder({ page } as unknown as AxeOptions)
        .include(".docusaurus-mermaid-container")
        .withRules(["color-contrast"])
        .analyze();
      expect(results.violations, `${theme} ${path}`).toEqual([]);
    }
  }
});

test("LEFT-03 toda cor de texto, fundo e borda do chrome e do artigo é token do tema, nas 8 páginas", async ({ page }) => {
  for (const theme of ["paper", "void"] as Theme[]) {
    for (const path of LEFT_PAGES) {
      await openIn(page, path, theme);
      await page.waitForLoadState("networkidle");
      const tokens = await tokenTriples(page);
      // Sem contar imagens, ícones, KaTeX e o logo do Algolia: esses ficam de fora da varredura.
      expect(await foreignPaints(page, "body", tokens, true), `${theme} ${path || "home"}`).toEqual([]);
    }
  }
});
