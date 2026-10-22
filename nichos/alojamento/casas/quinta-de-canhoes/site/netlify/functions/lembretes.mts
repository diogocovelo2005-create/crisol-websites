import { createHmac } from "node:crypto";

/*
  Todos os dias às 8h (UTC; 8h ou 9h em Portugal): pede ao site os lembretes
  das reservas. O trabalho faz-se em /api/lembretes; isto só o chama, assinado.
*/
const lembretes = async () => {
  const base = process.env.URL ?? process.env.SITE_URL;
  const segredo = process.env.SEGREDO_RESERVAS;
  if (!base || !segredo) {
    console.error("lembretes: falta URL/SITE_URL ou SEGREDO_RESERVAS");
    return;
  }
  const r = await fetch(`${base}/api/lembretes`, {
    method: "POST",
    headers: { "x-lembretes": createHmac("sha256", segredo).update("lembretes").digest("hex") },
  });
  console.log("lembretes:", r.status, await r.text());
};

export default lembretes;

export const config = { schedule: "0 8 * * *" };
