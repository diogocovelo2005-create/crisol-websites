import { normalizarFrase, normalizarNome, normalizarOferta } from "@/lib/oferta";
import type { TipoQuarto } from "@/lib/reserva";

/*
  Os preços que a D. Teresa muda sozinha (em /precos), sem nova publicação.

  Vivem no armazém das reservas (Netlify Blobs, chave «precos/atual»; em casa,
  site/.dados/precos/atual.json). Se o armazém estiver vazio, valem os de
  PRECOS_PADRAO, que são os da casa a 23 out 2026: o site funciona igual.

  Este ficheiro corre no browser e no servidor (o formulário, a página do
  pedido, os emails e o editor usam as mesmas contas e os mesmos limites).

  PROMOÇÕES
    - Valem por NOITE: a noite de cada dia. «De 1 a 3 de dezembro» são as
      noites de 1, 2 e 3 (quem sai a 4 paga as três com o desconto).
      `de` e `ate` são AAAA-MM-DD, os dois incluídos.
    - Um nome opcional («Magusto»; sem nome, «Promoção») e três coisas
      que se combinam livremente, pelo menos uma:
        · baixar o preço do quarto: uma percentagem (`desconto`, arredondada
          ao euro por noite) ou um preço novo por tipo (`precos`), um ou outro;
        · pequeno-almoço oferecido (`pequenoAlmoco`: 0 € nessas noites, para
          quem dorme nos quartos escolhidos);
        · outra oferta em texto livre (`oferta`, «Garrafa de vinho do Dão à
          chegada»), limpa por lib/oferta.ts; não mexe no total.
    - `minNoites`: só vale em estadias com pelo menos essas noites.
    - Se duas promoções de preço caírem na mesma noite, vale a mais barata.
      O pequeno-almoço oferecido junta-se a um desconto no quarto.
    - Uma promoção nunca sobe o preço: se ficar acima do normal, não conta.
*/

export type Alvo = TipoQuarto | "casa";

export const ALVOS: { id: Alvo; nome: string }[] = [
  { id: "duplo", nome: "Quarto Duplo" },
  { id: "twin", nome: "Quarto Twin" },
  { id: "suite", nome: "Suite" },
  { id: "casa", nome: "Casa inteira" },
];
export const nomeAlvo = (a: Alvo) => ALVOS.find((x) => x.id === a)?.nome ?? a;

export type PrecosBase = {
  duplo: number;
  twin: number;
  suite: number;
  /** A casa inteira, por noite. */
  casa: number;
  /** Criança dos 3 aos 10, por noite (cama suplementar e pequeno-almoço). */
  crianca: number;
  /** Por adulto e por noite. */
  pequenoAlmoco: number;
};

export type CampoBase = keyof PrecosBase;

/** Os preços da casa (a D. Teresa, 23 out 2026). Valem enquanto o armazém estiver vazio. */
export const PRECOS_PADRAO: PrecosBase = {
  duplo: 64,
  twin: 61,
  suite: 97,
  casa: 600,
  crianca: 15,
  pequenoAlmoco: 8,
};

export const CAMPOS_BASE: { id: CampoBase; nome: string; unidade: string }[] = [
  { id: "duplo", nome: "Quarto Duplo", unidade: "por noite" },
  { id: "twin", nome: "Quarto Twin", unidade: "por noite" },
  { id: "suite", nome: "Suite", unidade: "por noite, para 2 pessoas" },
  { id: "casa", nome: "Casa inteira", unidade: "por noite" },
  { id: "pequenoAlmoco", nome: "Pequeno-almoço", unidade: "por adulto e por noite" },
  { id: "crianca", nome: "Criança dos 3 aos 10", unidade: "por noite, com cama e pequeno-almoço (só nas Suites)" },
];

