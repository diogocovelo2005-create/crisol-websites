/**
 * site.js — classificacao de um website a partir dos sinais recolhidos.
 *
 * Funcoes puras, sem Playwright e sem rede, para poderem ser testadas contra
 * casos construidos a mao. A parte que abre o browser vive no audit.js.
 */

/**
 * Anfitrioes que NAO sao um website proprio: perfis de rede social,
 * agregadores de links, paginas de marketplace e construtores com subdominio
 * gratuito.
 *
 * Uma empresa cujo "website" e uma pagina de Facebook e um lead melhor do que
 * uma sem nada: ja percebeu que precisa de presenca online e ja investiu
 * algum tempo nisso. Por isso tem nota 4 e nao 5.
 */
const ANFITRIOES_SOCIAIS = [
  "facebook.com", "fb.com", "fb.me", "m.facebook.com",
  "instagram.com", "linktr.ee", "linktree.com", "beacons.ai", "bio.link",
  "wa.me", "api.whatsapp.com", "t.me",
  "booking.com", "airbnb.com", "airbnb.pt", "tripadvisor.com", "tripadvisor.pt",
  "business.site", "wixsite.com", "blogspot.com", "blogspot.pt",
  "weebly.com", "sites.google.com", "wordpress.com", "webnode.pt", "webnode.com",
  "negocio.site", "my.canva.site",
];

export function anfitriaoDe(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return ""; }
}

export function ehSocial(url) {
  const h = anfitriaoDe(url);
  if (!h) return false;
  return ANFITRIOES_SOCIAIS.some((s) => h === s || h.endsWith("." + s));
}

/**
 * Dominio parqueado ou "em construcao".
 *
 * Estes respondem 200 com HTML valido, por isso nao aparecem como partidos —
 * mas nao sao um website. Contam como partidos para efeitos de nota, porque
 * para o dono da empresa o efeito e o mesmo: quem procura nao encontra nada.
 */
const PADROES_PARQUEADO = [
  /domain\s+(is\s+)?for\s+sale/i,
  /this\s+domain\s+(is\s+)?(for\s+sale|may\s+be\s+for\s+sale)/i,
  /buy\s+this\s+domain/i,
  /dominio\s+(a\s+venda|para\s+venda)/i,
  /em\s+constru[cç][aã]o/i,
  /under\s+construction/i,
  /coming\s+soon/i,
  /site\s+em\s+manuten[cç][aã]o/i,
  /parked\s+(free\s+)?(at|by|domain)/i,
  /default\s+web\s+site\s+page/i,
  /apache2?\s+(ubuntu\s+)?default\s+page/i,
  /welcome\s+to\s+nginx/i,
  /index\s+of\s+\//i,
];

export function ehParqueado({ texto = "", nLinks = 0 }) {
  const t = String(texto);
  if (PADROES_PARQUEADO.some((p) => p.test(t))) return true;
  // Pouco texto E poucos links: uma pagina real de uma empresa tem sempre
  // mais do que isto. Os dois criterios juntos, porque uma landing page
  // minimalista pode ter pouco texto mas tem menu, e um indice de directorio
  // tem muitos links mas nenhum texto.
  return t.trim().length < 500 && nLinks < 3;
}

/** Geradores que denunciam um site parado ha muito tempo. */
const GERADORES_OBSOLETOS = [
  /frontpage/i, /dreamweaver/i, /microsoft\s+word/i, /publisher/i, /iweb/i,
  /joomla!?\s*[123]\./i, /drupal\s*[67]/i, /wordpress\s*[1-4]\./i,
  /namo\s+webeditor/i, /netobjects/i, /adobe\s+golive/i, /mobirise/i,
];

export function geradorObsoleto(gen) {
  return !!gen && GERADORES_OBSOLETOS.some((p) => p.test(gen));
}

/**
 * Ano do rodape abaixo do qual o site conta como parado.
 *
 * Relativo e nao fixo: a especificacao dizia "< 2022", escrita em 2026, ou
 * seja quatro anos. Deixar 2022 em codigo faria a regra afrouxar sozinha um
 * ano por ano, sem ninguem dar por isso.
 */
export const ANOS_ATE_RODAPE_ANTIGO = 4;
export const ANOS_ATE_RODAPE_MORNO = 2;

export function anoLimiteRodape(agora = new Date()) {
  return agora.getFullYear() - ANOS_ATE_RODAPE_ANTIGO;
}

/* ─────────────────────────── falhas tecnicas ────────────────────────────── */

/**
 * As falhas graves. "grave" = um cliente ve isto no telemovel em cinco
 * segundos, ou o Google penaliza por isso.
 *
 * Nota sobre nulos: cada teste usa "=== false" ou "=== true" explicito, nunca
 * a negacao de um valor que pode ser null. Um sinal null significa "nao
 * consegui medir", nao "esta mal" — tratar as duas coisas como iguais
 * inventaria defeitos em paginas que nem chegaram a ser lidas.
 */
export function falhasGraves(s, agora = new Date()) {
  const f = [];
  if (s.has_https === false) f.push("sem https");
  if (s.has_viewport === false) f.push("sem viewport");
  if (s.overflow_x === true) f.push("overflow horizontal");
  if (s.footer_year != null && s.footer_year < anoLimiteRodape(agora)) {
    f.push(`rodape de ${s.footer_year}`);
  }
  if (geradorObsoleto(s.meta_generator)) f.push(`generator ${s.meta_generator}`);
  if (s.tem_form === false && s.tem_contacto === false) f.push("sem formulario nem contacto");
  if (s.tem_jsonld === false) f.push("sem JSON-LD");
  return f;
}

/** As tres que decidem entre nota 3 e nota 2. */
export function temFalhaTecnicaGrave(s) {
  return s.has_https === false || s.has_viewport === false || s.overflow_x === true;
}

/* ───────────────────────────── classificacao ────────────────────────────── */

export function classificar(s) {
  if (!s.website) return "none";
  if (ehSocial(s.website) || (s.final_url && ehSocial(s.final_url))) return "social_only";
  if (s.erro || s.http_status == null || s.http_status >= 400) return "broken";
  if (s.parqueado === true) return "broken";
  return falhasGraves(s).length >= 2 ? "legacy" : "modern";
}

/* ─────────────────────────────── nota ───────────────────────────────────── */

/**
 * Nota provisoria, em JS, para decidir se vale a pena tirar screenshot.
 *
 * TEM de dar o mesmo que o score.sql, e a armadilha esta nos nulos: em JS
 * `null < 2023` e **true**, em SQL `NULL < 2023` e **NULL**. Uma tradução
 * ingenua daria "antigo" a todas as paginas sem rodape datado, tirava
 * screenshots a mais, e a nota final vinda do SQL nao bateria certo com a
 * decisao ja tomada. Por isso footer_year null conta como "nao antigo" —
 * ver a mesma logica em score.sql.
 */
export function notaProvisoria(s, agora = new Date()) {
  if (!s.website) return 5;
  const estado = classificar(s);
  if (estado === "broken") return 5;
  if (estado === "social_only") return 4;
  if (estado === "legacy") return temFalhaTecnicaGrave(s) ? 3 : 2;
  // modern
  const mornoPorRodape =
    s.footer_year != null && s.footer_year < agora.getFullYear() - ANOS_ATE_RODAPE_MORNO;
  const comMargem =
    s.tem_jsonld !== true ||
    (s.tem_form !== true && s.tem_contacto !== true) ||
    mornoPorRodape;
  return comMargem ? 1 : 0;
}
