---
name: al-leads
description: Prospeção de alojamentos (AL, turismo rural, turismo de habitação, hotéis, hostels, gestoras) sem site ou com site antigo, concelho a concelho, para cold calls do negócio de websites. Junta TODAS as casas do concelho (registo oficial, Booking, Airbnb, Google Maps, lista da Câmara), tira as que não interessam passo a passo, pontua as que ficam pelo tipo de negócio, preço, avaliações e site, encontra as gestoras e escreve o resultado no dashboard Leads AL. Usar SEMPRE que o pedido for procurar alojamentos ou leads numa zona ("faz Cantanhede", "procura alojamentos em Mira", "corre o distrito de Aveiro", "encontra mais leads"), verificar um alojamento concreto ("vê se a Casa X tem site"), ou atualizar o dashboard de leads, mesmo que não fale em RNAL, Booking ou dashboard.
---

# AL Leads — prospeção de alojamentos para cold call

O objetivo é entregar ao Diogo **leads com dinheiro**: casas ativas, de um tipo de negócio que fatura (quintas de vinho, eventos, solares, hotéis rurais, hostels grandes, gestoras), sem site bom e com telefone. O resultado vai para o dashboard (`data/leads.json`).

Esta pasta é a raiz do dashboard. Os caminhos abaixo são relativos a ela. Tudo o que se faz num concelho vive em `data/<coisa>-<concelho>.json` (o `data/` não vai para o Git: tem telefones de terceiros).

## Porque é que a skill é assim (22/10/2026)

- A pontuação antiga misturava 7 coisas e não separava as boas das más: nas 109 chamadas atendidas, 3–4 pontos deram 28% de "quer ver proposta", 5–6 deram 32%, 7+ deram 31%. As 2 vendas fechadas são **turismo de habitação**. Por isso a pontuação nova pesa sobretudo o **tipo de negócio**.
- Na Régua (22/10) apareceram 7 buracos por onde casas ativas escapavam: o Booking só era lido na 1.ª página (60 de 116 casas), o Airbnb parava nas 15 páginas, 52 casas foram dadas como paradas sem pesquisar o nome, nomes diferentes não se ligavam, o código postal 5040 é de dois concelhos, e o Google Maps e a lista da Câmara não serviam para descobrir. Cada passo abaixo tapa um.
- Acabou a lista "Mensagem": ou a casa tem telefone, ou sai. Mas uma casa boa só sai depois da procura a fundo.

## Regras de ouro

1. **Ativa = uma página lida.** Booking, Airbnb, Vrbo ou Hostelworld **aberta e lida** (nota, avaliações) e a aceitar reservas. **Uma casa do registo sem plataforma conta também como ativa se tiver Facebook ou Instagram com 50 ou mais seguidores** e a página falar do sítio (decisão do Diogo, 23/10/2026: não é preciso publicar com frequência). Entra com a etiqueta "só redes sociais". Sugestão de pesquisa, agregador, perfil Google ou lista da Câmara **não são prova**.
2. **Nunca dar uma casa como parada sem pesquisar o nome** (`paradas.mjs`). O `juntar.js` recusa.
3. **Só se elimina por factos:** parada (com a pesquisa), nota baixa, site moderno com prova, sem contacto (depois da procura certa). Gestoras, cadeias e grupos **não** se eliminam.
4. **Casas com menos de 5 pessoas não entram** (decisão do Diogo, 22/10/2026), seja qual for o tipo.
5. **Nunca afirmar "sem site" sem as 3 verificações** (perfil Google, pesquisa, domínio) registadas em `verificacao`. **Abrir sempre o site e confirmar que é desta casa** (homónimas noutras terras, domínios perdidos, páginas de gestoras e diretórios).
6. **Nunca mexer em `data/estado.json`.** O `juntar.js` protege as leads já trabalhadas.
7. **Dados pessoais mínimos.** No dashboard só entram o nome do responsável, o telefone e o email da casa.
8. **Mostrar o resumo ao Diogo antes de gravar** e esperar o "sim".

## O funil

```
1. TODAS AS CASAS DO CONCELHO       registo + Booking (lista completa) + Airbnb (quadrados do mapa) + Maps + Câmara
   ▼ tira: menos de 5 pessoas
2. CASAS COM TAMANHO
   ▼ tira: paradas (só depois de pesquisar o nome)
3. CASAS ATIVAS
   ▼ tira: nota baixa
4. ATIVAS E BEM AVALIADAS           → pontuação (sub-nicho, preço, avaliações) e gestoras
   ▼ tira: site moderno com prova
5. SEM SITE BOM
   ▼ contacto: A, B e gestoras sem telefone → procura a fundo; C sem telefone → sai
6. LISTA FINAL                      Ligar (A, B, C) · Gestoras · Dúvida
```

