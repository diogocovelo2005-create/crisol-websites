#!/usr/bin/env node
/*
  Passo 1 da criar-base: descreve as fotografias utilizáveis do dossiê.

  Uso:
    node descrever-fotos.mjs <pasta-da-casa>            (ex.: casas/casa-do-rio-viseu)
    node descrever-fotos.mjs <pasta-da-casa> --so-validar

  Confirma primeiro que o dossiê está aprovado. Depois envia as fotos com uso
  "utilizavel" do contrato ao Gemini Flash, em lotes, e grava
  dossie/fotos-descricao.json depois de cada lote. As fotos já descritas
  (mesmo ficheiro, mesmo tamanho) não voltam a ser enviadas, por isso uma
  segunda corrida só trata as novas ou as que falharam. O validador do
  al-dossier ignora este ficheiro.

  A descrição é para construir, não para ler: onde está o assunto, o ponto
  focal para recortes, a qualidade real e até que largura a foto aguenta.
*/

import fs from 'node:fs';
import path from 'node:path';
import {
  MODELOS, sair, lerChave, imagem, validarDossie, gerar, custo, registarCusto, extrairJson,
} from './lib/gemini.mjs';

const LOTE = 6;
// Limite de dados por pedido: 14 MB de ficheiros dá ~19 MB em base64 (o limite é 20).
const LOTE_BYTES = 14 * 1024 * 1024;
const MINIMO_FOTOS = 8;

const INSTRUCAO = `Descreves fotografias de uma casa de turismo em Portugal para quem vai montar o site dela.
Sê objetivo e útil para construir. Nada de linguagem de marketing, nada de adjetivos vagos.
Descreve só o que se vê. Não deduzas serviços, horários ou divisões que a imagem não mostra.

Para cada fotografia devolve um objeto com estes campos:
- "id": o identificador que recebeste antes da imagem.
- "assunto": o que a foto mostra, em uma ou duas frases concretas.
- "onde_esta_o_assunto": onde fica o assunto principal no enquadramento (ex.: "torre no terço direito, metade de cima; piscina ocupa o terço de baixo").
- "ponto_focal": {"x": 0-100, "y": 0-100}, a posição em percentagem do ponto que nunca pode sair de um recorte.
- "zona_segura": o que não pode ser cortado num recorte vertical de telemóvel e num recorte panorâmico.
- "luz": {"tipo": ex. "sol alto e duro", "luz de janela suave", "interior com flash"; "hora_aparente": "manhã" | "meio-dia" | "tarde" | "fim de tarde" | "noite" | "indeterminada"}.
- "qualidade": {"nitidez": 1-5, "ruido": 1-5 (5 = limpo), "exposicao": "correta" | "subexposta" | "sobreexposta" | "contraste excessivo", "artefactos": texto curto ou "nenhum", "nota": 1-5 como fotografia para um site}.
- "largura_maxima_px": até que largura de ecrã a foto pode ser mostrada sem parecer desfocada ou pixelizada, tendo em conta a resolução e a nitidez reais.
- "mostra": o espaço, divisão ou elemento da casa que a foto prova (ex.: "quarto com duas camas", "fachada da capela"). Só o que é visível.
- "pessoas": true ou false.
- "texto_ou_marcas": texto, logótipos ou marcas de água visíveis, ou "nenhum".
- "cores_dominantes": 3 a 5 cores em hex, da mais para a menos presente.
- "desejo": 1-5, quanto a foto faz alguém querer ficar lá.

Responde apenas com um array JSON, um objeto por fotografia, pela ordem recebida.`;

function argumentos() {
  const args = process.argv.slice(2);
  const casa = args.find((a) => !a.startsWith('--'));
  if (!casa) sair('Uso: node descrever-fotos.mjs <pasta-da-casa> [--so-validar]');
  return { casa: path.resolve(casa), soValidar: args.includes('--so-validar') };
}

