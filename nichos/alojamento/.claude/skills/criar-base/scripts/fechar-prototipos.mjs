#!/usr/bin/env node
/*
  Fecha a ronda de protótipos: verifica os três, grava prototipos/verificacao.json
  e escreve prototipos/index.html, a página onde o Diogo escolhe.

  Uso:
    node fechar-prototipos.mjs <pasta-da-casa>

  Lê prototipos/variacoes.json (letra, nome, ideia) para os cartões. Cada
  cartão abre com o primeiro ecrã do protótipo (1440×900, em miniatura),
  para o Diogo comparar os três lado a lado. Uma
  ronda anterior recusada fica em prototipos/anteriores/ e aparece no fim.

  Do BRIEF.md tira também o guião (`## O guião`) e o plano de fotos (as
  linhas **Fotos:** de cada secção `## N. …`; a da secção 1 é o primeiro
  ecrã), para o Diogo decidir na mesma página a estética, o percurso e as
  fotos.
*/

import fs from 'node:fs';
import path from 'node:path';
import { verificar, resumoMedidas } from './verificar-prototipo.mjs';

const casa = process.argv[2] && path.resolve(process.argv[2]);
if (!casa) {
  console.error('Uso: node fechar-prototipos.mjs <pasta-da-casa>');
  process.exit(1);
}
const pasta = path.join(casa, 'prototipos');
const variacoes = JSON.parse(fs.readFileSync(path.join(pasta, 'variacoes.json'), 'utf8'));
const brief = fs.readFileSync(path.join(pasta, 'BRIEF.md'), 'utf8');
const fotos = path.join(pasta, 'fotos');

const verificacao = {};
for (const v of variacoes) {
  const ficheiro = path.join(pasta, `${v.letra}.html`);
  if (!fs.existsSync(ficheiro)) {
    verificacao[v.letra] = { ok: false, falhas: ['o protótipo não foi entregue'], avisos: [] };
  } else {
    verificacao[v.letra] = await verificar(ficheiro, { brief, fotos, prototipo: true });
  }
  const r = verificacao[v.letra];
  console.log(`[${v.letra}] ${r.ok ? 'passou' : `POR REVER: ${r.falhas.join('; ')}`}${r.avisos.length ? ` · avisos: ${r.avisos.join('; ')}` : ''}`);
  if (r.medidas) console.log(`    ${resumoMedidas(r.medidas)}`);
}
fs.writeFileSync(path.join(pasta, 'verificacao.json'), JSON.stringify(verificacao, null, 2));

const escapar = (t = '') => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// O BRIEF por secções `## …`.
const blocos = [];
for (const linha of brief.split('\n')) {
  if (linha.startsWith('## ')) blocos.push({ titulo: linha.slice(3).trim(), linhas: [] });
  else blocos.at(-1)?.linhas.push(linha);
}

// O guião: `N. Nome · tipo · o que se descobre → a pergunta seguinte`.
const blocoGuiao = blocos.find((b) => /^o guião/i.test(b.titulo));
const momentos = (blocoGuiao?.linhas ?? [])
  .map((l) => l.trim().match(/^(\d+)\.\s+(.*)$/))
  .filter(Boolean)
  .map(([, n, resto]) => {
    const [nome = '', tipo = '', ...mais] = resto.split('·').map((p) => p.trim());
    const [descobre = '', pergunta = ''] = mais.join(' · ').split('→').map((p) => p.trim());
    return { n, nome, tipo, descobre, pergunta };
  });
const guiao = momentos.length
  ? `<ol class="guiao">${momentos
      .map((m) => `
      <li><span class="num">${escapar(m.n)}</span><div><p class="momento"><strong>${escapar(m.nome)}</strong> <span class="tipo">${escapar(m.tipo)}</span></p><p class="descobre">${escapar(m.descobre)}</p>${m.pergunta ? `<p class="pergunta">→ ${escapar(m.pergunta)}</p>` : ''}</div></li>`)
      .join('')}
    </ol>`
  : '<p class="nota">O BRIEF não tem guião (`## O guião`).</p>';

