"use server";

import { spawn } from "node:child_process";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { mudarEstado, projeto as lerProjeto } from "@/lib/projetos";
import { ESTADOS_ESCOLHA, eNicho } from "@/lib/estados";
import { eAstro, existe, pastaDoProjeto } from "@/lib/disco";
import { CAMPOS_NOTA, PRIORIDADES, type Anexo, type CamposNota, type Nota, type Prioridade } from "@/lib/notas-comum";

async function evento(projetoId: string, tipo: "nota" | "passo", texto: string) {
  await db.from("projeto_eventos").insert({ projeto_id: projetoId, tipo, texto });
}

function refrescar(nicho: string, slug: string) {
  revalidatePath(`/${nicho}`);
  revalidatePath(`/${nicho}/${slug}`);
}

async function obter(nicho: string, slug: string) {
  const p = await lerProjeto(nicho, slug);
  if (!p) throw new Error("Projeto não encontrado");
  return p;
}

// ─── Estado ──────────────────────────────────────────────────────────────────

export async function definirEstado(nicho: string, slug: string, estado: string) {
  if (!ESTADOS_ESCOLHA.includes(estado)) throw new Error(`Estado desconhecido: ${estado}`);
  const p = await obter(nicho, slug);
  if (p.estadoAtual === estado) return;
  // O evento de estado é registado pelo trigger (no CRM ou em projetos).
  await mudarEstado(p, estado);
  refrescar(nicho, slug);
}

export async function guardarFim(nicho: string, slug: string, motivo: string, voltarEm: string | null) {
  const p = await obter(nicho, slug);
  await db.from("projetos").update({ motivo_fim: motivo || null, voltar_em: voltarEm || null }).eq("id", p.id);
  if (motivo) await evento(p.id, "nota", `Motivo: ${motivo}`);
  refrescar(nicho, slug);
}

/** Tira o cartão do quadro (vai para o Arquivo). Não apaga nada. */
export async function esconderCartao(nicho: string, slug: string, esconder: boolean) {
  const p = await obter(nicho, slug);
  await db.from("projetos").update({ oculto_em: esconder ? new Date().toISOString() : null }).eq("id", p.id);
  await evento(p.id, "nota", esconder ? "Tirado do quadro" : "Voltou ao quadro");
  refrescar(nicho, slug);
  revalidatePath(`/${nicho}/arquivo`);
}

// ─── Próximo passo e sugestões ───────────────────────────────────────────────

export async function definirProximoPasso(nicho: string, slug: string, texto: string, ate: string | null) {
  const p = await obter(nicho, slug);
  await db
    .from("projetos")
    .update({ proximo_passo: texto.trim() || null, proximo_passo_ate: ate || null })
    .eq("id", p.id);
  if (texto.trim()) await evento(p.id, "passo", `Próximo passo: ${texto.trim()}${ate ? ` (até ${ate})` : ""}`);
  refrescar(nicho, slug);
}

export async function ignorarSugestao(nicho: string, slug: string, chave: string) {
  const p = await obter(nicho, slug);
  await db.from("projetos").update({ sugestao_ignorada: chave }).eq("id", p.id);
  refrescar(nicho, slug);
}

// ─── Checklist ───────────────────────────────────────────────────────────────

export async function marcarPasso(nicho: string, slug: string, passoId: string, feito: boolean) {
  const p = await obter(nicho, slug);
  const { data } = await db
    .from("projeto_passos")
    .update({ feito_em: feito ? new Date().toISOString() : null })
    .eq("id", passoId)
    .eq("projeto_id", p.id)
    .select("texto")
    .single();
  if (data && feito) await evento(p.id, "passo", `✓ ${data.texto}`);
  refrescar(nicho, slug);
}

