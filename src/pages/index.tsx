import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import {Icon, Stack} from '@gabrioliv/dossier';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

import type {ReactNode} from 'react';

function HomepageHeader() {
	const {siteConfig} = useDocusaurusContext();
	const flask = {
		light: useBaseUrl('/img/dossier/flask-garden-001-dossier-paper.svg'),
		dark: useBaseUrl('/img/dossier/flask-garden-001-dossier-void.svg'),
	};
	return (
		<header className={styles.header}>
			<Stack align="center" gap={4} className={styles.hero}>
				<h1 className="ds-t-display">QA {siteConfig.title}</h1>
				<p className="ds-t-body">{siteConfig.tagline}</p>
				<ThemedImage
					className={styles.flask}
					sources={flask}
					alt="Site Logo"
					onDragStart={(e) => e.preventDefault()}
				/>
				<Link className="ds-t-label ds-btn ds-btn-solid" to="/docs/project">
					Comece a Leitura
					<Icon name="arrow-right" className="link-arrow" />
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
