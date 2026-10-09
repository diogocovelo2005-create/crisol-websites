# Quinta de Canhões — pesquisa e plano de implementação

## 1. Factos confirmados (só isto vai para o site como facto)

| Campo | Valor | Fonte |
|---|---|---|
| Nome | Quinta de Canhões | oficial |
| Morada | Rua de Canhões, Canhões, 3660-685 Várzea, São Pedro do Sul, Viseu | Turismo do Centro |
| Registo | Turismo em Espaço Rural, RNET **ET 1638** | Turismo do Centro / VisitPortugal |
| Telefone | +351 232 724 449 · +351 964 506 038 | Turismo do Centro |
| Email | casadecanhoes@gmail.com | Turismo do Centro / VisitPortugal |
| Anfitriões | Teresa e António | blog Continuando à Procura |
| Casa | centenária, recuperada mantendo a estrutura original, decorada com peças pessoais e de família | Turismo do Centro |
| Quartos | 5 quartos / 10 camas no registo oficial | VisitPortugal |
| Avaliação | 8,6 / 10 em 218 avaliações | Kayak (agregador Booking) |
| Pequeno-almoço | bolos caseiros, sumos naturais, compotas, pão, panquecas, queijo, fruta | blog + Booking |
| Exterior | piscina exterior sazonal, jardim em socalcos, alpendre, churrasco, estacionamento | várias |
| Termas de S. Pedro do Sul | ~7 minutos de carro | Booking |
| Viseu | ~20 km | Turismo do Centro |

**Contradição não resolvida.** Há fontes que dizem 4 duplos + 2 suites (até 16 pessoas) e outras 5 duplos + 2 suites (12 pessoas). O registo oficial diz 5 quartos / 10 camas. O site vai dizer **cinco quartos** e mais nada. Confirmar contigo antes de publicar.

**A não usar.** O TripAdvisor mostra a Quinta em #23 de 23 com 2/5. É dado fino e desatualizado, contradiz 218 avaliações a 8,6. Não entra no site. Vale a pena tratares disso à parte com os donos.

## 2. O que os hóspedes elogiam, por ordem

1. A Teresa. O acolhimento e as dicas dela sobre a zona.
2. O pequeno-almoço. É o ponto mais repetido em todas as plataformas.
3. A piscina e o jardim.
4. A vista sobre o vale do Vouga.
5. O sossego e a privacidade.

Isto define a hierarquia do site. O pequeno-almoço tem de ter peso real, não uma linha numa lista de comodidades.

## 3. Leitura das fotografias

**hero.png** é o site inteiro numa imagem: uma janela aberta de caixilho vermelho, portada de carvalho, cortina de linho, e o vale do Vouga lá fora. Não mostra a casa. Mostra o que a casa vê. É a pergunta de abertura.

O que as fotos dizem da propriedade:

- Granito à vista dentro e fora. Telha de barro.
- **Caixilhos, portas, portão e gradeamento pintados de vermelho escuro.** É a assinatura cromática da casa e é de onde sai o acento da paleta.
- Jardim em socalcos com muros de pedra seca, hortênsias, agapantos, azáleas, palmeiras, citrinos, videira sobre pérgula.
- Piscina comprida no relvado inferior, enquadrada a verde.
- Alpendre de madeira sobre o vale.
- Sala e sala de jantar de paredes de pedra, mobília de madeira escura, jarro de cobre, velas, rendas.
- Mesas de pequeno-almoço em linho bordado branco, cesto de pães, sumo em jarro de vidro, bolo caseiro, rosas.
- Pátio de calçada com mesas de ferro forjado sob toldo cru.
- Quartos honestos e calmos. O melhor é o azul/verde-água com as três gravuras de suculentas.

Fotos fracas, a usar pouco ou nada: as três casas de banho. Resolução baixa em quase tudo menos o hero, o que condiciona o layout. Nenhuma foto fraca vai a full-bleed.

## 4. Paleta, tirada da propriedade

Não da referência. O Shady Pines é creme e castanho-taupe. A Quinta é granito, vermelho e verde de jardim.

| Nome | Papel | Valor |
|---|---|---|
| Cal | fundo principal | `#F7F3EC` |
| Granito | fundo secundário, separadores | `#DDD6C9` |
| Xisto | texto | `#262320` |
| Caixilho | acento, único, raro | `#7A2B2B` |
| Vale | fundo escuro do rodapé e de um bloco | `#3C4A38` |
| Barro | realce muito pontual | `#B5623C` |

O vermelho só aparece onde a casa o usa: em traços finos e pequenos. Nunca em blocos grandes.

**Tipografia.** Fraunces para display, Karla para texto. Fraunces é uma serifa variável com óptica suave, carrega a casa centenária sem cair no genérico de hotel. Karla é uma grotesca com calor que assenta bem em português. Alternativa mais leve se preferires: Instrument Serif com Inter.

## 5. Estrutura narrativa

Cada secção levanta a pergunta que a seguinte responde.

