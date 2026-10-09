# Inclusão — quem é que é do nicho

Ler no §5, antes de deixar uma casa entrar no lote.

A descoberta é de recall: varre a região com 38 termos e 8 tipos, e traz de
propósito coisas que não são o nicho. Esta porta é que separa. Sem ela, o lote
enche-se de hotéis pequenos e de apartamentos avulsos, e o tempo caro do §6
gasta-se em quem nunca ia comprar.

## As quatro perguntas

Entra quem responder **sim às quatro**. Uma resposta negativa chega para ficar
de fora.

**1. Tem nome ou marca própria?**
Uma casa com nome é uma casa que já pensa em si como negócio. "Apartamento T2
centro" não é marca, é anúncio.

**2. É gerida pelo dono?**
Não cadeia, não rede, não franquia. O teste do rodapé: se o mesmo site serve
três casas, é grupo. Ver a lista de exclusão abaixo.

**3. Tem quatro ou mais unidades?**
Quartos, estúdios ou apartamentos. Abaixo disso não há orçamento para um site
e o dono trata aquilo como rendimento extra, não como negócio.

**4. Tem anfitrião ou receção?**
Alguém recebe. Uma caixa de chaves na parede e um código por SMS não é
alojamento com anfitrião, é arrendamento curto.

## Onde se vai buscar a resposta

As perguntas 1 e 4 leem-se no Google, na ficha e nas avaliações. A pergunta 2
lê-se no rodapé do site, quando há, e no nome.

**A pergunta 3 não vem do Google.** O número de unidades só aparece na página
da casa no Booking ou no site dela. Consulta **uma casa de cada vez**, pela
página da propriedade.

Não faças raspagem de listas de resultados do Booking. Não é preciso, porque a
lista de casas já veio do Google, e é onde este funil costumava perder-se: as
listas do Booking não paginam por parâmetro, cortam aos 25 resultados por
ordenação, e misturam concelhos vizinhos sem avisar.

## Cadeias e redes a excluir à cabeça

Não precisam das quatro perguntas. Ficam fora directamente.

- Movijovem e HI, as pousadas de juventude
- Change The World Hostels
- Zero Box Lodge
- qualquer unidade com classificação de hotel no registo nacional
- grupos que operam várias marcas com site partilhado

## Três respostas possíveis, e não duas

A pergunta não é "passa ou não passa". É "passa, falha com prova, ou não se
consegue apurar".

| Resposta | Quando | Vai para |
|---|---|---|
| **dentro** | as quatro respondidas com sim | o lote |
| **fora** | uma falhou **e há prova concreta** | fora do nicho, sem perguntar |
| **duvidoso** | não se conseguiu apurar | a decisão dele |

O que conta como prova: está na lista de cadeias acima, a página do Booking diz
o número de quartos e é menos de quatro, o rodapé mostra que o mesmo site serve
várias casas.

O que **não** é prova: a casa não está no Booking, a página não diz quantos
quartos tem, o nome é ambíguo, não se percebe quem gere. Isso é dúvida, e a
dúvida sobe.

**Nunca uses "fora" para arrumar uma casa que não conseguiste avaliar.** Uma
casa marcada fora do nicho não volta ao lote nunca mais, e o custo de a errar é
permanente. O custo de a mandar para duvidosos é ele olhar dez segundos para
ela.

## Como registar

Em `audit_extra`, três chaves:

- `inclusao`: `"dentro"`, `"fora"` ou `"duvidoso"`
- `motivo`: qual das quatro perguntas falhou, ou o que ficou por apurar, em
  meia dúzia de palavras
- `prova`: link e data, sempre que a resposta for `"fora"`

**Fora do nicho não é o mesmo que descartado pela rubrica.** Fora do nicho quer
dizer que nunca foi cliente possível. Descartado quer dizer que é do nicho mas
já tem um site bom. As duas listas vão separadas no artifact, e a razão é
prática: daqui a um ano o site bom pode ter envelhecido e a casa volta ao lote,
enquanto um hotel de cadeia nunca volta.
