# Casa da Calçada — adaptação do molde

Base de 2026-09-22, refeita a 2026-09-23 com a skill `design-taste-frontend`
(instalada de github.com/Leonxlnx/taste-skill).

## Design read

Redesign em overhaul de um site de turismo de habitação, para casais e para
grupos que reservam uma noite no Douro, com linguagem editorial de arquivo,
sobre Tailwind v4, EB Garamond, Geist e movimento contido.

Dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 3`.

Referência de simplicidade dada pelo Diogo: La Bastide, maison d'hôtes em
Provença. Daí vêm os títulos ao centro, os cartões iguais e o ritmo vertical
repetido.

## As três regras desta página

1. **Nenhuma animação corta, tapa ou revela aos bocados uma fotografia.** O
   material desta casa não passa dos 1620 px e é o único argumento visual que
   existe. Onde há prisão de scroll, o cartão inteiro (fotografia, nome e
   nota) é medido para caber no ecrã preso.
2. **Nenhum rótulo assenta por cima de uma fotografia.** As legendas ficam
   sempre por baixo, o que evita ter de escurecer a imagem para se lerem.
3. **Três rótulos em maiúsculas no máximo**, que é o limite da skill para sete
   secções: hero, espaços e experiência.

## Combinação

| Secção | O que é | Porquê |
|---|---|---|
| Hero | fotografia de ecrã inteiro, promessa no terço de baixo | A `piscina-torre-01` tem a piscina, a torre sineira e a serra na mesma imagem. A 1440 px o recorte tira 50 px em baixo e mais nada. Só a faixa de baixo escurece; o véu em diagonal do molde apagava as encostas e fazia parecer outra foto. |
| A casa | texto à esquerda, uma fotografia à direita | Saiu o arquivo de quatro entradas: competia com os espaços e obrigava a ilustrar o século XVIII com uma foto tirada este ano. A história cabe nas duas primeiras linhas. |
| Espaços | **E1 adaptado**, faixa presa que anda de lado | A largura do cartão sai de `100dvh` menos o cabeçalho, o texto e as margens, e a fotografia é 4:5. No catálogo a foto ocupava a altura toda e o nome caía por baixo da dobra. |
| Factos | faixa de quatro, ao centro | Quatro afirmações com uso `afirmar` no contrato. Sem caixas. |
| Experiência | **P1 Relógio sem a linha do dia** | Quatro coisas que acontecem sempre, não horas. A barra de manhã/tarde/noite dizia o contrário do texto. A fotografia entra na proporção dela (3:2), sem zoom e sem recorte. |
| Opiniões | três citações, título ao centro | À letra, com autor, canal e data. A nota do Booking leva escala, plataforma, total e data, que é a condição de `AFIR-NOTA-BOOKING`. |
| Fecho | **F3 Cortina** | Sobe e revela a quinta vista de cima (`aerea-01`). |

## Identidade

- **Paleta:** a cor dominante medida nas fotografias é o granito, cinzento
  neutro (rgb 184,184,184). Daí ardósia fria mais um único acento de
  terracota, que é a telha e os portões da capela. Evitou-se de propósito a
  família creme + latão + expresso, que é o que sai por defeito em qualquer
  página de casa de campo e que aqui seria falso, porque a casa é de pedra
  cinzenta. Modo escuro definido nos mesmos tokens.
- **Tipografia:** EB Garamond nos títulos e Geist no texto. A skill proíbe
  pelo nome Fraunces e Instrument Serif, e desaconselha serifa por defeito; a
  serifa justifica-se aqui por a casa ser do século XVIII, ter capela
  consagrada e cantaria feita à mão. Não se repetiu Cormorant, Playfair nem
  Bodoni, já usadas no nicho.
- **Forma:** tudo recto, raio 0 em fotografias, cartões, botões e campos.

## O que a base não diz, de propósito

Os seis conflitos activos do dossiê estão todos fora, listados com o motivo
em `conteudo-fontes.json#omissoes`: recepção à chegada, estado da piscina,
qualquer descrição do pequeno-almoço além de estar incluído, bar aberto,
cozinha equipada no apartamento e preços. Também ficou de fora reservar a
casa inteira para um grupo, que é o argumento de mais valor por noite: não há
fotografia da casa montada para um grupo, não há preço, e o número de 16
pessoas vem da tabela do Booking e não da casa.

## Armadilha a lembrar

O Next serve `/_next/image?url=...` a partir de cache. Trocar o ficheiro sem
trocar o nome faz o browser continuar a mostrar a imagem antiga, mesmo depois
de limpar `.next/cache/images` e reiniciar o servidor. Por isso as fotografias
trocadas passaram a ter o nome da origem: `hero-piscina-torre-01.jpg`,
`a-casa-telhado-ameias.jpg`, `fecho-aerea.jpg`.

## Verificação

- Dossiê: `validar-dossie.py --verificar-relatorio` → 0 erros, 0 avisos.
- Rastreabilidade: `verificar-conteudo-fontes.mjs` → aprovada.
- `tsc --noEmit`, `npm run lint` e `npm run build` passam. O build gera só `/`
  e `/_not-found`.
- Browser a 1440×900: hero, a casa, espaços presos, factos, experiência presa,
  opiniões e fecho percorridos; sem scroll horizontal.

**Não verificado:** telemóvel a 390×844 depois da última reescrita, movimento
reduzido, teclado, e o contraste medido par a par com a paleta nova.
