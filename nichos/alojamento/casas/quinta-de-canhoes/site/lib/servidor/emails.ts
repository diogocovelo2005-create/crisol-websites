import { contactos } from "@/lib/contactos";
import { POLITICA_SINAL, SINAL_PERCENTAGEM, animalDoPedido, dataCurta, dataLonga, descreverAnimal, descreverGrupo, descreverPedido, euros, grupoDoPedido, type PedidoReserva } from "@/lib/reserva";
import { PAGAMENTO, PRAZO_SINAL_HORAS, config } from "@/lib/servidor/config";
import {
  assinatura,
  bilhete,
  botao,
  cartao,
  detalhes,
  esc,
  etiqueta,
  formaPagamento,
  hospede,
  linha,
  montar,
  nota,
  noites,
  paragrafo,
  pct,
  pequeno,
  politica,
  precoNoBilhete,
  primeiroNome,
  valorSinal,
  type SemDestino,
} from "@/lib/servidor/modelo-email";

/*
  Os emails do circuito das reservas, todos no modelo de modelo-email.ts.
  Em cada um, o destaque é o que aquela pessoa tem de fazer ou saber.
  Quem fala com o hóspede é a casa, no plural. Cada email tem também versão em
  texto simples.
*/

export { esc };

/** «Reservas - Ana Silva (4821) - Novo pedido»: os assuntos dos emails à casa. */
const assuntoCasa = (p: PedidoReserva, assunto: string) =>
  `Reservas - ${p.hospede.nome.trim()}${p.referencia ? ` (${p.referencia})` : ""} - ${assunto}`;

const datas = (p: PedidoReserva) => `${dataCurta(p.estadia.chegada)} → ${dataCurta(p.estadia.saida)}`;
const ref = (p: PedidoReserva) => (p.referencia ? `Reserva ${p.referencia}` : "Reserva");
const sinalTxt = (p: PedidoReserva) => (p.sinal.valor !== null ? euros(p.sinal.valor) : `${SINAL_PERCENTAGEM} %`);
const totalTxt = (p: PedidoReserva) => (p.total !== null ? euros(p.total) : "a indicar pela casa");

/** «segunda-feira, 19 de outubro, às 19h00»: o prazo do sinal, à hora seguinte, em Portugal. */
function prazo(agora = new Date()) {
  const fim = new Date(agora.getTime() + PRAZO_SINAL_HORAS * 3600000);
  fim.setMinutes(60, 0, 0);
  const dia = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", weekday: "long", day: "numeric", month: "long" }).format(fim);
  const hora = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" }).format(fim).replace(":", "h");
  return `${dia}, às ${hora}`;
}

function resumoTexto(p: PedidoReserva) {
  return [
    `Chegada: ${dataLonga(p.estadia.chegada)}, desde as 15h`,
    `Saída: ${dataLonga(p.estadia.saida)}, até às 11h`,
    `${descreverPedido(p)} · ${noites(p.estadia.noites)} · ${descreverGrupo(grupoDoPedido(p))}${p.pequenoAlmoco.incluido ? " · com pequeno-almoço" : ""}${animalDoPedido(p) !== "nao" ? ` · ${descreverAnimal(animalDoPedido(p)).toLowerCase()}` : ""}`,
    `Total da estadia: ${totalTxt(p)} · sinal de ${SINAL_PERCENTAGEM} %: ${sinalTxt(p)} · restante: ${p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"} (${p.restante.quando})`,
    ...(p.referencia ? [`Referência: ${p.referencia}`] : []),
  ].join("\n");
}
const hospedeTexto = (p: PedidoReserva) =>
  `Hóspede: ${p.hospede.nome} · ${p.hospede.telefone} · ${p.hospede.email}\nPagamento: ${formaPagamento(p)}\nMensagem: ${p.hospede.mensagem || "(sem mensagem)"}`;
