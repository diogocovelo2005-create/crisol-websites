@echo off
rem Arranca o servidor do painel sem janela (chamado pelo arranque do Windows).
rem Se já houver um painel na porta 4000, não faz nada.
cd /d "%~dp0"
netstat -ano | findstr /r /c:"127.0.0.1:4000 .*LISTENING" >nul && exit /b 0

rem Se o servidor cair (crash), reinicia sozinho ao fim de 5s. O log e
rem acrescentado (>>), nunca substituido, para o motivo do crash anterior
rem nao se perder no reinicio seguinte.
:reiniciar
echo [%date% %time%] a arrancar >> .painel-dev.log
call npm run dev >> .painel-dev.log 2>&1
echo [%date% %time%] parou (saida %errorlevel%), a reiniciar em 5s >> .painel-dev.log
timeout /t 5 /nobreak >nul
goto reiniciar
