# Viseu — distrito

**Estado: bloqueado na quota da Google. Lote não produzido.**
Corrida de 11 de Setembro de 2026, 00:18 → 02:45.

Não há leads. Não há aprovados, não há duvidosos, não há nada para decidir.
A descoberta correu e correu bem; o que falhou foi o passo seguinte, e sem ele
não existe um único nome de casa para qualificar.

---

## O funil em números

| Fase | Resultado |
|---|---|
| Encontrados (IDs de lugar) | **10 010** |
| Com detalhes (nome, site, avaliações) | **0** |
| Dentro do nicho (§5) | **0** |
| Duvidosos | **0** |
| Verificados (§6) | **0** |
| Aprovados | **0** |

A pilha de duvidosas está vazia porque **nenhuma casa chegou a ser analisada**,
e não porque as dúvidas foram arrumadas noutra pilha. É a única leitura em que
uma pilha vazia não é sinal de trabalho mal feito.

---

## O que correu bem

Fase A, a pesquisa, é gratuita e cumpriu:

- 51 961 células pesquisadas, 11 níveis de subdivisão por saturação
- 10 010 lugares únicos no distrito, 5003 km²
- 0 células falhadas até ao corte
- os 46 termos e tipos produziram todos resultados, nenhum a zero
- custo: **0,00 $**

Os termos e a grelha não foram tocados, como pedido.

## O que bloqueou

O projeto Google **67843889303** tem os três métodos da Places API limitados a
**100 pedidos por dia**:

| Quota | Limite |
|---|---|
| `SearchNearbyRequestPerDayPerProject` | 100/dia |
| `SearchTextRequestPerDayPerProject` | 100/dia |
| `GetPlaceRequestPerDayPerProject` | 100/dia |

A janela atual começou a 10/09/2026 07:00 UTC e renova a **11/09/2026 07:00
UTC** (08:00 de Lisboa).

A fase A passou muito acima de 100 porque a Google só aplica a quota com
atraso: o pico de concorrência entrou antes do limitador fechar. Quando fechou,
fechou para tudo.

A fase B1, a triagem barata, precisa de uma chamada `GetPlace` por lugar —
10 000 chamadas. **Todas as 10 000 falharam**, nenhuma resposta foi gravada. A
fase B2, a que traz nome, website, avaliações e telefone, nunca arrancou.

**Esperar pela renovação não resolve.** Com 100 `GetPlace` por dia, triar
10 000 lugares levaria cem dias. O problema é o tecto, não a hora.

## Nada foi faturado

Chamadas falhadas não se pagam. O contador `uso-mensal.json` continua em
Agosto, ou seja, Setembro está a zero nos três SKUs. Não usei `--aceito-pagar`
nem `--max-details`.

**Um pormenor que quase custou dinheiro.** A fase B1 não tem tecto no motor: o
guarda do gratuito só protege a B2. Com 10 010 lugares contra 10 000 chamadas
Essentials gratuitas por mês, a B1 teria faturado 10 chamadas sem pedir
autorização. O checkpoint de trabalho foi reduzido aos 10 000 mais relevantes e
o ficheiro completo está guardado em
`.state/alojamento__viseu__run.completo-2026-09-11.json`. Os 10 que saíram
voltam ao lote no mês seguinte. **Antes da próxima corrida da B1, confirmar que
o corte ainda está aplicado.**

---

## Depois: a chave passou de 429 a 403

Cerca de uma hora depois do corte, a mesma chamada deixou de dar 429 com corpo
de quota e passou a dar **403 `PERMISSION_DENIED`, sem corpo nenhum**, em todos
os métodos. Foram ~62 000 chamadas numa noite.

403 sem detalhes não é quota. É a API desactivada no projeto, uma restrição na
chave, facturação em falta, ou a chave a não pertencer ao projeto que se pensa.
**Antes de mais nada, confirmar isto na consola** — enquanto der 403 não há
pipeline nenhum que funcione.

## O pipeline foi mudado para não repetir isto

O funil já não usa a fase paga do motor. Passou a haver
`scripts/detalhar.js` na skill de alojamento, descrito no §2.5, e o motor
continua intocado. Em números, para Viseu:

| | Fase paga do motor | §2.5 |
|---|---|---|
| Chamadas para nomear o distrito | ~11 000 | ~1 000 |
| Unidades de quota por casa nomeada | 2 | 1 |
| Lugares descartados sem gastar nada | 0 | 3 599 |
| Ao bater na quota | percorre a fila a falhar | pára e retoma amanhã |

A fila de Viseu está calculada e pronta: **6 411 candidatos**, ordenados por
relevância, dos quais 2 362 provadamente no distrito. O topo da fila são casas
encontradas pelos tipos `bed_and_breakfast`, `guest_house`, `hostel` e
`farmstay`, com a posição apertada a menos de 300 metros.

## Como retomar

1. **Resolver o 403** em Cloud Console, para o projeto **67843889303**: Places
   API (New) activa, restrições da chave, facturação, e confirmar que a chave é
   mesmo deste projeto. O número vem no corpo de um 429.

2. **Subir a quota** `GetPlaceRequestPerDayPerProject`. Com o §2.5 já não são
   precisos 12 000/dia: 1 000/dia acabam Viseu numa corrida. A 100/dia leva dez
   dias, sem gastar nada e sem intervenção.

3. **Nomear as casas**, cem por dia ou o que a quota der:

   ```bash
   node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/detalhar.js \
        --regiao viseu --simular     # ver a fila sem gastar
   node nichos/alojamento/.claude/skills/prospeccao-alojamento/scripts/detalhar.js \
        --regiao viseu
   ```

4. Depois a auditoria e a nota (§3 e §4 da skill), e só então o trabalho de
   §5 e §6 pela ordem de `leads_alojamento_prioritarias`.

**Não é preciso completar a fase A para avançar.** Os 10 010 lugares já estão em
mão e o §2.5 trabalha com eles.

### Um buraco de cobertura conhecido

A fase A foi cortada na subdivisão 10, com 17 344 células por correr. Essas
células **não voltam num retomar**: o motor só regenera filhos de células que
ainda não estão marcadas como feitas, e as mães destas já estão. O buraco é
fino — as subdivisões 8, 9 e 10 traziam cerca de 40 lugares novos cada, contra
9957 já encontrados — mas existe e não é invisível.

Para o fechar seria preciso apagar o checkpoint e correr a fase A de novo, com
a quota já subida. Custaria zero em dinheiro e algumas horas de relógio.

---

## Concorrência local

Sem acrescentos. A tabela do distrito de Viseu em
`nichos/alojamento/.claude/skills/prospeccao-alojamento/references/rubrica.md`
continua por abrir: os estúdios entram pelos rodapés dos sites verificados no
§6, e nenhum site foi aberto.

## Próximos passos

1. Subir a quota do projeto 67843889303.
2. Retomar a descoberta e deixar a fase B chegar ao fim.
3. Auditoria, nota, e o funil de precisão pela ordem da vista.
4. Artifact do lote, e alimentar a tabela de concorrência com os rodapés.
