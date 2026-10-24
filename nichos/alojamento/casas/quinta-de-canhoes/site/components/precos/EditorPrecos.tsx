"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Check, LoaderCircle, Plus, Trash2, Undo2 } from "lucide-react";
import { Riscado } from "@/components/reserva/Preco";
import { AvisoPromocoes, CartaoQuarto, CasaInteira, ContasEstadia, destaquesDoQuarto } from "@/components/reserva/FormularioReserva";
import {
  ALVOS,
  CAMPOS_BASE,
  DESCONTO_MAX,
  DESCONTO_MIN,
  MIN_NOITES_MAX,
  MIN_NOITES_MIN,
  NOME_PADRAO,
  FRASE_NEUTRA,
  SUGESTOES_NOME,
  frasesDaSugestao,
  aplicarPromocoes,
  baixaPreco,
  descreverDatas,
  descreverMinimo,
  nomeDe,
  ofereceAlmoco,
  diferencas,
  erroBase,
  errosPromocao,
  limitesBase,
  nomeAlvo,
  precoDaPromocao,
  promocoesEmVigor,
  type Alvo,
  type CampoBase,
  type PrecosBase,
  type Promocao,
} from "@/lib/precos";
import { FRASE_MAX, NOME_MAX, OFERTA_MAX, normalizarFrase, fraseAoEscolherSugestao, normalizarNome, normalizarOferta, tamanhoOferta } from "@/lib/oferta";
import { calcular, deIso, euros, iso, mensagemPromocao, montarPedido, noitesDe, primeiraChegadaFormulario, quartos, somarDias } from "@/lib/reserva";
import type { EstadoEditor } from "@/lib/servidor/precos";

/*
  O editor dos preços da D. Teresa. Pensado para quem não está à vontade com
  computadores: letra grande, uma coisa de cada vez, tudo dito por palavras,
  nada se perde sem «Guardar», e «Desfazer» para voltar atrás.

    1. Os preços de todos os dias (seis números).
    2. As promoções: a lista, «Apagar», e «Nova promoção» (nome → quando → quartos →
       o que oferece → mínimo de noites → «Assim o hóspede vai ver»).
    3. Como o hóspede vê (numa noite à escolha).
    4. O que vai mudar, e «Guardar». Depois de guardar: «Desfazer».

  Movimento: só a barra de baixo, que aparece quando há alterações por guardar
  (sobe 12 px e aparece, 200 ms). O resto muda sem animação.
*/

type Fase =
  | { tipo: "parado" }
  | { tipo: "a-guardar" }
  | { tipo: "guardado"; texto: string; quando: string }
  | { tipo: "erro"; texto: string; link?: "invalido"; mudou?: boolean };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const dataLonga = (v: string) => {
  const [a, m, d] = v.split("-").map(Number);
  const x = new Date(a, m - 1, d);
  return `${SEMANA[x.getDay()]}, ${d} de ${MESES[m - 1]}`;
};
const hora = () => new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date()).replace(":", "h");
const quando = (isoData: string | null) => {
  if (!isoData) return "";
  const d = new Date(isoData);
  return `${d.getDate()} de ${MESES[d.getMonth()]} às ${new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(d).replace(":", "h")}`;
};

/** Um número inteiro a partir do que se escreveu («97», «97 €», «97,00»); NaN se não for. */
function numero(v: string): number {
  const limpo = v.replace(/€/g, "").replace(/\s/g, "").replace(/,00$|\.00$/, "");
  if (!limpo) return NaN;
  if (!/^\d+([.,]\d+)?$/.test(limpo)) return NaN;
  return Number(limpo.replace(",", "."));
}

const textoBase = (b: PrecosBase) => Object.fromEntries(CAMPOS_BASE.map((c) => [c.id, String(b[c.id])])) as Record<CampoBase, string>;

type NovaPromocao = {
  nome: string;
  /** A frase; `fraseDaSugestao`: veio de uma sugestão e ainda não foi mexida (muda com o nome). */
  frase: string;
  fraseDaSugestao: boolean;
  de: string;
  ate: string;
  alvos: Alvo[];
  /** «Baixar o preço do quarto» e como (desconto em % ou preço novo). */
  comPreco: boolean;
  modoPreco: "desconto" | "preco";
  desconto: string;
  precos: Partial<Record<Alvo, string>>;
  comAlmoco: boolean;
  comOferta: boolean;
  oferta: string;
  comMinimo: boolean;
  minNoites: string;
};
const NOVA_VAZIA: NovaPromocao = {
  nome: "",
  frase: "",
  fraseDaSugestao: false,
  de: "",
  ate: "",
  alvos: [],
  comPreco: false,
  modoPreco: "desconto",
  desconto: "",
  precos: {},
  comAlmoco: false,
  comOferta: false,
  oferta: "",
  comMinimo: false,
  minNoites: "3",
};

