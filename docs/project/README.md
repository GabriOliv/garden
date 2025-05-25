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

Resumos de estudo usados para certificações.

<Columns>
	<Column className='padding--md'>
		<div class="card-demo">
			<div class="card shadow--md">
				<div class="card__image">
					![image](./assets/banner/banner_flask_default.webp)
				</div>
				<div class="card__body">
					<h4>CTFL - Certified Tester Foundation Level</h4>
					<small>
						Primeira certificação da ISTQB para a carreira de Teste de Software.
					</small>
				</div>
				<div class="card__footer">
					<a href='/garden/docs/istqb/ctfl'>
						<button className='button button--secondary button--block'>Leia Mais</button>
					</a>
				</div>
			</div>
		</div>
	</Column>
	<Column className='padding--md'>
		<div class="card-demo">
			<div class="card shadow--md">
				<div class="card__image">
					![image](./assets/banner/banner_flask_default.webp)
				</div>
				<div class="card__body">
					<h4>CT-TAS - Test Automation Strategy</h4>
					<small>
						Certificação de Especialização para perspectiva estratégica sobre a automação de testes.
					</small>
				</div>
				<div class="card__footer">
					<a href='/garden/docs/istqb/cttas'>
						<button className='button button--secondary button--block'>Leia Mais</button>
					</a>
				</div>
			</div>
		</div>
	</Column>
	<Column className='padding--md'>
	</Column>
</Columns>

---

## Documentações

Documentações variadas sobre Teste de Software, QA e Computação em geral.

<Columns>
	<Column className='padding--md'>
		<div class="card-demo">
			<div class="card shadow--md">
				<div class="card__image">
					![image](./assets/banner/banner_flask_qa_default.webp)
				</div>
				<div class="card__body">
					<h4>Notes</h4>
					<small>
						Notas sobre QA, Teste ou Computação em geral.
					</small>
				</div>
				<div class="card__footer">
					<a href='/garden/docs/notes'>
						<button className='button button--secondary button--block'>Leia Mais</button>
					</a>
				</div>
			</div>
		</div>
	</Column>
	<Column className='padding--md'>
	</Column>
	<Column className='padding--md'>
	</Column>
</Columns>

---

## Organização por Evolução

Documentação organizada por evolução de aprendizado e revisão.

<Columns>
	<Column className='padding--md'>
		<div class="card item shadow--md margin--md">
			<div class="card__header">
				<h3><code>🌱</code> Iniciais</h3>
			</div>
			<div class="card__body">
				<p>Artigos em construção que começam a explorar um tema.</p>
			</div>
			<div class="card__footer">
				<a href='/garden/docs/tags/stageA'>
					<button class="button button--secondary button--block">Veja Todos</button>
				</a>
			</div>
		</div>
	</Column>
	<Column className='padding--md'>
		<div class="card item shadow--md margin--md">
			<div class="card__header">
				<h3><code>🌿</code> Melhorados</h3>
			</div>
			<div class="card__body">
				<p>Artigos que foram revisados e melhorados.</p>
			</div>
			<div class="card__footer">
				<a href='/garden/docs/tags/stageB'>
					<button class="button button--secondary button--block">Veja Todos</button>
				</a>
			</div>
		</div>
	</Column>
</Columns>
<Columns>
	<Column className='padding--md'>
		<div class="card item shadow--md margin--md">
			<div class="card__header">
				<h3><code>🌲</code> Intermediários</h3>
			</div>
			<div class="card__body">
				<p>Artigos que estão em um nível intermediário de revisão.</p>
			</div>
			<div class="card__footer">
				<a href='/garden/docs/tags/stageC'>
					<button class="button button--secondary button--block">Veja Todos</button>
				</a>
			</div>
		</div>
	</Column>
	<Column className='padding--md'>
		<!--
		<div class="card item shadow--md margin--md">
			<div class="card__header">
				<h3><code>🍎</code> Completos</h3>
			</div>
			<div class="card__body">
				<p>Artigos que estão maduros e completos.</p>
			</div>
			<div class="card__footer">
				<a href='/garden/docs/tags/stageD'>
					<button class="button button--secondary button--block">Veja Todos</button>
				</a>
			</div>
		</div>
		-->
	</Column>
</Columns>

---