#!/usr/bin/env node
/**
 * audit.js — visita o website de cada lead e classifica-o.
 *
 *   node scripts/audit.js --nicho <slug> [--screenshot-min-score 4] [--conc 6]
 *                         [--limite N] [--urls ficheiro.txt]
 *
 * --urls corre contra uma lista fixa de URLs, sem base de dados. Serve para
 * testar a classificacao contra sites conhecidos sem precisar de leads.
 */

import "./lib/arranque.js";  // tem de ser o primeiro: faz chdir e so depois le o .env
import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";
import { clienteSupabase, nomeTabela } from "./lib/db.js";
import { classificar, notaProvisoria, falhasGraves, ehParqueado, ehSocial } from "./lib/site.js";

const IPHONE = {
  ...(devices["iPhone 14"] ?? {}),
  userAgent: devices["iPhone 14"]?.userAgent ??
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " +
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  // 390x844 e o ecra completo do iPhone 14. O preset do Playwright traz
  // 390x664, que ja desconta a barra do browser — e um screenshot que se
  // mostra a um cliente fica com 180 px de pagina a menos por causa disso.
  // Para o overflow horizontal a altura e indiferente; para a fotografia nao.
  viewport: { width: 390, height: 844 },
  isMobile: true, hasTouch: true, deviceScaleFactor: 3,
};

const TIMEOUT = 20000;

/* ────────────────────────────── argumentos ──────────────────────────────── */

function lerArgs(argv) {
  const a = { conc: 6, minScreenshot: 4 };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    switch (k) {
      case "--nicho":                a.nicho = v; i++; break;
      case "--screenshot-min-score": a.minScreenshot = Number(v); i++; break;
      case "--conc":                 a.conc = Number(v); i++; break;
      case "--limite":               a.limite = Number(v); i++; break;
      case "--urls":                 a.urls = v; i++; break;
      default:
        if (k.startsWith("--")) { console.error(`Argumento desconhecido: ${k}`); process.exit(1); }
    }
  }
  if (!a.nicho && !a.urls) { console.error("Falta --nicho (ou --urls para testar)."); process.exit(1); }
  return a;
}

const nf = (n) => Number(n).toLocaleString("pt-PT");

/* ────────────────────────── analise de uma pagina ───────────────────────── */

async function recolherSinais(contexto, url) {
  const pagina = await contexto.newPage();
  const sinais = {
    website: url, http_status: null, final_url: null, has_https: null,
    has_viewport: null, overflow_x: null, meta_generator: null, footer_year: null,
    tem_form: null, tem_contacto: null, tem_jsonld: null, num_imagens: null,
    parqueado: null, erro: null,
  };
  try {
    // domcontentloaded e nao "load": muitos sites antigos tem imagens ou
    // trackers que nunca terminam, e esperar por "load" transformaria um site
    // lento num site partido.
    const resposta = await pagina.goto(url, { timeout: TIMEOUT, waitUntil: "domcontentloaded" });
    sinais.http_status = resposta?.status() ?? null;
    sinais.final_url = pagina.url();
    sinais.has_https = sinais.final_url.startsWith("https://");

    // Um instante para o JS pintar o que tiver a pintar; sem isto os sites
    // renderizados no cliente pareceriam vazios e passavam por parqueados.
    await pagina.waitForTimeout(1200);

    const medido = await pagina.evaluate(() => {
      const texto = document.body?.innerText ?? "";
      const anos = [...texto.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,25}((?:19|20)\d{2})/gi)]
        .map((m) => Number(m[1]))
        .filter((a) => a >= 1990 && a <= new Date().getFullYear() + 1);
      return {
        has_viewport: !!document.querySelector('meta[name="viewport"]'),
        // scrollWidth > innerWidth = a pagina obriga a arrastar de lado num
        // telemovel. E o defeito que um cliente nota em dois segundos.
        overflow_x: (document.documentElement?.scrollWidth ?? 0) > window.innerWidth + 2,
        meta_generator: document.querySelector('meta[name="generator"]')?.content ?? null,
        // O MAIOR ano encontrado: "© 2015-2024" e um site de 2024, nao de 2015.
        footer_year: anos.length ? Math.max(...anos) : null,
        tem_form: !!document.querySelector("form"),
        tem_contacto: !!document.querySelector('a[href^="tel:"], a[href^="mailto:"]'),
        tem_jsonld: !!document.querySelector('script[type="application/ld+json"]'),
        num_imagens: document.querySelectorAll("img").length,
        texto: texto.slice(0, 20000),
        nLinks: document.querySelectorAll("a[href]").length,
      };
    });
    Object.assign(sinais, medido);
    sinais.parqueado = ehParqueado({ texto: medido.texto, nLinks: medido.nLinks });
    delete sinais.texto;
    delete sinais.nLinks;
  } catch (e) {
    sinais.erro = String(e.message).split("\n")[0].slice(0, 200);
  }
  return { pagina, sinais };
}