export type Promocao = {
  id: string;
  /** O nome que se mostra («Magusto», «Época baixa»), limpo por normalizarNome; vazio = «Promoção». */
  nome?: string;
  /** A frase que acompanha o nome no site e nos emails (limpa por normalizarFrase); vazia = FRASE_NEUTRA. */
  frase?: string;
  /** Primeira noite (AAAA-MM-DD). */
  de: string;
  /** Última noite, incluída (AAAA-MM-DD). */
  ate: string;
  alvos: Alvo[];
  /** Só para estadias com pelo menos estas noites. */
  minNoites?: number;
  /** Baixar o preço do quarto: um desconto em percentagem (inteiro)… */
  desconto?: number;
  /** …ou o preço novo por noite de cada tipo (um ou outro, nunca os dois). */
  precos?: Partial<Record<Alvo, number>>;
  /** Pequeno-almoço oferecido nessas noites, a quem dorme nos quartos escolhidos. */
  pequenoAlmoco?: boolean;
  /** Outra oferta, em texto já limpo (lib/oferta.ts). Não mexe no total. */
  oferta?: string;
};

export const NOME_PADRAO = "Promoção";
export const nomeDe = (p: Pick<Promocao, "nome">) => p.nome?.trim() || NOME_PADRAO;

/*
  Sugestões para o nome (épocas e eventos comuns em Portugal), cada uma com
  2 ou 3 frases para o site e os emails; ela pode escrever outro nome e outra
  frase.

  Regras das frases: português de Portugal, a casa a falar no plural, curtas
  e calorosas, sem pontos de exclamação nem clichés. Só o que o site já diz
  da casa (casa centenária, jardim, piscina, sossego, a serra à vista) e o
  que é sabido da região (termas de São Pedro do Sul a poucos minutos, rio
  Vouga, vale de Lafões, castanhas no outono). Nunca prometem o que a
  promoção não dá (nada de jantar, nada de «incluído», nem o pequeno-almoço):
  o desconto e as ofertas têm as suas linhas; a frase é só o convite.
*/
export const SUGESTOES: { nome: string; frases: string[] }[] = [
  {
    nome: "Época baixa",
    frases: [
      "A quinta em silêncio e o vale só para si. A melhor altura para vir sem pressa",
      "Menos gente, mais sossego. Dias calmos entre o jardim, a serra e as termas",
      "Quando a região abranda, a quinta fica ainda mais bonita. Venha descobri-la com tempo",
    ],
  },
  {
    nome: "Fim de semana romântico",
    frases: [
      "Dois dias para abrandar, numa casa centenária entre o jardim e a serra",
      "Um fim de semana para desligar, com o vale do Vouga à volta",
      "Fuja à rotina: uns dias de calma numa casa com mais de cem anos de histórias",
    ],
  },
  {
    nome: "Dia dos Namorados",
    frases: [
      "Celebre com quem mais gosta, no sossego de uma casa centenária",
      "Um presente diferente: uns dias de calma entre o jardim, as termas e a serra",
    ],
  },
  {
    nome: "Carnaval",
    frases: [
      "Troque a folia por uns dias de sossego, com as termas a poucos minutos",
      "Um Carnaval diferente: a serra, o rio Vouga e a calma da quinta",
    ],
  },
  {
    nome: "Páscoa na quinta",
    frases: [
      "A primavera chega ao vale e o jardim ganha cor. Venha passar a Páscoa connosco",
      "Uma Páscoa tranquila, numa casa centenária entre a serra e o rio Vouga",
    ],
  },
  {
    nome: "Santos Populares",
    frases: [
      "Dias longos, noites amenas e o jardim à sua espera. Venha passar junho connosco",
      "Entre arraiais e passeios, a quinta é o sítio certo para descansar",
    ],
  },
  {
    nome: "Verão",
    frases: [
      "Dias longos entre a piscina e o jardim, com a serra no horizonte",
      "Um verão sem relógio: piscina, sombra no jardim e o rio Vouga perto",
      "Mergulhos, fins de tarde no jardim e o sossego do vale. O verão é aqui",
    ],
  },
  {
    nome: "Vindimas",
    frases: [
      "Setembro traz as vindimas e uma luz dourada sobre o vale. A estação mais bonita para vir",
      "Tempo de vindimas e de dias mais calmos. Venha descobrir a região com tempo",
    ],
  },
  {
    nome: "Magusto",
    frases: [
      "Castanhas assadas, folhas douradas e dias de sossego. O outono pede uma escapadinha",
      "O outono pinta o vale de cor e cheira a castanhas. Venha aproveitá-lo connosco",
    ],
  },
  {
    nome: "Termas de inverno",
    frases: [
      "As águas quentes das termas de dia e o sossego da quinta à noite",
      "O inverno pede calor: as termas a sete minutos e uma casa tranquila para regressar",
    ],
  },
  {
    nome: "Natal",
    frases: [
      "Um Natal sereno, longe da azáfama, numa casa centenária no vale do Vouga",
      "Dias de festa com tempo para tudo: descansar, passear e estar com quem mais gosta",
    ],
  },
  {
    nome: "Passagem de ano",
    frases: [
      "Comece o ano novo com calma, longe do barulho, com a serra no horizonte",
      "Despeça-se do ano no sossego do vale. O próximo começa aqui",
    ],
  },
];
export const SUGESTOES_NOME = SUGESTOES.map((x) => x.nome);
/** As frases de uma sugestão (vazio se o nome não for uma sugestão). */
export const frasesDaSugestao = (nome: string) => SUGESTOES.find((x) => x.nome === nome.trim())?.frases ?? [];

