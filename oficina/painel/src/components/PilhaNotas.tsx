"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckSquareIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { anexarFicheiro, criarNota, guardarNota, removerAnexo, soltarNota } from "@/app/acoes";
import { COR, ordenarNotas, resumoNota, type Nota as TNota } from "@/lib/notas-comum";
import { apagarComDesfazer, juntarNotas, Nota } from "./Nota";

type Posicao = { left: number; top?: number; bottom?: number; maxH: number };
const LARGURA = 300;

/**
 * As notas de um AL, presas ao cartão como uma pilha de papéis: fechada mostra
 * só a de cima (a mais prioritária), o progresso da checklist e quantas há;
 * aberta mostra todas, completas, por ordem de prioridade.
 */
export function PilhaNotas({ projetoId, nicho, nome, iniciais }: { projetoId: string; nicho: string; nome: string; iniciais: TNota[] }) {
  const [notas, setNotas] = useState(iniciais);
  const [aberta, setAberta] = useState(false);
  const [nova, setNova] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [aCriar, iniciarCriar] = useTransition();
  const [, iniciar] = useTransition();
  const router = useRouter();
  const raiz = useRef<HTMLDivElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => setNotas((atuais) => juntarNotas(atuais, iniciais)), [iniciais]);

  // Fecha ao clicar fora ou com Esc.
  useEffect(() => {
    if (!aberta) {
      setNova(null);
      return;
    }
    const fora = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (raiz.current?.contains(alvo) || painel.current?.contains(alvo)) return;
      if ((alvo as HTMLElement).closest?.("[role=status]")) return; // o "Desfazer"
      setAberta(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    window.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", esc);
    };
  }, [aberta]);

  // O painel vive por cima de tudo (fora da coluna, que tem scroll), colado
  // por baixo do cartão; se não houver espaço em baixo, abre para cima.
  useLayoutEffect(() => {
    if (!aberta) return;
    const calcular = () => {
      const r = raiz.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - LARGURA - 8);
      const baixo = window.innerHeight - r.bottom - 16;
      const cima = r.top - 16;
      setPosicao(
        baixo >= 360 || baixo >= cima
          ? { left, top: r.bottom + 8, maxH: Math.min(560, baixo) }
          : { left, bottom: window.innerHeight - r.top + 8, maxH: Math.min(560, cima) },
      );
    };
    calcular();
    window.addEventListener("scroll", calcular, true);
    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("scroll", calcular, true);
      window.removeEventListener("resize", calcular);
    };
  }, [aberta]);

  const lista = ordenarNotas(notas);
  const topo = lista[0];

  function patch(id: string, alteracao: Partial<TNota>) {
    setNotas((ns) => ns.map((n) => (n.id === id ? { ...n, ...alteracao } : n)));
  }

  function criar() {
    setAberta(true);
    iniciarCriar(async () => {
      const nota = await criarNota({ projetoId }, "media");
      setNotas((ns) => [...ns, nota]);
      setNova(nota.id);
      router.refresh();
    });
  }

  return (
    <div ref={raiz} className="relative">
      {topo ? <PilhaFechada lista={lista} nome={nome} aberta={aberta} onAlternar={() => setAberta((v) => !v)} /> : (
        <button
          type="button"
          onClick={criar}
          className="mt-1 flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] text-tinta-3 opacity-0 transition-[opacity,background-color,color] duration-150 hover:bg-black/5 hover:text-tinta focus-visible:opacity-100 active:bg-black/10 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <PlusIcon size={12} weight="bold" /> nota
        </button>
      )}

      {aberta &&
        posicao &&
        createPortal(
          <div
            ref={painel}
            role="dialog"
            aria-label={`Notas de ${nome}`}
            className="aparecer fixed z-40 flex flex-col rounded-xl border border-linha bg-cartao shadow-cartao-hover"
            style={{ left: posicao.left, top: posicao.top, bottom: posicao.bottom, width: LARGURA, maxHeight: posicao.maxH }}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-linha pl-3.5 pr-1">
              <p className="truncate text-[13px] font-semibold">
                {nome} <span className="font-normal text-tinta-3">· {lista.length}</span>
              </p>
              <button
                type="button"
                onClick={() => setAberta(false)}
                aria-label="Fechar"
                className="grid size-9 place-items-center rounded-md text-tinta-3 transition-colors duration-150 hover:bg-fundo hover:text-tinta active:bg-linha"
              >
                <XIcon size={16} />
              </button>
            </div>

            <ul className="flex min-h-0 flex-col gap-2.5 overflow-y-auto overscroll-contain bg-fundo/60 p-2.5">
              {lista.map((n) => (
                <li key={n.id}>
                  <Nota
                    nota={n}
                    autoFoco={n.id === nova}
                    onGuardar={(campos) => {
                      patch(n.id, campos);
                      iniciar(() => guardarNota(n.id, campos));
                    }}
                    onSoltar={() => {
                      setNotas((ns) => ns.filter((x) => x.id !== n.id));
                      iniciar(async () => {
                        await soltarNota(n.id, nicho);
                        router.refresh();
                      });
                    }}
                    onApagar={() => {
                      setNotas((ns) => ns.filter((x) => x.id !== n.id));
                      apagarComDesfazer(n, () => setNotas((ns) => (ns.some((x) => x.id === n.id) ? ns : [...ns, n])));
                    }}
                    onAnexo={(ficheiro) => {
                      iniciar(async () => {
                        const fd = new FormData();
                        fd.set("ficheiro", ficheiro);
                        const anexo = await anexarFicheiro(n.id, fd);
                        if (anexo) setNotas((ns) => ns.map((x) => (x.id === n.id ? { ...x, anexos: [...x.anexos, anexo] } : x)));
                      });
                    }}
                    onRemoverAnexo={(caminho) => {
                      setNotas((ns) => ns.map((x) => (x.id === n.id ? { ...x, anexos: x.anexos.filter((a) => a.caminho !== caminho) } : x)));
                      iniciar(() => removerAnexo(n.id, caminho));
                    }}
                  />
                </li>
              ))}
              {!lista.length && <li className="px-1 py-3 text-center text-[13px] text-tinta-3">Sem notas.</li>}
            </ul>

            <div className="shrink-0 border-t border-linha p-2">
              <button
                type="button"
                onClick={criar}
                disabled={aCriar}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tinta-3/60 text-[13px] font-medium text-tinta-2 transition-[background-color,color,transform] duration-150 hover:border-tinta-2 hover:bg-fundo hover:text-tinta active:scale-[0.98] disabled:opacity-60"
              >
                <PlusIcon size={14} weight="bold" /> Nova nota
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** A pilha fechada, colada ao cartão: a nota de cima e as outras a espreitar por trás. */
function PilhaFechada({ lista, nome, aberta, onAlternar }: { lista: TNota[]; nome: string; aberta: boolean; onAlternar: () => void }) {
  const topo = lista[0];
  const resumo = resumoNota(topo);
  const feitos = topo.itens.filter((i) => i.feito).length;

  return (
    <button
      type="button"
      onClick={onAlternar}
      aria-expanded={aberta}
      aria-label={`Notas de ${nome} (${lista.length})`}
      className="group/pilha relative mt-2 block w-full text-left"
    >
      {lista.length > 2 && <span className="absolute inset-x-2 -bottom-[7px] h-full rounded-md bg-papel shadow-cartao brightness-[0.97]" />}
      {lista.length > 1 && <span className="absolute inset-x-1 -bottom-[3.5px] h-full rounded-md bg-papel shadow-cartao brightness-[0.985]" />}
      <span
        className={`relative block overflow-hidden rounded-md bg-papel py-2 pl-3.5 pr-2.5 transition-[box-shadow,transform] duration-150 group-hover/pilha:-translate-y-px group-hover/pilha:shadow-cartao-hover group-active/pilha:translate-y-0 group-active/pilha:scale-[0.98] ${
          aberta ? "shadow-cartao-hover" : "shadow-cartao"
        }`}
      >
        <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: COR[topo.prioridade] }} />
        <span className={`letra-nota line-clamp-2 leading-snug text-papel-texto ${topo.titulo.trim() ? "text-[14.5px] font-bold" : "text-[14px]"}`}>
          {resumo || <span className="text-papel-texto-2">Nota vazia</span>}
        </span>
        {(topo.itens.length > 0 || lista.length > 1) && (
          <span className="mt-1 flex items-center gap-2.5 text-[11px] font-medium text-papel-texto-2">
            {topo.itens.length > 0 && (
              <span className="num flex items-center gap-1">
                <CheckSquareIcon size={13} />
                {feitos}/{topo.itens.length}
              </span>
            )}
            {lista.length > 1 && (
              <span className="ml-auto">
                +{lista.length - 1} {lista.length === 2 ? "nota" : "notas"}
              </span>
            )}
          </span>
        )}
      </span>
    </button>
  );
}
