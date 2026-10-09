' Arranca o servidor do dashboard escondido e sem abrir janela, dentro do ciclo do servidor.cmd
' (volta a ligá-lo sozinho se for morto). Corre pela tarefa "Leads AL - servidor" ao entrar no Windows.
Set fso = CreateObject("Scripting.FileSystemObject")
pasta = fso.GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run """" & pasta & "\servidor.cmd""", 0, False
