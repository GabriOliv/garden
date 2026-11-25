import type { ReactNode } from "react";
import { useActivePlugin, useDoc } from "@docusaurus/plugin-content-docs/client";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig } from "@docusaurus/theme-common";
import { StageIcon } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";
import { STAGES, stageOfLabel, type StageInfo } from "@site/src/lib/stages";

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

/** Estágio da primeira tag de estágio do documento; `undefined` sem tag de estágio. */
function useStage(): StageInfo | undefined {
  const { tags } = useDoc().metadata;
  const stage = tags.map((t) => stageOfLabel(t.label)).find(Boolean);
  return STAGES.find((s) => s.stage === stage);
}

/**
 * Título do documento: faixa inversa do Dossier, com a seção como kicker e o
 * estágio de maturidade à direita da linha de meta.
 * O `meta` do `DataHeader` só aceita texto, então o HTML dele é montado aqui,
 * com as mesmas classes (`ds-header`, `ds-header-*`).
 */
export default function DocTitle({ title }: { title: string }): ReactNode {
  const label = useSectionLabel();
  const kicker = label && label !== title ? label : undefined;
  const stage = useStage();
  return (
    <header className="ds-header">
      <div className="ds-header-band">
        <h1 className="ds-t-display ds-header-title">{title}</h1>
      </div>
      {(kicker || stage) && (
        <div className="ds-header-meta">
          <span className="ds-index" aria-hidden="true" />
          {kicker && <span className="ds-t-label ds-header-kicker">{kicker}</span>}
          <span className="ds-spacer" />
          {stage && (
            <span className="ds-t-label ds-header-metatext ds-header-stage">
              <StageIcon stage={stage.stage} size="sm" decorative labels={ptBR.StageIcon} />
              {stage.label}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
