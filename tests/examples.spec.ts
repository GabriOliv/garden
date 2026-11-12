import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { openIn, PAGES, rgb } from "./support/site";

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );

test("EX-01 seção de exemplos em /garden/exemplos/ com o item Exemplos na navbar", async ({
  page,
}) => {
  const res = await page.goto("exemplos/");
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { level: 1, name: "Exemplos" })).toBeVisible();

  await page.goto(PAGES.home);
  const item = page.locator("nav.navbar").getByRole("link", { name: "Exemplos", exact: true });
  await expect(item).toBeVisible();
  await item.click();
  await expect(page).toHaveURL(/\/garden\/exemplos\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Exemplos" })).toBeVisible();
});

test("EX-03 build de produção sem nenhum rastro da seção de exemplos", () => {
  const all = files("build");
  const html = all.filter((f) => f.endsWith(".html"));
  expect(html.length).toBeGreaterThan(0);

  expect(all.filter((f) => relative("build", f).startsWith("exemplos"))).toEqual([]);
  expect(html.filter((f) => readFileSync(f, "utf8").includes("/garden/exemplos"))).toEqual([]);

  const sitemap = join("build", "sitemap.xml");
  expect(existsSync(sitemap)).toBe(true);
  const xml = readFileSync(sitemap, "utf8");
  expect(xml).toContain("<loc>");
  expect(xml).not.toContain("/exemplos");
});

/** Links do menu lateral de `/garden/exemplos/`: uma entrada por página de exemplo. */
async function examplePages(page: Page): Promise<string[]> {
  await page.goto("exemplos/");
  const hrefs = await page
    .locator("nav.menu a.menu__link")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  return [...new Set(hrefs)].filter((h) => /^\/garden\/exemplos(\/|$)/.test(h));
}

test("EX-02 cada um dos 49 componentes exportados tem uma demonstração desenhada", async ({
  page,
}) => {
  const exported = Object.keys(await import("@gabrioliv/dossier")).filter((n) => n !== "toast");
  expect(exported).toHaveLength(49);

  const drawn = new Set<string>();
  for (const href of await examplePages(page)) {
    await page.goto(href.replace("/garden/", ""));
    const names = await page.locator("section[data-component]").evaluateAll((sections) =>
      sections
        .filter((s) => Array.from(s.children).some((c) => c.getBoundingClientRect().height > 0))
        .map((s) => s.getAttribute("data-component") ?? ""),
    );
    names.forEach((n) => drawn.add(n));
  }
  expect(exported.filter((n) => !drawn.has(n)), "componentes sem demonstração desenhada").toEqual([]);
});

test("EX-04 cada página de exemplo abre sem erro no console, em Paper e em Void", async ({
  page,
}) => {
  const pages = await examplePages(page);
  expect(pages.length).toBeGreaterThan(1);

  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  for (const theme of ["paper", "void"] as const) {
    for (const href of pages) {
      await openIn(page, href.replace("/garden/", ""), theme);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
    }
  }
  expect(errors).toEqual([]);
});

test("EX-06 bloco Blueprint com fundo #0f3270 com o site em Paper e em Void", async ({ page }) => {
  for (const theme of ["paper", "void"] as const) {
    await openIn(page, "exemplos/diagramas", theme);
    const block = page.locator('[data-theme="blueprint"]').first();
    await expect(block).toBeVisible();
    await expect(block.locator("svg").first()).toBeVisible();
    await expect(block).toHaveCSS("background-color", rgb("#0f3270"));
  }
});

test("EX-16 digitar no TextField deixa o campo com o texto digitado", async ({ page }) => {
  await page.goto("exemplos/formularios");
  const field = page.getByRole("textbox", { name: /Relatório/ });
  await expect(async () => {
    await field.click();
    await field.pressSequentially("relatório 0427");
    await expect(field).toHaveValue("relatório 0427");
  }).toPass();
});

test("EX-17 Checkbox, Switch e opção do RadioGroup ficam marcados ao ativar", async ({ page }) => {
  await page.goto("exemplos/formularios");
  const checkbox = page.getByLabel("Aceito os termos");
  const sw = page.getByLabel("Notificações por e-mail");
  const radio = page.getByRole("radio", { name: "Homologação" });
  await expect(checkbox).not.toBeChecked();
  await expect(sw).not.toBeChecked();
  await expect(radio).not.toBeChecked();

  await expect(async () => {
    if (!(await checkbox.isChecked())) await page.getByText("Aceito os termos").click();
    if (!(await sw.isChecked())) await page.getByText("Notificações por e-mail").click();
    if (!(await radio.isChecked())) await page.getByText("Homologação", { exact: true }).click();
    await expect(checkbox).toBeChecked({ timeout: 500 });
    await expect(sw).toBeChecked({ timeout: 500 });
    await expect(radio).toBeChecked({ timeout: 500 });
  }).toPass();
  await expect(page.getByRole("radio", { name: "Produção" })).not.toBeChecked();
});

test("EX-18 escolher uma opção no Select deixa o valor do Select igual ao dela", async ({
  page,
}) => {
  await page.goto("exemplos/formularios");
  const select = page.getByLabel("Estágio");
  await expect(async () => {
    await select.selectOption({ label: "Broto" });
    await expect(select).toHaveValue("B");
  }).toPass();
});

