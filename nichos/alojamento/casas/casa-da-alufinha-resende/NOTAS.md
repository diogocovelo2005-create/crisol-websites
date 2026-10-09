# Casa da Alufinha · notas do site

## Protótipo e direções

- Base: **C · Planos** (`prototipos/c.html`), escolhido a 2026-10-09.
- O Diogo, à letra:
  - (pedido inicial) "o que quero: um website que converta as pessoas a marcarem através do telemovel (call to action no final na secçao reservar)"
  - (na escolha) "os 3 ficaram bons mas o c ficou muito bom, vamos agora dar lhe alguma interatividade. existem fotos incriveis que nao estao a ser utilizadas. vou te dizer aqui para tu utilizares de alguma maneira (substituir existente (se forem do mesmo sujeito) ou adicionar se nao for do mesmo sujeito): piscina-03 (esta é muito boa. tem de ficar grande); fachada-02(já está na secçao reservar mas tem de ficar maior. e podes usar o scroll expand nela). quarto-01;quarto-03,quarto-07; quarto08; sala-04;sala-03. podem haver aqui mencionadas algumas que já lá estejam (eu nao vi com muita atençao)."
- Seguido o plano de fotos do BRIEF atual (atualizado depois da escolha). A sala-04 é "restrito" no contrato e não entrou; no lugar dela, a sala-02.

## O site

`casas/casa-da-alufinha-resende/site/` (Next.js, do esqueleto da criar-base). Secções em
`src/components/seccoes/`: Hero (esqueleto), CaFora, PorDentro, Quartos, AVolta, Opinioes, Reservar.
Pele: cores do protótipo no `@theme` de `globals.css`, Libre Bodoni + Public Sans em `src/lib/fontes.ts`.
Fotos finais em `public/fotos/` (`fotos-finais.json`); a fachada-02 passou pelo Real-ESRGAN (2048 → 2400 px).

## O que mudou em relação ao protótipo

Pelas direções do Diogo:
- **piscina-03** abre o "Cá fora" como o plano maior da secção (nove colunas, 1080×720 a 1440 px, na proporção natural da foto), texto ao lado. Substitui a piscina-04 nesse plano (mesmo assunto); a frase passou a "os socalcos logo atrás", como no BRIEF.
- **piscina-04** passou para a faixa de cinema das opiniões (antes era a piscina-03), com o recorte descido (50% 62%) para caberem o telhado e a água.
- **fachada-02** saiu da coluna do Reservar (320 px) e é o scroll expand, entre a passagem e o telefone, com a legenda "O portão está à vossa espera." dentro da imagem, no canto inferior esquerdo.
- **Quartos**: quatro fotos (quarto-01, 08, 03, 07). A quarto-07 substitui a quarto-06 (os mesmos quadros de jarros); a quarto-01 entra nova. A tira passou a duas linhas que trocam de lado (larga+estreita, estreita+larga). Legenda nova da quarto-01: "Duas janelas para os socalcos".
- **sala-02** (patamar do sótão) entrou na primeira coluna do "Por dentro", em tamanho médio, legendada pelo patamar; o logótipo sobreposto ficou como está.

Técnico:
- O aviso do protótipo (um parágrafo abaixo de 15 px) era o crédito do Solar de Porto de Rei (12,8 px): os créditos passaram a 15 px (16 px no telemóvel).
- Navegação com quatro âncoras (Cá fora, Por dentro, Quartos, À volta); "Opiniões" saiu do menu (fica logo antes do Reservar).
- A linha de rodapé do protótipo deu lugar ao rodapé do esqueleto, compactado; tirei o ícone de árvore (a casa não tem nada a ver com ele).
- Foco visível na cor do próprio texto (o rosa do acento não se via sobre o linho); o fio de leitura e o sublinhado do menu em vermelho, pela mesma razão.
- Para a página caber nos 13 ecrãs de conteúdo (com as fotos novas e o expand tinha 13,9): a passagem "Agora é a vossa vez." vive dentro do ecrã preso do portão (a foto cresce por cima dela); as linhas de quartos a 44svh; a sala a 70svh; 80 px entre planos em vez de 96. Ficou com 12,89.
- Telemóvel: distâncias da região a 16 px e sem maiúsculas; alvos de toque de 44 px nos canais, no email e no rodapé.
- `svh` em vez de `vh`; `tel:+351912331756`; metadados, Open Graph, `theme-color` e `LodgingBusiness` só com o que o contrato afirma (morada, telefone, email, três quartos, piscina privada, ar condicionado, Wi-Fi, estacionamento; sem notas de plataformas).
- Mantido o botão "Ligar" fixo no telemóvel, como no protótipo (o pedido de converter pelo telemóvel).

