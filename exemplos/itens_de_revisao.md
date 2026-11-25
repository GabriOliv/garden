# Itens de revisão

Pendências de checagem das notas. Cada item indica o artigo, o arquivo e as linhas afetadas.

## Testes de Mutação

Arquivo: `docs/notes/testes_mutacao.mdx`

### Fatos sem checagem na fonte original

1. **Lipton em 1971, num trabalho de estudante.** Sustentado apenas por trechos do survey de Jia e Harman (2011). Falta conferir no texto completo do survey.
   - Corpo: linha 35
   - Timeline: linha 79
   - Mapa mental: linha 159
   - Nota de rodapé `[^2]`: linha 285

2. **Hamlet (1977), "Testing Programs with the Aid of a Compiler".** Título, ano, volume, páginas e DOI sem conferência em fonte.
   - Corpo: linha 35
   - Timeline: linha 80
   - Mapa mental: linha 159
   - Referência: linhas 223 e 225
   - Nota de rodapé `[^4]`: linha 289

3. **Hipótese do programador competente e efeito de acoplamento atribuídos a DeMillo, Lipton e Sayward (1978).** Sustentado apenas por fontes secundárias. Falta conferir no artigo original.
   - Corpo: linha 41
   - Timeline: linha 81
   - Mapa mental: linhas 161 e 162

4. **Offutt et al. (1996): conjunto de cinco operadores** (valor absoluto, aritmético, conector lógico, relacional, unário). Sustentado por uma única fonte secundária. Falta conferir no artigo (acesso pela ACM bloqueado).
   - Corpo: linha 43
   - Timeline: linha 82
   - Mapa mental: linha 167

5. **Stryker com versões para JavaScript/TypeScript, C# e Scala.** Falta conferir no site oficial. A nota de rodapé `[^7]` aponta para a página de estados e métricas, que não trata das linguagens. A página inicial aparece só na entrada de Referências.
   - Corpo: linhas 69 e 73
   - Mapa mental: linha 179
   - Referência: linha 249
   - Nota de rodapé `[^7]`: linha 295

### Dados bibliográficos sem conferência

6. **Jia e Harman (2011):** volume 37(5), páginas 649-678 e DOI `10.1109/TSE.2010.62`.
   - Referência: linhas 207 e 209
   - Nota de rodapé `[^2]`: linha 285

7. **Just et al. (2014):** DOI `10.1145/2635868.2635929`. Autores, evento e páginas 654-665 já conferidos.
   - Referência: linha 261
   - Nota de rodapé `[^8]`: linha 297

8. **Petrović e Ivanković (2018):** DOI `10.1145/3183519.3183521`. Autores, evento e números do texto já conferidos no PDF.
   - Referência: linha 277
   - Nota de rodapé `[^10]`: linha 301

### Tags

9. **Tags fora do `tags.yml`:** `mutation_testing`, `test_coverage` e `test_automation`. O build só avisa. Decidir se entram no `tags.yml`.
   - Front matter: linha 5

## Independência de Teste

Arquivo: `docs/notes/independencia_teste_afastamento.mdx`

10. **Link quebrado para `./independence_test_article`.** A página não existe, e o build de produção falha por causa disso.
    - Corpo: linha 28

## Índice das notas

Arquivo: `tests/notes-index.spec.ts`

11. **IDX-01 fora de sincronia.** O teste lista 4 notas em Teorias, e o índice em `docs/notes/README.md` tem 8 (`few_hiccupps_heuristica`, `testes_mutacao`, `efeito_cobra_lei_goodhart` e `flakiness_efeito_nocebo` a mais).
    - Lista `Teorias`: linha 7

## Flakiness e Efeito Nocebo

Arquivo: `docs/notes/flakiness_efeito_nocebo.mdx`

### Fatos sem checagem na fonte original

12. **Google (Micco, 2016): "1,5% das execuções" e "quase 16% dos testes".** Números sustentados por trechos e resumos secundários, sem conferência no post original. Um dos resumos diz "1,5% dos testes" em vez de "das execuções".
    - Corpo: linha 26
    - Timeline: linha 88
    - Mapa mental: linha 158
    - Nota de rodapé `[^2]`: linha 246

13. **Kennedy (1961), "The nocebo reaction".** As fontes divergem no periódico: _Medicina Experimentalis_ ou _Med World_ (95, 203-205). Falta conferir na fonte primária.
    - Corpo: linha 56
    - Timeline: linha 84
    - Mapa mental: linha 160
    - Referência: linha 214
    - Nota de rodapé `[^4]`: linha 250

