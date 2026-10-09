# Método de keywords

Ler **antes** de gerar a lista de termos de um nicho — ou seja, sempre que
chega um pedido para um nicho novo.

Este documento não contém nichos. Contém o método para gerar terminologia
para qualquer nicho, no momento. Uma lista guardada envelhece: a terminologia
muda por região e por década, e um catálogo aqui dentro seria sempre a lista
de outra pessoa para outro sítio.

---

## Porque é que isto é o passo mais importante

O Google Places **não tem índice por atividade económica**. Não existe
"empresas de serralharia no distrito da Guarda". O que existe é uma pesquisa
que só encontra um estabelecimento quando algo casa com:

1. o **nome** do estabelecimento,
2. a **categoria** que o Google lhe atribuiu (`types`),
3. o **texto do perfil** — descrição, serviços, avaliações.

Uma empresa chamada *"Silva & Irmãos, Lda"* que faz canalizações só aparece se
o Google a tiver categorizado como `plumber`, ou se algum termo casar com o
perfil. Se nenhuma das duas coisas acontecer, ela é invisível — e a resposta da
API é `200 OK` com uma lista bonita à mesma.

**Não há erro para detetar.** A única defesa é a lista de termos.

### O que os dados dizem

Medido no centro de Viseu durante a validação da API:

| Consulta | Âmbito | Resultados |
|---|---|---|
| Nearby `includedTypes: ["plumber"]` | raio 800 m no centro | **1** |
| Text Search `"canalizador"` | distrito inteiro | **10** |

E a única empresa que o Nearby encontrou chama-se *"SOS Obras Viseu, pinturas,
remodelações, canalizador, capoto"* — só lá está porque enfiou os serviços
todos no nome. As outras nove não têm o tipo `plumber` atribuído.

**O Text Search não é o complemento. É o motor.** Os tipos ajudam; a lista de
termos é que carrega a cobertura.

---

## Passo 1 — Decompor o nicho em sub-ofícios

**Teste:** se um leigo pedisse orçamentos a *empresas diferentes* para duas
atividades, são sub-ofícios distintos.

Quem tem um esgoto entupido liga a uma empresa de desentupimentos, não ao
canalizador que lhe montou a casa de banho. Quem tem a caldeira avariada
procura assistência técnica da marca. São três mercados, com três conjuntos de
empresas e três vocabulários.

A contagem de sub-ofícios não é decorativa: **é ela que fixa o limiar de
termos** no Passo 4. Um nicho largo exige mais termos porque é mais coisas.

Ordens de grandeza: veterinária tem 1–2 sub-ofícios; canalização tem 3;
construção civil tem 15 ou mais.

---

## Passo 2 — Os cinco registos

São **ângulos de ataque**, não quotas. Cada um encontra empresas que os outros
não encontram.

| Registo | O que é | Exemplo (canalização) |
|---|---|---|
| **formal** | a designação oficial, a que está na certidão | `canalizador`, `redes de águas e esgotos`, `instalador de gás` |
| **coloquial** | como o público lhe chama | `arranjo de canos`, `homem dos canos` |
| **regional** | variantes vivas por zona do país | `picheleiro` (Lisboa e sul), `latoeiro` (interior norte) |
| **serviço** | o **problema**, como o cliente o escreve no Google — não a profissão | `fuga de água`, `desentupimento`, `reparação de autoclismo` |
| **adjacente** | ofícios que se sobrepõem e partilham empresas | `climatização`, `manutenção de piscinas` |

O registo **serviço** é quase sempre o maior, e é o mais produtivo. É onde o
cliente escreve o problema em vez da profissão, e portanto onde se encontram
as empresas cujo nome não diz nada mas cujo perfil menciona o serviço.

### Um registo pode ficar legitimamente vazio

Uma clínica veterinária urbana não tem variante regional viva — a única
candidata, *albeitar*, é arcaica e ninguém a escreve no Google.

Nesse caso **deixa vazio e justifica nas notas**. Um termo inventado para
cumprir uma checklist gasta uma passagem por toda a grelha, não devolve nada,
e faz a lista parecer mais completa do que é. O validador exige a
justificação: registo vazio com `notas` em branco é erro, porque a diferença
entre *"não existe"* e *"esqueci-me"* tem de ficar escrita.

---

## Passo 3 — Mapear `includedTypes`

Ver a Tabela A em `places-api.md`. O que aqui interessa é a consequência:

**Se o nicho não tiver tipo direto** — o caso da maior parte do B2B industrial —
o Nearby Search é inútil e **toda** a cobertura passa a depender do Text
Search. A lista de termos tem de ser maior para compensar, e é isso que o
limiar mais alto do Passo 4 traduz.

