/*
  O 404 de uma chave errada: a mesma página que o Next mostra em qualquer
  endereço que não existe, mas sem o <title> próprio («404: This page could
  not be found.»), que só aparece quando é uma página a dizer notFound(); assim
  fica igual, título incluído, ao 404 de um endereço qualquer. Sem pistas.
*/
const s = {
  erro: {
    fontFamily: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  desc: { display: "inline-block" },
  h1: { display: "inline-block", margin: "0 20px 0 0", padding: "0 23px 0 0", fontSize: 24, fontWeight: 500, verticalAlign: "top", lineHeight: "49px" },
  h2: { fontSize: 14, fontWeight: 400, lineHeight: "49px", margin: 0 },
} as const;

export default function NaoEncontrado() {
  return (
    <div style={s.erro}>
      <div>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}",
          }}
        />
        <h1 className="next-error-h1" style={s.h1}>
          404
        </h1>
        <div style={s.desc}>
          <h2 style={s.h2}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
