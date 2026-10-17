param([Parameter(Mandatory=$true)][string]$Domain,[Parameter(Mandatory=$true)][string]$AdminEmail)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path $PSScriptRoot)
if($Domain -notmatch '^(?=.{1,253}$)[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$'){throw 'Dominio inválido.'}
if($AdminEmail -notmatch '^\S+@\S+\.\S+$'){throw 'Correo inválido.'}
if(Test-Path -LiteralPath '.env.production'){throw 'Ya existe configuración. Usar el procedimiento de actualización, sin reemplazar secretos.'}
$taskRng=[Security.Cryptography.RandomNumberGenerator]::Create()
function New-Secret { $taskBytes=New-Object byte[] 32; $taskRng.GetBytes($taskBytes);return ([BitConverter]::ToString($taskBytes)).Replace('-','').ToLowerInvariant() }
$taskDbSecret=New-Secret
$taskAdminSecret=New-Secret
[IO.File]::WriteAllText((Join-Path (Get-Location) '.env.production'),"DOMAIN=$Domain`nPOSTGRES_PASSWORD=$taskDbSecret`nADMIN_EMAIL=$AdminEmail`nADMIN_PASSWORD=$taskAdminSecret`n")
$taskRng.Dispose()
Write-Host 'Configuración creada en .env.production. Guarda ese archivo de forma privada; contiene las credenciales iniciales.'
Write-Host 'Antes de publicar: apuntar DNS al servidor, permitir 80/443 y verificar respaldo externo.'
Write-Host 'Ejecutar: docker compose --env-file .env.production -f compose.production.yaml up -d --build'
