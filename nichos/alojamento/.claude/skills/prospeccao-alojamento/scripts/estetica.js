#!/usr/bin/env node
/**
 * estetica.js — a passagem de estética, depois do audit do motor.
 *
 *   node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/estetica.js \
 *        [--conc 4] [--limite N] [--urls ficheiro.txt]
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PORQUE EXISTE
 *
 * O audit do motor mede defeitos técnicos: https, telemóvel, rodapé, contacto.
 * Um site pode passar em todos e ser feio. Olhar para screenshots de centenas
 * de sites não é opção, por isso este script procura sinais que, no código,
 * andam quase sempre com um site feio. Não decide nada: escreve os sinais em
 * `sinais_feio` e o trigger do crm.sql põe a casa em "por decidir" quando há
 * dois ou mais E a casa tem 25 ou mais avaliações. Quem decide é o Diogo, a
 * olhar para a fotografia.
 *
 * Os quatro sinais (a letra por defeito ficou de fora de propósito: há sites
 * bons com Arial):
 *
 *   1. fotos pixelizadas   imagens grandes esticadas acima do tamanho real
 *   2. template            tema por defeito, "My Site", lorem ipsum, contactos
 *                          de exemplo, tecnologia de outra década
 *   3. parede de texto     muito texto e quase nenhuma imagem
 *   4. pesada ou lenta     muitos MB, ou mais de 10 s até acabar de carregar
 *
 * Também confirma os "parqueados" do motor. O motor marca como parqueada uma
 * página com pouco texto E poucos links, o que apanha domínios à venda mas
 * também sites feitos só com imagens. Aqui só conta como parqueado com a frase
 * à vista ("domínio à venda", "em construção"...). Sem a frase fica dúvida, e
 * a dúvida sobe para ele.
 *
 * Visita só o que precisa: sites `modern` (os que podiam passar por bons) e
 * sites marcados como parqueados. Os `legacy` já são site mau e não precisam.
 *
 * NÃO TOCA em `.claude/skills/lead-scraper/`. Importa de lá, só de leitura.
 */

import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PACOTE = path.resolve(AQUI, "..");
const RAIZ_REPO = path.resolve(PACOTE, "..", "..", "..", "..", "..");
const MOTOR = path.join(RAIZ_REPO, ".claude", "skills", "lead-scraper");
const LIB = pathToFileURL(path.join(MOTOR, "scripts", "lib") + path.sep).href;

await import(LIB + "arranque.js");   // cwd passa a ser a pasta do motor, e lê o .env
const db = await import(LIB + "db.js");
const site = await import(LIB + "site.js");
const { chromium, devices } = createRequire(path.join(MOTOR, "package.json"))("playwright");

const NICHO = "alojamento";
const TIMEOUT = 20000;
const nf = (n) => Number(n).toLocaleString("pt-PT");

/* O mesmo iPhone do audit.js: os sinais têm de ser medidos no mesmo ecrã. */
const IPHONE = {
  ...(devices["iPhone 14"] ?? {}),
  viewport: { width: 390, height: 844 },
  isMobile: true, hasTouch: true, deviceScaleFactor: 3,
};

/* ─────────────────────────────── limiares ──────────────────────────────── */

/** Uma imagem conta como "grande" a partir desta largura no ecrã, em px CSS. */
const IMG_GRANDE_PX = 150;
/** Pixelizada = o ficheiro tem menos píxeis do que o espaço onde é mostrado,
 *  mesmo contando o ecrã a 1x. A 3x do iPhone ficava ainda pior. */
const FRACAO_PIXELIZADAS = 0.4;
const PAREDE_TEXTO_CHARS = 4000;
const PAREDE_MAX_IMAGENS = 1;
const PESADA_MB = 6;
const LENTA_S = 10;

/* ──────────────────────────────── argumentos ────────────────────────────── */

function lerArgs(argv) {
  const a = { conc: 4 };
  for (let i = 0; i < argv.length; i++) {
    const [k, v] = [argv[i], argv[i + 1]];
    switch (k) {
      case "--conc":   a.conc = Number(v); i++; break;
      case "--limite": a.limite = Number(v); i++; break;
      case "--urls":   a.urls = v; i++; break;
      default:
        if (k.startsWith("--")) { console.error(`Argumento desconhecido: ${k}`); process.exit(1); }
    }
  }
  return a;
}

/* ──────────────────────────── medir uma página ─────────────────────────── */

