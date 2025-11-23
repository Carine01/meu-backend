#!/bin/bash
# =============================================================================
# auto-comment-and-assign.sh
# Agent automation script to add standard PR comment with checklist and assign reviewers
# =============================================================================
# Usage: ./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER> [REVIEWERS]
# Example: ./scripts/agent/auto-comment-and-assign.sh 42 "devuser1,devuser2"
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if PR number is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: PR number is required${NC}"
    echo "Usage: $0 <PR_NUMBER> [REVIEWERS]"
    echo "Example: $0 42 devuser1,devuser2"
    exit 1
fi

PR_NUMBER="$1"
REVIEWERS="${2:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🤖 Agent: Auto-Comment and Assign${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "PR Number: ${GREEN}#${PR_NUMBER}${NC}"
echo ""

# QA Checklist template
QA_CHECKLIST=$(cat <<'EOF'
## 🤖 Automação: Checks Iniciados

A automação disparou os checks obrigatórios para este PR.

### 📋 QA Checklist (automated)

- [ ] **TypeScript Guardian** → Build + Tests passando
- [ ] **Docker Builder** → Imagem construída e smoke test OK
- [ ] **Quality Gate** → Sem console.log em arquivos alterados
- [ ] **register-fallback** → Aplicado (verificar mudanças no módulo)
- [ ] **Unit Tests** → Todos passando (coverage >= required)
- [ ] **Secrets Configured** → WHATSAPP_AUTH_PATH, DB_URL
- [ ] **Review Humano** → Aprovado por pelo menos 1 reviewer

### 🔍 Pontos de Atenção

- Revisar implementação de filtros `clinicId` em FilaService
- Verificar integração com WhatsApp
- Validar tratamento de erros e fallbacks
- Confirmar que não há vazamento de dados entre clínicas

### ⚠️ Regras de Merge

**Este PR só pode ser merged quando:**
1. ✅ Todos os checks obrigatórios passarem (status: success)
2. ✅ Pelo menos 1 review humano aprovado
3. ✅ Branch protection rules respeitadas

### 🚀 Próximos Passos

1. Aguardar conclusão dos workflows
2. Revisor: Avaliar código com foco em segurança e clinicId
3. Se aprovado: Agent executará merge automático (se configurado) ou aguardar merge manual

---

*Automação gerada em: $(date -u '+%Y-%m-%d %H:%M:%S UTC')*
EOF
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Adding PR Comment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}📝 Posting QA checklist comment...${NC}"
if echo "$QA_CHECKLIST" | gh pr comment "$PR_NUMBER" --body-file -; then
    echo -e "${GREEN}✅ Comment posted successfully${NC}"
else
    echo -e "${RED}❌ Failed to post comment${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Adding Labels${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}🏷️  Adding labels...${NC}"
gh pr edit "$PR_NUMBER" --add-label "implementation" 2>/dev/null && echo -e "${GREEN}✅ Added label: implementation${NC}" || echo -e "${YELLOW}⚠️  Label 'implementation' may not exist${NC}"
gh pr edit "$PR_NUMBER" --add-label "priority/high" 2>/dev/null && echo -e "${GREEN}✅ Added label: priority/high${NC}" || echo -e "${YELLOW}⚠️  Label 'priority/high' may not exist${NC}"
gh pr edit "$PR_NUMBER" --add-label "automated" 2>/dev/null && echo -e "${GREEN}✅ Added label: automated${NC}" || echo -e "${YELLOW}⚠️  Label 'automated' may not exist${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Assigning Reviewers${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Assign repository owner as default
echo -e "${YELLOW}👤 Assigning repository owner (Carine01)...${NC}"
if gh pr edit "$PR_NUMBER" --add-assignee "Carine01" 2>/dev/null; then
    echo -e "${GREEN}✅ Assigned to: Carine01${NC}"
else
    echo -e "${YELLOW}⚠️  Could not assign to Carine01${NC}"
fi
echo ""

# Add reviewers if provided
if [ -n "$REVIEWERS" ]; then
    echo -e "${YELLOW}👥 Adding reviewers: ${REVIEWERS}${NC}"
    if gh pr edit "$PR_NUMBER" --add-reviewer "$REVIEWERS" 2>/dev/null; then
        echo -e "${GREEN}✅ Reviewers added: ${REVIEWERS}${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not add some reviewers (check if usernames exist)${NC}"
    fi
else
    echo -e "${YELLOW}💡 No reviewers specified. Assigning repository owner as reviewer...${NC}"
    gh pr edit "$PR_NUMBER" --add-reviewer "Carine01" 2>/dev/null && echo -e "${GREEN}✅ Reviewer added: Carine01${NC}" || echo -e "${YELLOW}⚠️  Could not add reviewer${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 4: PR Status Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}📊 Current PR status:${NC}"
gh pr view "$PR_NUMBER" --json number,title,state,author,assignees,labels,reviewRequests | jq '.' || {
    echo "Running basic view..."
    gh pr view "$PR_NUMBER"
}
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ PR Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Useful commands:${NC}"
echo "  # View PR details"
echo "  gh pr view $PR_NUMBER"
echo ""
echo "  # Check workflow status"
echo "  gh pr checks $PR_NUMBER"
echo ""
echo "  # View PR in browser"
echo "  gh pr view $PR_NUMBER --web"
echo ""
echo "  # Monitor reviews"
echo "  gh pr reviews $PR_NUMBER"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Wait for all checks to complete"
echo "  2. Reviewer should approve the PR"
echo "  3. Run auto-merge-if-ready.sh to merge when ready"
echo ""
