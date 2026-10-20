/*
  A configuração do circuito das reservas. Os segredos vêm do ambiente
  (.env.local em casa, variáveis do site no Netlify); ver .env.example.
  Só se usa do lado do servidor.
*/

const env = (nome: string) => process.env[nome]?.trim() || undefined;

export const config = {
  /* Ordem: Gmail (se houver GMAIL_UTILIZADOR e GMAIL_PASSE_APP) → Resend
     (RESEND_API_KEY) → pré-visualização em .emails/. */
  gmailUtilizador: env("GMAIL_UTILIZADOR"),
  /** Palavra-passe de aplicação da conta Google (16 letras; os espaços não contam). */
  gmailPasse: env("GMAIL_PASSE_APP")?.replace(/\s+/g, ""),
  /** Chave da API do Resend. */
  resendChave: env("RESEND_API_KEY"),
  remetente: env("EMAIL_REMETENTE") ?? "Quinta de Canhões <onboarding@resend.dev>",
  /** Para onde vão os emails da casa. Produção (Netlify): casadecanhoes@gmail.com.
      Por defeito o do Diogo, para os testes nunca chegarem à Teresa. */
  emailCasa: env("EMAIL_CASA") ?? "diogocovelo2005@gmail.com",
  /** Quem é avisado quando um envio falha. */
  emailAlertas: env("EMAIL_ALERTAS") ?? "diogocovelo2005@gmail.com",
  /** Prefixo opcional nos assuntos (ex.: «[Teste]»). */
  prefixoAssunto: env("EMAIL_PREFIXO_ASSUNTO"),
  siteUrl: (env("SITE_URL") ?? env("URL") ?? "http://localhost:4160").replace(/\/$/, ""),
  /** Segredo das assinaturas. Em desenvolvimento há um de recurso; em produção é obrigatório. */
  segredo: env("SEGREDO_RESERVAS"),
};

export function segredo(): string {
  if (config.segredo && config.segredo.length >= 32) return config.segredo;
  if (process.env.NODE_ENV === "production" && (config.resendChave || config.gmailPasse)) {
    throw new Error("Falta SEGREDO_RESERVAS (pelo menos 32 caracteres).");
  }
  return "segredo-de-desenvolvimento-nao-usar-em-producao-0000";
}

/* ------------------------------------------------------------------ */
/* Pagamento do sinal: vem do ambiente (PAGAMENTO_*).                  */
/* ------------------------------------------------------------------ */

export const PAGAMENTO = {
  /** IBAN da casa. Vazio = o email diz que o enviamos à parte. */
  iban: env("PAGAMENTO_IBAN") ?? "",
  /** Titular da conta. Vazio = a linha não aparece. */
  titular: env("PAGAMENTO_TITULAR") ?? "",
  /** O MB WAY da casa (o número que a Teresa deu, 2026-10-20). */
  mbway: env("PAGAMENTO_MBWAY") ?? "964 506 038",
};

/** Horas que o hóspede tem para pagar o sinal depois da confirmação. POR CONFIRMAR com a Teresa. */
export const PRAZO_SINAL_HORAS = 48;

/** Quanto tempo valem os links dos emails. */
export const VALIDADE_LINKS_DIAS = 60;

/** Tempo mínimo, em segundos, entre abrir a página e enviar o pedido (anti-spam). */
export const TEMPO_MINIMO_SEGUNDOS = 4;
