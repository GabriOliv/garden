/**
 * Cópia de `@docusaurus/theme-classic/lib/theme/DocTagDocListPage` (3.9.2).
 * Muda só o `<Heading as="h1">`: numa tag de estágio, o StageIcon de 16 px,
 * decorativo, vem antes do nome do estágio, e o desenho do estágio vem sob o título.
 */
import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  usePluralForm,
} from "@docusaurus/theme-common";
import Translate, { translate } from "@docusaurus/Translate";
import SearchMetadata from "@theme/SearchMetadata";
import Unlisted from "@theme/ContentVisibility/Unlisted";
import Heading from "@theme/Heading";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { Props } from "@theme/DocTagDocListPage";
import { StageIcon, type Stage } from "@gabrioliv/dossier";
import { stageOfLabel } from "@site/src/lib/stages";

type Tag = Props["tag"];

// Very simple pluralization: probably good enough for now
function useNDocsTaggedPlural() {
  const { selectMessage } = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: "theme.docs.tagDocListPageTitle.nDocsTagged",
          description:
            'Pluralized label for "{count} docs tagged". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: "One doc tagged|{count} docs tagged",
        },
        { count },
      ),
    );
}

function usePageTitle(props: Props): string {
  const nDocsTaggedPlural = useNDocsTaggedPlural();
  return translate(
    {
      id: "theme.docs.tagDocListPageTitle",
      description: "The title of the page for a docs tag",
      message: '{nDocsTagged} with "{tagName}"',
    },
    { nDocsTagged: nDocsTaggedPlural(props.tag.count), tagName: props.tag.label },
  );
}

/** O título; numa tag de estágio, com o ícone logo antes do nome entre aspas. */
function TagTitle({ title, label }: { title: string; label: string }): ReactNode {
  const stage = stageOfLabel(label);
  const at = title.lastIndexOf(`"${label}"`);
  if (!stage || at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <StageIcon
        stage={stage}
        size="sm"
        decorative
        style={{ verticalAlign: "middle", marginRight: "0.25em" }}
      />
      {title.slice(at)}
    </>
  );
}

/** Desenho de cada estágio em `static/img/dossier/stages/`. */
const STAGE_ART: Record<Stage, string> = {
  A: "/img/dossier/stages/estagio-a-semente-dossier.svg",
  B: "/img/dossier/stages/estagio-b-broto-dossier.svg",
  C: "/img/dossier/stages/estagio-c-arvore-dossier.svg",
  D: "/img/dossier/stages/estagio-d-fruto-dossier.svg",
};

/** O desenho do estágio da tag; nada para outra tag. */
function StageArt({ label }: { label: string }): ReactNode {
  const stage = stageOfLabel(label);
  const src = useBaseUrl(stage ? STAGE_ART[stage] : "");
  if (!stage) return null;
  return <img src={src} alt="" style={{ display: "block", width: "100%", height: "auto" }} />;
}

function DocItem({ doc }: { doc: Tag["items"][number] }) {
  return (
    <article className="margin-vert--lg">
      <Link to={doc.permalink}>
        <Heading as="h2">{doc.title}</Heading>
      </Link>
      {doc.description && <p>{doc.description}</p>}
    </article>
  );
}

function DocTagDocListPageMetadata({ title, tag }: Props & { title: string }) {
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="doc_tag_doc_list" />
    </>
  );
}

function DocTagDocListPageContent({ tag, title }: Props & { title: string }) {
  return (
    <HtmlClassNameProvider className={clsx(ThemeClassNames.page.docsTagDocListPage)}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--8 col--offset-2">
            {tag.unlisted && <Unlisted />}
            <header className="margin-bottom--xl">
              <Heading as="h1">
                <TagTitle title={title} label={tag.label} />
              </Heading>
              <StageArt label={tag.label} />
              {tag.description && <p>{tag.description}</p>}
              <Link href={tag.allTagsPath}>
                <Translate
                  id="theme.tags.tagsPageLink"
                  description="The label of the link targeting the tag list page">
                  View all tags
                </Translate>
              </Link>
            </header>
            <section className="margin-vert--lg">
              {tag.items.map((doc) => (
                <DocItem key={doc.id} doc={doc} />
              ))}
            </section>
          </main>
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

export default function DocTagDocListPage(props: Props): ReactNode {
  const title = usePageTitle(props);
  return (
    <>
      <DocTagDocListPageMetadata {...props} title={title} />
      <DocTagDocListPageContent {...props} title={title} />
    </>
  );
}
