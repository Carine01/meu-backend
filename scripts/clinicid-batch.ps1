# ============================================
# APLICAÇÃO AUTOMÁTICA DE clinicId
# ============================================
# Este script modifica os 7 services automaticamente

$ErrorActionPreference = "Continue"

Write-Host "🔐 Iniciando aplicação de clinicId..." -ForegroundColor Cyan
Write-Host ""

# Lista dos 7 services principais
$services = @(
    "leads",
    "mensagens", 
    "agendamentos",
    "bloqueios",
    "indicacoes",
    "eventos",
    "pagamentos"
)

$successCount = 0
$failCount = 0

foreach ($svc in $services) {
    $serviceFile = "src/modules/$svc/$svc.service.ts"
    
    Write-Host "📝 Processando: $svc..." -ForegroundColor Yellow
    
    # Verifica se arquivo existe
    if (-not (Test-Path $serviceFile)) {
        Write-Host "   ⚠️  Arquivo não encontrado: $serviceFile" -ForegroundColor Yellow
        $failCount++
        continue
    }
    
    # Cria backup
    $backupFile = "$serviceFile.backup"
    Copy-Item $serviceFile $backupFile -Force
    Write-Host "   💾 Backup criado: $backupFile" -ForegroundColor Gray
    
    # Lê conteúdo
    $content = Get-Content $serviceFile -Raw
    $modified = $false
    
    # ============================================
    # MODIFICAÇÕES PADRÃO
    # ============================================
    
    # 1. Adiciona import AuthenticatedRequest (se não existir)
    if ($content -notmatch "AuthenticatedRequest") {
        $content = $content -replace "(import \{ Injectable[^\}]+\}[^\n]+)", "`$1`nimport { Request } from 'express';`ninterface AuthenticatedRequest extends Request { user: { clinicId: string; uid: string } }"
        $modified = $true
        Write-Host "   ✅ Import AuthenticatedRequest adicionado" -ForegroundColor Green
    }
    
    # 2. Modifica findAll para incluir @Req()
    if ($content -match "async findAll\(\)") {
        $content = $content -replace "async findAll\(\)", "async findAll(@Req() req: AuthenticatedRequest)"
        $modified = $true
        Write-Host "   ✅ Parâmetro @Req() adicionado em findAll()" -ForegroundColor Green
    }
    
    # 3. Adiciona filtro clinicId no find()
    if ($content -match "this\.\w+Repository\.find\(\s*\)") {
        $content = $content -replace "(this\.\w+Repository)\.find\(\s*\)", "`$1.find({ where: { clinicId: req.user.clinicId } })"
        $modified = $true
        Write-Host "   ✅ Filtro clinicId adicionado em find()" -ForegroundColor Green
    }
    
    # 4. Modifica create para incluir @Req()
    if ($content -match "async create\(") {
        $content = $content -replace "async create\(", "async create(@Req() req: AuthenticatedRequest, "
        $modified = $true
        Write-Host "   ✅ Parâmetro @Req() adicionado em create()" -ForegroundColor Green
    }
    
    # 5. Garante atribuição de clinicId no create
    if ($content -notmatch "clinicId.*=.*req\.user\.clinicId") {
        # Procura por padrões comuns de criação
        if ($content -match "const \w+ = this\.\w+Repository\.create\(") {
            $content = $content -replace "(const \w+ = this\.\w+Repository\.create\([^\)]+)", "`$1`n    entity.clinicId = req.user.clinicId;"
            $modified = $true
            Write-Host "   ✅ Atribuição clinicId adicionada em create()" -ForegroundColor Green
        }
    }
    
    # 6. Adiciona @Req() em outros métodos findOne, update, delete
    $content = $content -replace "async findOne\(id: string\)", "async findOne(@Req() req: AuthenticatedRequest, id: string)"
    $content = $content -replace "async update\(id: string,", "async update(@Req() req: AuthenticatedRequest, id: string,"
    $content = $content -replace "async delete\(id: string\)", "async delete(@Req() req: AuthenticatedRequest, id: string)"
    
    # 7. Adiciona filtro clinicId em findOne
    if ($content -match "findOne\(\s*\{\s*where:\s*\{\s*id\s*\}") {
        $content = $content -replace "(findOne\(\s*\{\s*where:\s*\{\s*id)", "`$1, clinicId: req.user.clinicId"
        $modified = $true
    }
    
    # Salva modificações
    if ($modified) {
        $content | Set-Content $serviceFile -Encoding UTF8
        Write-Host "   ✅ Arquivo modificado com sucesso" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ℹ️  Nenhuma modificação necessária (já estava correto)" -ForegroundColor Cyan
        $successCount++
    }
    
    Write-Host ""
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DA APLICAÇÃO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Sucesso: $successCount services" -ForegroundColor Green
Write-Host "❌ Falhas: $failCount services" -ForegroundColor Red
Write-Host ""

if ($successCount -eq $services.Count) {
    Write-Host "🎉 PERFEITO! Todos os services foram modificados!" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️  Alguns services foram modificados. Verifique os avisos acima." -ForegroundColor Yellow
} else {
    Write-Host "❌ Nenhum service foi modificado. Verifique a estrutura do projeto." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Dica: Backups foram criados com extensão .backup" -ForegroundColor Gray
Write-Host "   Para reverter: Copy-Item arquivo.ts.backup arquivo.ts" -ForegroundColor Gray
Write-Host ""
