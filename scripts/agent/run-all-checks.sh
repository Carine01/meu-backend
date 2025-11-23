#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/run-all-checks.sh
# Dispara os workflows e aguarda conclusão básica.
# Requisitos: gh cli (https://cli.github.com/), jq
# Uso: GITHUB_TOKEN já disponível no Actions; localmente export GITHUB_TOKEN=...

WORKFLOWS=("TypeScript Guardian" "Register Fila Fallback (AST)" "Docker Builder" "WhatsApp Monitor")
REF=${1:-HEAD}  # branch/ref a usar (padrão: HEAD)

echo "Disparando workflows no ref: $REF"

for wf in "${WORKFLOWS[@]}"; do
  echo "-> Disparando workflow: $wf"
  run_id=$(gh workflow run "$wf" --ref "$REF" --json workflow,id --jq '.id' 2>/dev/null || true)
  if [ -z "$run_id" ]; then
    echo "  Falha ao disparar $wf — verifique nome do workflow e permissões"
    continue
  fi
  echo "  Workflow $wf disparado (id: $run_id). Esperando conclusão..."
  # Poll status
  while true; do
    sleep 8
    status=$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")')
    echo "   status=$status"
    if [[ "$status" =~ "completed|failure|cancelled|timed_out" ]]; then
      conclusion=$(echo "$status" | cut -d'|' -f2)
      echo "   Conclusão: $conclusion"
      break
    fi
  done
done

echo "Todos os workflows disparados (verifique resultados no GitHub Actions UI)."
