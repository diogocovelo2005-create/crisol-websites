import { casa, canais } from '@/lib/casa';
import PortaoExpande from '@/components/PortaoExpande';

/*
  7 · Falta só escolher as datas. O fecho e o pedido do Diogo: converter
  no telemóvel, com o "Ligar" como gesto principal. O número em grande é
  o botão, como no protótipo C.

  Pedido do Diogo a 2026-10-09: o Reservar fica com a foto do portão de
  fundo. O título, a frase, o número e os canais entram sobre o portão
  depois de sair a legenda dele (PortaoExpande). Sobre a foto, o texto
  passa a osso (o vermelho não se lia no escuro). A lotação, o email, a
  morada e o registo ficam por baixo, numa faixa de linho.
*/
export default function Reservar() {
  const { telefone, email, morada, registo } = casa.contacto;

  const linhas = [
    <h2 key="t" className="titulo-seccao max-w-[12ch]">
      Falta só escolher <em>as datas.</em>
    </h2>,
    <p key="f" className="mt-[22px] max-w-[40ch] text-[1.08rem]">
      Liguem para perguntar pelas datas livres, ou reservem pelo Booking, pelo Airbnb ou pelo Vrbo.
    </p>,
    telefone ? (
      <a key="n" href={telefone.href} className="group mt-9 block w-fit no-underline">
        <small className="block text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-osso/90">Ligar</small>
        <b className="mt-1.5 block w-fit border-b-2 border-osso pb-2.5 font-display text-[clamp(2.6rem,6.4vw,5.6rem)] font-normal leading-none tracking-[-0.02em] text-osso transition-colors duration-200 group-hover:text-ouro">
          {telefone.valor}
        </b>
      </a>
    ) : null,
    <div key="c" className="mt-7 flex flex-wrap gap-x-7 gap-y-2 text-[1.05rem]">
      {canais.map((c) => (
        <a key={c.nome} href={c.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center py-2.5 underline underline-offset-[5px]">
          {c.nome}
        </a>
      ))}
    </div>,
  ];

  return (
    <section id="contacto" className="bg-linho-escuro pb-24 md:pb-20">
      <PortaoExpande passagem="Agora é a vossa vez." linhas={linhas} />

      <div className="caixa grid gap-3.5 pt-12 text-[0.98rem] text-tinta-medio md:grid-cols-2 md:gap-x-10 lg:grid-cols-4">
        <p>No Booking, no Airbnb e no Vrbo, as reservas são para até 6 pessoas.</p>
        {email && (
          <a href={email.href} className="flex min-h-11 items-start text-tinta [overflow-wrap:anywhere]">
            {email.valor}
          </a>
        )}
        {morada && <p>{morada}</p>}
        {registo && (
          <p>
            {registo.tipo} {registo.numero}
          </p>
        )}
      </div>
    </section>
  );
}