Cuidado com dois enganos concretos:

- **`general_contractor` não existe como filtro.** A API devolve-o dentro do
  array `types` de uma empresa, mas rejeita-o com `400 Unsupported types` se o
  usares em `includedTypes`. É a distinção Tabela A / Tabela B. O validador
  verifica isto contra a API a sério, porque uma lista guardada aqui
  envelheceria — a Google acrescentou tipos em Fevereiro de 2026.
- **Não uses `includedPrimaryTypes`.** O `primaryType` do *SOS Obras*, que faz
  canalizações, pinturas e eletricidade, é o genérico `service`. Filtrar por
  tipo primário fá-la-ia desaparecer.

O campo `tem_tipos_diretos` tem de ser coerente com `places_types`: é ele que
escolhe o limiar, e errá-lo aprova uma lista curta demais.

---

## Passo 4 — Validação

```bash
node scripts/validate-keywords.js keywords/<slug>.json
```

### O limiar

| | Fórmula |
|---|---|
| com tipos diretos | `max(20, 8 × nº sub-ofícios)` |
| sem tipos diretos | `max(35, 12 × nº sub-ofícios)` |

Escala com a amplitude do nicho porque um número fixo obrigaria a *padding*
num nicho estreito e seria frouxo num nicho largo. Veterinária com 1 sub-ofício
precisa de 20; construção civil com 15 precisa de 180 — e precisa mesmo,
porque são 15 mercados.

### As outras regras

| Regra | Porque falha em silêncio se for violada |
|---|---|
| **nenhum termo com nome de local** | a geografia vem da grelha. `"canalizador Viseu"` devolve zero em todas as células fora de Viseu e não acrescenta nada dentro dele — mas devolve `200 OK` |
| **português de Portugal** | `encanador` é português do Brasil. Não dá erro: devolve zero, e zero parece-se com *"não há empresas dessas na região"* |
| **sem plurais redundantes** | o Places não distingue `empreiteiro` de `empreiteiros`. O plural gasta uma passagem pela grelha inteira para devolver praticamente o mesmo conjunto |
| **sem duplicados entre registos** | inflacionam a contagem e enganam o limiar |
| **registo vazio justificado** | ver Passo 2 |

O validador confirma ainda cada `places_types` contra a API real, com o mask
`places.id` — gratuito. Descobrir ali que um tipo é inválido custa segundos;
descobri-lo a meio da corrida custa a corrida.

---

## Passo 5 — Smoke test antes da grelha completa

```bash
node scripts/discover.js --nicho <slug> --grid grid/<regiao>.json \
                         --keywords keywords/<slug>.json --smoke-test
```

Corre a lista toda contra **uma** célula e mostra os resultados **por termo**.

Se mais de metade dos termos devolver 0, volta ao Passo 2 — a lista está
errada, não a região. O smoke test usa o círculo geometricamente mais próximo
do centróide do polígono precisamente para tirar a região da equação.

---

## Formato

`keywords/<slug>.json`:

```jsonc
{
  "nicho": "canalização",
  "sub_oficios": ["canalizações de águas e esgotos", "desentupimentos e fossas",
                  "aquecimento, esquentadores e caldeiras"],
  "places_types": ["plumber"],
  "tem_tipos_diretos": true,
  "termos": {
    "formal":    [...],
    "coloquial": [...],
    "regional":  [...],
    "servico":   [...],
    "adjacente": [...]
  },
  "notas": "porque é que os sub-ofícios são estes, e porque é que os registos vazios estão vazios"
}
```

Exemplo completo e comentado: `references/exemplo-keywords-canalizacao.json`.
É um exemplo do método aplicado — **não** um nicho que a skill traga consigo.

---

## Se te derem um documento de investigação

Se o pedido vier acompanhado de um documento sobre o nicho — estudo de
mercado, lista de associações do sector, catálogo de fornecedores — usa-o como
**input adicional** ao Passo 1 e ao Passo 2. É a melhor fonte de sub-ofícios e
de terminologia formal que vais ter.

Sem esse documento o método funciona igual. Não o peças.

---

## Sinais de que a lista está fraca

| Sintoma | Leitura |
|---|---|
| mais de metade dos termos dá 0 no smoke test | a lista está errada; volta ao Passo 2 |
| o Text Search contribuiu com < 15% de leads exclusivas | o sinal mais fiável de cobertura insuficiente — os termos não estão a apanhar nada que os tipos já não apanhassem |
| todos os termos no registo `formal` | falta o registo `serviço`, que é o que encontra as empresas com nome opaco |
| o validador aprova mas as leads são poucas | confirma `tem_tipos_diretos`: se estiver `true` por engano, o limiar aplicado foi o baixo |
