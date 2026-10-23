type Comodidade = {
  titulo: string;
  detalhe: string;
  icone: "banho" | "ar" | "calor" | "silencio" | "tv" | "wifi" | "frio" | "cha" | "roupao" | "carro";
};

const comodidades: Comodidade[] = [
  { titulo: "Casa de banho privativa", detalhe: "Em todos os quartos", icone: "banho" },
  { titulo: "Ar condicionado", detalhe: "Para noites mais frescas", icone: "ar" },
  { titulo: "Aquecimento", detalhe: "Conforto em qualquer estação", icone: "calor" },
  { titulo: "Insonorização", detalhe: "O vale fica do lado de fora", icone: "silencio" },
  { titulo: "Wi-Fi gratuito", detalhe: "Em toda a casa", icone: "wifi" },
  { titulo: "Televisão", detalhe: "Ecrã plano no quarto", icone: "tv" },
  { titulo: "Frigorífico", detalhe: "Para ter o essencial por perto", icone: "frio" },
  { titulo: "Chaleira elétrica", detalhe: "Um chá a qualquer hora", icone: "cha" },
  { titulo: "Roupão e secador", detalhe: "Pequenos confortos incluídos", icone: "roupao" },
  { titulo: "Estacionamento à porta", detalhe: "Chega-se sem complicações", icone: "carro" },
];

function Icone({ nome }: { nome: Comodidade["icone"] }) {
  const comum = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (nome) {
    case "banho": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M4 12h16v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5Zm2 8v2m10-2v2M7 12V8a2 2 0 1 1 4 0v4" /></svg>;
    case "ar": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M4 8h10c3 0 3-4 0-4-1.5 0-2.5 1-2.5 2.5M4 12h15c2.5 0 2.5 4 0 4h-5c-2 0-2 4 0 4" /></svg>;
    case "calor": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M8 4c-2 2-2 4 0 6s2 4 0 6m4-12c-2 2-2 4 0 6s2 4 0 6m4-12c-2 2-2 4 0 6s2 4 0 6M5 20h14" /></svg>;
    case "silencio": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M5 10v4m4-7v10m4-13v16m4-10v4" /></svg>;
    case "wifi": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M3.5 9.5a13 13 0 0 1 17 0M6.5 13a8.5 8.5 0 0 1 11 0m-8 3.5a4 4 0 0 1 5 0M12 20h.01" /></svg>;
    case "tv": return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...comum} x="3" y="5" width="18" height="12" rx="1" /><path {...comum} d="M8 21h8M12 17v4" /></svg>;
    case "frio": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M12 3v18m-6.4-14.3 12.8 10.6m0-10.6L5.6 17.3M4 12h16" /></svg>;
    case "cha": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="M4 11h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5Zm12 2h2a2 2 0 0 1 0 4h-2M8 7c0-1 1-1.5 1-3m4 3c0-1 1-1.5 1-3" /></svg>;
    case "roupao": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="m8 4 4 3 4-3 4 5-3 2v9H7v-9L4 9l4-5Zm0 16 4-6 4 6" /></svg>;
    case "carro": return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...comum} d="m5 11 1.5-4h11l1.5 4M4 11h16v7H4v-7Zm3 7v2m10-2v2M7 14h.01M17 14h.01" /></svg>;
  }
}

function Cartoes({ esconder }: { esconder?: boolean }) {
  return (
    <ul aria-hidden={esconder} className="flex shrink-0 gap-4 pr-4">
      {comodidades.map((item) => (
        <li key={item.titulo} className="w-48 shrink-0 rounded-2xl border border-cal/10 bg-vale-claro/70 p-5 sm:w-56">
          <div className="h-6 w-6 text-cal/70 [&>svg]:h-full [&>svg]:w-full"><Icone nome={item.icone} /></div>
          <h3 className="rustico-medio mt-6 text-lg leading-snug text-cal">{item.titulo}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-cal/60">{item.detalhe}</p>
        </li>
      ))}
    </ul>
  );
}

export function ComodidadesRotativas() {
  return (
    <section className="overflow-hidden bg-vale py-20 text-cal md:py-28">
      <div className="mx-auto max-w-[86rem] px-6 text-center md:px-10">
        <p className="etiqueta text-cal/55">Em todos os quartos</p>
        <h2 className="rustico mx-auto mt-5 max-w-[17ch] text-titulo leading-[1.02]">Tudo o que precisa para descansar.</h2>
      </div>
      <div className="faixa-comodidades mt-12 overflow-hidden md:mt-16">
        <div className="carrossel-comodidades flex w-max"><Cartoes /><Cartoes esconder /></div>
      </div>
    </section>
  );
}
