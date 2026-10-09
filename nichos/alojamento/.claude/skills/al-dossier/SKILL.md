---
name: al-dossier
description: >-
  Investiga uma casa de alojamento ou turismo e reúne factos, voz da casa,
  opiniões completas e fotografias públicas para uma proposta de landing page.
  Confirma identidade, documenta provas, restrições e cobertura, e produz um
  contrato validado para criar-base. Usa para investigar uma casa, preparar
  o dossiê ou completar uma lacuna de informação ou imagens durante a adaptação.
  Recolhe textos e fotos por defeito; não decide a composição nem escreve o site.
---

# Dossiê de investigação sobre um Alojamento Local

> **Como se corre.** Em dois subagentes seguidos, lançados pela sessão
> principal (normalmente pela `criar-base`, que começa por aqui quando a casa
> ainda não tem dossiê; ou sozinha, com `/al-dossier`):
> 1. `dossie-recolha` (Sonnet): fases 0 a 2. Deixa `dossie/RECOLHA.md`.
> 2. `dossie-juizo` (Opus): fases 3 a 8, a partir da recolha.
>
> A navegação, que é o grosso dos tokens, fica no modelo mais barato; o juízo,
> de onde sai tudo o que o site diz sobre a casa, fica no mais forte. Uma
> recolha direcionada durante a construção do site (uma lacuna, uma foto) pode
> ir só ao `dossie-recolha`, seguido do `dossie-juizo` para rever o contrato.

## Para que serve este dossiê

O dossiê serve para montar a **landing page** da casa. Uma landing page não
convence com factos: convence com **o que torna a casa desejável**. Por isso o
dossiê tem duas partes, e a primeira é a mais importante:

1. **O que encanta nesta casa** (`pontos-fortes.md`) — os pontos fortes que os
   hóspedes repetem, os momentos que contam, as sensações que descrevem, os
   detalhes que só esta casa tem, o que dizem de quem recebe, para quem a casa
   é, e as frases com mais força, das reviews e dos textos da própria casa.
   **Tudo com prova:** cada ponto vem com citações reais e a sua fonte.
2. **Tudo o resto, completo e arrumado** — factos, canais, conformidade legal,
   textos de marketing, fotografias.

Um dossiê só com factos corretos e bem etiquetados **falhou o objetivo**, por
mais rigoroso que seja. O rigor existe para que o "sumo" seja verdadeiro, não
para o substituir.

**Quem lê o dossiê a seguir** é o agente que monta o site (skill
`criar-base`). O dossiê deve permitir construir sem repetir a pesquisa.
Se a adaptação identificar uma lacuna essencial, pode retomar esta skill para
recolha direcionada, preservando o existente e revalidando o contrato; não é
necessário transferir a pesquisa ou seleção de fotos para o Diogo.
Precisa, sem ter de adivinhar, de:
- o que pode afirmar como facto, o que só pode citar e o que não pode
  prometer (`contrato.json` e a vista `site-pronto.md`);
- uma ficha por tipo de quarto (`quartos.md`);
- os espaços da casa e a melhor foto de cada um (`factos.md` e
  `marketing/fotos.md`);
- experiências agrupadas pelo que as torna relevantes, e citações com o nome de quem as
  escreveu (`pontos-fortes.md`).

**O trabalho desta skill é reunir toda a informação pública sobre o AL e
organizá-la em pastas.** Na dúvida entre recolher e deixar de fora, recolhe:
o que não serve fica arrumado e marcado, e quem usar o dossiê decide. A única
coisa que nunca entra é informação de outra casa.

Duas fontes contam por igual e nenhuma deve apagar a outra:
- **O que a própria casa diz de si** — o anúncio, o site, as redes sociais.
  É a voz e a intenção do próprio dono, e a landing page tem de estar de
  acordo com ela, nunca contrariá-la.
- **O que os hóspedes dizem** — as reviews. É o que convence quem ainda não
  conhece a casa, e por isso importa especialmente para uma landing page.

