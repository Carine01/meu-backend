# relatorio-final.ps1
Set-StrictMode -Version Latest
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Permitir execução temporária (não altera política permanente)
Try {
    $currentPolicy = Get-ExecutionPolicy -Scope Process -ErrorAction Stop
} Catch {
    $currentPolicy = "Undefined"
}

Write-Host "ExecutionPolicy (process): $currentPolicy"

# Ajuste caminhos base
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Split-Path -Parent $scriptDir
Set-Location $backendDir

# Carregar env (se existir .env.local.ps1)
$envFile = Join-Path $scriptDir ".env.local.ps1"
If (Test-Path $envFile) {
    Write-Host "Carregando variáveis de ambiente de $envFile"
    . $envFile
}

Function ExitOnError($code, $msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    Exit $code
}

# Exemplo de etapa: build
Write-Host "1) Instalando dependências..." -ForegroundColor Cyan
if (-Not (Test-Path "package.json")) { ExitOnError 10 "package.json não encontrado" }

npm ci --silent
if ($LASTEXITCODE -ne 0) { ExitOnError 11 "npm ci falhou (código $LASTEXITCODE)" }

Write-Host "2) Rodando build TypeScript..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { ExitOnError 12 "build falhou (código $LASTEXITCODE)" }

Write-Host "3) Executando checks..." -ForegroundColor Cyan
# inserir scripts de lint/test que precise validar
$testScript = "test:ci"
$hasTestCI = (Get-Content package.json -Raw) -match '"test:ci"'

if ($hasTestCI) {
    npm run test:ci
    if ($LASTEXITCODE -ne 0) { ExitOnError 13 "test:ci falhou (código $LASTEXITCODE)" }
} else {
    Write-Host "⚠️ test:ci não encontrado, rodando test padrão" -ForegroundColor Yellow
    npm run test
    if ($LASTEXITCODE -ne 0) { ExitOnError 13 "test falhou (código $LASTEXITCODE)" }
}

Write-Host "`n✅ Relatório final concluído com sucesso." -ForegroundColor Green
Exit 0
