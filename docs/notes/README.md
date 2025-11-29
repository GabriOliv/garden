---
title: Notas
sidebar_position: 0
description: Notas sobre QA, Teste e Computação em geral.
tags: [stageB, notes, readme]
draft: false
---

import styles from '@site/src/css/styles.module.css';
import notes from './data.ts';

{frontMatter.description}<br />

---

## Teorias

<div className={styles.desktopOnly}>
	<div class="pagination-nav">
		<div class="pagination-nav__item">
			<a class="pagination-nav__link" href="./notes/peltzman_effect">
			<div class="pagination-nav__label">{notes.peltzman_effect.title}</div>
			<div class="pagination-nav__sublabel">{notes.peltzman_effect.description}</div>
			</a>
		</div>
		<div class="pagination-nav__item">
			<a class="pagination-nav__link" href="./notes/hawthorne_effect_on_documentation">
			<div class="pagination-nav__label">{notes.hawthorne_effect_on_documentation.title}</div>
			<div class="pagination-nav__sublabel">{notes.hawthorne_effect_on_documentation.description}</div>
			</a>
		</div>
		<div class="pagination-nav__item">
			<a class="pagination-nav__link" href="./notes/e2e_useful">
			<div class="pagination-nav__label">{notes.e2e_useful.title}</div>
			<div class="pagination-nav__sublabel">{notes.e2e_useful.description}</div>
			</a>
		</div>
	</div>
</div>

<div className={styles.mobileOnly}>
	<div class="pagination-nav__item">
		<a class="pagination-nav__link" href="./notes/peltzman_effect">
		<div class="pagination-nav__label">{notes.peltzman_effect.title}</div>
		<div class="pagination-nav__sublabel">{notes.peltzman_effect.description}</div>
		</a>
	</div>
	<br />
	<div class="pagination-nav__item">
		<a class="pagination-nav__link" href="./notes/hawthorne_effect_on_documentation">
		<div class="pagination-nav__label">{notes.hawthorne_effect_on_documentation.title}</div>
		<div class="pagination-nav__sublabel">{notes.hawthorne_effect_on_documentation.description}</div>
		</a>
	</div>
	<br />
	<div class="pagination-nav__item">
		<a class="pagination-nav__link" href="./notes/e2e_useful">
		<div class="pagination-nav__label">{notes.e2e_useful.title}</div>
		<div class="pagination-nav__sublabel">{notes.e2e_useful.description}</div>
		</a>
	</div>
</div>

## Processos

<div className={styles.desktopOnly}>
	<div class="pagination-nav">
		<div class="pagination-nav__item">
			<a class="pagination-nav__link" href="./notes/test_coverage_sdlc">
			<div class="pagination-nav__label">{notes.test_coverage_sdlc.title}</div>
			<div class="pagination-nav__sublabel">{notes.test_coverage_sdlc.description}</div>
			</a>
		</div>
	</div>
</div>

<div className={styles.mobileOnly}>
	<div class="pagination-nav__item">
		<a class="pagination-nav__link" href="./notes/test_coverage_sdlc">
		<div class="pagination-nav__label">{notes.test_coverage_sdlc.title}</div>
		<div class="pagination-nav__sublabel">{notes.test_coverage_sdlc.description}</div>
		</a>
	</div>
	<br />
</div>

---