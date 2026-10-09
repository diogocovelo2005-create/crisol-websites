import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import CaFora from '@/components/seccoes/CaFora';
import PorDentro from '@/components/seccoes/PorDentro';
import Quartos from '@/components/seccoes/Quartos';
import AVolta from '@/components/seccoes/AVolta';
import Opinioes from '@/components/seccoes/Opinioes';
import Reservar from '@/components/seccoes/Reservar';
import Rodape from '@/components/Rodape';
import BarraLigar from '@/components/BarraLigar';

/*
  O primeiro ecrã é o formato fixo de todas as casas. As secções a seguir
  são as do protótipo C ("Planos"), pela ordem do BRIEF.md.
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se ve, o cabecalho fica transparente. O mergulho
          na piscina fica preso 90lvh (telemovel) ou 120lvh: o cabecalho
          ganha fundo a 58% dele, quando o linho ja aparece a volta da foto.
          Sem movimento, o hero nao fica preso: fundo logo a seguir a ele. */}
      <span id="sentinela-topo" aria-hidden className="pointer-events-none absolute left-0 top-0 block h-[52lvh] w-px md:h-[70lvh] motion-reduce:h-[90vh]" />
      <main id="conteudo">
        {/* "Cá fora" começa no primeiro ecrã: a piscina dele é a do "Cá fora".
            A âncora #casa cai no fim do mergulho (a margem negativa é o
            percurso preso); sem movimento, logo depois do primeiro ecrã. */}
        <section id="casa" className="[scroll-margin-top:-90lvh] md:[scroll-margin-top:-120lvh] motion-reduce:[scroll-margin-top:-100lvh]">
          <Hero />
          <CaFora />
        </section>
        <PorDentro />
        <Quartos />
        <AVolta />
        <Opinioes />
        <Reservar />
      </main>
      <Rodape />
      <BarraLigar />
    </>
  );
}
