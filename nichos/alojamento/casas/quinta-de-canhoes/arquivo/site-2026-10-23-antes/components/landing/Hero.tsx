"use client";

import { useEffect, useRef } from "react";
import { Botao } from "@/components/Botao";
import { TituloHero } from "@/components/landing/TituloHero";
import styles from "./Hero.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const p = clamp(n); return p * p * (3 - 2 * p); };

/** The near window and distant valley share a camera, not a zoom factor. */
export function Hero() {
  const container = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
    let top = 0, travel = 1;
    let alive = true;

    const render = () => {
      frame = 0;
      const p = reduced.matches ? 0 : clamp((window.scrollY - top) / travel);
      const dolly = ease(p);
      currentX += (pointerX - currentX) * 0.085;
      currentY += (pointerY - currentY) * 0.085;
      const drift = (1 - dolly) * (reduced.matches ? 0 : 1);
      const mobile = window.innerWidth < 768;
      const near = 1 / (1 - dolly * (mobile ? 0.32 : 0.54));
      root.style.setProperty("--frame-scale", String(near));
      root.style.setProperty("--view-scale", String(1 + dolly * 0.035));
      root.style.setProperty("--original-opacity", String(1 - ease(p / 0.16)));
      
      // REDUZIDO: de -9 para -3 e -5 para -1.5 para evitar mostrar as bordas transparentes da imagem
      root.style.setProperty("--near-x", `${currentX * -3 * drift - dolly * 9}px`);
      root.style.setProperty("--near-y", `${currentY * -1.5 * drift + dolly * 16}px`);
      root.style.setProperty("--far-x", `${currentX * -2 * drift}px`);
      root.style.setProperty("--far-y", `${currentY * -1.5 * drift + dolly * 4}px`);
      
      // REDUZIDO: de 110% para 0% para impedir que o texto fuja para fora da sua máscara (clip) e seja cortado ao meio
      // Desliza suavemente para o limite superior da janela
      root.style.setProperty("--line-one-y", `${-ease((p - 0.015) / 0.36) * 300}%`);
      root.style.setProperty("--line-two-y", `${-ease((p - 0.085) / 0.38) * 300}%`);
      
      root.style.setProperty("--line-one-opacity", String(1 - ease((p - 0.02) / 0.29)));
      root.style.setProperty("--line-two-opacity", String(1 - ease((p - 0.10) / 0.30)));
      
      const controls = 1 - ease(p / 0.24);
      root.style.setProperty("--controls-opacity", String(controls));
      root.style.setProperty("--controls-y", `${-ease(p / 0.28) * 24}px`);
      root.style.setProperty("--brand-opacity", String(1 - ease(p / 0.3)));
      if (actions.current) actions.current.inert = controls < 0.05;
      if (Math.abs(pointerX - currentX) + Math.abs(pointerY - currentY) > 0.002) schedule();
    };
    const schedule = () => { if (!frame && alive) frame = requestAnimationFrame(render); };
    const measure = () => {
      top = root.getBoundingClientRect().top + window.scrollY;
      const stage = root.firstElementChild as HTMLElement;
      travel = Math.max(1, root.offsetHeight - stage.offsetHeight);
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || window.scrollY > top + travel) return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };
    const leave = () => { pointerX = 0; pointerY = 0; schedule(); };
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", measure);
    // A failed plane keeps the complete original poster visible.
    const images = Array.from(root.querySelectorAll("img"));
    Promise.all(images.map(img => img.decode())).then(() => {
      if (alive) { root.dataset.depth = "ready"; measure(); }
    }).catch(() => {});
    measure();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      reduced.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section ref={container} className={styles.hero} aria-label="Bem-vindo à Quinta de Canhões">
      <div className={styles.stage}>
        <div className={styles.scene} aria-hidden="true">
          <div className={`${styles.photo} ${styles.landscape}`}>
            <picture>
              <source media="(max-width: 767px)" srcSet="/fotos/hero-vale-mobile.webp" width="937" height="1678" />
              <img src="/fotos/hero-vale.webp" alt="" width="3070" height="2048" fetchPriority="high" />
            </picture>
          </div>
          <div className={`${styles.photo} ${styles.window}`}>
            <picture>
              <source media="(max-width: 767px)" srcSet="/fotos/hero-telemovel.jpg" width="1316" height="2358" />
              <img src="/fotos/hero-janela.webp" alt="" width="3070" height="2048" fetchPriority="high" />
            </picture>
          </div>
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.brand}>
          <p className="rustico-encorpado">Quinta de<br />Canhões</p>
        </div>
        <h1 className={`cartaz ${styles.title}`}><TituloHero /></h1>
        <div ref={actions} className={styles.actions}>
          <div className="flex flex-wrap items-center gap-4">
            <Botao href="/reservar" variante="cheio" pequeno className={styles.reserve}>Reservar</Botao>
            <Botao href="/a-casa" variante="claro" pequeno>Conhecer a casa</Botao>
          </div>
          <p className="etiqueta mt-5">Turismo de Habitação · Várzea, São Pedro do Sul</p>
        </div>
      </div>
    </section>
  );
}