/** A frase quando a promoção não tem nenhuma (nome próprio sem frase). */
export const FRASE_NEUTRA = "Uns dias de sossego na quinta, entre o jardim e a serra. Esperamos por si";
export const fraseDe = (p: Pick<Promocao, "frase">) => p.frase?.trim() || FRASE_NEUTRA;

export type TabelaPrecos = {
  /** 0 = os preços de origem (nada guardado ainda). */
  versao: number;
  atualizadoEm: string | null;
  base: PrecosBase;
  promocoes: Promocao[];
};

export const TABELA_PADRAO: TabelaPrecos = { versao: 0, atualizadoEm: null, base: { ...PRECOS_PADRAO }, promocoes: [] };

/* ------------------------------------------------------------------ */
/* O preço de uma noite                                                */
/* ------------------------------------------------------------------ */

/** Como baixa o preço do quarto: «desconto», «preco», ou null (não baixa). */
export const baixaPreco = (p: Promocao): "desconto" | "preco" | null => (p.precos ? "preco" : typeof p.desconto === "number" ? "desconto" : null);
export const ofereceAlmoco = (p: Promocao) => p.pequenoAlmoco === true;

/** Se a promoção vale nesta noite e para uma estadia destas (sem `noitesEstadia`, as de mínimo não contam). */
export const promocaoVale = (p: Promocao, dia: string, noitesEstadia = 1) => dia >= p.de && dia <= p.ate && noitesEstadia >= (p.minNoites ?? 1);

/** O preço de uma promoção para um tipo, a partir do preço normal (null se não o abrange ou não baixar o preço). */
export function precoDaPromocao(p: Promocao, alvo: Alvo, normal: number): number | null {
  const b = baixaPreco(p);
  if (!p.alvos.includes(alvo) || !b) return null;
  if (b === "preco") return typeof p.precos?.[alvo] === "number" ? p.precos[alvo]! : null;
  return Math.round(normal * (1 - p.desconto! / 100));
}

/**
  O preço de uma noite (AAAA-MM-DD) para um tipo, partindo do preço normal
  dessa noite. `antes` é o preço normal quando há promoção (para o riscar);
  `promo`, o nome da promoção que deu esse preço (a mais barata).
*/
export function aplicarPromocoes(
  t: TabelaPrecos,
  alvo: Alvo,
  dia: string,
  normal: number,
  noitesEstadia = 1,
): { preco: number; antes: number | null; promo: string | null } {
  let preco = normal;
  let promo: string | null = null;
  for (const p of t.promocoes) {
    if (!promocaoVale(p, dia, noitesEstadia)) continue;
    const v = precoDaPromocao(p, alvo, normal);
    if (v !== null && v > 0 && v < preco) {
      preco = v;
      promo = nomeDe(p);
    }
  }
  return { preco, antes: preco < normal ? normal : null, promo: preco < normal ? promo : null };
}

