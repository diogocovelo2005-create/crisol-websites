/*
  Parte um titulo em normal e italico. O texto entre *asteriscos* sai
  em <em>, na mesma familia: e o gesto tipografico das referencias.
*/
export default function Titulo({ texto }: { texto: string }) {
  const partes = texto.split('*');
  return (
    <>
      {partes.map((p, i) => (i % 2 === 1 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>))}
    </>
  );
}
