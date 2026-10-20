import { contactos } from "@/lib/contactos";
import { config } from "@/lib/servidor/config";
import { POLITICA_SINAL, SINAL_PERCENTAGEM, animalDoPedido, bebes, criancasCama, dataCurta, deIso, descreverGrupo, descreverPedido, euros, grupoDoPedido, type PedidoReserva } from "@/lib/reserva";
import type { Email } from "@/lib/servidor/email";
import { FOTOS_EMAIL, LOGO_EMAIL } from "@/lib/servidor/logo-email";

/*
  O modelo único dos emails das reservas (aprovado pelo Diogo no protótipo 2).

  Ordem: logotipo → etiqueta e frase principal a vermelho → introdução →
  o destaque (cartão, bilhete da estadia, botões) → assinatura → detalhes
  pequenos → rodapé. Cada email (emails.ts) só escolhe as peças.

  Gmail: tabelas, estilos inline, sem web fonts; imagens anexadas inline
  (cid). Modo escuro: Apple Mail, iOS e Outlook leem a paleta escura e
  trocam o logotipo pelo claro; no Gmail (u + .body) o logotipo é texto
  vivo, que o Gmail inverte; se o seletor falhar, fica a imagem escura com
  halo da cor do papel. Todas as células têm cor de fundo própria.
*/

export type SemDestino = Omit<Email, "para" | "responderA">;

export const C = {
  cal: "#f3e9d8",
  papel: "#fbf6ec",
  branco: "#ffffff",
  xisto: "#221f1b",
  suave: "#5e584e",
  claro: "#8a8275",
  linha: "#e3d9c6",
  caixilho: "#7a2b2b",
  vale: "#2c3729",
  valeClaro: "#d8dccd",
  rosa: "#e7a598",
};
export const SERIFA = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";
export const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const CID_LOGO = "logo@quintadecanhoes";
const CID_LOGO_CLARO = "logo-claro@quintadecanhoes";
const CID_FOTO = "estadia@quintadecanhoes";

