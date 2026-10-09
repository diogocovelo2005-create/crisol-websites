import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { verificar } from '../scripts/verificar-conteudo-fontes.mjs';

const temporarios = [];
const raiz = path.resolve(import.meta.dirname, '..', '..', '..', '..');
const validador = path.join(raiz, '.claude', 'skills', 'al-dossier', 'scripts', 'validar-dossie.py');
const novoSite = path.join(raiz, '.claude', 'skills', 'adaptar-molde', 'scripts', 'novo-site.mjs');

afterEach(() => {
  for (const pasta of temporarios.splice(0)) fs.rmSync(pasta, { recursive: true, force: true });
});

function escrever(pasta, nome, texto) {
  fs.writeFileSync(path.join(pasta, nome), texto, 'utf8');
}

function criarEntradaValida() {
  const raizTemporaria = fs.mkdtempSync(path.join(os.tmpdir(), 'conteudo-fontes-'));
  temporarios.push(raizTemporaria);
  const dossie = path.join(raizTemporaria, 'dossie');
  const site = path.join(raizTemporaria, 'site');
  fs.mkdirSync(dossie);
  fs.mkdirSync(site);
  for (const ficheiro of ['resumo.md', 'site-pronto.md', 'descricao-al.md', 'factos.md', 'dono.md', 'canais.md', 'compliance.md', 'fontes.md']) {
    escrever(dossie, ficheiro, `# ${ficheiro}\n\nConteúdo confirmado para teste.\n`);
  }
  escrever(dossie, 'reviews.md', [
    '# Reviews', '', '| Plataforma | Prefixo | Recolhidas | Com texto | Total na plataforma |',
    '|---|---|---|---|---|', '| Booking | B | 1 | 1 | 1 |', '', '## Booking', '',
    '### B-001 · Rosa — 10/10 ★ citada', 'Gostou:', '> Jardim muito bonito e silencioso.', '',
  ].join('\n'));
  escrever(dossie, 'pontos-fortes.md', '# Pontos\n\n## Pontos fortes\n\n### Jardim\n[INFERIDO] Força: uma review.\nAtual: sim, 2026.\nFotos: nenhuma.\n');
  escrever(dossie, 'quartos.md', '# Quartos\n\n| Tipo | Camas |\n|---|---|\n| Quarto Duplo | 1 casal |\n\n## Quarto Duplo\n[OFICIAL] Quarto com cama de casal, casa de banho privativa e janela para o jardim.\n');
  const contrato = {
    schema_version: '1.0',
    manifesto: { slug: 'casa-teste', revisao: '2026-09-21', prontidao: 'pronto_para_base' },
    entidades: [{ id: 'CASA-1', tipo: 'casa', nome: 'Casa Teste' }],
    evidencias: [{ id: 'EVID-1', origem: 'casa', entidade_ids: ['CASA-1'], local: 'site próprio', recolhido_em: '2026-09-21' }],
    afirmacoes: [{ id: 'AFIR-1', entidade_id: 'CASA-1', texto: 'Tem jardim.', natureza: 'facto', categoria: 'geral', origem: 'casa', estado: 'confirmado', uso: 'afirmar', evidencia_ids: ['EVID-1'] }],
    citacoes: [{ id: 'CIT-1', review_id: 'B-001', texto_original: 'Jardim muito bonito e silencioso.', autor: 'Rosa', plataforma: 'Booking', lingua: 'pt' }],
    ativos: [], decisoes: [],
    cobertura: [{ id: 'COB-1', fonte: 'Booking', material: 'reviews', estado: 'completo_no_universo_observado', observado: 1, recolhido: 1 }],
  };
  escrever(dossie, 'contrato.json', JSON.stringify(contrato));
  const relatorio = path.join(dossie, 'validacao.json');
  const validacao = spawnSync('python', [validador, dossie, '--relatorio', relatorio], { encoding: 'utf8' });
  assert.equal(validacao.status, 0, validacao.stdout);
  const hash = JSON.parse(fs.readFileSync(relatorio, 'utf8')).impressao_digital.sha256;
  const mapa = {
    schema_version: '1.0', estado: 'pronto',
    contrato: { slug: 'casa-teste', revisao: '2026-09-21', impressao_digital_sha256: hash },
    campos: [{ destino: 'src/lib/casa.ts#casa.titulo', tipo: 'factual', fontes: ['AFIR-1'] }],
    ativos: [], omissoes: [],
  };
  escrever(site, 'conteudo-fontes.json', JSON.stringify(mapa));
  return { dossie, site, mapa };
}

test('aprova mapa ligado a afirmação permitida e relatório atual', () => {
  const { dossie, site } = criarEntradaValida();
  assert.doesNotThrow(() => verificar(site, dossie));
});

test('rejeita campo factual apoiado numa citação', () => {
  const { dossie, site, mapa } = criarEntradaValida();
  mapa.campos[0].fontes = ['CIT-1'];
  escrever(site, 'conteudo-fontes.json', JSON.stringify(mapa));
  assert.throws(() => verificar(site, dossie), /não é uma afirmação/);
});

test('aceita citação como fonte de um campo editorial', () => {
  const { dossie, site, mapa } = criarEntradaValida();
  mapa.campos[0] = { destino: 'src/lib/casa.ts#casa.intro', tipo: 'editorial', fontes: ['AFIR-1', 'CIT-1'] };
  escrever(site, 'conteudo-fontes.json', JSON.stringify(mapa));
  assert.doesNotThrow(() => verificar(site, dossie));
});

test('rejeita relatório que deixou de corresponder ao dossiê', () => {
  const { dossie, site } = criarEntradaValida();
  escrever(dossie, 'factos.md', '# Factos\n\nMaterial alterado depois da validação.\n');
  assert.throws(() => verificar(site, dossie), /deixou de estar aprovado/);
});

test('novo-site recusa dossiê de legado antes de copiar o molde', () => {
  const raizTemporaria = fs.mkdtempSync(path.join(os.tmpdir(), 'novo-site-legado-'));
  temporarios.push(raizTemporaria);
  const dossie = path.join(raizTemporaria, 'dossie');
  const destino = path.join(raizTemporaria, 'site');
  fs.mkdirSync(dossie);
  const resultado = spawnSync('node', [novoSite, '--dossie', dossie, '--destino', destino], {
    cwd: raiz,
    encoding: 'utf8',
  });
  assert.notEqual(resultado.status, 0);
  assert.match(resultado.stderr, /Dossiê de legado/);
  assert.equal(fs.existsSync(destino), false);
});
