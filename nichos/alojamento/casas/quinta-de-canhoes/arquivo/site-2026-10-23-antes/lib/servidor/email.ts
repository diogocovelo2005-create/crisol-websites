import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { config } from "@/lib/servidor/config";
import { comTempo, passo } from "@/lib/servidor/diagnostico";

export type Email = {
  para: string;
  assunto: string;
  html: string;
  texto: string;
  responderA?: string;
  /** Imagens anexadas inline: no HTML usam-se como src="cid:<cid>". */
  anexos?: { nome: string; cid: string; tipo: string; base64: string }[];
};

export type ResultadoEmail = { ok: true; id: string } | { ok: false; erro: string };

/** Pasta da pré-visualização (fora do git). */
export const PASTA_EMAILS = path.join(process.cwd(), ".emails");

/** Por onde saem os emails, conforme as variáveis que existem. */
export const meioDeEnvio = () =>
  config.gmailUtilizador && config.gmailPasse ? "gmail" : config.resendChave ? "resend" : "pre-visualizacao";

/*
  Envia pelo Gmail (SMTP, palavra-passe de aplicação) se houver GMAIL_*;
  senão pela API HTTP do Resend (sem SDK); sem nenhum dos dois não envia:
  grava o email em .emails/ e diz onde, para se testar o circuito todo
  sem conta (ver /dev/emails).
*/
export async function enviarEmail(original: Email): Promise<ResultadoEmail> {
  const t0 = Date.now();
  passo("email: antes", { meio: meioDeEnvio(), assunto: original.assunto.slice(0, 80), gmail: { utilizador: !!config.gmailUtilizador, passe: !!config.gmailPasse }, resend: !!config.resendChave });
  const r = await enviarEmailSemRegisto(original);
  passo("email: depois", { ms: Date.now() - t0, ok: r.ok, ...(r.ok ? {} : { erro: r.erro }) });
  return r;
}

async function enviarEmailSemRegisto(original: Email): Promise<ResultadoEmail> {
  // EMAIL_PREFIXO_ASSUNTO (ex.: «[Teste]») marca os emails de um teste.
  const email = config.prefixoAssunto ? { ...original, assunto: `${config.prefixoAssunto} ${original.assunto}` } : original;
  const meio = meioDeEnvio();
  // Só para testes locais: guarda também uma cópia em .emails/ do que sai a sério.
  if (meio !== "pre-visualizacao" && process.env.EMAIL_COPIA_LOCAL === "1") await preVisualizar(email, true);
  if (meio === "gmail") return enviarGmail(email);
  if (meio === "pre-visualizacao") return preVisualizar(email);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendChave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.remetente,
        to: [email.para],
        subject: email.assunto,
        html: email.html,
        text: email.texto,
        ...(email.responderA ? { reply_to: email.responderA } : {}),
        ...(email.anexos?.length
          ? { attachments: email.anexos.map((a) => ({ filename: a.nome, content: a.base64, content_type: a.tipo, content_id: a.cid })) }
          : {}),
      }),
    });
    const corpo = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, erro: `Resend ${r.status}: ${corpo?.message ?? "erro desconhecido"}` };
    return { ok: true, id: corpo.id ?? "" };
  } catch (e) {
    return { ok: false, erro: `Resend inacessível: ${(e as Error).message}` };
  }
}

/* Gmail por SMTP (smtp.gmail.com:465, TLS). O Gmail reescreve qualquer
   outro remetente, por isso o From é sempre a própria conta. */
async function enviarGmail(email: Email): Promise<ResultadoEmail> {
  const transporte = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.gmailUtilizador, pass: config.gmailPasse },
    // Curtos de propósito: a função do Netlify corta aos ~30 s; um SMTP preso tem de
    // falhar a tempo de o pedido responder com o aviso do WhatsApp (e de sair o alerta).
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
  });
  try {
    const info = await transporte.sendMail({
      from: { name: "Quinta de Canhões", address: config.gmailUtilizador! },
      to: email.para,
      subject: email.assunto,
      html: email.html,
      text: email.texto,
      ...(email.responderA ? { replyTo: email.responderA } : {}),
      attachments: email.anexos?.map((a) => ({
        filename: a.nome,
        content: Buffer.from(a.base64, "base64"),
        contentType: a.tipo,
        cid: a.cid,
        contentDisposition: "inline" as const,
      })),
    });
    return { ok: true, id: info.messageId ?? "" };
  } catch (e) {
    const err = e as Error & { code?: string; responseCode?: number };
    if (err.code === "EAUTH" || err.responseCode === 535) {
      console.error("[reserva] autenticação Gmail falhou: verifique GMAIL_UTILIZADOR e GMAIL_PASSE_APP (tem de ser uma palavra-passe de aplicação, com a verificação em dois passos ligada).");
      return { ok: false, erro: "Gmail: autenticação falhou (EAUTH)" };
    }
    console.error(`[reserva] envio pelo Gmail falhou (${err.code ?? "sem código"}): ${err.message}`);
    return { ok: false, erro: `Gmail: ${err.code ?? ""} ${err.message}`.trim() };
  } finally {
    transporte.close();
  }
}

async function preVisualizar(email: Email, copia = false): Promise<ResultadoEmail> {
  try {
    await mkdir(PASTA_EMAILS, { recursive: true });
    const carimbo = new Date().toISOString().replace(/[:.]/g, "-");
    const nome = `${carimbo}-${email.assunto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
    const cabecalho = `<!-- para: ${email.para} | responder a: ${email.responderA ?? "-"} | assunto: ${email.assunto} -->\n`;
    // No browser não há cid: as imagens inline passam a data URI.
    const html = (email.anexos ?? []).reduce((h, a) => h.split(`cid:${a.cid}`).join(`data:${a.tipo};base64,${a.base64}`), email.html);
    await writeFile(path.join(PASTA_EMAILS, `${nome}.html`), cabecalho + html, "utf8");
    await writeFile(path.join(PASTA_EMAILS, `${nome}.txt`), `Para: ${email.para}\nResponder a: ${email.responderA ?? "-"}\nAssunto: ${email.assunto}\n\n${email.texto}`, "utf8");
    console.info(
      copia
        ? `[reserva] cópia local em .emails/${nome}.html (o email segue a sério)`
        : `[reserva] email não enviado (sem envio configurado), gravado em .emails/${nome}.html → ${email.para}: ${email.assunto}`,
    );
    return { ok: true, id: nome };
  } catch (e) {
    return { ok: false, erro: `Sem RESEND_API_KEY e sem onde gravar a pré-visualização: ${(e as Error).message}` };
  }
}

/** Tenta avisar o Diogo de que um envio falhou. Nunca lança. */
export async function avisarFalha(contexto: string, detalhe: string, pedido?: import("@/lib/reserva").PedidoReserva) {
  console.error(`[reserva] ${contexto}: ${detalhe}`);
  try {
    const { alertaFalha } = await import("@/lib/servidor/emails");
    // Com tempo-limite curto: se o problema for o próprio email, o alerta não pode prender o pedido.
    await comTempo("alerta de falha", enviarEmail({ ...alertaFalha(contexto, detalhe, pedido), para: config.emailAlertas }), 6000);
  } catch {}
}
