/**
 * places.js — cliente da Places API (New).
 *
 * A regra que este ficheiro existe para impor: a pesquisa e gratuita, os
 * detalhes e que custam. Ver references/places-api.md.
 */

const BASE = "https://places.googleapis.com/v1";

/* ───────────────────────────── field masks ──────────────────────────────── */

/**
 * Os unicos campos que mantem uma chamada de PESQUISA no SKU
 * "Essentials (IDs Only)", que e gratuito e ilimitado.
 *
 * Acrescentar qualquer outro — ate places.location ou places.displayName —
 * salta para o SKU Pro, $32 por 1000 chamadas. Numa grelha com 15 000 chamadas
 * isso e a diferenca entre 0 e 480 dolares, e a resposta da API e identica:
 * 200 OK, sem aviso nenhum. So a factura muda.
 */
const CAMPOS_PESQUISA_GRATIS = new Set(["places.id", "places.name", "nextPageToken"]);

export const MASK_PESQUISA = "places.id";
export const MASK_PESQUISA_PAGINADA = "places.id,nextPageToken";

/**
 * Mask barato de Place Details: SKU **Essentials**, $5/1000, com 10 000
 * chamadas gratuitas por mes — dez vezes o limite do Enterprise.
 *
 * Traz exactamente os dois campos precisos para decidir a quem vale a pena
 * pagar o mask caro: `location` diz se o lugar cai dentro da regiao, e `types`
 * diz o que a Google acha que ele e. Nenhum dos dois existe na fase de
 * pesquisa a preco zero.
 */
export const MASK_DETALHES_ESSENTIALS = "id,location,types";

/** Tudo o que interessa de um lugar. E SKU Enterprise por causa do
 *  websiteUri, do rating e do userRatingCount — os restantes campos vem
 *  incluidos no mesmo preco, por isso nao ha razao para os poupar. */
export const MASK_DETALHES = [
  "id", "displayName", "formattedAddress", "location", "types", "primaryType",
  "businessStatus", "googleMapsUri", "websiteUri", "nationalPhoneNumber",
  "rating", "userRatingCount",
].join(",");

/** Campos que obrigam ao SKU Enterprise. Serve para saber a que tier uma
 *  chamada pertence sem quem chama ter de o dizer. */
const CAMPOS_ENTERPRISE = new Set([
  "websiteUri", "rating", "userRatingCount", "nationalPhoneNumber",
  "internationalPhoneNumber", "priceLevel", "priceRange",
  "regularOpeningHours", "currentOpeningHours",
]);

export function tierDoMask(mask) {
  const campos = mask.split(",").map((s) => s.trim());
  return campos.some((c) => CAMPOS_ENTERPRISE.has(c)) ? "enterprise" : "essentials";
}

export function validarMaskPesquisa(mask) {
  const caros = mask.split(",").map((s) => s.trim()).filter(Boolean)
    .filter((c) => !CAMPOS_PESQUISA_GRATIS.has(c));
  if (caros.length) {
    throw new Error(
      `Mask de pesquisa com campos pagos: ${caros.join(", ")}.\n` +
      `So ${[...CAMPOS_PESQUISA_GRATIS].join(", ")} sao gratuitos. ` +
      `Qualquer outro poe TODA a grelha no SKU Pro ($32/1000) sem dar erro.`
    );
  }
  if (!mask.split(",").some((c) => c.trim().startsWith("places."))) {
    throw new Error(`Mask de pesquisa precisa do prefixo "places.": ${mask}`);
  }
}

export function validarMaskDetalhes(mask) {
  const prefixados = mask.split(",").map((s) => s.trim())
    .filter((c) => c.startsWith("places."));
  if (prefixados.length) {
    throw new Error(
      `Mask de Place Details NAO leva prefixo "places.": ${prefixados.join(", ")}.\n` +
      `A pesquisa usa "places.id"; os detalhes usam "id". Trocar da 400.`
    );
  }
}

/* ─────────────────────────────── contadores ─────────────────────────────── */

export const contadores = {
  nearby: 0, text: 0, paginas: 0,
  // Separados por SKU: tem precos e limites gratuitos diferentes ($5/1000 com
  // 10 000 gratis contra $20/1000 com 1000), e somá-los esconderia o que
  // interessa saber, que e quantas chamadas caras foram feitas.
  detalhes_essentials: 0, detalhes_enterprise: 0,
  retries: 0, falhas: 0,
};

/* ──────────────────────────── ritmo e backoff ───────────────────────────── */

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Limite de pedidos por minuto, por metodo, num projeto com faturacao.
 * Confirma o teu em Cloud Console > Google Maps Platform > Quotas.
 */
