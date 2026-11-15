import type { ReactNode } from "react";
import MDXComponents from "@theme-original/MDXComponents";
import DocTitle from "@site/src/components/DocTitle";
import { shortUrl, useInReferencias } from "@site/src/components/Referencias";

/** Junta os filhos de texto de um título. */
const toText = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(toText).join("")
      : "";

/** Link do MDX: dentro de `<Referencias>`, um link cujo texto é a própria URL mostra a URL curta (REF-06). */
function A(props: { href?: string; children?: ReactNode }): ReactNode {
  const inReferencias = useInReferencias();
  const Original = MDXComponents.a;
  const bare = inReferencias && props.href && toText(props.children) === props.href;
  return <Original {...props}>{bare ? shortUrl(props.href!) : props.children}</Original>;
}

export default {
  ...MDXComponents,
  a: A,
  h1: ({ children }: { children?: ReactNode }) => <DocTitle title={toText(children)} />,
};
