# Contrato do dossiê para construir a base

`contrato.json` é a fonte de verdade estruturada entre a investigação e a
construção. Não substitui os documentos de evidência: aponta para eles e fixa
o que cada elemento permite dizer ou mostrar no site.

Usa o formato definido em `../schemas/contrato.schema.json`. O ficheiro
`site-pronto.md` é uma vista legível do contrato, gerada pelo script da skill;
não se altera à mão.

Começa por `../examples/contrato-minimo.json` para a estrutura mínima. Os
testes em `../tests/test_validar_dossie.py` mostram variantes deliberadamente
inválidas e a mensagem de erro esperada. Usa também
`../examples/casos-decisao.md` antes de classificar casos ambíguos.

## Quando criar e atualizar

Cria o contrato na fase 5, depois de cruzar fontes e antes de escrever o
resumo final. Atualiza-o sempre que entra uma prova, uma restrição do dono ou
uma decisão que altere o que se pode usar. Corre o validador depois de cada
alteração.

O contrato pode declarar `com_limitacoes`: falta de reviews, fotos ou canais
não obriga a inventar nem bloqueia uma base que ainda tenha identidade,
conteúdo suficiente e uma ação final confirmada. Usa `bloqueado` quando a
identidade da casa ou o caminho de contacto/reserva necessário para a base não
estiverem confirmados.

## O que cada grupo responde

| Grupo | Pergunta que resolve |
|---|---|
| `manifesto` | Que revisão é esta e está pronta para que fim? |
| `entidades` | Isto fala da casa, de um quarto, de um espaço ou de uma tarifa? |
| `evidencias` | Quem disse isto, onde, quando e sobre que entidade? |
| `afirmacoes` | Pode o site afirmar, condicionar, citar ou deve omitir? |
| `citacoes` | Qual é o excerto literal, quem o escreveu e de que review saiu? |
| `ativos` | Que imagem existe, o que mostra e que associações estão confirmadas? |
| `decisoes` | Que pedido ou restrição continua ativo e o que substituiu? |
| `cobertura` | O que foi procurado, recolhido, bloqueado ou ficou em falta? |

## Regras de decisão

Cada afirmação descreve uma proposição só e referencia pelo menos uma
evidência. A `origem` diz quem publicou ou disse; a `natureza` diz o que é; a
`categoria` separa informação geral, inventário, disponibilidade, tarifa,
política, contacto e avaliação; o `estado` diz se está confirmado; o `uso` diz
como a base a pode utilizar. Nenhum destes campos substitui os outros.

- `afirmar` só aceita estado `confirmado`.
- `afirmar_com_condicao` só aceita estado `confirmado` e uma condição escrita
  no próprio registo. Exemplo: uma tarifa ou datas específicas.
- `tarifa` e `disponibilidade` usam sempre `afirmar_com_condicao`, com
  `ambito` não vazio. Não transformes o resultado de uma pesquisa numa
  promessa geral ou num inventário da casa.
- `citar` conserva as palavras e o autor da fonte; uma tradução é registada
  como tradução, não como original.
- `inspiracao_editorial` pode orientar tom e composição. Não permite inventar
  serviço, rotina, horário ou garantia.
- `nao_usar` aplica-se a conflito, material histórico, restrição ativa ou
  informação insuficiente.

Uma mesma proposição não pode ter simultaneamente uma afirmação ativa que a
autoriza e outra que a bloqueia. Se os valores são realmente diferentes por
unidade, tarifa ou período, regista esse âmbito em vez de os tratar como
contradição.

## Âmbito e datas

Usa `ambito` para declarar a que entidade, tarifa, datas, ocupação, estação ou
exceção a afirmação se aplica. Não alargues uma condição de um quarto a toda a
casa, nem disponibilidade observada a inventário.

Em cada evidência guarda a data de recolha e, quando conhecida, a data de
publicação ou estadia. A data de recolha não torna atual um texto antigo. O
campo `atualidade` explica se a revisão futura é necessária e porquê.

| Classe | Regra de atualidade |
|---|---|
| `tarifa` e `disponibilidade` | Registar pesquisa, ocupação e datas; rever antes de cada base e nunca apresentar como regra geral. |
| `contacto` e `politica` | Confirmar na fonte ativa ou com o dono antes de publicar; uma página antiga não substitui uma confirmação. |
| `inventario` | Exigir fonte que se refira ao total/à unidade, não um resultado de disponibilidade. Rever quando a fonte mudar. |
| `avaliacao` e `testemunho` | Guardar data da review; pode ser citado como histórico, mas não prova o estado atual de um serviço. |

## Provas, reviews e imagens

Uma evidência tem URL ou caminho local e identifica o bloco/página/galeria.
Uma citação aponta para a review de origem, declara a língua e mantém o
original separado de uma eventual tradução. O validador confirma que o excerto
original aparece no texto da review; um corte só usa `[…]` e conserva os
segmentos pela ordem original. O validador não valida traduções automaticamente.

Uma imagem guarda caminho, dimensões reais, assunto, publicador, uso e
restrições. Pode ser útil sem estar atribuída a uma unidade. Só preenche
`entidade_confirmada` quando há prova explícita, não apenas porque a imagem
apareceu na galeria desse quarto. `publicador`, autoria fotográfica e permissão
de utilização são campos diferentes.

## Decisões e atualizações

Pedidos do dono e decisões do utilizador entram em `decisoes`, com data, fonte,
efeito e IDs afetados. Usa `bloquear_uso` quando a decisão retira material: uma
decisão ativa desse tipo obriga uma afirmação afetada a `nao_usar` e impede que
um ativo afetado continue `utilizavel`. Quando for substituída, conserva a
decisão antiga com estado `substituida` e liga-a à nova. Atualiza a afirmação ou
ativo afetado e volta a gerar `site-pronto.md`.

## Cobertura

Cada fonte procurada fica em `cobertura`, inclusive quando não devolveu
resultado. Indica a superfície percorrida, total observado quando existe,
material recolhido, estado e limitação. `nao_encontrado` significa que não foi
encontrado naquele percurso; nunca prova que não exista.

Quando o universo observado confirmou zero reviews, a tabela inicial de
`reviews.md` declara `Recolhidas: 0` e o registo de cobertura declara
`completo_no_universo_observado`, com `observado: 0` e `recolhido: 0`. Se a
recolha foi parcial ou bloqueada, declara essa lacuna em vez de a chamar ausência.
