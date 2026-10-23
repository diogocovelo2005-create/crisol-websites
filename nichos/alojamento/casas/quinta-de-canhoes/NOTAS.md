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
  (`CASA_INTEIRA_LUGARES`, soma dos lugares com `UNIDADES_MAX` = 16) e a partir
  de quantas pessoas se sugere (11).
- Quando se paga o restante (provisório: «à chegada à quinta»).
- O que acontece ao sinal se o hóspede cancelar (provisório: «As condições de
  cancelamento seguem com a confirmação da casa.»).
- Quantos quartos de cada tipo existem: resolvido, 2/2/2 (o Diogo, 2026-10-21).
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

## Rapidez (2026-10-21)

Página inicial, build de produção local, Lighthouse mediana de 5, fluidez com CPU ÷4.

**Gargalo:** as fotos dos cartões da página inicial (4 estadias no carrossel/acordeão,
4 lugares da «volta») iam em bruto, sem `srcset`: 2,5–4 MB cada (originais de 2528–3888 px
para caixas de 330–980 px), todas pedidas logo no arranque. 17,5 MB por visita; o
Lighthouse simulado punha o LCP em 47 s no telemóvel, porque esses bytes começam antes de o
hero acabar de pintar e somam-se à conta. O hero em si está bem (LCP observado ≈ FCP).

**Aplicado** (nada muda à vista; as fotos não perdem qualidade):
- `scripts/tamanhos.mjs` gera versões mais pequenas com a mesma qualidade JPEG do original
  (estadias a 100; lugares a 92, acima dos originais ~87–90): `public/fotos/tamanhos/`
  piscina, quarto-duplo, quarto-twin, suite (1024/1280/1440/1920), aldeia-pena
  (640/960/1280/1920), serra-arada e vouga (640/960/1280), termas (640/960). O original
  continua no `srcset` para ecrãs que precisam dele.
- `srcset` + `sizes` calculados contra a caixa real (object-cover): estadias
  `(max-width: 767px) 640px, max(59vw, 830px)` (piscina 760/980 px); lugares
  `27rem/25rem/23rem` (aldeia, 2,2:1, `490px`). Iguais no carrossel e no acordeão, para
  o telemóvel reutilizar o pedido do HTML. `loading="lazy"` nos dois e na pilha.
  Ficheiros: `components/landing/OpcoesDeEstadia.tsx`, `AVoltaPilha.tsx`,
  `components/reactbits/DepthCarousel.tsx`, `AccordionGallery.tsx`.
- Hero: `width`/`height` reais nos `<source>` do telemóvel (aviso de proporção; o CSS
  manda no tamanho, nada muda).

| | antes | depois |
|---|---|---|
| Telemóvel nota (corridas) | 65 (65,65,66,65,65) | 75 (75,75,74,75,75) |
| Telemóvel LCP observado / simulado | 164 ms / 46,9 s | 206 ms / 19,6 s |
| Telemóvel TBT / CLS | 12 ms / 0 | 54 ms / 0 (repetição: 22 → 36 ms; ruído, < 100) |
| Telemóvel peso | 17,5 MB | 7,1 MB |
| Computador nota (corridas) | 66 (66,66,70,69,65) | 81 (81,80,81,81,81) |
| Computador LCP observado / simulado | 203 ms / 8,6 s | 238 ms / 3,5 s |
| Computador TBT / CLS | 0 / 0 | 0 / 0 |
| Computador peso | 18,0 MB | 6,0 MB |
| Frames telemóvel p95 / >25 ms | 17,5–18,1 / 0–0,3 % | 17,6–18,1 / 0,1–0,3 % |
| Frames computador p95 / >25 ms | 32,2–32,9 / 6,1–7,1 % | 31,9–33,3 / 5,5–7,2 % |

Frames em corridas alternadas antes/depois: iguais dentro do ruído. O p95 de ~33 ms no
computador já existia; não é o blur (`--css` sem backdrop-filter: igual). Fica por investigar.

`rapidez-igual`: as diferenças estão todas dentro das caixas das fotos (média 12–19 níveis
por canal), reamostragem de uma fonte de outro tamanho; vistas lado a lado, iguais.
Texto, geometria e animações iguais nos quatro casos.

