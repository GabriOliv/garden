import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Contents, DataTable, StageIcon, Stack, Timeline } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";
import { STAGES } from "@site/src/lib/stages";
import s from "./stages.module.css";

/** 1. DataTable: ícone de 16 px (o mesmo dos chips) e nome como link; leitura e definição. */
export function StagesTable(): ReactNode {
  return (
    <DataTable
      columns={[
        { key: "stage", label: "Estágio" },
        { key: "reading", label: "Leitura" },
        { key: "definition", label: "Definição" },
      ]}
      rows={STAGES.map((st) => ({
        stage: (
          <Link className={s.stageLink} to={`/docs/tags/${st.tag}`} data-noBrokenLinkCheck>
            <StageIcon stage={st.stage} decorative labels={ptBR.StageIcon} />
            {st.name}
          </Link>
        ),
        reading: st.reading,
        definition: st.definition,
      }))}
    />
  );
}

/** 2. Timeline: A a D num eixo que termina numa seta; o fruto (D) é o marcador em signal. */
export function StagesTimeline(): ReactNode {
  return (
    <Timeline
      events={STAGES.map((st) => ({
        at: `Estágio ${st.stage}`,
        label: st.name,
        note: st.reading,
        active: st.stage === "D",
      }))}
    />
  );
}

/** 3. Contents: a letra no lugar do número, o nome como link, a definição ao lado. */
export function StagesContents(): ReactNode {
  const base = useBaseUrl("/docs/tags/");
  return (
    <Contents
      labels={ptBR.Contents}
      items={STAGES.map((st) => ({
        index: st.stage,
        title: st.name,
        description: st.definition,
        href: `${base}${st.tag}`,
      }))}
    />
  );
}

/** 4. Timeline para a progressão, DataTable para navegar. */
export function StagesCombo(): ReactNode {
  return (
    <Stack gap={6}>
      <StagesTimeline />
      <StagesTable />
    </Stack>
  );
}
