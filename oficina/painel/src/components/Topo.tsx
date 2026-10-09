import Link from "next/link";
import { NICHOS } from "@/lib/estados";

export function Topo({ ativo, contagens }: { ativo: string; contagens: Record<string, number> }) {
  return (
    <nav className="flex gap-2 px-6 pt-6 md:px-8" aria-label="Nichos">
      {NICHOS.map((n) => {
        const e = n.id === ativo;
        return (
          <Link
            key={n.id}
            href={`/${n.id}`}
            aria-current={e ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
              e ? "bg-tinta text-cartao" : "text-tinta-2 hover:bg-linha"
            }`}
          >
            {n.nome} <span className={e ? "text-cartao/60" : "text-tinta-3"}>{contagens[n.id] ?? 0}</span>
          </Link>
        );
      })}
    </nav>
  );
}
