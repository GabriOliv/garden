import type { Stage } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";

export type StageInfo = {
  stage: Stage;
  /** Chave da tag em `docs/tags.yml`. */
  tag: `stage${Stage}`;
  /** `label` da tag e nome acessível do ícone. */
  label: string;
  name: string;
  reading: string;
  definition: string;
};

/** Os quatro estágios de maturidade, de A a D. */
export const STAGES: readonly StageInfo[] = [
  {
    stage: "A",
    tag: "stageA",
    label: ptBR.StageIcon.A,
    name: "Semente",
    reading: "Iniciais",
    definition: "Artigos em construção que começam a explorar um tema.",
  },
  {
    stage: "B",
    tag: "stageB",
    label: ptBR.StageIcon.B,
    name: "Broto",
    reading: "Melhorados",
    definition: "Artigos que foram revisados e melhorados.",
  },
  {
    stage: "C",
    tag: "stageC",
    label: ptBR.StageIcon.C,
    name: "Árvore",
    reading: "Intermediários",
    definition: "Artigos que estão em um nível intermediário de revisão.",
  },
  {
    stage: "D",
    tag: "stageD",
    label: ptBR.StageIcon.D,
    name: "Fruto",
    reading: "Completos",
    definition: "Artigos que estão maduros e completos.",
  },
];

/** Estágio cujo `label` é exatamente `label`; `undefined` para qualquer outro texto. */
export function stageOfLabel(label: string): Stage | undefined {
  return STAGES.find((s) => s.label === label)?.stage;
}
