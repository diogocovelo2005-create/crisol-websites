import { randomInt } from "node:crypto";
import {
  SINAL_PERCENTAGEM,
  animalDoPedido,
  cabeNasNoites,
  deIso,
  escolhaDoPedido,
  iso,
  noitesDe,
  recalcularPedido,
  validarDatas,
  validarPedido,
  type Alternativa,
  type PedidoReserva,
} from "@/lib/reserva";
import { assinar, verificar } from "@/lib/servidor/assinatura";
import { config, TEMPO_MINIMO_SEGUNDOS } from "@/lib/servidor/config";
import { passo } from "@/lib/servidor/diagnostico";
import { avisarFalha, enviarEmail } from "@/lib/servidor/email";
import * as E from "@/lib/servidor/emails";
import type { SemDestino } from "@/lib/servidor/modelo-email";
import {
  anotar,
  apagarRegisto,
  atualizar,
  conflitosDe,
  criarRegisto,
  descreverEstado,
  devolucaoDe,
  fecharImpressao,
  reservarImpressao,
  impressaoDe,
  lerRegisto,
  listarRegistos,
  ocupacaoDe,
  prazoDoSinal,
  quandoTxt,
  type Registo,
} from "@/lib/servidor/reservas";

/*
  O circuito das reservas. O estado vive no servidor (lib/servidor/reservas.ts);
  os links levam só a referência e o papel (casa ou hóspede), assinados.
  Cada ação lê o estado atual: um botão já usado devolve o que aconteceu
  («Este pedido já foi confirmado a 21 out às 14h20») em vez de repetir.

    pedido (site)       → casa: «Novo pedido» (/pedido/C)
    C confirmar         → hóspede: dados do sinal · casa: «Fechar datas no Booking»
    C sinal recebido    → hóspede: «Reserva confirmada»
    C o sinal não chegou → hóspede: datas libertadas
    C cancelar reserva  → hóspede: cancelamento e quanto se devolve
    C alternativas      → hóspede: propostas (/proposta/H?alt=i)
    H aceitar (uma só)  → casa: «Aceitou novas datas» (o pedido volta a novo)
    C recusar           → hóspede: recusa educada
*/

export type Resposta = { ok: true; [k: string]: unknown } | { ok: false; erro: string; estado?: number; [k: string]: unknown };

/** Os links valem até 30 dias depois da saída (a reserva pode ser daqui a meses). */
const expiraEm = (p: PedidoReserva) => Date.parse(`${p.estadia.saida}T00:00:00Z`) + 30 * 86400000;
export const tokenCasa = (r: Registo) => assinar("casa", { r: r.ref }, expiraEm(r.pedido));
export const tokenHospede = (r: Registo) => assinar("hospede", { r: r.ref }, expiraEm(r.pedido));
export const linkCasa = (r: Registo) => `${config.siteUrl}/pedido/${tokenCasa(r)}`;
const linkProposta = (r: Registo, i: number) => `${config.siteUrl}/proposta/${tokenHospede(r)}?alt=${i}`;

const aCasa = (email: SemDestino, p: PedidoReserva) => enviarEmail({ ...email, para: config.emailCasa, responderA: p.hospede.email });
const aoHospede = (email: SemDestino, p: PedidoReserva) => enviarEmail({ ...email, para: p.hospede.email, responderA: config.emailCasa });

const noitesIso = (p: PedidoReserva) => noitesDe(deIso(p.estadia.chegada)!, deIso(p.estadia.saida)!).map(iso);

/* ------------------------------------------------------------------ */
/* O pedido que chega do formulário                                    */
/* ------------------------------------------------------------------ */

