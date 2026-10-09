# Places API (New)

Ler antes de mexer em qualquer chamada à API, e obrigatoriamente antes de
tocar num field mask.

Tudo aqui foi confirmado contra a documentação **e** contra chamadas reais em
Agosto de 2026. Onde a documentação e o comportamento divergiam, ganha o
comportamento.

---

## 1. A regra que domina tudo: a pesquisa é grátis, os detalhes é que custam

| SKU | Preço /1000 | Grátis por mês |
|---|---|---|
| **Nearby / Text Search Essentials (IDs Only)** | **$0,00** | **ilimitado** |
| Nearby / Text Search Pro | $32,00 | 5 000 |
| Nearby / Text Search Enterprise | $35,00 | 1 000 |
| Place Details Essentials | $5,00 | 10 000 |
| Place Details Pro | $17,00 | 5 000 |
| **Place Details Enterprise** | **$20,00** | **1 000** |
| Place Details Enterprise + Atmosphere | $25,00 | 1 000 |

Daí as duas fases do `discover.js`:

```
A)  searchNearby / searchText   mask "places.id"      milhares de chamadas   $0
B)  places/{id}                 mask completo         uma por lugar UNICO    $20/1000
```

Há 5 a 15 chamadas de pesquisa por cada lugar único. Trocar a ordem, ou pedir
um campo a mais na pesquisa, multiplica a factura sem mudar uma vírgula da
resposta.

### Os campos que mantêm a pesquisa no SKU grátis

**Só `places.id`, `places.name` e `nextPageToken`.** Mais nada.

Para pesquisa não existe tier intermédio: salta de IDs Only directamente para
Pro. Isto vale mesmo para campos que parecem inócuos:

| Campo no mask de pesquisa | SKU |
|---|---|
| `places.id`, `places.name` | IDs Only — **$0** |
| `places.location` | **Pro — $32/1000** |
| `places.displayName`, `places.types`, `places.formattedAddress` | Pro — $32/1000 |
| `places.websiteUri`, `places.rating`, `places.userRatingCount` | Enterprise — $35/1000 |

Numa grelha de 15 000 chamadas, acrescentar `places.location` é a diferença
entre **$0 e $480**. E a resposta é indistinguível: `200 OK`, sem aviso nenhum.
Medido:

```
mask "places.id"                  -> 200 OK, {"places":[{"id":"..."}]}
mask "places.id,places.location"  -> 200 OK, {"places":[{"id":"...","location":{...}}]}
```

Só a factura muda. Por isso o guard em `lib/places.js` **recusa** qualquer
mask de pesquisa fora dessa lista, em vez de confiar em quem escreve.

### A fase paga também se parte em dois

A mesma lógica que separa a pesquisa dos detalhes aplica-se um nível abaixo,
porque os SKUs de Place Details têm limites gratuitos muito diferentes:

| Mask | SKU | Preço | Grátis/mês |
|---|---|---|---|
| `id,location,types` | Essentials | $5/1000 | **10 000** |
| mask completo (com `websiteUri`) | Enterprise | $20/1000 | **1 000** |

O barato traz o que chega para decidir a quem vale a pena pagar o caro: onde
o lugar fica, e o que a Google acha que ele é. Como o gratuito do Essentials
é dez vezes maior, triar tudo com o barato e reservar o caro para os
sobreviventes muda os números por completo:

```
Penalva do Castelo, 24 lugares encontrados
  antes    24 Enterprise
  agora    24 Essentials  ->  20 descartados por cairem fora da regiao
            4 Enterprise
```

Rejeitei esta ideia numa primeira análise e estava errado: fiz a conta só com
o filtro de polígono a 27% e ignorei a diferença entre os limites gratuitos.
Com os 10 000 do Essentials contra os 1 000 do Enterprise, a conta inverte-se.

### Consequência: o filtro de polígono é tardio

Como `places.location` não pode entrar na pesquisa, não há coordenadas na fase
A. Descartar os lugares que caem fora da região só é possível depois de uma
chamada de Place Details — e é exactamente por isso que essa fase se parte em
dois: a triagem barata da secção anterior existe para fazer esse corte antes
de o mask caro ser tocado.

Também é a razão pela qual o `gen-grid.js` escala o raio semente com a área da
região. Quanto maior o raio, maior o anel que transborda para os concelhos
vizinhos, e mais lugares entram só para serem descartados.

---

## 2. Os dois field masks têm sintaxes diferentes

```
searchNearby / searchText  ->  X-Goog-FieldMask: places.id
places/{PLACE_ID}          ->  X-Goog-FieldMask: id,displayName,websiteUri
```

Trocar dá `400 INVALID_ARGUMENT`, nas duas direcções:

```
Details com "places.id"  -> Cannot find matching fields for path 'places.id'
Pesquisa com "id"        -> Cannot find matching fields for path 'id'
```

`lib/places.js` valida ambos os sentidos.

---

## 3. Nearby Search: 20 é tecto absoluto

`POST https://places.googleapis.com/v1/places:searchNearby`

