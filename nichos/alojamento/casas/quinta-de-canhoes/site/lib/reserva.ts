/*
  Os dados e as contas do formulário de reserva (/reservar).

  Tudo o que a casa ainda tem de decidir está aqui, em constantes, marcado
  com «POR CONFIRMAR com a Teresa» (quando ainda há). O formulário só lê
  daqui: muda-se um valor nesta página e o site inteiro acompanha.

  REGRA DOS ARREDONDAMENTOS (fica igual no ecrã, no pedido e nos emails):
    1. Cada noite de cada quarto soma-se ao preço exato da tabela.
    2. O total da estadia (quartos + pequeno-almoço) arredonda-se ao euro
       (Math.round). É o único arredondamento do total.
    3. O sinal é a percentagem desse total, arredondada ao euro PARA CIMA
       (Math.ceil): a casa nunca recebe menos do que a percentagem.
    4. O restante é total − sinal. Assim sinal + restante = total, sempre,
       e no ecrã não aparecem cêntimos.
*/

/* ------------------------------------------------------------------ */
/* Quartos                                                             */
/* ------------------------------------------------------------------ */

export type TipoQuarto = "duplo" | "twin" | "suite";

export type Quarto = {
  id: TipoQuarto;
  nome: string;
  camas: string;
  nota: string;
  foto: string;
  alt: string;
  /** object-position da foto no cartão. */
  foco: string;
  /** Só para a sugestão e para o aviso de camas; não se mostra. Todos os
      cama de casal dá 2 pessoas, um sofá-cama dá 1 (o Diogo, 2026-10-21):
      Duplo 2, Twin 2, Suite 4 (cama de casal e dois sofás-cama). */
  lugares: number;
  /** O que se mostra no cartão: para quantas pessoas é o preço. */
  paraQuem: string;
};

export const quartos: Quarto[] = [
  {
    id: "duplo",
    nome: "Quarto Duplo",
    camas: "Uma cama de casal",
    nota: "Casa de banho privativa",
    foto: "/fotos/quartos/quarto duplo/quarto duplo.jpg",
    alt: "Quarto Duplo com cama de casal de cabeceira de madeira, almofadas bordadas e candeeiros acesos nas mesas de cabeceira.",
    foco: "50% 62%",
    lugares: 2,
    paraQuem: "Para 2 pessoas",
  },
  {
    id: "twin",
    nome: "Quarto Twin",
    camas: "Duas camas individuais (juntam-se a pedido)",
    nota: "Casa de banho privativa",
    foto: "/fotos/quartos/quarto-twin.jpg",
    alt: "Quarto Twin com duas camas individuais juntas, almofadas bordadas e janela com portadas de madeira abertas.",
    foco: "50% 60%",
    lugares: 2,
    paraQuem: "Para 2 pessoas",
  },
  {
    id: "suite",
    nome: "Suite",
    camas: "Uma cama de casal e dois sofás-cama",
    nota: "Máquina de café e minibar",
    foto: "/fotos/quartos/suite/quarto suite.jpg",
    alt: "Suite com cama de casal, colcha florida, candeeiros acesos e paredes amarelas quentes.",
    foco: "40% 62%",
    lugares: 4,
    paraQuem: "Preço para 2 pessoas; crianças dos 3 aos 10 nos sofás-cama",
  },
];

export const nomeQuarto = (id: TipoQuarto) => quartos.find((q) => q.id === id)!.nome;

/*
  Quantos quartos há de cada tipo (o Diogo, 2026-10-21): 2 Duplos, 2 Twin e
  2 Suites. Conta para o calendário, a validação e a lotação.
*/
export const UNIDADES_MAX: Record<TipoQuarto, number> = {
  duplo: 2,
  twin: 2,
  suite: 2,
};

/* ------------------------------------------------------------------ */
/* Preços por noite                                                    */
/* ------------------------------------------------------------------ */

/*
  Preços da casa, 23 out 2026 (a D. Teresa): Quarto Duplo 64 €, Quarto Twin
  61 €, Suite 97 € (para 2 pessoas), por noite, sem pequeno-almoço. Iguais
  o ano inteiro.

  `base` é o preço por noite de cada tipo. `periodos` sobrepõem-se à base
  quando a noite cai dentro deles (o último que servir ganha). Um período
  pode valer só para certos dias da semana, contados pela NOITE: a noite
  de sexta é 5, a de sábado é 6 (0 = domingo). Vazio por agora.

  Exemplo, para quando houver épocas:
    { nome: "Verão", de: "2027-07-01", ate: "2027-09-01", precos: { duplo: 95, suite: 125 } },
    { nome: "Fim de semana", diasDaSemana: [5, 6], precos: { duplo: 90 } },
  (`ate` é a primeira noite que JÁ NÃO conta.)
*/
export type Periodo = {
  nome: string;
  de?: string; // AAAA-MM-DD, inclusive
  ate?: string; // AAAA-MM-DD, exclusive
  diasDaSemana?: number[];
  precos: Partial<Record<TipoQuarto, number>>;
};

