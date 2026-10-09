'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import type { Capitulo } from '@/lib/galeriaPagina';
import type { FotoGaleria } from '@/lib/galerias';

export default function Mosaico({ capitulos }: { capitulos: Capitulo[] }) {
  const fotos = capitulos.flatMap((capitulo) => capitulo.fotos);
  const [ativa, setAtiva] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const aberto = ativa !== null;

  useEffect(() => {
    const el = dialogo.current;
    if (!el || !aberto) return;
    el.showModal();
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      el.close();
      lenis?.start();
      document.documentElement.style.overflow = '';
    };
  }, [aberto, lenis]);

  const mudar = (passo: number) => setAtiva((atual) => atual === null ? null : (atual + passo + fotos.length) % fotos.length);
  const foto: FotoGaleria | null = ativa === null ? null : fotos[ativa];

  return (
    <>
      {capitulos.map((capitulo, indice) => {
        const primeira = capitulos.slice(0, indice).reduce((total, anterior) => total + anterior.fotos.length, 0);
        const visiveis = indice === 0 ? capitulo.fotos.slice(1) : capitulo.fotos;
        return (
          <section key={capitulo.id} id={capitulo.id} className="scroll-mt-24 mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
            <div className="mb-8 md:mb-12">
              <h2 className="font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[1.1] text-tinta">{capitulo.titulo}</h2>
              <p className="mt-2 max-w-[38ch] font-light leading-relaxed text-tinta-medio">{capitulo.introducao}</p>
            </div>
            <div className="columns-2 gap-3 md:columns-3 md:gap-5">
              {visiveis.map((item, posicao) => (
                <figure key={item.src} className="mb-5 break-inside-avoid md:mb-8">
                  <button
                    type="button"
                    onClick={() => setAtiva(primeira + posicao + (indice === 0 ? 1 : 0))}
                    aria-label={`Ampliar fotografia: ${item.legenda}`}
                    className="group block w-full cursor-zoom-in overflow-hidden rounded-[3px] bg-linho-escuro text-left focus-visible:outline-offset-4"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={item.largura}
                      height={item.altura}
                      quality={80}
                      sizes="(max-width: 767px) 50vw, (max-width: 1400px) 31vw, 430px"
                      className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                  </button>
                  <figcaption className="mt-2 text-[0.74rem] leading-snug text-tinta-medio md:text-[0.84rem]">
                    {item.legenda}
                    {item.credito && <a href={item.credito.href} target="_blank" rel="noopener noreferrer" className="mt-1 block underline-offset-2 hover:underline">Foto: {item.credito.texto}</a>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      <dialog
        ref={dialogo}
        onClose={() => setAtiva(null)}
        onClick={(e) => { if (e.target === dialogo.current) setAtiva(null); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); mudar(-1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); mudar(1); }
        }}
        aria-label="Fotografia ampliada"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-noite/95 p-0 text-osso backdrop:bg-noite/90"
      >
        {foto && (
          <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-end px-4 py-3 md:px-8">
              <button type="button" onClick={() => setAtiva(null)} aria-label="Fechar fotografia" className="grid size-11 place-items-center rounded-full text-osso transition-colors hover:bg-osso/15"><XIcon size={24} /></button>
            </div>
            <div className="relative min-h-0 flex-1 px-3 md:px-20">
              <Image src={foto.src} alt={foto.alt} fill quality={88} sizes="100vw" className="object-contain" />
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-5 md:px-8">
              <button type="button" onClick={() => mudar(-1)} aria-label="Fotografia anterior" className="grid size-11 shrink-0 place-items-center rounded-full border border-osso/35 hover:border-osso"><ArrowLeftIcon size={21} /></button>
              <div className="min-w-0 text-center text-sm">
                <p>{foto.legenda}</p>
                {foto.credito && <a href={foto.credito.href} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-osso/75 underline-offset-2 hover:underline">Foto: {foto.credito.texto}</a>}
              </div>
              <button type="button" onClick={() => mudar(1)} aria-label="Fotografia seguinte" className="grid size-11 shrink-0 place-items-center rounded-full border border-osso/35 hover:border-osso"><ArrowRightIcon size={21} /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
