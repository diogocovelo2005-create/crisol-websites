import Cabecalho from '@/components/Cabecalho';
import Hero from '@/components/seccoes/Hero';
import Pilares from '@/components/seccoes/Pilares';
import Atmosfera from '@/components/seccoes/Atmosfera';
import Experiencia from '@/components/variantes/pico/Relogio'; // P1, sem a linha do dia
import Espacos from '@/components/seccoes/Espacos';
import Fecho from '@/components/variantes/fecho/Cortina'; // F3, cortina que sobe
import Rodape from '@/components/Rodape';

/*
  Casa da Calcada.

  Direccao: simplicidade, na linha das casas de hospedes que o Diogo usa
  como referencia. Uma seccao faz uma coisa so, os titulos ficam ao centro,
  as fotografias entram em molduras iguais e o ritmo vertical repete-se.
  Nenhuma seccao prende o scroll e nada tapa uma fotografia.

  1 Hero        a fotografia da piscina com a torre, de ecra inteiro, e a
                promessa no terco de baixo.
  2 A casa      texto a esquerda, uma fotografia a direita.
  3 Espacos     faixa que anda de lado, com setas e gesto. Nao prende a
                pagina: o scroll vertical continua a ser scroll vertical.
  4 Factos      os quatro praticos, numa faixa.
  5 Experiencia relogio: os tres momentos passam com a pagina presa e a cor
                a mudar com eles. Sem a barra de manha, tarde e noite.
  6 Fecho       a cortina e "Quem ja ca ficou": as citacoes a letra sobem
                como uma cortina e destapam a quinta vista de cima, com o
                convite a contactar por cima dela.

  Nao ha seccao de opinioes separada. As citacoes viviam duas vezes na
  mesma pagina: uma vez numa seccao propria e outra dentro da cortina do
  fecho. Ficaram so na cortina, que e onde servem a decisao.

  Frase para contar a alguem: "e o site da casa que tem uma igreja la
  dentro".
*/
export default function Pagina() {
  return (
    <>
      <Cabecalho />
      {/* Enquanto esta faixa se ve, o cabecalho fica transparente e em tinta
          clara: cobre o hero menos a altura do proprio cabecalho. */}
      <span id="sentinela-topo" aria-hidden className="pointer-events-none absolute left-0 top-0 block h-[calc(100dvh-5rem)] w-px" />
      <main id="conteudo">
        <Hero />
        <Atmosfera />
        <Espacos />
        <Pilares />
        <Experiencia />
        <Fecho />
      </main>
      <Rodape />
    </>
  );
}
