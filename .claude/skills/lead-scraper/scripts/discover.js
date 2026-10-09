#!/usr/bin/env node
/**
 * discover.js — descoberta de lugares para um nicho numa regiao.
 *
 *   node scripts/discover.js --nicho <slug> --grid grid/<regiao>.json
 *                            --keywords keywords/<slug>.json [--smoke-test]
 *                            [--conc 8] [--max-details N] [--sem-escrita]
 *
 * Duas fases de custo, nao negociavel:
 *
 *   A) pesquisa com mask "places.id"  — milhares de chamadas, SKU gratuito
 *   B) Place Details com mask completo — so depois do dedupe, uma chamada por
 *      lugar UNICO, SKU Enterprise a $20/1000
 *
 * Ha 5 a 15 chamadas de pesquisa por cada lugar unico. Trocar a ordem, ou
 * pedir websiteUri na pesquisa, multiplica a factura sem mudar uma virgula da
 * resposta. O guard esta em lib/places.js.
 */

import "./lib/arranque.js";  // tem de ser o primeiro: faz chdir e so depois le o .env
import fs from "node:fs";
import path from "node:path";
import {
  dentroDoPoligono, subdividirCirculo, subdividirRetangulo, distanciaM, areaKm2, aneisDe,
} from "./lib/geo.js";
import {
  pesquisaNearby, pesquisaText, detalhes, emParalelo, contadores,
  TECTO_NEARBY, LIMIAR_SATURACAO_TEXT, ErroPlaces, ErroQuotaDiaria,
  MASK_DETALHES_ESSENTIALS,
} from "./lib/places.js";
import { lerUso, registarUso, restanteGratis, custoDe, GRATIS_MES } from "./lib/uso.js";
import { clienteSupabase, nomeTabela, garantirTabela } from "./lib/db.js";
import { ehSocial } from "./lib/site.js";

const REGISTOS = ["formal", "coloquial", "regional", "servico", "adjacente"];

/** Abaixo disto nao vale a pena subdividir: um circulo de 150 m com 20
 *  resultados e um centro comercial, e parti-lo nao acrescenta empresas. */
const RAIO_MINIMO = 150;
/** ~200 m. Idem para retangulos. */
const LADO_MINIMO = 0.002;
/**
 * Travao de seguranca contra recursao descontrolada.
 *
 * NAO e suposto ser ele a parar a subdivisao — quem para sao o RAIO_MINIMO e o
 * LADO_MINIMO. Com 6 niveis nao era: um circulo de 5 km ainda ia em 640 m ao
 * sexto nivel (5000 x 0.71^6), e a corrida de advocacia em Viseu reportou oito
 * celulas "saturadas no limite minimo" que na verdade tinham batido na
 * profundidade. A documentacao dizia "ate raio < 150 m" e o codigo fazia outra
 * coisa.
 *
 * Descer de 5000 m ate 150 m com fator 0.71 leva 11 niveis; um retangulo de
 * 0.2 graus ate 0.002 leva 7. 12 deixa os dois limites reais serem os que
 * mandam, e continua a travar uma recursao que se descontrole.
 */
const PROFUNDIDADE_MAX = 12;

/* ────────────────────────────── argumentos ──────────────────────────────── */

function lerArgs(argv) {
  const a = { conc: 8, smoke: false, semEscrita: false, aceitoPagar: false, maxDetails: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    switch (k) {
      case "--nicho":        a.nicho = v; i++; break;
      case "--grid":         a.grid = v; i++; break;
      case "--keywords":     a.keywords = v; i++; break;
      case "--conc":         a.conc = Number(v); i++; break;
      case "--max-details":  a.maxDetails = Number(v); i++; break;
      case "--smoke-test":   a.smoke = true; break;
      case "--sem-escrita":  a.semEscrita = true; break;
      case "--aceito-pagar": a.aceitoPagar = true; break;
      default:
        if (k.startsWith("--")) { console.error(`Argumento desconhecido: ${k}`); process.exit(1); }
    }
  }
  for (const req of ["nicho", "grid", "keywords"]) {
    if (!a[req]) { console.error(`Falta --${req}.`); process.exit(1); }
  }
  // Sem --max-details e sem MAX_DETAILS_CALLS, o tecto passa a ser o que resta
  // de gratuito este mes. E preciso escrever um numero a mao para que uma
  // corrida sequer possa gerar factura.
  if (a.maxDetails == null && process.env.MAX_DETAILS_CALLS) {
    a.maxDetails = Number(process.env.MAX_DETAILS_CALLS);
  }
  return a;
}

