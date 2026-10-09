# Checklist de campos por documento

Lista do que procurar em cada categoria, e em que documento do dossiê cada
coisa fica. Nem todo o AL vai ter resposta para tudo — um campo em falta fica
em falta, não se inventa para preencher a lista.

## `factos.md` — dados objetivos e verificáveis

- Nome comercial do AL
- Morada completa, e o concelho oficial (o do registo, não o da terra mais
  conhecida ao lado)
- Tipo de registo (Alojamento Local, Turismo de Habitação, Turismo Rural…)
  e tipo de alojamento (moradia inteira, apartamento, quartos, hostel, etc.)
- Número de quartos / capacidade máxima de hóspedes
- Horário de check-in / check-out
- Contactos (telefone, email) — de canais geridos pelo próprio AL
- Comodidades listadas (wifi, piscina, estacionamento, cozinha equipada,
  ar condicionado, acessibilidade, animais permitidos, etc.)
- Preço base ou faixa de preço, se estiver publicamente visível
- Coordenadas GPS (do Google Maps), para o mapa
- Nome dos anfitriões ou de quem recebe, se for público
- Idiomas falados
- Refeições: pequeno-almoço incluído ou não, e o que a casa diz dele;
  outras refeições disponíveis
- Políticas: cancelamento, animais, crianças (idades e preços de camas
  extra), festas e eventos, fumar, estadia mínima, depósito, formas de
  pagamento aceites (ex.: "só dinheiro" é coisa que o hóspede tem de saber)
- Época de funcionamento (aberto todo o ano ou sazonal)
- Atividades e experiências que a própria casa oferece ou sugere (passeios,
  provas, aulas, aluguer de bicicletas)
- Prémios, distinções e certificações (ex.: prémios de avaliação das
  plataformas, selos de turismo sustentável, selo Clean & Safe), com o ano

Os quartos não se detalham aqui: têm ficheiro próprio, `quartos.md`. Aqui
fica só o total de quartos e a capacidade da casa.

### Secção "Espaços"

Cada espaço que a casa tem, fora os quartos, numa tabela: salões, salas de
jogos, biblioteca, sala de refeições, cozinha partilhada, alpendre, varanda
envidraçada, jardim, piscina, campo de ténis, parque infantil, unidades
separadas (villa, casa de pedra), e o que mais houver. O site mostra a casa
espaço a espaço, e sem esta lista tem de a montar a partir de fontes
espalhadas.

```markdown
| Espaço | O que é e o que tem | Quem o menciona | Melhor foto | Aguenta hero? |
|---|---|---|---|---|
| Sala de bilhar | Bilhar, paredes de granito | [OFICIAL] site ("Billiard Room"); [OPINIAO] 12 reviews | interior/sala-06.jpg (829×622, fraca) | não |
| Villa de madeira | 2 quartos, cozinha, até 5 pessoas | [OFICIAL] Booking (tipo "Villa com 2 Quartos"); [OPINIAO] B-051, B-088 | nenhuma | — |
```

Um espaço sem foto, ou só com fotos fracas, vai também para a lista "A pedir
ao dono" do resumo.

### Secção "Arredores" (no fim de `factos.md`)

Tudo o que diz respeito à zona à volta da casa, junto num só sítio:

- O que a própria casa recomenda ou menciona (praias, trilhos, termas,
  restaurantes, aldeias, museus, eventos), à letra ou fielmente, `[OFICIAL]`
- Distâncias e tempos, só como a fonte os dá, nunca estimados — com a fonte
  (ex.: "3 km, site"; "28 km, calculado pelo Booking")
