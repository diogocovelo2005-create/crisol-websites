import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Pilares from '@/components/seccoes/Pilares';
import Atmosfera from '@/components/seccoes/Atmosfera';
import UmDia from '@/components/seccoes/UmDia';
import ACasa from '@/components/seccoes/ACasa';
import Provas from '@/components/seccoes/Provas';
import Fecho from '@/components/seccoes/Fecho';
import Rodape from '@/components/Rodape';

/*
  A pagina conta-se como uma historia, nao como um catalogo. Cada ato
  provoca um sentimento diferente do anterior, e so ha um pico.

  1 Curiosidade  Hero preso: "Ha tres pianos nesta casa." A cortina fecha
                 sobre a promessa e abre sobre a voz do dono.
  -  (pausa)     Pilares: o essencial, rapido, sem prender nada.
  2 Intimidade   A historia da casa (1896, trinta anos fechada, 1998) com a
                 colagem em profundidade.
  3 DESEJO       O pico. Um dia inteiro na casa com o scroll: manha, tarde,
                 noite, duas fotografias por parte a cair como provas em
                 papel. A cor da pagina segue a luz. Tem o maior espaco de
                 scroll e um silencio antes (o titulo sozinho).
  4 Calma        Amanhece outra vez: a visita aos sete espacos, de lado.
  5 Confianca    Quem ja ca dormiu (citacoes reais do Booking).
  6 Decisao      A foto abre em arco de porta ate ao ecra inteiro e fica.

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
        <UmDia />
        <ACasa />
        <Provas />
        <Fecho />
      </main>
      <Rodape />
    </>
  );
}
