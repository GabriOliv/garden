import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {Grid, Stack, StageIcon} from '@gabrioliv/dossier';
import {ptBR} from '@gabrioliv/dossier/locales/pt-BR';
import {STAGES} from '@site/src/lib/stages';

/** Legenda dos estágios de maturidade: ícone, nome, leitura, definição e "Veja Todos". */
export default function StageLegend(): ReactNode {
  return (
    <Grid columns={2} gap={6}>
      {STAGES.map((s) => (
        <Stack key={s.stage} gap={2} data-stage={s.stage}>
          <StageIcon stage={s.stage} size="lg" decorative labels={ptBR.StageIcon} />
          <h3 className="ds-t-heading">{s.name}</h3>
          <p className="ds-t-label">{s.reading}</p>
          <p className="ds-t-body">{s.definition}</p>
          <Link className="ds-link" to={`/docs/tags/${s.tag}`} data-noBrokenLinkCheck>
            Veja Todos
          </Link>
        </Stack>
      ))}
    </Grid>
  );
}
