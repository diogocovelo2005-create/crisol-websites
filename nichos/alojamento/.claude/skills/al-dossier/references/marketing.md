# Recolher textos de marketing e fotografias

Lê isto antes de recolher o material de marketing da casa. Só recolhes a
parte que a fase 0 decidiu (por defeito, as duas).

A regra de sempre mantém-se: **só de fontes cuja identidade está confirmada**
(fase 1, `identidade.md`), e **navegando como uma pessoa navegaria**, página a
página, sem login, sem endpoints privados e sem scripts a fazer pedidos em
massa (ver o cuidado legal em `proveniencia.md`).

Antes de descarregar ou indexar, lê `recolha-e-cobertura.md`: declara a galeria
ou página percorrida, a entidade a que o material se refere e a cobertura que
conseguiste. Uma foto publicada por uma casa não fica automaticamente atribuída
a um quarto por aparecer na mesma galeria.

---

## 1. Textos de marketing

### O que recolher

Os textos publicitários que a casa publica, **à letra**:

| Onde | O quê |
|---|---|
| Booking | Título do anúncio; os blocos do perfil do anfitrião ("Informação do alojamento", "Informação sobre a empresa", "Informação da área circundante"); "Informações importantes"; a descrição de cada tipo de quarto (só aparece depois de escolher datas, ver `quartos.md` em `campos.md`). A descrição principal com títulos é gerada pelo Booking: guarda-a como `[PLATAFORMA]` (ver `proveniencia.md`) |
| Airbnb | Título, descrição completa (incluindo "o espaço", "acesso dos hóspedes", "outras notas"), descrições dos quartos |
| Site próprio | O texto de cada secção e página: títulos, subtítulos, parágrafos, nomes dos quartos, legendas |
| Instagram, Facebook | A bio e todas as legendas publicadas pelo alojamento. As de promoções pontuais (descontos, datas especiais) também, marcadas como `promoção` |
| Google Maps | A descrição do perfil, se foi escrita pelo alojamento |
| Qualquer outra plataforma onde a casa se apresente | O que lá estiver escrito pelo alojamento |

Recolhe tudo. Nada fica de fora por parecer pouco útil: quem monta o site é
que decide. O que não é texto de marketing não se perde, **muda de pasta**:
reviews vão para `reviews.md`, factos soltos como horários vão para
`factos.md`, respostas do dono a reviews vão para `reviews.md` junto da review
respondida.

### Formato de `marketing/textos.md`

Um bloco por texto, agrupado por plataforma. O texto fica exatamente como
publicado: mesma pontuação, mesmos erros, mesmas quebras de linha.

```markdown
# Textos de marketing: <nome do AL>

## Site próprio (https://…)

### Página inicial, título principal
[OFICIAL] recolhido 2026-09-16
> Uma casa de pedra no coração da serra

### Página inicial, texto de apresentação
[OFICIAL] recolhido 2026-09-16
> A Casa do Vale nasceu da vontade de …

## Booking (https://…)

### Título do anúncio
[OFICIAL] recolhido 2026-09-16
> Casa do Vale - Turismo Rural

### Quarto Duplo com Vista
[OFICIAL] recolhido 2026-09-16
> Este quarto duplo dispõe de …
```

Se o mesmo texto aparece em várias plataformas, guarda-o uma vez e indica
todas as fontes. Se aparece com diferenças, guarda as duas versões.

---

## 2. Fotografias

### O que recolher

**Todas as fotos que a própria casa publicou, em todas as plataformas onde
ela se anuncia.** Todas, não uma seleção: nem a qualidade, nem o tamanho,
nem o tema da foto são razão para a deixar de fora. Quem monta o site é que
escolhe.

**O critério é um só: a foto entra quando sabes que foi a casa que a
publicou.** Não interessa o nome da plataforma, interessa quem pôs lá a foto.
Sabes que foi a casa quando:
- **o canal é da casa:** o site próprio (todas as páginas, incluindo fundos
  e cabeçalhos) e as redes sociais da própria casa;
- **é um anúncio que a casa gere:** a galeria de um anúncio onde a casa se
  vende e recebe reservas (Booking, Airbnb, Vrbo, Expedia e semelhantes),
  incluindo as galerias de cada quarto, que são separadas da principal;
- **a plataforma diz que foi a casa:** separadores ou etiquetas como "Do
  proprietário", "Fotos da gestão", "fornecido pelo alojamento". Numa
  plataforma que mistura fotos da casa e de hóspedes (Google Maps,
  TripAdvisor), só entram as que têm essa etiqueta.

**Não entram:**
- fotos de hóspedes, em qualquer plataforma;
- fotos cuja autoria não consegues confirmar. Comparadores e agregadores
  (trivago, Kayak, Google Hotels e semelhantes) mostram fotos vindas de
  outros sites sem dizer de quem são: usa-os só para **descobrir** anúncios
  da casa que ainda não conhecias, e recolhe as fotos nesses anúncios. O
  mesmo para fichas de portais, guias e artigos: só entram se a página disser
  que as fotos são da casa;
