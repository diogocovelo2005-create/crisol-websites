# Padrão das inspirações e três variações

Feito pelo Claude, uma vez por ronda, antes de lançar os protótipos. Grava
`prototipos/PADRAO.md` e `prototipos/variacoes.json`. O Diogo não precisa de
os ver antes.

## O padrão

As capturas do Diogo são **puramente estéticas**. Nas palavras dele: não é
para replicar nenhuma a 100%, nem para fazer cada protótipo a dar match com
uma inspiração. É para perceber **o padrão entre elas** e ir de encontro a
esse padrão. As secções das inspirações não interessam: as secções e a ordem
vêm da estrutura.

Lê as capturas **juntas, uma só vez**, e escreve o que se repete entre elas.
Não descrevas cada uma. Até 40 linhas, sobre:

- **Combinações de cor**: a relação entre fundo, texto e acento (claro sobre
  escuro, temperatura, saturação, quantos tons). Relações, não hex.
- **Combinações de tipografia**: que tipo de letra nos títulos e no texto, o
  contraste entre as duas, caixa alta, itálicos, espaçamento.
- **Ritmo**: como as secções alternam (foto inteira, texto, blocos, mais
  cheio ou mais arejado), a densidade e o espaço em branco.
- **Maneira de apresentar**: como tratam as fotos (sangradas, emolduradas,
  arredondadas, em colagem), as citações, as listas, os rótulos.
- **O que está ausente** em todas: também é padrão.

Descreve o que está nas imagens dele. Não acrescentes gosto teu.

## As três variações

Os três protótipos seguem o mesmo padrão e têm de ser **visivelmente
diferentes**. A diferença vem de quatro eixos, e cada variação muda vários:

1. **Cor**: cada uma parte de uma família de cor diferente **presente nas
   fotos da casa** (vê as cores dominantes em `fotos.md`). Assim a paleta
   combina sempre com as fotografias.
2. **Formato**: a forma geral da página (colunas editoriais, painéis de cor
   inteiros, fotos a sangrar, blocos com moldura…), dentro do que o padrão
   admite.
3. **Ritmo**: a alternância e a densidade das secções.
4. **Maneira de apresentar o conteúdo**: como aparecem as citações, a lista
   dos quartos, os factos, os contactos.

`variacoes.json`:

```json
[
  {
    "letra": "a",
    "nome": "nome curto em português",
    "ideia": "uma frase para o cartão da página de escolha",
    "cor": "a família de cor das fotos de que parte, com 2 ou 3 hex de fotos.md",
    "formato": "…",
    "ritmo": "…",
    "apresentacao": "…"
  }
]
```

Cada eixo em uma ou duas frases. É um ponto de partida para o construtor,
não uma especificação: ele decide o resto dentro das regras.
