'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import Titulo from '@/components/Titulo';

/*
  VARIANTE E3 - Revista.

  Cada espaco e uma pagina de revista: foto grande de um lado, nome e
  nota do outro. O lado e o tamanho da foto alternam de espaco para
  espaco. A pagina nao prende. A foto abre-se de baixo para cima quando
  entra no ecra e anda um pouco mais devagar do que a pagina.
*/

// composicao de cada linha, em 12 colunas: onde fica a foto e o texto
const COMPOSICOES = [
  { foto: 'md:col-start-1 md:col-span-7', texto: 'md:col-start-9 md:col-span-4', formato: 'aspect-[4/3]' },
  { foto: 'md:col-start-7 md:col-span-5', texto: 'md:col-start-2 md:col-span-4 md:row-start-1', formato: 'aspect-[4/5]' },
  { foto: 'md:col-start-2 md:col-span-6', texto: 'md:col-start-9 md:col-span-4', formato: 'aspect-[1/1]' },
  { foto: 'md:col-start-6 md:col-span-7', texto: 'md:col-start-1 md:col-span-4 md:row-start-1', formato: 'aspect-[16/10]' },
];

function Espaco({ e, i }: { e: (typeof casa.visita.espacos)[number]; i: number }) {
  const c = COMPOSICOES[i % COMPOSICOES.length];
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'passagem');
  const y = useTransform(p, [0, 1], ['-7%', '7%']);

  return (
    // o gatilho fica no artigo: uma caixa toda recortada nao conta como
    // visivel para o IntersectionObserver, e a foto nunca abria
    <motion.article
      initial="fora"
      whileInView="dentro"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-6"
    >
      <motion.div
        ref={alvo}
        variants={{ fora: { clipPath: 'inset(100% 0 0 0)' }, dentro: { clipPath: 'inset(0% 0 0 0)' } }}
        transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
        className={`relative overflow-hidden rounded-[10px] ${c.formato} ${c.foto}`}
      >
        <motion.div style={{ y }} className="absolute -inset-[8%]">
          <Image src={e.imagem} alt={e.alt} fill sizes="(max-width: 768px) 100vw, 55vw" quality={85} className="object-cover" />
        </motion.div>
      </motion.div>
      <motion.div
        variants={{ fora: { opacity: 0, y: 24 }, dentro: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
        className={c.texto}
      >
        <p className="font-display text-[1rem] italic text-ouro-escuro">{String(i + 1).padStart(2, '0')}</p>
        <h3 className="mt-2 text-[2.4rem] leading-[1.05] md:text-[3.2rem]">{e.nome}</h3>
        <p className="mt-5 max-w-[34ch] font-light leading-[1.8] text-tinta-medio">{e.nota}</p>
      </motion.div>
    </motion.article>
  );
}

export default function E3Revista() {
  const v = casa.visita;
  return (
    <section id="espacos" className="scroll-mt-20 bg-linho-escuro pb-32 pt-28">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="max-w-[620px]">
          <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
          <h2 className="mt-5 text-[2.5rem] md:text-[3.2rem]">
            <Titulo texto={v.titulo} />
          </h2>
          <p className="mt-5 max-w-[48ch] font-light leading-[1.8] text-tinta-medio">{v.intro}</p>
        </div>
        <div className="mt-20 flex flex-col gap-24 md:gap-36">
          {v.espacos.map((e, i) => (
            <Espaco key={e.nome} e={e} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