async function main() {
  const { casa, soValidar } = argumentos();
  const dossie = path.join(casa, 'dossie');
  validarDossie(dossie);
  if (soValidar) {
    console.log('Dossiê aprovado.');
    return;
  }

  const contrato = JSON.parse(fs.readFileSync(path.join(dossie, 'contrato.json'), 'utf8'));
  const ativos = (contrato.ativos ?? []).filter((a) => a.uso === 'utilizavel');
  if (!ativos.length) sair('O contrato não tem fotografias utilizáveis.');
  if (ativos.length < MINIMO_FOTOS) {
    console.log(`AVISO: o contrato só tem ${ativos.length} fotografias utilizáveis (mínimo recomendado ${MINIMO_FOTOS}). `
      + 'Se a pasta do dossiê tem mais, faltam ativos no contrato: diz ao Diogo antes de continuar.');
  }

  const destino = path.join(dossie, 'fotos-descricao.json');
  const anterior = fs.existsSync(destino) ? JSON.parse(fs.readFileSync(destino, 'utf8')) : { fotos: [] };
  const porId = new Map(anterior.fotos.map((f) => [f.id, f]));

  const pendentes = [];
  for (const ativo of ativos) {
    const ficheiro = path.join(dossie, ativo.caminho);
    if (!fs.existsSync(ficheiro)) {
      console.log(`Aviso: ${ativo.id} aponta para um ficheiro que não existe (${ativo.caminho}).`);
      continue;
    }
    const tamanho = fs.statSync(ficheiro).size;
    const ja = porId.get(ativo.id);
    if (ja && ja.caminho === ativo.caminho && ja.bytes === tamanho) continue;
    pendentes.push({ ativo, ficheiro, tamanho });
  }

  if (!pendentes.length) {
    console.log(`As ${ativos.length} fotografias já estão descritas em ${path.relative(process.cwd(), destino)}.`);
    return;
  }

  const chave = lerChave();
  // Lotes de até LOTE fotos e LOTE_BYTES; uma foto maior que o limite vai sozinha.
  const lotes = [];
  for (const p of pendentes) {
    const atual = lotes.at(-1);
    const bytes = atual ? atual.reduce((s, x) => s + x.tamanho, 0) : 0;
    if (!atual || atual.length >= LOTE || bytes + p.tamanho > LOTE_BYTES) lotes.push([p]);
    else atual.push(p);
  }
  console.log(`A descrever ${pendentes.length} fotografias com ${MODELOS.descrever}, em ${lotes.length} lotes.`);
  let total = 0;
  const falhados = [];

  // Grava depois de cada lote: um erro a meio não deita fora o que já foi pago.
  const gravar = () => {
    const fotos = ativos.map((a) => porId.get(a.id)).filter(Boolean);
    fs.writeFileSync(destino, JSON.stringify({ modelo: MODELOS.descrever, atualizado: new Date().toISOString(), fotos }, null, 2));
    return fotos.length;
  };

  for (const [n, lote] of lotes.entries()) {
    const rotulo = `lote ${n + 1}`;
    const partes = [];
    for (const p of lote) {
      const d = p.ativo.dimensoes ?? {};
      partes.push({ text: `id: ${p.ativo.id} · ${d.largura}×${d.altura} px · assunto registado no dossiê: ${p.ativo.assunto ?? 'sem registo'}` });
      partes.push(imagem(p.ficheiro));
    }
    let resposta;
    try {
      resposta = await gerar(MODELOS.descrever, chave, {
        systemInstruction: { parts: [{ text: INSTRUCAO }] },
        contents: [{ role: 'user', parts: partes }],
        generationConfig: { responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'low' } },
      }, rotulo);
    } catch (causa) {
      console.log(`[${rotulo}] falhou: ${String(causa.message).slice(0, 200)}`);
      falhados.push(...lote.map((p) => p.ativo.id));
      continue;
    }
    const c = custo(MODELOS.descrever, resposta.usageMetadata);
    total += c.dolares;
    registarCusto(casa, 'descrever-fotos', { modelo: MODELOS.descrever, fotos: lote.length, dolares: c.dolares });
    const texto = resposta.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    let descricoes;
    try {
      descricoes = extrairJson(texto);
    } catch {
      console.log(`[${rotulo}] não devolveu JSON válido; estas fotos ficam por descrever.`);
      falhados.push(...lote.map((p) => p.ativo.id));
      continue;
    }
    for (const p of lote) {
      const desc = Array.isArray(descricoes) ? descricoes.find((d) => d.id === p.ativo.id) : null;
      if (!desc) {
        falhados.push(p.ativo.id);
        continue;
      }
      const d = p.ativo.dimensoes ?? {};
      porId.set(p.ativo.id, { ...desc, id: p.ativo.id, caminho: p.ativo.caminho, bytes: p.tamanho, largura: d.largura, altura: d.altura });
    }
    gravar();
    console.log(`[${rotulo}] ${lote.length} fotografias, ${c.dolares} $`);
  }

  // Mantém a ordem do contrato e deixa cair fotos que já não são utilizáveis.
  const descritas = gravar();
  const acumulado = JSON.parse(fs.readFileSync(path.join(casa, 'custos-gemini.json'), 'utf8')).total_dolares;
  console.log(`${descritas} fotografias descritas em ${path.relative(process.cwd(), destino)}. Custo: ${total.toFixed(3)} $ · total Gemini da casa: ${acumulado.toFixed(2)} $`);
  if (falhados.length) console.log(`Por descrever (corre outra vez o script, só estas são enviadas): ${falhados.join(', ')}`);
}

main();
