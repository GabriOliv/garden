import { expect, test, type Page } from "@playwright/test";

/** Nível, `id` e texto de cada título do artigo, sem o link de âncora. */
const headings = (page: Page) =>
  page.locator("article h2[id], article h3[id]").evaluateAll((els) =>
    els.map((el) => {
      const copy = el.cloneNode(true) as Element;
      copy.querySelector("a.hash-link")?.remove();
      return [Number(el.tagName[1]), el.id, copy.textContent!.trim()];
    }),
  );

/** `ctfl_01` como estava antes da troca de nível; 2 partes = h2, 3 partes = h3. */
const CTFL_01 = [
  [2, "11-o-que-é-teste", "1.1 O que é teste"],
  [3, "111-objetivos-do-teste", "1.1.1 Objetivos do Teste"],
  [3, "112-teste-e-depuração", "1.1.2 Teste e Depuração"],
  [2, "12-por-que-os-testes-são-necessários", "1.2 Por que os testes são NECESSÁRIOS?"],
  [3, "121-contribuições-para-o-sucesso-dos-testes", "1.2.1 Contribuições para o sucesso dos testes"],
  [3, "122-testes-e-garantia-da-qualidade-qa", "1.2.2 Testes e Garantia da Qualidade (QA)"],
  [3, "123-erros-defeitos-falhas-e-causa-raiz", "1.2.3 Erros, Defeitos, Falhas e Causa Raiz"],
  [2, "13-princípios-de-teste", "1.3 Princípios de Teste"],
  [2, "14-atividades-de-teste-testware-e-papéis-no-teste", "1.4 Atividades de teste, Testware e Papéis no teste"],
  [3, "141-atividades-e-tarefas-de-teste", "1.4.1 Atividades e Tarefas de Teste"],
  [3, "142-processo-de-teste-no-contexto", "1.4.2 Processo de Teste no Contexto"],
  [3, "143-testware", "1.4.3 Testware"],
  [3, "144-rastreabilidade-entre-a-base-de-teste-e-o-testware", "1.4.4 Rastreabilidade entre a Base de Teste e o Testware"],
  [3, "145-papéis-no-teste", "1.4.5 Papéis no Teste"],
  [2, "15-habilidades-essenciais-e-boas-práticas-em-testes", "1.5 Habilidades essenciais e boas práticas em testes"],
  [3, "151-habilidades-genéricas-necessárias-para-testes", "1.5.1 Habilidades genéricas necessárias para testes"],
  [3, "152-abordagem-de-equipe-completa", "1.5.2 Abordagem de equipe completa"],
  [3, "153-independência-dos-testes", "1.5.3 Independência dos testes"],
];

/** README do CT-TAS: os três títulos sem número viram h2. */
const CTTAS_README = [
  [2, "capítulos", "Capítulos"],
  [2, "fluxo-de-estudo", "Fluxo de Estudo"],
  [2, "referências", "Referências"],
];

test("FIX-04 título e âncora mantidos nos títulos que mudaram de nível", async ({ page }) => {
  await page.goto("docs/istqb/ctfl/ctfl_01");
  expect(await headings(page)).toEqual(CTFL_01);
  await page.goto("docs/istqb/cttas");
  expect(await headings(page)).toEqual(CTTAS_README);
});
