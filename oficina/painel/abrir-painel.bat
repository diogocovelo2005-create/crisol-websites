@echo off
rem Abre o painel de projetos no browser. O servidor arranca sozinho quando o
rem Windows liga (atalho na pasta Arranque); se não estiver ligado, arranca-o aqui.
cd /d "%~dp0"
netstat -ano | findstr /r /c:"127.0.0.1:4000 .*LISTENING" >nul || wscript "%~dp0servidor-escondido.vbs"
start http://localhost:4000
