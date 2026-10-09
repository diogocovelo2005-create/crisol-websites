import { colunaDe } from "./estados";

// A cor de cada fase, a mesma no quadro e na página do projeto.
export const COR: Record<string, string> = {
  sem: "var(--color-f-sem)",
  base: "var(--color-f-base)",
  enviada: "var(--color-f-enviada)",
  sim: "var(--color-f-sim)",
  construcao: "var(--color-f-construcao)",
  "no-ar": "var(--color-f-no-ar)",
  fim: "var(--color-tinta-3)",
};

export function corDoEstado(estado: string | null): string {
  return COR[colunaDe(estado) ?? "sem"];
}
