#!/usr/bin/env node
/**
 * validate-keywords.js — verifica um ficheiro keywords/<slug>.json contra as
 * regras do metodo (references/keywords-method.md).
 *
 *   node scripts/validate-keywords.js keywords/canalizacao.json [--sem-rede]
 *
 * Existe porque a conta dos sub-oficios e o limiar que dela sai nao podem
 * ficar na cabeca de quem escreveu a lista. Uma lista curta demais nao da
 * erro nenhum: a corrida termina, escreve leads, e o que falta nunca aparece.
 */

import "./lib/arranque.js";  // tem de ser o primeiro: faz chdir e so depois le o .env
import fs from "node:fs";

const REGISTOS = ["formal", "coloquial", "regional", "servico", "adjacente"];

/* ─────────────────────────────── utilitarios ────────────────────────────── */

const semAcentos = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const problemas = [];
const erro  = (regra, msg, extra) => problemas.push({ nivel: "erro",  regra, msg, extra });
const aviso = (regra, msg, extra) => problemas.push({ nivel: "aviso", regra, msg, extra });

/* ───────────────────────────── listas de deteccao ───────────────────────── */

/**
 * Toponimos portugueses comuns. Nao e exaustiva nem podia ser — ha milhares de
 * freguesias. Apanha o erro real, que e alguem escrever "canalizador Viseu"
 * achando que ajuda: a geografia vem da grelha, e um termo com nome de local
 * limita a pesquisa a um sitio que ja esta a ser coberto ponto a ponto, alem
 * de nao encontrar nada nas restantes celulas.
 */
const TOPONIMOS = new Set([
  // distritos e capitais de distrito
  "aveiro", "beja", "braga", "braganca", "castelo branco", "coimbra", "evora",
  "faro", "guarda", "leiria", "lisboa", "portalegre", "porto", "santarem",
  "setubal", "viana do castelo", "vila real", "viseu",
  // regioes e provincias historicas
  "acores", "madeira", "algarve", "alentejo", "minho", "douro", "beira",
  "beiras", "ribatejo", "estremadura", "tras-os-montes", "tras os montes",
  "alto minho", "baixo alentejo", "alto alentejo", "norte", "centro",
  // outras cidades de dimensao relevante
  "amadora", "almada", "barcelos", "cascais", "chaves", "covilha", "espinho",
  "figueira da foz", "funchal", "gondomar", "guimaraes", "lamego", "loule",
  "loures", "maia", "matosinhos", "odivelas", "oeiras", "olhao", "ovar",
  "penafiel", "ponta delgada", "portimao", "povoa de varzim", "queluz",
  "santo tirso", "seixal", "sintra", "tomar", "torres vedras", "valongo",
  "vila do conde", "vila franca de xira", "vila nova de gaia", "vila nova de famalicao",
  "albufeira", "lagos", "tavira", "silves", "sines", "elvas", "estremoz",
  "abrantes", "pombal", "alcobaca", "nazare", "peniche", "obidos", "agueda",
  "ilhavo", "marinha grande", "caldas da rainha", "rio maior", "fundao",
  "portugal",
]);

/**
 * Marcadores de portugues do Brasil que aparecem em nichos de oficios.
 * Heuristica, nao dicionario: o objectivo e apanhar o caso comum de alguem
 * gerar terminologia com o vocabulario errado. Um termo brasileiro nao da
 * erro na API — devolve zero resultados, e zero resultados parecem-se com
 * "nao ha empresas dessas na regiao".
 */
const MARCADORES_PT_BR = new Map([
  ["encanador", "canalizador"],
  ["encanamento", "canalizacao"],
  ["acougue", "talho"],
  ["acougueiro", "talhante"],
  ["faxineira", "empregada de limpeza"],
  ["faxina", "limpeza"],
  ["aluguel", "aluguer"],
  ["onibus", "autocarro"],
  ["celular", "telemovel"],
  ["caminhao", "camiao"],
  ["geladeira", "frigorifico"],
  ["sorvete", "gelado"],
  ["trem", "comboio"],
  ["banheiro", "casa de banho"],
  ["terno", "fato"],
  ["grama", "relva"],
  ["cafe da manha", "pequeno-almoco"],
  ["time", "equipa"],
  ["esporte", "desporto"],
  ["carteira de motorista", "carta de conducao"],
  ["pedagio", "portagem"],
  ["mouse", "rato"],
  ["tela", "ecra"],
]);

