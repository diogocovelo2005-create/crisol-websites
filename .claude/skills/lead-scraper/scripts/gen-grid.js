#!/usr/bin/env node
/**
 * gen-grid.js — resolve uma regiao administrativa e produz a grelha SEMENTE:
 * circulos grosseiros para o Nearby Search e retangulos grosseiros para o
 * Text Search.
 *
 *   node scripts/gen-grid.js --regiao "Viseu" --pais PT [--indice N]
 *                            [--raio-semente 5000] [--lado-retangulo 0.2]
 *                            [--out grid/viseu.json]
 *
 * A grelha e deliberadamente GROSSEIRA. A resolucao fina nao vem daqui — vem
 * da subdivisao por saturacao no discover.js, que desce onde os resultados
 * batem no tecto da API e deixa em paz o resto. Ver references/grid.md.
 */

import "./lib/arranque.js";  // tem de ser o primeiro: faz chdir e so depois le o .env
import fs from "node:fs";
import path from "node:path";
import {
  bboxDe, areaKm2, dentroDoPoligono, malhaHexagonal, criarIndiceArestas,
  aneisDe, FATOR_SUBDIVISAO, M_POR_GRAU_LAT, mPorGrauLon,
} from "./lib/geo.js";

/* ────────────────────────────── argumentos ──────────────────────────────── */

/**
 * Raio semente em funcao da area da regiao.
 *
 * Os circulos de fronteira transbordam para os concelhos vizinhos, e os
 * lugares que trazem so sao descartados depois do Place Details — ja pagos.
 * O desperdicio e proporcional ao anel que sai da regiao, que vale
 * grosseiramente perimetro x raio. Numa regiao grande esse anel e uma fatia
 * pequena; numa pequena e maior do que a propria regiao.
 *
 * Medido no concelho de Penalva do Castelo (134 km2) com raio fixo de 5000 m:
 * 91 lugares detalhados, 75 deitados fora — 82% do custo desperdicado. O raio
 * tem de encolher com a regiao.
 *
 * raiz(area) x 100 da ~1160 m para 134 km2 e satura nos 5000 m acima dos
 * 2500 km2. O minimo de 1000 m evita gerar dezenas de milhares de celulas
 * numa freguesia.
 */
function raioAutomatico(areaKm2Regiao) {
  return Math.round(Math.min(5000, Math.max(1000, Math.sqrt(areaKm2Regiao) * 100)));
}

function lerArgs(argv) {
  const a = { pais: "PT", raioSemente: null, ladoRetangulo: 0.2, fatorEspacamento: 1.5 };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case "--regiao":         a.regiao = v; i++; break;
      case "--pais":           a.pais = String(v).toLowerCase(); i++; break;
      case "--indice":         a.indice = Number(v); i++; break;
      case "--raio-semente":   a.raioSemente = Number(v); i++; break;
      case "--lado-retangulo": a.ladoRetangulo = Number(v); i++; break;
      case "--out":            a.out = v; i++; break;
      default:
        if (k.startsWith("--")) {
          console.error(`Argumento desconhecido: ${k}`);
          console.error("Nota: --raio-urbano, --raio-rural e --dist-urbana foram removidos.");
          console.error("A densidade passou a ser tratada por subdivisao no discover.js.");
          process.exit(1);
        }
    }
  }
  if (!a.regiao) {
    console.error('Falta --regiao. Ex: --regiao "Viseu" --pais PT');
    process.exit(1);
  }
  if (a.raioSemente !== null && (!(a.raioSemente > 0) || a.raioSemente > 50000)) {
    console.error("--raio-semente tem de estar entre 1 e 50000 (limite do circulo da API).");
    process.exit(1);
  }
  if (!(a.ladoRetangulo > 0) || a.ladoRetangulo > 1) {
    console.error("--lado-retangulo tem de estar entre 0 e 1 grau.");
    process.exit(1);
  }
  return a;
}

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const nf = (n, d = 0) =>
  Number(n).toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ───────────────────────────── Nominatim ────────────────────────────────── */

