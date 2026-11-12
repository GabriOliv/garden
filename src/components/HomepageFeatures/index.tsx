import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {Grid, Stack} from '@gabrioliv/dossier';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
	{
		title: 'Notas',
		image: '/img/dossier/banner-grafo-dossier.svg',
		description: (<>Teorias e artigos sobre diversos tópicos de Garantia de Qualidade.</>),
	},
	{
		title: 'Estudos de Certificações',
		image: '/img/dossier/banner-automato-dossier.svg',
		description: (<>Resumos e materiais de estudo usados para fazer certificações.</>),
	},
	{
		title: 'Evolução',
		image: '/img/dossier/banner-filotaxia-dossier.svg',
		description: (<>Documentação separada em níveis de evolução e experiência.</>),
	},
];

function Feature({title, image, description}: FeatureItem) {
  const src = useBaseUrl(image);
  return (
    <Stack align="center" gap={3} className={styles.feature}>
      <img className={styles.featureSvg} src={src} alt="" />
      <h2 className="ds-t-heading">{title}</h2>
      <p className="ds-t-body">{description}</p>
    </Stack>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <Grid columns={3} gap={6}>
        {FeatureList.map((props) => (
          <Feature key={props.title} {...props} />
        ))}
      </Grid>
    </section>
  );
}
