/*
  O texto livre de uma oferta («Garrafa de vinho do Dão à chegada»), limpo
  para entrar direto no site, seja o que for que se escreva.

  Determinístico, sem serviços externos; corre igual no browser (pré-visualização
  ao vivo no editor) e no servidor (a fonte da verdade, que nunca confia no
  texto do browser). O resultado é texto simples: no ecrã mostra-se sempre
  escapado (React) e nos emails passa por esc().

  Por ordem:
    1. HTML fora (com o conteúdo de <script>/<style>), entidades decifradas
       e os < > que sobrarem apagados.
    2. Links, emails e telefones fora.
    3. Emojis, caracteres invisíveis e de controlo fora; depois, só ficam
       letras (com acentos e ç), algarismos, espaço e a pontuação comum.
    4. Espaços e quebras de linha juntos num só espaço.
    5. Pontuação repetida passa a um só sinal («!!!» → «!»); reticências saem.
    6. Aspas à volta do texto todo, prefixos redundantes («Oferta:»,
       «Promoção -», «Grátis!») e pontuação solta no início e no fim fora
       (incluindo o ponto final).
    7. TUDO EM MAIÚSCULAS (a maior parte do texto) passa a minúsculas; a primeira letra fica
       maiúscula e o resto como foi escrito.
    8. Recusa o vazio, o que não tem palavras e o que passa do limite (não
       corta em silêncio: diz quantos caracteres tem).
*/

export const OFERTA_MAX = 70;

export type OfertaLimpa = { texto: string; erro: string | null };

const ENTIDADES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»", euro: "€", ordf: "ª", ordm: "º" };

function decifrarEntidades(s: string) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 31 && n < 0x110000 ? String.fromCodePoint(n) : " ";
    }
    return ENTIDADES[e.toLowerCase()] ?? " ";
  });
}

/** Palavras que, no início e seguidas de pontuação, só repetem o rótulo «Oferta» do site. */
const PREFIXOS = /^(?:ofertas?|promo(?:ç|c)(?:ão|ao|ões|oes)|promo|gr(?:á|a)tis|brindes?|b(?:ó|o)nus|presentes?|novidade|especial|surpresa)\s*[:\-–—!.|»>]+\s*/i;