O dossiê conserva as provas completas, mas a passagem para a construção tem
uma fonte de verdade: `contrato.json`. Cada afirmação utilizável declara a
prova, a entidade e o âmbito a que se aplica, o estado, a atualidade e a forma
como o site a pode usar. `site-pronto.md` é uma vista gerada a partir dele.
Ler `references/contrato.md` antes de criar ou atualizar estes ficheiros.

> **O que esta skill faz e o que não faz.** Analisa e sintetiza: encontra os
> pontos fortes, mede a força de cada um, escolhe as melhores citações e as
> frases com mais força. **Não escreve os textos do site** (títulos, frases
> do hero, parágrafos): isso é trabalho de quem monta a landing page, com este
> dossiê à frente. Também não decide layout nem design. Recolhe por defeito os
> textos de marketing e as fotografias da casa (ver fase 2), a não ser que o
> utilizador diga que já tem esse material do dono.

---

## As fases

### 0 — Setup

O pedido traz:
- Nome do AL
- Morada aproximada ou concelho
- Quaisquer links que já haja (Booking, Airbnb, Google Maps, site próprio,
  Instagram, Facebook)

Se faltar o nome ou o concelho, devolve à sessão principal o que falta e
para: corres como subagente e não podes perguntar.

Decide também o que recolher de material de marketing. **Por defeito
recolhes textos e fotos.** Só deixas de recolher uma das partes se o
utilizador disser que já a tem do dono:

| O utilizador disse | Recolhes textos de marketing? | Recolhes fotos? |
|---|---|---|
| Nada sobre isto | Sim | Sim |
| "Já tenho os textos do dono" | Não | Sim |
| "Já tenho as fotos do dono" | Sim | Não |
| "Já tenho textos e fotos do dono" | Não | Não |

Não perguntes por isto se o utilizador não o mencionar: o defeito é recolher.
Regista a decisão no topo de `resumo.md`.

Se o utilizador disser que já tem os textos do dono e eles não estiverem em
`dono.md` nem no pedido, devolve à sessão principal que faltam e onde
procurar, e para. Contam como voz do próprio AL na fase 4.

Tudo o que vier do dono ou do utilizador sobre esta casa (material enviado,
pedidos, restrições, decisões) fica em `dono.md` — ver `references/campos.md`.
Antes de dar algo por em falta, lê o que já existe nesses ficheiros e nos
links entregues. Se faltar mesmo alguma coisa que altera a recolha ou a
construção, devolve à sessão principal o que falta ou o que não se confirma,
e para.

Deriva uma slug do nome (ex.: "Casa da Praia — Peniche" → `casa-da-praia-peniche`)
e grava em `casas/<slug>/dossie/` (a partir de `nichos/alojamento`) — a mesma pasta onde vive
qualquer trabalho feito para esta casa, confirmado ou não. Se a pasta já
existir de uma corrida anterior, lê o que lá está antes de escrever por
cima.

**Numa corrida repetida, lê primeiro `dono.md`**: o que o dono pediu para
tirar não pode voltar a entrar sem a marca dele.

**Numa corrida repetida, acrescenta — nunca reescrevas do zero.** O objetivo
de uma segunda corrida é normalmente cobrir o que ficou por confirmar ou
apanhar reviews novas, não repetir a recolha toda. Mantém as citações e
factos já registados mesmo que não voltes a encontrá-los na nova passagem
pela plataforma; uma fonte só desaparece do dossiê se entretanto confirmares
que estava errada, e nesse caso regista a correção junto do que havia antes
em vez de apagar silenciosamente.

### 1 — Confirmar identidade entre plataformas

**Antes de recolher qualquer informação**, confirma que todas as fontes que
vais usar são mesmo sobre o mesmo AL. Nomes de alojamentos repetem-se muito
entre concelhos diferentes — recolher dados da fonte errada contamina o
dossiê inteiro sem dar erro nenhum.

Ler `references/identidade.md` antes desta fase. Regra resumida: precisas de
pelo menos dois de {nome, morada/coordenadas, telefone, número de registo} a
bater certo entre duas fontes para as tratares como o mesmo AL. Se não bater,
marca a fonte como `[A_VERIFICAR]` em `fontes.md` e não a uses até confirmar.

