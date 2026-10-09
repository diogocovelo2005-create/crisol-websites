# Fontes: Casa Museu e Casa Aido Santo

Recolha feita a 2026-09-24, pelo browser (Playwright, sem sessão iniciada) e,
para o Google, pela Places API. Ponto de partida: a linha "Casa Museu" da
tabela `crm_alojamento` no Supabase (place_id `ChIJ_-BXHshBIw0R2dNI_v68L3Y`,
R. Ribeiro Cardoso N°6, 3670-231 Vouzela, 232 771 514, site
`http://www.casamuseu.com/`), o site antigo e o link de partilha do Booking
que o utilizador deu.

## Tipo de casa e concelho

- **Casa Museu:** Alojamento Local, modalidade estabelecimento de hospedagem,
  concelho de **Vouzela** (RNT). Bate com o pedido.
- **Casa Aido Santo:** **não é Alojamento Local**: é Turismo no Espaço Rural,
  Casa de Campo (RNET 1238), concelho de **Oliveira de Frades**, freguesia de
  Pinheiro, lugar de Nespereira. O Booking põe-na em "Pinheiro de Lafões". O
  site nunca a deve pôr em Vouzela.

## Plano de percurso e identidade

| Fonte | O que foi percorrido | Entidade | Campos que bateram | Estado |
|---|---|---|---|---|
| Supabase `crm_alojamento` | linha "Casa Museu" | Casa Museu | nome, morada, telefone, site | confirmada (ponto de partida). Há outra linha com "Museu" no nome — "Casa Museu da Geada - Turismo Rural", 4690-255 (Cinfães) — que **não é** esta casa |
| casamuseu.com (site antigo) | todas as páginas PT e EN: Home, Casa Museu, Sobre, Casa Aido Santo, Philips Flat, Penthouse, Contactos, Rota | as quatro unidades do grupo | telefone 232 771 514, email, RNAL 35686/AL, TER 1238 | confirmada |
| Booking — Casa Museu | anúncio, tabela de quartos (4 pesquisas), regras, informações importantes, perguntas e respostas, 58 comentários (6 páginas) e respostas da casa abertas, galeria completa (66) | Casa Museu | nome, morada (Praça Morais Carvalho, 3670-231), licença 35686/AL | confirmada. O link de partilha `Share-Vh0Pph` abre este anúncio |
| Booking — Casa Aido Santo | anúncio, tabela de tipos (3 pesquisas), regras, informações importantes, pergunta e resposta, galeria completa (48) | Casa Aido Santo | nome, morada (Lugar Nespereira, 3680-173), licença TER 1238, resposta assinada "A.Carvalho" | confirmada |
| Google Maps (Places API) | ficha e 5 reviews de cada casa | as duas | Casa Museu: nome, morada, 232 771 514, site. Aido Santo: nome, morada, 966 059 265 (o telemóvel do site da Casa Museu) | confirmadas |
| TripAdvisor | ficha "Casa Museu Hospedaria" e 4 páginas de avaliações (40 de 66), originais abertos | Casa Museu | nome, Vouzela, donos nomeados (Celeste e António José Carvalho), link do próprio site da casa | confirmada |
| Airbnb | anúncio 7085728: descrição (original, sem tradução), 24 comodidades, 17 avaliações, galeria (36) | Casa Aido Santo | nome, Oliveira de Frades, registo "TER 1238", anfitriões António e Celeste | confirmada |
| Visit Vouzela (Web Archive) | páginas inicial, Casa Museu, Quartos Casa Museu, Casa Aido Santo, Quartos Aido Santo, Rota do Pastel, Contato, Voucher, Vídeo (cópias de abril a junho de 2026) | grupo | 232 771 514, 966 059 265, info@casamuseu.com, 35686/AL, TER 1238 | confirmada; é o site mais recente da própria casa |
| Registo Nacional de Turismo | RNAL 35686, RNAL 64058, RNET 1238 | as três unidades de Vouzela/Oliveira de Frades | número, nome, titular | confirmada (ver `compliance.md`) |
| Facebook | páginas "Casa Museu" e "Casa Aido Santo" | as duas | Aido Santo: 966 059 265, info@casamuseu.com, visitvouzela.com/aidosanto | parcial: pede sessão; Casa Museu "não disponível" |
| Instagram | @casaaidosanto | Aido Santo | bio cita @casamuseu e @casadasameias | parcial: só a bio |
| trivago, VisitPortugal, Turismo do Centro, Câmara de Oliveira de Frades, Câmara de Vouzela, oGuia, lifecooler, trip.com | resultados de pesquisa | — | — | usados só para descobrir canais; nada recolhido deles como facto |

