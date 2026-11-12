import type { ReactNode } from "react";
import s from "./layouts.module.css";

/** Nota lateral: número no texto e a nota na coluna de margem (ou logo abaixo, sem espaço). */
export function Sidenote({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      <sup className={s.ref} aria-hidden="true" />
      <span className={s.note} role="note">
        {children}
      </span>
    </>
  );
}
