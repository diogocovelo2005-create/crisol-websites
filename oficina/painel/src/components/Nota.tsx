"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CheckSquareIcon,
  DotsSixIcon,
  PaperclipIcon,
  PlusIcon,
  TextTIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { apagarNota } from "@/app/acoes";
import { COR, NOME, PRIORIDADES, type CamposNota, type ItemChecklist, type Nota as TNota, type Prioridade } from "@/lib/notas-comum";

// Uma só nota, igual no quadro, na pilha aberta do cartão e na página do
// projeto. Quem a usa trata do sítio onde ela vive (posição, arrastar, lista);
// aqui está o papel: faixa de cima, título, texto, checklist, anexos e ações.

// ─── Apagar com "Desfazer" ───────────────────────────────────────────────────
// A nota sai logo do ecrã, mas só é apagada no servidor ao fim de uns
// segundos. Um apagar novo confirma o anterior.

type Pendente = { nota: TNota; restaurar: () => void; timer: number };
let pendente: Pendente | null = null;
const aApagar = new Set<string>();
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());

function confirmar(p: Pendente) {
  clearTimeout(p.timer);
  if (pendente === p) {
    pendente = null;
    avisar();
  }
  apagarNota(p.nota.id).finally(() => aApagar.delete(p.nota.id));
}

export function apagarComDesfazer(nota: TNota, restaurar: () => void) {
  if (pendente) confirmar(pendente);
  aApagar.add(nota.id);
  const p: Pendente = { nota, restaurar, timer: 0 };
  p.timer = window.setTimeout(() => confirmar(p), 6000);
  pendente = p;
  avisar();
}

function desfazer() {
  const p = pendente;
  if (!p) return;
  clearTimeout(p.timer);
  pendente = null;
  aApagar.delete(p.nota.id);
  p.restaurar();
  avisar();
}

/**
 * Junta o que veio do servidor (o painel refresca sozinho) ao que está em
 * memória: as notas locais ganham, para não se perder o que se está a
 * escrever, e as que estão à espera de ser apagadas não voltam.
 */
export function juntarNotas(atuais: TNota[], iniciais: TNota[]) {
  const porId = new Map(atuais.map((n) => [n.id, n]));
  return iniciais.filter((n) => !aApagar.has(n.id)).map((n) => porId.get(n.id) ?? n);
}