const UA = process.env.NOMINATIM_USER_AGENT;
if (!UA || /exemplo\.pt/.test(UA)) {
  console.error("NOMINATIM_USER_AGENT em falta ou por preencher no .env.");
  console.error("A politica do Nominatim exige um User-Agent com contacto real; sem ele levas 403.");
  process.exit(1);
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** O Nominatim permite 1 pedido/segundo. Isto garante-o sem quem chama pensar nisso. */
let ultimoNominatim = 0;
async function nominatim(params) {
  const espera = 1100 - (Date.now() - ultimoNominatim);
  if (espera > 0) await dormir(espera);
  ultimoNominatim = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(params)}`;
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "pt" } });
  if (!r.ok) throw new Error(`Nominatim ${r.status} ${r.statusText}`);
  return r.json();
}

async function resolverRegiao(args) {
  const bruto = await nominatim({
    q: args.regiao, countrycodes: args.pais, format: "jsonv2",
    polygon_geojson: "1", addressdetails: "1", limit: "20",
  });

  let cands = bruto.filter((r) => r.category === "boundary" && r.type === "administrative");
  let soAdministrativos = true;
  if (cands.length === 0) { cands = bruto; soAdministrativos = false; }
  if (cands.length === 0) {
    console.error(`Nenhum resultado para "${args.regiao}" em ${args.pais.toUpperCase()}.`);
    process.exit(1);
  }

  // Do maior para o menor: numa lista de homonimos a regiao mais abrangente
  // e quase sempre a pretendida, e assim fica em primeiro.
  cands = cands.map((r) => ({ ...r, _area: areaKm2(r.geojson) }))
               .sort((a, b) => b._area - a._area);

  if (!soAdministrativos) {
    console.warn("AVISO: nenhum candidato e uma fronteira administrativa. A listar tudo o que veio.");
  }

  if (cands.length > 1 && args.indice === undefined) {
    console.log(`\n${cands.length} candidatos para "${args.regiao}" em ${args.pais.toUpperCase()}:\n`);
    console.log("  idx  rank  addresstype      area km2   osm                display_name");
    console.log("  ---  ----  ---------------  ---------  -----------------  ------------");
    cands.forEach((r, i) => {
      console.log(
        `  ${String(i).padStart(3)}  ${String(r.place_rank).padStart(4)}  ` +
        `${String(r.addresstype).padEnd(15)}  ${nf(r._area).padStart(9)}  ` +
        `${(r.osm_type[0] + "/" + r.osm_id).padEnd(17)}  ${r.display_name}`
      );
    });
    console.log(`
  Os nomes coincidem quase sempre. Decide pela AREA e pelo place_rank, nao
  pelo display_name nem pelo addresstype — em Portugal o Nominatim chama
  "county" ao distrito e "city" ao concelho, e os tres podem chamar-se
  exactamente a mesma coisa.

  Referencia: distrito ~2500-7000 km2 · concelho ~50-1500 km2 · freguesia < 50 km2

  Volta a correr com --indice N.
`);
    process.exit(2);
  }

  const escolhido = cands[args.indice ?? 0];
  if (!escolhido) {
    console.error(`--indice ${args.indice} fora do intervalo (0..${cands.length - 1}).`);
    process.exit(1);
  }
  return { escolhido, total: cands.length };
}

/* ──────────────────────────────── principal ─────────────────────────────── */

async function principal() {
  const args = lerArgs(process.argv);

  console.log(`\nA resolver "${args.regiao}" (${args.pais.toUpperCase()}) no Nominatim...`);
  const { escolhido, total } = await resolverRegiao(args);

  const geo = escolhido.geojson;
  const poligonoReal = !!geo && (geo.type === "Polygon" || geo.type === "MultiPolygon");

  console.log(`\nRegiao escolhida${total > 1 ? ` (indice ${args.indice}, de ${total})` : ""}:`);
  console.log(`  ${escolhido.display_name}`);
  console.log(`  place_rank=${escolhido.place_rank}  addresstype=${escolhido.addresstype}  ` +
              `osm=${escolhido.osm_type}/${escolhido.osm_id}`);

  let bbox;
  if (poligonoReal) {
    bbox = bboxDe(geo);
    console.log(`  geometria: ${geo.type} com ${aneisDe(geo).length} anel(eis), area ${nf(areaKm2(geo))} km2`);
  } else {
    const [s, n, w, e] = escolhido.boundingbox.map(Number);
    bbox = [w, s, e, n];
    console.warn(`
  AVISO: o Nominatim nao devolveu poligono para esta regiao.
  A grelha vai cobrir a BOUNDING BOX, que e sempre maior que a regiao real.
  As chamadas de pesquisa sao gratuitas, logo o desperdicio e de tempo; mas os
  lugares encontrados fora da regiao so serao descartados na fase de Place
  Details, essa sim paga. Considera indicar uma regiao com fronteira mapeada.`);
  }

  const [minLng, minLat, maxLng, maxLat] = bbox;
  const areaBboxKm2 = ((maxLat - minLat) * 111.32) *
    ((maxLng - minLng) * 111.32 * Math.cos(((maxLat + minLat) / 2) * Math.PI / 180));

  const areaRegiao = poligonoReal ? areaKm2(geo) : areaBboxKm2;
  const raioAuto = args.raioSemente === null;
  if (raioAuto) args.raioSemente = raioAutomatico(areaRegiao);
  console.log(`  raio semente: ${nf(args.raioSemente)} m` +
              (raioAuto ? `  (automatico, de raiz(${nf(areaRegiao)} km2) x 100)` : "  (--raio-semente)"));

  const poli = poligonoReal ? geo : null;
  const idxArestas = poligonoReal ? criarIndiceArestas(geo, 0.02) : null;

  /**
   * Um circulo entra na grelha se COBRE parte da regiao — nao se o seu centro
   * esta dentro dela.
   *
   * A diferenca nao e academica: filtrar por "centro dentro" deixa a faixa
   * junto a fronteira descoberta, porque um ponto da regiao ao pe do limite
   * tem o centro hexagonal mais proximo do lado de fora, e esse centro seria
   * descartado. Medido no concelho de Penalva do Castelo, esse criterio
   * deixava 6,5% da area sem qualquer circulo — e a soma das areas continuava
   * a dar 175% de "cobertura", porque areas sobrepostas somam na mesma.
   *
   * O preco sao circulos centrados fora da regiao, que trazem lugares do
   * concelho ao lado. Esses caem no filtro de poligono do discover.js, depois
   * do Place Details. Trocar recall por umas chamadas de Details desperdicadas
   * e o negocio certo: o recall perdido aqui nao da erro nenhum.
   */
  const tocaRegiao = (lat, lng, raio) =>
    dentroDoPoligono(lng, lat, poli) ||
    (idxArestas ? idxArestas.temArestaAte(lat, lng, raio) : false);

  /* ---- circulos semente ---- */
  // A malha estende-se para la da bbox pelo raio, senao os centros que cobrem
  // a fronteira exterior nem chegam a ser gerados.
  const margemLat = args.raioSemente / M_POR_GRAU_LAT;
  const margemLng = args.raioSemente / mPorGrauLon((minLat + maxLat) / 2);
  const bboxMalha = [
    minLng - margemLng, minLat - margemLat,
    maxLng + margemLng, maxLat + margemLat,
  ];

  const espacamento = args.raioSemente * args.fatorEspacamento;
  const candidatos = malhaHexagonal(bboxMalha, espacamento);
  const circulos = [];
  for (const [lng, lat] of candidatos) {
    if (!tocaRegiao(lat, lng, args.raioSemente)) continue;
    circulos.push({
      id: `c${circulos.length}`,
      lat: +lat.toFixed(6),
      lng: +lng.toFixed(6),
      raio: args.raioSemente,
    });
  }
  const circulosDeFronteira = circulos.filter((c) => !dentroDoPoligono(c.lng, c.lat, poli)).length;

  /**
   * Que fatia da area coberta pelos circulos cai FORA da regiao.
   *
   * E a melhor previsao que ha do desperdicio da fase paga: os lugares
   * apanhados nessa faixa so sao descartados depois do Place Details. Assume
   * densidade uniforme de empresas, o que e falso, mas da a ordem de grandeza
   * — e a alternativa e descobri-lo na factura.
   */
  function medirTransbordo(amostras = 20000) {
    if (!poligonoReal || !circulos.length) return null;
    let fora = 0;
    for (let i = 0; i < amostras; i++) {
      const c = circulos[(Math.random() * circulos.length) | 0];
      const ang = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * c.raio;
      const lat = c.lat + (Math.sin(ang) * r) / M_POR_GRAU_LAT;
      const lng = c.lng + (Math.cos(ang) * r) / (mPorGrauLon(c.lat) || 1);
      if (!dentroDoPoligono(lng, lat, poli)) fora++;
    }
    return fora / amostras;
  }
  const transbordo = medirTransbordo();

  /* ---- retangulos semente ---- */
  // Alinhados a uma malha global de multiplos do lado — floor(coord/lado)*lado —
  // para que a mesma regiao gere sempre os mesmos retangulos e regioes vizinhas
  // produzam retangulos coincidentes em vez de desencontrados.
  const L = args.ladoRetangulo;
  const retangulos = [];
  for (let lat = Math.floor(minLat / L) * L; lat < maxLat; lat += L) {
    for (let lng = Math.floor(minLng / L) * L; lng < maxLng; lng += L) {
      const hi = { lat: lat + L, lng: lng + L };

      // Intersecta o poligono? Primeiro uma amostra 3x3 no interior.
      let toca = false;
      for (let i = 1; i <= 3 && !toca; i++) {
        for (let j = 1; j <= 3 && !toca; j++) {
          if (dentroDoPoligono(lng + (L * j) / 4, lat + (L * i) / 4, poli)) toca = true;
        }
      }
      // Se a amostra falhou, procura vertices do poligono dentro do retangulo.
      // Apanha as linguas estreitas de regiao que atravessam um retangulo sem
      // conter nenhum dos nove pontos amostrados.
      if (!toca && poligonoReal) {
        for (const anel of aneisDe(geo)) {
          for (const [vlng, vlat] of anel) {
            if (vlng >= lng && vlng <= hi.lng && vlat >= lat && vlat <= hi.lat) { toca = true; break; }
          }
          if (toca) break;
        }
      }

      if (toca) {
        retangulos.push({
          id: `r${retangulos.length}`,
          low:  { lat: +lat.toFixed(6), lng: +lng.toFixed(6) },
          high: { lat: +hi.lat.toFixed(6), lng: +hi.lng.toFixed(6) },
        });
      }
    }
  }

  /* ---- escrita ---- */
  const destino = args.out ?? path.join("grid", `${slug(args.regiao)}.json`);
  fs.mkdirSync(path.dirname(destino), { recursive: true });

  if (fs.existsSync(destino)) {
    try {
      const antes = JSON.parse(fs.readFileSync(destino, "utf8"))?.meta?.nominatim?.osm_id;
      if (antes && String(antes) !== String(escolhido.osm_id)) {
        console.warn(`\nAVISO: ${destino} ja existe mas descreve outra regiao ` +
                     `(osm ${antes} vs ${escolhido.osm_id}). A substituir.`);
      }
    } catch { /* ficheiro ilegivel: substitui-se na mesma */ }
  }

  const saida = {
    meta: {
      regiao: args.regiao,
      pais: args.pais.toUpperCase(),
      gerado_em: new Date().toISOString(),
      nominatim: {
        place_id: escolhido.place_id, osm_type: escolhido.osm_type, osm_id: escolhido.osm_id,
        display_name: escolhido.display_name, place_rank: escolhido.place_rank,
        addresstype: escolhido.addresstype,
      },
      poligono_real: poligonoReal,
      area_km2: poligonoReal ? +areaKm2(geo).toFixed(1) : null,
      area_bbox_km2: +areaBboxKm2.toFixed(1),
      bbox,
      params: {
        raio_semente_m: args.raioSemente,
        fator_espacamento: args.fatorEspacamento,
        lado_retangulo_graus: L,
        // Guardado para o discover.js e para quem ler o ficheiro perceber que
        // esta grelha e uma semente, nao a resolucao final.
        fator_subdivisao: FATOR_SUBDIVISAO,
      },
      contagens: {
        circulos: circulos.length,
        // Fraccao da area varrida que cai fora da regiao. O estimate-cost.js
        // usa isto para prever quantos Place Details vao ser deitados fora.
        transbordo: transbordo === null ? null : +transbordo.toFixed(3),
        // Centros fora da regiao que cobrem a faixa da fronteira. Se este numero
        // for uma fatia grande do total, a regiao e muito recortada ou o raio
        // semente e grande demais para o tamanho dela.
        circulos_de_fronteira: circulosDeFronteira,
        retangulos: retangulos.length,
      },
    },
    // O poligono viaja com a grelha porque o discover.js precisa dele para
    // descartar lugares fora da regiao. Sem isto seria preciso voltar ao
    // Nominatim, e uma segunda resolucao podia escolher outro candidato.
    poligono: poligonoReal ? geo : null,
    circulos,
    retangulos,
  };

  fs.writeFileSync(destino, JSON.stringify(saida, null, 2));

  /* ---- relatorio ---- */
  const areaRef = poligonoReal ? areaKm2(geo) : areaBboxKm2;
  const cobertura = circulos.length * Math.PI * (args.raioSemente / 1000) ** 2;
  const areaRet = retangulos.length * (L * 111.32) *
    (L * 111.32 * Math.cos(((maxLat + minLat) / 2) * Math.PI / 180));

  console.log(`
Grelha semente gerada
  regiao ................ ${escolhido.display_name}
  area real ............. ${poligonoReal ? nf(areaKm2(geo)) + " km2" : "(sem poligono)"}
  area da bbox .......... ${nf(areaBboxKm2)} km2

  circulos .............. ${nf(circulos.length)} @ ${nf(args.raioSemente)} m  (${nf(Math.PI * (args.raioSemente / 1000) ** 2)} km2 cada)
  destes, de fronteira .. ${nf(circulosDeFronteira)} com o centro fora da regiao
  area coberta .......... ${nf(cobertura)} km2 = ${(cobertura / areaRef * 100).toFixed(0)}% da regiao
                          (>100% e a sobreposicao intencional do hexagonal)
  transbordo ............ ${transbordo === null ? "(sem poligono)" : (transbordo * 100).toFixed(0) + "% da area varrida cai fora da regiao"}
                          e a fatia dos Place Details que sera paga e deitada fora

  retangulos ............ ${nf(retangulos.length)} @ ${L} graus  (${nf(areaRet / retangulos.length)} km2 cada)

  escrito em ............ ${destino}

  Esta grelha e uma SEMENTE. O discover.js subdivide o que saturar:
  circulos em 4 filhos de raio ${FATOR_SUBDIVISAO}x ate < 20 resultados ou raio < 150 m,
  retangulos em 4 quadrantes ate < 58 resultados. Onde nao houver empresas,
  fica-se por estas ${nf(circulos.length)} chamadas.
`);
}

principal().catch((e) => {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
});
