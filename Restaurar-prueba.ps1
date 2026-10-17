param([Parameter(Mandatory=$true)][string]$BackupFile)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskResolved=(Resolve-Path -LiteralPath $BackupFile).Path
if(!(Test-Path -LiteralPath $taskResolved -PathType Leaf)){throw 'Archivo inexistente.'}
$taskDocker=Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'
if(Get-Command docker -ErrorAction SilentlyContinue){$taskDocker=(Get-Command docker).Source}
$taskContainer=& $taskDocker compose -p heavymonitor ps -q postgres
if(!$taskContainer){throw 'PostgreSQL no está activo.'}
$taskDatabase='restoretest_'+[guid]::NewGuid().ToString('N')
$taskRemote='/tmp/'+$taskDatabase+'.dump'
& $taskDocker cp $taskResolved "${taskContainer}:$taskRemote"
if($LASTEXITCODE -ne 0){throw 'No se pudo copiar el respaldo.'}
try {
 & $taskDocker compose -p heavymonitor exec -T postgres createdb -U heavymonitor $taskDatabase
 if($LASTEXITCODE -ne 0){throw 'No se pudo crear base temporal.'}
 & $taskDocker compose -p heavymonitor exec -T postgres pg_restore -U heavymonitor --exit-on-error -d $taskDatabase $taskRemote
 if($LASTEXITCODE -ne 0){throw 'Restauración de prueba fallida.'}
 & $taskDocker compose -p heavymonitor exec -T postgres psql -U heavymonitor -d $taskDatabase -c 'SELECT count(*) AS mediciones_restauradas FROM measurements;'
 if($LASTEXITCODE -ne 0){throw 'No se pudo verificar la base restaurada.'}
 Write-Host 'Restauración de prueba verificada. La base original no se modificó.'
} finally {
 & $taskDocker compose -p heavymonitor exec -T postgres dropdb -U heavymonitor --if-exists $taskDatabase
 & $taskDocker compose -p heavymonitor exec -T postgres rm $taskRemote
}
