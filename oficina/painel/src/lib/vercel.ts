import "server-only";

const API = "https://api.vercel.com";

async function vercel<T>(caminho: string): Promise<T | null> {
  const sep = caminho.includes("?") ? "&" : "?";
  try {
    const r = await fetch(`${API}${caminho}${sep}teamId=${process.env.VERCEL_TEAM_ID}`, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      next: { revalidate: 60 },
    });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

export type Deploy = {
  url: string;          // https://<deployment>.vercel.app
  publico: string;      // o endereço de produção (domínio próprio ou *.vercel.app do projeto)
  criadoEm: number;
  dominioProprio: string | null;
};

/** O último deploy de produção pronto, e o endereço público do projeto. */
export async function ultimoDeploy(projectId: string): Promise<Deploy | null> {
  const [deps, doms] = await Promise.all([
    vercel<{ deployments: { url: string; created: number }[] }>(
      `/v6/deployments?projectId=${projectId}&target=production&state=READY&limit=1`,
    ),
    vercel<{ domains: { name: string }[] }>(`/v9/projects/${projectId}/domains`),
  ]);
  const d = deps?.deployments?.[0];
  if (!d) return null;
  const nomes = doms?.domains?.map((x) => x.name) ?? [];
  const proprio = nomes.find((n) => !n.endsWith(".vercel.app")) ?? null;
  const publico = proprio ?? nomes[0] ?? d.url;
  return { url: `https://${d.url}`, publico: `https://${publico}`, criadoEm: d.created, dominioProprio: proprio };
}

/** O deployment para onde um endereço aponta agora (para saber se o link enviado está desatualizado). */
export async function deploymentDe(url: string): Promise<string | null> {
  const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const r = await vercel<{ id: string; url: string }>(`/v13/deployments/${host}`);
  return r?.url ? `https://${r.url}` : null;
}
