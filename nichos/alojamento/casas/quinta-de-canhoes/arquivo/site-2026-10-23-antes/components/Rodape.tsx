import Link from "next/link";
import { contactos, linkWhatsapp, navegacao } from "@/lib/contactos";
import { IconeInstagram, IconeWhatsapp } from "@/components/IconeWhatsapp";
import { MapaRodape } from "@/components/MapaRodape";
import { PreferenciasCookies } from "@/components/PreferenciasCookies";

const icone =
  "inline-flex h-11 w-11 md:h-9 md:w-9 items-center justify-center border border-cal/25 text-cal/70 transition-colors hover:border-cal/60 hover:text-cal";

export function Rodape() {
  return (
    <footer data-contacto-whatsapp className="bg-vale py-16 text-cal md:py-20">
      <div className="mx-auto max-w-[86rem] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <Link href="/" className="rustico-medio inline-block text-2xl leading-none text-cal">
              Quinta de Canhões
            </Link>
            <p className="mt-5 max-w-[28ch] leading-relaxed text-cal/60">
              Turismo de Habitação em Várzea, São Pedro do Sul, sobre o vale do Vouga.
            </p>
          </div>

          <nav className="md:col-span-2">
            <p className="etiqueta text-cal/45">Navegar</p>
            <ul className="mt-5 space-y-3">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="sublinha text-cal/80 hover:text-cal">
                    {item.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="etiqueta text-cal/45">Contactos</p>
            <ul className="mt-5 space-y-3 text-cal/80">
              <li>
                <a href={contactos.telefone.href} className="sublinha hover:text-cal">
                  {contactos.telefone.texto}
                </a>
              </li>
              <li>
                <a href={contactos.telemovel.href} className="sublinha hover:text-cal">
                  {contactos.telemovel.texto}
                </a>
              </li>
              <li>
                <a href={contactos.email.href} className="sublinha break-all hover:text-cal">
                  {contactos.email.texto}
                </a>
              </li>
              <li className="pt-2 text-cal/60">
                {contactos.morada.rua}, {contactos.morada.codigo}
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
            <a
              href={linkWhatsapp()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp da Quinta de Canhões"
              className={icone}
            >
              <IconeWhatsapp className="h-4 w-4" />
            </a>
            <a
              href={contactos.instagram.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Quinta de Canhões"
              className={icone}
            >
              <IconeInstagram className="h-4 w-4" />
            </a>
            <a
              href={contactos.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook da Quinta de Canhões"
              className={icone}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.13V9.9H7.6V13h2.7v8h3.2Z" />
              </svg>
            </a>
            </div>
          </div>

          <div className="md:col-span-5">
            <p className="etiqueta text-cal/45">Onde estamos</p>
            <MapaRodape />
            <a
              href={contactos.morada.mapa}
              target="_blank"
              rel="noreferrer"
              className="sublinha mt-4 inline-block text-sm text-cal/75 hover:text-cal"
            >
              Ver no Google Maps
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cal/18 pt-7 text-sm text-cal/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Registo Nacional de Turismo {contactos.rnet}
            <span className="mt-1 block text-cal/35">
              Fotografias da região: João Carvalho, Vitor Oliveira, LuisMAfonso, Pedro e João Lopes,
              via Wikimedia Commons (licenças Creative Commons)
            </span>
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <a
              href={contactos.livroReclamacoes}
              target="_blank"
              rel="noreferrer"
              className="sublinha hover:text-cal/80"
            >
              Livro de Reclamações
            </a>
            <Link href="/privacidade" className="sublinha hover:text-cal/80">
              Política de privacidade
            </Link>
            <PreferenciasCookies className="sublinha text-left hover:text-cal/80" />
            <span>© {new Date().getFullYear()} Quinta de Canhões</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
