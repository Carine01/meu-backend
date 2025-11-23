#!/bin/bash
# Script para monitorar workflows e criar issue em caso de falha
# Uso: ./scripts/agent/monitor-and-report.sh <branch> [pr_number]

set -e

BRANCH="${1:-}"
PR_NUMBER="${2:-}"

echo "🔍 Monitor de Workflows - Verificando status"
echo "=============================================="
echo ""

# Verificar deps
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI não instalado"
    exit 1
fi

# Auto-detectar branch
if [ -z "$BRANCH" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Branch detectada: $BRANCH"
fi

# Auto-detectar PR
if [ -z "$PR_NUMBER" ]; then
    PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")
fi

echo "Branch: $BRANCH"
echo "PR: ${PR_NUMBER:-N/A}"
echo ""

# Listar runs recentes
echo "📋 Buscando runs recentes..."
RUNS_JSON=$(gh run list --branch "$BRANCH" --limit 10 --json databaseId,status,conclusion,name,workflowName,createdAt 2>/dev/null || echo "[]")

# Validar que retornou JSON válido
if ! echo "$RUNS_JSON" | jq empty 2>/dev/null; then
    echo "❌ Erro ao buscar runs ou JSON inválido"
    echo "   Tentando novamente..."
    sleep 5
    RUNS_JSON=$(gh run list --branch "$BRANCH" --limit 10 --json databaseId,status,conclusion,name,workflowName,createdAt 2>/dev/null || echo "[]")
    if ! echo "$RUNS_JSON" | jq empty 2>/dev/null; then
        echo "❌ Falha ao obter lista de runs"
        exit 1
    fi
fi

# Verificar se há falhas
FAILED_RUNS=$(echo "$RUNS_JSON" | jq -r '.[] | select(.conclusion == "failure") | "\(.databaseId)|\(.workflowName)"' 2>/dev/null || echo "")

if [ -z "$FAILED_RUNS" ]; then
    echo "✅ Nenhuma falha detectada nos últimos 10 runs"
    
    # Se houver PR, postar comentário positivo
    if [ -n "$PR_NUMBER" ]; then
        COMMENT="## ✅ Todos os Workflows Passaram

**Branch:** \`$BRANCH\`
**Verificado em:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

Todos os workflows estão passando! O PR está pronto para revisão. 🎉
"
        echo "$COMMENT" | gh pr comment "$PR_NUMBER" --body-file -
        echo "✅ Comentário positivo postado no PR #$PR_NUMBER"
    fi
    
    exit 0
fi

echo "⚠️  Falhas detectadas!"
echo ""

# Processar cada falha
ISSUE_COUNT=0

while IFS='|' read -r RUN_ID WORKFLOW_NAME; do
    echo "❌ Falha: $WORKFLOW_NAME (Run #$RUN_ID)"
    
    # Buscar logs do run (últimas 50 linhas)
    echo "   📄 Buscando logs..."
    LOG_URL="https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$RUN_ID"
    
    # Criar issue automaticamente
    ISSUE_TITLE="🔥 Workflow falhou: $WORKFLOW_NAME - $BRANCH"
    ISSUE_BODY="## Workflow Failure Report

**Workflow:** $WORKFLOW_NAME
**Branch:** \`$BRANCH\`
**Run ID:** #$RUN_ID
**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### ⚠️ Status
O workflow **$WORKFLOW_NAME** falhou durante a execução.

### 🔗 Links
- [Ver logs completos]($LOG_URL)
- [Ver run details]($LOG_URL)

### 📋 Próximos Passos
1. Verificar os logs do workflow
2. Identificar a causa da falha
3. Corrigir o problema
4. Reexecutar o workflow

### 🏷️ Labels
- incident
- priority/high
- ci
"
    
    echo "   📝 Criando issue..."
    ISSUE_URL=$(gh issue create \
        --title "$ISSUE_TITLE" \
        --body "$ISSUE_BODY" \
        --label "incident,priority/high,ci" \
        2>/dev/null || echo "")
    
    if [ -n "$ISSUE_URL" ]; then
        echo "   ✅ Issue criada: $ISSUE_URL"
        ((ISSUE_COUNT++))
    else
        echo "   ⚠️  Falha ao criar issue (pode já existir)"
    fi
    
    echo ""
done <<< "$FAILED_RUNS"

# Se houver PR, postar comentário sobre falhas
if [ -n "$PR_NUMBER" ] && [ "$ISSUE_COUNT" -gt 0 ]; then
    COMMENT="## ⚠️ Workflows com Falhas Detectadas

**Branch:** \`$BRANCH\`
**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### 🔴 Status
$ISSUE_COUNT workflow(s) falharam e issues foram criadas automaticamente.

### 📋 Ações Realizadas
- ✅ $ISSUE_COUNT issue(s) criada(s) automaticamente
- 🏷️ Issues marcadas com: \`incident\`, \`priority/high\`, \`ci\`

### 🔗 Links Úteis
- [Ver issues abertas](https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues?q=is:issue+is:open+label:incident)
- [Ver workflows](https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions?query=branch:$BRANCH)

**Por favor, investigue e corrija as falhas antes de mergear.**
"
    
    echo "$COMMENT" | gh pr comment "$PR_NUMBER" --body-file -
    echo "✅ Comentário de falhas postado no PR #$PR_NUMBER"
fi

echo ""
echo "📊 Resumo:"
echo "   Issues criadas: $ISSUE_COUNT"
echo ""
echo "✅ Monitoramento concluído"
