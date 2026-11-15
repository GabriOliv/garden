import { expect, test } from "@playwright/test";

const MISSING = "nao-existe";

test("ERR-01 código 404 e título em um aviso de erro do Dossier", async ({ page }) => {
  await page.goto(MISSING);
  const notice = page.locator("main section.ds-errnote");
  await expect(notice).toHaveCount(1);
  await expect(notice.locator(".ds-errnote-code")).toContainText("404");
  await expect(notice.locator("h1")).toHaveText("Página não encontrada");
});

test("ERR-02 frase e links Sobre, Notas e ISTQB abrem as páginas certas", async ({ page }) => {
  await page.goto(MISSING);
  const notice = page.locator("main section.ds-errnote");
  await expect(notice).toContainText("Este endereço não existe no Garden.");
  const links = [
    ["Sobre", "/garden/docs/project"],
    ["Notas", "/garden/docs/notes"],
    ["ISTQB", "/garden/docs/istqb"],
  ] as const;
  for (const [name, href] of links) {
    await expect(notice.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  for (const [name, href] of links) {
    await page.goto(MISSING);
    await page.locator("main section.ds-errnote").getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
});

test("ERR-03 sem o pedido de contato com o dono do site", async ({ page }) => {
  await page.goto(MISSING);
  await expect(page.locator("main section.ds-errnote")).toHaveCount(1);
  const text = await page.locator("body").innerText();
  expect(text.toLowerCase()).not.toContain("entre em contato com o dono do site");
  expect((await page.content()).toLowerCase()).not.toContain("entre em contato com o dono do site");
});
