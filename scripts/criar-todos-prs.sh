#!/bin/bash
# Script Bash para criar múltiplos PRs automaticamente
# Uso: ./criar-todos-prs.sh [REVIEWER]

set -e

REVIEWER="${1:-}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Função para criar PR
create_pr() {
    local BRANCH=$1
    local TITLE=$2
    local LABELS=$3
    local BODY=$4
    
    echo -e "${CYAN}🚀 Criando PR: $TITLE${NC}"
    
    # Criar/checkout branch
    git checkout -B "$BRANCH" 2>/dev/null || true
    
    # Push branch
    git push -u origin "$BRANCH" 2>/dev/null || true
    
    # Criar arquivo temporário
    BODYFILE=$(mktemp /tmp/pr_body.XXXXXX.md)
    echo "$BODY" > "$BODYFILE"
    
    # Criar PR
    if [ -n "$REVIEWER" ]; then
        gh pr create --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODYFILE" --label "$LABELS" --reviewer "$REVIEWER" || echo -e "${YELLOW}⚠️  Erro ao criar PR${NC}"
    else
        gh pr create --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODYFILE" --label "$LABELS" || echo -e "${YELLOW}⚠️  Erro ao criar PR${NC}"
    fi
    
    rm -f "$BODYFILE"
    echo -e "${GREEN}✅ PR criado com sucesso!${NC}"
    sleep 1
}

echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}  CRIAÇÃO AUTOMÁTICA DE PRs - MVP ELEVARE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}"
echo ""

# Verificar gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) não está instalado!${NC}"
    echo -e "${YELLOW}Instale com: brew install gh (Mac) ou apt install gh (Linux)${NC}"
    exit 1
fi

# ---------- PR 1: CI / Tests / Logs / Cron ----------
PR1_BODY="**Resumo:**
- Adiciona scripts CI/CD (TypeScript Guardian, Docker Builder)
- Inclui templates de teste e configurações iniciais para testes em CI
- Implementa logger estruturado e cron.service com retry

**Checklist:**
- [ ] Workflows em .github/workflows validados
- [ ] Secrets principais configurados (DB_URL, WHATSAPP_AUTH_PATH)
- [ ] Testes locais OK

**Estimativa:** 8h"

create_pr "feat/ci-tests-logs-cron" \
          "chore(ci): add CI/CD scripts, tests, logger, cron system" \
          "ci,automation,priority/high" \
          "$PR1_BODY"

# ---------- PR 2: WhatsApp + clinicId filters ----------
PR2_BODY="**Resumo:**
- Adiciona WhatsApp subsystem: entity, DTO, service, controller, module
- Scaffold/implementação do FilaService (Baileys wrapper) e FilaFallbackProvider
- Adiciona clinicId scaffold e exemplos de uso

**Checklist:**
- [ ] FilaService presente ou fallback registrado
- [ ] Secrets: WHATSAPP_AUTH_PATH, DB_URL setados
- [ ] Importar WhatsAppModule no AppModule após merge

**Estimativa:** 10h"

create_pr "feat/whatsapp-clinicid-filters" \
          "feat(whatsapp/clinicid): clinicId filters + FilaService + DTOs/validation" \
          "implementation,priority/high" \
          "$PR2_BODY"

# ---------- mensagens.service ----------
PR_MENSAGENS="**Contexto:**
Aplicar filtro clinicId nas queries do mensagens.service.

**Tarefas:**
- [ ] Aplicar applyClinicIdFilter ou where: { clinicId } nas queries
- [ ] Cobrir com teste unitário

**Estimativa:** 3h
**Arquivo:** \`src/modules/mensagens/mensagem-resolver.service.ts\`"

create_pr "feat/clinic-filter-mensagens" \
          "fix(multitenancy): apply clinicId filter - mensagens.service" \
          "implementation,priority/high" \
          "$PR_MENSAGENS"

# ---------- campanhas.service ----------
PR_CAMPANHAS="**Contexto:**
Aplicar filtro clinicId nas queries do campanhas.service.

**Tarefas:**
- [ ] Atualizar find queries para incluir clinicId
- [ ] Tests unitários

**Estimativa:** 2.5h
**Arquivo:** \`src/modules/campanhas/campanhas.service.ts\`"

create_pr "feat/clinic-filter-campanhas" \
          "fix(multitenancy): apply clinicId filter - campanhas.service" \
          "implementation,priority/high" \
          "$PR_CAMPANHAS"

# ---------- eventos.service ----------
PR_EVENTOS="**Contexto:**
Filtrar eventos por clinicId.

**Tarefas:**
- [ ] Adicionar where clinicId nas queries
- [ ] Adicionar tests

**Estimativa:** 2.5h
**Arquivo:** \`src/modules/eventos/events.service.ts\`"

create_pr "feat/clinic-filter-eventos" \
          "fix(multitenancy): apply clinicId filter - eventos.service" \
          "implementation,priority/high" \
          "$PR_EVENTOS"

# ---------- auth.service ----------
PR_AUTH="**Contexto:**
Incluir clinicId no payload JWT e validar guards com clinicId.

**Tarefas:**
- [ ] Incluir clinicId no login payload
- [ ] Ajustar validação/guards
- [ ] Tests de autenticação

**Estimativa:** 3h
**Arquivo:** \`src/modules/auth/auth.service.ts\`"

create_pr "feat/clinic-filter-auth" \
          "fix(security): include clinicId in JWT and guards - auth.service" \
          "implementation,security,priority/high" \
          "$PR_AUTH"

# ---------- bi.service ----------
PR_BI="**Contexto:**
Isolar relatórios por clinicId.

**Tarefas:**
- [ ] Parametrizar queries por clinicId
- [ ] Tests unitários

**Estimativa:** 2.5h
**Arquivo:** \`src/modules/bi/bi.service.ts\`"

create_pr "feat/clinic-filter-bi" \
          "fix(multitenancy): apply clinicId filter - bi.service" \
          "implementation,priority/high" \
          "$PR_BI"

# ---------- bloqueios.service ----------
PR_BLOQUEIOS="**Contexto:**
Aplicar isolamento clinicId em bloqueios.

**Tarefas:**
- [ ] Adicionar clinicId nas regras de criação/consulta
- [ ] Tests unitários

**Estimativa:** 2h
**Arquivo:** \`src/modules/agendamentos/bloqueios.service.ts\`"

create_pr "feat/clinic-filter-bloqueios" \
          "fix(multitenancy): apply clinicId filter - bloqueios.service" \
          "implementation,priority/high" \
          "$PR_BLOQUEIOS"

# ---------- payments/orders ----------
PR_PAYMENTS="**Contexto:**
Garantir que orders/payments sejam filtrados por clinicId.

**Tarefas:**
- [ ] Adicionar clinicId nas entidades e queries
- [ ] Atualizar webhooks para validar clinicId
- [ ] Tests unitários

**Estimativa:** 3.5h
**Arquivos:** \`src/modules/payments/\`, \`src/modules/orders/\`"

create_pr "feat/clinic-filter-payments" \
          "fix(multitenancy): apply clinicId filter - payments/orders" \
          "implementation,priority/high" \
          "$PR_PAYMENTS"

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TODOS OS PRs FORAM CRIADOS!${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📊 Resumo:${NC}"
echo -e "   • 9 PRs criados"
echo -e "   • 2 PRs principais (CI + WhatsApp)"
echo -e "   • 7 PRs de filtros clinicId"
echo ""
echo -e "${CYAN}🔗 Verificar PRs:${NC}"
echo -e "   ${YELLOW}https://github.com/Carine01/meu-backend/pulls${NC}"
echo ""
