'use client';

import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import TituloDito from '@/components/TituloDito';

/*
  3 · A família na quinta (madeira: as secções da quinta são a mesa de
  madeira, as da casa o papel do álbum). O título chega dito, palavra a
  palavra; o cabrito sobe para dentro do enquadramento, como quem o pega
  ao colo, e a legenda escreve-se por baixo.
*/
export default function Familia() {
  return (
    <section id="quinta" className="madeira scroll-mt-20 pb-[120px] pt-[110px]" aria-labelledby="quinta-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <Revelar>
          <p className="pagina">
            A quinta <span>· porquê este nome</span>
          </p>
        </Revelar>
        <TituloDito id="quinta-titulo" texto="Na quinta, a família acolhe *quem precisa de casa*" className="mt-[18px] max-w-[20ch] text-[2.4rem] leading-[1.04] lg:text-[4rem]" />
        <div className="mt-14 grid grid-cols-1 items-start gap-14 lg:grid-cols-3">
          <Revelar className="pt-1.5">
            <p>A casa e o projeto «A Família na Quinta» são da mesma família e têm o mesmo nome. O projeto acolhe animais de quinta resgatados da exploração, de maus tratos e da morte, e dá-lhes um lar para a vida inteira.</p>
          </Revelar>
          <Impressa
            src="/fotos/3c4517_049df7bf6abe4293909d6a87abb074d7.jpg"
            alt="Um cabrito cor de creme ao colo, de cabeça virada para a direita"
            foco="57% 34%"
            proporcao="1 / 1"
            rot={2}
            de={{ y: 120, r: -4, s: 0.96 }}
            fita
            legenda="Acolher, nas palavras da família, é dar um lar para a vida inteira."
            sizes="(max-width: 1023px) 92vw, 400px"
            className="-mt-2.5"
          />
          <div>
            <Revelar atraso={0.03}>
              <p>Vivem na mesma quinta onde fica a casa. Quem lá dorme fica, por umas noites, dentro dessa história.</p>
            </Revelar>
            <Revelar atraso={0.03}>
              <blockquote className="cita mt-[30px]">
                <p>&ldquo;Os animais da quinta foram uma agradável surpresa à chegada&rdquo;</p>
                <cite>Lígia, Airbnb</cite>
              </blockquote>
            </Revelar>
            <Revelar>
              <p className="passagem mt-[30px]">Aos animais, a família dá casa para sempre. A quem chega, abre esta.</p>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