/** A promoção que oferece o pequeno-almoço nesta noite a quem dorme neste tipo (ou undefined). */
export const promocaoDoAlmoco = (t: TabelaPrecos, alvo: Alvo, dia: string, noitesEstadia = 1) =>
  t.promocoes.find((p) => ofereceAlmoco(p) && p.alvos.includes(alvo) && promocaoVale(p, dia, noitesEstadia));
export const pequenoAlmocoOferecido = (t: TabelaPrecos, alvo: Alvo, dia: string, noitesEstadia = 1) => !!promocaoDoAlmoco(t, alvo, dia, noitesEstadia);

/** Uma oferta que se aplicou: o texto e o nome da promoção. Os pedidos da ronda anterior guardavam só o texto. */
export type OfertaAplicada = { nome: string; texto: string };
export const descreverOferta = (o: OfertaAplicada | string) =>
  typeof o === "string" ? o : o.nome && o.nome !== NOME_PADRAO ? `${o.texto} (${o.nome})` : o.texto;

/** As ofertas que valem para estes quartos em alguma destas noites, sem repetir. */
export function ofertasDe(t: TabelaPrecos, alvos: Alvo[], noites: string[], n = noites.length): OfertaAplicada[] {
  const vistas = new Set<string>();
  const lista: OfertaAplicada[] = [];
  for (const p of t.promocoes) {
    if (!p.oferta || !p.alvos.some((a) => alvos.includes(a)) || !noites.some((d) => promocaoVale(p, d, n))) continue;
    const o = { nome: nomeDe(p), texto: p.oferta };
    const k = `${o.nome}|${o.texto}`;
    if (!vistas.has(k)) {
      vistas.add(k);
      lista.push(o);
    }
  }
  return lista;
}

/** As promoções que esta estadia apanha (nome e frase, para mostrar e guardar no pedido), sem repetir. */
export type PromocaoAplicada = { nome: string; frase: string };
export function promocoesDaEstadia(t: TabelaPrecos, alvos: Alvo[], noites: string[], n = noites.length): PromocaoAplicada[] {
  const lista: PromocaoAplicada[] = [];
  for (const p of t.promocoes) {
    if (!p.alvos.some((a) => alvos.includes(a)) || !noites.some((d) => promocaoVale(p, d, n))) continue;
    const x = { nome: nomeDe(p), frase: fraseDe(p) };
    if (!lista.some((y) => y.nome === x.nome && y.frase === x.frase)) lista.push(x);
  }
  return lista;
}

/*
  As promoções que estas noites e estes quartos quase apanham: só faltam
  noites. Para dizer ao hóspede, discretamente, «Fique 3 noites ou mais…».
*/
export function promocoesPorPoucas(t: TabelaPrecos, alvos: Alvo[], noites: string[]): Promocao[] {
  return t.promocoes.filter(
    (p) => (p.minNoites ?? 1) > noites.length && p.alvos.some((a) => alvos.includes(a)) && noites.some((d) => d >= p.de && d <= p.ate),
  );
}

/*
  As promoções a anunciar no formulário antes de escolher datas: as que se
  podem ainda apanhar (acabam a partir da primeira chegada possível) e que
  começam nos próximos `dias` dias; as mais próximas primeiro.
*/
export function promocoesAnunciar(t: TabelaPrecos, primeiraChegada: string, dias = 60, max = 3): Promocao[] {
  const limite = somarDiasIso(primeiraChegada, dias);
  return t.promocoes
    .filter((p) => p.ate >= primeiraChegada && p.de <= limite)
    .sort((a, b) => a.de.localeCompare(b.de) || a.ate.localeCompare(b.ate))
    .slice(0, max);
}

const noAlvo = (a: Alvo) => (a === "suite" ? "na Suite" : a === "casa" ? "na casa inteira" : `no ${nomeAlvo(a)}`);
const minuscula = (t: string) => (t.length > 1 && t[1] === t[1].toLocaleUpperCase("pt-PT") && /\p{L}/u.test(t[1]) ? t : t.charAt(0).toLocaleLowerCase("pt-PT") + t.slice(1));

