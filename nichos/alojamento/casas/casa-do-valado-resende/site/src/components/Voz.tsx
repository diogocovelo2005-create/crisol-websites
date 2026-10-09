'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Uma voz de hóspede: a frase em itálico leve, a tradução por baixo e o
  nome com a plataforma. As aspas são tipográficas; o texto fica à letra
  da review.

  Aparece como uma voz: as palavras chegam pela ordem em que foram ditas
  (ScrollReveal) e só no fim aparecem a tradução e quem o disse, como
  quem acaba de ouvir e olha para quem falou. Tudo preso ao scroll: o
  dedo marca o ritmo. Com movimento reduzido, a voz está toda lá.
*/
/*
  Sem `quem`, serve uma frase nossa com o mesmo gesto: sem aspas, sem
  assinatura e sem blockquote (não é uma citação).
*/
type Props = {
  texto: string;
  quem?: string;
  lingua?: string;
  traducao?: string;
  escuro?: boolean;
  tamanho?: string;
  className?: string;
};

export default function Voz({ texto, quem, lingua, traducao, escuro = false, tamanho = 'text-[1.3rem] leading-[1.45]', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);
  const suave = escuro ? 'text-folha' : 'text-ardosia';
  const frase = quem ? `“${texto}”` : texto;
  const Bloco = quem ? 'blockquote' : 'div';

  // do topo da voz a 92% do ecrã até ele chegar a meio (mais cedo se a
  // voz for alta, para a última linha acabar ainda à vista)
  const dito = useTransform(pos, (v) => {
    const { vh, altura } = medida.current;
    const inicio = vh * 0.92;
    const fim = Math.max(vh * 0.28, vh * 0.55 - altura * 0.35);
    return prender((inicio - v) / (inicio - fim));
  });
  const depois = useTransform(dito, (t) => prender((t - 0.7) / 0.3));

  if (parado) {
    return (
      <figure className={className}>
        <Bloco>
          <p lang={lingua} className={`voz ${tamanho}`}>
            {frase}
          </p>
        </Bloco>
        {traducao && <p className={`mt-3 text-[0.95rem] leading-relaxed ${suave}`}>{traducao}</p>}
        {quem && <figcaption className={`versalete mt-4 ${suave}`}>{quem}</figcaption>}
      </figure>
    );
  }

  return (
    <figure ref={ref} className={className}>
      <Bloco>
        <ScrollReveal progresso={dito} lang={lingua} className={`voz ${tamanho}`}>
          {frase}
        </ScrollReveal>
      </Bloco>
      {traducao && (
        <motion.p style={{ opacity: depois }} className={`mt-3 text-[0.95rem] leading-relaxed ${suave}`}>
          {traducao}
        </motion.p>
      )}
      {quem && (
        <motion.figcaption style={{ opacity: depois }} className={`versalete mt-4 ${suave}`}>
          {quem}
        </motion.figcaption>
      )}
    </figure>
  );
}
