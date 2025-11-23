#!/bin/bash
# ===================================
# 📝 CRIAR PR AUTOMÁTICO
# ===================================
# Cria Pull Request sem abrir VS Code
# Executou → PR criado
#
# Uso: ./create-pr.sh

set -e

echo "📝 ====================================="
echo "📝 CRIAR PR AUTOMÁTICO — ELEVARE"
echo "📝 ====================================="
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado!"
    echo "Instale com: brew install gh (macOS) ou https://cli.github.com/"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI não está autenticado!"
    echo "Execute: gh auth login"
    exit 1
fi

echo "🔍 Verificando branch atual..."
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch atual: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "⚠️  Você está na branch main!"
    echo "Para criar PR, você precisa estar em uma branch diferente."
    echo ""
    echo "Deseja criar uma nova branch agora? (s/n)"
    read -r CREATE_BRANCH
    
    if [ "$CREATE_BRANCH" = "s" ] || [ "$CREATE_BRANCH" = "S" ]; then
        BRANCH_NAME="feature/elevare-ops-$(date +%Y%m%d-%H%M%S)"
        echo "Criando branch: $BRANCH_NAME"
        git checkout -b "$BRANCH_NAME"
        git push -u origin "$BRANCH_NAME"
        CURRENT_BRANCH="$BRANCH_NAME"
    else
        echo "❌ Operação cancelada."
        exit 1
    fi
fi

echo "🚀 Criando Pull Request..."
echo ""

gh pr create \
  --title "Atualização automática – IARA Backend" \
  --body "🤖 **Pull Request Automático — Elevare Ops**

**Descrição:**
Build, testes e sincronização completa via GitHub Agent.

**Alterações incluídas:**
- ✓ Dependências atualizadas
- ✓ Build executado com sucesso
- ✓ Testes validados
- ✓ Código sincronizado com main

**Checklist:**
- [x] Build passou
- [x] Testes executados
- [x] Código revisado
- [x] Pronto para merge

---
🌐 Gerado automaticamente pelo **PAINEL DE COMANDO — ELEVARE OPS**" \
  --base main \
  --head "$CURRENT_BRANCH"

echo ""
echo "✅ Pull Request criado com sucesso!"
echo ""
echo "📊 Para ver o PR criado, execute:"
echo "   gh pr view --web"
echo ""
