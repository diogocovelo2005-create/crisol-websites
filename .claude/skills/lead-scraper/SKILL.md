---
name: lead-scraper
description: >-
  Descobre empresas reais de um nicho numa região e avalia a presença web de
  cada uma, produzindo uma lista de leads ordenada por quem mais precisa de um
  website. Use sempre que o pedido for encontrar, listar ou prospetar empresas
  numa zona geográfica — "faz scrape de leads para <nicho> no distrito de
  <X>", "encontra empresas de <nicho> que não têm site", "quero uma lista de
  potenciais clientes em <região>", "que serralharias há em <concelho>",
  "preciso de contactos de <nicho> para vender websites", "faz-me uma lista de
  prospeção" — mesmo que não mencionem Google Places, Maps, Supabase,
  scraping, API ou base de dados. Também para retomar, alargar ou auditar uma
  corrida de leads já feita.
---

# Prospeção de leads B2B

> **Onde vive.** O pacote inteiro — scripts, referências, `.env`, e as pastas
> `grid/`, `keywords/`, `.state/` e `screenshots/` — está em
> `.claude/skills/lead-scraper/`. Os scripts mudam sozinhos para essa pasta ao arrancar,
> por isso os comandos abaixo correm a partir da raiz do projeto e os
> argumentos como `--grid grid/viseu.json` resolvem lá dentro.

Descobre empresas via Google Places API (New), audita os websites com
Playwright, e grava tudo no Supabase com uma nota de necessidade de website de
0 a 5.

**O objetivo é recall: apanhar o máximo de empresas que existem na região.**

Vale a pena interiorizar porquê, antes de correr o que quer que seja. As
falhas deste pipeline são silenciosas: a API devolve `200 OK` e uma lista com
bom aspeto mesmo quando ficaram 300 empresas de fora. Não há erro para
detetar, não há exceção para apanhar, e o relatório final parece igual nos
dois casos. Quase tudo o que se segue existe por causa disso.

Esta skill **não contém nichos**. Contém o método para gerar a terminologia de
qualquer nicho no momento. Se o pedido vier acompanhado de um documento de
investigação sobre o sector, usa-o como input adicional ao método; sem ele
funciona igual, e não o peças.

---

## As seis fases

A ordem não é arbitrária: o smoke test precisa de coordenadas, por isso vem
depois da grelha, não antes.

### 0 — Setup

Confirma que o `.env` tem `GOOGLE_MAPS_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` e `NOMINATIM_USER_AGENT`.

### Criar a tabela de um nicho novo

Cada nicho vive na sua tabela `leads_<slug>`. Se ela não existir, o
`discover.js` **para antes de gastar seja o que for** e imprime o DDL
completo. Três formas de a criar, por ordem de preferência:

1. **`SUPABASE_DB_URL` no `.env`** (Supabase → Project Settings → Database →
   Connection string → URI). Com ela, o `discover.js` cria a tabela sozinho e
   nunca mais há passo manual.
2. **Conector Supabase**, se estiver ligado nesta sessão: aplica o DDL que o
   script imprimiu com `apply_migration`. Não precisa de segredo nenhum novo.
3. **À mão**, colando o DDL no SQL Editor do Supabase.

Faz isto **antes** de arrancar o discovery, não durante: o script para na
mesma, mas assim não perdes a fase de pesquisa já feita.

Se for a primeira corrida da máquina: `npm install && npx playwright install chromium`.

### 1 — Região e grelha

```bash
node .claude/skills/lead-scraper/scripts/gen-grid.js --regiao "Viseu" --pais PT
```

Sai com código 2 e lista os candidatos, porque em Portugal o distrito, o
concelho-sede e a freguesia central partilham o nome — e as etiquetas do
Nominatim chamam `county` ao distrito e `city` ao concelho. **Decide pela
área**, não pelo nome: distrito 2 500–7 000 km², concelho 50–1 500 km²,
freguesia < 50 km². Depois:

