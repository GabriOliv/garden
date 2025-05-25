import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
	{
		title: 'Notas',
		Svg: require('/img/banner/6d43ec_undraw_taking-notes.svg').default,
		description: (<>Teorias e artigos sobre diversos tópicos de Garantia de Qualidade.</>),
	},
	{
		title: 'Estudos de Certificações',
		Svg: require('/img/banner/6d43ec_undraw_going-up.svg').default,
		description: (<>Resumos e materiais de estudo usados para fazer certificações.</>),
	},
	{
		title: 'Evolução',
		Svg: require('/img/banner/6d43ec_undraw_predictive-analytics.svg').default,
		description: (<>Documentação separada em níveis de evolução e experiência.</>),
	},
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
