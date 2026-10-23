# Instala o Leads AL neste PC: Node.js (se faltar), atalhos e pasta de dados.
$ErrorActionPreference = 'Stop'
$d = $PSScriptRoot
$nodeExe = Join-Path $env:ProgramFiles 'nodejs\node.exe'
Write-Host 'A instalar o Leads AL...' -ForegroundColor Cyan

# Ficheiros vindos de um zip descarregado ficam bloqueados pelo Windows
Get-ChildItem $d -Recurse -File | Unblock-File

if (-not (Get-Command node -ErrorAction SilentlyContinue) -and -not (Test-Path $nodeExe)) {
  Write-Host 'Node.js não encontrado. A instalar (pode pedir permissão)...'
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if (-not (Test-Path $nodeExe)) {
    Write-Host 'Não consegui instalar o Node.js. Instala em https://nodejs.org e corre outra vez o instalar.bat.' -ForegroundColor Red
    Read-Host 'Enter para sair'
    exit 1
  }
}

# Playwright para a avaliação dos sites (usa o Edge já instalado: não descarrega browser nenhum)
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) { $npm = Join-Path $env:ProgramFiles 'nodejs\npm.cmd' }
Push-Location $d
& $npm install --no-audit --no-fund --silent
Pop-Location

# Dados vazios (sem BOM, para o Node conseguir ler). Se já existirem, ficam como estão.
$data = Join-Path $d 'data'
New-Item -ItemType Directory -Force $data | Out-Null
if (-not (Test-Path (Join-Path $data 'leads.json'))) { [IO.File]::WriteAllText((Join-Path $data 'leads.json'), '{"leads":[]}') }
if (-not (Test-Path (Join-Path $data 'estado.json'))) { [IO.File]::WriteAllText((Join-Path $data 'estado.json'), '{}') }

# Atalho na pasta e no menu Iniciar
$vbs = Join-Path $d 'abrir.vbs'
$sh = New-Object -ComObject WScript.Shell
$atalhos = @((Join-Path $d 'Leads AL.lnk'), (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Leads AL.lnk'))
foreach ($lnk in $atalhos) {
  $s = $sh.CreateShortcut($lnk)
  $s.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
  $s.Arguments = '"' + $vbs + '"'
  $s.WorkingDirectory = $d
  $s.IconLocation = (Join-Path $d 'icone.ico') + ',0'
  $s.Description = 'Dashboard de leads AL'
  $s.Save()
}

Write-Host ''
Write-Host 'Pronto!' -ForegroundColor Green
Write-Host 'Para pôr na barra de tarefas: tecla Windows, escreve Leads AL, botão direito, Afixar na barra de tarefas.'
Start-Process wscript.exe -ArgumentList ('"' + $vbs + '"')
Read-Host 'Enter para fechar'
