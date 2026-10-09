# Artifact — a folha viva do lote

O entregável do funil é uma página HTML publicada como artifact, para ler o
lote no telemóvel. Onde se marca o estado de cada lead é na tabela
`crm_alojamento`, e não na página.

## Estrutura da página

1. **Cabeçalho** — região, data da verificação, contagem grande de aprovados.
2. **Começar por estes** — duas a quatro casas com o hook mais forte,
   destacadas no topo, cada uma com uma linha a explicar porquê.
3. **Decide tu** — a pilha das duvidosas, **aberta e logo a seguir ao topo**,
   nunca escondida no fim. Ver a secção própria abaixo.
4. **Grupos por concelho**, cada um com o seu contador, e dentro uma linha por
   casa.
5. **Tabela do universo** — colunas: concelho, encontrados, dentro do nicho,
   duvidosos, verificados, passaram a rubrica, aprovados. Com linha de total.
6. **Secções fechadas** no fim: descartados pela rubrica com o motivo, fora do
   nicho com o motivo e a prova, e por verificar.
7. **Rodapé** — a regra de inclusão e a rubrica usadas, para a página se
   explicar sozinha daqui a meses.

## A secção "Decide tu"

É a única parte da página onde o trabalho está por acabar, e por isso fica em
cima, aberta, e com o seu próprio contador.

Cada casa aqui traz **a pergunta concreta que ficou por responder**, e não uma
etiqueta vaga. "Não se percebe se tem quatro quartos ou dois, o Booking não
lista a casa" é útil. "Duvidoso" não é.

Traz também o que já se sabe, para ele decidir sem repetir o trabalho: os
links que se seguiram, o que se procurou, e onde é que a pista morreu. Ao lado,
os mesmos botões de estado das outras, mais dois: **aceitar** e **excluir**.

## A linha de cada casa

```
[estado ▾]  Nome da casa            4,8 · 312 avaliações
            Sem site — só página de Facebook   [link de prova · 10/09/2026]
            Hook: 312 avaliações e nenhuma presença própria
            [notas ...................................]
```

- **estado**: o valor da coluna `estado` da tabela (a lista está no §8 do
  SKILL.md)
- **link de prova**: obrigatório, com a data da verificação
- **hook**: uma frase, só com factos que qualquer pessoa consegue confirmar
- **notas**: campo livre, é onde ele escreve

As casas **deixadas à decisão dele** aparecem com marca visual distinta e a
hesitação escrita na linha, por exemplo "nota 3,9, audiência grande mas
reputação má".

## Persistência

**O estado e as notas não se guardam na página.** Vivem nas colunas `estado` e
`notas` de `crm_alojamento`, onde ele os edita no Table Editor do Supabase. A
página mostra-os como estavam na tabela quando foi gerada, e diz a data. O
mesmo estado guardado em dois sítios acaba por se perder.

**Em sessões futuras, lê `estado` e `notas` da tabela antes de refazeres a
página.**

## Design

- legível no telemóvel, que é onde ele consulta isto
- claro e escuro, ambos definidos
- densidade alta: é uma folha de trabalho, não uma apresentação, e cinquenta
  linhas têm de caber sem scroll infinito
- cor só onde carrega significado: estado do site, estado do contacto, e a
  marca de "decides tu"
