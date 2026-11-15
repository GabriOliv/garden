import type { ReactNode } from "react";
import { Button, Popover } from "@gabrioliv/dossier";

export function PopoverDemo(): ReactNode {
  return (
    <Popover trigger={<Button>Abrir popover</Button>}>
      <p>Conteúdo do popover.</p>
    </Popover>
  );
}
