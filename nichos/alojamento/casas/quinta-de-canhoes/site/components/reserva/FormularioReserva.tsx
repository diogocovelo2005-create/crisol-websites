"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, Minus, PawPrint, Plus } from "lucide-react";
import { fotos } from "@/lib/fotos";
import { enviarPedido } from "@/lib/reserva-envio";
import { contactos, linkWhatsapp } from "@/lib/contactos";
import {
  FORMAS_PAGAMENTO,
  NOTA_ANIMAIS,
  NOTA_ANIMAIS_GRANDES,
  descreverAnimal,
  type TipoAnimal,
  noitesMinimas,
  NOITES_RECOMENDADAS,
  PEQUENO_ALMOCO_POR_PESSOA,
  PESSOAS_MAX,
  CAMAS_SUPLEMENTARES_POR_QUARTO,
  CRIANCAS_MAX,
  ESCALOES,
  NOTA_CRIANCAS,
  criancasCama,
  descreverGrupo,
  lugaresNormais,

  type Escalao,
  type Grupo,
  POLITICA_SINAL,
  QUANDO_RESTANTE,
  SINAL_PERCENTAGEM,
  UNIDADES_MAX,
  calcular,
  descreverEscolha,
  emailValido,
  euros,
  iso,
  lugaresDe,
  montarPedido,
  noitesDe,
  noitesEntre,
  noitesFechadas,
  deIso,
  cabeNasNoites,
  casaLivreEm,
  primeiraChegadaFormulario,
  type Ocupacao,
  precoDaNoite,
  quartos,
  quartosDe,
  somarDias,
  sugestao,
  sugestaoCompleta,
  mesmaEscolha,
  PRECO_CASA_INTEIRA,
  telefoneValido,
  tipoLivreEm,
  type Contas,
  type Escolha,
  type FormaPagamento,
  type TipoQuarto,
} from "@/lib/reserva";

/*
  O formulário de reserva direta da Quinta de Canhões. Três passos, como no
  filme da reserva direta: (1) datas, pessoas e quarto, com a sugestão e o
  pequeno-almoço; (2) os dados e a forma de pagar o sinal; (3) o pedido
  enviado, que ainda não é reserva.

  Os preços, o sinal e as condições vêm de lib/reserva.ts; o envio passa
  todo por lib/reserva-envio.ts (simulado por agora).

  Movimento: só o que confirma o gesto. Os passos trocam com uma passagem
  curta (sobe 8 px e aparece, 240 ms; sai em 140 ms); os botões encolhem ao
  premir; o resto muda de estado sem animação.
*/

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const CURVA = [0.23, 1, 0.32, 1] as const;

