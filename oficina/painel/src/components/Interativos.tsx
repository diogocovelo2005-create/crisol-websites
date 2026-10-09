"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckIcon,
  CodeIcon,
  PlayIcon,
  PlusIcon,
  SealCheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  abrirPasta,
  adicionarNota,
  adicionarPasso,
  apagarPasso,
  arrancarLocal,
  definirEstado,
  definirProximoPasso,
  esconderCartao,
  guardarFim,
  guardarNegocio,
  ignorarSugestao,
  marcarPasso,
} from "@/app/acoes";

type Id = { nicho: string; slug: string };

const botao =
  "inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-wait disabled:opacity-50";
const botaoPrincipal = `${botao} bg-tinta text-cartao hover:bg-black`;
const botaoLinha = `${botao} border border-linha bg-cartao text-tinta hover:border-tinta-3`;
const campo =
  "w-full rounded-[3px] border border-linha bg-cartao px-2.5 py-1.5 text-[14px] text-tinta placeholder:text-tinta-3 focus:border-tinta-3 focus:outline-none";

function useAcao() {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const correr = (f: () => Promise<unknown>) =>
    iniciar(async () => {
      setErro(null);
      try {
        await f();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não deu. Tenta outra vez.");
      }
    });
  return { pendente, erro, correr };
}

function Erro({ texto }: { texto: string | null }) {
  return texto ? <p className="mt-2 text-[12px] text-alerta">{texto}</p> : null;
}

// ─── Esconder do quadro ──────────────────────────────────────────────────────

/** O × no canto do cartão. Não apaga nada: o projeto passa para o Arquivo. */
export function EsconderCartao({ id, nome }: { id: Id; nome: string }) {
  const { pendente, correr } = useAcao();
  return (
    <button
      type="button"
      aria-label={`Tirar ${nome} do quadro`}
      title="Tirar do quadro (fica no Arquivo)"
      disabled={pendente}
      onClick={() => {
        if (confirm(`Tirar "${nome}" do quadro?\n\nNão se apaga nada: fica no Arquivo e pode voltar.`))
          correr(() => esconderCartao(id.nicho, id.slug, true));
      }}
      className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-cartao/90 text-tinta-2 opacity-0 shadow-cartao transition-opacity hover:text-alerta focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-wait"
    >
      <XIcon size={12} weight="bold" />
    </button>
  );
}

export function MostrarCartao({ id }: { id: Id }) {
  const { pendente, erro, correr } = useAcao();
  return (
    <>
      <button type="button" className={botaoLinha} disabled={pendente} onClick={() => correr(() => esconderCartao(id.nicho, id.slug, false))}>
        Voltar ao quadro
      </button>
      <Erro texto={erro} />
    </>
  );
}

// ─── Estado ──────────────────────────────────────────────────────────────────

