'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { FacebookLogoIcon, PhoneIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { AIRBNB, FACEBOOK, TELEFONE, WHATSAPP } from '@/lib/casa';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  8 · Reservar: o bilhete (C). Chega inteiro e, quando assenta, o canhoto
  com os três canais destaca-se um pouco pelo picotado: é o vosso. A
  reserva é direta (telefone, WhatsApp, Facebook); o Airbnb fica só como
  ligação discreta na nota.
*/

const CANAIS = [
  { href: TELEFONE.href, Icone: PhoneIcon, canal: `Ligar ${TELEFONE.valor}`, linha: 'Para reservar ou perguntar', externo: false },
  { href: WHATSAPP, Icone: WhatsappLogoIcon, canal: 'WhatsApp', linha: 'Uma mensagem com as datas', externo: true },
  { href: FACEBOOK, Icone: FacebookLogoIcon, canal: 'Facebook', linha: 'Pela página da quinta', externo: true },
];

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export default function Reservar() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);
  const transform = useTransform(r, (v) => `translate3d(0, ${((1 - chegar(fatia(v, 0, 0.7))) * 50).toFixed(1)}px, 0)`);
  const opacidade = useTransform(r, [0, 0.3], [0, 1]);
  const canhoto = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0.72, 1));
    return `translate3d(${(k * 10).toFixed(1)}px, ${(k * 4).toFixed(1)}px, 0) rotate(${(k * 1.6).toFixed(2)}deg)`;
  });


  return (
    <section id="contacto" className="scroll-mt-20 pb-[110px] pt-[110px]" aria-labelledby="reservar-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <motion.div ref={ref} style={parado ? { transform: 'none', opacity: 1 } : { transform, opacity: opacidade }} className="mx-auto grid max-w-[1040px] grid-cols-1 md:grid-cols-[1fr_360px]">
          <div className="bg-cartao px-7 py-10 shadow-[0_16px_36px_rgba(44,31,22,0.14)] md:px-14 md:py-[52px]">
            <p className="pagina">
              A casa e a quinta <span>· ficar</span>
            </p>
            <h2 id="reservar-titulo" className="mb-5 mt-4 text-[2.4rem] leading-[1.06] lg:text-[3.2rem]">
              Para ficar, <em>falem diretamente com a família</em>
            </h2>
            <p>Para reservar ou perguntar pelas datas, falem com quem vos recebe: por telefone, por WhatsApp ou pela página da quinta no Facebook.</p>
            <p className="mt-4 text-[0.95rem] text-tinta-medio">
              Nota no Airbnb: 4,79 em 5, com 29 avaliações (outubro de 2026). A casa também está no{' '}
              <a href={AIRBNB} target="_blank" rel="noopener noreferrer" className="underline decoration-tinta/30 underline-offset-4 hover:decoration-tinta">
                Airbnb
              </a>
              .
            </p>
          </div>
          <motion.div
            style={parado ? { transform: 'none' } : { transform: canhoto }}
            className="flex origin-top-left flex-col justify-center border-t-2 border-dashed border-tinta/25 bg-cartao px-8 py-10 shadow-[0_16px_36px_rgba(44,31,22,0.14)] md:border-l-2 md:border-t-0 md:py-[48px]"
          >
            <p className="versalete mb-4 text-tinta-medio">Reservar diretamente</p>
            <ul className="flex flex-col gap-3">
              {CANAIS.map(({ href, Icone, canal, linha, externo }, i) => (
                <li key={canal}>
                  <a
                    href={href}
                    target={externo ? '_blank' : undefined}
                    rel={externo ? 'noopener noreferrer' : undefined}
                    className={`group flex items-center gap-4 rounded-[40px] py-3 pl-3 pr-6 transition-[transform,background-color] duration-150 active:scale-[0.97] ${
                      i === 0 ? 'bg-telha text-cartao hover:bg-[#86401d]' : 'border-[1.5px] border-tinta/70 text-tinta hover:bg-tinta/5'
                    }`}
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full ${i === 0 ? 'bg-cartao/15' : 'bg-tinta/[0.06]'}`}>
                      <Icone size={20} weight="regular" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="versalete !text-[0.74rem] !font-semibold !tracking-[0.16em]">{canal}</span>
                      <span className={`mt-1 text-[0.86rem] ${i === 0 ? 'text-cartao/85' : 'text-tinta-medio'}`}>{linha}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
