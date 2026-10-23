import { contactos } from "@/lib/contactos";
import { AVISO_SPAM_EMAIL, POLITICA_SINAL, SINAL_PERCENTAGEM, adultosNasSuites, animalDoPedido, escolhaDoPedido, dataCurta, dataLonga, textoAnimal, descreverGrupo, descreverPedido, euros, grupoDoPedido, type PedidoReserva } from "@/lib/reserva";
import { PAGAMENTO, config } from "@/lib/servidor/config";
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

/** «segunda-feira, 19 de outubro, às 19h00»: o prazo do sinal, em Portugal. */
export function prazoTxt(prazoIso: string) {
  const fim = new Date(prazoIso);
  const dia = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", weekday: "long", day: "numeric", month: "long" }).format(fim);
  const hora = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" }).format(fim).replace(":", "h");
  return `${dia}, às ${hora}`;
}

function resumoTexto(p: PedidoReserva) {
  return [
    `Chegada: ${dataLonga(p.estadia.chegada)}, desde as 15h`,
    `Saída: ${dataLonga(p.estadia.saida)}, até às 11h`,
    `${descreverPedido(p)} · ${noites(p.estadia.noites)} · ${descreverGrupo(grupoDoPedido(p))}${p.pequenoAlmoco.incluido ? " · com pequeno-almoço" : ""}${textoAnimal(p) ? ` · ${textoAnimal(p)!.toLowerCase()}` : ""}`,
    `Total da estadia: ${totalTxt(p)} · sinal de ${SINAL_PERCENTAGEM} %: ${sinalTxt(p)} · restante: ${p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"} (${p.restante.quando})`,
    ...(p.referencia ? [`Referência: ${p.referencia}`] : []),
  ].join("\n");
}
const hospedeTexto = (p: PedidoReserva) =>
  `Hóspede: ${p.hospede.nome} · ${p.hospede.telefone} · ${p.hospede.email}\nPagamento: ${formaPagamento(p)}\nMensagem: ${p.hospede.mensagem || "(sem mensagem)"}`;
const fimTexto = `\n\nAté breve,\nQuinta de Canhões\n${contactos.telemovel.texto} · ${contactos.email.texto}\n\n${AVISO_SPAM_EMAIL}`;

/* ------------------------------------------------------------------ */
/* Ao hóspede                                                          */
/* ------------------------------------------------------------------ */