export function EscolherEstado({
  id,
  estado,
  opcoes,
  cor,
}: {
  id: Id;
  estado: string | null;
  opcoes: string[];
  cor: string;
}) {
  const { pendente, erro, correr } = useAcao();
  return (
    <div>
      <label className="sr-only" htmlFor="estado">Estado</label>
      <select
        id="estado"
        value={estado ?? ""}
        disabled={pendente}
        onChange={(e) => correr(() => definirEstado(id.nicho, id.slug, e.target.value))}
        className="cursor-pointer appearance-none rounded-full py-1.5 pl-4 pr-9 text-[14px] font-semibold text-white transition-opacity disabled:opacity-60 bg-[length:11px] bg-[right_14px_center] bg-no-repeat"
        style={{
          backgroundColor: cor,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='white' stroke-width='1.8'/%3E%3C/svg%3E")`,
        }}
      >
        {!estado && <option value="" disabled>Escolher estado</option>}
        {opcoes.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <Erro texto={erro} />
    </div>
  );
}

// ─── Próximo passo e sugestões ───────────────────────────────────────────────

type Sugestao =
  | { tipo: "passo"; texto: string; ate: string; de: string }
  | { tipo: "estado"; estado: string; de: string };

export function ProximoPasso({
  id,
  texto,
  ate,
  atrasado,
  sugestoes,
}: {
  id: Id;
  texto: string | null;
  ate: string | null;
  atrasado: boolean;
  sugestoes: Sugestao[];
}) {
  const [editar, setEditar] = useState(false);
  const [t, setT] = useState(texto ?? "");
  const [d, setD] = useState(ate ?? "");
  const { pendente, erro, correr } = useAcao();

  const abrirCom = (novoT: string, novoD: string) => {
    setT(novoT);
    setD(novoD);
    setEditar(true);
  };

  return (
    <div>
      {sugestoes.map((s) => (
        <div
          key={s.tipo === "passo" ? s.texto : s.estado}
          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[3px] border border-dashed border-alerta/50 bg-alerta/[0.04] px-3.5 py-2.5"
        >
          <p className="min-w-0 flex-1 text-[14px] text-tinta">
            <span className="text-tinta-2">
              {s.de} está feito. {s.tipo === "passo" ? "A seguir:" : "Mudar o estado para"}
            </span>{" "}
            <b className="font-semibold">{s.tipo === "passo" ? s.texto : s.estado}</b>
            {s.tipo === "passo" && <span className="num ml-1.5 text-[12px] text-tinta-2">até {s.ate}</span>}
            {s.tipo === "estado" && "?"}
          </p>
          <div className="flex gap-2">
            <button
              className={botaoPrincipal}
              disabled={pendente}
              onClick={() =>
                correr(() =>
                  s.tipo === "passo"
                    ? definirProximoPasso(id.nicho, id.slug, s.texto, s.ate)
                    : definirEstado(id.nicho, id.slug, s.estado),
                )
              }
            >
              <CheckIcon size={14} weight="bold" /> Aceitar
            </button>
            {s.tipo === "passo" && (
              <button className={botaoLinha} disabled={pendente} onClick={() => abrirCom(s.texto, s.ate)}>
                Editar
              </button>
            )}
            <button
              className={botaoLinha}
              disabled={pendente}
              onClick={() =>
                correr(() => ignorarSugestao(id.nicho, id.slug, s.tipo === "passo" ? s.texto : `estado:${s.estado}`))
              }
            >
              Ignorar
            </button>
          </div>
        </div>
      ))}

      {editar ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            correr(async () => {
              await definirProximoPasso(id.nicho, id.slug, t, d || null);
              setEditar(false);
            });
          }}
        >
          <input autoFocus className={`${campo} min-w-[240px] flex-1`} value={t} onChange={(e) => setT(e.target.value)} placeholder="O que tens de fazer a seguir" />
          <input type="date" className={`${campo} num w-auto`} value={d} onChange={(e) => setD(e.target.value)} />
          <button className={botaoPrincipal} disabled={pendente}>Guardar</button>
          <button type="button" className={botaoLinha} onClick={() => setEditar(false)}>Cancelar</button>
        </form>
      ) : (
        <button
          onClick={() => abrirCom(texto ?? "", ate ?? "")}
          className="group flex w-full items-baseline gap-3 text-left"
        >
          <span aria-hidden className={`text-[20px] font-semibold leading-none ${atrasado ? "text-alerta" : "text-tinta"}`}>→</span>
          <span className={`text-[20px] font-semibold leading-tight ${texto ? (atrasado ? "text-alerta" : "text-tinta") : "text-tinta-3"}`}>
            {texto ?? "Sem próximo passo. Clica para escrever."}
          </span>
          {ate && (
            <span className={`num ml-auto shrink-0 text-[13px] ${atrasado ? "text-alerta" : "text-tinta-2"}`}>
              {atrasado ? "passou de " : "até "}
              {ate}
            </span>
          )}
        </button>
      )}
      <Erro texto={erro} />
    </div>
  );
}

// ─── Checklist ───────────────────────────────────────────────────────────────

type Passo = {
  id: string;
  fase: number;
  texto: string;
  extra: boolean;
  feito: boolean;
  feitoPor: "prova" | "mao" | null;
};

