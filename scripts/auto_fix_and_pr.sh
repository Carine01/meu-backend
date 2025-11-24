#!/bin/bash
set -e

# Auto-Fix and PR Script
# Executa correções automáticas e cria um PR

echo "=================================================="
echo "  ELEVARE AUTO-FIX & PR"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗${NC} GitHub CLI (gh) não encontrado!"
    echo "Instale com: https://cli.github.com/"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Não está em um repositório Git!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Branch atual: $CURRENT_BRANCH"
echo ""

# Step 1: Run auto-fix
echo "1. Executando correções automáticas..."
if [ -f "./scripts/elevare_auto_fix.sh" ]; then
    bash ./scripts/elevare_auto_fix.sh
else
    echo -e "${YELLOW}⚠${NC} Script elevare_auto_fix.sh não encontrado, executando ESLint diretamente..."
    npx eslint . --fix 2>&1 || true
fi
echo ""

# Step 2: Check if there are changes
if git diff --quiet; then
    echo -e "${GREEN}✓${NC} Nenhuma mudança detectada. Código já está OK!"
    exit 0
fi

# Step 3: Show changes
echo "2. Mudanças detectadas:"
echo ""
git diff --stat
echo ""

# Step 4: Create new branch
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NEW_BRANCH="auto-fix/corrections-${TIMESTAMP}"

echo "3. Criando nova branch: $NEW_BRANCH"
git checkout -b "$NEW_BRANCH"
echo ""

# Step 5: Commit changes
echo "4. Commitando mudanças..."
git add .

COMMIT_MSG="🤖 Auto-fix: Correções automáticas aplicadas

Correções aplicadas automaticamente pelo Elevare Auto-Fix:
- ESLint auto-fix executado
- Formatação de código
- Remoção de espaços desnecessários

Branch origem: $CURRENT_BRANCH
Timestamp: $TIMESTAMP
"

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓${NC} Commit criado"
echo ""

# Step 6: Push branch
echo "5. Fazendo push da branch..."
if git push origin "$NEW_BRANCH"; then
    echo -e "${GREEN}✓${NC} Branch pushed com sucesso"
else
    echo -e "${RED}✗${NC} Falha ao fazer push"
    exit 1
fi
echo ""

# Step 7: Create PR
echo "6. Criando Pull Request..."

PR_TITLE="🤖 Auto-fix: Correções automáticas - $(date +%Y-%m-%d)"

cat > /tmp/pr-body.md << EOFPR
# 🤖 Correções Automáticas - Elevare Auto-Fix

Este PR foi gerado automaticamente pelo sistema de auto-fix do Elevare.

## 📋 Mudanças Aplicadas

$(git diff origin/$CURRENT_BRANCH...$NEW_BRANCH --stat)

### Detalhes

- ✅ **ESLint auto-fix** executado
- ✅ **Formatação** de código aplicada
- ✅ **Espaços em branco** removidos
- ✅ **Problemas comuns** corrigidos

## 📊 Arquivos Alterados

\`\`\`
$(git diff origin/$CURRENT_BRANCH...$NEW_BRANCH --name-only)
\`\`\`

## ✅ Próximos Passos

1. ✓ Revisar as mudanças aplicadas
2. ✓ Executar testes localmente (opcional)
3. ✓ Aprovar e fazer merge

## 🔍 Verificação

- [ ] Revisei as mudanças
- [ ] Mudanças estão corretas
- [ ] Pronto para merge

---

🤖 **Gerado automaticamente pelo Elevare Auto-Fix**
📅 *Timestamp: $TIMESTAMP*
🌿 *Branch origem: \`$CURRENT_BRANCH\`*
EOFPR

if gh pr create \
    --title "$PR_TITLE" \
    --body-file /tmp/pr-body.md \
    --base "$CURRENT_BRANCH" \
    --head "$NEW_BRANCH" \
    --label "auto-fix,automated,bot"; then
    
    echo -e "${GREEN}✓${NC} Pull Request criado com sucesso!"
    echo ""
    
    # Get PR URL
    PR_URL=$(gh pr view "$NEW_BRANCH" --json url -q .url)
    echo "🔗 PR URL: $PR_URL"
    echo ""
    
    # Checkout back to original branch
    git checkout "$CURRENT_BRANCH"
    
    echo "=================================================="
    echo -e "${GREEN}Processo concluído com sucesso!${NC}"
    echo "=================================================="
    echo ""
    echo "PR criado: $PR_URL"
    echo "Branch: $NEW_BRANCH"
    echo ""
    echo "Você retornou para a branch: $CURRENT_BRANCH"
    
else
    echo -e "${RED}✗${NC} Falha ao criar Pull Request"
    echo "Você pode criar manualmente usando:"
    echo "  gh pr create --base $CURRENT_BRANCH --head $NEW_BRANCH"
    
    # Checkout back to original branch
    git checkout "$CURRENT_BRANCH"
    
    exit 1
fi

# Cleanup
rm -f /tmp/pr-body.md

exit 0
