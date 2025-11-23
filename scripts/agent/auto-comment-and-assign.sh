#!/bin/bash
# auto-comment-and-assign.sh - Add standard QA checklist comment and assign reviewers
# Usage: ./auto-comment-and-assign.sh <PR_NUMBER> [REVIEWER_LIST]
#
# This script is designed to be executed by GitHub agents/bots to add
# standardized review comments and assign reviewers to PRs.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PR_NUMBER="${1:-}"
REVIEWERS="${2:-Carine01}"  # Default reviewer
DEFAULT_LABELS=("implementation" "priority/high")
DEFAULT_ASSIGNEE="Carine01"

# QA Checklist template
read -r -d '' QA_CHECKLIST <<'EOF' || true
## 🤖 Automação: Iniciando Checks Automáticos

### ✅ QA Checklist (automated)

**Checks Obrigatórios:**
- [ ] **TypeScript Guardian** → Build + Tests Pass
- [ ] **register-fallback** → AST Script Applied (verify module changes)
- [ ] **Docker Builder** → Image built & smoke test OK
- [ ] **Unit tests** → All pass (coverage >= required)
- [ ] **Quality Gate** → No console.log in changed files
- [ ] **Secrets** → WHATSAPP_AUTH_PATH, DB_URL configured

**Validações de Segurança:**
- [ ] **clinicId filters** → All queries properly scoped
- [ ] **No sensitive data** → Check for hardcoded credentials
- [ ] **SQL injection** → Parameterized queries used

**Review Humano:**
- [ ] **Code review** → 1 approval required
- [ ] **Architecture** → Changes follow best practices
- [ ] **Documentation** → Updated if needed

---

### 📋 Foco da Revisão

**Áreas Críticas:**
- FilaService com filtros de clinicId
- WhatsApp integration endpoints
- Database queries com multitenancy

**Observações:**
- Este PR não deve ser merged sem aprovação humana
- Todos os checks automáticos devem passar
- Branch protection rules estão ativas

---

### 🚀 Próximos Passos

Quando **todos os itens** estiverem marcados e **aprovado por revisor**:
1. Verificar status dos workflows no GitHub Actions
2. Confirmar que não há conflicts com main
3. Executar merge via script `auto-merge-if-ready.sh` ou manualmente

---

**⚠️ IMPORTANTE:** Não use auto-merge irrestrito. Este é um processo controlado.
EOF

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agent Automation: Comment & Assign${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Validate PR number
if [ -z "$PR_NUMBER" ]; then
    echo -e "${RED}Error: PR number is required${NC}"
    echo "Usage: $0 <PR_NUMBER> [REVIEWER_LIST]"
    echo "Example: $0 42 'user1,user2'"
    exit 1
fi

# Function to check if gh CLI is installed and authenticated
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
        echo "Run: gh auth login"
        exit 1
    fi
}

# Function to check if PR exists
check_pr_exists() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Check]${NC} Verifying PR #${pr_num} exists..."
    
    if gh pr view "$pr_num" &> /dev/null; then
        echo -e "${GREEN}✓${NC} PR #${pr_num} found"
        return 0
    else
        echo -e "${RED}✗${NC} PR #${pr_num} not found"
        return 1
    fi
}

# Function to add QA checklist comment
add_comment() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Comment]${NC} Adding QA checklist to PR #${pr_num}..."
    
    if echo "$QA_CHECKLIST" | gh pr comment "$pr_num" --body-file -; then
        echo -e "${GREEN}✓${NC} Comment added successfully"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to add comment"
        return 1
    fi
}

# Function to add labels
add_labels() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Labels]${NC} Adding labels to PR #${pr_num}..."
    
    # Build label arguments array safely
    local -a label_args=()
    for label in "${DEFAULT_LABELS[@]}"; do
        label_args+=(--add-label "$label")
    done
    
    if gh pr edit "$pr_num" "${label_args[@]}" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Labels added: ${DEFAULT_LABELS[*]}"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Could not add labels (they may not exist or already be added)"
        return 0
    fi
}

# Function to add assignee
add_assignee() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Assignee]${NC} Assigning PR #${pr_num} to ${DEFAULT_ASSIGNEE}..."
    
    if gh pr edit "$pr_num" --add-assignee "$DEFAULT_ASSIGNEE" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Assigned to ${DEFAULT_ASSIGNEE}"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Could not assign (user may not exist or already assigned)"
        return 0
    fi
}

# Function to add reviewers
add_reviewers() {
    local pr_num="$1"
    local reviewer_list="$2"
    
    echo -e "${BLUE}[Reviewers]${NC} Requesting review from: ${reviewer_list}..."
    
    if gh pr edit "$pr_num" --add-reviewer "$reviewer_list" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Review requested from: ${reviewer_list}"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Could not add reviewers (they may not exist, lack permissions, or already be assigned)"
        return 0
    fi
}

# Function to display PR summary
show_pr_summary() {
    local pr_num="$1"
    
    echo ""
    echo -e "${BLUE}[Summary]${NC} PR #${pr_num} Details:"
    echo ""
    gh pr view "$pr_num" --json title,author,headRefName,baseRefName,state,isDraft,labels,assignees,reviewRequests \
        --template '
Title:     {{.title}}
Author:    {{.author.login}}
Branch:    {{.headRefName}} → {{.baseRefName}}
State:     {{.state}}{{if .isDraft}} (DRAFT){{end}}
Labels:    {{range .labels}}{{.name}} {{end}}
Assignees: {{range .assignees}}{{.login}} {{end}}
Reviewers: {{range .reviewRequests}}{{.login}} {{end}}
'
}

# Main execution
main() {
    echo -e "${GREEN}PR Number:${NC} #$PR_NUMBER"
    echo -e "${GREEN}Reviewers:${NC} $REVIEWERS"
    echo ""
    
    echo -e "${BLUE}Step 1:${NC} Checking prerequisites..."
    check_gh_cli
    echo -e "${GREEN}✓${NC} GitHub CLI ready"
    echo ""
    
    echo -e "${BLUE}Step 2:${NC} Validating PR..."
    if ! check_pr_exists "$PR_NUMBER"; then
        exit 1
    fi
    echo ""
    
    echo -e "${BLUE}Step 3:${NC} Adding QA checklist comment..."
    if ! add_comment "$PR_NUMBER"; then
        echo -e "${RED}✗${NC} Failed to add comment - this is critical"
        exit 1
    fi
    echo ""
    
    echo -e "${BLUE}Step 4:${NC} Adding labels..."
    add_labels "$PR_NUMBER"
    echo ""
    
    echo -e "${BLUE}Step 5:${NC} Assigning owner..."
    add_assignee "$PR_NUMBER"
    echo ""
    
    echo -e "${BLUE}Step 6:${NC} Requesting reviews..."
    add_reviewers "$PR_NUMBER" "$REVIEWERS"
    echo ""
    
    echo -e "${BLUE}========================================${NC}"
    show_pr_summary "$PR_NUMBER"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    echo -e "${GREEN}✓ All tasks completed successfully!${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "1. Reviewers will be notified"
    echo -e "2. Wait for all checks to pass"
    echo -e "3. Wait for human approval"
    echo -e "4. Run ${BLUE}./auto-merge-if-ready.sh $PR_NUMBER${NC} when ready"
    echo ""
    echo -e "View PR: ${BLUE}gh pr view $PR_NUMBER --web${NC}"
}

# Run main function
main
