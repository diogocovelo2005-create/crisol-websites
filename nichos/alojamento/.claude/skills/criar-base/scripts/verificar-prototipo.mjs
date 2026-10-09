#!/usr/bin/env node
/*
  Verificação automática de uma base ou do site final, num browser real.

  Uso:
    node verificar-prototipo.mjs <ficheiro.html> <BRIEF.md> [<pasta-fotos>] [--prototipo]
    node verificar-prototipo.mjs http://localhost:3000 <BRIEF.md>

  --prototipo: o protótipo é estático; qualquer <script> é falha. Tem de
  abrir com o primeiro ecrã fixo (references/primeiro-ecra.html): a foto
  da secção 1 do BRIEF a cobrir o ecrã, um h1 e o cabeçalho com o nome
  (ou o logótipo) no canto superior esquerdo, no computador e no telemóvel.
  Com um endereço (o site Next.js a correr), saltam as verificações do
  ficheiro (fotos do pacote, recursos externos) e fica o resto. Usa sempre
  localhost e nunca 127.0.0.1: o Next.js não hidrata em 127.0.0.1.

  Confere o que não precisa de juízo:
  - citações do brief presentes à letra;
  - números, telefones e emails do texto visível existem no brief;
  - fotos referenciadas existem e vêm do pacote; recursos externos permitidos;
  - sem travessões longos no texto visível;
  - ecrãs de conteúdo (a altura sem o scroll preso), ecrãs vazios, erros
    de consola;
  - scroll preso: o percurso que as sequências sticky acrescentam (aviso
    acima de 6 ecrãs); durante cada uma, o ecrã não pode ficar vazio;
  - revelações ligadas ao scroll (atributo data-revelacao, de 0 a 1): com
    o topo a 90% do ecrã ainda não podem ter passado de 0.5, e com o
    centro a meio do ecrã já têm de estar perto de 1;
  - scroll horizontal no telemóvel;
  - o primeiro ecrã e o cabeçalho, nos protótipos (ver --prototipo);
  - texto escondido com movimento reduzido.

  Sai com código 0 se passar e 2 se houver falhas. Também exporta
  verificar() para o fechar-prototipos.mjs.
*/

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HOSTS_PERMITIDOS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const MAX_ECRAS = 13; // ecrãs de conteúdo, sem o scroll preso
const MAX_PRESO = 6; // ecrãs de scroll preso: acima disto é aviso
const MIN_OCUPACAO_PRESA = 0.4;