const fimTexto = `\n\nAté breve,\nQuinta de Canhões\n${contactos.telemovel.texto} · ${contactos.email.texto}`;

/* ------------------------------------------------------------------ */
/* Ao hóspede                                                          */
/* ------------------------------------------------------------------ */

/** Há lugar: pague o sinal. */
export function pagarSinalHospede(p: PedidoReserva, agora = new Date()): SemDestino {
  const ate = prazo(agora);
  const mbway = p.pagamento === "mbway";
  const referencia = ref(p);
  const sinal = valorSinal(p);
  const linhas = mbway
    ? linha("MB WAY para", esc(PAGAMENTO.mbway), true) + linha("Montante", sinal, true) + linha("Mensagem", esc(referencia))
    : linha("IBAN", PAGAMENTO.iban ? `<span style="font-size:17px;letter-spacing:0.2px;">${esc(PAGAMENTO.iban)}</span>` : "Enviamos-lhe o IBAN em resposta a este email", !!PAGAMENTO.iban) +
      (PAGAMENTO.titular ? linha("Titular", esc(PAGAMENTO.titular)) : "") +
      linha("Montante", sinal, true) +
      linha("Descritivo", esc(referencia));
  return montar({
    assunto: `Há lugar para si · pague o sinal de ${sinalTxt(p)} até ${ate}`,
    previa: `Para ficar reservado, falta o sinal de ${sinal} até ${esc(ate)}.`,
    rotulo: "Disponibilidade confirmada",
    frase: `Há lugar para si, ${esc(primeiroNome(p))}.`,
    foto: p,
    corpo:
      paragrafo(`Para ficar reservado, falta só o sinal de ${pct}. Assim que chegar, enviamos-lhe a confirmação.`, "14px 0 0") +
      cartao({
        rotulo: "Sinal a pagar",
        valor: sinal,
        sub: `por ${mbway ? "MB WAY" : "transferência bancária"}, <strong class="t-verm" style="color:#7a2b2b;">até ${esc(ate)}</strong>`,
        linhas,
        fim: pequeno(
          `Ponha «${esc(referencia)}» na ${mbway ? "mensagem" : "descrição"}, para sabermos que é seu. Depois de ${PRAZO_SINAL_HORAS} horas, as datas podem voltar a ficar livres.`,
          "0 0 8px",
        ) + politica("0"),
      }) +
      bilhete(p) +
      assinatura() +
      detalhes(p),
    texto: `Há lugar para si, ${primeiroNome(p)}.\nPara ficar reservado, falta só o sinal de ${SINAL_PERCENTAGEM} %.\n\nSINAL A PAGAR: ${sinalTxt(p)}, até ${ate}\n${
      mbway ? `MB WAY para: ${PAGAMENTO.mbway}\nMontante: ${sinalTxt(p)}\nMensagem: ${referencia}` : `IBAN: ${PAGAMENTO.iban || "enviamos-lhe à parte"}\n${PAGAMENTO.titular ? `Titular: ${PAGAMENTO.titular}\n` : ""}Montante: ${sinalTxt(p)}\nDescritivo: ${referencia}`
    }\nDepois de ${PRAZO_SINAL_HORAS} horas, as datas podem voltar a ficar livres.\n\n${resumoTexto(p)}\n${POLITICA_SINAL}${fimTexto}`,
  });
}