/**
 * `page.evaluate` que sobrevive a um redireccionamento a meio. Muitos sites
 * saltam para /pt/ ou para a página de cookies depois de abrir, e isso destrói
 * o contexto onde o código estava a correr. Espera a página nova e tenta mais
 * uma vez; à segunda, o erro é verdadeiro.
 */
async function avaliar(pagina, fn, arg) {
  try { return await pagina.evaluate(fn, arg); }
  catch (e) {
    if (!/context was destroyed|navigat/i.test(e.message)) throw e;
    await pagina.waitForLoadState("load", { timeout: LENTA_S * 1000 }).catch(() => {});
    await pagina.waitForTimeout(800);
    return await pagina.evaluate(fn, arg);
  }
}

async function medir(contexto, url) {
  const pagina = await contexto.newPage();
  let bytes = 0;
  pagina.on("requestfinished", async (req) => {
    try { const s = await req.sizes(); bytes += s.responseBodySize + s.responseHeadersSize; }
    catch { /* pedido cancelado: não conta */ }
  });

  const r = { erro: null, lento: false, segundos: null, mb: null };
  const t0 = Date.now();
  try {
    await pagina.goto(url, { timeout: TIMEOUT, waitUntil: "domcontentloaded" });
    try {
      await pagina.waitForLoadState("load", { timeout: LENTA_S * 1000 });
      r.segundos = (Date.now() - t0) / 1000;
    } catch {
      r.lento = true;               // não acabou de carregar em 10 s
      r.segundos = LENTA_S;
    }

    // Descer a página devagar para as imagens "lazy" carregarem, e voltar
    // ao topo para a fotografia ser a primeira coisa que um cliente vê.
    await avaliar(pagina, async () => {
      const passo = window.innerHeight;
      for (let y = 0; y < Math.min(document.body.scrollHeight, 12 * passo); y += passo) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 150));
      }
      window.scrollTo(0, 0);
    });
    await pagina.waitForTimeout(800);

    Object.assign(r, await avaliar(pagina, (cfg) => {
      const visivel = (el) => {
        const b = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };

      /* fotos: <img> grandes, e fundos com imagem em blocos grandes */
      const imgs = [...document.images].filter((i) => visivel(i) && i.clientWidth >= cfg.IMG_GRANDE_PX);
      const carregadas = imgs.filter((i) => i.complete && i.naturalWidth > 0);
      const pixelizadas = carregadas.filter((i) => i.naturalWidth < i.clientWidth).length;
      let fundos = 0;
      for (const el of [...document.querySelectorAll("body *")].slice(0, 3000)) {
        if (el.clientWidth >= cfg.IMG_GRANDE_PX && getComputedStyle(el).backgroundImage.includes("url(")) fundos++;
      }

      const html = document.documentElement.outerHTML;
      const texto = document.body?.innerText ?? "";
      const og = document.querySelector('meta[property="og:site_name"]')?.content ?? "";

      /* template por defeito ou nunca preenchido */
      const template = [];
      if (/\/wp-content\/themes\/twenty[a-z-]*\//i.test(html)) template.push("tema por defeito do WordPress");
      if (/^\s*my site\s*$/i.test(og) || /\|\s*my site\s*$/i.test(document.title)) template.push('Wix por configurar ("My Site")');
      if (/just another wordpress site|olá,? mundo!|hello world!/i.test(texto)) template.push("texto de exemplo do WordPress");
      if (/lorem ipsum/i.test(texto)) template.push("lorem ipsum");
      if (/email@domain\.com|example@example\.com|\+?123[ .-]?123[ .-]?1234/i.test(texto)) template.push("contactos de exemplo");

      /* tecnologia de outra década */
      const antiga = [];
      const jq = window.jQuery?.fn?.jquery;
      if (jq && /^1\.[0-8]\./.test(jq)) antiga.push(`jQuery ${jq}`);
      if (/\.aspx(\?|"|'|#)/i.test(html)) antiga.push(".aspx");
      if (/index\.php\?option=com_/i.test(html)) antiga.push("Joomla antigo");
      if (/\.swf["'?]/i.test(html)) antiga.push("Flash");
      if (document.querySelector("font, marquee, center, frameset")) antiga.push("HTML dos anos 2000");
      const gen = document.querySelector('meta[name="generator"]')?.content ?? "";
      if (/wordpress\s*5\./i.test(gen)) antiga.push(gen);

      return {
        imgGrandes: imgs.length, imgCarregadas: carregadas.length, pixelizadas, fundos,
        chars: texto.trim().length, template, antiga,
        textoCurto: texto.slice(0, 20000),
      };
    }, { IMG_GRANDE_PX }));
  } catch (e) {
    r.erro = String(e.message).split("\n")[0].slice(0, 200);
  }
  r.mb = bytes / 1e6;
  return { pagina, r };
}

/**
 * medir() com prazo. O page.evaluate não tem timeout, e um site com um script
 * que prende o browser deixava a passagem inteira à espera para sempre — foi o
 * que aconteceu ao audit.js em Viseu. Passado o prazo, fecha a página à força
 * e conta como erro: a casa fica sem sinais, e não com sinais inventados.
 */
const PRAZO_SITE = 60000;

/** Espera por uma promessa, mas no máximo `ms`. Para os fechos de página,
 *  contexto e browser, que não têm timeout próprio e podem nunca responder. */
function comLimite(promessa, ms) {
  let relogio;
  return Promise.race([
    promessa,
    new Promise((ok) => { relogio = setTimeout(ok, ms); }),
  ]).finally(() => clearTimeout(relogio));
}

async function medirComPrazo(contexto, url) {
  const trabalho = medir(contexto, url);
  let relogio;
  const prazo = new Promise((ok) => { relogio = setTimeout(() => ok(null), PRAZO_SITE); });
  const r = await Promise.race([trabalho, prazo]);
  clearTimeout(relogio);
  if (r) return r;
  for (const p of contexto.pages()) await comLimite(p.close({ runBeforeUnload: false }).catch(() => {}), 5000);
  trabalho.catch(() => {});
  return {
    pagina: { close: async () => {}, screenshot: async () => { throw new Error("prazo"); } },
    r: { erro: `o site prendeu o browser mais de ${PRAZO_SITE / 1000}s`, mb: 0 },
  };
}

/** Transforma as medidas em sinais, em português, prontos para a tabela. */
function sinaisDe(r) {
  const s = [];
  if (r.imgCarregadas >= 2 && r.pixelizadas / r.imgCarregadas >= FRACAO_PIXELIZADAS) {
    s.push(`fotos pixelizadas (${r.pixelizadas} de ${r.imgCarregadas})`);
  }
  const tpl = [...(r.template ?? []), ...(r.antiga ?? [])];
  if (tpl.length) s.push(`template ou tecnologia antiga: ${tpl.join(", ")}`);
  if (r.chars >= PAREDE_TEXTO_CHARS && r.imgGrandes + r.fundos <= PAREDE_MAX_IMAGENS) {
    s.push(`parede de texto (${nf(r.chars)} caracteres, ${r.imgGrandes + r.fundos} imagens)`);
  }
  if (r.mb >= PESADA_MB || r.lento) {
    s.push(r.lento
      ? `lenta (mais de ${LENTA_S} s a carregar)`
      : `pesada (${r.mb.toFixed(1).replace(".", ",")} MB)`);
  }
  return s;
}

/* ──────────────────────────────── principal ─────────────────────────────── */

async function carregarLeads(sb, tabela, limite) {
  let q = sb.from(tabela)
    .select("place_id, nome, website, final_url, site_state, parqueado, num_reviews")
    .is("estetica_em", null)
    .not("website", "is", null)
    .or("site_state.eq.modern,parqueado.is.true")
    .order("num_reviews", { ascending: false, nullsFirst: false });
  if (limite) q = q.limit(limite);
  const { data, error } = await q;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ?? [];
}

async function principal() {
  const args = lerArgs(process.argv.slice(2));
  const tabela = db.nomeTabela(NICHO);
  let sb = null;
  let leads;

  if (args.urls) {
    leads = fs.readFileSync(path.resolve(RAIZ_REPO, args.urls), "utf8").split(/\r?\n/)
      .map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
      .map((u, i) => ({ place_id: `teste-${i}`, nome: `(teste ${i})`, website: u, site_state: "modern" }));
    console.log(`\nEstética em modo TESTE: ${leads.length} URLs, sem base de dados.`);
  } else {
    sb = db.clienteSupabase();
    leads = await carregarLeads(sb, tabela, args.limite);
    console.log(`\nEstética: ${nf(leads.length)} sites por ver em ${tabela}`);
  }
  if (!leads.length) { console.log("  Nada a fazer.\n"); return; }

  const dirShots = path.join("screenshots", NICHO);
  fs.mkdirSync(dirShots, { recursive: true });

  const navegador = await chromium.launch();
  const fila = [...leads];
  const resultados = [];
  let feitos = 0;

  async function trabalhador() {
    const contexto = await navegador.newContext({ ...IPHONE, ignoreHTTPSErrors: true, locale: "pt-PT" });
    for (;;) {
      const lead = fila.shift();
      if (!lead) break;
      const { pagina, r } = await medirComPrazo(contexto, lead.final_url || lead.website);
      const sinais = r.erro ? [] : sinaisDe(r);

      let duvida = null;
      if (lead.parqueado) {
        // Com nLinks alto, o ehParqueado do motor só responde true pela frase.
        const frase = site.ehParqueado({ texto: r.textoCurto ?? "", nLinks: 999 });
        if (!frase) duvida = "o robô achou-o parqueado só por ter pouco texto: pode ser um site feito de imagens";
      }

      // Fotografia só de quem vai ser olhado: dúvida, ou sinais bastantes numa
      // casa com clientes. É a mesma conta do trigger, para não fotografar à toa.
      const vaiSerVisto = duvida || (sinais.length >= 2 && (lead.num_reviews ?? 0) >= 25) || args.urls;
      let screenshot = null;
      if (vaiSerVisto && !r.erro) {
        try {
          screenshot = path.join(dirShots, `${lead.place_id}.png`);
          await pagina.screenshot({ path: screenshot, timeout: 10000 });
        } catch { screenshot = null; }
      }
      await comLimite(pagina.close().catch(() => {}), 5000);

      // Grava já, casa a casa. Gravar só no fim perdia a passagem inteira se
      // o processo morresse a meio, que foi o que aconteceu ao audit.js em
      // Viseu. Se parar, o mesmo comando retoma: só apanha estetica_em a null.
      //
      // Um site que não abriu NESTA passagem não fica marcado como visto: sem
      // sinais, o trigger dava-o como bom. Fica "por auditar" e volta na
      // próxima corrida.
      if (sb && !r.erro) {
        const agora = new Date().toISOString();
        const linha = { sinais_feio: sinais, duvida_script: duvida, estetica_em: agora, atualizado_em: agora };
        if (screenshot) linha.screenshot = screenshot;
        const { error } = await sb.from(tabela).update(linha).eq("place_id", lead.place_id);
        if (error) throw new Error(`Supabase: ${error.message}`);
      }

      resultados.push({ lead, r, sinais, duvida, screenshot });
      process.stdout.write(`\r  ${nf(++feitos)}/${nf(leads.length)}...`);
    }
    await comLimite(contexto.close(), 10000);
  }

  await Promise.all(Array.from({ length: Math.min(args.conc, leads.length) }, trabalhador));
  await comLimite(navegador.close(), 15000);
  process.stdout.write("\r");

  if (sb) {
    console.log(`Gravadas ${nf(resultados.filter((x) => !x.r.erro).length)} casas.`);
  }

  /* ---- relatório ---- */
  const contar = (f) => resultados.filter(f).length;
  console.log(`
${"=".repeat(72)}
ESTÉTICA — ${resultados.length} sites
${"=".repeat(72)}
  sem nenhum sinal .............. ${nf(contar((x) => !x.r.erro && x.sinais.length === 0))}
  1 sinal ....................... ${nf(contar((x) => x.sinais.length === 1))}
  2 ou mais sinais .............. ${nf(contar((x) => x.sinais.length >= 2))}
    dos quais com 25+ avaliações  ${nf(contar((x) => x.sinais.length >= 2 && (x.lead.num_reviews ?? 0) >= 25))}  → por decidir
  parqueados postos em dúvida ... ${nf(contar((x) => x.duvida))}
  não abriram nesta passagem .... ${nf(contar((x) => x.r.erro))}
  fotografias ................... ${nf(contar((x) => x.screenshot))}
`);
  if (args.urls) {
    for (const x of resultados) {
      console.log(`  ${x.lead.website}`);
      if (x.r.erro) { console.log(`     erro: ${x.r.erro}\n`); continue; }
      console.log(`     ${x.r.mb.toFixed(1)} MB · ${x.r.segundos}s · ${x.r.imgCarregadas} imgs grandes (${x.r.pixelizadas} pixelizadas) · ${x.r.fundos} fundos · ${x.r.chars} chars`);
      console.log(`     sinais: ${x.sinais.join(" | ") || "nenhum"}\n`);
    }
  }
}

// process.exit no fim: um browser que não fechou dentro do prazo deixava o
// node vivo para sempre.
principal().then(() => process.exit(0)).catch((e) => {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
});
