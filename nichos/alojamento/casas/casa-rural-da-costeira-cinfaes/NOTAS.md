# Casa Rural da Costeira · notas do site (08/10/2026)

## Base e pedido
- **Passagem fiel do protótipo B «Mato»** (prototipos/b.html) para Next.js, depois de o site anterior ser recusado (arquivo/site-2026-10-08-rejeitado; notas antigas em arquivo/NOTAS-2026-10-08-rejeitado.md).
- O texto, a ordem, as fotos, o layout, a paleta e as fontes são os do b.html. O BRIEF.md atual **não** manda no texto.
- Só três mudanças pedidas: títulos ~20% mais pequenos (variável `--titulo` em cada secção, `.titulo` em globals.css); sem a faixa da citação logo a seguir ao primeiro ecrã; primeiro ecrã com a piscina-05.
- Sem animação nas secções: o movimento é do agente seguinte. O primeiro ecrã, o cabeçalho e o rodapé são os do esqueleto, com a pele do B (Instrument Serif + Hanken Grotesk; papel #e4e7df, tinta #1d231d, líquen #9c9479, mato #2e372e, musgo #33443c). Sem `casa.voz` (seria outra citação logo a seguir ao primeiro ecrã).

## Fotos
- piscina-05 no primeiro ecrã (retoque do Diogo: troca-se o ficheiro em site/public/fotos/).
- piscina-01 mostrava o jacúzi: «Ao almoço, o fogo» passa a piscina-04 (vê-se o alpendre do churrasco com a mesa).
- Por isso o fecho («Escolher as datas»), que era a piscina-04, usa a piscina-05 noutro recorte (50% 92%: água e trampolim). «De manhã» ficou com a piscina-06 (a do primeiro ecrã do B).
- **A decidir pelo Diogo:** 04, 05 e 06 são as únicas fotos da piscina sem jacúzi (02, 03, 07, 08, 09 e 10 mostram-no), e a 04 e a 05 têm quase o mesmo ângulo. Por isso há sempre uma repetição.
- piscina-04, quarto-03 e regiao-04 não estavam no prototipos/fotos.md; foram redimensionadas à mão a partir do dossiê (2400 px).

## Correções técnicas (não alteram o design)
- Alvos de toque de 44 px no telefone e no email do contacto e nas ligações do rodapé.
- Alturas em `svh` em vez de `vh` (patio, planos, sala, fecho).
- Tempos de carro de «À volta» a 16 px, sem maiúsculas, no telemóvel; maiúsculas espaçadas a partir de 768 px.
- O texto dos planos «Um dia inteiro» passou para a linha de baixo, dentro do véu (no B ficava sobre o céu claro). O véu sobe ligeiramente (40%, 75%).
- O anel de foco usa a cor do texto (o líquen sobre o papel ficava abaixo de 3:1). A seta do botão do Airbnb é um ícone, com aviso de nova janela para leitores de ecrã.
- A tira dos quartos é uma região focável (no telemóvel corre de lado).
- No cabeçalho só cabem quatro âncoras e o botão: «A sala» sai do menu, mas continua com `#sala`.
- Metadados: título do B, descrição = texto do primeiro ecrã, OG com a piscina-05, `theme-color` #2e372e, LodgingBusiness só com o que o contrato permite afirmar como facto (sem notas nem email). O `metadataBase` usa `VERCEL_PROJECT_PRODUCTION_URL`; trocar quando houver domínio.

## Verificação (build de produção, localhost:3500)
- percorrer base: 1440 sem falhas; 390 só com «texto fora do ecrã» na tira dos quartos, que corre de lado de propósito.
- verificar-prototipo: falha «números que não estão no brief» (0, 1972, 35, 1220, 2000). São do B e do contrato; o brief atual não é a fonte do texto.
- Email: o contrato pede confirmação do dono antes de publicar (já estava no B).

## Movimento (08/10/2026, interatividade sobre o B)
Pedido: «interatividade que faça sentido, que contribua para o storytelling, sem encher demais». Tudo ligado ao scroll (no telemóvel acompanha o dedo, nada arranca sozinho). Secções presas: o primeiro ecrã do esqueleto e, só no computador, a estrada de «À volta» (pedida pelo Diogo). Só transform, opacity e clip-path. Componentes em site/src/components/movimento/. Nenhum do React Bits: nenhum servia uma destas passagens melhor do que o motor do esqueleto (useRevelacao, posicao.ts).

Cada animação e a parte da história que conta:
- **Portas da sala (efeito marcante, Portas.tsx).** Duas folhas da cor do papel tapam o primeiro ecrã da sala e abrem-se para os lados enquanto o topo dela sobe do fundo até 30% do ecrã. Conta a passagem «Quando o sol baixa, a casa chama para dentro»: de fora (papel claro) para dentro (o verde escuro da sala). Depois de abertas, desaparecem.
- **Os três tempos escurecem ao sair (Plano.tsx).** Cada plano escurece quando sobe para fora do ecrã, e cada um mais do que o anterior (manhã 0,35, almoço 0,45, tarde 0,6). Conta o dia a andar, da manhã até ao sol a baixar, que é a frase que vem a seguir.
- **Legenda de cena nos três tempos (Plano.tsx).** A foto chega parada; o «quando» entra depois, e o texto logo atrás. Conta a ordem de um plano de filme: primeiro vê-se o sítio, depois diz-se a hora.
- **Frases de passagem que se escrevem (Passagem.tsx, 5 frases).** Destapam-se da esquerda para a direita ao ritmo do scroll, como intertítulos. São as frases que ligam um momento ao seguinte («Mas o dia passa-se lá fora», «Quando o sol baixa», «Ao fim da noite», «De manhã», «Ao fim do dia»): o movimento marca que a história vai mudar de sítio.
- **Títulos que assentam (Revelar).** «A casa de perto» (título e texto), «Um dia inteiro cá fora», «Lá dentro» (depois das portas) e «Escolher as datas» (depois da foto do fecho). Conta onde começa cada capítulo: o olho apanha o título a chegar e sabe que mudou de momento.
- **Quartos um a um (Revelar, desencontrados).** Conta que são vários quartos, cada um o seu, e não uma galeria.
- **A estrada de «À volta» (Volta.tsx, correção do Diogo 08/10: «a animação antiga estava boa»).** Reposto o movimento do site anterior (arquivo/AVolta-aprovado.tsx), com o texto, as fotos, os créditos e a pele deste site: a partir de 1024 px a página prende e os cinco sítios correm de lado, do mais perto ao mais longe; o seguinte espreita à direita e o texto de cada um só acende quando está quase todo na janela. Conta a ordem de distância: uma estrada que se afasta da casa. No telemóvel e com movimento reduzido, a lista do B, parada. Os filetes que se estendiam saíram.
- **Opiniões, uma voz de cada vez (Opinioes.tsx, Revelar desencontrado).** As três citações entram uma a uma. Conta que são três hóspedes diferentes, cada um a falar na sua vez, antes de se escolher as datas.

Estático de propósito: a fachada e o pátio (chegar e olhar), as citações (pausas, lêem-se paradas), a mesa e a cozinha, a faixa musgo, o painel do contacto (o que importa é a ação).

Movimento reduzido: sem portas nem sombra, tudo visível, nada preso.

Verificação (produção, localhost:3500, depois da estrada e das Opiniões): 11,8 ecrãs de conteúdo, 2,8 de scroll preso (primeiro ecrã + estrada); 19 revelações medidas no computador e no telemóvel, nenhuma cedo nem incompleta. Fluidez: a 390 e a 1024, 16,7 ms por frame (p95); a 1440 a máquina de teste estava a 33 ms em toda a página, com e sem a estrada (igual nos dois casos, logo a estrada não pesa). percorrer com --reduzido: só a tira dos quartos (corre de lado de propósito). As falhas de números do verificar-prototipo são as de antes (o brief não é a fonte do texto).

Volta (08/10): retirados a nota dos tempos de carro e a citação do Roland com a tradução, a pedido do Diogo; os créditos das fotos ficam.

## Saída do primeiro ecrã: «A encosta» (08/10/2026, escolhida pelo Diogo)
A névoa de papel foi recusada («está muito simples»); das três opções provisórias (a torre, a encosta, pedra a pedra) o Diogo escolheu a encosta, com uma correção: «tem demasiado espaço branco antes da secção». As outras duas, o `?t=` e as referências provisórias foram apagados. Inspiração: clip-path presos ao scroll da Balans Kitchen (awwwards.com/inspiration/clip-path-scroll-animation-with-sticky-layout-balans-kitchen-1).
- **O que se vê.** Mantêm-se o ligeiro zoom e o escurecer do início. Depois sobem três perfis de serra da cor do papel: dois translúcidos no hero (a serra ao longe, 0,36, e a encosta do meio, 0,58, como a névoa nos vales do Douro), mais devagar e à frente, e o da frente, sólido, que **é o topo da própria secção «A casa de perto»**. A secção tem margem negativa de um ecrã e sobe por cima do hero preso, ao ritmo do dedo; quando a crista passa, o rótulo e o título vêm logo atrás. Quando o hero se solta, a secção já cobre o ecrã todo e está a ler-se.
- **Onde vive.** Hero.tsx (bloco preso = 2 ecrãs + 40vh no telemóvel / 45vh no computador; camadas de trás em px de scroll, via useMedida); Patio.tsx (margem negativa, fundo de papel, SVG do perfil da frente com a crista no topo da secção, 16lvh no computador, 9lvh no telemóvel); lib/serra.ts (o perfil); page.tsx (a sentinela do cabeçalho acaba quando o topo da secção chega ao cabeçalho). Serra em SVG parado que só se desloca (o clip-path com polígono pesava); no telemóvel mais baixa e lisa (o SVG estica na vertical).
- **Movimento reduzido (como antes):** sem prisão, sem serra, sem margem negativa; degradé parado da cor do papel no fundo do hero.
- **Verificação (produção, localhost:3500).** Maior faixa contínua de papel vazio em 61 pontos da saída: 1440 13,1%, 390 13,3%, 360×640 16,7% (só no instante em que a secção entra e o rótulo ainda está a aparecer; o espaço de cima da secção, 72 px, é do B). Fluidez (descer e subir a saída, 300 frames): com GPU 16,6 ms p50 / 18 ms p95 nos três tamanhos; sem GPU 390 e 360×640 iguais, 1440 16,8 ms p50 / 23–26 ms p95. Com o dedo: a secção sobe 210 px por gesto e nada anda depois de largar. Scroll preso do hero: passou de 0,9 para cerca de 1,45 ecrãs, mas o último ecrã é a secção seguinte a subir, com conteúdo.

Margens (08/10): cabeçalho e texto do hero partilham a margem esquerda (32 px no computador, 20 px no telemóvel, largura até 1760); título do hero ~13% maior; janela da estrada de «À volta» com 24 px de margem (20 no telemóvel) em vez de 40.

## Rapidez (09/10/2026)
- **Gargalo:** o LCP era o título do primeiro ecrã, que o Motion mandava do servidor a opacidade 0 e só mostrava depois da hidratação (7,0 s num telemóvel lento). A entrada do texto do hero passou para CSS (`.entrada-hero` em globals.css): a mesma curva, os mesmos 0,9 s, os mesmos atrasos e os mesmos 20 px, mas começa logo no primeiro desenho. Com movimento reduzido, nada mexe.
- A animação começa em opacidade 0,001 e não em 0. A olho é igual, mas a 0 o Chrome só contava o título como pintado no primeiro desenho a seguir ao JavaScript. Agora o LCP observado é igual ao primeiro desenho (~1 s).
- **Lighthouse (publicado, 09/10):** telemóvel 65 → ~70–75 nas corridas limpas (o número oscila muito com a carga da máquina); computador 88 → 90–97. Em build local (sem latência de rede) o telemóvel dá 81–88. O LCP *simulado* do telemóvel (5–7 s) é a foto do hero (746 KB, q=90) a passar pela 4G lenta do simulador. Só desce se se baixar a qualidade, e não se baixa.
- Saiu o `gsap` do package.json (não era importado em lado nenhum).
- **Não se fez, de propósito:** converter os JPG para WebP (o `next/image` já serve WebP; seria comprimir duas vezes), CDN (já é a da Vercel), minificar (o build já o faz), lazy loading (já está), code splitting e skeleton loaders (página estática de uma secção a seguir à outra, com o conteúdo no HTML).
- Cópia de antes: arquivo/site-2026-10-09-antes-performance.

## Mobile (08/10/2026, modo de verificação)
- **Testado** (produção, localhost:3500, percorrer.mjs em todos + --reduzido): 320, 360, 375, 390, 414, 430; horizontais 667×375, 844×390, 932×430; 768, 820, 1024 (horizontal); 1280, 1440, 1920. Vistas à mão com o dedo: a saída da serra a 360×640, 844×390 e 390×844; portas da sala, tira dos quartos, lista de «À volta», Opiniões e contacto a 390.
- **Corrigido:** em telemóvel na horizontal (altura < 560 px) o primeiro ecrã tinha `min-height: 560px` e ficava mais alto que o ecrã: o título cortava-se e o texto e os botões ficavam por baixo da dobra, inalcançáveis (o ecrã preso não deixa descer). Agora `--hmin` (globals.css) é 560 px e passa a 0 abaixo dessa altura (Hero, Patio, sentinela do cabeçalho), e nessas alturas o título, o texto e os botões compactam-se (título 2,5 rem em duas linhas, texto 16 px mais largo, margens menores). Desktop e telemóvel em vertical: iguais.
- **Sem falhas** fora a tira dos quartos (corre de lado de propósito, também com --reduzido). Alinhamento nome do cabeçalho / texto do hero: igual (20 px telemóvel, 32 px a partir de 768).
- **Animações a trocar:** nenhuma; todas acompanham o dedo.
- **Por ver num aparelho real:** Safari de iOS (barra de endereço a encolher com o hero preso em `lvh`, `position: sticky`, inércia do dedo na saída da serra); no instante em que a serra translúcida passa por baixo do cabeçalho, o nome fica um instante com pouco contraste (transparente sobre o papel a subir).