const novoId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().toLowerCase()
    : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function EditorPrecos({ chave, inicial, hoje }: { chave: string; inicial: EstadoEditor; hoje: string }) {
  const [estado, setEstado] = useState(inicial);
  const guardada = useMemo(() => ({ base: estado.doc.base, promocoes: promocoesEmVigor(estado.doc.promocoes, hoje) }), [estado, hoje]);
  const [base, setBase] = useState<Record<CampoBase, string>>(() => textoBase(inicial.doc.base));
  const [promocoes, setPromocoes] = useState<Promocao[]>(() => promocoesEmVigor(inicial.doc.promocoes, hoje));
  const [nova, setNova] = useState<NovaPromocao | null>(null);
  const [fase, setFase] = useState<Fase>({ tipo: "parado" });
  const [confirmarDesfazer, setConfirmarDesfazer] = useState(false);

  // O mesmo id para o mesmo pedido: um segundo toque (ou uma resposta perdida) não guarda duas vezes.
  const idPedido = useRef<{ conteudo: string; id: string } | null>(null);

  const baseNum = Object.fromEntries(CAMPOS_BASE.map((c) => [c.id, numero(base[c.id])])) as PrecosBase;
  const errosBase = CAMPOS_BASE.map((c) => [c.id, erroBase(c.id, baseNum[c.id])] as const).filter(([, e]) => e);
  const baseValida = errosBase.length === 0;
  // Para as contas e a pré-visualização, um campo com erro conta com o valor guardado.
  const baseEfetiva = Object.fromEntries(CAMPOS_BASE.map((c) => [c.id, erroBase(c.id, baseNum[c.id]) ? guardada.base[c.id] : baseNum[c.id]])) as PrecosBase;
  const idsGuardados = new Set(guardada.promocoes.map((p) => p.id));
  const errosPromocoes = promocoes.flatMap((p) => errosPromocao(p, baseEfetiva, hoje, !idsGuardados.has(p.id)).map((e) => `${nomeDe(p)}, ${descreverDatas(p)}: ${e}`));
  const mudancas = baseValida ? diferencas(guardada, { base: baseNum, promocoes }) : [];
  const porGuardar = !baseValida || mudancas.length > 0;
  const podeGuardar = baseValida && mudancas.length > 0 && errosPromocoes.length === 0 && fase.tipo !== "a-guardar";

  const enviar = async (acao: "guardar" | "desfazer") => {
    const corpo = { acao, base: baseNum, promocoes, versao: estado.doc.versao };
    const conteudo = JSON.stringify(acao === "desfazer" ? { acao, versao: estado.doc.versao } : corpo);
    if (idPedido.current?.conteudo !== conteudo) idPedido.current = { conteudo, id: novoId() };
    setFase({ tipo: "a-guardar" });
    try {
      const r = await fetch("/api/precos/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chave,
          id: idPedido.current.id,
          acao,
          conhecida: { doc: estado.doc, etag: estado.etag, selo: estado.selo },
          ...(acao === "guardar" ? { base: baseNum, promocoes } : {}),
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setFase({ tipo: "erro", texto: j?.erro ?? "Não conseguimos guardar agora. Tente outra vez daqui a pouco.", link: j?.link, mudou: j?.mudou });
        return;
      }
      const novo = j.estado as EstadoEditor;
      setEstado(novo);
      setBase(textoBase(novo.doc.base));
      setPromocoes(promocoesEmVigor(novo.doc.promocoes, hoje));
      setConfirmarDesfazer(false);
      setNova(null);
      setFase({
        tipo: "guardado",
        quando: hora(),
        texto: j.semMudancas
          ? "Não havia nada de novo para guardar."
          : acao === "desfazer"
            ? "Pronto: os preços voltaram a ser os de antes. O site mostra-os dentro de um minuto."
            : "Guardado. O site mostra os preços novos dentro de um minuto.",
      });
    } catch {
      setFase({ tipo: "erro", texto: "Sem ligação à internet. Verifique a ligação e carregue outra vez em «Guardar»." });
    }
  };

  const esquecer = () => {
    setBase(textoBase(estado.doc.base));
    setPromocoes(guardada.promocoes);
    setNova(null);
    setFase({ tipo: "parado" });
  };

  // A noite da pré-visualização: a escolhida, ou o início da primeira promoção, ou hoje.
  // «Hoje no site»: a tabela guardada, na noite de hoje.
  const tabelaGuardada = { versao: estado.doc.versao, atualizadoEm: estado.doc.atualizadoEm, base: guardada.base, promocoes: guardada.promocoes };

  const anterior = estado.doc.anterior;
  const desfazerMuda = anterior ? diferencas(guardada, { base: anterior.base, promocoes: promocoesEmVigor(anterior.promocoes, hoje) }) : [];

  if (fase.tipo === "erro" && fase.link) {
    return (
      <section className="bg-cal pb-28 pt-12 md:pt-16">
        <div className="mx-auto max-w-[46rem] px-6 md:px-10">
          <p role="alert" className="border-l-[3px] border-caixilho pl-4 text-[1.2rem] leading-relaxed text-xisto">
            {fase.texto} As alterações não foram guardadas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cal pb-40 pt-12 text-[1.1rem] text-xisto md:pt-16">
      <div className="mx-auto max-w-[52rem] space-y-16 px-6 md:px-10">
        {/* 1 · os preços de todos os dias */}
        <Bloco numero={1} titulo="Os preços de todos os dias" texto="O que o hóspede paga quando não há promoção. Escreva só euros, sem cêntimos.">
          <ul className="border-t border-granito-linha">
            {CAMPOS_BASE.map((c) => {
              const erro = erroBase(c.id, baseNum[c.id]);
              const mudou = !erro && baseNum[c.id] !== guardada.base[c.id];
              const { min, max } = limitesBase(c.id);
              return (
                <li key={c.id} className="grid grid-cols-1 items-center gap-x-6 gap-y-3 border-b border-granito-linha py-5 sm:grid-cols-[1fr_auto]">
                  <label htmlFor={`base-${c.id}`}>
                    <span className="rustico-medio block text-[1.6rem] leading-tight">{c.nome}</span>
                    <span className="block text-[1rem] text-xisto-suave">{c.unidade}</span>
                    {mudou && <span className="mt-1 block text-[1rem] text-caixilho">Era {euros(guardada.base[c.id])} · por guardar</span>}
                  </label>
                  <CampoEuros
                    id={`base-${c.id}`}
                    valor={base[c.id]}
                    aoMudar={(v) => setBase((b) => ({ ...b, [c.id]: v }))}
                    erro={!!erro}
                    descricao={`Entre ${min} e ${max} euros`}
                  />
                  {erro && (
                    <p role="alert" className="text-[1rem] leading-snug text-caixilho sm:col-span-2">
                      {erro}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Bloco>

        {/* 2 · promoções */}
        <Bloco numero={2} titulo="Promoções" texto="Um preço mais baixo, o pequeno-almoço oferecido ou um mimo à chegada, em certas noites. No site, o preço normal aparece riscado ao lado do novo.">
          {promocoes.length === 0 ? (
            <p className="border-y border-granito-linha py-5 text-xisto-suave">Não há promoções marcadas.</p>
          ) : (
            <ul className="space-y-4">
              {promocoes.map((p) => (
                <li key={p.id} className="border border-granito-linha border-l-[3px] border-l-caixilho bg-white/60 px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      {!idsGuardados.has(p.id) && <p className="etiqueta mb-1 text-[0.62rem] text-caixilho">Nova · por guardar</p>}
                      <p className="rustico-medio text-[1.5rem] leading-tight">{nomeDe(p)}</p>
                      <p className="mt-1 text-[1rem] text-xisto-suave">
                        <span className="first-letter:uppercase">{descreverDatas(p)}</span> ·{" "}
                        {p.de === p.ate ? "só essa noite" : `da noite de ${dataLonga(p.de)} à noite de ${dataLonga(p.ate)}`}
                        {p.minNoites ? ` · só em ${descreverMinimo(p)}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromocoes((l) => l.filter((x) => x.id !== p.id))}
                      className="premir inline-flex shrink-0 items-center gap-2 border border-xisto/30 px-4 py-2.5 text-[1rem] transition-colors hover:border-caixilho hover:text-caixilho"
                    >
                      <Trash2 size={17} /> Apagar
                    </button>
                  </div>
                  <ResumoPromocao p={p} base={baseEfetiva} />
                </li>
              ))}
            </ul>
          )}

          {nova ? (
            <FormularioPromocao
              nova={nova}
              setNova={setNova}
              base={baseEfetiva}
              hoje={hoje}
              aoJuntar={(p) => {
                setPromocoes((l) => [...l, p]);
                setNova(null);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setNova(NOVA_VAZIA)}
              className="botao mt-6 inline-flex items-center gap-3 border border-caixilho px-7 py-4 text-[1.15rem] text-caixilho"
            >
              <Plus size={20} /> Nova promoção
            </button>
          )}
        </Bloco>

        {/* 3 · como o hóspede vê: só para ver, nada para preencher */}
        <Bloco numero={3} titulo="Como o hóspede vê">
          <p className="etiqueta text-xisto-suave">Hoje no site</p>
          <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ALVOS.map((a) => {
              const { preco, antes, promo } = aplicarPromocoes(tabelaGuardada, a.id, hoje, guardada.base[a.id]);
              return (
                <li key={a.id} className="bg-white/45 px-5 py-4 ring-1 ring-granito-linha">
                  <p className="rustico-medio text-[1.35rem] leading-tight">{a.nome}</p>
                  <p className="mt-3 border-t border-granito-linha pt-3">
                    {antes !== null && (
                      <span className="block text-sm text-xisto-suave">
                        {promo && promo !== NOME_PADRAO ? `${promo} · ` : ""}
                        <Riscado antes={antes} />
                      </span>
                    )}
                    <span className="rustico-medio text-[1.35rem]">{euros(preco)}</span>
                    <span className="ml-1 text-sm text-xisto-suave">/ noite</span>
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="etiqueta mt-10 text-xisto-suave">As promoções, como aparecem em «Reservar»</p>
          {promocoes.length ? (
            <div className="mt-4 bg-cal px-5 py-5 ring-1 ring-granito-linha" inert>
              <AvisoPromocoes promocoes={[...promocoes].sort((a, b) => a.de.localeCompare(b.de))} base={baseEfetiva} aoEscolher={() => {}} className="" />
            </div>
          ) : (
            <p className="mt-3 text-xisto-suave">Não há promoções marcadas.</p>
          )}
          {porGuardar && promocoes.length > 0 && <p className="mt-3 text-[1rem] text-xisto-suave">Já com as alterações por guardar.</p>}
        </Bloco>

        {/* 4 · guardar */}
        <Bloco numero={4} titulo="Guardar" texto="Nada muda no site até carregar em «Guardar».">
          {errosPromocoes.length > 0 && (
            <ul role="alert" className="mb-5 space-y-1 border-l-[3px] border-caixilho pl-4 text-[1.05rem] text-caixilho">
              {errosPromocoes.map((e) => (
                <li key={e} className="first-letter:uppercase">
                  {e}
                </li>
              ))}
            </ul>
          )}
          {mudancas.length > 0 ? (
            <div className="border border-granito-linha bg-white/60 px-5 py-5 sm:px-6">
              <p className="etiqueta text-[0.62rem] text-xisto-suave">O que vai mudar</p>
              <ul className="mt-3 space-y-2">
                {mudancas.map((m) => (
                  <li key={m} className="flex gap-3 leading-snug">
                    <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-caixilho" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !errosBase.length && <p className="text-xisto-suave">Não há alterações por guardar.</p>
          )}
          {!baseValida && <p className="text-caixilho">Corrija os preços assinalados a vermelho, lá em cima.</p>}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <BotaoGuardar desligado={!podeGuardar} aGuardar={fase.tipo === "a-guardar"} aoPremir={() => enviar("guardar")} />
            {porGuardar && (
              <button type="button" onClick={esquecer} className="sublinha text-[1.05rem] text-xisto">
                Esquecer as alterações
              </button>
            )}
          </div>
          <Mensagem fase={fase} />

          {anterior && !porGuardar && (
            <div className="mt-12 border-t border-granito-linha pt-8">
              <p className="rustico-medio text-[1.4rem]">Enganou-se?</p>
              <p className="mt-1 text-xisto-suave">
                Pode desfazer a última alteração{estado.doc.atualizadoEm ? ` (de ${quando(estado.doc.atualizadoEm)})` : ""}.
              </p>
              {!confirmarDesfazer ? (
                <button
                  type="button"
                  onClick={() => setConfirmarDesfazer(true)}
                  className="premir mt-5 inline-flex items-center gap-3 border border-xisto/35 px-6 py-3.5 text-[1.1rem] transition-colors hover:border-xisto"
                >
                  <Undo2 size={19} /> Desfazer a última alteração
                </button>
              ) : (
                <div className="mt-5 border border-granito-linha bg-white/60 px-5 py-5 sm:px-6">
                  <p className="font-medium">Os preços voltam a ficar assim:</p>
                  <ul className="mt-3 space-y-2">
                    {(desfazerMuda.length ? desfazerMuda : ["Nada muda nos preços em vigor."]).map((m) => (
                      <li key={m} className="flex gap-3 leading-snug">
                        <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-xisto-suave" />
                        {m}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => enviar("desfazer")}
                      disabled={fase.tipo === "a-guardar"}
                      className="botao inline-flex items-center gap-3 border border-caixilho bg-caixilho px-7 py-4 text-[1.1rem] text-cal disabled:opacity-60"
                    >
                      {fase.tipo === "a-guardar" ? <LoaderCircle size={19} className="animate-spin" /> : <Undo2 size={19} />} Sim, desfazer
                    </button>
                    <button type="button" onClick={() => setConfirmarDesfazer(false)} className="sublinha text-[1.05rem]">
                      Não, deixar como está
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Bloco>
      </div>

      {/* A barra de baixo: só quando há alterações por guardar. */}
      <div
        aria-hidden={!porGuardar}
        className={`fixed inset-x-0 bottom-0 z-30 bg-vale text-cal shadow-[0_-8px_24px_rgb(34_31_27/0.18)] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
          porGuardar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[52rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-10">
          <p className="text-[1.1rem]">
            {!baseValida
              ? "Há um preço por corrigir."
              : errosPromocoes.length
                ? "Há uma promoção por corrigir."
                : `${mudancas.length} ${mudancas.length === 1 ? "alteração" : "alterações"} por guardar`}
          </p>
          <BotaoGuardar desligado={!podeGuardar} aGuardar={fase.tipo === "a-guardar"} aoPremir={() => enviar("guardar")} claro tabIndex={porGuardar ? 0 : -1} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Bloco({ numero, titulo, texto, children }: { numero: number; titulo: string; texto?: string; children: ReactNode }) {
  return (
    <div>
      <p className="etiqueta text-xisto-suave">Passo {numero}</p>
      <h2 className="rustico mt-2 text-[clamp(2rem,4vw,2.6rem)] leading-[1.05]">{titulo}</h2>
      {texto && <p className="mt-2 max-w-[52ch] text-[1.1rem] leading-relaxed text-xisto-suave">{texto}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function CampoEuros({
  id,
  valor,
  aoMudar,
  erro,
  descricao,
  rotulo,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: boolean;
  descricao?: string;
  rotulo?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={valor}
        aria-label={rotulo}
        aria-invalid={erro || undefined}
        title={descricao}
        onChange={(e) => aoMudar(e.target.value)}
        className={`rustico-medio h-16 w-32 border bg-white/80 px-4 text-right text-[1.9rem] focus:outline-none ${
          erro ? "border-caixilho ring-1 ring-caixilho" : "border-granito-linha focus:border-xisto"
        }`}
      />
      <span className="rustico-medio text-[1.6rem]">€</span>
    </span>
  );
}

function BotaoGuardar({
  desligado,
  aGuardar,
  aoPremir,
  claro = false,
  tabIndex,
}: {
  desligado: boolean;
  aGuardar: boolean;
  aoPremir: () => void;
  claro?: boolean;
  tabIndex?: number;
}) {
  return (
    <button
      type="button"
      onClick={aoPremir}
      disabled={desligado}
      tabIndex={tabIndex}
      className={`botao inline-flex items-center gap-3 border px-9 py-4 text-[1.2rem] disabled:cursor-not-allowed disabled:opacity-50 ${
        claro ? "border-caixilho-claro bg-caixilho-claro text-cal" : "border-caixilho bg-caixilho text-cal"
      }`}
    >
      {aGuardar ? <LoaderCircle size={20} className="animate-spin" /> : <Check size={20} />}
      {aGuardar ? "A guardar…" : "Guardar"}
    </button>
  );
}

function Mensagem({ fase }: { fase: Fase }) {
  if (fase.tipo === "guardado")
    return (
      <p role="status" className="mt-6 border-l-[3px] border-vale bg-white/60 px-5 py-4 text-[1.15rem] leading-relaxed">
        <strong className="font-medium">{fase.quando}</strong> · {fase.texto}
      </p>
    );
  if (fase.tipo === "erro")
    return (
      <div role="alert" className="mt-6 border-l-[3px] border-caixilho pl-4 text-[1.1rem] leading-relaxed">
        <p>{fase.texto}</p>
        {fase.mudou && (
          <button type="button" onClick={() => window.location.reload()} className="sublinha mt-2 text-caixilho">
            Abrir os preços atuais
          </button>
        )}
      </div>
    );
  return null;
}

/* ------------------------------------------------------------------ */
/* O resumo de uma promoção na lista                                    */
/* ------------------------------------------------------------------ */

function ResumoPromocao({ p, base }: { p: Promocao; base: PrecosBase }) {
  const b = baixaPreco(p);
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[1rem] text-xisto-suave">Quartos: {p.alvos.map(nomeAlvo).join(", ")}</p>
      {b && (
        <ul className="flex flex-wrap gap-x-7 gap-y-1">
          {p.alvos.map((a) => {
            const v = precoDaPromocao(p, a, base[a]);
            return (
              <li key={a} className="text-[1.1rem]">
                {nomeAlvo(a)}:{" "}
                <span className="rustico-medio text-[1.3rem]">
                  <Riscado antes={base[a]} className="text-[1.05rem] text-xisto-suave" />
                  {v !== null ? euros(v) : "?"}
                </span>
                {b === "desconto" && <span className="text-[0.95rem] text-xisto-suave"> ({p.desconto} %)</span>}
              </li>
            );
          })}
        </ul>
      )}
      {ofereceAlmoco(p) && (
        <p className="text-[1.1rem]">
          Pequeno-almoço <Riscado antes={base.pequenoAlmoco} />
          <span className="font-medium">oferecido</span>
        </p>
      )}
      {p.oferta && (
        <p className="flex items-baseline gap-2 text-[1.1rem]">
          <span className="etiqueta shrink-0 text-[0.62rem] text-caixilho">Oferta</span>
          {p.oferta}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nova promoção: um cartão, por esta ordem:                            */
/*   1 nome · 2 quando · 3 quartos · 4 o que oferece · 5 mínimo · 6 prévia */
/* ------------------------------------------------------------------ */

const escolha = (on: boolean) =>
  `premir inline-flex items-center gap-2 border px-5 py-3 text-[1.1rem] transition-colors duration-150 ${
    on ? "border-xisto bg-xisto text-cal" : "border-granito-linha bg-white/60 hover:border-xisto/50"
  }`;

/** O título de cada parte do cartão: número, pergunta e uma ajuda curta. */
function Parte({ n, titulo, ajuda, children }: { n: number; titulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-granito-linha pt-6 first:border-t-0 first:pt-0">
      <legend className="float-left w-full">
        <span className="rustico-medio text-[1.45rem] leading-tight">
          <span className="text-caixilho">{n}.</span> {titulo}
        </span>
      </legend>
      {ajuda && <p className="clear-both pt-1 text-[1rem] leading-snug text-xisto-suave">{ajuda}</p>}
      <div className="clear-both pt-4">{children}</div>
    </fieldset>
  );
}

/** Uma caixa grande de marcar, com o que abre por baixo quando marcada. */
function Caixa({ marcada, aoMudar, rotulo, ajuda, children }: { marcada: boolean; aoMudar: (v: boolean) => void; rotulo: string; ajuda?: string; children?: ReactNode }) {
  return (
    <div className={`border px-5 py-4 transition-colors duration-150 ${marcada ? "border-xisto bg-white/80" : "border-granito-linha bg-white/40"}`}>
      <label className="flex cursor-pointer items-start gap-4">
        <input type="checkbox" checked={marcada} onChange={(e) => aoMudar(e.target.checked)} className="mt-1 size-6 shrink-0 accent-[#7a2b2b]" />
        <span>
          <span className="block text-[1.2rem] font-medium leading-tight">{rotulo}</span>
          {ajuda && <span className="mt-0.5 block text-[1rem] text-xisto-suave">{ajuda}</span>}
        </span>
      </label>
      {marcada && children && <div className="mt-4 pl-10">{children}</div>}
    </div>
  );
}

function FormularioPromocao({
  nova,
  setNova,
  base,
  hoje,
  aoJuntar,
}: {
  nova: NovaPromocao;
  setNova: (n: NovaPromocao | null) => void;
  base: PrecosBase;
  hoje: string;
  aoJuntar: (p: Promocao) => void;
}) {
  const [tentou, setTentou] = useState(false);
  const nomeLimpo = normalizarNome(nova.nome);
  const fraseLimpa = normalizarFrase(nova.frase);
  const frasesSugeridas = frasesDaSugestao(nova.nome);
  // O nome muda: a frase só acompanha se estiver vazia ou for uma das frases sugeridas (não escrita à mão).
  const mudarNome = (nome: string) => {
    const f = frasesDaSugestao(nome);
    const sugeridas = SUGESTOES_NOME.flatMap((n) => frasesDaSugestao(n));
    // Escrita à mão: fica. Senão, a sugestão traz a sua frase; um nome próprio deixa-a vazia.
    if (nova.frase.trim() && !sugeridas.includes(nova.frase.trim())) return mudar({ nome });
    const frase = fraseAoEscolherSugestao(nova.frase, sugeridas, f);
    mudar({ nome, frase: frase ?? "", fraseDaSugestao: !!frase });
  };
  const outraFrase = () => {
    const i = frasesSugeridas.indexOf(nova.frase.trim());
    mudar({ frase: frasesSugeridas[(i + 1) % frasesSugeridas.length], fraseDaSugestao: true });
  };
  const ofertaLimpa = normalizarOferta(nova.oferta);
  const promo: Promocao = {
    id: "nova",
    ...(nova.nome.trim() ? { nome: nova.nome } : {}),
    ...(nova.frase.trim() ? { frase: nova.frase } : {}),
    de: nova.de,
    ate: nova.ate,
    alvos: nova.alvos,
    ...(nova.comPreco && nova.modoPreco === "desconto" ? { desconto: numero(nova.desconto) } : {}),
    ...(nova.comPreco && nova.modoPreco === "preco" ? { precos: Object.fromEntries(nova.alvos.map((a) => [a, numero(nova.precos[a] ?? "")])) } : {}),
    ...(nova.comAlmoco ? { pequenoAlmoco: true } : {}),
    ...(nova.comOferta ? { oferta: nova.oferta } : {}),
    ...(nova.comMinimo ? { minNoites: numero(nova.minNoites) } : {}),
  };
  const erros = errosPromocao(promo, base, hoje, true);
  const mudar = (m: Partial<NovaPromocao>) => setNova({ ...nova, ...m });
  const alternar = (a: Alvo) => mudar({ alvos: nova.alvos.includes(a) ? nova.alvos.filter((x) => x !== a) : [...nova.alvos, a] });

  // A promoção já limpa, como vai ficar guardada (o servidor volta a limpar: é ele que manda).
  const limpa: Promocao = {
    ...promo,
    ...(nomeLimpo.texto && !nomeLimpo.erro ? { nome: nomeLimpo.texto } : { nome: undefined }),
    ...(fraseLimpa.texto && !fraseLimpa.erro ? { frase: fraseLimpa.texto } : { frase: undefined }),
    ...(nova.comOferta && !ofertaLimpa.erro ? { oferta: ofertaLimpa.texto } : { oferta: undefined }),
  };
  const juntar = () => {
    setTentou(true);
    if (erros.length) return;
    const { nome, frase, oferta, ...resto } = limpa;
    aoJuntar({ ...resto, id: novoId(), ...(nome ? { nome } : {}), ...(frase ? { frase } : {}), ...(oferta ? { oferta } : {}) });
  };

  const datasCertas = !!nova.de && !!nova.ate && nova.ate >= nova.de;

  return (
    <div className="mt-6 border border-xisto/25 bg-white/70 px-5 py-7 sm:px-8 sm:py-8">
      <p className="rustico text-[clamp(1.9rem,3.6vw,2.3rem)] leading-tight">Nova promoção</p>
      <div className="mt-7 space-y-8">
        <Parte n={1} titulo="Nome da promoção" ajuda="Opcional. Se é para uma época ou um evento, ponha o nome. Sem nome, aparece «Promoção».">
          <input
            type="text"
            value={nova.nome}
            onChange={(e) => mudarNome(e.target.value)}
            placeholder="Por exemplo: Magusto"
            autoComplete="off"
            aria-label="Nome da promoção"
            className={`h-14 w-full border bg-white/80 px-4 text-[1.2rem] focus:outline-none ${nomeLimpo.erro ? "border-caixilho ring-1 ring-caixilho" : "border-granito-linha focus:border-xisto"}`}
          />
          {nova.nome.trim() && (
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 text-[1rem]">
              <p className={nomeLimpo.erro ? "text-caixilho" : "text-xisto-suave"}>
                {nomeLimpo.erro ?? (nomeLimpo.texto !== nova.nome.trim() ? <>No site fica: «{nomeLimpo.texto}»</> : "Fica assim no site.")}
              </p>
              <p className={tamanhoOferta(nomeLimpo.texto) > NOME_MAX ? "font-medium text-caixilho" : "text-xisto-suave"}>
                {tamanhoOferta(nomeLimpo.texto)} / {NOME_MAX}
              </p>
            </div>
          )}
          <p className="mt-4 text-[1rem] text-xisto-suave">Sugestões (cada uma traz uma frase, que pode mudar):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGESTOES_NOME.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => mudarNome(n)}
                className={`premir rounded-full border px-4 py-2 text-[1rem] transition-colors duration-150 ${
                  nova.nome === n ? "border-xisto bg-xisto text-cal" : "border-granito-linha bg-white/60 hover:border-xisto/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Parte>

        <Parte n={2} titulo="Frase da promoção" ajuda="Aparece no site e nos emails, por baixo do nome. Opcional: sem frase, o site usa uma neutra.">
          <textarea
            rows={2}
            value={nova.frase}
            onChange={(e) => mudar({ frase: e.target.value, fraseDaSugestao: false })}
            placeholder={FRASE_NEUTRA}
            aria-label="Frase da promoção"
            className={`block w-full border bg-white/80 px-4 py-3 text-[1.15rem] leading-snug focus:outline-none ${fraseLimpa.erro ? "border-caixilho ring-1 ring-caixilho" : "border-granito-linha focus:border-xisto"}`}
          />
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[1rem]">
            <p className={fraseLimpa.erro ? "text-caixilho" : "text-xisto-suave"}>
              {!nova.frase.trim()
                ? `Sem frase, o site diz: «${FRASE_NEUTRA}».`
                : fraseLimpa.erro ?? (fraseLimpa.texto !== nova.frase.trim() ? <>No site fica: «{fraseLimpa.texto}»</> : "Fica assim no site.")}
            </p>
            <p className={tamanhoOferta(fraseLimpa.texto) > FRASE_MAX ? "font-medium text-caixilho" : "text-xisto-suave"}>
              {tamanhoOferta(fraseLimpa.texto)} / {FRASE_MAX}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {frasesSugeridas.length > 1 && (
              <button type="button" onClick={outraFrase} className="premir border border-xisto/35 px-5 py-2.5 text-[1.05rem] transition-colors hover:border-xisto">
                Outra frase
              </button>
            )}
            {nova.frase.trim() && (
              <button type="button" onClick={() => mudar({ frase: "", fraseDaSugestao: false })} className="sublinha text-[1.05rem]">
                Apagar a frase
              </button>
            )}
          </div>
        </Parte>

        <Parte n={3} titulo="Quando começa e quando acaba">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <label className="block">
              <span className="block text-[1.05rem]">Começa a</span>
              <input
                type="date"
                value={nova.de}
                min={hoje}
                onChange={(e) => mudar({ de: e.target.value, ate: !nova.ate || nova.ate < e.target.value ? e.target.value : nova.ate })}
                className="mt-1 h-14 border border-granito-linha bg-white/80 px-4 text-[1.15rem] focus:border-xisto focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-[1.05rem]">Acaba a</span>
              <input
                type="date"
                value={nova.ate}
                min={nova.de || hoje}
                onChange={(e) => mudar({ ate: e.target.value })}
                className="mt-1 h-14 border border-granito-linha bg-white/80 px-4 text-[1.15rem] focus:border-xisto focus:outline-none"
              />
            </label>
          </div>
          <p className="mt-3 text-[1.1rem]">
            {datasCertas ? (
              <>
                {nova.de === nova.ate ? `Vale para ${descreverDatas({ de: nova.de, ate: nova.ate })}.` : `Vale para as noites ${descreverDatas({ de: nova.de, ate: nova.ate })}.`}
              </>
            ) : (
              <span className="text-xisto-suave">Escolha os dois dias. Conta a noite de cada dia, os dois incluídos.</span>
            )}
          </p>
        </Parte>

        <Parte n={4} titulo="Quartos" ajuda="Para que quartos é a promoção.">
          <div className="flex flex-wrap gap-3">
            {ALVOS.map((a) => {
              const on = nova.alvos.includes(a.id);
              return (
                <button key={a.id} type="button" aria-pressed={on} onClick={() => alternar(a.id)} className={escolha(on)}>
                  {on && <Check size={17} strokeWidth={2.5} />}
                  {a.nome}
                </button>
              );
            })}
          </div>
        </Parte>

        <Parte n={5} titulo="O que oferece" ajuda="Marque uma ou mais. Pode juntar as três na mesma promoção.">
          <div className="space-y-3">
            <Caixa marcada={nova.comPreco} aoMudar={(v) => mudar({ comPreco: v })} rotulo="Baixar o preço do quarto">
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["desconto", "Desconto em %"],
                    ["preco", "Preço novo por noite"],
                  ] as const
                ).map(([m, t]) => (
                  <button key={m} type="button" aria-pressed={nova.modoPreco === m} onClick={() => mudar({ modoPreco: m })} className={escolha(nova.modoPreco === m)}>
                    {t}
                  </button>
                ))}
              </div>
              {nova.modoPreco === "desconto" ? (
                <label className="mt-4 flex flex-wrap items-center gap-3">
                  <span>Desconto de</span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    value={nova.desconto}
                    onChange={(e) => mudar({ desconto: e.target.value.replace(/%/g, "") })}
                    className="rustico-medio h-16 w-24 border border-granito-linha bg-white/80 px-4 text-right text-[1.9rem] focus:border-xisto focus:outline-none"
                  />
                  <span className="rustico-medio text-[1.6rem]">%</span>
                  <span className="text-[1rem] text-xisto-suave">
                    (entre {DESCONTO_MIN} e {DESCONTO_MAX})
                  </span>
                </label>
              ) : nova.alvos.length === 0 ? (
                <p className="mt-4 text-xisto-suave">Escolha primeiro os quartos, em 4.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {ALVOS.filter((a) => nova.alvos.includes(a.id)).map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <label htmlFor={`promo-${a.id}`} className="min-w-[9rem]">
                        <span className="block text-[1.15rem]">{a.nome}</span>
                        <span className="block text-[0.95rem] text-xisto-suave">normal {euros(base[a.id])}</span>
                      </label>
                      <CampoEuros id={`promo-${a.id}`} valor={nova.precos[a.id] ?? ""} aoMudar={(v) => mudar({ precos: { ...nova.precos, [a.id]: v } })} />
                    </li>
                  ))}
                </ul>
              )}
            </Caixa>
            <Caixa
              marcada={nova.comAlmoco}
              aoMudar={(v) => mudar({ comAlmoco: v })}
              rotulo="Pequeno-almoço oferecido"
              ajuda={`Nessas noites não se paga o pequeno-almoço (${euros(base.pequenoAlmoco)} por adulto).`}
            />
            <Caixa marcada={nova.comOferta} aoMudar={(v) => mudar({ comOferta: v })} rotulo="Outra oferta" ajuda="Uma frase curta. Não muda o preço.">
              <input
                type="text"
                value={nova.oferta}
                onChange={(e) => mudar({ oferta: e.target.value })}
                placeholder="Por exemplo: garrafa de vinho do Dão à chegada"
                autoComplete="off"
                aria-label="Outra oferta"
                className={`h-14 w-full border bg-white/80 px-4 text-[1.15rem] focus:outline-none ${
                  nova.oferta.trim() && ofertaLimpa.erro ? "border-caixilho ring-1 ring-caixilho" : "border-granito-linha focus:border-xisto"
                }`}
              />
              {nova.oferta.trim() && (
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[1rem]">
                  <p className={ofertaLimpa.erro ? "text-caixilho" : "text-xisto-suave"}>
                    {ofertaLimpa.erro ?? (ofertaLimpa.texto !== nova.oferta.trim() ? <>No site fica: «{ofertaLimpa.texto}»</> : "Fica assim no site.")}
                  </p>
                  <p aria-live="polite" className={tamanhoOferta(ofertaLimpa.texto) > OFERTA_MAX ? "font-medium text-caixilho" : "text-xisto-suave"}>
                    {tamanhoOferta(ofertaLimpa.texto)} / {OFERTA_MAX}
                  </p>
                </div>
              )}
            </Caixa>
          </div>
        </Parte>

        <Parte n={6} titulo="Só para estadias mais longas?" ajuda="Opcional.">
          <label className="flex flex-wrap items-center gap-3">
            <input type="checkbox" checked={nova.comMinimo} onChange={(e) => mudar({ comMinimo: e.target.checked })} className="size-6 accent-[#7a2b2b]" />
            <span>Só para estadias de</span>
            <input
              inputMode="numeric"
              value={nova.minNoites}
              disabled={!nova.comMinimo}
              onChange={(e) => mudar({ minNoites: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              aria-label="Número mínimo de noites"
              className="h-12 w-16 border border-granito-linha bg-white/80 px-3 text-right text-[1.15rem] focus:border-xisto focus:outline-none disabled:opacity-50"
            />
            <span>noites ou mais</span>
          </label>
          {nova.comMinimo && (
            <p className="mt-2 text-[1rem] text-xisto-suave">
              Entre {MIN_NOITES_MIN} e {MIN_NOITES_MAX}. Quem ficar menos noites vê um convite discreto, sem a promoção.
            </p>
          )}
        </Parte>

        <Parte n={7} titulo="Assim o hóspede vai ver" ajuda="Uma simulação do formulário de «Reservar» nessa época: as primeiras noites da promoção, 2 adultos e pequeno-almoço.">
          <SimulacaoHospede p={limpa} base={base} />
        </Parte>
      </div>

      {tentou && erros.length > 0 && (
        <ul role="alert" className="mt-7 space-y-1 border-l-[3px] border-caixilho pl-4 text-[1.05rem] text-caixilho">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={juntar} className="botao inline-flex items-center gap-3 border border-xisto bg-xisto px-7 py-4 text-[1.1rem] text-cal">
          <Plus size={19} /> Juntar esta promoção
        </button>
        <button type="button" onClick={() => setNova(null)} className="sublinha text-[1.05rem]">
          Cancelar
        </button>
      </div>
      <p className="mt-3 text-[0.98rem] text-xisto-suave">Depois de juntar, carregue em «Guardar» para a pôr no site.</p>
    </div>
  );
}

/*
  «Assim o hóspede vai ver»: uma simulação do formulário de /reservar nessa
  época, com as peças verdadeiras (o aviso, os cartões dos quartos, as contas)
  e as mesmas contas. Datas: as primeiras noites da promoção que cumprem o
  mínimo (a partir da primeira chegada que o formulário aceita), 2 adultos e
  pequeno-almoço. Dentro de uma moldura de browser, inerte: nada se clica,
  nada vai para a rede. «No email»: o excerto do email ao hóspede.
*/
function SimulacaoHospede({ p, base }: { p: Promocao; base: PrecosBase }) {
  const [vista, setVista] = useState<"site" | "email">("site");
  const pronta = p.alvos.length > 0 && !!p.de && !!p.ate && p.ate >= p.de && (baixaPreco(p) || ofereceAlmoco(p) || p.oferta);
  if (!pronta) return <p className="text-xisto-suave">Escolha as datas, os quartos e o que oferece, e aparece aqui o que o hóspede vê.</p>;
  const t = { versao: 0, atualizadoEm: null, base, promocoes: [p] };
  const primeira = primeiraChegadaFormulario();
  const alvo = p.alvos[0];
  const casa = alvo === "casa";
  const n = Math.max(p.minNoites ?? 2, casa ? 2 : 1);
  const chegada = deIso(p.de > primeira ? p.de : primeira)!;
  const saida = somarDias(chegada, n);
  const noites = noitesDe(chegada, saida).map(iso);
  const escolha = casa ? {} : { [alvo]: 1 };
  const grupo = { adultos: 2, criancas: [] };
  const contas = calcular(chegada, saida, escolha, grupo, true, casa, t);
  const aviso = p.de <= somarDiasIso(primeira, 60) && p.ate >= primeira;
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const curta = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]}`;

  return (
    <div>
      <div role="tablist" aria-label="Onde o hóspede vê" className="inline-flex border border-granito-linha p-1">
        {(
          [
            ["site", "No site"],
            ["email", "No email"],
          ] as const
        ).map(([v, t]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => setVista(v)}
            className={`premir px-5 py-2.5 text-[1.05rem] transition-colors duration-150 ${vista === v ? "bg-xisto text-cal" : "text-xisto-suave hover:text-xisto"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* a moldura: uma janela de browser, para se perceber que é uma simulação */}
      <div className="mt-4 overflow-hidden rounded-lg border border-xisto/20 shadow-[0_10px_30px_rgb(34_31_27/0.12)]">
        <div className="flex items-center gap-2 border-b border-xisto/10 bg-granito px-4 py-2.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-xisto/20" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-xisto/20" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-xisto/20" />
          <span className="ml-3 truncate rounded bg-cal/80 px-3 py-0.5 text-[0.8rem] text-xisto-suave">
            {vista === "site" ? "quintadecanhoes.com/reservar" : "Email · Há lugar para si"}
          </span>
          <span className="etiqueta ml-auto text-[0.58rem] text-xisto-suave">Simulação</span>
        </div>

        {vista === "site" ? (
          <div inert className="bg-cal px-5 py-6 text-[1rem] sm:px-6">
            {aviso ? (
              <AvisoPromocoes promocoes={[p]} base={base} aoEscolher={() => {}} className="mb-8" />
            ) : (
              <p className="mb-8 text-sm text-xisto-suave">(O aviso só aparece nos 60 dias antes de a promoção começar.)</p>
            )}
            <p className="etiqueta mb-3 text-xisto-suave">
              {curta(chegada)} → {curta(saida)} · {n} {n === 1 ? "noite" : "noites"} · 2 adultos
            </p>
            {casa ? (
              <CasaInteira livre preco={aplicarPromocoes(t, "casa", noites[0], base.casa, n)} />
            ) : (
              <ul className={`grid grid-cols-1 gap-4 ${p.alvos.filter((a) => a !== "casa").length > 1 ? "sm:grid-cols-2" : "max-w-[22.5rem]"}`}>
                {quartos.filter((q) => p.alvos.includes(q.id)).map((q) => (
                  <CartaoQuarto
                    key={q.id}
                    q={q}
                    n={q.id === alvo ? 1 : 0}
                    preco={aplicarPromocoes(t, q.id, noites[0], base[q.id], n)}
                    destaques={destaquesDoQuarto(t, q.id, noites)}
                    aoMudar={() => {}}
                  />
                ))}
              </ul>
            )}
            <p className="etiqueta mb-3 mt-8 text-xisto-suave">As contas</p>
            <ContasEstadia contas={contas} compacto />
          </div>
        ) : (
          <EmailSimulado contas={contas} chegada={chegada} saida={saida} escolha={escolha} casa={casa} t={t} />
        )}
      </div>
    </div>
  );
}

/* O excerto do email «Há lugar para si», com as mesmas frases que o servidor escreve (mensagemPromocao). */
function EmailSimulado({
  chegada,
  saida,
  escolha,
  casa,
  t,
  contas,
}: {
  chegada: Date;
  saida: Date;
  escolha: Record<string, number>;
  casa: boolean;
  t: { versao: number; atualizadoEm: null; base: PrecosBase; promocoes: Promocao[] };
  contas: ReturnType<typeof calcular>;
}) {
  const pedido = montarPedido(
    {
      chegada,
      saida,
      grupo: { adultos: 2, criancas: [] },
      escolha,
      casaInteira: casa,
      comPequenoAlmoco: true,
      hospede: { nome: "Ana Ribeiro", email: "ana@exemplo.pt", telefone: "912345678", mensagem: "" },
      pagamento: "mbway",
    },
    t,
  );
  const m = mensagemPromocao(pedido);
  const serifa = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";
  return (
    <div inert className="bg-[#f3e9d8] px-4 py-6">
      <div className="mx-auto max-w-[34rem] border-t-4 border-caixilho bg-[#fbf6ec] px-7 py-7 text-[#221f1b]">
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[#5e584e]">Disponibilidade confirmada</p>
        <p className="mt-2 text-[1.9rem] leading-tight text-caixilho" style={{ fontFamily: serifa }}>
          Há lugar para si, Ana.
        </p>
        <p className="mt-3 text-[0.98rem] leading-relaxed">Para ficar reservado, falta só o sinal de 30 %. Assim que chegar, enviamos-lhe a confirmação.</p>
        {m.frases.map((f) => (
          <p key={f} className="mt-3 text-[0.98rem] leading-relaxed">
            {f}.
          </p>
        ))}
        {m.linha && <p className="mt-3 text-[0.98rem] leading-relaxed">{m.linha}</p>}
        <div className="mt-5 border border-[#e3d9c6] border-t-[3px] border-t-caixilho bg-white px-5 py-4">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[#5e584e]">Sinal a pagar</p>
          <p className="mt-1 text-[2.2rem] leading-none" style={{ fontFamily: serifa }}>
            {euros(contas.sinal ?? 0)}
          </p>
          <p className="mt-2 text-[0.9rem] text-[#5e584e]">Total da estadia {euros(contas.total ?? 0)}</p>
        </div>
        <p className="mt-4 text-[0.8rem] text-[#8a8275]">(Excerto. O resto do email é igual ao de qualquer reserva.)</p>
      </div>
    </div>
  );
}

const somarDiasIso = (v: string, n: number) => iso(somarDias(deIso(v)!, n));
