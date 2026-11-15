---
sidebar_position: 0
title: Comece a Leitura
description: Página Inicial
custom_edit_url: null
tags: [stageB, projeto, garden, readme]
draft: false
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';
import {Grid, Icon, Stack} from '@gabrioliv/dossier';

import StageLegend from '@site/src/components/StageLegend';

import styles from '@site/src/css/styles.module.css';

<!--<h1 style={{textAlign: 'center'}}> Garden </h1>-->

<div className={styles.mobileOnly}>
	<div className="img-center">
		![Banner](/img/dossier/banner-acervo-dossier.svg)
	</div>
</div>
<div className={styles.desktopOnly}>
	<div className="container">
		<div className="row">
			<div className="col col--4">
				![Banner](/img/dossier/banner-filotaxia-dossier.svg)
			</div>
			<div className="col col--4">
				![Banner](/img/dossier/banner-grafo-dossier.svg)
			</div>
			<div className="col col--4">
				![Banner](/img/dossier/banner-harmonografo-dossier.svg)
			</div>
		</div>
	</div>
</div>

---

## Certificações

Resumos de estudo usados para certificações.

<Grid minColumnWidth={280} gap={6}>
	<Stack gap={3} data-item="CTFL" className={styles.linkCard}>

    	![image](./assets/banner/banner-flask-dossier.svg)

    	<h3 className="ds-t-heading"><Link to="/docs/istqb/ctfl">CTFL - Certified Tester Foundation Level</Link></h3>

    	<p className="ds-t-body">Primeira certificação da ISTQB para a carreira de Teste de Software.</p>

    	<span className={styles.linkCardFoot}><Icon name="arrow-right" size={24} className="link-arrow" /></span>
    </Stack>
    <Stack gap={3} data-item="CT-TAS" className={styles.linkCard}>

    	![image](./assets/banner/banner-flask-dossier.svg)

    	<h3 className="ds-t-heading"><Link to="/docs/istqb/cttas">CT-TAS - Test Automation Strategy</Link></h3>

    	<p className="ds-t-body">Certificação de Especialização para perspectiva estratégica sobre a automação de testes.</p>

    	<span className={styles.linkCardFoot}><Icon name="arrow-right" size={24} className="link-arrow" /></span>
    </Stack>

</Grid>

---

## Documentações

Documentações variadas sobre Teste de Software, QA e Computação em geral.

<Grid columns={2} gap={6}>
	<Stack gap={3} data-item="Notas" className={styles.linkCard}>

    	![image](./assets/banner/banner-flask-qa-dossier.svg)

    	<h3 className="ds-t-heading"><Link to="/docs/notes">Notas</Link></h3>

    	<p className="ds-t-body">Notas sobre QA, Teste ou Computação em geral.</p>

    	<span className={styles.linkCardFoot}><Icon name="arrow-right" size={24} className="link-arrow" /></span>
    </Stack>

</Grid>

---

## Organização por Evolução

Documentação organizada por evolução de aprendizado e revisão.

<StageLegend />
