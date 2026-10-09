import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import LaFora from '@/components/seccoes/LaFora';
import CasaDePedra from '@/components/seccoes/CasaDePedra';
import Quartos from '@/components/seccoes/Quartos';
import AVolta from '@/components/seccoes/AVolta';
import Reservar from '@/components/seccoes/Reservar';
import Rodape from '@/components/Rodape';

/*
  O primeiro ecrã é o formato fixo de todas as casas. As secções a seguir
  vêm do protótipo C, uma por componente, pela ordem do BRIEF.md (6 secções:
  abertura, lá fora, por dentro, quartos, à volta, escolher as datas).
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se vê, o cabeçalho fica transparente. */}
      <span id="sentinela-topo" aria-hidden className="pointer-events-none absolute left-0 top-0 block h-[50vh] w-px md:h-[90vh]" />
      <main id="conteudo">
        <Hero />
        <LaFora />
        <CasaDePedra />
        <Quartos />
        <AVolta />
        <Reservar />
      </main>
      <Rodape />
    </>
  );
}
