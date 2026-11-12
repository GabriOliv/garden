---
sidebar_position: 0
title: Comece a Leitura
description: Página Inicial
custom_edit_url: null
tags: [stageB, projeto, garden, readme]
draft: false
hide_title: true
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';
import {Grid, Stack} from '@gabrioliv/dossier';

import StageLegend from '@site/src/components/StageLegend';

import styles from '@site/src/css/styles.module.css';

<!--<h1 style={{textAlign: 'center'}}> Garden </h1>-->

<div className={styles.mobileOnly}>
	<div className="img-center">
		![Banner Light Mode](/img/banner/3f3fd9_undraw_art-museum.svg#gh-light-mode-only)![Banner Dark Mode](/img/banner/9a47ff_undraw_art-museum.svg#gh-dark-mode-only)
	</div>
</div>
<div className={styles.desktopOnly}>
	<div className="container">
		<div className="row">
			<div className="col col--4">
				![Banner Light Mode](/img/banner/3f3fd9_undraw_done-checking.svg#gh-light-mode-only)![Banner Dark Mode](/img/banner/9a47ff_undraw_done-checking.svg#gh-dark-mode-only)
			</div>
			<div className="col col--4">
				![Banner Light Mode](/img/banner/3f3fd9_undraw_creative-team.svg#gh-light-mode-only)![Banner Dark Mode](/img/banner/9a47ff_undraw_creative-team.svg#gh-dark-mode-only)
			</div>
			<div className="col col--4">
				![Banner Light Mode](/img/banner/3f3fd9_undraw_file-analysis.svg#gh-light-mode-only)![Banner Dark Mode](/img/banner/9a47ff_undraw_file-analysis.svg#gh-dark-mode-only)
			</div>
		</div>
	</div>
</div>

---

## Certificações

Resumos de estudo usados para certificações.

<Grid minColumnWidth={280} gap={6}>
	<Stack gap={3} data-item="CTFL">

		![image](./assets/banner/banner_flask_default.webp)

		<h3 className="ds-t-heading">CTFL - Certified Tester Foundation Level</h3>

		<p className="ds-t-body">Primeira certificação da ISTQB para a carreira de Teste de Software.</p>

		<Link className="ds-link" to="/docs/istqb/ctfl">Leia Mais</Link>
	</Stack>
	<Stack gap={3} data-item="CT-TAS">

		![image](./assets/banner/banner_flask_default.webp)

		<h3 className="ds-t-heading">CT-TAS - Test Automation Strategy</h3>

		<p className="ds-t-body">Certificação de Especialização para perspectiva estratégica sobre a automação de testes.</p>

		<Link className="ds-link" to="/docs/istqb/cttas">Leia Mais</Link>
	</Stack>
</Grid>

---

## Documentações

Documentações variadas sobre Teste de Software, QA e Computação em geral.

<Grid minColumnWidth={280} gap={6}>
	<Stack gap={3} data-item="Notas">

		![image](./assets/banner/banner_flask_qa_default.webp)

		<h3 className="ds-t-heading">Notas</h3>

		<p className="ds-t-body">Notas sobre QA, Teste ou Computação em geral.</p>

		<Link className="ds-link" to="/docs/notes">Leia Mais</Link>
	</Stack>
</Grid>

---

## Organização por Evolução

Documentação organizada por evolução de aprendizado e revisão.

<StageLegend />
