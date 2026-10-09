# lead-scraper

Pipeline de prospeção de leads B2B: descobre empresas de um nicho numa região
via **Google Places API (New)**, audita os websites com **Playwright**, e grava
tudo no **Supabase** com uma nota de necessidade de website de 0 a 5.

Feito para **recall** — apanhar o máximo de empresas que existem na região. As
falhas deste tipo de pipeline são silenciosas: a API devolve `200 OK` e uma
lista com bom aspeto mesmo quando ficaram 300 empresas de fora. Grande parte do
código existe por causa disso.

Node 20+, ESM, sem TypeScript, sem framework.

---

## 1. Instalar

```bash
cd .claude/skills/lead-scraper
npm install
npx playwright install chromium
cp .env.example .env
```

O setup corre dentro da pasta do pacote. Os comandos das fases seguintes já
não precisam disso: os scripts mudam sozinhos para lá.

---

## 2. Google Cloud

Isto é a parte onde se perde mais tempo, por três razões concretas.

**2.1 — Projeto e faturação.** Cria um projeto em
[console.cloud.google.com](https://console.cloud.google.com/) e associa-lhe uma
conta de faturação com cartão. Sem faturação a chave é criada mas devolve `403`
em tudo.

O crédito de $200/mês acabou a 1 de março de 2025. Foi substituído por limites
grátis por SKU — e, para o que fazemos aqui, **a fase de pesquisa é gratuita e
ilimitada**. Põe na mesma um alerta de orçamento em *Billing → Budgets & alerts*.

**2.2 — Ativar a API certa.** [Link
direto](https://console.cloud.google.com/apis/library/places.googleapis.com).
Existem duas entradas com nomes quase iguais:

| Nome na consola | Serviço | Serve? |
|---|---|---|
| **Places API (New)** | `places.googleapis.com` | sim |
| Places API | `places-backend.googleapis.com` | não, é a legacy |

Ativar a errada dá `403 SERVICE_DISABLED` em todas as chamadas, e a mensagem
não diz que ativaste a irmã gémea.

**2.3 — Criar a chave, no projeto certo.** Credenciais → Criar credenciais →
Chave de API → Editar → Restrições de API → só *Places API (New)*.

Deixa as restrições de aplicação em **Nenhuma**. Restrição por IP parece boa
ideia mas parte as chamadas com IP dinâmico, e falha com um `403` genérico que
se confunde com o do ponto 2.2.

> **Confirma o projeto.** É fácil criar a chave num projeto e olhar para as
> quotas de outro. Se algo correr mal, um erro `429` traz
> `consumer: projects/<numero>` — esse é o projeto a que a chave pertence de
> facto. Se não for o que julgavas, cria uma chave nova no projeto certo; nenhum
> aumento de quota resolve o problema.

**2.4 — Quotas.** Um projeto novo pode vir com **100 pedidos por dia** por
método, enquanto a página de quotas mostra 75 000. Confirma em *Google Maps
Platform → Quotas* e usa *Increase Requests* se for preciso. Uma corrida num
distrito precisa de alguns milhares.

---

## 3. Supabase

Cria um projeto em [supabase.com](https://supabase.com). No `.env`:

```
SUPABASE_URL=https://<ref>.supabase.co          # Settings > API > Project URL
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...         # Settings > API > service_role
SUPABASE_DB_URL=postgresql://postgres:...       # Settings > Database > URI (opcional)
```

O `SUPABASE_DB_URL` só é usado para DDL — criar a tabela do nicho e correr o
score —, porque o PostgREST não executa `create table`. Sem ele o pipeline
imprime o SQL para colares no SQL Editor e para uma vez, em vez de falhar lead
a lead.

A `service_role` ignora Row Level Security. Vive só em scripts locais.

---

## 4. Nominatim

```
NOMINATIM_USER_AGENT="lead-scraper/1.0 (o-teu-email@exemplo.pt)"
```

A política de uso exige um User-Agent que te identifique com contacto real, e
no máximo 1 pedido por segundo. O script respeita o ritmo sozinho; o
User-Agent é contigo. Sem ele, `403` e não há grelha nenhuma.

---

## 5. Uma corrida completa

Exemplo: serralharias no distrito de Viseu.

### 5.1 Grelha

```bash
node .claude/skills/lead-scraper/scripts/gen-grid.js --regiao "Viseu" --pais PT
```

Lista os candidatos e sai com código 2 — em Portugal o distrito, o concelho e a
freguesia partilham o nome:

```
  idx  rank  addresstype      area km2   osm                display_name
    0    12  county                5003  r/3920285          Viseu, Portugal
    1    14  city                   506  r/5330332          Viseu, Portugal
    2    16  city_district           10  r/7687620          Viseu, Portugal
```

Decide pela **área**. As etiquetas mentem: o Nominatim chama `county` ao
distrito e `city` ao concelho.

```bash
node .claude/skills/lead-scraper/scripts/gen-grid.js --regiao "Viseu" --pais PT --indice 0
```

→ `grid/viseu.json` (141 círculos, 26 retângulos, ~1 s)

### 5.2 Keywords

Aplica `references/keywords-method.md` e escreve `keywords/serralharia.json`.
Depois:

```bash
node .claude/skills/lead-scraper/scripts/validate-keywords.js keywords/serralharia.json
```

Reprova com explicação se a lista for curta demais, tiver nomes de local,
português do Brasil, plurais redundantes, ou `places_types` que a API rejeita.

### 5.3 Smoke test

```bash
node .claude/skills/lead-scraper/scripts/discover.js --nicho serralharia --grid grid/viseu.json \
                         --keywords keywords/serralharia.json --smoke-test
```

Sonda todas as células, escolhe a mais densa, e mostra os resultados por termo.
Se mais de metade der 0, volta ao passo 5.2. Não escreve nada na base de dados
e usa um ficheiro de estado próprio.

### 5.4 Estimar o custo

```bash
node .claude/skills/lead-scraper/scripts/estimate-cost.js --grid grid/viseu.json --keywords keywords/serralharia.json
```

Depois do smoke test o número é extrapolado de uma medição real. Antes dele é
uma regra de bolso — e o script diz-te qual dos dois está a usar.

### 5.5 Descoberta

```bash
node .claude/skills/lead-scraper/scripts/discover.js --nicho serralharia --grid grid/viseu.json \
                         --keywords keywords/serralharia.json
```

Idempotente: se parar, o mesmo comando retoma do checkpoint em `.state/`.

### 5.6 Audit e nota

```bash
node .claude/skills/lead-scraper/scripts/audit.js --nicho serralharia --screenshot-min-score 4
node -e 'import("./.claude/skills/lead-scraper/scripts/lib/db.js").then(d=>d.aplicarScore(d.nomeTabela("serralharia")))'
```

Resultado em `leads_serralharia_prioritarias`.

`--screenshot-min-score 4` e não 5: as notas 5 são maioritariamente empresas
**sem site nenhum**, que não têm nada para fotografar. É o 4 que dá as páginas
de Facebook e os Linktree.

---

## 6. Custos

**Por defeito, este pipeline não consegue gerar factura.** Precisa de duas
acções explícitas tuas para isso — explicadas no fim da secção.

### As chamadas

| Chamada | Preço | Grátis por mês | Peso na corrida |
|---|---|---|---|
| Nominatim (região) | $0 | ilimitado | 1–2 chamadas |
| **Places Search** (`places.id`) | **$0** | **ilimitado** | ~95% de tudo |
| Place Details **Essentials** (`id,location,types`) | $5/1000 | **10 000** | 1 por lugar único |
| Place Details **Enterprise** (mask completo) | $20/1000 | **1 000** | só os que sobram |

A descoberta — que são milhares de chamadas — é gratuita e sem tecto. É por
isso que o `lib/places.js` recusa qualquer field mask de pesquisa fora de
`places.id`: acrescentar um único campo salta para $32/1000 e transforma uma
corrida grátis numa de centenas de dólares, sem nenhum aviso na resposta.

### A fase paga tem dois andares

Nem todos os lugares encontrados merecem o mask caro. O barato traz
`location` e `types`, que chegam para descartar quem cai fora da região e
para ordenar o resto por relevância:

```
B1  Essentials   TODOS os lugares          $5/1000, 10 000 gratis
    +- corta os que caem fora da regiao    (82% num concelho, 27% num distrito)
B2  Enterprise   so os sobreviventes       $20/1000, 1 000 gratis
    +- e destes, so os N mais relevantes
```

Medido no concelho de Penalva do Castelo: 24 chamadas baratas cortaram 20, e
**só 4 chegaram ao SKU caro** — antes eram 23.

### Números reais

| Região | Lugares únicos | Por defeito | Se forçares tudo de uma vez |
|---|---|---|---|
| Concelho pequeno | ~25 | **$0** | $0 |
| Concelho médio | 300–600 | **$0** | $0 |
| **Distrito (5003 km²)** | 1 000–3 400 | **$0** | $0 a $30 |

No distrito, o defeito detalha as **971 empresas mais relevantes** deste mês e
deixa as restantes para o mês seguinte, quando as 1000 gratuitas renovam. A
ordenação usa informação que já custou zero: por quantos termos do nicho cada
empresa foi encontrada, e se a própria Google a categorizou no ofício.

### As duas travas

1. **Sem `MAX_DETAILS_CALLS` no `.env`** (o defeito — deixa-o vazio), o tecto
   é exactamente o que resta de gratuito no mês. O contador vive em
   `.state/uso-mensal.json` e é partilhado por todas as corridas do mês —
   senão três corridas julgavam-se cada uma com 1000 chamadas livres.
2. **Mesmo com um tecto maior**, se a corrida fosse custar alguma coisa o
   `discover.js` pára e mostra o valor. Só continua com `--aceito-pagar`.

O estado fica sempre gravado, por isso parar não perde nada: o mesmo comando
retoma sem repetir chamadas.

> O crédito de $200/mês da Google **acabou a 1 de março de 2025**. Se leste em
> algum lado que "é tudo grátis com os créditos", estava certo antes dessa
> data. O que existe agora são os limites grátis por SKU da tabela acima.

---

## 7. Ficheiros

```
SKILL.md                     ponto de entrada da skill
references/
  keywords-method.md         o núcleo: como gerar termos para qualquer nicho
  places-api.md              tiers, masks, saturação, quotas, armadilhas
  grid.md                    grelha semente, subdivisão, cobertura
  schema.md                  tabelas, enum, nota, a diferença JS/SQL
  exemplo-keywords-*.json    exemplo do método aplicado (não é um nicho da skill)
scripts/
  gen-grid.js                região → grelha semente
  validate-keywords.js       12 regras sobre a lista de termos
  estimate-cost.js           quanto custa antes de custar
  discover.js                descoberta em duas fases + subdivisão
  audit.js                   Playwright + classificação
  schema.sql · score.sql     DDL e nota, idempotentes
  lib/geo.js                 ray casting, hexágonos, subdivisão
  lib/places.js              cliente da API + guard dos field masks
  lib/site.js                classificação de websites (pura, testável)
  lib/db.js                  Supabase e DDL
grid/ · keywords/            artefactos das corridas (versionados)
.state/ · screenshots/       checkpoints e fotografias (ignorados)
```

---

## 8. Quando algo corre mal

| Sintoma | Causa |
|---|---|
| `403 SERVICE_DISABLED` | ativaste a Places API legacy em vez da (New) |
| `403` sem mais nada | faturação não associada, ou restrição de IP na chave |
| `429 RESOURCE_EXHAUSTED` | quota diária. Vê `consumer` no erro — pode ser o projeto errado |
| `400 Unsupported types` | `includedTypes` fora da Tabela A (ex.: `general_contractor`) |
| `Cannot find matching fields for path 'id'` | mask sem prefixo numa pesquisa |
| `Cannot find matching fields for path 'places.id'` | mask com prefixo no Place Details |
| Nominatim `403` | `NOMINATIM_USER_AGENT` em falta ou genérico |
| `PGRST205` | a tabela não existe, ou o PostgREST ainda não recarregou o schema |
| poucas leads e lista curta | escolheste o concelho em vez do distrito — vê `place_rank` |
