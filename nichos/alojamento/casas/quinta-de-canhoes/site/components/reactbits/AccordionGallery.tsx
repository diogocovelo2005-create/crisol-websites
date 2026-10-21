"use client";

import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { gsap } from 'gsap';

export interface AccordionGalleryItem {
  image: string;
  srcSet?: string;
  sizes?: string;
  label?: string;
  detail?: string;
  description?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  onActiveChange?: (index: number) => void;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.35,
  ease = 'power2.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
  onActiveChange
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  
  const detailRefsTop = useRef<(HTMLElement | null)[]>([]);
  const detailRefsBottom = useRef<(HTMLElement | null)[]>([]);
  
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const overlayBg = `linear-gradient(180deg, transparent 70%, color-mix(in srgb, ${overlayColor} 60%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.18) * 100%), transparent)`;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const label = labelRefs.current[i];
        const dTop = detailRefsTop.current[i];
        const dBottom = detailRefsBottom.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.18,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels) {
          if (isActive) {
            if (bar) tl.to(bar, { opacity: 1, duration: dur, ease }, 0);
            if (label) tl.to(label, { rotation: 0, transformOrigin: 'left bottom', opacity: 1, duration: dur, ease }, 0);
            if (dTop) tl.to(dTop, { height: 'auto', opacity: 1, duration: dur, ease }, 0);
            if (dBottom) tl.to(dBottom, { height: 'auto', opacity: 1, duration: dur, ease }, 0);
          } else {
            if (bar) tl.to(bar, { opacity: 0, duration: dur * 0.6, ease }, 0);
            if (dTop) tl.to(dTop, { height: 0, opacity: 0, duration: dur * 0.6, ease }, 0);
            if (dBottom) tl.to(dBottom, { height: 0, opacity: 0, duration: dur * 0.6, ease }, 0);
            if (label) tl.to(label, { rotation: -90, transformOrigin: 'left bottom', opacity: 0.82, duration: dur, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActive(i);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [perspective:1400px] max-[520px]:!flex-col max-[520px]:[perspective:none] ${className}`}
      style={{ gap: `${gap}px`, height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px` }}
      role="group"
      aria-label="Escolha uma forma de ficar"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? 'a' : 'div') as 'a';
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className="group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#0a0713] no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)] max-[520px]:min-h-[84px] max-[520px]:!transform-none"
            style={
              {
                borderRadius: `${radius}px`,
                '--ag-accent': accentColor,
                willChange: 'flex-grow, transform'
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="group"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute top-1/2 left-1/2 [filter:grayscale(var(--ag-gray,1))]"
                style={{
                  width: vertical ? '100%' : 'var(--ag-media-size, 320px)',
                  height: vertical ? 'var(--ag-media-size, 320px)' : '100%',
                  willChange: 'transform, filter'
                }}
              >
                <img
                  loading="lazy"
                  sizes={item.sizes}
                  srcSet={item.srcSet}
                  src={item.image}
                  alt={item.alt || item.label || ''}
                  draggable={false}
                  className="block h-full w-full select-none object-cover [-webkit-user-drag:none]"
                />
              </span>
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: overlayBg }}
                aria-hidden="true"
              />
            </span>
            {showLabels && (
              <span
                className="absolute bottom-5 left-5 right-5 z-[2] flex flex-col justify-end pointer-events-none sm:bottom-8 sm:left-8 sm:right-8"
                aria-hidden={!isActive}
              >
                {/* Detalhe Superior */}
                <div 
                  ref={(el: HTMLElement | null) => { detailRefsTop.current[i] = el; }} 
                  className="opacity-0 h-0 overflow-hidden w-[75vw] max-w-[34rem]"
                >
                  <span className="etiqueta mb-2 block text-cal/75" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)', color: textColor }}>
                    {item.detail}
                  </span>
                </div>

                {/* Bloco fixo com a Barra Vermelha e o Título (Andam sempre juntos) */}
                <div className="flex items-end gap-3 pointer-events-auto w-max max-w-full">
                  <span
                    ref={(el: HTMLElement | null) => { barRefs.current[i] = el; }}
                    className="flex-none rounded-[3px] h-12 w-[3px] opacity-0"
                    style={{
                      background: accentColor,
                      boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)`
                    }}
                  />
                  <div className="relative">
                    <span
                      ref={(el: HTMLElement | null) => { labelRefs.current[i] = el; }}
                      className="cartaz block text-[clamp(1.6rem,3vw,3rem)] leading-none whitespace-nowrap"
                      style={{ transformOrigin: 'left bottom', textShadow: '0 2px 14px rgba(0,0,0,0.55)', color: textColor }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>

                {/* Detalhe Inferior */}
                <div 
                  ref={(el: HTMLElement | null) => { detailRefsBottom.current[i] = el; }} 
                  className="opacity-0 h-0 overflow-hidden pointer-events-auto w-[75vw] max-w-[34rem]"
                >
                  <span className="mt-3 block text-xs font-normal leading-relaxed text-cal/90 sm:text-sm" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)', color: textColor }}>
                    {item.description}
                  </span>
                  <a href="/os-quartos" tabIndex={isActive ? 0 : -1} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cal/90 underline decoration-cal/40 underline-offset-4 transition-colors hover:text-cal hover:decoration-cal" style={{ width: 'max-content', color: textColor }} onClick={event => event.stopPropagation()}>
                    Ver os quartos <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>

              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;


