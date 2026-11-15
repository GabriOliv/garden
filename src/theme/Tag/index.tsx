import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import OriginalTag from "@theme-original/Tag";
import type { Props } from "@theme/Tag";
import { StageIcon } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";
import { STAGES, stageOfLabel } from "@site/src/lib/stages";
// Classes do chip original, para o chip de estágio ter a mesma forma.
import styles from "@docusaurus/theme-classic/lib/theme/Tag/styles.module.css";
import local from "./styles.module.css";

/** Tag de estágio: StageIcon de 16 px decorativo e o nome; o link se chama `label` (e a contagem). Outras tags: o original. */
export default function Tag(props: Props): ReactNode {
  const stage = stageOfLabel(props.label);
  if (!stage) return <OriginalTag {...props} />;
  const { permalink, description, count, label } = props;
  const { name } = STAGES.find((s) => s.stage === stage)!;
  return (
    <Link
      rel="tag"
      href={permalink}
      title={description}
      aria-label={count ? `${label} ${count}` : label}
      className={clsx(
        styles.tag,
        count ? styles.tagWithCount : styles.tagRegular,
        local.stage,
      )}>
      <StageIcon stage={stage} size="sm" decorative labels={ptBR.StageIcon} />
      <span>{name}</span>
      {count && <span>{count}</span>}
    </Link>
  );
}