### Passo 1 — Todas as casas

```bash
node ferramentas/rnal.js "Peso da Régua"          # registo (RNAL + RNET): titular, telefone, pessoas, freguesia, quartos
node ferramentas/booking.mjs "Peso da Régua"      # lista SEM datas até ao fim (conta de controlo) + 12 datas (preço)
node ferramentas/airbnb.mjs "Peso da Régua"       # quadrados do mapa (caixa do concelho no OpenStreetMap)
node ferramentas/descobrir.mjs "Peso da Régua"    # Google Maps: "alojamento", "turismo rural quinta", "hostel guest house"
node ferramentas/camara.mjs "Peso da Régua" https://www.cm-pesoregua.pt/visitar/dormir   # se a Câmara tiver a lista
```
- O `booking.mjs` escreve no fim a **conta de controlo** ("o Booking diz 116 alojamentos no destino; lidos N") e guarda a lista sem datas e os anúncios por ler (retoma se parar). Lista vazia = erro, não "concelho sem casas".
- O `airbnb.mjs` guarda todos os cartões da pesquisa e lê-os todos; de cada página lê as coordenadas, os hóspedes, a nota e o anfitrião. O concelho decide-se depois pelas coordenadas. Ficheiro antigo (sem coordenadas): `--reler`.
- O `descobrir.mjs` pesquisa em **todas** as terras e freguesias do registo (sem limite).
- Os nomes dos ficheiros em `data/` não têm acentos (`peso-da-regua`): os acentos estragavam-se ao passar para o Windows.
- A lista da Câmara: procurar no site da Câmara "Visitar", "Turismo", "Onde ficar", "Dormir". Se não houver, segue-se sem ela.
- Concelhos pequenos (menos de ~40 casas no Booking) correm-se em grupo com os vizinhos.

### Passo 2 — Juntar e verificar as paradas

```bash
node ferramentas/montar.js "Peso da Régua" unidades
node ferramentas/paradas.mjs "Peso da Régua"
node ferramentas/montar.js "Peso da Régua" unidades     # outra vez: as que afinal estão ativas entram
```
O `paradas.mjs` procura, para cada casa do registo sem anúncio, **cada nome do titular** (sem o nº da unidade: "Oliveira Douro Guest House 2" → "Oliveira Douro Guest House"): anúncios pelo nome (Booking, Airbnb, Vrbo, Hostelworld) e, se não houver, o Facebook e o Instagram (uma pesquisa para cada; a página tem de ter todas as palavras distintivas do nome; abre-a e lê os seguidores). Um anúncio do Airbnb que o `airbnb.mjs` já leu vale a leitura dele; uma página apagada ("Oh, não!…") não prova nada; o **Expedia não prova atividade** (a página abre até de casas fechadas). Para refazer só as redes das paradas: `--redes`; para reler os anúncios já encontrados com estas regras: `--reler`.

O concelho de cada anúncio decide-se pelas **coordenadas dentro do contorno oficial** (OpenStreetMap, `data/poligono-<c>.json`), não pelo código postal: o 5040 é da Régua e de Mesão Frio, e o Booking escreve "Peso da Régua" em moradas de Lamego. Para completar coordenadas de anúncios lidos antes: `node ferramentas/booking.mjs "<Concelho>" --coords` e `node ferramentas/paradas.mjs "<Concelho>" --moradas`. Uma casa do registo sem anúncio mas com o mesmo telefone ou titular de uma casa ativa junta-se a ela (é o mesmo negócio). O Airbnb com nº do registo de cá conta sempre; sem nº, decide o contorno; um nº que não está no RNAL mas é um RNET de cá liga-se ao RNET.

**Duas casas ativas com o mesmo telefone** (registo, Google ou Câmara) juntam-se numa só lead: é o mesmo negócio (Casa Vila Rosa e Villa Rosa Douro; Shades of Green e Green House). Os sites, perfis e anúncios das duas contam para a casa junta. Um número em 4+ casas é de um portal e não junta; casas de gestoras conhecidas não se juntam. Se duas casas não forem o mesmo negócio: `ajustes` → `NAO_FUNDIR: [ids]`. O `montar.js unidades` mostra as que juntou.

