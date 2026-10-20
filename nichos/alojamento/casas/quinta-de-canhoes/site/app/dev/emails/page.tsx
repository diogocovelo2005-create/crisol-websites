import { readdir } from "node:fs/promises";
import { notFound } from "next/navigation";
import { FaixaTopo } from "@/components/reserva/ResumoPedido";
import { PASTA_EMAILS } from "@/lib/servidor/email";
import { MODELOS } from "@/lib/servidor/exemplos-email";

export const metadata = { title: "Emails (pré-visualização)", robots: { index: false, follow: false } };

/* Só em desenvolvimento: os emails que ficaram em .emails/ por não haver
   RESEND_API_KEY, do mais recente para o mais antigo. */
export default async function PaginaEmails({ searchParams }: { searchParams: Promise<{ f?: string; m?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { f, m } = await searchParams;
  const modelo = m && MODELOS[m] ? m : null;
  const ficheiros = (await readdir(PASTA_EMAILS).catch(() => [] as string[])).filter((n) => n.endsWith(".html")).sort().reverse();
  const aberto = modelo ? null : f && ficheiros.includes(f) ? f : ficheiros[0] ?? null;
  const src = modelo ? `/dev/emails/modelo/${modelo}` : aberto ? `/dev/emails/${encodeURIComponent(aberto)}` : null;
  const srcTexto = modelo ? `/dev/emails/modelo/${modelo}?texto` : aberto ? `/dev/emails/${encodeURIComponent(aberto.replace(/\.html$/, ".txt"))}` : null;

  return (
    <>
      <FaixaTopo etiqueta="Só em desenvolvimento" titulo="Emails da pré-visualização" texto="Sem RESEND_API_KEY, os emails não saem: ficam em .emails/. Os links dentro deles funcionam." />
      <section className="bg-cal py-10">
        <div className="mx-auto grid max-w-[96rem] gap-8 px-6 md:px-10 lg:grid-cols-[360px_1fr]">
          <div className="max-h-[80svh] overflow-auto">
          <p className="etiqueta mb-2 text-xisto-suave">Os modelos, com dados de exemplo</p>
          <ul className="mb-8 border-t border-granito-linha text-sm">
            {Object.entries(MODELOS).map(([k, v]) => (
              <li key={k} className="border-b border-granito-linha">
                <a href={`/dev/emails?m=${k}`} className={`block px-2 py-2 ${k === modelo ? "bg-granito text-xisto" : "text-xisto-suave hover:text-xisto"}`}>{v.titulo}</a>
              </li>
            ))}
          </ul>
          <p className="etiqueta mb-2 text-xisto-suave">Enviados em pré-visualização (.emails/)</p>
          <ol className="border-t border-granito-linha text-sm">
            {ficheiros.length === 0 && <li className="py-4 text-xisto-suave">Ainda não há emails.</li>}
            {ficheiros.map((n) => (
              <li key={n} className="border-b border-granito-linha">
                <a href={`/dev/emails?f=${encodeURIComponent(n)}`} className={`block px-2 py-2.5 ${n === aberto ? "bg-granito text-xisto" : "text-xisto-suave hover:text-xisto"}`}>
                  <span className="block text-[0.7rem] text-xisto-suave">{n.slice(0, 19).replace("T", " ")}</span>
                  {n.slice(25).replace(/\.html$/, "").replace(/-/g, " ")}
                </a>
              </li>
            ))}
          </ol>
          </div>
          {src && (
            <div>
              <p className="mb-3 text-sm">
                <a className="sublinha text-caixilho" href={src} target="_blank">Abrir sozinho</a>
                {" · "}
                <a className="sublinha text-caixilho" href={srcTexto!} target="_blank">Ver em texto</a>
              </p>
              <iframe title="Email" src={src} className="h-[80svh] w-full border border-granito-linha bg-white" />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
