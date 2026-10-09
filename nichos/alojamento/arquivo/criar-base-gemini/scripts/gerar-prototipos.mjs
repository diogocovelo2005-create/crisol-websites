#!/usr/bin/env node
/*
  Passo 4 da criar-base: três bases de design com o Gemini 3.1 Pro.

  Uso:
    node gerar-prototipos.mjs <pasta-da-casa> [opções]

  Opções:
    --simular            conta os tokens (grátis) e mostra o custo previsto, sem gerar
    --replanear          três direções novas; a ronda anterior vai para prototipos/anteriores/
                         e o planeamento sabe que foi recusada
    --so a,c             constrói só estas bases (as direções mantêm-se)
    --nota "<texto>"     o pedido do Diogo: com --so, vai para essas bases (substitui a nota
                         anterior); com --replanear, vai para o planeamento
    --pensamento <nível> medium (defeito), high ou low
    --corrigir           corrige uma vez as bases que falham a verificação (por defeito não:
                         os problemas ficam no índice e o Claude corrige só a escolhida)

  Lê:
    prototipos/BRIEF.md              a estrutura escrita pelo Claude (história, secções, texto)
    dossie/pontos-fortes.md          o que encanta na casa
    prototipos/fotos.md e fotos/     preparados por preparar-fotos.py
    prototipos/inspiracao/           capturas do Diogo (obrigatórias: são a única fonte de estética)

  Grava em prototipos/: direcoes.json, a.html, b.html, c.html, index.html,
  verificacao.json e respostas/. O custo vai para custos-gemini.json da casa.

  As fotos vão ao Gemini em baixa resolução (260 tokens em vez de 1080): ele
  tem a descrição detalhada de cada uma em fotos.md. As inspirações vão em
  alta, porque o que interessa nelas (escala da letra, espaço) só se lê assim.

  Cache: o planeamento e as bases partilham o mesmo início (instruções,
  ferramentas e material da casa) e só diferem no pedido final. O planeamento
  corre primeiro, por isso as três bases reaproveitam esse início pela cache
  implícita do Gemini (tokens em cache custam 10%).
*/

import fs from 'node:fs';
import path from 'node:path';
import {
  MODELOS, SKILL, sair, lerChave, imagem, lerTexto, gerarEmStream, custo, registarCusto, extrairJson,
} from './lib/gemini.mjs';
import { verificar } from './verificar-prototipo.mjs';

const MODELO = MODELOS.construir;
const FERRAMENTAS = [{ google_search: {} }, { url_context: {} }];

function argumentos() {
  const args = process.argv.slice(2);
  const o = { so: null, nota: null, pensamento: 'medium', simular: false, replanear: false, corrigir: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--so') o.so = (args[++i] ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (a === '--nota') o.nota = args[++i];
    else if (a === '--pensamento') o.pensamento = args[++i];
    else if (a === '--simular') o.simular = true;
    else if (a === '--replanear') o.replanear = true;
    else if (a === '--corrigir') o.corrigir = true;
    else o.casa = path.resolve(a);
  }
  if (!o.casa) sair('Uso: node gerar-prototipos.mjs <pasta-da-casa> [--simular] [--so a,c] [--nota "..."] [--replanear]');
  if (!['high', 'medium', 'low'].includes(o.pensamento)) sair('--pensamento tem de ser high, medium ou low.');
  if (o.nota && !o.so && !o.replanear) sair('--nota precisa de --so (para essas bases) ou de --replanear (para o planeamento).');
  return o;
}

