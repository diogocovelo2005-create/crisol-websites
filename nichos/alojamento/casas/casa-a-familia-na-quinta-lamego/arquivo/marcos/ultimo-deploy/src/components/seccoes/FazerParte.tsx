'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import TituloDito from '@/components/TituloDito';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useRoda } from '@/components/seccoes/OsDaQuinta';
import { FACEBOOK } from '@/lib/casa';

/*
  6 · Fazer parte (madeira), a conclusão dos da quinta. Em ecrã largo, com
  movimento, o título é dito no meio da roda em que a mesa se fecha
  (OsDaQuinta.tsx): aqui continua-se na mesma madeira, sem cabeçalho. As duas maneiras de fazer parte chegam em
  envelope, como chega a fotografia do afilhado com a dedicatória: a aba
  abre-se e o cartão sobe de dentro. A fotografia das fotografias dos
  animais pousa na mesa, do lado de lá.
*/

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

function Envelope({ titulo, atraso, children }: { titulo: string; atraso: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const aba = useTransform(r, (v) => `rotateX(${(chegar(fatia(v, 0.2, 0.7)) * 180).toFixed(1)}deg)`);
  const sobe = useTransform(r, (v) => `translate3d(0, ${((1 - chegar(fatia(v, 0.5, 1))) * 26).toFixed(1)}px, 0)`);
  const cartaoOp = useTransform(r, [0.5, 0.8], [0, 1]);
  const caixaOp = useTransform(r, [0, 0.2], [0, 1]);

  return (
    <motion.div ref={ref} style={parado ? { opacity: 1 } : { opacity: caixaOp }} className="relative mt-16 [perspective:900px]">
      {/* a aba do envelope: fechada por cima do cartão, abre para cima */}
      <motion.span
        aria-hidden
        style={parado ? { transform: 'rotateX(180deg)' } : { transform: aba }}
        className="absolute inset-x-0 top-0 z-[2] block h-14 origin-top bg-[#4a3726] [backface-visibility:visible] [clip-path:polygon(0_0,100%_0,50%_100%)]"
      />
      <div className="relative h-full border border-cartao/25 bg-cartao/10 p-5 pt-6 text-[0.97rem] leading-[1.55]">
        <motion.div style={parado ? { transform: 'none', opacity: 1 } : { transform: sobe, opacity: cartaoOp }}>
          <h3 className="mb-2 text-[1.2rem] text-ouro">{titulo}</h3>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function FazerParte() {
  const roda = useRoda();
  return (
    <section id="parte" className={`madeira scroll-mt-20 pb-[110px] ${roda ? 'pt-[30px]' : 'pt-[60px]'}`} aria-labelledby="parte-titulo">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-[72px]">
        <Impressa
          src="/fotos/3c4517_ce1a8e321d68402a8969653b18a6bf17.jpg"
          alt="Fotografias impressas dos animais da quinta espalhadas numa mesa de madeira"
          proporcao="1440 / 1048"
          rot={-2}
          de={{ x: -70, y: 40, r: -8 }}
          fita
          legenda="Cada afilhado tem a sua fotografia."
          sizes="(max-width: 1023px) 92vw, 590px"
        />
        <div>
          {!roda && <TituloDito id="parte-titulo" texto="Quem quiser, pode *fazer parte da família*" className="mb-[22px] text-[2.4rem] leading-[1.06] lg:text-[3.4rem]" />}
          <Revelar>
            <p>Para que a promessa dure a vida inteira, a família quer construir um santuário animal que se sustente a si próprio e não viva só de donativos. Ainda está a ser construído.</p>
          </Revelar>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <Envelope titulo="Apadrinhar um animal." atraso={0}>
              Escolhe-se o afilhado, deixa-se o nome e a morada, e recebe-se uma fotografia dele com dedicatória de «A Família na Quinta». Pedidos para{' '}
              <a href="mailto:lusitanoquinta@gmail.com" className="whitespace-nowrap text-ouro underline-offset-4 hover:underline">
                lusitanoquinta@gmail.com
              </a>
              .
            </Envelope>
            <Envelope titulo="Acompanhar a quinta." atraso={0.05}>
              No{' '}
              <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="text-ouro underline-offset-4 hover:underline">
                Facebook
              </a>
              , seguido por cerca de 10 mil pessoas (outubro de 2026), a família partilha o dia a dia da quinta.
            </Envelope>
          </div>
          <Revelar>
            <blockquote className="cita mt-7">
              <p className="!text-[1.2rem]">&ldquo;É um projeto com grande valor, que merece o nosso apoio para que possa continuar e quem sabe, crescer.&rdquo;</p>
              <cite>Lígia, Airbnb</cite>
            </blockquote>
          </Revelar>
          <Revelar>
            <p className="passagem mt-[26px]">E enquanto cá estão, Lamego fica a minutos de carro.</p>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
