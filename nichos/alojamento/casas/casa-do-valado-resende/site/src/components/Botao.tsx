import Link from 'next/link';

/*
  Botoes das referencias: quase retos, rotulo em versaletes.

  ouro           o CTA que converte. Texto escuro, porque texto claro
                 sobre dourado nao passa contraste.
  floresta       acao secundaria sobre linho.
  contorno       sobre linho.
  contorno-claro sobre fotografia ou sobre verde.
*/

type Tom = 'ouro' | 'floresta' | 'contorno' | 'contorno-claro';

type Props = {
  href: string;
  children: React.ReactNode;
  tom?: Tom;
  className?: string;
  tabIndex?: number;
};

const base =
  'versalete inline-flex items-center justify-center gap-2.5 whitespace-nowrap min-h-12 rounded-none px-7 py-4 transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.97]';

const tons: Record<Tom, string> = {
  ouro: 'border border-ouro bg-ouro text-osso hover:bg-ouro-escuro hover:border-ouro-escuro',
  floresta: 'bg-floresta text-osso hover:bg-floresta-fundo',
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
