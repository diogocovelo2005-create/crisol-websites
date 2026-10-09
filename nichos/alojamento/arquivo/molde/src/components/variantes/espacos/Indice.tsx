'use client';

import Image from 'next/image';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import Titulo from '@/components/Titulo';

/*
  VARIANTE E2 - Indice.

  Os nomes dos espacos em letra grande, em lista. O scroll acende um de
  cada vez; a foto do lado troca (abre de baixo para cima por cima da
  anterior) e o fundo muda ligeiramente de tom em cada espaco.
  No telemovel nao prende: lista simples com foto em cada espaco.
*/

// tons de fundo, todos proximos do linho, um por espaco
const TONS = ['#ebe3d5', '#e6e2d6', '#ece0d2', '#e3e4da', '#e9e4dc', '#e2ded2'];

function Largo() {
  const v = casa.visita;
  const n = v.espacos.length;
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  const [ativo, setAtivo] = useState(0);
  const [livre, setLivre] = useState(false);
  const alturaAntes = useRef(0);
  const progressoAnterior = useRef(0);
  const concluido = useRef(false);
  const corrigido = useRef(false);
  const lenis = useLenis();

  useMotionValueEvent(p, 'change', (x) => {
    if (livre) return;
    const i = Math.min(n - 1, Math.floor(x * n * 0.999));
    if (i !== ativo) setAtivo(i);
    if (x >= 0.985) concluido.current = true;
    if (concluido.current && x < progressoAnterior.current - 0.001) {
      alturaAntes.current = alvo.current?.offsetHeight ?? 0;
      setLivre(true);
    }
    progressoAnterior.current = x;
  });

  useEffect(() => {
    if (livre) return;
    const verificar = () => {
      const s = alvo.current;
      if (s && s.getBoundingClientRect().bottom < 0) {
        alturaAntes.current = s.offsetHeight;
        setLivre(true);
      }
    };
    window.addEventListener('scroll', verificar, { passive: true });
    return () => window.removeEventListener('scroll', verificar);
  }, [livre, n]);

  useLayoutEffect(() => {
    const s = alvo.current;
    if (!livre || !alturaAntes.current || !s || corrigido.current) return;
    const removido = Math.max(0, alturaAntes.current - s.offsetHeight);
    if (!removido) return;
    corrigido.current = true;
    if (lenis) {
      const destino = lenis.targetScroll - removido;
      lenis.scrollTo(lenis.animatedScroll - removido, { immediate: true, force: true });
      lenis.scrollTo(destino, { force: true });
    } else window.scrollBy(0, -removido);
  }, [lenis, livre]);

  const fundo = useTransform(
    p,
    v.espacos.map((_, i) => (i + 0.5) / n),
    v.espacos.map((_, i) => TONS[i % TONS.length]),
  );

  return (
    <motion.section id="espacos" ref={alvo} style={{ backgroundColor: livre ? TONS[ativo % TONS.length] : fundo, height: livre ? '100vh' : `${n * 70 + 30}vh` }} className="relative scroll-mt-20">
      <div className="sticky top-0 mx-auto grid h-screen max-w-[1320px] grid-cols-[1fr_1.05fr] items-center gap-16 px-10">
        <div>
          <div className="flex items-center justify-between gap-5"><p className="versalete text-ouro-escuro">{v.etiqueta}</p><div className={`flex gap-2 transition-opacity ${livre ? 'opacity-100' : 'pointer-events-none opacity-0'}`}><button type="button" onClick={() => setAtivo((i) => (i - 1 + n) % n)} aria-label="Espaço anterior" className="grid size-10 place-items-center rounded-full border border-tinta/25"><CaretLeftIcon size={17} /></button><button type="button" onClick={() => setAtivo((i) => (i + 1) % n)} aria-label="Espaço seguinte" className="grid size-10 place-items-center rounded-full border border-tinta/25"><CaretRightIcon size={17} /></button></div></div>
          <h2 className="mt-4 text-[1.3rem] italic text-tinta-medio">
            <Titulo texto={v.titulo} />
          </h2>
          <ol className="mt-8 flex flex-col">
            {v.espacos.map((e, i) => (
              <li key={e.nome} className="border-t border-linha py-2.5 last:border-b">
                <div className="flex items-baseline gap-5">
                  <span className={`w-6 text-[0.8rem] tabular-nums transition-colors duration-500 ${i === ativo ? 'text-ouro-escuro' : 'text-tinta/30'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-display text-[2.6rem] leading-[1.15] transition-all duration-500 xl:text-[3rem] ${
                      i === ativo ? 'translate-x-2 text-tinta' : 'text-tinta/25'
                    }`}
                  >
                    {e.nome}
                  </span>
                </div>
                <div
                  className={`grid pl-11 transition-[grid-template-rows,opacity] duration-500 ${
                    i === ativo ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <p className="overflow-hidden text-[0.95rem] font-light leading-[1.7] text-tinta-medio">
                    <span className="block max-w-[42ch] pb-1 pt-1">{e.nota}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative aspect-[4/5] max-h-[80vh] w-full overflow-hidden rounded-[10px]">
          {v.espacos.map((e, i) => (
            <div
              key={e.nome}
              className="absolute inset-0 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ clipPath: i <= ativo ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)', zIndex: i }}
            >
              <Image
                src={e.imagem}
                alt={e.alt}
                fill
                sizes="45vw"
                quality={85}
                className={`object-cover transition-transform duration-[1400ms] ease-out ${i === ativo ? 'scale-100' : 'scale-110'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function Estreito() {
  const v = casa.visita;
  return (
    <section id="espacos" className="scroll-mt-20 bg-linho-escuro px-6 pb-20 pt-24">
      <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
      <h2 className="mt-4 text-[2.4rem]">
        <Titulo texto={v.titulo} />
      </h2>
      <ol className="mt-10 flex flex-col gap-12">
        {v.espacos.map((e, i) => (
          <li key={e.nome}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
              <Image src={e.imagem} alt={e.alt} fill sizes="100vw" className="object-cover" />
            </div>
            <p className="mt-4 flex items-baseline gap-3">
              <span className="text-[0.8rem] tabular-nums text-ouro-escuro">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[2rem]">{e.nome}</span>
            </p>
            <p className="mt-1 font-light leading-[1.7] text-tinta-medio">{e.nota}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function E2Indice() {
  const largo = useMedia('(min-width: 1024px)');
  const parado = useMovimentoReduzido();
  // com movimento reduzido nao prende: a lista simples, como no telemovel
  return largo && !parado ? <Largo /> : <Estreito />;
}