const nf = (n, d = 0) =>
  Number(n).toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Quota diaria esgotada e o unico erro que para a corrida inteira.
 *
 * Continuar seria pior do que parar: todas as chamadas seguintes falhariam
 * igual, e o relatorio final apresentaria centenas de "celulas falhadas" como
 * se fossem buracos de cobertura dispersos, quando na verdade a corrida
 * simplesmente foi cortada a meio. O estado fica gravado, por isso retomar
 * depois de subir a quota nao repete nada.
 */
function pararSeQuotaEsgotada(resultados, caminho) {
  const q = resultados.find((r) => r && !r.ok && r.erro?.quotaDiaria)?.erro;
  if (!q) return;
  console.error(`

${"=".repeat(72)}
CORRIDA INTERROMPIDA — quota diaria esgotada
${"=".repeat(72)}

  ${q.limite} = ${q.valor} pedidos por dia

  Isto NAO e uma questao de dinheiro: as chamadas de pesquisa com o mask
  "places.id" continuam gratuitas. E um tecto de utilizacao que os projetos
  novos do Google Cloud trazem por defeito, e que se sobe a pedido.

  Como subir:
    Cloud Console > Google Maps Platform > Quotas
    escolhe a API, marca a quota, Edit, mete um valor maior, Submit request.

  O estado esta gravado em ${caminho}.
  Voltar a correr o mesmo comando retoma onde parou — nao repete chamadas.
`);
  process.exit(4);
}

/* ──────────────────────────────── estado ────────────────────────────────── */

/**
 * O ficheiro de estado do smoke test e SEPARADO do da corrida real.
 *
 * Partilha-lo envenenaria a corrida: os lugares do teste entrariam como se
 * tivessem sido encontrados pela grelha inteira, e as celulas do teste
 * ficariam marcadas como feitas. O relatorio final passaria a descrever uma
 * cobertura que nao aconteceu.
 */
function caminhoEstado(args, regiaoSlug) {
  const sufixo = args.smoke ? "smoke" : "run";
  return path.join(".state", `${args.nicho}__${regiaoSlug}__${sufixo}.json`);
}

function carregarEstado(caminho) {
  if (!fs.existsSync(caminho)) return null;
  try { return JSON.parse(fs.readFileSync(caminho, "utf8")); }
  catch { return null; }
}

function gravarEstado(caminho, estado) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, JSON.stringify(estado));
}

/* ───────────────────────────── celulas e tarefas ────────────────────────── */

function tarefasNearby(circulos, tipos) {
  const t = [];
  for (const c of circulos) {
    for (const tipo of tipos) {
      t.push({ modo: "nearby", id: c.id, chave: `${c.id}|nearby:${tipo}`, tipo, geo: c, prof: 0 });
    }
  }
  return t;
}

function tarefasText(retangulos, termos) {
  const t = [];
  for (const r of retangulos) {
    for (const termo of termos) {
      t.push({ modo: "text", id: r.id, chave: `${r.id}|text:${termo}`, termo, geo: r, prof: 0 });
    }
  }
  return t;
}

function filhosDe(tarefa) {
  if (tarefa.prof >= PROFUNDIDADE_MAX) return [];
  if (tarefa.modo === "nearby") {
    if (tarefa.geo.raio <= RAIO_MINIMO) return [];
    return subdividirCirculo(tarefa.geo.lat, tarefa.geo.lng, tarefa.geo.raio)
      .map((f, i) => ({
        ...tarefa, geo: f, prof: tarefa.prof + 1,
        id: `${tarefa.id}.${i}`, chave: `${tarefa.id}.${i}|nearby:${tarefa.tipo}`,
      }));
  }
  const lado = tarefa.geo.high.lat - tarefa.geo.low.lat;
  if (lado <= LADO_MINIMO) return [];
  return subdividirRetangulo(tarefa.geo.low, tarefa.geo.high)
    .map((f, i) => ({
      ...tarefa, geo: f, prof: tarefa.prof + 1,
      id: `${tarefa.id}.${i}`, chave: `${tarefa.id}.${i}|text:${tarefa.termo}`,
    }));
}

/* ───────────────────────────── relevancia ──────────────────────────────── */

/**
 * Ordena os lugares por probabilidade de serem mesmo do nicho, usando so
 * informacao que ja custou zero: por que termos foram encontrados, e o que a
 * Google acha que sao.
 *
 * Existe por causa do tecto. Quando ha mais candidatos do que chamadas
 * gratuitas, alguem tem de ficar de fora — e a diferenca entre gastar essas
 * chamadas nos primeiros que calharem e gasta-las nos mais relevantes e a
 * diferenca entre uma lista util e uma lista aleatoria.
 *
 * Os pesos: um lugar que o Nearby encontrou foi categorizado pela propria
 * Google como sendo do oficio, o que vale mais do que qualquer termo. O
 * registo adjacente vale pouco porque e precisamente o que traz hoteis e
 * lojas a boleia de termos como "climatizacao".
 *
 * Nota deliberada: os types servem para SUBIR pontuacao, nunca para excluir.
 * A "SOS Obras", que faz canalizacoes, tem primaryType "service" — filtrar
 * por tipo mataria o recall que e o objectivo de tudo isto.
 */
