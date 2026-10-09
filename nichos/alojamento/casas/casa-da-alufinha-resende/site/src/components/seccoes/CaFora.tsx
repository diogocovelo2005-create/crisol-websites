import FotoPlano from '@/components/FotoPlano';
import Sobe from '@/components/Sobe';

/*
  2 · O dia passa-se cá fora. A piscina-03 e o título da secção vivem no
  fim do primeiro ecrã (Hero.tsx): é lá que o mergulho na piscina pousa.
  Aqui seguem os outros três planos, alternados, como no protótipo C.

  Cada foto abre a partir do lado da frase, para fora (FotoPlano), e cada
  título sobe de trás de uma linha (Sobe): a frase chega primeiro, o
  sítio a seguir.
*/

function Texto({ titulo, texto, className = '' }: { titulo: string; texto: string; className?: string }) {
  return (
    <div className={`px-6 lg:px-10 lg:pb-3 ${className}`}>
      <Sobe as="h3" className="text-[clamp(2rem,3.4vw,3rem)] italic">
        {titulo}
      </Sobe>
      <p className="mt-3.5 max-w-[30ch] text-[1.05rem]">{texto}</p>
    </div>
  );
}

export default function CaFora() {
  return (
    <div>
      {/* no telemóvel, "A piscina." vem logo a seguir à foto (no computador está ao lado dela, no Hero) */}
      <Texto className="mt-6 lg:hidden" titulo="A piscina." texto="Água turquesa, espreguiçadeiras e os socalcos logo atrás." />

      <div className="mt-14 lg:mt-20" />

      {/* a pérgola: foto à direita, texto à esquerda; a foto abre da frase para a direita */}
      <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:items-end lg:gap-0">
        <FotoPlano
          src="/fotos/vista-01.jpg"
          alt="Pérgola de madeira com mesa e cadeiras de vime sobre os socalcos"
          sizes="(min-width: 1024px) 67vw, 100vw"
          abre="direita"
          className="aspect-[3/2] w-full lg:col-[5/13] lg:row-start-1 lg:aspect-auto lg:h-[64svh] lg:min-h-[440px]"
        />
        <Texto
          className="lg:col-[1/5] lg:row-start-1 lg:justify-self-end lg:text-right lg:[&_p]:ml-auto"
          titulo="A pérgola."
          texto="Uma mesa à sombra, sobre os socalcos, para almoços que se estendem pela tarde."
        />
      </div>

      {/* a rede: foto à esquerda, abre da frase para a esquerda */}
      <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:items-end lg:gap-0">
        <FotoPlano
          src="/fotos/detalhe-01.jpg"
          alt="Rede de macramé entre pilares de granito, junto à piscina"
          sizes="(min-width: 1024px) 67vw, 100vw"
          abre="esquerda"
          className="aspect-[3/2] w-full lg:col-[1/9] lg:aspect-auto lg:h-[64svh] lg:min-h-[440px]"
        />
        <Texto className="lg:col-[9/13]" titulo="A rede." texto="Pendurada ao lado da água, para quem só quer ler e deixar a tarde passar." />
      </div>

      {/* a churrasqueira: plano médio (a foto só aguenta tamanho médio) */}
      <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:items-end lg:gap-0">
        <FotoPlano
          src="/fotos/cozinha-01.jpg"
          alt="Cozinha exterior com churrasqueira de granito e mesa branca"
          sizes="(min-width: 1024px) 50vw, 100vw"
          abre="esquerda"
          className="aspect-[3/2] w-full lg:col-[3/9] lg:aspect-auto lg:h-[52svh] lg:min-h-[360px]"
        />
        <Texto className="lg:col-[9/13]" titulo="A churrasqueira." texto="Uma cozinha exterior, com churrasqueira privada, para comer ao ar livre." />
      </div>
    </div>
  );
}