/** O que a promoção dá, em pedaços: «Suite a 80 €», «10 % no Quarto Twin», «pequeno-almoço oferecido», «garrafa de vinho à chegada». */
export function partesDaPromocao(p: Promocao, base: PrecosBase, alvos: Alvo[] = p.alvos): string[] {
  const meus = p.alvos.filter((a) => alvos.includes(a));
  const out: string[] = [];
  const b = baixaPreco(p);
  if (b === "desconto") out.push(`${p.desconto} % ${meus.map(noAlvo).join(" e ")}`);
  if (b === "preco") out.push(meus.map((a) => `${a === "casa" ? "Casa inteira" : nomeAlvo(a)} a ${euro(p.precos?.[a] ?? base[a])}`).join(", "));
  if (ofereceAlmoco(p)) out.push("pequeno-almoço oferecido");
  if (p.oferta) out.push(minuscula(p.oferta));
  return out;
}

/** «Magusto · de 1 a 15 de novembro · Suite a 80 € · pequeno-almoço oferecido · garrafa de vinho à chegada». */
export function resumoPromocao(p: Promocao, base: PrecosBase): string {
  return [nomeDe(p), descreverDatas(p), ...partesDaPromocao(p, base), descreverMinimo(p)].filter(Boolean).join(" · ");
}

/** «Magusto · fique 3 noites ou mais: 10 % no Quarto Twin, pequeno-almoço oferecido». */
export function convite(p: Promocao, alvos: Alvo[], base: PrecosBase): string {
  return `${nomeDe(p)} · fique ${p.minNoites ?? 1} noites ou mais: ${partesDaPromocao(p, base, alvos).join(", ")}`;
}

/* ------------------------------------------------------------------ */
/* Limites (os mesmos no editor e no servidor)                         */
/* ------------------------------------------------------------------ */

/*
  Para um engano (um zero a mais, um a menos) não ir parar ao site:
    - preços de todos os dias entre 30 % e 200 % dos preços de origem;
    - preço de promoção entre 30 % do preço normal e abaixo dele;
    - desconto entre 5 % e 70 %;
    - datas válidas, não passadas, por ordem e até ~13 meses à frente.
*/
export const LIMITE_MIN = 0.3;
export const LIMITE_MAX = 2;
export const DESCONTO_MIN = 5;
export const DESCONTO_MAX = 70;
export const PROMOCOES_MAX = 30;
/** «Só para estadias de N noites ou mais»: entre 2 e 30. */
export const MIN_NOITES_MIN = 2;
export const MIN_NOITES_MAX = 30;
/** Até quantos dias à frente se marca uma promoção (o formulário aceita chegadas até 400 dias). */
export const DIAS_MAX_PROMOCAO = 400;

export const limitesBase = (c: CampoBase) => ({
  min: Math.max(1, Math.ceil(PRECOS_PADRAO[c] * LIMITE_MIN)),
  max: Math.floor(PRECOS_PADRAO[c] * LIMITE_MAX),
});
export const limitesPromocao = (normal: number) => ({ min: Math.max(1, Math.ceil(normal * LIMITE_MIN)), max: normal - 1 });

const inteiro = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const dataValida = (v: unknown): v is string => {
  if (typeof v !== "string" || !DATA.test(v)) return false;
  const [a, m, d] = v.split("-").map(Number);
  const x = new Date(Date.UTC(a, m - 1, d));
  return x.getUTCFullYear() === a && x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
};
const somarDiasIso = (v: string, n: number) => {
  const [a, m, d] = v.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
};
const euro = (v: number) => `${v} €`;

/** O erro de um preço de todos os dias, em palavras simples (ou null). */
export function erroBase(c: CampoBase, v: unknown): string | null {
  const nome = CAMPOS_BASE.find((x) => x.id === c)!.nome;
  if (v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v))) return `Falta o preço: ${nome}.`;
  if (!inteiro(v)) return `${nome}: escreva só euros, sem cêntimos.`;
  if (v <= 0) return `${nome}: o preço não pode ser zero.`;
  const { min, max } = limitesBase(c);
  if (v < min || v > max) return `${nome}: ${euro(v)} parece-nos um engano. Pode pôr entre ${euro(min)} e ${euro(max)}.`;
  return null;
}