/** O aviso "Nota apagada · Desfazer", em baixo ao centro. Ctrl+Z também desfaz. */
export function AvisoDesfazer() {
  const atual = useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => pendente,
    () => null,
  );

  useEffect(() => {
    if (!atual) return;
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, [contenteditable]")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        desfazer();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [atual]);

  if (!atual) return null;
  return (
    <div
      role="status"
      className="aparecer pointer-events-auto fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-1 rounded-full bg-tinta py-1 pl-5 pr-1 text-[14px] text-cartao shadow-cartao-hover"
    >
      Nota apagada
      <button
        type="button"
        onClick={desfazer}
        className="ml-2 h-9 rounded-full px-4 font-semibold text-p-media transition-colors duration-150 hover:bg-white/10 active:bg-white/20"
      >
        Desfazer
      </button>
    </div>
  );
}

// ─── A nota ──────────────────────────────────────────────────────────────────

function novoItem(texto = ""): ItemChecklist {
  return { id: crypto.randomUUID(), texto, feito: false };
}

const iguais = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function Nota({
  nota,
  onGuardar,
  onApagar,
  onAnexo,
  onRemoverAnexo,
  onSoltar,
  pega,
  levantada = false,
  autoFoco = false,
}: {
  nota: TNota;
  onGuardar: (campos: CamposNota) => void;
  onApagar: () => void;
  onAnexo: (f: File) => void;
  onRemoverAnexo: (caminho: string) => void;
  /** Na pilha: devolve a nota ao quadro como nota geral. */
  onSoltar?: () => void;
  /** No quadro: a faixa de cima é a pega para arrastar. */
  pega?: (e: React.PointerEvent) => void;
  levantada?: boolean;
  autoFoco?: boolean;
}) {
  const [titulo, setTitulo] = useState(nota.titulo);
  const [texto, setTexto] = useState(nota.texto);
  const [itens, setItens] = useState(nota.itens);
  const [comTitulo, setComTitulo] = useState(autoFoco || !!nota.titulo);
  const ficheiroRef = useRef<HTMLInputElement>(null);
  const tituloRef = useRef<HTMLTextAreaElement>(null);
  const textoRef = useRef<HTMLTextAreaElement>(null);
  const itensRef = useRef(new Map<string, HTMLTextAreaElement>());
  const focoPedido = useRef<{ id: string; onde: "inicio" | "fim" } | null>(null);

  // Guarda sozinha, um pouco depois de se parar de escrever, só o que mudou.
  const guardado = useRef({ titulo: nota.titulo, texto: nota.texto, itens: nota.itens });
  const atual = useRef({ titulo, texto, itens });
  atual.current = { titulo, texto, itens };
  const guardarRef = useRef(onGuardar);
  guardarRef.current = onGuardar;

  function guardarJa() {
    const a = atual.current;
    const g = guardado.current;
    const campos: CamposNota = {};
    if (a.titulo !== g.titulo) campos.titulo = a.titulo;
    if (a.texto !== g.texto) campos.texto = a.texto;
    if (!iguais(a.itens, g.itens)) campos.itens = a.itens;
    if (!Object.keys(campos).length) return;
    guardado.current = { ...a };
    guardarRef.current(campos);
  }

  useEffect(() => {
    const t = setTimeout(guardarJa, 500);
    return () => clearTimeout(t);
  }, [titulo, texto, itens]);

  // Ao desmontar (fechar a pilha, sair da página), não se perde nada.
  useEffect(() => () => guardarJa(), []);

  useEffect(() => {
    if (autoFoco) tituloRef.current?.focus();
  }, [autoFoco]);

  // Depois de criar ou apagar um item, o cursor vai para onde deve.
  useLayoutEffect(() => {
    const pedido = focoPedido.current;
    if (!pedido) return;
    focoPedido.current = null;
    const el = pedido.id === "texto" ? textoRef.current : itensRef.current.get(pedido.id);
    if (!el) return;
    el.focus();
    const pos = pedido.onde === "inicio" ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }, [itens]);

  function mudarItem(id: string, alteracao: Partial<ItemChecklist>) {
    setItens((is) => is.map((i) => (i.id === id ? { ...i, ...alteracao } : i)));
  }

  function acrescentarItem() {
    const item = novoItem();
    focoPedido.current = { id: item.id, onde: "inicio" };
    setItens((is) => [...is, item]);
  }

  function teclaItem(e: React.KeyboardEvent<HTMLTextAreaElement>, item: ItemChecklist, indice: number) {
    if (e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    if (e.key === "Enter" && !e.shiftKey) {
      // Enter cria o item seguinte; o que está à direita do cursor vai com ele.
      e.preventDefault();
      const antes = el.value.slice(0, el.selectionStart);
      const depois = el.value.slice(el.selectionEnd);
      const seguinte = novoItem(depois);
      focoPedido.current = { id: seguinte.id, onde: "inicio" };
      setItens((is) => {
        const novos = is.map((i) => (i.id === item.id ? { ...i, texto: antes } : i));
        novos.splice(indice + 1, 0, seguinte);
        return novos;
      });
    } else if (e.key === "Backspace" && el.value === "") {
      // Backspace num item vazio apaga-o e volta ao anterior.
      e.preventDefault();
      const anterior = itens[indice - 1] ?? itens[indice + 1];
      focoPedido.current = anterior ? { id: anterior.id, onde: "fim" } : { id: "texto", onde: "fim" };
      setItens((is) => is.filter((i) => i.id !== item.id));
    } else if (e.key === "ArrowUp" && el.selectionStart === 0 && indice > 0) {
      e.preventDefault();
      itensRef.current.get(itens[indice - 1].id)?.focus();
    } else if (e.key === "ArrowDown" && el.selectionEnd === el.value.length && indice < itens.length - 1) {
      e.preventDefault();
      itensRef.current.get(itens[indice + 1].id)?.focus();
    }
  }

  const feitos = itens.filter((i) => i.feito).length;
  const mostraTitulo = comTitulo || !!titulo;
  const cor = COR[nota.prioridade];

  return (
    <div
      onBlur={(e) => {
        // Sair da nota guarda logo, sem esperar.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) guardarJa();
      }}
      className={`group/nota relative overflow-hidden rounded-md bg-papel text-papel-texto transition-shadow duration-200 ${
        levantada ? "shadow-nota-levantada" : "shadow-nota hover:shadow-cartao-hover"
      }`}
    >
      {/* Faixa de cima: a cor da prioridade e, no quadro, a pega para arrastar. */}
      <div
        onPointerDown={(e) => {
          if (!pega || (e.target as HTMLElement).closest("button")) return;
          pega(e);
        }}
        className={`relative flex h-9 items-center justify-end px-1 transition-[filter] duration-150 ${
          pega ? "cursor-grab touch-none hover:brightness-[0.96] active:cursor-grabbing active:brightness-[0.92]" : ""
        }`}
        style={{ background: `color-mix(in srgb, ${cor} 30%, var(--color-papel))` }}
        title={pega ? "Arrasta para mover, ou larga num cartão para a prender" : undefined}
      >
        {pega && (
          <DotsSixIcon
            size={22}
            weight="bold"
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 transition-opacity duration-150 group-hover/nota:opacity-80"
            style={{ color: `color-mix(in srgb, ${cor} 70%, #000)` }}
          />
        )}
        <span className="flex items-center opacity-60 transition-opacity duration-150 group-focus-within/nota:opacity-100 group-hover/nota:opacity-100 [@media(hover:none)]:opacity-100">
          {onSoltar && (
            <Acao rotulo="Soltar no quadro (passa a nota geral)" onClick={onSoltar}>
              <ArrowUpRightIcon size={17} weight="bold" />
            </Acao>
          )}
          <Acao rotulo="Apagar nota" onClick={onApagar} perigo>
            <TrashIcon size={17} />
          </Acao>
        </span>
      </div>

      <div className="letra-nota px-3 pb-1 pt-2">
        {mostraTitulo && (
          <Campo
            refCampo={tituloRef}
            valor={titulo}
            onValor={setTitulo}
            rotulo="Título"
            placeholder="Título"
            onBlur={() => !titulo.trim() && setComTitulo(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                textoRef.current?.focus();
              }
            }}
            className="text-[19px] font-bold leading-tight"
          />
        )}

        <Campo
          refCampo={textoRef}
          valor={texto}
          onValor={setTexto}
          rotulo="Texto da nota"
          placeholder={itens.length || titulo ? "Mais notas…" : "Escreve aqui…"}
          className={`text-[15px] leading-[1.4] ${mostraTitulo ? "mt-0.5" : ""} ${!texto && (itens.length || titulo) ? "text-[14px]" : ""}`}
        />

        {itens.length > 0 && (
          <div className="mt-1.5">
            <div className="mb-0.5 flex items-center gap-2 font-sans text-[11px] font-medium text-papel-texto-2" aria-label={`${feitos} de ${itens.length} feitos`}>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
                <span
                  className="block h-full rounded-full bg-papel-texto-2 transition-[width] duration-200"
                  style={{ width: `${(feitos / itens.length) * 100}%` }}
                />
              </span>
              <span className="num">
                {feitos}/{itens.length}
              </span>
            </div>
            <ul>
              {itens.map((item, indice) => (
                <li key={item.id} className="group/item -ml-1.5 flex items-start">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.feito}
                    aria-label={item.texto || "Item"}
                    onClick={() => mudarItem(item.id, { feito: !item.feito })}
                    className="grid size-9 shrink-0 place-items-center rounded-md transition-[background-color,transform] duration-150 hover:bg-black/5 active:scale-90"
                  >
                    <span
                      className={`grid size-[22px] place-items-center rounded-[6px] border-2 transition-colors duration-150 ${
                        item.feito ? "border-papel-texto-2 bg-papel-texto-2 text-papel" : "border-papel-texto-2/60 bg-white/50"
                      }`}
                    >
                      {item.feito && <CheckIcon size={14} weight="bold" />}
                    </span>
                  </button>
                  <Campo
                    refCampo={(el) => {
                      if (el) itensRef.current.set(item.id, el);
                      else itensRef.current.delete(item.id);
                    }}
                    valor={item.texto}
                    onValor={(t) => mudarItem(item.id, { texto: t })}
                    rotulo={`Item ${indice + 1}`}
                    placeholder="Item…"
                    onKeyDown={(e) => teclaItem(e, item, indice)}
                    emLinha
                    className={`py-[7px] text-[15px] leading-[1.35] transition-[color,opacity] duration-200 ${
                      item.feito ? "line-through decoration-papel-texto-2/70 opacity-50" : ""
                    }`}
                  />
                  <button
                    type="button"
                    aria-label="Tirar item"
                    onClick={() => setItens((is) => is.filter((i) => i.id !== item.id))}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-papel-texto-2 opacity-0 transition-opacity duration-150 hover:bg-black/5 hover:text-papel-texto focus-visible:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-60"
                  >
                    <XIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={acrescentarItem}
              className="-ml-1.5 flex h-9 items-center gap-2 rounded-md px-2 font-sans text-[13px] text-papel-texto-2 transition-colors duration-150 hover:bg-black/5 hover:text-papel-texto active:bg-black/10"
            >
              <PlusIcon size={14} weight="bold" /> Item
            </button>
          </div>
        )}

        {nota.anexos.length > 0 && (
          <ul className="mt-1.5 border-t border-black/10 pt-1 font-sans">
            {nota.anexos.map((a) => (
              <li key={a.caminho} className="flex items-center gap-1 text-[12px] text-papel-texto-2">
                <PaperclipIcon size={13} className="shrink-0" />
                <a
                  href={`/anexo/${a.caminho.split("/").map(encodeURIComponent).join("/")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate py-2 underline underline-offset-2 hover:text-papel-texto"
                >
                  {a.nome}
                </a>
                <Acao rotulo={`Remover ${a.nome}`} onClick={() => onRemoverAnexo(a.caminho)} perigo pequena>
                  <XIcon size={13} />
                </Acao>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ações: à vista na nota em foco ou debaixo do rato, discretas em repouso. */}
      <div className="flex items-center gap-0.5 border-t border-black/[0.07] px-1 py-0.5 opacity-55 transition-opacity duration-150 group-focus-within/nota:opacity-100 group-hover/nota:opacity-100 [@media(hover:none)]:opacity-100">
        <div role="radiogroup" aria-label="Prioridade" className="flex">
          {PRIORIDADES.map((p) => (
            <BolaPrioridade key={p} p={p} escolhida={nota.prioridade === p} onEscolher={() => onGuardarPrioridade(p)} />
          ))}
        </div>
        <span className="mx-1 h-5 w-px bg-black/10" aria-hidden />
        {!mostraTitulo && (
          <Acao
            rotulo="Pôr título"
            onClick={() => {
              setComTitulo(true);
              requestAnimationFrame(() => tituloRef.current?.focus());
            }}
          >
            <TextTIcon size={18} />
          </Acao>
        )}
        <Acao rotulo={itens.length ? "Mais um item" : "Checklist"} onClick={acrescentarItem}>
          <CheckSquareIcon size={18} />
        </Acao>
        <Acao rotulo="Anexar ficheiro" onClick={() => ficheiroRef.current?.click()}>
          <PaperclipIcon size={18} />
        </Acao>
        <input
          ref={ficheiroRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAnexo(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );

  function onGuardarPrioridade(p: Prioridade) {
    if (p !== nota.prioridade) onGuardar({ prioridade: p });
  }
}

function BolaPrioridade({ p, escolhida, onEscolher }: { p: Prioridade; escolhida: boolean; onEscolher: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={escolhida}
      aria-label={NOME[p]}
      title={NOME[p]}
      onClick={onEscolher}
      className="group/bola grid size-9 place-items-center rounded-full transition-[background-color,transform] duration-150 hover:bg-black/5 active:scale-90"
    >
      <span
        className={`block rounded-full transition-all duration-200 ${escolhida ? "size-[18px]" : "size-3.5 opacity-45 group-hover/bola:opacity-90"}`}
        style={{
          background: COR[p],
          boxShadow: escolhida ? `0 0 0 2px var(--color-papel), 0 0 0 4px ${COR[p]}` : undefined,
        }}
      />
    </button>
  );
}

function Acao({
  rotulo,
  onClick,
  children,
  perigo = false,
  pequena = false,
}: {
  rotulo: string;
  onClick: () => void;
  children: React.ReactNode;
  perigo?: boolean;
  pequena?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      onClick={onClick}
      className={`grid shrink-0 place-items-center rounded-md text-papel-texto-2 transition-[background-color,color,transform] duration-150 hover:bg-black/[0.06] active:scale-90 active:bg-black/10 ${
        perigo ? "hover:text-alerta" : "hover:text-papel-texto"
      } ${pequena ? "size-8" : "size-9"}`}
    >
      {children}
    </button>
  );
}

/**
 * Texto que se edita no sítio: parece escrito no papel, mas ao passar o rato
 * ganha um fundo e o cursor de texto, e ao clicar fica claro que se escreve.
 */
function Campo({
  valor,
  onValor,
  rotulo,
  placeholder,
  className = "",
  onKeyDown,
  onBlur,
  refCampo,
  emLinha = false,
}: {
  valor: string;
  onValor: (v: string) => void;
  rotulo: string;
  placeholder: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  refCampo?: React.Ref<HTMLTextAreaElement>;
  /** Ao lado de outra coisa (a caixa de um item): ocupa o que sobra. */
  emLinha?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  function ajustar() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }

  useLayoutEffect(ajustar, [valor]);
  useEffect(() => {
    document.fonts?.ready.then(ajustar);
  }, []);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        if (typeof refCampo === "function") refCampo(el);
        else if (refCampo) (refCampo as React.RefObject<HTMLTextAreaElement | null>).current = el;
      }}
      rows={1}
      value={valor}
      aria-label={rotulo}
      placeholder={placeholder}
      onChange={(e) => onValor(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      spellCheck={false}
      className={`${emLinha ? "min-w-0 flex-1" : "-mx-1 w-[calc(100%+0.5rem)]"} block resize-none overflow-hidden rounded-[5px] bg-transparent px-1 text-papel-texto outline-none transition-[background-color,box-shadow] duration-150 placeholder:text-papel-texto-2/70 hover:bg-black/[0.035] focus:bg-white/60 focus:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] ${className}`}
    />
  );
}