/** Há lugar: pague o sinal. */
export function pagarSinalHospede(p: PedidoReserva, prazoIso: string): SemDestino {
  const ate = prazoTxt(prazoIso);
  const avisos =
    (p.ajuste ? nota(`Ajustámos o total da estadia para ${p.total !== null ? euros(p.total) : "o valor acima"}${p.ajuste.motivo ? `: ${p.ajuste.motivo}` : "."}`) : "");
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
      avisos +
      cartao({
        rotulo: "Sinal a pagar",
        valor: sinal,
        sub: `por ${mbway ? "MB WAY" : "transferência bancária"}, <strong class="t-verm" style="color:#7a2b2b;">até ${esc(ate)}</strong>`,
        linhas,
        fim: pequeno(
          `Ponha «${esc(referencia)}» na ${mbway ? "mensagem" : "descrição"}, para sabermos que é seu. Depois desse prazo, as datas podem voltar a ficar livres.`,
          "0 0 8px",
        ) + politica("0"),
      }) +
      bilhete(p) +
      assinatura() +
      detalhes(p),
    texto: `Há lugar para si, ${primeiroNome(p)}.\nPara ficar reservado, falta só o sinal de ${SINAL_PERCENTAGEM} %.\n\nSINAL A PAGAR: ${sinalTxt(p)}, até ${ate}\n${
      mbway ? `MB WAY para: ${PAGAMENTO.mbway}\nMontante: ${sinalTxt(p)}\nMensagem: ${referencia}` : `IBAN: ${PAGAMENTO.iban || "enviamos-lhe à parte"}\n${PAGAMENTO.titular ? `Titular: ${PAGAMENTO.titular}\n` : ""}Montante: ${sinalTxt(p)}\nDescritivo: ${referencia}`
    }\nDepois desse prazo, as datas podem voltar a ficar livres.${p.ajuste ? `\nTotal ajustado: ${p.ajuste.motivo}` : ""}\n\n${resumoTexto(p)}\n${POLITICA_SINAL}${fimTexto}`,
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
        `Chega-se de carro e o estacionamento é à porta: ${esc(contactos.morada.rua)}, ${esc(contactos.morada.localidade)}, ${esc(contactos.morada.codigo)}. Se precisar de chegar fora das 15h às 21h, diga-nos.`,
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
      (!p.casaInteira && adultosNasSuites(escolhaDoPedido(p), grupoDoPedido(p))
        ? nota(`Suite com ${adultosNasSuites(escolhaDoPedido(p), grupoDoPedido(p))} adultos — confirme o total. Não há preço definido para mais de 2 adultos na Suite: o total segue com o preço da Suite; use «Ajustar total» antes de confirmar.`)
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
  if (a === "grande") itens.push("canil para o animal com mais de 8 kg");
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

/** Ao hóspede: o sinal não chegou a tempo; as datas ficam livres. */
export function sinalNaoChegouHospede(p: PedidoReserva, prazoIso: string): SemDestino {
  return montar({
    assunto: `O seu pedido para ${datas(p)} · Quinta de Canhões`,
    previa: "Não recebemos o sinal a tempo e libertámos as datas.",
    rotulo: "O seu pedido",
    frase: `Libertámos as datas, ${esc(primeiroNome(p))}.`,
    corpo:
      paragrafo(
        `Não recebemos o sinal de ${valorSinal(p)} até ${esc(prazoTxt(prazoIso))}, por isso as datas de ${esc(datas(p))} voltaram a ficar livres. Não foi cobrado nada.`,
        "14px 0 0",
      ) +
      paragrafo("Se já fez o pagamento, ou se ainda quiser vir, responda a este email ou escreva-nos pelo WhatsApp e vemos o que é possível.", "14px 0 0") +
      cartao({ rotulo: "Noutra altura?", sub: "Pode fazer um novo pedido quando quiser.", fim: botao(`${config.siteUrl}/reservar`, "Fazer um novo pedido", "verde", "4px 0 4px") }) +
      assinatura(),
    texto: `Libertámos as datas, ${primeiroNome(p)}.\n\nNão recebemos o sinal de ${sinalTxt(p)} até ${prazoTxt(prazoIso)}, por isso as datas de ${datas(p)} voltaram a ficar livres. Não foi cobrado nada.\nSe já fez o pagamento, ou se ainda quiser vir, responda a este email.${fimTexto}`,
  });
}

/** Ao hóspede: a reserva paga foi cancelada; quanto se devolve. */
export function cancelamentoHospede(p: PedidoReserva, devolver: number, dias: number): SemDestino {
  const frase =
    devolver > 0
      ? `Como faltavam ${dias} dias para a chegada, devolvemos metade do sinal: <strong>${euros(devolver)}</strong>.`
      : `Como faltavam menos de 10 dias para a chegada, o sinal não é devolvido, como diz a política de cancelamento.`;
  return montar({
    assunto: `Reserva cancelada · ${datas(p)} · Quinta de Canhões`,
    previa: devolver > 0 ? `Devolvemos ${euros(devolver)} do sinal.` : "A sua reserva foi cancelada.",
    rotulo: "Reserva cancelada",
    frase: `A sua reserva foi cancelada, ${esc(primeiroNome(p))}.`,
    corpo:
      paragrafo(`A reserva ${esc(p.referencia ?? "")} para ${esc(datas(p))} está cancelada.`, "14px 0 0") +
      cartao({
        rotulo: devolver > 0 ? "A devolver" : "Sinal",
        valor: devolver > 0 ? euros(devolver) : "Não devolvido",
        sub: frase,
        fim: politica("0"),
      }) +
      paragrafo(devolver > 0 ? "Fazemos a devolução nos próximos dias, pelo mesmo meio do pagamento. Se precisar de alguma coisa, responda a este email." : "Se precisar de alguma coisa, responda a este email.", "20px 0 0") +
      assinatura(),
    texto: `A sua reserva foi cancelada, ${primeiroNome(p)}.\n\nA reserva ${p.referencia ?? ""} para ${datas(p)} está cancelada.\n${
      devolver > 0 ? `Como faltavam ${dias} dias para a chegada, devolvemos metade do sinal: ${euros(devolver)}.` : "Como faltavam menos de 10 dias para a chegada, o sinal não é devolvido."
    }\n${POLITICA_SINAL}${fimTexto}`,
  });
}

/** À casa: o resumo da manhã (pedidos sem resposta, sinais em atraso, expirados). */
export function resumoDiarioCasa(grupos: { titulo: string; itens: { p: PedidoReserva; link: string; nota: string }[] }[]): SemDestino {
  const total = grupos.reduce((s, g) => s + g.itens.length, 0);
  const blocos = grupos
    .filter((g) => g.itens.length)
    .map((g) =>
      etiqueta(esc(g.titulo), "26px 0 8px") +
      g.itens
        .map((i) =>
          cartao({
            rotulo: `${esc(i.p.referencia ?? "")} · ${esc(datas(i.p))}`,
            sub: `<strong>${esc(i.p.hospede.nome)}</strong> · ${esc(descreverPedido(i.p))} · ${esc(i.nota)}`,
            fim: botao(i.link, "Abrir o pedido", "vermelho", "2px 0 4px"),
            margem: "10px 0 0",
          }),
        )
        .join(""),
    )
    .join("");
  return montar({
    assunto: `Reservas - Resumo do dia - ${total} ${total === 1 ? "pedido" : "pedidos"} por tratar`,
    previa: grupos.map((g) => `${g.titulo}: ${g.itens.length}`).join(" · "),
    rotulo: "Resumo do dia",
    frase: `${total} ${total === 1 ? "pedido precisa" : "pedidos precisam"} de si.`,
    corpo: paragrafo("O que ficou por tratar até esta manhã:", "14px 0 0") + blocos,
    texto: grupos
      .filter((g) => g.itens.length)
      .map((g) => `${g.titulo}\n${g.itens.map((i) => `- ${i.p.referencia} · ${i.p.hospede.nome} · ${datas(i.p)} · ${i.nota}\n  ${i.link}`).join("\n")}`)
      .join("\n\n"),
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
