import Image from 'next/image';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  A casa: texto a esquerda, uma fotografia a direita. Nada mais.

  A coluna da direita e um mosaico: a fotografia do telhado em cima, mais
  pequena do que era, e dois quartos por baixo, lado a lado. O segundo
  quarto e vertical (720x1080 na origem) e por isso fica mais alto do que
  o primeiro; e o desencontro que faz o mosaico.

  A versao anterior punha aqui um arquivo de quatro entradas, cada uma com
  a sua fotografia. Saiu por duas razoes: a seccao ficava a competir com a
  dos espacos, e esta casa nao tem uma unica fotografia de arquivo, o que
  obrigava a ilustrar o seculo XVIII com uma foto tirada este ano. A
  historia cabe nas duas primeiras linhas do texto.
*/

export default function Atmosfera() {
  const a = casa.atmosfera;

  return (
    <section id="a-casa" className="scroll-mt-20 border-b border-linha">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Revelar>
            <p className="versalete text-ouro-escuro">{a.etiqueta}</p>
            <h2 className="mt-5 max-w-[14ch] text-[2.3rem] text-tinta md:text-[2.9rem]">
              <Titulo texto={a.titulo} />
            </h2>
            <span aria-hidden className="mt-7 block h-px w-12 bg-ouro-escuro/60" />
            <p className="mt-7 max-w-[52ch] font-light leading-[1.85] text-tinta-medio">{a.texto}</p>

            {a.voz ? (
              <figure className="mt-8">
                <blockquote className="font-display text-[1.3rem] leading-[1.45] text-tinta md:text-[1.5rem]">
                  {a.voz}
                </blockquote>
                <figcaption className="legenda mt-3">{a.quem}</figcaption>
              </figure>
            ) : null}

            <Botao href="#espacos" tom="contorno" className="mt-9">
              Ver os quartos
            </Botao>
          </Revelar>

          <Revelar atraso={0.08}>
            <Image
              src={a.imagem}
              alt={a.alt}
              width={1500}
              height={1125}
              quality={88}
              sizes="(max-width: 1024px) 82vw, 38vw"
              className="mx-auto h-auto w-[82%] lg:mx-0 lg:w-[86%]"
            />
            <div className="mt-5 grid grid-cols-2 items-start gap-4 lg:mt-6 lg:gap-5">
              {a.quartos.map((q, i) => (
                <Image
                  key={q.imagem}
                  src={q.imagem}
                  alt={q.alt}
                  width={i === 0 ? 1100 : 720}
                  height={i === 0 ? 825 : 1080}
                  quality={86}
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className={i === 0 ? 'mt-8 h-auto w-full' : 'h-auto w-full'}
                />
              ))}
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