/** Reserva confirmada: o restante e quando. */
export function reservaConfirmadaHospede(p: PedidoReserva): SemDestino {
  return montar({
    assunto: `Reserva confirmada · ${datas(p)} · Quinta de Canhões`,
    previa: `Recebemos o sinal. Ficamos à sua espera a ${dataCurta(p.estadia.chegada)}.`,
    rotulo: "Reserva confirmada",
    frase: `A sua reserva está confirmada, ${esc(primeiroNome(p))}.`,
    foto: p,
    corpo:
      paragrafo(`Recebemos o sinal de ${sinal(p)}. Ficamos à sua espera.`, "14px 0 0") +
      bilhete(p, { margem: "28px 0 0" }) +
      cartao({
        rotulo: "Fica a pagar",
        valor: p.restante.valor !== null ? euros(p.restante.valor) : "a indicar",
        sub: `Paga-se ${esc(p.restante.quando)}. O sinal de ${sinal(p)} já está recebido, de um total de ${totalTxt(p)}.`,
        margem: "24px 0 0",
      }) +
      paragrafo(
        `Chega-se de carro e o estacionamento é à porta: ${esc(contactos.morada.rua)}, ${esc(contactos.morada.localidade)}. Se precisar de chegar fora das 15h às 21h, diga-nos.`,
        "24px 0 0",
      ) +
      botao(contactos.morada.mapa, "Ver o caminho no mapa", "verde", "16px 0 0") +
      assinatura() +
      detalhes(p),
    texto: `A sua reserva está confirmada, ${primeiroNome(p)}.\n\nRecebemos o sinal de ${sinalTxt(p)}. Fica a pagar ${p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"}, ${p.restante.quando}.\n\n${resumoTexto(p)}\n\nMorada: ${contactos.morada.rua}, ${contactos.morada.localidade}, ${contactos.morada.codigo}\nMapa: ${contactos.morada.mapa}${fimTexto}`,
  });
}
const sinal = (p: PedidoReserva) => valorSinal(p);

/** As datas não estão livres: a casa propõe outras. */
export function propostaHospede(original: PedidoReserva, alternativas: PedidoReserva[], texto: string, links: string[]): SemDestino {
  const bilhetes = alternativas
    .map((a, i) =>
      bilhete(a, {
        titulo: alternativas.length > 1 ? `Proposta ${i + 1}` : "A proposta",
        foto: i === 0,
        margem: i === 0 ? "28px 0 0" : "20px 0 0",
        extra: precoNoBilhete(a) + botao(links[i], "Aceito estas datas", "vermelho", "16px 0 0"),
      }),
    )
    .join("");
  return montar({
    assunto: `As suas datas não estão livres · temos outras para lhe propor · Quinta de Canhões`,
    previa: `Para ${datas(original)} já não temos lugar. Propomos-lhe ${alternativas.length === 1 ? "outra data" : `${alternativas.length} alternativas`}.`,
    rotulo: "O seu pedido",
    frase: `Estas datas não estão livres, ${esc(primeiroNome(original))}.`,
    foto: alternativas[0],
    corpo:
      paragrafo(`Para ${esc(datas(original))} já não temos lugar. Podemos propor-lhe ${alternativas.length === 1 ? "esta data" : "estas datas"}, para ${esc(descreverPedido(original))}:`, "14px 0 0") +
      nota(texto) +
      bilhetes +
      politica("20px 0 0") +
      paragrafo(`Se nenhuma servir, responda a este email e vemos outra. Escolher uma ainda não é reserva: confirmamos a disponibilidade e enviamos-lhe os dados para o sinal.`, "24px 0 0") +
      assinatura() +
      pequeno(`Pedido original: ${esc(datas(original))} · referência ${esc(original.referencia ?? "—")}`, "28px 0 0"),
    texto: `Estas datas não estão livres, ${primeiroNome(original)}.\n\nPara ${datas(original)} já não temos lugar. Podemos propor-lhe:\n${texto ? `\n${texto}\n` : ""}\n${alternativas
      .map((a, i) => `${i + 1}. ${dataLonga(a.estadia.chegada)} → ${dataLonga(a.estadia.saida)} · total ${totalTxt(a)} · sinal de ${SINAL_PERCENTAGEM} %: ${sinalTxt(a)}\n   Aceito estas datas: ${links[i]}`)
      .join("\n")}\n\nSe nenhuma servir, responda a este email.${fimTexto}`,
  });
}