export const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const pessoas = (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`;
const adultosTxt = (n: number) => `${n} ${n === 1 ? "adulto" : "adultos"}`;
export const noites = (n: number) => `${n} ${n === 1 ? "noite" : "noites"}`;
export const pct = `${SINAL_PERCENTAGEM}&nbsp;%`;
export const primeiroNome = (p: PedidoReserva) => p.hospede.nome.trim().split(/\s+/)[0];
export const valorSinal = (p: PedidoReserva) => (p.sinal.valor !== null ? euros(p.sinal.valor) : pct);
export const formaPagamento = (p: PedidoReserva) => (p.pagamento === "mbway" ? "MB WAY" : "transferência bancária");
const fmt = (v: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-PT", o).format(deIso(v)!);

const ESTILO = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (max-width:620px){
  .moldura{padding:28px 20px !important}
  .frase{font-size:30px !important}
  .valor{font-size:44px !important}
  .dia{font-size:44px !important}
  .bilhete{padding:18px 14px !important}
}
@media (prefers-color-scheme: dark){
  .bg-cal{background:#171614 !important}
  .bg-papel{background:#201e1b !important}
  .bg-branco{background:#2a2723 !important}
  .bg-vale{background:#243020 !important}
  .t-xisto{color:#f3e9d8 !important}
  .t-suave{color:#c9bfae !important}
  .t-claro{color:#9d9486 !important}
  .t-verm{color:${C.rosa} !important}
  .b-linha{border-color:#3d3832 !important}
  .logo-escuro{display:none !important}
  .logo-claro{display:block !important;max-height:none !important;overflow:visible !important}
}
[data-ogsc] .t-xisto{color:#f3e9d8 !important}
[data-ogsc] .t-suave{color:#c9bfae !important}
[data-ogsc] .t-claro{color:#9d9486 !important}
[data-ogsc] .t-verm{color:${C.rosa} !important}
[data-ogsb] .bg-cal{background:#171614 !important}
[data-ogsb] .bg-papel{background:#201e1b !important}
[data-ogsb] .bg-branco{background:#2a2723 !important}
[data-ogsc] .logo-escuro{display:none !important}
[data-ogsc] .logo-claro{display:block !important;max-height:none !important;overflow:visible !important}
u + .body .logo-escuro, u + .body .logo-claro{display:none !important}
u + .body .logo-texto{display:block !important;max-height:none !important;overflow:visible !important}
`;

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

export const etiqueta = (t: string, margem = "0") =>
  `<p class="t-suave" style="margin:${margem};font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.suave};">${t}</p>`;

export const paragrafo = (html: string, margem = "16px 0 0") =>
  `<p class="t-xisto" style="margin:${margem};font-family:${SANS};font-size:16px;line-height:1.6;color:${C.xisto};">${html}</p>`;

export const pequeno = (html: string, margem = "0 0 8px") =>
  `<p class="t-claro" style="margin:${margem};font-family:${SANS};font-size:12px;line-height:1.6;color:${C.claro};">${html}</p>`;

/** A política do sinal: pequena, mas legível (cor suave e não clara). */
export const politica = (margem = "0 0 8px") =>
  `<p class="t-suave" style="margin:${margem};font-family:${SANS};font-size:13px;line-height:1.55;color:${C.suave};"><strong style="font-weight:600;">Cancelamento:</strong> ${esc(POLITICA_SINAL)}</p>`;

export const nota = (texto: string) =>
  texto
    ? `<p class="t-xisto" style="margin:18px 0 0;padding:2px 0 2px 14px;border-left:3px solid ${C.caixilho};font-family:${SERIFA};font-size:17px;line-height:1.5;color:${C.xisto};">${esc(texto).replace(/\n/g, "<br>")}</p>`
    : "";

export const link = (href: string, texto: string) => `<a class="t-verm" href="${esc(href)}" style="color:${C.caixilho};">${texto}</a>`;

/** Botão a sério (tabela), no vermelho ou no verde da casa. */
export function botao(href: string, texto: string, cor: "vermelho" | "verde" = "vermelho", margem = "22px 0 0") {
  const fundo = cor === "verde" ? C.vale : C.caixilho;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:${margem};"><tr>
<td bgcolor="${fundo}" style="background:${fundo};border-radius:2px;">
<a href="${esc(href)}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:16px;font-weight:600;line-height:1.2;color:${C.papel};text-decoration:none;border-radius:2px;">${texto}</a>
</td></tr></table>`;
}

/** Uma linha rótulo / valor (dentro de um cartão). */
export const linha = (rotulo: string, valor: string, grande = false) => `<tr>
<td class="bg-branco t-suave b-linha" valign="top" style="padding:10px 12px 10px 0;border-top:1px solid ${C.linha};font-family:${SANS};font-size:13px;color:${C.suave};width:36%;background:${C.branco};">${rotulo}</td>
<td class="bg-branco t-xisto b-linha" style="padding:10px 0;border-top:1px solid ${C.linha};font-family:${grande ? SERIFA : SANS};font-size:${grande ? 21 : 16}px;color:${C.xisto};font-weight:${grande ? "normal" : 600};background:${C.branco};">${valor}</td></tr>`;

/** O cartão de destaque: branco, risca vermelha em cima. */
export function cartao({ rotulo, valor, sub, linhas = "", fim = "", margem = "28px 0 0" }: { rotulo?: string; valor?: string; sub?: string; linhas?: string; fim?: string; margem?: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-branco b-linha" style="margin:${margem};background:${C.branco};border:1px solid ${C.linha};border-top:3px solid ${C.caixilho};">
<tr><td class="bg-branco" style="padding:22px 24px ${fim ? "6px" : "22px"};background:${C.branco};">
${rotulo ? etiqueta(rotulo) : ""}
${valor ? `<p class="valor t-xisto" style="margin:4px 0 0;font-family:${SERIFA};font-size:48px;line-height:1.05;color:${C.xisto};">${valor}</p>` : ""}
${sub ? `<p class="t-xisto" style="margin:10px 0 ${linhas ? "16px" : "0"};font-family:${SANS};font-size:15px;line-height:1.5;color:${C.xisto};">${sub}</p>` : ""}
${linhas ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhas}</table>` : ""}
</td></tr>
${fim ? `<tr><td class="bg-branco" style="padding:12px 24px 20px;background:${C.branco};">${fim}</td></tr>` : ""}
</table>`;
}

const bilheteLado = (rotulo: string, v: string, hora: string, alinhar: "left" | "right") => `
<td class="bilhete bg-vale" width="42%" valign="top" align="${alinhar}" style="padding:22px 24px;background:${C.vale};">
  <p style="margin:0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.rosa};">${rotulo}</p>
  <p class="dia" style="margin:6px 0 0;font-family:${SERIFA};font-size:56px;line-height:1;color:${C.cal};">${fmt(v, { day: "numeric" })}</p>
  <p style="margin:6px 0 0;font-family:${SERIFA};font-size:17px;color:${C.cal};">${esc(fmt(v, { month: "long" }))}</p>
  <p style="margin:2px 0 0;font-family:${SANS};font-size:13px;line-height:1.45;color:${C.valeClaro};">${esc(fmt(v, { weekday: "long" }))}<br>${hora}</p>
</td>`;

/* O que se pediu, por linhas: o alojamento, quem vem, o que leva, o animal. */
function resumoBilhete(p: PedidoReserva) {
  const g = grupoDoPedido(p);
  const extras: string[] = [p.pequenoAlmoco.incluido ? "Com pequeno-almoço" : "Sem pequeno-almoço"];
  if (criancasCama(g)) extras.push(`${criancasCama(g) === 1 ? "cama suplementar" : `${criancasCama(g)} camas suplementares`}`);
  if (bebes(g)) extras.push(`${bebes(g) === 1 ? "berço" : `${bebes(g)} berços`}`);
  const animal = animalDoPedido(p);
  const linha = (html: string, cor: string = C.cal, extra = "") => `<p style="margin:2px 0 0;font-family:${SANS};font-size:15px;line-height:1.5;color:${cor};${extra}">${html}</p>`;
  return (
    `<p style="margin:0;font-family:${SERIFA};font-size:19px;line-height:1.3;color:${C.cal};">${esc(descreverPedido(p))}</p>` +
    linha(esc(descreverGrupo(g))) +
    linha(esc(extras.join(" · ")), C.valeClaro) +
    (animal === "pequeno" ? linha("Animal até 8 kg (gratuito)", C.rosa) : "") +
    (animal === "grande" ? linha("Animal com mais de 8 kg · a confirmar", C.rosa, "font-weight:600;") : "")
  );
}

/** O bilhete da estadia: foto (opcional), chegada · noites · saída, e o que se pediu. */
export function bilhete(p: PedidoReserva, { titulo = "A sua estadia na Quinta", foto = true, extra = "", margem = "32px 0 0" }: { titulo?: string; foto?: boolean; extra?: string; margem?: string } = {}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${margem};">
${foto ? `<tr><td colspan="3" style="padding:0;line-height:0;font-size:0;"><img src="cid:${CID_FOTO}" width="520" alt="${esc(p.casaInteira ? "A casa" : descreverPedido(p))}" style="display:block;width:100%;max-width:520px;height:auto;border:0;"></td></tr>` : ""}
<tr><td colspan="3" class="bg-vale" style="padding:20px 24px 0;background:${C.vale};border-top:3px solid ${C.caixilho};">
  <p style="margin:0;font-family:${SERIFA};font-size:21px;color:${C.cal};">${titulo}</p>
</td></tr>
<tr>
  ${bilheteLado("Chegada", p.estadia.chegada, "desde as 15h", "left")}
  <td class="bg-vale" width="16%" align="center" valign="middle" style="padding:22px 0;background:${C.vale};border-left:1px dashed #6f7a66;border-right:1px dashed #6f7a66;">
    <p style="margin:0;font-family:${SERIFA};font-size:30px;line-height:1;color:${C.rosa};">${p.estadia.noites}</p>
    <p style="margin:4px 0 0;font-family:${SANS};font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${C.valeClaro};">${p.estadia.noites === 1 ? "noite" : "noites"}</p>
  </td>
  ${bilheteLado("Saída", p.estadia.saida, "até às 11h", "right")}
</tr>
<tr><td colspan="3" class="bg-vale" style="padding:14px 24px 20px;background:${C.vale};border-top:1px solid #45503f;">
  ${resumoBilhete(p)}
  ${extra}
</td></tr>
</table>`;
}

