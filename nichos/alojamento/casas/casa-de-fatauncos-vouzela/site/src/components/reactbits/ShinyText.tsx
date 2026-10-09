// Vem do React Bits (ShinyText): um brilho que atravessa o texto em ciclo.
//
// Adaptado: no original o texto e cinzento semitransparente e o brilho e
// branco, pensado para fundo escuro. Aqui o fundo e claro, por isso as duas
// cores passam a ser props (`cor` e `brilho`) e o gradiente pinta o texto
// inteiro, com a faixa de brilho a meio. As keyframes (`shine`) estao em
// globals.css e param com prefers-reduced-motion.

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  /** segundos que o brilho leva a atravessar o texto */
  speed?: number;
  cor?: string;
  brilho?: string;
  className?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 5,
  cor = '#533a2c',
  brilho = '#c9a184',
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${disabled ? '' : 'shiny-text'} ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${cor} 0%, ${cor} 40%, ${brilho} 50%, ${cor} 60%, ${cor} 100%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
