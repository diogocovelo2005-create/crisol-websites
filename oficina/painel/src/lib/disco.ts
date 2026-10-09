import "server-only";
import fs from "node:fs";
import path from "node:path";

// Tudo o que o painel lê do repositório. Os caminhos passam sempre por
// `dentroDoRepo`, para um slug não conseguir sair da raiz.

export const REPO = path.resolve(process.env.REPO_ROOT!);

function dentroDoRepo(p: string): string {
  const abs = path.resolve(p);
  if (abs !== REPO && !abs.startsWith(REPO + path.sep)) {
    throw new Error(`Caminho fora do repositório: ${p}`);
  }
  return abs;
}

export function pastaDoProjeto(nicho: string, slug: string): string {
  const sub = nicho === "alojamento" ? "casas" : "clientes";
  return dentroDoRepo(path.join(REPO, "nichos", nicho, sub, slug));
}

export function existe(p: string): boolean {
  try {
    return fs.existsSync(dentroDoRepo(p));
  } catch {
    return false;
  }
}

export function ler(p: string): string | null {
  try {
    return fs.readFileSync(dentroDoRepo(p), "utf8");
  } catch {
    return null;
  }
}

// ─── Foto de capa ────────────────────────────────────────────────────────────

const PREFERIDAS = [/hero/, /capa/, /fachada/, /exterior/, /chegada/, /piscina/, /jardim/];
const IMAGEM = /\.(jpe?g|png|webp|avif)$/i;

function melhorFoto(dir: string): string | null {
  let nomes: string[];
  try {
    nomes = fs.readdirSync(dir).filter((n) => IMAGEM.test(n)).sort();
  } catch {
    return null;
  }
  if (!nomes.length) return null;
  for (const re of PREFERIDAS) {
    const n = nomes.find((x) => re.test(x.toLowerCase()));
    if (n) return path.join(dir, n);
  }
  return path.join(dir, nomes[0]);
}

/** Caminho absoluto da foto de capa, ou null se o projeto ainda não tem fotos. */
export function fotoDeCapa(nicho: string, slug: string): string | null {
  const pasta = pastaDoProjeto(nicho, slug);
  return (
    melhorFoto(path.join(pasta, "site", "public", "fotos")) ??
    melhorFoto(path.join(pasta, "dossie", "marketing", "fotos")) ??
    melhorFoto(path.join(pasta, "site", "public", "images")) ??
    (existe(path.join(pasta, "site", "public", "og.png"))
      ? path.join(pasta, "site", "public", "og.png")
      : null)
  );
}

// ─── Site, dossiê, proposta ──────────────────────────────────────────────────

export function vercelProjectId(nicho: string, slug: string): string | null {
  const txt = ler(path.join(pastaDoProjeto(nicho, slug), "site", ".vercel", "project.json"));
  if (!txt) return null;
  try {
    return JSON.parse(txt).projectId ?? null;
  } catch {
    return null;
  }
}

export function eAstro(nicho: string, slug: string): boolean {
  const pkg = ler(path.join(pastaDoProjeto(nicho, slug), "site", "package.json"));
  return !!pkg && /"astro"/.test(pkg);
}

// ─── Casas dentro de um projeto ──────────────────────────────────────────────
// Um projeto pode ser um grupo de casas: cada casa tem o seu dossiê numa
// subpasta de `dossie/` (com resumo.md próprio). A raiz fica com o do grupo.

const NOME_CASA = /^[a-z0-9-]+$/;

function pastaDoDossie(nicho: string, slug: string, casa?: string): string {
  const raiz = path.join(pastaDoProjeto(nicho, slug), "dossie");
  if (!casa) return raiz;
  if (!NOME_CASA.test(casa)) throw new Error(`Casa inválida: ${casa}`);
  return path.join(raiz, casa);
}

export type CasaDoProjeto = { pasta: string; nome: string; capa: string | null };

