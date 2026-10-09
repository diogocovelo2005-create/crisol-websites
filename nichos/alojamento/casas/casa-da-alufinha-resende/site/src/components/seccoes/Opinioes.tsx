import FotoPlano from '@/components/FotoPlano';
import Sobe from '@/components/Sobe';

/*
  6 · Quem lá esteve deu nota máxima. Uma faixa de cinema, as notas com
  fonte e data, uma frase enorme e as outras duas em pequeno, como no
  protótipo C. A faixa passou a ser a piscina-04 (a piscina com a casa
  atrás): a piscina-03 foi para a abertura do "Cá fora", em grande. O
  recorte desce para o ponto onde cabem o telhado e a água.
*/

const cite = 'mt-4 block font-corpo text-[0.75rem] font-semibold not-italic uppercase tracking-[0.18em] text-tinta-medio';

export default function Opinioes() {
  return (
    <section id="opinioes" className="border-t border-linha pb-20 md:pb-[104px]">
      {/* a faixa de cinema abre do meio, como as barras de um ecrã de cinema */}
      <figure className="m-0">
        <FotoPlano
          src="/fotos/piscina-04.jpg"
          alt="Piscina de água turquesa com espreguiçadeiras e a casa de telhado vermelho atrás"
          sizes="100vw"
          foco="50% 62%"
          abre="faixa"
          className="aspect-[21/7] w-full"
        />
      </figure>
      <div className="caixa grid gap-10 pt-[72px] lg:grid-cols-[4fr_7fr] lg:gap-[88px]">
        <div>
          <p className="marca-pequena">Quem lá esteve conta o resto.</p>
          <Sobe className="mt-4 max-w-[12ch] text-[clamp(2.3rem,4vw,3.6rem)]">
            Quem lá esteve deu <em>nota máxima.</em>
          </Sobe>
          <p className="mt-[22px] max-w-[44ch] text-tinta-medio">
            As 6 avaliações publicadas, de julho e agosto de 2026, têm todas a nota máxima: 5,0 em 5 avaliações no Airbnb, onde a casa é &quot;Favorito dos hóspedes&quot;, e 10 no Booking, em 1 avaliação. Notas consultadas a 9 de outubro de 2026.
          </p>
          <p className="mt-[18px] max-w-[44ch]">Quem recebe os hóspedes é a Maria, e é o nome dela que aparece nas avaliações.</p>
        </div>
        <div>
          <blockquote lang="en" className="m-0 font-display text-[clamp(3rem,7vw,6.6rem)] italic leading-[0.98] tracking-[-0.03em]">
            &quot;Food, sleep, swim, repeat!&quot;
            <p lang="pt-PT" className="mt-3 font-corpo text-base not-italic tracking-normal text-tinta-medio">
              Comer, dormir, nadar, repetir!
            </p>
            <cite lang="pt-PT" className={cite}>
              Diana, Booking
            </cite>
          </blockquote>
          <div className="mt-11 grid gap-7 lg:grid-cols-2">
            <blockquote className="m-0 border-l-2 border-vermelho pl-[18px] font-display text-[1.3rem] leading-[1.35]">
              &quot;Espaço muito bonito, as fotos não demonstram como a casa é grande e acolhedora!&quot;
              <cite className={cite}>Cátia, Airbnb</cite>
            </blockquote>
            <blockquote className="m-0 border-l-2 border-vermelho pl-[18px] font-display text-[1.3rem] leading-[1.35]">
              &quot;Casa maravilhosa e anfitriã muito simpática.&quot;
              <cite className={cite}>Ana Rita, Airbnb</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