## Movimento (primeira versão; substituída a 2026-10-09, ver "Correção" no fim)

Uma só entrada para a página toda e um efeito pedido. Tudo preso ao scroll: no telemóvel acompanha o dedo e para quando ele para. Só `clip-path` e `transform`.

- **Fotos dos planos abrem de cima para baixo** (`FotoPlano`: clip-path com a foto a assentar de 1.06 para 1). Só nos quatro planos do "Cá fora" e na sala do "Por dentro". Serve "o dia passa-se cá fora" e "entra-se na pedra": cada momento chega como o plano seguinte de um filme, um depois do outro, à medida que se desce.
- **O portão cresce até encher o ecrã** (`PortaoExpande`, pedido do Diogo): o ecrã fica preso cerca de 1,3 ecrãs; a moldura quadrada com a foto inteira abre até ao ecrã todo (no telemóvel, à largura toda e até 1,25× a largura de altura, para o nome caber inteiro); a legenda aparece só quando a expansão acaba. Serve a passagem para o fecho: chega-se ao portão com o nome da casa e logo a seguir está o telefone.
- O primeiro ecrã ficou com o movimento do esqueleto (a voz do Rui no segundo tempo).

Parado de propósito: os textos, os títulos e as passagens; os quartos (pausa, pormenor); o rio e a fila da região; as opiniões; o número de telefone. Com movimento reduzido fica tudo visível: as fotos abertas e o portão grande e parado, com a passagem por cima e a legenda.

## Verificação (2026-10-09)

- `verificar-prototipo.mjs`: ok, sem falhas nem avisos; 12,89 ecrãs de conteúdo, 2,2 de scroll preso.
- `percorrer.mjs --dispositivos base --reduzido`: 0 problemas em 390 e 1440.
- Capturas: `arquivo/capturas/prototipo/` e `arquivo/capturas/site/`. Comparadas secção a secção: ritmo, tipografia, cores e texto iguais ao protótipo; as mudanças são as de cima.

## Por confirmar com o dono

- Os contactos no site (o email tem o nome da titular), que canal aparece primeiro (a bio do Instagram aponta para o Airbnb), a forma da morada e se uma reserva se fecha só pelo telefone.
- Se a Maria quer aparecer pelo nome.
- As fotos são de uma só sessão, por autorizar pelo dono.
- Domínio: `metadataBase` lê `NEXT_PUBLIC_SITE_URL` (por omissão, o localhost); definir antes de publicar.
- Para o `mobile-alojamento`: no telemóvel, o portão começa pequeno (312 px) num ecrã preso, com bastante fundo à volta durante o primeiro terço da expansão.

## Mobile (2026-10-09)

- Testado em 15 dispositivos do `percorrer.mjs` (320 a 430 vertical, 3 horizontais, 3 tablets, 1280/1440/1920), em produção, também com movimento reduzido. Safari/WebKit não testado.
- Inicial: 0 problemas nos telemóveis verticais; falhas em horizontal (844, 932: letra de 15 e 12 px na "À volta") e tablet 1024 horizontal (links do menu e do rodapé com 20 a 27 px de altura). Corrigido: letra a 16 px em qualquer ecrã de toque (os 15/12 px só com rato), alvos de 44 px com `pointer: coarse` no menu do cabeçalho e no rodapé. Agora 0 problemas em todos.
- Portão (`PortaoExpande`): no telemóvel vertical começa a 90% da largura (antes 80%, 312 px em 390), limitado a metade da altura; mantém o texto "Agora é a vossa vez." por cima, visto em 390 e 320. Desktop igual.
- Botão "Ligar" fixo no telemóvel (só abaixo de 768 px) e "Ligar" no Reservar: confirmados presentes e sem sobreposição em 320 a 430.
- Nenhuma animação desligada no telemóvel (todo o movimento está preso ao scroll).
- Por ver num aparelho real: Safari de iOS (barra de endereço que encolhe, `sticky` do portão, inércia do dedo); o texto da passagem fica rente ao cabeçalho em 320x568.

## Correção (2026-10-09): mais movimento, transição do hero, foto nova

