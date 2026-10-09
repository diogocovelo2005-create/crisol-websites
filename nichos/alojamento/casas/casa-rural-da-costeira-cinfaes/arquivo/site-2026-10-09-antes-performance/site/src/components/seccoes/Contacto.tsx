import Image from 'next/image';
import Revelar from '@/components/Revelar';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa, RESERVA_AIRBNB } from '@/lib/casa';

/* 7. Escolher as datas (B): o último plano largo e a faixa final escura,
   com a reserva no Airbnb, os contactos e os factos com fonte e data.

   A piscina-04 do fecho do B passou para o almoço (no lugar da piscina-01,
   que mostra o jacúzi). Aqui volta a piscina do primeiro ecrã, noutro
   recorte: a passagem diz «volta-se para a piscina». */
export default function Contacto() {
  const { telefone, email } = casa.contacto;
  const filete = 'border-osso/[0.18]';

  return (
    <section id="contacto" className="scroll-mt-20">
      <div className="relative h-[50svh] min-h-[480px] text-osso">
        <Image
          src="/fotos/piscina-05.jpg"
          alt="A piscina com trampolim e as espreguiçadeiras, com a casa de granito e a torre ao lado"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover"
          style={{ objectPosition: '50% 92%' }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-floresta to-transparent" />
        {/* o título entra depois da foto, como a legenda dos três tempos */}
        <Revelar className="absolute inset-x-6 bottom-8 z-[1] mx-auto max-w-[1392px] md:inset-x-10 md:bottom-10">
          <h2 className="titulo" style={{ ['--titulo' as string]: 'clamp(2.9rem, 8.8vw, 8.8rem)' }}>
            Escolher <em>as datas</em>
          </h2>
        </Revelar>
      </div>

      <div className="bg-floresta pb-12 pt-14 text-osso">
        <div className="moldura">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
            <div>
              <p className="rotulo mb-6 text-liquen">A casa inteira</p>
              <p className="mb-[18px] mt-0 max-w-[40ch]">
                No Airbnb, a casa reserva-se inteira, por um só grupo, com uso de toda a casa, da piscina e do Wi-Fi. É aí que se faz a reserva online.
              </p>
              <a
                href={RESERVA_AIRBNB}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-3 rounded-[2px] bg-ouro px-[30px] py-[18px] text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-noite no-underline transition-colors duration-200 hover:bg-liquen"
              >
                Ver disponibilidade <ArrowUpRightIcon size={16} weight="bold" aria-hidden />
                <span className="sr-only">(abre o Airbnb numa nova janela)</span>
              </a>
              <blockquote className="mx-0 mb-0 mt-10">
                <p className="mb-[18px] mt-0 max-w-[22ch] font-display text-[2rem] italic leading-[1.15]">
                  “Ótimas condições com um anfitrião incrível que esteve sempre disponível!”
                </p>
                <cite className="text-[0.75rem] font-medium not-italic uppercase tracking-[0.24em] text-liquen">Sara · Airbnb</cite>
              </blockquote>
            </div>

            <div>
              <ul className={`m-0 mb-8 list-none border-t p-0 ${filete}`}>
                {telefone && (
                  <li className={`grid gap-1 border-b py-4 md:grid-cols-[7rem_1fr] md:gap-4 ${filete}`}>
                    <span className="pt-1 text-[0.75rem] font-medium uppercase tracking-[0.24em] text-liquen">Telefone</span>
                    <a href={telefone.href} className="inline-flex min-h-11 max-w-full items-center font-display text-[1.6rem] leading-[1.2] no-underline [overflow-wrap:anywhere] hover:underline">
                      {telefone.valor}
                    </a>
                  </li>
                )}
                {email && (
                  <li className={`grid gap-1 border-b py-4 md:grid-cols-[7rem_1fr] md:gap-4 ${filete}`}>
                    <span className="pt-1 text-[0.75rem] font-medium uppercase tracking-[0.24em] text-liquen">Email</span>
                    <a href={email.href} className="inline-flex min-h-11 max-w-full items-center font-display text-[clamp(1.05rem,5.4vw,1.6rem)] leading-[1.2] md:text-[1.4rem] lg:text-[1.2rem] xl:text-[1.6rem] no-underline [overflow-wrap:anywhere] hover:underline">
                      {email.valor}
                    </a>
                  </li>
                )}
              </ul>
              <p className="mb-[18px] mt-0 max-w-[40ch]">Quem responde é o Tiago, que fala português, inglês e espanhol.</p>
              <p className="m-0 max-w-[40ch]">Calçada de Medados, 158, 4690-055 Cinfães, distrito de Viseu.</p>
            </div>
          </div>

          <div className={`mt-12 border-t pt-7 text-base leading-[1.9] text-osso/[0.85] ${filete}`}>
            <p className="m-0">
              Wi-Fi e estacionamento gratuito na propriedade.
              <span aria-hidden className="px-1.5 text-liquen md:px-3">·</span>
              Casa de Campo, Turismo no Espaço Rural, RNET n.º 4967.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
