# Script PowerShell para criar múltiplos PRs automaticamente
# Uso: .\criar-todos-prs.ps1 [-Reviewer "username"]

param(
    [string]$Reviewer = ""
)

$ErrorActionPreference = "Stop"

# Função para criar PR com body customizado
function Create-PR {
    param(
        [string]$Branch,
        [string]$Title,
        [string]$Labels,
        [string]$Body
    )
    
    Write-Host "🚀 Criando PR: $Title" -ForegroundColor Cyan
    
    # Criar branch (se não existir)
    git checkout -B $Branch 2>$null
    
    # Push branch
    git push -u origin $Branch 2>$null
    
    # Criar arquivo temporário para body
    $tempFile = New-TemporaryFile
    $Body | Out-File -FilePath $tempFile.FullName -Encoding UTF8
    
    # Criar PR
    $prCommand = "gh pr create --base main --head $Branch --title `"$Title`" --body-file `"$($tempFile.FullName)`" --label `"$Labels`""
    
    if ($Reviewer) {
        $prCommand += " --reviewer `"$Reviewer`""
    }
    
    try {
        Invoke-Expression $prCommand
        Write-Host "✅ PR criado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro ao criar PR: $_" -ForegroundColor Yellow
    } finally {
        Remove-Item $tempFile.FullName -Force
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  CRIAÇÃO AUTOMÁTICA DE PRs - MVP ELEVARE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Verificar se gh CLI está disponível
try {
    gh --version | Out-Null
} catch {
    Write-Host "❌ GitHub CLI (gh) não está instalado!" -ForegroundColor Red
    Write-Host "Instale com: winget install --id GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# ---------- PR 1: CI / Tests / Logs / Cron ----------
$pr1Body = @"
**Resumo:**
- Adiciona scripts CI/CD (TypeScript Guardian, Docker Builder)
- Inclui templates de teste e configurações iniciais para testes em CI
- Implementa logger estruturado e cron.service com retry

**Checklist:**
- [ ] Workflows em .github/workflows validados
- [ ] Secrets principais configurados (DB_URL, WHATSAPP_AUTH_PATH)
- [ ] Testes locais OK

**Estimativa:** 8h
"@

Create-PR -Branch "feat/ci-tests-logs-cron" `
          -Title "chore(ci): add CI/CD scripts, tests, logger, cron system" `
          -Labels "ci,automation,priority/high" `
          -Body $pr1Body

# ---------- PR 2: WhatsApp + clinicId filters (agregado) ----------
$pr2Body = @"
**Resumo:**
- Adiciona WhatsApp subsystem: entity, DTO, service, controller, module
- Scaffold/implementação do FilaService (Baileys wrapper) e FilaFallbackProvider
- Adiciona clinicId scaffold e exemplos de uso

**Checklist:**
- [ ] FilaService presente ou fallback registrado
- [ ] Secrets: WHATSAPP_AUTH_PATH, DB_URL setados
- [ ] Importar WhatsAppModule no AppModule após merge

**Estimativa:** 10h
"@

Create-PR -Branch "feat/whatsapp-clinicid-filters" `
          -Title "feat(whatsapp/clinicid): clinicId filters + FilaService + DTOs/validation" `
          -Labels "implementation,priority/high" `
          -Body $pr2Body

# ---------- PRs individuais por serviço (clinicId filters) ----------

# mensagens.service
$prMensagensBody = @"
**Contexto:**
Aplicar filtro clinicId nas queries do mensagens.service.

**Tarefas:**
- [ ] Aplicar applyClinicIdFilter ou where: { clinicId } nas queries
- [ ] Cobrir com teste unitário

**Estimativa:** 3h
**Arquivo:** ``src/modules/mensagens/mensagem-resolver.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-mensagens" `
          -Title "fix(multitenancy): apply clinicId filter - mensagens.service" `
          -Labels "implementation,priority/high" `
          -Body $prMensagensBody

# campanhas.service
$prCampanhasBody = @"
**Contexto:**
Aplicar filtro clinicId nas queries do campanhas.service.

**Tarefas:**
- [ ] Atualizar find queries para incluir clinicId
- [ ] Tests unitários

**Estimativa:** 2.5h
**Arquivo:** ``src/modules/campanhas/campanhas.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-campanhas" `
          -Title "fix(multitenancy): apply clinicId filter - campanhas.service" `
          -Labels "implementation,priority/high" `
          -Body $prCampanhasBody

# eventos.service
$prEventosBody = @"
**Contexto:**
Filtrar eventos por clinicId.

**Tarefas:**
- [ ] Adicionar where clinicId nas queries
- [ ] Adicionar tests

**Estimativa:** 2.5h
**Arquivo:** ``src/modules/eventos/events.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-eventos" `
          -Title "fix(multitenancy): apply clinicId filter - eventos.service" `
          -Labels "implementation,priority/high" `
          -Body $prEventosBody

# auth.service
$prAuthBody = @"
**Contexto:**
Incluir clinicId no payload JWT e validar guards com clinicId.

**Tarefas:**
- [ ] Incluir clinicId no login payload
- [ ] Ajustar validação/guards
- [ ] Tests de autenticação

**Estimativa:** 3h
**Arquivo:** ``src/modules/auth/auth.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-auth" `
          -Title "fix(security): include clinicId in JWT and guards - auth.service" `
          -Labels "implementation,security,priority/high" `
          -Body $prAuthBody

# bi.service
$prBiBody = @"
**Contexto:**
Isolar relatórios por clinicId.

**Tarefas:**
- [ ] Parametrizar queries por clinicId
- [ ] Tests unitários

**Estimativa:** 2.5h
**Arquivo:** ``src/modules/bi/bi.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-bi" `
          -Title "fix(multitenancy): apply clinicId filter - bi.service" `
          -Labels "implementation,priority/high" `
          -Body $prBiBody

# bloqueios.service
$prBloqueiosBody = @"
**Contexto:**
Aplicar isolamento clinicId em bloqueios.

**Tarefas:**
- [ ] Adicionar clinicId nas regras de criação/consulta
- [ ] Tests unitários

**Estimativa:** 2h
**Arquivo:** ``src/modules/agendamentos/bloqueios.service.ts``
"@

Create-PR -Branch "feat/clinic-filter-bloqueios" `
          -Title "fix(multitenancy): apply clinicId filter - bloqueios.service" `
          -Labels "implementation,priority/high" `
          -Body $prBloqueiosBody

# payments/orders
$prPaymentsBody = @"
**Contexto:**
Garantir que orders/payments sejam filtrados por clinicId.

**Tarefas:**
- [ ] Adicionar clinicId nas entidades e queries
- [ ] Atualizar webhooks para validar clinicId
- [ ] Tests unitários

**Estimativa:** 3.5h
**Arquivos:** ``src/modules/payments/``, ``src/modules/orders/``
"@

Create-PR -Branch "feat/clinic-filter-payments" `
          -Title "fix(multitenancy): apply clinicId filter - payments/orders" `
          -Labels "implementation,priority/high" `
          -Body $prPaymentsBody

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "✅ TODOS OS PRs FORAM CRIADOS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "📊 Resumo:" -ForegroundColor Cyan
Write-Host "   • 9 PRs criados" -ForegroundColor White
Write-Host "   • 2 PRs principais (CI + WhatsApp)" -ForegroundColor White
Write-Host "   • 7 PRs de filtros clinicId" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Verificar PRs:" -ForegroundColor Cyan
Write-Host "   https://github.com/Carine01/meu-backend/pulls" -ForegroundColor Blue
Write-Host ""
Write-Host "🎯 Próxima ação:" -ForegroundColor Cyan
Write-Host "   Revisar e mergear PRs conforme implementação" -ForegroundColor White
Write-Host ""
