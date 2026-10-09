'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'motion/react';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import type { FotoGaleria } from '@/lib/galerias';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  As quatro maneiras de abrir uma galeria (escolhidas pelo Diogo em
  2026-10-03, a partir da pagina de testes). Cada uma e so o que aparece por
  cima da pagina: quem a monta, trava o scroll e trata do Esc e do botao
  "voltar" e o componente Galeria.

    fotografia  quartos        abre a partir do link, fila que se arrasta
    catalogo    dez pecas      folha que sobe, grelha numerada e ficha
    corredor    jogos e lazer  cortina, titulo, roda do rato anda ao lado
    gaveta      saloes, parque, casa  painel lateral, pagina de revista
*/

export type PropsVariante = {
  titulo: string;
  fotos: FotoGaleria[];
  fechar: () => void;
  // onde estava o link que abriu a galeria (so a "fotografia" o usa)
  origem: DOMRect | null;
};

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const EASE_FORTE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const botaoRedondo = 'grid size-11 shrink-0 place-items-center rounded-full border transition-colors';
const sobreEscuro = `${botaoRedondo} border-osso/30 text-osso hover:border-osso hover:bg-osso/10`;
const sobreClaro = `${botaoRedondo} border-tinta/25 text-tinta hover:border-tinta hover:bg-tinta/5`;