**Confirma também o tipo de casa e o concelho.** Nem tudo o que se vende no
Booking é Alojamento Local: Turismo de Habitação, Turismo Rural e outros
empreendimentos turísticos têm número RNET em vez de RNAL. E a casa aparece
muitas vezes associada ao concelho vizinho mais conhecido (as termas, a
praia). Se o tipo ou o concelho do pedido não baterem com as fontes oficiais,
diz-o no topo de `resumo.md`: o site não pode sair com o tipo ou o concelho
errados.

### 2 — Recolha por plataforma

Visita cada plataforma disponível como uma pessoa navegaria — usa as
ferramentas de browser/fetch disponíveis nesta sessão para ver o que está
publicamente visível. Não tentes iniciar sessão nem aceder a endpoints
privados de nenhuma plataforma.

Ler `references/proveniencia.md` antes de guardar a primeira frase — a
classificação de proveniência (`[OFICIAL]` / `[PLATAFORMA]` / `[OPINIAO]` /
`[INFERIDO]` / `[A_VERIFICAR]`) tem de acontecer no momento da recolha.

**Abre tudo o que está fechado.** O que a página mostra à primeira nunca é
tudo: "Continuar a ler" nas reviews e nas respostas do dono, "Mostrar mais"
nas descrições, as galerias de cada quarto, e a tabela de quartos do Booking,
que só mostra as descrições depois de escolheres datas (ver `quartos.md` em
`references/campos.md`). Um texto truncado não conta como recolhido.

Recolhe com o mesmo cuidado, lado a lado, sem ordenar uma acima da outra:
- **A voz do próprio AL** — descrição do anúncio, texto do site, o que ele
  publica nas redes sociais — vai para `descricao-al.md`
- **As reviews dos hóspedes** — o máximo que conseguires reunir, não só uma
  amostra, **com o texto completo de cada uma** (não só a nota e a primeira
  linha: o sumo costuma estar no meio da review) — vão para `reviews.md`
- **Factos objetivos** (morada, comodidades, horários, capacidade, políticas)
  — para `factos.md`, com uma secção "Espaços" (cada espaço que a casa tem,
  dentro e fora) e uma secção "Arredores" no fim para tudo o que diz
  respeito à zona
- **Os quartos e unidades** — uma ficha por cada tipo que a casa vende no
  Booking (a fonte principal para os quartos), com tudo o que o Booking diz
  dele, mais o que as outras fontes acrescentam — para `quartos.md`. Sem uma
  ficha completa por tipo, o dossiê não está terminado: o site precisa disto
  para mostrar os quartos em vez de mandar o visitante para o Booking
- **Dados de conformidade legal** (RNAL ou RNET, seguro, livro de
  reclamações) — para `compliance.md`
- **Canais** — o link de cada plataforma, a nota média e o número de reviews
  de cada uma, e onde se reserva — para `canais.md`

Salvo indicação em contrário na fase 0, recolhe também o **material de
marketing**. Ler `references/marketing.md` antes de começar esta parte:
- **Textos de marketing** — os textos publicitários tal como a casa os
  publica: títulos e subtítulos dos anúncios, descrições de cada quarto,
  listas de destaques, textos das secções do site próprio, a bio e as
  legendas das redes sociais. Copiados à letra, nunca reescritos — vão para
  `marketing/textos.md`
- **Fotografias** — **todas** as fotos que a própria casa publicou, em todas
  as plataformas, sem filtrar por tamanho nem qualidade, com a contagem de
  cada galeria conferida — vão para `marketing/fotos/`, com o índice em
  `marketing/fotos.md`. Só entram fotos que sabes que foram publicadas pela
  casa: fotos de hóspedes e fotos sem autor confirmado ficam de fora.

A diferença entre `descricao-al.md` e `marketing/textos.md`: a primeira
resume e cita a voz do AL para quem estuda a casa; a segunda guarda os textos
publicitários completos, prontos a serem consultados por quem monta o site.

