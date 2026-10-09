#!/usr/bin/env node
/*
  Cria o site de uma casa a partir do molde.

  Uso (a partir de qualquer pasta):
    node nichos/alojamento/.claude/skills/adaptar-molde/scripts/novo-site.mjs <slug>
    node nichos/alojamento/.claude/skills/adaptar-molde/scripts/novo-site.mjs --dossie <pasta> --destino <pasta>

  Copia nichos/alojamento/molde/ para nichos/alojamento/casas/<slug>/site/,
  sem o que se regenera (node_modules, .next, .vercel, capturas de trabalho,
  fotos em bruto), e instala as dependencias. O catalogo de variantes
  (VARIANTES.md, /catalogo e o registo tecnico ligado ao codigo) vem junto: a
  skill pode consulta-lo como exemplo depois de definir a proposta, e apaga
  o laboratorio no fim. Nao determina a estrutura do site.

  Para a meio se a casa nao tiver dossie: o conteudo do site sai de la.
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
// scripts -> adaptar-molde -> skills -> .claude -> alojamento
const NICHO = path.resolve(AQUI, '..', '..', '..', '..');
const MOLDE = path.join(NICHO, 'molde');
const VALIDADOR = path.join(NICHO, '.claude', 'skills', 'al-dossier', 'scripts', 'validar-dossie.py');

const argumentos = process.argv.slice(2);
let slug;
let destino;
let dossie;

if (argumentos.length === 1 && /^[a-z0-9][a-z0-9-]*$/.test(argumentos[0])) {
  slug = argumentos[0];
  const casa = path.join(NICHO, 'casas', slug);
  destino = path.join(casa, 'site');
  dossie = path.join(casa, 'dossie');
} else if (argumentos.length === 4 && argumentos[0] === '--dossie' && argumentos[2] === '--destino') {
  dossie = path.resolve(argumentos[1]);
  destino = path.resolve(argumentos[3]);
  slug = path.basename(dossie) === 'dossie' ? path.basename(path.dirname(dossie)) : path.basename(dossie);
} else {
  console.error('Uso: node novo-site.mjs <slug>   (ex: casa-do-rio-viseu)');
  console.error('   ou: node novo-site.mjs --dossie <pasta> --destino <pasta>');
  process.exit(1);
}

if (!fs.existsSync(dossie)) {
  console.error(`Nao ha dossie em ${path.relative(process.cwd(), dossie)}.`);
  console.error('Corre primeiro a skill al-dossier para esta casa.');
  process.exit(1);
}

function lerJson(caminho, descricao) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (causa) {
    throw new Error(`${descricao} inválido ou inexistente: ${causa.message}`);
  }
}

function validarEntrada() {
  const contratoPath = path.join(dossie, 'contrato.json');
  const relatorioPath = path.join(dossie, 'validacao.json');
  if (!fs.existsSync(contratoPath)) {
    throw new Error('Dossiê de legado: falta contrato.json. Migra o dossiê com al-dossier antes de criar uma base.');
  }
  if (!fs.existsSync(relatorioPath)) {
    throw new Error('Falta validacao.json. Gera-o com validar-dossie.py --relatorio <dossie>/validacao.json.');
  }
  const comandos = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
  let ultimoErro;
  for (const comando of comandos) {
    const resultado = spawnSync(comando, [VALIDADOR, dossie, '--verificar-relatorio', relatorioPath], {
      encoding: 'utf8',
      windowsHide: true,
    });
    if (resultado.error?.code === 'ENOENT') {
      ultimoErro = resultado.error;
      continue;
    }
    if (resultado.error) throw new Error(`Não foi possível executar o validador: ${resultado.error.message}`);
    if (resultado.status !== 0) {
      throw new Error(`Dossiê não aprovado. Corrige os erros e volta a gerar validacao.json.\n${resultado.stdout || resultado.stderr}`);
    }
    const contrato = lerJson(contratoPath, 'contrato.json');
    const relatorio = lerJson(relatorioPath, 'validacao.json');
    if (contrato.manifesto?.prontidao === 'bloqueado') {
      throw new Error('O contrato está bloqueado; confirma identidade ou contacto/reserva antes de criar uma base.');
    }
    if (relatorio.resultado !== 'aprovado') throw new Error('validacao.json não declara resultado aprovado.');
    return { contrato, relatorio };
  }
  throw new Error(`Python não disponível para validar o dossiê (${ultimoErro?.message || 'comando não encontrado'}).`);
}

let entrada;
try {
  entrada = validarEntrada();
} catch (causa) {
  console.error(`Não foi criado site: ${causa.message}`);
  process.exit(1);
}

if (fs.existsSync(destino)) {
  console.error(`Ja existe um site em ${path.relative(process.cwd(), destino)}. Nao se copia por cima.`);
  process.exit(1);
}

// o que nao se copia: regenera-se ou e so do molde
const FORA = new Set(['node_modules', '.next', '.vercel', '.shots', '.imagens-bruto', 'tsconfig.tsbuildinfo']);

fs.cpSync(MOLDE, destino, {
  recursive: true,
  filter: (src) => !path.relative(MOLDE, src).split(path.sep).some((parte) => FORA.has(parte)),
});

// o nome do pacote passa a ser o da casa
const pkgPath = path.join(destino, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = slug;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const mapaFontes = {
  schema_version: '1.0',
  estado: 'em_construcao',
  contrato: {
    slug: entrada.contrato.manifesto.slug,
    revisao: entrada.contrato.manifesto.revisao,
    impressao_digital_sha256: entrada.relatorio.impressao_digital.sha256,
  },
  campos: [],
  ativos: [],
  omissoes: [],
};
fs.writeFileSync(path.join(destino, 'conteudo-fontes.json'), JSON.stringify(mapaFontes, null, 2) + '\n');
const caminhoVerificador = path.relative(process.cwd(), path.join(AQUI, 'verificar-conteudo-fontes.mjs')) || 'verificar-conteudo-fontes.mjs';
const referenciaSite = path.relative(process.cwd(), destino) || '.';
const referenciaDossie = path.relative(process.cwd(), dossie) || '.';
fs.writeFileSync(path.join(destino, 'ADAPTACAO.md'), `# Adaptação — ${entrada.contrato.manifesto.slug}

## Contrato
- Revisão: ${entrada.contrato.manifesto.revisao}
- Hash validado: ${entrada.relatorio.impressao_digital.sha256}
- Prontidão: ${entrada.contrato.manifesto.prontidao}

## Direção
- A preencher antes de consultar exemplos: argumento, melhores imagens e percurso próprio desta casa.

## Decisões e limitações
- A preencher. Decisões que alterem conteúdo regressam a dono.md e contrato.json.

## Verificação
- Entrada: aprovada antes de copiar o molde.
- Conteúdo-fontes: em_construcao.
- Browser / lint / tipos / build: por verificar.
`);

console.log(`Molde copiado para ${path.relative(process.cwd(), destino)}`);
console.log('A instalar dependencias...');
execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent'], {
  cwd: destino,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

console.log(`
Pronto. A seguir:
  cd ${path.relative(process.cwd(), destino)}
  npm run dev -- -p 3300
  abrir http://localhost:3300
  Primeiro: inspecionar fotos e definir o que apresentar nesta casa.
  /catalogo contem apenas exemplos opcionais; nao comecar por escolher variantes.

Antes de fechar a base, preencher conteudo-fontes.json e correr:
  node ${caminhoVerificador} ${referenciaSite} ${referenciaDossie}
`);
