import type { ReactNode } from "react";
import "./styles.css";

/**
 * Figura de nota no desenho do Dossier: a legenda `FIG. NN — TÍTULO` / `GARDEN · REV A`
 * sobre a régua, a imagem e, se houver, a frase em `<figcaption>` passada nos filhos.
 * `n` é a ordem da figura na página, posta no build por `src/remark/figureNumbers`.
 * `full` tira o recuo de 3%, para diagramas sem a margem de 24 px dos SVGs (Mermaid).
 * `meta` troca o texto à direita da legenda (padrão `GARDEN · REV A`); `meta=""` não mostra nada.
 */
export default function Figure({
  n,
  title,
  full,
  meta = "GARDEN · REV A",
  children,
}: {
  n: string;
  title: string;
  full?: boolean;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <figure className={full ? "garden-fig garden-fig-full" : "garden-fig"}>
      <div className="garden-fig-legend ds-t-label">
        <span>
          FIG. {n.padStart(2, "0")} — {title}
        </span>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </figure>
  );
}
