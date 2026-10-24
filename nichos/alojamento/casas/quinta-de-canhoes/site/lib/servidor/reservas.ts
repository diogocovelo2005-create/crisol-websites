import { createHash } from "node:crypto";
import {
  UNIDADES_MAX,
  adultosNasSuites,
  cabeGrupo,
  cabeNasNoites,
  criancasCama,
  deIso,
  escolhaDoPedido,
  grupoDoPedido,
  hojeEmPortugal,
  iso,
  lugaresDe,
  lugaresNormais,
  noitesDe,
  noitesEntre,
  recalcularPedido,
  somarDias,
  TABELA_PADRAO,
  type TabelaPrecos,
  type Alternativa,
  type Escolha,
  type Ocupacao,
  type PedidoReserva,
  type TipoQuarto,
} from "@/lib/reserva";
import { obterArmazem } from "@/lib/servidor/armazem";
import { passo } from "@/lib/servidor/diagnostico";
import { PRAZO_SINAL_HORAS } from "@/lib/servidor/config";

/*
  O estado das reservas (a «memória mínima»): um registo por pedido, com o
  pedido e os preços congelados no momento do pedido, o estado e o histórico.

    novo ──► confirmado ──► pago ──► cancelado
      │          └──► cancelado (o sinal não chegou) / expirado (lembretes)
      ├──► proposta ──(o hóspede aceita uma)──► novo (com as datas novas)
      └──► recusado

  Confirmados e pagos ocupam noites no nosso calendário; os outros não.
*/

export type EstadoPedido = "novo" | "proposta" | "confirmado" | "pago" | "recusado" | "cancelado" | "expirado";

export type Registo = {
  ref: string;
  estado: EstadoPedido;
  pedido: PedidoReserva;
  /** O pedido original, quando o hóspede aceitou outras datas. */
  original?: PedidoReserva;
  criadoEm: string;
  atualizadoEm: string;
  impressao: string;
  historico: { em: string; acao: string; detalhe?: string }[];
  confirmacao?: { em: string; prazoSinal: string; forcado?: boolean };
  proposta?: { em: string; nota: string; alternativas: PedidoReserva[]; aceite?: { indice: number; em: string } };
  pagamento?: { em: string };
  fim?: { em: string; motivo: string; devolver?: number };
};

const CHAVE = (ref: string) => `pedidos/${ref}`;
const OCUPAM: EstadoPedido[] = ["confirmado", "pago"];

/* ------------------------------------------------------------------ */
/* Ler e escrever                                                      */
/* ------------------------------------------------------------------ */

export async function lerRegisto(ref: string) {
  const a = await obterArmazem();
  return (await a.ler<Registo>(CHAVE(ref)))?.valor ?? null;
}

// ponytail: lê todos os registos de cada vez; chega para uma casa (centenas por ano). Índice por mês se crescer.
export async function listarRegistos(): Promise<Registo[]> {
  const a = await obterArmazem();
  const chaves = await a.listar("pedidos/");
  const lidos = await Promise.all(chaves.map((c) => a.ler<Registo>(c)));
  return lidos.flatMap((l) => (l ? [l.valor] : []));
}

export type Mudanca = { registo: Registo } | { erro: string; estado?: number; extra?: Record<string, unknown> };

/** Lê, aplica a mudança e escreve só se ninguém escreveu entretanto (etag); tenta outra vez se houve conflito. */
export async function atualizar(ref: string, mudar: (r: Registo) => Mudanca | Promise<Mudanca>): Promise<Mudanca> {
  const a = await obterArmazem();
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const lido = await a.ler<Registo>(CHAVE(ref));
    if (!lido) return { erro: "Este pedido não existe.", estado: 404 };
    const m = await mudar(structuredClone(lido.valor));
    if (!("registo" in m)) return m;
    m.registo.atualizadoEm = new Date().toISOString();
    if (await a.escrever(CHAVE(ref), m.registo, { etag: lido.etag })) return m;
    passo("registo: alguém escreveu ao mesmo tempo (ou a leitura vinha atrasada); tentar outra vez", { ref, tentativa });
    // As leituras são eventuais: dar tempo a que a versão nova chegue.
    await new Promise((r) => setTimeout(r, 500 * (tentativa + 1)));
  }
  return { erro: "O pedido estava a ser alterado ao mesmo tempo. Tente outra vez.", estado: 409 };
}

