# O que o site pode dizer: cerrado-dos-outeirinhos

_Vista gerada de `contrato.json`; não editar manualmente._

## Estado da revisão

- Revisão: 2026-09-21
- Prontidão: `com_limitacoes`
- Notas: Migração do dossiê legado. A morada, a classificação de suites, o voucher e a atribuição de fotografias a unidades permanecem condicionados ou bloqueados.

## Pode afirmar como facto

Afirmações confirmadas que o site pode fazer pela sua própria voz.

| Afirmação | Âmbito | Condição | Provas |
|---|---|---|---|
| `AFIR-CER-TIPO` O Cerrado dos Outeirinhos é uma Casa de Campo registada no RNET sob o número 4538. | — | — | `EVID-CER-RNT` |
| `AFIR-CER-CINFANES` A casa situa-se no concelho de Cinfães. | — | — | `EVID-CER-RNT` |
| `AFIR-CER-CAPACIDADE` O RNT regista seis unidades de alojamento e doze utentes. | — | — | `EVID-CER-RNT` |
| `AFIR-CER-JARDIM` A casa publica fotografias e descrição de jardim e esplanadas. | — | — | `EVID-CER-SITE`, `EVID-CER-FOTOS` |

## Pode afirmar com condição

O texto tem de preservar a condição e o âmbito indicados.

| Afirmação | Âmbito | Condição | Provas |
|---|---|---|---|
| `AFIR-CER-TIPOS-BOOKING` A página Booking observada vende Quarto Duplo, Suite com Entrada Jardim e Suite. | {"canal": "Booking", "recolhido_em": "2026-09-19"} | Descrever como tipos observados no Booking na data de recolha, não como inventário completo ou classificação RNT. | `EVID-CER-BOOKING` |
| `AFIR-CER-PEQUENO-ALMOCO` O pequeno-almoço está incluído nas tarifas publicadas pela casa e no Booking observado. | {"tarifas": "publicadas ou observadas em 2026-09-19"} | Confirmar na tarifa selecionada antes de prometer ao visitante. | `EVID-CER-SITE`, `EVID-CER-BOOKING` |

## Só citando

Conservar aspas, autor e plataforma; não converter em voz da casa.

_Nenhum registo._

## Só para inspiração editorial

Pode orientar tom ou composição, mas não fundamenta promessas factuais.

_Nenhum registo._

## Não usar

Não afirmar, sugerir nem preencher esta lacuna com conteúdo do molde.

| Afirmação | Âmbito | Condição | Provas |
|---|---|---|---|
| `AFIR-CER-MORADA` A morada tem um único número de porta confirmado. | — | — | `EVID-CER-RNT`, `EVID-CER-BOOKING`, `EVID-CER-SITE` |
| `AFIR-CER-SUITES` A classificação de suites é uniforme entre RNT, site e Booking. | — | — | `EVID-CER-RNT`, `EVID-CER-BOOKING`, `EVID-CER-SITE` |
| `AFIR-CER-VOUCHER` O voucher-presente está atualmente disponível. | — | — | `EVID-CER-SITE` |
| `AFIR-CER-DOCES-AUTORIA` D. Ana faz atualmente os doces do pequeno-almoço. | — | — | `EVID-CER-B013` |
| `AFIR-CER-BANHO-EIRA` Uma fotografia de casa de banho identifica a Suite Eira. | — | — | `EVID-CER-BOOKING` |

## Citações selecionadas

| Excerto literal | Autor | Plataforma | Review |
|---|---|---|---|
| `CIT-CER-ANFITRIAO` “Gostei muito do proprietário, o professor Zezé, da sua simpatia, o seu profissionalismo e dos seus conhecimentos.” | Alice | Booking | `B-004` |
| `CIT-CER-SUITE` “Tudo espetacular. Ficamos na suite com entrada pelo jardim e era excecional.” | Filipa | Booking | `B-013` |

## Cobertura e limitações

| Material | Fonte | Estado | Limitação |
|---|---|---|---|
| `COB-CER-IDENTIDADE` identidade | RNT, site e Booking | completo_no_universo_observado | Morada com números de porta divergentes. |
| `COB-CER-REVIEWS` reviews | Booking, Google e TripAdvisor | parcial | Não se repetiu a recolha nesta migração; conservadas as fontes existentes. |
| `COB-CER-QUARTOS` quartos | Booking, site e RNT | parcial | Divergência na classificação de suites e associação de fotografias. |
| `COB-CER-FOTOS` fotos | Site, Booking e Facebook da casa | parcial | Instagram e álbuns Facebook completos exigiam sessão; apenas associações explícitas são utilizáveis. |
