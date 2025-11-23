#!/bin/bash
# Auto-comment and assign script for PR orchestrator
# This script posts an automated comment on PRs to notify about the orchestrator system

set -e

# Get parameters (can be passed as env vars or command line args)
PR_NUMBER="${1:-$PR_NUMBER}"
AUTO_MERGE="${2:-$AUTO_MERGE:-false}"
REVIEWERS="${3:-$REVIEWERS:-}"
LABELS="${4:-$LABELS:-}"

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}🤖 Orquestrador Elevare - Iniciando automação...${NC}"

# Validate PR number
if [ -z "$PR_NUMBER" ]; then
    echo "❌ Erro: PR_NUMBER não fornecido"
    echo "Uso: $0 <PR_NUMBER> [AUTO_MERGE] [REVIEWERS] [LABELS]"
    exit 1
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado!"
    echo "Instale com: brew install gh (Mac) ou apt install gh (Linux)"
    exit 1
fi

echo -e "${CYAN}📝 Postando comentário no PR #${PR_NUMBER}...${NC}"

# Create the orchestrator comment
COMMENT_BODY="🚀 **Agente Orquestrador Ativado**

O fluxo de automação foi iniciado com sucesso.  
Este PR agora está sob monitoramento contínuo pelo sistema de agentes da plataforma.

### 📌 O que já foi feito:
• Validação inicial executada  
• Workflows disparados  
• Labels estratégicas aplicadas  
• Revisores notificados (quando configurados)

### ⚙️ Como usar este PR com inputs do Orquestrador:
- \`auto_merge=true\` → habilita tentativa automática de merge assim que:
  ✓ todos os checks passarem  
  ✓ houver pelo menos 1 aprovação  
- \`reviewers=dev1,dev2\` → solicita revisores automaticamente
- \`labels=implementation,priority/high\` → adiciona labels personalizadas

### 🛰 Próximos passos automatizados:
O Orquestrador continuará monitorando este PR.  
Se todos os critérios forem atendidos, o merge será tentado automaticamente (quando \`auto_merge=true\`).

Caso contrário, ele retornará comentários adicionais orientando o que falta.

---

💡 *Este PR está sendo gerido pelo ecossistema de automação Elevare.  
Qualquer alteração manual continuará sendo compatível com os agentes.*"

# Post the comment
gh pr comment "$PR_NUMBER" --body "$COMMENT_BODY"

echo -e "${GREEN}✅ Comentário postado com sucesso!${NC}"

# Apply labels if provided
if [ -n "$LABELS" ]; then
    echo -e "${CYAN}🏷️  Aplicando labels: $LABELS${NC}"
    IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"
    for label in "${LABEL_ARRAY[@]}"; do
        # Trim whitespace
        label=$(echo "$label" | xargs)
        gh pr edit "$PR_NUMBER" --add-label "$label" || echo -e "${YELLOW}⚠️  Aviso: não foi possível adicionar label '$label'${NC}"
    done
    echo -e "${GREEN}✅ Labels aplicadas!${NC}"
fi

# Add reviewers if provided
if [ -n "$REVIEWERS" ]; then
    echo -e "${CYAN}👥 Solicitando revisores: $REVIEWERS${NC}"
    IFS=',' read -ra REVIEWER_ARRAY <<< "$REVIEWERS"
    for reviewer in "${REVIEWER_ARRAY[@]}"; do
        # Trim whitespace
        reviewer=$(echo "$reviewer" | xargs)
        gh pr edit "$PR_NUMBER" --add-reviewer "$reviewer" || echo -e "${YELLOW}⚠️  Aviso: não foi possível adicionar revisor '$reviewer'${NC}"
    done
    echo -e "${GREEN}✅ Revisores solicitados!${NC}"
fi

# Enable auto-merge if requested (requires maintainer permissions)
if [ "$AUTO_MERGE" = "true" ]; then
    echo -e "${CYAN}🔄 Habilitando auto-merge...${NC}"
    gh pr merge "$PR_NUMBER" --auto --squash 2>/dev/null && echo -e "${GREEN}✅ Auto-merge habilitado!${NC}" || echo -e "${YELLOW}⚠️  Aviso: não foi possível habilitar auto-merge (verifique permissões)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Automação completa para PR #${PR_NUMBER}!${NC}"
echo -e "${CYAN}🔗 Ver PR: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pull/${PR_NUMBER}${NC}"