**Propostas (não aplicadas):**
- Hero no telemóvel: `hero-telemovel.jpg` (1316 px, 770 KB) e `hero-vale-mobile.webp`
  são o LCP; uma versão de ~1080 px só serviria a ecrãs de densidade < 2 (o Lighthouse
  emula 1,75; os iPhones são 3 e precisam do original). Ganho real pequeno, mexe no hero.
- AVIF/WebP para as fotos dos cartões: −50–70 % de bytes, mas é troca de formato; só com
  prova foto a foto.
- Cache das fotos em `/fotos/*` no Netlify: os nomes não têm hash, por isso uma cache
  longa obrigaria a mudar o nome ao trocar uma foto. Hoje revalidam com ETag (304).

**Recusado:** tirar `framer-motion` do package.json (ninguém o importa, mas é dependência
do `motion` à mesma; zero bytes no bundle, só mexia no lock).

Cópia de antes: `arquivo/site-2026-10-21-antes-rapidez/` (sem node_modules, .next e
.env.local). Medidas em `arquivo/rapidez/`.

### Rapidez, 2.ª ronda (2026-10-21): AVIF e hero

- **AVIF nas 4 fotos das estadias** (carrossel/acordeão), aprovado pelo Diogo:
  `<picture>` com `<source type="image/avif">` e o JPEG por baixo (browsers sem AVIF).
  Feitos do original a 90, 4:4:4 (`scripts/tamanhos.mjs`), larguras 1024/1280/1440/1920 e
  a do original. Mais fiéis ao original do que os JPEG (PSNR 40–45 dB; cor média igual a
  ±0,15) e 50–70 % mais leves. Comparados ampliados 2× (relva, alcatifa, couro, colchas,
  parede lisa): sem diferença. `rapidez-igual`: «Tudo igual» nos quatro casos.
- **Ficam em JPEG** as 4 da volta (termas, serra da Arada, aldeia da Pena, Vouga): a 80 o
  AVIF alisa o grão do céu (termas, aldeia); a 88 pesa o mesmo que o JPEG.
- **Hero do telemóvel a ~1080 px: não aplicado.** No telemóvel a foto é esticada ao ecrã
  (object-fit: fill) e a janela aproxima-se até 1,47×, por isso a largura precisa é
  max(100vw, 55,8svh) × 1,47 × densidade: 1181 px já no aparelho do Lighthouse
  (412×823, 1,75) e mais em qualquer telemóvel real. Uma versão de 1080 px nunca seria
  escolhida sem ficar abaixo do tamanho visto. AVIF do hero também não compensa
  (770 → 640 KB à mesma qualidade).

| | antes | depois |
|---|---|---|
| Telemóvel nota | 75 (×5) | 75 (×5) |
| Telemóvel LCP observado / simulado | 206 ms / 19,5 s | 162 ms / 17,6 s |
| Telemóvel TBT / CLS | 45 ms / 0 | 38 ms / 0 |
| Computador nota | 81 (×5) | 84 (83–84) |
| Computador LCP observado / simulado | 208 ms / 3,5 s | 217 ms / 2,9 s |
| Frames telemóvel p95 / >25 ms | 17,5 / 0,1 % | 17,6 / 0,2–0,3 % |
| Frames computador p95 / >25 ms (5 pares alternados) | 32,6–33,4 / 6,0–12,4 % (mediana 6,9) | 32,9–33,9 / 6,0–14,2 % (mediana 7,7) |

O LCP simulado do telemóvel continua a vermelho por causa do próprio hero (770 KB +
494 KB, já no tamanho mínimo que o zoom pede). Fluidez no computador: igual dentro do
ruído, com tendência ligeira para pior (AVIF custa mais a descodificar); se o Diogo notar
algo no acordeão, reverter é tirar o `avifSrcSet` das 4 opções em `OpcoesDeEstadia.tsx`.
Cópia de antes: `arquivo/site-2026-10-21-antes-avif/` (só código).