- Como se chega (estrada, estação, aeroporto mais próximo), se vier indicado
- O que os hóspedes dizem da zona, quando repetem algo concreto (ex.: "a
  ecopista a 3 minutos de bicicleta"), `[OPINIAO]` com fonte

## `quartos.md` — uma ficha por quarto ou unidade

**A fonte principal é o Booking.** Na tabela de disponibilidade do anúncio,
o Booking lista cada tipo de alojamento que a casa vende (ex.: "Quarto
Duplo", "Quarto Familiar", "Villa com 2 Quartos") e, ao abrir cada um, os
dados desse tipo. Um bloco por cada tipo do Booking; a seguir, um bloco para
cada unidade que só apareça noutra fonte (ex.: a casa inteira no Airbnb).
Se a casa não estiver no Booking, a fonte principal é o anúncio que tiver
mais detalhe por quarto.

**Sem datas, o Booking não mostra os quartos.** A página do anúncio só lista
os nomes dos tipos. As descrições, as camas, os m², as comodidades e os
preços só aparecem na tabela de disponibilidade, e essa só aparece depois de
escolheres datas. Faz assim:
1. Escolhe 2 noites a meio da semana, daqui a 3 a 6 semanas, para 2
   adultos. Abre a tabela.
2. Abre cada tipo (clica no nome) e copia tudo o que aparece.
3. Faz uma segunda pesquisa num fim de semana, e uma terceira para uma
   família (2 adultos e 2 crianças) se a casa tiver quartos familiares:
   alguns tipos só aparecem com essa ocupação ou nessas datas.
4. Se um tipo estiver esgotado em todas as datas tentadas, experimenta outras
   datas até o apanhar. Se não o conseguires, a ficha diz isso e as datas
   que tentaste: nunca fica vazia em silêncio.

Regista as datas e a ocupação pesquisadas no topo do ficheiro, porque os
preços dependem delas.

Em cada bloco, **tudo o que o Booking mostra sobre esse tipo**, à letra e
`[OFICIAL]`:
- nome do tipo, e quantas unidades desse tipo existem, se o diz;
- camas (número e tipo) e capacidade (adultos, crianças);
- área em m²;
- casa de banho (privativa, partilhada) e o que traz;
- vista, varanda, terraço;
- a lista de comodidades do quarto, completa;
- o texto de descrição do tipo;
- as condições que variam por quarto (pequeno-almoço incluído, cancelamento,
  preço visível com a data e as datas pesquisadas);
- as galerias de fotos do tipo: em que ficheiros de `marketing/fotos/` estão
  (lembrando que no Booking estas galerias misturam quartos, ver
  `marketing.md`).

Depois, o que as outras fontes acrescentam sobre esse quarto:
- os nomes próprios com que a casa chama os quartos noutros sítios (ex.:
  "Mimosa", "Girassol" no site). Liga um nome a um tipo do Booking só quando
  uma fonte o diga; senão, lista os nomes à parte, como `[A_VERIFICAR]`;
- o texto da casa sobre esse quarto noutras plataformas, à letra;
- o que os hóspedes dizem dele, quando o nomeiam (citação, fonte, id da
  review);
- as fotos atribuídas com certeza a esse quarto (ver "Fotos de cada quarto"
  em `marketing.md`), ou "nenhuma atribuída com certeza".

Começa o ficheiro por uma tabela curta, com um tipo por linha, e depois uma
ficha por tipo com o mesmo nome no título (`## Quarto Duplo`). O script da
validação final confere que cada linha da tabela tem a sua ficha:

```markdown
Pesquisado no Booking a 2026-09-19: 14–16/10/2026 (2 adultos),
18–20/10/2026 (2 adultos), 14–16/10/2026 (2 adultos + 2 crianças).

| Tipo (Booking) | Camas | Capacidade | m² | Preço visto |
|---|---|---|---|---|
| Quarto Duplo | 1 casal | 2 | 16 | 80 € (14–16/10, com pequeno-almoço) |
| Villa com 2 Quartos | 1 casal, 2 individuais, 1 beliche | 5 | 55 | 160 € (18–20/10) |

## Quarto Duplo
…
```

Se as fontes discordam do número de quartos, diz isso logo a seguir à
tabela, com as versões e as fontes.

## `dono.md` — o que veio do dono e do utilizador

Tudo o que não se encontra publicado mas decide o que se pode usar:

- Material enviado pelo dono (fotos, textos, documentos), com data e o que
  foi feito com ele
- Pedidos e restrições do dono, à letra (ex.: "retirar as fotos dos quartos
  com colcha"), com data e canal (email, telefone)
- O que o dono disse sobre a casa, o negócio ou o site, à letra
- Decisões do utilizador sobre esta casa (ex.: "usar só fotos do site e do
  dono"), com data
- Para cada restrição, que ficheiros do dossiê afeta; no índice de fotos, as
  fotos abrangidas ficam com a marca `retirar (pedido do dono)`, em vez de
  serem apagadas

Numa corrida repetida, lê `dono.md` antes de recolher: uma recolha nova não
pode trazer de volta, sem marca, o que o dono pediu para tirar. Se não
houver nada do dono, o ficheiro diz só "Nada recebido do dono até <data>".

## `canais.md` — onde a casa está e como se reserva

- O link de cada plataforma onde o AL está (Booking, Airbnb, Google Maps,
  TripAdvisor, site próprio, Instagram, Facebook, outras), com o nome exato
  da página ou do perfil
- Para cada plataforma com reviews: a nota média, a escala (ex.: 9,2 em 10,
  4,8 em 5) e o número total de reviews, com a data de recolha
- Onde se reserva: o link direto de reserva de cada canal, e se a casa tem
  reserva direta (motor próprio, formulário, WhatsApp, telefone)
- Contactos de mensagem publicados pelo AL (WhatsApp, Messenger), com a
  plataforma onde aparecem

## `descricao-al.md` — a voz do próprio AL

- Texto de apresentação tal como o AL o escreveu (citado ou parafraseado
  fielmente, nunca reescrito para soar melhor)
- Frases recorrentes que o AL usa em mais do que uma plataforma — sinal de
  que são mensagens que ele próprio valoriza
- Nome ou história do espaço, se o AL a contar (ex.: "casa de família
  restaurada", "antigo lagar")
- A promessa: o que a casa diz que o hóspede vai viver ou sentir
- As imagens e palavras sensoriais que a casa usa para se descrever (a luz,
  o silêncio, os cheiros, a vista, a comida)
- O que a casa diz de quem recebe (os anfitriões, a família, a história
  pessoal)
- As respostas do dono às reviews que revelem a sua voz ou confirmem
  detalhes

Tão importante como `reviews.md` — é a intenção do próprio dono, e nada nos
outros documentos deve ser apresentado como se a contrariasse sem assinalar
o conflito.

## `reviews.md` — o que os hóspedes disseram

- Todas as reviews recolhidas, com o **texto completo**, nota atribuída, data,
  plataforma de origem e língua — não só uma amostra, e não só a primeira
  linha
- Regista tudo aqui, mesmo observações que só apareçam uma vez — não é
  preciso um padrão para uma citação merecer ficar registada
- A resposta do dono, quando existir, junto da review respondida, **inteira**:
  clica em "Continuar a ler". Uma resposta truncada não conta como recolhida
- O **nome** do hóspede tal como a plataforma o mostra (ex.: "Rosa",
  "Pontus Modig"): o site mostra-o ao lado da citação

Cuidados por plataforma:
- **Booking:** cada review tem dois blocos, o que o hóspede gostou e o que
  não gostou. Guarda-os separados, com `Gostou:` e `Não gostou:`. Colados
  sem marca, uma queixa lê-se como elogio. Guarda também o tipo de quarto,
  as noites e o tipo de viajante, que o Booking mostra.
- **Google:** as datas são relativas ("há 4 anos"). Guarda a original e
  acrescenta o ano aproximado calculado a partir da data de recolha
  (`há 4 anos → ~2022`). Assinala as reviews que só existem na tradução
  automática da Google.
- **Reviews repetidas entre plataformas** (o Google importa reviews do
  TripAdvisor; há hóspedes que colam o mesmo texto em duas): guarda-as uma
  vez e indica as duas fontes.

Organização do ficheiro, para quem o abre saber onde está cada coisa:

- **No topo, uma tabela de contagens**, com uma linha por plataforma e
  estas colunas (o script da validação final lê-a):

  ```markdown
  | Plataforma | Prefixo | Recolhidas | Com texto | Total na plataforma |
  |---|---|---|---|---|
  | Booking | B | 235 | 140 | 236 |
  | Google | G | 63 | 63 | 128 |
  ```

  Por baixo, as contagens por língua e por ano.
- **Depois, as reviews agrupadas por plataforma**, da mais recente para a
  mais antiga. Cada uma começa por um título com o identificador, o nome e a
  nota: `### B-014 · Rosa (Portugal) — 10/10`. O identificador é o prefixo
  da plataforma e o número (`B-` Booking, `G-` Google, `A-` Airbnb, `T-`
  TripAdvisor).
- **As reviews citadas em `pontos-fortes.md` ou `site-pronto.md` levam
  `★ citada` no título** e, na linha seguinte, o ponto forte onde entram. As
  citações levam o mesmo identificador, para se chegar ao texto completo
  num passo.

No contrato, a cobertura de reviews declara o universo observado, o recolhido
e a limitação. Uma review parecida só é duplicado quando a relação fica
registada; suspeita de semelhança não reduz a contagem.

## `pontos-fortes.md` — o que encanta nesta casa

A parte mais importante do dossiê. O método, as lentes de leitura e o formato
completo estão em `mineracao-reviews.md`. Tem de ter:

- Em uma frase: o que torna a casa desejável `[INFERIDO]`
- Pontos fortes ordenados pela força, cada um com a força medida em números,
  se ainda é atual, 2 a 4 das melhores citações, o que a própria casa diz
  sobre isso e as fotos que o mostram
- Momentos que os hóspedes contam, agrupados pela experiência; hora apenas quando relevante e comprovada
- Sensações
- Detalhes que só esta casa tem
- Quem recebe
- Para quem é
- Frases com força, da casa e dos hóspedes, à letra
- Pontos de atrito que se repetem, com a força medida

Em cada ponto e atrito, acrescenta os IDs efetivamente analisados e separa
frequência, intensidade, especificidade, atualidade, relevância e contraponto.
O contrato recebe depois a decisão de uso; `pontos-fortes.md` nunca promove um
conflito ou uma restrição ativa apenas porque é editorialmente atraente.

Cada síntese é `[INFERIDO]`; cada citação que a prova é `[OPINIAO]` ou
`[OFICIAL]`, com fonte. Nada entra sem citação real.

## `contrato.json` e `site-pronto.md` — o que o site pode dizer

`contrato.json` é a ponte para quem monta o site. Regista cada afirmação como
uma decisão verificável: entidade e âmbito, provas, natureza, origem, estado,
forma de uso e condição quando existe. O formato completo está em
`contrato.md` e é validado contra `schemas/contrato.schema.json`.

`site-pronto.md` é uma vista legível **gerada** do contrato. Não é editado à
mão nem funciona como uma segunda origem: depois de mudar o contrato, corre
`scripts/gerar-site-pronto.py <dossie>` e valida o resultado.

A vista organiza todas as afirmações em cinco grupos: `afirmar`,
`afirmar_com_condicao`, `citar`, `inspiracao_editorial` e `nao_usar`. Inclui
as citações literais selecionadas e a cobertura/lacunas declaradas. Uma opinião
de hóspede continua em `citar`, mesmo que seja recorrente; disponibilidade de
uma pesquisa, tarifa ou unidade não é alargada à casa inteira.

## `compliance.md` — conformidade legal da casa em Portugal

- Número de registo: RNAL (Alojamento Local) ou RNET (empreendimento
  turístico, como Turismo de Habitação ou Turismo Rural)
- Presença de placa identificativa (obrigatória à entrada, exceto em
  moradias isoladas)
- Menção a seguro de responsabilidade civil específico de AL
- Menção a livro de reclamações (físico ou digital)
- Qualquer outro elemento de conformidade visível publicamente

Estes dados costumam aparecer no rodapé de sites próprios, no verso da placa
fotografada em fotos do exterior, ou mencionados em anúncios que cumprem a
lei à letra. Quando não encontrares nada, regista "não encontrado
publicamente" — não é seguro presumir que o AL cumpre ou não cumpre.

### Cruzar o registo com o RNT

O número de registo não fica só por confirmar em `factos.md` como qualquer
outro campo — dá para verificar contra a fonte oficial. O Registo Nacional
de Turismo tem duas pesquisas públicas, sem login:
- **RNAL** (Alojamento Local): `rnt.turismodeportugal.pt/RNT/Pesquisa_AL.aspx`
- **RNET** (empreendimentos turísticos: Turismo de Habitação, Turismo Rural,
  hotéis): `rnt.turismodeportugal.pt/RNT/Pesquisa_ET.aspx`

Ambas pesquisam por localização, modalidade e datas, e devolvem número, nome,
modalidade e concelho. O resultado confirma também o tipo de casa e o
concelho oficial, que vão para o topo de `factos.md`. Depois de recolheres o
número que a própria casa publica, confirma-o aí:

- Se o número aparecer no registo com nome e localização compatíveis:
  regista em `compliance.md` como `[OFICIAL]`, com nota "confirmado no RNT
  em \<data\>".
- Se não aparecer, ou aparecer com nome/localização diferente: não é prova
  de incumprimento — pode ser desatualização do registo público, um número
  mal transcrito, ou uma mudança recente de titular. Regista como
  `[A_VERIFICAR]` em `fontes.md`, com o que encontraste (ou não encontraste)
  no RNT, e não tires a conclusão por ti.

## `fontes.md` — registo de tudo o que foi cruzado

- Lista de todas as plataformas onde o AL foi procurado, mesmo as que não
  deram resultado
- Para cada plataforma confirmada: que campos bateram certo (ver
  `identidade.md`)
- Para cada plataforma marcada `[A_VERIFICAR]`: o que não bateu certo
