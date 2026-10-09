#!/usr/bin/env node
/**
 * estimate-cost.js — quanto custa e quanto demora uma corrida, ANTES de a fazer.
 *
 *   node scripts/estimate-cost.js --grid grid/viseu.json
 *                                 --keywords keywords/canalizacao.json
 *                                 [--nicho <slug>]
 *
 * Se existir um smoke test para este par nicho+regiao, o numero de lugares
 * unicos e extrapolado a partir dele. Sem smoke test, o intervalo e largo e
 * o script diz-te isso — porque um numero inventado com duas casas decimais
 * e pior do que um intervalo honesto.
 */

import "./lib/arranque.js";  // tem de ser o primeiro: faz chdir e so depois le o .env
import fs from "node:fs";
import path from "node:path";

// Precos, limites gratuitos e contagem do mes vivem todos em lib/uso.js, para
// o estimador e o discover.js nunca poderem discordar sobre quanto custa o quê.
import { PRECO_POR_MIL, lerUso, restanteGratis, custoDe } from "./lib/uso.js";

/** Quotas por defeito de um projeto com faturacao. Confirma as tuas em
 *  Cloud Console > Google Maps Platform > Quotas: um projeto novo pode vir
 *  com 100/dia, e nao ha maneira de descobrir isso sem bater no tecto. */
const QUOTAS = { por_dia: 75000, por_minuto: 600 };

const REGISTOS = ["formal", "coloquial", "regional", "servico", "adjacente"];

/* ────────────────────────────── argumentos ──────────────────────────────── */

function lerArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === "--grid") { a.grid = v; i++; }
    else if (k === "--keywords") { a.keywords = v; i++; }
    else if (k === "--nicho") { a.nicho = v; i++; }
    else if (k.startsWith("--")) { console.error(`Argumento desconhecido: ${k}`); process.exit(1); }
  }
  if (!a.grid || !a.keywords) {
    console.error("Uso: node scripts/estimate-cost.js --grid grid/x.json --keywords keywords/y.json");
    process.exit(1);
  }
  return a;
}

const nf = (n, d = 0) =>
  Number(n).toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n) => "$" + n.toFixed(2);

/* ──────────────────────────────── principal ─────────────────────────────── */

