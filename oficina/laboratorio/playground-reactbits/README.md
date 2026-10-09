# playground-reactbits

Montra do [React Bits](https://reactbits.dev). **Não é um site de cliente e não
é um molde** — é o sítio onde se vê um efeito a correr antes de decidir se
entra num projeto real.

```bash
npm run dev     # http://localhost:3000
```

## O que está instalado

22 componentes, trazidos pelo registry oficial (não há pacote `react-bits`;
cada componente é copiado para `components/` e passa a ser código nosso):

```bash
npx shadcn@latest add @react-bits/<Nome>-TS-TW
```

| Categoria | Componentes |
| --- | --- |
| Texto | BlurText, SplitText, ShinyText, TextType, GradientText, CountUp, ScrollReveal |
| Fundos | Aurora, Silk, Threads, Particles, Beams, Iridescence, DotGrid |
| Interação | SpotlightCard, TiltedCard, Magnet, ClickSpark, StarBorder, GlareHover, Dock |
| Scroll | ScrollExpand |

O `ScrollExpand` está aqui por ter sido lido, não por ter sido usado. A ideia
dele — uma fotografia contida que abre até sangrar o ecrã — entrou no template
da clínica de estética, na banda escura; o componente não. Traz o seu próprio
contentor de `overflow-y-auto` e mede o progresso pelo `scrollTop` dele, e a
banda já tinha o seu `sticky` e o seu `useScroll`: dois trilhos encaixados um
no outro partem, e ainda seria uma área de scroll dentro da página a competir
com o Lenis. Também trazia 24px de canto na moldura, um `<img>` em vez do
`next/image` numa imagem que acaba em ecrã inteiro, e um
`prefers-reduced-motion` que só desliga a suavização — a moldura continuava a
crescer. Foi a matemática que se levou (o `smoothstep` e a interpolação do
`inset`), que são vinte linhas. **É este o uso normal desta pasta: ler o
componente a correr e decidir o que dele vale a pena.**

Nomes que **não** existem no registry apesar de aparecerem no site: `Squares`
devolve a shell HTML da SPA com estado 200. Confirmar sempre o conteúdo do
JSON, não o código de estado.

## O custo, medido

O build desta página produz **1.7 MB de JavaScript** (bruto, não comprimido),
com um chunk de 1.2 MB. Vem das dependências que os componentes arrastam:

```
gsap · three · @react-three/fiber · @react-three/drei · ogl · motion
```

A leitura útil não é "é pesado", é **onde é que o peso está**:

- **Fundos WebGL** (Aurora, Silk, Beams, Iridescence, Threads, Particles) —
  carregam `three` ou `ogl`. São a fatia esmagadora do bundle. Um único destes
  numa página institucional é uma decisão séria, não um detalhe.
- **DotGrid** é canvas 2D puro. Efeito de fundo por uma fração do custo.
- **Texto e interação** (`motion` / `gsap` / CSS) — baratos. É aqui que está a
  melhor relação entre efeito e peso.

## Quando é que isto serve

Serve quando **uma referência visual pediu aquele efeito**. Aí é execução, e é
boa: código legível, tipado, que passa a ser nosso e se ajusta à vontade.

Não serve como catálogo de onde escolher efeitos giros. Estes componentes têm
cara reconhecível — o Aurora em particular já foi visto em todo o lado — e
escolhidos por gosto do momento produzem exatamente o ar genérico que se está
a tentar evitar.

E não serve de todo em Astro estático: obrigaria a `@astrojs/react` + `react` +
`react-dom` mais a lib de animação, para hidratar uma ilha. Nesse stack, o
caminho é portar o efeito para CSS ou canvas.

## Licença

MIT + Commons Clause. Uso comercial em sites de clientes é permitido. Vender ou
redistribuir os componentes em si, não.
