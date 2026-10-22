'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { AIRBNB } from '@/lib/casa';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  9 · Reservar: o bilhete (C). Chega inteiro e, quando assenta, o canhoto
  com os botões destaca-se um pouco pelo picotado: é o vosso.
*/

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export default function Reservar() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);
  const transform = useTransform(r, (v) => `translate3d(0, ${((1 - chegar(fatia(v, 0, 0.7))) * 50).toFixed(1)}px, 0)`);
  const opacidade = useTransform(r, [0, 0.3], [0, 1]);
  const canhoto = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0.72, 1));
    return `translate3d(${(k * 10).toFixed(1)}px, ${(k * 4).toFixed(1)}px, 0) rotate(${(k * 1.6).toFixed(2)}deg)`;
  });

  const botao = 'versalete block rounded-[40px] px-[18px] py-4 text-center !text-[0.74rem] !font-semibold !tracking-[0.18em] transition-transform duration-150 active:scale-[0.97]';

  return (
    <section id="contacto" className="scroll-mt-20 pb-[110px] pt-[110px]" aria-labelledby="reservar-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <motion.div ref={ref} style={parado ? { transform: 'none', opacity: 1 } : { transform, opacity: opacidade }} className="mx-auto grid max-w-[980px] grid-cols-1 md:grid-cols-[1fr_300px]">
          <div className="bg-cartao px-7 py-10 shadow-[0_16px_36px_rgba(44,31,22,0.14)] md:px-14 md:py-[52px]">
            <p className="pagina">
              A casa e a quinta <span>· ficar</span>
            </p>
            <h2 id="reservar-titulo" className="mb-5 mt-4 text-[2.4rem] leading-[1.06] lg:text-[3.2rem]">
              Para ficar, a casa <em>reserva-se no Airbnb</em>
            </h2>
            <p>
              A casa reserva-se no Airbnb. Para perguntar antes, o telefone é o{' '}
              <a href="tel:+351965741870" className="underline decoration-telha/50 underline-offset-4">
                965 741 870
              </a>
              .
            </p>
            <p className="mt-4 text-[0.95rem] text-tinta-medio">Nota no Airbnb: 4,79 em 5, com 29 avaliações (outubro de 2026).</p>
          </div>
          <motion.div
            style={parado ? { transform: 'none' } : { transform: canhoto }}
            className="flex origin-top-left flex-col justify-center gap-3 border-t-2 border-dashed border-tinta/25 bg-cartao px-9 py-10 shadow-[0_16px_36px_rgba(44,31,22,0.14)] md:border-l-2 md:border-t-0 md:py-[52px]"
          >
            <a href={AIRBNB} target="_blank" rel="noopener noreferrer" className={`${botao} bg-telha text-cartao hover:bg-[#86401d]`}>
              Ver disponibilidade no Airbnb
            </a>
            <a href="tel:+351965741870" className={`${botao} border-[1.5px] border-tinta text-tinta hover:bg-tinta/5`}>
              Ligar 965 741 870
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
