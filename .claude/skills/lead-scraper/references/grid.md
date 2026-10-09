# A grelha

Ler antes de gerar a grelha de uma região nova, ou quando o relatório do
discovery mostrar cobertura mais baixa do que o esperado.

O `gen-grid.js` transforma o nome de uma região em duas geometrias:

| Geometria | Para quê | Porquê esta forma |
|---|---|---|
| **círculos** | `places:searchNearby` | é a única forma que o `locationRestriction` do Nearby aceita |
| **retângulos** | `places:searchText` | o `locationRestriction` do Text Search **só** aceita retângulo; círculo existe apenas em `locationBias`, que é sugestão e deixa entrar empresas de outros distritos |

Ambas saem para `grid/<regiao>.json`, junto com o polígono da região — que o
`discover.js` precisa para descartar lugares que caiam fora dela.

---

## 1. A ideia central: a grelha é uma semente, não a resolução final

A grelha que sai daqui é **deliberadamente grosseira**. Para o distrito de
Viseu são 141 círculos de 5 km e 26 retângulos de 0,2°; para o concelho de
Penalva do Castelo, 76 círculos de 1158 m e 2 retângulos.

A resolução fina não vem da grelha. Vem da **subdivisão por saturação** no
`discover.js`: quando uma célula devolve o máximo que a API dá — 20 no Nearby,
60 no Text Search — sabe-se que ficaram empresas de fora, e essa célula parte-se
em quatro. Quando devolve menos, está esgotada e não se toca nela.

