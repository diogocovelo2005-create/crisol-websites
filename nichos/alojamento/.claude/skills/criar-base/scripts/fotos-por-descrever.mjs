#!/usr/bin/env node
/*
  Passo 1 da criar-base, a parte que não precisa de olhos. O subagente
  descritor-fotos (Haiku) olha para as fotos; este script trata do resto.

  Uso:
    node fotos-por-descrever.mjs <pasta-da-casa>
      Confirma que o dossiê está aprovado e imprime, em JSON, as fotos
      utilizáveis que ainda não estão descritas (ou que mudaram desde a
      descrição): id, ficheiro, dimensões e o assunto registado no dossiê.

    node fotos-por-descrever.mjs <pasta-da-casa> --gravar <lote.json>
      Junta ao dossie/fotos-descricao.json um lote de descrições (um array de
      objetos com "id"), acrescenta caminho, bytes, largura e altura, e mantém
      a ordem do contrato.
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const NICHO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const MINIMO_FOTOS = 8;
const CAMPOS = ['assunto', 'onde_esta_o_assunto', 'ponto_focal', 'zona_segura', 'luz', 'qualidade', 'largura_maxima_px', 'mostra', 'pessoas', 'texto_ou_marcas', 'cores_dominantes', 'desejo'];

function sair(texto) {
  console.error(texto);
  process.exit(1);
}

function validarDossie(dossie) {
  const validador = path.join(NICHO, '.claude', 'skills', 'al-dossier', 'scripts', 'validar-dossie.py');
  const relatorio = path.join(dossie, 'validacao.json');
  if (!fs.existsSync(path.join(dossie, 'contrato.json'))) sair('Dossiê sem contrato.json: corre primeiro a al-dossier.');
  if (!fs.existsSync(relatorio)) sair('Falta validacao.json: gera-o com validar-dossie.py --relatorio.');
  for (const comando of process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python']) {
    const r = spawnSync(comando, [validador, dossie, '--verificar-relatorio', relatorio], { encoding: 'utf8', windowsHide: true });
    if (r.error?.code === 'ENOENT') continue;
    if (r.status !== 0) sair(`O dossiê não está aprovado. Corrige-o com a al-dossier.\n${r.stdout || r.stderr}`);
    return;
  }
  sair('Python não disponível para validar o dossiê.');
}

const args = process.argv.slice(2);
const casa = args[0] && path.resolve(args[0]);
if (!casa) sair('Uso: node fotos-por-descrever.mjs <pasta-da-casa> [--gravar <lote.json>]');
const dossie = path.join(casa, 'dossie');
const destino = path.join(dossie, 'fotos-descricao.json');
const contrato = JSON.parse(fs.readFileSync(path.join(dossie, 'contrato.json'), 'utf8'));
const ativos = (contrato.ativos ?? []).filter((a) => a.uso === 'utilizavel');
const anterior = fs.existsSync(destino) ? JSON.parse(fs.readFileSync(destino, 'utf8')) : { fotos: [] };
const porId = new Map(anterior.fotos.map((f) => [f.id, f]));

const i = args.indexOf('--gravar');
if (i >= 0) {
  const lote = JSON.parse(fs.readFileSync(path.resolve(args[i + 1]), 'utf8'));
  if (!Array.isArray(lote)) sair('O lote tem de ser um array de descrições.');
  const ativosPorId = new Map(ativos.map((a) => [a.id, a]));
  const problemas = [];
  for (const desc of lote) {
    const ativo = ativosPorId.get(desc.id);
    if (!ativo) { problemas.push(`${desc.id}: não é um ativo utilizável do contrato`); continue; }
    const faltam = CAMPOS.filter((c) => desc[c] === undefined);
    if (faltam.length) { problemas.push(`${desc.id}: faltam ${faltam.join(', ')}`); continue; }
    const d = ativo.dimensoes ?? {};
    const bytes = fs.statSync(path.join(dossie, ativo.caminho)).size;
    porId.set(desc.id, { ...desc, caminho: ativo.caminho, bytes, largura: d.largura, altura: d.altura });
  }
  const fotos = ativos.map((a) => porId.get(a.id)).filter(Boolean);
  fs.writeFileSync(destino, JSON.stringify({ modelo: 'claude-haiku', atualizado: new Date().toISOString(), fotos }, null, 2));
  console.log(`${lote.length - problemas.length} descrições gravadas; ${fotos.length} de ${ativos.length} fotografias descritas.`);
  if (problemas.length) sair(`Recusadas:\n${problemas.join('\n')}`);
} else {
  validarDossie(dossie);
  if (ativos.length < MINIMO_FOTOS) {
    console.error(`AVISO: o contrato só tem ${ativos.length} fotografias utilizáveis (mínimo recomendado ${MINIMO_FOTOS}). Diz ao Diogo antes de continuar.`);
  }
  const pendentes = ativos
    .filter((a) => {
      const f = path.join(dossie, a.caminho);
      if (!fs.existsSync(f)) return false;
      const ja = porId.get(a.id);
      return !(ja && ja.caminho === a.caminho && ja.bytes === fs.statSync(f).size);
    })
    .map((a) => ({ id: a.id, ficheiro: path.join(dossie, a.caminho), dimensoes: a.dimensoes, assunto_no_dossie: a.assunto ?? null }));
  console.log(JSON.stringify({ utilizaveis: ativos.length, por_descrever: pendentes }, null, 2));
}
