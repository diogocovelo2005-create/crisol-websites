import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Patio from '@/components/seccoes/Patio';
import Fora from '@/components/seccoes/Fora';
import Sala from '@/components/seccoes/Sala';
import Quartos from '@/components/seccoes/Quartos';
import Volta from '@/components/seccoes/Volta';
import Opinioes from '@/components/seccoes/Opinioes';
import Contacto from '@/components/seccoes/Contacto';
import Rodape from '@/components/Rodape';

/*
  O primeiro ecrã é o formato fixo de todas as casas. As secções a seguir
  são o protótipo B passado fiel (prototipos/b.html), pela ordem dele, sem
  a faixa da citação que vinha logo depois do primeiro ecrã.
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se ve, o cabecalho fica transparente. Acaba quando
          o topo de «A casa de perto» (que sobe por cima do hero preso) chega
          ao cabecalho: o tempo do zoom (40vh / 45vh) + um ecra - 80px. Com
          movimento reduzido o hero nao prende: meio ecra / 90vh, como antes. */}
      <span
        id="sentinela-topo"
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 block h-[calc(40vh+max(100lvh,var(--hmin))-80px)] w-px md:h-[calc(45vh+max(100lvh,var(--hmin))-80px)] motion-reduce:h-[50vh] motion-reduce:md:h-[90vh]"
      />
      <main id="conteudo">
        <Hero />
        <Patio />
        <Fora />
        <Sala />
        <Quartos />
        <Volta />
        <Opinioes />
        <Contacto />
      </main>
      <Rodape />
    </>
  );
}
