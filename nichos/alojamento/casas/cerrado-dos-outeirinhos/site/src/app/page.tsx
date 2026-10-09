import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Pilares from '@/components/seccoes/Pilares';
import Atmosfera from '@/components/seccoes/Atmosfera';
import Variante from '@/components/variantes/Variante';

// As tres secoes com variantes. Trocar uma variante e trocar o import e o
// codigo em <Variante>. Catalogo e regras: molde/VARIANTES.md e /catalogo.
import Espacos from '@/components/variantes/espacos/Indice'; // E2
import Pico from '@/components/variantes/pico/Relogio'; // P1
import Fecho from '@/components/variantes/fecho/Cortina'; // F3
import Rodape from '@/components/Rodape';

/*
  A pagina conta-se como uma historia, nao como um catalogo. Cada ato
  provoca um sentimento diferente do anterior, e so ha um pico.

  A ordem desta casa nao e a do molde: H, A, E, Pi, P, O, F. A Atmosfera
  sobe para logo a seguir ao hero e os Espacos passam para antes do pico,
  porque o Cerrado vende-se pela historia da casa e pelo que se ve la
  dentro, e so depois pela estadia. Os Pilares descem para o meio: e a
  secçao calma obrigatoria entre o indice (que prende) e o pico (que
  tambem prende).

  1 Curiosidade  Hero preso: a mesma fachada, de dia e de noite, fundidas
                 devagar uma na outra. "Uma casa de granito no meio da
                 vila."
  2 Intimidade   A casa conta-se: o fidalgo que a mandou construir, os
                 materiais, os quatro pisos.
  3 Curiosidade  A visita, em indice: a lista dos espacos de um lado, o
                 espaco aberto do outro. Os nomes puxam ("a sala do
                 forno", "a casa de banho da Eira").
  -  (pausa)     Pilares: o essencial, rapido, sem prender nada, e a
                 pausa calma que o pico precisa antes.
  4 DESEJO       O pico. Tres rituais da casa, e a cor da pagina segue a
                 luz do dia: a mesa de manha, a visita a tarde, a noite
                 a pe da vila.
  5 e 6 Confianca e Decisao, fundidas: o carrossel de opinioes e a
                 propria cortina que sobe e destapa a casa iluminada, no
                 ecra inteiro. O fim resolve.

  Frase para contar a alguem: "e o site onde a pagina amanhece e
  anoitece contigo, e no fim quem ja la dormiu abre a cortina para a
  casa".
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
        <Atmosfera />
        <Variante codigo="E2">
          <Espacos />
        </Variante>
        <Pilares />
        <Variante codigo="P1">
          <Pico />
        </Variante>
        <Variante codigo="F3">
          <Fecho />
        </Variante>
      </main>
      <Rodape />
    </>
  );
}
