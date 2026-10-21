# Quinta de Canhões · notas do site

## Formulário de reserva (/reservar), ronda de 2026-10-17

Só a frente: o envio está simulado (`site/lib/reserva-envio.ts`, `enviarPedido(pedido)`),
pronto a trocar por um POST a uma Netlify Function. Sem emails nesta ronda.

- `site/lib/reserva.ts`: quartos, preços (Booking 2026-10-17, tarifa flexível com
  desconto 86/77/113; base sem desconto 95/85/125), períodos (vazio), pequeno-almoço
  8 €/pessoa/noite, sinal 30 %, `QUANDO_RESTANTE` e `POLITICA_SINAL` (provisórios),
  `NOITES_OCUPADAS` por tipo (vazio, para o iCal), `UNIDADES_MAX` (só trava o +),
  validações e `montarPedido` (o pedido autocontido).
- Arredondamento: total ao euro (Math.round); sinal = ceil(total × 30 %);
  restante = total − sinal.
- `site/components/reserva/FormularioReserva.tsx`: três passos; o botão da barra diz
  o que falta.
- A página: hero (texto ajustado ao formulário) → formulário → «Prefere falar com a
  Teresa?» (os contactos e as vantagens que já lá estavam) → onde é.
- Movimento: só a troca de passos (sobe 8 px e aparece, 240 ms; sai em 140 ms), o
  interruptor do pequeno-almoço (desliza 200 ms) e os botões a encolher ao premir.
  O resto muda de estado sem animação: é um formulário, lê-se e preenche-se.

### Casa inteira e sugestão (segunda ronda)
- Interruptor «Quarto a quarto / A casa inteira»; a casa inteira substitui os cartões.
  `PRECO_CASA_INTEIRA` = null: o resumo diz que o preço vem na resposta da Teresa e
  que o sinal é 30 % desse valor; o pequeno-almoço continua a somar por pessoa.
- Lugares: Duplo 2, Twin 2, Suite 3 (casal + sofá-cama). Sugestão: de todas as
  combinações com lugar para todos, a de menos quartos e, em empate, a mais barata
  (1–2 pessoas: sempre o Duplo); a partir de `SUGERIR_CASA_A_PARTIR_DE` (11) pessoas
  sugere a casa inteira,
  com a alternativa quarto a quarto. A sugestão aparece escrita com quantidades,
  com «Aplicar a sugestão», e cada cartão diz «Sugerido: n».

### Por confirmar com a Teresa
- Preço por noite da casa inteira (`PRECO_CASA_INTEIRA`), lotação da casa
  (`CASA_INTEIRA_LUGARES`, soma dos lugares com `UNIDADES_MAX` = 14) e a partir
  de quantas pessoas se sugere (11).
- Quando se paga o restante (provisório: «à chegada à quinta»).
- O que acontece ao sinal se o hóspede cancelar (provisório: «As condições de
  cancelamento seguem com a confirmação da casa.»).
- Quantos quartos de cada tipo existem (`UNIDADES_MAX` está a 2/2/2).
- Estadia mínima (1) e as 2 noites sugeridas no calendário.
- Se as crianças pagam pequeno-almoço e contam como pessoa.
- Que preço usar: com o desconto do Booking ou o base.

## Backend das reservas (sem base de dados), 2026-10-17

- `site/app/api/reserva` (pedido do formulário) e `site/app/api/reserva/acao` (ações da
  casa e do hóspede): Route Handlers, que o Netlify corre como funções.
- `site/lib/servidor/`: `config.ts` (variáveis, dados de pagamento de TESTE, prazo do
  sinal 48 h, validade dos links 60 dias), `assinatura.ts` (token = deflate+base64url
  + HMAC-SHA256, `timingSafeEqual`, tipo e validade dentro), `email.ts` (Gmail SMTP com
  nodemailer se houver `GMAIL_UTILIZADOR`/`GMAIL_PASSE_APP`; senão Resend por fetch; senão
  grava em `.emails/`), `emails.ts` (HTML + texto), `fluxo.ts` (passos).
- O servidor refaz as contas com `lib/reserva.ts` (`recalcularPedido`) e só assina isso.
- Páginas: `/pedido/[token]` (casa, noindex), `/proposta/[token]` (hóspede, aceita com
  um clique, não ao abrir), `/dev/emails` (só em dev).
- Anti-spam: campo escondido `site` + 4 s mínimos; finge sucesso e não envia.
- Variáveis em `site/.env.example`.
- Emails: um só modelo (`site/lib/servidor/modelo-email.ts`: logotipo com troca para o
  modo escuro e texto vivo no Gmail, frase a vermelho, cartão de destaque, bilhete da
  estadia com foto, botões em tabela, detalhes pequenos); os nove emails em `emails.ts`.
  Pré-visualização de todos em `/dev/emails` (só em dev). `EMAIL_PREFIXO_ASSUNTO` marca
  testes; `EMAIL_COPIA_LOCAL=1` guarda cópia em `.emails/` do que sai a sério.
- Sem email «Recebemos o seu pedido» (o passo 3 do site explica: precisa de confirmação;
  se houver lugar, email com o sinal; se não, email com novas datas; ver o spam/WhatsApp).
  A casa fala no plural e assina «Quinta de Canhões». Assuntos à casa:
  «Reservas - Nome (ref) - Novo pedido / Fechar datas no Booking / Aceitou novas datas / Alerta de falha».
- Dados da Teresa (2026-10-20): casa inteira 600 €/noite, mínimo 2 noites (formulário e
  servidor); MB WAY 964 506 038 (padrão em config; IBAN/titular só pelo ambiente, titular
  vazio = sem linha); política do sinal «até 10 dias antes, devolvemos metade»; animais até
  8 kg gratuitos («Traz um animal?» no passo 1, no pedido, emails e página da casa).
  Crianças: por definir.
- EMAIL_CASA: em produção (só no Netlify) casadecanhoes@gmail.com; nos testes e por defeito
  no código, diogocovelo2005@gmail.com. Nunca mandar testes à casa.
- Crianças (2026-10-20): até 3 anos grátis (berço, sem lugar); 3–10 cama suplementar 25 €/noite
  com pequeno-almoço incluído (1 por quarto, a confirmar; na casa inteira não paga, configurável);
  mais de 10 como adulto. Restante (70 %) à chegada, confirmado. Titular: Teresa Gomes (no ambiente).
- RGPD (2026-10-20): /privacidade (indexável), ligada no rodapé, no passo 2 do formulário e
  no rodapé dos emails. Cookies: nenhum próprio nem analytics; fontes servidas pelo site
  (next/font); o único terceiro é o mapa do Google Maps embebido no rodapé (cookies da Google).
- Cama suplementar: nenhum texto visível afirma limites por quarto nem a inclusão na casa inteira.
- Cookies (2026-10-20): o mapa do Google no rodapé só carrega com consentimento (aviso em
  baixo quando o rodapé se aproxima, ou «Mostrar o mapa»); escolha em localStorage;
  «Preferências de cookies» no rodapé reabre o aviso. Sem aviso automático em /pedido, /proposta, /dev.
- SEO (2026-10-21): domínio https://quintadecanhoes.com (lib/seo.ts: SITE + metadados()); cada
  página com canonical, título, descrição, og e twitter próprios; og.jpg 1200×630; app/robots.ts e
  app/sitemap.ts; JSON-LD BedAndBreakfast sem avaliações; h1 escondido em /os-quartos.
