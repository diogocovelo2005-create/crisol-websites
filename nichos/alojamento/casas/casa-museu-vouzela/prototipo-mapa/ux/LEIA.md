# Captura para rever a experiência (sem abrir o browser à mão)

Precisa do servidor em localhost:4321 (`python -m http.server 4321` na pasta prototipo-mapa).
Usa o Playwright e o sharp que já estão em `nichos/alojamento/arquivo/molde/node_modules`. As imagens vão para `ux/shots/`.

- `node cap.cjs desk d0` / `node cap.cjs mob m0`: folha de contacto com ~22 momentos do percurso (uma imagem só).
  Pontos à escolha: `node cap.cjs mob m1 0,3.9,5.65,-1` (unidades do guião; -1 = fundo da página). `TW=` e `COLS=` mudam o tamanho.
- `node net.cjs mob`: peso e ordem de carregamento com 4G simulado.
- `node early.cjs mob early`: o visitante que começa a descer aos 3 s, em 4G (vê-se o que aparece antes de o voo chegar).
- `node glide.cjs`: tempo das passagens do botão do hero, toque numa polaroid e interrupção com a roda.
