import type { ReactNode } from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import MDXContent from "@theme/MDXContent";
import type { Props } from "@theme/DocItem/Content";
import DocTitle from "@site/src/components/DocTitle";

/**
 * O título pode vir do conteúdo ou do front matter. Para os dois casos ficarem
 * iguais, o título do front matter entra na mesma `div.markdown`.
 * Sintético quando o front matter não o esconde e o MDX não tem `h1`.
 */
function useSyntheticTitle(): string | null {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender = !frontMatter.hide_title && typeof contentTitle === "undefined";
  return shouldRender ? metadata.title : null;
}

export default function DocItemContent({ children }: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, "markdown")}>
      {syntheticTitle && <DocTitle title={syntheticTitle} />}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
