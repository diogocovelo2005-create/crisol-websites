# A estrutura (BRIEF.md)

É o que o subagente `estrutura-alojamento` escreve antes dos protótipos, e a única fonte de texto
do site até ao fim. Diz **o que** a página conta e **porquê**, pela ordem
certa. Não diz nada sobre como a página se vê: a estética vem das
inspirações do Diogo.

Um site de uma casa não é uma montra de fotos: conta uma história, e a
sequência conta muito. A história depende sempre do que o dossiê tem.

## Lê, por esta ordem

1. `dossie/site-pronto.md`: o que se pode afirmar, com que condição, só
   citar, só inspirar, e o que não se usa.
2. `dossie/resumo.md` e `dossie/pontos-fortes.md`.
3. `dossie/quartos.md`, `dossie/descricao-al.md` (a voz da casa) e, se
   precisares, `dossie/factos.md`.
4. `dossie/fotos-descricao.json`: para escolher as fotos sem as abrir.
5. `.claude/skills/criar-base/references/correcoes.md`, as partes
   "Conteúdo" e "Fotografias": o que o Diogo já corrigiu noutras casas.

## 1. A história da casa

Antes das secções, escreve a história que o site vai contar, em 5 a 8
linhas: o que esta casa é, o que a torna diferente, o que um hóspede vai
sentir, e por que ordem isso se descobre. Tira-a do dossiê: do que a casa
diz de si, do que os hóspedes dizem, do que as fotos provam.

## 2. O guião

**É aqui que se define o storytelling do site.** O design dá-lhe forma e a
animação acompanha-o, mas a linha de raciocínio decide-se neste passo, e
tem de funcionar só com o texto.

O site conta-se como um percurso, pela ordem em que um hóspede descobre a
casa: chega, vê onde está, vive o dia, entra, descansa, olha à volta,
decide. Não é uma montra de fotos nem um documento por capítulos. O
princípio é **parecer um vídeo**, mas é um princípio, não um exagero: o
percurso tem momentos que andam e momentos parados, onde se lê e se olha.

Escreve o guião antes das secções, como lista numerada de momentos, um por
linha:

```markdown
## O guião

1. A chegada · plano largo · a casa inteira no seu lugar → e lá fora, o que há?
2. Lá fora · sequência · a piscina, o deck, a churrasqueira, um dia a passar → e quando apetece entrar?
3. …
```

Cada linha tem: o nome do momento, o **tipo** (plano largo, sequência,
pausa, pormenor, fecho), o que se descobre, e a pergunta que puxa o momento
seguinte (o `fecho` não a tem). O validador confere o formato.

A pergunta é **figurativa**: é o que o visitante fica a querer saber, não
uma pergunta escrita no site. No site ela aparece como a frase de passagem,
dita como convite. O efeito é que cada secção parece responder à anterior.

Regras do fio:

- **Uma linha de raciocínio fácil de seguir.** Cada momento é consequência
  do anterior e responde à pergunta que ele deixou. Se a ordem pudesse
  trocar sem perder nada, a sequência está mal pensada.
- **Nada a mais, nada a menos.** Um momento que não faz o percurso avançar
  sai. Um momento que o visitante precisa e o dossiê sustenta entra.
- **No máximo duas sequências** (momentos com vários tempos seguidos). O
  resto são planos, pausas e pormenores: é aí que a página respira.
- **Cada foto grande está num momento com texto.** Nenhum momento existe só
  para mostrar uma foto.
- O guião diz **o que se descobre e quando**, nunca como se vê: nada de
  efeitos, cores ou layout. Quem constrói decide a forma; quem dá movimento
  usa o guião para saber onde a história anda e onde para.

Cada secção do BRIEF corresponde a um ou mais momentos do guião, pela
mesma ordem.

## 3. As secções, pela ordem do guião

Cada secção é um passo da história. Nenhuma é obrigatória, exceto a abertura
e o contacto. Por defeito:

- **Quem recebe não tem secção própria.** Menciona-se onde ajuda (uma
  citação ou a nota de Funcionários junto da reserva).
- **À volta:** onde fica em duas linhas e depois 4 ou 5 atrações da região
  (`dossie/regiao/`), cada uma com a sua foto, o tempo de carro e uma frase.
  Só entra se o dossiê tiver a região.
- **Sem lista de regras práticas** (check-in, animais, fumar, estadias):
  isso fica nas plataformas de reserva.
- **No fim de cada secção, uma frase de passagem** que puxa a seguinte (a
  pergunta do guião, dita na voz do site).

**A secção 1 é o primeiro ecrã, que tem um formato fixo** (o mesmo em todas
as casas: uma fotografia panorâmica e ampla que defina a casa a ecrã
inteiro, o logótipo ou o nome no canto superior esquerdo, uma frase grande,
um texto curto e dois botões; o cabeçalho tem o nome à esquerda e as
páginas à direita). Os protótipos mostram-no com a pele de cada um, sem
mudar o formato. O texto dela
preenche os espaços desse formato, e mais nada:

- **Etiqueta:** tipo de casa e lugar, curto (ex.: "Turismo de Habitação ·
  Cinfães").
- **Título:** uma frase curta; a parte entre `*asteriscos*` sai em itálico.
- **Texto:** uma a duas frases.
- **Ação principal** (o primeiro botão) e o segundo botão, "Conhecer a casa".
- **Voz:** a frase do segundo tempo, da voz da casa (`descricao-al.md`) ou
  uma citação de hóspede com o nome e a plataforma. Sem voz que o contrato
  sustente, fica sem segundo tempo.
- **Foto:** uma que aguente ecrã inteiro (nota 4 ou mais, larga) e mostre
  a casa no seu lugar: a casa e o que a rodeia, não só um pormenor. Entra a secção que o dossiê sustenta e que faz a história
avançar; se não acrescenta nada às outras, não entra. Podes criar secções que
só esta casa justifica.

Para cada secção:
- **Porquê:** o que esta secção faz por quem visita e porque está neste
  ponto da sequência.
- **Na história:** que parte da história conta.
- **Conteúdo:** que tipo de conteúdo tem (ex.: "a história da casa em três
  parágrafos e uma citação", "os quatro tipos de quarto, cada um com quem
  cabe", "três opiniões de hóspedes e as notas das plataformas").
- **Texto:** o texto final, tirado do dossiê, com os IDs.
- **Fotos:** as que provam o que a secção diz.

Pergunta a cada foto: prova o que a secção promete? Uma mesa posta não prova
pequeno-almoço; uma foto de meio-dia não prova um fim de tarde.

## Escolhe as fotos

10 a 15, pelas descrições: `desejo` e `qualidade.nota` altos, a que melhor
prova cada secção, nada de duas quase iguais. As fotos com `largura_maxima_px`
baixa diz-lo na secção. Os protótipos podem usar menos fotos do que as que
atribuis, por isso diz também quais são fracas.

Logo a seguir à ação principal, escreve **uma nota sobre o material
fotográfico**, só com factos: quantas fotos aguentam ecrã inteiro, até onde
chega o resto, defeitos comuns (céus queimados, ruído, baixa resolução), a
estação e se há pessoas. Com fotos fracas, a página tem de assentar noutra
coisa, e quem constrói precisa de o saber. Depois:

```bash
python <skill>/scripts/preparar-fotos.py pacote casas/<slug> ATV-... ATV-...
```

## Escreve o texto

- Português de Portugal, na voz da casa (`descricao-al.md` e os textos de
  marketing dão o tom). Frases curtas e concretas, sem adjetivos de catálogo.
- **Com personalidade.** Simples não é sóbrio: títulos e frases com voz e
  calor, que dão vontade de lá estar. O texto é sobretudo **nosso**,
  inspirado no que as reviews repetem e nos textos que a casa e as
  plataformas já têm, sempre apoiado num facto do contrato com o ID.
- **Poucas citações: 4 a 5 no site todo**, as mais fortes, cada uma no
  sítio onde prova alguma coisa. Em português; **no máximo uma** noutra
  língua. As citações não enchem secções.
- **Nada pela negativa.** Não escrevas o que a casa não tem ou o que não se
  vê ("o rio não se vê"). Se o contrato proíbe afirmar uma coisa, ela não
  aparece, nem negada.
- Cada foto grande leva uma legenda, frase ou voz.
- **Só factos do contrato.** Os de "afirmar com condição" levam a condição
  no próprio texto. Os de "só citar" aparecem só como citação. Os de "não
  usar" não aparecem, nem sugeridos.
- No fim de cada frase factual, entre parênteses retos, os IDs que a
  sustentam: `[AFIR-CAPACIDADE]`. Os construtores recebem a instrução de não
  os mostrar.
- **Citações** numa linha própria, a começar por `>`, com aspas, autor,
  plataforma e ID. O verificador procura o texto entre aspas à letra no site:

  ```markdown
  > "Muito bem recebido pela anfitriã. Senti-me em casa." (Luis, Booking) [CIT-EM-CASA]
  ```

  Citações noutra língua levam a tradução do contrato na linha seguinte, a
  começar por `Tradução:`.
- Sem travessões longos. Números, telefones e emails escritos exatamente
  como devem aparecer: o verificador rejeita no site qualquer número que não
  esteja aqui.

## Não escrevas

Nada sobre estilo, cores, paleta, tipografia, animação, "registo visual" ou
o aspeto que a página deve ter. Isso estreita o caminho dos construtores e
tira o lugar às inspirações do Diogo.

## Forma do ficheiro

```markdown
# <Nome da casa>

## A história

<5 a 8 linhas>

## O guião

1. <momento> · <tipo> · <o que se descobre> → <a pergunta seguinte>
2. …

**Ação principal:** o que faz o botão e para onde leva (ex.: "Consultar
disponibilidade: telefone ou email, não há reserva online").

---

## 1. <Nome da secção>

**Porquê:** …
**Na história:** …
**Conteúdo:** …

**Texto:**
<títulos, parágrafos e listas, já finais, com os IDs>

**Fotos:** `fotos/<ficheiro>`, `fotos/<ficheiro>`

## 2. …
```

## Antes dos protótipos

```bash
python <skill>/scripts/validar-brief.py casas/<slug>
```

O script confere os IDs e o uso, as citações à letra com autor e plataforma,
os contactos, as fotos do pacote e os travessões, sem precisares de ler o
contrato. Corrige os erros até sair limpo. Depois, tu confirmas só o que
pede juízo:
- cada frase factual tem ID;
- cada condição da lista que o script imprime está no texto;
- os números que ele marcar como "sem rasto" vêm mesmo do dossiê;
- nenhuma foto promete o que não mostra;
- a sequência conta a história que escreveste no início e segue o guião;
- lido de seguida, cada momento responde à pergunta do anterior.

O validador avisa quando há mais de 5 citações, mais de uma estrangeira,
frases pela negativa ou uma secção dedicada a quem recebe. Cada aviso
corrige-se ou justifica-se numa linha no fim do BRIEF.
