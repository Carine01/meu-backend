# Script PowerShell para criar milestone + 7 issues automaticamente
# Uso: .\criar-issues-gh.ps1 -DevUsername "Carine01"

param(
    [Parameter(Mandatory=$true)]
    [string]$DevUsername
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Criando Milestone + 7 Issues para MVP - 100%" -ForegroundColor Cyan
Write-Host ""

# 1. Criar Milestone
Write-Host "📅 Criando milestone..." -ForegroundColor Yellow
$dueDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
$milestoneJson = gh api repos/Carine01/meu-backend/milestones `
    -f title="MVP - 100%" `
    -f due_on="$dueDate" `
    -f description="Meta: completar MVP em ~3 dias (26h estimadas)" | ConvertFrom-Json

$milestoneNumber = $milestoneJson.number
Write-Host "✅ Milestone criada: #$milestoneNumber" -ForegroundColor Green
Write-Host ""

# Array de issues
$issues = @(
    @{
        title = "Impl: clinicId filter - mensagens.service"
        body = @"
**Contexto:**
Adicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.

**Tarefas:**
- [ ] Adicionar where clinicId nas queries (2h)
- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)

**Estimativa:** 3h
**Arquivo:** ``src/services/mensagens.service.ts``

**Código de referência:**
``````typescript
async findAllForClinic(clinicId: string) {
  const qb = this.repo.createQueryBuilder('m');
  applyClinicIdFilter(qb, clinicId);
  return qb.orderBy('m.createdAt', 'DESC').getMany();
}
``````
"@
        labels = @("implementation", "priority/high")
        estimate = "3h"
    },
    @{
        title = "Impl: clinicId filter - campanhas.service"
        body = @"
**Contexto:**
Adicionar clinicId filter em campanhas.service.

**Tarefas:**
- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** ``src/services/campanhas.service.ts``
"@
        labels = @("implementation", "priority/high")
        estimate = "2.5h"
    },
    @{
        title = "Impl: clinicId filter - eventos.service"
        body = @"
**Contexto:**
Eventos: filtrar por clinicId.

**Tarefas:**
- [ ] Add clinicId to DTOs & validators (0.5h)
- [ ] Add where clause in eventos.service (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivos:** ``src/services/eventos.service.ts``, ``src/dto/create-evento.dto.ts``
"@
        labels = @("implementation", "priority/high")
        estimate = "2.5h"
    },
    @{
        title = "Impl: clinicId scoping - auth.service"
        body = @"
**Contexto:**
JWT e auth devem carregar/validar clinicId.

**Tarefas:**
- [ ] Incluir clinicId no payload do JWT (1h)
- [ ] Ajustar guards para validar clinicId (1h)
- [ ] Unit tests login (1h)

**Estimativa:** 3h
**Arquivos:** ``src/services/auth.service.ts``, ``src/guards/jwt-auth.guard.ts``
"@
        labels = @("implementation", "priority/high", "security")
        estimate = "3h"
    },
    @{
        title = "Impl: clinicId isolation - bi.service"
        body = @"
**Contexto:**
BI: queries isoladas por clinicId.

**Tarefas:**
- [ ] Parametrizar queries por clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** ``src/services/bi.service.ts``
"@
        labels = @("implementation", "priority/high")
        estimate = "2.5h"
    },
    @{
        title = "Impl: clinicId enforcement - bloqueios.service"
        body = @"
**Contexto:**
Bloqueios aplicados por clinicId.

**Tarefas:**
- [ ] Adicionar clinicId nas regras de criação/consulta (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2h
**Arquivo:** ``src/services/bloqueios.service.ts``
"@
        labels = @("implementation", "priority/high")
        estimate = "2h"
    },
    @{
        title = "Impl: clinicId filter - payments/orders"
        body = @"
**Contexto:**
Transações e pedidos sempre ligados ao clinicId.

**Tarefas:**
- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)
- [ ] Atualizar webhooks para validar clinicId (1h)
- [ ] Unit tests (1h)

**Estimativa:** 3.5h
**Arquivos:** ``src/services/payments.service.ts``, ``src/services/orders.service.ts``
"@
        labels = @("implementation", "priority/high")
        estimate = "3.5h"
    }
)

# Criar issues
$issueNumber = 1
foreach ($issue in $issues) {
    Write-Host "📝 Criando issue $issueNumber/7: $($issue.title)" -ForegroundColor Yellow
    
    $labelsParam = $issue.labels -join ","
    
    gh issue create `
        --title $issue.title `
        --body $issue.body `
        --label $labelsParam `
        --assignee $DevUsername `
        --milestone $milestoneNumber
    
    Write-Host "   ✅ Issue criada - Estimativa: $($issue.estimate)" -ForegroundColor Green
    $issueNumber++
}

Write-Host ""
Write-Host "🎉 CONCLUÍDO!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo:" -ForegroundColor Cyan
Write-Host "   • Milestone: MVP - 100% (#$milestoneNumber)" -ForegroundColor White
Write-Host "   • Issues criadas: 7" -ForegroundColor White
Write-Host "   • Assignee: $DevUsername" -ForegroundColor White
Write-Host "   • Estimativa total: 19h" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Ver no GitHub:" -ForegroundColor Cyan
Write-Host "   https://github.com/Carine01/meu-backend/milestone/$milestoneNumber" -ForegroundColor Blue
Write-Host ""
