#!/usr/bin/env bash
set -euo pipefail

# Auto-merge helper script
# Usage: ./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> <merge_method>
# Example: ./scripts/agent/auto-merge-if-ready.sh 123 squash

PR_NUMBER=${1:?"PR_NUMBER required"}
MERGE_METHOD=${2:-"squash"}

echo "Verificando se PR #$PR_NUMBER está pronto para merge automático..."

# Verificar se PR existe e está aberto
pr_state=$(gh pr view "$PR_NUMBER" --json state --jq '.state' 2>/dev/null || echo "")
if [ "$pr_state" != "OPEN" ]; then
  echo "PR #$PR_NUMBER não está aberto (state: $pr_state). Abortando."
  exit 1
fi

# Verificar se PR tem aprovações necessárias
reviews=$(gh pr view "$PR_NUMBER" --json reviewDecision --jq '.reviewDecision' 2>/dev/null || echo "")
if [ "$reviews" != "APPROVED" ]; then
  echo "PR #$PR_NUMBER não tem aprovação necessária (reviewDecision: $reviews). Abortando."
  exit 1
fi

# Verificar se checks estão passando
checks=$(gh pr view "$PR_NUMBER" --json statusCheckRollup --jq '.statusCheckRollup[] | select(.conclusion != "SUCCESS" and .conclusion != "SKIPPED" and .conclusion != "NEUTRAL") | .name' 2>/dev/null || echo "")
if [ -n "$checks" ]; then
  echo "PR #$PR_NUMBER tem checks falhando:"
  echo "$checks"
  echo "Abortando auto-merge."
  exit 1
fi

echo "PR #$PR_NUMBER está pronto. Executando merge ($MERGE_METHOD)..."
gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" --auto || {
  echo "Falha ao habilitar auto-merge. Tentando merge direto..."
  gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" || {
    echo "Merge falhou. Verifique manualmente."
    exit 1
  }
}

echo "Auto-merge concluído ou habilitado para PR #$PR_NUMBER."
