#!/bin/bash
# Orchestrator script - executa todos os workflows de agentes em sequência
# Uso: ./scripts/agent/run-agents-all.sh <branch> [pr_number] [auto_merge]
#
# Exemplos:
#   ./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters
#   ./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 false

set -e

BRANCH="${1:-}"
PR_NUMBER="${2:-}"
AUTO_MERGE="${3:-false}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "🤖 Agent Orchestrator - Executando workflows em sequência"
echo "============================================================"
echo ""
echo "Branch: ${BRANCH}"
echo "PR Number: ${PR_NUMBER:-auto-detect}"
echo "Auto Merge: ${AUTO_MERGE}"
echo ""

# Verificar se gh CLI está disponível
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI (gh) não está instalado"
    exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    echo "❌ Erro: Não autenticado no GitHub CLI"
    exit 1
fi

# Auto-detectar branch se não fornecida
if [ -z "$BRANCH" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "🔍 Branch auto-detectada: $BRANCH"
fi

# Auto-detectar PR se não fornecido
if [ -z "$PR_NUMBER" ]; then
    PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")
    if [ -n "$PR_NUMBER" ]; then
        echo "🔍 PR auto-detectado: #$PR_NUMBER"
    else
        echo "ℹ️  Nenhum PR aberto encontrado para branch $BRANCH"
    fi
fi

echo ""
echo "🚀 Disparando workflows..."
echo ""

# Array de workflows para executar
declare -a WORKFLOWS=(
    "TypeScript Guardian"
    "Register Fila Fallback (AST)"
    "Docker Builder"
    "WhatsApp Monitor"
)

# Contador de workflows disparados
DISPATCHED=0
FAILED=0

# Disparar cada workflow
for workflow in "${WORKFLOWS[@]}"; do
    echo "▶️  Disparando: $workflow"
    
    if gh workflow run "$workflow" --ref "$BRANCH" 2>/dev/null; then
        echo "   ✅ Workflow disparado: $workflow"
        ((DISPATCHED++))
    else
        echo "   ⚠️  Falha ao disparar workflow: $workflow (pode não existir)"
        ((FAILED++))
    fi
    
    # Pequeno delay entre disparos
    sleep 2
done

echo ""
echo "📊 Resumo de Disparos"
echo "====================="
echo "✅ Disparados com sucesso: $DISPATCHED"
echo "⚠️  Falharam: $FAILED"
echo ""

# Aguardar alguns segundos para workflows iniciarem
echo "⏳ Aguardando workflows iniciarem (15s)..."
sleep 15

# Listar runs recentes
echo ""
echo "📋 Runs recentes para branch $BRANCH:"
echo ""
gh run list --branch "$BRANCH" --limit 10

echo ""
echo "💡 Dica: Para monitorar os runs em tempo real:"
echo "   gh run list --branch $BRANCH --limit 10"
echo "   gh run watch <RUN_ID>"
echo ""

# Se PR_NUMBER foi informado, aguardar e postar comentário
if [ -n "$PR_NUMBER" ]; then
    echo "📝 Aguardando conclusão dos workflows para postar resumo no PR..."
    echo ""
    
    # Aguardar mais tempo para workflows concluírem
    sleep 30
    
    # Coletar status dos runs
    RUNS_STATUS=$(gh run list --branch "$BRANCH" --limit 10 --json status,conclusion,name --jq '.[] | "\(.name): \(.status) - \(.conclusion // "em andamento")"')
    
    # Criar comentário de resumo
    COMMENT="## 🤖 Agent Orchestrator - Resumo dos Workflows

**Branch:** \`$BRANCH\`
**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### Status dos Workflows:

\`\`\`
$RUNS_STATUS
\`\`\`

### Ações Realizadas:
- ✅ Workflows disparados: $DISPATCHED
- ⚠️  Workflows com falha no disparo: $FAILED

---

💡 **Próximos passos:**
- Aguarde a conclusão de todos os workflows
- Revise os logs de workflows que falharam
- Verifique se todos os checks passaram antes de mergear

🔗 Ver todos os runs: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions?query=branch:$BRANCH
"
    
    # Postar comentário no PR
    echo "$COMMENT" | gh pr comment "$PR_NUMBER" --body-file -
    
    echo "✅ Comentário de resumo postado no PR #$PR_NUMBER"
    echo ""
fi

echo "✅ Orchestrator concluído!"
echo ""
echo "🔗 Acompanhe os workflows em:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
