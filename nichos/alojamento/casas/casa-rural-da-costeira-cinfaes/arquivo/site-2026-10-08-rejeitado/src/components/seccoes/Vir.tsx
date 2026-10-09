import Image from 'next/image';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';

/*
  7 · Vir (fecho). O ultimo plano largo do B, com o titulo e a frase da
  reserva por cima (veu so em baixo, onde esta o texto), e a faixa escura
  de contacto: o Airbnb, o telefone, quem responde, as notas com fonte e
  data, a morada e o registo.
*/
export default function Vir() {
  const { telefone, email, morada, registo } = casa.contacto;
  const reserva = casa.acoes.find((a) => a.tipo === 'reserva');

  return (
    <section id="vir" className="scroll-mt-20">
      <div className="relative h-[66svh] min-h-[460px] md:h-[66svh] overflow-hidden text-osso">
        <Image
          src="/fotos/fachada-03.jpg"
          alt="A casa de granito em ângulo, com o pátio empedrado, arbustos em flor e a encosta ao fundo, à tarde"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '40% 50%' }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-floresta via-floresta/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto grid max-w-[1320px] gap-5 px-6 pb-10 md:px-10 md:pb-14 lg:grid-cols-[1fr_28rem] lg:items-end lg:gap-16">
          <h2 className="titulo-seccao">Vir</h2>
          <p className="max-w-[40ch] text-[1.0625rem] leading-[1.6]">
            No Airbnb, a casa reserva-se inteira, por um só grupo, com a piscina e o Wi-Fi.
          </p>
        </div>
      </div>

      <div className="bg-floresta pb-16 pt-12 text-osso md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-6 md:px-10 lg:grid-cols-[1fr_28rem] lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            {reserva && (
              <a
                href={reserva.href}
                target="_blank"
                rel="noopener noreferrer"
                className="versalete inline-flex items-center gap-3 rounded-[2px] bg-ouro px-7 py-4 text-noite transition-colors duration-200 hover:bg-liquen"
              >
                {reserva.rotulo} no Airbnb
                <ArrowUpRightIcon size={16} weight="bold" aria-hidden />
              </a>
            )}
            <p className="max-w-[44ch] leading-[1.6] text-osso/85">
              Quem responde é o Tiago, em português, inglês ou espanhol.
            </p>
          </div>

          <ul className="m-0 list-none border-t border-linha-clara p-0">
            {telefone && (
              <li className="grid gap-1 border-b border-linha-clara py-4 sm:grid-cols-[6.5rem_1fr] sm:items-baseline sm:gap-4">
                <span className="versalete text-liquen">Telefone</span>
                <a href={telefone.href} className="inline-flex min-h-11 items-center font-display text-[1.5rem] leading-[1.2] hover:underline">
                  {telefone.valor}
                </a>
              </li>
            )}
            {email && (
              <li className="grid gap-1 border-b border-linha-clara py-4 sm:grid-cols-[6.5rem_1fr] sm:items-baseline sm:gap-4">
                <span className="versalete text-liquen">Email</span>
                <a href={email.href} className="inline-flex min-h-11 items-center font-display text-[1.5rem] leading-[1.2] [overflow-wrap:anywhere] hover:underline">
                  {email.valor}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="mx-auto mt-14 max-w-[1320px] px-6 md:px-10">
          <div className="grid gap-6 border-t border-linha-clara pt-8 text-base leading-[1.7] text-osso/80 min-[1100px]:text-[0.95rem] md:grid-cols-2 lg:gap-16">
            <ul className="m-0 list-none space-y-1 p-0">
              <li>Airbnb: 4,88 em 5, com 25 avaliações (lido em outubro de 2026).</li>
              <li>Google: 4,8 em 5, com 49 críticas (lido em outubro de 2026).</li>
            </ul>
            <div className="space-y-1">
              {morada && <p>{morada}.</p>}
              {registo && (
                <p>
                  Casa de Campo, Turismo no Espaço Rural, {registo.tipo} n.º {registo.numero}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
