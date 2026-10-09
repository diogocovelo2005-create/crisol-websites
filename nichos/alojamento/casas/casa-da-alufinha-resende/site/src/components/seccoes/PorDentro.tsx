import FotoPlano from '@/components/FotoPlano';
import Sobe from '@/components/Sobe';

/*
  3 · Quando o sol aperta, entra-se na pedra. A faixa escura do protótipo
  C: a sala grande a toda a largura e, por baixo, três colunas. A sala-02
  (o patamar do sótão, pedido do Diogo) entra na primeira coluna, em
  tamanho médio, ao lado da cozinha: legendada pelo patamar, nunca como a
  sala, e com o logótipo sobreposto como está.

  Entradas: a sala abre do meio para os lados, como portadas (entra-se
  na pedra); as duas fotos pequenas abrem de cima para baixo, uma logo
  depois da outra; o título sobe como os outros.
*/
export default function PorDentro() {
  return (
    <section id="dentro" className="bg-floresta pb-20 text-[#ede6da] md:pb-[104px]">
      <div className="caixa">
        <div className="corte !pb-10 !pt-[72px] md:!pt-24">
          <p className="text-[#cdbfac]">E quando apetece sombra, é só entrar.</p>
        </div>
        <Sobe className="titulo-seccao max-w-[15ch]">
          Quando o sol aperta, entra-se <em>na pedra.</em>
        </Sobe>
      </div>

      <FotoPlano
        src="/fotos/sala-03.jpg"
        alt="Sala de estar e jantar com paredes de pinho e granito, sofá verde e janelas de madeira vermelha"
        sizes="100vw"
        foco="40% 50%"
        qualidade={88}
        abre="centro"
        className="mt-14 h-[70svh] min-h-[380px] w-full"
      />

      <div className="caixa mt-12 grid items-start gap-9 lg:grid-cols-3 lg:gap-14">
        <figure className="m-0">
          <FotoPlano
            src="/fotos/sala-02.jpg"
            alt="Patamar no sótão, com pufes amarelo e verde, teto de madeira e uma porta aberta para fora"
            sizes="(min-width: 1024px) 30vw, 100vw"
            foco="50% 60%"
            className="mb-2.5 aspect-[16/10] w-full"
          />
          <figcaption className="mb-[18px] font-display text-[1.05rem] italic text-[#cdbfac]">O patamar do sótão, com a porta aberta para fora</figcaption>
          <p className="max-w-[40ch] text-[#e2d9cb]">
            Paredes de granito, madeira de pinho e uma sala de estar e jantar num só espaço. A casa é antiga e foi remodelada para quem chega agora.
          </p>
        </figure>
        <div>
          <FotoPlano
            src="/fotos/cozinha-02.jpg"
            alt="Cozinha com armários verdes, bancada de granito e janela de madeira vermelha"
            sizes="(min-width: 1024px) 30vw, 100vw"
            atraso={0.06}
            className="mb-[18px] aspect-[16/10] w-full"
          />
          <p className="max-w-[40ch] text-[#e2d9cb]">
            A cozinha está pronta para cozinhar a sério: forno, micro-ondas, máquina de lavar louça, máquina de café, chaleira e torradeira, e uma máquina de lavar roupa para as estadias longas. As refeições fazem-se em casa, ao gosto de cada um.
          </p>
        </div>
        <p className="max-w-[40ch] border-t border-linha-escura pt-4 text-[#cdbfac]">
          Ar condicionado em todas as divisões, Wi-Fi gratuito, TV com streaming e estacionamento privado dentro da propriedade.
        </p>
      </div>
    </section>
  );
}
