'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { casa } from '@/lib/casa';
import AcoesReserva from '@/components/AcoesReserva';
import Titulo from '@/components/Titulo';

/*
  Hero de ecra inteiro: a fotografia ocupa a tela toda e a mensagem
  assenta na metade esquerda.

  A fotografia e a piscina com a torre sineira e a serra na mesma imagem,
  que e o enquadramento que ninguem acredita ser uma casa de dormir. A
  1440 px o recorte tira 50 px em baixo e mais nada: ve-se a fotografia
  quase inteira.

  Nao ha veu por cima da fotografia. Um veu em diagonal sobre a metade
  esquerda apagava as encostas e a piscina e fazia parecer outra foto. O
  texto assenta no terco de baixo, sobre o relvado, com um escurecimento
  so nessa faixa e uma fita curta no topo para o cabecalho se ler.

  Nao prende o scroll e nao tem segundo tempo. O molde trocava a promessa
  por uma segunda frase a meio do scroll: obrigava a quase dois ecras
  antes do primeiro facto e era o mesmo gesto em todos os sites feitos
  ate aqui. Aqui o que se move e so a entrada do texto.

  Quatro elementos e nada mais: rotulo, titulo, uma frase e as accoes.
  min-h-[100dvh] e nao h-screen, para a barra do browser do telemovel nao
  fazer saltar o ecra.
*/
const facil = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const parado = useMovimentoReduzido();
  const { etiqueta, titulo, texto, imagem, alt } = casa.hero;

  const entrada = (atraso: number) =>
    parado
      ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: atraso, ease: facil },
        };

  return (
    <section className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-noite">
      <Image
        src={imagem}
        alt={alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[68%_50%]"
      />
      {/* so a faixa de baixo escurece, onde o texto assenta; o ceu, a torre
          e as encostas ficam com a luz da fotografia */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(to_top,rgba(14,16,18,0.88)_0%,rgba(14,16,18,0.66)_34%,rgba(14,16,18,0.2)_70%,rgba(14,16,18,0)_100%)]"
      />
      {/* fita curta no topo, so para o cabecalho claro se ler sobre o ceu */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(14,16,18,0.5)_0%,rgba(14,16,18,0)_100%)]"
      />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-end px-6 pb-16 pt-24 md:px-10 md:pb-20">
        <motion.p {...entrada(0.05)} className="versalete text-osso/85">
          {etiqueta}
        </motion.p>
        <motion.h1
          {...entrada(0.14)}
          className="mt-5 max-w-[13ch] text-[2.7rem] text-osso sm:text-[3.5rem] lg:text-[4.4rem]"
        >
          <Titulo texto={titulo} />
        </motion.h1>
        <motion.p
          {...entrada(0.24)}
          className="mt-5 max-w-[42ch] text-[1rem] font-light leading-relaxed text-osso/85 md:text-[1.08rem]"
        >
          {texto}
        </motion.p>
        <motion.div {...entrada(0.34)} className="mt-8 flex flex-wrap gap-3">
          <AcoesReserva claro />
        </motion.div>
      </div>
    </section>
  );
}
