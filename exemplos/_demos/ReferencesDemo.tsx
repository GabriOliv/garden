import type { ReactNode } from "react";
import { FieldList, Footnotes, Link } from "@gabrioliv/dossier";
import styles from "./references.module.css";

/** Referências reais de docs/notes/e2e_useful.mdx. */
type Ref = {
  key: string;
  kind: "Artigo" | "Livro";
  cite: ReactNode;
  url?: string;
  accessed?: string;
  note: string;
};

const REFS: Ref[] = [
  {
    key: "VOCKE, 2018",
    kind: "Artigo",
    cite: (
      <>
        VOCKE, Ham. Practical Test Pyramid. <em>martinfowler.com</em>, 26 fev. 2018.
      </>
    ),
    url: "https://martinfowler.com/articles/practical-test-pyramid.html#End-to-endTests",
    accessed: "18 abr. 2025",
    note: "Descreve a separação entre testes E2E e testes de componentes de interface, e como alguns pensadores da área os consideram uma única abordagem.",
  },
  {
    key: "CYPRESS",
    kind: "Artigo",
    cite: (
      <>
        Cypress. Why Cypress? <em>Cypress Documentation</em>.
      </>
    ),
    url: "https://docs.cypress.io/app/get-started/why-cypress#Component-Testing",
    accessed: "18 abr. 2025",
    note: "Cypress é uma ferramenta de testes E2E que possui uma seção dedicada a implementar testes de componentes de interface.",
  },
  {
    key: "AXELROD, 2018",
    kind: "Livro",
    cite: (
      <>
        AXELROD, Arnon. <em>Complete Guide to Test Automation</em>. Apress, 2018.
      </>
    ),
    url: "https://doi.org/10.1007/978-1-4842-3832-5",
    note: "Aborda o processo e escopos de testes que funcionam melhor ou não com testes E2E.",
  },
  {
    key: "CRISPIN; GREGORY, 2009",
    kind: "Livro",
    cite: (
      <>
        CRISPIN, Lisa; GREGORY, Janet. <em>Agile Testing</em>. Addison-Wesley, 2009.
      </>
    ),
    note: "Testes E2E foram importantes para validações automatizadas, mas não seriam necessários com cobertura de testes dos componentes do sistema.",
  },
];

/** "https://martinfowler.com/articles/practical-test-pyramid.html#x" → "martinfowler.com/articles/practical-test-pyr…". */
const shortUrl = (url: string, max = 44) => {
  const u = new URL(url);
  const text = (u.host.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/** Citação, link curto com a data de acesso e o comentário, num bloco. */
function Entry({ r, withNote = true }: { r: Ref; withNote?: boolean }): ReactNode {
  return (
    <span className={styles.entry}>
      <span className={styles.cite}>{r.cite}</span>
      {r.url && (
        <span className={styles.meta}>
          <Link href={r.url}>{shortUrl(r.url)}</Link>
          {r.accessed && <span> · acesso em {r.accessed}</span>}
        </span>
      )}
      {withNote && <span className={styles.note}>{r.note}</span>}
    </span>
  );
}

const byKind = (kind: Ref["kind"]) => REFS.filter((r) => r.kind === kind);

/** 1. FieldList definition: chave curta como termo; grupos como rótulo. */
export function RefsDefinition(): ReactNode {
  return (
    <div className={styles.stackMobile}>
      {(["Artigo", "Livro"] as const).map((kind) => (
        <section key={kind} className={styles.group}>
          <p className={`ds-t-label ${styles.groupLabel}`}>{kind === "Artigo" ? "Artigos" : "Livros"}</p>
          <FieldList variant="definition" fields={byKind(kind).map((r) => ({ label: r.key, value: <Entry r={r} /> }))} />
        </section>
      ))}
    </div>
  );
}

/** 2. FieldList record: o tipo no rótulo, uma lista só. */
export function RefsRecord(): ReactNode {
  return (
    <div className={styles.stackMobile}>
      <FieldList fields={REFS.map((r) => ({ label: r.kind, value: <Entry r={r} /> }))} />
    </div>
  );
}

/** 3. Footnotes: numeradas na ordem em que aparecem no texto. */
export function RefsFootnotes(): ReactNode {
  return (
    <>
      <p className={styles.sample}>
        O E2E simula o uso real, mas não substitui os testes de unidade e de integração
        <sup className="ds-ref">01</sup>; algumas ferramentas misturam as duas abordagens
        <sup className="ds-ref">02</sup>. Sem cobertura dos componentes, a suíte E2E vira a única rede de segurança
        <sup className="ds-ref">04</sup>.
      </p>
      <Footnotes notes={REFS.map((r) => ({ text: <Entry r={r} /> }))} />
    </>
  );
}

/** 4. Markdown de hoje com CSS do Dossier: recuo pendente, sem marcadores, comentário em ink-muted. */
export function RefsHanging({ children }: { children: ReactNode }): ReactNode {
  return <div className={styles.hanging}>{children}</div>;
}

/** 5. Nota de figura no desenho do Footnotes (hoje: notas de rodapé do Markdown sob "Footnotes"). */
export function FigureNotes(): ReactNode {
  return (
    <Footnotes
      notes={[
        {
          text: (
            <span className={styles.entry}>
              <span className={styles.cite}>Iteração de desenvolvimento sem cobertura de testes.</span>
              <span className={styles.note}>
                Fonte: diagramação própria. Legenda: cinza, código estável; laranja, código instável; vermelho, código
                novo que não foi testado.
              </span>
            </span>
          ),
        },
        {
          text: (
            <span className={styles.entry}>
              <span className={styles.cite}>Iteração de desenvolvimento com cobertura de testes.</span>
              <span className={styles.note}>
                Fonte: diagramação própria. Legenda: cinza, estável; laranja, instável; vermelho, novo sem teste; azul,
                estável coberto por testes; verde, coberto com testes que falharam e avisaram o desenvolvedor.
              </span>
            </span>
          ),
        },
      ]}
    />
  );
}
