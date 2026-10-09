# Execução do lote C — molde robusto

Data: 2026-09-21.

## Conteúdo que o molde aceita

- `casa.ts` declara ações tipadas e contactos opcionais. Uma casa pode ter só
  reserva, pedido de disponibilidade, telefone, email ou WhatsApp confirmados;
  os componentes não constroem URLs por suposição.
- O registo é tipado (`RNAL`, `RNET` ou `outro`) e só aparece quando existe.
- A prova social aceita média, escala, plataforma, total e data fornecidos pela
  fonte. Sem citações, a secção e as ligações de navegação desaparecem; sem
  avaliação agregada, ficam apenas as citações literais.
- As variantes de fecho e opiniões mostram apenas ações e contactos presentes.
  A forma de contar baseada em opiniões fica indisponível com menos de três
  citações, em vez de gerar conteúdo incompleto.

## Catálogo e comportamento

- O registo técnico passou a ter um contrato por protótipo: campos que lê,
  mínimo de imagens, intervalo de itens e comportamento em mobile. O catálogo
  mostra o contrato junto da mecânica.
- Hero, Relógio e Provas usam altura estável para o palco (`lvh`) e altura segura
  para conteúdo (`svh`). A linha do dia pode seguir o fundo real do viewport sem
  redimensionar o resto da cena.
- `useProgresso` preserva a medição durante a alteração de altura causada pela
  barra do browser em toque; volta a medir ao mudar a largura ou quando um
  `ResizeObserver` encontra uma alteração real do conteúdo.
- Movimento reduzido continua a usar as versões estáticas; setas, âncoras e
  controlos mantêm foco por teclado.

## Verificação

- `npm run lint`, `npx tsc --noEmit` e `npm run build`: aprovados.
- Testes do pipeline: 5 testes de `adaptar-molde` e 21 de `al-dossier` aprovados.
- Playwright local, sem erros de aplicação e sem overflow horizontal, em
  1440×900, 390×844 e 390×667 para `/` e `/catalogo`. O percurso P1 foi
  exercitado no início, meio, fim e regresso; as âncoras da casa, espaços,
  opiniões e reserva ficaram na posição esperada.
- O teste de movimento reduzido confirmou navegação inicial por teclado.

## Limitação registada

O ensaio móvel foi emulado no browser. O comportamento da barra de navegador
em dispositivo físico continua por confirmar antes de uma entrega de cliente.