export const TARIFAS: {
  fonte: string;
  recolhidas: string;
  base: Record<TipoQuarto, number>;
  periodos: Periodo[];
} = {
  fonte: "Preços da casa",
  recolhidas: "2026-10-23",
  base: {
    duplo: 64,
    twin: 61,
    suite: 97,
  },
  periodos: [],
};

/* ------------------------------------------------------------------ */
/* Pequeno-almoço, sinal e condições                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* A casa inteira                                                      */
/* ------------------------------------------------------------------ */

/* Preço por noite da casa inteira, em euros (a Teresa, 2026-10-20). As
   contas, o sinal e o pequeno-almoço fazem-se como nos quartos. Se voltar
   a null, o formulário diz que o preço vem na nossa resposta. */
export const PRECO_CASA_INTEIRA: number | null = 600;

/** Estadia mínima da casa inteira (a Teresa, 2026-10-20). */
export const NOITES_MINIMAS_CASA = 2;

/** Quantas pessoas cabem na casa inteira: 2×2 + 2×2 + 2×4 = 16. */
export const CASA_INTEIRA_LUGARES = quartos.reduce((s, q) => s + q.lugares * UNIDADES_MAX[q.id], 0);

/** A partir de quantas pessoas a sugestão passa a ser a casa inteira (~80 % dos 16 lugares). */
export const SUGERIR_CASA_A_PARTIR_DE = 13;

/** Por pessoa e por noite, em euros. Pode vir a ser oferta. */
export const PEQUENO_ALMOCO_POR_PESSOA = 8;

/** Percentagem do total que confirma a reserva. */
export const SINAL_PERCENTAGEM = 30;

/* Quando se paga o restante (o Diogo, 2026-10-20: os 70 % pagam-se na
   chegada). Lê-se depois de «O restante, Z €, paga-se ». */
export const QUANDO_RESTANTE = "à chegada à quinta";

/* ------------------------------------------------------------------ */
/* Crianças (a Teresa e o Diogo, 2026-10-23)                           */
/* ------------------------------------------------------------------ */

/*
  - até 3 anos: grátis (estadia e pequeno-almoço); dorme num berço que cabe
    em qualquer quarto; não ocupa lugar.
  - 3 a 10 anos: 15 €/noite, com cama suplementar e pequeno-almoço. A cama
    suplementar só cabe nas Suites: as crianças dormem nos sofás-cama (dois
    por Suite). Na casa inteira não pagam extra (já está nos 600 €).
  - com mais de 10 anos: conta-se nos adultos (não há escalão próprio).
*/
export type Escalao = "bebe" | "crianca";
export const ESCALOES: { id: Escalao; nome: string }[] = [
  { id: "bebe", nome: "até 3 anos" },
  { id: "crianca", nome: "3 a 10 anos" },
];
export type Grupo = { adultos: number; criancas: Escalao[] };

/** Criança dos 3 aos 10, por noite, com cama suplementar e pequeno-almoço. */
export const CAMA_SUPLEMENTAR_POR_NOITE = 15;
/** Sofás-cama por Suite: onde dormem as crianças dos 3 aos 10. */
export const SOFAS_CAMA_POR_SUITE = 2;
/** Na casa inteira as crianças 3–10 não pagam extra (está nos 600 €). */
export const CAMA_SUPLEMENTAR_PAGA_NA_CASA_INTEIRA = false;
/** Crianças por pedido, no máximo. */
export const CRIANCAS_MAX = 8;

export const NOTA_CRIANCAS =
  "Até aos 3 anos é gratuito; temos berço. 3 a 10 anos: 15 € por noite, com cama suplementar e pequeno-almoço (só nas Suites). Com mais de 10 anos, conte como adulto.";

const contar = (g: Grupo, e: Escalao) => g.criancas.filter((c) => c === e).length;
/** Quem ocupa um lugar normal (e paga o pequeno-almoço): os adultos. */
export const lugaresNormais = (g: Grupo) => g.adultos;
/** Crianças dos 3 aos 10 (cama suplementar). */
export const criancasCama = (g: Grupo) => contar(g, "crianca");
export const bebes = (g: Grupo) => contar(g, "bebe");
export const totalPessoas = (g: Grupo) => g.adultos + g.criancas.length;