function criarRelevancia(kw) {
  const PESO = { formal: 1.0, coloquial: 1.0, regional: 1.0, servico: 0.8, adjacente: 0.3 };
  const registoDe = new Map();
  for (const r of REGISTOS) {
    for (const t of kw.termos?.[r] ?? []) registoDe.set('text:' + t, r);
  }
  const tiposNicho = new Set(kw.places_types ?? []);

  return (prov, types) => {
    let s = 0;
    for (const f of prov?.fontes ?? []) {
      if (f.startsWith('nearby:')) s += 3;
      else s += PESO[registoDe.get(f)] ?? 0.5;
    }
    if (types?.some((t) => tiposNicho.has(t))) s += 1.5;
    return s;
  };
}

/* ──────────────────────────────── principal ─────────────────────────────── */

async function principal() {
  const args = lerArgs(process.argv);

  const grelha = JSON.parse(fs.readFileSync(args.grid, "utf8"));
  const kw = JSON.parse(fs.readFileSync(args.keywords, "utf8"));
  const regiaoSlug = path.basename(args.grid).replace(/\.json$/, "");
  const poligono = grelha.poligono;

  const termos = REGISTOS.flatMap((r) => kw.termos?.[r] ?? []);
  const tipos = kw.places_types ?? [];

  console.log(`\nDescoberta: ${kw.nicho} em ${grelha.meta.nominatim.display_name}`);
  console.log(`  ${nf(grelha.circulos.length)} circulos · ${nf(grelha.retangulos.length)} retangulos`);
  console.log(`  ${tipos.length} places_types · ${termos.length} termos`);
  if (!tipos.length) {
    console.log(`  tem_tipos_diretos=false: o Nearby nao corre, toda a cobertura vem do Text Search.`);
  }

  /* ---------------------------- smoke test ---------------------------- */
  if (args.smoke) return smokeTest(args, grelha, kw, tipos, termos, regiaoSlug);

  /* ---------------------------- corrida real -------------------------- */
  const tabela = nomeTabela(args.nicho);
  let sb = null;
  if (!args.semEscrita) {
    sb = clienteSupabase();
    const { criada } = await garantirTabela(sb, tabela);
    console.log(`  tabela ${tabela}${criada ? " (criada agora)" : ""}`);
  }

  const caminho = caminhoEstado(args, regiaoSlug);
  const anterior = carregarEstado(caminho);
  const estado = anterior ?? {
    nicho: args.nicho, regiao: regiaoSlug, osm_id: grelha.meta.nominatim.osm_id,
    iniciado_em: new Date().toISOString(),
    feitas: [], falhadas: [], saturadas: 0, lugares: {}, detalhes_feitos: [],
  };
  if (anterior) {
    console.log(`  a retomar: ${nf(estado.feitas.length)} celulas feitas, ` +
                `${nf(Object.keys(estado.lugares).length)} lugares ja encontrados`);
  }
  const feitas = new Set(estado.feitas);

  /* ---- FASE A: pesquisa (gratuita) ---- */
  console.log(`\nFase A — pesquisa (SKU gratuito, mask places.id)`);
  const t0 = Date.now();

  let nivel = [
    ...tarefasNearby(grelha.circulos, tipos),
    ...tarefasText(grelha.retangulos, termos),
  ].filter((t) => !feitas.has(t.chave));

  const totalInicial = nivel.length;
  let profundidade = 0;
  let feitasNesta = 0;

  while (nivel.length && profundidade <= PROFUNDIDADE_MAX) {
    const etiqueta = profundidade === 0 ? "semente" : `subdivisao ${profundidade}`;
    process.stdout.write(`  ${etiqueta}: ${nf(nivel.length)} chamadas... `);

    const resultados = await emParalelo(nivel, args.conc, async (t) => {
      const r = t.modo === "nearby"
        ? await pesquisaNearby(t.geo, [t.tipo])
        : await pesquisaText(t.geo, t.termo);
      const fonte = t.modo === "nearby" ? `nearby:${t.tipo}` : `text:${t.termo}`;
      for (const id of r.ids) {
        const l = (estado.lugares[id] ??= { fontes: [], celulas: [] });
        if (!l.fontes.includes(fonte)) l.fontes.push(fonte);
        if (!l.celulas.includes(t.id)) l.celulas.push(t.id);
      }
      return { tarefa: t, saturado: r.saturado, n: r.ids.length };
    });

    const seguinte = [];
    for (let i = 0; i < resultados.length; i++) {
      const res = resultados[i];
      const t = nivel[i];
      if (!res.ok) {
        // Uma celula falhada nao derruba a corrida. Fica registada para o
        // relatorio dizer exactamente onde ha um buraco conhecido.
        //
        // Excepto as de quota diaria: essas nao sao buracos de cobertura, sao
        // a corrida a ser cortada. Regista-las como falhadas poluiria o
        // relatorio com centenas de linhas que descrevem um unico problema.
        if (!res.erro?.quotaDiaria) {
          estado.falhadas.push({ chave: t.chave, erro: String(res.erro.message).slice(0, 200) });
        }
        continue;
      }
      feitas.add(t.chave);
      feitasNesta++;
      if (res.valor.saturado) {
        estado.saturadas++;
        const f = filhosDe(t);
        if (f.length) seguinte.push(...f);
        else estado.falhadas.push({ chave: t.chave, erro: "saturada no limite minimo, nao subdividida" });
      }
    }

    // Gravar ANTES de verificar a quota: as celulas que correram bem neste
    // nivel ficam no checkpoint mesmo que a corrida pare a seguir.
    estado.feitas = [...feitas];
    gravarEstado(caminho, estado);
    pararSeQuotaEsgotada(resultados, caminho);

    console.log(`${nf(seguinte.length)} a subdividir`);
    nivel = seguinte;
    profundidade++;
  }

  const segundosA = (Date.now() - t0) / 1000;
  const unicos = Object.keys(estado.lugares);
  console.log(`  ${nf(contadores.nearby + contadores.text)} chamadas · ` +
              `${nf(unicos.length)} lugares unicos · ${segundosA.toFixed(0)}s · custo $0.00`);

  /* ---- FASE B1: Place Details Essentials (barato) ---- */
  //
  // Dois andares dentro da fase paga, pela mesma razao que a pesquisa esta
  // separada dos detalhes: os SKUs tem precos e limites gratuitos muito
  // diferentes.
  //
  //   Essentials   id,location,types    $5/1000   10 000 gratis/mes
  //   Enterprise   mask completo       $20/1000    1 000 gratis/mes
  //
  // O Essentials traz exactamente o que chega para decidir a quem vale a pena
  // pagar o caro: ONDE o lugar fica, para o descartar se cair fora da regiao,
  // e O QUE a Google acha que ele e, para o ordenar por relevancia.
  //
  // Medido em Penalva do Castelo, o filtro de poligono sozinho cortou 82% dos
  // lugares. Sao 82% de chamadas caras substituidas por chamadas baratas que
  // cabem no gratis — e o gratis do Essentials e dez vezes maior.

  estado.b1 ??= {};
  const porFazerB1 = unicos.filter((id) => !(id in estado.b1));

  console.log(`\nFase B1 — triagem barata (Essentials, ${nf(restanteGratis("essentials"))} gratis restantes este mes)`);
  console.log(`  ${nf(porFazerB1.length)} lugares a triar` +
              (unicos.length - porFazerB1.length ? `  (${nf(unicos.length - porFazerB1.length)} ja triados numa corrida anterior)` : ""));

  const t1 = Date.now();
  let contB1 = 0;
  const resB1 = await emParalelo(porFazerB1, args.conc, async (id) => {
    const d = await detalhes(id, MASK_DETALHES_ESSENTIALS);
    estado.b1[id] = {
      lat: d.location?.latitude ?? null,
      lng: d.location?.longitude ?? null,
      types: d.types ?? [],
    };
    return id;
  }, () => {
    if (++contB1 % 200 === 0) {
      process.stdout.write(`\r  ${nf(contB1)}/${nf(porFazerB1.length)}...`);
      gravarEstado(caminho, estado);
    }
  });
  gravarEstado(caminho, estado);
  pararSeQuotaEsgotada(resB1, caminho);
  process.stdout.write("\r");

  // O FILTRO DE POLIGONO VIVE AQUI, e nao na fase de pesquisa.
  //
  // Na pesquisa nao ha coordenadas: places.location e SKU Pro ($32/1000) e
  // punha a grelha inteira a pagar. Aqui a localizacao ja veio na chamada
  // barata, e cortar antes do Enterprise poupa o SKU caro.
  const dentroRegiao = [];
  let foraDaRegiao = 0;
  for (const id of unicos) {
    const b = estado.b1[id];
    if (!b) continue; // a chamada falhou; fica para a proxima corrida
    if (poligono && Number.isFinite(b.lat) && Number.isFinite(b.lng) &&
        !dentroDoPoligono(b.lng, b.lat, poligono)) foraDaRegiao++;
    else dentroRegiao.push(id);
  }
  const segundosB1 = (Date.now() - t1) / 1000;
  console.log(`  ${nf(contadores.detalhes_essentials)} chamadas · ${segundosB1.toFixed(0)}s · ` +
              `${nf(dentroRegiao.length)} dentro da regiao · ${nf(foraDaRegiao)} fora, descartados`);
  console.log(`  custo desta fase: $${custoDe("essentials", contadores.detalhes_essentials).toFixed(2)}`);

  /* ---- ordenar por relevancia ---- */
  const relevancia = criarRelevancia(kw);
  const jaFeitos = new Set(estado.detalhes_feitos);
  const candidatos = dentroRegiao
    .filter((id) => !jaFeitos.has(id))
    .map((id) => ({ id, r: relevancia(estado.lugares[id], estado.b1[id]?.types) }))
    .sort((a, b) => b.r - a.r);

  /* ---- orcamento ---- */
  // Por defeito o tecto e exactamente o que resta de gratuito este mes. Nao ha
  // maneira de gerar factura sem escrever um numero maior a mao.
  const restaGratis = restanteGratis("enterprise");
  const tecto = Math.max(0, (args.maxDetails ?? restaGratis) - estado.detalhes_feitos.length);
  const escolhidos = candidatos.slice(0, tecto).map((o) => o.id);
  const deixadosDeFora = candidatos.length - escolhidos.length;
  const custoPrevisto = custoDe("enterprise", escolhidos.length);

  console.log(`\nFase B2 — dados completos (Enterprise, ${nf(restaGratis)} gratis restantes este mes)`);
  console.log(`  candidatos dentro da regiao ... ${nf(candidatos.length)}`);
  console.log(`  tecto desta corrida ........... ${nf(tecto)}${args.maxDetails == null ? "  (= o que resta gratuito)" : "  (--max-details)"}`);
  console.log(`  vao ser detalhados ............ ${nf(escolhidos.length)}  (os de maior relevancia)`);
  if (deixadosDeFora) {
    console.log(`  ficam de fora ................. ${nf(deixadosDeFora)}  (custariam $${(deixadosDeFora * 0.02).toFixed(2)})`);
  }
  console.log(`  custo previsto ................ $${custoPrevisto.toFixed(2)}`);

  if (custoPrevisto > 0 && !args.aceitoPagar) {
    console.error(`
  TRAVAO: esta corrida geraria $${custoPrevisto.toFixed(2)} de factura.

  As ${nf(GRATIS_MES.enterprise)} chamadas gratuitas deste mes ja foram usadas
  (${nf(lerUso().enterprise)} feitas). O estado esta gravado em ${caminho}, por isso
  nada se perde: podes esperar pelo mes seguinte e retomar de graca.

  Para gastar mesmo, repete com --aceito-pagar.
`);
    process.exit(5);
  }

  /* ---- FASE B2: Place Details Enterprise (o mask completo) ---- */
  const linhas = [];
  const t2 = Date.now();
  let contB2 = 0;

  const resB2 = await emParalelo(escolhidos, args.conc, async (id) => {
    const d = await detalhes(id);
    const b = estado.b1[id] ?? {};
    const prov = estado.lugares[id];

    // Os dois estados que se sabem sem abrir browser nenhum. O resto fica a
    // NULL ate ao audit.js — e e essa mistura de 'none', 'social_only' e NULL
    // que torna o filtro do audit delicado. Ver o comentario la.
    const site = d.websiteUri ?? null;
    const estadoSite = !site ? "none" : ehSocial(site) ? "social_only" : null;

    linhas.push({
      place_id: id,
      site_state: estadoSite,
      nome: d.displayName?.text ?? null,
      morada: d.formattedAddress ?? null,
      lat: d.location?.latitude ?? b.lat ?? null,
      lng: d.location?.longitude ?? b.lng ?? null,
      telefone: d.nationalPhoneNumber ?? null,
      website: site,
      rating: d.rating ?? null,
      num_reviews: d.userRatingCount ?? null,
      business_status: d.businessStatus ?? null,
      primary_type: d.primaryType ?? null,
      types: d.types ?? b.types ?? null,
      google_maps_uri: d.googleMapsUri ?? null,
      fontes: prov.fontes, celulas: prov.celulas,
    });
    estado.detalhes_feitos.push(id);
    return id;
  }, () => {
    if (++contB2 % 100 === 0) {
      process.stdout.write(`\r  ${nf(contB2)}/${nf(escolhidos.length)}...`);
      gravarEstado(caminho, estado);
    }
  });

  gravarEstado(caminho, estado);
  pararSeQuotaEsgotada(resB2, caminho);
  process.stdout.write("\r");

  const falhasB2 = resB2.filter((r) => r && !r.ok).length;
  if (falhasB2) console.log(`  ${nf(falhasB2)} sem detalhes (erro na chamada) — ficam para a proxima corrida.`);
  const segundosB2 = (Date.now() - t2) / 1000;
  console.log(`  ${nf(contadores.detalhes_enterprise)} chamadas · ${segundosB2.toFixed(0)}s`);

  // O contador mensal e o que faz o tecto significar alguma coisa entre
  // corridas: sem ele, tres corridas no mesmo mes julgavam-se cada uma com
  // 1000 chamadas gratuitas.
  registarUso({
    pesquisa: contadores.nearby + contadores.text,
    essentials: contadores.detalhes_essentials,
    enterprise: contadores.detalhes_enterprise,
  });

  /* ---- escrita ---- */
  if (sb && linhas.length) {
    process.stdout.write(`\nA escrever ${nf(linhas.length)} leads em ${tabela}... `);
    for (let i = 0; i < linhas.length; i += 500) {
      const lote = linhas.slice(i, i + 500);
      const { error } = await sb.from(tabela).upsert(lote, { onConflict: "place_id" });
      if (error) throw new Error(`Supabase: ${error.message}`);
    }
    console.log("feito.");
  } else if (args.semEscrita) {
    console.log(`\n--sem-escrita: ${nf(linhas.length)} leads NAO foram gravadas.`);
  }

  relatorio(linhas, estado, totalInicial, foraDaRegiao, deixadosDeFora,
            segundosA + segundosB1 + segundosB2, kw);
}