// Minúsculas: o innerText aplica text-transform (versaletes, maiúsculas).
const normalizar = (t) => t.replace(/[“”«»„"]/g, '"').replace(/[‘’`´]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

// Cada citação do brief, partida nos cortes explícitos ([…] ou …).
function citacoesDoBrief(brief) {
  const citacoes = [];
  for (const linha of brief.split('\n')) {
    const m = linha.match(/^>\s*["“](.+)["”]/);
    if (!m) continue;
    const segmentos = normalizar(m[1]).split(/\s*(?:\[…\]|\[\.\.\.\]|…)\s*/).map((t) => t.trim()).filter((t) => t.length > 3);
    if (segmentos.length) citacoes.push(segmentos);
  }
  return citacoes;
}

// O texto do brief que pode aparecer na página: sem títulos (numerados),
// cores, IDs nem nomes de ficheiros, que só dão dígitos soltos.
function textoDoBrief(brief) {
  return brief
    .split('\n')
    .filter((l) => !/^\s*#/.test(l))
    .join('\n')
    .replace(/#[0-9a-f]{3,8}\b/gi, ' ')
    .replace(/\[[A-Z]{2,8}-[^\]]*\]/g, ' ')
    .replace(/\S+\.(?:jpe?g|png|webp|avif|html|md|json)\b/gi, ' ');
}

// O nome da casa (o título `# …`) e a foto do primeiro ecrã: a da linha
// **Fotos:** da secção `## 1.`, a marcada (principal) ou a primeira.
function primeiroEcraDoBrief(brief) {
  const nome = (brief.match(/^#\s+(.+)$/m)?.[1] ?? '').replace(/\*/g, '').trim();
  const bloco = brief.split(/^## /m).find((b) => /^1\./.test(b)) ?? '';
  const linha = bloco.split('\n').filter((l) => l.startsWith('**Fotos:**')).join(' ');
  const fotos = [...linha.matchAll(/(fotos\/[\w.-]+\.(?:jpe?g|png|webp|avif))`?\s*(\(principal\))?/gi)];
  const foto = (fotos.find((m) => m[2]) ?? fotos[0])?.[1] ?? null;
  return { nome, foto };
}

// O primeiro ecrã fixo, com a página no topo: a foto a cobrir o ecrã, um
// h1 à vista e o cabeçalho com o nome (ou o logótipo) no canto superior
// esquerdo. A navegação à direita (ou um botão de menu) é aviso.
async function verificarPrimeiroEcra(pagina, { nome, foto }, onde) {
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.waitForTimeout(400);
  const r = await pagina.evaluate(([nome, foto]) => {
    const w = innerWidth, h = innerHeight;
    const norm = (t) => t.replace(/\s+/g, ' ').trim().toLowerCase();
    const visivel = (el) => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.1) return false;
      }
      return true;
    };
    const cobre = (r) => (Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0))) / (w * h);
    const ficheiro = foto ? foto.split('/').pop().toLowerCase() : null;
    let presente = false, cobertura = 0;
    for (const el of document.querySelectorAll('body *')) {
      const fundo = getComputedStyle(el).backgroundImage;
      const src = el.tagName === 'IMG' ? el.currentSrc || el.getAttribute('src') || '' : fundo.includes('url(') ? fundo : '';
      if (!src || (ficheiro && !decodeURIComponent(src).toLowerCase().includes(ficheiro))) continue;
      presente = true;
      if (visivel(el)) cobertura = Math.max(cobertura, cobre(el.getBoundingClientRect()));
    }
    const h1 = [...document.querySelectorAll('h1')].find((e) => visivel(e) && e.innerText.trim() && e.getBoundingClientRect().top < h && e.getBoundingClientRect().bottom > 0);
    const cab = [...document.querySelectorAll('header')].find((e) => visivel(e) && e.getBoundingClientRect().top < 40);
    let marca = false, navegacao = false;
    if (cab) {
      for (const el of cab.querySelectorAll('*')) {
        if (!visivel(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.left > w * 0.3 || r.top > 150) continue;
        const proprio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ');
        if ((nome && norm(el.innerText || '').includes(norm(nome)) && norm(proprio).length) || el.tagName === 'IMG' || el.tagName === 'svg') marca = true;
      }
      navegacao = [...cab.querySelectorAll('a[href], button, summary')].some((el) => visivel(el) && el.getBoundingClientRect().left > w * 0.5);
    }
    return { presente, cobertura, h1: Boolean(h1), cabecalho: Boolean(cab), marca, navegacao };
  }, [nome, foto]);
  const falhas = [];
  const avisos = [];
  const qual = foto ? `a foto da secção 1 do BRIEF (${foto})` : 'a foto do primeiro ecrã';
  if (!r.presente) falhas.push(`primeiro ecrã (${onde}): falta ${qual}`);
  else if (r.cobertura < 0.9) falhas.push(`primeiro ecrã (${onde}): ${qual} não cobre o ecrã (cobre ${Math.round(r.cobertura * 100)}%)`);
  if (!r.h1) falhas.push(`primeiro ecrã (${onde}): sem h1 à vista`);
  if (!r.cabecalho) falhas.push(`primeiro ecrã (${onde}): sem <header> no topo`);
  else if (!r.marca) falhas.push(`primeiro ecrã (${onde}): o cabeçalho não tem o nome${nome ? ` (${nome})` : ''} nem o logótipo no canto superior esquerdo`);
  else if (!r.navegacao) avisos.push(`primeiro ecrã (${onde}): o cabeçalho não tem a navegação (ou o menu) à direita`);
  return { falhas, avisos };
}

function hostDe(endereco) {
  try {
    return new URL(endereco).hostname;
  } catch {
    return null; // endereço montado em JavaScript (${…}): não dá para julgar
  }
}

function servir(pasta) {
  return new Promise((resolve) => {
    const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml' };
    const s = http.createServer((req, res) => {
      const f = path.join(pasta, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!f.startsWith(pasta) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': tipos[path.extname(f).toLowerCase()] ?? 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
}

// Percorre a página devagar, para disparar as revelações ao scroll.
async function percorrer(pagina) {
  const altura = await pagina.evaluate(() => document.documentElement.scrollHeight);
  const vista = pagina.viewportSize().height;
  const vazios = [];
  for (let y = 0; y < altura; y += Math.round(vista * 0.5)) {
    await pagina.mouse.wheel(0, Math.round(vista * 0.5));
    await pagina.waitForTimeout(650);
    const ocupacao = await pagina.evaluate(() => {
      const w = innerWidth, h = innerHeight;
      let area = 0;
      const visivel = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const s = getComputedStyle(e);
          if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.1) return false;
        }
        return true;
      };
      const conteudo = [...document.querySelectorAll('img,video,canvas,svg,picture')];
      for (const el of document.querySelectorAll('body *')) {
        if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) conteudo.push(el);
      }
      for (const el of conteudo) {
        const r = el.getBoundingClientRect();
        const iw = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0));
        const ih = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
        if (iw * ih > 0 && visivel(el)) area += iw * ih;
      }
      // Fundos com imagem também contam.
      for (const el of document.querySelectorAll('body *')) {
        if (getComputedStyle(el).backgroundImage.includes('url(')) {
          const r = el.getBoundingClientRect();
          const iw = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0));
          const ih = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
          if (iw * ih > 0 && visivel(el)) area += iw * ih;
        }
      }
      return Math.min(1, area / (w * h));
    });
    const posicao = await pagina.evaluate(() => scrollY);
    if (ocupacao < 0.06) vazios.push(Math.round(posicao));
  }
  return { altura, vazios };
}

// Área do ecrã coberta por imagens e linhas de texto visíveis, como união
// (numa grelha de células): o texto por cima de uma foto não conta duas
// vezes, e um parágrafo conta pelas linhas, não pela caixa inteira.
async function ocupacaoReal(pagina) {
  return pagina.evaluate(() => {
    const w = innerWidth, h = innerHeight, C = 64, L = 40;
    const grelha = new Uint8Array(C * L);
    const visivel = (el) => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.1) return false;
      }
      return true;
    };
    const marcar = (r) => {
      const x0 = Math.max(0, r.left), x1 = Math.min(w, r.right), y0 = Math.max(0, r.top), y1 = Math.min(h, r.bottom);
      if (x1 <= x0 || y1 <= y0) return;
      for (let j = Math.floor((y0 / h) * L); j < Math.min(L, Math.ceil((y1 / h) * L)); j++)
        for (let i = Math.floor((x0 / w) * C); i < Math.min(C, Math.ceil((x1 / w) * C)); i++) grelha[j * C + i] = 1;
    };
    for (const el of document.querySelectorAll('img,video,canvas')) if (visivel(el)) marcar(el.getBoundingClientRect());
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).backgroundImage.includes('url(') && visivel(el)) marcar(el.getBoundingClientRect());
    }
    const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const intervalo = document.createRange();
    for (let n = andar.nextNode(); n; n = andar.nextNode()) {
      if (n.textContent.trim().length < 2 || !n.parentElement || !visivel(n.parentElement)) continue;
      intervalo.selectNodeContents(n);
      for (const r of intervalo.getClientRects()) marcar(r);
    }
    return grelha.reduce((a, v) => a + v, 0) / (C * L);
  });
}

// As sequências presas. Para cada contentor (em fluxo) de elementos sticky,
// o percurso a mais é o espaço vazio entre o fim do último filho em fluxo
// e o fim do conteúdo do contentor: num <div h-[300vh]><div sticky
// h-screen> dá 200vh. Capítulos sticky que só pousam uns sobre os outros
// (sem altura a mais) e pilhas de cartões dão 0; um fundo sticky numa
// camada absoluta não conta.
//
// Mede-se com os sticky postos em `static` por um instante: o layout é o
// mesmo, mas as posições (offsetTop, sem transforms) ficam as naturais,
// e as margens que colapsam contam como no fluxo real.
async function sequenciasPresas(pagina) {
  return pagina.evaluate(() => {
    const presos = [...document.querySelectorAll('body *')].filter((el) => {
      const s = getComputedStyle(el);
      return s.position === 'sticky' && s.display !== 'none';
    });
    const tops = new Map(presos.map((el) => [el, parseFloat(getComputedStyle(el).top) || 0]));
    const antes = presos.map((el) => el.style.getPropertyValue('position'));
    const prioridades = presos.map((el) => el.style.getPropertyPriority('position'));
    presos.forEach((el) => el.style.setProperty('position', 'static', 'important'));
    try {
      const paiDeLayout = (el) => {
        let p = el.parentElement;
        while (p && getComputedStyle(p).display === 'contents') p = p.parentElement;
        return p;
      };
      const filhosEmFluxo = (no, lista = []) => {
        for (const f of no.children) {
          const sf = getComputedStyle(f);
          if (sf.display === 'contents') filhosEmFluxo(f, lista);
          else if (sf.position !== 'absolute' && sf.position !== 'fixed' && sf.display !== 'none') lista.push(f);
        }
        return lista;
      };
      const topoDoc = (el) => {
        let y = 0;
        for (let n = el; n; n = n.offsetParent) y += n.offsetTop + (n !== el ? n.clientTop : 0);
        return y;
      };
      const contentores = new Map();
      for (const el of presos) {
        const pai = paiDeLayout(el);
        if (!pai || pai === document.body || contentores.has(pai)) continue;
        const sp = getComputedStyle(pai);
        if (sp.position === 'absolute' || sp.position === 'fixed') continue;
        const topoConteudo = topoDoc(pai) + pai.clientTop + parseFloat(sp.paddingTop);
        const fimConteudo = topoDoc(pai) + pai.clientTop + pai.clientHeight - parseFloat(sp.paddingBottom);
        const fimFilhos = Math.max(topoConteudo, ...filhosEmFluxo(pai).map((f) => topoDoc(f) + f.offsetHeight + parseFloat(getComputedStyle(f).marginBottom)));
        const folga = Math.round(fimConteudo - fimFilhos);
        if (folga < 40) continue;
        // O sticky prende quando o topo natural dele chega ao `top`; o percurso começa aí.
        const inicio = Math.round(topoDoc(el) - tops.get(el));
        const seccao = pai.closest('section[id]')?.id ?? pai.querySelector('section[id]')?.id;
        const nome = pai.id ? `#${pai.id}` : seccao ? `#${seccao}` : topoConteudo < 50 ? 'primeiro ecrã' : `${pai.tagName.toLowerCase()} a y=${Math.round(topoConteudo)}`;
        contentores.set(pai, { nome, inicio, folga });
      }
      return [...contentores.values()];
    } finally {
      presos.forEach((el, i) => {
        if (antes[i]) el.style.setProperty('position', antes[i], prioridades[i]);
        else el.style.removeProperty('position');
      });
    }
  });
}

// Scroll instantâneo até a expressão `alvo` (em função de r, o retângulo
// do elemento, e vh) dar 0. Dentro de secções presas um passo não move o
// elemento à razão de 1, por isso corrige algumas vezes.
async function levarA(pagina, indice, alvo) {
  for (let i = 0; i < 6; i++) {
    const delta = await pagina.evaluate(([k, f]) => {
      const r = document.querySelectorAll('[data-revelacao]')[k].getBoundingClientRect();
      return new Function('r', 'vh', `return ${f}`)(r, innerHeight);
    }, [indice, alvo]);
    if (Math.abs(delta) < 8) return true;
    const antes = await pagina.evaluate(() => scrollY);
    await pagina.evaluate((d) => window.scrollTo(0, scrollY + d), delta);
    await pagina.waitForTimeout(280);
    if (Math.abs((await pagina.evaluate(() => scrollY)) - antes) < 1) return false; // no limite da página
  }
  return false;
}

// Cada elemento com data-revelacao: com o topo a 90% do ecrã e já acima de
// 0.5 é falha (revelado antes de se ver); com o centro a meio do ecrã e
// abaixo de 0.9 é aviso (ainda a meio quando já se está a olhar para ele).
async function verificarRevelacoes(pagina, onde) {
  const falhas = [];
  const avisos = [];
  const total = await pagina.evaluate(() => document.querySelectorAll('[data-revelacao]').length);
  const ler = (k) => pagina.evaluate((k) => Number(document.querySelectorAll('[data-revelacao]')[k].dataset.revelacao), k);
  const descrever = (k) => pagina.evaluate((k) => {
    const el = document.querySelectorAll('[data-revelacao]')[k];
    const texto = (el.querySelector('img')?.getAttribute('alt') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    const sec = el.closest('section[id]')?.id;
    return `${sec ? `#${sec} ` : ''}"${texto}"`;
  }, k);
  let medidos = 0;
  for (let k = 0; k < total; k++) {
    const altura = await pagina.evaluate((k) => document.querySelectorAll('[data-revelacao]')[k].getBoundingClientRect().height, k);
    if (altura < 1) continue; // escondido neste ecrã
    medidos++;
    if (await levarA(pagina, k, 'r.top - vh * 0.9')) {
      const v = await ler(k);
      if (v > 0.5) falhas.push(`revelação cedo demais (${onde}): ${await descrever(k)} já a ${v.toFixed(2)} com o topo a 90% do ecrã`);
    }
    if (await levarA(pagina, k, 'r.top + r.height / 2 - vh / 2')) {
      const v = await ler(k);
      if (v < 0.9) avisos.push(`revelação incompleta a meio do ecrã (${onde}): ${await descrever(k)} a ${v.toFixed(2)}`);
    }
  }
  return { falhas, avisos, medidos };
}

// Durante cada sequência presa, a 25%, 50% e 75% do percurso, imagens e
// texto têm de cobrir pelo menos 40% do ecrã.
async function verificarPresas(pagina, presas) {
  const falhas = [];
  for (const p of presas) {
    for (const f of [0.25, 0.5, 0.75]) {
      await pagina.evaluate((y) => window.scrollTo(0, y), Math.round(p.inicio + p.folga * f));
      await pagina.waitForTimeout(500);
      const o = await ocupacaoReal(pagina);
      if (o < MIN_OCUPACAO_PRESA) {
        falhas.push(`sequência presa com o ecrã quase vazio: ${p.nome} a ${f * 100}% do percurso (${Math.round(o * 100)}% do ecrã ocupado)`);
      }
    }
  }
  return falhas;
}

/** Uma linha com os números da página, para a saída. */
export function resumoMedidas(m = {}) {
  const rev = m.revelacoes ?? {};
  const revelacoes = 'computador' in rev ? `; elementos com data-revelacao medidos: ${rev.computador} no computador, ${rev.telemovel ?? 0} no telemóvel` : '';
  return `${m.ecrasConteudo ?? '?'} ecrãs de conteúdo (máx. ${MAX_ECRAS}); ${m.scrollPreso ?? '?'} ecrãs de scroll preso (aviso acima de ${MAX_PRESO}); ${m.ecrasTotal ?? '?'} ecrãs no total${revelacoes}`;
}

export async function verificar(ficheiro, { brief, fotos, prototipo = false }) {
  const falhas = [];
  const avisos = [];
  const medidas = {};
  const remoto = /^https?:\/\//.test(ficheiro);
  const html = remoto ? '' : fs.readFileSync(ficheiro, 'utf8');
  const pasta = remoto ? null : path.dirname(path.resolve(ficheiro));
  if (prototipo && /<script\b/i.test(html)) falhas.push('o protótipo tem <script>: tem de ser só HTML e CSS');

  // Estático: fotos e recursos externos.
  const refs = [...html.matchAll(/fotos\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|avif)/g)].map((m) => m[0]);
  const pacote = fotos && fs.existsSync(fotos) ? new Set(fs.readdirSync(fotos)) : null;
  for (const r of new Set(remoto ? [] : refs)) {
    if (!fs.existsSync(path.join(pasta, r))) falhas.push(`foto inexistente: ${r}`);
    else if (pacote && !pacote.has(path.basename(r))) falhas.push(`foto fora do pacote: ${r}`);
  }
  const repetidas = [...new Set(refs.filter((r, i) => refs.indexOf(r) !== i))];
  if (repetidas.length) avisos.push(`foto usada mais do que uma vez: ${repetidas.join(', ')}`);
  // Recursos carregados (src, <link href>, url() e @import no CSS). Links
  // <a href> para o Booking, o Maps ou o Instagram são navegação e ficam de fora.
  const recursos = [
    ...[...html.matchAll(/\bsrc(?:set)?\s*=\s*["'](https?:\/\/[^"'\s]+)/g)].map((m) => m[1]),
    ...[...html.matchAll(/<link\b[^>]*\bhref\s*=\s*["'](https?:\/\/[^"']+)/gi)].map((m) => m[1]),
    ...[...html.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/g)].map((m) => m[1]),
    ...[...html.matchAll(/@import\s+(?:url\()?["']?(https?:\/\/[^"')]+)/g)].map((m) => m[1]),
  ];
  for (const host of new Set(recursos.map(hostDe).filter(Boolean))) {
    if (!HOSTS_PERMITIDOS.includes(host)) falhas.push(`recurso externo não permitido: ${host}`);
  }

  const servidor = remoto ? null : await servir(pasta);
  const url = remoto ? ficheiro : `http://127.0.0.1:${servidor.address().port}/${path.basename(ficheiro)}`;
  const browser = await chromium.launch();
  try {
    // Computador.
    const pc = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const erros = [];
    pc.on('pageerror', (e) => erros.push(e.message));
    pc.on('console', (msg) => { if (msg.type() === 'error') erros.push(msg.text()); });
    await pc.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await pc.waitForTimeout(1200);
    // O primeiro ecrã conta para os ecrãs e para os vazios como o resto.
    const primeiro = primeiroEcraDoBrief(brief ?? '');
    if (prototipo) {
      const r = await verificarPrimeiroEcra(pc, primeiro, 'computador');
      falhas.push(...r.falhas);
      avisos.push(...r.avisos);
    }
    const { altura, vazios } = await percorrer(pc);
    const texto = normalizar(await pc.evaluate(() => document.body.innerText));
    if (erros.length) falhas.push(`erros na consola: ${[...new Set(erros)].slice(0, 3).join(' | ').slice(0, 300)}`);
    // Ecrãs de conteúdo: a altura sem o percurso das sequências presas.
    const presas = await sequenciasPresas(pc);
    const presoPx = presas.reduce((a, p) => a + p.folga, 0);
    medidas.ecrasConteudo = Number(((altura - presoPx) / 900).toFixed(2));
    medidas.scrollPreso = Number((presoPx / 900).toFixed(2));
    medidas.ecrasTotal = Number((altura / 900).toFixed(2));
    medidas.sequenciasPresas = presas.map((p) => ({ nome: p.nome, ecras: Number((p.folga / 900).toFixed(2)) }));
    if (medidas.ecrasConteudo > MAX_ECRAS) falhas.push(`página demasiado longa: ${medidas.ecrasConteudo.toFixed(1)} ecrãs de conteúdo (máximo ${MAX_ECRAS})`);
    if (medidas.scrollPreso > MAX_PRESO) avisos.push(`muito scroll preso: ${medidas.scrollPreso.toFixed(1)} ecrãs em sequências presas (acima de ${MAX_PRESO} pesa)`);
    falhas.push(...(await verificarPresas(pc, presas)));
    if (vazios.length) falhas.push(`ecrãs vazios ou quase vazios em computador, a partir de y=${vazios.slice(0, 5).join(', ')}`);

    if (brief) {
      // Citação ausente: pode ter sido escolha (aviso). Começo presente e o
      // resto diferente: foi alterada (falha).
      for (const segmentos of citacoesDoBrief(brief)) {
        if (segmentos.every((t) => texto.includes(t))) continue;
        if (texto.includes(segmentos[0].slice(0, 40))) falhas.push(`citação alterada: "${segmentos[0].slice(0, 70)}…"`);
        else avisos.push(`citação do brief não mostrada: "${segmentos[0].slice(0, 70)}…"`);
      }
      const digitosBrief = new Set((textoDoBrief(brief).match(/\d+/g) ?? []));
      const ano = String(new Date().getFullYear());
      const fora = [...new Set((texto.match(/\d+/g) ?? []).filter((n) => !digitosBrief.has(n) && n !== ano))];
      // "01", "04": numeração de secções, não é um facto.
      const numeracao = fora.filter((n) => /^0\d$/.test(n));
      const inventados = fora.filter((n) => !/^0\d$/.test(n));
      if (inventados.length) falhas.push(`números que não estão no brief: ${inventados.slice(0, 10).join(', ')}`);
      if (numeracao.length) avisos.push(`numeração de secções (${numeracao.join(', ')}): confirma que não parece um contador genérico`);
      // Sem o ponto final da frase, que a expressão apanha junto.
      const emails = (t) => new Set((t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []).map((e) => e.toLowerCase().replace(/\.+$/, '')));
      const emailsBrief = emails(brief);
      for (const e of emails(texto)) {
        if (!emailsBrief.has(e)) falhas.push(`email que não está no brief: ${e}`);
      }
    }
    if (texto.includes('—')) falhas.push('travessões longos (—) no texto visível');
    const ids = [...new Set(texto.match(/\[[a-z]{2,8}-[a-z0-9-]+\]/g) ?? [])];
    if (ids.length) falhas.push(`referências internas visíveis: ${ids.slice(0, 5).join(', ')}`);
    const letraPequena = await pc.evaluate(() => [...document.querySelectorAll('p, li')].filter((e) => e.innerText.trim().length > 60 && parseFloat(getComputedStyle(e).fontSize) < 15).length);
    if (letraPequena) avisos.push(`${letraPequena} parágrafos com letra abaixo de 15 px`);

    // Revelações ligadas ao scroll (um protótipo estático não as tem).
    medidas.revelacoes = {};
    if (!prototipo) {
      const r = await verificarRevelacoes(pc, 'computador');
      falhas.push(...r.falhas);
      avisos.push(...r.avisos);
      medidas.revelacoes.computador = r.medidos;
    }

    // Telemóvel.
    const tel = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await tel.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await tel.waitForTimeout(1000);
    if (prototipo) {
      const r = await verificarPrimeiroEcra(tel, primeiro, 'telemóvel');
      falhas.push(...r.falhas);
      avisos.push(...r.avisos);
    }
    const telemovel = await percorrer(tel);
    const largo = await tel.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (largo > 1) falhas.push(`scroll horizontal no telemóvel (${largo}px a mais)`);
    if (telemovel.vazios.length) avisos.push(`ecrãs quase vazios no telemóvel, a partir de y=${telemovel.vazios.slice(0, 5).join(', ')}`);
    if (!prototipo) {
      const r = await verificarRevelacoes(tel, 'telemóvel');
      falhas.push(...r.falhas);
      avisos.push(...r.avisos);
      medidas.revelacoes.telemovel = r.medidos;
    }

    // Movimento reduzido: nada de texto escondido à espera de animação.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const rm = await ctx.newPage();
    await rm.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await rm.waitForTimeout(1000);
    await percorrer(rm);
    const escondidos = await rm.evaluate(() => [...document.querySelectorAll('h1,h2,h3,p,li,blockquote')].filter((el) => {
      if (!el.innerText.trim()) return false;
      for (let e = el; e; e = e.parentElement) if (Number(getComputedStyle(e).opacity) < 0.1) return true;
      return false;
    }).length);
    if (escondidos > 2) falhas.push(`com movimento reduzido ficam ${escondidos} blocos de texto invisíveis`);
    await ctx.close();
  } finally {
    await browser.close();
    servidor?.close();
  }
  return { ok: falhas.length === 0, falhas, avisos, medidas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const prototipo = args.includes('--prototipo');
  const [ficheiro, briefPath, fotos] = args.filter((a) => !a.startsWith('--'));
  if (!ficheiro) {
    console.error('Uso: node verificar-prototipo.mjs <ficheiro.html | http://localhost:PORTA> <BRIEF.md> [<pasta-fotos>] [--prototipo]');
    process.exit(1);
  }
  const brief = briefPath ? fs.readFileSync(briefPath, 'utf8') : null;
  const r = await verificar(ficheiro, { brief, fotos, prototipo });
  // Os números vão para stderr: o stdout fica só com o JSON.
  console.error(resumoMedidas(r.medidas));
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 2);
}