O Diogo, à letra (ditado por voz; "Gustavo" é ruído da transcrição):
> "Então feedback sobre o site é sim pouca animação pouca interatividade Gustavo, as imagens que existem tem de ter alguma animação de entrada Não precisa de ser muito complexa Mas tem de ter alguma animação de entrada Diversifica as animações de entrada para as fotos Não quero que faças essa coisa do Hero para meter a frase depois do Hero Faz logo alguma transição do Hero para a secção seguinte Procura maneiras criativas de fazer a transição para não ser tão estático Não quer esse contraste para o branco tem de ser uma transição smooth é basicamente isso, alguma animação de entrada nos títulos também pode haver alguma animação de entrada diversifica e principalmente eu não quero que diversifices sem intenção tem de ter intenção e tenho de combinar tudo entre si de ficar harmonioso o site de Dark Scroll e outra coisa os cartõezinhos do que há à volta podes criar alguma animação [...] e depois o a secção de marcar falta só escolher as datas quero que fique com o background da foto casa da lufinha quero que fique pode meter o portão que está à vossa espera, mas depois com o mesmo background apareça desapareça a frase, o portão está à vossa espera e apareça a frase, falta a sua escolher de datas e com o número em baixo, ver bem, usa o MCP do Playwright para tornar tudo legível [...] usa o React Bits [...]"
>
> ". na secçao "Para dormir, três quartos e três casas de banho." por exemplo podes dar um toque de "Masonry" (o componente do react bits). nos cartoezinhos do á volta podes usar o "Bounce Cards" (do react bits). OLHA MUITO IMPORTANTE: A ANIMAÇAO DO HERO PARA A SECÇAO DE BAIXO QUERO QUE FAÇAS UMA APROXIMAÇAO DA PISCINA E TRANSFORMES NA IMAGEM ABAIXO DA PISCINA. AO DAR SCROLL DÁ ZOOM NA PISCINA(IMAGEM DO HERO) TRANSFORMANDO SE NA IMAGEM DE BAIXO DA PISCINA(Print anexada) e podes meter á mesma "o dia passa se cá fora" em cima de "A piscina"."
>
> (a seguir) "troca a foto do hero atual pela "C:\Users\Diogo Covelo\Downloads\novohero.jpg". nao comprimas. usa no tamanho original. nao quero que estragues a animaçao. a foto é a mesma mas melhor tratada"

### Foto nova do primeiro ecrã
- `public/fotos/vista-02-hero.jpg`: cópia byte a byte do `novohero.jpg` (2528×1684, 4 MB), servida com `unoptimized` (o Next não a recomprime nem redimensiona). A `vista-02.jpg` antiga fica no disco, sem uso.
- O enquadramento não é o mesmo: é mais largo e a piscina está à direita, rodada. O ponto do zoom foi medido de novo: o centro da piscina fica a (0,639; 0,4715) da foto. No telemóvel o recorte passou a `60% 50%` (com `50%` a piscina ficava colada à margem direita); no computador `50% 50%`. O Open Graph passou a 2528×1684.

### Movimento: uma família, cada variação com a sua passagem
Tudo preso ao scroll (no telemóvel acompanha o dedo e para quando ele para), com a mesma curva (smoothstep). Só `transform`, `opacity` e `clip-path`. As fotos abrem todas por clip-path enquanto assentam (escala 1.06 → 1); o que muda é por onde abrem.

