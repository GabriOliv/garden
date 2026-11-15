import { useState, type ReactNode } from "react";
import { Button, Dialog } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";

export function DialogDemo(): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir arquivo"
        description="O arquivo sai da pasta e não pode ser restaurado."
        labels={ptBR.Dialog}
      />
    </>
  );
}
