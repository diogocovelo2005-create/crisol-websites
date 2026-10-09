// A foto da casa, ou as iniciais do nome enquanto ainda não há fotos.

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter((p) => /^[A-ZÀ-Ý]/.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function Foto({
  nicho,
  slug,
  nome,
  temFoto,
  className = "",
}: {
  nicho: string;
  slug: string;
  nome: string;
  temFoto: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-linha ${className}`}>
      {temFoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/foto/${nicho}/${slug}`} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-3xl font-semibold text-tinta-3">{iniciais(nome)}</span>
        </div>
      )}
    </div>
  );
}
