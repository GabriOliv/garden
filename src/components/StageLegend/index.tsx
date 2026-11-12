import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {StageIcon} from '@gabrioliv/dossier';
import {ptBR} from '@gabrioliv/dossier/locales/pt-BR';
import {STAGES} from '@site/src/lib/stages';

/**
 * Legenda dos estágios de maturidade no desenho do `Contents` do Dossier:
 * ícone de 48 px no lugar do número, nome como link para a tag, definição e leitura.
 * O `Contents` só aceita texto no índice, então o HTML dele é montado aqui,
 * com as mesmas classes (`ds-contents`, `ds-toc-*`).
 */
export default function StageLegend(): ReactNode {
  return (
    <ol className="ds-contents">
      {STAGES.map((s) => (
        <li key={s.stage} className="ds-toc-item" data-stage={s.stage}>
          <span className="ds-toc-index">
            <StageIcon stage={s.stage} size="lg" decorative labels={ptBR.StageIcon} />
          </span>
          <Link
            className="ds-link ds-t-title ds-toc-title"
            to={`/docs/tags/${s.tag}`}
            data-noBrokenLinkCheck>
            {s.name}
          </Link>
          <span className="ds-t-body ds-toc-desc">{s.definition}</span>
          <span className="ds-t-label ds-toc-page">{s.reading}</span>
        </li>
      ))}
    </ol>
  );
}