/** As casas com dossiê próprio, pela ordem em que o resumo do grupo as lista. */
export function casasDoProjeto(nicho: string, slug: string): CasaDoProjeto[] {
  const raiz = pastaDoDossie(nicho, slug);
  let pastas: string[];
  try {
    pastas = fs
      .readdirSync(raiz, { withFileTypes: true })
      .filter((d) => d.isDirectory() && NOME_CASA.test(d.name) && existe(path.join(raiz, d.name, "resumo.md")))
      .map((d) => d.name);
  } catch {
    return [];
  }
  const resumo = ler(path.join(raiz, "resumo.md")) ?? "";
  const ordem = (p: string) => {
    const i = resumo.indexOf(`${p}/resumo.md`);
    return i < 0 ? Infinity : i;
  };
  pastas.sort((a, b) => ordem(a) - ordem(b) || a.localeCompare(b));
  return pastas.map((pasta) => {
    const titulo = ler(path.join(raiz, pasta, "resumo.md"))?.match(/^#\s+(?:Resumo:\s*)?(.+)$/m)?.[1];
    const fotos = path.join(raiz, pasta, "marketing", "fotos");
    const capa = melhorFotoFunda(fotos);
    return {
      pasta,
      nome: titulo?.trim() ?? pasta,
      capa: capa ? `~${pasta}/${path.relative(fotos, capa).split(path.sep).join("/")}` : null,
    };
  });
}

/** Como melhorFoto, mas também procura nas subpastas (exterior, interior...). */
function melhorFotoFunda(dir: string): string | null {
  const direta = melhorFoto(dir);
  if (direta) return direta;
  for (const sub of ["exterior", "interior"]) {
    const f = melhorFoto(path.join(dir, sub));
    if (f) return f;
  }
  return null;
}

export function ficheirosDoDossie(nicho: string, slug: string, casa?: string): { nome: string; texto: string }[] {
  const dir = pastaDoDossie(nicho, slug, casa);
  let nomes: string[];
  try {
    nomes = fs.readdirSync(dir).filter((n) => n.endsWith(".md"));
  } catch {
    return [];
  }
  // O resumo primeiro; o resto por ordem alfabética. Os textos de marketing no fim
  // (as fotos têm um separador próprio).
  nomes.sort((a, b) => (a === "resumo.md" ? -1 : b === "resumo.md" ? 1 : a.localeCompare(b)));
  const lista = nomes.map((nome) => ({ nome: nome.replace(/\.md$/, ""), texto: ler(path.join(dir, nome)) ?? "" }));
  const textos = ler(path.join(dir, "marketing", "textos.md"));
  if (textos) lista.push({ nome: "textos", texto: textos });
  return lista;
}

// ─── Fotos do dossiê ─────────────────────────────────────────────────────────

export type GrupoDeFotos = { pasta: string; fotos: { caminho: string; legenda: string }[] };

function pastaDasFotos(nicho: string, slug: string, casa?: string): string {
  return path.join(pastaDoDossie(nicho, slug, casa), "marketing", "fotos");
}

/** Legendas do fotos.md: a coluna "O que mostra" de cada linha da tabela. */
function legendasDasFotos(nicho: string, slug: string, casa?: string): Map<string, string> {
  const md = ler(path.join(pastaDoDossie(nicho, slug, casa), "marketing", "fotos.md")) ?? "";
  const legendas = new Map<string, string>();
  for (const linha of md.split("\n")) {
    const c = linha.split("|").map((x) => x.trim());
    if (c.length > 4 && IMAGEM.test(c[1])) legendas.set(c[1], c[3]);
  }
  return legendas;
}

/**
 * As fotos recolhidas no dossiê, agrupadas pela subpasta (exterior, interior...).
 * Nas casas de um grupo, o caminho leva o prefixo `~<casa>/`.
 */
export function fotosDoDossie(nicho: string, slug: string, casa?: string): GrupoDeFotos[] {
  const raiz = pastaDasFotos(nicho, slug, casa);
  let pastas: string[];
  try {
    pastas = fs.readdirSync(raiz, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    return [];
  }
  const legendas = legendasDasFotos(nicho, slug, casa);
  const prefixo = casa ? `~${casa}/` : "";
  return pastas
    .map((pasta) => ({
      pasta,
      fotos: fs
        .readdirSync(path.join(raiz, pasta))
        .filter((n) => IMAGEM.test(n))
        .sort()
        .map((n) => ({ caminho: `${prefixo}${pasta}/${n}`, legenda: legendas.get(`${pasta}/${n}`) ?? n })),
    }))
    .filter((g) => g.fotos.length);
}

/** Caminho absoluto de uma foto do dossiê, ou null se não existir ou sair da pasta. */
export function caminhoFotoDoDossie(nicho: string, slug: string, relativo: string): string | null {
  const casa = relativo.match(/^~([^/]+)\//)?.[1];
  const raiz = pastaDasFotos(nicho, slug, casa);
  const abs = path.resolve(raiz, casa ? relativo.slice(casa.length + 2) : relativo);
  if (!abs.startsWith(raiz + path.sep) || !IMAGEM.test(abs) || !existe(abs)) return null;
  return abs;
}

export function caminhoProposta(nicho: string, slug: string): string | null {
  const p = path.join(REPO, "nichos", nicho, "proposta", "out", `proposta-${slug}.pdf`);
  return existe(p) ? p : null;
}

/** O email do dono, lido do dossiê: primeiro [OFICIAL], depois [A_VERIFICAR]. */
export function emailDoDossie(
  nicho: string,
  slug: string,
): { email: string; origem: "dossie" | "dossie-a-verificar" } | null {
  const factos = ler(path.join(pastaDoProjeto(nicho, slug), "dossie", "factos.md"));
  if (!factos) return null;
  const achar = (etiqueta: string) =>
    factos.match(new RegExp(`\\[${etiqueta}\\][^\\n]*?e-?mail[^\\n]*?([\\w.+-]+@[\\w-]+\\.[\\w.-]+)`, "i"))?.[1];
  const oficial = achar("OFICIAL");
  if (oficial) return { email: oficial, origem: "dossie" };
  const aVerificar = achar("A_VERIFICAR");
  if (aVerificar) return { email: aVerificar, origem: "dossie-a-verificar" };
  return null;
}

/** As provas que marcam sozinhas os passos 🤖 da checklist. */
export function provasNoDisco(nicho: string, slug: string) {
  const pasta = pastaDoProjeto(nicho, slug);
  return {
    pasta: existe(pasta),
    dossie: existe(path.join(pasta, "dossie", "resumo.md")),
    site: existe(path.join(pasta, "site", "package.json")),
    proposta: !!caminhoProposta(nicho, slug),
  };
}
