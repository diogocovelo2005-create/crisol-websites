"use client";

import { MapPin } from "lucide-react";
import { contactos } from "@/lib/contactos";
import { gravarConsentimento, useConsentimento } from "@/lib/consentimento";

const SRC = "https://www.google.com/maps?output=embed&q=Rua%20dos%20Canh%C3%B5es%20510%2C%203660-682%20S%C3%A3o%20Pedro%20do%20Sul";

/* O mapa do rodapé: o iframe do Google só carrega depois de a pessoa aceitar.
   Até lá, a morada no mesmo espaço e um botão que dá o consentimento. */
export function MapaRodape() {
  const { estado } = useConsentimento();
  return (
    <div className="relative mt-5 aspect-[16/9] overflow-hidden border border-cal/20 bg-vale-claro">
      {estado === "aceite" ? (
        <iframe title="Mapa da Quinta de Canhões" src={SRC} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-cal/30 text-[#e7a598]">
            <MapPin size={20} />
          </span>
          <p className="text-sm leading-snug text-cal/80">
            {contactos.morada.rua}, {contactos.morada.localidade}
            <br />
            {contactos.morada.codigo}
          </p>
          <button
            type="button"
            onClick={() => gravarConsentimento("aceite")}
            className="premir border border-cal/50 px-4 py-2 text-sm text-cal transition-colors hover:border-cal hover:bg-cal hover:text-xisto"
          >
            Mostrar o mapa
          </button>
          <p className="max-w-[34ch] text-[0.75rem] leading-snug text-cal/55">O mapa é do Google e põe cookies da Google.</p>
        </div>
      )}
    </div>
  );
}
