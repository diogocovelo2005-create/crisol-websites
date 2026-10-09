import "server-only";
import { db } from "./supabase";
import { CAMPOS_NOTA as CAMPOS, ordenarNotas, type Nota } from "./notas-comum";

// Post-its: notas soltas com um pino, ou no quadro de um nicho ou presas a
// um projeto. Nunca as duas coisas ao mesmo tempo (ver sql/005_notas.sql).
// Têm título opcional e checklist (sql/006). Os tipos e a ordem estão em
// notas-comum.ts, que os componentes também usam.

export type { Anexo, CamposNota, ItemChecklist, Nota, Prioridade } from "./notas-comum";
export { ordenarNotas } from "./notas-comum";

export async function notasDoQuadro(nicho: string): Promise<Nota[]> {
  const { data, error } = await db.from("notas").select(CAMPOS).eq("nicho", nicho).order("criado_em");
  if (error) throw new Error(error.message);
  return (data ?? []) as Nota[];
}

/** As notas presas a cada projeto, já ordenadas, para as pilhas dos cartões do quadro. */
export async function notasDosProjetos(ids: string[]): Promise<Record<string, Nota[]>> {
  if (!ids.length) return {};
  const { data, error } = await db.from("notas").select(`${CAMPOS}, projeto_id`).in("projeto_id", ids);
  if (error) throw new Error(error.message);
  const porProjeto: Record<string, Nota[]> = {};
  for (const linha of (data ?? []) as (Nota & { projeto_id: string })[]) {
    const { projeto_id, ...nota } = linha;
    (porProjeto[projeto_id] ??= []).push(nota);
  }
  for (const id in porProjeto) porProjeto[id] = ordenarNotas(porProjeto[id]);
  return porProjeto;
}

export async function notasDoProjeto(projetoId: string): Promise<Nota[]> {
  const { data, error } = await db.from("notas").select(CAMPOS).eq("projeto_id", projetoId).order("criado_em");
  if (error) throw new Error(error.message);
  return (data ?? []) as Nota[];
}
