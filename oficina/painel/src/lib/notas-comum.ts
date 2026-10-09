// O que o servidor e os componentes das notas partilham: tipos, cores e a
// ordem. Sem "server-only", para os post-its (no cliente) ordenarem igual.

export type Prioridade = "alta" | "media" | "baixa";
export type Anexo = { nome: string; caminho: string; tamanho: number };
export type ItemChecklist = { id: string; texto: string; feito: boolean };

export type Nota = {
  id: string;
  titulo: string;
  texto: string;
  itens: ItemChecklist[];
  prioridade: Prioridade;
  pos_x: number;
  pos_y: number;
  rotacao: number;
  anexos: Anexo[];
  criado_em: string;
};

/** Os campos que se editam dentro da nota (guardados de uma vez, só os que mudaram). */
export type CamposNota = Partial<Pick<Nota, "titulo" | "texto" | "itens" | "prioridade">>;

export const CAMPOS_NOTA = "id, titulo, texto, itens, prioridade, pos_x, pos_y, rotacao, anexos, criado_em";

export const PRIORIDADES: Prioridade[] = ["alta", "media", "baixa"];
export const COR: Record<Prioridade, string> = { alta: "#d32f2f", media: "#e0a92e", baixa: "#2e9e4f" };
export const NOME: Record<Prioridade, string> = { alta: "Prioritária", media: "Média", baixa: "Baixa" };
const PESO: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 };

/** Checklist com itens e todos feitos: a nota está resolvida. */
function resolvida(n: Nota) {
  return n.itens.length > 0 && n.itens.every((i) => i.feito);
}

/**
 * Prioritárias primeiro. Dentro da mesma prioridade, as resolvidas (checklist
 * toda feita) descem, e de resto a mais recente primeiro.
 */
export function ordenarNotas(notas: Nota[]): Nota[] {
  return [...notas].sort(
    (a, b) =>
      PESO[a.prioridade] - PESO[b.prioridade] ||
      Number(resolvida(a)) - Number(resolvida(b)) ||
      b.criado_em.localeCompare(a.criado_em),
  );
}

/** O que a pilha fechada mostra: o título, ou a primeira linha. */
export function resumoNota(n: Nota): string {
  if (n.titulo.trim()) return n.titulo.trim();
  const linha = n.texto.split("\n").find((l) => l.trim());
  if (linha) return linha.trim();
  return n.itens.find((i) => i.texto.trim())?.texto.trim() ?? "";
}
