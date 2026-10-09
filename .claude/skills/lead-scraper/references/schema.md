# Schema e nota

Ler ao criar a tabela de um nicho novo, ao mexer no `score.sql`, ou ao
escrever qualquer consulta sobre estas tabelas.

---

## 1. Uma tabela por nicho

```
leads_<slug>
```

O slug é normalizado (sem acentos, minúsculas, `_` como separador) e
**truncado a 44 caracteres**.

### Porquê 44 e não 50

O limite de identificadores do Postgres são 63 caracteres, e ele **corta em
silêncio** o que passa disso: dois nichos com prefixo comum ficariam com o
mesmo nome de tabela, a escrever um por cima do outro, sem erro nenhum.

O que fixa o máximo não é a tabela — é a vista:

```
leads_ (6) + slug (44) + _prioritarias (13) = 63     exactamente no limite
leads_ (6) + slug (50) + _prioritarias (13) = 69     cortado
```

Os índices usam sufixos curtos (`_i1`, `_i2`, `_i3`) precisamente para não
serem eles a apertar o limite.

### Colunas específicas de nicho não são colunas

Vão para `audit_extra jsonb`. Uma coluna nova por nicho faria divergir o
schema entre tabelas e partiria qualquer consulta que atravesse nichos.

---

## 2. `site_state`: um enum com três origens

```sql
create type site_state as enum ('none','social_only','broken','legacy','modern');
```

| Valor | Quem o escreve | Quando |
|---|---|---|
| `none` | `discover.js` | não há `websiteUri` |
| `social_only` | `discover.js` | o `websiteUri` é um anfitrião social |
| `broken` · `legacy` · `modern` | `audit.js` | depois de visitar a página |
| **`NULL`** | ninguém | há website, ainda não foi auditado |

**É esta mistura que torna o filtro do audit perigoso.**

### A armadilha do `.neq()`

O `audit.js` quer saltar as linhas `'none'` — não há nada para visitar. O
filtro óbvio está errado:

```js
.neq('site_state', 'none')      // ERRADO
```

Em SQL, `NULL <> 'none'` avalia a `NULL`, e o `WHERE` trata `NULL` como falso.
Isso **exclui todas as linhas a NULL**, que são exactamente os sites normais —
a maioria, e os que mais interessam. O audit passaria a processar só os
`social_only`, sem um único erro visível, e o relatório diria "auditados: 40"
com ar de estar tudo bem.

```js
.or('site_state.is.null,site_state.neq.none')   // CERTO
```

A mesma armadilha aparece na vista, com `business_status`:

```sql
and business_status is distinct from 'CLOSED_PERMANENTLY'   -- e nao <>
```

Sempre que compares uma coluna que pode ser `NULL` contra um valor, usa
`is distinct from`, ou trata o `NULL` explicitamente.

---

## 3. A nota, 0 a 5

```
5  sem website          a lead mais quente: não tem nada
5  website partido      404, DNS morto, ou domínio parqueado
4  só redes sociais     Facebook, Linktree, wixsite — já percebeu que precisa
3  legacy + falha grave  sem https, sem viewport, ou overflow horizontal
2  legacy                velho mas funcional
1  moderno com margem    passa no essencial, tem uma fraqueza que se vende
0  moderno               não é lead
```

Linhas por auditar ficam com `score` a **NULL**, não a 0. Um zero diria "tem
site moderno, não precisa de nada", que é a conclusão errada a tirar de "ainda
não olhei".

### `legacy` = 2 ou mais falhas graves

Das sete: sem https · sem viewport · overflow horizontal · rodapé com mais de
4 anos · generator obsoleto · sem formulário nem contacto · sem JSON-LD.

Uma só falha não chega — sites bons falham uma. Duas já é um padrão.

### O ano do rodapé é relativo

A especificação original dizia "rodapé < 2022", escrita em 2026. Isso está no
código como `ano_actual - 4`, e não como `2022` literal: um número fixo faria a
regra afrouxar sozinha um ano por ano, sem ninguém dar por isso.

---

## 4. A diferença JS ↔ SQL que obriga a cuidado

O `audit.js` calcula uma nota provisória **em JS** para decidir se tira
screenshot. O `score.sql` calcula a nota definitiva **em SQL**. Têm de dar o
mesmo, e há uma diferença de linguagem no caminho:

```js
null < 2023      // JS:  true
```
```sql
NULL < 2023      -- SQL: NULL  (e o CASE nao entra no ramo)
```

Uma tradução ingénua daria "antigo" a todas as páginas sem rodapé datado,
tirava screenshots a mais, e a nota final não bateria certo com a decisão já
tomada. Por isso, dos dois lados:

```js
s.footer_year != null && s.footer_year < limite
```
```sql
footer_year is not null and footer_year < limite
```

E todos os testes booleanos usam `is not true` / `!== true`, para que `NULL`
signifique "não consegui medir" e não "está mal".

**Isto está verificado, não assumido:** 789 casos cobrindo todas as
combinações de `site_state` × nulos × anos foram inseridos, passados pelo
`score.sql` real, e comparados linha a linha com a função JS. 789/789
equivalentes.

Se mexeres num dos lados, repete essa comparação.

---

## 5. Índices e vista

```sql
_i1  (score desc nulls last, num_reviews desc nulls last)   -- listar por prioridade
_i2  (audited_at) where audited_at is null                  -- o lote do audit
_i3  (site_state)                                           -- filtrar por estado
```

O `_i2` é parcial de propósito: só interessa encontrar depressa o que falta
auditar, e um índice parcial sobre isso encolhe à medida que a auditoria
avança.

```sql
create or replace view leads_<slug>_prioritarias as
  select * from leads_<slug>
  where score >= 4
    and business_status is distinct from 'CLOSED_PERMANENTLY'
  order by score desc, num_reviews desc nulls last;
```

O desempate por `num_reviews` é deliberado: entre duas empresas sem website, a
que tem 80 avaliações é um negócio a funcionar; a que tem 2 pode nem existir.

`CLOSED_PERMANENTLY` sai também dos **totais** do relatório do discovery, e
não só desta vista — senão o número grande fica inflacionado com empresas que
já fecharam.

---

## 6. Aplicar

Com `SUPABASE_DB_URL` no `.env`, o `discover.js` cria a tabela sozinho na
primeira corrida. Sem essa variável, imprime o DDL para colares no SQL Editor
do Supabase e para **uma vez** — em vez de falhar lead a lead com mil
mensagens iguais.

O `score.sql` corre depois do audit:

```bash
node -e 'import("./scripts/lib/db.js").then(d=>d.aplicarScore(d.nomeTabela("<slug>")))'
```
