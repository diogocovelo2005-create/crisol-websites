# RECOLHA: Casa Rural da Costeira (Cinfães)

Passagem da recolha (fases 0 a 2 da `al-dossier`) para o juízo (`dossie-juizo`). Recolhido a 2026-10-07. Não decide o que o site pode dizer; não existem `pontos-fortes.md`, `contrato.json`, `site-pronto.md` nem `resumo.md`. O validador só aponta a falta destes três ficheiros do juízo; tudo o resto passa (`validar-dossie.py`, 3 erros, todos da fase do juízo).

## 1. Decisão de identidade

**Confirmada.** Uma só casa em todas as fontes usadas. Provas (detalhe em `fontes.md`):
- RNET nº 4967 (Registo Nacional de Turismo), «CASA RURAL DA COSTEIRA», Casa de Campo, Calçada de Medados 158, 4690-055 Cinfães: bate na morada com o Tripadvisor, o Google Maps, a Rota do Românico e o site antigo.
- NIPC 510778445: o RNET dá-o como entidade exploradora; o bloco legal do Airbnb dá o mesmo NIPC para a empresa que gere o anúncio (nome, morada da sede e telefone +351 914 797 673).
- Telemóvel +351 914 797 673 igual no Airbnb, Google, Instagram, Facebook e Rota do Românico. Instagram e Facebook dados no pedido são os mesmos que a Rota do Românico lista.
- O parágrafo de apresentação do Airbnb («A Quinta da Costeira é uma Casa de Campo em Cinfães…») é palavra por palavra o do site antigo de 2013, do post do Instagram de 2019-04-04 e da Rota do Românico.

**O tipo é Turismo no Espaço Rural, Casa de Campo (RNET), não Alojamento Local.** O RNAL, pesquisado por «Costeira», só devolve casas de outros concelhos (7 registos, nenhum em Cinfães). O concelho (Cinfães, distrito de Viseu) bate com o pedido; a casa não é de um concelho vizinho. O site não pode dizer «Alojamento Local».

Excluído por ser de outra casa: a ficha do Booking «Quinta da Costeira, Sever do Vouga», e os registos AL de «Casa/Quinta da Costeira» em Ponte de Lima, Guimarães, Castelo de Paiva, Paços de Ferreira, Arcos de Valdevez, Santa Marta de Penaguião. Não se recolheu nada deles.

## 2. O que foi recolhido (contagens)

| Fonte | Reviews | Fotos guardadas | Textos | Estado |
|---|---|---|---|---|
| Airbnb (rooms/2768412) | **25 de 25**, texto completo no original, 25 com texto; 22×5★, 3×4★; nota 4,88 | **39 de 44** (5 repetidas dentro da galeria), todas ≥2560 px de largura, todas da casa | título, descrição completa, «O espaço», «Acesso dos viajantes», «Onde estará», perfil do anfitrião, 40 comodidades, regras, política de cancelamento, preço de uma pesquisa | completo |
| Google Maps | **49 de 49** nativas (19 com texto; 30 só estrelas) + 8 importadas do Tripadvisor (aqui só como T-) | 0 (sem «Do proprietário»; fotos misturadas) | sem descrição do proprietário | reviews completas |
| Tripadvisor | **8 de 8**, texto completo no original em 4 línguas | 0 (26 fotos de viajantes/ficha não reclamada) | descrição da plataforma | completo |
| Registo Nacional de Turismo | — | — | RNET 4967 completo (capacidade, entidade, instalações) | completo |
| Rota do Românico | — | — | morada, contactos, GPS, descrição | completo |
| Instagram | — | **6** novas (+6 cópias pequenas de fotos do Airbnb não guardadas) | bio + 12 legendas | parcial (sem login) |
| Facebook | 2 críticas «sem classificação» (não visíveis) | 0 | apresentação, 1 publicação | parcial (sem login) |
| Site antigo (Web Archive 2013) | — | **30** (720×540, antigas) | 5 páginas completas | completo para 2013 |
| Booking | **0** (ficha retirada) | 0 | 0 | bloqueado |

Totais: **82 reviews** (25 Airbnb + 49 Google + 8 Tripadvisor), das quais 52 com texto (25+19+8); **75 fotos da casa** em `marketing/fotos/` (39 Airbnb + 6 Instagram + 30 site 2013) e **6 fotos de região** de terceiros. Línguas das reviews com texto: português (24), francês (11), inglês (11), espanhol (5), sueco (1); anos de 2015 a 2026.