export const POR_MINUTO = Number(process.env.PLACES_POR_MINUTO ?? 550);

/**
 * Espaca os pedidos para nao passar a quota por minuto.
 *
 * Sem isto o cliente so REAGIA: com concorrencia 8 fazia ~1450 chamadas por
 * minuto contra um limite de 600, apanhava 429 constantemente, e gastava o
 * tempo todo em backoff. Numa corrida real no distrito de Viseu foram 139
 * retries e tres celulas perdidas — buracos de cobertura causados por nos
 * proprios, nao pela API.
 *
 * 550 e nao 600 pela mesma razao que o limiar de saturacao e 58 e nao 60: a
 * margem custa segundos, e o erro custa recall.
 */
let proximoLivre = 0;
async function aguardarVez() {
  const intervalo = 60000 / POR_MINUTO;
  const agora = Date.now();
  const quando = Math.max(agora, proximoLivre);
  proximoLivre = quando + intervalo;
  if (quando > agora) await dormir(quando - agora);
}

export class ErroPlaces extends Error {
  constructor(codigo, mensagem, esgotado) {
    super(mensagem);
    this.codigo = codigo;
    this.esgotado = esgotado; // true = falhou depois de todas as tentativas
  }
}

/**
 * Quota DIARIA esgotada. Distinta de um 429 normal porque nao adianta esperar:
 * a janela so reabre a meia-noite do Pacifico.
 *
 * Um projeto novo do Google Cloud vem com quotas por dia surpreendentemente
 * baixas — medido neste: 100 pedidos/dia de searchText. Fazer backoff de 1-2-4-8-16 s
 * em cada uma das milhares de chamadas restantes gastaria horas para nada,
 * e o relatorio final diria "celulas falhadas" em vez de dizer a verdade,
 * que e "a corrida parou a meio por falta de quota".
 */
export class ErroQuotaDiaria extends ErroPlaces {
  constructor(meta) {
    super(429, `Quota DIARIA esgotada: ${meta.quota_limit} = ${meta.quota_limit_value}/dia`, true);
    this.quotaDiaria = true;
    this.limite = meta.quota_limit;
    this.valor = meta.quota_limit_value;
  }
}

/**
 * Backoff exponencial 1-2-4-8-16 s em 429 e 5xx, e tambem em falhas de rede.
 * Ao fim das tentativas lanca com esgotado=true, para quem chama marcar a
 * celula como falhada e CONTINUAR — abortar a corrida inteira por causa de uma
 * celula perde tudo o que ja foi encontrado.
 *
 * Erros 4xx que nao 429 nao sao recuperaveis: um includedTypes invalido
 * devolve 400 vezes sem fim se se insistir.
 */
async function pedir(url, opcoes) {
  const esperas = [1000, 2000, 4000, 8000, 16000];
  for (let tentativa = 0; ; tentativa++) {
    await aguardarVez();
    let resposta = null, erroRede = null;
    try {
      resposta = await fetch(url, { ...opcoes, signal: AbortSignal.timeout(30000) });
    } catch (e) {
      erroRede = e;
    }

    if (resposta?.ok) return resposta.json();

    const codigo = resposta?.status ?? 0;
    // O corpo le-se uma vez so: a stream nao se relê.
    const j = resposta ? await resposta.json().catch(() => ({})) : {};

    if (codigo === 429) {
      const meta = j?.error?.details?.find((d) => d?.metadata)?.metadata;
      // quota_unit "1/d/{project}" = por dia; "1/min/{project}" = por minuto.
      // A primeira nao recupera com espera nenhuma que faca sentido aqui.
      if (meta?.quota_unit?.includes("/d/")) throw new ErroQuotaDiaria(meta);
    }

    const recuperavel = !resposta || codigo === 429 || codigo >= 500;
    if (!recuperavel) {
      throw new ErroPlaces(codigo, j?.error?.message ?? resposta.statusText, false);
    }
    if (tentativa >= esperas.length) {
      contadores.falhas++;
      throw new ErroPlaces(codigo, erroRede?.message ?? `HTTP ${codigo} apos ${esperas.length + 1} tentativas`, true);
    }
    contadores.retries++;
    await dormir(esperas[tentativa]);
  }
}

function cabecalhos(mask) {
  const chave = process.env.GOOGLE_MAPS_API_KEY;
  if (!chave) throw new Error("GOOGLE_MAPS_API_KEY em falta no .env.");
  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": chave,
    "X-Goog-FieldMask": mask,
  };
}

