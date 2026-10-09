import "server-only";
import path from "node:path";
import { db } from "./supabase";
import { REPO, ler, provasNoDisco } from "./disco";
import type { Deploy } from "./vercel";
import { ESTADOS_ESCOLHA, faseDe } from "./estados";

type Modelo = {
  chave: string;
  fase: number;
  texto: string;
  auto?: "dossie" | "site" | "deploy" | "proposta" | "dominio";
  sugestao?: { texto: string; dias: number };
  estado?: string;
};

export type Passo = {
  id: string;
  chave: string | null;
  fase: number;
  texto: string;
  extra: boolean;
  auto: string | null;
  feito: boolean;
  feitoPor: "prova" | "mao" | null;
  feitoEm: string | null;
  sugestao?: { texto: string; dias: number };
  estado?: string;
};

export const FASES = ["Base", "Enviada", "Decisão", "Site completo", "No ar"];

function modelo(nicho: string): Modelo[] {
  const txt = ler(path.join(REPO, "nichos", nicho, "checklist.json"));
  if (!txt) return [];
  try {
    return JSON.parse(txt).passos as Modelo[];
  } catch {
    return [];
  }
}

/**
 * Garante que o projeto tem os passos do modelo do nicho. Os que já existem
 * acertam fase, texto e ordem pelo modelo (a ordem pode mudar); o feito fica.
 */
async function semear(projetoId: string, nicho: string) {
  const linhas = modelo(nicho).map((m, i) => ({
    projeto_id: projetoId,
    chave: m.chave,
    fase: m.fase,
    texto: m.texto,
    ordem: i,
    auto: m.auto ?? null,
  }));
  if (!linhas.length) return;
  await db.from("projeto_passos").upsert(linhas, { onConflict: "projeto_id,chave" });
}

export async function checklist(
  p: { id: string; nicho: string; slug: string },
  deploy: Deploy | null,
): Promise<Passo[]> {
  await semear(p.id, p.nicho);
  const { data } = await db
    .from("projeto_passos")
    .select("id, chave, fase, texto, ordem, auto, extra, feito_em")
    .eq("projeto_id", p.id)
    .order("fase")
    .order("ordem");

  const provas = provasNoDisco(p.nicho, p.slug);
  const prova: Record<string, boolean> = {
    dossie: provas.dossie,
    site: provas.site,
    proposta: provas.proposta,
    deploy: !!deploy,
    dominio: !!deploy?.dominioProprio,
  };
  const porChave = new Map(modelo(p.nicho).map((m) => [m.chave, m]));

  return (data ?? []).map((r) => {
    const provado = !!(r.auto && prova[r.auto]);
    const m = r.chave ? porChave.get(r.chave) : undefined;
    return {
      id: r.id,
      chave: r.chave,
      fase: r.fase,
      texto: r.texto,
      extra: r.extra,
      auto: r.auto,
      feito: provado || !!r.feito_em,
      feitoPor: r.feito_em ? "mao" : provado ? "prova" : null,
      feitoEm: r.feito_em,
      sugestao: m?.sugestao,
      estado: m?.estado,
    };
  });
}

export type Sugestao =
  | { tipo: "passo"; texto: string; ate: string; de: string }
  | { tipo: "estado"; estado: string; de: string };

/**
 * O que o painel propõe a seguir. Vem do último passo feito, pela ordem da
 * checklist, cujo seguinte ainda não está feito. Ele aceita, edita ou ignora.
 */
export function sugestoes(
  passos: Passo[],
  atual: { estado: string | null; proximo_passo: string | null; ignorada: string | null },
): Sugestao[] {
  const out: Sugestao[] = [];
  let ultimo: Passo | undefined;
  for (const p of passos) {
    if (p.extra) continue;
    if (p.feito) ultimo = p;
    else break;
  }
  if (ultimo?.sugestao) {
    const texto = ultimo.sugestao.texto;
    if (texto !== atual.proximo_passo && texto !== atual.ignorada) {
      const d = new Date();
      d.setDate(d.getDate() + ultimo.sugestao.dias);
      out.push({ tipo: "passo", texto, ate: d.toISOString().slice(0, 10), de: ultimo.texto });
    }
  }
  // Um passo feito que costuma mudar o estado, com o estado ainda para trás.
  const comEstado = passos.filter((p) => p.feito && p.estado).at(-1);
  if (comEstado?.estado && ESTADOS_ESCOLHA.includes(comEstado.estado)) {
    const atras =
      !atual.estado ||
      faseDe(atual.estado) < faseDe(comEstado.estado) ||
      (faseDe(atual.estado) === faseDe(comEstado.estado) &&
        ESTADOS_ESCOLHA.indexOf(atual.estado) < ESTADOS_ESCOLHA.indexOf(comEstado.estado));
    if (atras && `estado:${comEstado.estado}` !== atual.ignorada) {
      out.push({ tipo: "estado", estado: comEstado.estado, de: comEstado.texto });
    }
  }
  return out;
}