/** Sinais que se aceitam dentro do texto (o resto sai). */
const PERMITIDOS = /[^\p{L}\p{M}\p{N} .,;:!?'"«»“”‘’()/&%+€ªº\-–—]/gu;

export function normalizarOferta(entrada: unknown, max = OFERTA_MAX): OfertaLimpa {
  let s = typeof entrada === "string" ? entrada : typeof entrada === "number" ? String(entrada) : "";
  s = s.slice(0, 5000).normalize("NFC");

  // 1. HTML
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
  s = s.replace(/<[^>]*>/g, " ");
  s = decifrarEntidades(s);
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
  s = s.replace(/<[^>]*>/g, " ").replace(/[<>]/g, " ");

  // 2. Links, emails, telefones
  s = s.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, " ");
  s = s.replace(/\b(?:https?:\/\/|ftp:\/\/|www\.)\S+/gi, " ");
  s = s.replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:com|pt|net|org|eu|io|info|biz|co|me|app|site|online|br|es|fr|uk)\b(?:\/\S*)?/gi, " ");
  s = s.replace(/(?:\+|00)?\d[\d\s().-]{6,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? " " : m));

  // 3. Emojis, invisíveis, controlo; depois a lista do que se aceita
  s = s.replace(/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u20E3\uFE0E\uFE0F]/gu, " ");
  s = s.replace(/[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFEFF]/g, "");
  s = s.replace(/\p{Cc}/gu, " ");
  s = s.replace(/[`´]/g, "'").replace(/[*_#~^=|\\[\]{}<>@$]/g, " ");
  s = s.replace(PERMITIDOS, " ");

  // 4. Espaços
  s = s.replace(/\s+/g, " ").trim();

  // 5. Pontuação repetida
  // Reticências: a meio são uma pausa (espaço); no fim saem com o resto.
  s = s.replace(/\.{2,}|…/g, " ").replace(/\s+/g, " ").trim();
  s = s.replace(/([!?.,;:])(?:\s*[!?.,;:])+/g, "$1");
  s = s.replace(/([-–—])(?:\s*[-–—])+/g, "$1");
  s = s.replace(/\s+([.,;:!?])/g, "$1");

  // 6. Aspas à volta, prefixos, pontuação solta nas pontas
  for (let i = 0; i < 4; i++) {
    const antes = s;
    s = s.replace(/^["'«“‘](.*)["'»”’]$/u, "$1").trim();
    s = s.replace(PREFIXOS, "").trim();
    s = s.replace(/^[\s.,;:!?\-–—/&%+)]+/u, "").trim();
    s = s.replace(/[\s.,;:!?\-–—/&+(]+$/u, "").trim();
    if (s === antes) break;
  }
  // Uma palavra de prefixo sozinha («Grátis!») não é uma oferta.
  if (/^(?:ofertas?|promo(?:ç|c)(?:ão|ao)|gr(?:á|a)tis|brindes?|b(?:ó|o)nus|presentes?)$/i.test(s)) s = "";
  // Aspas desemparelhadas soltas
  if ((s.match(/"/g) ?? []).length % 2) s = s.replace(/"/g, "");

  // 7. Maiúsculas
  // Gritado: se a maior parte das letras está em palavras TODAS EM MAIÚSCULAS,
  // essas palavras passam a minúsculas (uma sigla solta, como «SPA», fica).
  const gritadas = (w: string) => /\p{Lu}/u.test(w) && !/\p{Ll}/u.test(w) && (w.match(/\p{L}/gu) ?? []).length >= 2;
  const letras = (s.match(/\p{L}/gu) ?? []).length;
  const letrasGritadas = s.split(" ").filter(gritadas).reduce((n, w) => n + (w.match(/\p{L}/gu) ?? []).length, 0);
  if (letras >= 3 && letrasGritadas / letras >= 0.6) s = s.split(" ").map((w) => (/\p{Ll}/u.test(w) ? w : w.toLocaleLowerCase("pt-PT"))).join(" ");
  s = s.replace(/^(\P{L}*)(\p{L})/u, (_m, pre: string, l: string) => (/\d/.test(pre) ? pre + l : pre + l.toLocaleUpperCase("pt-PT")));

  // 8. Validação
  if (!s) return { texto: "", erro: "Escreva o que oferece." };
  if ((s.match(/\p{L}/gu) ?? []).length < 2) return { texto: s, erro: "Escreva o que oferece em palavras." };
  const n = [...s].length;
  if (n > max) return { texto: s, erro: `O texto tem ${n} caracteres; o máximo é ${max}. Encurte-o um pouco.` };
  return { texto: s, erro: null };
}

/**
  A oferta a meio de uma frase («oferecemos garrafa de vinho…»): a primeira letra
  passa a minúscula. Fica como está se a primeira palavra for uma sigla (SPA) ou
  tiver uma maiúscula interna (WiFi, iPad), e se a oferta começar por número.
*/
export function ofertaNaFrase(texto: string): string {
  const m = /^(\P{L}*)(\p{L}[\p{L}\p{M}]*)/u.exec(texto);
  if (!m || /\d/.test(m[1])) return texto;
  const palavra = m[2];
  if (!/^\p{Lu}/u.test(palavra)) return texto;
  if (/\p{Lu}/u.test(palavra.slice(1))) return texto;
  return m[1] + palavra[0].toLocaleLowerCase("pt-PT") + texto.slice(m[1].length + 1);
}

/** Várias ofertas numa frase, «a, b e c»: cada uma a meio de frase. */
export function listaDeOfertas(textos: string[]): string {
  const t = textos.map(ofertaNaFrase);
  return t.length <= 1 ? (t[0] ?? "") : `${t.slice(0, -1).join(", ")} e ${t[t.length - 1]}`;
}

/** Conta como o editor mostra (caracteres visíveis depois de limpo). */
export const tamanhoOferta = (texto: string) => [...texto].length;

/* ------------------------------------------------------------------ */
/* O nome da promoção («Magusto», «Páscoa na quinta»)                  */
/* ------------------------------------------------------------------ */

export const NOME_MAX = 40;

/**
  O nome passa pela mesma limpeza das ofertas, com um limite mais curto.
  É opcional: vazio não é erro (o site usa «Promoção»).
*/
export function normalizarNome(entrada: unknown): OfertaLimpa {
  const r = normalizarOferta(entrada, NOME_MAX);
  if (!r.texto) return { texto: "", erro: null };
  if (!r.erro) return r;
  if (/palavras/.test(r.erro)) return { texto: r.texto, erro: "O nome precisa de ter palavras." };
  return { texto: r.texto, erro: `O nome tem ${[...r.texto].length} caracteres; o máximo é ${NOME_MAX}. Encurte-o um pouco.` };
}

/* ------------------------------------------------------------------ */
/* A frase da promoção (o convite que acompanha o nome)                */
/* ------------------------------------------------------------------ */

export const FRASE_MAX = 140;

/** A frase passa pela mesma limpeza, até 140 caracteres. Opcional: vazia não é erro. */
export function normalizarFrase(entrada: unknown): OfertaLimpa {
  const r = normalizarOferta(entrada, FRASE_MAX);
  if (!r.texto) return { texto: "", erro: null };
  if (!r.erro) return r;
  if (/palavras/.test(r.erro)) return { texto: r.texto, erro: "A frase precisa de ter palavras." };
  return { texto: r.texto, erro: `A frase tem ${[...r.texto].length} caracteres; o máximo é ${FRASE_MAX}. Encurte-a um pouco.` };
}

/**
  Quando se escolhe uma sugestão de nome, que frase fica? A primeira da sugestão
  só se o campo estiver vazio ou a frase atual for uma das sugeridas (não escrita
  à mão); senão, a frase de quem escreveu fica. `null`: deixar como está.
*/
export function fraseAoEscolherSugestao(atual: string, sugeridas: string[], frasesDaNova: string[]): string | null {
  const a = atual.trim();
  if (a && !sugeridas.includes(a)) return null;
  return frasesDaNova[0] ?? null;
}
