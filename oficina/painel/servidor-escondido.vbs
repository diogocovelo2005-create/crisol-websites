' Corre o servidor.cmd sem abrir janela.
Set fso = CreateObject("Scripting.FileSystemObject")
pasta = fso.GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run """" & pasta & "\servidor.cmd""", 0, False