export async function adicionarPasso(nicho: string, slug: string, fase: number, texto: string) {
  if (!texto.trim() || fase < 1 || fase > 5) return;
  const p = await obter(nicho, slug);
  await db.from("projeto_passos").insert({ projeto_id: p.id, fase, texto: texto.trim(), ordem: 1000, extra: true });
  refrescar(nicho, slug);
}

export async function apagarPasso(nicho: string, slug: string, passoId: string) {
  const p = await obter(nicho, slug);
  // Só os acrescentados à mão; os do modelo voltariam a ser semeados.
  await db.from("projeto_passos").delete().eq("id", passoId).eq("projeto_id", p.id).eq("extra", true);
  refrescar(nicho, slug);
}

// ─── Notas e negócio ─────────────────────────────────────────────────────────

export async function adicionarNota(nicho: string, slug: string, texto: string) {
  if (!texto.trim()) return;
  const p = await obter(nicho, slug);
  await evento(p.id, "nota", texto.trim());
  refrescar(nicho, slug);
}

export async function guardarNegocio(
  nicho: string,
  slug: string,
  campos: { valor?: string; url_enviada?: string; email?: string },
) {
  const p = await obter(nicho, slug);
  const upd: Record<string, unknown> = {};
  if (campos.valor !== undefined) upd.valor = campos.valor ? Number(campos.valor.replace(",", ".")) : null;
  if (campos.url_enviada !== undefined) upd.url_enviada = campos.url_enviada.trim() || null;
  if (campos.email !== undefined) {
    upd.email = campos.email.trim() || null;
    upd.email_origem = campos.email.trim() ? "manual" : "sem-email";
  }
  await db.from("projetos").update(upd).eq("id", p.id);
  refrescar(nicho, slug);
}

// ─── No PC ───────────────────────────────────────────────────────────────────

