import type { ReactNode } from "react";
import { Button, Toaster, toast } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";

export function ToasterDemo(): ReactNode {
  return (
    <>
      <Button onClick={() => toast({ title: "Arquivo salvo", description: "relatorio-0427.pdf" })}>
        Mostrar aviso
      </Button>
      <Toaster labels={ptBR.Toaster} />
    </>
  );
}
