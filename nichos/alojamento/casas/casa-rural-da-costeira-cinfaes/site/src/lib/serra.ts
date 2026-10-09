/*
  O perfil de uma serra para a saída do primeiro ecrã («A encosta»): um
  caminho SVG (viewBox 0 0 100 100) com a crista à volta de `base` e o
  resto cheio até baixo. Soma de três ondas, sempre igual no servidor e no
  browser. Usado pelas camadas do hero e pelo topo de «A casa de perto».
*/
export function serra(fase: number, base: number, amp: number, aspereza: number) {
  const n = 48;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = i / n;
    const y =
      base +
      amp *
        (0.55 * Math.sin(2 * Math.PI * x * 1.15 + fase) +
          0.3 * Math.sin(2 * Math.PI * x * 2.7 + fase * 2.1) +
          aspereza * 0.15 * Math.sin(2 * Math.PI * x * 7.9 + fase * 3.7));
    pts.push(`${(x * 100).toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join(' L')} L100 100 L0 100 Z`;
}
