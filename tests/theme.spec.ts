import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PAGES, TOKENS, openIn, rgb, type Theme } from "./support/site";

/** Documento com h1, h2, h3, código em linha e bloco de código. */
const DOC = "docs/project/getting_started";
const ORIGIN = "http://127.0.0.1:4400";

const firstFamily = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) =>
      getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, ""),
    );

const css = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const background = (page: Page) => css(page, "html", "background-color");
const bodyText = ".theme-doc-markdown p";
const contentLink = ".theme-doc-markdown a[href]:not(.hash-link)";

test("THEME-01 fundo da página em Paper", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "paper");
  expect(await background(page)).toBe(rgb(TOKENS.paper.background));
});

test("THEME-02 texto base em Paper", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "paper");
  expect(await css(page, "body", "color")).toBe(rgb(TOKENS.paper.text));
  expect(await css(page, bodyText, "color")).toBe(rgb(TOKENS.paper.text));
});

test("THEME-03 fundo da página em Void", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "void");
  expect(await background(page)).toBe(rgb(TOKENS.void.background));
});

test("THEME-04 texto base em Void", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "void");
  expect(await css(page, "body", "color")).toBe(rgb(TOKENS.void.text));
  expect(await css(page, bodyText, "color")).toBe(rgb(TOKENS.void.text));
});

test("THEME-05 links do conteúdo em signal de Paper", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "paper");
  expect(await css(page, contentLink, "color")).toBe(rgb(TOKENS.paper.signal));
});

test("THEME-06 links do conteúdo em signal de Void", async ({ page }) => {
  await openIn(page, PAGES.peltzman, "void");
  expect(await css(page, contentLink, "color")).toBe(rgb(TOKENS.void.signal));
});

test("THEME-07 texto corrido em IBM Plex Sans", async ({ page }) => {
  await openIn(page, DOC, "paper");
  await expect.poll(() => firstFamily(page, "body")).toBe("IBM Plex Sans");
  await expect.poll(() => firstFamily(page, bodyText)).toBe("IBM Plex Sans");
});

test("THEME-08 títulos h1, h2 e h3 em IBM Plex Sans Condensed", async ({ page }) => {
  await openIn(page, DOC, "paper");
  for (const h of ["h1", "h2", "h3"]) {
    await expect.poll(() => firstFamily(page, `.theme-doc-markdown ${h}`), { message: h }).toBe(
      "IBM Plex Sans Condensed",
    );
  }
});

test("THEME-09 código em linha e blocos de código em IBM Plex Mono", async ({ page }) => {
  await openIn(page, DOC, "paper");
  await expect.poll(() => firstFamily(page, ".theme-doc-markdown p code")).toBe("IBM Plex Mono");
  await expect.poll(() => firstFamily(page, ".theme-doc-markdown pre code")).toBe("IBM Plex Mono");
});

test("THEME-10 fontes IBM Plex servidas pela própria origem", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  const fonts: { url: string; status: number }[] = [];
  page.on("response", (r) => {
    if (r.request().resourceType() === "font") fonts.push({ url: r.url(), status: r.status() });
  });

  await openIn(page, DOC, "paper");
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => {
    const families: string[] = [];
    document.fonts.forEach((f) => {
      if (f.status === "loaded") families.push(f.family.replace(/["']/g, ""));
    });
    return families;
  });

  for (const family of ["IBM Plex Sans", "IBM Plex Sans Condensed", "IBM Plex Mono"]) {
    expect(loaded, family).toContain(family);
  }
  for (const file of ["ibm-plex-sans-latin", "ibm-plex-sans-condensed-latin", "ibm-plex-mono-latin"]) {
    const hit = fonts.filter((f) => f.url.includes(file));
    expect(hit.length, file).toBeGreaterThan(0);
    for (const f of hit) {
      expect(f.url.startsWith(`${ORIGIN}/garden/`), f.url).toBe(true);
      expect(f.status, f.url).toBeLessThan(400);
    }
  }
  expect(requests.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
});

test("THEME-11 sistema claro sem escolha salva abre em Paper", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGES.home);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await background(page)).toBe(rgb(TOKENS.paper.background));
});

test("THEME-12 sistema escuro sem escolha salva abre em Void", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(PAGES.home);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await background(page)).toBe(rgb(TOKENS.void.background));
});

test("THEME-13 botão de modo de cor troca o tema e a escolha sobrevive ao recarregar", async ({
  page,
}) => {
  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: /Mudar entre modo claro e escuro/ });
  const choose = async (mode: "modo claro" | "modo escuro") => {
    for (let i = 0; i < 3; i++) {
      if ((await toggle.getAttribute("aria-label"))?.includes(`(${mode} está ativo)`)) return;
      await toggle.click();
    }
    await expect(toggle).toHaveAttribute("aria-label", new RegExp(`\\(${mode} está ativo\\)`));
  };

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(PAGES.home);
  await expect(html).toHaveAttribute("data-theme", "light");

  await choose("modo escuro");
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await background(page)).toBe(rgb(TOKENS.void.background));
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await background(page)).toBe(rgb(TOKENS.void.background));

  await choose("modo claro");
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  expect(await background(page)).toBe(rgb(TOKENS.paper.background));
});

test("THEME-14 CSS publicado sem as cores antigas", () => {
  const dir = join("build", "assets", "css");
  const files = readdirSync(dir).filter((f) => f.endsWith(".css"));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    const text = readFileSync(join(dir, f), "utf8").toLowerCase();
    for (const color of ["#3f3fd9", "#9a47ff", "#0d1117"]) {
      expect(text.includes(color), `${f} contém ${color}`).toBe(false);
    }
  }
});

test("THEME-15 requisições da própria origem com status menor que 400", async ({ page }) => {
  const bad: string[] = [];
  page.on("response", (r) => {
    if (r.url().startsWith(ORIGIN) && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(ORIGIN)) bad.push(`falhou ${r.url()}`);
  });
  let own = 0;
  page.on("request", (r) => {
    if (r.url().startsWith(ORIGIN)) own++;
  });

  for (const path of Object.values(PAGES)) {
    await page.goto(path, { waitUntil: "networkidle" });
  }
  expect(own).toBeGreaterThan(0);
  expect(bad).toEqual([]);
});

test("THEME-16 cinco páginas sem erro no console, em Paper e em Void", async ({ page }) => {
  const errors: string[] = [];
  let where = "";
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${where}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`${where}: ${e.message}`));

  for (const theme of ["paper", "void"] as Theme[]) {
    for (const [name, path] of Object.entries(PAGES)) {
      where = `${theme} ${name}`;
      await openIn(page, path, theme);
      await page.waitForLoadState("networkidle");
    }
  }
  expect(errors).toEqual([]);
});
