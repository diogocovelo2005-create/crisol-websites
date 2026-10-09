# oficina

Configuração do agente e ferramentas para construir websites de clientes.
Esta pasta não contém sites — contém aquilo com que os sites são feitos.

As três naturezas do repositório não se misturam:

| Pasta                         | O que é                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `.claude/skills/lead-scraper/` | Motor de prospeção, genérico, serve todos os nichos.      |
| `oficina/`                    | Esta pasta. Skills e ferramentas de construção partilhadas. |
| `nichos/<nicho>/`             | Tudo o que é de um nicho, incluindo os sites dos clientes. |

Os sites de alojamento não nascem aqui: nascem do molde
(`nichos/alojamento/molde/`), pela skill `adaptar-molde`.

## O que está instalado

### Estética — as quatro skills de design

Vivem em `.claude/skills/`. Sobrepõem-se na filosofia e divergem nas
técnicas; isso é intencional e nenhuma substitui as outras.

- **`impeccable`** (v4.1.1) — regras de design, cor em OKLCH, banimentos
  anti-slop, estados de interação. Traz um detetor automático de
  anti-padrões, ligado por hooks em `.claude/settings.local.json`: corre a
  cada `Edit`/`Write` em ficheiros de UI e faz uma passagem profunda no
  fim de cada resposta. É a mais mantida das quatro — tem versão e comando
  de update.
- **`emil-design-eng`** — filosofia de craft, e o trabalho fino de
  animação e movimento.
- **`design-taste-frontend`** — leitura da referência antes de desenhar,
  níveis de intensidade, escolha do design system.
- **`ui-ux-pro-max`** — base de dados de consulta, não filosofia: paletas,
  pares tipográficos, ícones, tipos de gráfico e implementação por stack.
  Corre em Python 3 sem dependências externas (`scripts/search.py`).

As três primeiras opinam sobre cor e tipografia, a quarta também. Quando
discordarem, quem decide é a referência visual dada para o projeto — e, na
falta dela, pergunta-se em vez de arbitrar sozinho.

### Construção e publicação — `vibe-sites`

Define **com que ferramentas construir e como publicar**, e diz
explicitamente que não define estética. É a ponte entre o desenho e o
site no ar, que nenhuma das outras cobre.

- Stack canónico: Next.js App Router, TypeScript, Tailwind v4, shadcn/ui,
  Motion, Lenis, `next/image`.
- Pipeline de média: imagem e vídeo por IA, stock, otimização com ffmpeg.
- `references/nextjs-setup.md` — estrutura de projeto e configs.
- `references/deploy-workflow.md` — GitHub → Vercel, SSL, analytics.
- `references/interactions.md` — 10 interações com código testado.

**Fronteira com a `site-delivery`:** o passo de domínio personalizado
assume domínio **novo**. Se o cliente já tem domínio, manda na
`site-delivery` — um domínio ativo serve também o email, e apontá-lo sem
cuidado desliga-o. Marquei esse aviso dentro dos dois ficheiros.

### Montra de efeitos — `laboratorio/playground-reactbits/`