/** Os erros de uma promoção (vazio se estiver bem). `nova`: ainda não estava guardada (não pode começar no passado). */
export function errosPromocao(p: Promocao, base: PrecosBase, hoje: string, nova: boolean): string[] {
  const e: string[] = [];
  if (p.nome !== undefined && p.nome !== null) {
    const n = normalizarNome(p.nome);
    if (n.erro) e.push(n.erro);
  }
  if (p.frase !== undefined && p.frase !== null) {
    const f = normalizarFrase(p.frase);
    if (f.erro) e.push(f.erro);
  }
  if (!dataValida(p.de) || !dataValida(p.ate)) e.push("Escolha quando começa e quando acaba.");
  else {
    if (p.ate < p.de) e.push("Acaba antes de começar: troque as datas.");
    if (p.ate < hoje) e.push("Estas noites já passaram.");
    else if (nova && p.de < hoje) e.push("Começa num dia que já passou: escolha de hoje em diante.");
    if (p.de > somarDiasIso(hoje, DIAS_MAX_PROMOCAO) || p.ate > somarDiasIso(hoje, DIAS_MAX_PROMOCAO + 60))
      e.push("Estas datas estão demasiado longe (mais de um ano).");
  }
  if (!Array.isArray(p.alvos) || !p.alvos.length) e.push("Escolha pelo menos um quarto.");
  else if (p.alvos.some((a) => !ALVOS.some((x) => x.id === a)) || new Set(p.alvos).size !== p.alvos.length) e.push("Quartos inválidos.");

  const temDesconto = p.desconto !== undefined && p.desconto !== null;
  const temPrecos = p.precos !== undefined && p.precos !== null;
  const temAlmoco = p.pequenoAlmoco === true;
  const temOferta = typeof p.oferta === "string" && p.oferta.trim() !== "";
  if (p.pequenoAlmoco !== undefined && typeof p.pequenoAlmoco !== "boolean") e.push("Pequeno-almoço inválido.");
  if (!temDesconto && !temPrecos && !temAlmoco && !temOferta) e.push("Marque pelo menos uma coisa em «O que oferece».");
  if (p.oferta !== undefined && p.oferta !== null) {
    const o = normalizarOferta(p.oferta);
    if (o.erro) e.push(`Outra oferta: ${o.erro}`);
  }
  if (p.minNoites !== undefined && p.minNoites !== null && (!inteiro(p.minNoites) || p.minNoites < MIN_NOITES_MIN || p.minNoites > MIN_NOITES_MAX))
    e.push(`O mínimo de noites tem de ser entre ${MIN_NOITES_MIN} e ${MIN_NOITES_MAX}.`);
  if (temDesconto && temPrecos) e.push("Escolha um desconto ou um preço novo, não os dois.");
  else if (temDesconto) {
    if (!inteiro(p.desconto) || p.desconto < DESCONTO_MIN || p.desconto > DESCONTO_MAX)
      e.push(`O desconto tem de ser entre ${DESCONTO_MIN} % e ${DESCONTO_MAX} %.`);
  } else if (temPrecos && Array.isArray(p.alvos)) {
    for (const a of p.alvos) {
      const v = p.precos?.[a];
      const nome = nomeAlvo(a);
      if (v === undefined || v === null || (typeof v === "number" && Number.isNaN(v))) {
        e.push(`Falta o preço novo: ${nome}.`);
        continue;
      }
      if (!inteiro(v)) {
        e.push(`${nome}: escreva só euros, sem cêntimos.`);
        continue;
      }
      const normal = base[a];
      const { min } = limitesPromocao(normal);
      if (v >= normal) e.push(`${nome}: o preço novo tem de ser mais baixo do que o normal (${euro(normal)}).`);
      else if (v < min) e.push(`${nome}: ${euro(v)} parece-nos um engano. O mínimo é ${euro(min)} (o normal é ${euro(normal)}).`);
    }
    if (Object.keys(p.precos ?? {}).some((k) => !p.alvos.includes(k as Alvo))) e.push("Há um preço para um quarto que não está escolhido.");
  }
  return e;
}

