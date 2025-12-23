#!/usr/bin/env bash
set -euo pipefail

# Uso:
#   GITHUB_TOKEN já disponível no runner (ou export GITHUB_TOKEN=...)
#   ./scripts/agent/run-agents-all.sh <branch> <pr_number (opcional)> <auto_merge:true|false>
#
# Exemplo:
#   ./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 false

BRANCH=${1:-"feat/whatsapp-clinicid-filters"}
PR_NUMBER=${2:-""}
AUTO_MERGE=${3:-"false"}

# Workflows a disparar (ajuste nomes se necessário)
WORKFLOWS=(
  "TypeScript Guardian"
  "Register Fila Fallback (AST)"
  "Docker Builder"
  "WhatsApp Monitor"
  "Agent Orchestrator - run agent scripts in sequence (robust)"
)

echo "Iniciando orquestra de agentes para branch: $BRANCH  PR: $PR_NUMBER  AUTO_MERGE=$AUTO_MERGE"
echo "Workflows a disparar: ${WORKFLOWS[*]}"

# Disparar cada workflow e aguardar término
for wf in "${WORKFLOWS[@]}"; do
  echo "Disparando workflow: $wf"
  # start workflow
  run_resp=$(gh workflow run "$wf" --ref "$BRANCH" 2>/dev/null || true)
  if [ -z "$run_resp" ]; then
    echo "Falha ao disparar '$wf' — verifique nome do workflow ou permissões."
    continue
  fi

  # pegar o run mais recente para esse workflow e essa branch
  echo "Aguardando execução do workflow '$wf' (procure o último run)..."
  sleep 4
  # localizar run id do último run do workflow para esta branch
  run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 20 --json databaseId,headBranch,workflowName,status,conclusion --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' | head -n1)
  if [ -z "$run_id" ]; then
    echo "Não encontrei run_id para workflow $wf; pulando espera."
    continue
  fi

  echo "Run id encontrado: $run_id — esperando conclusão..."
  # poll
  while true; do
    sleep 6
    status="$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")')"
    echo "  status=$status"
    if [[ "$status" =~ "completed" ]]; then
      conclusion=$(echo "$status" | cut -d'|' -f2)
      echo "  conclusão: $conclusion"
      # Case-insensitive comparison for success status
      if [[ "${conclusion,,}" != "success" ]]; then
        echo "  ⚠️ Workflow $wf concluiu com: $conclusion"
      fi
      break
    fi
  done
done

echo "Todos os workflows disparados e aguardados (verifique detalhes no Actions)."

# Se PR informado, postar comentário resumo com status
if [ -n "$PR_NUMBER" ]; then
  echo "Gerando resumo e comentando no PR #$PR_NUMBER ..."
  SUMMARY="Agentes executados para branch \`$BRANCH\`.\n\nResumo de checks:\n"
  for wf in "${WORKFLOWS[@]}"; do
    run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 20 --json databaseId,headBranch,status,conclusion --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' | head -n1)
    if [ -n "$run_id" ]; then
      s="$(gh run view "$run_id" --json status,conclusion --jq '.status + " / " + (.conclusion // "")')"
      SUMMARY+="- $wf : $s\n"
    else
      SUMMARY+="- $wf : (no run found)\n"
    fi
  done

  gh pr comment "$PR_NUMBER" --body "$SUMMARY"
  echo "Comentário postado no PR #$PR_NUMBER."
fi

# Se quiser habilitar auto-merge controlado (desligado por padrão)
if [ "$AUTO_MERGE" = "true" ] && [ -n "$PR_NUMBER" ]; then
  echo "Tentando merge automático para PR #$PR_NUMBER ..."
  ./scripts/agent/auto-merge-if-ready.sh "$PR_NUMBER" "squash" || echo "Auto-merge tentou e não completou. Verificar tolerância."
fi

echo "Orquestra finalizada."
