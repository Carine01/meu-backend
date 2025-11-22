# Script PowerShell para criar milestone + 7 issues automaticamente
# Uso: .\criar-issues-gh.ps1 -DevUsername "Carine01"

param(
    [Parameter(Mandatory=$true)]
    [string]$DevUsername
)

$ErrorActionPreference = "Stop"

Write-Host "Criando Milestone + 7 Issues para MVP - 100%" -ForegroundColor Cyan
Write-Host ""

# 1. Criar Milestone
Write-Host "Criando milestone..." -ForegroundColor Yellow
$dueDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
$milestoneJson = gh api repos/Carine01/meu-backend/milestones -f title="MVP - 100%" -f due_on="$dueDate" -f description="Meta: completar MVP em ~3 dias (26h estimadas)" | ConvertFrom-Json

$milestoneNumber = $milestoneJson.number
Write-Host "Milestone criada: #$milestoneNumber" -ForegroundColor Green
Write-Host ""

# Array de issues
$issues = @(
    @{
        title = "Impl: clinicId filter - mensagens.service"
        body = "**Contexto:**`nAdicionar validacao/filtragem clinicId em mensagens.service para garantir multitenancy.`n`n**Tarefas:**`n- [ ] Adicionar where clinicId nas queries (2h)`n- [ ] Cobrir com unit tests (1h)`n`n**Estimativa:** 3h"
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - campanhas.service"
        body = "**Contexto:**`nAdicionar clinicId filter em campanhas.service.`n`n**Tarefas:**`n- [ ] Atualizar repositorio TypeORM com where clinicId (1.5h)`n- [ ] Unit tests (1h)`n`n**Estimativa:** 2.5h"
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - eventos.service"
        body = "**Contexto:**`nEventos: filtrar por clinicId.`n`n**Tarefas:**`n- [ ] Add clinicId to DTOs (0.5h)`n- [ ] Add where clause in eventos.service (1h)`n- [ ] Unit tests (1h)`n`n**Estimativa:** 2.5h"
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId scoping - auth.service"
        body = "**Contexto:**`nJWT e auth devem carregar/validar clinicId.`n`n**Tarefas:**`n- [ ] Incluir clinicId no payload do JWT (1h)`n- [ ] Ajustar guards para validar clinicId (1h)`n- [ ] Unit tests login (1h)`n`n**Estimativa:** 3h"
        labels = "implementation,priority/high,security"
    },
    @{
        title = "Impl: clinicId isolation - bi.service"
        body = "**Contexto:**`nBI: queries isoladas por clinicId.`n`n**Tarefas:**`n- [ ] Parametrizar queries por clinicId (1.5h)`n- [ ] Unit tests (1h)`n`n**Estimativa:** 2.5h"
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId enforcement - bloqueios.service"
        body = "**Contexto:**`nBloqueios aplicados por clinicId.`n`n**Tarefas:**`n- [ ] Adicionar clinicId nas regras de criacao/consulta (1h)`n- [ ] Unit tests (1h)`n`n**Estimativa:** 2h"
        labels = "implementation,priority/high"
    },
    @{
        title = "Impl: clinicId filter - payments/orders"
        body = "**Contexto:**`nTransacoes e pedidos sempre ligados ao clinicId.`n`n**Tarefas:**`n- [ ] Adicionar clinicId em Order/Payment dtos (1.5h)`n- [ ] Atualizar webhooks para validar clinicId (1h)`n- [ ] Unit tests (1h)`n`n**Estimativa:** 3.5h"
        labels = "implementation,priority/high"
    }
)

# Criar issues
$issueNumber = 1
foreach ($issue in $issues) {
    Write-Host "Criando issue $issueNumber/7: $($issue.title)" -ForegroundColor Yellow
    
    gh issue create --title $issue.title --body $issue.body --label $issue.labels --assignee $DevUsername --milestone $milestoneNumber
    
    Write-Host "  Issue criada!" -ForegroundColor Green
    $issueNumber++
}

Write-Host ""
Write-Host "CONCLUIDO!" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  Milestone: MVP - 100% (#$milestoneNumber)"
Write-Host "  Issues criadas: 7"
Write-Host "  Assignee: $DevUsername"
Write-Host "  Estimativa total: 19h"
Write-Host ""
Write-Host "Ver no GitHub: https://github.com/Carine01/meu-backend/milestone/$milestoneNumber"
Write-Host ""
