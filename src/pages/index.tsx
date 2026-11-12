import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {Stack} from '@gabrioliv/dossier';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

import type {ReactNode} from 'react';

function HomepageHeader() {
	const {siteConfig} = useDocusaurusContext();
	const flask = useBaseUrl('/animation/flask-garden-001.gif');
	return (
		<header className={styles.header}>
			<Stack align="center" gap={4} className={styles.hero}>
				<h1 className="ds-t-display">QA {siteConfig.title}</h1>
				<p className="ds-t-body">{siteConfig.tagline}</p>
				<img
					className={styles.flask}
					src={flask}
					alt="Site Logo"
					onDragStart={(e) => e.preventDefault()}
				/>
				<Link className="ds-link ds-t-heading" to="/docs/project">
					Comece a Leitura
				</Link>
			</Stack>
		</header>
	);
}

export default function Home(): ReactNode {
	const {siteConfig} = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description={`${siteConfig.tagline}`}>
			<main>
				<HomepageHeader />
				<HomepageFeatures />
			</main>
		</Layout>
	);
}