- **Primeiro ecrã → Cá fora: o mergulho na piscina** (`Hero.tsx`, preso 200lvh no computador, 160lvh no telemóvel). A aérea aproxima-se da piscina (zoom exponencial até 10×, com origem na piscina), a promessa sai e o véu escuro sai com ela. A meio, a piscina-03 entra por cima ainda "a cair" (maior, a assentar a partir da água), cobre o ecrã e encolhe até ao lugar dela no "Cá fora", com o linho a aparecer à volta. Passagem: "Mas o melhor da casa está cá fora" (da casa no seu lugar para onde se passa o dia). Não há ecrã de frase: a voz do Rui saiu, a pedido do Diogo. Também não há corte para o claro: o escuro sai pela foto e o linho entra à volta da piscina.
- **"O dia passa-se cá fora."** passou para a coluna ao lado da piscina-03, por cima de "A piscina." (com a etiqueta e a frase da secção). No telemóvel fica por cima da foto, e "A piscina." vem logo a seguir. A âncora `#casa` cai no fim do mergulho.
- **Títulos** (`Sobe`): todos os títulos de secção e os de cada plano do "Cá fora" sobem de trás de uma linha. É uma só entrada para todos os títulos: marcam cada passagem da história quando se chega a ela.
- **Cá fora** (pérgola, rede, churrasqueira): a foto abre do lado da frase para fora. O olho vai da frase para o sítio.
- **Por dentro**: a sala abre do meio para os lados, como portadas ("entra-se na pedra"). O patamar e a cozinha abrem de cima para baixo, um logo depois do outro.
- **Quartos** (`MuroQuartos`, o Masonry do React Bits adaptado): duas colunas desencontradas, alta e baixa. As fotos sobem e assentam, a segunda coluna logo atrás da primeira; ao passar o rato, a foto recua um pouco. Serve a pausa: a casa arruma-se para a noite, um quarto de cada vez. Adaptado: preso ao scroll em vez de arrancar com o tempo, e sem desfoque.
- **À volta**: a vista do rio alarga-se ao chegar ("à volta há mais"). Os quatro sítios são postais em leque (`CartoesVolta`, o Bounce Cards adaptado): saem do monte para o leque com um pequeno ressalto, presos ao scroll. No computador, passar o rato (ou o foco) num postal ou no texto dele trá-lo à frente, direito, e afasta os outros (mola do original). No telemóvel o leque fica preso por baixo do cabeçalho enquanto a lista passa, e vem à frente o postal do sítio que se está a ler (preso ao scroll). Serve "sugestões de passeio, para escolher ao sabor de cada dia", do mais perto (à esquerda) ao mais longe. Os créditos passaram para o fim do texto de cada sítio.
- **Opiniões**: a faixa de cinema (piscina-04) abre do meio, como as barras de um ecrã.
- **Reservar sobre o portão** (`PortaoExpande`, preso 230svh no computador, 200svh no telemóvel): "Agora é a vossa vez." lê-se ao chegar; o portão cresce até encher o ecrã; aparece "O portão está à vossa espera.". Depois a legenda sai, o véu escurece o lado do texto e entram por ordem, sobre o portão, "Falta só escolher as datas.", a frase, o número (Ligar) e os canais. No telemóvel o portão para primeiro com o nome inteiro e só depois enche o ecrã. O texto sobre a foto passou a osso (o vermelho não se lia no escuro). A lotação, o email, a morada e o registo ficam por baixo, numa faixa de linho. Pelo teclado, o foco num link ainda escondido leva ao fim da sequência.

Parado de propósito: os textos corridos, as passagens, as citações, o cartão de Porto de Rei e o número de telefone depois de entrar.
Com movimento reduzido: nada fica preso. O primeiro ecrã fica parado e o bloco da piscina vem logo a seguir; as fotos ficam abertas; o portão fica grande e parado, com a legenda e o texto do Reservar por cima.

### Verificação (2026-10-09, em produção)
- `verificar-prototipo.mjs`: ok, sem falhas; 11,23 ecrãs de conteúdo (eram 12,89) e 4,3 de scroll preso. Só um aviso: a voz do Rui não aparece (saiu a pedido do Diogo).
- `percorrer.mjs --dispositivos base`, com e sem `--reduzido`: 0 problemas em 390 e 1440. O leque saía 16 a 18 px do ecrã a 390; ficou corrigido.
- Fluidez (build + start, Chromium headless): 60 fps estáveis no mergulho, nos quartos, na À volta e no portão, a 1440 e a 390; nenhum quadro acima de 34 ms.
- Legibilidade vista em quadros do browser a 1440 e 390: a promessa sobre a foto nova, o menu claro sobre as fotos do mergulho (com véu em cima até o cabeçalho ganhar fundo), a legenda do portão, e o título e o número do Reservar sobre o portão.
- Capturas novas em `arquivo/capturas/site/`; as anteriores em `arquivo/capturas/site-antes-2026-10-09/`.

### Por resolver ou confirmar
- Safari de iOS num aparelho real: o mergulho (100lvh preso), o leque preso por baixo do cabeçalho e o portão. Não testado.
- A foto nova tem 4 MB e é a primeira coisa a carregar (pedido: sem compressão). No telemóvel, em rede lenta, o primeiro ecrã demora. Se for preciso, uma versão leve só para o telemóvel.
- No fim do portão, o título fica por cima do nome iluminado "Casa da Alufinha". O véu foi reforçado e o texto lê-se bem, mas o nome fica por trás do título.
- ~~No telemóvel, quando o mergulho acaba, fica uma faixa de linho por cima do título do "Cá fora"~~ (resolvido na correção seguinte).

## Correção (2026-10-09): mergulho mais curto, a aérea roda até à piscina-03, texto maior

