# Classificar a proveniência de cada facto

Isto é o núcleo da skill. Um dossiê sem proveniência clara obriga quem o usa
depois a verificar tudo outra vez à mão — o que anula o propósito de o teres
feito. A mesma disciplina de proveniência aplica-se a tudo o que se regista,
incluindo os textos de marketing e as fotografias (ver `marketing.md`): cada
um leva a fonte exata e a data de recolha.

## O que a proveniência responde — e o que não responde

Proveniência responde **quem publicou ou disse** algo. Não decide, sozinha, se
a informação continua atual, se está confirmada ou se a landing page a pode
prometer. Esses campos são guardados separadamente em `contrato.json`; ler
`contrato.md` ao preparar a passagem para a construção.

Nos documentos de evidência podes continuar a usar as etiquetas abaixo para
tornar a origem legível. `A_VERIFICAR` é uma nota de estado, não uma origem.

## Etiquetas de origem

### `[OFICIAL]`
Vem de um canal controlado pelo próprio AL: o site próprio, as redes sociais
geridas por ele, ou texto que ele mesmo submeteu numa plataforma (descrição
escrita por ele). Regista sempre a fonte exata e a data de recolha.

Numa plataforma, o texto só é `[OFICIAL]` se estiver num bloco que a casa
preenche. Regista **em que bloco** o encontraste, não só a plataforma:

| Plataforma | Blocos da casa (`[OFICIAL]`) | Blocos da plataforma (`[PLATAFORMA]`) |
|---|---|---|
| Booking | perfil do anfitrião ("Gerido por …": informação do alojamento, sobre a empresa, área circundante), "Informações importantes", descrições dos quartos | a descrição principal com títulos ("Ambiente Histórico:", "Atrações Locais:"), "O que os hóspedes adoram", distâncias calculadas |
| Airbnb | título, descrição, "O espaço", "Acesso dos hóspedes", "Outras notas" | destaques ("Um dos poucos espaços com piscina na região"), "Favorito dos hóspedes" |
| TripAdvisor | só se o perfil foi reclamado pelo dono | a descrição de um perfil não reclamado |
| Google Maps | descrição "Do proprietário" | resumos e destaques gerados |

Quando a autoria de um texto que vai ser usado como voz da casa não for
óbvia, tira uma captura de ecrã do bloco e guarda-a em
`marketing/provas/<plataforma>-<bloco>-<data>.png`. Cita a captura ao lado
do texto. Na Fataunços, a frase de apresentação só foi confirmada como sendo
do dono um dia depois, e pelo meio o site atribuiu-a a quem não era.

### `[PLATAFORMA]`
Texto escrito pela própria plataforma, não pela casa nem por um hóspede:
resumos automáticos, destaques, selos, distâncias calculadas. Guarda-se para
referência e pode servir de pista, mas **não é a voz da casa** e nunca entra
como frase com força nem como facto sem outra fonte. Um "piscina infinita"
num resumo automático não prova que a piscina é infinita.

### `[OPINIAO]`
Vem de terceiros: avaliações de hóspedes, citações em fóruns, comentários em
redes sociais que não são do AL. Mesmo quando soa factual ("tem 4 quartos e
piscina aquecida"), uma frase escrita por um hóspede é opinião/testemunho,
não facto verificado — regista-a em `reviews.md`, nunca em `factos.md`. Tão
importante como `[OFICIAL]`, nunca uma substituta — quando as duas
discordam, ver `[A_VERIFICAR]` abaixo.

### `[INFERIDO]`
Uma conclusão a que chegaste tu, a partir de padrões — nunca uma afirmação
que alguém fez. Exemplos: "parece vocacionado para famílias" a partir do
número e tipo de quartos; "aposta em hóspedes de longa duração" a partir da
política de cancelamento. Um ponto forte minerado de várias reviews
independentes (ver `mineracao-reviews.md`) também é `[INFERIDO]` — a
inferência é tua, mesmo que sustentada em `[OPINIAO]` de terceiros. Tem de
ficar claramente marcado como inferência — nunca reescrito depois como se
fosse facto confirmado.

### `[TERCEIROS]`

Material de um portal, guia, imprensa, parceiro ou qualquer fonte que não é a
casa, hóspede, plataforma que gera o texto nem registo público. Conserva-se
com origem e data. Pode corroborar uma pista, mas não ganha automaticamente o
direito de ser uma promessa da casa.

### `[A_VERIFICAR]`
Duas fontes discordam, ou uma fonte não pôde ser confirmada como sendo sobre
o mesmo AL (ver `identidade.md`), ou a informação existe mas não dá para
confirmar a origem. Não escolhas uma versão para "resolver" o conflito —
regista as duas com as respetivas fontes.

## Formato de cada entrada

Cada afirmação nos documentos de texto leva etiqueta, fonte e data:

```
[OFICIAL] "Casa restaurada em 2019, a 5 min a pé da praia."
  — Booking, perfil do anfitrião ("Informação do alojamento"), recolhido
    2026-09-15; prova: marketing/provas/booking-perfil-2026-09-15.png

[PLATAFORMA] "Os hóspedes podem desfrutar de uma piscina infinita."
  — Booking, descrição principal gerada pela plataforma, recolhido 2026-09-15

[OPINIAO] "O pequeno-almoço foi o ponto alto da estadia."
  — G-012, review de Marta no Google Maps, ~2024, nota 5, recolhido
    2026-09-15

[INFERIDO] Parece orientado a casais — os dois quartos disponíveis são
  ambos de casal, sem opção de cama extra ou beliche.
```

No contrato, a mesma informação fica repartida assim: `origem` (`casa`,
`hospede`, `plataforma`, `registo_publico` ou `terceiro`), `natureza`
(`facto`, `testemunho`, `promessa_subjetiva`, `metrica` ou `inferencia`),
`estado` e `uso`. Uma afirmação publicada pela casa pode continuar histórica;
uma opinião recente continua a ser testemunho; uma métrica da plataforma pode
ser mostrada com fonte, escala e data sem se tornar voz da casa.

## Cuidado legal a ter presente durante a recolha

**Termos de serviço das plataformas**: Booking e Airbnb proíbem recolha
automatizada nos seus termos. Navegar páginas públicas como uma pessoa
navegaria (via browser, sem login, sem endpoints privados) é a única forma
aceitável de recolha aqui — nada de scripts a martelar pedidos em massa.
Guardar uma a uma as fotos de uma galeria que abriste no browser não é
recolha em massa: é o que uma pessoa faz, e é obrigatório recolhê-las todas
(ver `marketing.md`).