Projeto Next.js à parte, **não é molde de cliente nenhum**. Serve para ver um
efeito do [React Bits](https://reactbits.dev) a correr antes de o meter num
site real: `cd laboratorio/playground-reactbits && npm run dev`.

21 componentes instalados pelo registry oficial (`npx shadcn@latest add
@react-bits/<Nome>-TS-TW`) — texto, fundos WebGL e interação. Não há pacote a
instalar: cada componente é copiado para dentro do projeto e passa a ser
código nosso.

O `laboratorio/playground-reactbits/README.md` tem o custo medido em bundle e a regra de
quando usar. Resumo: os fundos WebGL carregam `three`/`ogl` e são caros, os
efeitos de texto são baratos, e nada disto entra num projeto **sem uma
referência visual que o tenha pedido**.

### Tudo o resto — `site-delivery`

Vive em `.claude/skills/site-delivery/`, ao lado das outras. Cobre a
segunda metade do ciclo de vida de um website, onde as de design não
tocam: extração de conteúdo de um site antigo, inventário de URLs, mapa
de redirects, migração de DNS sem partir o email do cliente, conformidade
RGPD e acessibilidade europeia, verificação de descoberta por motores de
busca e por IA, e entrega ao cliente.

A divisão de trabalho é essa: **as três de design tratam da estética, a
`site-delivery` trata de migração, DNS, compliance e entrega.**

Traz 4 scripts com dependências próprias (`npm install` já feito, e o
Chromium do Playwright já instalado):

| Script | Argumentos | Para quê |
| ------ | ---------- | -------- |
| `crawl-old-site.js` | `--url` · `--out` (`./legado`) · `--max` (300) | Extrai o site antigo e gera o inventário de URLs |
| `dns-snapshot.js` | `--dominio` · `--out` | Fotografa o DNS antes de lhe tocar. Avisa se o domínio tem email ativo |
| `check-redirects.js` | `--inventario` · `--base` | Confirma que nenhuma URL antiga fica órfã |
| `preflight.js` | `--url` · `--paginas` (csv) | Verificação final antes de pôr online |

Nenhum deles implementa `--help`. Correr sem argumentos diz qual falta.

### MCP do Playwright

Declarado em `.mcp.json`, versionado, arranca noutra máquina sem
reconfigurar. Serve para **inspeção interativa** do browser.

Não confundir com o Playwright usado como *biblioteca* nos scripts do
`lead-scraper` e da `site-delivery`. São coisas diferentes e coexistem
sem conflito — não tentar unificá-los.

## Escopo: estas skills nunca são globais

São skills de **escopo de projeto**. Não estão em `~/.claude/skills/` e não
devem lá voltar: se fossem globais carregavam também durante o trabalho no
`lead-scraper`, onde só ocupavam contexto sem servir para nada.

Esta pasta é o **molde**. Cada cliente recebe a sua própria cópia.

## Começar um site novo de cliente

```bash
cd oficina
node novo-cliente.mjs advocacia silva-advogados
```

Cria `nichos/advocacia/clientes/silva-advogados/` com as skills, os hooks do
detetor, o MCP do Playwright e um `.gitignore`. Não cria repositório git: o
repositório é um só, na raiz de `crisol-websites`.

**A direção visual entra por inspiração, não por formulário.** Não há
briefing a preencher: dás ao agente 2-4 links ou imagens de sites de que
gostas, o site antigo do cliente se existir, e a lista do que não se toca
(paleta, textos, fotografias). Uma referência transporta ritmo, densidade e
escala que nenhuma descrição por palavras consegue — e é exatamente o que
falta ao agente, que executa bem mas não tem preferência própria.

**O que for dado como intocável não se substitui em silêncio.** Se houver
razão forte para contrariar uma restrição explícita, o agente pergunta antes
— não escreve uma justificação no `DESIGN.md` e segue.

Depois:

```bash
cd ../nichos/advocacia/clientes/silva-advogados
claude
```

E, uma única vez, dentro do Claude Code:

```
/impeccable init
```

O `init` lê o que lhe deste — referências, site antigo, restrições — e
escreve o `PRODUCT.md`, que passa a ser a fonte de verdade do projeto.

**Abre sempre o Claude Code dentro da pasta do cliente, nunca em
`oficina/` para construir para fora.** O Impeccable resolve o
`PRODUCT.md`, o `DESIGN.md` e o `.impeccable/` a partir da raiz do projeto,
e os hooks do detetor usam `${CLAUDE_PROJECT_DIR}`. Construir de fora para
dentro faria o contexto de design de todos os clientes cair no sítio
errado, misturado.

Cada cliente fica com o seu `PRODUCT.md` e `DESIGN.md` versionados. As
skills não são versionadas no repo do cliente — são regeneráveis a partir
daqui.

## Atualizar as skills de terceiros

```bash
cd oficina

npx impeccable update                 # impeccable
npx skills@latest update --project    # emil-design-eng, design-taste-frontend
```

As duas últimas estão fixadas por hash em `skills-lock.json` e foram
instaladas com `--copy` em vez de symlink, para o repositório funcionar
noutra máquina. Depois de atualizar, rever o diff antes de commitar —
estas skills correm com as permissões todas do agente.
