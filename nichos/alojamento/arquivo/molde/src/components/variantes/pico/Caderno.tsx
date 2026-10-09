'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import Titulo from '@/components/Titulo';
import { usePico, type Momento } from './dados';
import PicoEstatico from './Estatico';

/*
  VARIANTE P4 - Caderno.

  A foto fica parada numa metade do ecra. Os textos dos momentos sobem
  normalmente na outra metade, como paginas de um diario; a foto troca
  quando o texto seguinte chega ao meio do ecra. A pagina nao fica presa:
  so a foto e que espera.

  Cada bloco de texto tem um ecra de altura, por isso o bloco k esta ao
  centro quando o progresso vale k/2. As trocas ficam a meio: 0.25 e 0.75.
*/

const TROCAS = [0.25, 0.75];

function Foto({ p, i, src, alt, marca }: { p: MotionValue<number>; i: number; src: string; alt: string; marca: string }) {
  const entra = i === 0 ? null : TROCAS[i - 1];
  const sai = i === TROCAS.length ? null : TROCAS[i];
  const pontos: number[] = [];
  const op: number[] = [];
  if (entra !== null) { pontos.push(entra - 0.06, entra + 0.06); op.push(0, 1); }
  else { pontos.push(0); op.push(1); }
  if (sai !== null) { pontos.push(sai - 0.06, sai + 0.06); op.push(1, 0); }
  else { pontos.push(1); op.push(1); }

  const opacidade = useTransform(p, pontos, op, { ease: easeInOut });
  const escala = useTransform(p, [entra ?? 0, sai ?? 1], [1.08, 1]);

  return (
    <motion.div style={{ opacity: opacidade }} className="absolute inset-0">
      <motion.div style={{ scale: escala }} className="absolute inset-0">
        <Image src={src} alt={alt} fill sizes="50vw" quality={85} className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-noite/50 to-transparent to-40%" />
      <p className="absolute left-10 top-10 font-display leading-none text-osso" style={{ fontSize: marca.length > 6 ? '3.2rem' : '4.5rem' }}>{marca}</p>
    </motion.div>
  );
}

function Largo({ momentos }: { momentos: readonly Momento[] }) {
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  return (
    <div ref={alvo} className="grid grid-cols-2">
      <div className="sticky top-0 h-screen overflow-hidden">
        {momentos.map((f, i) => (
          <Foto key={f.imagem} p={p} i={i} src={f.imagem} alt={f.alt} marca={f.marca} />
        ))}
      </div>
      <div>
        {momentos.map((f, i) => (
          <article key={f.titulo} className="flex h-screen flex-col justify-center px-16 xl:px-24">
            <p className="versalete text-ouro-escuro">
              {String(i + 1).padStart(2, '0')} · {f.marca}
            </p>
            <h3 className="mt-5 text-[2.6rem] leading-[1.1]">{f.titulo}</h3>
            <p className="mt-6 max-w-[42ch] text-[1.05rem] font-light leading-[1.85] text-tinta-medio">{f.texto}</p>
            <p className="mt-8 max-w-[42ch] border-l border-linha pl-5 font-display text-[1.25rem] italic text-tinta-medio">
              {f.momento}.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CadernoAnimado() {
  const largo = useMedia('(min-width: 1024px)');
  const m = usePico();
  const momentos = m.momentos;

  return (
    <section className="bg-linho">
      <div className="mx-auto max-w-[1320px] px-6 pb-16 pt-28 md:px-10">
        <p className="versalete text-ouro-escuro">{m.etiqueta}</p>
        <h2 className="mt-5 text-[2.8rem] md:text-[4.2rem]">
          <Titulo texto={m.titulo} />
        </h2>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] font-light leading-[1.8] text-tinta-medio">{m.intro}</p>
      </div>

      {largo ? (
        <Largo momentos={momentos} />
      ) : (
        <div className="flex flex-col gap-16 px-6 pb-24">
          {momentos.map((f) => (
            <article key={f.titulo}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]">
                <Image src={f.imagem} alt={f.alt} fill sizes="100vw" className="object-cover" />
                <p className="absolute bottom-5 left-5 font-display text-[3rem] leading-none text-osso">{f.marca}</p>
              </div>
              <h3 className="mt-6 text-[1.9rem]">{f.titulo}</h3>
              <p className="mt-3 font-light leading-[1.8] text-tinta-medio">{f.texto}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* Com movimento reduzido, o pico e a lista estatica, igual em todas as variantes. */
export default function Caderno() {
  const parado = useMovimentoReduzido();
  return parado ? <PicoEstatico /> : <CadernoAnimado />;
}
