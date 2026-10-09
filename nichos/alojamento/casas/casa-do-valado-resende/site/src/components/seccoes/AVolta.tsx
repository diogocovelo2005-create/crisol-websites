import Image from 'next/image';
import Folha from '@/components/Folha';
import ScrollStack from '@/components/reactbits/ScrollStack';
import Passagem from '@/components/Passagem';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';

/*
  5 · À volta. Painel verde-sebe, a cor mais viva do site, texto creme.

  Em cima, onde fica em duas linhas e a frase das sugestões. Depois
  quatro cartões por ordem de distância (rio, românico, serra, vinho):
  quatro em linha no computador, dois a dois no tablet, um a um no
  telemóvel.

  As fotos são de terceiros (Wikimedia Commons) e têm regras: vão
  inteiras, na proporção original, sem texto por cima, sem recorte nem
  cor mudada, com a marca de água do autor onde a houver, e com o crédito
  (autor, Commons, licença com ligação) logo por baixo. Nenhuma vai a
  ecrã inteiro.

  Os quatro cartões empilham-se com o scroll (ScrollStack, do React Bits):
  cada um fica preso um momento e o seguinte sobe por cima; os de baixo
  só encolhem um pouco, nunca mudam de cor, e a foto fica inteira.
*/

type Atracao = {
  nome: string;
  onde: string;
  texto: React.ReactNode;
  foto: { src: string; largura: number; altura: number; alt: string };
  credito: { autor: string; licenca: string; licencaUrl?: string; pagina: string; nota?: string };
};

const atracoes: Atracao[] = [
  {
    nome: 'Parque Fluvial de Porto de Rei',
    onde: 'A cerca de 9 minutos de carro',
    texto: 'O Douro que não se vê da casa está aqui: praia fluvial na margem do rio, com piscina, passadiço, cais e parque de merendas.',
    foto: {
      src: '/fotos/regiao-porto-de-rei.jpg',
      largura: 1600,
      altura: 862,
      alt: 'A praia fluvial de Porto de Rei, na margem do Douro, numa foto de 2016',
    },
    credito: {
      autor: 'Vitor Oliveira',
      licenca: 'CC BY-SA 2.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Porto_de_Rei_-_Portugal_(30637451243).jpg',
    },
  },
  {
    nome: 'Igreja de Santa Maria de Barrô',
    onde: 'A cerca de 12 minutos de carro',
    texto:
      'Românica tardia, com o janelão, a rosácea e capitéis com motivos vegetais e cenas de caça; Monumento Nacional desde 1922. Visita só por marcação.',
    foto: {
      src: '/fotos/regiao-barro.jpg',
      largura: 1600,
      altura: 1067,
      alt: 'A fachada da Igreja de Santa Maria de Barrô, numa foto de 2009',
    },
    credito: {
      autor: 'LilianaMarques',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Fachada_Igreja_Santa_Maria_de_Barr%C3%B41.jpg',
    },
  },
  {
    nome: 'Ponte da Panchorra',
    onde: 'A cerca de 27 minutos de carro',
    texto:
      'Dois arcos sobre o rio Cabrum, a cerca de 1000 metros de altitude: arquitetura vernacular, Monumento de Interesse Público desde 2013. Visita livre, ao ar livre; não acessível a mobilidade reduzida.',
    foto: {
      src: '/fotos/regiao-panchorra.jpg',
      largura: 1600,
      altura: 1067,
      alt: 'A Ponte da Panchorra, de dois arcos, sobre o rio Cabrum',
    },
    credito: {
      autor: 'Vitor Oliveira',
      licenca: 'CC BY-SA 2.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Ponte_da_Panchorra_-_Portugal_(49629390643).jpg',
    },
  },
  {
    nome: 'Museu do Douro',
    onde: 'Em Peso da Régua, a cerca de 27 minutos de carro',
    texto:
      'Para perceber o vinho da região, o vinho do Porto incluído: exposição permanente e exposições temporárias. Horários e preços no site do museu.',
    foto: {
      src: '/fotos/regiao-museu-do-douro.jpg',
      largura: 1600,
      altura: 1067,
      alt: 'O edifício do Museu do Douro, em Peso da Régua, com um barco rabelo, numa foto de 2010',
    },
    credito: {
      autor: 'FWinkel',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Museu_do_Douro_in_Peso_da_R%C3%A9gua.jpg',
    },
  },
];

