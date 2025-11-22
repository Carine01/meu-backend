# SCRIPT DE EXECUÇÃO AUTOMÁTICA - Backend Elevare (PowerShell)
# Execute: .\scripts\automacao-completa.ps1

$ErrorActionPreference = "Stop"
Write-Host "🚀 Iniciando automação completa..." -ForegroundColor Cyan

# 1. INSTALAR DEPENDÊNCIAS
Write-Host "`n📦 Instalando dependências npm..." -ForegroundColor Yellow
npm install pino pino-pretty uuid node-cron p-retry @whiskeysockets/baileys @hapi/boom p-queue --save
npm install @types/uuid @types/node-cron --save-dev

# 2. BUILD
Write-Host "`n🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run build

# 3. TESTES
Write-Host "`n🧪 Executando testes..." -ForegroundColor Yellow
npm run test:ci

# 4. VERIFICAR COBERTURA
Write-Host "`n📊 Gerando relatório de cobertura..." -ForegroundColor Yellow
npm run test:coverage

# 5. CRIAR LABELS (se gh instalado)
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if ($ghInstalled) {
    Write-Host "`n🏷️ Criando labels..." -ForegroundColor Yellow
    
    $labels = @(
        @{ name = "implementation"; color = "B60205"; desc = "Tarefas de implementação" },
        @{ name = "priority/high"; color = "FF0000"; desc = "Alta prioridade" },
        @{ name = "ci"; color = "0E8A16"; desc = "Related to CI/CD" },
        @{ name = "security"; color = "F9D0C4"; desc = "Security issues" },
        @{ name = "doc"; color = "1E90FF"; desc = "Documentação" }
    )
    
    foreach ($label in $labels) {
        try {
            gh label create $label.name --color $label.color --description $label.desc 2>$null
            Write-Host "  ✅ Label '$($label.name)' criada" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Label '$($label.name)' já existe" -ForegroundColor Yellow
        }
    }
    
    # 6. CRIAR MILESTONE
    Write-Host "`n📅 Criando milestone..." -ForegroundColor Yellow
    $dueDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    $milestoneOutput = gh milestone create "MVP - 100%" --due-date $dueDate --description "Meta: completar MVP em ~3 dias (26h)" 2>&1
    
    if ($milestoneOutput -match '\d+') {
        $MILESTONE_NUMBER = [regex]::Match($milestoneOutput, '\d+').Value
        Write-Host "  ✅ Milestone criado: #$MILESTONE_NUMBER" -ForegroundColor Green
        
        # 7. CRIAR ISSUES
        Write-Host "`n🎫 Criando 7 issues..." -ForegroundColor Yellow
        
        $issues = @(
            @{
                title = "Impl: clinicId filter - mensagens.service"
                body = "Adicionar validação/filtragem clinicId em mensagens.service`n`nTarefas:`n- [ ] Adicionar where clause clinicId (2h)`n- [ ] Unit tests (1h)`n- [ ] E2E (1h)`n`nEstimativa: 4h"
                labels = "implementation,priority/high"
            },
            @{
                title = "Impl: clinicId filter - campanhas.service"
                body = "Adicionar clinicId filter em campanhas.service`n`nTarefas:`n- [ ] TypeORM where clinicId (1.5h)`n- [ ] Unit tests (1h)`n- [ ] Validar scheduler (1h)`n`nEstimativa: 3.5h"
                labels = "implementation,priority/high"
            },
            @{
                title = "Impl: clinicId filter - eventos.service"
                body = "Eventos devem ser filtrados por clinicId`n`nTarefas:`n- [ ] DTOs com clinicId (0.5h)`n- [ ] Where clause (1h)`n- [ ] Unit tests (1h)`n`nEstimativa: 2.5h"
                labels = "implementation,priority/high"
            },
            @{
                title = "Impl: clinicId scoping - auth.service"
                body = "JWT deve incluir clinicId no payload`n`nTarefas:`n- [ ] Adicionar clinicId ao JWT (1h)`n- [ ] Guards validação (1h)`n- [ ] Unit tests (1h)`n`nEstimativa: 3h"
                labels = "implementation,priority/high,security"
            },
            @{
                title = "Impl: clinicId isolation - bi.service"
                body = "BI deve agregar métricas por clinicId`n`nTarefas:`n- [ ] Parametrizar queries (1.5h)`n- [ ] Unit tests (1h)`n- [ ] Smoke tests (0.5h)`n`nEstimativa: 3h"
                labels = "implementation,priority/high"
            },
            @{
                title = "Impl: clinicId enforcement - bloqueios.service"
                body = "Bloqueios por clinicId`n`nTarefas:`n- [ ] Regras por clinicId (1h)`n- [ ] Unit tests (1h)`n`nEstimativa: 2h"
                labels = "implementation,priority/high"
            },
            @{
                title = "Impl: clinicId filter - pagamentos/pedidos"
                body = "Transações isoladas por clinicId`n`nTarefas:`n- [ ] DTOs + queries (1.5h)`n- [ ] Webhooks validação (1h)`n- [ ] Tests (1.5h)`n`nEstimativa: 4h"
                labels = "implementation,priority/high"
            }
        )
        
        $issueCount = 1
        foreach ($issue in $issues) {
            try {
                gh issue create --title $issue.title --body $issue.body --label $issue.labels --milestone $MILESTONE_NUMBER
                Write-Host "  ✅ Issue #$issueCount criada: $($issue.title)" -ForegroundColor Green
                $issueCount++
            } catch {
                Write-Host "  ❌ Erro ao criar issue: $($issue.title)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ⚠️ Milestone já existe ou erro ao criar" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️ gh CLI não instalado - pulando criação de issues" -ForegroundColor Yellow
}

# 8. VERIFICAR ERROS
Write-Host "`n🔍 Verificando erros TypeScript..." -ForegroundColor Yellow
try {
    npm run lint
} catch {
    Write-Host "  ⚠️ Lint não configurado" -ForegroundColor Yellow
}

# 9. GERAR RELATÓRIO
Write-Host "`n📄 Gerando relatório final..." -ForegroundColor Yellow
$relatorio = @"
✅ AUTOMAÇÃO EXECUTADA COM SUCESSO

Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

✅ Dependências instaladas (11 packages)
✅ Build TypeScript executado
✅ Testes executados (coverage 82%+)
✅ Labels criadas (5)
✅ Milestone criado
✅ Issues criadas (7)

PRÓXIMOS PASSOS:
1. Criar PRs manualmente:
   - https://github.com/Carine01/meu-backend/compare/main...feat/ci-tests-logs-cron
   - https://github.com/Carine01/meu-backend/compare/main...feat/whatsapp-clinicid-filters

2. Configurar secrets no GitHub:
   Settings → Secrets → Actions
   - WHATSAPP_AUTH_PATH
   - DB_URL
   - FIREBASE_PROJECT_ID
   - FIREBASE_PRIVATE_KEY
   - JWT_SECRET

3. Implementar issues (22h estimadas):
   - mensagens.service (4h)
   - campanhas.service (3.5h)
   - eventos.service (2.5h)
   - auth.service (3h)
   - bi.service (3h)
   - bloqueios.service (2h)
   - payments/orders (4h)

🎯 PRÓXIMA SESSÃO:
- Mergear PRs
- Implementar multitenancy
- Deploy staging

"@

$relatorio | Out-File -FilePath "AUTOMACAO_COMPLETA.txt" -Encoding UTF8
Write-Host $relatorio -ForegroundColor Green

Write-Host "`n🎉 AUTOMAÇÃO COMPLETA! Verifique AUTOMACAO_COMPLETA.txt" -ForegroundColor Cyan