test("EX-07 clicar em Abrir diálogo mostra o dialog com o seu título", async ({ page }) => {
  await page.goto("exemplos/acoes-overlays");
  const dialog = page.getByRole("dialog", { name: "Excluir arquivo" });
  await expect(dialog).toBeHidden();
  await expect(async () => {
    await page.getByRole("button", { name: "Abrir diálogo" }).click();
    await expect(dialog).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(dialog.getByRole("heading", { name: "Excluir arquivo" })).toBeVisible();
});

test("EX-08 Escape fecha o Dialog e Fechar o fecha de novo", async ({ page }) => {
  await page.goto("exemplos/acoes-overlays");
  const open = page.getByRole("button", { name: "Abrir diálogo" });
  const dialog = page.getByRole("dialog", { name: "Excluir arquivo" });
  await expect(async () => {
    await open.click();
    await expect(dialog).toBeVisible({ timeout: 500 });
  }).toPass();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await open.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).toBeHidden();
});

test("EX-11 escolher um item do Menu fecha o menu e escreve o item na página", async ({ page }) => {
  await page.goto("exemplos/acoes-overlays");
  const menu = page.getByRole("menu");
  await expect(page.getByText("Item escolhido: nenhum")).toBeVisible();
  await expect(async () => {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(menu).toBeVisible({ timeout: 500 });
  }).toPass();

  await menu.getByRole("menuitem", { name: "Duplicar" }).click();
  await expect(menu).toBeHidden();
  await expect(page.getByText("Item escolhido: Duplicar")).toBeVisible();
});

test("EX-12 clicar no gatilho do Popover mostra o painel", async ({ page }) => {
  await page.goto("exemplos/acoes-overlays");
  const panel = page.getByText("Conteúdo do popover.");
  await expect(panel).toBeHidden();
  await expect(async () => {
    await page.getByRole("button", { name: "Abrir popover" }).click();
    await expect(panel).toBeVisible({ timeout: 500 });
  }).toPass();
});

test("EX-13 foco por Tab no gatilho do Tooltip mostra o texto do Tooltip", async ({ page }) => {
  await page.goto("exemplos/acoes-overlays");
  const before = page.getByRole("button", { name: "Abrir popover" });
  const trigger = page.getByRole("button", { name: "Passe o foco aqui" });
  const tip = page.getByText("Texto da dica");
  await expect(tip).toBeHidden();
  await expect(async () => {
    await before.focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused({ timeout: 500 });
    await expect(tip).toBeVisible({ timeout: 1500 });
  }).toPass();
});

test("EX-09 clicar na segunda aba mostra o painel dela e esconde o da primeira", async ({
  page,
}) => {
  await page.goto("exemplos/navegacao-feedback");
  const first = page.getByText("Painel da visão geral.");
  const second = page.getByText("Painel das falhas.");
  await expect(first).toBeVisible();
  await expect(second).toBeHidden();
  await expect(async () => {
    await page.getByRole("tab", { name: "Falhas" }).click();
    await expect(second).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(first).toBeHidden();
});

test("EX-10 clicar no título de um item fechado do Accordion mostra o conteúdo dele", async ({
  page,
}) => {
  await page.goto("exemplos/navegacao-feedback");
  const content = page.getByText("Quando o caso se repete e o resultado é estável.");
  await expect(content).toBeHidden();
  await page.getByText("Quando automatizar?").click();
  await expect(content).toBeVisible();
});

test("EX-14 clicar em Mostrar aviso mostra um toast na região Notificações", async ({ page }) => {
  await page.goto("exemplos/navegacao-feedback");
  const region = page.getByRole("region", { name: "Notificações" });
  await expect(region.getByText("Arquivo salvo")).toBeHidden();
  await expect(async () => {
    await page.getByRole("button", { name: "Mostrar aviso" }).click();
    await expect(region.getByText("Arquivo salvo")).toBeVisible({ timeout: 500 });
  }).toPass();
});

test("EX-15 clicar em Página 2 deixa a página 2 com aria-current=page", async ({ page }) => {
  await page.goto("exemplos/navegacao-feedback");
  const nav = page.getByRole("navigation", { name: "Paginação" });
  const two = nav.getByRole("button", { name: "Página 2" });
  await expect(nav.getByRole("button", { name: "Página 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(async () => {
    await two.click();
    await expect(two).toHaveAttribute("aria-current", "page", { timeout: 500 });
  }).toPass();
  await expect(nav.getByRole("button", { name: "Página 1" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("EX-05 textos de ptBR: Fechar no Dialog, Notificações no Toaster, Paginação no Pagination", async ({
  page,
}) => {
  await page.goto("exemplos/navegacao-feedback");
  await expect(page.getByRole("region", { name: "Notificações" })).toBeAttached();
  await expect(page.getByRole("navigation", { name: "Paginação" })).toBeVisible();

  await page.goto("exemplos/acoes-overlays");
  await expect(async () => {
    await page.getByRole("button", { name: "Abrir diálogo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Fechar", exact: true })).toBeVisible();
});
