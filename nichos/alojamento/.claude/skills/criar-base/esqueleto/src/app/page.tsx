import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Rodape from '@/components/Rodape';

/*
  O primeiro ecrã é o formato fixo de todas as casas. As secções a seguir
  vêm do protótipo que o Diogo escolheu, uma por componente em
  src/components/seccoes/, pela ordem do BRIEF.md.
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se ve, o cabecalho fica transparente. Cobre o hero
          preso (190vh) menos um ecra: so ganha fundo quando o hero acaba. */}
      <span id="sentinela-topo" aria-hidden className="pointer-events-none absolute left-0 top-0 block h-[50vh] w-px md:h-[90vh]" />
      <main id="conteudo">
        <Hero />
        {/* secções do protótipo escolhido */}
      </main>
      <Rodape />
    </>
  );
}