export const anotar = (r: Registo, acao: string, detalhe?: string) => {
  r.historico.push({ em: new Date().toISOString(), acao, ...(detalhe ? { detalhe } : {}) });
};

/* ------------------------------------------------------------------ */
/* Referência e duplicados                                             */
/* ------------------------------------------------------------------ */

/** A impressão de um pedido: o mesmo email, as mesmas datas e os mesmos quartos. */
export const impressaoDe = (p: PedidoReserva) =>
  createHash("sha1")
    .update(JSON.stringify([p.hospede.email.trim().toLowerCase(), p.estadia.chegada, p.estadia.saida, p.casaInteira !== null, escolhaDoPedido(p)]))
    .digest("hex")
    .slice(0, 24);

const JANELA_DUPLICADOS_MS = 15 * 60 * 1000;
const janela = (t: number) => Math.floor(t / JANELA_DUPLICADOS_MS);
const chaveDuplicado = (impressao: string, j: number) => `duplicados/${impressao}-${j}`;

/*
  Duplo envio. As leituras são eventuais (podem chegar com atraso), por isso
  a garantia vem de uma escrita condicional: o primeiro pedido «reserva» a
  chave desta janela de 15 min (onlyIfNew, verificado no servidor do Blobs);
  um segundo pedido igual falha essa escrita e é tratado como duplicado.
  Também se olha para a janela anterior (um envio repetido logo a seguir à
  mudança de janela).
  Devolve { duplicado: ref | "" } (ref "" se ainda não for legível) ou { reservado: chave }.
*/
export async function reservarImpressao(impressao: string): Promise<{ duplicado: string } | { reservado: string }> {
  const a = await obterArmazem();
  const agora = Date.now();
  const anterior = await a.ler<{ ref: string | null; em: string }>(chaveDuplicado(impressao, janela(agora) - 1));
  if (anterior?.valor.ref && agora - Date.parse(anterior.valor.em) < JANELA_DUPLICADOS_MS) return { duplicado: anterior.valor.ref };
  const chave = chaveDuplicado(impressao, janela(agora));
  if (await a.escrever(chave, { ref: null, em: new Date(agora).toISOString() }, { etag: null })) return { reservado: chave };
  const atual = await a.ler<{ ref: string | null }>(chave);
  return { duplicado: atual?.valor.ref ?? "" };
}

/** Limpeza: chaves de duplicados com mais de um dia. */
export async function limparDuplicados() {
  const a = await obterArmazem();
  const limite = janela(Date.now()) - 96;
  for (const k of await a.listar("duplicados/")) {
    const j = Number(k.split("-").pop());
    if (Number.isFinite(j) && j < limite) await a.apagar(k);
  }
}

/** Guarda a referência na chave do duplicado (ou liberta-a, se o pedido falhou). */
export async function fecharImpressao(chave: string, ref: string | null) {
  const a = await obterArmazem();
  if (ref) await a.escrever(chave, { ref, em: new Date().toISOString() });
  else await a.apagar(chave);
}

/** Cria o registo com uma referência nova e única: CAN-AAMM-NN (ano, mês, número do mês). */
export async function criarRegisto(pedido: PedidoReserva): Promise<Registo> {
  const a = await obterArmazem();
  const agora = new Date();
  const [ano, mes] = hojeEmPortugal().split("-");
  const prefixo = `CAN-${ano.slice(2)}${mes}-`;
  let n = (await a.listar(`pedidos/${prefixo}`)).length + 1;
  const impressao = impressaoDe(pedido);
  for (let tentativa = 0; tentativa < 50; tentativa++, n++) {
    const ref = `${prefixo}${String(n).padStart(2, "0")}`;
    const registo: Registo = {
      ref,
      estado: "novo",
      pedido: { ...pedido, referencia: ref },
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString(),
      impressao,
      historico: [{ em: agora.toISOString(), acao: "Pedido recebido pelo site" }],
    };
    if (await a.escrever(CHAVE(ref), registo, { etag: null })) return registo;
  }
  throw new Error("Não foi possível gerar uma referência única.");
}

export async function apagarRegisto(r: Registo) {
  const a = await obterArmazem();
  await a.apagar(CHAVE(r.ref));
  for (const k of await a.listar(`duplicados/${r.impressao}`)) await a.apagar(k);
}

/* ------------------------------------------------------------------ */
/* O calendário                                                        */
/* ------------------------------------------------------------------ */

