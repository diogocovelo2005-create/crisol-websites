#!/usr/bin/env node
/*
  Confere a rastreabilidade entre uma base construída e o contrato do dossiê.

  Uso:
    node verificar-conteudo-fontes.mjs <pasta-do-site> [<pasta-do-dossie>]
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const NICHO = path.resolve(AQUI, '..', '..', '..', '..');
const VALIDADOR = path.join(NICHO, '.claude', 'skills', 'al-dossier', 'scripts', 'validar-dossie.py');

function erro(texto) {
  throw new Error(texto);
}

function lerJson(caminho, descricao) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (causa) {
    erro(`${descricao} inválido ou inexistente (${caminho}): ${causa.message}`);
  }
}

function executarValidador(dossie, relatorio) {
  const comandos = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
  let ultimoErro;
  for (const comando of comandos) {
    const resultado = spawnSync(comando, [VALIDADOR, dossie, '--verificar-relatorio', relatorio], {
      encoding: 'utf8',
      windowsHide: true,
    });
    if (resultado.error?.code === 'ENOENT') {
      ultimoErro = resultado.error;
      continue;
    }
    if (resultado.error) erro(`Não foi possível executar o validador: ${resultado.error.message}`);
    if (resultado.status !== 0) {
      erro(`O dossiê deixou de estar aprovado. Corrige-o e gera novo validacao.json antes de verificar a base.\n${resultado.stdout || resultado.stderr}`);
    }
    return;
  }
  erro(`Python não disponível para validar o dossiê (${ultimoErro?.message || 'comando não encontrado'}).`);
}

function validarMapa(site, dossie) {
  const mapaPath = path.join(site, 'conteudo-fontes.json');
  const contratoPath = path.join(dossie, 'contrato.json');
  const relatorioPath = path.join(dossie, 'validacao.json');
  const mapa = lerJson(mapaPath, 'conteudo-fontes.json');
  const contrato = lerJson(contratoPath, 'contrato.json');
  const relatorio = lerJson(relatorioPath, 'validacao.json');

  if (mapa.schema_version !== '1.0') erro('conteudo-fontes.json: schema_version tem de ser "1.0".');
  if (mapa.estado !== 'pronto') erro('conteudo-fontes.json: estado tem de ser "pronto" antes da entrega.');
  if (mapa.contrato?.slug !== contrato.manifesto?.slug) erro('conteudo-fontes.json: slug não corresponde ao contrato.');
  if (mapa.contrato?.revisao !== contrato.manifesto?.revisao) erro('conteudo-fontes.json: revisão não corresponde ao contrato.');
  if (mapa.contrato?.impressao_digital_sha256 !== relatorio.impressao_digital?.sha256) {
    erro('conteudo-fontes.json: impressão digital não corresponde ao validacao.json atual.');
  }
  if (!Array.isArray(mapa.campos) || !Array.isArray(mapa.ativos) || !Array.isArray(mapa.omissoes)) {
    erro('conteudo-fontes.json: campos, ativos e omissoes têm de ser listas.');
  }

  const afirmacoes = new Map(contrato.afirmacoes.map((item) => [item.id, item]));
  const citacoes = new Map(contrato.citacoes.map((item) => [item.id, item]));
  const ativos = new Map(contrato.ativos.map((item) => [item.id, item]));
  const usados = new Set();

  for (const campo of mapa.campos) {
    if (!campo.destino || !['factual', 'editorial', 'citacao'].includes(campo.tipo) || !Array.isArray(campo.fontes) || !campo.fontes.length) {
      erro('conteudo-fontes.json: cada campo precisa de destino, tipo e pelo menos uma fonte.');
    }
    for (const id of campo.fontes) {
      const afirmacao = afirmacoes.get(id);
      const citacao = citacoes.get(id);
      if (campo.tipo === 'citacao') {
        if (!citacao) erro(`conteudo-fontes.json: ${campo.destino} usa ${id}, mas não é uma citação do contrato.`);
      } else {
        if (campo.tipo === 'editorial' && citacao) {
          usados.add(id);
          continue;
        }
        if (!afirmacao) erro(`conteudo-fontes.json: ${campo.destino} usa ${id}, mas não é uma afirmação do contrato.`);
        if (!['afirmar', 'afirmar_com_condicao', 'citar'].includes(afirmacao.uso)) {
          erro(`conteudo-fontes.json: ${campo.destino} usa ${id}, cuja permissão é ${afirmacao.uso}.`);
        }
        if (campo.tipo === 'factual' && !['afirmar', 'afirmar_com_condicao'].includes(afirmacao.uso)) {
          erro(`conteudo-fontes.json: campo factual ${campo.destino} não pode apoiar-se em ${id} (${afirmacao.uso}).`);
        }
      }
      usados.add(id);
    }
  }

  for (const ativo of mapa.ativos) {
    if (!ativo.destino || !ativo.ativo_id) erro('conteudo-fontes.json: cada ativo precisa de destino e ativo_id.');
    const origem = ativos.get(ativo.ativo_id);
    if (!origem) erro(`conteudo-fontes.json: ativo ${ativo.ativo_id} não existe no contrato.`);
    if (origem.uso !== 'utilizavel') erro(`conteudo-fontes.json: ativo ${ativo.ativo_id} não está utilizável (${origem.uso}).`);
    if (!fs.existsSync(path.join(site, ativo.destino))) erro(`conteudo-fontes.json: ficheiro final ausente: ${ativo.destino}.`);
    usados.add(ativo.ativo_id);
  }

  for (const omissao of mapa.omissoes) {
    if (!omissao.id || !omissao.motivo) erro('conteudo-fontes.json: cada omissão precisa de id e motivo.');
    if (!afirmacoes.has(omissao.id) && !ativos.has(omissao.id)) erro(`conteudo-fontes.json: omissão referencia ID inexistente ${omissao.id}.`);
    usados.add(omissao.id);
  }
  if (!usados.size) erro('conteudo-fontes.json: não mapeia conteúdo nem omissões deliberadas.');
}

export function verificar(site, dossie) {
  const relatorio = path.join(dossie, 'validacao.json');
  executarValidador(dossie, relatorio);
  validarMapa(site, dossie);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const site = process.argv[2];
  const dossie = process.argv[3] || (site && path.resolve(site, '..', 'dossie'));
  if (!site || !dossie) {
    console.error('Uso: node verificar-conteudo-fontes.mjs <pasta-do-site> [<pasta-do-dossie>]');
    process.exit(1);
  }
  try {
    verificar(path.resolve(site), path.resolve(dossie));
    console.log('conteudo-fontes.json: rastreabilidade aprovada.');
  } catch (causa) {
    console.error(`ERRO   ${causa.message}`);
    process.exit(1);
  }
}