/** Uma linha de preço dentro do bilhete (nas propostas). */
export const precoNoBilhete = (p: PedidoReserva) =>
  `<p style="margin:8px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.valeClaro};">Total ${p.total !== null ? euros(p.total) : "a indicar"} · sinal de ${pct}: <strong style="color:${C.cal};font-weight:600;">${valorSinal(p)}</strong> · restante ${p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"} ${esc(p.restante.quando)}</p>`;

/** Os contactos do hóspede, à mão (para os emails da casa). */
export function hospede(p: PedidoReserva) {
  const h = p.hospede;
  const tel = h.telefone.replace(/[^\d+]/g, "");
  return cartao({
    rotulo: "O hóspede",
    sub: `<span style="font-family:${SERIFA};font-size:22px;">${esc(h.nome)}</span>`,
    linhas:
      linha("Telemóvel", `<a class="t-verm" href="tel:${esc(tel)}" style="color:${C.caixilho};text-decoration:none;">${esc(h.telefone)}</a>`, true) +
      linha("Email", `<a class="t-verm" href="mailto:${esc(h.email)}" style="color:${C.caixilho};">${esc(h.email)}</a>`) +
      linha("Pagamento", esc(formaPagamento(p))) +
      (animalDoPedido(p) === "pequeno" ? linha("Animal", "Até 8 kg (gratuito)") : "") +
      (animalDoPedido(p) === "grande" ? linha("Animal", `<span class="t-verm" style="color:${C.caixilho};">Mais de 8 kg · a decidir</span>`) : "") +
      (h.mensagem ? linha("Mensagem", `<span style="font-weight:normal;">${esc(h.mensagem).replace(/\n/g, "<br>")}</span>`) : ""),
    fim: pequeno("Para falar com o hóspede, basta responder a este email.", "0"),
    margem: "24px 0 0",
  });
}