Antes de recolher, lê também `references/recolha-e-cobertura.md` e cria o
inventário de páginas, galerias, unidades e pesquisas a percorrer. Regista em
`fontes.md` a superfície, filtros, datas e ocupação. Cada percurso termina com
um registo de `cobertura` no contrato, inclusive quando estiver bloqueado ou
não encontrar resultado.

### 3 — Cruzamento e validação

Vem antes de "O que encanta" de propósito: os pontos fortes escrevem-se já a
saber o que está em conflito e o que já não é verdade.

Confirma entidade e âmbito de cada anúncio: uma casa inteira, um tipo de quarto
e uma tarifa de uma pesquisa não são intercambiáveis. Mantém disponibilidade,
inventário e políticas em afirmações separadas no contrato.

Junta o que várias fontes confirmam, identifica contradições entre fontes
(ex.: horário de check-in diferente no Booking e no Airbnb) e marca-as
`[A_VERIFICAR]` em vez de escolher uma ao acaso.

**Verifica também o que pode ter deixado de ser verdade.** Eventos,
serviços, prémios, pessoas e rotinas mudam: concertos, jantares, a
governanta, "o dono recebe pessoalmente", uma distinção de um guia sem data.
Para cada um, regista a data da prova mais recente. Se essa prova tiver mais
de 2 anos, ou se houver uma só menção, marca-o `antigo` ou `uma menção` e
põe-no em "Por confirmar com o dono". Não o apagues: marca-o.

Se recolheste um número de registo (RNAL ou RNET), cruza-o também com o
registo público do Registo Nacional de Turismo — ver "Cruzar o registo com o
RNT" em `references/campos.md`. É a única fonte nesta skill que é externa às
próprias plataformas onde o AL está anunciado, por isso vale a pena tratá-la
como verificação independente, não só mais uma plataforma a listar.

### 4 — O que encanta nesta casa

**Esta é a fase mais importante do dossiê. Não é opcional.**

Com as reviews completas e os textos da casa à frente, lê tudo à procura do
que torna a casa desejável e escreve `pontos-fortes.md`. Ler
`references/mineracao-reviews.md` antes de começar: tem o método de leitura,
como medir a força de cada ponto, como escolher as citações e o formato do
ficheiro.

Resumo do que tem de sair desta fase:

| Secção de `pontos-fortes.md` | O que é |
|---|---|
| Em uma frase | O que faz esta casa desejável, numa frase, com base em tudo o que segue |
| Pontos fortes | Ordenados do mais forte para o mais fraco, cada um com a força medida, se ainda é atual, 2 a 4 das melhores citações e o que a própria casa diz sobre isso |
| Momentos que os hóspedes contam | Cenas concretas agrupadas por experiência; hora e estação só quando sustentadas e relevantes. Não predefine uma narrativa diária para o site. |
| Sensações | O que os hóspedes dizem que sentiram |
| Detalhes que só esta casa tem | O que não se encontra na casa ao lado |
| Quem recebe | O que dizem dos anfitriões |
| Para quem é | Que tipo de hóspede mais elogia a casa, e porquê |
| Frases com força | As frases mais vivas, da casa e dos hóspedes, à letra e com fonte |
| Pontos de atrito | As queixas que se repetem, com a força medida |

**Rigor que não se negocia:** cada afirmação tem de estar apoiada em
citações reais, com fonte. Um ponto forte é sempre `[INFERIDO]` (a síntese é
tua), mas as citações que o provam são `[OPINIAO]` ou `[OFICIAL]`. Nunca
inventes um ponto forte nem exageres a força de um. Se a casa tiver poucas
reviews, faz a análise na mesma e diz que a evidência é fraca: poucas reviews
bem lidas continuam a ter sumo.

**Nunca deixes uma review contrariar a voz do próprio AL sem assinalar o
conflito.** Se o dono descreve a casa como "silenciosa e isolada" e uma
review se queixa de ruído, isso não se resolve a favor de nenhum dos dois —
regista os dois em `fontes.md` como `[A_VERIFICAR]`.

