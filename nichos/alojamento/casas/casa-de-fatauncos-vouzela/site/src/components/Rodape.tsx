import Image from 'next/image';
import { FacebookLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';

/*
  08 - Rodape verde em colunas, como em La Bastide e Meadow Branch.

  A localizacao vive aqui e nao a meio da pagina: nesta casa o argumento
  e a casa e o parque, que ja apareceram la em cima. O mapa vai por embed
  sem chave, nas coordenadas que a propria casa publica.

  O numero de RNET e obrigatorio no site de um empreendimento turistico
  (esta casa e Turismo de Habitacao, nao alojamento local).
*/
const navegacao = [
  { href: '#a-casa', texto: 'A casa' },
  { href: '#espacos', texto: 'Os espaços' },
  { href: '#opinioes', texto: 'Opiniões' },
  { href: '#reservar', texto: 'Contactos' },
];

export default function Rodape() {
  const { morada, telefone, telefoneLimpo, telemovel, telemovelLimpo, email, rnet, facebook, mapa } = casa.contacto;
  const ligacao = 'font-light text-osso/75 transition-colors duration-200 hover:text-osso';

  return (
    <footer className="border-t border-linha-clara bg-floresta-fundo text-osso">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-osso/50">
                <Image src="/marca-flor-transparente.png" alt="" width={26} height={26} className="size-[26px]" />
              </span>
              <span className="font-display text-[1.5rem]">{casa.nome}</span>
            </div>
            <p className="mt-6 max-w-[32ch] font-light leading-[1.8] text-osso/70">
              {casa.tipo} no {casa.lugar}. Um solar do século XVIII com quatro salões, parque e piscina, a 3 km das Termas de S. Pedro do Sul.
            </p>
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da casa"
              className="mt-7 inline-grid size-10 place-items-center rounded-full border border-osso/35 text-osso/80 transition-colors hover:border-osso hover:text-osso"
            >
              <FacebookLogoIcon size={18} />
            </a>
          </div>

          <div className="lg:col-span-2">
            <p className="versalete text-ouro-claro">Navegação</p>
            <ul className="mt-6 space-y-3">
              {navegacao.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={ligacao}>
                    {l.texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="versalete text-ouro-claro">Contacto</p>
            <address className="mt-6 space-y-3 not-italic">
              <p className="font-light text-osso/75">{morada}</p>
              <p>
                <a href={`tel:${telefoneLimpo}`} className={ligacao}>
                  {telefone}
                </a>
              </p>
              <p>
                <a href={`tel:${telemovelLimpo}`} className={ligacao}>
                  {telemovel}
                </a>
              </p>
              <p>
                <a href={`mailto:${email}`} className={ligacao}>
                  {email}
                </a>
              </p>
            </address>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
              <iframe
                title={`Mapa com a localização da ${casa.nome}`}
                src={mapa}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full sepia-[0.25]"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-linha-clara pt-8 text-[0.82rem] font-light text-osso/60 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {casa.nome}
          </p>
          <p>{rnet}</p>
        </div>
      </div>
    </footer>
  );
}
