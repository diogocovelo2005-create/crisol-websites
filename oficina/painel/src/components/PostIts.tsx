"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { anexarFicheiro, associarNota, criarNota, guardarNota, moverNota, removerAnexo, type ContextoNota } from "@/app/acoes";
import type { CamposNota, Nota as TNota } from "@/lib/notas-comum";
import { apagarComDesfazer, AvisoDesfazer, juntarNotas, Nota } from "./Nota";

/** Post-its soltos: no quadro de um nicho ou na página de um projeto. */
export function PostIts({ contexto, iniciais }: { contexto: ContextoNota; iniciais: TNota[] }) {
  const [notas, setNotas] = useState(iniciais);
  const [nova, setNova] = useState<string | null>(null);
  const [aCriar, iniciarCriar] = useTransition();
  const [, iniciar] = useTransition();
  const router = useRouter();

  // O quadro refresca sozinho: acolhe as notas que chegam de fora (ex.: soltas
  // de uma pilha) e larga as que saíram, sem perder o que está a ser editado.
  useEffect(() => setNotas((atuais) => juntarNotas(atuais, iniciais)), [iniciais]);

  function patch(id: string, alteracao: Partial<TNota>) {
    setNotas((ns) => ns.map((n) => (n.id === id ? { ...n, ...alteracao } : n)));
  }

  function criar() {
    iniciarCriar(async () => {
      const nota = await criarNota(contexto, "media");
      setNotas((ns) => [...ns, nota]);
      setNova(nota.id);
    });
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {notas.map((n) => (
        <Solta
          key={n.id}
          nota={n}
          autoFoco={n.id === nova}
          onAssociar={
            "nicho" in contexto
              ? (projetoId) => {
                  setNotas((ns) => ns.filter((x) => x.id !== n.id));
                  iniciar(async () => {
                    await associarNota(n.id, projetoId);
                    router.refresh();
                  });
                }
              : undefined
          }
          onMover={(x, y) => {
            patch(n.id, { pos_x: x, pos_y: y });
            iniciar(() => moverNota(n.id, x, y));
          }}
          onGuardar={(campos) => {
            patch(n.id, campos);
            iniciar(() => guardarNota(n.id, campos));
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
      ))}

      <button
        type="button"
        onClick={criar}
        disabled={aCriar}
        aria-label="Nova nota"
        title="Nova nota"
        className="pointer-events-auto fixed bottom-6 right-6 z-20 flex h-12 items-center gap-2 rounded-full bg-tinta pl-4 pr-5 text-[14px] font-semibold text-cartao shadow-cartao-hover transition-[transform,opacity] duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-60"
      >
        <PlusIcon size={18} weight="bold" /> Nota
      </button>

      <AvisoDesfazer />
    </div>
  );
}

/** Uma nota no sítio dela: posição, rotação, e arrastar pela faixa de cima. */
function Solta({
  nota,
  autoFoco,
  onAssociar,
  onMover,
  ...resto
}: {
  nota: TNota;
  autoFoco: boolean;
  onAssociar?: (projetoId: string) => void;
  onMover: (x: number, y: number) => void;
  onGuardar: (campos: CamposNota) => void;
  onApagar: () => void;
  onAnexo: (f: File) => void;
  onRemoverAnexo: (caminho: string) => void;
}) {
  const [pos, setPos] = useState({ x: nota.pos_x, y: nota.pos_y });
  const [aArrastar, setAArrastar] = useState(false);
  const [sobreCartao, setSobreCartao] = useState(false);
  const [foco, setFoco] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  function arrastar(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
    const pai = raiz.current!.offsetParent as HTMLElement;
    const rect = pai.getBoundingClientRect();
    const inicioX = e.clientX;
    const inicioY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    setAArrastar(true);
    let atual = pos;
    let alvo: HTMLElement | null = null;
    let moveu = false; // um clique na faixa, sem arrastar, não prende a nota

    // Largar a nota em cima de um cartão prende-a a esse projeto.
    function cartaoSob(ev: PointerEvent): HTMLElement | null {
      if (!onAssociar || !moveu) return null;
      for (const el of document.elementsFromPoint(ev.clientX, ev.clientY)) {
        if (raiz.current?.contains(el)) continue;
        const c = (el as HTMLElement).closest<HTMLElement>("[data-projeto-id]");
        if (c) return c;
      }
      return null;
    }

    function mover(ev: PointerEvent) {
      if (Math.hypot(ev.clientX - inicioX, ev.clientY - inicioY) > 5) moveu = true;
      const dx = ((ev.clientX - inicioX) / rect.width) * 100;
      const dy = ((ev.clientY - inicioY) / rect.height) * 100;
      atual = { x: Math.min(94, Math.max(0, origX + dx)), y: Math.min(94, Math.max(0, origY + dy)) };
      setPos(atual);
      const novo = cartaoSob(ev);
      if (novo !== alvo) {
        alvo?.removeAttribute("data-alvo-nota");
        novo?.setAttribute("data-alvo-nota", "");
        alvo = novo;
        setSobreCartao(!!novo);
      }
    }
    function soltar() {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
      setAArrastar(false);
      setSobreCartao(false);
      if (alvo && onAssociar) {
        alvo.removeAttribute("data-alvo-nota");
        onAssociar(alvo.dataset.projetoId!);
        return;
      }
      if (atual.x !== origX || atual.y !== origY) onMover(atual.x, atual.y);
    }
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
  }

  // Pegar levanta (direita, um pouco maior); em cima de um cartão encolhe,
  // para se ver que vai lá para dentro; em foco endireita-se para se ler.
  const escala = sobreCartao ? 0.8 : aArrastar ? 1.04 : 1;
  const rotacao = aArrastar || foco ? 0 : nota.rotacao;

  return (
    <div
      ref={raiz}
      onFocus={() => setFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFoco(false);
      }}
      className={`pointer-events-auto absolute w-[248px] ${aArrastar ? "select-none" : ""}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `rotate(${rotacao}deg) scale(${escala})`,
        transformOrigin: "50% 18px",
        transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms",
        opacity: sobreCartao ? 0.85 : 1,
        zIndex: aArrastar ? 30 : foco ? 20 : 5,
      }}
    >
      <Nota nota={nota} pega={arrastar} levantada={aArrastar} autoFoco={autoFoco} {...resto} />
    </div>
  );
}
