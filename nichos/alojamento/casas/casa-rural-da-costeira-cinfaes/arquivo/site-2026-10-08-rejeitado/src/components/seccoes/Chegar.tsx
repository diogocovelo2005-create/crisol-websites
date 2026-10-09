import Image from 'next/image';
import Revelar from '@/components/Revelar';

/*
  2 · Chegar (pausa). Le-se parada: o titulo e a primeira frase lado a
  lado, a fachada a toda a largura logo por baixo, e depois o par do B
  (texto e passagem a esquerda, o patio a direita), com o cerejal de 2013
  em pequeno ao lado do texto, so como apoio.
*/
export default function Chegar() {
  return (
    <section id="chegar" className="scroll-mt-20 bg-linho pt-20 md:pt-28">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <Revelar>
          <p className="passagem text-tinta-medio">Primeiro, a casa de perto.</p>
        </Revelar>

        <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-[1fr_24rem] lg:items-end lg:gap-16">
          <h2 className="titulo-seccao">Chegar</h2>
          <p className="max-w-[46ch] text-[1.0625rem] leading-[1.6]">
            Granito antigo, recuperado em 2006, segundo a casa, sem perder a traça original.
          </p>
        </div>
      </div>

      <div className="relative mt-10 h-[56svh] min-h-[340px] md:mt-14 md:h-[64svh] md:min-h-[480px]">
        <Image
          src="/fotos/fachada-02.jpg"
          alt="A fachada de granito com o alpendre, a rede e o pátio empedrado, com uma palmeira à esquerda"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '50% 45%' }}
        />
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16 lg:grid-cols-[1fr_1.55fr] lg:gap-16">
        <div className="flex flex-col justify-between gap-10">
          <div className="grid grid-cols-[1fr_9rem] items-end gap-6 sm:grid-cols-[1fr_12rem] lg:grid-cols-1">
            <p className="max-w-[34ch] text-[1.0625rem] leading-[1.6]">
              À porta, um pátio empedrado com fonte e uma rede no alpendre.
            </p>
            <figure className="m-0 lg:max-w-[16rem]">
              <Image
                src="/fotos/jardim-07.jpg"
                alt="O cerejal em flor sobre a relva, numa foto da casa de 2013"
                width={632}
                height={472}
                sizes="(min-width: 1024px) 256px, 192px"
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
          </div>
          <Revelar>
            <p className="passagem text-tinta">Mas o dia passa-se cá fora.</p>
          </Revelar>
        </div>
        <div className="relative aspect-[3/2]">
          <Image
            src="/fotos/fachada-04.jpg"
            alt="O pátio empedrado com a fonte de pedra e os sofás de exterior, com a torre da casa à direita"
            fill
            sizes="(min-width: 1320px) 760px, (min-width: 1024px) 58vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
        </div>
      </div>
    </section>
  );
}