const PRAZO_SITE = 60000;

/** recolherSinais com prazo. Passado o prazo fecha a pagina e devolve um
 *  erro de timeout, que o classificar() trata como qualquer site que nao
 *  abriu. A pagina encravada e fechada a forca para libertar o browser. */
async function comPrazo(contexto, url) {
  const trabalho = recolherSinais(contexto, url);
  let relogio;
  const prazo = new Promise((ok) => { relogio = setTimeout(() => ok(null), PRAZO_SITE); });
  const r = await Promise.race([trabalho, prazo]);
  clearTimeout(relogio);
  if (r) return r;
  for (const p of contexto.pages()) await comLimite(p.close({ runBeforeUnload: false }).catch(() => {}), 5000);
  trabalho.catch(() => {});
  return {
    pagina: { close: async () => {}, screenshot: async () => { throw new Error("prazo"); } },
    sinais: { website: url, erro: `Timeout: o site prendeu o browser mais de ${PRAZO_SITE / 1000}s` },
  };
}

/* ──────────────────────────── leitura das leads ─────────────────────────── */

async function carregarLeads(sb, tabela, limite) {
  let q = sb.from(tabela)
    .select("place_id, nome, website, site_state")
    .is("audited_at", null)
    // ARMADILHA: NAO usar .neq("site_state", "none").
    //
    // Depois do discovery, site_state so esta preenchido nos casos obvios:
    // 'none' quando nao ha website e 'social_only' quando o website e um
    // perfil de rede social. Os sites normais — que sao a maioria e os que
    // mais interessam — ficam a NULL.
    //
    // Em SQL, NULL <> 'none' avalia a NULL, e o WHERE trata NULL como falso.
    // Um .neq('site_state','none') excluiria portanto TODAS as linhas a NULL:
    // o audit saltaria os sites normais e processaria so os social_only, sem
    // um unico erro visivel. O relatorio final diria "auditados: 40" e
    // pareceria bem.
    .or("site_state.is.null,site_state.neq.none")
    .order("num_reviews", { ascending: false, nullsFirst: false });
  if (limite) q = q.limit(limite);
  const { data, error } = await q;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ?? [];
}

/* ──────────────────────────────── principal ─────────────────────────────── */

