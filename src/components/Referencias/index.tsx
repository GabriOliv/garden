import { Children, createContext, isValidElement, useContext, type ReactNode } from "react";
import { FieldList } from "@gabrioliv/dossier";
import styles from "./styles.module.css";

/** Verdadeiro dentro de `<Referencias>`: o link do MDX encurta a URL só ali. */
const InReferencias = createContext(false);
export const useInReferencias = (): boolean => useContext(InReferencias);

type ReferenciaProps = {
  /** Rótulo da linha: "Artigo", "Livro", "Contexto psicológico" ou "Referência". */
  tipo: string;
  /** Subtema, mostrado como comentário acima da citação. */
  tema?: string;
  /** Citação (primeiro parágrafo) e comentários, em Markdown. */
  children?: ReactNode;
};

/** Uma referência. Só tem efeito dentro de `<Referencias>`, que a desenha como linha do FieldList. */
export function Referencia(_: ReferenciaProps): ReactNode {
  return null;
}

/** Referências do fim de um documento, como FieldList record (spec referencias-dossier). */
export function Referencias({ children }: { children?: ReactNode }): ReactNode {
  const fields = Children.toArray(children)
    .filter((child) => isValidElement<ReferenciaProps>(child) && child.type === Referencia)
    .map((child) => {
      const { tipo, tema, children: body } = (child as React.ReactElement<ReferenciaProps>).props;
      return {
        label: tipo,
        value: (
          <div className={styles.value}>
            {tema && <p className={styles.tema}>{tema}</p>}
            {body}
          </div>
        ),
      };
    });
  return (
    <InReferencias.Provider value>
      <div className={styles.referencias}>
        <FieldList fields={fields} />
      </div>
    </InReferencias.Provider>
  );
}

/** "https://martinfowler.com/articles/x.html#y" → "martinfowler.com/articles/x.html", cortado em `max` com "…". */
export const shortUrl = (url: string, max = 44): string => {
  let text: string;
  try {
    const u = new URL(url);
    text = (u.host + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};