## O grupo do mesmo dono (fora do âmbito)

O mesmo titular (António José Ferreira de Carvalho, NIF 173840230) e os
mesmos contactos aparecem noutras unidades. Registadas aqui para não se
perderem; **não entram no dossiê** (decisão do utilizador, ver `dono.md`):

| Unidade | Onde aparece | Registo | Observação |
|---|---|---|---|
| Penthouse - Low Cost (Vouzela) | site antigo, Visit Vouzela, Booking (9,0, 67 comentários) | RNAL 64058/AL "CASA MUSEU LOW COST", apartamento, 3 quartos, 10 utentes, aberto em 2018 | "opção low cost ao Hotel Casa Museu"; check-in na Casa Museu |
| Philip's Flat (Alvor, Algarve) | site antigo, Visit Vouzela | 25507/AL (site) | Condomínio Vila da Praia, Alvor |
| Casa das Ameias (Vouzela) | Visit Vouzela, bio do Instagram da Aido Santo, Instagram da Casa Museu (visto pelo utilizador a 2026-09-25), Booking (9,5, 59 comentários) | **RNET 9990, Turismo de Habitação**, registado 2022-01-10, aberto em 2022, "classificado em projeto"; 8 suites, 16 pessoas; piscina exterior, sala de reuniões para 30; "Imóvel Classificado de interesse Local"; Rua Teles Loureiro e Rua Mouzinho de Albuquerque, 3670-231 Vouzela. Confirmado no RNT a 2026-09-25 | **Do mesmo casal**: proprietária e diretora Maria Celeste Silva Coutinho Carvalho (NIF 164846255); contactos no RNT 966 059 265 e info@casamuseu.com, os mesmos da Casa Museu. Tem o Museu do Pastel de Vouzela; o check-in faz-se na Casa Museu; o Booking (pergunta de 2022) diz que o estacionamento fechado da Casa Museu é lá |
| BIKEINN (Vouzela) | Visit Vouzela (menu e página própria) | não verificado no RNT | Rua Mouzinho de Albuquerque, 37 (3670-258). **Ligação mais fraca:** tem contactos próprios (964 322 654, info@bikeinn.pt), Facebook próprio e anúncio próprio no Booking (9,3); não aparece no Instagram da Casa Museu nem da Aido Santo (segundo o utilizador). Só o Visit Vouzela o liga ao grupo, e diz que o check-in é na Casa Museu. Pode ser gerido à parte |

## Conflitos e o que ficou por verificar

### Casa Museu

1. **`[A_VERIFICAR]` Século do edifício.** Site antigo e Visit Vouzela
   (bloco final): "uma casa do século XVIII". Visit Vouzela (primeiro bloco
   da página Casa Museu, 2026): "Os proprietários […] construiram este
   edificio à 15 anos tentando preservar as caracteristicas deste edificio do
   séc. XVI". Uma review antiga (T-040, 2008) fala de "remnants of several
   roman columns". O site não deve fixar o século até o dono confirmar.
2. **`[A_VERIFICAR]` Pequeno-almoço hoje.** A casa promete
   (Visit Vouzela, 2026): "O nosso pequeno-almoço é servido na sala ou no
   quarto […] Os bolos as compotas são caseiros e feitos no hotel." O Booking
   vende-o à parte ("Bom pequeno-almoço por € 10") e tem uma tarifa
   "económica sem pequeno almoço" (resposta da dona a B-045). Entre 2023 e
   2025, cinco hóspedes dizem que não houve pequeno-almoço ou que não lhes foi
   servido: B-020 ("Pas de petit déjeuner servi à l'hôtel", set. 2025), B-030
   (jun. 2025), B-038 (ago. 2024), B-045 (domingo, ago. 2024), T-002 (set.
   2023). Os elogios ao pequeno-almoço são quase todos de 2012 a 2022
   (TripAdvisor) e um de 2024 (B-052). A voz da casa e as reviews recentes
   discordam; não se resolve aqui.
3. **`[A_VERIFICAR]` Estacionamento.** Booking, comodidades: "Sem
   estacionamento disponível." Booking, perguntas: "Sim é possivel
   estacionamento em garagem fechada." (2021) e "Temos estacionamento fechado
   na Casa das Ameias." (2022). Hóspedes: quatro queixam-se (B-032, B-037,
   T-005, G-003); três dizem que há parque grátis ao lado (B-035, T-016,
   T-040).