/* ──────────────────────────── verificacao de tipos ──────────────────────── */

/**
 * Confirma contra a API que cada includedTypes existe na Tabela A.
 *
 * Vale a pena fazer isto ao vivo em vez de manter uma copia da tabela: a
 * Google acrescenta tipos (a ultima leva foi em Fevereiro de 2026) e uma
 * lista guardada aqui envelhece em silencio. A chamada usa o mask "places.id",
 * que e o SKU Essentials (IDs Only) — gratuito e ilimitado.
 *
 * O caso que isto apanha e real: "general_contractor" e devolvido pela API
 * dentro do array types de uma empresa, mas rejeitado com 400 quando usado
 * como filtro. Descobri-lo aqui custa segundos; descobri-lo a meio de uma
 * corrida de 2400 celulas custa a corrida.
 */
async function verificarTipos(tipos) {
  const chave = process.env.GOOGLE_MAPS_API_KEY;
  if (!chave) {
    aviso("tipos", "GOOGLE_MAPS_API_KEY ausente: nao verifiquei os places_types contra a API.");
    return;
  }
  for (const tipo of tipos) {
    const corpo = {
      includedTypes: [tipo],
      maxResultCount: 1,
      locationRestriction: {
        circle: { center: { latitude: 38.7223, longitude: -9.1393 }, radius: 1000.0 },
      },
    };
    try {
      const r = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": chave,
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(20000),
      });
      if (r.status === 400) {
        const j = await r.json().catch(() => ({}));
        erro("tipos", `"${tipo}" nao e um includedTypes valido (Tabela A).`,
             j?.error?.message ?? "400 INVALID_ARGUMENT");
      } else if (!r.ok) {
        aviso("tipos", `Nao consegui verificar "${tipo}": HTTP ${r.status}.`);
      }
    } catch (e) {
      aviso("tipos", `Nao consegui verificar "${tipo}": ${e.message}`);
    }
  }
}

/* ─────────────────────────────── verificacoes ───────────────────────────── */

function verificarEstrutura(k) {
  if (typeof k.nicho !== "string" || !k.nicho.trim()) {
    erro("estrutura", 'Campo "nicho" em falta ou vazio.');
  }
  if (!Array.isArray(k.sub_oficios) || k.sub_oficios.length === 0) {
    erro("estrutura", 'Campo "sub_oficios" tem de ser um array com pelo menos um elemento.');
  }
  if (!Array.isArray(k.places_types)) {
    erro("estrutura", 'Campo "places_types" tem de ser um array (vazio e valido).');
  }
  if (typeof k.tem_tipos_diretos !== "boolean") {
    erro("estrutura", 'Campo "tem_tipos_diretos" tem de ser true ou false.');
  }
  if (!k.termos || typeof k.termos !== "object") {
    erro("estrutura", 'Campo "termos" em falta.');
    return false;
  }
  for (const r of REGISTOS) {
    if (!Array.isArray(k.termos[r])) {
      erro("estrutura", `Registo "${r}" em falta ou nao e array. Um registo vazio escreve-se [].`);
    }
  }
  const extra = Object.keys(k.termos).filter((r) => !REGISTOS.includes(r));
  if (extra.length) {
    aviso("estrutura", `Registos desconhecidos ignorados: ${extra.join(", ")}`);
  }
  return problemas.every((p) => p.nivel !== "erro");
}

function verificarCoerenciaTipos(k) {
  const temTipos = (k.places_types ?? []).length > 0;
  if (temTipos !== k.tem_tipos_diretos) {
    erro("coerencia",
      `tem_tipos_diretos=${k.tem_tipos_diretos} mas places_types tem ${k.places_types.length} entrada(s).`,
      "Este campo decide o limiar de termos; errado, valida uma lista curta demais.");
  }
}