```bash
node .claude/skills/lead-scraper/scripts/gen-grid.js --regiao "Viseu" --pais PT --indice 0
```

A grelha é deliberadamente grosseira. A resolução fina vem da subdivisão por
saturação na fase 4, que se adapta a dados reais em vez de a uma estimativa.
Ver `.claude/skills/lead-scraper/references/grid.md`.

### 2 — Keywords

Lê `.claude/skills/lead-scraper/references/keywords-method.md` e **gera** `.claude/skills/lead-scraper/keywords/<slug>.json` aplicando
os cinco passos. Depois:

```bash
node .claude/skills/lead-scraper/scripts/validate-keywords.js keywords/<slug>.json
```

O validador reprova listas curtas demais, termos com nome de local, português
do Brasil, plurais redundantes e `places_types` inválidos — estes últimos
verificados contra a API a sério, com o mask gratuito.

### 3 — Smoke test

```bash
node .claude/skills/lead-scraper/scripts/discover.js --nicho <slug> --grid grid/<regiao>.json \
                         --keywords keywords/<slug>.json --smoke-test
```

Sonda todas as células, escolhe a mais densa, e corre a lista toda contra ela,
mostrando os resultados **por termo**. Se mais de metade der 0, volta à fase 2.

Isto também é o que dá uma estimativa de custo a sério:

```bash
node .claude/skills/lead-scraper/scripts/estimate-cost.js --grid grid/<regiao>.json --keywords keywords/<slug>.json
```

Sem smoke test o estimador usa uma regra de bolso e diz-te que é uma regra de
bolso — a diferença entre as duas chega a ser "isto é grátis" contra "isto
custa 47 dólares".

### 4 — Descoberta

```bash
node .claude/skills/lead-scraper/scripts/discover.js --nicho <slug> --grid grid/<regiao>.json \
                         --keywords keywords/<slug>.json
```

Idempotente. Se parar — quota, rede, Ctrl+C — o mesmo comando retoma a partir
do checkpoint em `.state/` sem repetir chamadas.

**Por defeito não gasta dinheiro.** A fase paga tem dois andares: uma triagem
barata (`id,location,types`, 10 000 grátis/mês) que descarta quem cai fora
da região, e o mask completo (1 000 grátis/mês) só para os sobreviventes mais
relevantes. Sem `--max-details`, o tecto é exactamente o que resta de
gratuito no mês, e uma corrida que fosse custar alguma coisa pára e pede
`--aceito-pagar`.

Quando há mais candidatos do que chamadas gratuitas, os escolhidos são os de
maior relevância — por quantos termos do nicho foram encontrados, e se a
própria Google os categorizou no ofício. O resto fica triado e ordenado à
espera do mês seguinte.

### 5 — Audit e nota

```bash
node .claude/skills/lead-scraper/scripts/audit.js --nicho <slug> --screenshot-min-score 4
node -e 'import("./.claude/skills/lead-scraper/scripts/lib/db.js").then(d=>d.aplicarScore(d.nomeTabela("<slug>")))'
```

Também idempotente: só processa linhas com `audited_at` a null.

Resultado em `leads_<slug>_prioritarias`.

---

## Erros a evitar

Cada um destes já aconteceu. Nenhum dá erro.

### Pedir mais do que `places.id` numa chamada de pesquisa

Acrescentar `places.location` — ou qualquer outro campo — ao mask de pesquisa
salta do SKU gratuito para Pro, $32 por 1000. Numa grelha de 15 000 chamadas
são $480. A resposta continua a ser `200 OK` e a diferença só aparece na
factura. Por isso `lib/places.js` recusa esses masks em vez de os aceitar.

É também a razão pela qual o filtro de polígono acontece **depois** do Place
Details: sem `location` na pesquisa, não há coordenadas para filtrar antes.

### Assumir que 20 resultados no Nearby significa 20 empresas

