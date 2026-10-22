'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react/dist/ssr';

/*
  A fotografia do álbum vista em grande, para conhecer a casa por dentro
  com calma. Setas e teclado (← → Esc), o scroll da página fica parado
  enquanto está aberta. Abre em 220 ms (escala 0,97 e opacidade, em CSS
  com @starting-style); com movimento reduzido, só a opacidade.
*/

export type FotoAlbum = { src: string; alt: string; tempo: string; foco?: string };

export default function Ampliada({ fotos, indice, mudar }: { fotos: FotoAlbum[]; indice: number | null; mudar: (i: number | null) => void }) {
  const lenis = useLenis();
  const fechar = useRef<HTMLButtonElement>(null);
  const antes = useRef<Element | null>(null);
  const aberta = indice !== null;

  useEffect(() => {
    if (!aberta) return;
    antes.current = document.activeElement;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    fechar.current?.focus();
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      (antes.current as HTMLElement | null)?.focus?.();
    };
  }, [aberta, lenis]);

  useEffect(() => {
    if (indice === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') mudar(null);
      else if (e.key === 'ArrowRight') mudar((indice + 1) % fotos.length);
      else if (e.key === 'ArrowLeft') mudar((indice - 1 + fotos.length) % fotos.length);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [indice, fotos.length, mudar]);

  if (indice === null) return null;
  const f = fotos[indice];
  const botao = 'grid size-12 place-items-center rounded-full border border-osso/40 text-osso transition-[background-color,transform] duration-150 hover:bg-osso/10 active:scale-[0.96]';

  return (
    <div role="dialog" aria-modal="true" aria-label={`${f.tempo}: ${f.alt}`} className="ampliada fixed inset-0 z-[70] flex flex-col bg-noite/95 text-osso" onClick={() => mudar(null)}>
      <div className="flex h-20 shrink-0 items-center justify-between px-5 md:px-10" onClick={(e) => e.stopPropagation()}>
        <p className="versalete text-osso/85">
          {f.tempo} <span className="text-osso/60">· {indice + 1} de {fotos.length}</span>
        </p>
        <button ref={fechar} type="button" onClick={() => mudar(null)} aria-label="Fechar" className={botao}>
          <XIcon size={22} weight="light" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 px-5 md:px-24">
        <div key={f.src} className="ampliada-foto relative size-full">
          <Image src={f.src} alt={f.alt} fill sizes="92vw" quality={88} className="object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-center gap-4 px-5 pb-6 pt-4 md:pb-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => mudar((indice - 1 + fotos.length) % fotos.length)} aria-label="Fotografia anterior" className={botao}>
          <ArrowLeftIcon size={20} weight="light" />
        </button>
        <p className="max-w-[60ch] text-center text-[0.95rem] leading-snug text-osso/85">{f.alt}</p>
        <button type="button" onClick={() => mudar((indice + 1) % fotos.length)} aria-label="Fotografia seguinte" className={botao}>
          <ArrowRightIcon size={20} weight="light" />
        </button>
      </div>
    </div>
  );
}