/** Valida a tabela inteira (o servidor usa isto antes de guardar). */
export function errosTabela(base: PrecosBase, promocoes: Promocao[], hoje: string, idsGuardados: Set<string>): string[] {
  const e: string[] = [];
  if (!base || typeof base !== "object") return ["Preços em formato desconhecido."];
  for (const c of CAMPOS_BASE) {
    const x = erroBase(c.id, base[c.id]);
    if (x) e.push(x);
  }
  if (Object.keys(base).some((k) => !CAMPOS_BASE.some((c) => c.id === k))) e.push("Preços em formato desconhecido.");
  if (!Array.isArray(promocoes)) return [...e, "Promoções em formato desconhecido."];
  if (promocoes.length > PROMOCOES_MAX) e.push(`No máximo ${PROMOCOES_MAX} promoções de cada vez.`);
  const ids = new Set<string>();
  for (const p of promocoes) {
    if (!p || typeof p !== "object" || typeof p.id !== "string" || !/^[a-z0-9-]{4,40}$/.test(p.id) || ids.has(p.id)) {
      e.push("Promoção em formato desconhecido.");
      continue;
    }
    ids.add(p.id);
    // Só com os campos conhecidos.
    if (Object.keys(p).some((k) => !["id", "nome", "frase", "de", "ate", "alvos", "minNoites", "desconto", "precos", "pequenoAlmoco", "oferta"].includes(k))) e.push("Promoção em formato desconhecido.");
    e.push(...errosPromocao(p, base, hoje, !idsGuardados.has(p.id)).map((x) => `${nomeDe(p)}, ${descreverDatas(p)}: ${x}`));
  }
  return [...new Set(e)];
}

/** As promoções que já acabaram saem (ao guardar). */
export const promocoesEmVigor = (lista: Promocao[], hoje: string) => lista.filter((p) => p.ate >= hoje);

/* ------------------------------------------------------------------ */
/* Em palavras                                                         */
/* ------------------------------------------------------------------ */

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const partes = (v: string) => v.split("-").map(Number);

/** «de 1 a 15 de dezembro», «de 28 de dezembro a 3 de janeiro de 2027», «a noite de 24 de dezembro». */
export function descreverDatas(p: { de: string; ate: string }): string {
  if (!dataValida(p.de) || !dataValida(p.ate)) return "Promoção";
  const [a1, m1, d1] = partes(p.de);
  const [a2, m2, d2] = partes(p.ate);
  const anoAtual = new Date().getFullYear();
  const ano = (a: number) => (a !== anoAtual ? ` de ${a}` : "");
  if (p.de === p.ate) return `a noite de ${d1} de ${MESES[m1 - 1]}${ano(a1)}`;
  if (a1 === a2 && m1 === m2) return `de ${d1} a ${d2} de ${MESES[m2 - 1]}${ano(a2)}`;
  if (a1 === a2) return `de ${d1} de ${MESES[m1 - 1]} a ${d2} de ${MESES[m2 - 1]}${ano(a2)}`;
  return `de ${d1} de ${MESES[m1 - 1]} de ${a1} a ${d2} de ${MESES[m2 - 1]} de ${a2}`;
}

