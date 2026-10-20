import { randomInt } from "node:crypto";
import { recalcularPedido, validarDatas, validarPedido, type PedidoReserva } from "@/lib/reserva";
import { assinar, verificar } from "@/lib/servidor/assinatura";
import { config, TEMPO_MINIMO_SEGUNDOS } from "@/lib/servidor/config";
import { avisarFalha, enviarEmail } from "@/lib/servidor/email";
import * as E from "@/lib/servidor/emails";

/*
  O circuito das reservas, sem base de dados: cada passo recebe um token
  assinado, faz o que tem a fazer (enviar emails) e devolve o token do passo
  seguinte. O estado avança pelos links.

    pedido (site) ──► casa: «Novo pedido» (/pedido/T1, fase novo)
                      (o hóspede vê a confirmação no site; o primeiro email que
                       recebe é o do sinal, o das novas datas ou a recusa)
    T1 confirmar ──► hóspede: dados do sinal · casa: «feche no Booking» + /pedido/T2 (fase confirmado)
    T2 sinal     ──► hóspede: «Reserva confirmada»
    T1 alternativas ► hóspede: propostas (/proposta/P?alt=i)
    P aceitar    ──► casa: «Aceitou» + /pedido/T1' (fase novo, datas novas)
    T1 recusar   ──► hóspede: recusa educada
*/

export type DadosCasa = { fase: "novo" | "confirmado"; pedido: PedidoReserva; aceite?: boolean };
export type DadosProposta = { pedido: PedidoReserva; alternativas: { chegada: string; saida: string }[]; nota: string };

export type Resposta = { ok: true; [k: string]: unknown } | { ok: false; erro: string; estado?: number };

const linkCasa = (dados: DadosCasa) => `${config.siteUrl}/pedido/${assinar("casa", dados)}`;
const linkProposta = (token: string, i: number) => `${config.siteUrl}/proposta/${token}?alt=${i}`;

async function aCasa(email: ReturnType<typeof E.novoPedidoCasa>, p: PedidoReserva) {
  return enviarEmail({ ...email, para: config.emailCasa, responderA: p.hospede.email });
}
async function aoHospede(email: ReturnType<typeof E.novoPedidoCasa>, p: PedidoReserva) {
  return enviarEmail({ ...email, para: p.hospede.email, responderA: config.emailCasa });
}

/** O pedido que chega do formulário. */
export async function receberPedido(corpo: unknown): Promise<Resposta> {
  const c = (corpo ?? {}) as { pedido?: PedidoReserva; armadilha?: string; abertoEm?: number };
  // Anti-spam: o campo escondido vem preenchido, ou o formulário foi enviado
  // depressa demais para ser uma pessoa. Finge-se que correu bem.
  const depressa = typeof c.abertoEm !== "number" || Date.now() - c.abertoEm < TEMPO_MINIMO_SEGUNDOS * 1000;
  if (c.armadilha || depressa) {
    console.warn("[reserva] pedido descartado pelo anti-spam");
    return { ok: true, referencia: String(randomInt(1000, 10000)) };
  }
  const erros = validarPedido(c.pedido as PedidoReserva);
  if (erros.length) return { ok: false, erro: erros.join(" "), estado: 400 };

  const pedido = recalcularPedido({ ...c.pedido!, referencia: String(randomInt(1000, 10000)), criadoEm: new Date().toISOString() });

  const casa = await aCasa(E.novoPedidoCasa(pedido, linkCasa({ fase: "novo", pedido })), pedido);
  if (!casa.ok) {
    await avisarFalha(`pedido de ${pedido.hospede.nome} (${pedido.hospede.email}) não chegou à casa`, `${casa.erro}\n\n${JSON.stringify(pedido, null, 2)}`, pedido);
    return { ok: false, erro: "Não conseguimos enviar o pedido.", estado: 502 };
  }
  return { ok: true, referencia: pedido.referencia };
}

type Acao =
  | { acao: "confirmar"; token: string; totalCombinado?: number }
  | { acao: "sinal"; token: string }
  | { acao: "alternativas"; token: string; alternativas: { chegada: string; saida: string }[]; nota?: string }
  | { acao: "recusar"; token: string; nota?: string }
  | { acao: "aceitar"; token: string; alt: number };

const invalido: Resposta = { ok: false, erro: "Este link não é válido ou já expirou.", estado: 403 };