function verificarLimiar(k) {
  const n = (k.sub_oficios ?? []).length;
  const todos = REGISTOS.flatMap((r) => k.termos?.[r] ?? []);
  const total = todos.length;
  const limiar = k.tem_tipos_diretos ? Math.max(20, 8 * n) : Math.max(35, 12 * n);
  const formula = k.tem_tipos_diretos ? `max(20, 8 x ${n})` : `max(35, 12 x ${n})`;

  if (total < limiar) {
    erro("limiar",
      `${total} termos para ${n} sub-oficio(s); o limiar e ${limiar} = ${formula}.`,
      k.tem_tipos_diretos
        ? "Faltam " + (limiar - total) + " termos."
        : "Sem tipos diretos o Nearby nao ajuda e TODA a cobertura vem do Text Search, " +
          "por isso o limiar e mais alto. Faltam " + (limiar - total) + " termos.");
  }
  return { n, total, limiar, formula, todos };
}

function verificarDuplicados(k) {
  const vistos = new Map();
  for (const r of REGISTOS) {
    for (const t of k.termos?.[r] ?? []) {
      const chave = semAcentos(String(t));
      if (vistos.has(chave)) {
        erro("duplicados",
          `"${t}" (${r}) repete "${vistos.get(chave).termo}" (${vistos.get(chave).registo}).`,
          "Termos repetidos inflacionam a contagem e gastam uma passagem por toda a grelha a devolver o mesmo.");
      } else {
        vistos.set(chave, { termo: t, registo: r });
      }
    }
  }
}

function verificarToponimos(k) {
  for (const r of REGISTOS) {
    for (const t of k.termos?.[r] ?? []) {
      const norm = semAcentos(String(t));
      for (const topo of TOPONIMOS) {
        const re = new RegExp(`(^|\\s)${topo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`);
        if (re.test(norm)) {
          erro("toponimo", `"${t}" (${r}) contem o topónimo "${topo}".`,
            "A geografia vem da grelha. Um termo com nome de local devolve zero em todas " +
            "as celulas fora desse local e nao acrescenta nada dentro dele.");
          break;
        }
      }
      if (/\s(em|no|na|de|do|da)\s+[A-Z]/.test(String(t))) {
        aviso("toponimo", `"${t}" (${r}) parece ter um nome proprio depois de preposicao.`,
          "Confirma que nao e um local.");
      }
    }
  }
}

function verificarPortugues(k) {
  for (const r of REGISTOS) {
    for (const t of k.termos?.[r] ?? []) {
      const norm = semAcentos(String(t));
      for (const [br, pt] of MARCADORES_PT_BR) {
        const re = new RegExp(`(^|\\s)${br}($|\\s)`);
        if (re.test(norm)) {
          erro("pt-pt", `"${t}" (${r}) usa "${br}", que e portugues do Brasil.`,
            `Em Portugal diz-se "${pt}". Um termo brasileiro nao da erro: devolve zero, ` +
            `e zero parece-se com "nao ha empresas dessas na regiao".`);
        }
      }
    }
  }
}

function verificarPlurais(k) {
  const todos = REGISTOS.flatMap((r) => (k.termos?.[r] ?? []).map((t) => [r, String(t)]));
  const porNorma = new Map(todos.map(([r, t]) => [semAcentos(t), { r, t }]));
  for (const [r, t] of todos) {
    const n = semAcentos(t);
    for (const sufixo of ["s", "es"]) {
      if (n.endsWith(sufixo)) {
        const singular = n.slice(0, -sufixo.length);
        if (porNorma.has(singular)) {
          const o = porNorma.get(singular);
          aviso("plural", `"${t}" (${r}) e o plural de "${o.t}" (${o.r}).`,
            "O Places nao distingue: o plural gasta uma passagem pela grelha inteira " +
            "para devolver praticamente o mesmo conjunto.");
        }
      }
    }
  }
}