const noitesIso = (p: PedidoReserva) => noitesDe(deIso(p.estadia.chegada)!, deIso(p.estadia.saida)!).map(iso);

/** As noites ocupadas pelos pedidos confirmados e pagos (sem dados pessoais). */
export function ocupacaoDe(registos: Registo[], excluir?: string): Ocupacao {
  const o: Ocupacao = {};
  for (const r of registos) {
    if (!OCUPAM.includes(r.estado) || r.ref === excluir) continue;
    const casa = r.pedido.casaInteira !== null;
    const e = escolhaDoPedido(r.pedido);
    for (const d of noitesIso(r.pedido)) {
      const n = (o[d] ??= { duplo: 0, twin: 0, suite: 0, casa: false });
      if (casa) n.casa = true;
      else for (const t of Object.keys(UNIDADES_MAX) as TipoQuarto[]) n[t] += e[t] ?? 0;
    }
  }
  return o;
}

/** Os pedidos confirmados/pagos que impedem este de caber (vazio se cabe). */
export function conflitosDe(r: Registo, registos: Registo[]): { ref: string; estado: EstadoPedido }[] {
  const noites = noitesIso(r.pedido);
  if (cabeNasNoites(ocupacaoDe(registos, r.ref), noites, escolhaDoPedido(r.pedido), r.pedido.casaInteira !== null)) return [];
  const minhas = new Set(noites);
  return registos
    .filter((o) => o.ref !== r.ref && OCUPAM.includes(o.estado) && noitesIso(o.pedido).some((d) => minhas.has(d)))
    .map((o) => ({ ref: o.ref, estado: o.estado }));
}

/* ------------------------------------------------------------------ */
/* Alternativas automáticas                                            */
/* ------------------------------------------------------------------ */

export type Sugestao = { rotulo: string; alternativa: Alternativa; pedido: PedidoReserva };

/*
  Para «Não há estas datas»: as datas livres mais próximas antes e depois
  (com o mesmo número de noites e os mesmos quartos) e, nas mesmas datas,
  outras combinações de quartos que caibam.
*/
export function sugerirAlternativas(r: Registo, registos: Registo[], maxDatas = 4, t: TabelaPrecos = TABELA_PADRAO): Sugestao[] {
  const p = r.pedido;
  const o = ocupacaoDe(registos, r.ref);
  const casa = p.casaInteira !== null;
  const escolha = escolhaDoPedido(p);
  const chegada = deIso(p.estadia.chegada)!;
  const n = p.estadia.noites;
  const primeira = somarDias(deIso(hojeEmPortugal())!, 1);
  const cabe = (c: Date, e: Escolha, ci: boolean) =>
    cabeNasNoites(o, noitesDe(c, somarDias(c, n)).map(iso), e, ci);

  const sugestoes: Sugestao[] = [];
  const juntar = (rotulo: string, alt: Alternativa) => sugestoes.push({ rotulo, alternativa: alt, pedido: recalcularPedido(p, alt, undefined, t) });

  // Mesmas datas, outros quartos.
  const g = grupoDoPedido(p);
  const combos: { e: Escolha; nq: number; preco: number }[] = [];
  for (let d = 0; d <= UNIDADES_MAX.duplo; d++)
    for (let tw = 0; tw <= UNIDADES_MAX.twin; tw++)
      for (let s = 0; s <= UNIDADES_MAX.suite; s++) {
        const e: Escolha = Object.fromEntries(Object.entries({ duplo: d, twin: tw, suite: s }).filter(([, v]) => v > 0));
        const nq = d + tw + s;
        if (!nq || cabeGrupo(e, g) || adultosNasSuites(e, g)) continue;
        if (!casa && JSON.stringify(e) === JSON.stringify(escolha)) continue;
        if (!cabe(chegada, e, false)) continue;
        combos.push({ e, nq, preco: d * t.base.duplo + tw * t.base.twin + s * t.base.suite });
      }
  combos.sort((a, b) => a.nq - b.nq || a.preco - b.preco);
  for (const c of combos.slice(0, 2)) juntar("Mesmas datas, outros quartos", { chegada: p.estadia.chegada, saida: p.estadia.saida, escolha: c.e, casaInteira: false });

  // Outras datas, o mesmo pedido: as mais próximas antes e depois.
  const antes: Date[] = [];
  const depois: Date[] = [];
  for (let k = 1; k <= 180 && antes.length + depois.length < maxDatas; k++) {
    const dDepois = somarDias(chegada, k);
    if (depois.length < maxDatas / 2 && cabe(dDepois, escolha, casa)) depois.push(dDepois);
    const dAntes = somarDias(chegada, -k);
    if (antes.length < maxDatas / 2 && dAntes >= primeira && cabe(dAntes, escolha, casa)) antes.push(dAntes);
  }
  // Se não houver antes, completa com mais depois (e vice-versa).
  for (let k = 1; k <= 365 && antes.length + depois.length < maxDatas; k++) {
    const d = somarDias(chegada, k);
    if (!depois.some((x) => x.getTime() === d.getTime()) && cabe(d, escolha, casa)) depois.push(d);
  }
  for (const d of [...antes, ...depois].sort((a, b) => a.getTime() - b.getTime()))
    juntar(d < chegada ? "Mais cedo" : "Mais tarde", { chegada: iso(d), saida: iso(somarDias(d, n)) });
  return sugestoes;
}

