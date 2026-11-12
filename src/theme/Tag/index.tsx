import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import OriginalTag from "@theme-original/Tag";
import type { Props } from "@theme/Tag";
import { StageIcon } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";
import { stageOfLabel } from "@site/src/lib/stages";
// Classes do chip original, para o chip de estágio ter a mesma forma.
import styles from "@docusaurus/theme-classic/lib/theme/Tag/styles.module.css";
import local from "./styles.module.css";

/** Tag de estágio: só o StageIcon de 16 px, cujo nome é o `label`. Outras tags: o original. */
export default function Tag(props: Props): ReactNode {
  const stage = stageOfLabel(props.label);
  if (!stage) return <OriginalTag {...props} />;
  const { permalink, description, count } = props;
  return (
    <Link
      rel="tag"
      href={permalink}
      title={description}
      className={clsx(
        styles.tag,
        count ? styles.tagWithCount : styles.tagRegular,
        local.stage,
      )}>
      <StageIcon stage={stage} size="sm" labels={ptBR.StageIcon} />
      {count && <span>{count}</span>}
    </Link>
  );
}
