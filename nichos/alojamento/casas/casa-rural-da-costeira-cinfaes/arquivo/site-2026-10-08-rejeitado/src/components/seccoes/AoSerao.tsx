import Image from 'next/image';
import Revelar from '@/components/Revelar';

/*
  4 · Ao serao (pausa). A inversao do B: a sala a sangrar a esquerda, o
  texto ao lado, num fundo escuro tirado da madeira da sala. A lareira so
  existe numa miniatura do Instagram: fica pequena, junto da frase que a
  nomeia. A mesa de jantar fecha, com a passagem para os quartos.
*/
export default function AoSerao() {
  return (
    <section id="serao" className="scroll-mt-20 bg-serao text-osso">
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="relative h-[58svh] min-h-[340px] lg:h-[78svh] lg:min-h-[560px]">
          <Image
            src="/fotos/sala-03.jpg"
            alt="A sala em plano aberto, com as vigas de madeira, a parede amarela, as portas envidraçadas e a mesa de refeição"
            fill
            sizes="(min-width: 1024px) 61vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '55% 50%' }}
          />
        </div>
        <div className="flex flex-col justify-center gap-8 px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <h2 className="titulo-seccao">
            Ao <em>serão</em>
          </h2>
          <p className="max-w-[34ch] text-[1.0625rem] leading-[1.6] text-osso/90">
            Lareira a lenha, sofás e uma mesa grande de madeira, onde o jantar se estica pela noite.
          </p>
          <figure className="m-0 w-full max-w-[17rem]">
            <Image
              src="/fotos/sala-05.jpg"
              alt="A lareira de canto na sala, com um sofá claro, as vigas e o candeeiro de ferro"
              width={533}
              height={355}
              sizes="272px"
              className="aspect-[3/2] w-full object-cover"
            />
          </figure>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16 lg:grid-cols-[1fr_1.4fr] lg:items-end lg:gap-16">
        <Revelar className="order-2 lg:order-1">
          <p className="passagem text-liquen">Depois, sobe-se.</p>
        </Revelar>
        <div className="relative order-1 aspect-[3/2] lg:order-2">
          <Image
            src="/fotos/refeicoes-02.jpg"
            alt="A mesa de madeira escura com as cadeiras, entre a parede de granito com espelho e a parede amarela"
            fill
            sizes="(min-width: 1320px) 700px, (min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
        </div>
      </div>
    </section>
  );
}
