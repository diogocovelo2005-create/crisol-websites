---
name: prospeccao-alojamento
description: >-
  Funil de prospeção de alojamento local em Portugal — guest houses, hostels,
  bed & breakfast, turismo rural e casas de campo. O utilizador diz só a
  localização e a skill percorre o funil inteiro: descobre as casas da região,
  audita o site de cada uma, filtra quem é mesmo do nicho, confirma quem não
  tem site, e devolve uma folha de trabalho com o lote. Usar sempre que o
  pedido for "encontra candidatos em X", "faz o levantamento de Y", "prospeção
  de alojamento em Z", "quem é que não tem site em X", ou verificar e
  qualificar uma casa de alojamento à unidade. Só para este nicho: para
  qualquer outro, a skill é a lead-scraper genérica na raiz do repositório.
---

# Prospeção de alojamento local

> **Onde vive o quê.** O motor é a skill genérica em
> `.claude/skills/lead-scraper/`, na raiz do repositório, e **não se toca
> nela**. Os dados que o motor consome — a lista de termos e as grelhas das
> regiões — vivem com o motor, em `keywords/` e `grid/`. O que vive aqui é o
> critério, as decisões, os lotes e os clientes.
>
> **Um único script vive aqui:** `scripts/detalhar.js`, que substitui a fase
> paga do motor. Importa do motor só de leitura. Porque existe, em §2.5.
>
> **Corre sempre a partir da raiz do repositório**, a pasta que contém
> `nichos/` e `.claude/`. Os scripts mudam sozinhos para a pasta do motor,
> por isso `--grid grid/coimbra.json` resolve lá dentro e não aqui.

O utilizador diz **uma localização**. Tudo o resto é desta skill.

**Quatro comandos, três julgamentos, um entregável.** A fronteira entre comando
e julgamento é a regra que mantém isto honesto:

> **Onde há comando, não há opinião. Onde há julgamento, há uma pergunta de sim
> ou não, e a resposta fica escrita com a prova ao lado.**
>
> **Só se descarta com prova. Sem prova, a casa sobe à decisão dele.**

Esta segunda regra substitui o antigo "na dúvida, descarta", e a razão é simples:
uma casa descartada por dúvida desaparece sem ninguém a ver. Descartar é uma
conclusão, não uma forma de arrumar o que não se conseguiu apurar.

Uma casa só sai do funil por sua conta em dois casos, e os dois são medidos e
não opinados: **a nota do audit disse que o site é bom**, ou **um critério de
inclusão falhou com prova à vista**, por exemplo é uma cadeia da lista ou o
Booking diz três quartos. Tudo o resto que te faça hesitar vai para a pilha de
duvidosos e é ele que decide. Ver §7.

---

## 0 — Antes de gastar seja o que for

Confirma que `.claude/skills/lead-scraper/.env` tem `GOOGLE_MAPS_API_KEY`,
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` e
`NOMINATIM_USER_AGENT`. Com `SUPABASE_DB_URL` preenchida, a tabela
`leads_alojamento` é criada sozinha na primeira corrida.

Se for a primeira vez nesta máquina:
`cd .claude/skills/lead-scraper && npm install && npx playwright install chromium`

---

## 1 — Grelha (comando)

```bash
node .claude/skills/lead-scraper/scripts/gen-grid.js --regiao "<região>" --pais PT
```

Sai com código 2 e lista candidatos, porque em Portugal o distrito, o concelho
e a freguesia partilham o nome. **Decide pela área, nunca pelo nome:** distrito
2 500–7 000 km², concelho 50–1 500 km², freguesia < 50 km². Se o utilizador não
disse qual, pergunta-lhe. Depois repete com `--indice N`.

A grelha resolve o problema das sub-localidades. Não listes freguesias, praias
nem serras à mão: a subdivisão por saturação faz isso melhor e sem esquecer
nenhuma.

---

## 2 — Descoberta (comando)

```bash
node .claude/skills/lead-scraper/scripts/discover.js --nicho alojamento \
     --grid grid/<região>.json --keywords keywords/alojamento.json