/* ────────────────────────────── searchNearby ────────────────────────────── */

export const TECTO_NEARBY = 20;

/**
 * O Nearby nao pagina: 20 e tecto absoluto. Se devolver exactamente 20, ficaram
 * empresas de fora e nao ha maneira nenhuma de saber quantas — a resposta e
 * indistinguivel de uma zona com exactamente 20. Por isso 20 significa sempre
 * "subdivide".
 */
export async function pesquisaNearby({ lat, lng, raio }, tipos, mask = MASK_PESQUISA) {
  validarMaskPesquisa(mask);
  const corpo = {
    includedTypes: tipos,
    maxResultCount: TECTO_NEARBY,
    locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: raio } },
    languageCode: "pt",
    regionCode: "PT",
  };
  contadores.nearby++;
  const j = await pedir(`${BASE}/places:searchNearby`, {
    method: "POST", headers: cabecalhos(mask), body: JSON.stringify(corpo),
  });
  // Zero resultados devolve {} e nao {"places": []}. Sem o ?? [], isto rebenta
  // com TypeError num 200 OK.
  const ids = (j.places ?? []).map((p) => p.id);
  return { ids, saturado: ids.length >= TECTO_NEARBY };
}

/* ─────────────────────────────── searchText ─────────────────────────────── */

export const MAX_PAGINAS_TEXT = 3;

/**
 * Limiar de saturacao do Text Search.
 *
 * O maximo teorico sao 60 (3 paginas x 20). Usa-se 58 e nao 60 porque a API
 * devolve por vezes paginas incompletas — 19 em vez de 20 — sem que isso
 * signifique que a lista acabou. Exigir 60 exactos deixaria passar celulas
 * saturadas; a margem de 2 custa umas subdivisoes a mais, que sao gratuitas.
 */
export const LIMIAR_SATURACAO_TEXT = 58;

export async function pesquisaText({ low, high }, termo, mask = MASK_PESQUISA_PAGINADA) {
  validarMaskPesquisa(mask);
  const base = {
    textQuery: termo,
    pageSize: 20,
    // RETANGULO e nao circulo: o locationRestriction do Text Search so aceita
    // viewport. O circulo existe apenas em locationBias, que e sugestao — e
    // uma sugestao deixa entrar empresas de outros distritos.
    locationRestriction: {
      rectangle: {
        low:  { latitude: low.lat,  longitude: low.lng },
        high: { latitude: high.lat, longitude: high.lng },
      },
    },
    languageCode: "pt",
    regionCode: "PT",
  };

  const ids = [];
  let token = null;
  let paginas = 0;

  do {
    const corpo = token ? { ...base, pageToken: token } : base;
    contadores.text++;
    const j = await pedir(`${BASE}/places:searchText`, {
      method: "POST", headers: cabecalhos(mask), body: JSON.stringify(corpo),
    });
    paginas++;
    contadores.paginas++;
    for (const p of j.places ?? []) ids.push(p.id);
    token = j.nextPageToken ?? null;
  } while (token && paginas < MAX_PAGINAS_TEXT);

  return { ids, paginas, saturado: ids.length >= LIMIAR_SATURACAO_TEXT };
}

/* ───────────────────────────── Place Details ────────────────────────────── */

/** A unica chamada que gera factura: SKU Enterprise, $20/1000, 1000 gratis/mes. */
export async function detalhes(placeId, mask = MASK_DETALHES) {
  validarMaskDetalhes(mask);
  contadores[tierDoMask(mask) === "enterprise" ? "detalhes_enterprise" : "detalhes_essentials"]++;
  return pedir(`${BASE}/places/${encodeURIComponent(placeId)}`, {
    method: "GET", headers: cabecalhos(mask),
  });
}

/* ─────────────────────────────── paralelismo ────────────────────────────── */

/**
 * Corre fn sobre itens com no maximo n em voo.
 * Nunca rejeita: cada resultado vem como {ok, valor} ou {ok:false, erro},
 * porque uma celula falhada nao pode derrubar as outras.
 */
export async function emParalelo(itens, n, fn, aoTerminar) {
  const resultados = new Array(itens.length);
  let proximo = 0;

  async function trabalhador() {
    for (;;) {
      const i = proximo++;
      if (i >= itens.length) return;
      try {
        resultados[i] = { ok: true, valor: await fn(itens[i], i) };
      } catch (e) {
        resultados[i] = { ok: false, erro: e };
      }
      if (aoTerminar) aoTerminar(resultados[i], i, itens.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(n, itens.length) }, trabalhador));
  return resultados;
}
