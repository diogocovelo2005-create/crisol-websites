import Link from 'next/link';

/*
  Botoes das referencias: quase retos, rotulo em versaletes.

  ouro           o CTA que converte: a cor e os frisos da placa de madeira
                 que esta a porta da casa (.madeira, em globals.css).
                 Texto claro por cima. Na seccao final (fecho).
  cal            o branco da cal das paredes, texto escuro. So o hero no
                 telemovel: no ecra estreito a placa de madeira da propria
                 fotografia fica logo abaixo do botao e ele confundia-se com
                 ela.
  cal-madeira    o Reservar do hero: cal no telemovel, madeira (como o
                 ouro) a partir de lg. Pedido do dono: no computador todos
                 os Reservar em madeira.
  floresta       acao secundaria sobre linho.
  floresta-madeira  o Reservar do fecho antes de a foto o cobrir: floresta
                 no telemovel, madeira a partir de lg.
  contorno       sobre linho.
  contorno-claro sobre fotografia ou sobre verde.
*/

type Tom = 'ouro' | 'cal' | 'cal-madeira' | 'floresta' | 'floresta-madeira' | 'contorno' | 'contorno-claro';

type Props = {
  href: string;
  children: React.ReactNode;
  tom?: Tom;
  className?: string;
  tabIndex?: number;
};

const base =
  'versalete inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[2px] px-7 py-4 transition-colors duration-200 active:translate-y-px';

const tons: Record<Tom, string> = {
  ouro: 'madeira bg-ouro text-osso hover:bg-[#5e4438]',
  cal: 'bg-osso text-tinta hover:bg-white',
  'cal-madeira':
    'madeira-lg bg-osso text-tinta hover:bg-white lg:bg-ouro lg:text-osso lg:hover:bg-[#5e4438]',
  floresta: 'bg-floresta text-osso hover:bg-floresta-fundo',
  'floresta-madeira':
    'madeira-lg bg-floresta text-osso hover:bg-floresta-fundo lg:bg-ouro lg:hover:bg-[#5e4438]',
  contorno: 'border border-tinta/35 text-tinta hover:border-tinta hover:bg-tinta/5',
  'contorno-claro': 'border border-osso/55 text-osso hover:border-osso hover:bg-osso/10',
};

export default function Botao({ href, children, tom = 'ouro', className = '', tabIndex }: Props) {
  const classes = `${base} ${tons[tom]} ${className}`;
  const externo = /^(https?:|tel:|mailto:)/.test(href);

  if (externo) {
    const novo = href.startsWith('http');
    return (
      <a
        href={href}
        target={novo ? '_blank' : undefined}
        rel={novo ? 'noopener noreferrer' : undefined}
        className={classes}
        tabIndex={tabIndex}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} tabIndex={tabIndex}>
      {children}
    </Link>
  );
}
