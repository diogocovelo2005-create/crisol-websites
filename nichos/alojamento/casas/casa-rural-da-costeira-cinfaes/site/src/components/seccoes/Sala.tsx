import Image from 'next/image';
import Revelar from '@/components/Revelar';
import Passagem from '@/components/movimento/Passagem';
import Portas from '@/components/movimento/Portas';

/* 4. A sala (B): a inversão para o escuro. Foto a sangrar à esquerda e
   texto ao lado, depois a mesa e a cozinha, e a frase que leva aos
   quartos. */
export default function Sala() {
  return (
    <section id="sala" className="relative scroll-mt-20 bg-floresta text-osso">
      <Portas />
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="relative h-[62svh] min-h-[380px] lg:h-[68svh] lg:min-h-[540px]">
          <Image
            src="/fotos/sala-03.jpg"
            alt="A sala em plano aberto, com as vigas, a mesa e as portas envidraçadas"
            fill
            sizes="(min-width: 1024px) 61vw, 100vw"
            quality={85}
            className="object-cover"
            style={{ objectPosition: '55% 50%' }}
          />
        </div>
        <div className="grid content-center px-6 py-16 md:px-10 lg:px-14 lg:py-20">
          <Revelar className="grid gap-[22px]">
          <p className="rotulo text-liquen">Lá dentro</p>
          <h2 className="titulo" style={{ ['--titulo' as string]: 'clamp(2.6rem, 5.2vw, 5.3rem)' }}>
            Lareira, sofás e <em>a mesa grande</em>
          </h2>
          <p className="m-0 max-w-[36ch]">
            A sala de estar e de jantar tem lareira a lenha, sofás fundos e uma mesa grande de madeira, onde a conversa do jantar se estica pela noite.
          </p>
          </Revelar>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 pb-14 md:px-10 lg:grid-cols-2 lg:items-start lg:pt-[72px]">
        <figure className="m-0">
          <div className="relative aspect-[3/2]">
            <Image
              src="/fotos/refeicoes-02.jpg"
              alt="A mesa de madeira entre a parede de granito e a parede amarela"
              fill
              sizes="(min-width: 1440px) 670px, (min-width: 1024px) 47vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 55%' }}
            />
          </div>
        </figure>
        <figure className="m-0">
          <div className="relative aspect-[3/2] lg:w-[78%]">
            <Image
              src="/fotos/cozinha-01.jpg"
              alt="A cozinha com bancada de granito e vigas de madeira"
              fill
              sizes="(min-width: 1440px) 525px, (min-width: 1024px) 37vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '45% 50%' }}
            />
          </div>
          <figcaption className="mt-3 max-w-[60ch] text-[0.95rem] text-liquen">
            A cozinha tem fogão, forno, micro-ondas, frigorífico, máquina de lavar loiça e máquina de café. E a casa tem aquecimento, para os meses frios.
          </figcaption>
        </figure>
      </div>

      {/* a faixa com a citação da Tarsila saiu (Diogo, 08/10); fica a passagem */}
      <div className="moldura pb-[72px] text-center">
        <Passagem className="passagem text-liquen">Ao fim da noite, a escada leva aos quartos.</Passagem>
      </div>
    </section>
  );
}
