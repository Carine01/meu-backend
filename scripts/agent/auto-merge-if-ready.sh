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

overall_success=$(gh pr checks "$PR_NUMBER" --json conclusion --jq '.conclusion' 2>/dev/null || true)
if [ "$overall_success" != "SUCCESS" ]; then
  echo "Checks não estão 100% com sucesso (conclusion=$overall_success). Abortando merge."
  exit 3
fi

echo "Realizando merge (metodo=$MERGE_METHOD) ..."
gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" --delete-branch --admin || { echo "Falha no merge automático"; exit 4; }
echo "Merge realizado."
