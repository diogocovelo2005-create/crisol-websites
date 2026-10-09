import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { casa, type AcaoReserva } from '@/lib/casa';
import Botao from '@/components/Botao';

type Tom = 'ouro' | 'floresta' | 'contorno' | 'contorno-claro';

function Icone({ acao }: { acao: AcaoReserva }) {
  return acao.tipo === 'whatsapp' ? <WhatsappLogoIcon size={18} weight="regular" /> : null;
}

export function primeiraAcao() {
  return casa.acoes[0];
}

export default function AcoesReserva({ claro = false, limite = 2, tabIndex }: { claro?: boolean; limite?: number; tabIndex?: number }) {
  const acoes = casa.acoes.slice(0, limite);
  if (!acoes.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {acoes.map((acao, indice) => {
        const tom: Tom = indice === 0 ? (claro ? 'ouro' : 'floresta') : (claro ? 'contorno-claro' : 'contorno');
        return (
          <Botao key={`${acao.tipo}-${acao.href}`} href={acao.href} tom={tom} tabIndex={tabIndex}>
            <Icone acao={acao} />
            {acao.rotulo}
          </Botao>
        );
      })}
    </div>
  );
}