// fotos de licenca livre: o autor e a licenca sao obrigatorios
function Credito({ f, escuro }: { f: FotoGaleria; escuro?: boolean }) {
  if (!f.credito) return null;
  return (
    <a
      href={f.credito.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-1 block text-[0.72rem] underline-offset-2 hover:underline ${escuro ? 'text-osso/50' : 'text-tinta-medio/70'}`}
    >
      Foto: {f.credito.texto}
    </a>
  );
}

/* ---------------------------- fotografia ---------------------------- */

export function Fotografia({ titulo, fotos, fechar, origem }: PropsVariante) {
  const [i, setI] = useState(0);
  const trilho = useRef<HTMLDivElement>(null);
  const reduzido = useMovimentoReduzido();

  const ir = (s: 1 | -1) => {
    const t = trilho.current;
    if (t) t.scrollBy({ left: s * t.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'ArrowLeft') ir(-1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  // a galeria cresce a partir do sitio do link e encolhe de volta para ele
  const de =
    origem && !reduzido
      ? `inset(${origem.top}px ${window.innerWidth - origem.right}px ${window.innerHeight - origem.bottom}px ${origem.left}px round 10px)`
      : null;
  const cheio = 'inset(0px 0px 0px 0px round 0px)';

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      initial={de ? { clipPath: de } : { opacity: 0 }}
      animate={de ? { clipPath: cheio } : { opacity: 1 }}
      exit={de ? { clipPath: de } : { opacity: 0 }}
      transition={{ duration: reduzido ? 0 : 0.75, ease: EASE_FORTE }}
      className="fixed inset-0 z-[100] flex flex-col bg-floresta-fundo text-osso"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.4, delay: reduzido ? 0 : 0.35 }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:py-6">
          <p className="font-display text-[1.4rem] italic leading-none md:text-[1.8rem]">{titulo}</p>
          <div className="flex items-center gap-5">
            <span className="versalete text-osso/60" aria-live="polite">{i + 1} / {fotos.length}</span>
            <button type="button" autoFocus onClick={fechar} aria-label="Fechar a galeria" className={sobreEscuro}><XIcon size={18} /></button>
          </div>
        </div>

        <div
          ref={trilho}
          data-lenis-prevent
          onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="sem-barra flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
        >
          {fotos.map((f, n) => (
            <div key={f.src} className="flex h-full min-h-0 w-full shrink-0 snap-center flex-col items-center gap-3 px-4 pb-3 md:gap-4 md:px-24">
              <div className="relative min-h-0 w-full flex-1" style={{ maxWidth: f.largura }}>
                <Image src={f.src} alt={f.alt} fill quality={88} sizes="100vw" priority={n === 0} className="object-contain" />
              </div>
              <p className="max-h-[28svh] shrink-0 overflow-y-auto text-center text-[0.88rem] font-light leading-snug text-osso/85 md:text-[0.98rem]">
                {f.legenda}
                <Credito f={f} escuro />
              </p>
            </div>
          ))}
        </div>

        <div className="hidden items-center justify-center gap-4 py-5 md:flex">
          <button type="button" onClick={() => ir(-1)} aria-label="Fotografia anterior" className={sobreEscuro}><ArrowLeftIcon size={18} /></button>
          <button type="button" onClick={() => ir(1)} aria-label="Fotografia seguinte" className={sobreEscuro}><ArrowRightIcon size={18} /></button>
        </div>
        <p className="pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[0.8rem] text-osso/50 md:hidden">Desliza para o lado</p>
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------- catalogo ----------------------------- */

const numero = (n: number) => `Nº ${String(n + 1).padStart(2, '0')}`;
// "A Circuncisao. Retabulo em madeira, ..." -> nome e o resto
function partir(l: string) {
  const k = l.indexOf('. ');
  return k < 0 ? { nome: l, resto: '' } : { nome: l.slice(0, k), resto: l.slice(k + 2) };
}

export function Catalogo({ titulo, fotos, fechar }: PropsVariante) {
  const [sel, setSel] = useState<number | null>(null);
  const reduzido = useMovimentoReduzido();

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (sel === null) return;
      if (e.key === 'ArrowRight') setSel((v) => (v === null ? v : (v + 1) % fotos.length));
      else if (e.key === 'ArrowLeft') setSel((v) => (v === null ? v : (v - 1 + fotos.length) % fotos.length));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [sel, fotos.length]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      data-lenis-prevent
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: reduzido ? 0 : 0.75, ease: EASE }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-linho text-tinta"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-linha bg-linho px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:py-5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          {sel !== null && (
            <button type="button" onClick={() => setSel(null)} className="versalete text-ouro-escuro hover:underline">← Índice</button>
          )}
          <p className="font-display text-[1.4rem] italic leading-tight md:text-[1.8rem]">{titulo}</p>
        </div>
        <button type="button" autoFocus onClick={fechar} aria-label="Fechar o catálogo" className={sobreClaro}><XIcon size={18} /></button>
      </div>

      {sel === null ? (
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-5 py-8 md:grid-cols-3 md:gap-x-8 md:gap-y-12 md:px-10 md:py-12 lg:grid-cols-4">
          {fotos.map((f, n) => (
            <motion.li
              key={f.src}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduzido ? 0 : 0.45 + n * 0.05, ease: EASE }}
            >
              <button type="button" onClick={() => setSel(n)} className="group block w-full text-left">
                <motion.span layoutId={`cat-${n}`} transition={{ duration: 0.6, ease: EASE }} className="relative block aspect-[4/5] overflow-hidden bg-cartao shadow-[0_14px_30px_-18px_rgba(17,26,20,0.5)]">
                  <Image src={f.src} alt={f.alt} fill sizes="(max-width: 768px) 45vw, 280px" className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.04]" />
                </motion.span>
                <span className="versalete mt-3 block text-ouro-escuro">{numero(n)}</span>
                <span className="mt-1 block font-display text-[1.02rem] leading-snug">{partir(f.legenda).nome}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[1.25fr_1fr] md:gap-14 md:px-10 md:py-12">
          <motion.div layoutId={`cat-${sel}`} transition={{ duration: 0.6, ease: EASE }} className="relative h-[52svh] bg-cartao shadow-[0_18px_40px_-18px_rgba(17,26,20,0.45)] md:h-[70svh]">
            <Image src={fotos[sel].src} alt={fotos[sel].alt} fill quality={88} sizes="(max-width: 768px) 100vw, 700px" className="object-contain p-4 md:p-8" />
          </motion.div>
          <motion.div key={sel} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease: EASE }} className="flex flex-col justify-center">
            <p className="versalete text-ouro-escuro">{numero(sel)} / {String(fotos.length).padStart(2, '0')}</p>
            <h3 className="mt-3 font-display text-[1.9rem] leading-tight md:text-[2.3rem]">{partir(fotos[sel].legenda).nome}</h3>
            {partir(fotos[sel].legenda).resto && (
              <p className="mt-4 border-t border-linha pt-4 text-[1rem] font-light leading-relaxed text-tinta-medio">{partir(fotos[sel].legenda).resto}</p>
            )}
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setSel((sel - 1 + fotos.length) % fotos.length)} aria-label="Peça anterior" className={sobreClaro}><ArrowLeftIcon size={18} /></button>
              <button type="button" onClick={() => setSel((sel + 1) % fotos.length)} aria-label="Peça seguinte" className={sobreClaro}><ArrowRightIcon size={18} /></button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ----------------------------- corredor ----------------------------- */

function Foto({ f, n }: { f: FotoGaleria; n: number }) {
  const alturas = ['lg:h-[54svh]', 'lg:h-[40svh]', 'lg:h-[60svh]', 'lg:h-[46svh]'];
  const subidas = ['', 'lg:-translate-y-[4svh]', 'lg:translate-y-[3svh]', 'lg:-translate-y-[1svh]'];
  return (
    <figure className={`flex w-[78vw] shrink-0 snap-center flex-col gap-3 sm:w-[60vw] lg:w-auto ${subidas[n % 4]}`}>
      <div className={`relative h-[min(46svh,450px)] overflow-hidden rounded-[3px] ${alturas[n % 4]}`} style={{ aspectRatio: Math.max(0.6, Math.min(f.largura / f.altura, 3)) }}>
        <div className="absolute inset-0">
          <Image src={f.src} alt={f.alt} fill quality={85} sizes="70vw" className="object-cover" />
        </div>
      </div>
      <figcaption className="max-w-[22rem] text-[0.85rem] font-light leading-snug text-osso/80 lg:text-[0.9rem]">
        <span className="versalete mr-2 text-ouro-claro">{String(n + 1).padStart(2, '0')}</span>
        {f.legenda}
        <Credito f={f} escuro />
      </figcaption>
    </figure>
  );
}

export function Corredor({ titulo, fotos, fechar }: PropsVariante) {
  const trilho = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: trilho });
  const reduzido = useMovimentoReduzido();
  const depois = reduzido ? 0 : 0.9;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      initial={{ clipPath: 'inset(0 0 0 100%)' }}
      animate={{ clipPath: 'inset(0 0 0 0%)' }}
      exit={{ clipPath: 'inset(0 100% 0 0%)' }}
      transition={{ duration: reduzido ? 0 : 0.8, ease: EASE_FORTE }}
      className="fixed inset-0 z-[100] bg-floresta-fundo text-osso"
    >
      {/* o titulo aparece grande e some, e so depois entram as fotos */}
      <motion.h2
        aria-hidden
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10] }}
        transition={{ duration: reduzido ? 0 : 0.65, delay: 0.2, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0 z-10 hidden place-items-center px-6 text-center font-display text-[clamp(2.6rem,9vw,7rem)] italic leading-none lg:grid"
      >
        {titulo}
      </motion.h2>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:py-6">
        <p className="font-display text-[1.4rem] italic md:text-[1.8rem]">{titulo}</p>
        <button type="button" autoFocus onClick={fechar} aria-label="Fechar a galeria" className={sobreEscuro}><XIcon size={18} /></button>
      </motion.div>

      <motion.div
        ref={trilho}
        data-lenis-prevent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: depois, duration: 0.7 }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY * 1.6;
        }}
        className="sem-barra flex h-full snap-x snap-mandatory items-center gap-5 overflow-x-auto overflow-y-hidden px-[11vw] pb-14 pt-20 sm:gap-8 lg:snap-none lg:gap-[7vw] lg:px-[10vw] lg:pb-10 lg:pt-16"
      >
        {fotos.map((f, n) => (
          <Foto key={f.src} f={f} n={n} />
        ))}
        <span className="w-[10vw] shrink-0" aria-hidden />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: depois }} className="absolute inset-x-5 bottom-6 z-20 md:inset-x-10">
        <div className="h-px bg-osso/20">
          <motion.div style={{ scaleX: scrollXProgress }} className="h-px origin-left bg-ouro-claro" />
        </div>
        <p className="mt-2 text-[0.75rem] text-osso/50"><span className="lg:hidden">Desliza para o lado</span><span className="hidden lg:inline">Roda do rato ou desliza para o lado</span></p>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------ gaveta ------------------------------ */

export function Gaveta({ titulo, fotos, fechar }: PropsVariante) {
  // lido ao montar (a gaveta so existe no browser): com o useMedia o primeiro
  // valor era sempre "estreito" e o painel ficava preso fora do ecra
  const [largo] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const reduzido = useMovimentoReduzido();
  const painel = useRef<HTMLDivElement>(null);

  // linhas de revista: uma foto grande, duas lado a lado, uma grande...
  const linhas: FotoGaleria[][] = [];
  for (let k = 0, p = 0; k < fotos.length; p++) {
    const t = p % 2 === 0 ? 1 : 2;
    linhas.push(fotos.slice(k, k + t));
    k += t;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-[100]">
      <motion.button
        type="button"
        aria-label="Fechar a galeria"
        tabIndex={-1}
        onClick={fechar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-noite/60"
      />
      <motion.div
        ref={painel}
        data-lenis-prevent
        initial={largo ? { x: '100%', y: 0 } : { x: 0, y: '100%' }}
        animate={{ x: 0, y: 0 }}
        exit={largo ? { x: '100%', y: 0 } : { x: 0, y: '100%' }}
        transition={{ duration: reduzido ? 0 : 0.7, ease: EASE }}
        className="absolute inset-x-0 bottom-0 top-[6svh] overflow-y-auto rounded-t-[14px] bg-linho text-tinta md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[min(60%,760px)] md:rounded-none"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-linho px-5 py-4 md:px-9 md:py-5">
          <p className="font-display text-[1.4rem] italic md:text-[1.8rem]">{titulo}</p>
          <button type="button" autoFocus onClick={fechar} aria-label="Fechar a galeria" className={sobreClaro}><XIcon size={18} /></button>
        </div>
        <div className="space-y-8 px-5 pb-12 pt-2 md:space-y-12 md:px-9">
          {linhas.map((l, r) => (
            <div key={r} className="flex flex-col items-stretch gap-8 sm:flex-row sm:items-end sm:gap-4 md:gap-6">
              {l.map((f) => (
                <motion.figure
                  key={f.src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ root: painel, once: true, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.7, ease: EASE }}
                  style={{ flex: f.largura / f.altura }}
                  className="min-w-0 w-full sm:w-auto"
                >
                  <div className="relative w-full overflow-hidden rounded-[3px]" style={{ aspectRatio: f.largura / f.altura }}>
                    <Image src={f.src} alt={f.alt} fill quality={85} sizes="(max-width: 768px) 92vw, 440px" className="object-cover" />
                  </div>
                  <figcaption className="mt-2 text-[0.85rem] font-light italic text-tinta-medio">
                    {f.legenda}
                    <Credito f={f} />
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
