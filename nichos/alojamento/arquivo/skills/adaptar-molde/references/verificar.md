# Verificação no browser

O código e o site em execução são a fonte de verdade. Capturas isoladas não
demonstram uma mecânica de scroll.

## Qualidade da proposta

Antes de dar a base por concluída, avalia a página como proposta para um hóspede:
- As melhores imagens disponíveis estão bem aproveitadas? Compara alternativas.
- Cada fotografia sustenta o texto ao lado, incluindo hora e serviço anunciado?
- Há uma experiência própria desta casa ou apenas nomes novos na página do molde?
- Cada parte acrescenta algo, sem repetir comodidades para preencher secções?
- O resultado faz desejar a estadia e torna o contacto claro?

Corrige falhas materiais de seleção, significado e composição antes de polir
efeitos. Aprovação de build ou rastreabilidade não responde a estas perguntas.
Não é necessário acabamento de produto final para apresentar uma boa direção.

## Percurso das interações existentes

Usa um browser real a 1440 × 900 e a 390 × 844. Em cada tamanho:

1. Abre no topo e percorre toda a página à velocidade de uma pessoa.
2. Em cada secção interativa, observa começo, meio e fim.
3. Continua para além do fim: uma secção concluída não pode regressar ao
   estado inicial nem prender o utilizador.
4. Volta para cima e confirma o comportamento previsto.
5. Faz refresh no topo e a meio de uma secção presa.
6. Usa todos os botões, setas, links e controlos por rato/toque e teclado.
7. Repete com `prefers-reduced-motion: reduce`.

Para passagens guiadas de uma só vez, confirma ainda:

- começam sempre no primeiro item numa visita nova ou refresh no topo;
- chegam ao último item antes de libertar;
- depois de libertas permitem navegar sem voltar a prender;
- têm controlos claros quando o scroll deixa de comandar a interação.

## Imagens e conteúdo

Inspeciona visualmente cada imagem no local final:

- corresponde ao texto e à divisão referida;
- o assunto principal não foi cortado;
- não está desfocada no tamanho apresentado;
- texto sobre imagem mantém contraste;
- mobile usa um recorte útil, não apenas o centro automático;
- nenhuma opinião, contacto ou facto foi inventado.

## Verificações gerais

| Verificação | Passa se |
|---|---|
| Consola | Sem erros |
| Scroll horizontal | Inexistente em desktop e mobile |
| Primeiro ecrã | Promessa e ação principal são claras |
| Contraste | Texto normal atinge 4.5:1 |
| Movimento reduzido | Todo o conteúdo permanece acessível e nada fica preso |
| Teclado | Foco visível e controlos acionáveis |
| Links | Destinos e contactos são reais e corretos |
| Texto | Sem conteúdo de placeholder nem travessões longos |
| Código | Lint e tipos passam |
| Produção | Build passa depois da limpeza |
| Rastreabilidade | `conteudo-fontes.json` está `pronto` e passa no verificador |

## Capturas

`tools/capturas.mjs` pode criar folhas para comunicar uma decisão, encontrar
overflow ou manter regressão visual. É opcional e complementar. Não compares
pixel a pixel com o molde: textos, imagens, composição e mecânica podem ter
sido adaptados legitimamente.

## Registo mínimo

Em `ADAPTACAO.md`, guarda apenas:

```markdown
## Verificação
- Browser: desktop e mobile percorridos
- Interações: <códigos e resultado>
- Movimento reduzido: passou
- Consola / scroll horizontal: passou
- Lint / tipos / build: passou
- Não verificado: <lista ou nenhum>
```

Nunca declares como verificado aquilo que não executaste.
