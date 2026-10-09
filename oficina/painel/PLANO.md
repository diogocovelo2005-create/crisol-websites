# Painel de projetos: plano de implementação

Um quadro visual com os projetos em mãos: uma página por nicho, um cartão por
casa, e uma página de detalhe por projeto. Está ligado ao Supabase (o estado da
lead) e às pastas deste repositório (dossiê, site, proposta).

Decidido com o Diogo a 2026-09-19.

---

## Decisões que não se mudam sem falar com ele

1. **O estado vive num sítio só.** No alojamento é o `crm_alojamento.estado`.
   O painel lê e escreve diretamente aí. Não há cópia do estado, por isso a
   ligação nos dois sentidos é automática.
2. **Não se acrescentam colunas ao `crm_alojamento`.** Tudo o que é do projeto
   vive em tabelas novas (`projetos`, `projeto_passos`, `projeto_eventos`).
3. **Um projeto nasce quando a lead passa a `a construir base`.** Só entram as
   leads que disseram sim na cold call.
4. **O painel sugere e ele aceita.** O próximo passo aparece como sugestão, com
   os botões Aceitar, Editar e Ignorar. Nada se muda sozinho no estado.
5. **A checklist é básica** e tem um botão "+ Adicionar passo" em cada fase.
6. **Corre só no PC dele** (`localhost:4000`). Usa a chave privada do Supabase,
   por isso nunca vai para a Vercel.

---

## Onde vive e com quê

- Pasta: `oficina/painel/`
- Next.js (App Router) + Tailwind, como os sites. Arranca com
  `cd oficina/painel && npm run dev`, na porta 4000.
