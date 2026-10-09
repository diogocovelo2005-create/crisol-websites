#!/usr/bin/env node
/**
 * detalhar.js — nomes das casas, uma chamada por casa, dentro do gratuito.
 *
 *   node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/detalhar.js \
 *        --regiao viseu [--max-dia 100] [--conc 4] [--simular]
 *
 * Substitui a fase B do discover.js. Corre DEPOIS da fase A do motor, que é
 * gratuita e não se toca, e consome o checkpoint que ela deixou.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PORQUE EXISTE
 *
 * A 11/09/2026 a prospeção de Viseu encontrou 10 010 lugares de graça e depois
 * falhou as 10 000 chamadas da fase B1, todas, sem gravar uma única resposta.
 * O lote saiu vazio. A causa não foi dinheiro: foi a quota
 * `GetPlaceRequestPerDayPerProject`, 100 pedidos por dia no projeto da chave.
 *
 * O motor parte a fase paga em dois andares — triagem barata a $5/1000 e mask
 * completo a $20/1000 — porque o gratuito do Essentials é dez vezes maior. Isso
 * está certo contra uma restrição de DINHEIRO. A restrição real é de RITMO, e a
 * quota conta pedidos, não SKUs: os dois andares gastam duas unidades de quota
 * por casa nomeada, para poupar dólares que nunca chegariam a ser cobrados.
 *
 * Debaixo de um tecto diário, dois andares são estritamente pior do que um.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O QUE FAZ DIFERENTE
 *
 *   1. Filtra a região DE GRAÇA, pela célula que encontrou o lugar.
 *      A triagem barata existia para saber onde cada lugar fica. Mas isso já se
 *      sabe: cada lugar traz no checkpoint as células que o encontraram, e a
 *      geometria de qualquer célula reconstrói-se do id, porque a subdivisão é
 *      determinística. Em Viseu isto descarta 5 928 lugares dos 10 010 sem uma
 *      chamada e sem um cêntimo — exactamente o que as 10 000 chamadas iam
 *      descobrir.
 *
 *   2. Uma só chamada por casa, com o mask completo.
 *      O Place Details devolve tudo o que se pedir pelo mesmo preço, por isso
 *      não há razão para uma primeira chamada de reconhecimento.
 *
 *   3. Aborta à PRIMEIRA falha de quota diária, não no fim da fase.
 *      O motor só verifica a quota depois de a fase inteira terminar, e foi
 *      por isso que ontem fez 10 000 chamadas condenadas em vez de parar às
 *      primeiras. Aqui a quota diária corta em segundos.
 *
 *   4. Orçamento, e retoma amanhã.
 *      Gasta o mínimo entre o que resta de gratuito no mês e o tecto do dia.
 *      Nunca gera factura sem `--aceito-pagar`, que não é preciso para nada do
 *      funcionamento normal.
 *
 * NÃO TOCA em `.claude/skills/lead-scraper/`. Importa de lá, só de leitura.
 */

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

/* O motor vive na raiz do repositório. Esta skill vive em nichos/alojamento/.
   <pacote>/scripts/detalhar.js -> <pacote> -> ... -> raiz do repo */
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PACOTE = path.resolve(AQUI, "..");
const RAIZ_REPO = path.resolve(PACOTE, "..", "..", "..", "..", "..");
const MOTOR = path.join(RAIZ_REPO, ".claude", "skills", "lead-scraper");
const LIB = pathToFileURL(path.join(MOTOR, "scripts", "lib") + path.sep).href;

/* arranque.js muda o cwd para a raiz do motor e só depois carrega o .env.
   Tem de ser o primeiro import, e é ele que faz `grid/viseu.json` e
   `keywords/alojamento.json` resolverem onde a skill diz que resolvem. */
await import(LIB + "arranque.js");
const geo = await import(LIB + "geo.js");
const places = await import(LIB + "places.js");
const db = await import(LIB + "db.js");
const uso = await import(LIB + "uso.js");
const site = await import(LIB + "site.js");