const ligacao = 'underline decoration-folha/40 underline-offset-2 transition-colors hover:text-creme hover:decoration-folha';

function Credito({ c }: { c: Atracao['credito'] }) {
  return (
    <figcaption className="mt-2.5 text-[0.75rem] leading-snug text-folha">
      Foto: {c.autor} /{' '}
      <a href={c.pagina} target="_blank" rel="noopener noreferrer" className={ligacao}>
        Wikimedia Commons
      </a>
      ,{' '}
      {c.licencaUrl ? (
        <a href={c.licencaUrl} target="_blank" rel="noopener noreferrer license" className={ligacao}>
          {c.licenca}
        </a>
      ) : (
        c.licenca
      )}
      {c.nota ? ` ${c.nota}` : ''}
    </figcaption>
  );
}

export default function AVolta() {
  return (
    <Folha id="volta" rotulo="t-volta" className="bg-sebe text-creme">
      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 sm:px-8 md:pb-16 md:pt-16 lg:px-16">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
          {/* o cabeçalho ocupa a linha toda; os quatro cartões vêm por baixo */}
          <div className="md:col-span-2 lg:col-span-4">
            <Revelar className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-6">
                <h2 id="t-volta" className="titulo-seccao text-osso [&_em]:text-barro-claro">
                  <Titulo texto="À *volta*" />
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="max-w-[52ch]">
                  Rua Valado 321, Resende; o centro da vila, com supermercados e restaurantes, fica a poucos minutos de carro, e o carro fica
                  dentro da propriedade.
                </p>
                <p className="mt-3 max-w-[52ch]">
                  Estamos na região do Vale do Douro: da casa vê-se o vale e as serras; para o rio, e para o resto, chega uma tarde livre.
                </p>
                <p className="mt-6 border-t border-linha-clara pt-4 text-[0.95rem] text-folha">
                  Sugestões nossas, por ordem de distância; nenhuma é organizada pela casa.
                </p>
              </div>
            </Revelar>
          </div>
        </div>

        {/* as quatro sugestões, por ordem de distância, empilham-se com o scroll */}
        <ScrollStack className="mx-auto mt-14 max-w-[64rem] md:mt-12" topo={100} degrau={20}>
          {atracoes.map((a) => (
            <article key={a.nome} className="border border-linha-clara bg-floresta p-4 shadow-[0_-18px_40px_-24px_rgba(0,0,0,0.55)] sm:p-6">
              <div className="grid gap-5 md:grid-cols-12 md:items-center md:gap-8">
                <figure className="md:col-span-5">
                  <div className="moldura bg-linho-escuro">
                    <Image
                      src={a.foto.src}
                      alt={a.foto.alt}
                      width={a.foto.largura}
                      height={a.foto.altura}
                      sizes="(max-width: 767px) 88vw, 400px"
                      quality={99}
                      className="block h-auto w-full"
                    />
                  </div>
                  <Credito c={a.credito} />
                </figure>
                <div className="md:col-span-7">
                  <p className="versalete text-barro-claro">{a.onde}</p>
                  <h3 className="mt-2 text-[1.5rem] leading-tight text-osso md:text-[1.9rem]">{a.nome}</h3>
                  <p className="mt-3 text-[0.97rem] leading-relaxed">{a.texto}</p>
                </div>
              </div>
            </article>
          ))}
        </ScrollStack>

        <Passagem escuro className="mt-16 md:mt-12">
          Depois do passeio, volta-se à piscina. Falta só escolher as datas.
        </Passagem>
      </div>
    </Folha>
  );
}
