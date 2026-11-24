import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

/** As cinco páginas dos critérios, relativas ao `baseURL` (`/garden/`). */
export const PAGES = {
  home: "",
  start: "docs/project",
  about: "docs/project/about",
  peltzman: "docs/notes/peltzman_effect",
  stageA: "docs/tags/stageA",
} as const;

/** Valores de Paper e Void copiados da spec. */
export const TOKENS = {
  paper: { background: "#f4f4f1", text: "#0b0c0e", signal: "#002fa7" },
  void: { background: "#0a0b0d", text: "#eeeeea", signal: "#2b7fff" },
} as const;

export type Theme = keyof typeof TOKENS;

/** Abre `path` com o sistema no modo do tema e sem escolha salva. */
export async function openIn(page: Page, path: string, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme === "paper" ? "light" : "dark" });
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    theme === "paper" ? "light" : "dark",
  );
}

/** `#rrggbb` → `rgb(r, g, b)`, o formato de `getComputedStyle`. */
export function rgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

/** O desenho de um ícone `svg`: a marcação interna sem o `<title>`, que só dá o nome. */
export const drawing = (svg: Locator) =>
  svg.evaluate((el) => {
    const copy = el.cloneNode(true) as Element;
    copy.querySelector("title")?.remove();
    return copy.innerHTML;
  });

/** Blocos ```mermaid (com ou sem recuo) do fonte da página aberta: `<rota>.mdx`, `.md` ou `<rota>/README.mdx`, `.md`. */
export function mermaidBlocks(page: Page) {
  const route = new URL(page.url()).pathname.replace(/^\/garden\//, "").replace(/\/$/, "");
  const file = [`${route}.mdx`, `${route}.md`, `${route}/README.mdx`, `${route}/README.md`]
    .map((f) => join(__dirname, "..", "..", f))
    .find((f) => existsSync(f));
  if (!file) throw new Error(`sem fonte para ${route}`);
  return (readFileSync(file, "utf-8").match(/^\s*```mermaid\s*$/gm) ?? []).length;
}

/** Espera todos os diagramas Mermaid da página aberta desenharem. */
export async function waitDiagrams(page: Page) {
  const n = mermaidBlocks(page);
  await expect(page.locator(".docusaurus-mermaid-container svg")).toHaveCount(n, { timeout: 20_000 });
  return n;
}
