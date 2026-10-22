import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import PorFora from '@/components/seccoes/PorFora';
import Familia from '@/components/seccoes/Familia';
import PorDentro from '@/components/seccoes/PorDentro';
import OsDaQuinta from '@/components/seccoes/OsDaQuinta';
import CaFora from '@/components/seccoes/CaFora';
import FazerParte from '@/components/seccoes/FazerParte';
import AVolta from '@/components/seccoes/AVolta';
import Reservar from '@/components/seccoes/Reservar';
import Rodape from '@/components/Rodape';

/*
  O álbum (C), pelo guião do BRIEF.md: a casa e a quinta à vez. As secções
  da casa são papel (claro), as da quinta são a mesa de madeira (escuro).
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se ve, o cabecalho fica transparente: só no
          começo, antes de a fotografia do primeiro ecrã começar a encolher
          para o álbum (por baixo dela fica o papel claro). */}
      <span id="sentinela-topo" aria-hidden className="pointer-events-none absolute left-0 top-0 block h-[18vh] w-px" />
      <main id="conteudo">
        <Hero />
        <PorFora />
        <Familia />
        <PorDentro />
        <OsDaQuinta />
        <CaFora />
        <FazerParte />
        <AVolta />
        <Reservar />
      </main>
      <Rodape />
    </>
  );
}
