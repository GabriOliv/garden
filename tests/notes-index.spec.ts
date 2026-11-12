import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { rgb } from "./support/site";

// As notas de hoje, na ordem do índice antigo.
const GROUPS = {
  Teorias: ["peltzman_effect", "hawthorne_effect_on_documentation", "software_ongoing_manual_testing", "e2e_useful"],
  Processos: ["test_coverage_sdlc"],
};

/** Título e descrição do front matter da nota. */
function frontMatter(id: string) {
  const src = readFileSync(`docs/notes/${id}.mdx`, "utf8");
  const field = (name: string) => src.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))![1].trim().replace(/^["']|["']$/g, "");
  return { title: field("title"), description: field("description") };
}

/** A lista `Contents` logo depois do h2 do grupo. */
const groupList = (page: import("@playwright/test").Page, name: string) =>
  page.locator(`h2:has-text("${name}") + ol.ds-contents`);

test("IDX-01 Teorias e Processos com as mesmas notas, na mesma ordem, com número, título e descrição", async ({
  page,
}) => {
  await page.goto("docs/notes");
  for (const [name, ids] of Object.entries(GROUPS)) {
    const rows = groupList(page, name).locator("li.ds-toc-item");
    await expect(rows).toHaveCount(ids.length);
    for (const [i, id] of ids.entries()) {
      const fm = frontMatter(id);
      const row = rows.nth(i);
      await expect(row.locator(".ds-toc-index")).toHaveText(String(i + 1).padStart(2, "0"));
      await expect(row.locator(".ds-toc-title")).toHaveText(fm.title);
      await expect(row.locator(".ds-toc-desc")).toHaveText(fm.description);
    }
  }
});

test("IDX-02 o título de uma linha abre a nota", async ({ page }) => {
  for (const ids of Object.values(GROUPS)) {
    for (const id of ids) {
      await page.goto("docs/notes");
      await page.locator("a.ds-toc-title", { hasText: frontMatter(id).title }).click();
      await expect(page).toHaveURL(new RegExp(`/garden/docs/notes/${id}$`));
    }
  }
});

test("IDX-03 cada linha do índice uma única vez no HTML", async ({ request }) => {
  const html = await (await request.get("docs/notes")).text();
  for (const id of Object.values(GROUPS).flat()) {
    expect(html.split(`href="./notes/${id}"`).length - 1, id).toBe(1);
  }
});

test("IDX-04 linhas separadas por fio de 1 px em rule-soft, sem caixa nem sombra", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("docs/notes");
  const rows = page.locator("ol.ds-contents > li.ds-toc-item");
  const n = await rows.count();
  expect(n).toBe(5);
  for (let i = 0; i < n; i++) {
    const s = await rows.nth(i).evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        bottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
        sides: [cs.borderLeftStyle, cs.borderRightStyle],
        shadow: cs.boxShadow,
        bg: cs.backgroundColor,
      };
    });
    expect(s.bottom).toBe(`1px solid ${rgb("#c6c7c1")}`);
    expect(s.sides).toEqual(["none", "none"]);
    expect(s.shadow).toBe("none");
    expect(s.bg).toBe("rgba(0, 0, 0, 0)");
  }
});

test("IDX-05 em 390 px número, título e descrição de cada linha sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("docs/notes");
  const rows = page.locator("li.ds-toc-item");
  await expect(rows).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    for (const part of [".ds-toc-index", ".ds-toc-title", ".ds-toc-desc"]) {
      const box = (await rows.nth(i).locator(part).boundingBox())!;
      expect(box.width, part).toBeGreaterThan(0);
      expect(box.x + box.width, part).toBeLessThanOrEqual(390);
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