/*
  Se a escolha de quartos serve o grupo. As crianças dos 3 aos 10 dormem nos
  sofás-cama das Suites (até 2 por Suite); os adultos ocupam os outros lugares.
*/
export function faltaSuite(escolha: Escolha, g: Grupo): string | null {
  const c = criancasCama(g);
  const suites = escolha.suite ?? 0;
  if (c <= SOFAS_CAMA_POR_SUITE * suites) return null;
  return suites === 0
    ? "As crianças dos 3 aos 10 anos só podem ficar numa Suite (dormem nos sofás-cama): escolha uma Suite."
    : `Cada Suite leva até ${SOFAS_CAMA_POR_SUITE} crianças dos 3 aos 10 anos: escolha mais uma Suite.`;
}
export function cabeGrupo(escolha: Escolha, g: Grupo): string | null {
  const falta = faltaSuite(escolha, g);
  if (falta) return falta;
  if (lugaresDe(escolha) < g.adultos + criancasCama(g)) return "Os quartos escolhidos não chegam para o grupo.";
  return null;
}

/*
  Adultos a mais nas Suites: os que não cabem nos Duplos/Twin nem nas camas
  de casal das Suites. Não há preço definido para isso; o pedido segue com o
  preço da Suite e a casa confirma o total.
*/
export function adultosNasSuites(escolha: Escolha, g: Grupo): number {
  const suites = escolha.suite ?? 0;
  if (!suites) return 0;
  const foraDasSuites = 2 * ((escolha.duplo ?? 0) + (escolha.twin ?? 0));
  const nasSuites = Math.max(0, g.adultos - foraDasSuites);
  return nasSuites > 2 * suites ? nasSuites : 0;
}

/** O remetente das respostas, para o hóspede procurar no spam. */
export const EMAIL_RESPOSTAS = "reservas.casadecanhoes@gmail.com";
export const AVISO_SPAM = `A nossa resposta vem de ${EMAIL_RESPOSTAS}. Se não a vir na caixa de entrada, veja no spam (e adicione-nos aos contactos).`;
export const AVISO_SPAM_EMAIL = `Os nossos emails vêm de ${EMAIL_RESPOSTAS}: adicione-nos aos contactos para não irem parar ao spam.`;

export const NOTA_SUITE_ADULTOS = "Com mais de 2 adultos na Suite, o preço final é confirmado pela casa.";

/** «2 adultos · 1 criança (3–10) · 1 bebé (berço)». */
export function descreverGrupo(g: Grupo) {
  const p: string[] = [`${g.adultos} ${g.adultos === 1 ? "adulto" : "adultos"}`];
  const c = criancasCama(g);
  const b = bebes(g);
  if (c) p.push(`${c} ${c === 1 ? "criança" : "crianças"} (3–10)`);
  if (b) p.push(`${b} ${b === 1 ? "bebé" : "bebés"} (berço)`);
  return p.join(" · ");
}

/* O que acontece ao sinal se o hóspede cancelar (a Teresa, 2026-10-20). */
export const POLITICA_SINAL = "Se cancelar até 10 dias antes da chegada, devolvemos metade do sinal. Depois disso, o sinal não é devolvido.";

/** Animais (a Teresa, 2026-10-23): até 8 kg ficam consigo; com mais, no canil da quinta. Sem custo. */
export const NOTA_ANIMAIS = "Animais até 8 kg ficam consigo, gratuitos; com mais de 8 kg ficam no canil da quinta.";

export type TipoAnimal = "nao" | "pequeno" | "grande";
/** O animal de um pedido (os antigos guardavam true para «até 8 kg»). */
export const animalDoPedido = (p: { animal?: unknown }): TipoAnimal =>
  p.animal === "grande" ? "grande" : p.animal === "pequeno" || p.animal === true ? "pequeno" : "nao";
/** O animal de um pedido, em texto. */
export function textoAnimal(p: { animal?: unknown }): string | null {
  const t = animalDoPedido(p);
  return t === "nao" ? null : descreverAnimal(t);
}
export const descreverAnimal = (t: TipoAnimal) =>
  t === "grande" ? "Animal com mais de 8 kg (canil)" : t === "pequeno" ? "Animal até 8 kg (gratuito)" : "Sem animal";

/** Noites mínimas por estadia. POR CONFIRMAR com a Teresa. */
export const NOITES_MINIMAS = 1;

/* A sugestão do calendário: depois de escolher a chegada, marca a saída
   duas noites depois, o tempo de ir às Termas e de descer ao Vouga. */
export const NOITES_RECOMENDADAS = 2;

/** Grupo maior do que isto fala com a Teresa. */
export const PESSOAS_MAX = CASA_INTEIRA_LUGARES;