/** As contas linha a linha, a política e a referência, em pequeno. */
export function detalhes(p: PedidoReserva) {
  const contas: [string, string][] = [];
  if (p.casaInteira) contas.push(["A casa inteira", p.casaInteira.subtotal !== null ? euros(p.casaInteira.subtotal) : "a indicar"]);
  for (const l of p.quartos) {
    const preco = l.precosPorNoite[0]?.preco;
    contas.push([`${l.quantidade > 1 ? `${l.quantidade} × ` : ""}${l.nome} · ${noites(p.estadia.noites)}${preco ? ` × ${euros(preco)}` : ""}`, euros(l.subtotal)]);
  }
  contas.push([
    p.pequenoAlmoco.incluido ? `Pequeno-almoço · ${adultosTxt(p.pequenoAlmoco.pessoas ?? p.pessoas)} × ${noites(p.estadia.noites)} × ${euros(p.pequenoAlmoco.porPessoaNoite)}` : "Pequeno-almoço",
    p.pequenoAlmoco.incluido ? euros(p.pequenoAlmoco.subtotal) : "não incluído",
  ]);
  if (p.camaSuplementar && !p.camaSuplementar.incluidaNaCasa) {
    const c = p.camaSuplementar;
    contas.push([
      `Cama suplementar · ${c.criancas} ${c.criancas === 1 ? "criança" : "crianças"} (3–10) × ${noites(p.estadia.noites)} × ${euros(c.porNoite)} · com pequeno-almoço`,
      euros(c.subtotal),
    ]);
  }
  contas.push(["Total da estadia", p.total !== null ? euros(p.total) : "a indicar"]);
  contas.push([`Sinal de ${SINAL_PERCENTAGEM} %`, p.sinal.valor !== null ? euros(p.sinal.valor) : "a indicar"]);
  contas.push([`Restante (${p.restante.quando})`, p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"]);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="b-linha" style="margin:34px 0 0;border-top:1px solid ${C.linha};">
<tr><td colspan="2" class="bg-papel t-claro" style="padding:16px 0 6px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.claro};background:${C.papel};">As contas</td></tr>
${contas
  .map(([a, b], i) => {
    const forte = i >= contas.length - 3;
    const cls = forte ? "t-suave" : "t-claro";
    const cor = forte ? C.suave : C.claro;
    return `<tr><td class="bg-papel ${cls}" style="padding:3px 12px 3px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${cor};background:${C.papel};">${esc(a)}</td>
<td align="right" class="bg-papel ${cls}" style="padding:3px 0;font-family:${SANS};font-size:12px;color:${cor};white-space:nowrap;background:${C.papel};">${esc(b)}</td></tr>`;
  })
  .join("\n")}
<tr><td colspan="2" class="bg-papel" style="padding:12px 0 0;background:${C.papel};">
${politica()}
${pequeno(`Referência do pedido: ${esc(p.referencia ?? "—")} · ${esc(dataCurta(p.estadia.chegada))} → ${esc(dataCurta(p.estadia.saida))} · em nome de ${esc(p.hospede.nome)}`)}
</td></tr>
</table>`;
}

export const assinatura = () =>
  paragrafo(`Alguma dúvida? Responda a este email ou escreva-nos pelo ${link(contactos.whatsapp, "WhatsApp")}.`, "28px 0 0") +
  `<p class="t-xisto" style="margin:14px 0 0;font-family:${SERIFA};font-size:18px;color:${C.xisto};">Até breve,<br>Quinta de Canhões</p>`;

/* ------------------------------------------------------------------ */
/* A moldura                                                           */
/* ------------------------------------------------------------------ */

export function montar({
  assunto,
  previa,
  rotulo,
  frase,
  corpo,
  texto,
  foto,
}: {
  assunto: string;
  /** O texto que o Gmail mostra ao lado do assunto. */
  previa: string;
  rotulo: string;
  frase: string;
  corpo: string;
  texto: string;
  /** O pedido cuja foto vai no bilhete (se o corpo tiver um bilhete com foto). */
  foto?: PedidoReserva;
}): SemDestino {
  const html = `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(assunto)}</title>
<style>${ESTILO}</style></head>
<body class="body bg-cal" style="margin:0;padding:0;background:${C.cal};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previa}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-cal" style="background:${C.cal};">
<tr><td align="center" class="bg-cal" style="padding:24px 10px 32px;background:${C.cal};">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
  <tr><td class="moldura bg-papel" style="background:${C.papel};padding:36px 40px 34px;border-top:4px solid ${C.caixilho};">
    <img class="logo-escuro" src="cid:${CID_LOGO}" width="${LOGO_EMAIL.largura}" height="${LOGO_EMAIL.altura}" alt="Quinta de Canhões" style="display:block;width:${LOGO_EMAIL.largura}px;height:${LOGO_EMAIL.altura}px;border:0;">
    <!--[if !mso]><!-->
    <img class="logo-claro" src="cid:${CID_LOGO_CLARO}" width="${LOGO_EMAIL.largura}" height="${LOGO_EMAIL.altura}" alt="Quinta de Canhões" style="display:none;max-height:0;overflow:hidden;width:${LOGO_EMAIL.largura}px;height:${LOGO_EMAIL.altura}px;border:0;">
    <div class="logo-texto t-xisto" style="display:none;max-height:0;overflow:hidden;font-family:${SERIFA};font-weight:bold;font-size:31px;line-height:1;letter-spacing:-0.6px;color:${C.xisto};">Quinta de<br>Canhões</div>
    <!--<![endif]-->
    ${etiqueta(rotulo, "34px 0 0")}
    <h1 class="frase t-verm" style="margin:10px 0 0;font-family:${SERIFA};font-weight:normal;font-size:36px;line-height:1.1;color:${C.caixilho};">${frase}</h1>
    ${corpo}
  </td></tr>
  <tr><td class="bg-cal" style="padding:18px 6px 0;background:${C.cal};">
    ${pequeno(`Quinta de Canhões · ${esc(contactos.morada.rua)}, ${esc(contactos.morada.localidade)}, ${esc(contactos.morada.codigo)}<br>
    <a class="t-claro" href="${esc(contactos.telemovel.href)}" style="color:${C.claro};">${esc(contactos.telemovel.texto)}</a> · <a class="t-claro" href="mailto:${esc(contactos.email.texto)}" style="color:${C.claro};">${esc(contactos.email.texto)}</a> · Registo Nacional de Turismo ${esc(contactos.rnet)}<br>
    <a class="t-claro" href="${esc(config.siteUrl)}/privacidade" style="color:${C.claro};">Política de privacidade</a>`)}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const comFoto = foto && html.includes(`cid:${CID_FOTO}`);
  const fotoBase64 = foto ? (foto.casaInteira ? FOTOS_EMAIL.casa : FOTOS_EMAIL[foto.quartos[0]?.tipo ?? "duplo"]) : "";
  return {
    assunto,
    html,
    texto,
    anexos: [
      { nome: "quinta-de-canhoes.png", cid: CID_LOGO, tipo: "image/png", base64: LOGO_EMAIL.base64 },
      { nome: "quinta-de-canhoes-claro.png", cid: CID_LOGO_CLARO, tipo: "image/png", base64: LOGO_EMAIL.base64Claro },
      ...(comFoto ? [{ nome: "a-sua-estadia.jpg", cid: CID_FOTO, tipo: "image/jpeg", base64: fotoBase64 }] : []),
    ],
  };
}
