import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowSquareOutIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ESTADOS_ESCOLHA, ESTADOS_FIM, NICHOS, eNicho, faseDe } from "@/lib/estados";
import { corDoEstado } from "@/lib/cores";
import { diasDesde, eventos as lerEventos, precisaDeTi, projeto as lerProjeto } from "@/lib/projetos";
import { casasDoProjeto, emailDoDossie, provasNoDisco, vercelProjectId } from "@/lib/disco";
import { ultimoDeploy } from "@/lib/vercel";
import { FASES, checklist, sugestoes } from "@/lib/checklist";
import { notasDoProjeto } from "@/lib/notas";
import { Foto } from "@/components/Foto";
import { AutoRefresh } from "@/components/AutoRefresh";
import { PostIts } from "@/components/PostIts";
import { dataCurta } from "@/components/Cartao";
import {
  BotaoArrancar,
  BotaoPasta,
  Checklist,
  EscolherEstado,
  Fim,
  NovaNota,
  ProximoPasso,
} from "@/components/Interativos";

export const dynamic = "force-dynamic";

async function localLigado(porta: number | null): Promise<boolean> {
  if (!porta) return false;
  try {
    await fetch(`http://localhost:${porta}`, { signal: AbortSignal.timeout(700), cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

const botao =
  "inline-flex items-center gap-1.5 rounded-lg border border-linha bg-cartao px-3.5 py-2 text-[14px] font-medium hover:border-tinta-3";

export default async function PaginaProjeto({ params }: { params: Promise<{ nicho: string; slug: string }> }) {
  const { nicho, slug } = await params;
  if (!eNicho(nicho)) notFound();
  const p = await lerProjeto(nicho, slug);
  if (!p) notFound();

  const projectId = vercelProjectId(nicho, slug);
  const [deploy, ligado, historico, notas] = await Promise.all([
    projectId ? ultimoDeploy(projectId) : null,
    localLigado(p.porta),
    lerEventos(p.id),
    notasDoProjeto(p.id),
  ]);
  const passos = await checklist(p, deploy);
  const sug = sugestoes(passos, { estado: p.estadoAtual, proximo_passo: p.proximo_passo, ignorada: p.sugestao_ignorada });
  const provas = provasNoDisco(nicho, slug);
  const casas = casasDoProjeto(nicho, slug);
  const email = p.email ?? emailDoDossie(nicho, slug)?.email ?? null;
  const tel = p.telefone?.replace(/\D/g, "").replace(/^351/, "") ?? null;
  const dias = diasDesde(p.estadoDesde);
  const atrasado = !!(p.proximo_passo_ate && precisaDeTi(p));
  const fim = !!p.estadoAtual && ESTADOS_FIM.includes(p.estadoAtual);
  const id = { nicho, slug };
  const site = deploy?.publico ?? (ligado ? `http://localhost:${p.porta}` : null);

  return (
    <main className="relative mx-auto min-h-[75vh] max-w-[860px] px-5 pb-24 pt-6">
      <AutoRefresh segundos={20} />
      <PostIts contexto={{ projetoId: p.id }} iniciais={notas} />
      <Link href={`/${nicho}`} className="text-[14px] text-tinta-2 hover:text-tinta">
        ← {NICHOS.find((n) => n.id === nicho)!.nome}
      </Link>

      {/* Quem é e em que ponto está */}
      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Foto nicho={nicho} slug={slug} nome={p.nome} temFoto={p.temFoto} className="aspect-[3/2] w-full shrink-0 rounded-xl sm:w-[200px]" />
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{p.nome}</h1>
          {p.concelho && <p className="text-[15px] text-tinta-2">{p.concelho}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <EscolherEstado id={id} estado={p.estadoAtual} opcoes={ESTADOS_ESCOLHA} cor={corDoEstado(p.estadoAtual)} />
            {p.estadoAtual && (
              <span className="num text-[13px] text-tinta-2">{dias === 0 ? "desde hoje" : `há ${dias} ${dias === 1 ? "dia" : "dias"}`}</span>
            )}
          </div>
        </div>
      </header>

      {/* Os botões */}
      <div className="mt-6 flex flex-wrap gap-2">
        {site ? (
          <a href={site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-tinta px-4 py-2 text-[14px] font-semibold text-cartao hover:bg-black">
            Abrir site <ArrowSquareOutIcon size={15} />
          </a>
        ) : provas.site && p.porta ? (
          <BotaoArrancar id={id} porta={p.porta} />
        ) : null}
        {deploy && ligado && (
          <a href={`http://localhost:${p.porta}`} target="_blank" rel="noreferrer" className={botao}>
            Versão local <ArrowSquareOutIcon size={14} />
          </a>
        )}
        {provas.pasta && <BotaoPasta id={id} />}
        {provas.dossie && (
          <Link href={`/${nicho}/${slug}/dossie`} className={botao}>
            <FileTextIcon size={15} /> Dossiê
          </Link>
        )}
        {tel && (
          <a href={`tel:+351${tel}`} className={botao}>
            <PhoneIcon size={15} /> <span className="num">{p.telefone}</span>
          </a>
        )}
        {tel?.startsWith("9") && (
          <a href={`https://wa.me/351${tel}`} target="_blank" rel="noreferrer" className={botao}>
            <WhatsappLogoIcon size={15} /> WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className={botao}>
            <EnvelopeSimpleIcon size={15} /> Email
          </a>
        )}
      </div>
      {!provas.pasta && (
        <p className="mt-3 text-[13px] text-tinta-2">Ainda não há pasta. Começa pelo dossiê.</p>
      )}

      {casas.length > 0 && (
        <section className="mt-6 rounded-xl bg-cartao p-5 shadow-cartao">
          <h2 className="mb-3 text-[13px] font-semibold text-tinta-2">
            Casas <span className="num font-normal">· {casas.length}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {casas.map((c) => (
              <li key={c.pasta}>
                <Link href={`/${nicho}/${slug}/dossie?casa=${c.pasta}`} className="group block">
                  {c.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/foto/${nicho}/${slug}/${c.capa.split("/").map(encodeURIComponent).join("/")}`}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/2] w-full rounded-lg bg-linha object-cover transition-opacity group-hover:opacity-85"
                    />
                  ) : (
                    <div className="aspect-[3/2] w-full rounded-lg bg-linha" />
                  )}
                  <span className="mt-1.5 block text-[14px] font-medium leading-snug group-hover:underline">{c.nome}</span>
                  <span className="block text-[12px] text-tinta-2">Dossiê</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fim && (
        <section className="mt-6 rounded-xl bg-cartao p-5 shadow-cartao">
          <h2 className="mb-3 text-[15px] font-semibold">Porque não avançou?</h2>
          <Fim id={id} motivo={p.motivo_fim} voltarEm={p.voltar_em} />
        </section>
      )}

      <section className="mt-6 rounded-xl bg-cartao p-5 shadow-cartao">
        <h2 className="mb-3 text-[13px] font-semibold text-tinta-2">Próximo passo</h2>
        <ProximoPasso id={id} texto={p.proximo_passo} ate={p.proximo_passo_ate} atrasado={atrasado} sugestoes={sug} />
      </section>

      <section className="mt-4 rounded-xl bg-cartao p-5 shadow-cartao">
        <h2 className="mb-4 text-[13px] font-semibold text-tinta-2">Checklist</h2>
        <Checklist id={id} passos={passos} fases={FASES} faseAtual={faseDe(p.estadoAtual)} />
      </section>

      <section className="mt-4 rounded-xl bg-cartao p-5 shadow-cartao">
        <h2 className="mb-3 text-[13px] font-semibold text-tinta-2">Notas</h2>
        <NovaNota id={id} />
        <ol className="mt-5 space-y-2">
          {historico.slice(0, 12).map((e) => (
            <li key={e.id} className="flex gap-3 text-[14px]">
              <span className="num w-[52px] shrink-0 pt-px text-[12px] text-tinta-3">{dataCurta(e.criado_em)}</span>
              <span className={e.tipo === "nota" ? "whitespace-pre-line" : "text-tinta-2"}>{e.texto}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
