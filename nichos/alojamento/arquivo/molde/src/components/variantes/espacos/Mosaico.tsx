'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { casa } from '@/lib/casa';
import Titulo from '@/components/Titulo';

/*
  VARIANTE E4 - Mosaico.

  A casa toda num relance: uma grelha assimetrica com uma foto grande e
  varias pequenas, cada uma com o nome por cima. As fotos entram em
  cascata (sobem e a mascara abre) quando a grelha chega ao ecra.
  Passar o rato por cima mostra a nota do espaco.

  Composicao pensada para 6 espacos; com mais, os extra entram em
  quadrados simples no fim.
*/

const LUGARES = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-2',
  'md:col-span-1 md:row-span-2',
  'col-span-2 md:col-span-2 md:row-span-1',
];

export default function E4Mosaico() {
  const v = casa.visita;
  return (
    <section id="espacos" className="scroll-mt-20 bg-linho-escuro pb-28 pt-28">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-[620px]">
            <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
            <h2 className="mt-5 text-[2.5rem] md:text-[3.2rem]">
              <Titulo texto={v.titulo} />
            </h2>
          </div>
          <p className="max-w-[40ch] font-light leading-[1.8] text-tinta-medio">{v.intro}</p>
        </div>

        <ul className="mt-14 grid auto-rows-[44vw] grid-cols-2 gap-3 md:auto-rows-[18vw] md:grid-cols-4 md:gap-4 xl:auto-rows-[230px]">
          {v.espacos.map((e, i) => (
            <motion.li
              key={e.nome}
              initial={{ opacity: 0, y: 40, clipPath: 'inset(12% 0 0 0 round 10px)' }}
              whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 10px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay: i * 0.09 }}
              className={`group relative overflow-hidden rounded-[10px] ${i === 0 ? 'col-span-2 row-span-2' : ''} ${LUGARES[i] ?? ''}`}
            >
              <Image
                src={e.imagem}
                alt={e.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={85}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noite/70 via-noite/5 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-osso md:inset-x-5 md:bottom-5">
                <h3 className={i === 0 ? 'text-[2rem] md:text-[2.6rem]' : 'text-[1.3rem] md:text-[1.5rem]'}>{e.nome}</h3>
                <p className="mt-1 hidden max-w-[36ch] text-[0.88rem] font-light leading-[1.6] text-osso/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
                  {e.nota}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
