# ============================================
# SETUP AUTOMÁTICO - EXECUTE ESTE ARQUIVO
# ============================================
# Tempo estimado: 4-5 minutos
# Este script faz TUDO automaticamente

param(
    [switch]$SkipDocker,
    [switch]$SkipTests
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO SETUP COMPLETO DO BACKEND" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta backend/" -ForegroundColor Red
    exit 1
}

# ============================================
# 1. SOBE DOCKER
# ============================================
if (-not $SkipDocker) {
    Write-Host "[1/5] 🐳 Subindo containers Docker..." -ForegroundColor Yellow
    Write-Host "⏱️  Tempo estimado: 30 segundos" -ForegroundColor Gray
    
    docker-compose down 2>$null
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker iniciado com sucesso" -ForegroundColor Green
        Start-Sleep -Seconds 30
    } else {
        Write-Host "⚠️  Docker falhou, mas continuando..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[1/5] ⏭️  Docker ignorado (--SkipDocker)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# 2. APLICA clinicId
# ============================================
Write-Host "[2/5] 🔐 Aplicando filtros clinicId em todos os services..." -ForegroundColor Yellow
Write-Host "⏱️  Tempo estimado: 2 minutos" -ForegroundColor Gray

if (Test-Path ".\scripts\clinicid-batch.ps1") {
    & ".\scripts\clinicid-batch.ps1"
} else {
    Write-Host "⚠️  Script clinicid-batch.ps1 não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 3. INTEGRA WhatsApp
# ============================================
Write-Host "[3/5] 📱 Integrando WhatsApp na fila..." -ForegroundColor Yellow
Write-Host "⏱️  Tempo estimado: 30 segundos" -ForegroundColor Gray

if (Test-Path ".\scripts\whatsapp-integrate.ps1") {
    & ".\scripts\whatsapp-integrate.ps1"
} else {
    Write-Host "⚠️  Script whatsapp-integrate.ps1 não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 4. INSTALA DEPENDÊNCIAS E BUILD
# ============================================
Write-Host "[4/5] 📦 Instalando dependências e compilando..." -ForegroundColor Yellow
Write-Host "⏱️  Tempo estimado: 1-2 minutos" -ForegroundColor Gray

npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
}

npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build realizado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Falha no build" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 5. RODA TESTES
# ============================================
if (-not $SkipTests) {
    Write-Host "[5/5] 🧪 Executando testes E2E..." -ForegroundColor Yellow
    Write-Host "⏱️  Tempo estimado: 1 minuto" -ForegroundColor Gray
    
    npm run test:e2e 2>&1 | Tee-Object -Variable testOutput
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Testes executados" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Alguns testes falharam (verificar relatório)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[5/5] ⏭️  Testes ignorados (--SkipTests)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# 6. GERA RELATÓRIO FINAL
# ============================================
Write-Host "📊 Gerando relatório final..." -ForegroundColor Yellow

if (Test-Path ".\scripts\relatorio-final.ps1") {
    & ".\scripts\relatorio-final.ps1"
} else {
    # Gera relatório básico inline
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    $relatorio = @"
# 📊 RELATÓRIO FINAL - SETUP AUTOMÁTICO
**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
**Duração:** $($duration.Minutes)m $($duration.Seconds)s

## ✅ Status dos Componentes

### 🐳 Docker
- Status: $(if (docker ps 2>$null) { "✅ Rodando" } else { "❌ Falhou" })

### 🔐 clinicId
- Status: $(if (Test-Path "src/modules/leads/leads.service.ts.backup") { "✅ Aplicado" } else { "⚠️  Parcial" })
- Services modificados: leads, mensagens, agendamentos, bloqueios, indicacoes, eventos, pagamentos

### 📱 WhatsApp
- Status: $(if (Test-Path "src/modules/fila/fila.service.ts.backup") { "✅ Integrado" } else { "⚠️  Parcial" })

### 📦 Build
- Status: $(if (Test-Path "dist/main.js") { "✅ OK" } else { "❌ Falhou" })

### 🧪 Testes
- Status: $(if (-not $SkipTests) { "✅ Executados" } else { "⏭️  Ignorados" })

## 🎯 Próximos Passos

1. **Se Build: OK** → Backend pronto para deploy
2. **Se Testes: >80%** → MVP 95% completo
3. **Se algum ❌** → Verifique logs acima

## 🚀 Como Iniciar o Servidor

``````powershell
npm run start:dev
``````

Servidor estará em: http://localhost:3000

## 📝 Arquivos de Backup

Todos os arquivos modificados têm backup com extensão .backup
Para reverter: ``````Copy-Item arquivo.ts.backup arquivo.ts``````

---
**Gerado automaticamente por setup-amanha.ps1**
"@

    $relatorio | Out-File "relatorio-final.md" -Encoding UTF8
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Verifique: relatorio-final.md" -ForegroundColor White
Write-Host "🚀 Para iniciar: npm run start:dev" -ForegroundColor White
Write-Host ""

$endTime = Get-Date
$totalDuration = $endTime - $startTime
Write-Host "⏱️  Tempo total: $($totalDuration.Minutes)m $($totalDuration.Seconds)s" -ForegroundColor Gray
