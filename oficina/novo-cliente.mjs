#!/usr/bin/env node
// Cria um projeto de cliente em nichos/<nicho>/clientes/<nome>/ com as skills lá dentro.
// (Os sites de alojamento nao nascem aqui: nascem do molde, pela skill
// adaptar-molde em nichos/alojamento/.)
//
// Porque é que as skills sao copiadas em vez de partilhadas: o Impeccable
// resolve o PRODUCT.md e o DESIGN.md a partir da raiz do projeto, e os hooks
// do detetor usam ${CLAUDE_PROJECT_DIR}. Se abrisses o Claude Code em
// oficina/ e construisses para ../nichos/<nicho>/clientes/<nome>/, a raiz seria
// oficina/ e o contexto de design de todos os clientes ficava misturado
// no sitio errado. Com uma copia por cliente, abres o Claude Code dentro da
// pasta do cliente e tudo resolve para o sitio certo.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const NICHOS = path.resolve(AQUI, '..', 'nichos');

const [nicho, nome] = process.argv.slice(2);
const valido = (x) => x && /^[a-z0-9][a-z0-9-]*$/.test(x);
if (!valido(nicho) || !valido(nome)) {
  console.error('Uso: node novo-cliente.mjs <nicho> <nome>');
  console.error('Ex: node novo-cliente.mjs advocacia silva-advogados');
  console.error('So minusculas, digitos e hifens. Nichos existentes: ' + fs.readdirSync(NICHOS).join(', '));
  process.exit(1);
}

const CLIENTES = path.join(NICHOS, nicho, 'clientes');
const destino = path.join(CLIENTES, nome);
if (fs.existsSync(destino)) {
  console.error(`Ja existe: ${destino}`);
  console.error('Escolhe outro nome ou apaga a pasta primeiro.');
  process.exit(1);
}

const passo = (m) => console.log(`  ${m}`);
console.log(`\nA criar ${path.relative(process.cwd(), destino) || destino}\n`);

// 1. Skills, sem node_modules (reinstalado a seguir)
fs.mkdirSync(path.join(destino, '.claude'), { recursive: true });
fs.cpSync(path.join(AQUI, '.claude', 'skills'), path.join(destino, '.claude', 'skills'), {
  recursive: true,
  filter: (src) => !src.split(path.sep).includes('node_modules'),
});
const skills = fs.readdirSync(path.join(destino, '.claude', 'skills'))
  .filter((d) => fs.statSync(path.join(destino, '.claude', 'skills', d)).isDirectory());
passo(`skills copiadas: ${skills.join(', ')}`);

// 2. Hooks do detetor de anti-padroes e o MCP do Playwright
for (const [de, para] of [
  [path.join(AQUI, '.claude', 'settings.local.json'), path.join(destino, '.claude', 'settings.local.json')],
  [path.join(AQUI, '.mcp.json'), path.join(destino, '.mcp.json')],
]) {
  if (fs.existsSync(de)) fs.copyFileSync(de, para);
}
passo('hooks do Impeccable e MCP do Playwright ligados');

// 3. Dependencias da site-delivery
const sd = path.join(destino, '.claude', 'skills', 'site-delivery');
if (fs.existsSync(path.join(sd, 'package.json'))) {
  execFileSync('npm', ['install', '--silent', '--no-audit', '--no-fund'], {
    cwd: sd, stdio: 'ignore', shell: process.platform === 'win32',
  });
  passo('dependencias da site-delivery instaladas');
}

// 4. .gitignore do projeto do cliente
// Nao esquecer os artefactos do Next: o `.next/` de um projeto destes tem
// perto de 6000 ficheiros, e sem esta linha o primeiro `git add -A` leva-os
// todos para dentro do commit. Ja aconteceu.
fs.writeFileSync(path.join(destino, '.gitignore'), `# Dependencias
node_modules/
.pnp
.pnp.*

# Build e cache do Next
/.next/
/out/
/build
next-env.d.ts
*.tsbuildinfo

# Segredos
.env
.env.*
!.env.example

# Ferramentas: regeneraveis com novo-cliente.mjs, nao pertencem ao repo do site
.claude/skills/
.impeccable/

# Artefactos de execucao
screenshots/
.playwright-mcp/
.shots/
legado/
*.log

# Plataformas
.vercel

# Sistema
.DS_Store
Thumbs.db
`);

// 5. README do cliente
fs.writeFileSync(path.join(destino, 'README.md'), `# ${nome}

Site do cliente. Abre o Claude Code **nesta pasta** — as skills estao em
\`.claude/skills/\` e so carregam a partir daqui.

\`\`\`bash
claude
\`\`\`

Primeiro passo, uma unica vez:

\`\`\`
/impeccable init
\`\`\`

Escreve o \`PRODUCT.md\` na raiz deste projeto: quem e o utilizador, o que o
produto torna possivel, e que factos futuros tem de preservar. O
\`PRODUCT.md\` e o \`DESIGN.md\` sao versionados; as skills nao.

Para atualizar as skills depois de as atualizares na oficina, corre
outra vez o \`novo-cliente.mjs\` num nome novo, ou copia
\`oficina/.claude/skills/\` para aqui por cima.
`);

// 6. Sem repositorio proprio: o repositorio e um so, na raiz de crisol-websites.

console.log(`
Pronto.

  1. cd ../nichos/${nicho}/clientes/${nome} && claude
  2. Da ao agente a inspiracao: 2-4 links ou imagens de sites de que
     gostas, o site antigo do cliente se existir, e o que nao se toca
     (paleta, textos, fotos). E isso que decide a estetica.
  3. Dentro do Claude Code: /impeccable init

Sem referencia visual o agente escolhe a media, e a media e o que
parece feito por IA. A referencia e a direcao; o agente e a execucao.
`);
