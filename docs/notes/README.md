---
title: Notas
sidebar_position: 0
description: Notas sobre QA, Teste e Computação em geral.
tags: [stageB, notes, readme]
draft: false
---

import { Contents } from '@gabrioliv/dossier';
import { ptBR } from '@gabrioliv/dossier/locales/pt-BR';
import notes from './data.ts';

{frontMatter.description}<br />

---

## Teorias

<Contents
	labels={ptBR.Contents}
	items={["peltzman_effect", "hawthorne_effect_on_documentation", "software_ongoing_manual_testing", "e2e_useful"].map((id) => ({
		title: notes[id].title,
		description: notes[id].description,
		href: `./notes/${id}`,
	}))}
/>

## Processos

<Contents
	labels={ptBR.Contents}
	items={["test_coverage_sdlc"].map((id) => ({
		title: notes[id].title,
		description: notes[id].description,
		href: `./notes/${id}`,
	}))}
/>

---