async function principal() {
  const args = lerArgs(process.argv);

  let leads;
  let sb = null, tabela = null;
  if (args.urls) {
    const linhas = fs.readFileSync(args.urls, "utf8").split(/\r?\n/)
      .map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    leads = linhas.map((u, i) => ({ place_id: `teste-${i}`, nome: `(teste ${i})`, website: u, site_state: null }));
    console.log(`\nAudit em modo TESTE: ${leads.length} URLs de ${args.urls}, sem base de dados.`);
  } else {
    sb = clienteSupabase();
    tabela = nomeTabela(args.nicho);
    leads = await carregarLeads(sb, tabela, args.limite);
    console.log(`\nAudit: ${nf(leads.length)} leads por auditar em ${tabela}`);
  }

  if (!leads.length) { console.log("  Nada a fazer.\n"); return; }

  const semSite = leads.filter((l) => !l.website);
  const comSite = leads.filter((l) => l.website);
  console.log(`  ${nf(comSite.length)} com website · ${nf(semSite.length)} sem website (nao precisam de browser)`);
  console.log(`  ${args.conc} em paralelo · timeout ${TIMEOUT / 1000}s · viewport ${IPHONE.viewport.width}x${IPHONE.viewport.height}`);
  console.log(`  screenshot a partir da nota ${args.minScreenshot}\n`);

  const dirShots = path.join("screenshots", args.nicho ?? "teste");
  fs.mkdirSync(dirShots, { recursive: true });

  const navegador = await chromium.launch();
  const resultados = [];
  let feitos = 0;

  /* ---- escrita aos poucos ----
     Gravar so no fim perdia a corrida inteira quando o processo morria a
     meio — e em Viseu morreu duas vezes, no ultimo site, sem gravar nada.
     Agora grava de LOTE em LOTE: se parar, o mesmo comando retoma, porque o
     carregarLeads so apanha linhas com audited_at a null. As escritas ficam
     em fila para dois trabalhadores nunca escreverem ao mesmo tempo. */
  const LOTE = 20;
  let pendentes = [];
  let filaEscrita = Promise.resolve();
  const gravarPendentes = () => {
    if (!sb || !pendentes.length) return filaEscrita;
    const lote = pendentes;
    pendentes = [];
    filaEscrita = filaEscrita.then(() => gravar(sb, tabela, lote));
    return filaEscrita;
  };

  async function trabalhador() {
    const contexto = await navegador.newContext({
      ...IPHONE,
      ignoreHTTPSErrors: true, // um certificado expirado e um sinal, nao um impedimento
      locale: "pt-PT",
    });
    for (;;) {
      const lead = comSite.shift();
      if (!lead) break;
      // Prazo por site. O goto tem timeout, mas o page.evaluate nao: um site
      // com um script que prende o browser deixava-o a esperar para sempre, e
      // como a escrita so acontece no fim, a corrida inteira perdia-se sem
      // erro nenhum. Aconteceu em Viseu a 19/09/2026.
      const { pagina, sinais } = await comPrazo(contexto, lead.website);
      const estado = classificar(sinais);
      const nota = notaProvisoria(sinais);

      let screenshot = null;
      if (nota >= args.minScreenshot && !sinais.erro) {
        try {
          screenshot = path.join(dirShots, `${lead.place_id}.png`);
          await pagina.screenshot({ path: screenshot, timeout: 10000 });
        } catch { screenshot = null; }
      }
      await comLimite(pagina.close().catch(() => {}), 5000);

      const r = { lead, sinais, estado, nota, screenshot };
      resultados.push(r);
      pendentes.push(r);
      if (pendentes.length >= LOTE) await gravarPendentes();
      process.stdout.write(`\r  ${nf(++feitos)}/${nf(total)}...`);
    }
    await comLimite(contexto.close(), 10000);
  }

  const total = comSite.length;
  await Promise.all(Array.from({ length: Math.min(args.conc, comSite.length) }, trabalhador));
  await comLimite(navegador.close(), 15000);
  process.stdout.write("\r");

  // As leads sem website nao precisam de browser, mas precisam de ficar
  // marcadas como auditadas — senao ficam para sempre no lote seguinte.
  for (const lead of semSite) {
    const r = { lead, sinais: { website: null }, estado: "none", nota: 5, screenshot: null };
    resultados.push(r);
    pendentes.push(r);
  }

  if (sb) {
    process.stdout.write(`A gravar as ultimas ${nf(pendentes.length)}... `);
    await gravarPendentes();
    console.log(`feito. ${nf(resultados.length)} auditorias gravadas.`);
  }

  relatorio(resultados, args);
  // Um browser que nao fechou dentro do prazo deixava o node vivo para sempre.
  process.exit(0);
}

