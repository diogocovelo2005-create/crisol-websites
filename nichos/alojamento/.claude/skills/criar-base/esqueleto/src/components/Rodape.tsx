import { InstagramLogoIcon, TreeIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';

/*
  08 - Rodape verde em colunas, como em La Bastide e Meadow Branch.

  A localizacao vive aqui e nao a meio da pagina: nesta casa o argumento
  e a vista, que ja apareceu la em cima. O mapa vai por embed sem chave
  e aponta para o concelho, porque a morada do molde e inventada. Num
  site real troca-se pela localizacao exata da casa.

  O registo só aparece quando está confirmado, com o tipo que a fonte declara.
*/
export default function Rodape() {
  const { morada, telefone, email, registo, instagram, mapa } = casa.contacto;
  const navegacao = casa.navegacao;
  const ligacao = 'font-light text-osso/75 transition-colors duration-200 hover:text-osso';
  const temContacto = Boolean(morada || telefone || email);

  return (
    <footer className="border-t border-linha-clara bg-floresta-fundo text-osso">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-osso/50">
                <TreeIcon size={19} weight="light" />
              </span>
              <span className="font-display text-[1.5rem]">{casa.nome}</span>
            </div>
            <p className="mt-6 max-w-[32ch] font-light leading-[1.8] text-osso/70">
              {casa.hero.texto}
            </p>
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da casa" className="mt-7 inline-grid size-10 place-items-center rounded-full border border-osso/35 text-osso/80 transition-colors hover:border-osso hover:text-osso">
                <InstagramLogoIcon size={18} />
              </a>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="versalete text-ouro">Navegação</p>
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

          {temContacto && (
            <div className="lg:col-span-3">
              <p className="versalete text-ouro">Contacto</p>
              <address className="mt-6 space-y-3 not-italic">
                {morada && <p className="font-light text-osso/75">{morada}</p>}
                {telefone && <p><a href={telefone.href} className={ligacao}>{telefone.valor}</a></p>}
                {email && <p><a href={email.href} className={ligacao}>{email.valor}</a></p>}
              </address>
            </div>
          )}

          {mapa && (
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
                <iframe title={`Mapa com a localização da ${casa.nome}`} src={mapa} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full sepia-[0.25]" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-linha-clara pt-8 text-[0.82rem] font-light text-osso/60 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {casa.nome}
          </p>
          {registo && <p>{registo.tipo} n.º {registo.numero}</p>}
        </div>
      </div>
    </footer>
  );
}
