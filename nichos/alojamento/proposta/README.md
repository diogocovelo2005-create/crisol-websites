# Propostas para casas de turismo

Modelo de três páginas, com a Quinta de Canhões como exemplo preenchido.

1. **A casa e a proposta:** ponto de partida, solução, conteúdos e resultados esperados. Personalizar para cada casa. Não recomendar um pacote; essa conversa acontece na chamada.
2. **Opções e preços:** tabela comparativa Base/Completo, domínio anual e alterações por pedido.
3. **Quem sou e como vamos trabalhar:** apresentação, etapas, materiais, prazo, acompanhamento e próximo passo.

## Criar uma proposta

Copiar `conteudo.mjs` para `<nome-da-casa>.mjs` e preencher os campos entre parênteses retos. Usar factos verificados e uma fotografia da casa. Alterar `ficheiro` para não substituir outra proposta.

```powershell
node build.mjs <nome-da-casa>.mjs
```

Sem argumentos, gera a Quinta de Canhões. O HTML e o PDF ficam em `out/`.

- `quinta-de-canhoes.mjs`: conteúdo personalizado da página 1.
- `conteudo.mjs`: esqueleto para outras casas.
- `oferta.mjs`: textos e preços comuns das páginas 2 e 3.
- `render.mjs`: composição das três páginas e ajustes visuais.
- `build.mjs`: estilos base, imagens, fontes e exportação do PDF.

## Escrita e revisão

Explicar a situação, a proposta e os resultados esperados, por esta ordem. Usar linguagem concreta. Não prometer mais reservas como um resultado garantido. Evitar frases de efeito, comparações com outros profissionais e jargão sem explicação.

As opções não têm selo de recomendação. Distinguir pedidos de reserva por contacto de um sistema de reservas integrado no site.

Base: 400€. Completo: 600–800€, conforme as páginas e o conteúdo. São os únicos dois packs. Em ambos, «Reservar» abre a página de marcações já existente do alojamento. Não incluir Little Hotelier, comissões ou um motor de reservas próprio.

O domínio custa normalmente 10–30€ por ano e a renovação fica a cargo do cliente. O valor varia com a extensão e o fornecedor. Reutilizar o domínio existente quando houver um; caso contrário, ajudar no registo. Não há mensalidade de manutenção: cada alteração após a entrega é orçamentada segundo o pedido e realizada após aprovação. Não inventar preços fixos por alteração nem adicionar custos «a definir».

Depois de gerar, confirmar visualmente as três páginas: textos completos, sem sobreposição, preços legíveis e rodapés dentro da folha. Manter a letra legível; encurtar repetições antes de a reduzir.

## Cópia original

A versão anterior, incluindo fontes de conteúdo, gerador, imagens, HTML e PDF, está em `../../../arquivo/proposta-quinta-de-canhoes-original-2026-09-22/`.

O exemplo antigo da Herdade dos Sobreiros permanece em `out/`, como referência histórica; não usa o novo esqueleto.

## Requisitos

Playwright em `.claude/skills/lead-scraper/node_modules`, Chromium ou Chrome completo. Pode definir `CHROME_PATH`. As fotografias e fontes estão em `assets/` e são incorporadas no HTML.

## Organização visual

A página 2 concentra a oferta numa tabela com preços no cabeçalho e descrições por extenso. Abaixo, apenas duas secções: domínio (anual) e alterações (por pedido, sem mensalidade). Evitar repetir valores no texto ou dispersar os custos pela proposta.