- `.env.local` (já ignorado pelo git):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`, só usada no servidor e nunca no browser
  - `VERCEL_TOKEN`, de só leitura, criado em vercel.com/account/tokens
  - `VERCEL_TEAM_ID=team_N3F4SwK2Yidhb42Pgza7NCFN`
  - `REPO_ROOT`, o caminho da raiz do repositório
- **Todo o acesso ao Supabase, ao disco e à Vercel é feito no servidor**, em
  route handlers e server actions. O browser só fala com o painel.
- **Atualização:** a página pede os dados de 10 em 10 s e sempre que ganha
  foco. Chega para o cartão aparecer "logo". O Realtime fica para mais tarde,
  porque obrigaria a abrir o CRM à chave pública.

---

## Dados (Supabase, projeto `crisol leads`)

### `projetos`
| coluna | para quê |
|---|---|
| `id` uuid pk | |
| `nicho` text | `alojamento`, `saude`, `advocacia`… Uma página por nicho. |
| `place_id` text unique, nulo | liga ao `crm_<nicho>`. Nulo se o nicho não tem CRM. |
| `estado` text, nulo | só é usado quando não há CRM (saúde, advocacia). No alojamento fica nulo. |
| `nome` text | cópia do nome, para os nichos sem CRM |
| `slug` text | a pasta: `nichos/<nicho>/casas/<slug>` ou `clientes/<slug>`. Editável na página. |
| `porta` int | a porta local do site (3100, 3101…), atribuída ao criar |
| `email` text, nulo | lido do dossiê ou escrito à mão |
| `email_origem` text | `dossie`, `dossie-a-verificar`, `manual` ou `sem-email` |
| `proximo_passo` text | o passo aceite |
| `proximo_passo_ate` date | |
| `url_enviada` text | o link que o cliente recebeu |
| `valor` numeric | |
| `motivo_fim` text | motivo do não, depois da base |
| `voltar_em` date | para "sem resposta" ou "não é o momento" |
| `criado_em` timestamptz | |

### `projeto_passos` (a checklist)
`id`, `projeto_id`, `fase` (1–5), `texto`, `ordem`, `feito_em` (nulo = por
fazer), `auto` (a chave de deteção automática, ou nulo), `extra` (bool: foi ele
que acrescentou).

### `projeto_eventos` (o histórico)
`id`, `projeto_id`, `tipo` (`estado` | `nota` | `passo`), `texto`, `criado_em`.

### Triggers
- `after update of estado on crm_alojamento`:
  - se o estado novo for `a construir base` ou posterior e ainda não houver
    projeto, cria o projeto com o `slug` tirado do nome e a próxima porta
    livre;
  - em qualquer caso, se houver projeto, regista um evento `estado`.
- A checklist **não** é criada no trigger, porque vem de um ficheiro do
  repositório. O painel semeia-a na primeira vez que vê um projeto sem passos.
- RLS ligado nas três tabelas, sem políticas públicas. Só a chave de serviço
  lá chega.

---

## A checklist básica e as sugestões

Uma por nicho, em `nichos/<nicho>/checklist.json`. É aqui que se mudam os
passos, sem tocar no código. No alojamento:

| Fase | Passo | Marca-se | Quando fica feito, sugere |
|---|---|---|---|
| 1 Base | Dossiê feito | 🤖 existe `dossie/resumo.md` | "Montar o site da base" |
| 1 Base | Site da base feito | 🤖 existe `site/ADAPTACAO.md` | "Pôr a base no ar" |
| 1 Base | Base no ar | 🤖 último deploy na Vercel READY | "Enviar a base por email" (hoje) |
| 2 Enviada | Email enviado | ✋ | "Ligar a saber o que achou" (+3 dias) |
| 2 Enviada | Chamada de feedback | ✋ | "Enviar proposta" ou "Fazer as alterações pedidas" |
| 3 Decisão | Proposta enviada | 🤖 PDF em `proposta/out/` + ✋ | "Ligar a confirmar a proposta" (+3 dias) |
| 3 Decisão | Resposta | ✋ sim / não / sem resposta | sim: "Pedir fotos e textos ao cliente" |
| 4 Site completo | Site completo feito | ✋ | "Enviar ao cliente para aprovar" |
| 4 Site completo | Cliente aprovou | ✋ | "Publicar no domínio" |
| 5 No ar | Publicado | 🤖 domínio próprio no projeto da Vercel | "Cobrar" |
| 5 No ar | Pago | ✋ | "Pedir testemunho" |

- 🤖 quer dizer que o painel marca sozinho quando encontra a prova, e mostra a
  prova (o ficheiro ou o link). Ele pode desmarcar.
- Quando um passo fica feito, a sugestão aparece por cima do "Próximo passo",
  com **Aceitar · Editar · Ignorar**. Só quando ele aceita é que muda
  `proximo_passo` e `proximo_passo_ate`.
- **Mudar o estado também é só sugestão.** Se ele marca "Email enviado", o
  painel pergunta "Mudar o estado para *base enviada*?" com Sim ou Não.
- "+ Adicionar passo" em cada fase cria um passo com `extra = true`.

---

## Os ecrãs

### Quadro (`/alojamento`, `/saude`, `/advocacia`)
- Separadores de nicho no topo.
- Três números: projetos em mãos, parados há mais de 7 dias, € em jogo.
- Cinco colunas, cada uma a juntar vários estados do CRM:

| Coluna | Estados do CRM |
|---|---|
| Base | a construir base |
| Enviada | base enviada, reunião de feedback |
| Sim | disse que sim |
| Construção | a construir site, site acabado |
| No ar | publicado, pago |

- `disse que não` e `não contactar mais` vão para `/<nicho>/arquivo`.
- **Cartão:**
  - a foto em grande, o nome e o concelho;
  - uma etiqueta com o estado exato;
  - "há N dias", a verde, amarelo ou vermelho;
  - o próximo passo;
  - cinco pontos, um por fase.
- Clicar no cartão abre a página do projeto.
- **Foto:** a primeira de `site/public/fotos`, senão a primeira de
  `dossie/marketing/fotos`, senão a inicial do nome sobre uma cor. A Places API
  não se usa aqui, porque cada foto é paga.

### Página do projeto (`/<nicho>/<slug>`)
1. **Cabeçalho:** foto grande, nome, concelho, estado (menu que escreve no
   CRM), "há N dias", e os botões 📞 ligar · 💬 WhatsApp · ✉ email · 📁 abrir
   pasta no VS Code.
2. **Próximo passo:** o passo aceite e a data, e por cima a sugestão, se
   houver.
3. **O site:**
   - pré-visualização da versão mais recente;
   - quatro links: mais recente (Vercel) · local (`localhost:<porta>`, ou o
     botão "Arrancar" se estiver desligado) · o link enviado ao cliente, com
     aviso se estiver desatualizado · o site antigo;
   - a data do último deploy.
4. **Checklist:** as fases, os passos e "+ Adicionar passo".
5. **Histórico:** mudanças de estado e notas com data, e "+ nota".
6. **Negócio:** valor, proposta (PDF) e pago.
7. **Fim:** só aparece quando a lead está em "disse que não" ou em "sem
   resposta":
   - "disse que não" pede o motivo;
   - "sem resposta" conta as tentativas;
   - os dois casos têm "voltar em".
8. **Dados da lead** (fechado por defeito): rating, reviews, tipo, nota,
   morada, lidos do CRM.
9. **Dossiê:** os `.md` da pasta `dossie/` em separadores.

---

## Como o painel encontra cada coisa

| Coisa | Onde |
|---|---|
| pasta | `nichos/<nicho>/casas/<slug>/` (alojamento) ou `nichos/<nicho>/clientes/<slug>/` |
| projeto Vercel | `site/.vercel/project.json` → `projectId` → API `GET /v6/deployments?projectId=…&target=production&limit=1` |
| domínio próprio | API `GET /v9/projects/{id}/domains`, ignorando os `*.vercel.app` |
| link enviado desatualizado | o deployment para onde o `url_enviada` aponta não é o último |
| local ligado | pedido ao `localhost:<porta>` com 500 ms de limite |
| arrancar local | lança `npm run dev -- -p <porta>` na pasta `site/`, desligado do painel |
| email | `dossie/factos.md`: primeiro a linha `[OFICIAL] Email:`, depois `[A_VERIFICAR] Email:` (com aviso), depois o campo manual, e por fim "sem email" |
| proposta | `nichos/<nicho>/proposta/out/proposta-<slug>.pdf` |
| abrir pasta | `code <pasta>` |

Os caminhos lidos do disco validam-se sempre contra `REPO_ROOT`, para um `slug`
não conseguir sair do repositório.

---

## Fases de construção

Cada fase fica utilizável sozinha e verifica-se com uma captura no Playwright.

**Fase 1: Supabase**
- Criar as tabelas, os triggers e o RLS numa migração.
- Preencher: a Quinta de CasalMato (já está em `a construir base`) e as casas
  que já têm pasta (Fataunços, Canhões). Estas duas dependem da resposta à
  pergunta em aberto.
- Verificar: mudar o estado de uma lead de teste e ver a linha em `projetos`
  aparecer. Depois, repor o estado.

**Fase 2: Esqueleto e quadro, só leitura**
- A app Next em `oficina/painel/`, o `.env.local` e os separadores de nicho.
- As colunas e os cartões, com a foto lida do disco.
- Verificar: os cartões aparecem com fotos, e uma mudança feita no Supabase
  aparece em menos de 10 s.

**Fase 3: Página do projeto, só leitura**
- Cabeçalho, bloco do site com os links Vercel/local, checklist com deteção
  🤖, dossiê em separadores e dados da lead.
- Verificar: o Fataunços mostra o deploy certo, o email do `factos.md` e os
  passos 🤖 marcados.

**Fase 4: Escrita**
- Mudar o estado pelo menu (com o CRM), marcar e acrescentar passos, notas,
  valor, pago, motivo do fim e voltar em.
- As sugestões com Aceitar · Editar · Ignorar.
- Verificar: mudar o estado no painel e confirmar no Supabase que só o
  `estado` e o `estado_em` mudaram.

**Fase 5: Ações locais**
- "Arrancar" o site local, abrir a pasta no VS Code, e o aviso do link enviado
  desatualizado.

**Fase 6: Arquivo e números**
- A página `/arquivo` com os motivos, e os três números no topo do quadro.

**Mais tarde, se fizer falta:**
- arrastar os cartões entre colunas;
- Realtime;
- CRM para a saúde e a advocacia (até lá, o estado delas vive em
  `projetos.estado`).

---

## Projetos que entram à mão (respondido a 2026-09-19)

- **Fataunços** (`casa-de-fatauncos-vouzela`) e **Canhões** (`quinta-de-canhoes`)
  são projetos de fora da prospeção. Entram no alojamento com `place_id` nulo e
  estado próprio em `projetos.estado`, que começa vazio. O cartão mostra
  "definir estado", e é o Diogo que o escolhe.
- **Advocacia:** só entra o `manuel-covelo-advogado`, também com estado
  próprio.
- **Saúde:** para já não entra nenhum. As clínicas são demonstrações, não
  clientes.
- A regra fica assim: se o projeto tem `place_id`, o estado vem do CRM; se não
  tem, vem de `projetos.estado`, com os mesmos valores.
- Os segredos ficam em `oficina/painel/.env.local` (já criado, e ignorado pelo
  git). O Diogo preenche lá as chaves.

---

## Estado da construção (2026-09-19)

Feito e a funcionar em `localhost:4000` (`npm run dev`, preso a 127.0.0.1):
- Supabase: `projetos`, `projeto_passos`, `projeto_eventos`, e o trigger no
  CRM (ver `sql/`). Testado: uma lead posta em `a construir base` aparece
  sozinha.
- Quadro por nicho: colunas com uma cor por fase, cartões pequenos (foto e
  nome, ponto vermelho se atrasado), e "Sem estado" para os projetos de fora
  da prospeção.
- Página do projeto:
  - o estado, que escreve no CRM ou em `projetos`;
  - Abrir site (Vercel, ou local, ou Arrancar), a pasta no VS Code, o dossiê,
    ligar, WhatsApp e email;
  - o próximo passo com sugestões (Aceitar, Editar, Ignorar);
  - a checklist por fases, com a fase atual aberta e "+ Adicionar passo";
  - as notas.
- O dossiê fica numa página à parte. O arquivo fica em `/<nicho>/arquivo`.

A primeira versão tinha um visual temático (folha de provas) e foi rejeitada:
era difícil de ler. Ficou o visual liso.

Ainda por fazer: valor/negócio e o aviso do "link enviado desatualizado".
Existem no código de dados (`acoes.ts`, `vercel.ts`) mas foram tirados do ecrã
para o manter simples. Voltam se ele pedir.