**Decisão (2026-10-21):** o AVIF da 2.ª ronda NÃO foi aplicado. O Diogo escolheu não publicar: ganho pequeno na nota e tendência ligeira para o scroll piorar no computador (fluidez acima de velocidade). Código e ficheiros .avif revertidos.
- Scroll entre páginas (2026-10-21): o Lenis acabava a inércia depois da navegação e a página
  nova abria a meio; ScrollSuave pára-o no layout effect da mudança de caminho, e um clique
  para a própria página leva ao topo. public/llms.txt criado.
- Reservas com memória mínima (2026-10-21): registos em Netlify Blobs (loja «reservas»; em casa,
  site/.dados/, fora do git e do deploy). Estados novo/proposta/confirmado/pago/recusado/cancelado/
  expirado; referência CAN-AAMM-NN; duplicados 15 min; calendário próprio (/api/disponibilidade);
  alternativas automáticas; ajustar total, animal >8 kg, sinal não chegou, cancelar com devolução;
  lembretes diários (netlify/functions/lembretes.mts → /api/lembretes). UNIDADES_MAX 2/2/2 definitivo; Suite para 4 (cama de casal + dois sofás-cama), lotação 16.

### Rapidez, 3.ª ronda (2026-10-22): tráfego das páginas interiores

- `/a-casa` (jardim em socalcos e «Um dia») e `/os-quartos` (fotos dos quartos) passam
  a ter `srcset` com versões em JPEG à qualidade do original (`scripts/tamanhos.mjs`;
  listas e larguras em `lib/tamanhos.ts`; `components/FotoTamanhos.tsx` é o mesmo
  `<img>` que o `<Image fill unoptimized>` gerava, com srcset). `sizes` calculado da caixa
  real e verificado em 390@3, 412@1,75, 768@2, 1024, 1440 e 1920: nenhuma foto servida
  abaixo do tamanho visto (os ecrãs de densidade 3 recebem o original). Lazy como antes.
- Cortinas e heróis (capa-quartos, dia-piscina, heroreservar) não mudaram: os originais
  (768–1024 px) já são mais pequenos do que o ecrã. `/reservar` usa o otimizador do Next.
- Os PNG de 8–13 MB (hero.png, *-nova.png) não são pedidos por nenhuma página.
- `netlify.toml`: `Cache-Control: public, max-age=604800` em `/fotos/*` (não testável em
  local). Ao trocar uma foto pelo mesmo nome, quem já visitou pode vê-la antiga até 7 dias.

Peso transferido, build local (sem scroll → com scroll até ao fim):

| | antes | depois |
|---|---|---|
| Telemóvel /a-casa | 4,37 → 9,84 MB | 3,82 → 5,78 MB |
| Telemóvel /os-quartos | 2,51 → 6,21 MB | 1,30 → 2,88 MB |
| Computador /a-casa | 3,10 → 8,57 MB | 2,69 → 5,45 MB |
| Computador /os-quartos | 2,51 → 6,21 MB | 1,87 → 4,63 MB |
| / e /reservar | iguais | iguais |

`rapidez-igual`: as diferenças estão só dentro das fotos (reamostragem; a versão nova fica
até ligeiramente mais nítida) e no carrossel das comodidades, que roda sozinho; o antes
comparado consigo dá 0 %. Fluidez (CPU ÷4, pares alternados): igual nas duas páginas.
Cópia de antes: `arquivo/site-2026-10-22-antes-trafego/` (só código).

## Última ronda antes da publicação (2026-10-23)