**Porquê assim, e não uma grelha fina desde o início.** Uma versão anterior
usava círculos de 800 m em zona urbana e 2500 m em zona rural, classificados
por proximidade a cidades e vilas do OpenStreetMap. Dava 2405 círculos para o
mesmo distrito — 17 vezes mais chamadas — e adaptava-se a um *proxy* ("isto
está perto de uma vila?") em vez de a um facto ("esta célula devolveu 20?").

O proxy erra exactamente onde interessa: um parque industrial a 8 km da vila é
classificado como rural e leva um círculo de 2500 m, quando é ali que estão as
empresas B2B. A subdivisão não erra, porque mede.

Como as chamadas de pesquisa com o mask `places.id` são gratuitas e ilimitadas
(ver `places-api.md`), a subdivisão sai de graça. O único recurso que consome
é tempo de relógio, e gasta-o onde há empresas em vez de o gastar a varrer
serra vazia.

Efeito colateral bem-vindo: desapareceu a dependência do Overpass, que era a
peça mais frágil do processo — devolveu 504 em duas de três corridas de teste.

### Escolher o raio semente

Por defeito é **automático**: `√área_km² × 100`, limitado entre 1000 e 5000 m
(o máximo do círculo da API são 50 000 m). Dá 5000 m para um distrito e
~1160 m para um concelho de 134 km².

Não é uma afinação estética. O desperdício da fase paga vem do anel que
transborda para os concelhos vizinhos, e esse anel vale grosseiramente
`perímetro × raio`. Numa região grande é uma fatia pequena; numa pequena chega
a ser maior que a própria região. Medido em Penalva do Castelo com raio fixo
de 5000 m: 91 lugares detalhados, 75 deitados fora — 82% do custo desperdiçado.

`--raio-semente N` força um valor. Maior = menos chamadas iniciais e mais
níveis de subdivisão; menor = o contrário. A resolução final é a mesma, porque
a subdivisão converge; o que muda é o transbordo.

`--lado-retangulo` (defeito 0.2 graus, ~22 km × ~17 km a 40°N) segue a mesma
lógica.

---

## 2. Resolver a região

```bash
node scripts/gen-grid.js --regiao "Viseu" --pais PT
```

Sem `--indice`, o script lista os candidatos e sai com código 2. Isto não é
timidez: em Portugal o distrito, o concelho-sede e a freguesia central
partilham o nome, e escolher mal deita fora a corrida inteira sem dar erro.

Saída real para "Viseu":

```
  idx  rank  addresstype      area km2   osm                display_name
    0    12  county                5003  r/3920285          Viseu, Portugal
    1    14  city                   506  r/5330332          Viseu, Portugal
    2    16  city_district           10  r/7687620          Viseu, Portugal
```

Os três `display_name` são **idênticos**. E as etiquetas do Nominatim estão
erradas para Portugal: chama `county` ao distrito e `city` ao concelho.

**Decide pela área**, que é o único sinal que não mente:

| Nível | Área típica |
|---|---|
| distrito | 2 500 – 7 000 km² |
| concelho | 50 – 1 500 km² |
| freguesia | < 50 km² |

Depois: `--indice 0`.

Atalho: pesquisar `"Distrito de Viseu"` em vez de `"Viseu"` devolve um único
candidato. Continua a valer a pena confirmar a área.

O Nominatim é chamado a 1 pedido/segundo com o `NOMINATIM_USER_AGENT` do
`.env`. Sem User-Agent com contacto real a resposta é 403.

### Sem polígono

Se o Nominatim não devolver geometria, o script avisa e usa a *bounding box*.
A bbox é sempre maior que a região — no distrito de Viseu, 8 831 km² contra
5 003 km² reais. As chamadas de pesquisa são gratuitas, logo o desperdício é
de tempo; mas os lugares apanhados fora da região só são descartados depois do
Place Details, esse pago.

---

## 3. Círculos: empacotamento hexagonal

Espaçamento = raio × 1.5, em malha hexagonal com as linhas alternadas
desviadas meio passo.

**Porquê 1.5.** Numa malha hexagonal com distância `s` entre vizinhos, o ponto
pior servido fica a `s/√3 ≈ 0.577s` do centro mais próximo. Círculos de raio
`r` cobrem tudo sse `s ≤ r·√3 ≈ 1.732r`. O 1.5 fica abaixo disso com folga —
cobertura total, mais sobreposição nas bordas, que é onde a API é menos
fiável. Medido: com espaçamento 1500 m e raio 1000 m, o pior ponto de uma
amostra aleatória ficou a 846 m do centro mais próximo, contra o limite
teórico de 866 m.

Uma malha quadrada com o mesmo espaçamento deixaria os cantos a `s/√2 =
0.707s`, mais longe, e abriria buracos.

### O critério de inclusão é "o círculo toca a região"

**Não** é "o centro está dentro da região". A diferença custou 6,5% de área
descoberta na primeira versão.

Um ponto da região junto à fronteira tem, muitas vezes, o centro hexagonal
mais próximo do lado de fora do polígono. Filtrar por "centro dentro"
descarta esse centro e deixa a faixa da fronteira sem círculo nenhum.

O que torna isto perigoso é que **a soma das áreas não denuncia**: a mesma
grelha defeituosa reportava "175% de cobertura", porque círculos sobrepostos
somam área na mesma. Só uma amostragem de pontos dentro do polígono revela o
buraco.

O critério correcto é distância à fronteira ≤ raio, calculada com distância
exacta ponto-aresta e um índice espacial das arestas
(`criarIndiceArestas` em `lib/geo.js`).

O preço são círculos centrados fora da região — 36 dos 141 no distrito de
Viseu — que trazem empresas do distrito ao lado. Essas caem no filtro de
polígono do `discover.js`, **depois** do Place Details, ou seja já pagas. É a
troca certa: umas dezenas de chamadas de Details desperdiçadas contra recall
perdido em silêncio.

---

## 4. Retângulos

Lado `--lado-retangulo` graus (defeito 0.2, ~22 km em latitude e ~17 km em
longitude a 40°N).

Alinhados a uma malha global de múltiplos do lado — `floor(coord/lado)*lado` —
para que regiões vizinhas produzam retângulos coincidentes em vez de
desencontrados, e para que a mesma região gere sempre os mesmos retângulos.

Um retângulo entra se intersectar o polígono. O teste é uma amostra de 3×3
pontos no interior; se falhar, procura vértices do polígono dentro do
retângulo. O segundo teste apanha as línguas estreitas de região que
atravessam um retângulo sem conter nenhum dos nove pontos amostrados.

Ao contrário dos círculos, os retângulos não precisam de tratamento de
fronteira: ladrilham a bbox inteira, logo a faixa do limite fica sempre
dentro de algum deles.

---

## 5. Subdivisão: os factores

Vive em `lib/geo.js` (`subdividirCirculo`, `subdividirRetangulo`) e é usada
pelo `discover.js`, mas o raciocínio pertence aqui.

### Círculos: fator 0.71, **não** 0.6

Ao partir um círculo saturado em quatro, os filhos ficam centrados nos
quadrantes, a meio raio — em `(±R/2, ±R/2)` — e o raio de cada filho é
`0.71 × R`.

O 0.6 que parece natural **deixa buracos**. O ponto do círculo pai pior
servido não está nas diagonais: está **sobre os eixos**. A distância de
`(R, 0)` ao centro mais próximo, `(R/2, R/2)`, é `R/√2 ≈ 0.707R`. Um filho de
raio `0.6R` deixa esse ponto a descoberto por `0.107R`, e como a subdivisão é
recursiva os buracos multiplicam-se por nível.

Medido com 400 000 pontos num círculo de 1000 m:

```
  fator   pior ponto descoberto
  0.6     FALTAM 106 m
  0.65    FALTAM 57 m
  0.707   COBRE TUDO
```

Usa-se 0.71 pela margem. O óptimo teórico para cobrir um disco com quatro
discos é ≈0.61, mas exige uma disposição que não é "nos quadrantes", e não
vale a pena persegui-lo: as chamadas são gratuitas.

Limite inferior: para de subdividir abaixo de 150 m de raio. Um círculo de
150 m com 20 resultados é um centro comercial ou um edifício de escritórios,
e continuar a partir não acrescenta nada.

### Retângulos: quadrantes exactos

Retângulos ladrilham sem sobreposição nem folga — não há factor nenhum a
acertar. Verificado: os 4 filhos somam 100,0% da área do pai e nenhum ponto do
pai fica fora de todos eles.

---

## 6. O ficheiro de saída

```jsonc
{
  "meta": {
    "nominatim": { "osm_id": ..., "place_rank": 12, "addresstype": "county" },
    "poligono_real": true,
    "area_km2": 5003,
    "area_bbox_km2": 8831,
    "params": { "raio_semente_m": 5000, "fator_espacamento": 1.5,
                "lado_retangulo_graus": 0.2, "fator_subdivisao": 0.71 },
    "contagens": { "circulos": 141, "circulos_de_fronteira": 36, "retangulos": 26 }
  },
  "poligono": { "type": "Polygon" | "MultiPolygon", "coordinates": [...] },
  "circulos":   [ { "id": "c0", "lat": ..., "lng": ..., "raio": 5000 } ],
  "retangulos": [ { "id": "r0", "low": {...}, "high": {...} } ]
}
```

O polígono viaja com a grelha de propósito. O `discover.js` precisa dele para
o filtro de fronteira, e voltar ao Nominatim podia resolver para outro
candidato — a grelha e o filtro deixariam de falar da mesma região.

`Polygon` e `MultiPolygon` são ambos suportados, com buracos. Não é um caso
raro: o distrito de Viseu tem um enclave de 13,7 km², e concelhos com
exclaves aparecem como MultiPolygon. Tratar só o primeiro anel deitaria fora
partes inteiras da região sem um aviso.

---

## 7. Números de referência

| Região | Área | Círculos semente | Retângulos semente | Tempo |
|---|---|---|---|---|
| Penalva do Castelo (concelho) | 134 km² | 9 | 2 | < 2 s |
| Viseu (distrito) | 5 003 km² | 141 (36 de fronteira) | 26 | < 2 s |

### O transbordo previsto é um piso, não uma previsão

A percentagem que o `gen-grid.js` reporta mede **área**, assumindo densidade
uniforme de empresas. A realidade raramente é uniforme, e o erro tem um sentido
previsível: uma região rural rodeada de concelhos com vilas perde mais do que a
área sugere, porque as empresas do outro lado da fronteira são mais.

Medido em Penalva do Castelo: transbordo previsto 32%, real **82%** (19 de 23
lugares descartados). Em regiões densas o desvio é menor. Lê o número como um
mínimo, e confirma o real no relatório do discovery, que conta lugares e não
área.

Área coberta entre 200% e 350% da região é normal: é a sobreposição
intencional do hexagonal, mais os círculos de fronteira.

Estes números são **antes** da subdivisão. Quantas chamadas a corrida faz de
facto depende de quantas células saturam, ou seja da densidade real de
empresas do nicho — que é o que se quer medir.

---

## 8. Verificar uma grelha

A soma das áreas não serve para validar cobertura. O teste que serve é
amostrar pontos aleatórios dentro do polígono e confirmar que cada um cai
dentro de pelo menos um círculo:

```js
// para cada ponto amostrado dentro do poligono:
const folga = Math.max(...circulos.map(c => c.raio - distanciaM(lat, lng, c.lat, c.lng)));
// folga < 0  =>  buraco
```

Ambas as grelhas de referência acima dão 0 descobertos em 25 000 amostras,
com margem mínima de ~700 m.

## Sinais de que algo está mal

| Sintoma | Causa provável |
|---|---|
| área muito menor do que esperavas | escolheste o concelho em vez do distrito — vê `meta.nominatim.place_rank` |
| `poligono_real: false` | região sem fronteira mapeada; a grelha cobre a bbox e vais pagar Details fora da região |
| `circulos_de_fronteira` perto de metade do total | região pequena para o raio semente; baixa `--raio-semente` |
| o discovery subdivide quase todas as células | raio semente grande demais para este nicho; funciona na mesma, só demora mais |
| o discovery não subdivide nenhuma célula | ou o nicho é raríssimo, ou as keywords não estão a encontrar nada — vê `keywords-method.md` |