/** Arranca o servidor local do site na porta do projeto, desligado do painel. */
export async function arrancarLocal(nicho: string, slug: string) {
  const p = await obter(nicho, slug);
  const site = path.join(pastaDoProjeto(nicho, slug), "site");
  if (!p.porta || !existe(path.join(site, "package.json"))) throw new Error("Este projeto ainda não tem site.");
  const porta = eAstro(nicho, slug) ? `--port ${p.porta}` : `-p ${p.porta}`;
  const filho = spawn(`npm run dev -- ${porta}`, {
    cwd: site,
    shell: true,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  filho.unref();
}

export async function abrirPasta(nicho: string, slug: string) {
  const pasta = pastaDoProjeto(nicho, slug);
  if (!existe(pasta)) throw new Error("A pasta ainda não existe.");
  // Com shell, o caminho tem espaços ("Diogo Covelo") e vai entre aspas.
  spawn("code", [`"${pasta}"`], { shell: true, detached: true, stdio: "ignore" }).unref();
}

// ─── Notas soltas (post-its) ─────────────────────────────────────────────────
// Ou vivem no quadro de um nicho, ou presas a um projeto — nunca as duas
// coisas (ver sql/005_notas.sql). Quem chama já tem os dados em memória, por
// isso estas ações não devolvem a lista inteira: só o que mudou.

export type ContextoNota = { nicho: string } | { projetoId: string };

function donoDaNota(c: ContextoNota) {
  return "nicho" in c ? { nicho: c.nicho } : { projeto_id: c.projetoId };
}

export async function criarNota(contexto: ContextoNota, prioridade: Prioridade): Promise<Nota> {
  if ("nicho" in contexto && !eNicho(contexto.nicho)) throw new Error("Nicho desconhecido");
  const pos_x = 15 + Math.random() * 60;
  const pos_y = 15 + Math.random() * 55;
  const rotacao = Math.round(Math.random() * 10 - 5);
  const { data, error } = await db
    .from("notas")
    .insert({ ...donoDaNota(contexto), prioridade, pos_x, pos_y, rotacao })
    .select(CAMPOS_NOTA)
    .single();
  if (error) throw new Error(error.message);
  if ("nicho" in contexto) revalidatePath(`/${contexto.nicho}`);
  return data as Nota;
}

/** Prende uma nota a um projeto (sai do quadro e passa à pilha do cartão). */
export async function associarNota(id: string, projetoId: string) {
  const { data: p } = await db.from("projetos").select("nicho, slug").eq("id", projetoId).maybeSingle();
  if (!p) throw new Error("Projeto não encontrado");
  const { error } = await db.from("notas").update({ projeto_id: projetoId, nicho: null }).eq("id", id);
  if (error) throw new Error(error.message);
  refrescar(p.nicho, p.slug);
}

/** Solta uma nota de um projeto e devolve-a ao quadro do nicho, como nota geral. */
export async function soltarNota(id: string, nicho: string) {
  if (!eNicho(nicho)) throw new Error("Nicho desconhecido");
  const pos_x = 15 + Math.random() * 60;
  const pos_y = 15 + Math.random() * 55;
  const { error } = await db.from("notas").update({ nicho, projeto_id: null, pos_x, pos_y }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/${nicho}`);
}

export async function moverNota(id: string, pos_x: number, pos_y: number) {
  await db.from("notas").update({ pos_x, pos_y }).eq("id", id);
}

/** Guarda de uma vez os campos que mudaram dentro da nota (título, texto, checklist, prioridade). */
export async function guardarNota(id: string, campos: CamposNota) {
  const upd: Record<string, unknown> = {};
  if (typeof campos.titulo === "string") upd.titulo = campos.titulo.slice(0, 200);
  if (typeof campos.texto === "string") upd.texto = campos.texto;
  if (campos.prioridade !== undefined) {
    if (!PRIORIDADES.includes(campos.prioridade)) throw new Error("Prioridade desconhecida");
    upd.prioridade = campos.prioridade;
  }
  if (campos.itens !== undefined) {
    if (!Array.isArray(campos.itens)) throw new Error("Checklist inválida");
    upd.itens = campos.itens.map((i) => ({ id: String(i.id), texto: String(i.texto ?? ""), feito: !!i.feito }));
  }
  if (!Object.keys(upd).length) return;
  const { error } = await db.from("notas").update(upd).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function apagarNota(id: string) {
  const { data } = await db.from("notas").select("anexos, nicho").eq("id", id).maybeSingle();
  const anexos = (data?.anexos ?? []) as Anexo[];
  if (anexos.length) await db.storage.from("notas").remove(anexos.map((a) => a.caminho));
  await db.from("notas").delete().eq("id", id);
  if (data?.nicho) revalidatePath(`/${data.nicho}`);
}

/** Sobe o ficheiro para o bucket "notas" e junta-o à lista de anexos. Devolve só o anexo novo. */
export async function anexarFicheiro(id: string, formData: FormData): Promise<Anexo | null> {
  const ficheiro = formData.get("ficheiro");
  if (!(ficheiro instanceof File) || !ficheiro.size) return null;
  const caminho = `${id}/${crypto.randomUUID()}-${ficheiro.name}`;
  const { error } = await db.storage.from("notas").upload(caminho, ficheiro, { contentType: ficheiro.type || undefined });
  if (error) throw new Error(error.message);
  const anexo: Anexo = { nome: ficheiro.name, caminho, tamanho: ficheiro.size };
  const { data } = await db.from("notas").select("anexos").eq("id", id).maybeSingle();
  const anexos = [...((data?.anexos ?? []) as Anexo[]), anexo];
  await db.from("notas").update({ anexos }).eq("id", id);
  return anexo;
}

export async function removerAnexo(id: string, caminho: string) {
  await db.storage.from("notas").remove([caminho]);
  const { data } = await db.from("notas").select("anexos").eq("id", id).maybeSingle();
  const anexos = ((data?.anexos ?? []) as Anexo[]).filter((a) => a.caminho !== caminho);
  await db.from("notas").update({ anexos }).eq("id", id);
}
