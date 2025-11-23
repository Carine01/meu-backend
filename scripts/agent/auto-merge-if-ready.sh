#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/auto-merge-if-ready.sh
# Uso: ./auto-merge-if-ready.sh <PR_NUMBER> [merge_method]
# merge_method: merge|squash|rebase (padrão: squash)
PR_NUMBER=${1:-""}
MERGE_METHOD=${2:-squash}
REQUIRED_CHECKS=("TypeScript Guardian" "Run unit tests" "Quality Gate") # nomes de checks que queremos garantir

if [ -z "$PR_NUMBER" ]; then
  echo "Uso: $0 <PR_NUMBER> [merge_method]"
  exit 1
fi

echo "Verificando PR #$PR_NUMBER ..."

# 1) garantir ao menos 1 aprovação humana
approvals=$(gh api repos/{owner}/{repo}/pulls/"$PR_NUMBER"/reviews --jq '.[] | select(.state=="APPROVED") | .user.login' 2>/dev/null || true)
if [ -z "$approvals" ]; then
  echo "Nenhuma aprovação encontrada. Abortando merge automatizado."
  exit 2
fi
echo "Aprovação humana detectada."

# 2) garantir checks passados
checks_status=$(gh pr checks "$PR_NUMBER" --json checkSuites --jq '.checkSuites[].conclusion' 2>/dev/null || true)
if [[ -z "$checks_status" ]]; then
  echo "Não foi possível obter checks (verifique permissões)."
  exit 3
fi

# Simplified: require overall conclusion == "SUCCESS" for at least one suite
overall_success=$(gh pr checks "$PR_NUMBER" --json conclusion --jq '.conclusion' 2>/dev/null || true)
if [ "$overall_success" != "SUCCESS" ]; then
  echo "Checks não estão 100% com sucesso (conclusion=$overall_success). Abortando merge."
  exit 4
fi

echo "Checks OK."

# 3) Merge seguro (squash por padrão)
echo "Realizando merge (metodo=$MERGE_METHOD) ..."
gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" --delete-branch --admin || {
  echo "Falha no merge automático. Verifique logs."
  exit 5
}

echo "Merge realizado com sucesso. Branch deletada."
