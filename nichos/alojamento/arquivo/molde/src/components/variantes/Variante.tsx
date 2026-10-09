/*
  Marca uma secao com o codigo da variante (P1, E2, F3...). Nao muda nada
  visualmente. Serve o script tools/capturas.mjs, que encontra a variante
  por este atributo e tira as capturas de referencia nos mesmos pontos do
  scroll, tanto no /catalogo como no site de um cliente.
*/
export default function Variante({ codigo, children }: { codigo: string; children: React.ReactNode }) {
  return <div data-variante={codigo}>{children}</div>;
}
