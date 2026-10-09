import type { Metadata } from 'next';
import Link from 'next/link';
import { casa } from '@/lib/casa';

export const metadata: Metadata = {
  title: `Os quartos | ${casa.nome}`,
};

export default function PaginaQuartos() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-3xl text-tinta sm:text-4xl">Página em construção</p>
      <p className="max-w-md text-tinta-medio">
        Estamos a preparar a apresentação dos quartos da {casa.nome}. Volte em breve.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-tinta px-6 py-3 text-sm font-medium text-osso transition-opacity hover:opacity-90"
      >
        Voltar à página inicial
      </Link>
    </main>
  );
}
