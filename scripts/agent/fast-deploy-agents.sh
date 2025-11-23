#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/fast-deploy-agents.sh
# Automatiza finalização pelo GitHub agents sem pausas.
# Uso:
#   export GITHUB_TOKEN="$(gh auth token)"     # se local
#   export DB_URL="postgresql://user:pass@..." # opcional: para criar secret
#   export WHATSAPP_PROVIDER_TOKEN="token"     # opcional
#   export WHATSAPP_PROVIDER_API_URL="https://api..."
#   export JWT_SECRET="..."                    # opcional
#   export AUTO_MERGE="false"                  # opcional: true|false (default false)
#   ./scripts/agent/fast-deploy-agents.sh branch-name
#
BRANCH="${1:-feat/whatsapp-clinicid-filters}"
AUTO_MERGE="${AUTO_MERGE:-false}"

# Workflows a monitorar (ajuste nomes se necessário)
WORKFLOWS=(
  "Agent Orchestrator - run agent scripts in sequence (robust)"
  "TypeScript Guardian"
  "Register Fila Fallback (AST)"
  "Docker Builder"
  "WhatsApp Monitor"
)

echo "fast-deploy-agents starting -> branch=${BRANCH} AUTO_MERGE=${AUTO_MERGE}"
# checagens básicas
if ! command -v gh >/dev/null 2>&1; then
  echo "ERRO: gh CLI não encontrado. Rode 'gh auth login' e garanta acesso."
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "ERRO: git não encontrado."
  exit 1
fi
if [ ! -d ".git" ]; then
  echo "ERRO: .git não encontrado. Rode na raiz do repositório."
  exit 1
fi

# Função: aplica patch se aplicável (safe)
apply_patch_if_exists() {
  PATCH="$1"
  if [ -f "$PATCH" ]; then
    echo "Tentando aplicar patch: $PATCH"
    if git apply --check "$PATCH" 2>/dev/null; then
      git apply "$PATCH"
      echo "Patch aplicado: $PATCH"
    else
      echo "Patch não aplicável / já aplicado ou conflito: $PATCH (pulando)"
    fi
  else
    echo "Patch não encontrado: $PATCH (pulando)"
  fi
}

PATCHES=("patch-clinicId-filters.patch" "patch-agent-workflows.patch" "patch-agent-workflows-2.patch")
for p in "${PATCHES[@]}"; do
  apply_patch_if_exists "$p"
done

# Commit + push se houver mudanças
if [ -n "$(git status --porcelain)" ]; then
  echo "Mudanças detectadas. Commitando..."
  git add -A
  git commit -m "chore(ci): apply patches and prepare fast deploy [auto]" || true
  # garantir branch alvo
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    git checkout -B "$BRANCH"
  fi
  git push -u origin "$BRANCH" || echo "Push falhou — verifique permissões"
else
  echo "Nenhuma mudança local."
fi

# Criar PR se não existir
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)
if [ -z "$PR_NUMBER" ]; then
  echo "Nenhum PR aberto para $BRANCH. Criando PR..."
  PR_URL=$(gh pr create --base main --head "$BRANCH" --title "feat: ${BRANCH}" --body "Automated PR for ${BRANCH}" --label "automation" 2>/dev/null || true)
  # extrair número do URL se obtido
  if [ -n "$PR_URL" ]; then
    PR_NUMBER=$(echo "$PR_URL" | sed -E 's#.*/pull/([0-9]+).*#\1#')
    echo "PR criado: #$PR_NUMBER"
  else
    echo "Falha ao criar PR automaticamente; continue sem PR."
  fi
else
  echo "PR já existente: #$PR_NUMBER"
fi

# Configurar secrets a partir de variáveis de ambiente (somente se presentes)
# Lista de secrets e as variáveis de ambiente correspondentes:
declare -A SECRETS_MAP=(
  ["DB_URL"]="DB_URL"
  ["WHATSAPP_PROVIDER_TOKEN"]="WHATSAPP_PROVIDER_TOKEN"
  ["WHATSAPP_PROVIDER_API_URL"]="WHATSAPP_PROVIDER_API_URL"
  ["JWT_SECRET"]="JWT_SECRET"
  ["DOCKER_REGISTRY_USER"]="DOCKER_REGISTRY_USER"
  ["DOCKER_REGISTRY_PASS"]="DOCKER_REGISTRY_PASS"
)

for secret in "${!SECRETS_MAP[@]}"; do
  envvar="${SECRETS_MAP[$secret]}"
  value="${!envvar:-}"
  if [ -n "$value" ]; then
    echo "Configurando secret $secret a partir de env var $envvar"
    # usar gh secret set com --body
    gh secret set "$secret" --body "$value" && echo "Secret $secret definido." || echo "Falha ao definir secret $secret"
  else
    echo "Env var $envvar não definida; pulando secret $secret"
  fi
done

# Disparar agent orchestrator workflow se existir, senão usar script local run-agents-all.sh
ORCH_NAME="Agent Orchestrator - run agent scripts in sequence (robust)"
WF_EXISTS=$(gh workflow list --limit 200 --json name --jq ".[] | select(.name==\"$ORCH_NAME\") | .name" 2>/dev/null || true)
USE_ORCHESTRATOR=false
if [ -n "$WF_EXISTS" ]; then
  echo "Disparando workflow orquestrador: $ORCH_NAME"
  gh workflow run "$ORCH_NAME" --ref "$BRANCH" || echo "Falha ao disparar workflow orchestrator"
  USE_ORCHESTRATOR=true
