' Garante que o servidor do dashboard está ligado (no ciclo do servidor.cmd, que o volta a ligar
' se for morto) e abre a janela. Usa o node.exe instalado
' mesmo que o PATH do Windows ainda nao tenha sido atualizado depois de instalar o Node.
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run """" & sh.CurrentDirectory & "\servidor.cmd""", 0, False
WScript.Sleep 2500
node = sh.ExpandEnvironmentStrings("%ProgramFiles%") & "\nodejs\node.exe"
If Not fso.FileExists(node) Then node = "node"
' Com o servidor já ligado, este node só abre a janela e sai
sh.Run Chr(34) & node & Chr(34) & " server.js --abrir", 0, False
