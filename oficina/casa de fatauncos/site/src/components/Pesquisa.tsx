'use client';

import { ArrowRightIcon, CaretDownIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr';

/*
  Barra de pesquisa do fecho: chegada, partida e pessoas, e o botao leva ao
  Booking ja com essas datas e esse numero de adultos (pedido do Diogo,
  2026-10-01). Sem datas, o Booking abre na pagina da casa e pede-as la.

  O fecho desenha o texto duas vezes (copia escura por baixo, copia clara
  recortada por cima), por isso o estado vive no Fecho e as duas barras
  mostram o mesmo. A barra e opaca: e igual nas duas copias, so a de baixo
  sai da ordem do teclado (foco = -1).

  As datas sao o input nativo, transparente por cima do rotulo: no telemovel
  abre o calendario do sistema, que e o que as pessoas ja sabem usar.
*/

export type Escolha = { chegada: string; partida: string; adultos: number };

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MAX_ADULTOS = 20;

function mostrar(iso: string) {
  if (!iso) return 'Escolher data';
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1]} ${a}`;
}

function diaSeguinte(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function ligacaoBooking(base: string, { chegada, partida, adultos }: Escolha) {
  const q = new URLSearchParams({
    group_adults: String(adultos),
    req_adults: String(adultos),
    group_children: '0',
    no_rooms: '1',
  });
  if (chegada && partida) {
    q.set('checkin', chegada);
    q.set('checkout', partida);
  }
  return `${base}?${q}`;
}

function Data({
  rotulo,
  valor,
  min,
  aoMudar,
  foco,
}: {
  rotulo: string;
  valor: string;
  min?: string;
  aoMudar: (v: string) => void;
  foco?: number;
}) {
  return (
    <label className="relative flex min-w-0 flex-1 cursor-pointer flex-col gap-1 px-5 py-3.5 md:px-7 md:py-4">
      <span className="text-[0.78rem] text-tinta-medio">{rotulo}</span>
      <span className="flex items-center justify-between gap-2 text-[1rem] font-medium text-tinta md:text-[1.08rem]">
        <span className="truncate">{mostrar(valor)}</span>
        <CaretDownIcon size={15} className="shrink-0 text-tinta-medio" />
      </span>
      <input
        type="date"
        value={valor}
        min={min}
        tabIndex={foco}
        aria-label={rotulo}
        onChange={(e) => aoMudar(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {}
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}

export default function Pesquisa({
  escolha,
  mudar,
  base,
  hoje,
  foco,
}: {
  escolha: Escolha;
  mudar: (e: Escolha) => void;
  base: string;
  hoje: string;
  foco?: number;
}) {
  const { chegada, partida, adultos } = escolha;

  const novaChegada = (v: string) => {
    // a partida nunca fica antes da chegada: se ficasse, passa para o dia seguinte
    const p = partida && v && partida <= v ? diaSeguinte(v) : partida;
    mudar({ ...escolha, chegada: v, partida: p });
  };

  const contador =
    'flex size-8 items-center justify-center rounded-full border border-linha text-tinta transition-colors hover:border-tinta/50 disabled:opacity-35 disabled:hover:border-linha';

  return (
    <div className="w-full max-w-[1000px] rounded-[2px] bg-osso text-tinta shadow-[0_18px_40px_-18px_rgba(17,26,20,0.45)]">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="flex divide-x divide-linha border-b border-linha md:flex-[2] md:border-b-0 md:border-r">
          <Data rotulo="Chegada" valor={chegada} min={hoje} aoMudar={novaChegada} foco={foco} />
          <Data
            rotulo="Partida"
            valor={partida}
            min={chegada ? diaSeguinte(chegada) : hoje}
            aoMudar={(v) => mudar({ ...escolha, partida: v })}
            foco={foco}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 px-5 py-3.5 md:px-7 md:py-4">
          <span className="text-[0.78rem] text-tinta-medio">Pessoas</span>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={contador}
              tabIndex={foco}
              aria-label="Menos um adulto"
              disabled={adultos <= 1}
              onClick={() => mudar({ ...escolha, adultos: adultos - 1 })}
            >
              <MinusIcon size={13} />
            </button>
            <span className="text-[1rem] font-medium md:text-[1.08rem]" aria-live="polite">
              {adultos} {adultos === 1 ? 'adulto' : 'adultos'}
            </span>
            <button
              type="button"
              className={contador}
              tabIndex={foco}
              aria-label="Mais um adulto"
              disabled={adultos >= MAX_ADULTOS}
              onClick={() => mudar({ ...escolha, adultos: adultos + 1 })}
            >
              <PlusIcon size={13} />
            </button>
          </div>
        </div>

        <div className="p-2 md:flex md:items-center md:p-2.5">
          <a
            href={ligacaoBooking(base, escolha)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={foco}
            className="versalete madeira flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-[2px] bg-ouro px-7 py-4 text-osso transition-colors duration-200 hover:bg-[#5e4438] active:translate-y-px md:h-full"
          >
            Ver disponibilidade
            <ArrowRightIcon size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