const NICHO = "alojamento";
const nf = (n) => Number(n).toLocaleString("pt-PT");

/* ──────────────────────────────── argumentos ────────────────────────────── */

function lerArgs(argv) {
  const a = { conc: 4, maxDia: 100, max: null, simular: false, aceitoPagar: false };
  for (let i = 0; i < argv.length; i++) {
    const [k, v] = [argv[i], argv[i + 1]];
    switch (k) {
      case "--regiao":       a.regiao = v; i++; break;
      case "--max-dia":      a.maxDia = Number(v); i++; break;
      case "--max":          a.max = Number(v); i++; break;
      case "--conc":         a.conc = Number(v); i++; break;
      case "--simular":      a.simular = true; break;
      case "--aceito-pagar": a.aceitoPagar = true; break;
      default:
        if (k.startsWith("--")) { console.error(`Argumento desconhecido: ${k}`); process.exit(1); }
    }
  }
  if (!a.regiao) { console.error("Falta --regiao (ex: --regiao viseu)."); process.exit(1); }
  return a;
}

/* ───────────────────────── geometria gratuita das células ───────────────── */

/**
 * Reconstrói a geometria de qualquer célula a partir do id, incluindo as
 * subdivididas — 'c12.2.0' é o filho 0 do filho 2 do círculo c12.
 *
 * Só funciona porque a subdivisão do motor é determinística: o mesmo pai dá
 * sempre os mesmos filhos, na mesma ordem. Se isso mudar no motor, isto passa
 * a mentir em silêncio, e é a única dependência frágil deste ficheiro.
 */
function criarGeomDe(grelha) {
  const circ = new Map(grelha.circulos.map((c) => [c.id, c]));
  const rect = new Map(grelha.retangulos.map((r) => [r.id, r]));
  const cache = new Map();

  return function geomDe(id) {
    if (cache.has(id)) return cache.get(id);
    let g = null;
    if (circ.has(id)) g = { tipo: "c", ...circ.get(id) };
    else if (rect.has(id)) g = { tipo: "r", ...rect.get(id) };
    else {
      const i = id.lastIndexOf(".");
      if (i > 0) {
        const pai = geomDe(id.slice(0, i));
        const k = Number(id.slice(i + 1));
        if (pai?.tipo === "c") {
          const f = geo.subdividirCirculo(pai.lat, pai.lng, pai.raio)[k];
          if (f) g = { tipo: "c", ...f };
        } else if (pai?.tipo === "r") {
          const f = geo.subdividirRetangulo(pai.low, pai.high)[k];
          if (f) g = { tipo: "r", ...f };
        }
      }
    }
    cache.set(id, g);
    return g;
  };
}

/** Raio equivalente da célula: quão apertada está a posição do lugar. */
function raioM(g) {
  if (!g) return Infinity;
  if (g.tipo === "c") return g.raio;
  const dLat = (g.high.lat - g.low.lat) * geo.M_POR_GRAU_LAT;
  const dLng = (g.high.lng - g.low.lng) * geo.mPorGrauLon((g.high.lat + g.low.lat) / 2);
  return Math.max(dLat, dLng) / 2;
}

function centroDe(g) {
  return g.tipo === "c"
    ? { lat: g.lat, lng: g.lng }
    : { lat: (g.low.lat + g.high.lat) / 2, lng: (g.low.lng + g.high.lng) / 2 };
}

/**
 * Acima deste raio o teste do centro deixa de decidir: o lugar pode estar em
 * qualquer ponto da célula, e a fronteira do distrito pode passar pelo meio.
 *
 * Por isso o corte não é "centro fora, descarta". É "centro fora E célula
 * apertada, descarta". Com a célula larga o lugar fica INCERTO e vai ao fim da
 * fila, em vez de desaparecer — a regra da skill aplicada à geografia: sem
 * prova não se descarta, e uma célula de 5 km não é prova de nada.
 */
const RAIO_DECISIVO_M = 1500;

