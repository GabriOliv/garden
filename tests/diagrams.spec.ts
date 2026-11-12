import { expect, test, type Page } from "@playwright/test";
import { openIn, rgb, type Theme } from "./support/site";

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