- **Preços da casa** (a D. Teresa, 23 out 2026): Duplo 64 €, Twin 61 €, Suite 97 € (para 2 pessoas), em `lib/reserva.ts` (TARIFAS). O `priceRange` do JSON-LD sai daí (61–97 €). O llms.txt não tem preços.
- **Crianças dos 3 aos 10:** 15 €/noite cada, com cama suplementar e pequeno-almoço, **só nas Suites** (dois sofás-cama por Suite: `SOFAS_CAMA_POR_SUITE`). `faltaSuite()` trava o formulário («Escolha uma Suite para as crianças») e o servidor recusa o pedido com uma mensagem clara. Na casa inteira não pagam nada a mais. Até 3 anos: grátis, com berço.
- **Suite com 3 ou 4 adultos:** fica ao preço da Suite. O hóspede vê junto do total «Com mais de 2 adultos na Suite, o preço final é confirmado pela casa.» A casa vê a etiqueta «Suite com N adultos — confirme o total» (na página do pedido e no email) e usa «Ajustar total». As sugestões nunca põem mais de 2 adultos numa Suite, para levarem sempre um total certo.
- **Animais:** até 8 kg ficam com o hóspede, gratuitos; com mais de 8 kg ficam no canil da quinta, sem custo. Saíram o «a decidir», o passo de aceitar ou recusar na confirmação e as etiquetas vermelhas. A casa lê só «Animal com mais de 8 kg (canil)». Textos mudados no formulário, em /reservar, na pergunta de /os-quartos e nos emails.
- **Morada:** Rua de Canhões, 501, Canhões, Várzea, 3660-682 São Pedro do Sul (`lib/contactos.ts`). Aparece no rodapé, no mapa do rodapé, em /reservar, em /privacidade, nos emails, no JSON-LD e no llms.txt.
- **Classificação:** Turismo em Espaço Rural (RNET 1638), em todo o lado.
- **Spam:** no passo 2 e no passo 3 do formulário, «A nossa resposta vem de reservas.casadecanhoes@gmail.com. Se não a vir na caixa de entrada, veja no spam (e adicione-nos aos contactos).» No fim de cada email ao hóspede, em letra pequena, vai uma linha equivalente.

### Sugestões (sem pequeno-almoço, por noite)
1–2 adultos: Duplo (64) · 3–4: 2 Twin (122) · 5–6: Duplo + 2 Twin (186) · 7–8: 2 Duplo + 2 Twin (250) · 9–10: mais 1 Suite (347) · 11–12: tudo (444) · 13–16: casa inteira (600). Com crianças dos 3 aos 10: 2 adultos + 1 criança → Suite (112); 2 + 2 → Suite (127); 2 + 3 → 2 Suites (239); 4 + 2 → Twin + Suite (188).

### À volta: dois lugares novos
- **Parque das Nogueiras** (cartão publicado; 3 km, cerca de 3 minutos de carro, contados a partir do centro de Várzea porque não temos as coordenadas exatas da quinta).
  - Localização e Ecopista ao lado: OpenStreetMap/Nominatim («Parque Urbano das Nogueiras», Bairro da Ponte, São Pedro do Sul; 40.7585, -8.0603). A Ecopista do Vouga e a Ponte do Forno Telheiro (antiga Linha do Vouga) ficam junto ao parque.
  - O que se diz do parque (nogueiras, relvado, bancos, pérgola, roda de água, arco de pedra) vem das fotografias de Vitor Oliveira no Wikimedia Commons.
  - Foto: «Parque Urbano das Nogueiras - São Pedro do Sul - Portugal (54350846966).jpg», Vitor Oliveira, CC BY-SA 2.0, Wikimedia Commons. Os créditos estão no rodapé.
- **Poço Azul** (cartão pronto mas escondido, com `imagem: null`, à espera de foto; 15 km, cerca de 17 minutos de carro).
  - Fontes: aquapolis.com.pt/poco-azul-praia-fluvial-selvagem-perto-de-santa-cruz-da-trapa/ (40.7810, -8.1652; Ribeira da Landeira; uma pequena cascata, granito polido, merendas, os últimos 500 m a pé e a descer); centerofportugal.com/pt/poi/poco-azul; Wikipédia «Santa Cruz da Trapa».
  - Não encontrei nenhuma foto com licença livre (a «Poço Azul - Pisão - Termas» do Commons é outro sítio). Quando houver foto: pôr em `public/fotos/`, juntá-la ao `scripts/tamanhos.mjs`, preencher `imagem` e `srcSet` no `AVoltaPilha.tsx` e pôr o crédito no rodapé.

### Por confirmar
- Uma foto do Poço Azul (da casa, ou com licença livre).
- As coordenadas da quinta, para acertar as distâncias.