4. **`[A_VERIFICAR]` Código postal.** RNT: 3670-**257**. Google, Booking e
   Visit Vouzela: 3670-**231**. Morada: Rua Ribeiro Cardoso, 6 (RNT, Google,
   Visit Vouzela) ou "Praça Morais Carvalho" (site antigo, Booking): a casa
   fica na esquina; a Visit Vouzela diz "situa-se junto à Praça Morais
   Carvalho".
5. **Telefones.** 232 771 514 (fixo, em todo o lado), 232 772 614 (só no site
   antigo), 966 059 265 (telemóvel; na página Contato do Visit Vouzela aparece
   por engano como "rede fixa"). Não é conflito, é um a mais no site antigo.
6. **Preços do site antigo (sem data).** "Quarto duplo A.P.A. 60,00 € -
   100,00 €", "Pacote Romântico 110 €"; a versão inglesa da mesma página diz
   "Double room A.P.A. 60,00 €" e "Children up to 2 years old FREE" contra
   "6,00 €" em português. Históricos; não usar.
7. **"Telefone" no quarto** (site antigo e Visit Vouzela) — nenhuma outra fonte
   o confirma; o Booking não o lista.

### Casa Aido Santo

8. **`[A_VERIFICAR]` Ano de abertura.** RNT: abertura em 2000 (registo
   "N10/2000"). Visit Vouzela: "Casa Beirã inaugurada em 1998".
9. **Aluga-se só por inteiro (hoje) contra quartos à venda (antes).** Site
   antigo: "Quarto duplo 70,00 € - 90,00 €" e "Aluguer casa | por dia 400,00 € -
   800,00 €". Visit Vouzela (2026): "Espaço alugado na totalidade."
   "Alojamento dedicado a grupos. A casa é alugada na totalidade com um máximo
   de 16 pessoas." O Booking ainda lista "Quarto Duplo Standard" e "Quarto
   Twin Standard", sem disponibilidade. Vale a versão de 2026; os quartos
   soltos ficam históricos até o dono dizer o contrário.
10. **Camas.** Booking (casa com 8 quartos): 1 quarto individual, 4 de casal,
    3 com duas camas = 11 camas, que bate com o Airbnb ("11 camas"). Visit
    Vouzela: "oito quartos, tres com duas camas e os restantes com camas de
    casal". Diferença de um quarto individual.
11. **Horários.** Booking: check-in 16:00–21:00, check-out 08:00–10:00. Airbnb:
    check-in 16:00–20:00, check-out até às 10:00.
12. **Ténis.** O RNT lista "instalações para a prática desportiva: ténis" e o
    Booking "equipamento de ténis"; o Visit Vouzela fala de "ping-pong". Não
    há foto nem menção de hóspede a um campo de ténis. Pode ser ténis de mesa.
13. **Google 4,3 com tipo principal "piscina".** A ficha pode estar a juntar
    quem usou só a piscina (a casa é tratada pela Google como piscina). As 5
    reviews recolhidas são de hóspedes da casa; as outras 24 não se viram.
14. **Telefone no RNT (232 762 763)** diferente dos que a casa publica. Pode
    ser a linha da própria Aido Santo.

## A voz da casa contra as reviews

- A casa diz "Sinta-se como em sua casa, em ambiente acolhedor familiar." e os
  hóspedes confirmam-no mais do que qualquer outra coisa (ver
  `pontos-fortes.md`, ponto 1). Sem conflito.
- A casa promete pequeno-almoço caseiro; as reviews recentes contradizem
  (conflito 2).
- A casa diz que a Aido Santo tem "um aprazível espaço verde, onde se pode
  respirar ar puro"; uma review francesa diz que as noites podem ser
  perturbadas por cães e galos (A-012, 2018). A casa escreve ela própria "o
  cacarejar dos galos trazido pelo vento": é o mesmo facto visto de dois lados.
  Registado, sem conflito real.

## Recolha que ficou incompleta

- **Google:** 146 de 151 reviews da Casa Museu e 24 de 29 da Aido Santo ficaram
  por recolher: a lista de críticas não é servida sem sessão; recolhidas as 5
  que a Places API devolve para cada casa.
- **TripAdvisor:** 40 de 66 avaliações. Sem sessão, a paginação acaba na
  página 4 (as páginas seguintes vêm vazias em tripadvisor.pt e .com).
- **Booking da Aido Santo:** os 16 "comentários externos" que dão a nota 9,8
  não são mostrados.
- **Facebook e Instagram:** pedem sessão; só bios e cabeçalhos.