export function Checklist({ id, passos, fases, faseAtual }: { id: Id; passos: Passo[]; fases: string[]; faseAtual: number }) {
  const { pendente, erro, correr } = useAcao();
  const [aAdicionar, setAAdicionar] = useState<number | null>(null);
  const [novo, setNovo] = useState("");
  // Só a fase em que está fica aberta (sem estado: a primeira por acabar).
  const primeiraPorAcabar = fases.findIndex((_, i) => passos.some((p) => p.fase === i + 1 && !p.feito)) + 1;
  const [aberta, setAberta] = useState<number>(faseAtual || primeiraPorAcabar || 1);

  return (
    <div>
      <ol className="space-y-1">
        {fases.map((nome, i) => {
          const fase = i + 1;
          const lista = passos.filter((p) => p.fase === fase);
          const feitos = lista.filter((p) => p.feito).length;
          const atual = fase === faseAtual;
          const estaAberta = fase === aberta;
          return (
            <li key={nome}>
              <button
                onClick={() => setAberta(estaAberta ? 0 : fase)}
                aria-expanded={estaAberta}
                className="flex w-full items-center justify-between rounded-md py-2 text-left hover:bg-fundo"
              >
                <span className={`text-[15px] ${estaAberta || atual ? "font-semibold text-tinta" : "text-tinta-2"}`}>
                  <span className="mr-2 inline-block w-3 text-tinta-3">{estaAberta ? "▾" : "▸"}</span>
                  {nome}
                  {atual && <span className="ml-2 text-[12px] font-normal text-tinta-2">(agora)</span>}
                </span>
                <span className={`num text-[13px] ${feitos === lista.length && lista.length ? "text-f-sim" : "text-tinta-3"}`}>
                  {feitos}/{lista.length}
                </span>
              </button>
              {estaAberta && <ul className="mb-3 ml-5">
                {lista.map((p) => (
                  <li key={p.id} className="group flex items-center gap-2.5 border-t border-linha/70 py-[7px]">
                    <button
                      role="checkbox"
                      aria-checked={p.feito}
                      disabled={pendente || p.feitoPor === "prova"}
                      title={p.feitoPor === "prova" ? "Marcado pela prova no disco ou na Vercel" : undefined}
                      onClick={() => correr(() => marcarPasso(id.nicho, id.slug, p.id, !p.feito))}
                      className={`grid size-[18px] shrink-0 place-items-center rounded-[3px] border transition-colors ${
                        p.feito ? "border-tinta bg-tinta text-cartao" : "border-tinta-3 bg-cartao hover:border-tinta"
                      } disabled:cursor-default`}
                    >
                      {p.feito && <CheckIcon size={12} weight="bold" />}
                    </button>
                    <span className={`flex-1 text-[14px] ${p.feito ? "text-tinta-2 line-through decoration-tinta-3/60" : "text-tinta"}`}>
                      {p.texto}
                    </span>
                    {p.feitoPor === "prova" && (
                      <SealCheckIcon size={16} className="text-f-sim" aria-label="Marcado pela prova" />
                    )}
                    {p.extra && (
                      <button
                        aria-label={`Apagar ${p.texto}`}
                        onClick={() => correr(() => apagarPasso(id.nicho, id.slug, p.id))}
                        className="text-tinta-3 opacity-0 transition-opacity hover:text-alerta group-hover:opacity-100 focus:opacity-100"
                      >
                        <XIcon size={14} />
                      </button>
                    )}
                  </li>
                ))}
                <li className="border-t border-linha/70 pt-1.5">
                  {aAdicionar === fase ? (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        correr(async () => {
                          await adicionarPasso(id.nicho, id.slug, fase, novo);
                          setNovo("");
                          setAAdicionar(null);
                        });
                      }}
                    >
                      <input autoFocus className={campo} value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Novo passo" onKeyDown={(e) => e.key === "Escape" && setAAdicionar(null)} />
                      <button className={botaoPrincipal} disabled={pendente}>Juntar</button>
                    </form>
                  ) : (
                    <button onClick={() => setAAdicionar(fase)} className="inline-flex items-center gap-1 text-[12px] text-tinta-3 hover:text-tinta">
                      <PlusIcon size={12} /> Adicionar passo
                    </button>
                  )}
                </li>
              </ul>}
            </li>
          );
        })}
      </ol>
      <Erro texto={erro} />
    </div>
  );
}

// ─── Histórico ───────────────────────────────────────────────────────────────

export function NovaNota({ id }: { id: Id }) {
  const [t, setT] = useState("");
  const { pendente, erro, correr } = useAcao();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        correr(async () => {
          await adicionarNota(id.nicho, id.slug, t);
          setT("");
        });
      }}
    >
      <textarea
        rows={2}
        className={`${campo} resize-y`}
        value={t}
        onChange={(e) => setT(e.target.value)}
        placeholder="O que ele disse na chamada, o que ficou combinado…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-tinta-3">Ctrl+Enter para guardar</span>
        <button className={botaoPrincipal} disabled={pendente || !t.trim()}>Guardar nota</button>
      </div>
      <Erro texto={erro} />
    </form>
  );
}

// ─── Campos que se guardam ao sair ───────────────────────────────────────────

export function CampoGuardado({
  id,
  nome,
  valor,
  rotulo,
  placeholder,
  tipo = "text",
}: {
  id: Id;
  nome: "valor" | "url_enviada" | "email";
  valor: string;
  rotulo: string;
  placeholder?: string;
  tipo?: string;
}) {
  const [v, setV] = useState(valor);
  const { pendente, erro, correr } = useAcao();
  return (
    <label className="block">
      {rotulo && <span className="mb-1 block text-[12px] text-tinta-2">{rotulo}</span>}
      <input
        type={tipo}
        className={`${campo} ${nome === "valor" ? "num" : ""}`}
        value={v}
        placeholder={placeholder}
        disabled={pendente}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== valor && correr(() => guardarNegocio(id.nicho, id.slug, { [nome]: v }))}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <Erro texto={erro} />
    </label>
  );
}

// ─── Fim ─────────────────────────────────────────────────────────────────────

const MOTIVOS = ["preço", "já tem alguém", "não é o momento", "não gostou do design", "deixou de responder", "outro"];

