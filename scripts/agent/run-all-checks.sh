#!/usr/bin/env bash
set -euo pipefail

# Dispara workflows principais e aguarda conclusão básica
WORKFLOWS=("TypeScript Guardian" "Register Fila Fallback (AST)" "Docker Builder" "WhatsApp Monitor")
REF=${1:-HEAD}  # branch/ref a usar (padrão: HEAD)

echo "Disparando workflows no ref: $REF"

for wf in "${WORKFLOWS[@]}"; do
  echo "-> Disparando workflow: $wf"
  gh workflow run "$wf" --ref "$REF" || { echo "Falha ao disparar $wf"; continue; }
  sleep 4
  run_id=$(gh run list --workflow "$wf" --branch "$REF" --limit 10 --json databaseId,headBranch --jq ".[] | select(.headBranch==\"$REF\") | .databaseId" | head -n1)
  if [ -z "$run_id" ]; then
    echo "  Não encontrei run_id para $wf; pulando espera."
    continue
  fi
  echo "  Workflow $wf disparado (run_id: $run_id). Aguardando conclusão..."
  while true; do
    sleep 6
    status=$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")' 2>/dev/null || true)
    echo "   status=$status"
    if [[ "$status" =~ "completed" ]]; then
      conclusion=$(echo "$status" | cut -d'|' -f2)
      echo "   Conclusão: $conclusion"
      break
    fi
  done
done

echo "Todos os workflows disparados (verifique resultados no GitHub Actions UI)."
