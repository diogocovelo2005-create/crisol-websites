import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Pilares from '@/components/seccoes/Pilares';
import Atmosfera from '@/components/seccoes/Atmosfera';
import Provas from '@/components/seccoes/Provas';
import Variante from '@/components/variantes/Variante';

// Esta é a combinação base. O catálogo tem alternativas para as sete secções;
// índice técnico, código e laboratório: VARIANTES.md e /catalogo.
import Pico from '@/components/variantes/pico/Relogio'; // P1
import Espacos from '@/components/variantes/espacos/Faixa'; // E1
import Fecho from '@/components/variantes/fecho/Moldura'; // F1
import Rodape from '@/components/Rodape';

/*
  A pagina conta-se como uma historia, nao como um catalogo. Cada ato
  provoca um sentimento diferente do anterior, e so ha um pico.

  1 Curiosidade  Hero preso: a camara avanca pelo caminho, "Chega-se por um
                 caminho de terra."
  -  (pausa)     Pilares: o essencial, rapido, sem prender nada.
  2 Intimidade   A voz dos anfitrioes, grande, e a historia da casa com a
                 colagem em profundidade.
  3 DESEJO       O pico. Um dia inteiro na casa com o scroll: amanhece, a
                 mesa, anoitece a lareira. A cor da pagina segue a luz.
                 Tem o maior espaco de scroll e um silencio antes (o titulo
                 sozinho).
  4 Calma        Amanhece outra vez: a visita aos espacos, de lado.
  5 Confianca    Quem ja ca dormiu.
  6 Decisao      A foto abre ate ao ecra inteiro e fica. O fim resolve.

  Frase para contar a alguem: "e o site onde passas um dia inteiro na
  casa so com o scroll".
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
        <Pilares />
        <Atmosfera />
        <Variante codigo="P1">
          <Pico />
        </Variante>
        <Variante codigo="E1">
          <Espacos />
        </Variante>
        <Provas />
        <Variante codigo="F1">
          <Fecho />
        </Variante>
      </main>
      <Rodape />
    </>
  );
}
