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
		image: '/img/banner/6d43ec_undraw_taking-notes.svg',
		description: (<>Teorias e artigos sobre diversos tópicos de Garantia de Qualidade.</>),
	},
	{
		title: 'Estudos de Certificações',
		image: '/img/banner/6d43ec_undraw_going-up.svg',
		description: (<>Resumos e materiais de estudo usados para fazer certificações.</>),
	},
	{
		title: 'Evolução',
		image: '/img/banner/6d43ec_undraw_predictive-analytics.svg',
		description: (<>Documentação separada em níveis de evolução e experiência.</>),
	},
];

function Feature({title, image, description}: FeatureItem) {
  const src = useBaseUrl(image);
  return (
    <Stack align="center" gap={3} className={styles.feature}>
      <img className={styles.featureSvg} src={src} alt="" />
      <h3 className="ds-t-heading">{title}</h3>
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
