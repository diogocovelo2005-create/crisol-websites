"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navegacao } from "@/lib/contactos";
import { motion } from "motion/react";

export function Cabecalho() {
  const caminho = usePathname();
  const [passouHero, setPassouHero] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const aoScroll = () => setPassouHero(window.scrollY > window.innerHeight * 0.82);
    aoScroll();
    window.addEventListener("scroll", aoScroll, { passive: true });
    return () => window.removeEventListener("scroll", aoScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  useEffect(() => {
    const id = setTimeout(() => setMenuAberto(false), 0);
    return () => clearTimeout(id);
  }, [caminho]);

  const claro = !passouHero && !menuAberto;

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-700 ${
        menuAberto
          ? "border-b border-transparent bg-transparent"
          : claro
          ? "border-b border-transparent bg-transparent"
          : "border-b border-granito-linha/70 bg-cal/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-[86rem] items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className={`rustico-encorpado text-[1.05rem] leading-[0.98] transition-[color,opacity] duration-700 md:text-[1.2rem] ${
            claro ? "pointer-events-none text-cal opacity-0" : menuAberto ? "text-cal opacity-100" : "text-xisto opacity-100"
          }`}
          aria-hidden={claro}
          tabIndex={claro ? -1 : undefined}
        >
          Quinta de
          <br />
          Canhões
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navegacao.slice(0, 2).map((item) => {
            const ativo = caminho === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`sublinha text-sm transition-colors duration-700 ${
                  claro
                    ? "text-cal/90 hover:text-cal"
                    : ativo
                      ? "text-caixilho"
                      : "text-xisto-suave hover:text-xisto"
                }`}
              >
                {item.texto}
              </Link>
            );
          })}
          <Link
            href="/reservar"
            className={`border px-5 py-2 text-sm transition-colors duration-300 ${
              claro
                ? "border-cal/45 text-cal hover:border-cal hover:bg-cal hover:text-xisto"
                : "border-caixilho text-caixilho hover:bg-caixilho hover:text-cal"
            }`}
          >
            Reservar
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          className={`relative z-50 -mr-2 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden ${
            claro || menuAberto ? "text-cal" : "text-xisto"
          }`}
        >
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${
              menuAberto ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${
              menuAberto ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="menu-mobile"
        className={`fixed inset-0 z-40 bg-vale transition-[opacity,visibility] duration-500 md:hidden ${
          menuAberto ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Navegação principal" className="mx-auto flex h-full w-full max-w-[34rem] flex-col justify-end px-6 pt-28 pb-12 sm:px-8">
          <p className="etiqueta mb-5 text-cal/50">Descobrir a Quinta</p>
          {navegacao.map((item, indice) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuAberto(false)}
              aria-current={caminho === item.href ? "page" : undefined}
              className={`group flex items-center justify-between border-t py-5 transition-colors duration-300 last:border-b ${
                caminho === item.href
                  ? "border-cal/50 text-cal"
                  : "border-cal/20 text-cal/85 hover:border-cal/50 hover:text-cal"
              }`}
            >
              <span className="rustico-medio text-[clamp(2rem,9vw,3rem)] leading-none">{item.texto}</span>
              <span aria-hidden="true" className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                0{indice + 1} →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
