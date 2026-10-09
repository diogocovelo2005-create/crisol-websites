'use client';

import Image from 'next/image';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import Titulo from '@/components/Titulo';

/*
  VARIANTE E5 - Baralho.

  Cada espaco e um cartao quase do tamanho do ecra. Fica parado e o
  seguinte sobe por cima; os de tras encolhem um pouco e escurecem, como
  quem passa de divisao em divisao. Cada cartao desce um bocadinho mais
  do que o anterior, para se verem as orlas dos de tras.
*/

function Cartao({
  e,
  i,
  n,
  p,
  parado,
}: {
  e: (typeof casa.visita.espacos)[number];
  i: number;
  n: number;
  p: MotionValue<number>;
  parado: boolean;
}) {
  // cada cartao encolhe desde que chega ate ao fim do baralho
  // (o ultimo nunca encolhe; a faixa [0, 1] evita um intervalo vazio)
  const ultimo = i === n - 1;
  const chega = ultimo ? 0 : i / (n - 1);
  const escala = useTransform(p, [chega, 1], [1, ultimo ? 1 : 1 - (n - 1 - i) * 0.035]);
  const sombra = useTransform(p, [chega, Math.min(1, chega + 1.5 / (n - 1))], [0, ultimo ? 0 : 0.35]);

  return (
    <div
      className={parado ? 'flex justify-center px-4 py-4 md:px-10' : 'sticky top-0 flex h-screen items-start justify-center px-4 md:px-10'}
      style={parado ? undefined : { paddingTop: `calc(9vh + ${i * 14}px)` }}
    >
      <motion.article
        style={parado ? undefined : { scale: escala }}
        className="relative h-[76vh] w-full max-w-[1200px] origin-top overflow-hidden rounded-[10px] bg-floresta"
      >
        <div className="grid h-full md:grid-cols-[1.5fr_1fr]">
          <div className="relative h-[42vh] md:h-full">
            <Image src={e.imagem} alt={e.alt} fill sizes="(max-width: 768px) 100vw, 60vw" quality={85} className="object-cover" />
          </div>
          <div className="flex flex-col justify-between p-7 text-osso md:p-12">
            <p className="font-display text-[1rem] italic text-ouro">
              {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </p>
            <div>
              <h3 className="text-[2.2rem] leading-[1.05] md:text-[3.4rem]">{e.nome}</h3>
              <p className="mt-4 max-w-[34ch] font-light leading-[1.8] text-osso/80">{e.nota}</p>
            </div>
          </div>
        </div>
        {!parado && <motion.div style={{ opacity: sombra }} className="pointer-events-none absolute inset-0 bg-noite" />}
      </motion.article>
    </div>
  );
}

export default function E5Baralho() {
  const v = casa.visita;
  const n = v.espacos.length;
  const alvo = useRef<HTMLDivElement>(null);
  const seccao = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  // com movimento reduzido os cartoes nao prendem: ficam em lista
  const parado = useMovimentoReduzido();
  const [livre, setLivre] = useState(false);
  const [ativo, setAtivo] = useState(n - 1);
  const alturaAntes = useRef(0);
  const progressoAnterior = useRef(0);
  const concluido = useRef(false);
  const corrigido = useRef(false);
  const lenis = useLenis();

  useMotionValueEvent(p, 'change', (x) => {
    if (livre || parado) return;
    if (x >= 0.985) concluido.current = true;
    if (concluido.current && x < progressoAnterior.current - 0.001) {
      alturaAntes.current = seccao.current?.offsetHeight ?? 0;
      setLivre(true);
    }
    progressoAnterior.current = x;
  });

  useEffect(() => {
    if (livre || parado) return;
    const verificar = () => {
      const s = seccao.current;
      if (s && s.getBoundingClientRect().bottom < 0) {
        alturaAntes.current = s.offsetHeight;
        setLivre(true);
      }
    };
    window.addEventListener('scroll', verificar, { passive: true });
    return () => window.removeEventListener('scroll', verificar);
  }, [livre, n, parado]);

  useLayoutEffect(() => {
    const s = seccao.current;
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

  const atual = v.espacos[ativo];

  return (
    <section ref={seccao} id="espacos" className="scroll-mt-20 bg-linho-escuro pb-[10vh] pt-28">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="flex max-w-[1200px] items-end justify-between gap-6">
          <div className="max-w-[620px]"><p className="versalete text-ouro-escuro">{v.etiqueta}</p>
          <h2 className="mt-5 text-[2.5rem] md:text-[3.2rem]">
            <Titulo texto={v.titulo} />
          </h2>
          <p className="mt-5 max-w-[48ch] font-light leading-[1.8] text-tinta-medio">{v.intro}</p>
          </div>
          {livre && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => setAtivo((i) => (i - 1 + n) % n)} aria-label="Espaço anterior" className="grid size-11 place-items-center rounded-full border border-tinta/25"><CaretLeftIcon size={18} /></button><button type="button" onClick={() => setAtivo((i) => (i + 1) % n)} aria-label="Espaço seguinte" className="grid size-11 place-items-center rounded-full border border-tinta/25"><CaretRightIcon size={18} /></button></div>}
        </div>
      </div>
      <div ref={alvo} className="relative mt-6">
        {livre ? <div className="flex justify-center px-4 py-4 md:px-10"><article className="relative h-[76vh] w-full max-w-[1200px] overflow-hidden rounded-[10px] bg-floresta"><div className="grid h-full md:grid-cols-[1.5fr_1fr]"><div className="relative h-[42vh] md:h-full"><Image src={atual.imagem} alt={atual.alt} fill sizes="(max-width: 768px) 100vw, 60vw" quality={85} className="object-cover" /></div><div className="flex flex-col justify-between p-7 text-osso md:p-12"><p className="font-display text-[1rem] italic text-ouro">{String(ativo + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</p><div><h3 className="text-[2.2rem] leading-[1.05] md:text-[3.4rem]">{atual.nome}</h3><p className="mt-4 max-w-[34ch] font-light leading-[1.8] text-osso/80">{atual.nota}</p></div></div></div></article></div> : v.espacos.map((e, i) => (
          <Cartao key={e.nome} e={e} i={i} n={n} p={p} parado={parado} />
        ))}
      </div>
    </section>
  );
}