/* ─────────────────────────────── smoke test ─────────────────────────────── */

async function smokeTest(args, grelha, kw, tipos, termos, regiaoSlug) {
  console.log(`\nSMOKE TEST — uma celula so, sem escrita na base de dados`);

  /**
   * A celula do teste e a MAIS DENSA da regiao, descoberta por sondagem — nao
   * a mais central.
   *
   * A escolha pelo centroide parecia tirar o sitio da equacao e nao tira: o
   * centroide de um concelho rural continua a ser rural. Medido com a mesma
   * lista de keywords, o teste dava 20 de 33 termos a zero em Penalva do
   * Castelo (134 km2, rural) e 3 de 33 no distrito de Viseu. A conclusao
   * "volta a Fase 2 e reve as keywords" estava a medir a densidade da regiao.
   *
   * Testar na celula mais densa torna o sinal interpretavel: se um termo da
   * zero onde ha mais empresas do nicho, o problema e mesmo do termo.
   *
   * A sondagem custa uma chamada por retangulo, no SKU gratuito.
   */
  const sonda = kw.termos?.formal?.[0] ?? termos[0];
  process.stdout.write(`  a sondar ${nf(grelha.retangulos.length)} retangulos com "${sonda}"... `);
  const sondagem = await emParalelo(grelha.retangulos, args.conc,
    async (r) => (await pesquisaText(r, sonda)).ids.length);
  console.log("");
  pararSeQuotaEsgotada(sondagem, caminhoEstado(args, regiaoSlug));

  const ranking = grelha.retangulos
    .map((r, i) => ({ r, n: sondagem[i].ok ? sondagem[i].valor : -1 }))
    .sort((a, b) => b.n - a.n);
  console.log(`melhor: ${ranking[0].n} resultados, pior: ${ranking[ranking.length - 1].n}`);

  // Centroide, so para o relatorio mostrar a diferenca entre as duas escolhas.
  const anelExt = aneisDe(grelha.poligono)[0] ?? [];
  let sx = 0, sy = 0;
  for (const [lng, lat] of anelExt) { sx += lng; sy += lat; }
  const cLng = anelExt.length ? sx / anelExt.length : (grelha.meta.bbox[0] + grelha.meta.bbox[2]) / 2;
  const cLat = anelExt.length ? sy / anelExt.length : (grelha.meta.bbox[1] + grelha.meta.bbox[3]) / 2;

  const retangulo = ranking[0].n > 0 ? ranking[0].r
    : grelha.retangulos.find((r) => cLat >= r.low.lat && cLat <= r.high.lat &&
                                    cLng >= r.low.lng && cLng <= r.high.lng) ?? grelha.retangulos[0];

  if (ranking[0].n <= 0) {
    console.log(`
  A sonda "${sonda}" deu 0 em TODOS os retangulos da regiao.
  Ou o termo formal esta errado, ou o nicho nao existe aqui. A cair para a
  celula central, mas le o resultado com isso em mente.`);
  }

  // O circulo dentro do melhor retangulo, mais proximo do centro dele.
  const mLat = (retangulo.low.lat + retangulo.high.lat) / 2;
  const mLng = (retangulo.low.lng + retangulo.high.lng) / 2;
  const dentro = grelha.circulos.filter((c) =>
    c.lat >= retangulo.low.lat && c.lat <= retangulo.high.lat &&
    c.lng >= retangulo.low.lng && c.lng <= retangulo.high.lng);
  const circulo = (dentro.length ? dentro : grelha.circulos)
    .map((c) => ({ c, d: distanciaM(mLat, mLng, c.lat, c.lng) }))
    .sort((a, b) => a.d - b.d)[0].c;

  console.log(`  retangulo ${retangulo.id} (o mais denso)  ·  circulo ${circulo.id} @ ${nf(circulo.raio)} m`);
  console.log(`  para referencia, o centroide da regiao fica a ${nf(distanciaM(cLat, cLng, circulo.lat, circulo.lng) / 1000, 1)} km daqui\n`);

  const linhas = [];
  for (const tipo of tipos) {
    try {
      const r = await pesquisaNearby(circulo, [tipo]);
      linhas.push({ fonte: `nearby:${tipo}`, n: r.ids.length, sat: r.saturado, ids: r.ids });
    } catch (e) { linhas.push({ fonte: `nearby:${tipo}`, n: -1, erro: e.message }); }
  }
  const res = await emParalelo(termos, args.conc, async (t) => {
    const r = await pesquisaText(retangulo, t);
    return { fonte: `text:${t}`, n: r.ids.length, sat: r.saturado, ids: r.ids };
  });
  for (let i = 0; i < res.length; i++) {
    linhas.push(res[i].ok ? res[i].valor : { fonte: `text:${termos[i]}`, n: -1, erro: res[i].erro.message });
  }

  linhas.sort((a, b) => b.n - a.n);
  console.log("  resultados por termo:");
  for (const l of linhas) {
    const marca = l.n < 0 ? "ERRO" : l.n === 0 ? "  0 " : l.sat ? `${String(l.n).padStart(3)}!` : String(l.n).padStart(4);
    console.log(`    ${marca}  ${l.fonte}${l.erro ? "  — " + l.erro : ""}`);
  }

  const unicos = new Set(linhas.flatMap((l) => l.ids ?? []));
  const zeros = linhas.filter((l) => l.n === 0).length;
  const validos = linhas.filter((l) => l.n >= 0).length;

  console.log(`\n  ${nf(unicos.size)} lugares unicos nesta celula`);
  console.log(`  ${zeros}/${validos} termos deram 0`);
  console.log(`  ! = saturado (${TECTO_NEARBY} no Nearby, ${LIMIAR_SATURACAO_TEXT}+ no Text) — na corrida real seria subdividido`);

  const estado = { celula: circulo.id, retangulo: retangulo.id, linhas, feito_em: new Date().toISOString() };
  const caminho = caminhoEstado(args, regiaoSlug);
  gravarEstado(caminho, estado);
  console.log(`\n  estado do teste em ${caminho} (separado da corrida real)`);

  if (validos && zeros > validos / 2) {
    console.log(`
  ATENCAO: mais de metade dos termos deu 0 na celula MAIS DENSA da regiao.
  Volta a Fase 2 e revê as keywords: se um termo nao encontra nada onde ha mais
  empresas do nicho, nao vai encontrar em lado nenhum. Ver keywords-method.md.

  (Se a regiao inteira for pequena e rural, confirma primeiro com uma regiao
  maior — a mesma lista pode reprovar num concelho e passar no distrito.)
`);
    process.exit(3);
  }
  console.log("");
}

