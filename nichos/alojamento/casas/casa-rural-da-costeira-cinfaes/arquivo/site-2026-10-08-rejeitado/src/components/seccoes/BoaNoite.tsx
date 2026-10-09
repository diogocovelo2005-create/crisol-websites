import Image from 'next/image';
import AbrirDeCima from '@/components/AbrirDeCima';
import Revelar from '@/components/Revelar';

/*
  5 · Boa noite (pormenor). A tira do B: tres imagens pequenas lado a
  lado, com legendas curtas. No telemovel, o primeiro quarto a largura toda e os outros dois
  lado a lado. Os quartos e, a
  seguir, a manha: a mesa do pequeno-almoco do Instagram em pequeno, com a
  legenda so sobre a cozinha (o servico esta por confirmar). Fundo de
  granito quente, tirado das fotos dos quartos.
*/
const figuras = [
  {
    src: '/fotos/quarto-01.jpg',
    alt: 'Cama de casal de ferro forjado preto contra a parede de granito, com uma cómoda de madeira e candeeiros de latão',
    largura: 2400,
    altura: 1600,
    foco: '50% 50%',
    proporcao: 'aspect-[5/4]',
    legenda: null,
    sizes: '(min-width: 1320px) 520px, (min-width: 768px) 40vw, 100vw',
  },
  {
    src: '/fotos/quarto-05.jpg',
    alt: 'O quarto do sótão, com as vigas em ângulo e duas camas de ferro branco com colchas às riscas',
    largura: 2400,
    altura: 1599,
    foco: '50% 45%',
    proporcao: 'aspect-[5/4]',
    legenda: 'Um dos quartos fica no sótão, debaixo do tecto de madeira.',
    sizes: '(min-width: 1320px) 520px, (min-width: 768px) 40vw, 45vw',
  },
  {
    src: '/fotos/refeicoes-03.jpg',
    alt: 'Uma mesa comprida posta de manhã, com pão, manteiga, sumo de laranja e chávenas',
    largura: 512,
    altura: 640,
    foco: '50% 50%',
    proporcao: 'aspect-[4/5]',
    legenda: 'De manhã, a cozinha tem tudo para o pequeno-almoço: fogão, forno, frigorífico e máquina de café.',
    sizes: '(min-width: 768px) 240px, 45vw',
  },
] as const;

export default function BoaNoite() {
  return (
    <section id="noite" className="scroll-mt-20 bg-pedra py-20 md:py-28">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-6 md:px-10 lg:grid-cols-2 lg:items-end lg:gap-16">
        <h2 className="titulo-seccao">
          Boa <em>noite</em>
        </h2>
        <p className="max-w-[52ch] text-[1.0625rem] leading-[1.6]">
          Camas de ferro forjado, madeira e paredes de granito, nos dois pisos. Há berço a pedido.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 items-start gap-x-3 gap-y-8 px-6 md:mt-16 md:grid-cols-[1fr_1fr_15rem] md:gap-6 md:px-10 lg:mx-auto lg:max-w-[1320px]">
        {figuras.map((f, i) => (
          <figure key={f.src} className={`m-0 ${i === 0 ? 'col-span-2 md:col-span-1' : ''} ${i === 2 ? 'md:mt-20' : ''}`}>
            <AbrirDeCima atraso={[0, 0.03, 0.06][i]}>
              <Image
                src={f.src}
                alt={f.alt}
                width={f.largura}
                height={f.altura}
                sizes={f.sizes}
                className={`${f.proporcao} w-full object-cover`}
                style={{ objectPosition: f.foco }}
              />
            </AbrirDeCima>
            {f.legenda && <figcaption className="mt-3 max-w-[34ch] text-base leading-[1.55] md:mt-4 min-[1100px]:text-[0.95rem] text-tinta-medio">{f.legenda}</figcaption>}
          </figure>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-[1320px] px-6 md:mt-20 md:px-10">
        <Revelar>
          <p className="passagem text-tinta">Depois do café, vale a pena sair.</p>
        </Revelar>
      </div>
    </section>
  );
}