/** O pedido não pode ser aceite. */
export function recusaHospede(p: PedidoReserva, texto: string): SemDestino {
  return montar({
    assunto: `O seu pedido para ${datas(p)} · Quinta de Canhões`,
    previa: `Obrigado pelo seu pedido. Desta vez não vai ser possível.`,
    rotulo: "O seu pedido",
    frase: `Desta vez não vai ser possível, ${esc(primeiroNome(p))}.`,
    corpo:
      paragrafo(`Obrigado pelo seu pedido para ${esc(datas(p))}. Infelizmente, não conseguimos recebê-lo nestas condições. Não foi cobrado nada.`, "14px 0 0") +
      nota(texto) +
      cartao({
        rotulo: "Noutra altura?",
        sub: `Gostávamos muito de o receber. Pode fazer um novo pedido no site, ou falar connosco: <a class="t-verm" href="${esc(contactos.telemovel.href)}" style="color:#7a2b2b;">${esc(contactos.telemovel.texto)}</a> · ${`<a class="t-verm" href="${esc(contactos.whatsapp)}" style="color:#7a2b2b;">WhatsApp</a>`}.`,
        fim: botao(`${config.siteUrl}/reservar`, "Fazer um novo pedido", "verde", "4px 0 4px"),
      }) +
      assinatura(),
    texto: `Desta vez não vai ser possível, ${primeiroNome(p)}.\n\nObrigado pelo seu pedido para ${datas(p)}. Infelizmente, não conseguimos recebê-lo nestas condições. Não foi cobrado nada.${texto ? `\n\n${texto}` : ""}\n\nNovo pedido: ${config.siteUrl}/reservar${fimTexto}`,
  });
}

/* ------------------------------------------------------------------ */
/* À casa                                                              */
/* ------------------------------------------------------------------ */

/** Chegou um pedido (ou o hóspede aceitou outras datas). */
export function novoPedidoCasa(p: PedidoReserva, linkPedido: string, aceiteAlternativa = false): SemDestino {
  const nome = esc(p.hospede.nome);
  return montar({
    assunto: assuntoCasa(p, aceiteAlternativa ? "Aceitou novas datas" : "Novo pedido"),
    previa: `${datas(p)} · ${descreverPedido(p)} · ${descreverGrupo(grupoDoPedido(p))} · ${p.total !== null ? euros(p.total) : "preço a indicar"}. Responda no pedido.`,
    rotulo: aceiteAlternativa ? "Proposta aceite" : "Novo pedido pelo site",
    frase: aceiteAlternativa ? `${nome} aceitou as novas datas.` : `Novo pedido de ${nome}.`,
    foto: p,
    corpo:
      paragrafo(
        aceiteAlternativa ? `Confirme se estas datas continuam livres e responda no pedido.` : `Ainda não é reserva. Veja se há lugar e responda no pedido: um clique e o hóspede recebe a resposta.`,
        "14px 0 0",
      ) +
      (animalDoPedido(p) === "grande"
        ? nota("A decidir: traz um animal com mais de 8 kg. Não tem preço definido; diga ao hóspede se o aceita (e em que condições) antes de confirmar.")
        : "") +
      cartao({
        rotulo: `${esc(datas(p))} · ${esc(descreverPedido(p))}`,
        valor: p.total !== null ? euros(p.total) : "Preço a indicar",
        sub: `Total da estadia · sinal de ${pct}: <strong>${valorSinal(p)}</strong> · ${esc(formaPagamento(p))}`,
        fim: botao(linkPedido, "Abrir o pedido", "vermelho", "4px 0 6px"),
      }) +
      bilhete(p, { titulo: "A estadia pedida" }) +
      hospede(p) +
      detalhes(p),
    texto: `${aceiteAlternativa ? `${p.hospede.nome} aceitou as novas datas.` : `Novo pedido de ${p.hospede.nome}.`}\n\nAbrir o pedido: ${linkPedido}\n\n${resumoTexto(p)}\n\n${hospedeTexto(p)}`,
  });
}