else
  if [ -x "./scripts/agent/run-agents-all.sh" ]; then
    echo "Executando script local ./scripts/agent/run-agents-all.sh"
    ./scripts/agent/run-agents-all.sh "$BRANCH" "${PR_NUMBER:-}" "${AUTO_MERGE}" || echo "run-agents-all.sh retornou erro; continuar"
  else
    echo "Orchestrator não encontrado e run-agents-all.sh ausente. Abortando."
    exit 0
  fi
fi

# Função para aguardar e coletar conclusão de um workflow
wait_for_workflow_run() {
  local wf_name="$1"
  echo "Procurando run para workflow: $wf_name (branch $BRANCH)"
  run_id=$(gh run list --workflow "$wf_name" --branch "$BRANCH" --limit 20 --json databaseId,headBranch,status,conclusion --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' 2>/dev/null | head -n1 || true)
  if [ -z "$run_id" ]; then
    echo "Nenhum run encontrado para workflow $wf_name"
    echo "not_found"
    return
  fi
  echo "Run encontrado: $run_id — aguardando conclusão..."
  while true; do
    sleep 6
    status="$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")' 2>/dev/null || true)"
    if [ -z "$status" ]; then
      echo "Não foi possível obter status do run $run_id. Repetindo..."
      continue
    fi
    echo " status -> $status"
    if [[ "$status" =~ "completed" ]]; then
      concl=$(echo "$status" | cut -d'|' -f2)
      echo "Conclusão do workflow $wf_name: $concl"
      echo "$concl"
      return
    fi
  done
}

# Aguardar todos os workflows críticos
declare -A RESULTS
CRITICAL=false

# Se orchestrator foi usado, monitora apenas ele; caso contrário, monitora todos
if [ "$USE_ORCHESTRATOR" = true ]; then
  echo "Monitorando apenas workflow orchestrator..."
  res=$(wait_for_workflow_run "$ORCH_NAME")
  RESULTS["$ORCH_NAME"]="$res"
  if [[ "$res" =~ "failure|cancelled|timed_out|action_required" ]]; then
    CRITICAL=true
  fi
else
  echo "Monitorando todos os workflows críticos..."
  for wf in "${WORKFLOWS[@]}"; do
    res=$(wait_for_workflow_run "$wf")
    RESULTS["$wf"]="$res"
    if [[ "$res" =~ "failure|cancelled|timed_out|action_required" ]]; then
      CRITICAL=true
    fi
  done
fi

# Construir resumo com formatação apropriada
SUMMARY="🔁 Fast Deploy Agents - resumo para branch \`$BRANCH\`:

"
for wf in "${!RESULTS[@]}"; do
  SUMMARY+="- $wf : ${RESULTS[$wf]}
"
done

# Comentar no PR se existir
if [ -n "${PR_NUMBER:-}" ]; then
  echo "Comentando PR #$PR_NUMBER"
  echo "$SUMMARY" | gh pr comment "$PR_NUMBER" --body-file - || echo "Falha ao comentar no PR"
else
  echo "$SUMMARY"
fi

# Criar issue se falha crítica
if [ "$CRITICAL" = true ]; then
  echo "Falha crítica detectada em pelo menos um workflow. Criando issue de incidente."
  ISSUE_TITLE="INCIDENT: workflows falharam em $BRANCH"
  ISSUE_BODY="Fast Deploy Agents detectou falha em pelo menos um workflow para branch \`$BRANCH\`.

Resumo:
$SUMMARY

Ação sugerida: investigar logs no Actions e atribuir desenvolvedor."
  echo "$ISSUE_BODY" | gh issue create --title "$ISSUE_TITLE" --body-file - --label "incident,priority/high" || echo "Falha ao criar issue"
fi

# Tentativa de auto-merge (somente se AUTO_MERGE=true e PR existe)
if [ "${AUTO_MERGE}" = "true" ] && [ -n "${PR_NUMBER:-}" ]; then
  echo "AUTO_MERGE ativado. Verificando pré-condições..."
  
  # Obter autor do PR
  PR_AUTHOR=$(gh pr view "$PR_NUMBER" --json author --jq '.author.login' 2>/dev/null || true)
  
  # Verificar aprovações (excluindo auto-aprovações)
  approvals=$(gh pr review --list --pr "$PR_NUMBER" --json state,author --jq '.[] | select(.state=="APPROVED" and .author.login!="'"$PR_AUTHOR"'") | .author.login' 2>/dev/null || true)
  if [ -z "$approvals" ]; then
    echo "Nenhuma aprovação de outro usuário detectada. Abortando auto-merge."
  else
    echo "Aprovações encontradas de: $approvals"
    
    # Verificar que TODOS os checks passaram
    failed_checks=$(gh pr checks "$PR_NUMBER" --json name,conclusion --jq '.[] | select(.conclusion != "SUCCESS" and .conclusion != "success" and .conclusion != "SKIPPED" and .conclusion != "skipped" and .conclusion != "NEUTRAL" and .conclusion != "neutral") | .name' 2>/dev/null || true)
    
    if [ -z "$failed_checks" ]; then
      echo "Todos os checks passaram. Realizando merge (squash) e deletando branch..."
      gh pr merge "$PR_NUMBER" --squash --delete-branch || echo "Falha no merge automático"
    else
      echo "Alguns checks falharam ou estão pendentes:"
      echo "$failed_checks"
      echo "Abortando auto-merge."
    fi
  fi
fi

echo "fast-deploy-agents finalizado."
