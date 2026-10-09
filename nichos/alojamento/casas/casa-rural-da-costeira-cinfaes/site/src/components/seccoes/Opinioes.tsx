import Revelar from '@/components/Revelar';

/* O que dizem os hóspedes (pedido do Diogo, 08/10): antes do contacto,
   numa faixa de musgo, para não ficar pesada entre o papel de «À volta» e
   o plano do fecho. As citações entram uma a uma (Revelar, desencontradas):
   são três vozes, cada uma a falar na sua vez. Três citações em português do contrato (CIT-15,
   CIT-04, CIT-08), nenhuma repetida noutra secção, e as notas das
   plataformas com a fonte e a data. */
const citacoes = [
  { texto: 'num espaço acolhedor onde impera o sossego.', quem: 'D · Airbnb' },
  { texto: 'Um lugar perfeito para passar um fim de semana ou mesmo uma semana com amigos!', quem: 'Sara · Airbnb' },
  { texto: 'Tiago nos recebeu muito bem e deu todas as instruções sobre a casa e arredores.', quem: 'Carolina · Airbnb' },
];

export default function Opinioes() {
  return (
    <section id="opinioes" aria-labelledby="opinioes-titulo" className="scroll-mt-20 bg-musgo py-[72px] text-osso md:py-[88px]">
      <div className="moldura">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="rotulo text-liquen">Quem lá ficou</p>
            <h2 id="opinioes-titulo" className="titulo mt-[18px]" style={{ ['--titulo' as string]: 'clamp(2.4rem, 4.6vw, 4.6rem)' }}>
              O que dizem <em>os hóspedes</em>
            </h2>
          </div>
          <dl className="m-0 grid gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-[0.75rem] font-medium uppercase tracking-[0.24em] text-liquen">Airbnb</dt>
              <dd className="m-0">4,88 em 5, com 25 avaliações (lido em outubro de 2026)</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="text-[0.75rem] font-medium uppercase tracking-[0.24em] text-liquen">Google</dt>
              <dd className="m-0">4,8 em 5, com 49 críticas (lido em outubro de 2026)</dd>
            </div>
          </dl>
        </div>

        <ul className="m-0 mt-14 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-12">
          {citacoes.map((c, i) => (
            <li key={c.quem} className="border-t border-linha-clara pt-7">
              <Revelar atraso={i * 0.025}>
              <blockquote className="m-0">
                <p className="m-0 max-w-[24ch] font-display text-[clamp(1.6rem,2.2vw,2rem)] italic leading-[1.18]">“{c.texto}”</p>
                <cite className="citacao-cite mt-5 text-liquen">{c.quem}</cite>
              </blockquote>
              </Revelar>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
