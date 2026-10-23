/*
  Registos de diagnóstico das reservas (aparecem em «netlify logs --source functions»).
  Cada linha começa por «[reserva] passo». Nunca escreve valores de segredos.
*/
export const passo = (msg: string, extra?: Record<string, unknown>) =>
  console.info(`[reserva] passo ${msg}${extra ? ` ${JSON.stringify(extra)}` : ""}`);

/** Corre `p` com tempo-limite; regista a duração; ao fim do tempo rejeita com «<nome> não respondeu em N s». */
export async function comTempo<T>(nome: string, p: Promise<T>, ms: number): Promise<T> {
  const t0 = Date.now();
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new Error(`${nome} não respondeu em ${ms / 1000} s`)), ms);
  });
  try {
    const r = await Promise.race([p, limite]);
    passo(`${nome}: ok`, { ms: Date.now() - t0 });
    return r;
  } catch (e) {
    passo(`${nome}: ERRO`, { ms: Date.now() - t0, erro: (e as Error).message });
    throw e;
  } finally {
    clearTimeout(temporizador);
  }
}