/* ------------------------------------------------------------------ */
/* Prazos, devoluções, textos de estado                                */
/* ------------------------------------------------------------------ */

/** Um instante em Portugal (dia AAAA-MM-DD, hora h) em ms UTC. */
function emPortugal(dia: string, hora: number) {
  const [a, m, d] = dia.split("-").map(Number);
  const palpite = Date.UTC(a, m - 1, d, hora);
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", hourCycle: "h23" }).format(palpite));
  return palpite - (h - hora) * 3600000;
}

/** O prazo do sinal: o mais curto entre 48 h e a véspera da chegada às 12h (Lisboa). */
export function prazoDoSinal(chegada: string, agora = Date.now()) {
  const vespera = emPortugal(iso(somarDias(deIso(chegada)!, -1)), 12);
  return new Date(Math.min(agora + PRAZO_SINAL_HORAS * 3600000, vespera)).toISOString();
}

/** Quanto se devolve ao cancelar uma reserva paga: metade do sinal até 10 dias antes; depois, nada. */
export function devolucaoDe(p: PedidoReserva) {
  const dias = noitesEntre(deIso(hojeEmPortugal())!, deIso(p.estadia.chegada)!);
  const sinal = p.sinal.valor ?? 0;
  return { dias, devolver: dias >= 10 ? Math.round(sinal / 2) : 0 };
}

const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** «21 out às 14h20», na hora de Portugal. */
export const quandoTxt = (isoData: string) => {
  const d = new Date(isoData);
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", month: "numeric", day: "numeric" }).formatToParts(d);
  const valor = (t: string) => Number(partes.find((x) => x.type === t)?.value);
  const [m, di] = [valor("month"), valor("day")];
  const dia = `${di} ${MESES_CURTOS[m - 1]}`;
  const hora = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" }).format(d).replace(":", "h");
  return `${dia} às ${hora}`;
};

const ultima = (r: Registo, acao: string) => [...r.historico].reverse().find((h) => h.acao.startsWith(acao))?.em ?? r.atualizadoEm;

/** A frase que um botão já usado mostra em vez de repetir a ação. */
export function descreverEstado(r: Registo): string {
  switch (r.estado) {
    case "novo":
      return "Este pedido ainda está por responder.";
    case "proposta":
      return r.proposta?.aceite
        ? `O hóspede já escolheu uma das datas propostas a ${quandoTxt(r.proposta.aceite.em)}.`
        : `Já foram propostas outras datas a ${quandoTxt(r.proposta?.em ?? r.atualizadoEm)}; espera-se a resposta do hóspede.`;
    case "confirmado":
      return `Este pedido já foi confirmado a ${quandoTxt(r.confirmacao?.em ?? ultima(r, "Confirmado"))}.`;
    case "pago":
      return `O sinal deste pedido já foi recebido a ${quandoTxt(r.pagamento?.em ?? ultima(r, "Sinal"))}.`;
    case "recusado":
      return `Este pedido foi recusado a ${quandoTxt(r.fim?.em ?? r.atualizadoEm)}.`;
    case "cancelado":
      return `Este pedido foi cancelado a ${quandoTxt(r.fim?.em ?? r.atualizadoEm)}.`;
    case "expirado":
      return `Este pedido expirou a ${quandoTxt(r.fim?.em ?? r.atualizadoEm)}: o sinal não chegou a tempo.`;
  }
}