/** Para o email ao Diogo e o resumo do editor: tudo, com os quartos. */
export function descreverPromocao(p: Promocao, base: PrecosBase): string {
  const precos =
    baixaPreco(p) !== null
      ? p.alvos.map((a) => `${nomeAlvo(a)} ${euro(precoDaPromocao(p, a, base[a]) ?? base[a])} (em vez de ${euro(base[a])})`).join(", ")
      : "";
  return [
    `«${nomeDe(p)}»`,
    `frase: «${fraseDe(p)}»${p.frase ? "" : " (a neutra)"}`,
    descreverDatas(p),
    `quartos: ${p.alvos.map(nomeAlvo).join(", ")}`,
    baixaPreco(p) === "desconto" ? `desconto de ${p.desconto} %: ${precos}` : baixaPreco(p) === "preco" ? `preço novo: ${precos}` : "",
    ofereceAlmoco(p) ? "pequeno-almoço oferecido" : "",
    p.oferta ? `oferta: «${p.oferta}»` : "",
    descreverMinimo(p),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** «estadias de 2 noites ou mais» (vazio sem mínimo). */
export const descreverMinimo = (p: Promocao) => (p.minNoites ? `estadias de ${p.minNoites} noites ou mais` : "");

/** O que mudou de uma tabela para outra, linha a linha (para o email ao Diogo e o resumo do editor). */
export function diferencas(antes: Pick<TabelaPrecos, "base" | "promocoes">, depois: Pick<TabelaPrecos, "base" | "promocoes">): string[] {
  const linhas: string[] = [];
  for (const c of CAMPOS_BASE) {
    if (antes.base[c.id] !== depois.base[c.id]) linhas.push(`${c.nome}: ${euro(antes.base[c.id])} → ${euro(depois.base[c.id])} ${c.unidade}`);
  }
  const chave = (p: Promocao) =>
    JSON.stringify([p.nome ?? null, p.frase ?? null, p.de, p.ate, [...p.alvos].sort(), p.minNoites ?? null, p.desconto ?? null, p.precos ?? null, !!p.pequenoAlmoco, p.oferta ?? null]);
  const antesK = new Map(antes.promocoes.map((p) => [p.id, chave(p)]));
  const depoisK = new Map(depois.promocoes.map((p) => [p.id, chave(p)]));
  for (const p of depois.promocoes) {
    if (!antesK.has(p.id)) linhas.push(`Promoção nova: ${descreverPromocao(p, depois.base)}`);
    else if (antesK.get(p.id) !== depoisK.get(p.id)) linhas.push(`Promoção mudada: ${descreverPromocao(p, depois.base)}`);
  }
  for (const p of antes.promocoes) if (!depoisK.has(p.id)) linhas.push(`Promoção apagada: ${descreverPromocao(p, antes.base)}`);
  return linhas;
}

/** Uma tabela vinda de fora (armazém, rede), com os valores de origem no que faltar. */
export function normalizarTabela(v: unknown): TabelaPrecos {
  const t = (v ?? {}) as Partial<TabelaPrecos>;
  const base = { ...PRECOS_PADRAO };
  for (const c of CAMPOS_BASE) {
    const x = t.base?.[c.id];
    if (inteiro(x) && x > 0) base[c.id] = x;
  }
  // Os textos (nome e oferta) voltam a passar pelo normalizador: nunca entram sujos, venham de onde vierem.
  const promocoes = Array.isArray(t.promocoes)
    ? t.promocoes.filter((p) => p && dataValida(p.de) && dataValida(p.ate) && Array.isArray(p.alvos)).map(normalizarPromocao)
    : [];
  return { versao: inteiro(t.versao) ? t.versao : 0, atualizadoEm: typeof t.atualizadoEm === "string" ? t.atualizadoEm : null, base, promocoes };
}

/** Só os campos conhecidos, com os textos limpos (as da ronda anterior tinham `efeito`). */
export function normalizarPromocao(p: Promocao & { efeito?: string }): Promocao {
  const nome = normalizarNome(p.nome);
  const frase = normalizarFrase(p.frase);
  const oferta = normalizarOferta(p.oferta);
  return {
    id: p.id,
    ...(nome.texto && !nome.erro ? { nome: nome.texto } : {}),
    ...(frase.texto && !frase.erro ? { frase: frase.texto } : {}),
    de: p.de,
    ate: p.ate,
    alvos: [...p.alvos],
    ...(typeof p.minNoites === "number" ? { minNoites: p.minNoites } : {}),
    ...(p.precos
      ? { precos: Object.fromEntries(p.alvos.filter((a) => typeof p.precos?.[a] === "number").map((a) => [a, p.precos![a]])) }
      : typeof p.desconto === "number"
        ? { desconto: p.desconto }
        : {}),
    ...(p.pequenoAlmoco === true || p.efeito === "pequenoAlmoco" ? { pequenoAlmoco: true } : {}),
    ...(typeof p.oferta === "string" && !oferta.erro ? { oferta: oferta.texto } : {}),
  };
}
