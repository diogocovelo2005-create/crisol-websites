# Casos de decisão do contrato v1

| Situação | Registo seguro | Uso permitido |
|---|---|---|
| Casa com pouca informação, mas identidade e contacto confirmados | `prontidao: com_limitacoes`; cobertura declara o que não foi encontrado | Base curta, sem preencher lacunas com conteúdo do molde |
| Foto enviada pelo dono sem unidade provada | ativo com `publicador: dono` e sem `entidade_confirmada` | Usar para a casa/ambiente; não dizer que mostra um quarto específico |
| Pequeno-almoço numa tarifa observada | afirmação `categoria: tarifa`, `afirmar_com_condicao`, com `ambito` e condição | Só com a tarifa e condição declaradas |
| Quarto sem foto confirmada | entidade do quarto existe; nenhum ativo atribuído | Descrever apenas o que a prova sustenta; não escolher uma foto genérica como se fosse dele |
| Fonte bloqueada | cobertura com estado `bloqueado` e limitação | Não concluir inexistência nem preencher por inferência |
| Review traduzida | citação guarda `texto_original`, `lingua` e, se existir, `traducao` | Mostrar o original como original; identificar a tradução |
| Decisão posterior para retirar conteúdo | decisão `ativa` com `efeito: bloquear_uso` e IDs afetados | Afirmação passa a `nao_usar`; ativo deixa de ser `utilizavel` |

Uma entrada que declara zero reviews precisa de tabela com recolhas a zero e
cobertura `completo_no_universo_observado`, também com observado e recolhido a
zero. Recolha parcial ou bloqueada mantém a lacuna explícita.
