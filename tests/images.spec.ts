import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PAGES, openIn, rgb } from "./support/site";

const ROOT = join(__dirname, "..");

/** Diagrama próprio do Garden (AD-013): o SVG com tema por `prefers-color-scheme` e sem cor gravada em `style`. */
const ownThemed = (copy: string) => {
  const svg = readFileSync(join(ROOT, copy), "utf-8");
  expect(svg.includes("prefers-color-scheme"), `${copy} com tema`).toBe(true);
  expect(svg.includes('style="fill:rgb'), `${copy} sem cor gravada`).toBe(false);
};

/** Asset próprio do Garden (AD-011): o SVG original, com animação e sem cores gravadas em `style`. */
const ownAnimated = (copy: string) => {
  const svg = readFileSync(join(ROOT, copy), "utf-8");
  expect(/@keyframes|<animate/.test(svg), `${copy} animado`).toBe(true);
  expect(svg.includes('style="fill:rgb'), `${copy} sem cor gravada`).toBe(false);
};

const FLASK = (theme: string) => `flask-garden-001-dossier-${theme}.svg`;

test("IMG-01 home em Paper mostra o frasco -paper.svg", async ({ page }) => {
  await openIn(page, PAGES.home, "paper");
  const flask = page.locator(`main img[src$="/${FLASK("paper")}"]`);
  await expect(flask).toBeVisible();
  await expect.poll(() => flask.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(`main img[src$="/${FLASK("void")}"]:visible`)).toHaveCount(0);
  ownAnimated(`static/img/dossier/${FLASK("paper")}`);
});

test("IMG-02 home em Void mostra o frasco -void.svg", async ({ page }) => {
  await openIn(page, PAGES.home, "void");
  const flask = page.locator(`main img[src$="/${FLASK("void")}"]`);
  await expect(flask).toBeVisible();
  await expect.poll(() => flask.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(`main img[src$="/${FLASK("paper")}"]:visible`)).toHaveCount(0);
  ownAnimated(`static/img/dossier/${FLASK("void")}`);
});

/** O `img` de um card de "Comece a Leitura" tem o arquivo `stem` e carrega. */
const expectBanner = async (page: Page, item: string, stem: string) => {
  const img = page.locator(`main [data-item="${item}"] img`);
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", new RegExp(`/${stem}[^/]*\\.svg(#.*)?$`));
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
};

test("IMG-03 cards CTFL e CT-TAS com banner-flask-dossier.svg", async ({ page }) => {
  await page.goto(PAGES.start);
  for (const item of ["CTFL", "CT-TAS"]) await expectBanner(page, item, "banner-flask-dossier");
  ownAnimated("docs/project/assets/banner/banner-flask-dossier.svg");
});

test("IMG-04 card Notas com banner-flask-qa-dossier.svg", async ({ page }) => {
  await page.goto(PAGES.start);
  await expectBanner(page, "Notas", "banner-flask-qa-dossier");
  ownAnimated("docs/project/assets/banner/banner-flask-qa-dossier.svg");
});

const JENGA = "docs/notes/software_ongoing_manual_testing";
const SDLC = "docs/notes/test_coverage_sdlc";

/** As imagens de `figure` de uma nota, com o `src` e o texto alternativo. */
const figures = (page: Page) =>
  page
    .locator("article figure img")
    .evaluateAll((imgs) =>
      imgs
        // Só a do tema ativo: a outra versão do diagrama fica escondida (IMG-13).
        .filter((i) => i.getClientRects().length > 0)
        .map((i) => ({ src: i.getAttribute("src")!, alt: i.getAttribute("alt")! })),
    );

