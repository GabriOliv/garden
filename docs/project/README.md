---
sidebar_position: 0
title: Comece a Leitura
description: Página Inicial
custom_edit_url: null
tags: [stageB, projeto, garden, readme]
draft: false
hide_title: true
---

import Columns from '@site/src/components/Columns';
import Column from '@site/src/components/Column';

import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardFooter from '@site/src/components/Card/CardFooter';
import CardHeader from '@site/src/components/Card/CardHeader';
import CardImage from '@site/src/components/Card/CardImage';

import ThemedImage from '@theme/ThemedImage';

import styles from '@site/src/css/styles.module.css';

<!--<h1 style={{textAlign: 'center'}}> Garden </h1>-->

<div className={styles.mobileOnly}>
	<div class="img-center">
		![Banner Light Mode](./assets/3f3fd9_undraw_art-museum.svg#gh-light-mode-only)![Banner Dark Mode](./assets/9a47ff_undraw_art-museum.svg#gh-dark-mode-only)
	</div>
</div>
<div className={styles.desktopOnly}>
	<div class="container">
		<div class="row">
			<div class="col col--4">
				![Banner Light Mode](./assets/3f3fd9_undraw_done-checking.svg#gh-light-mode-only)![Banner Dark Mode](./assets/9a47ff_undraw_done-checking.svg#gh-dark-mode-only)
			</div>
			<div class="col col--4">
				![Banner Light Mode](./assets/3f3fd9_undraw_creative-team.svg#gh-light-mode-only)![Banner Dark Mode](./assets/9a47ff_undraw_creative-team.svg#gh-dark-mode-only)
			</div>
			<div class="col col--4">
				![Banner Light Mode](./assets/3f3fd9_undraw_file-analysis.svg#gh-light-mode-only)![Banner Dark Mode](./assets/9a47ff_undraw_file-analysis.svg#gh-dark-mode-only)
			</div>
		</div>
	</div>
</div>

---

## Certificações

<Columns>
	<Column className='padding--md'>
		<Card shadow='md'>
			<div className={styles.desktopOnly}>
				<CardImage cardImageUrl=''/>
			</div>
			<CardHeader textAlign='center'>
				<p><b>CTFL - Certified Tester Foundation Level</b></p>
			</CardHeader>
			<CardBody weight='light'>
				Primeira certificação da ISTQB para a carreira de Teste de Software.
			</CardBody>
			<CardFooter>
				<a href='/garden/docs/istqb/ctfl'>
					<button className='button button--secondary button--block'>Leia Mais</button>
				</a>
			</CardFooter>
		</Card>
	</Column>
	<Column className='padding--md'>
		<Card shadow='md'>
			<div className={styles.desktopOnly}>
				<CardImage cardImageUrl=''/>
			</div>
			<CardHeader textAlign='center'>
				<p><b>CT-TAS - Test Automation Strategy</b></p>
			</CardHeader>
			<CardBody weight='light'>
				Certificação de Especialização para perspectiva estratégica sobre a automação de testes.
			</CardBody>
			<CardFooter>
				<a href='/garden/docs/istqb/cttas'>
					<button className='button button--secondary button--block'>Leia Mais</button>
				</a>
			</CardFooter>
		</Card>
	</Column>
</Columns>

---