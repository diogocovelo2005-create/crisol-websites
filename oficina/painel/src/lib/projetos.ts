import "server-only";
import { db } from "./supabase";
import { NICHOS, colunaDe, type ColunaId } from "./estados";
import { fotoDeCapa } from "./disco";

// O CRM de cada nicho, quando existe. Os nichos sem CRM guardam o estado em
// projetos.estado.
const CRM: Record<string, string> = { alojamento: "crm_alojamento" };

type LinhaProjeto = {
  id: string;
  nicho: string;
  place_id: string | null;
  nome: string;
  slug: string;
  local: string | null;
  estado: string | null;
  estado_em: string | null;
  porta: number | null;
  telefone: string | null;
  email: string | null;
  email_origem: string | null;
  proximo_passo: string | null;
  proximo_passo_ate: string | null;
  url_enviada: string | null;
  valor: number | null;
  motivo_fim: string | null;
  voltar_em: string | null;
  sugestao_ignorada: string | null;
  oculto_em: string | null;
  criado_em: string;
};

export type Lead = {
  estado: string;
  estado_em: string | null;
  telefone: string | null;
  website: string | null;
  morada: string | null;
  rating: number | null;
  num_reviews: number | null;
  tipo_lead: string | null;
  nota: number | null;
  motivo: string | null;
};

export type Projeto = LinhaProjeto & {
  estadoAtual: string | null;
  estadoDesde: string;
  concelho: string | null;
  coluna: ColunaId | "fim" | null;
  temFoto: boolean;
  lead: Lead | null;
};

function concelhoDaMorada(m: string | null): string | null {
  return m?.match(/\d{4}-\d{3}\s+([^,]+)/)?.[1]?.trim() ?? null;
}

function juntar(p: LinhaProjeto, lead: Lead | null): Projeto {
  const estadoAtual = lead ? lead.estado : p.estado;
  return {
    ...p,
    estadoAtual,
    estadoDesde: (lead ? lead.estado_em : p.estado_em) ?? p.criado_em,
    concelho: p.local ?? concelhoDaMorada(lead?.morada ?? null),
    telefone: p.telefone ?? lead?.telefone ?? null,
    coluna: colunaDe(estadoAtual),
    temFoto: !!fotoDeCapa(p.nicho, p.slug),
    lead,
  };
}

const CAMPOS_LEAD =
  "place_id, estado, estado_em, telefone, website, morada, rating, num_reviews, tipo_lead, nota, motivo";

export async function projetosDoNicho(nicho: string): Promise<Projeto[]> {
  const { data, error } = await db.from("projetos").select("*").eq("nicho", nicho);
  if (error) throw new Error(error.message);
  const linhas = (data ?? []) as LinhaProjeto[];

  const leads = new Map<string, Lead>();
  const ids = linhas.map((p) => p.place_id).filter(Boolean) as string[];
  if (CRM[nicho] && ids.length) {
    const { data: crm, error: e2 } = await db.from(CRM[nicho]).select(CAMPOS_LEAD).in("place_id", ids);
    if (e2) throw new Error(e2.message);
    for (const l of crm ?? []) leads.set(l.place_id, l as unknown as Lead);
  }

  return linhas.map((p) => juntar(p, p.place_id ? leads.get(p.place_id) ?? null : null));
}

export async function projeto(nicho: string, slug: string): Promise<Projeto | null> {
  const { data } = await db.from("projetos").select("*").eq("nicho", nicho).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const p = data as LinhaProjeto;
  let lead: Lead | null = null;
  if (p.place_id && CRM[nicho]) {
    const { data: l } = await db.from(CRM[nicho]).select(CAMPOS_LEAD).eq("place_id", p.place_id).maybeSingle();
    lead = (l as unknown as Lead) ?? null;
  }
  return juntar(p, lead);
}

/** Muda o estado onde ele vive: no CRM se o projeto vem de lá, senão no projeto. */
export async function mudarEstado(p: Projeto, estado: string): Promise<void> {
  const { error } =
    p.place_id && CRM[p.nicho]
      ? await db.from(CRM[p.nicho]).update({ estado }).eq("place_id", p.place_id)
      : await db.from("projetos").update({ estado }).eq("id", p.id);
  if (error) throw new Error(error.message);
}

export async function eventos(projetoId: string) {
  const { data } = await db
    .from("projeto_eventos")
    .select("id, tipo, texto, criado_em")
    .eq("projeto_id", projetoId)
    .order("criado_em", { ascending: false })
    .limit(50);
  return (data ?? []) as { id: number; tipo: string; texto: string; criado_em: string }[];
}

// ─── Ordem e contas ──────────────────────────────────────────────────────────

/** Fica no quadro: não acabou nem foi escondido. Os outros vão para o Arquivo. */
export function noQuadro(p: Projeto): boolean {
  return p.coluna !== "fim" && !p.oculto_em;
}

export function diasDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

/** Precisa dele: o próximo passo passou de prazo, ou está parado há 7+ dias sem passo marcado. */
export function precisaDeTi(p: Projeto): boolean {
  if (p.proximo_passo_ate) return new Date(p.proximo_passo_ate) < hojeMeiaNoite();
  return diasDesde(p.estadoDesde) >= 7;
}

function hojeMeiaNoite() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Próximo passo mais urgente primeiro; sem data vão para o fim, os mais parados à frente. */
export function ordenar(a: Projeto, b: Projeto): number {
  if (a.proximo_passo_ate && b.proximo_passo_ate) return a.proximo_passo_ate.localeCompare(b.proximo_passo_ate);
  if (a.proximo_passo_ate) return -1;
  if (b.proximo_passo_ate) return 1;
  return a.estadoDesde.localeCompare(b.estadoDesde);
}

/** Quantos projetos ativos há em cada nicho (para os separadores). */
export async function contagens(): Promise<Record<string, number>> {
  const todos = await Promise.all(NICHOS.map((n) => projetosDoNicho(n.id)));
  return Object.fromEntries(NICHOS.map((n, i) => [n.id, todos[i].filter(noQuadro).length]));
}
