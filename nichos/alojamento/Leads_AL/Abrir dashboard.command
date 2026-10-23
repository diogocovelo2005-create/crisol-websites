#!/bin/bash
# Mac: abre o dashboard Leads AL no browser (o mesmo que o "Abrir dashboard.bat" no Windows).
# Se o servidor ainda não estiver ligado na porta 4321, arranca-o em segundo plano.
cd "$(dirname "$0")"
if ! lsof -iTCP:4321 -sTCP:LISTEN >/dev/null 2>&1; then
  nohup node server.js >> .servidor.log 2>&1 &
  for i in $(seq 1 20); do sleep 1; lsof -iTCP:4321 -sTCP:LISTEN >/dev/null 2>&1 && break; done
fi
open http://localhost:4321
