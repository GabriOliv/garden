import { expect, test } from "@playwright/test";

test("LAY-01 em 1280 px o item Notas tem a largura de um item de Certificações", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("docs/project");
  const cert = (await page.locator('main [data-item="CTFL"]').boundingBox())!;
  const notes = (await page.locator('main [data-item="Notas"]').boundingBox())!;
  expect(Math.abs(notes.width - cert.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(notes.x - cert.x)).toBeLessThanOrEqual(1);
});

test("LAY-02 o chip de estágio fica na mesma linha de base dos outros chips do rodapé", async ({ page }) => {
  for (const width of [1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("docs/notes/hawthorne_effect_on_documentation");
    const chips = page.locator('.theme-doc-footer a[rel="tag"]');
    const stage = chips.filter({ has: page.locator("svg") }).first();
    const other = chips.filter({ hasNot: page.locator("svg") }).first();
    // A base do texto de cada chip: o fim da caixa do primeiro texto visível (o nome).
    const bottom = (chip: typeof stage) =>
      chip.evaluate((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode()) && !node.textContent!.trim());
        const range = document.createRange();
        range.selectNodeContents(node!);
        return range.getBoundingClientRect().bottom;
      });
    const [s, o] = [await stage.boundingBox(), await other.boundingBox()];
    // Só compara chips da mesma linha do rodapé.
    expect(Math.abs(s!.y - o!.y), `${width} mesma linha`).toBeLessThan(s!.height);
    expect(Math.abs((await bottom(stage)) - (await bottom(other))), `${width} linha de base`).toBeLessThanOrEqual(1);
  }
});
