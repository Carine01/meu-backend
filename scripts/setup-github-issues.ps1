# setup-github-issues.ps1
# Script PowerShell para criar labels, milestone e issues automaticamente

$ErrorActionPreference = "Continue"

Write-Host "🚀 Setup GitHub Issues - Backend Elevare" -ForegroundColor Cyan
Write-Host ""

# Variáveis (CONFIGURE AQUI)
$DEV_USERNAME = "Carine01"  # ⚠️ ALTERE para seu GitHub username
$MILESTONE_DAYS = 3

Write-Host "📋 Configuração:" -ForegroundColor Yellow
Write-Host "   Dev: $DEV_USERNAME"
Write-Host "   Milestone: $MILESTONE_DAYS dias"
Write-Host ""

# 1. Criar Labels
Write-Host "1️⃣ Criando labels..." -ForegroundColor Cyan
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
Write-Host ""

# 2. Criar Milestone
Write-Host "2️⃣ Criando milestone..." -ForegroundColor Cyan
$dueDate = (Get-Date).AddDays($MILESTONE_DAYS).ToString("yyyy-MM-dd")
$milestoneOutput = gh milestone create "MVP - 100%" --due-date $dueDate --description "Meta: completar MVP em ~3 dias (26h)" 2>&1

if ($milestoneOutput -match '\d+') {
    $MILESTONE_NUMBER = [regex]::Match($milestoneOutput, '\d+').Value
    Write-Host "✅ Milestone criado: #$MILESTONE_NUMBER" -ForegroundColor Green
} else {
    Write-Host "⚠️ Não foi possível criar milestone (pode já existir)" -ForegroundColor Yellow
    Write-Host "   Listando milestones existentes:"
    gh milestone list
    $MILESTONE_NUMBER = Read-Host "   Digite o número do milestone a usar"
}
Write-Host ""

# 3. Criar Issues
Write-Host "3️⃣ Criando 7 issues..." -ForegroundColor Cyan

$issues = @(
    @{
        title = "Impl: clinicId filter - mensagens.service"
        body = @"
Contexto:
Adicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.

Tarefas:
- [ ] Adicionar guard/where clause para clinicId nas queries (2h)
- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)
- [ ] E2E quick-check (mock WhatsApp) (1h)

Estimativa: 4h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - campanhas.service"
        body = @"
Contexto:
Adicionar clinicId filter em campanhas.service para evitar vazamento de dados entre clínicas.

Tarefas:
- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)
- [ ] Unit tests (1h)
- [ ] Validar integração com scheduler/campanhas (1h)

Estimativa: 3.5h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - eventos.service"
        body = @"
Contexto:
Eventos devem ser sempre filtrados por clinicId.

Tarefas:
- [ ] Add clinicId to DTOs & validators (0.5h)
- [ ] Add where clause in eventos.service (1h)
- [ ] Unit tests + mock repository (1h)

Estimativa: 2.5h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId scoping - auth.service"
        body = @"
Contexto:
As credenciais/refresh tokens devem estar associadas ao clinicId; login deve validar escopo.

Tarefas:
- [ ] Adicionar clinicId ao payload do JWT e validar (1h)
- [ ] Ajustar guards/policies para checar clinicId (1h)
- [ ] Unit tests para fluxo de login (1h)

Estimativa: 3h
Labels: implementation, priority/high, security
"@
        labels = "implementation,priority/high,security"
    },
    @{
        title = "Impl: clinicId isolation - bi.service (reports/metrics)"
        body = @"
Contexto:
BI deve agregar métricas por clinicId; queries precisam receber filtro explícito.

Tarefas:
- [ ] Parametrizar queries por clinicId (1.5h)
- [ ] Adicionar unit tests que confirmem isolamento (1h)
- [ ] Smoke tests em staging (0.5h)

Estimativa: 3h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId enforcement - bloqueios.service"
        body = @"
Contexto:
Bloqueios devem ser aplicados por clinicId; evitar aplicação global indevida.

Tarefas:
- [ ] Adicionar clinicId nas regras de criação/consulta (1h)
- [ ] Unit tests (1h)

Estimativa: 2h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - pagamentos/pedidos (payments/orders service)"
        body = @"
Contexto:
Garantir que transações e pedidos estejam sempre ligadas ao clinicId e que gateway não cruze dados.

Tarefas:
- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)
- [ ] Atualizar webhooks para validar clinicId (1h)
- [ ] Unit tests + integration smoke (1.5h)

Estimativa: 4h
Labels: implementation, priority/high
"@
        labels = "implementation,priority/high"
    }
)

$issueCount = 1
foreach ($issue in $issues) {
    try {
        gh issue create --title $issue.title --body $issue.body --label $issue.labels --assignee $DEV_USERNAME --milestone $MILESTONE_NUMBER
        Write-Host "  ✅ Issue #$issueCount criada: $($issue.title)" -ForegroundColor Green
        $issueCount++
    } catch {
        Write-Host "  ❌ Erro ao criar issue: $($issue.title)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Setup completo!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo:" -ForegroundColor Yellow
Write-Host "   - 5 labels criadas"
Write-Host "   - 1 milestone criado (#$MILESTONE_NUMBER)"
Write-Host "   - 7 issues criadas"
Write-Host ""
Write-Host "🔍 Ver issues:" -ForegroundColor Cyan
Write-Host "   gh issue list --milestone `"MVP - 100%`""
Write-Host ""
