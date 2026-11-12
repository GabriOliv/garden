import { useState, type ReactNode } from "react";
import { Button, Menu } from "@gabrioliv/dossier";

export function MenuDemo(): ReactNode {
  const [chosen, setChosen] = useState("nenhum");
  return (
    <>
      <Menu
        trigger={<Button>Abrir menu</Button>}
        items={[
          { label: "Renomear", onSelect: () => setChosen("Renomear") },
          { label: "Duplicar", onSelect: () => setChosen("Duplicar") },
          { label: "Excluir", tone: "danger", onSelect: () => setChosen("Excluir") },
        ]}
      />
      <p>Item escolhido: {chosen}</p>
    </>
  );
}
