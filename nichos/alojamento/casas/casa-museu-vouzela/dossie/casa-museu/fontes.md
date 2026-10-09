# Fontes: Casa Museu

Uma das cinco casas do mesmo casal (ver `../como-se-ligam.md`). Dossiê
separado a 2026-09-25 a partir do dossiê conjunto de 2026-09-24 (arquivado,
intacto, em `../../arquivo/dossie-conjunto-2026-09-24/`), com recolha
acrescentada a 2026-09-25: o anúncio da Casa Museu no Airbnb, o Instagram
@casamuseu e as referências à Casa Museu nos anúncios do Penthouse e da Casa
das Ameias.

Recolha pelo browser (Playwright, sem sessão iniciada) e, para o Google, pela
Places API. Ponto de partida: a linha "Casa Museu" da tabela `crm_alojamento`
no Supabase (place_id `ChIJ_-BXHshBIw0R2dNI_v68L3Y`, R. Ribeiro Cardoso N°6,
3670-231 Vouzela, 232 771 514, site `http://www.casamuseu.com/`), o site antigo
e o link de partilha do Booking que o utilizador deu (`Share-Vh0Pph`).

## Tipo de casa e concelho

Alojamento Local, modalidade **estabelecimento de hospedagem**, concelho de
**Vouzela** (RNT). Bate com o pedido.

## Plano de percurso e identidade

| Fonte | O que foi percorrido | Campos que bateram | Estado |
|---|---|---|---|
| Supabase `crm_alojamento` | linha "Casa Museu" | nome, morada, telefone, site | confirmada (ponto de partida). A linha "Casa Museu da Geada - Turismo Rural" (Cinfães) **não é** esta casa |
| casamuseu.com (site antigo) | páginas PT e EN: Home, Casa Museu, Sobre, Contactos, Rota | telefone 232 771 514, email, RNAL 35686/AL | confirmada |
| Booking | anúncio, tabela de quartos (4 pesquisas), regras, informações importantes, perguntas e respostas, 58 comentários (6 páginas) e respostas abertas, galeria completa (66) | nome, morada, licença 35686/AL | confirmada (2026-09-24). O link `Share-Vh0Pph` abre este anúncio |
| Google Maps (Places API) | ficha e 5 reviews | nome, morada, 232 771 514, site | confirmada |
| TripAdvisor | "Casa Museu Hospedaria", 4 páginas de avaliações (40 de 66), originais abertos | nome, Vouzela, donos nomeados, link do próprio site | confirmada |
| Airbnb — "Casa Museu Guesthouse" | https://www.airbnb.pt/rooms/7085985: descrição, 19 comodidades, 3 avaliações (tradução desligada), fotos (12) | registo "35686/AL", anfitrião António (o mesmo perfil 37054129 da Aido Santo) | **novo a 2026-09-25**, confirmada |
| Visit Vouzela (Web Archive) | páginas inicial, Casa Museu, Quartos Casa Museu, Rota do Pastel, Contato, Voucher, Vídeo (cópias de abril a junho de 2026) | 232 771 514, 966 059 265, info@casamuseu.com, 35686/AL | confirmada; é o site mais recente da casa |
| Instagram @casamuseu | perfil público (bio e datas das publicações) | bio "Casa do século XVIII no centro histórico de Vouzela", cita @casaaidosanto e @casadasameias | **novo a 2026-09-25**; só bio (254 seguidores, 7 publicações de 2020–2021) |
| Registo Nacional de Turismo | RNAL 35686 | número, nome, titular | confirmada (ver `compliance.md`) |
| Facebook | página "Casa Museu" | — | bloqueado: "não disponível" sem sessão |
| Booking — Penthouse e Casa das Ameias | anúncios das casas irmãs | falam da Casa Museu (ver abaixo) | **novo a 2026-09-25** |

## A Casa Museu vista das outras casas do grupo

- **Check-in das outras casas:** "A Casa Museu situa-se no centro histórico de
  Vouzela. Onde poderá fazer o Check-in para os outros Alojamentos Locais como
  As Penthouse Low-Cost, Casa das Ameias ou BIKEINN." `[OFICIAL]` Visit Vouzela,
  página inicial.
- **Upgrade do Penthouse para a Casa Museu:** "Não estive na penthouse porque o
  alojamento não tinha elevador, fiquei no primeiro piso da casa museu por um
  suplemento de preço." `[OPINIAO]` review B-052 do Penthouse (Fernando,
  Booking, set. 2024). Ver `../penthouse/reviews.md`.
