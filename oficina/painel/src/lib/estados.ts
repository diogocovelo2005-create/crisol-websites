// Os estados do enum `estado_lead` e como se arrumam no quadro.

export const NICHOS = [
  { id: "alojamento", nome: "Alojamento" },
  { id: "advocacia", nome: "Advocacia" },
  { id: "saude", nome: "Saúde" },
] as const;

export type Nicho = (typeof NICHOS)[number]["id"];

export function eNicho(n: string): n is Nicho {
  return NICHOS.some((x) => x.id === n);
}

export const COLUNAS = [
  { id: "base", nome: "Base", estados: ["a construir base"] },
  { id: "enviada", nome: "Enviada", estados: ["base enviada", "reunião de feedback"] },
  { id: "sim", nome: "Sim", estados: ["disse que sim"] },
  { id: "construcao", nome: "Construção", estados: ["a construir site", "site acabado"] },
  { id: "no-ar", nome: "No ar", estados: ["publicado", "pago"] },
] as const;

export type ColunaId = (typeof COLUNAS)[number]["id"];

export const ESTADOS_FIM = ["disse que não", "não contactar mais"];

/** Os estados que se podem escolher na página de um projeto. */
export const ESTADOS_ESCOLHA = [...COLUNAS.flatMap((c) => c.estados), ...ESTADOS_FIM];

export function colunaDe(estado: string | null): ColunaId | "fim" | null {
  if (!estado) return null;
  if (ESTADOS_FIM.includes(estado)) return "fim";
  return COLUNAS.find((c) => (c.estados as readonly string[]).includes(estado))?.id ?? null;
}

/** Índice 1–5 da fase em que o estado está (0 se não está no quadro). */
export function faseDe(estado: string | null): number {
  const c = colunaDe(estado);
  return COLUNAS.findIndex((x) => x.id === c) + 1;
}