function principal() {
  const args = lerArgs(process.argv);
  const grelha = JSON.parse(fs.readFileSync(args.grid, "utf8"));
  const kw = JSON.parse(fs.readFileSync(args.keywords, "utf8"));

  const nCirculos = grelha.circulos.length;
  const nRetangulos = grelha.retangulos.length;
  const termos = REGISTOS.flatMap((r) => kw.termos?.[r] ?? []);
  const tipos = kw.places_types ?? [];
  const regiaoSlug = path.basename(args.grid).replace(/\.json$/, "");
  const nicho = args.nicho ?? path.basename(args.keywords).replace(/\.json$/, "");

  /* ---- chamadas de pesquisa ---- */
  const nearbySemente = nCirculos * tipos.length;
  // Media de paginas por chamada de Text. A maioria dos termos devolve menos
  // de 20 resultados numa celula e gasta 1 pagina; os comuns gastam 3.
  const PAG_MIN = 1.0, PAG_MAX = 1.6;
  const textMin = Math.round(nRetangulos * termos.length * PAG_MIN);
  const textMax = Math.round(nRetangulos * termos.length * PAG_MAX);

  // Subdivisao: cada celula saturada gera 4 filhos. O minimo e nenhuma
  // saturar; o maximo assume 20% a saturar em cada um de 3 niveis.
  const semente = nearbySemente + textMin;
  let subMax = 0, nivel = nearbySemente + textMax;
  for (let i = 0; i < 3; i++) { nivel = Math.round(nivel * 0.2) * 4; subMax += nivel; }

  const pesquisaMin = nearbySemente + textMin;
  const pesquisaMax = nearbySemente + textMax + subMax;

  /* ---- lugares unicos ---- */
  const caminhoSmoke = path.join(".state", `${nicho}__${regiaoSlug}__smoke.json`);
  let unicosMin, unicosMax, baseSmoke = null;

  if (fs.existsSync(caminhoSmoke)) {
    try {
      const smoke = JSON.parse(fs.readFileSync(caminhoSmoke, "utf8"));
      const ids = new Set((smoke.linhas ?? []).flatMap((l) => l.ids ?? []));
      baseSmoke = ids.size;
      // O smoke test mediu UMA celula, e escolheu a mais densa. As restantes
      // rendem menos, por isso o intervalo vai de 30% a 100% desse ritmo.
      unicosMin = Math.round(baseSmoke * nRetangulos * 0.30);
      unicosMax = Math.round(baseSmoke * nRetangulos * 1.00);
    } catch { /* ficheiro ilegivel: cai no ramo sem smoke */ }
  }
  if (baseSmoke === null) {
    // Sem medicao, so ha a regra de bolso: 5 a 15 chamadas de pesquisa por
    // lugar unico.
    //
    // O piso combina o cenario mais pobre em ambas as pontas — poucas
    // chamadas E muitas chamadas por lugar; o tecto combina as duas mais
    // generosas. Cruzar as pontas ao contrario daria um intervalo estreito e
    // falsamente preciso, que e o pior resultado possivel numa estimativa.
    unicosMin = Math.round(pesquisaMin / 15);
    unicosMax = Math.round(pesquisaMax / 5);
  }

  /* ---- custo ---- */
  // Duas fases dentro da fase paga. A triagem barata (Essentials) leva TODOS
  // os lugares; a cara (Enterprise) leva so os que sobram do filtro de
  // poligono. Como o gratuito do Essentials e dez vezes maior, e quase sempre
  // a fase cara que decide a factura.
  const transbordo = grelha.meta?.contagens?.transbordo ?? null;
  const sobrevivem = (n) => Math.round(n * (1 - (transbordo ?? 0)));
  const uso = lerUso();

  /* ---- tempo e quota ---- */
  const minutosMin = (pesquisaMin + unicosMin) / QUOTAS.por_minuto;
  const minutosMax = (pesquisaMax + unicosMax) / QUOTAS.por_minuto;
  const diasMin = (pesquisaMin + unicosMin) / QUOTAS.por_dia;

  console.log(`
${"=".repeat(72)}
ESTIMATIVA — ${kw.nicho} em ${grelha.meta.nominatim.display_name}
${"=".repeat(72)}

  grelha semente ...... ${nf(nCirculos)} circulos @ ${nf(grelha.meta.params.raio_semente_m)} m · ${nf(nRetangulos)} retangulos @ ${grelha.meta.params.lado_retangulo_graus} graus
  keywords ............ ${tipos.length} places_types · ${termos.length} termos

  PESQUISA — Search Essentials (IDs Only)
  Nearby (semente) .... ${nf(nearbySemente)}   (${nf(nCirculos)} circulos x ${tipos.length} tipos)
  Text (semente) ...... ${nf(textMin)} a ${nf(textMax)}   (${nf(nRetangulos)} x ${termos.length} termos x ${PAG_MIN}-${PAG_MAX} paginas)
  subdivisao .......... 0 a ${nf(subMax)}   (so onde saturar)
  ─────────────────────
  TOTAL ............... ${nf(pesquisaMin)} a ${nf(pesquisaMax)} chamadas
  custo ............... ${usd(0)}   ilimitado no SKU IDs Only

  PLACE DETAILS — dois andares
  lugares unicos ...... ${nf(unicosMin)} a ${nf(unicosMax)}${baseSmoke !== null
    ? `   (extrapolado do smoke test: ${nf(baseSmoke)} numa celula)`
    : `   (REGRA DE BOLSO — corre o smoke test para um numero a serio)`}

  B1 Essentials ....... ${nf(unicosMin)} a ${nf(unicosMax)} chamadas   ($${PRECO_POR_MIL.essentials}/1000, ${nf(restanteGratis("essentials", uso))} gratis restantes)
     custo ............ $${custoDe("essentials", unicosMin, uso).toFixed(2)} a $${custoDe("essentials", unicosMax, uso).toFixed(2)}${transbordo !== null ? `
     corta ~${(transbordo * 100).toFixed(0)}% por caírem fora da regiao, antes de pagar o mask caro` : ""}

  B2 Enterprise ....... ${nf(sobrevivem(unicosMin))} a ${nf(sobrevivem(unicosMax))} chamadas   ($${PRECO_POR_MIL.enterprise}/1000, ${nf(restanteGratis("enterprise", uso))} gratis restantes)
     custo ............ $${custoDe("enterprise", sobrevivem(unicosMin), uso).toFixed(2)} a $${custoDe("enterprise", sobrevivem(unicosMax), uso).toFixed(2)}
  ─────────────────────
  CUSTO TOTAL ......... $${(custoDe("essentials", unicosMin, uso) + custoDe("enterprise", sobrevivem(unicosMin), uso)).toFixed(2)} a $${(custoDe("essentials", unicosMax, uso) + custoDe("enterprise", sobrevivem(unicosMax), uso)).toFixed(2)}

  Sem --max-details, o discover.js limita-se ao gratuito e nao gasta nada:
  detalha os ${nf(restanteGratis("enterprise", uso))} mais relevantes e deixa o resto para o mes seguinte.

  QUOTA E TEMPO
  quota assumida ...... ${nf(QUOTAS.por_dia)}/dia · ${nf(QUOTAS.por_minuto)}/minuto por metodo
  consumo ............. ${(diasMin * 100).toFixed(1)}% a ${((pesquisaMax + unicosMax) / QUOTAS.por_dia * 100).toFixed(1)}% da quota diaria
  tempo minimo ........ ${minutosMin.toFixed(0)} a ${minutosMax.toFixed(0)} min ao ritmo maximo
`);

  const tecto = Number(process.env.MAX_DETAILS_CALLS ?? 5000);
  if (unicosMax > tecto) {
    console.log(`  AVISO: o maximo estimado (${nf(unicosMax)}) passa o MAX_DETAILS_CALLS de ${nf(tecto)}.
  O discover.js vai parar antes da fase paga. Sobe o limite ou usa --max-details.
`);
  }
  if (baseSmoke === null) {
    console.log(`  Corre primeiro o smoke test — troca a regra de bolso por uma medicao:
    node scripts/discover.js --nicho ${nicho} --grid ${args.grid} \\
                             --keywords ${args.keywords} --smoke-test
`);
  }
  console.log(`  Nota: os precos sao os de Agosto de 2026 (references/places-api.md).
  Confirma a tua quota real em Cloud Console > Google Maps Platform > Quotas:
  um projeto novo pode trazer 100/dia em vez de ${nf(QUOTAS.por_dia)}, e so se
  descobre batendo no tecto.
`);
}

principal();
