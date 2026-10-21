import type { Metadata } from "next";
import { metadados } from "@/lib/seo";
import Image from "next/image";
import { Revelar } from "@/components/Revelar";
import { HeroQuartos } from "@/components/HeroQuartos";
import { CortinaReserva } from "@/components/CortinaReserva";
import { ComodidadesRotativas } from "@/components/ComodidadesRotativas";
import { IconeWhatsapp } from "@/components/IconeWhatsapp";
import { Botao } from "@/components/Botao";
import { linkWhatsapp } from "@/lib/contactos";

export const metadata: Metadata = metadados({
  titulo: "Quartos em São Pedro do Sul",
  descricao: "Quarto Duplo, Quarto Twin e Suite, todos com casa de banho privativa e janela para o vale. A sete minutos das Termas de São Pedro do Sul.",
  caminho: "/os-quartos",
});


const fichasQuartos = [
  {
    id: "01",
    nome: "Quarto Duplo",
    cama: "Uma cama de casal",
    area: "18 m²",
    vista: "Para o jardim e montanha",
    pedido: "Perguntar pelo Duplo",
    mensagem: "Olá Teresa, gostava de saber se o Quarto Duplo está livre para as datas…",
    destaques: ["Temos dois quartos deste tipo", "Casa de banho privativa", "Silêncio absoluto à noite"],
    fotos: [
      "/fotos/quartos/quarto duplo/quarto duplo 2.jpg",
      "/fotos/quartos/quarto duplo/quarto duplo.jpg",
      "/fotos/quartos/quarto duplo/wc-duplo-filt.jpg"
    ]
  },
  {
    id: "02",
    nome: "Quarto Twin",
    cama: "Duas camas individuais",
    area: "16 m²",
    vista: "Virado para as árvores antigas",
    pedido: "Perguntar pelo Twin",
    mensagem: "Olá Teresa, gostava de saber se o Quarto Twin está livre para as datas…",
    destaques: ["Camas podem juntar-se (a pedido)", "Luz da manhã", "Decoração clássica e simples"],
    fotos: [
      "/fotos/quartos/quarto-twin.jpg",
      "/fotos/quartos/quarto twinn/wc-twin-filt.jpg"
    ]
  },
  {
    id: "03",
    nome: "As 2 Suites",
    frase: "Cada uma com uma cama de casal e dois sofás-cama.",
    vista: "Vista panorâmica sobre o vale",
    pedido: "Ver se há Suite livre",
    mensagem: "Olá Teresa, gostava de saber se uma das 2 Suites está livre para as datas…",
    destaques: ["Temos duas suites", "Ideal para famílias com filhos", "Máquina de café e frigobar"],
    fotos: [
      "/fotos/quartos/suite/quarto suite.jpg",
      "/fotos/suite-quarto.jpg",
      "/fotos/suite-wc.jpg",
      "/fotos/quartos/suite/c19df66a-6b61-4e23-876f-29ca61d00c06.jpg"
    ]
  }
];

// Fotos muito maiores do que aparecem: o browser escolhe a versão que chega ao
// ecrã. As versões vêm de scripts/tamanhos.mjs, com a mesma qualidade do original.
const versoes: Record<string, string> = {
  "/fotos/quartos/quarto duplo/wc-duplo-filt.jpg":
    "/fotos/tamanhos/wc-duplo-1280.jpg 1280w, /fotos/tamanhos/wc-duplo-1920.jpg 1920w, /fotos/quartos/quarto%20duplo/wc-duplo-filt.jpg 3072w",
};