/** Espera por uma promessa, mas no maximo `ms`. Para fechos de pagina,
 *  contexto e browser, que nao tem timeout proprio e podem nunca responder. */
function comLimite(promessa, ms) {
  let relogio;
  return Promise.race([
    promessa,
    new Promise((ok) => { relogio = setTimeout(ok, ms); }),
  ]).finally(() => clearTimeout(relogio));
}

async function gravar(sb, tabela, resultados) {
  const agora = new Date().toISOString();
  const linhas = resultados.map(({ lead, sinais, estado, screenshot }) => ({
    place_id: lead.place_id,
    site_state: estado,
    http_status: sinais.http_status ?? null,
    final_url: sinais.final_url ?? null,
    has_https: sinais.has_https ?? null,
    has_viewport: sinais.has_viewport ?? null,
    overflow_x: sinais.overflow_x ?? null,
    meta_generator: sinais.meta_generator ?? null,
    footer_year: sinais.footer_year ?? null,
    tem_form: sinais.tem_form ?? null,
    tem_contacto: sinais.tem_contacto ?? null,
    tem_jsonld: sinais.tem_jsonld ?? null,
    num_imagens: sinais.num_imagens ?? null,
    parqueado: sinais.parqueado ?? null,
    audit_extra: sinais.erro ? { erro: sinais.erro } : {},
    screenshot,
    audited_at: agora,
    atualizado_em: agora,
  }));
  for (let i = 0; i < linhas.length; i += 500) {
    const { error } = await sb.from(tabela).upsert(linhas.slice(i, i + 500), { onConflict: "place_id" });
    if (error) throw new Error(`Supabase: ${error.message}`);
  }
}

/* ─────────────────────────────── relatorio ──────────────────────────────── */

function relatorio(resultados, args) {
  const porEstado = {};
  const porNota = {};
  for (const r of resultados) {
    porEstado[r.estado] = (porEstado[r.estado] ?? 0) + 1;
    porNota[r.nota] = (porNota[r.nota] ?? 0) + 1;
  }
  const shots = resultados.filter((r) => r.screenshot).length;
  const erros = resultados.filter((r) => r.sinais.erro).length;

  console.log(`
${"=".repeat(72)}
AUDIT — ${resultados.length} sites
${"=".repeat(72)}

  POR ESTADO`);
  for (const e of ["none", "broken", "social_only", "legacy", "modern"]) {
    if (porEstado[e]) console.log(`    ${String(porEstado[e]).padStart(5)}  ${e}`);
  }
  console.log(`
  POR NOTA (provisoria — a definitiva sai do score.sql)`);
  for (let n = 5; n >= 0; n--) {
    if (porNota[n]) console.log(`    ${String(porNota[n]).padStart(5)}  ${n}`);
  }
  console.log(`
  screenshots ....... ${nf(shots)}  (nota >= ${args.minScreenshot})
  erros de navegacao  ${nf(erros)}
`);

  if (args.urls) {
    console.log("  DETALHE\n");
    for (const r of resultados) {
      const s = r.sinais;
      console.log(`  [${r.nota}] ${r.estado.padEnd(12)} ${s.website}`);
      if (s.erro) { console.log(`        erro: ${s.erro}\n`); continue; }
      const f = falhasGraves(s);
      console.log(`        http ${s.http_status} -> ${s.final_url?.slice(0, 70)}`);
      console.log(`        https=${s.has_https} viewport=${s.has_viewport} overflow=${s.overflow_x} ` +
                  `jsonld=${s.tem_jsonld} form=${s.tem_form} contacto=${s.tem_contacto}`);
      console.log(`        rodape=${s.footer_year ?? "-"} generator=${s.meta_generator ?? "-"} ` +
                  `imgs=${s.num_imagens} parqueado=${s.parqueado}`);
      if (f.length) console.log(`        falhas graves (${f.length}): ${f.join(" · ")}`);
      if (r.screenshot) console.log(`        screenshot: ${r.screenshot}`);
      console.log("");
    }
  }
}

principal().catch((e) => {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
});
