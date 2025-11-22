# relatorio-final.ps1
Set-StrictMode -Version Latest
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Function ExitOnError($code, $msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    Exit $code
}

Try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Set-Location $scriptDir
} Catch {
    ExitOnError 1 "Não foi possível determinar o diretório do script."
}

# Carregar env se existir
$envFile = Join-Path $scriptDir ".env.local.ps1"
If (Test-Path $envFile) {
    Write-Host "Carregando variáveis de ambiente de $envFile"
    . $envFile
}

Write-Host "1) Instalando dependências..."
npm ci --silent
if ($LASTEXITCODE -ne 0) { ExitOnError 11 "npm ci falhou (código $LASTEXITCODE)" }

Write-Host "2) Rodando build TypeScript..."
npm run build --silent
if ($LASTEXITCODE -ne 0) { ExitOnError 12 "build falhou (código $LASTEXITCODE)" }

Write-Host "3) Executando lint..."
if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    npm run lint --silent
    if ($LASTEXITCODE -ne 0) { Write-Host "Aviso: lint retornou não zero" -ForegroundColor Yellow }
}

Write-Host "4) Executando testes CI..."
npm run test:ci --silent
if ($LASTEXITCODE -ne 0) { ExitOnError 13 "test:ci falhou (código $LASTEXITCODE)" }

Write-Host "Relatório final concluído com sucesso." -ForegroundColor Green
Exit 0
