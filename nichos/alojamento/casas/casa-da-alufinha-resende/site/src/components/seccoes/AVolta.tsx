import FotoPlano from '@/components/FotoPlano';
import Sobe from '@/components/Sobe';
import CartoesVolta, { type Sitio } from '@/components/CartoesVolta';

/*
  5 · Lá em baixo corre o Douro, e à volta há mais. O rio a toda a
  largura com o título pousado e Porto de Rei num cartão, depois os
  quatro sítios, do mais perto ao mais longe: postais em leque (Bounce
  Cards, pedido do Diogo a 2026-10-09; CartoesVolta) e a lista ao lado.
  A vista do rio alarga-se ao chegar (FotoPlano 'lados'). As fotos
  da região são de terceiros: inteiras, sem texto por cima, com crédito.
  O crédito passou de 12,8 px para 15 px (era o parágrafo abaixo de 15 px
  que o protótipo tinha de aviso).
*/

const sitios: Sitio[] = [
  {
    nome: 'Rota dos Cerejais',
    distancia: 'Passa a cerca de 0,8 km por estrada',
    texto:
      'Um percurso pedestre circular de 5,7 km entre cerejais, pelo Solar de Porto de Rei e pela praia fluvial, com vistas sobre o Douro. Na floração das cerejeiras, as encostas ficam cobertas de branco.',
    foto: { src: '/fotos/regiao-rota-dos-cerejais.jpg', alt: 'Solar de Porto de Rei sobre o Douro', largura: 3600, altura: 2319 },
    credito: (
      <>
        Solar de Porto de Rei. Foto: Hans Birger Nilsen /{' '}
        <a href="https://commons.wikimedia.org/wiki/File:São_João_de_Fontoura_(48115125086).jpg">Wikimedia Commons</a>,{' '}
        <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>
      </>
    ),
  },
  {
    nome: 'Igreja de Santa Maria de Barrô',
    distancia: 'Cerca de 7 km (cerca de 9 min) de carro',
    texto: 'Igreja românica, Monumento Nacional desde 1922, com cenas de caça nos capitéis do arco triunfal. Visita ao interior só por marcação.',
    foto: { src: '/fotos/regiao-barro.jpg', alt: 'Fachada da Igreja de Santa Maria de Barrô', largura: 3888, altura: 2592 },
    credito: (
      <>
        Foto: LilianaMarques / <a href="https://commons.wikimedia.org/wiki/File:Fachada_Igreja_Santa_Maria_de_Barrô1.jpg">Wikimedia Commons</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </>
    ),
  },
  {
    nome: 'Museu do Douro',
    distancia: 'Peso da Régua · cerca de 23 km (cerca de 24 min)',
    texto: 'O património da Região Demarcada do Douro e dos seus vinhos, com restaurante e wine bar. Horários no site do museu.',
    foto: { src: '/fotos/regiao-museu-do-douro.jpg', alt: 'Museu do Douro, em Peso da Régua', largura: 4032, altura: 2688 },
    credito: (
      <>
        Foto: FWinkel / <a href="https://commons.wikimedia.org/wiki/File:Museu_do_Douro_in_Peso_da_Régua.jpg">Wikimedia Commons</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </>
    ),
  },
  {
    nome: 'Santuário de Nossa Senhora dos Remédios',
    distancia: 'Lamego · cerca de 19 km (cerca de 30 min)',
    texto: 'Santuário barroco construído entre 1750 e 1761, com um escadório de 686 degraus; a festa maior é a 8 de setembro.',
    foto: { src: '/fotos/regiao-remedios.jpg', alt: 'Santuário de Nossa Senhora dos Remédios, em Lamego', largura: 2048, altura: 1536 },
    credito: (
      <>
        Foto: Mcff / <a href="https://commons.wikimedia.org/wiki/File:Santuário_de_Nossa_Senhora_dos_Remédios.jpg">Wikimedia Commons</a>, domínio público
      </>
    ),
  },
];

// no telemóvel a 16 px e sem maiúsculas, para se ler; no ecrã largo, as versaletes do protótipo
const distancia = 'mb-2.5 mt-1.5 text-base font-semibold text-vermelho [@media(hover:hover)]:md:text-[0.75rem] md:uppercase md:tracking-[0.14em]';

export default function AVolta() {
  return (
    <section id="volta">
      <div className="relative isolate flex min-h-[88svh] flex-col items-start text-osso lg:flex-row">
        {/* a vista alarga-se ao chegar: "à volta há mais" */}
        <FotoPlano
          src="/fotos/vista-03.jpg"
          alt="Vista aérea do rio Douro e da praia fluvial de Porto de Rei"
          sizes="100vw"
          abre="lados"
          className="absolute inset-0 -z-20"
        >
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,28,22,.72)_0%,rgba(25,28,22,.55)_50%,rgba(25,28,22,.2)_75%)] lg:bg-[linear-gradient(180deg,rgba(25,28,22,.62)_0%,rgba(25,28,22,.3)_38%,transparent_60%)]" />
        </FotoPlano>
        <div className="caixa w-full pt-[88px]">
          <p className="font-display text-[1.4rem] italic">De manhã, há um rio lá em baixo à espera.</p>
          <Sobe className="titulo-seccao mt-3.5 max-w-[16ch]">
            Lá em baixo corre o Douro, e <em>à volta há mais.</em>
          </Sobe>
          <p className="mt-[22px] max-w-[46ch] text-[1.05rem]">
            A casa fica em São João de Fontoura, concelho de Resende, junto ao rio Douro. Estas são sugestões de passeio, para escolher ao sabor de cada dia.
          </p>
        </div>
        <div className="mx-6 mb-6 mt-auto bg-linho px-6 py-[22px] text-tinta lg:absolute lg:bottom-9 lg:right-10 lg:m-0 lg:max-w-[360px]">
          <h3 className="text-[1.45rem]">Parque Fluvial de Porto de Rei</h3>
          <p className={distancia}>A cerca de 0,8 km por estrada</p>
          <p className="text-[0.98rem] leading-[1.6]">
            Praia fluvial na margem do Douro, com passadiço, pontão, cais de embarque turístico, piscina e parque de merendas, e um restaurante local de peixe do rio de escabeche e enguias.
          </p>
        </div>
      </div>

      {/* os quatro sítios: postais em leque (Bounce Cards) e a lista ao lado */}
      <CartoesVolta sitios={sitios} distancia={distancia} />
    </section>
  );
}