/* ------------------------------------------------------------------ */
/* Ocupação (o nosso calendário)                                       */
/* ------------------------------------------------------------------ */

/*
  Por noite (AAAA-MM-DD da noite): quantos quartos de cada tipo estão
  ocupados por pedidos confirmados ou pagos, e se a casa inteira está tomada.
  Vem do servidor (/api/disponibilidade), sem dados pessoais.
*/
export type NoiteOcupada = {
  duplo: number;
  twin: number;
  suite: number;
  casa: boolean;
};
export type Ocupacao = Record<string, NoiteOcupada>;

const algumQuarto = (n?: NoiteOcupada) => !!n && (n.duplo > 0 || n.twin > 0 || n.suite > 0);

/** Se o que se escolheu cabe numa noite. A casa inteira não cabe com nenhum quarto ocupado. */
export function cabeNaNoite(n: NoiteOcupada | undefined, escolha: Escolha, casaInteira: boolean) {
  if (!n) return true;
  if (n.casa) return false;
  if (casaInteira) return !algumQuarto(n);
  // Só contam os tipos que se pedem (um tipo já cheio a mais não fecha os outros).
  return (Object.keys(UNIDADES_MAX) as TipoQuarto[]).every((t) => !(escolha[t] ?? 0) || n[t] + escolha[t]! <= UNIDADES_MAX[t]);
}

export const cabeNasNoites = (o: Ocupacao, noites: string[], escolha: Escolha, casaInteira: boolean) =>
  noites.every((d) => cabeNaNoite(o[d], escolha, casaInteira));

/** As noites em que o que se escolheu não cabe (o calendário fecha-as). */
export function noitesFechadas(o: Ocupacao, escolha: Escolha, casaInteira: boolean): Set<string> {
  return new Set(Object.keys(o).filter((d) => !cabeNaNoite(o[d], escolha, casaInteira)));
}

/** Se cabe mais um quarto deste tipo em todas as noites (para o «Sem vaga» dos cartões). */
export const tipoLivreEm = (o: Ocupacao, id: TipoQuarto, noites: string[]) => noites.every((d) => cabeNaNoite(o[d], { [id]: 1 }, false));
export const casaLivreEm = (o: Ocupacao, noites: string[]) => noites.every((d) => cabeNaNoite(o[d], {}, true));

/* ------------------------------------------------------------------ */
/* Datas                                                               */
/* ------------------------------------------------------------------ */

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const somarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const noitesEntre = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

/** As noites da estadia (a data de cada noite é o dia em que se dorme). */
export function noitesDe(chegada: Date, saida: Date): Date[] {
  return Array.from({ length: Math.max(0, noitesEntre(chegada, saida)) }, (_, i) => somarDias(chegada, i));
}

/* ------------------------------------------------------------------ */
/* Contas                                                              */
/* ------------------------------------------------------------------ */

export function precoDaNoite(id: TipoQuarto, noite: Date): number {
  const dia = iso(noite);
  let preco = TARIFAS.base[id];
  for (const p of TARIFAS.periodos) {
    if (p.de && dia < p.de) continue;
    if (p.ate && dia >= p.ate) continue;
    if (p.diasDaSemana && !p.diasDaSemana.includes(noite.getDay())) continue;
    if (p.precos[id] !== undefined) preco = p.precos[id]!;
  }
  return preco;
}

export type Escolha = Partial<Record<TipoQuarto, number>>;

export type LinhaQuarto = {
  tipo: TipoQuarto;
  nome: string;
  quantidade: number;
  precosPorNoite: { noite: string; preco: number }[];
  /** Todas as noites de todas as unidades deste tipo. */
  subtotal: number;
};

export type Contas = {
  noites: number;
  /** Vazio quando é a casa inteira. */
  linhas: LinhaQuarto[];
  /** Só quando é a casa inteira; preço null enquanto a Teresa não o der. */
  casaInteira: { precoPorNoite: number | null; subtotal: number | null } | null;
  /** `pessoas`: quem paga o pequeno-almoço (adultos e crianças com mais de 10). */
  pequenoAlmoco: {
    incluido: boolean;
    porPessoaNoite: number;
    pessoas?: number;
    subtotal: number;
  };
  /** Camas suplementares das crianças dos 3 aos 10 (null se não houver). */
  camaSuplementar?: {
    criancas: number;
    porNoite: number;
    subtotal: number;
    incluidaNaCasa: boolean;
  } | null;
  /** null quando o preço vem na resposta da Teresa (casa inteira sem preço). */
  total: number | null;
  sinal: number | null;
  restante: number | null;
};

