import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import stylestheme from '@site/src/css/styles.module.css';

import React from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
	const {siteConfig} = useDocusaurusContext();
	return (
		<header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
			<div className="container" style={{ maxWidth: '800px' }}>
				<h1>QA {siteConfig.title}</h1>
				<p>{siteConfig.tagline}</p>
				<div style={{ pointerEvents: 'none', userSelect: 'none' }}>
					<img
						src={useBaseUrl('/animation/flask-garden-001.gif')}
						alt="Site Logo"
						style={{
							width: '500px',
							height: 'auto',
							margin: '1rem 0',
							userSelect: 'none'
						}}
						onDragStart={(e) => e.preventDefault()}
					/>
				</div>
				<div className={stylestheme.desktopOnly} style={{ marginTop: '1.5rem' }}>
					<div className={styles.buttons} style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
						<Link
							className="button button--lg"
							to="/docs/project"
							style={{ backgroundColor: 'var(--ifm-color-primary)' }}>
							Comece a Leitura
						</Link>
					</div>
				</div>
				<div className={stylestheme.mobileOnly} style={{ marginTop: '1.5rem' }}>
					<div className={styles.buttons} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
						<Link
							className="button button--lg"
							to="/docs/project"
							style={{ backgroundColor: 'var(--ifm-color-primary)' }}>
							Comece a Leitura
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}

export default function Home(): JSX.Element {

	// return <Redirect to="docs/project/"/>;

	const {siteConfig} = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description={`${siteConfig.tagline}`}>
			<HomepageHeader />
			<main>
				<HomepageFeatures />
			</main>
		</Layout>
	);
}