**Quando acabares, relê cada ponto forte, momento e detalhe único contra
`fontes.md` e contra a fase 3.** Se depende de um conflito ou de uma prova
`antiga` ou de `uma menção`, isso tem de estar escrito ao lado dele e não
pode subir para o resumo como se fosse certo. Foi assim que "o dono toca
piano" (uma review de ~2019) chegou ao resumo como um dos momentos mais
contados, e o site teve de o retirar em três rondas.

Para cada argumento e atrito, regista os IDs analisados, frequência,
intensidade, especificidade, atualidade, relevância, contraponto e duplicados
confirmados. Uma boa nota global não apaga uma queixa; uma frase repetida não
transforma testemunho em facto.

### 5 — O que o site pode dizer

Cria ou atualiza `contrato.json`, a ponte estruturada entre o dossiê e quem
monta o site. É a decisão única sobre cada afirmação: diz se a pode afirmar,
afirmar com condição, citar, usar só como inspiração ou não usar. Não escreve
os textos do site. O formato e as regras estão em `references/contrato.md`.

Depois gera `site-pronto.md` a partir do contrato. Não edites a vista à mão:
alterações na prova, no estado ou numa restrição fazem-se no contrato e voltam
a ser geradas.

Três grupos:
- **Afirmar** — facto confirmado no âmbito explícito e com atualidade revista.
- **Afirmar com condição** — facto confirmado, mas limitado a unidade, tarifa,
  data, ocupação ou outra condição escrita junto dele.
- **Citar** — promessa subjetiva da casa ou testemunho, sempre com palavras e
  autor da fonte.
- **Inspiração editorial** — pode orientar tom ou composição, sem criar
  serviço, rotina, horário ou garantia.
- **Não usar** — conflito, informação histórica, restrição ativa, material
  sem origem confirmada ou prova insuficiente.

### 6 — Organização em pastas

Grava tudo na estrutura descrita abaixo. Nos documentos de evidência, declara
origem, fonte e data. Não uses uma etiqueta única para tentar dizer ao mesmo
tempo quem publicou, se a informação está confirmada e se o site a pode usar:
esses campos vivem separados no contrato.

### 7 — Resumo final

Gera primeiro `site-pronto.md`, depois escreve `resumo.md` — o ponto de entrada
único do dossiê. Ninguém deve
precisar de abrir as outras pastas antes de ler este ficheiro. **Abre com o
que encanta, não com os factos**: quem ler o resumo tem de perceber em trinta
segundos porque é que alguém escolhe esta casa.

Mantém esta ordem entre dossiês de ALs diferentes, para quem adaptar o
template saber sempre onde procurar:

```
Material de marketing: textos <recolhidos | do dono>; fotos <recolhidas | do dono>

## Em uma frase
[o que torna esta casa desejável, e para quem]

## O que encanta
[os 3 a 5 pontos fortes mais fortes, cada um numa linha, com a melhor
citação e a força (ex.: "11 reviews em 3 plataformas, a mais recente de
2026")]
[os 2 ou 3 momentos mais contados — só os atuais; um momento `antigo` ou de
`uma menção` não entra aqui]
[as 3 frases com mais força: pelo menos uma da casa e uma de hóspede]

## O que o site pode dizer
[o essencial de site-pronto.md: as 3 a 5 afirmações mais fortes que o site
pode fazer como facto, e tudo o que está em "Não prometer"]

## A voz do próprio AL
[essencial de descricao-al.md — história, posicionamento, o que ele valoriza,
as imagens e promessas que usa]

## Quem recebe e para quem é
[o essencial das duas secções de pontos-fortes.md]

## Pontos de atrito
[as queixas que se repetem, com a força]

## Factos
[o essencial de factos.md e canais.md — tipo, capacidade, localização,
comodidades chave, nota média por plataforma, onde se reserva]
[quartos: a tabela curta do topo de quartos.md]

## Do dono
[o essencial de dono.md: o que enviou, o que pediu para tirar, as decisões
do utilizador; ou "nada recebido"]

## Material de marketing
[se recolhidas: total e por plataforma, e se a contagem de cada galeria
bateu certo; quantas fotos por espaço; que espaços ficaram sem foto ou só
com fotos pequenas — ex.: "casa de banho: nenhuma", "exterior: só de dia"]
[nota: as fotos recolhidas servem para a versão de demonstração; antes de
publicar o site definitivo, confirmar com o dono que podem ser usadas]

## Por confirmar
[tudo o que ficou em fontes.md como [A_VERIFICAR], e o que ficou marcado
`antigo` ou `uma menção` na fase 3]
```

