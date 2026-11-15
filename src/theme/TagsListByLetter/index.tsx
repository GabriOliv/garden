import type { ReactNode } from "react";
import { listTagsByLetters } from "@docusaurus/theme-common";
import Heading from "@theme/Heading";
import Tag from "@theme/Tag";
import type { Props } from "@theme/TagsListByLetter";
import { STAGES, stageOfLabel } from "@site/src/lib/stages";
import styles from "./styles.module.css";

type Group = { title: string; tags: Props["tags"] };

/** Item de grupo: título `h2` com âncora e os chips. */
function TagGroup({ id, title, tags }: Group & { id: string }): ReactNode {
  return (
    <article>
      <Heading as="h2" id={id}>
        {title}
      </Heading>
      <ul className="padding--none">
        {tags.map((tag) => (
          <li key={tag.permalink} className={styles.tag}>
            <Tag {...tag} />
          </li>
        ))}
      </ul>
      <hr />
    </article>
  );
}

/** Grupo "Estágios" (A a D, só os que têm documento) e depois as letras, sem as tags de estágio. */
export default function TagsListByLetter({ tags }: Props): ReactNode {
  const stageTags = STAGES.flatMap((s) => tags.filter((t) => t.label === s.label));
  const others = tags.filter((t) => !stageOfLabel(t.label));
  return (
    <section className="margin-vert--lg">
      {stageTags.length > 0 && <TagGroup id="estagios" title="Estágios" tags={stageTags} />}
      {listTagsByLetters(others).map(({ letter, tags: letterTags }) => (
        <TagGroup key={letter} id={letter} title={letter} tags={letterTags} />
      ))}
    </section>
  );
}
