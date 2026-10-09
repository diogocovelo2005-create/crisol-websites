# Recolha orientada ao contrato

Usa este guião antes de abrir uma plataforma e sempre que uma recolha é retomada. O objetivo não é acumular texto: é produzir evidência suficiente, com âmbito e cobertura visíveis, para decidir o que a base pode usar.

## 1. Reaproveitar o que já existe

Lê primeiro `dono.md`, `fontes.md`, `canais.md`, `marketing/`, o contrato anterior e os links/nome/localização já entregues pelo utilizador. Não dês por em falta informação que esteja aí. Se faltar mesmo um elemento (identidade, contacto/reserva, material do dono ou confirmação de uma restrição), devolve à sessão principal o que falta ou o que não se confirma, com o impacto, e para: como subagente não podes perguntar.

Regista material do dono no mesmo padrão das fontes públicas: data, canal, ficheiro ou texto original, entidade a que se refere, permissão/restrição e o que foi decidido. Uma foto do dono pode ser utilizável sem provar um quarto.

## 2. Inventário antes de recolher

Cria em `fontes.md` um plano de percurso por fonte: URL/página, entidade, material procurado, universo esperado e estado. Para pesquisas comerciais, guarda data de recolha, datas de estadia, ocupação e filtros. Disponibilidade numa pesquisa é uma observação de tarifa/unidade, nunca o inventário geral.

No contrato, cada percurso termina num item de `cobertura`:

```json
{
  "id": "COB-BOOKING-REVIEWS",
  "fonte": "Booking — reviews",
  "material": "reviews",
  "estado": "parcial",
  "superficie": "páginas 1–4 de 12; setembro de 2026",
  "observado": 40,
  "recolhido": 40,
  "limitacao": "páginas 5–12 ainda por recolher"
}
```

Usa `completo_no_universo_observado` apenas quando o universo que observaste está todo coberto. `nao_encontrado` quer dizer que não apareceu naquele percurso; `bloqueado` regista tentativa e alternativa; `parcial` mantém a lacuna. Não uses uma string vazia como ausência.

## 3. Entidade, âmbito e evidência

Cada anúncio, texto, review, foto ou resultado de pesquisa deve responder:

1. É desta casa? Regista a evidência de identidade antes de usar.
2. Fala da casa, de um espaço, de uma unidade, tarifa ou canal? Cria ou liga a entidade certa.
3. Em que datas, ocupação, tarifa ou condição é verdade? Regista o âmbito.
4. Quem o publicou, onde está o bloco e quando foi recolhido/publicado?

Uma evidência no contrato referencia a entidade, a origem e o local exato. Uma afirmação usa uma proposição única. Não mistures “há piscina”, “a piscina está aberta” e “piscina incluída nesta tarifa” no mesmo registo.

## 4. Fotografias

Indexa propriedade, unidade, região e marca em grupos distintos, mesmo que só exista uma foto. Em cada ativo do contrato guarda caminho, dimensões medidas, assunto, publicador, estado de uso, restrições e, quando existir, derivação.

`entidade_confirmada` só aparece quando uma fonte o prova. Galeria de quarto, nome de ficheiro ou semelhança visual não bastam. Guarda pares/enquadramentos relacionados como notas ou derivação, sem os converter em certeza. Quando uma foto não é recuperável, mantém a lacuna na cobertura, não um caminho inventado.

## 5. Síntese para a construção

Em `pontos-fortes.md`, cada argumento e atrito aponta para IDs de reviews e evidências, declara frequência, intensidade, especificidade, atualidade, relevância e contraponto. Se uma contagem exclui duplicados, identifica os IDs do grupo de duplicados e o motivo.

Depois converte só as decisões utilizáveis em `afirmacoes` do contrato:

- facto confirmado → `afirmar`;
- tarifa/disponibilidade com âmbito → `afirmar_com_condicao`;
- voz da casa ou hóspede → `citar` ou `inspiracao_editorial`;
- conflito, restrição, prova histórica ou associação visual incerta → `nao_usar` ou ativo `restrito`.

Antes do resumo, percorre as afirmações `nao_usar` e decisões ativas. O resumo não pode promover uma delas. Só depois gera `site-pronto.md`, valida e grava o relatório atual.
