# Escolher e trocar a fonte

A fonte é a alteração que mais muda a cara do site. Também é a que mais parte
o layout, porque cada fonte tem larguras diferentes. Por isso: escolhe com
critério, troca num sítio só, e mede.

---

## 1. Critérios obrigatórios

A fonte dos títulos e a fonte do texto têm de cumprir **todos**:

1. **É uma Google Font.** O template carrega fontes com `next/font/google`.
2. **Tem os acentos portugueses** (ã, õ, ç, é, ê, á, à). Todas as fontes com o
   subconjunto `latin` os têm; confirma que o `latin` existe.
3. **Tem os pesos que o template usa.** Lê os `weight` no ficheiro das fontes
   e confirma que existem na fonte nova.
4. **Itálico, se o template o usar.** Se os títulos têm uma parte em itálico
   (ex.: texto entre `*asteriscos*` que sai em `<em>`), a fonte dos títulos tem
   de ter itálico verdadeiro. Confirma pedindo a folha de estilos:
   `https://fonts.googleapis.com/css2?family=<Nome+Da+Fonte>:ital,wght@1,400`
   Se a resposta for um erro (400), a fonte não tem itálico: escolhe outra.
5. **Não é escolhida por hábito.** Consulta o registo e, entre opções com a
   mesma qualidade, prefere uma combinação ainda não usada numa casa próxima.
   Reutilizar uma fonte continua a ser válido quando ela serve melhor a voz e
   o layout.

## 2. Como escolher

Começa pela casa, não pela fonte:

| Se a casa é… | Os títulos pedem… | Exemplos (não é uma lista fechada) |
|---|---|---|
| Antiga, senhorial, quinta com história | Serifa clássica de contraste alto | Cormorant Garamond, Bodoni Moda, Playfair Display |
| De família, simples, acolhedora | Serifa suave, mais redonda | Newsreader, Lora, Crimson Pro |
| Rústica, de pedra, de montanha | Serifa sólida, com peso | Young Serif, DM Serif Display, Libre Caslon Display |
| Moderna, de arquitetura, minimalista | Sem serifa, limpa | Bricolage Grotesque, Manrope, Figtree |
| À beira-mar, luminosa, descontraída | Serifa leve e aberta, ou sem serifa arredondada | Gilda Display, Nunito Sans |

**O texto corrido** pede sempre uma fonte muito legível e discreta, sem
serifa na maior parte dos casos (Jost, Figtree, Manrope, Instrument Sans,
Mulish). Não uses duas fontes com personalidade forte ao mesmo tempo: se os
títulos gritam, o texto sussurra.

**Não uses por defeito** Inter nem Roboto: são neutras ao ponto de o site
perder carácter.

## 3. Como trocar

1. Abre o ficheiro que carrega as fontes (ex.: `src/lib/fontes.ts`).
2. Troca **só** o nome importado e os `weight`/`style`. Mantém o nome das
   variáveis CSS (ex.: `--fonte-display`), porque o resto do site lê essas
   variáveis.
3. Atualiza o comentário do ficheiro com o porquê da escolha, numa frase.
4. Reinicia o servidor se as fontes não atualizarem (o `next/font` às vezes
   não recarrega a quente).

## 4. Medir depois de trocar

Com o Playwright, a 1440 × 900 **e** a 390 × 844:

1. **Título principal do primeiro ecrã:** conta as linhas. Mede a altura do
   elemento e divide pela altura de linha calculada. Não pode ter mais linhas
   do que tinha com a fonte original, e tem de caber no ecrã com o botão.
2. **Botões:** nenhum pode partir em duas linhas. Um botão partido fica mais
   alto do que os outros do mesmo tipo.
3. **Palavras com hífen** (ex.: "devolvê-la"): confirma que não partem a meio.
4. **Itálico:** confirma que o `<em>` dos títulos está mesmo em itálico
   (`getComputedStyle(em).fontStyle === 'italic'`) e que a letra muda de
   desenho (mede a largura da palavra com e sem itálico; se for igual, o
   browser está a inclinar uma fonte sem itálico, o que é proibido).

**Se algum título partir linhas a mais:** reduz o tamanho desse tipo de título
de forma proporcional em todos os sítios onde aparece (ex.: de `text-[5.4rem]`
para `text-[5rem]`), e só nos títulos. Se precisares de reduzir mais de 12%,
a fonte é demasiado larga para este template: escolhe outra.