- fotos de outras casas, mesmo que próximas ou com nome parecido.

Na dúvida sobre quem publicou, não guardes: regista em `fotos.md`, na
tabela de cobertura, a plataforma e porque ficou de fora.

Todas as fotos recolhidas ficam em `marketing/fotos/` com a etiqueta
`[OFICIAL]`.

### Ter a certeza de que não falta nenhuma

É aqui que a recolha falha sem dar sinal. Para cada plataforma:

1. **Abre a galeria completa** ("Ver todas as fotos", "Mostrar todas as
   fotos", o separador do proprietário), não só as que aparecem na página
   do anúncio. Percorre-a até ao fim: muitas galerias carregam mais fotos à
   medida que desces.
2. **Abre a galeria de cada quarto** no Booking e no Airbnb.
3. **Anota quantas fotos a plataforma diz ter** (quase todas mostram o
   total, ex.: "42 fotos"). Se não mostrar, conta-as.
4. **Lê os endereços de todas as imagens** da galeria aberta no browser (com
   o Playwright, a partir do `src`/`srcset` dos elementos) e descarrega-os
   um a um. Isto é o que uma pessoa faria a guardar foto a foto; não é
   recolha em massa.
5. **Confere no fim:** fotos guardadas + duplicados de outra plataforma =
   total da galeria. Se não bater, a plataforma não está feita.

Regista o resultado em `fotos.md`, na tabela "Cobertura por plataforma". Uma
plataforma onde não conseguiste abrir a galeria fica lá escrita, com o
motivo: nunca desaparece em silêncio.

### Tamanho

O tamanho não decide se uma foto entra. Guarda sempre, e usa a maior versão
que a plataforma servir sem esforço: abre a foto em ecrã inteiro, ou, quando
o tamanho está no endereço (ex.: `max1024x768`, `im_w=720`), pede um maior e
confirma que veio mesmo maior. Regista a resolução real no índice, para quem
monta o site saber o que aguenta um ecrã grande.

### Duplicados

A mesma foto aparece em várias plataformas. Quando é **a mesma imagem**,
guarda uma vez, na maior versão, e indica no índice as outras plataformas
onde aparece. Quando for só parecida (outro ângulo, outra luz, outro corte),
não é duplicado: guarda as duas. Na dúvida, guarda as duas.

### Pastas

Dentro de `marketing/fotos/`, organiza as fotos em pastas, **uma por zona
da casa**. Há sempre duas:

- `interior/` — tudo o que é dentro de portas: quartos, salas, cozinha,
  casas de banho, sala de refeições, corredores;
- `exterior/` — tudo o que é fora de portas mas dentro da propriedade:
  fachada, jardim, piscina, pátios, vistas tiradas da casa.

Cria outra pasta **só quando a casa tem um grupo de fotos que não é nem uma
coisa nem outra, e que conta algo próprio da casa**. Critérios:
- tem pelo menos 3 fotos, ou é algo que a casa trata como uma secção própria
  (uma galeria no site, um álbum nas redes);
- quem monta o site o usaria como bloco à parte, e não como mais um espaço da
  casa.

Exemplos do que pode justificar uma pasta: a coleção de arte que a casa
mostra numa galeria própria (`arte/`), a comida e o pequeno-almoço
fotografados como produto (`mesa/`), a região e as atividades que a casa
publica (`regiao/`), os logótipos e selos (`marca/`), uma unidade separada
com várias fotos (`villa/`). Uma foto sozinha de um tema não abre pasta: vai
para `interior/` ou `exterior/`.

As pastas criadas e o porquê ficam no topo de `fotos.md`, numa linha cada.

### Nomes

Dentro de cada pasta, cada foto chama-se pelo espaço que mostra:

```
<espaco>-<nn>.jpg
```

Espaços a usar (usa o mais próximo; cria outro só se nenhum servir):
`fachada`, `quarto`, `sala`, `cozinha`, `casa-de-banho`, `refeicoes`,
`piscina`, `jardim`, `vista`, `regiao`, `detalhe`.

Exemplos: `exterior/fachada-01.jpg`, `interior/quarto-03.jpg`,
`exterior/vista-01.jpg`.

Os nomes dos ficheiros e a pasta não dizem de que quarto é a foto: isso só
vai no índice, e só quando é certo (ver "Fotos de cada quarto", abaixo).

### Fotos de cada quarto

Associar uma foto a um quarto concreto é difícil: no Booking, a galeria de um
tipo de quarto mostra muitas vezes fotos de outros quartos, ou fotos comuns
à casa. Por isso:

- **Estar na galeria de um quarto não prova que a foto é desse quarto.**
  Regista no índice em que galeria apareceu (coluna "Galeria onde
  aparece"), mas não a atribuas ao quarto só por isso.
- **Atribui a foto a um quarto só quando é certo:** a legenda diz o nome do
  quarto (ex.: "Quarto Mimosa" no site), o dono o disse, ou a foto aparece
  **só** na galeria desse quarto e em nenhuma outra. Regista na coluna
  "Quarto" e diz porquê (ex.: "legenda do site").
- Quando não é certo, a coluna "Quarto" fica vazia. Uma foto de quarto sem
  quarto atribuído continua a ser útil: mostra como são os quartos da casa.

### Formato de `marketing/fotos.md`

```markdown
# Fotografias: <nome do AL>

Recolhidas para a versão de demonstração do site. Antes de publicar o site
definitivo, confirmar com o dono que podem ser usadas.

## Cobertura por plataforma

| Plataforma | Link da galeria | Fotos na galeria | Guardadas | Duplicados de outra plataforma | Em falta e porquê |
|---|---|---|---|---|---|
| Booking | https://… | 38 | 30 | 8 | — |
| Airbnb | https://… | 25 | 6 | 19 | — |
| Google Maps (Do proprietário) | https://… | 12 | 4 | 8 | — |
| Expedia | — | — | — | — | galeria não abre sem sessão |
| trivago | https://… | 40 | 0 | — | comparador, fotos sem autor indicado; usado só para encontrar anúncios |

## Pastas
- `interior/`, `exterior/`
- `arte/` — a casa tem uma galeria "Obras de arte" no site, com 10 peças

## Interior (`interior/`)

| Ficheiro | Espaço | O que mostra | Legenda da casa | Galeria onde aparece | Quarto | Orientação | Resolução | Qualidade | Aguenta hero? | Fonte principal | Também em | Marcas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| interior/quarto-01.jpg | quarto | Cama de casal, janela para o jardim | — | Booking: Quarto Duplo, Quarto Twin | — | vertical | 683×1024 | boa | não: vertical e pequena | Booking, recolhido 2026-09-16 | Airbnb | |
| interior/quarto-02.jpg | quarto | Quarto com colcha florida | "Quarto Mimosa" | site | Mimosa (legenda do site) | horizontal | 829×553 | escura | não: pequena | site, recolhido 2026-09-16 | | |

## Exterior (`exterior/`)

| … mesmas colunas … |

## Arte (`arte/`)

| … mesmas colunas … |

## Espaços sem fotografia
- <ex.: casa-de-banho: nenhuma encontrada>
```

Colunas:
- **Ficheiro:** o caminho a partir de `marketing/fotos/`, com a pasta
  (`interior/quarto-01.jpg`). O script da validação final confere que cada
  ficheiro existe com a resolução indicada, e que não há fotos no disco fora
  do índice.
- **Legenda da casa:** a legenda ou o título que a casa deu à foto, à letra.
- **Galeria onde aparece:** as galerias em que a foto foi encontrada (a
  principal, a de um tipo de quarto, um álbum). Informa, não atribui.
- **Quarto:** só quando é certo, com o porquê (ver "Fotos de cada quarto").
- **Orientação:** horizontal, vertical, quadrada ou panorâmica.
- **Qualidade:** o que se vê na foto, não gosto: `boa`, ou os defeitos
  (`escura`, `desfocada`, `horizonte torto`, `sobreexposta`, `granulada`,
  `enquadramento cortado`). Olha para cada foto antes de preencher.
- **Aguenta hero?:** `sim` só se for horizontal, tiver pelo menos 1600 px de
  largura, for `boa` e mostrar a casa ou o que ela tem de mais forte (a
  fachada, o jardim, a vista). Senão, `não` e porquê. Não escolhe o hero:
  diz quais podem ser.
- **Marcas:** `pessoas` (pessoas são a parte principal da imagem) e `texto`
  (texto sobreposto, logótipo, moldura ou marca de água). Informam, não
  excluem. A marca `retirar (pedido do dono)` vem de `dono.md`: a foto fica
  guardada e marcada, não se apaga.

### No fim, avalia o conjunto

Escreve no `resumo.md` (secção "Material de marketing"):
- quantas fotos há no total e por plataforma, e se a cobertura bateu certo
  em todas;
- quantas fotos há por espaço;
- que espaços ficaram sem foto, e quais só têm fotos pequenas;
- se as fotos, no seu conjunto, chegam para um site (pelo menos: uma boa foto
  exterior, uma de quarto e uma de espaço comum ou vista) ou se é preciso
  pedir fotos ao dono;
- as fotos que aguentam hero;
- os pontos fortes que não têm nenhuma foto boa (ex.: "o jardim, o ponto
  mais elogiado, só tem fotos de 829 px"): são os primeiros a pedir ao dono.

### Fotos tratadas depois da recolha

Se alguém tratar uma foto depois (ampliar, corrigir a cor, rodar), a versão
tratada entra como um ficheiro novo, com a origem na coluna "Fonte principal"
(ex.: `tratada a partir de exterior/fachada-01.jpg`). **O original nunca se
apaga nem se substitui**, e confirma a resolução da versão tratada: um
ampliador pode devolvê-la mais pequena do que o original. Aconteceu na
Fataunços: duas fotos do dono com 3876 e 4080 px ficaram substituídas por
versões tratadas de 1608 e 1445 px, e o site usou as pequenas.