### 8 — Validação final

O dossiê só está terminado quando passa nesta verificação. Primeiro o
script, que confere o que é mecânico:

```bash
python .claude/skills/al-dossier/scripts/gerar-site-pronto.py casas/<slug>/dossie
python .claude/skills/al-dossier/scripts/validar-dossie.py casas/<slug>/dossie --relatorio casas/<slug>/dossie/validacao.json
```

Confere que:
- os documentos obrigatórios têm conteúdo útil, cada ID é único e cada citação
  literal selecionada corresponde à review de origem;
- a tabela de contagens do topo de `reviews.md` bate com o número de
  reviews de cada secção;
- cada ficheiro listado em `marketing/fotos.md` existe no disco com a
  resolução indicada, e não há fotos no disco sem entrada no índice;
- cada quarto listado tem uma ficha com detalhe útil;
- quando existe `contrato.json`, o schema, as referências internas, os
  estados, as condições e as restrições são coerentes.

Corrige tudo o que o script apontar e corre-o outra vez até passar. Depois de
alterar qualquer ficheiro, o relatório anterior deixa de ser válido; confirma-o
com `--verificar-relatorio <dossie>/validacao.json`. Depois confirma à mão o
que o script não vê:
- [ ] A evidência pertence à mesma casa/unidade e sustenta a afirmação inteira.
- [ ] O texto não alarga uma tarifa, unidade ou testemunho a toda a casa.
- [ ] Nenhuma afirmação permitida contradiz uma restrição ou decisão ativa.
- [ ] Nenhum texto truncado ("Continuar a ler", "…" da plataforma) em
  `reviews.md`, `descricao-al.md` ou `marketing/textos.md`.
- [ ] O tipo de casa (AL, Turismo de Habitação…) e o concelho batem com o
  registo oficial.

Um dossiê sem contrato é legado e não alimenta uma nova base. Segue
[references/migracao.md](references/migracao.md) para o migrar e ensaiar a
passagem sem tocar no site existente.

---

## Organização do dossiê

```
casas/<slug>/dossie/
  contrato.json              → fonte de verdade estruturada para a construção:
                                entidades, provas, afirmações, citações,
                                ativos, decisões e cobertura
  resumo.md                    → ponto de entrada único: abre com o que
                                encanta
  pontos-fortes.md             → o que encanta nesta casa: pontos fortes com
                                força, atualidade, citações e fotos,
                                experiências, contexto temporal quando relevante, sensações,
                                detalhes únicos, quem recebe, para quem é,
                                frases com força, atrito
  site-pronto.md               → vista gerada do contrato: o que afirmar,
                                condicionar, citar ou não usar
  descricao-al.md              → a voz do próprio AL: o que ele diz de si
                                no anúncio, site e redes sociais
  reviews.md                   → contagens no topo; todas as reviews, por
                                plataforma, com texto completo, id, fonte,
                                data e nota; as citadas marcadas ★
  factos.md                    → morada, capacidade, horários,
                                comodidades, políticas, contactos, os
                                espaços da casa, e no fim os arredores
  quartos.md                   → uma ficha por tipo de quarto ou unidade,
                                com o Booking como fonte principal
  dono.md                      → material, pedidos e restrições do dono, e
                                decisões do utilizador sobre esta casa
  canais.md                    → todos os links, notas médias e
                                números de reviews por plataforma, e
                                onde se reserva
  compliance.md                → RNAL ou RNET, seguro, livro de
                                reclamações, placa identificativa
  fontes.md                    → todas as plataformas cruzadas, o
                                que bateu certo, o que não bateu e os
                                conflitos entre a voz do AL e as reviews
  marketing/                   → só quando recolhido (ver fase 0)
    textos.md                  → textos publicitários à letra,
                                por plataforma
    fotos.md                   → cobertura por plataforma e índice
                                das fotos por pasta: ficheiro, espaço,
                                legenda, galeria, quarto (só se certo),
                                orientação, resolução, qualidade, se
                                aguenta hero, fonte
    fotos/                     → todas as fotos publicadas pela casa
      interior/                → dentro de portas
      exterior/                → fora de portas, dentro da propriedade
      <outra>/                 → só se a casa tiver um grupo próprio
                                (ex.: arte/, mesa/, marca/)
    provas/                    → capturas de ecrã que provam a autoria de
                                um texto ou um facto disputado (ex.: o
                                bloco do Booking que a casa preenche)
```