14. **Detalhes do SAMSON sem conferência:** o estudo feito em Londres pelo Imperial College, os doze frascos divididos em quatro de estatina, quatro de placebo e quatro vazios, a nota diária num aplicativo de celular e o fato de cada participante ter visto as próprias notas no fim. Já conferidos: 60 participantes, razão nocebo de 0,90 e metade de volta à estatina seis meses depois.
    - Corpo: linhas 20 e 144
    - Mapa mental: linha 151

### Dados bibliográficos e links

15. **DOI do SAMSON:** `10.1056/NEJMc2031173` sem conferência. Autores, título, volume 383(22) e páginas 2182-2184 já conferidos.
    - Referência: linha 192
    - Nota de rodapé `[^1]`: linha 244

16. **Glossário ISTQB:** a URL `https://glossary.istqb.org/` não foi verificada. As definições de falso positivo e falso negativo seguem cópias do glossário (v2.1 e imbus.de), não a versão oficial atual.
    - Corpo: linha 28
    - Referência: linha 208
    - Nota de rodapé `[^3]`: linha 248

17. **Alerta da Joint Commission:** o link aponta para o resumo no PSNet (AHRQ), não para o PDF oficial do Sentinel Event Alert 50. Os números (98 eventos, 80 mortes, 2009 a 2012) já conferidos.
    - Corpo: linha 60
    - Referência: linha 222
    - Nota de rodapé `[^5]`: linha 252

### Conteúdo ilustrativo

18. **Personagem e caso inventados:** o Bruno, a loja online, o teste do Pix com espera fixa de 2 segundos e a falha com cupom numa sexta-feira. Servem de exemplo, sem fonte.
    - Corpo: linhas 24, 58, 70, 76 e 78
    - Mapa mental: linha 171

19. **Barra "Confiança do time no vermelho" no SVG:** as larguras de cada fase são ilustrativas. O SVG traz o rótulo ESCALA ILUSTRATIVA.
    - Arquivo: `docs/notes/assets/flakiness-efeito-nocebo-dossier.svg`

20. **Cena da UTI:** as causas dos apitos (cabo solto, paciente que se mexeu, limite apertado demais) e a reação da equipe (abaixar o volume, demorar, desligar) são conhecimento geral sobre fadiga de alarme, sem fonte citada. O alerta da Joint Commission sustenta só os números e a fadiga de alarme como fator principal.
    - Corpo: linha 60

21. **QA com fama de alarme falso:** a frase de que quem escreveu os testes fica com a fama e de que o pedido para investigar soa como exagero é análise do autor, sem fonte.
    - Corpo: linha 68

22. **Comparison e DataTable:** os itens do `Comparison` e a coluna "O que acontece" do `DataTable` são resumo do autor. As definições (ISTQB) e a coluna "Remédio" (Fowler) têm fonte.
    - Comparison: linhas 30 a 54
    - DataTable: linhas 97 a 111

### Forma

23. **Tamanho do texto corrido:** cerca de 1.565 palavras, acima do limite de 1.400.

24. **Diagrama Mermaid:** o nó "Falha determinística" usa a classe `error`, mas no render sai com a mesma cor dos nós `panel`. Decidir se fica assim ou se troca de classe.
    - Mermaid: linha 123

### Tags

25. **Tags fora do `tags.yml`:** `flaky_tests`, `false_positives`, `alarm_fatigue` e `test_automation`. O build só avisa. Decidir se entram no `tags.yml`.
    - Front matter: linha 5

## Cobra Effect e Lei de Goodhart

Arquivo: `docs/notes/efeito_cobra_lei_goodhart.mdx`

### Fatos sem checagem na fonte original

26. **Strathern (1997): "quando uma medida vira meta, deixa de ser uma boa medida".** Frase e atribuição sustentadas pela Wikipedia. O PDF do artigo é escaneado, então a redação exata e a página ainda não foram conferidas.
    - Corpo: linha 32
    - Timeline: linha 39
    - Mapa mental: linha 161
    - Referência: linha 215
    - Nota de rodapé `[^4]`: linha 277

27. **Campbell: "quanto mais um indicador quantitativo é usado para decisões sociais, mais sujeito fica a pressões de corrupção...".** Redação sustentada por fonte secundária (Wikipedia). Falta conferir no artigo de 1979. Há uma versão anterior de 1976 (Occasional Paper Series).
    - Corpo: linha 32
    - Timeline: linha 38
    - Mapa mental: linha 162
    - Referência: linha 223
    - Nota de rodapé `[^5]`: linha 279

