'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Uma foto emoldurada, como as de C: passe-partout claro e sombra curta.
  `recorte` é a classe de proporção; `foco` é o ponto focal de
  prototipos/fotos.md; `sizes` é a largura real no ecrã. Nenhuma foto
  grande vai sem texto: leva a `legenda` do BRIEF ou, em `children`, a
  voz de hóspede que lhe está atribuída.

  Ao subir, a imagem assenta dentro da moldura (de 1.07 para 1) enquanto
  o bloco à volta (Revelar) a traz com o texto dela. É o mesmo gesto em
  todas as fotos, preso ao scroll; só transform, na camada da imagem.

  `larga`: a toda a largura, sem moldura (a piscina com a casa ao fundo).

  `ergue` (em "Por dentro"): a foto, com a moldura, ergue-se do fundo como
  uma pedra a ser assente: um clip-path abre de baixo para cima e a
  moldura sobe uns px, preso ao scroll: abre enquanto a foto sobe do fundo
  do ecrã até ao meio. O número é o passo (fração do ecrã) para fotos da
  mesma linha entrarem desencontradas. No fim fica
  inteira, sem véu nem cor mudada.
*/
type Props = {
  src: string;
  alt: string;
  recorte: string;
  foco: string;
  sizes: string;
  legenda?: string;
  escuro?: boolean;
  larga?: boolean;
  className?: string;
  classeLegenda?: string;
  ergue?: number;
  children?: React.ReactNode;
};

export default function Foto({ src, alt, recorte, foco, sizes, legenda, escuro = false, larga = false, className = '', classeLegenda = '', ergue, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);

  const assenta = useTransform(pos, (v) => {
    const vh = medida.current.vh;
    const k = prender((vh - v) / (vh * 0.75));
    return k >= 1 ? 'none' : `scale(${(1.07 - 0.07 * k).toFixed(4)})`;
  });

  // ergue: do topo da moldura a 96% do ecrã (menos o passo) ao longo de 34% do ecrã
  // começa quando o topo da foto entra pelo fundo do ecrã e acaba quando o
  // centro dela chega ao meio do ecrã (com a altura da própria foto: numa
  // foto alta, medir só o topo abria-a toda com metade ainda fora do ecrã,
  // e via-se a foto chegar já aberta). A borda do recorte fica sempre
  // dentro do ecrã, atrás de quem lê. `ergue` atrasa as duas pontas.
  const erguida = useTransform(pos, (v) => {
    const { vh, altura } = medida.current;
    const passo = (ergue ?? 0) * vh;
    const inicio = vh - passo;
    const fim = vh * 0.5 - altura / 2 - passo;
    const r = prender((inicio - v) / Math.max(1, inicio - fim));
    return r * r * (3 - 2 * r);
  });
  const recorteErguer = useTransform(erguida, (r) => (r >= 1 ? 'none' : `inset(${((1 - r) * 100).toFixed(2)}% 0 0 0)`));
  const subida = useTransform(erguida, (r) => (r >= 1 ? 'none' : `translateY(${((1 - r) * 28).toFixed(1)}px)`));
  const ergueVivo = ergue !== undefined && !parado;

  const imagem = <Image src={src} alt={alt} fill sizes={sizes} quality={99} className="object-cover" style={{ objectPosition: foco }} />;

  return (
    <figure className={className}>
      <motion.div
        ref={ref}
        // em repouso, valores explícitos: o Motion escreve o recorte no 1.º render
        // e, com movimento reduzido, tirar só o style deixava a foto escondida
        style={ergueVivo ? { clipPath: recorteErguer, transform: subida } : ergue !== undefined ? { clipPath: 'none', transform: 'none' } : undefined}
        className={`${larga ? '' : 'moldura'} relative overflow-hidden bg-linho-escuro ${recorte}`}
      >
        {parado ? (
          imagem
        ) : (
          <motion.div style={{ transform: assenta }} className="absolute inset-0">
            {imagem}
          </motion.div>
        )}
      </motion.div>
      {legenda && <figcaption className={`mt-3 text-[0.9rem] leading-snug ${escuro ? 'text-folha' : 'text-ardosia'} ${classeLegenda}`}>{legenda}</figcaption>}
      {children && <figcaption className="mt-4">{children}</figcaption>}
    </figure>
  );
}
