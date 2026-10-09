import { casa } from '@/lib/casa';

/*
  O "Ligar" sempre à mão no telemóvel, como no protótipo C: um botão
  vermelho fixo no canto de baixo. É o pedido do Diogo, converter pelo
  telemóvel. Só abaixo de 768 px.
*/
export default function BarraLigar() {
  const telefone = casa.contacto.telefone;
  if (!telefone) return null;
  return (
    <a
      href={telefone.href}
      aria-label={`Ligar para ${telefone.valor}`}
      className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-2.5 rounded-[28px] bg-vermelho px-[22px] font-semibold text-[#fbf3ec] no-underline shadow-[0_8px_24px_rgba(33,31,25,.35)] transition-transform duration-150 ease-out active:scale-[0.97] md:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="size-5">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
      </svg>
      Ligar
    </a>
  );
}