/* ─────────────────────────────── relatorio ──────────────────────────────── */

function relatorio(linhas, estado, totalInicial, foraDaRegiao, deixadosDeFora, segundos, kw) {
  // CLOSED_PERMANENTLY sai dos totais e nao so da vista: senao o numero grande
  // fica inflacionado com empresas que ja nao existem.
  const vivas = linhas.filter((l) => l.business_status !== "CLOSED_PERMANENTLY");
  const fechadas = linhas.length - vivas.length;

  const so = (pred) => vivas.filter(pred).length;
  const temNearby = (l) => l.fontes.some((f) => f.startsWith("nearby:"));
  const temText = (l) => l.fontes.some((f) => f.startsWith("text:"));
  const soNearby = so((l) => temNearby(l) && !temText(l));
  const soText = so((l) => temText(l) && !temNearby(l));
  const ambos = so((l) => temNearby(l) && temText(l));

  const semSite = vivas.filter((l) => !l.website).length;
  const social = vivas.filter((l) => l.site_state === "social_only").length;

  const custoEss = custoDe("essentials", contadores.detalhes_essentials);
  const custoEnt = custoDe("enterprise", contadores.detalhes_enterprise);
  const uso = lerUso();

  const porTermo = new Map();
  for (const l of vivas) for (const f of l.fontes) porTermo.set(f, (porTermo.get(f) ?? 0) + 1);
  const top = [...porTermo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  console.log(`
${"=".repeat(72)}
RELATORIO — ${kw.nicho}
${"=".repeat(72)}

  leads unicas (vivas) .......... ${nf(vivas.length)}
  excluidas CLOSED_PERMANENTLY .. ${nf(fechadas)}
  descartadas fora da regiao .... ${nf(foraDaRegiao)}  (cortadas na fase barata, antes de pagar o mask caro)${deixadosDeFora ? `
  deixadas para outra corrida ... ${nf(deixadosDeFora)}  (excederiam o tecto; sao as de menor relevancia)` : ""}

  PROVENIENCIA
  so do Nearby .................. ${nf(soNearby)}  (${(soNearby / (vivas.length || 1) * 100).toFixed(0)}%)
  so do Text Search ............. ${nf(soText)}  (${(soText / (vivas.length || 1) * 100).toFixed(0)}%)
  de ambos ...................... ${nf(ambos)}

  GRELHA
  chamadas semente .............. ${nf(totalInicial)}
  chamadas totais de pesquisa ... ${nf(contadores.nearby + contadores.text)}  (${nf(contadores.paginas)} paginas de Text)
  celulas saturadas ............. ${nf(estado.saturadas)}  (subdivididas)
  celulas falhadas .............. ${nf(estado.falhadas.length)}
  retries por 429/5xx ........... ${nf(contadores.retries)}

  NOTA (provisoria — a definitiva sai do audit.js)
  sem website = nota 5 .......... ${nf(semSite)}
  so redes sociais = nota 4 ..... ${nf(social)}
  por auditar ................... ${nf(vivas.length - semSite - social)}

  CUSTO DESTA CORRIDA
  pesquisa ...................... $0.00      ${nf(contadores.nearby + contadores.text)} chamadas, SKU IDs Only, sem tecto
  Details Essentials ............ $${custoEss.toFixed(2)}      ${nf(contadores.detalhes_essentials)} chamadas ($5/1000, ${nf(GRATIS_MES.essentials)} gratis/mes)
  Details Enterprise ............ $${custoEnt.toFixed(2)}      ${nf(contadores.detalhes_enterprise)} chamadas ($20/1000, ${nf(GRATIS_MES.enterprise)} gratis/mes)
  ───────────────────────────────
  TOTAL ......................... $${(custoEss + custoEnt).toFixed(2)}
  tempo ......................... ${(segundos / 60).toFixed(1)} min

  GRATUITO RESTANTE ESTE MES (${uso.mes})
  Details Essentials ............ ${nf(restanteGratis("essentials", uso))} de ${nf(GRATIS_MES.essentials)}
  Details Enterprise ............ ${nf(restanteGratis("enterprise", uso))} de ${nf(GRATIS_MES.enterprise)}
`);

  if (top.length) {
    console.log("  TOP 20 TERMOS (leads em que o termo participou)");
    for (const [f, n] of top) console.log(`    ${String(n).padStart(5)}  ${f}`);
  }

  if (estado.falhadas.length) {
    console.log(`\n  CELULAS FALHADAS (${estado.falhadas.length}) — buracos conhecidos na cobertura:`);
    for (const f of estado.falhadas.slice(0, 10)) console.log(`    ${f.chave}: ${f.erro}`);
    if (estado.falhadas.length > 10) console.log(`    ... e mais ${estado.falhadas.length - 10}`);
  }

  const pctText = soText / (vivas.length || 1);
  if (pctText < 0.15) {
    console.log(`
  ATENCAO: o Text Search contribuiu com ${(pctText * 100).toFixed(0)}% de leads exclusivas.
  Abaixo de 15% e o sinal mais fiavel de que as keywords estao fracas: os
  termos nao estao a encontrar nada que os places_types ja nao encontrassem.
  A cobertura real e menor do que este numero sugere. Ver keywords-method.md.
`);
  }

  if (deixadosDeFora) {
    console.log(`
  ${nf(deixadosDeFora)} lugares ficaram por detalhar por causa do tecto.
  Ja estao triados e ordenados: a proxima corrida do mes seguinte apanha-os
  de graca, e o mesmo comando retoma sem repetir nada.
  Para os fazer agora: --max-details ${nf(estado.detalhes_feitos.length + deixadosDeFora)} --aceito-pagar
  (custaria mais $${(deixadosDeFora * 0.02).toFixed(2)})
`);
  }
  console.log("");
}

principal().catch((e) => {
  console.error(`\nERRO: ${e.message}`);
  if (e instanceof ErroPlaces) console.error(`  codigo ${e.codigo}, esgotado=${e.esgotado}`);
  process.exit(1);
});