export function calcular(chegada: Date, saida: Date, escolha: Escolha, grupo: Grupo, comPequenoAlmoco: boolean, casaInteira = false): Contas {
  const noites = noitesDe(chegada, saida);
  const pagantesPA = lugaresNormais(grupo);
  const pa = comPequenoAlmoco ? PEQUENO_ALMOCO_POR_PESSOA * pagantesPA * noites.length : 0;
  const pequenoAlmoco = {
    incluido: comPequenoAlmoco,
    porPessoaNoite: PEQUENO_ALMOCO_POR_PESSOA,
    pessoas: pagantesPA,
    subtotal: pa,
  };
  const nCama = criancasCama(grupo);
  const camaIncluida = casaInteira && !CAMA_SUPLEMENTAR_PAGA_NA_CASA_INTEIRA;
  const camaSuplementar = nCama
    ? {
        criancas: nCama,
        porNoite: CAMA_SUPLEMENTAR_POR_NOITE,
        subtotal: camaIncluida ? 0 : nCama * CAMA_SUPLEMENTAR_POR_NOITE * noites.length,
        incluidaNaCasa: camaIncluida,
      }
    : null;
  const extra = pa + (camaSuplementar?.subtotal ?? 0);
  if (casaInteira) {
    const subtotal = PRECO_CASA_INTEIRA === null ? null : PRECO_CASA_INTEIRA * noites.length;
    const total = subtotal === null ? null : Math.round(subtotal + extra);
    const sinal = total === null ? null : Math.ceil((total * SINAL_PERCENTAGEM) / 100);
    return {
      noites: noites.length,
      linhas: [],
      casaInteira: { precoPorNoite: PRECO_CASA_INTEIRA, subtotal },
      pequenoAlmoco,
      camaSuplementar,
      total,
      sinal,
      restante: total === null || sinal === null ? null : total - sinal,
    };
  }
  const linhas: LinhaQuarto[] = quartos
    .filter((q) => (escolha[q.id] ?? 0) > 0)
    .map((q) => {
      const quantidade = escolha[q.id]!;
      const precosPorNoite = noites.map((n) => ({
        noite: iso(n),
        preco: precoDaNoite(q.id, n),
      }));
      const subtotal = precosPorNoite.reduce((s, n) => s + n.preco, 0) * quantidade;
      return { tipo: q.id, nome: q.nome, quantidade, precosPorNoite, subtotal };
    });
  const total = Math.round(linhas.reduce((s, l) => s + l.subtotal, 0) + extra);
  const sinal = Math.ceil((total * SINAL_PERCENTAGEM) / 100);
  return {
    noites: noites.length,
    linhas,
    casaInteira: null,
    pequenoAlmoco,
    camaSuplementar,
    total,
    sinal,
    restante: total - sinal,
  };
}

/*
  Os quartos que chegam para o grupo, contados pelos lugares de cada um
  (Duplo 2, Twin 2, Suite 3). Entre todas as combinações possíveis (até
  UNIDADES_MAX de cada tipo) que têm lugar para todos, escolhe a que usa
  MENOS QUARTOS e, em empate, a MAIS BARATA por noite (preço base).
  Exceção: para 1 ou 2 pessoas sugere sempre o Duplo (o Twin é mais barato,
  mas fica por decidir com o Diogo).
*/
export function sugestao(grupo: Grupo): Escolha {
  const normais = Math.min(PESSOAS_MAX, Math.max(1, lugaresNormais(grupo)));
  const g = { ...grupo, adultos: normais };
  if (normais <= 2 && criancasCama(grupo) === 0) return { duplo: 1 };
  // Primeiro sem adultos a mais nas Suites (o preço da Suite é para 2): a
  // sugestão leva sempre um total certo. Só se não houver, aceita-os.
  let melhor: { escolha: Escolha; quartos: number; preco: number } | null = null;
  for (const precoCerto of [true, false]) {
    if (melhor) break;
    for (let d = 0; d <= UNIDADES_MAX.duplo; d++)
      for (let t = 0; t <= UNIDADES_MAX.twin; t++)
        for (let su = 0; su <= UNIDADES_MAX.suite; su++) {
          const escolha: Escolha = { duplo: d, twin: t, suite: su };
          const nq = d + t + su;
          if (!nq || cabeGrupo(escolha, g) || (precoCerto && adultosNasSuites(escolha, g))) continue;
          const preco = d * TARIFAS.base.duplo + t * TARIFAS.base.twin + su * TARIFAS.base.suite;
          if (!melhor || nq < melhor.quartos || (nq === melhor.quartos && preco < melhor.preco)) {
            melhor = { escolha, quartos: nq, preco };
          }
        }
  }
  const e = melhor?.escolha ?? { ...UNIDADES_MAX };
  return Object.fromEntries(Object.entries(e).filter(([, v]) => v! > 0)) as Escolha;
}

