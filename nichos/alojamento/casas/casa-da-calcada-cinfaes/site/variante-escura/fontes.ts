import localFont from 'next/font/local';

export const display = localFont({
  src: [
    { path: '../../public/fontes/newsreader.woff2', style: 'normal' },
    { path: '../../public/fontes/newsreader-italic.woff2', style: 'italic' },
  ],
  variable: '--fonte-display',
  display: 'swap',
});

export const corpo = localFont({
  src: '../../public/fontes/archivo.woff2',
  variable: '--fonte-corpo',
  display: 'swap',
});