export async function executarAcao(corpo: unknown): Promise<Resposta> {
  const a = (corpo ?? {}) as Acao;
  if (typeof a.token !== "string" || a.token.length > 20000) return invalido;

  if (a.acao === "aceitar") {
    const v = verificar<DadosProposta>("proposta", a.token);
    if (!v.ok) return invalido;
    const alt = v.dados.alternativas[a.alt];
    if (!alt) return { ok: false, erro: "Essa alternativa não existe.", estado: 400 };
    const erro = validarDatas(alt.chegada, alt.saida, v.dados.pedido.casaInteira !== null);
    if (erro) return { ok: false, erro, estado: 400 };
    const pedido = recalcularPedido(v.dados.pedido, alt);
    const r = await aCasa(E.novoPedidoCasa(pedido, linkCasa({ fase: "novo", pedido, aceite: true }), true), pedido);
    if (!r.ok) return falhou("aceitar proposta", r.erro, pedido);
    return { ok: true };
  }

  const v = verificar<DadosCasa>("casa", a.token);
  if (!v.ok) return invalido;
  const { fase, pedido } = v.dados;

  if (a.acao === "confirmar") {
    if (fase !== "novo") return { ok: false, erro: "Este pedido já foi confirmado.", estado: 409 };
    const erro = validarDatas(pedido.estadia.chegada, pedido.estadia.saida, pedido.casaInteira !== null);
    if (erro) return { ok: false, erro, estado: 400 };
    const total = typeof a.totalCombinado === "number" && a.totalCombinado > 0 && a.totalCombinado < 100000 ? a.totalCombinado : null;
    const final = recalcularPedido(pedido, undefined, total);
    if (final.sinal.valor === null) return { ok: false, erro: "Indique o total da estadia para se calcular o sinal.", estado: 400 };
    const proximo = linkCasa({ fase: "confirmado", pedido: final });
    const h = await aoHospede(E.pagarSinalHospede(final), final);
    if (!h.ok) return falhou("dados do sinal ao hóspede", h.erro, final);
    const c = await aCasa(E.confirmadoCasa(final, proximo), final);
    if (!c.ok) await avisarFalha("lembrete do Booking à casa", c.erro, final);
    return { ok: true, proximo: proximo.slice(config.siteUrl.length) };
  }

  if (a.acao === "sinal") {
    if (fase !== "confirmado") return { ok: false, erro: "Primeiro confirme a disponibilidade.", estado: 409 };
    const h = await aoHospede(E.reservaConfirmadaHospede(pedido), pedido);
    if (!h.ok) return falhou("reserva confirmada ao hóspede", h.erro, pedido);
    return { ok: true };
  }

  if (a.acao === "alternativas") {
    if (fase !== "novo") return { ok: false, erro: "Este pedido já foi confirmado.", estado: 409 };
    const alternativas = Array.isArray(a.alternativas) ? a.alternativas.slice(0, 3) : [];
    if (!alternativas.length) return { ok: false, erro: "Marque pelo menos uma alternativa.", estado: 400 };
    for (const alt of alternativas) {
      const erro = validarDatas(alt?.chegada, alt?.saida, pedido.casaInteira !== null);
      if (erro) return { ok: false, erro: `${alt?.chegada} → ${alt?.saida}: ${erro}`, estado: 400 };
    }
    const nota = typeof a.nota === "string" ? a.nota.slice(0, 1500).trim() : "";
    const token = assinar<DadosProposta>("proposta", { pedido, alternativas: alternativas.map(({ chegada, saida }) => ({ chegada, saida })), nota });
    const recalculadas = alternativas.map((alt) => recalcularPedido(pedido, alt));
    const h = await aoHospede(
      E.propostaHospede(pedido, recalculadas, nota, recalculadas.map((_, i) => linkProposta(token, i))),
      pedido,
    );
    if (!h.ok) return falhou("proposta ao hóspede", h.erro, pedido);
    return { ok: true };
  }

  if (a.acao === "recusar") {
    if (fase !== "novo") return { ok: false, erro: "Este pedido já foi confirmado.", estado: 409 };
    const nota = typeof a.nota === "string" ? a.nota.slice(0, 1500).trim() : "";
    const h = await aoHospede(E.recusaHospede(pedido, nota), pedido);
    if (!h.ok) return falhou("recusa ao hóspede", h.erro, pedido);
    return { ok: true };
  }

  return { ok: false, erro: "Ação desconhecida.", estado: 400 };
}

async function falhou(contexto: string, erro: string, p?: PedidoReserva): Promise<Resposta> {
  await avisarFalha(contexto, erro, p);
  return { ok: false, erro: "Não foi possível enviar o email. Tente outra vez daqui a pouco.", estado: 502 };
}