export async function receberPedido(corpo: unknown): Promise<Resposta> {
  const c = (corpo ?? {}) as { pedido?: PedidoReserva; armadilha?: string; abertoEm?: number };
  // Anti-spam: o campo escondido vem preenchido, ou o formulário foi enviado
  // depressa demais para ser uma pessoa. Finge-se que correu bem.
  const depressa = typeof c.abertoEm !== "number" || Date.now() - c.abertoEm < TEMPO_MINIMO_SEGUNDOS * 1000;
  if (c.armadilha || depressa) {
    console.warn("[reserva] pedido descartado pelo anti-spam");
    return { ok: true, referencia: `CAN-${randomInt(1000, 9999)}` };
  }
  const erros = validarPedido(c.pedido as PedidoReserva);
  if (erros.length) {
    passo("pedido: inválido", { erros });
    return { ok: false, erro: erros.join(" "), estado: 400 };
  }
  passo("pedido: válido", { chegada: c.pedido!.estadia.chegada, saida: c.pedido!.estadia.saida });

  // Os preços ficam congelados aqui: os do momento do pedido.
  const pedido = recalcularPedido({ ...c.pedido!, criadoEm: new Date().toISOString() });

  // Duplo envio: o mesmo email, as mesmas datas e os mesmos quartos há menos de 15 minutos.
  passo("pedido: reservar a impressão (duplicados)");
  const imp = await reservarImpressao(impressaoDe(pedido));
  if ("duplicado" in imp) {
    passo("pedido: duplicado", { ref: imp.duplicado || "(ainda a ser criado)" });
    return { ok: true, referencia: imp.duplicado, repetido: true };
  }

  // O nosso calendário: noites já tomadas por pedidos confirmados ou pagos.
  passo("pedido: ler calendário");
  const registos = await listarRegistos();
  passo("pedido: calendário lido", { registos: registos.length });
  if (!cabeNasNoites(ocupacaoDe(registos), noitesIso(pedido), escolhaDoPedido(pedido), pedido.casaInteira !== null)) {
    await fecharImpressao(imp.reservado, null);
    return { ok: false, erro: "Estas datas já não estão livres para o que escolheu. Escolha outras datas ou fale connosco.", estado: 409, ocupado: true };
  }

  passo("pedido: criar registo");
  const registo = await criarRegisto(pedido).catch(async (e) => {
    await fecharImpressao(imp.reservado, null).catch(() => {});
    throw e;
  });
  await fecharImpressao(imp.reservado, registo.ref);
  passo("pedido: registo criado", { ref: registo.ref });
  const casa = await aCasa(E.novoPedidoCasa(registo.pedido, linkCasa(registo)), registo.pedido);
  if (!casa.ok) {
    passo("pedido: email à casa falhou; apagar o registo", { ref: registo.ref });
    await apagarRegisto(registo).catch((e) => passo("pedido: apagar falhou", { erro: (e as Error).message }));
    await avisarFalha(`pedido de ${pedido.hospede.nome} (${pedido.hospede.email}) não chegou à casa`, `${casa.erro}\n\n${JSON.stringify(pedido, null, 2)}`, registo.pedido);
    return { ok: false, erro: "Não conseguimos enviar o pedido.", estado: 502 };
  }
  passo("pedido: pronto", { ref: registo.ref });
  return { ok: true, referencia: registo.ref };
}

/* ------------------------------------------------------------------ */
/* As ações da casa e do hóspede                                       */
/* ------------------------------------------------------------------ */

type Acao =
  | { acao: "confirmar"; token: string; total?: number; motivo?: string; animal?: "aceite" | "recusado"; forcar?: boolean }
  | { acao: "sinal" | "sinalNaoChegou" | "cancelarReserva"; token: string }
  | { acao: "alternativas"; token: string; alternativas: Alternativa[]; nota?: string }
  | { acao: "recusar"; token: string; nota?: string }
  | { acao: "aceitar"; token: string; alt: number };

const invalido: Resposta = { ok: false, erro: "Este link não é válido ou já expirou.", estado: 403 };
const texto = (v: unknown, max = 1500) => (typeof v === "string" ? v.slice(0, max).trim() : "");