test("IMG-05 nota Jenga mostra diagrama-jenga-dossier.svg", async ({ page }) => {
  await page.goto(JENGA);
  const imgs = await figures(page);
  expect(imgs).toHaveLength(1);
  expect(imgs[0].src).toMatch(/\/diagrama-jenga-dossier[^/]*\.svg(#.*)?$/);
  const img = page.locator("article figure img:visible");
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  ownThemed("docs/notes/assets/diagrama-jenga-dossier.svg");
});

test("IMG-06 nota de cobertura mostra os dois diagramas SDLC, na ordem de hoje", async ({ page }) => {
  await page.goto(SDLC);
  const imgs = await figures(page);
  expect(imgs).toHaveLength(2);
  expect(imgs[0].src).toMatch(/\/diagrama-sdlc-sem-cobertura-dossier[^/]*\.svg(#.*)?$/);
  expect(imgs[1].src).toMatch(/\/diagrama-sdlc-com-cobertura-dossier[^/]*\.svg(#.*)?$/);
  for (const el of await page.locator("article figure img:visible").all()) {
    await expect.poll(() => el.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  }
  for (const name of ["sem", "com"]) ownThemed(`docs/notes/assets/diagrama-sdlc-${name}-cobertura-dossier.svg`);
});

test("IMG-07 cada imagem trocada mantém o alt de antes", async ({ page }) => {
  // Frasco da home: o `alt` do GIF.
  await openIn(page, PAGES.home, "paper");
  await expect(page.locator('main img[src$="/flask-garden-001-dossier-paper.svg"]')).toHaveAttribute(
    "alt",
    "Site Logo",
  );
  await openIn(page, PAGES.home, "void");
  await expect(page.locator('main img[src$="/flask-garden-001-dossier-void.svg"]')).toHaveAttribute(
    "alt",
    "Site Logo",
  );
  // Os três cards e as três figuras das notas: `![image](...)`.
  await page.goto(PAGES.start);
  for (const item of ["CTFL", "CT-TAS", "Notas"]) {
    await expect(page.locator(`main [data-item="${item}"] img`)).toHaveAttribute("alt", "image");
  }
  for (const path of [JENGA, SDLC]) {
    await page.goto(path);
    for (const { alt } of await figures(page)) expect(alt).toBe("image");
  }
});

/** Arquivos que `legacy-assets.md` lista nos itens 01, 02, 03, 15, 16 e 17. */
const REPLACED = [
  "static/animation/flask-garden-001.gif",
  "docs/project/assets/banner/banner_flask_default.webp",
  "docs/project/assets/banner/banner_flask_qa_default.webp",
  "docs/notes/assets/jenga_dev.svg",
  "docs/notes/assets/test_coverage_sdlc_without_coverage.svg",
  "docs/notes/assets/test_coverage_sdlc_with_coverage.svg",
];

test("IMG-08 os arquivos dos itens 01, 02, 03, 15, 16 e 17 não existem mais", () => {
  for (const path of REPLACED) expect(existsSync(join(ROOT, path)), path).toBe(false);
});

test("IMG-09 itens 04 a 14, 18 e 20 a 29 no mesmo caminho e com o mesmo sha256", () => {
  const assets: { item: number; path: string; sha256: string }[] = JSON.parse(
    readFileSync(join(__dirname, "support", "legacy-assets.json"), "utf-8"),
  );
  const expected = [...range(4, 14), 18, ...range(20, 29)];
  expect(assets.map((a) => a.item)).toEqual(expected);
  for (const { path, sha256 } of assets) {
    const digest = createHash("sha256").update(readFileSync(join(ROOT, path))).digest("hex");
    expect(digest, path).toBe(sha256);
  }
});

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Duas fotos da imagem com `ms` de intervalo. */
const twoShots = async (page: Page, selector: string, ms: number) => {
  const img = page.locator(selector).first();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  const a = await img.screenshot();
  await page.waitForTimeout(ms);
  return [a, await img.screenshot()];
};

test("IMG-10 o frasco da home e os banners de Comece a Leitura se mexem", async ({ page }) => {
  await openIn(page, PAGES.home, "paper");
  const [h1, h2] = await twoShots(page, `main img[src$="/${FLASK("paper")}"]`, 1500);
  expect(h1.equals(h2), "frasco da home").toBe(false);
  await openIn(page, PAGES.start, "paper");
  for (const item of ["CTFL", "Notas"]) {
    const [a, b] = await twoShots(page, `main [data-item="${item}"] img`, 1500);
    expect(a.equals(b), `banner ${item}`).toBe(false);
  }
});

test("IMG-11 os banners de Comece a Leitura seguem o modo de cor do site, não o do sistema", async ({ browser }) => {
  // Cor do canto de cima à esquerda do banner (o fundo), com o sistema num modo e o site no outro.
  const corner = async (system: "light" | "dark", site: "light" | "dark") => {
    const page = await browser.newPage({ colorScheme: system });
    await page.addInitScript((m) => localStorage.setItem("theme", m), site);
    await page.goto(PAGES.start);
    await expect(page.locator("html")).toHaveAttribute("data-theme", site);
    const img = page.locator('main [data-item="CTFL"] img');
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    const png = await img.screenshot();
    const rgb = await page.evaluate(async (b64) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height).getContext("2d")!;
      c.drawImage(bmp, 0, 0);
      return Array.from(c.getImageData(2, 2, 1, 1).data.slice(0, 3)).join(", ");
    }, png.toString("base64"));
    await page.close();
    return `rgb(${rgb})`;
  };
  expect(await corner("dark", "light")).toBe(rgb("#f4f4f1"));
  expect(await corner("light", "dark")).toBe(rgb("#0a0b0d"));
});

test("IMG-12 home e Comece a Leitura mostram banners do Dossier no lugar dos undraw", async ({ page }) => {
  const visible = (sel: string) =>
    page.locator(sel).evaluateAll((els) =>
      els
        .filter((el) => el.getClientRects().length > 0)
        // Sem o hash que o webpack põe no nome das imagens do Markdown.
        .map((el) => el.getAttribute("src")!.split("/").pop()!.replace(/-[0-9a-f]{32}(?=\.svg)/, "")),
    );
  for (const theme of ["paper", "void"] as const) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openIn(page, PAGES.home, theme);
    expect(await visible("main img")).toEqual(
      expect.arrayContaining(["banner-grafo-dossier.svg", "banner-automato-dossier.svg", "banner-filotaxia-dossier.svg"]),
    );
    expect((await visible("main img")).filter((s) => s.includes("undraw")), `home ${theme}`).toEqual([]);
    for (const [width, want] of [
      [1280, ["banner-automato-dossier.svg", "banner-harmonografo-dossier.svg", "banner-grafo-dossier.svg"]],
      [390, ["banner-harmonografo-dossier.svg"]],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await openIn(page, PAGES.start, theme);
      const top = (await visible("main img")).filter((s) => s.startsWith("banner-") && !s.startsWith("banner-flask"));
      expect(top, `start ${width} ${theme}`).toEqual([...want]);
      expect((await visible("main img")).filter((s) => s.includes("undraw")), `start ${width} ${theme}`).toEqual([]);
    }
  }
  for (const f of ["automato", "filotaxia", "grafo", "harmonografo"]) ownAnimated(`static/img/dossier/banner-${f}-dossier.svg`);
});

test("IMG-13 os diagramas das notas seguem o modo de cor do site, não o do sistema", async ({ browser }) => {
  // Cor de um ponto do fundo do diagrama, com o sistema num modo e o site no outro.
  const corner = async (path: string, system: "light" | "dark", site: "light" | "dark") => {
    const page = await browser.newPage({ colorScheme: system });
    await page.addInitScript((m) => localStorage.setItem("theme", m), site);
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", site);
    const img = page.locator("article figure img").first();
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    const png = await img.screenshot();
    const color = await page.evaluate(async (b64) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height).getContext("2d")!;
      c.drawImage(bmp, 0, 0);
      return Array.from(c.getImageData(1, 1, 1, 1).data.slice(0, 3)).join(", ");
    }, png.toString("base64"));
    await page.close();
    return `rgb(${color})`;
  };
  for (const path of [JENGA, SDLC]) {
    expect(await corner(path, "dark", "light"), `${path} claro`).toBe(rgb("#f4f4f1"));
    expect(await corner(path, "light", "dark"), `${path} escuro`).toBe(rgb("#0a0b0d"));
  }
});

test("IMG-14 figuras dos cubos guardadas: SVG estático em img/cubes e página animada em embeds", async ({ page, request }) => {
  for (const name of ["cube-test-rig", "esteira-cubo-magico"]) {
    const svg = readFileSync(join(ROOT, `static/img/cubes/${name}.svg`), "utf-8");
    expect(svg.includes("<script"), `${name}.svg sem script`).toBe(false);
    expect((await request.get(`img/cubes/${name}.svg`)).status(), `${name}.svg`).toBe(200);
    // A página animada desenha a figura por script: depois de carregar, o SVG tem peças e muda com o tempo.
    // Sem ".html": o `docusaurus serve` dos testes redireciona o .html para fora do baseUrl.
    await page.goto(`embeds/${name}`);
    const rig = page.locator("svg#rig");
    await expect.poll(() => rig.evaluate((el) => el.querySelectorAll("*").length)).toBeGreaterThan(100);
    // O script só anima com a figura na tela.
    await rig.scrollIntoViewIfNeeded();
    const a = await rig.evaluate((el) => el.innerHTML);
    await expect.poll(() => rig.evaluate((el) => el.innerHTML), { message: `${name} anima`, timeout: 10_000 }).not.toBe(a);
  }
});
