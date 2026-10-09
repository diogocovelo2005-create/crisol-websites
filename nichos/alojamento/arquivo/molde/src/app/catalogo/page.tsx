import type { Metadata } from 'next';
import Catalogo from '@/components/variantes/Catalogo';

// Laboratório visual do molde. Reúne protótipos de todas as secções, permite
// avaliá-los no navegador e exportar as decisões. Não entra no site do cliente.
export const metadata: Metadata = {
  title: 'Laboratório de protótipos',
  robots: { index: false, follow: false },
};

export default function PaginaCatalogo() {
  return <Catalogo />;
}