/** O que a casa tem de preparar: camas suplementares, berços, pequeno-almoço, animal. */
function preparar(p: PedidoReserva) {
  const g = grupoDoPedido(p);
  const c = g.criancas.filter((x) => x === "crianca").length;
  const b = g.criancas.filter((x) => x === "bebe").length;
  const itens: string[] = [];
  if (c) itens.push(c === 1 ? "cama suplementar" : `${c} camas suplementares`);
  if (b) itens.push(b === 1 ? "berço" : `${b} berços`);
  if (p.pequenoAlmoco.incluido) itens.push("pequeno-almoço");
  const a = animalDoPedido(p);
  if (a === "pequeno") itens.push("animal até 8 kg");
  if (a === "grande") itens.push("animal com mais de 8 kg");
  return itens.join(" · ");
}

/** Confirmou: feche as noites no Booking e espere o sinal. */
export function confirmadoCasa(p: PedidoReserva, linkSinal: string): SemDestino {
  return montar({
    assunto: assuntoCasa(p, "Fechar datas no Booking"),
    previa: `${p.hospede.nome} já tem os dados para pagar o sinal de ${sinalTxt(p)}.`,
    rotulo: "Disponibilidade confirmada",
    frase: `Feche estas noites no Booking.`,
    corpo:
      paragrafo(`${esc(p.hospede.nome)} já recebeu os dados para pagar o sinal de <strong>${valorSinal(p)}</strong> por ${esc(formaPagamento(p))} («${esc(ref(p))}»). Para não vender duas vezes:`, "14px 0 0") +
      cartao({
        rotulo: "Fechar no Booking",
        valor: `<span style="font-size:34px;">${esc(dataCurta(p.estadia.chegada))} → ${esc(dataCurta(p.estadia.saida))}</span>`,
        sub: `${esc(descreverPedido(p))} · ${noites(p.estadia.noites)} (a noite de ${esc(dataCurta(p.estadia.saida))} fica livre)`,
        linhas: linha("Hóspedes", esc(descreverGrupo(grupoDoPedido(p)))) + (preparar(p) ? linha("Preparar", esc(preparar(p))) : ""),
      }) +
      cartao({
        rotulo: "Quando o sinal chegar",
        sub: `Confira no banco os ${valorSinal(p)} com «${esc(ref(p))}» e carregue aqui. O hóspede recebe a confirmação da reserva.`,
        fim: botao(linkSinal, "Recebi o sinal", "verde", "4px 0 6px"),
        margem: "20px 0 0",
      }) +
      hospede(p) +
      detalhes(p),
    texto: `Feche estas noites no Booking: ${dataLonga(p.estadia.chegada)} a ${dataLonga(p.estadia.saida)} (saída) · ${descreverPedido(p)}\n\n${p.hospede.nome} recebeu os dados para pagar o sinal de ${sinalTxt(p)} (${formaPagamento(p)}, «${ref(p)}»).\nQuando o sinal chegar: ${linkSinal}\n\n${hospedeTexto(p)}`,
  });
}

/** Ao Diogo: um envio falhou. */
export function alertaFalha(contexto: string, detalhe: string, p?: PedidoReserva): SemDestino {
  return montar({
    assunto: p ? assuntoCasa(p, "Alerta de falha") : "Reservas - Alerta de falha",
    previa: contexto,
    rotulo: "Alerta do site",
    frase: "Um envio falhou.",
    corpo:
      paragrafo(esc(contexto), "14px 0 0") +
      etiqueta("O detalhe", "24px 0 6px") +
      `<pre class="t-suave" style="margin:0;padding:14px;background:#ffffff;border:1px solid #e3d9c6;font-family:Menlo,Consolas,monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word;color:#5e584e;">${esc(detalhe)}</pre>`,
    texto: `${contexto}\n\n${detalhe}`,
  });
}
