# ============================================
# CANCELAR WORKFLOWS GITHUB - Script Automático
# ============================================
# Cancela todos os workflows em andamento no repositório atual
# Requer: GitHub CLI (gh) instalado e autenticado

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚫 CANCELAR WORKFLOWS GITHUB" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. VERIFICA GITHUB CLI
# ============================================
Write-Host "[1/4] 📦 Verificando GitHub CLI..." -ForegroundColor Yellow

function Show-GhInstallInstructions {
    Write-Host "   ❌ GitHub CLI não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar o GitHub CLI:" -ForegroundColor Yellow
    Write-Host "   winget install GitHub.cli" -ForegroundColor Cyan
    Write-Host "   ou" -ForegroundColor Yellow
    Write-Host "   choco install gh" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

try {
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        $versionLine = ($ghVersion -split "`n")[0]
        Write-Host "   ✅ $versionLine" -ForegroundColor Green
    } else {
        Show-GhInstallInstructions
    }
} catch {
    Show-GhInstallInstructions
}

# ============================================
# 2. VERIFICA AUTENTICAÇÃO
# ============================================
Write-Host "[2/4] 🔐 Verificando autenticação..." -ForegroundColor Yellow

try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Autenticado no GitHub" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Não autenticado no GitHub" -ForegroundColor Red
        Write-Host ""
        Write-Host "Execute:" -ForegroundColor Yellow
        Write-Host "   gh auth login" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "   ❌ Erro ao verificar autenticação" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute:" -ForegroundColor Yellow
    Write-Host "   gh auth login" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# ============================================
# 3. LISTA WORKFLOWS EM ANDAMENTO
# ============================================
Write-Host "[3/4] 📋 Listando workflows em andamento..." -ForegroundColor Yellow

try {
    # Lista todos os workflows com status "in_progress" ou "queued"
    $runningWorkflows = gh run list --status in_progress --json databaseId,name,status,headBranch 2>$null | ConvertFrom-Json
    $queuedWorkflows = gh run list --status queued --json databaseId,name,status,headBranch 2>$null | ConvertFrom-Json
    
    $allWorkflows = @()
    if ($runningWorkflows) { $allWorkflows += $runningWorkflows }
    if ($queuedWorkflows) { $allWorkflows += $queuedWorkflows }
    
    if ($allWorkflows.Count -eq 0) {
        Write-Host "   ℹ️  Nenhum workflow em andamento" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "✅ CONCLUÍDO" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Cyan
        exit 0
    }
    
    Write-Host "   ✅ Encontrados $($allWorkflows.Count) workflow(s)" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Workflows encontrados:" -ForegroundColor White
    foreach ($workflow in $allWorkflows) {
        Write-Host "      • ID: $($workflow.databaseId) - $($workflow.name) [$($workflow.status)] - Branch: $($workflow.headBranch)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro ao listar workflows: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# 4. CANCELA WORKFLOWS
# ============================================
Write-Host "[4/4] 🚫 Cancelando workflows..." -ForegroundColor Yellow
Write-Host ""

$canceledCount = 0
$failedCount = 0
$errors = @()

foreach ($workflow in $allWorkflows) {
    try {
        Write-Host "   Cancelando: $($workflow.name) (ID: $($workflow.databaseId))..." -ForegroundColor Gray -NoNewline
        
        $errorOutput = $null
        gh run cancel $workflow.databaseId 2>&1 | Tee-Object -Variable errorOutput | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $canceledCount++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $failedCount++
            $errorMsg = if ($errorOutput) { $errorOutput -join "; " } else { "Falha desconhecida" }
            $errors += "Falha ao cancelar workflow ID $($workflow.databaseId): $($workflow.name) - $errorMsg"
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $failedCount++
        $errors += "Erro ao cancelar workflow ID $($workflow.databaseId): $_"
    }
    
    # Pequeno delay para evitar rate limiting
    Start-Sleep -Milliseconds 200
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total de workflows encontrados: $($allWorkflows.Count)" -ForegroundColor White
Write-Host "✅ Cancelados com sucesso: $canceledCount" -ForegroundColor Green

if ($failedCount -gt 0) {
    Write-Host "❌ Falhas: $failedCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erros:" -ForegroundColor Yellow
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

if ($failedCount -eq 0) {
    Write-Host "✅ TODOS OS WORKFLOWS FORAM CANCELADOS COM SUCESSO!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "⚠️  ALGUNS WORKFLOWS FALHARAM AO CANCELAR" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Cyan
    exit 1
}