const igual = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
const curta = (d: Date) => `${SEMANA_LONGA[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESES_CURTO[d.getMonth()]}`;
const longa = (d: Date) => `${SEMANA_LONGA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

type Passo = 1 | 2 | 3;
type Dados = { nome: string; email: string; email2: string; telefone: string; mensagem: string };

export function FormularioReserva() {
  const parado = useReducedMotion();
  const [hoje, setHoje] = useState<Date | null>(null);
  const [mes, setMes] = useState<{ ano: number; mes: number } | null>(null);
  const [entrada, setEntrada] = useState<Date | null>(null);
  const [saida, setSaida] = useState<Date | null>(null);
  const [previa, setPrevia] = useState<Date | null>(null);
  const [adultos, setAdultos] = useState(2);
  // A idade de cada criança, por escalão (null enquanto não a indicar).
  const [criancas, setCriancas] = useState<(Escalao | null)[]>([]);
  const [escolha, setEscolha] = useState<Escolha>(sugestao({ adultos: 2, criancas: [] }));
  const [mexeuNosQuartos, setMexeuNosQuartos] = useState(false);
  const [casaInteira, setCasaInteira] = useState(false);
  const [comPequenoAlmoco, setComPequenoAlmoco] = useState(false);
  const [animal, setAnimal] = useState<TipoAnimal>("nao");
  const [passo, setPasso] = useState<Passo>(1);
  const [dados, setDados] = useState<Dados>({ nome: "", email: "", email2: "", telefone: "", mensagem: "" });
  const [tocados, setTocados] = useState<Partial<Record<keyof Dados, boolean>>>({});
  const [pagamento, setPagamento] = useState<FormaPagamento | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const topo = useRef<HTMLDivElement>(null);
  // Anti-spam: quando o formulário abriu, e um campo que só os robôs preenchem.
  const abertoEm = useRef(0);
  const armadilha = useRef<HTMLInputElement>(null);

  // O nosso calendário: as noites já tomadas por reservas confirmadas ou pagas.
  const [ocupacao, setOcupacao] = useState<Ocupacao>({});
  const lerOcupacao = () =>
    fetch("/api/disponibilidade")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.noites && setOcupacao(j.noites))
      .catch(() => {});

  // A primeira chegada que se pode pedir (depois de amanhã, em Portugal), só no
  // browser: a página é estática e o dia do build não é o dia de quem a abre.
  useEffect(() => {
    const h = deIso(primeiraChegadaFormulario())!;
    lerOcupacao();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o dia só existe no browser
    setHoje(h);
    setMes({ ano: h.getFullYear(), mes: h.getMonth() });
    abertoEm.current = Date.now();
  }, []);


  const grupo: Grupo = { adultos, criancas: criancas.filter((c): c is Escalao => c !== null) };

  const mudarGrupo = (a: number, c: (Escalao | null)[]) => {
    const novoA = Math.min(PESSOAS_MAX, Math.max(1, a));
    setAdultos(novoA);
    setCriancas(c);
    // Até o hóspede mexer à mão, a escolha acompanha a sugestão.
    if (!mexeuNosQuartos) {
      const s = sugestaoCompleta({ adultos: novoA, criancas: c.filter((x): x is Escalao => x !== null) });
      setEscolha(s.escolha);
      setCasaInteira(s.casaInteira);
    }
  };

  const mudarQuarto = (id: TipoQuarto, n: number) => {
    setMexeuNosQuartos(true);
    setCasaInteira(false);
    setEscolha((e) => ({ ...e, [id]: Math.min(UNIDADES_MAX[id], Math.max(0, n)) }));
  };

  const escolherModo = (casa: boolean) => {
    setMexeuNosQuartos(true);
    setCasaInteira(casa);
  };

  // Aplicar a sugestão principal volta a deixá-la acompanhar as pessoas.
  const aplicarSugestao = (casa: boolean) => {
    const s = sugestaoCompleta(grupo);
    setEscolha(s.escolha);
    setCasaInteira(casa);
    setMexeuNosQuartos(casa !== s.casaInteira);
  };

  const fechadas = useMemo(() => noitesFechadas(ocupacao, escolha, casaInteira), [ocupacao, escolha, casaInteira]);
  const noitesEscolhidas = entrada && saida ? noitesDe(entrada, saida).map(iso) : [];

  const escolherDia = (d: Date) => {
    if (!entrada || saida || d <= entrada) {
      setEntrada(d);
      setSaida(null);
      return;
    }
    // Uma estadia não pode passar por cima de uma noite sem quarto livre.
    if (noitesDe(entrada, d).some((n) => fechadas.has(iso(n)))) {
      setEntrada(d);
      return;
    }
    setSaida(d);
    setPrevia(null);
  };

  const noites = entrada && saida ? noitesEntre(entrada, saida) : 0;
  const recomendada = entrada && !saida ? somarDias(entrada, NOITES_RECOMENDADAS) : null;
  const sug = sugestaoCompleta(grupo);
  const sugeridos = sug.escolha;
  const nQuartos = quartosDe(escolha);
  const contas = entrada && saida && (casaInteira || nQuartos) ? calcular(entrada, saida, escolha, grupo, comPequenoAlmoco, casaInteira) : null;
  const faltamCamas =
    !casaInteira && nQuartos > 0 && (lugaresDe(escolha) < lugaresNormais(grupo) || nQuartos * CAMAS_SUPLEMENTARES_POR_QUARTO < criancasCama(grupo));
  const sugestaoAplicada = sug.casaInteira ? casaInteira : !casaInteira && mesmaEscolha(escolha, sug.escolha);
  const oQuePediu = casaInteira ? "A casa inteira" : descreverEscolha(escolha);

  const falta1 = !entrada
    ? "Escolha a chegada no calendário"
    : !saida
      ? "Escolha a saída no calendário"
      : noites < noitesMinimas(casaInteira)
        ? casaInteira
          ? `A casa inteira tem um mínimo de ${noitesMinimas(true)} noites`
          : `A estadia mínima é de ${plural(noitesMinimas(false), "noite", "noites")}`
        : !casaInteira && !nQuartos
          ? "Escolha pelo menos um quarto"
          : !cabeNasNoites(ocupacao, noitesEscolhidas, escolha, casaInteira)
            ? "Já não há lugar nestas datas para esta escolha"
            : criancas.some((c) => c === null)
            ? "Indique a idade de cada criança"
            : null;

  const erros: Partial<Record<keyof Dados, string>> = {
    nome: dados.nome.trim().length < 2 ? "Falta o nome" : undefined,
    email: !dados.email.trim() ? "Falta o email" : !emailValido(dados.email) ? "O email não parece completo" : undefined,
    email2: !dados.email2.trim()
      ? "Confirme o email"
      : dados.email2.trim().toLowerCase() !== dados.email.trim().toLowerCase()
        ? "Os dois emails não são iguais"
        : undefined,
    telefone: !dados.telefone.trim()
      ? "Falta o telemóvel"
      : !telefoneValido(dados.telefone)
        ? "O telemóvel não parece certo (9 algarismos, ou com o indicativo do país)"
        : undefined,
  };
  const falta2 = erros.nome ?? erros.email ?? erros.email2 ?? erros.telefone ?? (!pagamento ? "Escolha como paga o sinal" : null);

  const transicao = parado
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.15 } }, exit: { opacity: 0, transition: { duration: 0.1 } } }
    : {
        initial: { opacity: 0, transform: "translateY(8px)" },
        animate: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.24, ease: CURVA } },
        exit: { opacity: 0, transition: { duration: 0.14, ease: "easeOut" as const } },
      };

  const irPara = (p: Passo) => {
    setPasso(p);
    const el = topo.current;
    if (el && el.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: parado ? "auto" : "smooth" });
    }
  };

  const enviar = async () => {
    if (!entrada || !saida || !pagamento || falta2) {
      setTocados({ nome: true, email: true, email2: true, telefone: true });
      return;
    }
    setEnviando(true);
    setErroEnvio(null);
    const pedido = montarPedido({ chegada: entrada, saida, grupo, escolha, casaInteira, comPequenoAlmoco, animal, hospede: { nome: dados.nome, email: dados.email, telefone: dados.telefone, mensagem: dados.mensagem }, pagamento });
    const r = await enviarPedido(pedido, { armadilha: armadilha.current?.value ?? "", abertoEm: abertoEm.current });
    setEnviando(false);
    if (!r.ok) {
      setErroEnvio(r.erro);
      if (r.ocupado) lerOcupacao();
      return;
    }
    setReferencia(r.referencia);
    irPara(3);
  };

  const primeiroNome = dados.nome.trim().split(/\s+/)[0] ?? "";
  const formaEscolhida = FORMAS_PAGAMENTO.find((f) => f.id === pagamento);

  return (
    <div ref={topo} id="formulario" className="scroll-mt-28">
      <ol className="etiqueta mb-12 flex flex-wrap gap-x-10 gap-y-3 border-b border-granito-linha pb-5 text-xisto-suave" aria-label="Passos do pedido">
        {["Datas e quarto", "Os seus dados", "Pedido enviado"].map((t, i) => {
          const n = (i + 1) as Passo;
          const feito = passo > n;
          const aqui = passo === n;
          return (
            <li key={t} aria-current={aqui ? "step" : undefined} className={`flex items-center gap-3 ${aqui ? "text-xisto" : ""}`}>
              <span
                className={`grid size-7 place-items-center rounded-full border text-[0.72rem] tracking-normal ${
                  feito ? "border-caixilho bg-caixilho text-cal" : aqui ? "border-xisto text-xisto" : "border-granito-linha"
                }`}
              >
                {feito ? <Check size={13} strokeWidth={2.5} /> : n}
              </span>
              {t}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        {passo === 1 && (
          <motion.div key="p1" {...transicao}>
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[400px_1fr] lg:gap-16">
              {/* calendário, datas e pessoas */}
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="etiqueta text-xisto-suave">As datas</p>
                  {(entrada || saida) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEntrada(null);
                        setSaida(null);
                      }}
                      className="sublinha text-sm text-xisto-suave hover:text-xisto"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="rustico-medio text-[1.7rem] leading-none text-xisto" aria-live="polite">
                    {mes ? `${MESES[mes.mes][0].toUpperCase()}${MESES[mes.mes].slice(1)} ${mes.ano}` : " "}
                  </p>
                  <div className="flex gap-1.5">
                    <BotaoRedondo
                      rotulo="Mês anterior"
                      desligado={!mes || !hoje || (mes.ano === hoje.getFullYear() && mes.mes === hoje.getMonth())}
                      aoPremir={() => mes && setMes(mes.mes === 0 ? { ano: mes.ano - 1, mes: 11 } : { ano: mes.ano, mes: mes.mes - 1 })}
                    >
                      <ChevronLeft size={17} />
                    </BotaoRedondo>
                    <BotaoRedondo
                      rotulo="Mês seguinte"
                      desligado={!mes || !hoje || (mes.ano - hoje.getFullYear()) * 12 + mes.mes - hoje.getMonth() >= 12}
                      aoPremir={() => mes && setMes(mes.mes === 11 ? { ano: mes.ano + 1, mes: 0 } : { ano: mes.ano, mes: mes.mes + 1 })}
                    >
                      <ChevronRight size={17} />
                    </BotaoRedondo>
                  </div>
                </div>

                <Calendario
                  mes={mes}
                  hoje={hoje}
                  entrada={entrada}
                  saida={saida}
                  previa={previa}
                  recomendada={recomendada}
                  fechadas={fechadas}
                  aoEscolher={escolherDia}
                  aoPassar={(d) => {
                    if (entrada && !saida) setPrevia(d);
                  }}
                />

                <p className="mt-4 flex items-center gap-2.5 text-sm text-xisto-suave">
                  <span aria-hidden="true" className="size-3.5 rounded-full border border-dashed border-caixilho" />
                  Sugerido: {plural(NOITES_RECOMENDADAS, "noite", "noites")}, o tempo de ir às Termas e descer ao Vouga
                </p>
                <p className="mt-2 text-sm text-xisto-suave">
                  Para hoje ou amanhã, fale connosco:{" "}
                  <a href={linkWhatsapp()} target="_blank" rel="noreferrer" className="sublinha text-caixilho">
                    WhatsApp
                  </a>{" "}
                  ou{" "}
                  <a href={contactos.telemovel.href} className="sublinha text-caixilho">
                    {contactos.telemovel.texto}
                  </a>
                  .
                </p>

                <dl className="mt-6 grid grid-cols-3 border-y border-granito-linha">
                  {[
                    ["Chegada", entrada ? curta(entrada) : "—"],
                    ["Saída", saida ? curta(saida) : "—"],
                    ["Noites", noites ? String(noites) : "—"],
                  ].map(([k, v], i) => (
                    <div key={k} className={`py-3 ${i ? "border-l border-granito-linha pl-4" : ""}`}>
                      <dt className="etiqueta text-[0.62rem] text-xisto-suave">{k}</dt>
                      <dd className="rustico-medio mt-1 text-[1.3rem] leading-tight text-xisto">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-xisto-suave">Check-in das 15h00 às 21h00 · check-out até às 11h00</p>

                <div className="mt-8 flex items-center justify-between gap-6">
                  <div>
                    <p id="rotulo-adultos" className="rustico-medio text-[1.35rem] leading-tight text-xisto">
                      Adultos
                    </p>
                    <p className="text-sm text-xisto-suave">Mais de {PESSOAS_MAX}? Fale connosco.</p>
                  </div>
                  <div className="flex items-center gap-4" role="group" aria-labelledby="rotulo-adultos">
                    <BotaoRedondo rotulo="Menos um adulto" desligado={adultos <= 1} aoPremir={() => mudarGrupo(adultos - 1, criancas)}>
                      <Minus size={16} />
                    </BotaoRedondo>
                    <output aria-live="polite" className="rustico-medio min-w-7 text-center text-[2rem] leading-none text-xisto">
                      {adultos}
                    </output>
                    <BotaoRedondo rotulo="Mais um adulto" desligado={lugaresNormais(grupo) >= PESSOAS_MAX} aoPremir={() => mudarGrupo(adultos + 1, criancas)}>
                      <Plus size={16} />
                    </BotaoRedondo>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-6">
                  <p id="rotulo-criancas" className="rustico-medio text-[1.35rem] leading-tight text-xisto">
                    Crianças
                  </p>
                  <div className="flex items-center gap-4" role="group" aria-labelledby="rotulo-criancas">
                    <BotaoRedondo rotulo="Menos uma criança" desligado={criancas.length === 0} aoPremir={() => mudarGrupo(adultos, criancas.slice(0, -1))}>
                      <Minus size={16} />
                    </BotaoRedondo>
                    <output aria-live="polite" className="rustico-medio min-w-7 text-center text-[2rem] leading-none text-xisto">
                      {criancas.length}
                    </output>
                    <BotaoRedondo rotulo="Mais uma criança" desligado={criancas.length >= CRIANCAS_MAX} aoPremir={() => mudarGrupo(adultos, [...criancas, null])}>
                      <Plus size={16} />
                    </BotaoRedondo>
                  </div>
                </div>
                {criancas.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {criancas.map((c, i) => (
                      <li key={i}>
                        <p id={`idade-${i}`} className={`mb-1.5 text-sm ${c === null ? "font-medium text-caixilho" : "text-xisto-suave"}`}>
                          {criancas.length > 1 ? `Idade da criança ${i + 1}` : "Idade da criança"}
                          {c === null ? " · escolha" : ""}
                        </p>
                        <div role="radiogroup" aria-labelledby={`idade-${i}`} className="grid grid-cols-2 border border-granito-linha p-1">
                          {ESCALOES.map((e) => (
                            <button
                              key={e.id}
                              type="button"
                              role="radio"
                              aria-checked={c === e.id}
                              onClick={() => mudarGrupo(adultos, criancas.map((x, j) => (j === i ? e.id : x)))}
                              className={`premir px-2 py-2 text-[0.85rem] leading-tight transition-colors duration-150 ${c === e.id ? "bg-xisto text-cal" : "text-xisto-suave hover:text-xisto"}`}
                            >
                              {e.nome}
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-sm leading-snug text-xisto-suave">{NOTA_CRIANCAS}</p>
              </div>

              {/* a sugestão, os quartos, o pequeno-almoço e as contas */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-l-2 border-caixilho bg-granito/60 px-5 py-4">
                  <div className="min-w-0">
                    <p className="etiqueta text-caixilho">Sugerimos para {descreverGrupo(grupo)}</p>
                    <p className="rustico-medio mt-1 text-[1.4rem] leading-tight text-xisto">
                      {sug.casaInteira ? "A casa inteira" : descreverEscolha(sug.escolha)}
                    </p>
                    {sug.casaInteira && (
                      <p className="mt-1 text-sm text-xisto-suave">
                        Ou, quarto a quarto: {descreverEscolha(sug.escolha)} ·{" "}
                        <button type="button" onClick={() => aplicarSugestao(false)} className="sublinha text-xisto">
                          escolher assim
                        </button>
                      </p>
                    )}
                  </div>
                  {sugestaoAplicada ? (
                    <p className="flex shrink-0 items-center gap-2 text-sm text-xisto-suave">
                      <Check size={15} strokeWidth={2.5} className="text-caixilho" /> É o que está escolhido
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aplicarSugestao(sug.casaInteira)}
                      className="botao shrink-0 border border-caixilho bg-caixilho px-5 py-2.5 text-sm text-cal"
                    >
                      Aplicar a sugestão
                    </button>
                  )}
                </div>

                <div className="mb-5 mt-9 flex flex-wrap items-end justify-between gap-4">
                  <div role="group" aria-label="O que quer reservar" className="inline-flex border border-granito-linha p-1">
                    {[
                      [false, "Quarto a quarto"],
                      [true, "A casa inteira"],
                    ].map(([casa, t]) => (
                      <button
                        key={String(casa)}
                        type="button"
                        aria-pressed={casaInteira === casa}
                        onClick={() => escolherModo(casa as boolean)}
                        className={`premir px-5 py-2.5 text-[0.95rem] transition-colors duration-150 ${
                          casaInteira === casa ? "bg-xisto text-cal" : "text-xisto-suave hover:text-xisto"
                        }`}
                      >
                        {t as string}
                      </button>
                    ))}
                  </div>
                  {!casaInteira && <p className="etiqueta text-xisto-suave">Pode escolher mais do que um</p>}
                </div>
                {casaInteira ? (
                  <CasaInteira livre={!entrada || !saida || casaLivreEm(ocupacao, noitesEscolhidas)} />
                ) : (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {quartos.map((q) => {
                    const n = escolha[q.id] ?? 0;
                    const sugerido = (sugeridos[q.id] ?? 0) > 0;
                    const livre = !entrada || !saida || tipoLivreEm(ocupacao, q.id, noitesEscolhidas);
                    return (
                      <li
                        key={q.id}
                        className={`flex flex-col bg-white/45 ring-1 transition-shadow duration-200 ${n ? "ring-2 ring-caixilho" : "ring-granito-linha hover:ring-xisto/30"} ${livre ? "" : "opacity-55"}`}
                      >
                        <button
                          type="button"
                          aria-pressed={n > 0}
                          disabled={!livre}
                          onClick={() => mudarQuarto(q.id, n ? 0 : 1)}
                          className="flex flex-1 flex-col text-left disabled:cursor-not-allowed"
                        >
                          <span className="relative block aspect-[4/3] w-full overflow-hidden bg-granito">
                            <Image
                              src={q.foto}
                              alt={q.alt}
                              fill
                              sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 100vw"
                              quality={85}
                              className="object-cover"
                              style={{ objectPosition: q.foco }}
                            />
                            {sugerido && (
                              <span className="etiqueta absolute left-3 top-3 bg-vale px-2.5 py-1 text-[0.6rem] text-cal">
                                Sugerido: {sugeridos[q.id]}
                              </span>
                            )}
                            <span
                              aria-hidden="true"
                              className={`absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-caixilho text-cal transition-opacity duration-150 ${n ? "opacity-100" : "opacity-0"}`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          </span>
                          <span className="flex flex-1 flex-col px-4 pt-3.5">
                            <span className="rustico-medio text-[1.35rem] leading-tight text-xisto">{q.nome}</span>
                            <span className="mt-1 text-sm leading-snug text-xisto-suave">
                              Para {q.lugares} pessoas · {q.camas} · {q.nota}
                            </span>
                            {!livre && <span className="mt-1 text-sm font-medium text-caixilho">Sem vaga nestas datas</span>}
                          </span>
                        </button>
                        <div className="mx-4 mb-4 mt-3 flex min-h-11 items-center justify-between gap-3 border-t border-granito-linha pt-3">
                          <span className="rustico-medio text-[1.35rem] text-xisto">
                            {euros(precoDaNoite(q.id, entrada ?? hoje ?? new Date()))}
                            <span className="ml-1 font-[family-name:var(--font-corpo)] text-sm text-xisto-suave">/ noite</span>
                          </span>
                          {n > 0 ? (
                            <div className="flex items-center gap-2.5" role="group" aria-label={`Quantos ${q.nome}`}>
                              <BotaoRedondo pequeno rotulo={`Menos um ${q.nome}`} aoPremir={() => mudarQuarto(q.id, n - 1)}>
                                <Minus size={14} />
                              </BotaoRedondo>
                              <output aria-live="polite" className="min-w-4 text-center font-medium text-xisto">
                                {n}
                              </output>
                              <BotaoRedondo pequeno rotulo={`Mais um ${q.nome}`} desligado={n >= UNIDADES_MAX[q.id]} aoPremir={() => mudarQuarto(q.id, n + 1)}>
                                <Plus size={14} />
                              </BotaoRedondo>
                            </div>
                          ) : (
                            <span className="text-sm text-xisto-suave">{livre ? "Escolher" : ""}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                )}
                {faltamCamas && (
                  <p className="mt-4 border-l-2 border-caixilho pl-4 text-sm text-xisto">
                    {lugaresDe(escolha) < lugaresNormais(grupo)
                      ? `Os quartos escolhidos são para ${plural(lugaresDe(escolha), "adulto", "adultos")}. Junte mais um quarto ou explique na mensagem do passo seguinte.`
                      : "Para este grupo, fale connosco ou explique na mensagem do passo seguinte."}
                  </p>
                )}

                <PequenoAlmoco ligado={comPequenoAlmoco} aoMudar={setComPequenoAlmoco} valor={contas?.pequenoAlmoco.subtotal ?? null} pessoas={lugaresNormais(grupo)} noites={noites} />
                <Animal tipo={animal} aoMudar={setAnimal} />

                <div className="mt-10">
                  <p className="etiqueta mb-3 text-xisto-suave">As contas</p>
                  {contas ? (
                    <ContasEstadia contas={contas} />
                  ) : (
                    <p className="border-y border-granito-linha py-5 text-xisto-suave">
                      Escolha as datas e o quarto, e as contas aparecem aqui: o total, o sinal de {SINAL_PERCENTAGEM} % que confirma a reserva e o que fica para pagar depois.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Barra>
              <div className="min-w-0 flex-1">
                <p className="etiqueta truncate text-[0.62rem] text-cal/70">
                  {entrada && saida
                    ? `${curta(entrada)} → ${curta(saida)} · ${plural(noites, "noite", "noites")} · ${descreverGrupo(grupo)}`
                    : "O seu pedido"}
                </p>
                <p className="rustico-medio truncate text-[1.3rem] leading-tight">{casaInteira || nQuartos ? oQuePediu : "Ainda sem quarto"}</p>
              </div>
              {contas && <ResumoBarra contas={contas} />}
              <BotaoBarra desligado={!!falta1} aoPremir={() => irPara(2)}>
                {falta1 ?? "Continuar"}
              </BotaoBarra>
            </Barra>
          </motion.div>
        )}

        {passo === 2 && entrada && saida && contas && (
          <motion.div key="p2" {...transicao}>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              <div className="grid grid-cols-1 gap-14 lg:grid-cols-[400px_1fr] lg:gap-16">
                <div>
                  <p className="etiqueta text-xisto-suave">O pedido</p>
                  <dl className="mt-3 grid grid-cols-[96px_1fr] border-t border-granito-linha text-xisto">
                    {[
                      ["Chegada", longa(entrada)],
                      ["Saída", longa(saida)],
                      ["Noites", String(noites)],
                      ["Pessoas", descreverGrupo(grupo)],
                      [casaInteira ? "Reserva" : "Quartos", oQuePediu],
                      ["Pequeno-almoço", comPequenoAlmoco ? "Incluído" : "Sem pequeno-almoço"],
                      ["Animal", descreverAnimal(animal)],
                    ].map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="etiqueta border-b border-granito-linha py-3.5 text-[0.6rem] leading-tight text-xisto-suave">{k}</dt>
                        <dd className="border-b border-granito-linha py-3">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8">
                    <ContasEstadia contas={contas} compacto />
                  </div>
                  <button type="button" onClick={() => irPara(1)} className="sublinha mt-5 text-[0.95rem] text-xisto">
                    Alterar as datas, os quartos ou o pequeno-almoço
                  </button>
                </div>

                <div>
                  <p className="etiqueta text-xisto-suave">Os seus dados</p>
                  <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                    <Campo
                      rotulo="Nome"
                      id="nome"
                      className="sm:col-span-2"
                      valor={dados.nome}
                      erro={tocados.nome ? erros.nome : undefined}
                      aoMudar={(v) => setDados({ ...dados, nome: v })}
                      aoSair={() => setTocados((t) => ({ ...t, nome: true }))}
                      autoComplete="name"
                    />
                    <Campo
                      rotulo="Email"
                      id="email"
                      tipo="email"
                      valor={dados.email}
                      erro={tocados.email ? erros.email : undefined}
                      aoMudar={(v) => setDados({ ...dados, email: v })}
                      aoSair={() => setTocados((t) => ({ ...t, email: true }))}
                      autoComplete="email"
                    />
                    <Campo
                      rotulo="Confirme o email"
                      id="email2"
                      tipo="email"
                      valor={dados.email2}
                      erro={tocados.email2 ? erros.email2 : undefined}
                      aoMudar={(v) => setDados({ ...dados, email2: v })}
                      aoSair={() => setTocados((t) => ({ ...t, email2: true }))}
                      autoComplete="email"
                    />
                    <Campo
                      rotulo="Telemóvel"
                      id="telefone"
                      tipo="tel"
                      valor={dados.telefone}
                      erro={tocados.telefone ? erros.telefone : undefined}
                      aoMudar={(v) => setDados({ ...dados, telefone: v })}
                      aoSair={() => setTocados((t) => ({ ...t, telefone: true }))}
                      autoComplete="tel"
                    />
                    <Campo
                      rotulo="Mensagem para nós (opcional)"
                      id="mensagem"
                      className="sm:col-span-2"
                      valor={dados.mensagem}
                      aoMudar={(v) => setDados({ ...dados, mensagem: v })}
                      area
                      opcional
                      dica="A hora a que pensa chegar, as camas juntas no Twin, se traz o seu cão…"
                    />
                  </div>

                  <fieldset className="mt-10">
                    <legend className="etiqueta text-xisto-suave">Como prefere pagar o sinal{contas.sinal !== null ? ` de ${euros(contas.sinal)}` : ""}</legend>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {FORMAS_PAGAMENTO.map((f) => {
                        const on = pagamento === f.id;
                        return (
                          <label
                            key={f.id}
                            className={`premir flex cursor-pointer items-center gap-4 bg-white/45 px-5 py-4 ring-1 transition-shadow duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-caixilho ${
                              on ? "ring-2 ring-caixilho" : "ring-granito-linha hover:ring-xisto/30"
                            }`}
                          >
                            <input type="radio" name="pagamento" value={f.id} checked={on} onChange={() => setPagamento(f.id)} className="sr-only" />
                            <span
                              aria-hidden="true"
                              className={`grid size-5 shrink-0 place-items-center rounded-full border ${on ? "border-caixilho" : "border-xisto/40"}`}
                            >
                              <span className={`size-2.5 rounded-full bg-caixilho transition-opacity duration-150 ${on ? "opacity-100" : "opacity-0"}`} />
                            </span>
                            <span>
                              <span className="rustico-medio block text-[1.25rem] leading-tight text-xisto">{f.nome}</span>
                              <span className="block text-sm text-xisto-suave">{f.detalhe}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-4 max-w-[60ch] text-[0.95rem] leading-relaxed text-xisto">
                      <strong className="font-medium">Agora não paga nada.</strong> Se houver lugar, enviamos-lhe por email
                      {formaEscolhida ? (pagamento === "mbway" ? " o número para o MB WAY" : " o IBAN para a transferência") : " os dados para pagar"} do{" "}
                      {contas.sinal !== null ? `sinal de ${euros(contas.sinal)}` : `sinal de ${SINAL_PERCENTAGEM} % do valor que indicarmos`}. A reserva fica
                      confirmada quando o sinal chegar.
                    </p>
                  </fieldset>

                  <p className="rustico-medio mt-8 max-w-[52ch] border-l-2 border-caixilho pl-4 text-[1.2rem] leading-snug text-xisto">
                    Ainda não é uma reserva: precisa da nossa confirmação.
                  </p>
                  <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-xisto-suave">
                    Vemos primeiro se há lugar e respondemos-lhe por email, normalmente no próprio dia: se houver, com o pedido do pagamento do sinal; se não
                    houver, com novas datas sugeridas.
                  </p>
                  {erroEnvio && (
                    <p role="alert" className="mt-5 border-l-2 border-caixilho pl-4 text-[0.95rem] text-xisto">
                      <strong className="font-medium text-caixilho">Não conseguimos enviar o pedido.</strong>{" "}
                      {erroEnvio !== "Não conseguimos enviar o pedido." && <>{erroEnvio} </>}
                      Escreva-nos pelo{" "}
                      <a href={linkWhatsapp()} target="_blank" rel="noreferrer" className="sublinha font-medium text-caixilho">
                        WhatsApp
                      </a>{" "}
                      e tratamos do resto.
                    </p>
                  )}
                  <p className="mt-5 text-[0.85rem] leading-snug text-xisto-suave">
                    Usamos estes dados só para responder ao seu pedido e gerir a reserva.{" "}
                    <Link href="/privacidade" target="_blank" className="sublinha text-caixilho">
                      Política de privacidade
                    </Link>
                    .
                  </p>
                  {/* Só os robôs preenchem isto: escondido de quem vê e de quem usa leitor de ecrã. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Não preencher
                      <input ref={armadilha} type="text" name="site" tabIndex={-1} autoComplete="off" defaultValue="" />
                    </label>
                  </div>
                </div>
              </div>

              <Barra>
                <button
                  type="button"
                  onClick={() => irPara(1)}
                  className="premir etiqueta shrink-0 border border-cal/40 px-5 py-4 text-cal transition-colors hover:border-cal"
                >
                  Voltar
                </button>
                <p className="hidden min-w-0 flex-1 truncate text-[0.95rem] text-cal/75 md:block">
                  {curta(entrada)} → {curta(saida)} · {oQuePediu}
                </p>
                <ResumoBarra contas={contas} />
                <BotaoBarra tipo="submit" desligado={!!falta2 || enviando}>
                  {enviando ? (
                    <span className="flex items-center gap-2.5">
                      <LoaderCircle size={16} className="animate-spin" /> A enviar
                    </span>
                  ) : falta2 ? (
                    falta2
                  ) : (
                    "Enviar o pedido"
                  )}
                </BotaoBarra>
              </Barra>
            </form>
          </motion.div>
        )}

        {passo === 3 && entrada && saida && contas && (
          <motion.div key="p3" {...transicao} className="pb-24 md:pb-32">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_420px] lg:gap-16">
              <div className="border border-granito-linha bg-white/45 px-6 py-10 sm:px-11 sm:py-12">
                <p className="etiqueta text-xisto-suave">Pedido enviado{referencia ? ` · referência ${referencia}` : ""}</p>
                <h2 className="rustico mt-3 text-[clamp(2.4rem,4.4vw,3.4rem)] leading-none text-xisto outline-none" tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>
                  Obrigado{primeiroNome ? `, ${primeiroNome}` : ""}.
                </h2>
                <p className="mt-5 max-w-[56ch] text-corpo-grande leading-relaxed text-xisto-suave">
                  Recebemos o seu pedido para {curta(entrada)} → {curta(saida)}. <strong className="font-medium text-xisto">Ainda não é reserva: precisa da nossa
                  confirmação.</strong> Vemos primeiro se há lugar e respondemos-lhe para <span className="text-xisto">{dados.email.trim()}</span>, normalmente no próprio dia:
                </p>
                <ul className="mt-5 max-w-[56ch] space-y-2 text-[1rem] leading-relaxed text-xisto">
                  <li className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-caixilho" />
                    <span>
                      <strong className="font-medium">Se houver lugar</strong>, recebe um email a pedir o pagamento do sinal de{" "}
                      {contas.sinal !== null ? euros(contas.sinal) : `${SINAL_PERCENTAGEM} %`}.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-caixilho" />
                    <span>
                      <strong className="font-medium">Se não houver</strong>, recebe um email com novas datas sugeridas.
                    </span>
                  </li>
                </ul>
                <p className="mt-5 max-w-[56ch] text-[0.95rem] leading-relaxed text-xisto-suave">
                  Não recebeu nada? Veja na pasta de spam, ou fale connosco pelo{" "}
                  <a href={linkWhatsapp()} target="_blank" rel="noreferrer" className="sublinha font-medium text-caixilho">
                    WhatsApp
                  </a>
                  .
                </p>
                <ol className="mt-9 grid grid-cols-1 gap-4 border-t border-granito-linha pt-6 sm:grid-cols-3">
                  {["Pedido enviado", "Confirmamos a disponibilidade", `Paga o sinal de ${contas.sinal !== null ? euros(contas.sinal) : `${SINAL_PERCENTAGEM} %`} e fica reservado`].map((t, i) => (
                    <li key={t} className={`flex items-start gap-3 leading-snug ${i === 0 ? "font-medium text-xisto" : "text-xisto-suave"}`}>
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full border text-[0.8rem] ${i === 0 ? "border-caixilho bg-caixilho text-cal" : "border-granito-linha"}`}
                      >
                        {i === 0 ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
                <Link href="/" className="botao etiqueta mt-10 inline-flex border border-caixilho px-7 py-4 text-caixilho">
                  Voltar à casa
                </Link>
              </div>
              <div>
                <p className="etiqueta mb-3 text-xisto-suave">O que pediu · {formaEscolhida?.nome}</p>
                <ContasEstadia contas={contas} compacto />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* As contas: as linhas, o total, e o sinal destacado. Igual nos três passos. */
function ContasEstadia({ contas, compacto = false }: { contas: Contas; compacto?: boolean }) {
  const noites = plural(contas.noites, "noite", "noites");
  return (
    <div>
      <ul className="border-t border-granito-linha text-xisto">
        {contas.casaInteira && (
          <li className="flex items-baseline justify-between gap-4 border-b border-granito-linha py-3">
            <span>
              A casa inteira
              <span className="block text-sm text-xisto-suave">
                {contas.casaInteira.precoPorNoite !== null ? `${noites} × ${euros(contas.casaInteira.precoPorNoite)}` : "O preço vem na nossa resposta"}
              </span>
            </span>
            <span className="shrink-0">{contas.casaInteira.subtotal !== null ? euros(contas.casaInteira.subtotal) : "—"}</span>
          </li>
        )}
        {contas.linhas.map((l) => {
          const precos = [...new Set(l.precosPorNoite.map((p) => p.preco))];
          return (
            <li key={l.tipo} className="flex items-baseline justify-between gap-4 border-b border-granito-linha py-3">
              <span>
                {l.quantidade > 1 ? `${l.quantidade} × ` : ""}
                {l.nome}
                <span className="block text-sm text-xisto-suave">
                  {noites} × {precos.length === 1 ? euros(precos[0]) : "preço da noite"}
                  {l.quantidade > 1 ? ` × ${l.quantidade}` : ""}
                </span>
              </span>
              <span className="shrink-0">{euros(l.subtotal)}</span>
            </li>
          );
        })}
        <li className="flex items-baseline justify-between gap-4 border-b border-granito-linha py-3">
          <span>
            Pequeno-almoço
            <span className="block text-sm text-xisto-suave">
              {contas.pequenoAlmoco.incluido
                ? `${plural(contas.pequenoAlmoco.pessoas ?? 0, "adulto", "adultos")} × ${noites} × ${euros(contas.pequenoAlmoco.porPessoaNoite)}`
                : "Não incluído"}
            </span>
          </span>
          <span className="shrink-0">{contas.pequenoAlmoco.incluido ? euros(contas.pequenoAlmoco.subtotal) : "—"}</span>
        </li>
        {contas.camaSuplementar && !contas.camaSuplementar.incluidaNaCasa && (
          <li className="flex items-baseline justify-between gap-4 border-b border-granito-linha py-3">
            <span>
              Cama suplementar
              <span className="block text-sm text-xisto-suave">
                {plural(contas.camaSuplementar.criancas, "criança", "crianças")} (3–10) × {noites} × {euros(contas.camaSuplementar.porNoite)} · com pequeno-almoço
              </span>
            </span>
            <span className="shrink-0">{euros(contas.camaSuplementar.subtotal)}</span>
          </li>
        )}
        <li className="flex items-baseline justify-between gap-4 py-4">
          <span className="rustico-medio text-[1.3rem]">Total da estadia</span>
          {contas.total !== null ? (
            <span className="rustico-medio text-[1.6rem]">{euros(contas.total)}</span>
          ) : (
            <span className="text-right text-[0.95rem] text-xisto-suave">Na nossa resposta</span>
          )}
        </li>
      </ul>
      <Sinal contas={contas} compacto={compacto} />
    </div>
  );
}

/* O sinal, explícito: é o que confirma a reserva. */
function Sinal({ contas, compacto }: { contas: Contas; compacto?: boolean }) {
  return (
    <div className={`bg-vale text-cal ${compacto ? "px-5 py-5" : "px-6 py-6 sm:px-7"}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="max-w-[44ch] leading-snug">
          Para confirmar a reserva paga apenas o <strong className="font-medium">sinal de {SINAL_PERCENTAGEM} %</strong>
        </p>
        <p className={`rustico-medio shrink-0 leading-none ${compacto ? "text-[1.9rem]" : "text-[2.3rem]"}`}>
          {contas.sinal !== null ? euros(contas.sinal) : `${SINAL_PERCENTAGEM} %`}
        </p>
      </div>
      <p className="mt-3 border-t border-cal/20 pt-3 text-[0.95rem] text-cal/80">
        {contas.sinal !== null && contas.restante !== null
          ? `O restante, ${euros(contas.restante)}, paga-se ${QUANDO_RESTANTE}.`
          : `O preço da casa inteira vem na nossa resposta${
              contas.pequenoAlmoco.incluido ? `, mais ${euros(contas.pequenoAlmoco.subtotal)} do pequeno-almoço` : ""
            }; o sinal é ${SINAL_PERCENTAGEM} % desse total e o restante paga-se ${QUANDO_RESTANTE}.`}{" "}
        {POLITICA_SINAL}
      </p>
    </div>
  );
}

function ResumoBarra({ contas }: { contas: Contas }) {
  return (
    <div className="hidden shrink-0 text-right md:block">
      {contas.total !== null && contas.sinal !== null ? (
        <>
          <p className="text-[0.9rem] text-cal/75">Total {euros(contas.total)}</p>
          <p className="text-[1.05rem] leading-tight">
            Sinal {SINAL_PERCENTAGEM} %: <span className="rustico-medio text-[1.3rem]">{euros(contas.sinal)}</span>
          </p>
        </>
      ) : (
        <>
          <p className="text-[0.9rem] text-cal/75">Preço na nossa resposta</p>
          <p className="text-[1.05rem] leading-tight">Sinal de {SINAL_PERCENTAGEM} % desse valor</p>
        </>
      )}
    </div>
  );
}

/* A casa inteira, em vez dos cartões dos quartos. */
function CasaInteira({ livre }: { livre: boolean }) {
  const f = fotos["casa-fachada"];
  return (
    <div className="grid grid-cols-1 bg-white/45 ring-2 ring-caixilho sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-granito sm:aspect-auto sm:min-h-[260px]">
        <Image
          src={f.src}
          alt="A fachada de granito da Quinta de Canhões"
          fill
          sizes="(min-width: 1280px) 440px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={f.blurDataURL}
        />
      </span>
      <div className="flex flex-col px-6 py-6">
        <p className="rustico-medio text-[1.6rem] leading-tight text-xisto">A casa inteira</p>
        <p className="mt-2 leading-relaxed text-xisto-suave">
          Todos os quartos da casa para o seu grupo, sem outros hóspedes. Para famílias grandes, amigos ou uma ocasião que se quer só vossa.
        </p>
        {!livre && <p className="mt-2 text-sm font-medium text-caixilho">Sem vaga nestas datas</p>}
        <p className="mt-auto border-t border-granito-linha pt-4">
          {PRECO_CASA_INTEIRA !== null ? (
            <span className="rustico-medio text-[1.35rem] text-xisto">
              {euros(PRECO_CASA_INTEIRA)}
              <span className="ml-1 font-[family-name:var(--font-corpo)] text-sm text-xisto-suave">/ noite · mínimo de {noitesMinimas(true)} noites</span>
            </span>
          ) : (
            <span className="text-[0.95rem] text-xisto">O preço vem na nossa resposta.</span>
          )}
        </p>
      </div>
    </div>
  );
}

function PequenoAlmoco({
  ligado,
  aoMudar,
  valor,
  pessoas,
  noites,
}: {
  ligado: boolean;
  aoMudar: (v: boolean) => void;
  valor: number | null;
  pessoas: number;
  noites: number;
}) {
  const f = fotos["dia-pequeno-almoco"];
  return (
    <div className="mt-10 flex items-center gap-5 border-y border-granito-linha py-5">
      <span className="relative hidden h-[76px] w-[104px] shrink-0 overflow-hidden sm:block">
        <Image src={f.src} alt="" fill sizes="104px" className="object-cover" placeholder="blur" blurDataURL={f.blurDataURL} />
      </span>
      <div className="min-w-0 flex-1">
        <p id="rotulo-pa" className="rustico-medio text-[1.35rem] leading-tight text-xisto">
          Pequeno-almoço
        </p>
        <p id="desc-pa" className="mt-0.5 text-sm leading-snug text-xisto-suave">
          {euros(PEQUENO_ALMOCO_POR_PESSOA)} por adulto e por noite (crianças até aos 10 já incluídas) · bolos caseiros, panquecas, sumos naturais e compotas, à mesa da casa
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {ligado && valor !== null && noites > 0 && (
          <span className="hidden text-sm text-xisto-suave md:inline">
            + {euros(valor)} <span className="sr-only">para {plural(pessoas, "pessoa", "pessoas")}</span>
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={ligado}
          aria-labelledby="rotulo-pa"
          aria-describedby="desc-pa"
          onClick={() => aoMudar(!ligado)}
          className={`premir relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${ligado ? "bg-caixilho" : "bg-xisto/25"}`}
        >
          <span
            aria-hidden="true"
            className={`absolute left-1 top-1 size-6 rounded-full bg-cal shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${ligado ? "translate-x-6" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}

/* «Traz um animal?»: não, até 8 kg (gratuito) ou mais de 8 kg (a casa confirma). */
function Animal({ tipo, aoMudar }: { tipo: TipoAnimal; aoMudar: (v: TipoAnimal) => void }) {
  const opcoes: [TipoAnimal, string][] = [
    ["nao", "Não"],
    ["pequeno", "Sim, até 8 kg"],
    ["grande", "Sim, com mais de 8 kg"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-granito-linha py-5">
      <span aria-hidden="true" className="hidden size-[52px] shrink-0 place-items-center rounded-full bg-granito text-caixilho sm:grid">
        <PawPrint size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p id="rotulo-animal" className="rustico-medio text-[1.35rem] leading-tight text-xisto">
          Traz um animal?
        </p>
        <p className={`mt-0.5 text-sm leading-snug ${tipo === "grande" ? "font-medium text-caixilho" : "text-xisto-suave"}`}>
          {tipo === "grande" ? NOTA_ANIMAIS_GRANDES : NOTA_ANIMAIS}
        </p>
      </div>
      <div role="radiogroup" aria-labelledby="rotulo-animal" className="inline-flex shrink-0 flex-wrap border border-granito-linha p-1">
        {opcoes.map(([v, t]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={tipo === v}
            onClick={() => aoMudar(v)}
            className={`premir px-4 py-2 text-[0.92rem] transition-colors duration-150 ${tipo === v ? "bg-xisto text-cal" : "text-xisto-suave hover:text-xisto"}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* A barra de baixo, presa ao fundo do ecrã enquanto se escolhe: o resumo e o botão. */
function Barra({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-14 md:-mx-10">
      <div className="flex items-center gap-4 bg-vale px-6 py-4 text-cal md:gap-8 md:px-10">{children}</div>
    </div>
  );
}

function BotaoBarra({
  children,
  desligado,
  aoPremir,
  tipo = "button",
}: {
  children: ReactNode;
  desligado?: boolean;
  aoPremir?: () => void;
  tipo?: "button" | "submit";
}) {
  return (
    <button
      type={tipo}
      disabled={desligado}
      onClick={aoPremir}
      className="botao max-w-[60vw] shrink-0 border border-caixilho-claro bg-caixilho-claro px-6 py-4 text-[0.95rem] text-cal disabled:pointer-events-none disabled:border-cal/25 disabled:bg-transparent disabled:text-cal/80 md:px-8"
    >
      {children}
    </button>
  );
}

function BotaoRedondo({
  children,
  rotulo,
  desligado,
  aoPremir,
  pequeno = false,
}: {
  children: ReactNode;
  rotulo: string;
  desligado?: boolean;
  aoPremir: () => void;
  pequeno?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desligado}
      onClick={aoPremir}
      className={`premir grid shrink-0 place-items-center rounded-full border border-xisto/35 text-xisto transition-colors duration-150 hover:border-xisto disabled:pointer-events-none disabled:opacity-35 ${
        pequeno ? "size-9" : "size-11"
      }`}
    >
      {children}
    </button>
  );
}

export function Calendario({
  mes,
  hoje,
  entrada,
  saida,
  previa,
  recomendada,
  fechadas,
  aoEscolher,
  aoPassar,
}: {
  mes: { ano: number; mes: number } | null;
  hoje: Date | null;
  entrada: Date | null;
  saida: Date | null;
  previa: Date | null;
  recomendada: Date | null;
  /** Noites sem nenhum quarto livre (do iCal do Booking); vazio por agora. */
  fechadas: Set<string>;
  aoEscolher: (d: Date) => void;
  aoPassar: (d: Date) => void;
}) {
  const celulas: (Date | null)[] = [];
  if (mes) {
    const primeiro = new Date(mes.ano, mes.mes, 1);
    const vazios = (primeiro.getDay() + 6) % 7;
    for (let i = 0; i < vazios; i++) celulas.push(null);
    const dias = new Date(mes.ano, mes.mes + 1, 0).getDate();
    for (let d = 1; d <= dias; d++) celulas.push(new Date(mes.ano, mes.mes, d));
  }
  while (celulas.length < 42) celulas.push(null);

  const fim = saida ?? (previa && entrada && previa > entrada ? previa : null);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 pb-1">
        {SEMANA.map((s) => (
          <span key={s} className="text-center text-[0.7rem] uppercase tracking-[0.12em] text-xisto-suave">
            {s}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7" onMouseLeave={() => entrada && !saida && aoPassar(entrada)}>
        {celulas.map((d, i) => {
          if (!d) return <span key={`v${i}`} className="h-12" />;
          const passado = !!hoje && d < hoje;
          // Uma noite fechada não pode ser chegada; pode ser o dia de saída.
          const fechada = fechadas.has(iso(d)) && !(entrada && !saida && d > entrada);
          const ini = igual(d, entrada);
          const fimDia = igual(d, fim);
          const meio = !!entrada && !!fim && d > entrada && d < fim;
          const sugerido = igual(d, recomendada) && !fim;
          const faixa =
            ini && fim
              ? "bg-[linear-gradient(90deg,transparent_50%,var(--color-granito)_50%)]"
              : fimDia && entrada
                ? "bg-[linear-gradient(90deg,var(--color-granito)_50%,transparent_50%)]"
                : meio
                  ? "bg-granito"
                  : "";
          const rotulo = `${longa(d)}${ini ? ", chegada" : ""}${fimDia && saida ? ", saída" : ""}${fechada ? ", sem quartos livres" : ""}${
            sugerido ? `, sugestão de ${NOITES_RECOMENDADAS} noites` : ""
          }`;
          return (
            <div key={d.toISOString()} className={`relative grid h-12 place-items-center ${faixa}`}>
              <button
                type="button"
                disabled={passado || fechada}
                aria-label={rotulo}
                aria-pressed={ini || (fimDia && !!saida)}
                onClick={() => aoEscolher(d)}
                onMouseEnter={() => aoPassar(d)}
                className={`relative grid size-11 place-items-center rounded-full text-[0.98rem] transition-colors duration-150 ${
                  ini || fimDia
                    ? "bg-caixilho font-medium text-cal"
                    : passado
                      ? "text-xisto/30"
                      : fechada
                        ? "text-xisto/30 line-through"
                        : "text-xisto hover:bg-granito"
                } ${sugerido ? "outline-1 outline-dashed outline-caixilho" : ""}`}
              >
                {d.getDate()}
              </button>
              {sugerido && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-1.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-caixilho px-1.5 text-[0.6rem] uppercase tracking-[0.1em] text-cal"
                >
                  {NOITES_RECOMENDADAS} noites
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Campo({
  rotulo,
  id,
  valor,
  aoMudar,
  aoSair,
  erro,
  tipo = "text",
  className = "",
  autoComplete,
  area = false,
  opcional = false,
  dica,
}: {
  rotulo: string;
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  aoSair?: () => void;
  erro?: string;
  tipo?: string;
  className?: string;
  autoComplete?: string;
  area?: boolean;
  opcional?: boolean;
  dica?: string;
}) {
  const classes = `mt-1.5 block w-full rounded-none border bg-white/55 px-3.5 text-[1.02rem] text-xisto transition-[border-color,box-shadow] duration-150 placeholder:text-xisto-suave/70 focus:shadow-[0_0_0_3px_rgb(34_31_27/0.08)] focus:outline-none focus-visible:outline-none ${
    erro ? "border-caixilho" : "border-granito-linha focus:border-xisto"
  }`;
  const descricao = erro ? `${id}-erro` : undefined;
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="etiqueta text-[0.62rem] text-xisto-suave">
        {rotulo}
        {!opcional && <span aria-hidden="true"> *</span>}
      </span>
      {area ? (
        <textarea id={id} rows={4} value={valor} placeholder={dica} onChange={(e) => aoMudar(e.target.value)} className={`${classes} py-3`} />
      ) : (
        <input
          id={id}
          type={tipo}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          onBlur={aoSair}
          autoComplete={autoComplete}
          required={!opcional}
          aria-invalid={!!erro}
          aria-describedby={descricao}
          className={`${classes} h-12`}
        />
      )}
      {erro && (
        <span id={descricao} className="mt-1.5 block text-sm text-caixilho">
          {erro}
        </span>
      )}
    </label>
  );
}
