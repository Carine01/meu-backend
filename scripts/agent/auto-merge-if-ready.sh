#!/usr/bin/env bash
set -euo pipefail

PR_NUMBER=${1:-""}
MERGE_METHOD=${2:-squash}

if [ -z "$PR_NUMBER" ]; then
  echo "Uso: $0 <PR_NUMBER> [merge_method]"
  exit 1
fi

approvals=$(gh pr review --list --pr "$PR_NUMBER" --json state --jq '.[] | select(.state=="APPROVED")' 2>/dev/null || true)
if [ -z "$approvals" ]; then
  echo "Nenhuma aprovação encontrada. Abortando merge automatizado."
  exit 2
fi

# Check PR checks status - handle multiple success states
check_status=$(gh pr checks "$PR_NUMBER" --json conclusion --jq '[.[] | .conclusion] | unique | .[]' 2>/dev/null || echo "")
if echo "$check_status" | grep -qE "FAILURE|CANCELLED|TIMED_OUT"; then
  echo "Um ou mais checks falharam. Abortando merge."
  exit 3
fi

# Ensure all checks are complete (SUCCESS or SKIPPED are acceptable)
incomplete=$(echo "$check_status" | grep -vE "SUCCESS|SKIPPED|NEUTRAL" || true)
if [ -n "$incomplete" ]; then
  echo "Checks ainda não concluídos ou com estado inválido: $incomplete. Abortando merge."
  exit 3
fi

echo "Realizando merge (metodo=$MERGE_METHOD) ..."
gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" --delete-branch --admin || { echo "Falha no merge automático"; exit 4; }
echo "Merge realizado."
