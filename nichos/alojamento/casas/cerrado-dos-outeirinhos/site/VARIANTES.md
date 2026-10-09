# Variantes do molde

Três secções têm variantes: **o pico**, **os espaços** e **o fecho**. As outras
(hero, pilares, atmosfera, opiniões) são sempre as mesmas e só mudam de lugar.

Todas as variantes estão feitas, testadas e aprovadas. Para as ver a
funcionar: `npm run dev` e abrir `/catalogo`. A captura de referência de cada
uma está em `catalogo/capturas/<código>.jpg` (em cima o computador, em baixo o
telemóvel).

## Como se troca uma variante

Em `src/app/page.tsx`, muda o import e o código em `<Variante>`:

```tsx
import Pico from '@/components/variantes/pico/Livro'; // P5
...
<Variante codigo="P5">
  <Pico />
</Variante>
```

Todas as variantes da mesma secção leem os mesmos dados de `src/lib/casa.ts`
(`pico`, `visita`, `fecho`), por isso trocar não obriga a mexer no conteúdo.

## Pico (o que se vive dentro da casa, em 3 momentos)

Os textos vêm de `casa.pico`, escritos numa **forma de contar** (o relógio, os
rituais, o convite, chegar e partir, o que se leva, os sentidos). A forma de
contar é independente da animação. Ver a skill `adaptar-molde`,
`references/formas-de-contar.md`.

| Código | Nome | Ficheiro | Prende? | Pede | Serve a |
|---|---|---|---|---|---|
| P1 | Relógio | `pico/Relogio.tsx` | Sim (380vh) | 3 fotos boas | Qualquer casa. A cor da página segue a luz do dia. |
| P2 | Provas em papel | `pico/Provas.tsx` | Sim (300vh) | 3 fotos + 3 `par` (6 no total) | Casas de família, rústicas, com ar de álbum. |
| P4 | Caderno | `pico/Caderno.tsx` | Só a foto; o texto corre | 3 fotos, textos que aguentem ser lidos com calma | Casas calmas, de retiro, de natureza. |
| P5 | Livro antigo | `pico/Livro.tsx` | Sim (440vh) | 3 fotos (ficam em sépia leve) | Casas com história: solares, casas antigas, turismo de habitação. Evitar em casas modernas. |

## Espaços (a visita, pela ordem em que se anda na casa)

Os dados vêm de `casa.visita.espacos` (nome, nota, foto).

| Código | Nome | Ficheiro | Prende? | Pede | Serve a |
|---|---|---|---|---|---|
| E1 | Faixa lateral | `espacos/Faixa.tsx` | Sim, no computador, só da primeira vez que se desce (depois: setas, trackpad e rato) | 4 a 8 espaços | Qualquer casa. |
| E2 | Índice | `espacos/Indice.tsx` | Sim, no computador | 4 a 8 espaços com nomes com carácter | Casas cujos espaços têm nome (a Sala da Música, o Alpendre). |
| E3 | Revista | `espacos/Revista.tsx` | Não | 4 a 6 espaços com fotos muito boas | Casas bonitas por dentro, arquitetura, recuperação. |
| E4 | Mosaico | `espacos/Mosaico.tsx` | Não | 6 espaços (a grelha foi desenhada para 6) | Casas com muitos espaços; ver tudo num relance. |
| E5 | Baralho | `espacos/Baralho.tsx` | Sim | 4 a 6 espaços | Entrar de divisão em divisão; casas pequenas e acolhedoras. |

## Fecho (a última foto chega ao ecrã inteiro, com o convite)

Os dados vêm de `casa.fecho` e `casa.contacto`.

| Código | Nome | Ficheiro | Prende? | Pede | Serve a |
|---|---|---|---|---|---|
| F1 | Moldura que cresce | `fecho/Moldura.tsx` | Não | 1 foto horizontal (+ 1 vertical para telemóvel) | Qualquer casa. A moldura inicial pode ser retângulo, arco ou círculo. |
| F2 | Portadas | `fecho/Portadas.tsx` | Sim (220vh) | 1 foto forte | Casas com portadas, janelas, portões marcantes. |
| F3 | Cortina que sobe | `fecho/Cortina.tsx` | Sim, curta | 1 foto de ambiente muito boa | Casas com uma vista ou um exterior forte. A cortina mostra a 1.ª opinião. |
| F4 | Postal | `fecho/Postal.tsx` | Não | 1 foto média | Casas mais pequenas; quando a morada e os contactos importam. |

## Combinações proibidas

- **P2 com E5:** são as duas pilhas de cartões.
- **P4 com E2:** as duas partem o ecrã em foto parada e lista de texto; seguidas parecem a mesma secção.
- **F3 logo a seguir às Opiniões:** a cortina repete a primeira opinião. Ou se muda a ordem, ou a cortina passa a mostrar outra citação (conta como ajuste).
- **Duas secções que prendem seguidas** (ver a coluna "Prende?"). O hero também prende.

## Dados que cada variante precisa

- `casa.pico.momentos[i].par` só é usado pelo P2.
- `casa.pico.linha` e `casa.pico.sol` só são usados pelo P1 e pelo P2.
- Tudo o resto é comum.
