/** Nó do MDX: só o que a numeração lê. */
interface Node {
  type: string;
  name?: string | null;
  attributes?: { type: string; name: string; value: string }[];
  children?: Node[];
}

/**
 * Numera os `<Figure>` de cada documento na ordem em que aparecem: passa `n` = "1", "2"...
 * O número vai no HTML da página, e não num contador CSS, para a busca e a cópia acharem "FIG. 01".
 */
export default function figureNumbers() {
  return (tree: Node) => {
    let n = 0;
    const walk = (node: Node) => {
      if (node.type.startsWith("mdxJsx") && node.name === "Figure") {
        node.attributes!.push({ type: "mdxJsxAttribute", name: "n", value: String(++n) });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