- `maxResultCount` entre 1 e 20, **20 por defeito e por máximo**
- **não pagina.** Não há `nextPageToken` nesta API
- raio do círculo entre 0 e 50 000 m
- `locationRestriction` aceita **círculo**

**20 resultados significa sempre "ficaram empresas de fora".** A resposta é
indistinguível de uma zona com exactamente 20, por isso 20 dispara sempre
subdivisão. Um círculo com 40 empresas devolve 20 e as outras desaparecem sem
qualquer sinal.

---

## 4. Text Search: retângulo, e 60 no total

`POST https://places.googleapis.com/v1/places:searchText`

- `locationRestriction` aceita **apenas rectângulo** (*"Specify the region as a
  rectangular Viewport"*). O círculo só existe em `locationBias`, que é
  sugestão — e uma sugestão deixa entrar empresas de outros distritos
- `pageSize` máximo 20, **60 resultados no total** através de todas as páginas
- paginação por `nextPageToken` → `pageToken`, 3 páginas

Medido: `"restaurante"` num rectângulo de Viseu deu 20 + 20 + há página 3.

**Limiar de saturação: 58, não 60.** A API devolve por vezes páginas
incompletas — 19 em vez de 20 — sem que a lista tenha acabado. Exigir 60
exactos deixaria passar células saturadas. A margem de 2 custa umas
subdivisões a mais, que são gratuitas.

---

## 5. Zero resultados devolve `{}`

```
roofing_contractor, raio 800 m  ->  HTTP 200,  corpo:  {}
```

Não é `{"places": []}`. `j.places` é `undefined`, e `j.places.length` lança
`TypeError` num `200 OK`. Todo o acesso é `(j.places ?? [])`.

---

## 6. Tipos: Tabela A ≠ Tabela B

`includedTypes` só aceita valores da Tabela A. A Tabela B aparece nas
respostas mas **não** pode ser usada como filtro.

O caso concreto que apanha toda a gente:

```
includedTypes: ["general_contractor"]  ->  400  "Unsupported types: general_contractor."
```

E no entanto, o mesmo valor vem dentro do array `types` de uma empresa real:

```json
"types": ["painter","plumber","electrician","general_contractor","service", ...]
```

Por isso o `validate-keywords.js` verifica cada tipo **contra a API**, com o
mask gratuito, em vez de manter aqui uma cópia da tabela — a Google
acrescentou tipos em Fevereiro de 2026 e uma lista guardada envelhece em
silêncio.

### Não uses `includedPrimaryTypes`

A empresa *"SOS Obras Viseu, pinturas, remodelações, canalizador, capoto"*,
que faz canalizações, pinturas e electricidade, tem `primaryType: "service"` —
o genérico. Filtrar por tipo primário fá-la-ia desaparecer.

---

## 7. Quotas: o que realmente te limita

O preço não é a restrição. A quota é.

```
SearchTextRequestPerDayPerProject    = 100    <- projeto novo
SearchNearbyRequestPerDayPerProject  = 100
```

Um projeto do Google Cloud pode vir com **100 pedidos por dia** por método,
enquanto a página de quotas mostra 75 000 — o valor de catálogo do serviço. A
única forma de descobrir o valor efectivo é bater no tecto:

```json
{"error":{"code":429,"status":"RESOURCE_EXHAUSTED",
  "details":[{"metadata":{"quota_limit":"SearchTextRequestPerDayPerProject",
                          "quota_limit_value":"100",
                          "quota_unit":"1/d/{project}",
                          "consumer":"projects/206466503232"}}]}}
```

Duas coisas a retirar daqui:

1. **`consumer` diz-te a que projeto a chave pertence de facto.** Se não for o
   projeto que julgas estar a usar, criaste a chave no sítio errado — e nenhum
   pedido de aumento de quota resolve isso. Cria uma chave nova no projeto
   certo.
2. **Quota diária não recupera com backoff.** `lib/places.js` distingue
   `quota_unit` "1/d/" de "1/min/": a primeira aborta a corrida em segundos,
   com o checkpoint gravado. Fazer 1-2-4-8-16 s de espera em cada uma das
   milhares de chamadas restantes gastaria horas para nada, e o relatório
   diria "células falhadas" em vez de "a corrida foi cortada".

Subir a quota: Cloud Console → Google Maps Platform → Quotas → escolher a API
→ marcar → Edit → Submit request.

---

## 8. Detalhes menores mas reais

- **`displayName.languageCode` mente.** Uma empresa portuguesa com nome
  português veio etiquetada como `"es"`. Não serve para filtrar nada.
- **Erros 4xx que não 429 não são recuperáveis.** Um `includedTypes` inválido
  devolve 400 tantas vezes quantas se insistir. `lib/places.js` só faz backoff
  em 429, 5xx e falhas de rede — o 400 falha em 0,1 s.
- **Place Details devolve tudo o que pedires no mesmo SKU.** Como
  `websiteUri`/`rating` já obrigam ao Enterprise, não há razão para poupar nos
  outros campos: `displayName`, `types`, `businessStatus`, `location` e
  `nationalPhoneNumber` vêm pelo mesmo preço.