export async function executarAcao(corpo: unknown): Promise<Resposta> {
  const a = (corpo ?? {}) as Acao;
  if (typeof a.token !== "string" || a.token.length > 2000) return invalido;
  const papel = a.acao === "aceitar" ? "hospede" : "casa";
  const v = verificar<{ r: string }>(papel, a.token);
  if (!v.ok || typeof v.dados?.r !== "string") return invalido;
  const ref = v.dados.r;
  passo(`ação ${a.acao}: ler registo`, { ref });
  if (!(await lerRegisto(ref))) return { ok: false, erro: "Este pedido já não existe.", estado: 404 };

  switch (a.acao) {
    /* ---------------- o hóspede aceita uma proposta ---------------- */
    case "aceitar": {
      const m = await atualizar(ref, (r) => {
        if (r.proposta?.aceite) return { erro: `Já escolheu uma das datas propostas a ${quandoTxt(r.proposta.aceite.em)}.`, estado: 409 };
        if (r.estado !== "proposta" || !r.proposta) return { erro: "Este pedido já não tem datas por escolher.", estado: 409 };
        const escolhida = r.proposta.alternativas[a.alt];
        if (!escolhida) return { erro: "Essa alternativa não existe.", estado: 400 };
        const erro = validarDatas(escolhida.estadia.chegada, escolhida.estadia.saida, escolhida.casaInteira !== null, 1);
        if (erro) return { erro, estado: 400 };
        r.original ??= r.pedido;
        r.pedido = { ...escolhida, referencia: r.ref };
        r.proposta.aceite = { indice: a.alt, em: new Date().toISOString() };
        r.estado = "novo";
        anotar(r, "O hóspede aceitou outras datas", `${escolhida.estadia.chegada} → ${escolhida.estadia.saida}`);
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const r = m.registo;
      const e = await aCasa(E.novoPedidoCasa(r.pedido, linkCasa(r), true), r.pedido);
      if (!e.ok) return falhou("aceitar proposta", e.erro, r.pedido);
      return { ok: true };
    }

    /* ---------------- a casa confirma ---------------- */
    case "confirmar": {
      const registos = await listarRegistos();
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "novo") return { erro: descreverEstado(r), estado: 409, extra: { jaFeito: true } };
        const erro = validarDatas(r.pedido.estadia.chegada, r.pedido.estadia.saida, r.pedido.casaInteira !== null);
        if (erro) return { erro, estado: 400 };
        const conflitos = conflitosDe(r, registos);
        if (conflitos.length && !a.forcar) {
          return {
            erro: `Estas noites já estão ocupadas por ${conflitos.map((c) => `${c.ref} (${c.estado})`).join(", ")}.`,
            estado: 409,
            extra: { conflitos },
          };
        }
        const p = r.pedido;
        // O preço é o congelado no pedido; só muda se a casa o ajustar.
        if (typeof a.total === "number" && a.total > 0 && a.total < 100000 && Math.round(a.total) !== p.total) {
          const total = Math.round(a.total);
          p.ajuste = { totalOriginal: p.total, motivo: texto(a.motivo, 500) };
          p.total = total;
          p.sinal.valor = Math.ceil((total * SINAL_PERCENTAGEM) / 100);
          p.restante.valor = total - p.sinal.valor;
        }
        if (p.sinal.valor === null) return { erro: "Indique o total da estadia para se calcular o sinal.", estado: 400 };
        r.estado = "confirmado";
        r.confirmacao = { em: new Date().toISOString(), prazoSinal: prazoDoSinal(p.estadia.chegada), ...(conflitos.length ? { forcado: true } : {}) };
        anotar(r, "Confirmado", [conflitos.length ? "mesmo com noites ocupadas" : "", p.ajuste ? `total ajustado para ${p.total} €` : ""].filter(Boolean).join(" · ") || undefined);
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado, ...(m.extra ?? {}) };
      const r = m.registo;
      const h = await aoHospede(E.pagarSinalHospede(r.pedido, r.confirmacao!.prazoSinal), r.pedido);
      if (!h.ok) await avisarFalha("dados do sinal ao hóspede (use «Enviar por WhatsApp» na página do pedido)", h.erro, r.pedido);
      const c = await aCasa(E.confirmadoCasa(r.pedido, linkCasa(r)), r.pedido);
      if (!c.ok) await avisarFalha("lembrete do Booking à casa", c.erro, r.pedido);
      return h.ok ? { ok: true } : { ok: false, erro: "Confirmado, mas o email ao hóspede falhou. Envie os dados pelo WhatsApp.", estado: 502 };
    }

    /* ---------------- o sinal chegou ---------------- */
    case "sinal": {
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "confirmado") return { erro: descreverEstado(r), estado: 409 };
        r.estado = "pago";
        r.pagamento = { em: new Date().toISOString() };
        anotar(r, "Sinal recebido");
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const h = await aoHospede(E.reservaConfirmadaHospede(m.registo.pedido), m.registo.pedido);
      if (!h.ok) return falhou("reserva confirmada ao hóspede", h.erro, m.registo.pedido);
      return { ok: true };
    }

    /* ---------------- o sinal não chegou ---------------- */
    case "sinalNaoChegou": {
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "confirmado") return { erro: descreverEstado(r), estado: 409 };
        r.estado = "cancelado";
        r.fim = { em: new Date().toISOString(), motivo: "O sinal não chegou" };
        anotar(r, "Cancelado: o sinal não chegou");
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const r = m.registo;
      const h = await aoHospede(E.sinalNaoChegouHospede(r.pedido, r.confirmacao!.prazoSinal), r.pedido);
      if (!h.ok) return falhou("aviso de sinal não recebido ao hóspede", h.erro, r.pedido);
      return { ok: true };
    }

    /* ---------------- cancelar uma reserva paga ---------------- */
    case "cancelarReserva": {
      let calculo = { dias: 0, devolver: 0 };
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "pago") return { erro: descreverEstado(r), estado: 409 };
        calculo = devolucaoDe(r.pedido);
        r.estado = "cancelado";
        r.fim = { em: new Date().toISOString(), motivo: "Reserva cancelada", devolver: calculo.devolver };
        anotar(r, "Reserva cancelada", `a devolver ${calculo.devolver} €`);
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const h = await aoHospede(E.cancelamentoHospede(m.registo.pedido, calculo.devolver, calculo.dias), m.registo.pedido);
      if (!h.ok) return falhou("cancelamento ao hóspede", h.erro, m.registo.pedido);
      return { ok: true, devolver: calculo.devolver };
    }

    /* ---------------- propor outras datas ---------------- */
    case "alternativas": {
      const lista = Array.isArray(a.alternativas) ? a.alternativas.slice(0, 3) : [];
      if (!lista.length) return { ok: false, erro: "Marque pelo menos uma alternativa.", estado: 400 };
      const nota = texto(a.nota);
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "novo") return { erro: descreverEstado(r), estado: 409 };
        const recalculadas: PedidoReserva[] = [];
        for (const alt of lista) {
          const casa = alt.casaInteira ?? r.pedido.casaInteira !== null;
          const erro = validarDatas(alt?.chegada, alt?.saida, casa, 1);
          if (erro) return { erro: `${alt?.chegada} → ${alt?.saida}: ${erro}`, estado: 400 };
          recalculadas.push({ ...recalcularPedido(r.pedido, alt), referencia: r.ref });
        }
        r.estado = "proposta";
        r.proposta = { em: new Date().toISOString(), nota, alternativas: recalculadas };
        anotar(r, "Outras datas propostas", recalculadas.map((p) => `${p.estadia.chegada} → ${p.estadia.saida}`).join("; "));
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const r = m.registo;
      const h = await aoHospede(E.propostaHospede(r.pedido, r.proposta!.alternativas, nota, r.proposta!.alternativas.map((_, i) => linkProposta(r, i))), r.pedido);
      if (!h.ok) return falhou("proposta ao hóspede", h.erro, r.pedido);
      return { ok: true };
    }

    /* ---------------- recusar ---------------- */
    case "recusar": {
      const nota = texto(a.nota);
      const m = await atualizar(ref, (r) => {
        if (r.estado !== "novo" && r.estado !== "proposta") return { erro: descreverEstado(r), estado: 409 };
        r.estado = "recusado";
        r.fim = { em: new Date().toISOString(), motivo: nota || "Recusado" };
        anotar(r, "Recusado");
        return { registo: r };
      });
      if (!("registo" in m)) return { ok: false, erro: m.erro, estado: m.estado };
      const h = await aoHospede(E.recusaHospede(m.registo.pedido, nota), m.registo.pedido);
      if (!h.ok) return falhou("recusa ao hóspede", h.erro, m.registo.pedido);
      return { ok: true };
    }
  }
  return { ok: false, erro: "Ação desconhecida.", estado: 400 };
}

async function falhou(contexto: string, erro: string, p?: PedidoReserva): Promise<Resposta> {
  await avisarFalha(contexto, erro, p);
  return { ok: false, erro: "Não foi possível enviar o email. Tente outra vez daqui a pouco.", estado: 502 };
}

/* ------------------------------------------------------------------ */
/* Para as páginas                                                     */
/* ------------------------------------------------------------------ */

/** O registo de um link, se o link for válido para esse papel. */
export async function registoDoLink(papel: "casa" | "hospede", token: string) {
  const v = verificar<{ r: string }>(papel, token);
  if (!v.ok) return { erro: v.motivo } as const;
  const r = typeof v.dados?.r === "string" ? await lerRegisto(v.dados.r) : null;
  return r ? ({ registo: r } as const) : ({ erro: "invalido" } as const);
}