O `montar.js unidades` lista os anúncios sem registo e liga sozinho os que batem pelo nome com uma só casa do registo (mostra-os para confirmar): com 2 palavras distintivas, ou 1 no mesmo sítio (código postal ou terra iguais), contando também as palavras do endereço do anúncio no Booking. Uma palavra só, noutro sítio, não liga (a "Casa da Oliveira" de Mesão Frio não é a Oliveira Douro Guest House). Títulos genéricos ("Quarto de casal", "Airbnb: alojamentos…") nunca se juntam. Muitos são casas do registo com outro nome ("Casa grande Covelinhas" = "Casa Greande Covelinhas"; "Feel Discovery Casa do Alfaiate"): ligá-los à mão em `data/ajustes-<concelho>.json` (`MAO`), e pôr em `FORA` os de outro concelho (o Airbnb mistura vizinhos). Formato no topo do `montar.js`.

### Passo 3 — Nota

Sai (decisão do Diogo, 24/10/2026): **Booking abaixo de 7,5**, seja qual for o nº de avaliações; **entre 7,5 e 8 só fica com mais de 20 avaliações**; **Airbnb abaixo de 4,2**, com 10 ou mais avaliações. Em cada plataforma conta o anúncio com mais avaliações. Sem nota (casa nova) fica.

### Passo 4 — Pontuação e gestoras

Feita pelo `pontuacao.js` (o dashboard e o `montar.js` usam o mesmo). Só 4 coisas:

| O quê | Pontos |
|---|---|
| **Sub-nicho** | 🟢 4 · 🟡 2 · 🔴 0 |
| **Preço** (1 noite, 2 pessoas, mediana das 12 datas do Booking) | 130 €+ = 2 · 80–130 € = 1 · menos ou desconhecido = 0 |
| **Avaliações** (todos os anúncios de todas as plataformas) | 150+ = 2 · 50+ = 1 |
| **Site** | sem site ou domínio perdido = 2 · antigo = 1 · dúvida ou moderno = 0 |

**A** = 7 ou mais (ligar primeiro) · **B** = 4 a 6 · **C** = 3 ou menos.

**Sub-nichos:**
- 🟢 **Quinta com vinho** (enoturismo: "Quinta" + vinho/vinha/wine/provas, ou turismo rural com vinho) · **Quinta de eventos** (casamentos, eventos) · **Solar / turismo de habitação** (registo TH, "Solar", "Paço", "Casa senhorial") · **Hotel rural / guest house** independente com 6+ quartos (12+ pessoas) · **Hostel bom** (20+ camas ou 150+ avaliações, independente, com quartos privados) · **Gestora**.
- 🟡 **Moradia grande** (10+ pessoas ou piscina) · **Casa de campo** (turismo rural 5–11 pessoas) · **Glamping / retiro** · **Restaurante com quartos** · **Hostel** que não passa o filtro · **Quinta** sem sinal de vinho.
- 🔴 **Moradia 5–9 pessoas** · **Apartamento / quartos** · **Cadeia hoteleira** (o site decide-se na sede: quando o subagente diz que o site é "da cadeia" ou "do grupo", a casa vai para Dúvida com esse site, sem os pontos de "sem site").
- Casa sem registo: a capacidade vem dos hóspedes do Airbnb (somados entre anúncios) e o tipo do anúncio. Capacidade desconhecida (0) não é "pequena" e conta como boa para a procura de telefone.

Se o `pontuacao.js` classificar mal uma casa (ex.: quinta de vinho sem a palavra "vinho" no nome), fixar à mão em `ajustes` → `EXTRA.<id>.subnicho`.

**Gestoras** (empresas que gerem casas de OUTROS donos, pequenas e grandes): têm separador próprio no dashboard e ficam sempre no topo; uma chamada vale por todas as casas. Uma casa de gestora com telefone vai sempre para as Gestoras, seja qual for o site da casa (quem compra é a gestora), e entra mesmo que a casa tenha menos de 5 pessoas. O `montar.js` marca-as por:
1. a lista `ferramentas/gestoras-conhecidas.json` (Feel Discovery, Holidu, FERO, Alcmena, Quantique, gestoras do Porto…; acrescentar as que se forem descobrindo) no nome, no "gerido por" ou no titular;
2. o site da casa ser de uma gestora (o subagente escreve `dono: "gestora X"`);
3. "… by X" no anúncio, se X não for outra casa do registo;
4. Booking "gerido por X" com nome de empresa de gestão (Homes, Rentals, Villas, Gestão…) ou em 2+ casas do concelho;
5. Airbnb: o mesmo anfitrião com 3+ anúncios de casas diferentes de **2 ou mais titulares** do registo;
6. titular do registo com nome de empresa de gestão **e** 2+ casas de nomes diferentes no registo (uma empresa com uma casa é a dona: "Stay With Coffee").
No Airbnb, dois titulares com o mesmo telefone no registo contam como um (o dono em nome próprio e a empresa dele), e os títulos genéricos não contam como casas.
**Dono com várias casas não é gestora** (Bugalha com 9 lofts, Imperial Douro com 8 apartamentos, o mesmo titular com 3 casas): a diferença é gerir casas de titulares diferentes. Gestora à mão: `ajustes` → `EXTRA.<id>.gestora = { nome, prova }`.

