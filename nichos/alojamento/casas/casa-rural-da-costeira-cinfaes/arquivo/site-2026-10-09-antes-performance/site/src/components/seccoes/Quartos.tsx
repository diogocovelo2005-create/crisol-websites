import Image from 'next/image';
import Revelar from '@/components/Revelar';
import Passagem from '@/components/movimento/Passagem';

/* 5. Os quartos (B): cabeçalho em duas colunas e uma tira de três fotos
   com legenda curta. No telemóvel a tira corre de lado, ao dedo. */
const quartos = [
  {
    foto: '/fotos/quarto-01.jpg',
    alt: 'Cama de ferro forjado preto contra a parede de granito',
    foco: '50% 50%',
    nome: 'Ferro forjado',
  },
  {
    foto: '/fotos/quarto-05.jpg',
    alt: 'O quarto do sótão com as vigas em ângulo e duas camas de ferro branco',
    foco: '50% 45%',
    nome: 'O sótão',
    texto: 'Um deles fica no sótão, debaixo do tecto de madeira, com duas camas individuais de ferro.',
  },
  {
    foto: '/fotos/quarto-03.jpg',
    alt: 'Quarto de parede amarelo-laranja com cama de ferro forjado e um berço',
    foco: '45% 55%',
    nome: 'Tons de terra',
    texto: 'Para os mais pequenos, há berço a pedido.',
  },
];

export default function Quartos() {
  return (
    <section id="quartos" className="scroll-mt-20 py-[72px]">
      <div className="moldura grid gap-8 border-b border-linha pb-14 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="rotulo">Onde se dorme</p>
          <h2 className="titulo mt-[18px] max-w-[12ch]" style={{ ['--titulo' as string]: 'clamp(2.6rem, 5.6vw, 5.8rem)' }}>
            Ferro forjado e <em>paredes de granito</em>
          </h2>
        </div>
        <p className="m-0 max-w-[40ch]">
          Os quartos têm camas de ferro forjado, madeiras e paredes de granito ou em tons de terra, e ficam nos dois pisos da casa.
        </p>
      </div>

      {/* rolável no telemóvel: foca-se com o teclado para correr com as setas */}
      <div
        role="region"
        aria-label="Fotografias dos quartos"
        tabIndex={0}
        className="sem-barra mx-auto mt-14 grid max-w-[1440px] snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-2 overflow-x-auto scroll-px-6 px-6 md:auto-cols-fr md:overflow-visible md:px-10"
      >
        {quartos.map((q, i) => (
          <figure key={q.foto} className="m-0 snap-start">
            <Revelar atraso={i * 0.025}>
            <div className="relative aspect-[5/4]">
              <Image
                src={q.foto}
                alt={q.alt}
                fill
                sizes="(min-width: 1440px) 450px, (min-width: 768px) 32vw, 82vw"
                className="object-cover"
                style={{ objectPosition: q.foco }}
              />
            </div>
            <figcaption className="grid gap-1.5 pt-4">
              <span className="rotulo">{q.nome}</span>
              {q.texto && <p className="m-0 max-w-[34ch]">{q.texto}</p>}
            </figcaption>
            </Revelar>
          </figure>
        ))}
      </div>

      <div className="moldura">
        <Passagem className="passagem mt-12">De manhã, vale a pena sair: o Douro está perto.</Passagem>
      </div>
    </section>
  );
}