```

A lista de termos **já existe e está validada**. Não a geres, não a alteres,
não corras o validador nem o smoke test. Foram feitos uma vez e estão
congelados: 38 termos, 3 sub-ofícios, 8 tipos confirmados contra a API.

Idempotente. Se parar, o mesmo comando retoma do checkpoint.

**Só interessa a fase A desta corrida**, a pesquisa, que é gratuita e ilimitada
e devolve identificadores. A fase paga do motor é a que o §2.5 substitui. Se a
fase A for cortada por quota, o checkpoint fica gravado e o §2.5 trabalha com o
que ela já trouxe — não é preciso ter a fase A completa para avançar.

---

## 2.5 — Nomes, com orçamento diário (comando)

```bash
node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/detalhar.js \
     --regiao <região> [--max-dia 100] [--simular]
```

A fase A devolve identificadores, não nomes. Este passo é o que transforma um
identificador numa casa com nome, morada, telefone, website e avaliações.

**Porque não se usa a fase paga do motor.** O motor parte-a em dois andares,
triagem barata a $5/1000 e mask completo a $20/1000, porque o gratuito do
Essentials é dez vezes maior. Isso está certo contra uma restrição de
**dinheiro**. A restrição real é de **ritmo**: a quota
`GetPlaceRequestPerDayPerProject` conta pedidos e não SKUs, por isso os dois
andares gastam duas unidades de quota por casa nomeada, para poupar dólares que
nunca chegariam a ser cobrados. A 11/09/2026 isso deu 10 000 chamadas e zero
nomes em Viseu.

O que este script faz diferente:

1. **Filtra a região de graça**, pela célula que encontrou cada lugar. A
   geometria de qualquer célula reconstrói-se do id, porque a subdivisão do
   motor é determinística. Em Viseu descarta milhares de lugares sem uma
   chamada — era isso que a triagem paga ia descobrir.
2. **Uma só chamada por casa**, com o mask completo. O Place Details devolve
   tudo o que se pedir pelo mesmo preço.
3. **Aborta à primeira recusa de quota diária**, e ao fim de cinco falhas
   seguidas sem uma única resposta boa conclui que a chave não está a servir e
   pára com o diagnóstico. Percorrer a fila inteira a falhar parece trabalho.
4. **Gasta o mínimo** entre o que resta de gratuito no mês e o tecto do dia, e
   retoma amanhã de onde ficou.

Nunca gera factura sem `--aceito-pagar`, que não é preciso para nada do
funcionamento normal. Usa `--simular` para ver a fila e o orçamento sem fazer
uma única chamada.

**A confiança na região fica no estado deste script**, em
`.state/alojamento__<região>__detalhes.json`, e não em `audit_extra`, porque o
`audit.js` reescreve `audit_extra`. Uma casa marcada `incerto` ou
`dentro_incerto` chega ao §5 como **duvidosa quanto ao concelho**: a célula que
a encontrou era larga demais para o teste do centro decidir. Não é prova de que
está fora, e por isso não se descarta.

---

## 3 — Auditoria (comando)

```bash
node .claude/skills/lead-scraper/scripts/audit.js --nicho alojamento --screenshot-min-score 2
```

Abre cada site num iPhone simulado, mede os defeitos e fotografa os piores.
Não passa pelo Google, por isso não custa nada.

O limiar é **2** e não 4 porque neste funil a melhor lead é a de site mau, e
na escala do motor (0 a 5) site mau é 2 e 3. Com 4, as leads mais valiosas
ficavam sem a fotografia que prova o defeito.

**Se o browser não arrancar** com `Invalid file descriptor to ICU data`, a
instalação do Chromium está incompleta: corre
`cd .claude/skills/lead-scraper && npx playwright install --force chromium`.

---

## 3.5 — Estética (comando)

```bash
node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/estetica.js
```

O audit mede defeitos técnicos, e um site pode passar em todos e ser feio.
Olhar para fotografias de centenas de sites não é opção, por isso este passo
procura, no código, **quatro sinais que andam com um site feio**:

1. fotografias pixelizadas (esticadas acima do tamanho real)
2. template por defeito ou nunca preenchido, ou tecnologia de outra década
3. parede de texto, com quase nenhuma imagem
4. página pesada (6 MB ou mais) ou lenta (10 s ou mais)

A letra por defeito **não** é sinal, e ficou de fora por decisão dele: há sites
bons com Arial.

Só visita os sites `modern`, que podiam passar por bons, e os que o motor marcou
como parqueados. Aí só conta como parqueado com a frase à vista ("domínio à
venda", "em construção"). Sem a frase, a casa fica em dúvida.

Não decide nada. Escreve `sinais_feio` e `duvida_script`, e o trigger faz o
resto. Fotografa só as casas que vão ser olhadas. Custa zero tokens e zero
euros.

---

## 4 — Nota (comando)

```bash
node -e "import('./.claude/skills/lead-scraper/scripts/lib/db.js').then(d=>d.aplicarScore(d.nomeTabela('alojamento')))"
```

Este comando dá a nota do motor, `score`, de 0 a 5, e continua a correr para a
vista do motor não ficar desactualizada. **A nota que conta neste funil é
outra**: a coluna `nota`, de 0 a 10, com o `tipo_lead` e o `motivo` ao lado.
Calcula-se sozinha, por um trigger, sempre que uma linha entra ou muda. Não há
comando para ela.

Os triggers, as colunas novas e a tabela dele, `crm_alojamento`, vêm de
`scripts/crm.sql`. Aplica-se **uma vez por base de dados** (é idempotente,
repetir não estraga nada). Se a tabela `crm_alojamento` não existir, aplica-o
antes do §2.5.

**São duas tabelas, de propósito.** `leads_alojamento` é a da máquina: tem as
colunas técnicas de que os scripts precisam, e ele não a abre.
`crm_alojamento` é a dele, só com as colunas que usa, e enche-se e atualiza-se
sozinha a partir da outra. As colunas dele (`estado`, `decisao`, `notas`,
`estado_em`) nunca são reescritas por nenhum script.

**Os tipos de lead**, que são os dele e não se desdobram:

| Tipo | Quando | Base |
|---|---|---|
| **site mau** | morto com prova (domínio não existe, erro 404, parqueado com a frase), **só um motor de reservas próprio** (direct-book e parecidos), ou velho com **pelo menos um defeito que o hóspede vê** (sem https, não adaptado a telemóvel, arrastar para o lado, rodapé com 4+ anos, ferramenta velha), ou ele decidiu | 7 |
| **por decidir** | o script tem dúvidas (abaixo) | 5 |
| **sem site** | nada, ou só Facebook / Instagram / Booking, ou um **agregador de terceiros** (bluepillow, freecancellations…) | 4 |

**Motor de reservas próprio não é o mesmo que agregador.** O motor de reservas
(`direct-book.com`, `vacation-bookings.com`, Amenitiz, Cloudbeds…) é da casa:
ela paga para receber reservas diretas e não tem mais nada. É das melhores
leads, porque já quer fugir à comissão, e convence-se com "um site a sério
traz-te mais marcações diretas". O agregador copia o anúncio e fica com a
reserva: não é da casa, e por isso a casa conta como sem site. As duas listas
estão em `crm.sql`, nas funções `eh_motor_reservas` e `eh_agregador`.
Sempre que aparecer um domínio novo, acrescenta-o à lista certa e volta a
aplicar o `crm.sql`.
| **site razoável** | moderno, com uma fraqueza pequena | 2 |
| **site bom** | nenhum defeito, nenhuma dúvida | 0, sem bónus |
| fechado | fechou de vez, segundo o Google | 0, sem bónus |
| por auditar | ainda falta o audit ou a estética | sem nota |

**Por decidir** quando o script não tem a certeza, e não finge que tem:

- o site demorou mais de 20 s a abrir: pode estar morto ou só lento
- o site respondeu 401, 403, 429 ou 503: bloqueou o robô
- não abriu por outro erro que também acontece a sites vivos (mudou de página
  a meio, o servidor não respondeu uma vez)
- é velho só por defeitos que o hóspede **não vê** (sem formulário nem
  contacto, sem dados para o Google). Em Viseu eram 27 dos 63 "site mau"
- o motor achou-o parqueado só por ter pouco texto
- só **um** defeito grave (sem https, ou não adaptado ao telemóvel, ou obriga
  a arrastar para o lado)
- **dois ou mais sinais de feio E 25 ou mais avaliações**. É o filtro 2: um
  site feio numa casa sem clientes não vale o tempo de olhar

Quando ele escolhe um tipo na coluna **`decisao`**, essa escolha manda sobre o
script para sempre, e o `motivo` passa a "decidido por ti".

| Negócio | Pontos |
|---|---|
| 100 ou mais avaliações | +2 |
| 25 a 99 avaliações | +1 |
| menos de 5 avaliações | −1 |
| rating 4,5 ou mais | +1 |
| 4 ou mais defeitos graves no site | +1 |

**O site mau está à frente do sem site de propósito.** Quem tem site mau já
sabe que precisa de um e já pagou por isso uma vez.

---

## 4.5 — A ordem de trabalho

**O motor é de recall, este funil é de precisão.** A descoberta é gratuita e
não se limita. O que muda é o que se faz a seguir.

**Cada casa que chega aos §5 e §6 é analisada a fundo, sem excepção.** Não há
versão rápida, não há amostragem, não se salta a página do Booking nem a
segunda pesquisa para ir mais depressa. Uma casa mal analisada é pior do que
uma casa não analisada, porque entra no lote com uma conclusão errada colada.

Trabalha **pela tabela dele**, pela nota de 0 a 10 e, dentro da mesma nota,
pelo número de avaliações:

```sql
select * from crm_alojamento
where tipo_lead in ('site mau', 'por decidir', 'sem site', 'site razoável')
order by nota desc, num_reviews desc nulls last;
```

Essa ordem é a definição de lead boa neste nicho: **site mau primeiro, e entre
iguais, quem já tem hóspedes a chegar.** Uma casa de site mau com trezentas
avaliações vale mais do que dez casas sem site e sem ninguém.

A ordem serve para o trabalho valioso vir primeiro, e não para cortar a meio.
Desce a lista até ao fim.

**Sobre o tamanho do lote.** Um distrito costuma dar entre quarenta e cem casas
aprovadas, e é esse o resultado esperado. **Esse número descreve o que sobra, e
nunca é um travão ao trabalho.** Se sobrarem cinquenta, entrega cinquenta. Não
estiques o lote com casas fracas para ele parecer maior: cada lead só tem
direito a dois contactos e gastá-los com quem não presta é o desperdício caro.

Se a lista for grande de mais para uma sessão, **pára entre casas e nunca a
meio de uma**, regista onde ficaste, e o que faltar fica em `por verificar`.
Por verificar não é descartado e volta ao lote seguinte.

---

## 5 — Inclusão (julgamento)

A descoberta é de recall e traz hotéis, cadeias e apartamentos avulsos. Esta
porta separa-os, e vem **antes** do trabalho caro do §6.

Entra quem tiver **as quatro**. Ler `references/inclusao.md` para o detalhe e
para a lista de cadeias a excluir à cabeça.

1. nome ou marca própria
2. gerido pelo dono, não cadeia nem rede
3. **quatro ou mais unidades**
4. anfitrião ou receção

Antes das quatro, uma verificação que vem de graça do §2.5: se o script marcou a
casa como `incerto` ou `dentro_incerto`, **a célula que a encontrou era larga
demais para garantir que ela é do distrito**. Isso não a põe fora — põe-na
duvidosa quanto ao concelho, e a morada que veio na chamada resolve quase sempre
a dúvida. Se não resolver, sobe com a hesitação escrita.

**Falhar não é o mesmo que não se conseguir apurar**, e a diferença é a coisa
mais importante deste parágrafo:

- **Falhou com prova** → fora do nicho. A prova é concreta e escreve-se: está
  na lista de cadeias, o Booking diz três quartos, o mesmo site serve três
  casas. Decides tu, sem perguntar.
- **Não se conseguiu apurar** → **duvidoso**, e vai para a decisão dele. A casa
  não está no Booking, a página não diz o número de quartos, o nome não deixa
  perceber se é marca própria ou intermediário. Escreve o que procuraste e o
  que ficou por saber.

Nunca uses "fora do nicho" para arrumar uma casa que não conseguiste avaliar.
Uma casa fora do nicho não volta nunca mais, e é por isso que essa porta só se
usa com prova à vista.

O número de unidades não vem do Google. Vem da página da casa no Booking,
consultada **uma casa de cada vez**. Não faças raspagem de listas do Booking:
não é preciso e é onde este funil costumava perder-se.

Grava em `audit_extra`: `inclusao` com `"dentro"`, `"fora"` ou `"duvidoso"`,
`motivo` com a razão em meia dúzia de palavras, e `prova` com o link e a data
quando a houver.

---

## 6 — Resolução de site (julgamento)

**O passo que decide se o lote presta.** O campo `website` do Google é o que o
dono escreveu na ficha, e em alojamento está muitas vezes vazio ou com o link
do Booking. Nota 5 no ecrã não é prova de que não tem site.

Para cada casa que passou a inclusão e ficou sem site, **as cinco regras**
(detalhe em `references/rubrica.md`):

1. **Duas pesquisas, nunca uma.** `"<nome>" <cidade> site oficial website` **e**
   `"<nome>" <cidade> contactos email telefone`. Já houve casas a passar a
   primeira como sem site e a ter site.
2. **Agregador não é site.** Confere o anfitrião contra a lista negra. Se o
   único resultado for um agregador, a casa **não tem site**.
3. **Testa o domínio óbvio**: `nome.pt`, `nome.com`, `nome-cidade.pt`.
4. **Procura nos portefólios dos estúdios da zona.** Obra adjudicada e ainda
   não publicada é lead morta, e só se apanha assim. Consulta a tabela de
   concorrência antes, e alimenta-a depois.
5. **O ano do rodapé mente.** A idade real lê-se na construção.

**Também aqui a dúvida sobe, não desce.** Se o site que encontraste pode ser da
casa ou pode ser de outra com nome parecido, se não consegues decidir se aquilo
é agregador ou site próprio, ou se o site abre mas não dá para perceber a
idade, a casa vai para **duvidoso** com a hesitação escrita. Não a descartes
nem a aprovas para arrumar o assunto.

Uma casa que ficou duvidosa aqui entra no lote na mesma. O que muda é que leva
a marca e a linha a dizer o que ficou por confirmar.

Grava em `audit_extra`: `site_encontrado`, `prova` (link e data) e, se for o
caso, `estudio`.

---

## 7 — Lote de decisão (julgamento)

**A nota já é a rubrica.** O motor marca um site como legacy quando encontra
dois ou mais defeitos graves, que é exactamente a regra dos dois sinais de
fraqueza, e o `tipo_lead` e a `nota` (§4) partem daí. Não reclassifiques à mão
o que a nota já classificou:

| Tipo de lead | Leitura |
|---|---|
| site mau | candidato imediato: já pagou um site e o site falhou |
| por decidir | **ele decide**, pela fotografia e pelo `motivo` |
| sem site | candidato |
| site razoável | candidato fraco, só com negócio forte |
| site bom | descartado pela rubrica |

A única correção permitida é a da regra 2 do §6: se o "site" é um agregador
que ainda não está na lista, acrescenta o domínio a `eh_agregador` no
`crm.sql` e volta a aplicá-lo. O trigger passa a casa a `sem site` e recalcula
a nota. Um motor de reservas novo vai para `eh_motor_reservas`. Nunca
preenchas `decisao`: essa coluna é dele.

**A rubrica não decide sozinha.** Cada casa sai por uma de quatro portas, e só
duas se fecham sem ele:

| Porta | Quem decide | Porquê |
|---|---|---|
| **Aprovada** | tu propões, ele confirma | passou as duas portas, com prova |
| **Descartada pela rubrica** | tu, sem perguntar | a nota mediu o site e ele é bom. É medição, não opinião |
| **Fora do nicho** | tu, sem perguntar, **só com prova à vista** | cadeia conhecida, menos de quatro unidades confirmado |
| **Duvidosa** | **ele, sempre** | tudo o resto |

A pilha das duvidosas é a que importa nesta secção. Enche-se de duas fontes: as
que não se conseguiram apurar no §5 ou no §6, e as que passaram a rubrica mas
têm razão de negócio para hesitar, como nota do Google má, casa muito pequena,
marca ambígua, ou sinal de que já contratou alguém.

Todas vão para o artifact **marcadas**, com a hesitação escrita numa linha e o
que ficou por confirmar. Ele decide, e a análise final é dele.

**Uma pilha de duvidosas vazia é sinal de aviso, não de bom trabalho.** Se
analisaste duzentas casas e nenhuma te deixou dúvidas, muito provavelmente
estás a arrumar dúvidas nas outras pilhas.

Nunca apresentes uma lead como aprovada sem link e data do que a qualificou.

---

## 8 — Entregável

Um artifact HTML, a folha viva do lote. Especificação em
`references/artifact.md`.

**Onde vive cada coisa: tudo no Supabase.** Ele só abre `crm_alojamento`, que
tem estas colunas e mais nenhuma, **por esta ordem**: nome · nota, tipo_lead ·
estado, decisao, notas · telefone, website · motivo · rating, num_reviews,
primary_type, morada · estado_em, e `place_id` no fim, porque o Supabase
precisa de uma chave para deixar editar linhas. A lógica é: quem é, quanto
vale, o que ele fez, como contactar, porquê, contexto, e por fim as
automáticas. O nome é **sempre** a primeira coluna.

**Não acrescentes colunas a esta tabela sem ele pedir.** Foi ele quem escolheu
a lista, porque o resto o confundia. E mudar a ordem obriga a recriar a
tabela, copiando os dados, porque o Postgres não reordena colunas.

| Coluna | Quem escreve | Onde |
|---|---|---|
| nome, contactos, avaliações, defeitos do site | os scripts | `leads_alojamento` |
| `sinais_feio`, `duvida_script` | o `estetica.js` | `leads_alojamento` |
| inclusão, motivo, site encontrado, prova (em `audit_extra`) | tu, nos §5 e §6 | `leads_alojamento` |
| `tipo_lead`, `nota`, `motivo` | o trigger, sozinho | as duas |
| **`estado`**, **`decisao`**, **`notas`** | **ele**, no Table Editor | `crm_alojamento` |
| `estado_em` | sozinha, quando ele muda o estado | `crm_alojamento` |

O `estado` é um menu, com esta ordem: por contactar · contactado · não atendeu
· sem resposta · voltar a contactar · interessado · reunião marcada · a
construir base · base enviada · reunião de feedback · disse que sim · disse
que não · a construir site · site acabado · publicado · pago · não contactar
mais. A coluna `estado_em` guarda sozinha a data da última mudança de estado.

**Nunca escrevas em `estado`, `decisao` nem `notas`**, a não ser que ele o peça. São a
fonte de verdade sobre o contacto, e nenhum script lhes toca. Estado em duas
moradas é estado que se perde: se fizeres o artifact, ele **mostra** o estado e
as notas lidos da tabela, mas não os guarda.

Depois do artifact, grava o lote em `nichos/alojamento/leads/<região>.md`: link do
artifact, tabela do universo, aprovados, descartados, fora do nicho,
concorrência local encontrada, próximos passos.

**Em sessões futuras, lê as colunas `estado` e `notas` antes de refazeres o
artifact.** São elas a fonte de verdade.

---

## Nunca faças

- gerar ou editar a lista de termos, correr o validador ou o smoke test
- **deixar a fase paga do motor correr neste nicho**: gasta duas unidades de
  quota por casa e já deu 10 000 chamadas para zero nomes. O §2.5 é o caminho
- **tratar falhas como progresso.** Chamadas recusadas não se pagam, não gastam
  gratuito e não contam no contador mensal. Uma fila inteira a falhar é um
  problema de chave, não de casas
- raspar listas do Booking, com scroll, ordenações ou filtros de distância
- listar freguesias à mão para compensar a grelha
- tratar `website` vazio como prova de que não há site, sem fazer o §6
- misturar "fora do nicho" com "descartado pela rubrica"
- **descartar ou pôr fora do nicho sem prova à vista**: sem prova é duvidoso
- entregar um lote com a pilha de duvidosas vazia sem estranhares
- fazer versão rápida de uma casa para chegar ao fim da lista mais depressa
- prometer comentários do Booking no site do cliente, que o Booking proíbe
- apresentar uma lead aprovada sem link e data
- alterar seja o que for dentro de `.claude/skills/lead-scraper/`

---

## Quando ler cada referência

| Ficheiro | Ler quando |
|---|---|
| `references/inclusao.md` | sempre, no §5, antes de deixar uma casa entrar |
| `references/rubrica.md` | sempre, no §6: agregadores, marcadores de idade, concorrência local |
| `references/artifact.md` | ao construir ou editar o entregável |
| `references/venda.md` | ao passar ao contacto, e antes de escrever qualquer email |
| `.claude/skills/lead-scraper/references/places-api.md` | só se aparecer um 400 ou um 429 |