### Passo 5 — Site

```bash
node ferramentas/maps.mjs data/lista-verificar-<c>.json "<Concelho>" data/maps-<c>.json      # perfil Google
node ferramentas/pesquisa.mjs data/lista-verificar-<c>.json "<Concelho>" data/pesquisa-<c>.json
node ferramentas/dominios.mjs data/lista-verificar-<c>.json "<Concelho>" data/dominios-<c>.json
node ferramentas/montar.js "<Concelho>" sites          # diz se há casas para a 2.ª volta do Google (lista-maps2)
node ferramentas/avaliar-sites.mjs data/sites-a-avaliar-<c>.json
node ferramentas/prova-moderno.mjs data/sites-a-avaliar-<c>.json
```
- O perfil Google só conta se a morada for do concelho e o nome tiver uma palavra da casa. As que ficam sem perfil (o Maps devolve outra casa) passam numa 2.ª volta com o nome do anúncio (`maps2-<c>.json`); aceitar/recusar à mão em `ajustes` (`GOK`, `GNAO`, `GOK2`).
- **Pesquisa web:** com `SERPER_API_KEY=...` no ficheiro `.env` desta pasta, usa o Google pelo Serper.dev (2.500 pesquisas grátis, depois ~1 $/1.000; conta do Diogo). Sem chave, usa o Brave pelo curl, devagar (~4 por minuto). O DuckDuckGo bloqueia o robô.
- Depois um **subagente Sonnet** (Agent com `model: "sonnet"`), em lotes de ~40, lê `data/sites-<c>.json` (sugestão e captura de cada site) e `data/prova-sites-a-avaliar-<c>.json` (prova de recente), olha para as capturas e escreve `data/sites-veredito-<c>-<n>.json` com `{ id: { url, dono, veredito, prova, nota } }` (veredito: `moderno`, `antigo`, `duvida`, `perdido`, `nao_e_desta_casa`, `nao_abre`). Página de um hotel dentro do site de uma cadeia ou grupo: `veredito: "nao_e_desta_casa"` com `dono: "cadeia <nome>"` ou `"grupo <nome>"`.

**Moderno (sai) — só com prova de que o site é recente.** Sinais que também existem em sites antigos **não contam**: https, telemóvel, WordPress, foto grande, cookies, WhatsApp, idiomas, © do ano atual, motor de reservas, "parece bonito". Só contam: (1) o design atual apareceu há 3 anos ou menos (Wayback, ou o domínio .pt registado há menos de 3 anos) ou (2) plataforma recente (Framer, Wix Studio, Squarespace 7.1, tema WordPress dos últimos 3 anos), **e** o olhar do subagente a confirmar. "Em 2023 era outra" na prova quer dizer que a ferramenta não reconheceu a plataforma antiga, não que o design mudou: o subagente compara. **Antigo:** © 2020 ou antes, não adaptado a telemóvel, tecnologia antiga (Webnode, Weebly, Wix clássico, Joomla antigo), mesmo design há 3+ anos com ar datado. **Dúvida:** o resto.

### Passo 6 — Contacto e gravar

```bash
node ferramentas/montar.js "<Concelho>" final          # escreve data/novos-<c>.json e data/sem-contacto-<c>.json
node ferramentas/contactos.mjs "<Concelho>"            # procura a fundo: A, B e gestoras sem telefone
node ferramentas/montar.js "<Concelho>" final          # outra vez, com os telefones encontrados
```
- Telefones: registo + perfil Google + lista da Câmara (fichas ligadas pelo telefone ou pelo nome; confirmar a morada quando a ligação é só pelo nome — havia duas "Casa do Rio") + procura a fundo.
- **Casa A, B, de gestora ou de tamanho desconhecido sem telefone:** o `contactos.mjs` procura com **todos os nomes** da casa (registo sem o nº da unidade, anúncios, fichas da Câmara e o nome da gestora): no site próprio e em 3 pesquisas por nome (telefone, contactos, Facebook), e nas páginas que falam da casa. Volta a procurar sempre que a casa ganha um nome novo. Só sai com `verificacao.contacto` a dizer onde se procurou.
- **Casa de gestora sem telefone:** recebe o telefone que a gestora tem noutra casa (a chamada é à gestora). Telefones repetidos entre casas da mesma gestora não se apagam.
- **Casa C sem telefone:** sai logo.

