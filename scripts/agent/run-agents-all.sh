#!/usr/bin/env bash
set -euo pipefail

BRANCH=${1:-"main"}
PR_NUMBER=${2:-""}
AUTO_MERGE=${3:-"false"}

WORKFLOWS=("TypeScript Guardian" "Register Fila Fallback (AST)" "Docker Builder" "WhatsApp Monitor" "Agent Orchestrator - run agent scripts in sequence (robust)")

echo "Orquestrador local: branch=$BRANCH PR=$PR_NUMBER AUTO_MERGE=$AUTO_MERGE"

for wf in "${WORKFLOWS[@]}"; do
  echo "Disparando workflow: $wf"
  gh workflow run "$wf" --ref "$BRANCH" || echo "Falha ao disparar $wf"
  sleep 4
  run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 20 --json databaseId,headBranch --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' | head -n1)
  if [ -z "$run_id" ]; then
    echo "Nenhum run encontrado para workflow $wf"
    continue
  fi
  echo "Aguardando run_id $run_id"
  while true; do
    sleep 6
    status=$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")' 2>/dev/null || true)
    echo " status=$status"
    if [[ "$status" =~ "completed" ]]; then
      echo "Conclusão: $(echo "$status" | cut -d'|' -f2)"
      break
    fi
  done
done

if [ -n "$PR_NUMBER" ]; then
  SUMMARY="Agentes executados para branch $BRANCH\n"
  for wf in "${WORKFLOWS[@]}"; do
    run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 20 --json databaseId,headBranch --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' | head -n1)
    s="$(gh run view "$run_id" --json status,conclusion --jq '.status + " / " + (.conclusion // "")' 2>/dev/null || true)"
    SUMMARY+="- $wf : $s\n"
  done
  gh pr comment "$PR_NUMBER" --body "$SUMMARY" || echo "Falha ao comentar PR"
fi

if [ "$AUTO_MERGE" = "true" ] && [ -n "$PR_NUMBER" ]; then
  ./scripts/agent/auto-merge-if-ready.sh "$PR_NUMBER" "squash" || echo "Auto-merge não concluído"
fi

echo "Orquestrador local finalizado."