---

## Erros a evitar

Cada um destes é um cuidado real, não uma hipótese.

### Entregar um dossiê correto mas sem sumo

É o erro mais caro, porque parece trabalho bem feito. Sinais: `pontos-fortes.md`
com dois ou três temas genéricos ("boa localização", "anfitriões simpáticos")
e uma citação cada; nenhum momento concreto; nenhuma frase com força; um
resumo que abre com a morada e as comodidades. Se o teu dossiê tem estes
sinais, volta às reviews completas e relê-as com as lentes de
`references/mineracao-reviews.md`.

### Nomear os pontos fortes com palavras genéricas

"Localização", "conforto" e "limpeza" não dizem nada a quem vai escolher.
Nomeia cada ponto forte com o que os hóspedes realmente descrevem: não
"localização", mas "a praia a cinco minutos a pé, sem precisar de carro".

### Inventar ou inflacionar o encanto

O oposto também é um erro. Um ponto forte sem citações que o provem não
entra. Uma menção isolada não passa a "muitos hóspedes". A força escreve-se
com números reais (quantas reviews, que plataformas).

Números reais são reviews lidas e confirmadas, não resultados de uma
pesquisa por palavra. "Jardim" aparece em reviews que só dizem "o quarto dá
para o jardim". Uma contagem automática serve para encontrar candidatas; o
número que se escreve é o das que tu leste e que falam mesmo do ponto.

### Apresentar como atual o que já não acontece

Um concerto de 2018, uma governanta que saiu, um guia sem data: se entram
no resumo como se fossem de hoje, o site promete o que o hóspede não vai
encontrar. Cada ponto forte, momento e detalhe único leva a data da prova
mais recente (ver fase 3).

### Tomar o texto da plataforma pela voz da casa