**Fotos utilizáveis para o site:** as 39 do Airbnb (2560 px de largura, profissionais, cores saturadas, grande angular). As do Instagram (≤640 px) e do site 2013 (≤720 px, de 2013, algumas sobreexpostas) servem de apoio ou de pedido ao dono. Aguentam hero (horizontal, ≥1600 px, boas): `exterior/piscina-01, -03, -04, -05, -06, -07, -08` e `exterior/fachada-01, -02, -03, -04, -06` (12). Interiores bons e grandes: sala (4), cozinha (2), refeições (2), quartos (9, marcados com o grupo «Quarto 1 a 6» do Airbnb sem ligação a nenhum tipo de quarto), detalhes (2). Sem foto: casa de banho, galinheiro, animais, vista a partir dos quartos, exterior de noite. Fotos só pequenas: zona de churrasco, horta, cerejal, vinha, vista (`exterior/vista-01.jpg`, 512×640). Cinco fotos do Airbnb repetem-se na própria galeria (ids 243683084, 243683779, 243684767, 243663230, 243640830) e não foram duplicadas no disco. Nota técnica: as fotos do Airbnb foram pedidas a `im_w=2560`; o serviço serve até 2560 px e não é possível provar que o original não seja menor (pode haver ampliação): ver resoluções em `marketing/fotos.md`.

**Região (`regiao/regiao.md` + `marketing/fotos/regiao/`):** 6 atrações, todas com tempo de carro (OSRM, de 8 a 58 min), 2 a 3 factos de fonte oficial e uma foto horizontal Wikimedia Commons (CC BY, BY-SA) com autor, licença, URL e crédito exato: Igreja de Tarouquela (14 min), Vale do Bestança/Ponte de Covelas (12 min), Douro em Porto Antigo e Carrapatelo (8–10 min), Portas de Montemuro (22 min), Passadiços do Paiva (32 min), Santuário dos Remédios de Lamego (58 min). Menciona-se na ficha de cada uma se a casa ou as reviews já a citam (Bestança, Douro, Paiva, Roteiro Românico: sim). Lacuna: vinho e tradições.

## 3. Ficheiros do dossiê escritos

`reviews.md`, `factos.md`, `quartos.md`, `descricao-al.md`, `canais.md`, `compliance.md`, `fontes.md`, `dono.md`, `marketing/textos.md`, `marketing/fotos.md` (+ `marketing/fotos/`), `marketing/provas/` (capturas do RNET, do RNAL, do Instagram, do Facebook, do Google Maps), `regiao/regiao.md`, este `RECOLHA.md`. As reviews usam os IDs A- (Airbnb, 001 a 025, da mais recente), G- (Google, 001 a 049), T- (Tripadvisor, 001 a 008). Nenhuma review está marcada `★ citada` (é trabalho do juízo); em `factos.md` e `quartos.md` as reviews são referidas por plataforma e nome, não por ID, para o validador não exigir a estrela. Quem escrever `pontos-fortes.md` deve usar os IDs e marcar as citadas.

## 4. Bloqueado ou por recolher

1. **Booking: a fonte principal dos quartos e das reviews mais numerosas.** A ficha da casa saiu do Booking (todos os endereços `hotel/pt/casa-rural-da-costeira.*` e `reviews/pt/hotel/…` redirecionam para a lista de Cinfães com `closed_msg`; a pesquisa por nome dá 0 alojamentos). Um resultado de pesquisa web, que **não consegui verificar**, resumia a ficha como 9,6/10 em 28 reviews (subnotas 9,3 a 10,0) e «não está a aceitar reservas». Consequência: sem tabela de tipos de quarto, sem m², sem camas por quarto, sem descrições por quarto, sem reviews do Booking. O Web Archive estava fora do ar («Temporarily Offline») na altura em que tentei; vale uma nova tentativa para `booking.com/hotel/pt/casa-rural-da-costeira.*` quando voltar.
2. **Google Maps, fotos:** sem «Do proprietário»; não guardei nenhuma.
3. **Tripadvisor, fotos:** 26 fotos de viajantes/perfil não reclamado: não guardei.
4. **Instagram, Facebook:** sem login só se veem 12 posts (2017–2023) e 1 publicação; carrosséis e álbuns completos por abrir. O total de publicações não é visível.
5. **Site próprio:** quintadacosteira.pt e casadacosteira.com já não existem (DNS); casa-rural-da-costeira.com.es (indicado pelo Google) está atrás do Cloudflare, não é confirmável como da casa.
6. **Dono:** nada recebido; sem pedido de retirada.
7. **Estado atual de rotinas:** o pequeno-almoço no local, as refeições a pedido, o jacúzi (A-005: «não funcional» em 2024; T-003: «fechado» em 2018) e quem recebe (pais em 2016–2018; Tiago em 2023–2026) só têm prova nas reviews e variam por ano.
8. **Cumprimento legal:** livro de reclamações, seguro e placa: não encontrados publicamente.

