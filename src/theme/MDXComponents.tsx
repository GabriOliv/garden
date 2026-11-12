import type { ReactNode } from "react";
import MDXComponents from "@theme-original/MDXComponents";
import DocTitle from "@site/src/components/DocTitle";

/** Junta os filhos de texto de um título. */
const toText = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(toText).join("")
      : "";

export default {
  ...MDXComponents,
  h1: ({ children }: { children?: ReactNode }) => <DocTitle title={toText(children)} />,
};