**0. Hero** — `hero.png` a toda a largura. Wordmark discreto, navegação de quatro âncoras, um único botão Reservar. Título em baixo à esquerda: uma casa centenária sobre o vale do Vouga, Várzea, São Pedro do Sul.
→ *Que casa é esta?*

**1. A casa** — fachada de granito com a porta vermelha, ao lado de um parágrafo curto. Casa centenária recuperada com a estrutura original, peças de família, paredes de pedra, cinco quartos, Teresa e António. Uma linha sóbria com o registo ET 1638.
→ *Como é estar lá?*

**2. O dia** — o coração do site, e o que substitui a grelha de comodidades. Quatro momentos em sequência, uma frase cada, cada um com a sua fotografia: a mesa do pequeno-almoço, a piscina e o jardim em socalcos, o alpendre ao fim da tarde, a sala de pedra à noite. É aqui que o pequeno-almoço ganha o peso que merece.
→ *E onde é que eu durmo?*

**3. Os quartos** — nada de seis cartões com preços. Não temos nomes nem preços confirmados e cartões assim são exatamente o molde de hotel que não queres. Em vez disso: cinco quartos, todos diferentes, todos com casa de banho privativa, uns virados ao vale e outros ao jardim. Duas ou três fotografias numa faixa horizontal. Uma linha discreta com o que têm dentro.
→ *E à volta, o que há?*

**4. À volta** — a região editada a sério. Três coisas, não dez. As Termas a sete minutos, a estância termal mais antiga do país, de origem romana. O vale do Vouga e a Ecopista sobre a antiga linha de caminho de ferro. A Serra da Arada e o São Macário a 1052 metros. Viseu a vinte quilómetros. Lista sóbria com distâncias sobre uma fotografia de paisagem. Sem cartões com ícones.
→ *Posso confiar neste sítio?*

**5. Quem recebe** — a Teresa e o António, e o único número verdadeiro que temos: 8,6 em 218 avaliações. Duas frases reais de hóspedes, se mas arranjares. Não invento citações.
→ *Então como reservo?*

**6. Reservar** — simples e direto. Telefone, email, e o canal de reserva que me indicares.

**7. Rodapé** — morada, contactos, mapa, registo ET 1638, privacidade e Livro de Reclamações.

Sete secções. Não há mais nada. Sem widget de reservas flutuante sobre o hero, sem grelha de ícones de comodidades, sem linha de estatísticas inventadas, sem preços.

## 6. Ferramentas escolhidas, e as que ficam de fora

**Uso:**

- **`vibe-sites`** — o stack canónico do repositório. Next.js App Router, TypeScript, Tailwind v4, `next/image`, Motion com parcimónia, Lenis.
- **`impeccable`** — rigor de design e o detetor anti-padrões que já corre por hook.
- **`design-taste-frontend`** — a leitura da referência antes de desenhar.
- **`site-delivery`** — antes de ir para o ar: RGPD, Livro de Reclamações, metadados, dados estruturados, acessibilidade.
- **Playwright** — o ciclo de feedback visual.

**Não uso, e porquê:**

- `ui-ux-pro-max` — a base de paletas dela ia competir com uma paleta tirada das fotografias da casa.
- `emil-design-eng` — profundidade de animação a mais para um site que tem de ser calmo.
- Figma, Canva, Higgsfield, Miro, Supabase, Virlo — nenhum tem função aqui.

**Nota honesta sobre o Playwright.** O MCP está registado em `site-builder/.mcp.json` e nos `.mcp.json` de cada cliente, não na raiz do repositório, que é onde esta sessão arrancou. As ferramentas do Playwright não estão carregadas agora. Duas saídas: crio o projeto com o seu `.mcp.json` e reinicias a sessão dentro da pasta, e aí tenho o MCP a sério; ou conduzo o Playwright pelo pacote npm com um script e leio os PNG de `.shots/`. A primeira é melhor para iterar contigo.

## 7. Onde fica

`clientes/quinta-de-canhoes/`, a seguir à convenção das outras pastas de cliente. As fotografias passam a AVIF e WebP com o sharp e ficam em `public/`.

## 8. Modelo a usar

- **Opus 5, esta sessão, para a construção toda.** O custo real de tokens não é o modelo, é voltar a derivar contexto. Já li as 27 fotografias e a pesquisa está feita. Trocar de modelo a meio deita isso fora.
- **Não abrir subagentes.** Cada um arranca a frio e volta a ler tudo. É o caminho caro.
- **Sonnet 5 numa segunda sessão** para o trabalho mecânico depois de o design estar fechado: conversão de imagens, correções de breakpoints, metadados, rodapé legal, deploy.
- O `PESQUISA.md` e o `DESIGN.md` que vou deixar escritos servem precisamente para essa segunda sessão não ter de reler nada.

## 9. O que preciso de ti antes de construir

1. **Como se reserva?** Booking.com, email direto, WhatsApp, ou motor próprio? Muda o fim do site todo.
2. **Cinco quartos** está correto?
3. **Preços.** Há valores a mostrar ou fica sem preços?
4. **Duas avaliações reais** de hóspedes, se as tiveres. Não invento.
5. **Domínio.** É novo ou já existe algum a servir email?
