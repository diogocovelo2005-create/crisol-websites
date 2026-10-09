# Catálogo de protótipos

O catálogo cobre as sete secções da landing page: Hero, Pilares, Atmosfera,
Pico, Espaços, Opiniões e Fecho.

## Fonte de verdade

1. `src/components/variantes/registo.ts` é o índice técnico: código, ficheiro,
   mecânica, conteúdo mínimo, identidade e liberdade de adaptação.
2. O componente indicado no campo `ficheiro` contém a mecânica completa.
3. `/catalogo` permite experimentar o código a funcionar.

As capturas não explicam uma animação e não são usadas para escolher ou
reconstruir variantes. Podem ser geradas apenas como apoio de QA ou para
comparação humana.

## Como explorar sem gastar contexto

1. Lê `registo.ts` e elimina apenas opções impossíveis por falta de conteúdo.
2. Faz uma shortlist pela coerência do conjunto, não por etiquetas de nicho.
3. Lê o código somente das opções da shortlist.
4. Abre essas opções em `/catalogo` e percorre a interação completa.

Os campos `pede`, `manter` e `podeMudar` não são uma receita estética:

- `pede` identifica dependências reais de conteúdo;
- `manter` diz qual é o gesto que torna o protótipo reconhecível;
- `podeMudar` enumera pontos de partida, não um limite fechado.

## Estado atual

| Secção | Aprovados | Ainda não entra na seleção automática |
|---|---|---|
| Hero | H1, H2, H3, H4 | — |
| Pilares | PI1, PI3 | — |
| Atmosfera | A1, A3 | — |
| Pico | P1, P2, P4, P5 | — |
| Espaços | E1, E2, E3, E4, E5 | — |
| Opiniões | O3 | O1 |
| Fecho | F1, F2, F3, F4 | — |

## Como montar

Os protótipos base são exports nomeados de `PrototiposBase.tsx`:

```tsx
import {
  HeroH2 as Hero,
  PilaresPI3 as Pilares,
  AtmosferaA1 as Atmosfera,
  OpinioesO3 as Opinioes,
} from '@/components/variantes/PrototiposBase';
```

Pico, Espaços e Fecho são exports por omissão dos ficheiros indicados no
registo:

```tsx
import Pico from '@/components/variantes/pico/Livro'; // P5
import Espacos from '@/components/variantes/espacos/Indice'; // E2
import Fecho from '@/components/variantes/fecho/Portadas'; // F2
```

Mantém o código em `<Variante>` para diagnóstico e QA:

```tsx
<Variante codigo="E2"><Espacos /></Variante>
```

Todas as variantes leem `src/lib/casa.ts`. Se um componente exigir um campo
que a casa não tem, adapta o componente ou o modelo de dados de forma clara;
nunca inventes conteúdo para satisfazer o protótipo.

## Coerência entre secções

Não existem combinações proibidas por estilo. Antes de fechar uma composição,
verifica no browser:

- duas interações intensas seguidas não tornam a página cansativa;
- duas secções não repetem o mesmo gesto visual sem intenção;
- a saída de uma secção entrega corretamente a seguinte;
- a página mantém um pico principal e um caminho claro para a reserva;
- teclado, toque, movimento reduzido e breakpoints mantêm todo o conteúdo.

P2 com E5, P4 com E2 e opiniões imediatamente antes de F3 são apenas alertas
de possível repetição. Podem ser usados juntos quando a adaptação resolve essa
repetição e o resultado for validado a funcionar.

