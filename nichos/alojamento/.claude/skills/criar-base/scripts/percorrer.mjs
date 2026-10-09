#!/usr/bin/env node
/*
  Percorre o site em vários dispositivos e devolve medidas, não imagens.
  Substitui os scripts de Playwright que o site-alojamento e o
  mobile escreviam cada um à sua maneira.

  Uso:
    node percorrer.mjs http://localhost:3500 [--saida <pasta>] [--dispositivos todos|base] [--webkit] [--reduzido]

  --dispositivos todos (por defeito): 320, 360, 375, 390, 414 e 430 na
      vertical; 667×375, 844×390 e 932×430 na horizontal; 768×1024,
      820×1180 e 1024×768; 1280, 1440 e 1920. base: só 390 e 1440.
  --webkit    repete os dispositivos de toque no WebKit (o Safari do iOS).
              Se não estiver instalado, avisa e segue só com o Chromium.
  --reduzido  faz o percurso com movimento reduzido e procura texto que
              fica escondido à espera de uma animação.
  --saida     grava <saida>/percurso.json e as capturas das falhas; sem ela,
              o JSON vai para stdout e não há capturas.

  Em cada dispositivo desce a página aos poucos (para disparar o que
  depende do scroll) e mede: scroll horizontal e quem sai do ecrã; alvos de
  toque abaixo de 44×44; texto de corpo abaixo de 16 px no telemóvel; texto
  sobreposto a texto ou cortado (palavras e emails partidos a meio); erros
  de consola; imagens partidas; alturas em vh perto do ecrã inteiro (no
  telemóvel e no tablet devem ser svh ou dvh); texto escondido com
  movimento reduzido.

  O resumo (até 30 linhas) vai para stderr quando o JSON vai para stdout,
  e para stdout quando há --saida. Capturas: só da zona de cada falha, no
  máximo 2 por falha. Sai com 0 sem falhas e com 2 com falhas.

  Usa sempre localhost e nunca 127.0.0.1 (o Next.js não hidrata), e o
  build de produção (o next dev engana nas medidas).
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- argumentos
const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const url = args.find((a) => /^https?:\/\//.test(a));
const saida = opcao('--saida') && path.resolve(opcao('--saida'));
const conjunto = opcao('--dispositivos') ?? 'todos';
const comWebkit = args.includes('--webkit');
const reduzido = args.includes('--reduzido');
if (!url || !['todos', 'base'].includes(conjunto)) {
  console.error('Uso: node percorrer.mjs http://localhost:PORTA [--saida <pasta>] [--dispositivos todos|base] [--webkit] [--reduzido]');
  process.exit(1);
}
if (/127\.0\.0\.1/.test(url)) console.error('Aviso: usa localhost; em 127.0.0.1 o Next.js não hidrata.');

// ---------------------------------------------------------------- playwright
// O do site (pasta atual), o da skill, ou o global.
async function carregarPlaywright() {
  const bases = [path.join(process.cwd(), 'package.json'), path.join(AQUI, '..', 'package.json'), path.join(AQUI, 'package.json')];
  try {
    bases.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'x.js'));
  } catch {}
  for (const b of bases) {
    try {
      const resolvido = createRequire(b).resolve('playwright');
      return await import(pathToFileURL(resolvido).href);
    } catch {}
  }
  console.error('Não encontrei o Playwright (nem no site, nem na skill, nem global). Instala com: npm i -D playwright');
  process.exit(1);
}
const pw = await carregarPlaywright();
const { chromium, webkit } = pw.default ?? pw;

// ---------------------------------------------------------------- dispositivos
const tel = (largura, altura, dsf) => ({ largura, altura, dsf, toque: true, tipo: 'telemovel' });
const TODOS = [
  { nome: 'tel-320', ...tel(320, 568, 2) },
  { nome: 'tel-360', ...tel(360, 780, 3) },
  { nome: 'tel-375', ...tel(375, 667, 2) },
  { nome: 'tel-390', ...tel(390, 844, 3) },
  { nome: 'tel-414', ...tel(414, 896, 2) },
  { nome: 'tel-430', ...tel(430, 932, 3) },
  { nome: 'tel-h-667', ...tel(667, 375, 2) },
  { nome: 'tel-h-844', ...tel(844, 390, 3) },
  { nome: 'tel-h-932', ...tel(932, 430, 3) },
  { nome: 'tablet-768', largura: 768, altura: 1024, dsf: 2, toque: true, tipo: 'tablet' },
  { nome: 'tablet-820', largura: 820, altura: 1180, dsf: 2, toque: true, tipo: 'tablet' },
  { nome: 'tablet-h-1024', largura: 1024, altura: 768, dsf: 2, toque: true, tipo: 'tablet' },
  { nome: 'pc-1280', largura: 1280, altura: 800, dsf: 1, toque: false, tipo: 'computador' },
  { nome: 'pc-1440', largura: 1440, altura: 900, dsf: 1, toque: false, tipo: 'computador' },
  { nome: 'pc-1920', largura: 1920, altura: 1080, dsf: 1, toque: false, tipo: 'computador' },
];
const dispositivos = conjunto === 'base' ? TODOS.filter((d) => ['tel-390', 'pc-1440'].includes(d.nome)) : TODOS;

// ---------------------------------------------------------------- medidas na página
// Instalado em cada página: funções de medida em window.__pc. Os elementos
// com falha ficam numa lista (window.__pc.els) para a captura os reencontrar.
function instalar() {
  if (window.__pc) return;
  const els = [];
  const idDe = (el) => {
    let i = els.indexOf(el);
    if (i < 0) i = els.push(el) - 1;
    return i;
  };
  const seletor = (el) => {
    const partes = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body && partes.length < 4; e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) {
        partes.unshift(`${s}#${e.id}`);
        break;
      }
      const cls = [...e.classList].filter((c) => /^[a-zA-Z_][\w-]*$/.test(c)).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      else if (e.parentElement) {
        const irmaos = [...e.parentElement.children].filter((x) => x.tagName === e.tagName);
        if (irmaos.length > 1) s += `:nth-of-type(${irmaos.indexOf(e) + 1})`;
      }
      partes.unshift(s);
    }
    return partes.join(' > ');
  };
  const texto = (el) => (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
  const opacidade = (el) => {
    let o = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden') return 0;
      o *= Number(s.opacity);
    }
    return o;
  };
  const escondidoAria = (el) => Boolean(el.closest('[aria-hidden="true"], .sr-only'));
  const fixo = (el) => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (getComputedStyle(e).position === 'fixed') return true;
    return false;
  };
  // O retângulo visível depois dos recortes dos antepassados com overflow.
  const recorte = new Map();
  const visivelEm = (el) => {
    if (recorte.has(el)) return recorte.get(el);
    let r = { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 };
    const pai = el.parentElement;
    if (pai && pai !== document.documentElement) {
      r = { ...visivelEm(pai) };
      const s = getComputedStyle(pai);
      if (pai !== document.body && (s.overflowX !== 'visible' || s.overflowY !== 'visible')) {
        const p = pai.getBoundingClientRect();
        if (s.overflowX !== 'visible') { r.left = Math.max(r.left, p.left); r.right = Math.min(r.right, p.right); }
        if (s.overflowY !== 'visible') { r.top = Math.max(r.top, p.top); r.bottom = Math.min(r.bottom, p.bottom); }
      }
    }
    recorte.set(el, r);
    return r;
  };
  const cortar = (a, b) => ({ left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) });
  const area = (r) => Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
  const fundoOpaco = (el) => {
    const s = getComputedStyle(el);
    if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(el.tagName)) return true;
    if (s.backgroundImage !== 'none') return true;
    const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const partes = m[1].split(/[ ,/]+/).filter(Boolean);
    return partes.length < 4 || Number(partes[3]) >= 0.85;
  };
  const registo = (el, extra = {}) => {
    const r = el.getBoundingClientRect();
    return { id: idDe(el), seletor: seletor(el), texto: texto(el) || undefined, y: Math.round(r.top + scrollY), scroll: Math.round(scrollY), ...extra };
  };

  // Um passo do percurso: o que depende da posição.
  const passo = ({ toque }) => {
    recorte.clear();
    const w = innerWidth, h = innerHeight;
    const vista = { left: 0, top: 0, right: w, bottom: h };
    const res = { largo: document.documentElement.scrollWidth - w, sai: [], sobrepostos: [], toque: [], foraDoEcra: [] };

    // Scroll horizontal: quem sai do ecrã (os de fora, não os filhos deles).
    if (res.largo > 1) {
      const fora = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || opacidade(el) < 0.05) continue;
        const v = visivelEm(el);
        if (v.right < w + 1 && v.left > -1) continue; // recortado por um antepassado
        const passa = Math.max(r.right - w, -r.left);
        if (passa > 1) fora.push({ el, passa });
      }
      for (const f of fora) {
        if (fora.some((o) => o !== f && o.el.contains(f.el) && o.passa >= f.passa - 1)) continue;
        res.sai.push(registo(f.el, { px: Math.round(f.passa) }));
        if (res.sai.length >= 8) break;
      }
    }

    // As linhas de texto à vista.
    const linhas = [];
    const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const intervalo = document.createRange();
    for (let n = andar.nextNode(); n; n = andar.nextNode()) {
      const el = n.parentElement;
      if (!el || n.textContent.trim().length < 2 || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue;
      intervalo.selectNodeContents(n);
      const rects = [...intervalo.getClientRects()].filter((r) => r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < h);
      if (!rects.length || escondidoAria(el) || opacidade(el) < 0.5) continue;
      const v = cortar(visivelEm(el), vista);
      for (const r of rects) {
        const visivel = cortar(r, v);
        if (area(visivel) < area(r) * 0.5) {
          // Texto que sai do ecrã na horizontal sem ser um carrossel.
          const lado = r.right > w + 2 || r.left < -2;
          if (lado && r.top >= 0 && r.bottom <= h && !fixo(el)) res.foraDoEcra.push(registo(el, { px: Math.round(Math.max(r.right - w, -r.left)) }));
          continue;
        }
        // Só o miolo da linha: com entrelinha apertada as caixas de linhas
        // seguidas tocam-se sem as letras se tocarem.
        const folga = (visivel.bottom - visivel.top) * 0.22;
        linhas.push({ el, r: { ...visivel, top: visivel.top + folga, bottom: visivel.bottom - folga }, fixo: null });
      }
    }

    // Texto sobre texto. Fica de fora o que um fundo opaco tapa (capítulos
    // presos uns sobre os outros) e o cabeçalho fixo.
    for (const l of linhas) l.fixo = fixo(l.el);
    const vistos = new Set();
    for (let i = 0; i < linhas.length; i++) {
      const a = linhas[i];
      if (a.fixo) continue;
      for (let j = i + 1; j < linhas.length; j++) {
        const b = linhas[j];
        if (b.fixo || a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const inter = cortar(a.r, b.r);
        const menor = Math.min(area(a.r), area(b.r));
        if (area(inter) < menor * 0.25 || area(inter) < 40) continue;
        const chave = `${idDe(a.el)}|${idDe(b.el)}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        const x = (inter.left + inter.right) / 2, y = (inter.top + inter.bottom) / 2;
        const pilha = document.elementsFromPoint(x, y);
        const ia = pilha.findIndex((e) => e === a.el || a.el.contains(e));
        const ib = pilha.findIndex((e) => e === b.el || b.el.contains(e));
        if (ia >= 0 && ib >= 0) {
          const [baixo, ibaixo] = ia < ib ? [b.el, ib] : [a.el, ia];
          const tapa = pilha.slice(0, ibaixo).some((e) => !e.contains(baixo) && !baixo.contains(e) && fundoOpaco(e));
          if (tapa) continue;
        }
        res.sobrepostos.push({ ...registo(a.el), com: registo(b.el) });
        if (res.sobrepostos.length >= 8) break;
      }
      if (res.sobrepostos.length >= 8) break;
    }

    // Alvos de toque: links e botões à vista, abaixo de 44×44. Conta a área
    // de toque real (um ::before que a alarga também conta): sonda-se o
    // elemento a 22 px do centro. Links no meio de uma frase ficam de fora.
    if (toque) {
      for (const el of document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, summary, label[for]')) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || r.top < 0 || r.bottom > h || r.left < 0 || r.right > w) continue;
        if (r.width >= 44 && r.height >= 44) continue;
        if (opacidade(el) < 0.5 || getComputedStyle(el).pointerEvents === 'none') continue;
        const s = getComputedStyle(el);
        if (el.tagName === 'A' && s.display === 'inline' && el.parentElement && el.parentElement.innerText.trim().length > el.innerText.trim().length + 20) continue;
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
        const toca = (x, y) => {
          if (x < 0 || y < 0 || x >= w || y >= h) return true;
          const e = document.elementFromPoint(x, y);
          return Boolean(e && (e === el || el.contains(e)));
        };
        const largo = r.width >= 44 || (toca(cx - 21, cy) && toca(cx + 21, cy));
        const alto = r.height >= 44 || (toca(cx, cy - 21) && toca(cx, cy + 21));
        if (largo && alto) continue;
        res.toque.push(registo(el, { medida: `${Math.round(r.width)}×${Math.round(r.height)}` }));
      }
    }
    return res;
  };

  // No fim do percurso: o que não depende da posição.
  const fim = ({ tipo, reduzido }) => {
    const res = { letra: [], partidas: [], cortados: [], imagens: [], vh: [], escondidos: [] };

    // Texto de corpo abaixo de 16 px no telemóvel.
    if (tipo === 'telemovel') {
      for (const el of document.querySelectorAll('p, li')) {
        const t = el.innerText.trim();
        if (t.length < 40 || opacidade(el) < 0.05 || escondidoAria(el)) continue;
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < 15.5) res.letra.push(registo(el, { px: Math.round(px * 10) / 10 }));
      }
    }

    // Palavras partidas a meio entre duas linhas: emails, endereços e
    // telefones sempre; o resto só quando não é hifenização do browser.
    const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const intervalo = document.createRange();
    for (let n = andar.nextNode(); n; n = andar.nextNode()) {
      const el = n.parentElement;
      if (!el || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || escondidoAria(el)) continue;
      const t = n.textContent;
      if (t.trim().length < 6) continue;
      const hifen = getComputedStyle(el).hyphens === 'auto';
      for (const m of t.matchAll(/\S{6,}/g)) {
        const palavra = m[0];
        const especial = /@|https?:|www\.|\.(pt|com)\b|^\+?\d[\d ]{7,}/.test(palavra);
        if (hifen && !especial) continue;
        if (/[-‑–]/.test(palavra) && !especial) continue; // parte no hífen: é normal
        intervalo.setStart(n, m.index);
        intervalo.setEnd(n, m.index + palavra.length);
        const tops = new Set([...intervalo.getClientRects()].filter((r) => r.width > 1).map((r) => Math.round(r.top)));
        if (tops.size > 1) {
          res.partidas.push(registo(el, { palavra: palavra.slice(0, 40) }));
          break;
        }
      }
      if (res.partidas.length >= 10) break;
    }

    // Texto cortado por uma caixa com overflow escondido.
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (!/hidden|clip/.test(s.overflowX + s.overflowY) || escondidoAria(el)) continue;
      if (![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length > 1)) continue;
      if (opacidade(el) < 0.5) continue;
      const corteX = el.scrollWidth - el.clientWidth, corteY = el.scrollHeight - el.clientHeight;
      if ((s.overflowX !== 'visible' && corteX > 2) || (s.overflowY !== 'visible' && corteY > 4)) {
        res.cortados.push(registo(el, { px: Math.max(corteX, corteY) }));
        if (res.cortados.length >= 10) break;
      }
    }

    // Imagens partidas (as lazy já carregaram com o percurso).
    for (const img of document.querySelectorAll('img')) {
      if ((img.currentSrc || img.getAttribute('src')) && img.complete && img.naturalWidth === 0) res.imagens.push(registo(img, { src: (img.currentSrc || img.src).slice(0, 160) }));
    }

    // Alturas em vh perto do ecrã inteiro (50 a 100vh): no telemóvel a barra
    // do browser sobe e desce e corta-as. Percursos de scroll (acima de
    // 100vh) não contam.
    if (tipo !== 'computador') {
      const regras = [];
      const ler = (lista) => {
        for (const r of lista) {
          if (r instanceof CSSMediaRule) {
            if (matchMedia(r.media.mediaText).matches) ler(r.cssRules);
            continue;
          }
          if (r.style && r.selectorText) {
            for (const p of ['height', 'min-height', 'max-height', 'block-size', 'min-block-size']) {
              const v = r.style.getPropertyValue(p);
              const m = v && v.match(/(\d*\.?\d+)vh\b/);
              if (m && Number(m[1]) >= 50 && Number(m[1]) <= 100) regras.push({ seletor: r.selectorText, valor: `${p}: ${v}` });
            }
          }
          if (r.cssRules) ler(r.cssRules);
        }
      };
      for (const f of document.styleSheets) {
        try { ler(f.cssRules); } catch {}
      }
      const ja = new Set();
      for (const regra of regras) {
        let lista = [];
        try { lista = [...document.querySelectorAll(regra.seletor)]; } catch {}
        for (const el of lista) {
          const r = el.getBoundingClientRect();
          if (ja.has(el) || opacidade(el) === 0 || escondidoAria(el) || r.height < innerHeight * 0.4 || r.width < innerWidth * 0.5) continue;
          ja.add(el);
          res.vh.push(registo(el, { regra: `${regra.seletor} { ${regra.valor} }` }));
        }
      }
      for (const el of document.querySelectorAll('[style*="vh"]')) {
        const m = el.getAttribute('style').match(/(?:^|;)\s*((?:min-|max-)?height)\s*:\s*(\d*\.?\d+)vh/);
        if (m && Number(m[2]) >= 50 && Number(m[2]) <= 100 && !ja.has(el)) res.vh.push(registo(el, { regra: `style="${m[1]}: ${m[2]}vh"` }));
      }
      res.vh = res.vh.slice(0, 10);
    }

    // Movimento reduzido: texto que fica invisível à espera de animação.
    if (reduzido) {
      for (const el of document.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, figcaption')) {
        if (!el.innerText.trim() || escondidoAria(el)) continue;
        let tapado = false;
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
          const s = getComputedStyle(e);
          if (s.display === 'none') { tapado = false; break; }
          if (Number(s.opacity) < 0.1 || s.visibility === 'hidden') tapado = true;
        }
        if (tapado) res.escondidos.push(registo(el));
      }
    }
    return res;
  };

  // Leva o elemento ao ecrã (à posição de scroll em que falhou) e devolve
  // a zona a recortar, com margem, dentro da vista.
  const zona = (id, scroll) => {
    const el = els[id];
    if (!el || !el.isConnected) return null;
    window.scrollTo({ top: scroll, behavior: 'instant' });
    // Se ficar debaixo do cabeçalho ou fora da vista, centra-o.
    const r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > innerHeight) window.scrollBy({ top: r.top + Math.min(r.height, innerHeight) / 2 - innerHeight / 2, behavior: 'instant' });
    return true;
  };
  const caixa = (id) => {
    const el = els[id];
    if (!el || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    const m = 24, w = innerWidth, h = innerHeight;
    let x0 = Math.max(0, r.left - m), y0 = Math.max(0, r.top - m), x1 = Math.min(w, r.right + m), y1 = Math.min(h, r.bottom + m);
    if (x1 - x0 < 40) { x0 = Math.max(0, w - 200); x1 = w; } // fora do ecrã: a beira
    if (y1 - y0 < 40) { y0 = Math.max(0, Math.min(h - 120, r.top - m)); y1 = Math.min(h, y0 + 120); }
    if (y1 - y0 > h * 0.8) y1 = y0 + h * 0.8;
    return { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) };
  };
  window.__pc = { passo, fim, zona, caixa };
}

// ---------------------------------------------------------------- um dispositivo
const ESPERA = 380;

async function percorrerDispositivo(browser, motor, d) {
  const ctx = await browser.newContext({
    viewport: { width: d.largura, height: d.altura },
    deviceScaleFactor: d.dsf,
    isMobile: d.toque && motor !== 'firefox',
    hasTouch: d.toque,
    reducedMotion: reduzido ? 'reduce' : 'no-preference',
  });
  const pagina = await ctx.newPage();
  const erros = [];
  const imagensFalhadas = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pagina.on('response', (r) => { if (r.request().resourceType() === 'image' && r.status() >= 400) imagensFalhadas.push({ src: r.url(), estado: r.status() }); });
  pagina.on('requestfailed', (r) => {
    const f = r.failure()?.errorText ?? '';
    if (r.resourceType() === 'image' && !/ABORTED|cancel/i.test(f)) imagensFalhadas.push({ src: r.url(), estado: f });
  });

  try {
    await pagina.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
  } catch {
    await pagina.goto(url, { waitUntil: 'load', timeout: 45_000 }).catch(() => {});
  }
  await pagina.waitForTimeout(900);
  await pagina.evaluate(instalar);

  const problemas = [];
  const juntar = (tipo, lista, detalhe) => {
    for (const p of lista) {
      // O mesmo elemento conta uma vez, mesmo que as classes mudem com o scroll.
      const chave = `${tipo}|${p.id ?? p.seletor}|${p.palavra ?? ''}|${p.com?.id ?? ''}`;
      if (problemas.some((q) => q.chave === chave)) continue;
      problemas.push({ chave, tipo, ...p, detalhe: detalhe(p) });
    }
  };

  // O percurso: desce 60% de um ecrã de cada vez até ao fim.
  let largoMax = 0;
  let parado = 0;
  for (let i = 0; i < 160; i++) {
    const r = await pagina.evaluate((o) => window.__pc.passo(o), { toque: d.toque });
    largoMax = Math.max(largoMax, r.largo);
    juntar('scroll-horizontal', r.sai, (p) => `sai ${p.px}px do ecrã`);
    juntar('texto-fora-do-ecra', r.foraDoEcra, (p) => `texto ${p.px}px fora do ecrã`);
    juntar('texto-sobreposto', r.sobrepostos, (p) => `sobre "${p.com.texto ?? p.com.seletor}"`);
    juntar('alvo-de-toque', r.toque, (p) => `${p.medida} px (mín. 44×44)`);
    const antes = await pagina.evaluate(() => scrollY);
    await pagina.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'instant' }), Math.round(d.altura * 0.6));
    await pagina.waitForTimeout(ESPERA);
    const depois = await pagina.evaluate(() => scrollY);
    if (Math.abs(depois - antes) < 2) {
      if (++parado >= 2) break;
    } else parado = 0;
  }
  const alturaPagina = await pagina.evaluate(() => document.documentElement.scrollHeight);
  await pagina.waitForTimeout(600);
  const f = await pagina.evaluate((o) => window.__pc.fim(o), { tipo: d.tipo, reduzido });
  juntar('letra-pequena', f.letra, (p) => `${p.px}px (mín. 16 no telemóvel)`);
  juntar('palavra-partida', f.partidas, (p) => `"${p.palavra}" partida entre duas linhas`);
  juntar('texto-cortado', f.cortados, (p) => `${p.px}px escondidos pelo overflow`);
  juntar('imagem-partida', f.imagens, (p) => p.src);
  juntar('altura-em-vh', f.vh, (p) => `${p.regra} (usa svh ou dvh)`);
  juntar('texto-escondido-reduzido', f.escondidos, () => 'invisível com movimento reduzido');
  for (const im of imagensFalhadas) {
    if (problemas.some((q) => q.tipo === 'imagem-partida' && q.detalhe === im.src.slice(0, 160))) continue;
    problemas.push({ chave: `imagem|${im.src}`, tipo: 'imagem-partida', seletor: '(pedido)', detalhe: `${im.estado}: ${im.src.slice(0, 160)}` });
  }
  for (const e of [...new Set(erros)].slice(0, 6)) problemas.push({ chave: `consola|${e}`, tipo: 'erro-de-consola', seletor: '(consola)', detalhe: e.slice(0, 300) });
  if (largoMax > 1 && !problemas.some((p) => p.tipo === 'scroll-horizontal')) {
    problemas.push({ chave: 'scroll-horizontal|página', tipo: 'scroll-horizontal', seletor: 'html', detalhe: `a página tem ${largoMax}px a mais na horizontal` });
  }
  return { ctx, pagina, alturaPagina, problemas };
}

// ---------------------------------------------------------------- capturas
const SEM_CAPTURA = new Set(['erro-de-consola', 'altura-em-vh']);
const capturasPorFalha = new Map();
let totalCapturas = 0;

async function capturar(pagina, nomeDisp, problemas) {
  if (!saida) return;
  for (const p of problemas) {
    if (SEM_CAPTURA.has(p.tipo) || p.id === undefined || totalCapturas >= 40) continue;
    const chave = `${p.tipo}|${p.seletor}`;
    const feitas = capturasPorFalha.get(chave) ?? 0;
    if (feitas >= 2) continue;
    try {
      const ok = await pagina.evaluate(([id, s]) => window.__pc.zona(id, s), [p.id, p.scroll ?? 0]);
      if (!ok) continue;
      await pagina.waitForTimeout(450);
      const clip = await pagina.evaluate((id) => window.__pc.caixa(id), p.id);
      if (!clip || clip.width < 4 || clip.height < 4) continue;
      const ficheiro = `${nomeDisp}-${p.tipo}-${String(totalCapturas + 1).padStart(2, '0')}.png`;
      await pagina.screenshot({ path: path.join(saida, ficheiro), clip, scale: 'css' });
      p.captura = ficheiro;
      capturasPorFalha.set(chave, feitas + 1);
      totalCapturas++;
    } catch {}
  }
}

// ---------------------------------------------------------------- correr
if (saida) fs.mkdirSync(saida, { recursive: true });
const motores = [['chromium', chromium]];
if (comWebkit) motores.push(['webkit', webkit]);

const resultado = { url, data: new Date().toISOString(), reduzido, dispositivos: [], avisos: [] };
for (const [motor, tipoBrowser] of motores) {
  let browser;
  try {
    browser = await tipoBrowser.launch();
  } catch (e) {
    const aviso = `${motor} não está instalado (npx playwright install ${motor}); segue sem ele.`;
    console.error(`Aviso: ${aviso}`);
    resultado.avisos.push(aviso);
    continue;
  }
  try {
    const lista = motor === 'webkit' ? dispositivos.filter((d) => d.toque) : dispositivos;
    for (const d of lista) {
      const nome = motor === 'chromium' ? d.nome : `${d.nome}-${motor}`;
      const r = await percorrerDispositivo(browser, motor, d);
      await capturar(r.pagina, nome, r.problemas);
      await r.ctx.close();
      resultado.dispositivos.push({
        nome,
        motor,
        largura: d.largura,
        altura: d.altura,
        tipo: d.tipo,
        alturaPagina: r.alturaPagina,
        ecras: Number((r.alturaPagina / d.altura).toFixed(1)),
        problemas: r.problemas.map(({ chave, id, scroll, ...resto }) => (resto.com ? { ...resto, com: { seletor: resto.com.seletor, texto: resto.com.texto, y: resto.com.y } } : resto)),
      });
      process.stderr.write(`${nome}: ${r.problemas.length} problemas\n`);
    }
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------- resumo
const porTipo = new Map();
for (const d of resultado.dispositivos) {
  for (const p of d.problemas) {
    const t = porTipo.get(p.tipo) ?? new Map();
    const k = p.seletor === '(consola)' || p.seletor === '(pedido)' ? p.detalhe.slice(0, 90) : p.seletor;
    const item = t.get(k) ?? { dispositivos: [], exemplo: p };
    item.dispositivos.push(d.nome);
    t.set(k, item);
    porTipo.set(p.tipo, t);
  }
}
resultado.resumo = Object.fromEntries([...porTipo].map(([t, m]) => [t, [...m.values()].reduce((a, v) => a + v.dispositivos.length, 0)]));
resultado.ok = porTipo.size === 0;

const linhas = [];
const n = resultado.dispositivos.length;
linhas.push(resultado.ok ? `Sem falhas em ${n} dispositivos.` : `Falhas em ${resultado.dispositivos.filter((d) => d.problemas.length).length} de ${n} dispositivos.`);
const encurtar = (s, m) => (s.length > m ? s.slice(0, m - 1) + '…' : s);
const listarDisp = (l) => (l.length === n ? 'todos' : l.length > 4 ? `${l.slice(0, 3).join(', ')} e mais ${l.length - 3}` : l.join(', '));
const tipos = [...porTipo];
const porTipoMax = Math.max(1, Math.floor(26 / Math.max(1, tipos.length)) - 1);
for (const [tipo, m] of tipos) {
  if (linhas.length >= 29) break;
  linhas.push(`${tipo}: ${m.size} ${m.size === 1 ? 'caso' : 'casos'}`);
  for (const [, v] of [...m].slice(0, porTipoMax)) {
    if (linhas.length >= 29) break;
    const e = v.exemplo;
    const onde = e.seletor.startsWith('(') ? '' : `${encurtar(e.seletor, 60)} y=${e.y}: `;
    linhas.push(`  ${onde}${encurtar(e.detalhe, 90)} [${listarDisp(v.dispositivos)}]`);
  }
}
for (const a of resultado.avisos) if (linhas.length < 30) linhas.push(`Aviso: ${a}`);
if (saida && linhas.length < 30) linhas.push(`JSON e ${totalCapturas} capturas em ${saida}`);
const resumo = linhas.slice(0, 30).join('\n');

if (saida) {
  fs.writeFileSync(path.join(saida, 'percurso.json'), JSON.stringify(resultado, null, 2));
  console.log(resumo);
} else {
  console.error(resumo);
  console.log(JSON.stringify(resultado, null, 2));
}
process.exit(resultado.ok ? 0 : 2);
