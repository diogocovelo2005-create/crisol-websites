'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import AcoesReserva from '@/components/AcoesReserva';
import Titulo from '@/components/Titulo';

/*
  VARIANTE F4 - Postal.

  A foto ocupa metade do ecra e aproxima-se devagar enquanto a secao
  passa. Na outra metade esta o convite como um postal escrito: titulo,
  texto, botoes e, por baixo de uma linha, a morada e os contactos, como
  o verso de um postal. Nao prende a pagina.
*/

export default function F4Postal() {
  const f = casa.fecho;
  const c = casa.contacto;
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'passagem');
  const escala = useTransform(p, [0, 1], [1.2, 1]);

  return (
    <section id="reservar" ref={alvo} className="grid min-h-screen bg-linho md:grid-cols-2">
      <div className="relative h-[70vh] overflow-hidden md:h-auto">
        <motion.div style={{ scale: escala }} className="absolute inset-0">
          <Image src={f.imagem} alt={f.alt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={85} className="object-cover" />
        </motion.div>
        {/* o selo do postal */}
        <div className="absolute right-6 top-6 flex h-24 min-w-20 flex-col items-center justify-center border border-dashed px-3 border-osso/70 text-center text-osso md:right-10 md:top-10">
          <span className="font-display text-[1.6rem] leading-none">{casa.nome.split(' ').pop()}</span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.2em]">{casa.lugar.split(' ').pop()}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        className="flex flex-col justify-center px-6 py-20 md:px-16 xl:px-24"
      >
        <p className="versalete text-ouro-escuro">{f.etiqueta}</p>
        <h2 className="mt-5 max-w-[14ch] text-[3rem] md:text-[4.4rem]">
          <Titulo texto={f.titulo} />
        </h2>
        <p className="mt-6 max-w-[40ch] font-light leading-[1.8] text-tinta-medio">{f.texto}</p>
        <div className="mt-10"><AcoesReserva /></div>

        {(c.morada || c.telefone || c.email) && <div className="mt-14 grid max-w-[520px] gap-6 border-t border-linha pt-8 text-[0.95rem] sm:grid-cols-2">
          {c.morada && <div>
            <p className="versalete text-tinta-medio">Onde</p>
            <p className="mt-2 font-display text-[1.25rem] leading-[1.35]">{c.morada}</p>
          </div>}
          {(c.telefone || c.email) && <div>
            <p className="versalete text-tinta-medio">Contacto</p>
            <p className="mt-2 font-display text-[1.25rem] leading-[1.35]">
              {c.telefone && <a href={c.telefone.href} className="hover:text-ouro-escuro">{c.telefone.valor}</a>}
              {c.telefone && c.email && <br />}
              {c.email && <a href={c.email.href} className="break-all hover:text-ouro-escuro">{c.email.valor}</a>}
            </p>
          </div>}
        </div>}
      </motion.div>
    </section>
  );
}