function classificarRegiao(prov, geomDe, poligono) {
  let melhor = null;
  for (const c of prov.celulas) {
    const g = geomDe(c);
    if (!g) continue;
    if (!melhor || raioM(g) < raioM(melhor)) melhor = g;
  }
  if (!melhor || !poligono) return { regiao: "incerto", raio: raioM(melhor), motivo: "sem geometria" };

  const r = raioM(melhor);
  const ct = centroDe(melhor);
  const dentro = geo.dentroDoPoligono(ct.lng, ct.lat, poligono);

  if (dentro && r <= RAIO_DECISIVO_M) return { regiao: "dentro", raio: r };
  if (dentro)                         return { regiao: "dentro_incerto", raio: r };
  if (r <= RAIO_DECISIVO_M)           return { regiao: "fora", raio: r };
  return { regiao: "incerto", raio: r, motivo: "centro fora mas célula larga" };
}

/* ──────────────────────────────── relevância ───────────────────────────── */

/**
 * A mesma ideia do motor, mas só com `fontes`: os `types` só chegam com uma
 * chamada paga, e o objectivo aqui é ordenar ANTES de pagar.
 *
 * Um lugar que o Nearby categorizou vale mais do que qualquer termo escrito.
 * O registo adjacente vale pouco porque é o que traz hotéis e campismo à
 * boleia. Medido em Viseu: o top 1000 tem 6,5 termos distintos por lugar, a
 * cauda tem 2,1 — a ordem separa a sério.
 */
const REGISTOS = ["formal", "coloquial", "regional", "servico", "adjacente"];
const PESO = { formal: 1.0, coloquial: 1.0, regional: 1.0, servico: 0.8, adjacente: 0.3 };

function criarRelevancia(kw) {
  const registoDe = new Map();
  for (const r of REGISTOS) for (const t of kw.termos?.[r] ?? []) registoDe.set("text:" + t, r);
  return (prov) => {
    let s = 0;
    for (const f of prov.fontes) s += f.startsWith("nearby:") ? 3 : (PESO[registoDe.get(f)] ?? 0.5);
    return s;
  };
}

/* ──────────────────────────────── estado ───────────────────────────────── */

/* O estado desta fase vive nesta skill, não no motor: o motor não sabe que
   isto existe e não se mexe no que é dele. */
const dirEstado = () => path.join(PACOTE, ".state");
const caminhoEstado = (regiao) => path.join(dirEstado(), `${NICHO}__${regiao}__detalhes.json`);

function carregarEstado(regiao) {
  const c = caminhoEstado(regiao);
  if (!fs.existsSync(c)) return { feitos: {}, sem_resposta: [], criado_em: new Date().toISOString() };
  try { return JSON.parse(fs.readFileSync(c, "utf8")); }
  catch { return { feitos: {}, sem_resposta: [], criado_em: new Date().toISOString() }; }
}

function gravarEstado(regiao, e) {
  fs.mkdirSync(dirEstado(), { recursive: true });
  e.atualizado_em = new Date().toISOString();
  fs.writeFileSync(caminhoEstado(regiao), JSON.stringify(e, null, 1));
}

/** O checkpoint da fase A. Prefere o backup completo, se existir. */
function carregarCheckpointMotor(regiao) {
  const dir = path.join(MOTOR, ".state");
  const base = `${NICHO}__${regiao}__run`;
  const completos = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.startsWith(`${base}.completo-`)).sort()
    : [];
  const escolhido = completos.length
    ? path.join(dir, completos[completos.length - 1])
    : path.join(dir, `${base}.json`);
  if (!fs.existsSync(escolhido)) {
    console.error(`
Não há checkpoint da fase A para "${regiao}".

Corre primeiro a descoberta (§2 da skill), que é gratuita:

  node .claude/skills/lead-scraper/scripts/discover.js --nicho alojamento \\
       --grid grid/${regiao}.json --keywords keywords/${NICHO}.json
`);
    process.exit(1);
  }
  return { estado: JSON.parse(fs.readFileSync(escolhido, "utf8")), ficheiro: escolhido };
}

/* ─────────────────────────────── principal ─────────────────────────────── */

