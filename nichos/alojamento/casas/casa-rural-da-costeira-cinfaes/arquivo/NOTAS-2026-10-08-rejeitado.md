# Casa Rural da Costeira · notas do site

## Base e pedido
- Base: **B «Mato»** (prototipos/b.html). Pedidos do Diogo em prototipos/ESCOLHA.md.
- O texto e a ordem vêm do BRIEF.md refeito (7 momentos, títulos curtos). Do B vem a pele:
  paleta, Instrument Serif em maiúsculas com itálico minúsculo + Hanken Grotesk, faixa escura,
  planos largos, tira de quartos, lista «À volta».

## Polimento (07/10/2026)
- Esqueleto copiado para `site/`; `casa.ts` preenchido (Airbnb rooms/2768412 + telefone; email
  com nota de confirmação; RNET 4967; sem voz no primeiro ecrã, como pede o brief).
- Escala tipográfica reduzida: títulos de secção `clamp(2.5rem, 4.6vw, 4.25rem)` (no B iam até
  8.5–11rem); corpo 16–17 px (B: 17 px); passagens 1.3–1.55rem com um fio curto por cima.
- Sem rótulos por cima dos títulos (o B tinha um em cada secção) e sem a citação depois do
  primeiro ecrã. Uma só citação solta: CIT-18, na faixa entre «O dia todo» e «Ao serão».
- Fundos por momento, tirados das fotos: papel (Chegar, À volta), água #33443c (faixa da
  citação), serão #2b281f (sala), pedra #e9e4d8 (quartos), mato (Vir) e rodapé.
- O primeiro ecrã mantém o movimento do esqueleto (não mexido).
- Metadados: título, descrição, Open Graph com piscina-05, theme-color, LodgingBusiness sem notas.

## Interatividade (07/10/2026)
- **Efeito marcante: o travelling do dia** (`ODiaTodo.tsx`, sequência). Palco preso (400lvh, 3 ecrãs):
  a câmara corre a piscina-06 de lado (da casa ao churrasco coberto), as três linhas sucedem-se
  coladas à foto, a churrasqueira de 2013 abre pequena (18rem, nunca ampliada) junto da linha dela,
  o bilhar entra num corte lateral na direção da câmara, e o plano funde-se no verde da faixa.
  Uma régua fina diz em que tempo se está. Porquê: o dia passa-se cá fora, num só plano.
- Faixa: o jardim-08 passou do grid para cima da citação (pequeno, contraluz = o sol a baixar); a
  citação acende palavra a palavra (ScrollReveal do React Bits, adaptado ao `useRevelacao`); o
  fundo desce do verde para o escuro do serão.
- À volta (sequência): no computador, estrada lateral presa (1.3 ecrãs) dentro de uma janela
  alinhada com a grelha; o texto de cada sítio só acende quando está quase todo dentro. No
  telemóvel e com movimento reduzido fica a lista vertical.
- Boa noite (pormenor): as três fotos abrem de cima para baixo (clip-path), escalonadas, e ficam.
- Passagens: assentam com o `Revelar`. Chegar, Ao serão e Vir ficam parados de propósito.
- Movimento reduzido: sem palcos; O dia todo volta à composição parada (piscina + churrasco e bilhar).
- Verificação (produção): 10.41 ecrãs de conteúdo, 5.21 de scroll preso (hero 0.9, dia 3, volta
  1.31); percorrer 390/1440 com e sem movimento reduzido: 0 problemas. Falha conhecida: «número 0»
  das licenças.

## Fotos
- `melhorar-fotos.mjs --base b --primeiro piscina-05.jpg`: 13 fotos, todas do original
  (2400 px), nenhuma precisou de ampliação.
- À mão: fachada-03 (do original, 2400 px); jardim-07, jardim-08 (moldura branca de 2013
  recortada), churrasqueira-02, sala-05, refeicoes-03, só em tamanho pequeno (≤ 26rem).
- Não usadas: piscina-01/07/08/09 (jacúzi), e as do B que não estão no brief.
- O retoque da foto do primeiro ecrã (piscina-05) é do Diogo.

## Verificação
- verificar-prototipo: 11.6 ecrãs de conteúdo, 0.9 de scroll preso. Única falha: «número 0»,
  que vem das licenças obrigatórias dos créditos (CC BY-SA 4.0 / 2.0). Era igual no protótipo.
- percorrer (390 e 1440): sem falhas depois da correção (o último alvo de toque do rodapé
  foi corrigido e reconstruído, falta a confirmação da próxima ronda).
- Contraste: todos os pares de texto acima de 5:1.

## Por confirmar com o dono
- O email de reservas, as reservas diretas, como o Tiago quer aparecer, o bilhar e os
  matraquilhos, quantos berços, se serve pequeno-almoço (a legenda só fala da cozinha), a
  autorização das fotos antigas e do Instagram, e os cerca de 1,5 km ao centro.
- Domínio: `metadataBase` usa casa-rural-da-costeira.vercel.app como provisório.

## Mobile (08/10/2026)
- Testado em produção (localhost:3500) em 15 dispositivos: 320, 360, 375, 390, 414, 430; horizontais 667, 844, 932; tablets 768, 820, 1024 (horizontal); 1280, 1440, 1920; e com movimento reduzido. Resultado final: 0 falhas.
- Corrigido: corpo a 15.2 px em horizontal (À volta, Vir, legendas de Boa noite: `md:text-[0.95rem]` passou a `min-[1100px]:`, o desktop fica igual); `vh` passou a `svh` em Chegar, Ao serão, Vir (igual no desktop); links do cabeçalho no tablet horizontal com alvo de toque ≥ 44 px (só com `pointer: coarse`).
- Travelling de «O dia todo» no toque (390): acompanha o scroll, sem arranque sozinho; régua e legenda sempre visíveis. Nenhuma animação precisou de troca.
- Por ver num aparelho real: Safari iOS (a barra de endereço com o palco `h-lvh` preso: o fundo pode ficar cortado uns ~60 px com a barra visível), `position: sticky`, inércia do dedo.