O Diogo, à letra:
> "Mas o melhor da casa está cá fora. / O dia passa-se cá fora. / A piscina é só da casa, e o jardim também, com entrada própria e duche ao ar livre." isto tem de ficar maior. o mergulho nao precisa de ir tao abaixo. assim nota -se muito os pixeis. podes fazer um mergulho mais rápido. o problema é que nao faz muito sentido como é que esta a acontecer a transformaçao. a piscina está em posiçoes diferentes. tu consegues fazer com que á medida que fazemos scroll o hero rode, incline ou faça outras coisas para ficar com o enquadramento semelhante á da piscina. nao precisa de ser perfeito porque como o mergulho vai ser mais curto é só para dar ideia de continuidade.

Só mexeu `Hero.tsx` e `page.tsx` (âncora e sentinela do cabeçalho). A foto do primeiro ecrã continua o ficheiro original, sem recompressão.

- **Medidas da piscina.** Na aérea (2528×1684): centro (0,639; 0,4715); o lado comprido desce para a direita a ~55° (cantos ≈ 1497,728 · 1613,718 · 1726,867 · 1594,882 px). Na piscina-03 (2400×1600): centro da água (0,39; 0,75); o lado comprido quase horizontal (a borda da frente sobe ~4°) e muito encurtado pela perspetiva.
- **O mergulho agora:** a aérea aproxima-se só até 4× no computador e 3× no telemóvel (era 10×), e ao mesmo tempo roda −59° (o lado comprido da piscina deita-se como na piscina-03), inclina 34° em perspetiva (a câmara levanta o olhar: a piscina encurta e o fundo recua) e desliza até ao ponto do ecrã onde a água da piscina-03 aparece quando ela entra. A piscina-03 entra por cima a 1,12× e assenta à volta da própria água (antes 1,4×, a partir de outro ponto), cobre o ecrã e encolhe até ao lugar dela. As duas águas ficam no mesmo sítio e na mesma direção durante a troca (ver `arquivo/capturas/site/mergulho-d-038.png` e `mergulho-m-038.png`).
- **Mais rápido:** o hero preso passou de 300lvh para 220lvh no computador e de 260lvh para 190lvh no telemóvel (scroll preso de 2 para 1,2 ecrãs e de 1,6 para 0,9). A âncora `#casa` e a sentinela do cabeçalho seguiram as novas medidas.
- **Sem vazios ao rodar:** a aérea passou a estar numa caixa do tamanho da foto inteira (o recorte inicial é o mesmo); antes o `<img>` só pintava dentro do ecrã e, ao rodar, apareciam triângulos escuros nos cantos (sobretudo no telemóvel). A escala nunca desce abaixo da que cobre o ecrã todo (calculada em cada quadro, com a rotação e a perspetiva desfeitas nos quatro cantos).
- **Texto maior:** a frase de cima 0,75 → 0,9 rem (1 rem no computador), o título 2,6 → 3,3 rem no telemóvel e `clamp(3rem, 4.3vw, 4.6rem)` no computador (era até 3 rem), o parágrafo 1,05 → 1,22 rem (1,32 rem no computador). Para caber, no computador a piscina-03 ocupa oito colunas também em ecrãs largos (era nove a partir de 1280 px); a altura dela não mudou.
- **Faixa vazia no telemóvel (resolvido):** no ecrã preso a piscina-03 enche a altura que sobra por baixo do texto (mínimo 220 px), com o recorte a 40% para a água caber; em 390×844 fica mais alta do que larga. Sem movimento reduzido mantém 3:2.
- Movimento reduzido: igual ao anterior (primeiro ecrã parado e o bloco da piscina a seguir, já com o texto maior).

### Verificação (produção, build + start)
- `verificar-prototipo.mjs`: ok, sem falhas; 11,23 ecrãs de conteúdo, 3,5 de scroll preso (era 4,3). Aviso de sempre: a citação/voz que saiu a pedido do Diogo.
- `percorrer.mjs --dispositivos base`, com e sem `--reduzido`: 0 problemas em 390 e 1440.
- Quadros a meio da transição (0, 15, 30, 38, 44, 55, 70, 85 e 100% do percurso preso) a 1440 e 390: `arquivo/capturas/site/mergulho-*.png`. Sem cantos vazios em nenhum.
- Fluidez só no mergulho (Chromium headless, software): telemóvel 0% de quadros acima de 25 ms; computador 6 a 9% a 33 ms (a versão anterior, medida na mesma máquina a seguir, dava 11,5% e um quadro de 50 ms). Página toda: telemóvel 0,3%, computador 5,2%, sem tarefas longas.

### Por confirmar
- O Diogo ver o mergulho no telemóvel dele: no aparelho real (DPR 3) a aérea a 3× ainda pode amaciar; se se notar, baixar `ZOOM_TELEMOVEL` para 2,5.
- Safari de iOS: perspetiva 3D numa imagem de 4 MB. Não testado.
