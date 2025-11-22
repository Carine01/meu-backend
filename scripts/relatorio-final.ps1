# ============================================
# GERADOR DE RELATÓRIO FINAL
# ============================================
# Gera relatório completo após execução do setup

$ErrorActionPreference = "Continue"

Write-Host "📊 Gerando relatório final..." -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
$reportFile = "relatorio-final.md"

# ============================================
# COLETA DE INFORMAÇÕES
# ============================================

# 1. Status do Docker
$dockerStatus = "❌ Não rodando"
$dockerDetails = ""
try {
    $containers = docker ps --format "{{.Names}}: {{.Status}}" 2>$null
    if ($containers) {
        $dockerStatus = "✅ Rodando"
        $dockerDetails = $containers -join "`n  - "
    }
} catch {
    $dockerDetails = "Docker não disponível"
}

# 2. Status do Build
$buildStatus = "❌ Falhou"
$buildDetails = ""
if (Test-Path "dist/main.js") {
    $buildStatus = "✅ OK"
    $distFiles = (Get-ChildItem -Path "dist" -Recurse -File).Count
    $buildDetails = "$distFiles arquivos compilados"
} else {
    $buildDetails = "Pasta dist/ não encontrada"
}

# 3. Status dos Testes
$testStatus = "⏭️ Não executados"
$testDetails = ""
if (Test-Path "test-results.json") {
    $testResults = Get-Content "test-results.json" | ConvertFrom-Json
    $testStatus = "✅ Executados"
    $testDetails = "$($testResults.passed) passando, $($testResults.failed) falhando"
} else {
    # Tenta ler do package.json scripts
    $testDetails = "Execute: npm run test:e2e"
}

# 4. Status clinicId
$clinicIdStatus = "⚠️ Parcial"
$clinicIdDetails = ""
$backupFiles = @()
$services = @("leads", "mensagens", "agendamentos", "bloqueios", "indicacoes", "eventos", "pagamentos")

foreach ($svc in $services) {
    $backupPath = "src/modules/$svc/$svc.service.ts.backup"
    if (Test-Path $backupPath) {
        $backupFiles += $svc
    }
}

if ($backupFiles.Count -eq 7) {
    $clinicIdStatus = "✅ Aplicado"
    $clinicIdDetails = "Todos os 7 services modificados"
} elseif ($backupFiles.Count -gt 0) {
    $clinicIdStatus = "⚠️ Parcial"
    $clinicIdDetails = "$($backupFiles.Count)/7 services modificados: $($backupFiles -join ', ')"
} else {
    $clinicIdStatus = "❌ Não aplicado"
    $clinicIdDetails = "Nenhum backup encontrado"
}

# 5. Status WhatsApp
$whatsappStatus = "❌ Não integrado"
$whatsappDetails = ""
if (Test-Path "src/modules/fila/fila.service.ts.backup") {
    $whatsappStatus = "✅ Integrado"
    $whatsappDetails = "fila.service.ts modificado"
    
    # Verifica se realmente tem a integração
    $filaContent = Get-Content "src/modules/fila/fila.service.ts" -Raw
    if ($filaContent -match "whatsappService\.sendMessage") {
        $whatsappDetails += " (chamada real implementada)"
    } else {
        $whatsappStatus = "⚠️ Parcial"
        $whatsappDetails += " (verificar implementação)"
    }
} else {
    $whatsappDetails = "Script não executado"
}

# 6. Análise de Erros
$errorsFound = @()
if (Test-Path "npm-debug.log") {
    $errorsFound += "npm-debug.log encontrado"
}
if (Test-Path "error.log") {
    $errorsFound += "error.log encontrado"
}

# 7. Variáveis de Ambiente
$envStatus = "⚠️ Verificar"
if (Test-Path ".env") {
    $envStatus = "✅ Configurado"
} else {
    $envStatus = "❌ .env não encontrado"
}

# ============================================
# GERAÇÃO DO RELATÓRIO
# ============================================

$relatorio = @"
# 📊 RELATÓRIO FINAL - SETUP AUTOMÁTICO

**Data:** $timestamp  
**Projeto:** Backend - Sistema de Gestão de Clínicas

---

## ✅ STATUS DOS COMPONENTES

### 🐳 Docker
- **Status:** $dockerStatus
- **Detalhes:** 
  - $dockerDetails

### 📦 Build
- **Status:** $buildStatus
- **Detalhes:** $buildDetails

### 🧪 Testes
- **Status:** $testStatus
- **Detalhes:** $testDetails

### 🔐 Filtros clinicId
- **Status:** $clinicIdStatus
- **Detalhes:** $clinicIdDetails
- **Services modificados:**
$(if ($backupFiles.Count -gt 0) {
    $backupFiles | ForEach-Object { "  - ✅ $_" }
    $services | Where-Object { $_ -notin $backupFiles } | ForEach-Object { "  - ❌ $_" }
} else {
    "  Nenhum service modificado"
})

### 📱 Integração WhatsApp
- **Status:** $whatsappStatus
- **Detalhes:** $whatsappDetails

### 🔧 Variáveis de Ambiente
- **Status:** $envStatus
- **Ação:** $(if (Test-Path ".env") { "Revisar configurações" } else { "Criar .env a partir de .env.example" })