function verificarHigiene(k) {
  for (const r of REGISTOS) {
    for (const t of k.termos?.[r] ?? []) {
      if (typeof t !== "string") {
        erro("higiene", `Registo "${r}" tem um elemento que nao e string: ${JSON.stringify(t)}`);
        continue;
      }
      if (t !== t.trim()) erro("higiene", `"${t}" (${r}) tem espacos no inicio ou no fim.`);
      if (!t.trim()) erro("higiene", `Registo "${r}" tem uma string vazia.`);
      else if (t.trim().length < 3) erro("higiene", `"${t}" (${r}) tem menos de 3 caracteres.`);
      if (/\d/.test(t)) aviso("higiene", `"${t}" (${r}) contem digitos.`);
      if (/[",;|]/.test(t)) aviso("higiene", `"${t}" (${r}) contem pontuacao invulgar num termo de pesquisa.`);
    }
  }
}

function verificarRegistosVazios(k) {
  const vazios = REGISTOS.filter((r) => (k.termos?.[r] ?? []).length === 0);
  if (!vazios.length) return vazios;

  const notas = String(k.notas ?? "").trim();
  if (notas.length < 20) {
    erro("registo-vazio",
      `Registo(s) vazio(s): ${vazios.join(", ")} — e "notas" nao explica porque.`,
      "Um registo pode legitimamente ficar vazio: uma clinica veterinaria urbana nao tem " +
      "variante regional viva. Mas a distincao entre 'nao existe' e 'esqueci-me' tem de " +
      "ficar escrita, senao ninguem sabe se a lista esta completa.");
  }
  return vazios;
}

/* ──────────────────────────────── principal ─────────────────────────────── */

async function principal() {
  const args = process.argv.slice(2);
  const semRede = args.includes("--sem-rede");
  const caminho = args.find((a) => !a.startsWith("--"));

  if (!caminho) {
    console.error("Uso: node scripts/validate-keywords.js keywords/<slug>.json [--sem-rede]");
    process.exit(1);
  }
  if (!fs.existsSync(caminho)) {
    console.error(`Ficheiro nao encontrado: ${caminho}`);
    process.exit(1);
  }

  let k;
  try {
    k = JSON.parse(fs.readFileSync(caminho, "utf8"));
  } catch (e) {
    console.error(`JSON invalido em ${caminho}: ${e.message}`);
    process.exit(1);
  }

  console.log(`\nA validar ${caminho}`);

  const estruturaOk = verificarEstrutura(k);
  let resumo = null;
  let vazios = [];

  if (estruturaOk) {
    verificarCoerenciaTipos(k);
    resumo = verificarLimiar(k);
    verificarDuplicados(k);
    verificarToponimos(k);
    verificarPortugues(k);
    verificarPlurais(k);
    verificarHigiene(k);
    vazios = verificarRegistosVazios(k);

    if (!semRede && (k.places_types ?? []).length) {
      process.stdout.write(`  a verificar ${k.places_types.length} places_types contra a API... `);
      await verificarTipos(k.places_types);
      console.log("feito.");
    } else if (semRede) {
      aviso("tipos", "--sem-rede: os places_types nao foram verificados contra a API.");
    }
  }

  /* ---- relatorio ---- */
  if (resumo) {
    console.log(`
  nicho ................. ${k.nicho}
  sub-oficios ........... ${resumo.n}  (${k.sub_oficios.join(", ")})
  places_types .......... ${k.places_types.length ? k.places_types.join(", ") : "(nenhum)"}
  tem_tipos_diretos ..... ${k.tem_tipos_diretos}
  termos por registo .... ${REGISTOS.map((r) => `${r} ${(k.termos[r] ?? []).length}`).join(" · ")}
  total ................. ${resumo.total}  (limiar ${resumo.limiar} = ${resumo.formula})${vazios.length ? `
  registos vazios ....... ${vazios.join(", ")}` : ""}`);
  }

  const erros = problemas.filter((p) => p.nivel === "erro");
  const avisos = problemas.filter((p) => p.nivel === "aviso");

  const mostrar = (lista, etiqueta) => {
    if (!lista.length) return;
    console.log(`\n  ${etiqueta} (${lista.length}):`);
    for (const p of lista) {
      console.log(`    [${p.regra}] ${p.msg}`);
      if (p.extra) console.log(`        ${p.extra}`);
    }
  };
  mostrar(erros, "ERROS");
  mostrar(avisos, "AVISOS");

  if (erros.length) {
    console.log(`\n  REPROVADO — ${erros.length} erro(s), ${avisos.length} aviso(s).\n`);
    process.exit(1);
  }
  console.log(`\n  APROVADO${avisos.length ? ` — com ${avisos.length} aviso(s)` : ""}.\n`);
}

principal().catch((e) => {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
});