Booking, TripAdvisor e Airbnb escrevem resumos automáticos ("piscina
infinita", "lar longe de casa") ao lado do texto que a casa escreveu. Só é
`[OFICIAL]` o que está num bloco que a casa preenche. Na dúvida,
`[PLATAFORMA]`, e nunca como frase com força da casa.

### Deixar as reviews contrariar ou apagar a voz do próprio AL

As reviews importam muito, sobretudo para convencer quem ainda não conhece a
casa — mas nunca substituem nem desautorizam o que o próprio AL diz de si.
Quando entram em conflito, regista os dois lados como `[A_VERIFICAR]`; não
decidas qual "está certo".

### Preferir o elogio genérico à observação concreta

Entre duas citações sobre o mesmo tema, escolhe sempre a mais específica e
viva — "a vista da varanda ao pôr-do-sol" diz mais do que "adorei tudo".

### Esconder padrões de queixas recorrentes

Se notares o mesmo problema a repetir-se em várias reviews, regista-o nos
pontos de atrito com a força medida. Quem monta o site precisa de saber o que
evitar prometer.

### Ler só a primeira linha das reviews

O início de uma review costuma ser genérico ("Estadia fantástica!"). Os
momentos e os detalhes estão no meio. Recolhe e lê o texto completo.

### Deitar fora reviews noutras línguas

Uma casa em Portugal tem muitas reviews em inglês, francês, espanhol e
alemão. Lê-as todas. Nas citações escolhidas, guarda o original e acrescenta
a tradução marcada como `[INFERIDO]`.

### Assumir que o primeiro resultado com o nome certo é o AL certo

Nomes de AL repetem-se muito entre concelhos. Confirmar morada e telefone
antes de recolher seja o que for dessa fonte — ver `references/identidade.md`.

### Parafrasear e etiquetar como oficial

`[OFICIAL]` só se aplica a citação ou paráfrase fiel do que o AL escreveu.
No momento em que reformulas com as tuas palavras, deixa de ser um facto
sobre o que o AL disse e passa a ser `[INFERIDO]`.

### Tratar reviews muito parecidas entre si como confirmação independente

Um conjunto de reviews com a mesma estrutura de frase, publicadas em rajada,
é mais provável ser review incentivada ou fabricada do que sinal genuíno —
conta-as como uma só ao medir a força de um ponto forte.

### Guardar fotografias de outra casa

Uma galeria de uma plataforma só entra no dossiê depois de a identidade
dessa fonte estar confirmada (fase 1). Anúncios agregados e resultados de
pesquisa de imagens misturam casas vizinhas com nomes parecidos.

### Reescrever os textos de marketing

`marketing/textos.md` guarda os textos exatamente como a casa os publica,
com erros e tudo. Melhorar ou traduzir é trabalho de quem monta o site, e
fazê-lo aqui apaga a prova do que o dono escreveu.

### Deixar fotos da casa por recolher

Aconteceu na Casa de Fataunços: havia fotos no Booking que não chegaram ao
dossiê, e ninguém deu por isso. Ficar pelas fotos que aparecem na página do
anúncio, saltar as galerias dos quartos, não percorrer a galeria até ao fim,
ou deixar fotos de fora por serem pequenas — tudo isto deixa buracos. Abre a
galeria completa de cada plataforma, confere a contagem e regista-a em
`fotos.md` (ver `references/marketing.md`).

### Guardar a miniatura em vez da foto

As plataformas mostram miniaturas pequenas nas galerias. Guarda a maior
versão que a plataforma servir e regista a resolução real no índice. Uma
foto pequena guarda-se na mesma.

### Escolher informação em vez de marcar o conflito

Quando duas fontes discordam, marca `[A_VERIFICAR]` com as duas versões e a
fonte de cada uma — decidir qual está certa não é trabalho desta skill.

---

## Quando ler cada referência

| Ficheiro | Ler quando |
|---|---|
| `references/identidade.md` | **sempre**, antes da fase 1 — como confirmar que é o mesmo AL entre plataformas |
| `references/proveniencia.md` | **sempre**, antes de classificar a primeira frase — as regras de `[OFICIAL]` / `[PLATAFORMA]` / `[OPINIAO]` / `[INFERIDO]` / `[A_VERIFICAR]` |
| `references/contrato.md` | antes da fase 5 e sempre que entra nova prova, restrição ou decisão — como criar a passagem validável para a construção |
| `references/recolha-e-cobertura.md` | antes da fase 2 e numa recolha retomada — como planear a superfície, declarar lacunas e produzir evidência com entidade e âmbito |
| `references/marketing.md` | antes de recolher textos de marketing ou fotografias — o que recolher, como encontrar a maior resolução, como nomear e indexar |
| `references/mineracao-reviews.md` | **sempre**, antes da fase 4 — o método para encontrar o que encanta, medir a força e a atualidade, escolher as citações, e o formato de `pontos-fortes.md` |
| `references/campos.md` | ao preencher `factos.md`, `quartos.md`, `dono.md`, `canais.md`, `descricao-al.md`, `reviews.md` ou `compliance.md` — checklist e organização de cada ficheiro; explica também a vista gerada `site-pronto.md` |
| `scripts/validar-dossie.py` | **sempre**, na fase 8 — a verificação mecânica do dossiê |