export default function PaginaOsQuartos() {
  return (
    <>
      <div id="inicio" className="absolute top-0 w-full" />
      {/* 1. Hero: Duas maneiras de ficar */}
      <HeroQuartos />

        {/* 3. As fichas dos quartos (deslizam por cima do hero como cortina) */}
        <section className="relative z-20 -mt-[100vh] min-h-screen bg-cal">
        {fichasQuartos.map((quarto, index) => (
          <article 
            id={`quarto-${quarto.id}`} 
            key={quarto.id} 
            className={`border-b border-granito-linha py-24 md:py-32 ${index % 2 === 1 ? 'bg-cal-fundo' : 'bg-cal'}`}
          >
            <div className="mx-auto max-w-[86rem] px-6 md:px-10">
              <div className="flex flex-col md:flex-row md:items-start gap-12 lg:gap-24">
                
                {/* Coluna fixa à esquerda */}
                <div className="md:sticky md:top-32 md:w-[22rem] shrink-0">
                  <span className="font-mono text-sm tracking-widest text-caixilho">({quarto.id})</span>
                  <h2 className="rustico-medio mt-4 text-4xl text-xisto md:text-5xl">{quarto.nome.split(/(\d)/).map((parte, k) =>
                    /^\d$/.test(parte) ? <span key={k} className="text-caixilho">{parte}</span> : parte
                  )}</h2>
                  {"frase" in quarto && (
                    <p className="rustico-medio mt-5 border-l-2 border-caixilho pl-4 text-xl italic leading-snug text-xisto md:text-2xl">
                      {quarto.frase}
                    </p>
                  )}

                  <dl className="mt-10 space-y-6 text-sm text-xisto-suave">
                    {"cama" in quarto && (
                      <div>
                        <dt className="font-semibold text-xisto-medio mb-1">Cama</dt>
                        <dd>{quarto.cama}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold text-xisto-medio mb-1">{"area" in quarto ? "Área e Vista" : "Vista"}</dt>
                      <dd>{"area" in quarto ? `${quarto.area} · ${quarto.vista}` : quarto.vista}</dd>
                    </div>
                  </dl>

                  <ul className="mt-10 space-y-3 text-sm text-xisto-suave">
                    {quarto.destaques.map((destaque, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-caixilho">·</span> {destaque}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-12">
                    <Botao
                      href={linkWhatsapp(quarto.mensagem)}
                      target="_blank"
                      rel="noreferrer"
                      variante="cheio"
                      className="w-full max-w-[22rem] justify-between md:px-7 md:py-5"
                    >
                      <span className="flex items-center gap-3">
                        <IconeWhatsapp className="h-5 w-5 shrink-0" />
                        {quarto.pedido}
                      </span>
                    </Botao>
                  </div>
                </div>

                {/* Coluna direita que faz scroll (efeito cortina entre imagens) */}
                {/* @container: a altura da foto depende da largura da coluna (cqw), e a
                    margem precisa dela para cada foto entrar pelo fundo do ecrã logo
                    depois de a anterior prender, com 20vh de pausa. Conta:
                    100vh + pausa - topo do sticky (8rem) - altura da foto. */}
                <div className="@container flex-1 pb-[20vh]">
                  {quarto.fotos.map((foto, i) => (
                    <div
                      key={i}
                      className={`sticky top-32 w-full ${i > 0 ? 'mt-[max(2rem,calc(120vh-8rem-75cqw))] md:mt-[max(2rem,calc(120vh-8rem-66.667cqw))]' : ''}`}
                      style={{ zIndex: 10 + i }}
                    >
                      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-granito-fundo md:aspect-[3/2] shadow-2xl">
                        {versoes[foto] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={foto}
                            srcSet={versoes[foto]}
                            sizes="(min-width: 768px) 60vw, 100vw"
                            alt={`${quarto.nome} - Vista ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={foto}
                            alt={`${quarto.nome} - Vista ${i + 1}`}
                            fill
                            quality={100}
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </figure>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </article>
        ))}
      </section>

        {/* 5. Em todos os quartos */}
      <ComodidadesRotativas />

      {/* 7. Antes de reservar (FAQ) presa para fazer o efeito de cortina */}
      <div className="relative h-[200vh] w-full bg-cal-fundo z-0">
        <section className="sticky top-0 flex min-h-screen w-full flex-col justify-center py-24 md:py-32">
          <div className="mx-auto max-w-[42rem] px-6 text-center md:px-10 w-full">
            <h2 className="rustico-medio text-titulo-pequeno leading-snug text-xisto mb-12">
              Antes de fazer as malas
            </h2>
            <div className="text-left divide-y divide-granito-linha border-y border-granito-linha bg-cal-fundo">
              <details className="group py-6" name="faq">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-xisto marker:content-none hover:text-caixilho">
                  A que horas posso chegar?
                  <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-granito-linha text-xisto transition-transform group-open:rotate-180">+</span>
                </summary>
                <div className="mt-4 pr-12 text-xisto-suave leading-relaxed">
                  O check-in é feito entre as 15h00 e as 21h00, e o check-out até às 11h00. Se precisar de horários diferentes, avise-nos com antecedência para tentarmos acomodar.
                </div>
              </details>
              <details className="group py-6" name="faq">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-xisto marker:content-none hover:text-caixilho">
                  Como funciona o pequeno-almoço?
                  <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-granito-linha text-xisto transition-transform group-open:rotate-180">+</span>
                </summary>
                <div className="mt-4 pr-12 text-xisto-suave leading-relaxed">
                  O pequeno-almoço é servido na sala de jantar da casa principal, habitualmente entre as 8h30 e as 10h30. Tem o custo de 8€ por pessoa e inclui pão fresco, bolos caseiros, fruta da época e compotas feitas na quinta. Pode pedi-lo à chegada.
                </div>
              </details>
              <details className="group py-6" name="faq">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-xisto marker:content-none hover:text-caixilho">
                  Têm estacionamento?
                  <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-granito-linha text-xisto transition-transform group-open:rotate-180">+</span>
                </summary>
                <div className="mt-4 pr-12 text-xisto-suave leading-relaxed">
                  Sim, temos um parque de estacionamento privativo e gratuito dentro da propriedade, muito perto das portas dos quartos.
                </div>
              </details>
              <details className="group py-6" name="faq">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-xisto marker:content-none hover:text-caixilho">
                  Aceitam animais de estimação?
                  <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-granito-linha text-xisto transition-transform group-open:rotate-180">+</span>
                </summary>
                <div className="mt-4 pr-12 text-xisto-suave leading-relaxed">
                  Sim, os animais de estimação são bem-vindos na Quinta de Canhões, mediante pedido prévio. Podem aplicar-se custos adicionais.
                </div>
              </details>
            </div>
            <p className="mt-10 text-sm text-xisto-suave">
              Outra pergunta?{" "}
              <a
                href={linkWhatsapp()}
                target="_blank"
                rel="noreferrer"
                className="sublinha text-caixilho"
              >
                Escreva à Teresa
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* 8. Cortina Final (CTA animado e colorido) */}
      <CortinaReserva />
    </>
  );
}




