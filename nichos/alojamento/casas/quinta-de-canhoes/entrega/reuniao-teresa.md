# Reunião com a D. Teresa · fechar o site da Quinta de Canhões

Guião para o Diogo. Por ordem. ~1h15.

---

## Antes da reunião (hoje, sozinho)

- [ ] Google Maps (computador): procurar «Quinta de Canhões, Várzea» e anotar:
      aparece «Reclamar esta empresa / É o proprietário?» (ficha sem dono) ou não
      (alguém já a gere)? Que website, telefone e horário tem?
- [ ] Ter aberto `entrega/google-business-profile.md` (textos prontos a colar) e as
      fotos escolhidas em `site/public/fotos/`.
- [ ] Ter à mão: login da conta reservas.casadecanhoes@gmail.com e os códigos de
      recuperação; acesso ao Netlify e ao Porkbun.
- [ ] Telemóvel teu pronto para fazer um pedido de demonstração em
      quintadecanhoes.com/reservar.

---

## 1 · Mostrar o formulário e ensinar os botões (15 min)

Faz tu um pedido no teu telemóvel e mostra-lhe, no teu email (ainda és tu a
receber), o que ela vai receber.

O que ela tem de saber:

| Quando | O que faz |
|---|---|
| Chega «Reservas - Nome (CAN-…) - Novo pedido» | Abre o pedido e decide |
| Há lugar | **Confirmar disponibilidade** (pode ajustar o total; decide o animal > 8 kg) |
| Não há lugar | **Não há estas datas**: a página sugere sozinha outras datas e outros quartos; ela escolhe até 3 |
| Não quer aceitar | **Recusar o pedido** |
| Confirmou | **Fechar essas noites no Booking** (o email lembra) |
| O dinheiro entrou (MB WAY / banco) | **Recebi o sinal** → o hóspede recebe «Reserva confirmada» |
| O sinal não chegou no prazo | **O sinal não chegou** → cancela e liberta as noites |
| O hóspede desiste depois de pagar | **Cancelar reserva** → a página diz quanto devolver |
| O hóspede não vê o email | **Enviar por WhatsApp** (os dados de pagamento já escritos) |

- Todas as manhãs (8–9h) pode receber um email-resumo: pedidos por responder e
  sinais em atraso.
- O restante (70 %) paga-se à chegada.

---

## 2 · Confirmar com ela (10 min)

- [ ] **Email dela**: é mesmo casadecanhoes@gmail.com?
- [ ] **Estadia mínima**: 1 noite em todo o ano? Há épocas com mínimo (agosto,
      fins de semana, feriados)?
- [ ] **Épocas em que a quinta fecha** (inverno? Natal/Ano Novo?).
- [ ] **Preços**: o site usa 86 € Duplo / 77 € Twin / 113 € Suite (o que o Booking
      mostra com a promoção dela, ~10 %). Essa promoção é permanente? Concorda?
      Há preços diferentes em agosto ou feriados?
- [ ] **Cama suplementar (3–10 anos, 25 €/noite)**: cabe em todos os quartos? Só uma
      por quarto? Na casa inteira (600 €/noite) já está incluída?
- [ ] **Animais com mais de 8 kg**: aceita? Cobra alguma coisa?
- [ ] **Prazo para pagar o sinal**: 48 horas está bem?
- [ ] **Dados de pagamento** (mostrar no telemóvel): IBAN PT50 0045 3120 4029 0713 341 57,
      titular Teresa Gomes, MB WAY 964 506 038. Confirmar que estão certos.
- [ ] **Check-in 15h–21h, check-out até às 11h**: certo?

Anota as respostas; o que mudar, trato eu depois numa só publicação.

---

## 3 · O Gmail dela passa a receber os pedidos (10 min)

No Gmail dela (computador ou telemóvel):

- [ ] Adicionar **reservas.casadecanhoes@gmail.com** aos contactos.
- [ ] Criar filtro: De `reservas.casadecanhoes@gmail.com` → **Nunca enviar para spam**
      (Gmail no computador: pesquisa → ícone dos filtros → «Criar filtro»).
- [ ] Dizer-me (Claude) que está feito → troco `EMAIL_CASA` para o dela no Netlify e
      publico. Depois fazes um pedido de teste e ela vê-o chegar no telemóvel dela.
- [ ] Os avisos de falha técnica continuam a ir para ti (`EMAIL_ALERTAS`).

---

## 4 · Google Business Profile (25 min) — o que mais traz reservas

**a) Ficar com a ficha**