/** A sugestão completa: a casa inteira quando o grupo a enche (ou quase). */
export function sugestaoCompleta(grupo: Grupo): {
  casaInteira: boolean;
  escolha: Escolha;
} {
  return {
    casaInteira: lugaresNormais(grupo) + criancasCama(grupo) >= SUGERIR_CASA_A_PARTIR_DE,
    escolha: sugestao(grupo),
  };
}

export const mesmaEscolha = (a: Escolha, b: Escolha) => quartos.every((q) => (a[q.id] ?? 0) === (b[q.id] ?? 0));

export const lugaresDe = (escolha: Escolha) => quartos.reduce((s, q) => s + q.lugares * (escolha[q.id] ?? 0), 0);

export const quartosDe = (escolha: Escolha) => quartos.reduce((s, q) => s + (escolha[q.id] ?? 0), 0);

/** «Quarto Duplo», «2 × Quarto Twin», «1 × Quarto Duplo + 1 × Quarto Twin». */
export function descreverEscolha(escolha: Escolha) {
  const usados = quartos.filter((q) => (escolha[q.id] ?? 0) > 0);
  const varios = quartosDe(escolha) > 1;
  return usados.map((q) => (varios ? `${escolha[q.id]} × ${q.nome}` : q.nome)).join(" + ");
}

/* ------------------------------------------------------------------ */
/* Validações                                                          */
/* ------------------------------------------------------------------ */

export const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Aceita 9 algarismos portugueses ou um número internacional com indicativo. */
export function telefoneValido(v: string) {
  const limpo = v.replace(/[\s().-]/g, "");
  if (/^(\+351|00351)?[29]\d{8}$/.test(limpo)) return true;
  return /^(\+|00)[1-9]\d{6,14}$/.test(limpo);
}

/* ------------------------------------------------------------------ */
/* O pedido                                                            */
/* ------------------------------------------------------------------ */

export type FormaPagamento = "mbway" | "transferencia";

export const FORMAS_PAGAMENTO: {
  id: FormaPagamento;
  nome: string;
  detalhe: string;
}[] = [
  { id: "mbway", nome: "MB WAY", detalhe: "Para o telemóvel da casa" },
  {
    id: "transferencia",
    nome: "Transferência",
    detalhe: "O IBAN segue por email",
  },
];

/*
  O pedido inteiro, autocontido: não há base de dados, por isso tudo o que
  a casa precisa para confirmar (e o hóspede para pagar) viaja aqui, e mais
  tarde vai assinado dentro dos links dos emails.
*/
export type PedidoReserva = {
  versao: 1;
  /** Dada pelo servidor ao receber o pedido. */
  referencia?: string;
  criadoEm: string;
  casa: string;
  estadia: { chegada: string; saida: string; noites: number };
  /** Total de pessoas (adultos e crianças). */
  pessoas: number;
  /** Ausentes nos pedidos antigos: aí, `pessoas` adultos e nenhuma criança. */
  adultos?: number;
  criancas?: Escalao[];
  camaSuplementar?: Contas["camaSuplementar"];
  casaInteira: Contas["casaInteira"];
  quartos: LinhaQuarto[];
  pequenoAlmoco: Contas["pequenoAlmoco"];
  moeda: "EUR";
  /* null quando é a casa inteira sem preço: a Teresa indica-o na resposta. */
  total: number | null;
  sinal: { percentagem: number; valor: number | null };
  restante: { valor: number | null; quando: string };
  hospede: { nome: string; email: string; telefone: string; mensagem: string };
  pagamento: FormaPagamento;
  /** O animal: «pequeno» (até 8 kg, gratuito) ou «grande» (mais de 8 kg, a casa decide). Os antigos tinham true. */
  animal?: boolean | "pequeno" | "grande";
  /** A decisão da casa sobre um animal com mais de 8 kg. */
  animalDecisao?: "aceite" | "recusado";
  /** Total ajustado pela casa ao confirmar. */
  ajuste?: { totalOriginal: number | null; motivo: string };
  tarifas: { fonte: string; recolhidas: string };
};