async function principal() {
  const args = lerArgs(process.argv.slice(2));

  const grelha = JSON.parse(fs.readFileSync(path.join("grid", `${args.regiao}.json`), "utf8"));
  const kw = JSON.parse(fs.readFileSync(path.join("keywords", `${NICHO}.json`), "utf8"));
  const { estado: motor, ficheiro } = carregarCheckpointMotor(args.regiao);
  const estado = carregarEstado(args.regiao);

  console.log(`\nDetalhes: ${NICHO} em ${grelha.meta.nominatim.display_name}`);
  console.log(`  checkpoint da fase A: ${path.basename(ficheiro)}`);
  console.log(`  ${nf(Object.keys(motor.lugares).length)} lugares encontrados de graça`);

  /* ---- filtro de região e relevância, ambos gratuitos ---- */
  const geomDe = criarGeomDe(grelha);
  const relevancia = criarRelevancia(kw);
  const poligono = grelha.poligono ?? null;

  const contagem = { dentro: 0, dentro_incerto: 0, incerto: 0, fora: 0 };
  const fila = [];
  for (const [id, prov] of Object.entries(motor.lugares)) {
    const cl = classificarRegiao(prov, geomDe, poligono);
    contagem[cl.regiao]++;
    if (cl.regiao === "fora") continue;
    if (estado.feitos[id]) continue;
    fila.push({ id, prov, ...cl, pontos: relevancia(prov) });
  }

  /* Ordem da fila: primeiro quem está provadamente no distrito, depois os
     incertos. Dentro de cada grupo, por relevância. Gastar as chamadas caras
     nos primeiros que calharem em vez de nos mais relevantes é a diferença
     entre uma lista útil e uma lista aleatória. */
  const ordem = { dentro: 0, dentro_incerto: 1, incerto: 2 };
  fila.sort((a, b) => ordem[a.regiao] - ordem[b.regiao] || b.pontos - a.pontos);

  console.log(`\nFiltro de região — de graça, pela célula que encontrou cada lugar`);
  console.log(`  dentro do distrito ............ ${nf(contagem.dentro)}`);
  console.log(`  dentro, posição imprecisa ..... ${nf(contagem.dentro_incerto)}`);
  console.log(`  incertos, não se descartam .... ${nf(contagem.incerto)}`);
  console.log(`  fora, descartados sem gastar .. ${nf(contagem.fora)}`);
  console.log(`  já detalhados em corridas anteriores: ${nf(Object.keys(estado.feitos).length)}`);

  /* ---- orçamento ---- */
  const livreMes = uso.restanteGratis("enterprise");
  const tecto = Math.min(
    fila.length,
    args.max ?? Infinity,
    args.maxDia,
    args.aceitoPagar ? Infinity : livreMes,
  );
  const escolhidos = fila.slice(0, tecto);
  /* Sem --aceito-pagar o tecto já é o gratuito, por isso o excedente é zero e
     o custo é zero. A conta só existe para o caso de alguém passar a flag. */
  const excedente = Math.max(0, escolhidos.length - livreMes);
  const custo = (excedente * uso.PRECO_POR_MIL.enterprise) / 1000;

  console.log(`\nOrçamento`);
  console.log(`  na fila ....................... ${nf(fila.length)}`);
  console.log(`  gratuitas que restam este mês . ${nf(livreMes)}  (Enterprise, 1000/mês)`);
  console.log(`  tecto do dia .................. ${nf(args.maxDia)}`);
  console.log(`  vão ser detalhados ............ ${nf(escolhidos.length)}`);
  console.log(`  custo previsto ................ $${custo.toFixed(2)}`);

  if (!escolhidos.length) {
    console.log(`\nNada a fazer.${livreMes === 0 ? " As 1000 gratuitas do mês acabaram." : ""}`);
    return;
  }
  if (args.simular) {
    console.log(`\n--simular: nenhuma chamada feita. Primeiros da fila:`);
    for (const e of escolhidos.slice(0, 10)) {
      console.log(`  ${e.pontos.toFixed(1)} pts · ${e.regiao} · ${Math.round(e.raio)} m · ${e.prov.fontes.slice(0, 3).join(", ")}`);
    }
    return;
  }

  /* ---- chamadas: uma por casa, mask completo ---- */
  console.log(`\nA detalhar (Place Details Enterprise, uma chamada por casa)`);
  const linhas = [];
  let quotaDiaria = null;
  let chaveMorta = null;
  let falhas = 0;
  let falhasSeguidas = 0;

  /**
   * Quantas falhas seguidas, sem uma única resposta boa, bastam para concluir
   * que o problema não são os lugares.
   *
   * Uma casa pode falhar sozinha — place_id que a Google retirou, timeout. O
   * que não acontece é doze casas seguidas falharem pela mesma razão. Quando
   * isso acontece, a chave não está a servir, e continuar a percorrer a fila
   * só enche o relatório de "voltam à fila amanhã" sobre um problema que não
   * passa com o tempo.
   *
   * Medido a 11/09/2026: depois de ~62 000 chamadas numa noite, a API passou de
   * 429 com corpo de quota para 403 PERMISSION_DENIED sem corpo nenhum. As
   * primeiras doze chamadas desta fase falharam todas, e a versão anterior
   * deste ficheiro disse "corre outra vez amanhã" como se fosse normal.
   */
  const FALHAS_PARA_DESISTIR = 5;

  /* Lotes pequenos com verificação de quota ENTRE lotes. É isto que evita o
     erro de ontem: o motor só verifica no fim da fase e fez 10 000 chamadas
     condenadas. Aqui a primeira falha de quota diária corta tudo. */
  for (let i = 0; i < escolhidos.length && !quotaDiaria && !chaveMorta; i += args.conc) {
    const lote = escolhidos.slice(i, i + args.conc);
    const res = await Promise.all(lote.map(async (e) => {
      try { return { e, d: await places.detalhes(e.id) }; }
      catch (err) { return { e, err }; }
    }));

    for (const r of res) {
      if (r.err) {
        if (r.err.quotaDiaria) { quotaDiaria = r.err; continue; }
        falhas++;
        falhasSeguidas++;
        if (!estado.sem_resposta.includes(r.e.id)) estado.sem_resposta.push(r.e.id);
        if (linhas.length === 0 && falhasSeguidas >= FALHAS_PARA_DESISTIR) chaveMorta = r.err;
        continue;
      }
      falhasSeguidas = 0;
      const d = r.d;
      const url = d.websiteUri ?? null;
      linhas.push({
        place_id: r.e.id,
        site_state: !url ? "none" : site.ehSocial(url) ? "social_only" : null,
        nome: d.displayName?.text ?? null,
        morada: d.formattedAddress ?? null,
        lat: d.location?.latitude ?? null,
        lng: d.location?.longitude ?? null,
        telefone: d.nationalPhoneNumber ?? null,
        website: url,
        rating: d.rating ?? null,
        num_reviews: d.userRatingCount ?? null,
        business_status: d.businessStatus ?? null,
        primary_type: d.primaryType ?? null,
        types: d.types ?? null,
        google_maps_uri: d.googleMapsUri ?? null,
        fontes: r.e.prov.fontes,
        celulas: r.e.prov.celulas,
      });
      /* A confiança na região fica AQUI e não em audit_extra, porque o
         audit.js reescreve audit_extra e apagava-a. É usada no §5: uma casa de
         região incerta é duvidosa, não é uma casa do distrito. */
      estado.feitos[r.e.id] = {
        em: new Date().toISOString(),
        regiao: r.e.regiao,
        raio_celula_m: Math.round(r.e.raio),
        pontos: Number(r.e.pontos.toFixed(1)),
      };
    }
    if ((i / args.conc) % 5 === 0) {
      process.stdout.write(`\r  ${nf(linhas.length)}/${nf(escolhidos.length)}...`);
      gravarEstado(args.regiao, estado);
    }
  }
  process.stdout.write("\r");

  /* Conta as RESPOSTAS, não as tentativas. Uma chamada recusada não se paga e
     não gasta gratuito nenhum; registá-la fazia o contador mensal comer o
     orçamento por causa de erros. Ontem isto marcou 20 chamadas que a Google
     nunca serviu. */
  uso.registarUso({ enterprise: linhas.length });
  gravarEstado(args.regiao, estado);

  console.log(`  ${nf(places.contadores.detalhes_enterprise)} tentativas · ${nf(linhas.length)} casas com nome`);
  if (falhas && !chaveMorta) {
    console.log(`  ${nf(falhas)} sem resposta (erro na chamada) — voltam à fila amanhã`);
  }

  /* ---- escrita ---- */
  if (linhas.length) {
    const sb = db.clienteSupabase();
    const tabela = db.nomeTabela(NICHO);
    await db.garantirTabela(sb, tabela);
    process.stdout.write(`\nA escrever ${nf(linhas.length)} leads em ${tabela}... `);
    for (let i = 0; i < linhas.length; i += 500) {
      const { error } = await sb.from(tabela)
        .upsert(linhas.slice(i, i + 500), { onConflict: "place_id" });
      if (error) throw new Error(`Supabase: ${error.message}`);
    }
    console.log("feito.");
  }

  /* ---- relatório ---- */
  const semSite = linhas.filter((l) => l.site_state === "none").length;
  const soSocial = linhas.filter((l) => l.site_state === "social_only").length;
  const porVer = fila.length - Object.keys(estado.feitos).length;

  console.log(`
${"─".repeat(68)}
  casas nomeadas nesta corrida .. ${nf(linhas.length)}
  sem website na ficha .......... ${nf(semSite)}
  só agregador ou rede social ... ${nf(soSocial)}
  com website próprio a auditar . ${nf(linhas.length - semSite - soSocial)}
  ainda na fila ................. ${nf(Math.max(0, porVer))}
  custo ......................... $${custo.toFixed(2)}
${"─".repeat(68)}`);

  if (quotaDiaria) {
    console.log(`
  QUOTA DIÁRIA ESGOTADA — ${quotaDiaria.limite} = ${quotaDiaria.valor}/dia

  Não é dinheiro, é ritmo. Parei à primeira recusa em vez de gastar a fila
  inteira em chamadas condenadas, e o que já veio está gravado.

  Amanhã, o mesmo comando continua onde ficou. Para acabar num dia, sobe a
  quota em Cloud Console > Google Maps Platform > Quotas.`);
  }

  if (chaveMorta) {
    console.log(`
  PAREI: ${FALHAS_PARA_DESISTIR} chamadas seguidas falharam e nenhuma casa veio com nome.

    HTTP ${chaveMorta.codigo} — ${chaveMorta.message}

  Isto não é uma casa problemática, é a chave a não servir. Esperar não
  resolve e percorrer a fila inteira só produzia ${nf(fila.length)} falhas iguais.

  Onde olhar, por esta ordem:
    1. a Places API (New) está activa no projeto?   console.cloud.google.com/apis
    2. a chave tem restrições de API ou de referrer que a barrem?
    3. o projeto tem facturação activa? sem ela alguns SKUs dão 403
    4. a chave é mesmo deste projeto? o número vem no corpo de um 429

  Nada foi gravado e nada foi cobrado. A fila fica intacta.`);
  } else if (porVer > 0 && !quotaDiaria) {
    console.log(`\n  Corre outra vez amanhã para os próximos ${nf(Math.min(args.maxDia, porVer))}.`);
  }

  if (chaveMorta) return;

  console.log(`
  A seguir, e sem gastar nada na Google:
    node .claude/skills/lead-scraper/scripts/audit.js --nicho ${NICHO} --screenshot-min-score 2
    node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/estetica.js
    node -e "import('./.claude/skills/lead-scraper/scripts/lib/db.js').then(d=>d.aplicarScore(d.nomeTabela('${NICHO}')))"

  O tipo de lead e a nota de 0 a 10 calculam-se sozinhos na tabela (crm.sql).
`);
}

principal().catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
