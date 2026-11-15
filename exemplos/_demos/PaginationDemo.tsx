import { useState, type ReactNode } from "react";
import { Pagination } from "@gabrioliv/dossier";
import { ptBR } from "@gabrioliv/dossier/locales/pt-BR";

export function PaginationDemo(): ReactNode {
  const [page, setPage] = useState(1);
  return <Pagination page={page} total={5} onChange={(next) => setPage(next)} labels={ptBR.Pagination} />;
}