// O plano de fotos: os caminhos fotos/… da linha **Fotos:** de cada secção.
const seccoes = blocos
  .filter((b) => /^\d+\./.test(b.titulo))
  .map((b) => {
    const linhaFotos = b.linhas.filter((l) => l.startsWith('**Fotos:**')).join(' ');
    const lista = [...new Set([...linhaFotos.matchAll(/fotos\/[\w.-]+\.(?:jpe?g|png|webp|avif)/gi)].map((m) => m[0]))];
    return { titulo: b.titulo, fotos: lista };
  });
const miniatura = (f) => {
  const existe = fs.existsSync(path.join(pasta, f));
  return `<figure class="mini">${existe ? `<a href="${escapar(f)}" target="_blank" rel="noopener"><img src="${escapar(f)}" alt="" loading="lazy"></a>` : '<div class="falta">não está no pacote</div>'}<figcaption>${escapar(path.basename(f))}</figcaption></figure>`;
};
const planoFotos = seccoes.length
  ? seccoes
      .map((s, i) => `
      <section class="seccao-fotos${i === 0 ? ' primeiro' : ''}">
        <h3>${escapar(s.titulo)}${i === 0 ? ' <span class="tipo">primeiro ecrã</span>' : ''}</h3>
        <div class="minis">${s.fotos.length ? s.fotos.map(miniatura).join('') : '<p class="nota">Sem fotos atribuídas.</p>'}</div>
      </section>`)
      .join('')
  : '<p class="nota">O BRIEF não tem secções numeradas com **Fotos:**.</p>';
const cartoes = variacoes
  .filter((v) => fs.existsSync(path.join(pasta, `${v.letra}.html`)))
  .map((v) => {
    const r = verificacao[v.letra];
    const estado = r.ok ? 'Passou na verificação automática.' : `Por rever: ${r.falhas.join('; ')}`;
    return `
    <article class="cartao">
      <a class="vista" href="${v.letra}.html" target="_blank" rel="noopener" aria-label="Abrir o protótipo ${v.letra.toUpperCase()}"><iframe src="${v.letra}.html" title="Primeiro ecrã do protótipo ${v.letra.toUpperCase()}" loading="lazy" tabindex="-1" scrolling="no"></iframe></a>
      <p class="letra">${v.letra.toUpperCase()}</p>
      <h2>${escapar(v.nome)}</h2>
      <p class="resumo">${escapar(v.ideia)}</p>
      <p class="estado">${escapar(estado)}</p>
      <div class="acoes">
        <a href="${v.letra}.html" target="_blank" rel="noopener">Abrir</a>
        <button type="button" data-telemovel="${v.letra}.html">Ver em telemóvel</button>
      </div>
    </article>`;
  })
  .join('');
const anteriores = fs.existsSync(path.join(pasta, 'anteriores'))
  ? fs.readdirSync(path.join(pasta, 'anteriores')).filter((f) => /^ronda-\d+$/.test(f)).sort()
  : [];
const rondas = anteriores.length
  ? `<p class="rondas">Rondas anteriores: ${anteriores.map((r) => ['a', 'b', 'c'].filter((l) => fs.existsSync(path.join(pasta, 'anteriores', r, `${l}.html`))).map((l) => `<a href="anteriores/${r}/${l}.html" target="_blank" rel="noopener">${r.replace('ronda-', '')}${l.toUpperCase()}</a>`).join(' ')).join(' · ')}</p>`
  : '';