O Nearby não pagina e 20 é tecto absoluto. Uma zona com 40 empresas devolve
20, e as outras 20 desaparecem sem sinal nenhum — a resposta é idêntica à de
uma zona que tem exactamente 20. Daí a subdivisão obrigatória.

O mesmo no Text Search a partir de 58 (não 60: a API devolve páginas
incompletas sem que a lista tenha acabado).

### `.neq('site_state', 'none')` no audit

Depois da descoberta, `site_state` só está preenchido nos casos óbvios; os
sites normais ficam a `NULL`. Como `NULL <> 'none'` avalia a `NULL` em SQL, um
`.neq()` **exclui todas as linhas a NULL** — o audit saltaria os sites normais
e processaria só os perfis de rede social. O relatório diria "auditados: 40" e
pareceria bem. Usa-se `.or('site_state.is.null,site_state.neq.none')`.

### Confundir `null < 2023` em JS com `NULL < 2023` em SQL

O primeiro é `true`, o segundo é `NULL`. A nota provisória que decide o
screenshot é calculada em JS; a definitiva em SQL. Uma tradução ingénua faria
as duas divergirem sem nunca falhar.

### Escolher o candidato errado do Nominatim

Os três "Viseu" têm `display_name` idêntico e áreas de 5003, 506 e 10 km².
Escolher mal deita fora a corrida inteira, e o resultado é uma lista mais
curta — que se parece com "há poucas empresas aqui".

### Assumir que a chave pertence ao projeto que julgas

Um `429` de quota traz `consumer: projects/<numero>`. Se esse número não for o
teu projeto, a chave foi criada noutro sítio e nenhum aumento de quota
resolve. Um projeto novo pode trazer 100 pedidos/dia enquanto a consola mostra
75 000.

### Inventar termos para cumprir o limiar

Um termo fabricado gasta uma passagem por toda a grelha, devolve zero, e faz a
lista parecer mais completa do que é. Um registo pode ficar legitimamente
vazio — justifica-o nas notas.

### Confiar na soma das áreas como prova de cobertura

Círculos sobrepostos somam área na mesma. Uma grelha que reportava "175% de
cobertura" tinha 6,5% da região sem círculo nenhum. A validação é amostrar
pontos dentro do polígono, não somar áreas.

---

## Quando ler cada referência

| Ficheiro | Ler quando |
|---|---|
| `.claude/skills/lead-scraper/references/keywords-method.md` | **sempre**, antes de gerar termos para um nicho — é o núcleo do método |
| `.claude/skills/lead-scraper/references/places-api.md` | antes de mexer em qualquer chamada à API, e obrigatoriamente antes de tocar num field mask; também quando aparecer um 429 ou um 400 |
| `.claude/skills/lead-scraper/references/grid.md` | ao gerar a grelha de uma região nova, ou se a cobertura parecer baixa |
| `.claude/skills/lead-scraper/references/schema.md` | ao criar a tabela de um nicho novo, ao mexer no `score.sql`, ou ao escrever consultas sobre estas tabelas |
| `.claude/skills/lead-scraper/references/exemplo-keywords-canalizacao.json` | como exemplo do formato e do nível de detalhe esperado nas notas |

---

## Sinais de que a corrida não correu bem

| Sintoma | Leitura |
|---|---|
| Text Search com < 15% de leads exclusivas | o sinal mais fiável de keywords fracas: os termos não encontraram nada que os tipos já não encontrassem |
| mais de metade dos termos a 0 no smoke test | lista errada — e o smoke test usa a célula mais densa precisamente para tirar a região da equação |
| nenhuma célula subdividida | ou o nicho é raríssimo, ou nada está a ser encontrado |
| transbordo acima de 50% na grelha | raio semente grande demais para a região; vais pagar Details para os deitar fora |
| muitas células falhadas | buracos conhecidos na cobertura — estão listados no relatório, não são invisíveis |
