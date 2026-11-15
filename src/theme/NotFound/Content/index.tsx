import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { ErrorNotice, Stack } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";
import type { Props } from "@theme/NotFound/Content";

/** Página 404: aviso de erro do Dossier, com a frase e o caminho de volta pelas três seções. */
export default function NotFoundContent({ className }: Props): ReactNode {
  return (
    <main className={clsx("container margin-vert--xl", className)}>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <ErrorNotice level={1} code="404" title="Página não encontrada" labels={ptBR.ErrorNotice}>
            <p>Este endereço não existe no Garden.</p>
            <nav aria-label="Seções do Garden">
              <Stack direction="row" gap={4} wrap>
                <Link className="ds-link" to="/docs/project">Sobre</Link>
                <Link className="ds-link" to="/docs/notes">Notas</Link>
                <Link className="ds-link" to="/docs/istqb">ISTQB</Link>
              </Stack>
            </nav>
          </ErrorNotice>
        </div>
      </div>
    </main>
  );
}
