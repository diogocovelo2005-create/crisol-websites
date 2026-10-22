'use client';

import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { useEffect, useState } from 'react';
import { WHATSAPP } from '@/lib/casa';

/*
  O WhatsApp sempre à mão, na linguagem do álbum: um selo de papel no canto
  de baixo, com o picotado do bilhete por dentro. Não aparece no primeiro
  ecrã (lá estão os botões) nem com o bilhete do fim à vista (lá estão os
  três canais). Ao passar o rato, o nome do canal sai de trás do selo.
*/
export default function WhatsappFlutuante() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    let bilhete = false;
    const ver = () => setVisivel(window.scrollY > window.innerHeight * 0.9 && !bilhete);
    const fim = document.getElementById('contacto');
    const io = new IntersectionObserver(([e]) => {
      bilhete = e.isIntersecting;
      ver();
    });
    if (fim) io.observe(fim);
    ver();
    window.addEventListener('scroll', ver, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', ver);
    };
  }, []);

  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Reservar por WhatsApp"
      tabIndex={visivel ? undefined : -1}
      aria-hidden={!visivel}
      className={`group fixed bottom-6 right-6 z-40 flex items-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        visivel ? 'translate-y-0 rotate-[-4deg] opacity-100' : 'pointer-events-none translate-y-4 rotate-[-10deg] opacity-0'
      }`}
    >
      <span className="versalete pointer-events-none mr-[-18px] translate-x-3 whitespace-nowrap rounded-l-[30px] bg-cartao py-2.5 pl-5 pr-7 !text-[0.68rem] !font-semibold text-tinta opacity-0 shadow-[0_10px_24px_rgba(44,31,22,0.18)] transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        Reservar por WhatsApp
      </span>
      <span className="relative grid size-[58px] place-items-center rounded-full bg-cartao text-telha shadow-[0_12px_28px_rgba(44,31,22,0.28),0_2px_4px_rgba(44,31,22,0.14)] transition-transform duration-150 group-active:scale-[0.95]">
        <span aria-hidden className="absolute inset-[5px] rounded-full border-[1.5px] border-dashed border-telha/45" />
        <WhatsappLogoIcon size={26} weight="regular" />
      </span>
    </a>
  );
}
