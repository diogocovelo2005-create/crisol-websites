'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { CaretLeftIcon, CaretRightIcon, StarIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';

/*
  05 - Outros ja viveram isto.

  O carrossel centrado de La Bastide: uma citacao de cada vez, setas dos
  lados e pontos em baixo. Fica perto da decisao, que e onde o risco
  percebido pesa mais.

  Nao roda sozinho: texto que muda enquanto se le obriga a correr atras
  dele.

  As citacoes do molde sao MARCADORES DE POSICAO (ver src/lib/casa.ts).
*/
export default function Provas() {
  const r = casa.reviews;
  const [i, setI] = useState(0);
  const parado = useMovimentoReduzido();
  const n = r.citacoes.length;
  const c = r.citacoes[i];
  const ir = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <section id="opinioes" className="mx-auto max-w-[1000px] scroll-mt-20 px-6 pt-28 text-center md:px-10 md:pt-36">
      <Revelar>
        <p className="versalete text-ouro-escuro">{r.etiqueta}</p>
        <h2 className="mt-5 text-[2.5rem] text-tinta md:text-[3.2rem]">
          <Titulo texto={r.titulo} />
        </h2>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[0.95rem] text-tinta-medio">
          {Array.from({ length: 5 }).map((_, k) => (
            <StarIcon key={k} size={15} weight="fill" className="text-ouro" />
          ))}
          <span className="ml-2 font-medium text-tinta">{r.media}</span>
          <span className="font-light">em {r.total} avaliações</span>
        </p>
      </Revelar>

      <Revelar atraso={0.1} className="mt-12 flex items-center gap-4 md:gap-10">
        <button
          type="button"
          onClick={() => ir(-1)}
          aria-label="Opinião anterior"
          className="shrink-0 p-2 text-tinta/60 transition-colors hover:text-tinta"
        >
          <CaretLeftIcon size={28} weight="thin" />
        </button>

        <div className="relative min-h-[11rem] flex-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={i}
              initial={parado ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={parado ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <blockquote className="font-display text-[1.6rem] italic leading-snug text-tinta md:text-[2.1rem]">
                “{c.texto}”
              </blockquote>
              <figcaption className="versalete mt-7 text-tinta-medio">
                {c.quem} <span className="text-ouro">/</span> {c.onde}, {c.data}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => ir(1)}
          aria-label="Opinião seguinte"
          className="shrink-0 p-2 text-tinta/60 transition-colors hover:text-tinta"
        >
          <CaretRightIcon size={28} weight="thin" />
        </button>
      </Revelar>

      <div className="mt-8 flex justify-center gap-2.5">
        {r.citacoes.map((q, k) => (
          <button
            key={q.quem}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Ver opinião ${k + 1}`}
            aria-current={k === i}
            className={`size-2 rounded-full border border-ouro transition-colors ${k === i ? 'bg-ouro' : 'bg-transparent'}`}
          />
        ))}
      </div>
    </section>
  );
}