### Passo 7 — Auditoria (obrigatória)

```bash
node ferramentas/auditar.js "<Concelho>"
```
Prova, com números, que não ficou nenhuma casa por apanhar nem por verificar:
- registo com casas; contorno certo (as casas do registo no Booking caem dentro);
- Booking: a lista sem datas carregou até ao total que o Booking diz ter, todos os anúncios lidos, com coordenadas, e todos os ativos de dentro numa casa;
- Airbnb: todos os cartões lidos, com coordenadas, nenhum quadrado cortado (aviso), e todos os ativos de dentro numa casa;
- Maps: as 3 pesquisas em todas as terras; Câmara corrida;
- registo: cada casa com 5+ pessoas ativa ou pesquisada por todos os nomes e pelas redes; Airbnb das paradas lido com a página toda; Expedia não conta;
- cada casa ativa com Google, pesquisa e domínios; cada site com veredito;
- contactos: cada casa boa sem telefone procurada com todos os nomes; nenhum telefone em duas casas para ligar (duplicados); gestoras sem casa para ligar (aviso); capacidade desconhecida (aviso). **FALHA** = trabalho por fazer (a própria linha diz que ferramenta correr). **AVISO** = decisões a rever antes de mostrar: sinais de gestora não marcados (decidir cada um: gestora → `gestoras-conhecidas.json` ou `EXTRA`; dono com várias casas → nada) e anúncios sem registo (ligar em `MAO` se forem do registo).

**Nunca dizer ao Diogo que um concelho está completo sem a auditoria OK e os avisos revistos.** Se ele perguntar "tens a certeza?", a resposta é o resultado da auditoria, não uma nova volta.

Mostrar o resumo ao Diogo (ver abaixo) e, com o "sim":
```bash
node ferramentas/juntar.js data/novos-<c>.json      # só grava o novos-<c>.json completo, na versão exata que a auditoria aprovou
```
O `juntar.js` valida as regras; se der erros, **nada é gravado**: corrigir a verificação (não inventar o campo) e voltar a correr.

## Formato de uma lead

```json
{
  "id": "rnal-110977", "nome": "Casa Archie", "concelho": "...", "localidade": "...", "morada": "...",
  "tipo": "AL · Moradia", "responsavel": "...", "capacidade": 16, "registo": "2020-07-14", "quartos": 6,
  "preco": 140, "subnicho": "quinta-vinho", "descricao": "...",
  "telefones": [{ "numero": "917 203 194", "fontes": ["Google"] }], "email": "...",
  "atividade": { "fonte": "Booking", "url": "...", "novo": false },
  "booking": { "url": "...", "nota": 9.1, "avaliacoes": 308 },
  "plataformas": [{ "nome": "Airbnb", "url": "...", "nota": 4.9, "avaliacoes": 41, "ultima": "2026-08" }],
  "gestora": { "nome": "Feel Discovery", "prova": "Booking: gerido por Feel Discovery (3 casas no concelho)" },
  "etiquetas": ["cadeia nacional (Crisol Hotels)"],
  "site": null,
  "verificacao": { "maps": "...", "pesquisa": "...", "dominio": "...", "contacto": "...", "parada": "...", "data": "2026-10-22" },
  "funil": "contactar", "motivo": "Sem site: ... · Booking 9,1 (308)"
}
```
Com site: `"site": { "url", "veredito": "antigo", "captura": "capturas/<id>.png" }` (moderno leva também `"prova"`).

## Resumo ao Diogo

Por concelho: o resultado da auditoria (OK e os avisos que ficaram, com a decisão de cada um), a conta de controlo (casas no Booking vs lidas), casas ativas, **Ligar** (gestoras, A, B, C), **Dúvida**, **Fora** por razão (paradas, nota, site moderno, sem contacto), as 10 melhores com o sub-nicho e o gancho, e o que ficou fraco na verificação. No chat, não em ficheiro.