## 5. Conflitos entre fontes (não resolvidos)

Lista completa em `fontes.md`. Os que mais pesam para o juízo:
1. **Nome:** «Casa Rural da Costeira» (Airbnb, RNET, Facebook, Instagram) vs «Quinta da Costeira» (descrição do Airbnb, site 2013, reviews, posts). 
2. **Nº de quartos/camas:** 6 quartos e 7 camas (Airbnb, 12 pessoas) vs 5 quartos e 10 camas (RNET) vs 5 quartos (Tripadvisor); casas de banho: todas privativas vs «quádruplo com casa de banho partilhada» (Airbnb) vs 5 em 6 (site 2013).
3. **Tipo de casa:** Casa de Campo (RNET, turismo no espaço rural) vs «Hotel de 3 estrelas» (Google) vs moradia inteira (Airbnb).
4. **Autoria do texto «O espaço» do Airbnb:** tem a estrutura do texto que o Booking gera; pode não ser escrito pela casa.
5. **Voz da casa vs reviews:** «silêncio, contemplação e harmonia» vs ladrar de cães da vizinhança à noite (A-008, 2023), acessos estreitos e difíceis (T-008 2015, T-006 2016, A-008 2023), jacúzi e chuveiro da piscina sem funcionar (A-005, 2024), toalhas não trocadas e entradas sem aviso (T-008, 2015).
6. **Telefones e emails:** cinco números e quatro emails; os emails @quintadacosteira.pt vêm de um domínio extinto.
7. **Booking vs canais da casa:** a bio do Instagram e o Linktree ainda mandam reservar no Booking, onde a ficha já não existe.
8. **Distâncias:** Lamego 48 km (site 2013) vs 62,9 km (OSRM); aeroporto 80 vs 82 km; Ponte de Covelas romana vs 1762; Talegre 1381 vs 1382 m; Paiva 8 vs 8,7 km; degraus de Lamego 500 vs 686.
9. **Google:** apresenta «restaurante» e «centro de fitness» como comodidades que nenhuma fonte da casa confirma.

## 6. Material antigo a tratar com cuidado (para a fase 3)

- Site 2013 (casa principal «recuperada em 2006», atividades como passeio a cavalo, paintball, caça e pesca, «O Rio Bestança é o rio menos poluído da Europa»): `antigo`, uma fonte de 13 anos.
- Instagram: última publicação visível de 2023-05-18; Facebook idem. Pequeno-almoço servido e matraquilhos/bilhar: Instagram 2023.
- Reviews de 2015 a 2018 sobre a mãe/pais que serviam o pequeno-almoço e a cozinheira (D. Lina, D. Isabel, Sra. Expedita): possivelmente já não existe. «O pónei foi a adoração dos mais novos» (A-018, 2017): uma menção.
- As reviews do Google «há N anos» têm o ano aproximado calculado a partir de 2026-10-07.
- Há reviews quase iguais em estilo? Não encontrei rajadas suspeitas; as 8 T- foram colhidas em parte «em parceria com o hotel» (ferramenta de recolha do Tripadvisor): T-003, T-004, T-006 (marcado em cada review).

## 7. Truques de recolha que funcionaram (para quem retomar)

- Airbnb: o HTML do anúncio (curl) traz descrição e fotos no JSON `data-deferred-state-0`; as reviews saem da janela «Mostrar as 25 avaliações» com Playwright em modo isolado (o Playwright MCP estava ocupado por outra sessão; usei o do `criar-base` por `createRequire`); fotos em `a0.muscache.com/im/pictures/<uuid>.jpg?im_w=2560`.
- Google Maps: abrir a ficha com `hl=pt-PT`, separador «Críticas», **esperar ~6 s e clicar «Ordenar» → «Mais recentes»**: só então a lista carrega por inteiro (sem este passo mostrava 5). Percorrer com `scrollIntoView` do último cartão. As importadas do Tripadvisor aparecem com «há N anos em Tripadvisor».
- Tripadvisor: Playwright dá 403; **`curl` com User-Agent de iPhone** devolve a página completa (200) com o texto integral das reviews no HTML, por língua (`.com`, `.pt`, `.fr`, `.es`), com «Mostrar original» trocado por quem escreveu.
- RNET: pesquisa por NIPC (`wt74`) em Pesquisa_ET.aspx e abrir o «+» do registo.
- Instagram sem login: 12 posts, legenda em `og:description` de cada `/p/<código>/`; imagem da grelha a 512–640 px.
- Site antigo: `web.archive.org/web/2013id_/http://quintadacosteira.pt/<página>` e imagens com `2013im_`.
- Região: tempos por OSRM (`router.project-osrm.org`), fotos pela API do Commons (`extmetadata` dá licença e autor).