- **Estacionamento na Casa das Ameias:** "Temos estacionamento fechado na Casa
  das Ameias." `[OFICIAL]` resposta da casa no Booking da Casa Museu, 2022. Os
  hóspedes da Casa das Ameias confirmam uma garagem com acesso direto
  (`../casa-das-ameias/reviews.md`, B-045 e B-022 dela).
- **Contactos partilhados:** o mesmo 232 771 514, 966 059 265 e
  info@casamuseu.com servem as cinco casas.

## Conflitos e o que ficou por verificar

1. **`[A_VERIFICAR]` Século do edifício — agora três versões.** Site antigo,
   Visit Vouzela (bloco final) e Instagram (2026): "século XVIII". Visit
   Vouzela (primeiro bloco da página Casa Museu, 2026): "construiram este
   edificio à 15 anos tentando preservar as caracteristicas deste edificio do
   séc. XVI". **Airbnb (novo): "Este hotel de séc.XVII".** Uma review de 2008
   (T-040) fala de "remnants of several roman columns". O site não deve fixar o
   século até o dono confirmar.
2. **`[A_VERIFICAR]` Pequeno-almoço hoje.** A casa promete (Visit Vouzela,
   2026): "O nosso pequeno-almoço é servido na sala ou no quarto […] Os bolos
   as compotas são caseiros e feitos no hotel." O Airbnb marca "Pequeno almoço
   incluído". O Booking vende-o à parte ("Bom pequeno-almoço por € 10") e há uma
   tarifa "económica sem pequeno almoço" (resposta da dona a B-045). Entre 2023
   e 2025, cinco hóspedes dizem que não houve ou não lhes foi servido: B-020
   (set. 2025), B-030 (jun. 2025), B-038 (ago. 2024), B-045 (ago. 2024), T-002
   (set. 2023). Os elogios são quase todos de 2012 a 2022 (TripAdvisor), um de
   2024 (B-052) e um do Airbnb de 2018 (A-001). Não se resolve aqui.
3. **`[A_VERIFICAR]` Estacionamento.** Booking, comodidades: "Sem
   estacionamento disponível." Airbnb (novo): "Estacionamento gratuito no
   local". Booking, perguntas: garagem fechada (2021) e "Temos estacionamento
   fechado na Casa das Ameias." (2022). Hóspedes: quatro queixam-se (B-032,
   B-037, T-005, G-003); três dizem que há parque grátis ao lado (B-035, T-016,
   T-040). A explicação mais provável é a garagem da Casa das Ameias, na rua de
   trás, mas falta o dono dizê-lo.
4. **`[A_VERIFICAR]` Código postal.** RNT: 3670-**257**. Google, Booking e
   Visit Vouzela: 3670-**231**. A casa fica na esquina da Rua Ribeiro Cardoso
   com a Praça Morais Carvalho.
5. **Telefones.** 232 771 514 (fixo, em todo o lado), 232 772 614 (só no site
   antigo), 966 059 265 (telemóvel). Não é conflito.
6. **Preços do site antigo (sem data).** "Quarto duplo A.P.A. 60,00 € -
   100,00 €", "Pacote Romântico 110 €"; a versão inglesa tem valores
   diferentes. Históricos; não usar.
7. **"Telefone" no quarto** (site antigo e Visit Vouzela) — o Booking não o
   lista.
8. **Capacidade no Airbnb:** "Mais de 16 viajantes · 11 quartos · 14 camas · 13
   casas de banho" e "Alojamento inteiro: casa". O RNT diz 25 utentes e 11
   quartos; o Booking vende quartos. O anúncio do Airbnb parece pensado para
   alugar a casa inteira a grupos; não há prova de que isso se faça hoje.
   `[A_VERIFICAR]`

## A voz da casa contra as reviews

- "Sinta-se como em sua casa, em ambiente acolhedor familiar." — confirmado
  pelos hóspedes mais do que qualquer outra coisa (`pontos-fortes.md`, ponto 1).
- Pequeno-almoço caseiro — contradito pelas reviews recentes (conflito 2).

## Recolha que ficou incompleta

- **Google:** 146 de 151 reviews ficaram por recolher (a lista não é servida
  sem sessão); recolhidas as 5 da Places API.
- **TripAdvisor:** 40 de 66 avaliações (sem sessão, a paginação acaba na página 4).
- **Facebook e Instagram:** pedem sessão; só bios.
- **Airbnb:** sem datas com preço (o anúncio pede datas; não se pesquisou
  disponibilidade, porque o Booking é o canal que a casa indica).