function material(casa) {
  const pasta = path.join(casa, 'prototipos');
  const fotosDir = path.join(pasta, 'fotos');
  if (!fs.existsSync(fotosDir)) sair('Falta prototipos/fotos: corre preparar-fotos.py pacote.');
  const fotos = fs.readdirSync(fotosDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const inspDir = path.join(pasta, 'inspiracao');
  const inspiracoes = fs.existsSync(inspDir) ? fs.readdirSync(inspDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
  return {
    pasta,
    brief: lerTexto(path.join(pasta, 'BRIEF.md'), 'o BRIEF.md'),
    pontosFortes: lerTexto(path.join(casa, 'dossie', 'pontos-fortes.md'), 'os pontos fortes do dossiê'),
    fotosMd: lerTexto(path.join(pasta, 'fotos.md'), 'prototipos/fotos.md'),
    fotos: fotos.map((f) => ({ nome: f, caminho: path.join(fotosDir, f) })),
    inspiracoes: inspiracoes.map((f) => path.join(inspDir, f)),
  };
}

// Instruções iguais em todas as chamadas (condição da cache): o que é cada
// pedido e as regras da tarefa. Nada de estética: essa vem das inspirações.
function instrucoes() {
  const ref = (f) => lerTexto(path.join(SKILL, 'references', f));
  return [
    'Vais receber um de dois pedidos sobre a mesma casa: **planear** as três direções (segue "Planear as três bases") ou **construir** uma das bases (segue "Regras da base"). O pedido vem no fim da mensagem.',
    ref('planear.md'),
    ref('regras-prototipo.md'),
  ].join('\n\n---\n\n');
}

// As partes comuns a todas as chamadas: casa, fotos e inspirações.
function partesDaCasa(m) {
  const partes = [
    { text: `# Estrutura da casa\n\n${m.brief}` },
    { text: `# O que encanta nesta casa (do dossiê)\n\nContexto. O texto visível vem só da estrutura.\n\n${m.pontosFortes}` },
    { text: `# Fotografias do pacote\n\n${m.fotosMd}\n\nSeguem as imagens, cada uma antecedida do caminho.` },
  ];
  for (const f of m.fotos) partes.push({ text: `fotos/${f.nome}` }, imagem(f.caminho));
  if (m.inspiracoes.length) {
    partes.push({ text: `# Inspirações do Diogo\n\n${m.inspiracoes.length} capturas de sites de que ele gosta.` });
    m.inspiracoes.forEach((p, i) => partes.push({ text: `Inspiração ${i + 1}` }, { ...imagem(p), mediaResolution: { level: 'MEDIA_RESOLUTION_HIGH' } }));
  }
  return partes;
}

function corpo(m, pedido, generationConfig) {
  return {
    systemInstruction: { parts: [{ text: instrucoes() }] },
    contents: [{ role: 'user', parts: [...partesDaCasa(m), ...pedido] }],
    tools: FERRAMENTAS,
    generationConfig: { mediaResolution: 'MEDIA_RESOLUTION_LOW', ...generationConfig },
  };
}

function textoDaDirecao(d) {
  return [
    `# ${d.letra.toUpperCase()} · ${d.nome}`, '', d.ideia, '',
    `**Composição:** ${d.composicao}`,
    `**Primeiro ecrã:** ${d.primeiro_ecra}`,
    `**Tipografia:** ${d.tipografia}`,
    `**Cor:** ${d.cor}`,
    `**Movimento:** ${d.movimento}`,
    `**Inspiração:** ${d.inspiracao}`,
    `**Evitar:** ${d.evitar}`,
    ...(d.nota ? ['', `**Pedido do Diogo:** ${d.nota}`] : []),
  ].join('\n');
}

// recusadas: as direções da ronda anterior, quando o Diogo recusou as três.
function pedidoPlanear(m, pensamento, { recusadas = [], nota = null } = {}) {
  const contexto = [];
  if (recusadas.length) {
    contexto.push(`# Ronda anterior, recusada pelo Diogo\n\nEstas três direções já foram construídas e ele não quis nenhuma. As novas têm de ser visivelmente diferentes delas.\n\n${recusadas.map((d) => `- ${d.nome}: ${d.ideia} Tipografia: ${d.tipografia}. Composição: ${d.composicao}`).join('\n')}`);
  }
  if (nota) contexto.push(`# O que o Diogo pediu\n\n${nota}\n\nIsto manda sobre as tuas preferências.`);
  return corpo(m, [
    ...contexto.map((text) => ({ text })),
    { text: '# Pedido: planear\n\nDecide agora as três direções. Responde só com o array JSON, sem cercas de markdown.' },
  ], { thinkingConfig: { thinkingLevel: pensamento } });
}

function pedidoConstruir(m, direcoes, letra, pensamento) {
  const esta = direcoes.find((d) => d.letra === letra);
  const outras = direcoes.filter((d) => d.letra !== letra).map((d) => `- ${d.letra.toUpperCase()} · ${d.nome}: ${d.ideia}`).join('\n');
  return corpo(m, [
    { text: `# Pedido: construir\n\n## A tua direção\n\n${textoDaDirecao(esta)}\n\n## As outras duas bases (diferentes de ti)\n\n${outras}` },
    { text: 'Constrói agora esta base. Responde apenas com o documento HTML completo, a começar em <!doctype html> e a acabar em </html>.' },
  ], { thinkingConfig: { thinkingLevel: pensamento }, maxOutputTokens: 65536 });
}

function pedidoCorrigir(m, html, falhas, pensamento) {
  return {
    systemInstruction: { parts: [{ text: lerTexto(path.join(SKILL, 'references', 'regras-prototipo.md')) }] },
    contents: [{
      role: 'user',
      parts: [
        { text: `# Brief da casa\n\n${m.brief}` },
        { text: `# Fotografias do pacote\n\n${m.fotosMd}` },
        { text: `# A base que construíste\n\n${html}` },
        { text: `# O que a verificação automática encontrou\n\n${falhas.map((f) => `- ${f}`).join('\n')}\n\nCorrige estes problemas sem mudar a direção de design nem o que está bem. Responde apenas com o documento HTML completo, a começar em <!doctype html>.` },
      ],
    }],
    generationConfig: { thinkingConfig: { thinkingLevel: pensamento }, maxOutputTokens: 65536 },
  };
}

function extrairHtml(texto) {
  let html = texto.trim();
  const cerca = html.match(/```(?:html)?\s*([\s\S]*?)(?:```|$)/i);
  if (!/^<!doctype/i.test(html) && cerca) html = cerca[1].trim();
  const inicio = html.search(/<!doctype html/i);
  if (inicio > 0) html = html.slice(inicio);
  // Qualquer nota escrita depois do documento fica de fora.
  const fim = html.toLowerCase().lastIndexOf('</html>');
  return fim >= 0 ? html.slice(0, fim + '</html>'.length) : html;
}

async function contarTokens(chave, corpo) {
  const { systemInstruction, contents, tools, generationConfig } = corpo;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:countTokens`, {
    method: 'POST',
    headers: { 'x-goog-api-key': chave, 'Content-Type': 'application/json' },
    body: JSON.stringify({ generateContentRequest: { model: `models/${MODELO}`, systemInstruction, contents, tools, generationConfig: { mediaResolution: generationConfig?.mediaResolution } } }),
  });
  if (!r.ok) sair(`countTokens falhou: ${await r.text()}`);
  return (await r.json()).totalTokens;
}

async function construirUma(chave, m, direcoes, letra, o) {
  const rotulo = letra;
  const r = await gerarEmStream(MODELO, chave, pedidoConstruir(m, direcoes, letra, o.pensamento), rotulo);
  fs.writeFileSync(path.join(m.pasta, 'respostas', `${letra}.txt`), r.texto);
  let html = extrairHtml(r.texto);
  const custos = [custo(MODELO, r.uso, r.pesquisas.length)];
  const completo = r.fim === 'STOP' && /<\/html>\s*$/i.test(html);
  fs.writeFileSync(path.join(m.pasta, `${letra}.html`), html);
  if (!completo) return { letra, ok: false, falhas: [`resposta incompleta (${r.fim})`], custos, pesquisas: r.pesquisas };

  let v = await verificar(path.join(m.pasta, `${letra}.html`), { brief: m.brief, fotos: path.join(m.pasta, 'fotos') });
  let corrigido = false;
  if (!v.ok && o.corrigir) {
    console.log(`[${letra}] a corrigir: ${v.falhas.join('; ').slice(0, 300)}`);
    // A correção é mecânica: pensamento baixo chega e custa menos.
    const c = await gerarEmStream(MODELO, chave, pedidoCorrigir(m, html, v.falhas, 'low'), `${letra} correção`);
    custos.push(custo(MODELO, c.uso));
    const novo = extrairHtml(c.texto);
    if (c.fim === 'STOP' && /<\/html>\s*$/i.test(novo)) {
      html = novo;
      fs.writeFileSync(path.join(m.pasta, `${letra}.html`), html);
      v = await verificar(path.join(m.pasta, `${letra}.html`), { brief: m.brief, fotos: path.join(m.pasta, 'fotos') });
      corrigido = true;
    }
  }
  return { letra, ok: v.ok, falhas: v.falhas, avisos: v.avisos, corrigido, custos, pesquisas: r.pesquisas, urls: r.urls };
}

// Move a ronda atual (direções, bases, verificação) para anteriores/ronda-N.
function arquivarRonda(pasta) {
  const anteriores = path.join(pasta, 'anteriores');
  fs.mkdirSync(anteriores, { recursive: true });
  const n = fs.readdirSync(anteriores).filter((f) => /^ronda-\d+$/.test(f)).length + 1;
  const destino = path.join(anteriores, `ronda-${n}`);
  fs.mkdirSync(destino);
  for (const f of fs.readdirSync(pasta)) {
    if (!/^([abc]\.html|direcao-[abc]\.md|direcoes\.json|verificacao\.json)$/.test(f)) continue;
    fs.renameSync(path.join(pasta, f), path.join(destino, f));
    // As fotos ficam em prototipos/fotos: a base arquivada continua a vê-las.
    if (f.endsWith('.html')) {
      const html = fs.readFileSync(path.join(destino, f), 'utf8').replace(/(["'(\s,])fotos\//g, '$1../../fotos/');
      fs.writeFileSync(path.join(destino, f), html);
    }
  }
  return `ronda-${n}`;
}

function escapar(t = '') {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escreverIndice(pasta, direcoes, verificacao) {
  const cartoes = direcoes
    .filter((d) => fs.existsSync(path.join(pasta, `${d.letra}.html`)))
    .map((d) => {
      const v = verificacao[d.letra] ?? {};
      const estado = v.ok ? 'Passou na verificação automática.' : `Por rever: ${(v.falhas ?? []).join('; ')}`;
      return `
    <article class="cartao">
      <p class="letra">${d.letra.toUpperCase()}</p>
      <h2>${escapar(d.nome)}</h2>
      <p class="resumo">${escapar(d.ideia)}</p>
      <p class="estado">${escapar(estado)}</p>
      <div class="acoes">
        <a href="${d.letra}.html" target="_blank" rel="noopener">Abrir</a>
        <button type="button" data-telemovel="${d.letra}.html">Ver em telemóvel</button>
      </div>
    </article>`;
    })
    .join('');
  const anteriores = fs.existsSync(path.join(pasta, 'anteriores'))
    ? fs.readdirSync(path.join(pasta, 'anteriores')).filter((f) => /^ronda-\d+$/.test(f)).sort()
    : [];
  const rondas = anteriores.length
    ? `<p class="rondas">Rondas recusadas: ${anteriores.map((r) => ['a', 'b', 'c'].map((l) => `<a href="anteriores/${r}/${l}.html" target="_blank" rel="noopener">${r.replace('ronda-', '')}${l.toUpperCase()}</a>`).join(' ')).join(' · ')}</p>`
    : '';
  fs.writeFileSync(path.join(pasta, 'index.html'), `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bases</title>
<style>
  :root { --fundo: #f4f3ef; --texto: #1c1c1a; --suave: #5d5c57; --linha: #d9d7cf; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: var(--fundo); color: var(--texto); }
  main { max-width: 1200px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { font-size: 20px; margin: 0 0 24px; }
  .grelha { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .cartao { background: #fff; border: 1px solid var(--linha); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
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
</style>
</head>
<body>
<main>
  <h1>Três bases. Abre cada uma, percorre até ao fim e escolhe.</h1>
  <div class="grelha">${cartoes}
  </div>
  ${rondas}
</main>
<dialog id="telemovel"><form method="dialog"><button>Fechar</button></form><iframe title="Pré-visualização em telemóvel"></iframe></dialog>
<script>
  const dialogo = document.getElementById('telemovel');
  const moldura = dialogo.querySelector('iframe');
  document.querySelectorAll('[data-telemovel]').forEach((b) => b.addEventListener('click', () => { moldura.src = b.dataset.telemovel; dialogo.showModal(); }));
  dialogo.addEventListener('close', () => { moldura.src = 'about:blank'; });
</script>
</body>
</html>
`);
}

async function main() {
  const o = argumentos();
  const chave = lerChave();
  const m = material(o.casa);
  const direcoesPath = path.join(m.pasta, 'direcoes.json');
  fs.mkdirSync(path.join(m.pasta, 'respostas'), { recursive: true });
  // As inspirações são a única fonte de estética: sem elas não há bases.
  if (!m.inspiracoes.length && !o.simular) {
    sair('Faltam as inspirações do Diogo em prototipos/inspiracao/. Pede-lhe as capturas e copia-as com preparar-fotos.py inspiracao.');
  }

  if (o.simular) {
    const planear = await contarTokens(chave, pedidoPlanear(m, o.pensamento));
    const exemplo = [{ letra: 'a', nome: '-', ideia: '-', composicao: '-', primeiro_ecra: '-', tipografia: '-', cor: '-', movimento: '-', inspiracao: '-', evitar: '-' }];
    const construir = await contarTokens(chave, pedidoConstruir(m, exemplo, 'a', o.pensamento));
    // O início comum (tudo menos o pedido final) é ~o planeamento inteiro.
    const comum = planear - 60;
    const semCache = planear + construir * 3;
    const comCache = planear + 3 * (comum * 0.1 + (construir - comum));
    // Saída prevista: ~9 mil tokens por base (até 800 linhas, pensamento medium) e ~5 mil no planeamento.
    const saida = (5000 + 3 * 9000) * 12;
    const previsto = (entrada) => ((entrada * 2 + saida) / 1e6).toFixed(2);
    console.log(`Entrada: planear ${planear} tokens, cada base ${construir} tokens (${m.fotos.length} fotos, ${m.inspiracoes.length} inspirações).`);
    console.log(`Custo previsto: ~${previsto(comCache)} $ com a cache a funcionar, ~${previsto(semCache)} $ sem ela. Não conta pesquisas web (~0,014 $ cada) nem páginas abertas.`);
    return;
  }

  let direcoes;
  if (!fs.existsSync(direcoesPath) || o.replanear) {
    let recusadas = [];
    if (fs.existsSync(direcoesPath)) {
      recusadas = JSON.parse(fs.readFileSync(direcoesPath, 'utf8'));
      const ronda = arquivarRonda(m.pasta);
      console.log(`A ronda anterior ficou em prototipos/anteriores/${ronda}/.`);
    }
    console.log(`A planear as três direções com ${MODELO}…`);
    const r = await gerarEmStream(MODELO, chave, pedidoPlanear(m, o.pensamento, { recusadas, nota: o.replanear ? o.nota : null }), 'planear');
    try {
      direcoes = extrairJson(r.texto);
    } catch {
      sair(`O planeamento não devolveu JSON válido:\n${r.texto.slice(0, 600)}`);
    }
    if (!Array.isArray(direcoes) || direcoes.length !== 3) sair('O planeamento não devolveu três direções.');
    direcoes.forEach((d, i) => { d.letra = 'abc'[i]; });
    fs.writeFileSync(direcoesPath, JSON.stringify(direcoes, null, 2));
    for (const d of direcoes) fs.writeFileSync(path.join(m.pasta, `direcao-${d.letra}.md`), textoDaDirecao(d));
    const c = custo(MODELO, r.uso, r.pesquisas.length);
    registarCusto(o.casa, 'planear', { modelo: MODELO, dolares: c.dolares, tokens: c, pesquisas: r.pesquisas });
    console.log(`Direções: ${direcoes.map((d) => `${d.letra.toUpperCase()} ${d.nome}`).join(' · ')} (${c.dolares} $)`);
  } else {
    direcoes = JSON.parse(fs.readFileSync(direcoesPath, 'utf8'));
  }

  const letras = o.so ?? direcoes.map((d) => d.letra);
  const desconhecidas = letras.filter((l) => !direcoes.some((d) => d.letra === l));
  if (desconhecidas.length) sair(`Não há bases ${desconhecidas.join(', ')}: as direções são ${direcoes.map((d) => d.letra).join(', ')}.`);
  if (o.nota && o.so) {
    // A nota mais recente substitui a anterior: os pedidos não se acumulam.
    for (const d of direcoes) if (letras.includes(d.letra)) d.nota = o.nota;
    fs.writeFileSync(direcoesPath, JSON.stringify(direcoes, null, 2));
    for (const d of direcoes) fs.writeFileSync(path.join(m.pasta, `direcao-${d.letra}.md`), textoDaDirecao(d));
  }

  console.log(`A construir ${letras.join(', ')} com ${MODELO}, pensamento ${o.pensamento}…`);
  const resultados = await Promise.all(letras.map(async (letra) => {
    try {
      return await construirUma(chave, m, direcoes, letra, o);
    } catch (causa) {
      return { letra, ok: false, falhas: [`erro: ${causa.message}`], custos: [] };
    }
  }));

  const verificacaoPath = path.join(m.pasta, 'verificacao.json');
  const verificacao = fs.existsSync(verificacaoPath) ? JSON.parse(fs.readFileSync(verificacaoPath, 'utf8')) : {};
  let totalCorrida = 0;
  for (const r of resultados) {
    const dolares = r.custos.reduce((s, c) => s + c.dolares, 0);
    totalCorrida += dolares;
    verificacao[r.letra] = { ok: r.ok, falhas: r.falhas, avisos: r.avisos ?? [], corrigido: r.corrigido ?? false };
    registarCusto(o.casa, `base ${r.letra}`, { modelo: MODELO, dolares: Number(dolares.toFixed(4)), tokens: r.custos, pesquisas: r.pesquisas ?? [], urls: r.urls ?? [], corrigido: r.corrigido ?? false });
    console.log(`[${r.letra}] ${r.ok ? 'passou' : `POR REVER: ${r.falhas.join('; ')}`}${r.corrigido ? ' (depois de uma correção)' : ''} · ${dolares.toFixed(3)} $`);
  }
  fs.writeFileSync(verificacaoPath, JSON.stringify(verificacao, null, 2));
  escreverIndice(m.pasta, direcoes, verificacao);

  const total = JSON.parse(fs.readFileSync(path.join(o.casa, 'custos-gemini.json'), 'utf8')).total_dolares;
  console.log(`Custo desta corrida: ${totalCorrida.toFixed(2)} $ · total Gemini da casa: ${total.toFixed(2)} $`);
}

main();
