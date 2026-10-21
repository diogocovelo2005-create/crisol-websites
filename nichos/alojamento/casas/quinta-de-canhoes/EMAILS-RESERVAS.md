# Emails do formulário de reserva

**Quem envia é o site, não a caixa de correio da Teresa.** Quando a Teresa
carrega num botão («Confirmar», «Não há estas datas», «Recebi o sinal»), o
servidor do site escreve e envia o email ao cliente. A caixa dela só recebe
os pedidos.

## Agora (testes)

- Sai pelo meu Gmail (diogocovelo2005@gmail.com), com uma palavra-passe de
  aplicação do Google.
- No `site/.env.local`: `GMAIL_UTILIZADOR` e `GMAIL_PASSE_APP`.
- A palavra-passe é só para os testes. A Teresa não tem de fazer nada.

## Em produção (quando publicar)

Envio pelo **Resend**, com o domínio **quintadecanhoes.com**.

- **Não é preciso comprar nem criar `reservas@quintadecanhoes.com`.** Verifica-se
  o domínio no Resend (3 ou 4 registos de DNS colados no painel onde o domínio
  está registado, uma vez só) e o site passa a poder enviar como
  `reservas@quintadecanhoes.com`.
- As respostas dos clientes vão para o Gmail da Teresa (o «responder para» de
  cada email aponta para lá).
- O Resend é grátis até 3000 emails por mês. A Teresa não tem palavra-passe
  nenhuma no sistema: nada se estraga se ela mudar a do Gmail.
- Se o domínio já tiver email, os registos do Resend não lhe mexem (usam um
  subdomínio à parte).

**Antes de publicar:**

1. Saber onde está registado o quintadecanhoes.com e quem tem acesso ao DNS.
2. Criar conta no Resend, adicionar o domínio e colar os registos de DNS.
3. No Netlify, nas variáveis do site:
   - `RESEND_API_KEY`
   - `SEGREDO_RESERVAS` (o mesmo do `.env.local`)
   - `EMAIL_REMETENTE` = `Quinta de Canhões <reservas@quintadecanhoes.com>`
   - `EMAIL_CASA` = email da Teresa (confirmar: casadecanhoes@gmail.com?)
   - sem `GMAIL_*`
4. Opcional: reencaminhar `reservas@` para o Gmail dela no registador, para quem
   escrever diretamente para esse endereço.

## Publicar a partir do computador (cuidado)

O `netlify deploy --build` feito no computador mete no servidor do site o que
estiver na pasta, incluindo `site/.env.local` e `site/.emails/`. Antes de
publicar, tirar esses dois da pasta (e repor depois). As variáveis de produção
vivem só no Netlify; `SITE_URL=https://quintadecanhoes.com` está lá.
