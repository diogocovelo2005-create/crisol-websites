import type { Metadata } from 'next';
import Link from 'next/link';
import { casa } from '@/lib/casa';

/*
  A pagina dos quartos ainda nao existe. Por agora e so um aviso e o
  caminho de volta, que e o que o Diogo pediu. Fica fora do indice dos
  motores de busca enquanto nao tiver conteudo.

  Quando for feita, o que ela tem de contar sao as tres maneiras de
  dormir na casa: o quarto duplo, a Suite Eira (sala na antiga cozinha,
  patio e acesso ao jardim) e a Suite do Fidalgo (ultimo piso, lousa por
  fora, ate quatro pessoas). Os factos estao em dossie/quartos.md.
*/
export const metadata: Metadata = {
  title: `Os quartos | ${casa.nome}`,
  description: 'Esta página está em construção.',
  robots: { index: false, follow: true },
};

export default function Quartos() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="versalete text-ouro-escuro">Os quartos</p>
      <h1 className="mt-5 font-display text-[2.6rem] italic leading-[1.15] md:text-[3.4rem]">
        Em construção.
      </h1>
      <Link
        href="/"
        className="versalete mt-10 inline-flex items-center justify-center rounded-[2px] bg-floresta px-7 py-4 text-osso transition-colors duration-500 hover:bg-tinta"
      >
        Voltar à página inicial
      </Link>
    </main>
  );
}
