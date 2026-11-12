import type { ReactNode } from "react";
import { useActivePlugin } from "@docusaurus/plugin-content-docs/client";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig } from "@docusaurus/theme-common";
import { DataHeader } from "@gabrioliv/dossier";

type NavbarItem = { type?: string; sidebarId?: string; docsPluginId?: string; label?: string };

/** Rótulo do item da navbar que abre o sidebar do documento; `undefined` fora de um sidebar. */
function useSectionLabel(): string | undefined {
  const sidebar = useDocsSidebar();
  const plugin = useActivePlugin();
  const items = useThemeConfig().navbar.items as NavbarItem[];
  if (!sidebar) return undefined;
  const pluginId = plugin?.pluginId ?? "default";
  return items.find(
    (i) =>
      i.type === "docSidebar" &&
      i.sidebarId === sidebar.name &&
      (i.docsPluginId ?? "default") === pluginId,
  )?.label;
}

/** Título do documento: faixa inversa do Dossier, com a seção como kicker. */
export default function DocTitle({ title }: { title: string }): ReactNode {
  const label = useSectionLabel();
  return <DataHeader title={title} kicker={label && label !== title ? label : undefined} />;
}