export function montarPedido(dados: {
  chegada: Date;
  saida: Date;
  grupo: Grupo;
  escolha: Escolha;
  casaInteira: boolean;
  comPequenoAlmoco: boolean;
  hospede: PedidoReserva["hospede"];
  pagamento: FormaPagamento;
  animal?: TipoAnimal;
}): PedidoReserva {
  const c = calcular(dados.chegada, dados.saida, dados.escolha, dados.grupo, dados.comPequenoAlmoco, dados.casaInteira);
  return {
    versao: 1,
    criadoEm: new Date().toISOString(),
    casa: "Quinta de Canhões",
    estadia: {
      chegada: iso(dados.chegada),
      saida: iso(dados.saida),
      noites: c.noites,
    },
    pessoas: totalPessoas(dados.grupo),
    adultos: dados.grupo.adultos,
    criancas: [...dados.grupo.criancas],
    camaSuplementar: c.camaSuplementar ?? null,
    casaInteira: c.casaInteira,
    quartos: c.linhas,
    pequenoAlmoco: c.pequenoAlmoco,
    moeda: "EUR",
    total: c.total,
    sinal: { percentagem: SINAL_PERCENTAGEM, valor: c.sinal },
    restante: { valor: c.restante, quando: QUANDO_RESTANTE },
    hospede: {
      nome: dados.hospede.nome.trim(),
      email: dados.hospede.email.trim(),
      telefone: dados.hospede.telefone.trim(),
      mensagem: dados.hospede.mensagem.trim(),
    },
    pagamento: dados.pagamento,
    animal: dados.animal && dados.animal !== "nao" ? dados.animal : false,
    tarifas: { fonte: TARIFAS.fonte, recolhidas: TARIFAS.recolhidas },
  };
}

/* ------------------------------------------------------------------ */
/* Do lado do servidor: refazer as contas e validar                    */
/* ------------------------------------------------------------------ */

/** AAAA-MM-DD para Date local (sem fusos a mexer no dia). */
export function deIso(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return iso(d) === v ? d : null;
}

/** O dia de hoje em Portugal, AAAA-MM-DD. */
export const hojeEmPortugal = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/* Os pedidos antigos podiam ter o escalão «maior10»: conta como adulto. */
export const grupoDoPedido = (p: PedidoReserva): Grupo => {
  const todas = (p.criancas ?? []) as string[];
  const maiores = todas.filter((c) => c === "maior10").length;
  return {
    adultos: (p.adultos ?? p.pessoas) + maiores,
    criancas: todas.filter((c): c is Escalao => c === "bebe" || c === "crianca"),
  };
};

export const escolhaDoPedido = (p: PedidoReserva): Escolha => Object.fromEntries(p.quartos.map((l) => [l.tipo, l.quantidade])) as Escolha;

/*
  Refaz o pedido a partir do que o hóspede escolheu, com as tarifas desta
  página: os valores que vêm do browser não contam. Opcionalmente com
  outras datas (uma alternativa da casa) e com o total combinado da casa
  inteira (quando ainda não há preço fixo).
*/
export type Alternativa = {
  chegada: string;
  saida: string;
  escolha?: Escolha;
  casaInteira?: boolean;
};

export function recalcularPedido(p: PedidoReserva, outras?: Alternativa, totalCombinado?: number | null): PedidoReserva {
  const chegada = deIso(outras?.chegada ?? p.estadia.chegada)!;
  const saida = deIso(outras?.saida ?? p.estadia.saida)!;
  const novo = montarPedido({
    chegada,
    saida,
    grupo: grupoDoPedido(p),
    escolha: outras?.escolha ?? escolhaDoPedido(p),
    casaInteira: outras?.casaInteira ?? p.casaInteira !== null,
    comPequenoAlmoco: p.pequenoAlmoco.incluido,
    hospede: p.hospede,
    pagamento: p.pagamento,
    animal: animalDoPedido(p),
  });
  novo.referencia = p.referencia;
  novo.criadoEm = p.criadoEm;
  if (novo.total === null && totalCombinado && totalCombinado > 0) {
    const total = Math.round(totalCombinado);
    const sinal = Math.ceil((total * SINAL_PERCENTAGEM) / 100);
    novo.total = total;
    novo.sinal.valor = sinal;
    novo.restante.valor = total - sinal;
  }
  return novo;
}

/** As noites mínimas de um pedido: a casa inteira tem as suas. */
export const noitesMinimas = (casaInteira: boolean) => (casaInteira ? Math.max(NOITES_MINIMAS, NOITES_MINIMAS_CASA) : NOITES_MINIMAS);

/** Pedidos pelo formulário: chegada a partir de depois de amanhã (hoje e amanhã, fala-se connosco). */
export const DIAS_ANTECEDENCIA_FORMULARIO = 2;

/** A primeira chegada que se pode pedir pelo formulário (AAAA-MM-DD, em Portugal). */
export const primeiraChegadaFormulario = () => iso(somarDias(deIso(hojeEmPortugal())!, DIAS_ANTECEDENCIA_FORMULARIO));

