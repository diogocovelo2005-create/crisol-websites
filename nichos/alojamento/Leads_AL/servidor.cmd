@echo off
rem Mantém o servidor do dashboard sempre ligado. Chamado escondido pelo servidor.vbs
rem (tarefa "Leads AL - servidor", ao entrar no Windows).
rem Se o node for morto (por exemplo um "taskkill /IM node.exe" de outra sessão do Claude)
rem ou cair, volta a arrancar ao fim de 3s. A janela do dashboard grava sozinha o que ficou pendente.
cd /d "%~dp0"
netstat -ano | findstr /r /c:"127.0.0.1:4321 .*LISTENING" >nul && exit /b 0
set NODE=%ProgramFiles%\nodejs\node.exe
if not exist "%NODE%" set NODE=node
:arrancar
echo [%date% %time%] a arrancar >> data\servidor.log
"%NODE%" server.js >> data\servidor.log 2>&1
echo [%date% %time%] parou (saida %errorlevel%), a arrancar outra vez em 3s >> data\servidor.log
timeout /t 3 /nobreak >nul
goto arrancar