export function Fim({ id, motivo, voltarEm }: { id: Id; motivo: string | null; voltarEm: string | null }) {
  const [m, setM] = useState(motivo ?? "");
  const [d, setD] = useState(voltarEm ?? "");
  const { pendente, erro, correr } = useAcao();
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        correr(() => guardarFim(id.nicho, id.slug, m, d || null));
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {MOTIVOS.map((x) => (
          <button
            type="button"
            key={x}
            onClick={() => setM(x)}
            aria-pressed={m === x}
            className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
              m === x ? "border-alerta bg-alerta text-cartao" : "border-linha bg-cartao text-tinta hover:border-tinta-3"
            }`}
          >
            {x}
          </button>
        ))}
      </div>
      <label className="text-[12px] text-tinta-2">
        Voltar a tentar em
        <input type="date" className={`${campo} num mt-1`} value={d} onChange={(e) => setD(e.target.value)} />
      </label>
      <button className={botaoPrincipal} disabled={pendente}>Guardar</button>
      <Erro texto={erro} />
    </form>
  );
}

// ─── No PC ───────────────────────────────────────────────────────────────────

export function BotaoArrancar({ id, porta }: { id: Id; porta: number }) {
  const { pendente, erro, correr } = useAcao();
  const [pedido, setPedido] = useState(false);
  return (
    <div>
      <button
        className={botaoLinha}
        disabled={pendente || pedido}
        onClick={() =>
          correr(async () => {
            await arrancarLocal(id.nicho, id.slug);
            setPedido(true);
          })
        }
      >
        <PlayIcon size={13} weight="fill" /> {pedido ? `A arrancar em :${porta}…` : `Arrancar local :${porta}`}
      </button>
      {pedido && <p className="mt-1.5 text-[12px] text-tinta-2">Demora uns segundos. O link aparece quando estiver pronto.</p>}
      <Erro texto={erro} />
    </div>
  );
}

export function BotaoPasta({ id }: { id: Id }) {
  const { pendente, erro, correr } = useAcao();
  return (
    <>
      <button className={botaoLinha} disabled={pendente} onClick={() => correr(() => abrirPasta(id.nicho, id.slug))}>
        <CodeIcon size={14} /> Abrir no VS Code
      </button>
      <Erro texto={erro} />
    </>
  );
}

// ─── Dossiê ──────────────────────────────────────────────────────────────────

type GrupoDeFotos = { pasta: string; fotos: { caminho: string; legenda: string }[] };

export function Dossie({
  ficheiros,
  fotos,
  base,
}: {
  ficheiros: { nome: string; texto: string }[];
  fotos: GrupoDeFotos[];
  /** Prefixo dos endereços das fotos: /foto/<nicho>/<slug> */
  base: string;
}) {
  const [ativo, setAtivo] = useState(0);
  const separadores = fotos.length ? [...ficheiros.map((x) => x.nome), "fotos"] : ficheiros.map((x) => x.nome);
  const f = ficheiros[ativo];
  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-x-5 gap-y-1 border-b border-linha">
        {separadores.map((nome, i) => (
          <button
            key={nome}
            role="tab"
            aria-selected={i === ativo}
            onClick={() => setAtivo(i)}
            className={`-mb-px border-b-2 pb-2 text-[13px] transition-colors ${
              i === ativo ? "border-alerta text-tinta" : "border-transparent text-tinta-2 hover:text-tinta"
            }`}
          >
            {nome}
          </button>
        ))}
      </div>
      {f ? (
        <article className="dossie max-w-[72ch] text-[15px] leading-relaxed text-tinta">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{f.texto}</ReactMarkdown>
        </article>
      ) : (
        <FotosDoDossie grupos={fotos} base={base} />
      )}
    </div>
  );
}

// Grelha simples por pasta; clicar abre a foto inteira noutro separador.
function FotosDoDossie({ grupos, base }: { grupos: GrupoDeFotos[]; base: string }) {
  return (
    <div className="space-y-8">
      {grupos.map((g) => (
        <section key={g.pasta}>
          <h3 className="mb-3 text-[14px] font-semibold text-tinta">
            {g.pasta} <span className="font-normal text-tinta-2">· {g.fotos.length}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {g.fotos.map((x) => {
              const url = `${base}/${x.caminho.split("/").map(encodeURIComponent).join("/")}`;
              return (
                <a key={x.caminho} href={url} target="_blank" rel="noreferrer" title={x.legenda} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={x.legenda}
                    loading="lazy"
                    className="aspect-[3/2] w-full rounded-lg bg-linha object-cover transition-opacity group-hover:opacity-85"
                  />
                  <span className="mt-1 block truncate text-[12px] text-tinta-2">{x.legenda}</span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
