/*
  O que todos os scripts da criar-base partilham para falar com o Gemini:
  a chave, a chamada (normal ou em streaming), as novas tentativas e o custo.

  Preços por milhão de tokens (setembro de 2026). O pensamento é cobrado como
  saída. As pesquisas Google são cobradas à parte, por pesquisa feita; o valor
  abaixo é uma estimativa e o custo real vem na fatura.
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const MODELOS = {
  construir: 'gemini-3.1-pro-preview',
  descrever: 'gemini-3.8-flash',
  imagem: 'gemini-3.1-flash-image',
};

const PRECOS = {
  'gemini-3.1-pro-preview': { entrada: 2, saida: 12 },
  'gemini-3.8-flash': { entrada: 0.75, saida: 3.75 },
  'gemini-3.1-flash-image': { entrada: 0.5, saida: 60 },
};
const PRECO_PESQUISA = 0.014;
const FATOR_CACHE = 0.1;

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const NICHO = path.resolve(SKILL, '..', '..', '..');
export const RAIZ = path.resolve(NICHO, '..', '..');

export function sair(texto, codigo = 1) {
  console.error(texto);
  process.exit(codigo);
}

export function lerChave() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  if (process.platform === 'win32') {
    try {
      const valor = execFileSync(
        'powershell',
        ['-NoProfile', '-Command', "[Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User')"],
        { encoding: 'utf8', windowsHide: true },
      ).trim();
      if (valor) return valor;
    } catch {
      // cai para o erro abaixo
    }
  }
  sair('Falta a GEMINI_API_KEY. No Windows: setx GEMINI_API_KEY "<chave>" e reabre o terminal.');
}

export const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export function imagem(caminho) {
  const mime = MIME[path.extname(caminho).toLowerCase()];
  if (!mime) sair(`Formato de imagem não suportado: ${caminho}`);
  return { inlineData: { mimeType: mime, data: fs.readFileSync(caminho).toString('base64') } };
}

export function lerTexto(caminho, descricao = caminho) {
  if (!fs.existsSync(caminho)) sair(`Falta ${descricao}: ${caminho}`);
  return fs.readFileSync(caminho, 'utf8');
}

// Recusa um dossiê que não esteja aprovado pelo validador do al-dossier.
export function validarDossie(dossie) {
  const validador = path.join(NICHO, '.claude', 'skills', 'al-dossier', 'scripts', 'validar-dossie.py');
  const relatorio = path.join(dossie, 'validacao.json');
  if (!fs.existsSync(path.join(dossie, 'contrato.json'))) sair('Dossiê sem contrato.json: corre ou migra primeiro com al-dossier.');
  if (!fs.existsSync(relatorio)) sair('Falta validacao.json: gera-o com validar-dossie.py --relatorio.');
  for (const comando of process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python']) {
    const r = spawnSync(comando, [validador, dossie, '--verificar-relatorio', relatorio], { encoding: 'utf8', windowsHide: true });
    if (r.error?.code === 'ENOENT') continue;
    if (r.status !== 0) sair(`O dossiê não está aprovado. Corrige-o com al-dossier.\n${r.stdout || r.stderr}`);
    return;
  }
  sair('Python não disponível para validar o dossiê.');
}

async function comNovasTentativas(rotulo, fazer) {
  let ultimo;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      return await fazer();
    } catch (causa) {
      ultimo = causa;
      if (causa.definitivo || tentativa === 3) break;
      console.log(`[${rotulo}] ${String(causa.message).slice(0, 140)}; nova tentativa em ${tentativa * 20}s`);
      await new Promise((r) => setTimeout(r, tentativa * 20_000));
    }
  }
  throw ultimo;
}

// Tempo máximo por pedido: uma ligação presa falha e entra nas novas tentativas.
async function pedir(url, chave, corpo, minutos = 20) {
  const resposta = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': chave, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(minutos * 60_000),
  });
  if (!resposta.ok) {
    const erro = new Error(`HTTP ${resposta.status}: ${(await resposta.text()).slice(0, 600)}`);
    erro.definitivo = ![429, 500, 502, 503, 504].includes(resposta.status);
    throw erro;
  }
  return resposta;
}

// Chamada normal: devolve o JSON inteiro.
export async function gerar(modelo, chave, corpo, rotulo = modelo) {
  return comNovasTentativas(rotulo, async () => {
    const resposta = await pedir(`${BASE}/${modelo}:generateContent`, chave, corpo);
    return resposta.json();
  });
}

// Chamada em streaming, para respostas longas: devolve o texto, o uso, o
// motivo de fim e as pesquisas feitas.
export async function gerarEmStream(modelo, chave, corpo, rotulo = modelo) {
  return comNovasTentativas(rotulo, async () => {
    const resposta = await pedir(`${BASE}/${modelo}:streamGenerateContent?alt=sse`, chave, corpo);
    const leitor = resposta.body.getReader();
    const descodificador = new TextDecoder();
    let resto = '';
    let texto = '';
    let uso = null;
    let fim = null;
    const pesquisas = new Set();
    const urls = new Set();
    let aviso = Date.now();
    for (;;) {
      const { value, done } = await leitor.read();
      if (done) break;
      resto += descodificador.decode(value, { stream: true });
      const linhas = resto.split('\n');
      resto = linhas.pop();
      for (const linha of linhas) {
        if (!linha.startsWith('data:')) continue;
        const pedaco = JSON.parse(linha.slice(5));
        const candidato = pedaco.candidates?.[0];
        for (const parte of candidato?.content?.parts ?? []) if (parte.text && !parte.thought) texto += parte.text;
        for (const q of candidato?.groundingMetadata?.webSearchQueries ?? []) pesquisas.add(q);
        for (const u of candidato?.urlContextMetadata?.urlMetadata ?? []) urls.add(u.retrievedUrl);
        if (candidato?.finishReason) fim = candidato.finishReason;
        if (pedaco.usageMetadata) uso = pedaco.usageMetadata;
      }
      if (Date.now() - aviso > 30_000) {
        console.log(`[${rotulo}] a escrever… ${texto.length} caracteres`);
        aviso = Date.now();
      }
    }
    return { texto, uso, fim, pesquisas: [...pesquisas], urls: [...urls] };
  });
}

export function custo(modelo, uso, pesquisas = 0) {
  const preco = PRECOS[modelo] ?? { entrada: 0, saida: 0 };
  const entrada = (uso?.promptTokenCount ?? 0) + (uso?.toolUsePromptTokenCount ?? 0);
  // Tokens servidos da cache (implícita) custam 10% do preço de entrada.
  const emCache = uso?.cachedContentTokenCount ?? 0;
  const saida = (uso?.candidatesTokenCount ?? 0) + (uso?.thoughtsTokenCount ?? 0);
  const dolares = ((entrada - emCache * (1 - FATOR_CACHE)) * preco.entrada + saida * preco.saida) / 1e6 + pesquisas * PRECO_PESQUISA;
  return {
    entrada,
    em_cache: emCache,
    saida: uso?.candidatesTokenCount ?? 0,
    pensamento: uso?.thoughtsTokenCount ?? 0,
    pesquisas,
    dolares: Number(dolares.toFixed(4)),
  };
}

// Acrescenta uma linha ao registo de custos da casa (casas/<slug>/custos-gemini.json).
export function registarCusto(pastaCasa, passo, detalhe) {
  const ficheiro = path.join(pastaCasa, 'custos-gemini.json');
  const registo = fs.existsSync(ficheiro) ? JSON.parse(fs.readFileSync(ficheiro, 'utf8')) : { passos: [] };
  registo.passos.push({ data: new Date().toISOString(), passo, ...detalhe });
  registo.total_dolares = Number(registo.passos.reduce((s, p) => s + (p.dolares ?? 0), 0).toFixed(4));
  fs.writeFileSync(ficheiro, JSON.stringify(registo, null, 2));
  return registo.total_dolares;
}

// Aceita JSON puro, dentro de cercas ou com texto à volta.
export function extrairJson(texto) {
  const limpo = texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(limpo);
  } catch (erro) {
    const inicio = limpo.search(/[[{]/);
    const fim = Math.max(limpo.lastIndexOf(']'), limpo.lastIndexOf('}'));
    if (inicio < 0 || fim <= inicio) throw erro;
    return JSON.parse(limpo.slice(inicio, fim + 1));
  }
}