28. **Goodhart como "conselheiro do Banco da Inglaterra" em 1975 e a frase como "piada de passagem".** O cargo está sem fonte. A piada vem de fontes secundárias que citam Goodhart. A citação traduzida no `Quote` foi conferida na Wikipedia, não no texto de 1975.
    - Corpo: linha 26
    - Quote: linha 28
    - Mapa mental: linha 160

29. **Hanói (1902): recompensa aberta aos moradores depois dos caçadores contratados, e gente criando ratos nos arredores.** Sustentado pela Wikipedia e por sites de divulgação que citam Vann. Falta conferir no artigo de Vann (2003).
    - Corpo: linha 20
    - Mapa mental: linhas 151 a 154

30. **Siebert, _Der Kobra-Effekt_: ano e editora.** As fontes divergem entre 2001 e 2002. A editora (Deutsche Verlags-Anstalt, Munique) vem de um resumo.
    - Corpo: linha 24
    - Timeline: linha 40
    - Mapa mental: linha 156
    - Referência: linha 199
    - Nota de rodapé `[^2]`: linha 273

31. **Inozemtseva e Holmes (2014): "milhares de suítes" e "correlação entre baixa e moderada".** Números sustentados por resumos, sem conferência no PDF dos autores. Título, DOI e páginas já conferidos.
    - Corpo: linha 52
    - Mapa mental: linha 172

32. **Deming, _Out of the Crisis_: ano da edição.** As fontes divergem entre 1982 (MIT CAES) e 1986. A redação dos pontos 8 e 11 varia entre as edições.
    - Corpo: linha 50
    - Mapa mental: linha 169
    - Referência: linha 231
    - Nota de rodapé `[^6]`: linha 281

33. **DORA: tempo de entrega definido como o intervalo entre o _commit_ e a produção.** Definição sem conferência no livro. As quatro métricas já conferidas.
    - Corpo: linha 82

### Dados bibliográficos e links

34. **Links que apontam para a Wikipedia, não para a fonte:** Siebert e Goodhart. Os textos originais não têm versão aberta conhecida.
    - Referências: linhas 201 e 209
    - Notas de rodapé `[^2]` e `[^3]`: linhas 273 e 275

35. **Vann (2003):** sem DOI nem páginas. O link aponta para a página de publicações do autor.
    - Referência: linha 191
    - Nota de rodapé `[^1]`: linha 271

36. **Basili et al. (1994):** as páginas 528-532 vêm de uma bibliografia secundária. O link é uma cópia em `cs.umd.edu/~mvz`, não a enciclopédia.
    - Referência: linha 255
    - Nota de rodapé `[^9]`: linha 287

37. **Deming:** a URL `https://deming.org/fourteen-points` não foi verificada.
    - Referência: linha 233
    - Nota de rodapé `[^6]`: linha 281

### Conteúdo ilustrativo

38. **Personagem e caso inventados:** a Júlia, o app de entrega, as metas de 80% de cobertura e de zero bugs críticos, o painel com 85% e 82%, os 3% dos pedidos, os cupons aplicados duas vezes, os 1.400 testes sem verificação e os 20 minutos a mais no _pipeline_. Servem de exemplo, sem fonte.
    - Corpo: linhas 22, 46, 48, 72, 74, 80 e 145

39. **Gráfico do SVG:** a altura das linhas em cada trimestre e o rótulo "82% · ZERO CRÍTICOS" são ilustrativos. O SVG traz o rótulo ESCALA ILUSTRATIVA.
    - Arquivo: `docs/notes/assets/efeito-cobra-lei-goodhart-dossier.svg`

40. **Tabela de métricas de QA:** as colunas "Como se bate sem melhorar" e "Pergunta que equilibra" são análise do autor, sem fonte.
    - DataTable: linhas 54 a 70

### Forma

41. **Tamanho do texto corrido:** cerca de 1.550 palavras, acima do limite de 1.400.

42. **Diagrama Mermaid:** o nó "Volte ao objetivo" usa a classe `error`, mas no render sai com a mesma cor dos nós `panel`. Decidir se fica assim ou se troca de classe.
    - Mermaid: linha 122

### Tags

43. **Tags fora do `tags.yml`:** `goodhart_law`, `cobra_effect`, `perverse_incentives` e `test_management`. O build só avisa. Decidir se entram no `tags.yml`.
    - Front matter: linha 5
