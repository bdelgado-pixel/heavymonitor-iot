param([string]$Destination=(Join-Path $PSScriptRoot 'backups'))
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskDocker=Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'
if(Get-Command docker -ErrorAction SilentlyContinue){$taskDocker=(Get-Command docker).Source}
$env:PATH=(Split-Path $taskDocker)+';'+$env:PATH
New-Item -ItemType Directory -Path $Destination -Force | Out-Null
$taskName='heavymonitor-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.dump'
& $taskDocker compose -p heavymonitor exec -T postgres pg_dump -U heavymonitor -d heavymonitor -Fc -f "/tmp/$taskName"
if($LASTEXITCODE -ne 0){throw 'Falló la copia de seguridad.'}
$taskContainer=& $taskDocker compose -p heavymonitor ps -q postgres
& $taskDocker cp "${taskContainer}:/tmp/$taskName" (Join-Path $Destination $taskName)
if($LASTEXITCODE -ne 0){throw 'No se pudo guardar el respaldo.'}
& $taskDocker compose -p heavymonitor exec -T postgres rm "/tmp/$taskName"
Write-Host "Respaldo guardado: $(Join-Path $Destination $taskName)"