/** Datas coerentes e no futuro. `antecedencia`: dias mínimos até à chegada. Devolve o erro, ou null. */
export function validarDatas(chegada: string, saida: string, casaInteira = false, antecedencia = 0): string | null {
  const c = deIso(chegada);
  const s = deIso(saida);
  if (!c || !s) return "As datas não são válidas.";
  if (chegada < hojeEmPortugal()) return "A chegada já passou.";
  if (chegada < iso(somarDias(deIso(hojeEmPortugal())!, antecedencia))) return "Para hoje ou amanhã, fale connosco.";
  const n = noitesEntre(c, s);
  const minimo = noitesMinimas(casaInteira);
  if (n < minimo) return casaInteira ? `A casa inteira tem um mínimo de ${minimo} noites.` : `A estadia mínima é de ${minimo} noite(s).`;
  if (n > 60) return "Para mais de 60 noites, fale connosco.";
  if (noitesEntre(deIso(hojeEmPortugal())!, c) > 400) return "A chegada está demasiado longe.";
  return null;
}

/** Valida um pedido que chegou do browser. Devolve a lista de erros (vazia se estiver bem). */
export function validarPedido(p: PedidoReserva): string[] {
  const erros: string[] = [];
  if (!p || typeof p !== "object" || p.versao !== 1) return ["Pedido em formato desconhecido."];
  const e = validarDatas(p.estadia?.chegada, p.estadia?.saida, p.casaInteira !== null && p.casaInteira !== undefined, DIAS_ANTECEDENCIA_FORMULARIO);
  if (e) erros.push(e);
  if (p.animal !== undefined && typeof p.animal !== "boolean" && p.animal !== "pequeno" && p.animal !== "grande") erros.push("Animal inválido.");
  const adultos = p.adultos ?? p.pessoas;
  const criancas = p.criancas ?? [];
  if (!Number.isInteger(adultos) || adultos < 1 || adultos > PESSOAS_MAX) erros.push("Número de adultos inválido.");
  else if (!Array.isArray(criancas) || criancas.length > CRIANCAS_MAX || criancas.some((c) => !ESCALOES.some((e) => e.id === c)))
    erros.push("Idades das crianças inválidas.");
  else {
    const g = { adultos, criancas };
    if (lugaresNormais(g) > PESSOAS_MAX) erros.push("Grupo maior do que a casa.");
    if (lugaresNormais(g) + criancasCama(g) > PESSOAS_MAX || criancasCama(g) > UNIDADES_MAX.suite * SOFAS_CAMA_POR_SUITE)
      erros.push("Para este grupo, fale connosco.");
  }
  const casa = p.casaInteira !== null && p.casaInteira !== undefined;
  if (!Array.isArray(p.quartos)) erros.push("Quartos inválidos.");
  else if (!casa) {
    if (!p.quartos.length) erros.push("Falta escolher um quarto.");
    for (const l of p.quartos) {
      if (!(l.tipo in UNIDADES_MAX)) erros.push("Tipo de quarto desconhecido.");
      else if (!Number.isInteger(l.quantidade) || l.quantidade < 1 || l.quantidade > UNIDADES_MAX[l.tipo]) erros.push("Quantidade de quartos inválida.");
    }
    if (!erros.length && p.quartos.length) {
      const escolha: Escolha = {};
      for (const l of p.quartos) escolha[l.tipo] = (escolha[l.tipo] ?? 0) + l.quantidade;
      const falta = faltaSuite(escolha, {
        adultos: adultos as number,
        criancas,
      });
      if (falta) erros.push(falta);
    }
  }
  if (typeof p.pequenoAlmoco?.incluido !== "boolean") erros.push("Pequeno-almoço inválido.");
  const h = p.hospede ?? ({} as PedidoReserva["hospede"]);
  if (typeof h.nome !== "string" || h.nome.trim().length < 2 || h.nome.length > 120) erros.push("Falta o nome.");
  if (typeof h.email !== "string" || !emailValido(h.email) || h.email.length > 200) erros.push("O email não é válido.");
  if (typeof h.telefone !== "string" || !telefoneValido(h.telefone)) erros.push("O telemóvel não é válido.");
  if (typeof h.mensagem !== "string" || h.mensagem.length > 3000) erros.push("A mensagem é demasiado longa.");
  if (!FORMAS_PAGAMENTO.some((f) => f.id === p.pagamento)) erros.push("Forma de pagamento inválida.");
  return erros;
}

export const dataLonga = (v: string) => {
  const d = deIso(v)!;
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
};

const SEMANA_CURTA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** «sex 6 nov», como no formulário. */
export const dataCurta = (v: string) => {
  const d = deIso(v)!;
  return `${SEMANA_CURTA[d.getDay()]} ${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
};

export const descreverPedido = (p: PedidoReserva) => (p.casaInteira ? "A casa inteira" : descreverEscolha(escolhaDoPedido(p)));

export const euros = (v: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(v);
