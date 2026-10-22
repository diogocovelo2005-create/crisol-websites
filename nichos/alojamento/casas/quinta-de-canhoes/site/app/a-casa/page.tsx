import type { Metadata } from "next";
import { metadados } from "@/lib/seo";
import Image from "next/image";
import { Revelar } from "@/components/Revelar";
import { HeroTransicao } from "@/components/landing/HeroTransicao";
import { CortinaQuartos } from "@/components/CortinaQuartos";
import { JardimSocalcos } from "@/components/JardimSocalcos";
import { FotoTamanhos } from "@/components/FotoTamanhos";

export const metadata: Metadata = metadados({
  titulo: "A casa centenária em Várzea",
  descricao: "Cem anos de granito em Várzea, São Pedro do Sul: jardim em socalcos, piscina sobre o vale do Vouga e a mesa do pequeno-almoço caseiro.",
  caminho: "/a-casa",
});

export default function PaginaACasa() {
  return (
    <>
      {/* 1. Hero com transição por Scroll e 2. Jardim */}
      <HeroTransicao>
        <JardimSocalcos />
      </HeroTransicao>

      {/* 3. Um dia na Quinta (com pequeno-almoço) */}
      <section className="relative z-20 bg-cal py-24 md:py-32 overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <Revelar>
            <h2 className="cartaz text-[clamp(2.8rem,5vw,4.5rem)] italic text-vale mb-16 text-center leading-none">Um dia na <span className="text-caixilho">Quinta</span></h2>
          </Revelar>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-4 md:h-[60vh]">
            {/* Manhã (Maior) */}
            <div className="md:flex-[3] relative overflow-hidden group">
              <Image src="/fotos/dia-pequeno-almoco.jpg" alt="Pequeno-almoço" fill quality={100} unoptimized className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-xisto/90 via-xisto/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-cal">
                <span className="font-mono text-xs tracking-widest text-cal/70">DE MANHÃ</span>
                <h3 className="rustico-medio text-2xl mt-2 mb-2">A mesa posta com linho bordado</h3>
                <p className="text-sm text-cal/80 leading-relaxed max-w-md hidden md:block">
                  Bolos caseiros, sumo espremido, compotas e panquecas. É servido na sala de jantar e é a coisa de que os hóspedes mais falam.
                </p>
              </div>
            </div>
            
            {/* Tarde e Noite */}
            <div className="md:flex-[2] flex flex-col gap-6 md:gap-4">
              <div className="flex-1 relative overflow-hidden group min-h-[250px]">
                {/* 2/5 da linha (já com o zoom de 1,05 ao passar o rato); num ecrã alto e
                    estreito a altura (≈30vh × 1,34) pode pedir mais do que a largura. */}
                <FotoTamanhos src="/fotos/dia-alpendre.jpg" alt="Alpendre à tarde" sizes="(min-width: 768px) max(calc((min(100vw, 86rem) - 6rem) * 0.42), 42vh), calc(100vw - 3rem)" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-xisto/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-cal">
                  <span className="font-mono text-xs tracking-widest text-cal/70">FIM DA TARDE</span>
                  <h3 className="rustico-medio text-xl mt-1">O alpendre olha para o vale</h3>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden group min-h-[250px]">
                <Image src="/fotos/interior.jpg" alt="Noite" fill quality={100} unoptimized className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-xisto/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-cal">
                  <span className="font-mono text-xs tracking-widest text-cal/70">À NOITE</span>
                  <h3 className="rustico-medio text-xl mt-1">A pedra guarda o fresco</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quem recebe (Sticky com altura extra de um ecrã inteiro para a cortina cobrir tudo) */}
      <div className="relative h-[200vh] w-full bg-cal-fundo z-0">
        <section className="sticky top-0 flex h-screen w-full flex-col justify-center border-t border-granito-linha overflow-hidden">
          <div className="mx-auto w-full max-w-[86rem] px-6 md:px-10 py-12">
            <div className="grid gap-14 md:grid-cols-12 md:gap-16 items-center">
              <Revelar className="md:col-span-5">
                <figure className="relative aspect-[4/3] w-full overflow-hidden bg-xisto shadow-xl rounded-sm">
                  <Image
                    src="/fotos/dia-mesa.jpg"
                    alt="Mesa de jantar de madeira"
                    fill
                    quality={100}
                    unoptimized
                    className="object-cover opacity-95"
                  />
                </figure>
              </Revelar>

              <Revelar atraso={0.1} className="md:col-span-7">
                <p className="font-mono text-xs tracking-widest text-caixilho uppercase">Quem recebe</p>
                <h2 className="rustico-medio mt-4 text-4xl leading-[1.02] text-xisto">
                  A Teresa e o António
                </h2>
                <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-xisto-suave">
                  São eles que abrem a porta, que põem a mesa de manhã e que dizem onde vale
                  a pena ir. É a casa deles, e tratam quem chega como se fosse da família.
                </p>
                <blockquote className="mt-10 border-l border-caixilho pl-6">
                  <p className="rustico-medio text-2xl leading-snug text-xisto italic">
                    &ldquo;Tentaremos ser iguais a nós próprios se não pudermos ser melhores.&rdquo;
                  </p>
                </blockquote>
              </Revelar>
            </div>
          </div>
        </section>
      </div>

      {/* 5. Cortina Final com Foto e Call-to-Action */}
      <CortinaQuartos />
    </>
  );
}
