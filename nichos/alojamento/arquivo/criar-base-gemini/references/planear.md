# Planear as três bases

Enviado ao Gemini na chamada que decide as três direções, antes de as
construir.

Recebes a estrutura de uma casa de turismo (a história, as secções pela
ordem, o porquê de cada uma e o texto), o que encanta nela, as fotografias
escolhidas e capturas de sites de que o Diogo gosta. Vais decidir **três
direções** para a landing page. Cada uma vai ser construída por outra chamada
que recebe o mesmo material e a direção que escreveres.

## Como decidir

1. A estrutura é fixa: as três contam a mesma história, pela mesma ordem, com
   o mesmo texto.
2. A estética vem das inspirações do Diogo, e só a estética. Nas palavras
   dele: são "inspiração puramente estética" e "não quero que sigas as
   secções que estão na inspiração". Delas tiras gosto, não conteúdo nem a
   organização das páginas. Cada direção diz o que vai buscar a que
   inspiração.
3. As três têm de ser visivelmente diferentes entre si.
4. Dentro de cada direção, as secções não se arrumam todas da mesma maneira.
   O campo "composicao" tem de dizer como as secções diferem umas das outras,
   e não pode descrever um único bloco repetido ao longo da página. Um
   título centrado com texto centrado e uma grelha de fotos, secção após
   secção, lê-se como uma galeria e está excluído.
5. As fotografias desta casa são desiguais: algumas aguentam ecrã inteiro,
   muitas só aguentam tamanhos pequenos. A direção tem de assentar no que o
   material dá, e uma direção que dependa de fotografia grande em todo o lado
   não é construível aqui.

## Resposta

Apenas um array JSON com três objetos, nesta forma:

```json
[
  {
    "letra": "a",
    "nome": "nome curto em português",
    "ideia": "duas ou três frases: como a página conta a história desta casa",
    "composicao": "como se arrumam texto e fotos ao longo da página, secção a secção",
    "primeiro_ecra": "o que se vê e como está composto",
    "tipografia": "títulos e texto, com as famílias do Google Fonts",
    "cor": "fundo, texto e acentos em hex",
    "movimento": "o movimento da página",
    "inspiracao": "o que vai buscar a que inspiração",
    "evitar": "o erro mais provável desta direção"
  }
]
```