fs.writeFileSync(path.join(pasta, 'index.html'), `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Protótipos</title>
<style>
  :root { --fundo: #f4f3ef; --texto: #1c1c1a; --suave: #5d5c57; --linha: #d9d7cf; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: var(--fundo); color: var(--texto); }
  main { max-width: 1200px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  .nota { margin: 0 0 24px; color: var(--suave); font-size: 14px; }
  .grelha { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .cartao { background: #fff; border: 1px solid var(--linha); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
  .vista { display: block; position: relative; aspect-ratio: 1440 / 900; overflow: hidden; border-radius: 4px; background: var(--linha); margin-bottom: 8px; }
  .vista iframe { position: absolute; top: 0; left: 0; width: 1440px; height: 900px; border: 0; transform-origin: 0 0; pointer-events: none; }
  .letra { margin: 0; font-weight: 700; font-size: 28px; }
  h2 { margin: 0; font-size: 17px; }
  .resumo { margin: 0; color: var(--suave); font-size: 14px; flex: 1; }
  .estado { margin: 0; font-size: 13px; color: var(--suave); }
  .acoes { display: flex; gap: 8px; }
  .acoes a, .acoes button { font: inherit; font-size: 14px; padding: 8px 14px; border-radius: 6px; border: 1px solid var(--texto); background: var(--texto); color: #fff; text-decoration: none; cursor: pointer; }
  .acoes button { background: transparent; color: var(--texto); }
  .rondas { margin-top: 24px; font-size: 14px; color: var(--suave); }
  .rondas a { color: var(--texto); }
  dialog { padding: 0; border: none; border-radius: 12px; background: #111; }
  dialog iframe { display: block; width: 390px; height: min(844px, 90vh); border: 0; background: #fff; }
  dialog form { text-align: right; }
  dialog button { margin: 6px; font: inherit; font-size: 13px; }
  h2.bloco { font-size: 17px; margin: 40px 0 12px; }
  .decides { background: #fff; border: 1px solid var(--linha); border-radius: 8px; padding: 16px 20px; margin: 0 0 24px; }
  .decides ul { margin: 6px 0 0; padding-left: 20px; font-size: 14px; color: var(--suave); }
  .decides strong { color: var(--texto); }
  .guiao { list-style: none; margin: 0; padding: 0; max-width: 720px; border-top: 1px solid var(--linha); }
  .guiao li { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--linha); }
  .guiao .num { font-weight: 700; min-width: 1.6em; }
  .guiao p { margin: 0; }
  .momento strong { font-size: 15px; }
  .tipo { display: inline-block; margin-left: 6px; padding: 1px 8px; border: 1px solid var(--linha); border-radius: 99px; font-size: 12px; color: var(--suave); font-weight: 400; }
  .descobre { font-size: 14px; }
  .pergunta { font-size: 14px; color: var(--suave); font-style: italic; }
  .seccao-fotos { margin: 0 0 20px; }
  .seccao-fotos h3 { font-size: 15px; margin: 0 0 8px; }
  .minis { display: flex; flex-wrap: wrap; gap: 10px; }
  .mini { margin: 0; width: 150px; }
  .mini img, .mini .falta { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 4px; background: var(--linha); }
  .mini .falta { display: grid; place-items: center; font-size: 12px; color: var(--suave); }
  .mini figcaption { font-size: 12px; color: var(--suave); margin-top: 4px; word-break: break-all; }
  .primeiro .mini { width: min(100%, 480px); }
</style>
</head>
<body>
<main>
  <h1>Três protótipos. Abre cada um, percorre até ao fim e escolhe.</h1>
  <p class="nota">Estáticos de propósito: aqui escolhe-se a estética. O primeiro ecrã é o formato fixo e entra no site final; o movimento vem depois da escolha.</p>
  <div class="decides">
    <strong>O que decides aqui</strong>
    <ul>
      <li><strong>A estética:</strong> A, B ou C (ou partes de cada uma).</li>
      <li><strong>O percurso:</strong> o guião, momento a momento; muda a ordem ou corta o que não puxa o seguinte.</li>
      <li><strong>As fotos de cada secção:</strong> a do primeiro ecrã e as outras; troca as que não te convencem.</li>
    </ul>
  </div>
  <div class="grelha">${cartoes}
  </div>
  ${rondas}
  <h2 class="bloco">O guião</h2>
  ${guiao}
  <h2 class="bloco">As fotos de cada secção</h2>
  ${planoFotos}
</main>
<dialog id="telemovel"><form method="dialog"><button>Fechar</button></form><iframe title="Pré-visualização em telemóvel"></iframe></dialog>
<script>
  const dialogo = document.getElementById('telemovel');
  const moldura = dialogo.querySelector('iframe');
  document.querySelectorAll('[data-telemovel]').forEach((b) => b.addEventListener('click', () => { moldura.src = b.dataset.telemovel; dialogo.showModal(); }));
  dialogo.addEventListener('close', () => { moldura.src = 'about:blank'; });
  // As miniaturas: o protótipo a 1440×900, encolhido à largura do cartão.
  const escalar = () => document.querySelectorAll('.vista').forEach((v) => { v.querySelector('iframe').style.transform = 'scale(' + v.clientWidth / 1440 + ')'; });
  addEventListener('resize', escalar);
  escalar();
</script>
</body>
</html>
`);
console.log(`Página de escolha: ${path.join(pasta, 'index.html')}`);