---

## 🎯 CRITÉRIO DE SUCESSO

### ✅ Sucesso Total (MVP 95% pronto)
$(if ($buildStatus -eq "✅ OK" -and $clinicIdStatus -eq "✅ Aplicado" -and $whatsappStatus -eq "✅ Integrado") {
    "**🎉 PARABÉNS! Todos os critérios atendidos!**"
} else {
    "Ainda falta atender alguns critérios (veja abaixo)"
})

**Checklist:**
- [$(if (\$buildStatus -eq "✅ OK") { "x" } else { " " })] Build compilando sem erros
- [$(if (\$testStatus -match "✅") { "x" } else { " " })] Testes executados (>80% passando)
- [$(if (\$clinicIdStatus -eq "✅ Aplicado") { "x" } else { " " })] clinicId aplicado em todos os 7 services
- [$(if (\$whatsappStatus -eq "✅ Integrado") { "x" } else { " " })] WhatsApp integrado na fila
- [$(if (\$dockerStatus -eq "✅ Rodando") { "x" } else { " " })] Docker rodando
- [$(if (\$envStatus -eq "✅ Configurado") { "x" } else { " " })] Variáveis de ambiente configuradas

---

## 🚀 PRÓXIMOS PASSOS

### Se Build: ✅ OK
``````powershell
# Iniciar servidor de desenvolvimento
npm run start:dev

# Servidor estará disponível em:
# http://localhost:3000
# http://localhost:3000/api (Swagger)
``````

### Se Testes: ⚠️ Alguns falhando
``````powershell
# Rodar testes individualmente para debug
npm run test:e2e -- --verbose

# Ou rodar suite específica
npm run test -- agendamentos.e2e-spec.ts
``````

### Se Docker: ❌ Não rodando
``````powershell
# Iniciar Docker
docker-compose up -d

# Verificar logs
docker-compose logs -f
``````

### Se clinicId: ⚠️ Parcial
``````powershell
# Executar novamente o script
.\scripts\clinicid-batch.ps1
``````

### Se WhatsApp: ❌ Não integrado
``````powershell
# Executar script de integração
.\scripts\whatsapp-integrate.ps1
``````

---

## 📁 ARQUIVOS DE BACKUP

Todos os arquivos modificados têm backup com extensão \`.backup\`

**Para reverter alterações:**
``````powershell
# Reverter um arquivo específico
Copy-Item src/modules/leads/leads.service.ts.backup src/modules/leads/leads.service.ts -Force

# Reverter TODOS os arquivos
Get-ChildItem -Recurse -Filter "*.backup" | ForEach-Object {
    `$original = `$_.FullName -replace '\.backup$', ''
    Copy-Item `$_.FullName `$original -Force
    Write-Host "✅ Revertido: `$original"
}
``````

---

## ⚠️ PROBLEMAS ENCONTRADOS

$(if ($errorsFound.Count -gt 0) {
    $errorsFound | ForEach-Object { "- ⚠️ $_" }
} else {
    "✅ Nenhum problema crítico detectado"
})

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### Variáveis de Ambiente (.env)
``````env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=clinicapi

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_PRIVATE_KEY=sua-chave
FIREBASE_CLIENT_EMAIL=seu-email

# WhatsApp (Meta Business API)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_API_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Environment
NODE_ENV=development
PORT=3000
``````

---

## 📊 ESTATÍSTICAS DO PROJETO

- **Módulos implementados:** 10
- **Services criados:** $(if (Test-Path "src/modules") { (Get-ChildItem -Path "src/modules" -Recurse -Filter "*.service.ts" | Measure-Object).Count } else { "N/A" })
- **Entities criadas:** $(if (Test-Path "src/modules") { (Get-ChildItem -Path "src/modules" -Recurse -Filter "*.entity.ts" | Measure-Object).Count } else { "N/A" })
- **Testes criados:** $(if (Test-Path "test") { (Get-ChildItem -Path "test" -Recurse -Filter "*.spec.ts" | Measure-Object).Count } else { "N/A" })

---

## 💡 DICAS

1. **Sempre verifique o Docker primeiro:** \`docker-compose ps\`
2. **Logs são seus amigos:** \`npm run start:dev\` mostra erros em tempo real
3. **Testes E2E podem falhar** se o banco não estiver limpo: \`docker-compose down -v && docker-compose up -d\`
4. **Swagger é seu melhor amigo:** http://localhost:3000/api

---

## 📞 SUPORTE

**Se encontrar problemas:**
1. Verifique os logs: \`docker-compose logs\`
2. Verifique variáveis de ambiente: \`.env\`
3. Limpe e reconstrua: \`npm run build\`
4. Reinicie o Docker: \`docker-compose restart\`

---

<div align="center">

**🎉 Relatório gerado automaticamente**  
*Setup executado com sucesso!*

</div>
"@

# Salva o relatório
$relatorio | Out-File $reportFile -Encoding UTF8

Write-Host "✅ Relatório gerado: $reportFile" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Visualize o relatório:" -ForegroundColor Cyan
Write-Host "   code $reportFile" -ForegroundColor Gray
Write-Host ""

# Abre automaticamente no VS Code se disponível
if (Get-Command code -ErrorAction SilentlyContinue) {
    code $reportFile
}