- **Primeiro, ver se já é dela:** no Gmail dela, pesquisar «o meu perfil da empresa» ou
  abrir business.google.com. Se aparecer a Quinta de Canhões com painel de edição, é a
  dona → ela adiciona-te como **Gestor** (Perfil → ⋮ → Definições do perfil → Pessoas e
  acesso → Adicionar → o teu email → Gestor → Convidar). Sem verificação nem
  transferência: salta a b) e a d). Se houver dois perfis da casa, juntar/apagar o duplicado.
- Se a ficha **não tem dono**: no Maps, «Reclamar esta empresa» com a TUA conta Google.
- Se **já tem dono**: perguntar-lhe se é ela (ou um familiar) que a gere. Se sim, essa
  pessoa entra e adiciona-te como **Gestor** (Perfil → ⋮ → Definições do perfil →
  Pessoas e acesso → Adicionar). Se ninguém sabe: «Pedir acesso» (3 a 7 dias).

**b) Verificação** — o Google escolhe o método:

- Chamada / SMS para o telefone da quinta → ela diz-te o código.
- Postal (~2 semanas) → ela guarda o código e liga-te.
- Vídeo → tem de ser gravado na quinta (placa, entrada, prova de que gere a casa).
  Se for este, combina gravá-lo com ela na reunião, se a reunião for lá.

**c) Preencher** (copiar de `entrega/google-business-profile.md`)

- Categoria principal: Turismo rural (ou «Casa de campo»); secundária: Alojamento com pequeno-almoço.
- Website: `https://quintadecanhoes.com`
- Link de reservas: `https://quintadecanhoes.com/reservar`
- Descrição (já escrita), telefone, morada, check-in/check-out.
- Atributos: piscina, pequeno-almoço, estacionamento, aceita animais, Wi-Fi, ar condicionado.
- Fotos: as 11 da lista (capa = vista do vale).
- Primeira publicação: «Já pode reservar diretamente no nosso site…».

**d) Passar a ficha para ela**

- Perfil → Pessoas e acesso → Adicionar → casadecanhoes@gmail.com → **Proprietário**.
- Ela aceita o convite no email **durante a reunião** (único passo dela).
- Daqui a 7 dias: Pessoas e acesso → **Transferir propriedade** para ela. Tu ficas Gestor.

**e) Avaliações** (o fator n.º 1 no Maps)

- No perfil: «Pedir avaliações» → copiar o link curto.
- Ela envia esse link aos hóspedes no fim da estadia (WhatsApp). Pedir-lhe que o faça
  sempre. Responder às avaliações, mesmo às boas.

---

## 5 · O site nos sítios onde a casa já aparece (10 min)

Fazer com ela (precisa dos logins dela) ou pedir-lhe autorização para tratares:

- [ ] Instagram @quintadecanhoes: link na biografia → quintadecanhoes.com
- [ ] Facebook: campo «Website» da página
- [ ] TripAdvisor: reclamar a ficha (Management Center) e pôr o website
- [ ] VisitPortugal e Turismo do Centro: email a pedir a atualização do website
      (posso redigi-lo)
- [ ] RNT (Registo Nacional de Turismo, RNET 1638): atualizar o website no registo
- [ ] WhatsApp Business (se usa): link do site no perfil

---

## 6 · Entrega e o que é dela (5 min)

- [ ] Dar-lhe a tabela «O que é seu e onde está» (`entrega/emails-do-site-teresa.md`).
- [ ] Explicar que vai receber um email da Google: «foi adicionada como proprietária
      do Search Console». Não tem de fazer nada.
- [ ] Netlify: se ela receber emails sobre «usage» ou créditos, reencaminha-tos.
- [ ] Reservas no Booking: continuam a ser fechadas à mão quando confirma um pedido
      do site (a ligação automática Booking ↔ site fica para depois).

---

## Depois da reunião (Diogo + Claude)

- [ ] Trocar `EMAIL_CASA` para o dela, publicar e testar com um pedido real (Claude).
- [ ] Aplicar as respostas da secção 2 (preços, estadia mínima, cama suplementar…)
      numa só publicação.
- [ ] Conta reservas.casadecanhoes: reencaminhar para ela os emails que voltam para trás
      (Gmail → Definições → Filtros: «mailer-daemon» → Reencaminhar).
- [ ] Bing Webmaster Tools → Importar do Search Console.
- [ ] Trocar o token do Netlify e a palavra-passe de aplicação do Gmail das reservas.
- [ ] Daqui a 7 dias: transferir a propriedade principal do Business Profile.
- [ ] Daqui a 30 dias: ver créditos do Netlify (Usage & billing) e o Search Console
      (Indexação → Páginas, Desempenho).
