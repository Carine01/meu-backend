#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/run-all-checks.sh
# Dispara os workflows e aguarda conclusão básica.
# Requisitos: gh cli (https://cli.github.com/), jq
# Uso: GITHUB_TOKEN já disponível no Actions; localmente export GITHUB_TOKEN=...

WORKFLOWS=("TypeScript Guardian" "Register Fila Fallback (AST)" "Docker Builder" "WhatsApp Monitor")
REF=${1:-HEAD}  # branch/ref a usar (padrão: HEAD)

# Resolver REF para branch name se for HEAD
if [ "$REF" == "HEAD" ]; then
  REF=$(git rev-parse --abbrev-ref HEAD)
fi

echo "Disparando workflows no ref: $REF"

for wf in "${WORKFLOWS[@]}"; do
  echo "-> Disparando workflow: $wf"
  gh workflow run "$wf" --ref "$REF" 2>/dev/null || {
    echo "  Falha ao disparar $wf — verifique nome do workflow e permissões"
    continue
  }
  echo "  Workflow $wf disparado. Aguardando alguns segundos para o run aparecer..."
  sleep 5
  
  # Buscar o run_id mais recente desse workflow no ref especificado
  run_id=$(gh run list --workflow "$wf" --branch "$REF" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)
  if [ -z "$run_id" ]; then
    echo "  Não foi possível obter run_id para $wf. Continuando..."
    continue
  fi
  echo "  Run ID encontrado: $run_id. Esperando conclusão..."
  
  # Poll status
  while true; do
    sleep 8
    status=$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")')
    echo "   status=$status"
    run_status=$(echo "$status" | cut -d'|' -f1)
    if [[ "$run_status" == "completed" ]]; then
      conclusion=$(echo "$status" | cut -d'|' -f2)
      echo "   Conclusão: $conclusion"
      break
    fi
  done
done

echo "Todos os workflows disparados (verifique resultados no GitHub Actions UI)."
