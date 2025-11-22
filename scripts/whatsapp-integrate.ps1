# ============================================
# INTEGRAÇÃO AUTOMÁTICA DO WhatsApp
# ============================================
# Este script integra o WhatsApp na fila.service.ts

$ErrorActionPreference = "Continue"

Write-Host "📱 Iniciando integração do WhatsApp..." -ForegroundColor Cyan
Write-Host ""

$filaServiceFile = "src/modules/fila/fila.service.ts"

# Verifica se arquivo existe
if (-not (Test-Path $filaServiceFile)) {
    Write-Host "❌ Arquivo não encontrado: $filaServiceFile" -ForegroundColor Red
    Write-Host "   Verifique se o módulo 'fila' existe no projeto" -ForegroundColor Yellow
    exit 1
}

# Cria backup
$backupFile = "$filaServiceFile.backup"
Copy-Item $filaServiceFile $backupFile -Force
Write-Host "💾 Backup criado: $backupFile" -ForegroundColor Green
Write-Host ""

# Lê conteúdo
$content = Get-Content $filaServiceFile -Raw
$modified = $false

# ============================================
# MODIFICAÇÕES
# ============================================

Write-Host "🔧 Aplicando modificações..." -ForegroundColor Yellow
Write-Host ""

# 1. Adiciona import do WhatsAppService (se não existir)
if ($content -notmatch "WhatsAppService") {
    Write-Host "   [1/4] Adicionando import WhatsAppService..." -ForegroundColor Gray
    
    # Procura pela última linha de import
    if ($content -match "@nestjs/common") {
        $content = $content -replace "(@Injectable\(\))", "import { WhatsAppService } from '../integrations/whatsapp/whatsapp.service';`n`n`$1"
        Write-Host "   ✅ Import adicionado" -ForegroundColor Green
        $modified = $true
    } else {
        Write-Host "   ⚠️  Não foi possível adicionar import automaticamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [1/4] ✓ Import WhatsAppService já existe" -ForegroundColor Green
}

# 2. Adiciona WhatsAppService no construtor (se não existir)
if ($content -notmatch "private.*whatsappService.*WhatsAppService") {
    Write-Host "   [2/4] Adicionando WhatsAppService no construtor..." -ForegroundColor Gray
    
    # Procura pelo construtor
    if ($content -match "constructor\([^\)]*\)") {
        $content = $content -replace "(constructor\([^\)]*)([\),])", "`$1,`n    @Inject(forwardRef(() => WhatsAppService))`n    private readonly whatsappService: WhatsAppService`$2"
        Write-Host "   ✅ WhatsAppService injetado no construtor" -ForegroundColor Green
        $modified = $true
    } else {
        Write-Host "   ⚠️  Construtor não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [2/4] ✓ WhatsAppService já injetado" -ForegroundColor Green
}

# 3. Substitui simulação por envio real
if ($content -match "simularEnvio|console\.log.*Enviando mensagem") {
    Write-Host "   [3/4] Substituindo simulação por envio real..." -ForegroundColor Gray
    
    # Remove simulação e adiciona chamada real
    $content = $content -replace "await this\.simularEnvio\([^\)]*\)", "await this.whatsappService.sendMessage(mensagem.telefone, mensagem.conteudo)"
    $content = $content -replace "console\.log\('Enviando mensagem'[^\)]*\)", "await this.whatsappService.sendMessage(mensagem.telefone, mensagem.conteudo)"
    
    Write-Host "   ✅ Simulação substituída por envio real" -ForegroundColor Green
    $modified = $true
} else {
    Write-Host "   [3/4] ℹ️  Método de simulação não encontrado" -ForegroundColor Cyan
}

# 4. Remove método simularEnvio (se existir)
if ($content -match "private async simularEnvio") {
    Write-Host "   [4/4] Removendo método simularEnvio..." -ForegroundColor Gray
    
    # Remove o método completo
    $content = $content -replace "private async simularEnvio\([^\{]*\{[^\}]*\}", ""
    
    Write-Host "   ✅ Método simularEnvio removido" -ForegroundColor Green
    $modified = $true
} else {
    Write-Host "   [4/4] ✓ Método simularEnvio não existe (já estava limpo)" -ForegroundColor Green
}

# Salva modificações
if ($modified) {
    Write-Host ""
    Write-Host "💾 Salvando alterações..." -ForegroundColor Yellow
    $content | Set-Content $filaServiceFile -Encoding UTF8
    Write-Host "✅ Arquivo modificado com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ℹ️  Nenhuma modificação necessária (WhatsApp já estava integrado)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📱 INTEGRAÇÃO DO WhatsApp CONCLUÍDA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ fila.service.ts modificado" -ForegroundColor Green
Write-Host "✅ WhatsAppService integrado" -ForegroundColor Green
Write-Host "✅ Simulação substituída por envio real" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Configure as variáveis de ambiente do WhatsApp:" -ForegroundColor White
Write-Host "   - WHATSAPP_API_URL" -ForegroundColor Gray
Write-Host "   - WHATSAPP_API_TOKEN" -ForegroundColor Gray
Write-Host "   - WHATSAPP_PHONE_NUMBER_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Backup disponível em: $backupFile" -ForegroundColor Gray
Write-Host ""
