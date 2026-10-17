$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskDocker=Get-Command docker -ErrorAction SilentlyContinue
if($taskDocker){$taskDockerExe=$taskDocker.Source}else{$taskDockerExe=Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'}
if(!(Test-Path -LiteralPath $taskDockerExe)){throw 'Abre Docker Desktop y comprueba su instalación.'}
$env:PATH=(Split-Path $taskDockerExe)+';'+$env:PATH
& $taskDockerExe compose -p heavymonitor up -d --wait
if($LASTEXITCODE -ne 0){throw 'No se pudieron iniciar los servicios de Docker.'}
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c npm.cmd run start -w apps/api' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c npm.cmd run start -w apps/web' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
Write-Host 'Servicios iniciados. Abre http://127.0.0.1:3000 cuando la web termine de arrancar.'
