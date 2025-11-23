#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Fast Deploy Agents - Script Completo de Deploy Seguro
# Aplica patches, dispara workflows, comenta em PRs, cria issues em caso de erro
###############################################################################

BRANCH=${1:-"main"}
AUTO_MERGE=${2:-"false"}
CREATE_SECRETS=${3:-"false"}

echo "=== Fast Deploy Agents ==="
echo "Branch: $BRANCH"
echo "Auto-merge: $AUTO_MERGE"
echo "Create secrets: $CREATE_SECRETS"
echo ""

# Verificar se gh está disponível
if ! command -v gh &> /dev/null; then
  echo "ERRO: gh CLI não está instalado. Execute: sudo apt install gh"
  exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
  echo "ERRO: gh não está autenticado. Execute: gh auth login"
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "Repositório: $REPO_ROOT"
echo ""

###############################################################################
# 1) Aplicar patches se existirem
###############################################################################
echo "=== Passo 1: Aplicando patches ==="
PATCHES=(
  "patch-clinicId-filters.patch"
  "patch-agent-workflows.patch"
  "patch-agent-workflows-2.patch"
)

for patch in "${PATCHES[@]}"; do
  if [ -f "$patch" ]; then
    echo "Aplicando patch: $patch"
    if git apply --check "$patch" 2>/dev/null; then
      git apply "$patch" || echo "Falha ao aplicar $patch; pode já estar aplicado"
    else
      echo "Patch $patch não pode ser aplicado (já aplicado ou conflito); pulando"
    fi
  else
    echo "Patch $patch não encontrado; pulando"
  fi
done

echo ""

###############################################################################
# 2) Commit e Push das mudanças
###############################################################################
echo "=== Passo 2: Commit e Push ==="
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "feat: apply agent patches and deploy automation scripts" || echo "Nada para commitar ou erro no commit"
  git push origin "$BRANCH" || echo "Falha no push; pode já estar atualizado"
else
  echo "Nenhuma mudança para commitar"
fi

echo ""

###############################################################################
# 3) Criar ou detectar PR
###############################################################################
echo "=== Passo 3: Verificando PR ==="
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)

if [ -z "$PR_NUMBER" ]; then
  echo "Nenhum PR encontrado para branch $BRANCH; criando..."
  gh pr create \
    --title "feat: WhatsApp clinicId filters and agent automation" \
    --body "Automação completa: filtros de clinicId, agents de CI/CD e patches aplicados" \
    --base main \
    --head "$BRANCH" || echo "Falha ao criar PR"
  
  # Tentar detectar novamente
  sleep 3
  PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)
  if [ -z "$PR_NUMBER" ]; then
    echo "ERRO: Não foi possível criar ou detectar PR"
    exit 1
  fi
fi

echo "PR detectado: #$PR_NUMBER"
echo ""

###############################################################################
# 4) Criar/Atualizar GitHub Secrets (opcional)
###############################################################################
if [ "$CREATE_SECRETS" = "true" ]; then
  echo "=== Passo 4: Configurando Secrets ==="
  
  # Lista de secrets esperados com suas variáveis de ambiente correspondentes
  declare -A SECRETS=(
    ["DB_URL"]="${DB_URL:-}"
    ["WHATSAPP_PROVIDER_TOKEN"]="${WHATSAPP_PROVIDER_TOKEN:-}"
    ["WHATSAPP_PROVIDER_API_URL"]="${WHATSAPP_PROVIDER_API_URL:-}"
    ["JWT_SECRET"]="${JWT_SECRET:-}"
    ["DOCKER_REGISTRY_USER"]="${DOCKER_REGISTRY_USER:-}"
    ["DOCKER_REGISTRY_PASS"]="${DOCKER_REGISTRY_PASS:-}"
  )
  
  for secret_name in "${!SECRETS[@]}"; do
    secret_value="${SECRETS[$secret_name]}"
    if [ -n "$secret_value" ]; then
      echo "Configurando secret: $secret_name"
      echo "$secret_value" | gh secret set "$secret_name" || echo "Falha ao configurar $secret_name"
    else
      echo "Secret $secret_name não tem valor definido; pulando"
    fi
  done
  
  echo ""
else
  echo "=== Passo 4: Pulando configuração de secrets (CREATE_SECRETS=$CREATE_SECRETS) ==="
  echo ""
fi

###############################################################################
# 5) Disparar workflows
###############################################################################
echo "=== Passo 5: Disparando workflows ==="
./scripts/agent/run-all-checks.sh "$BRANCH" || echo "Alguns workflows falharam ao disparar"

echo ""

###############################################################################
# 6) Comentar no PR
###############################################################################
echo "=== Passo 6: Comentando no PR ==="
./scripts/agent/auto-comment-and-assign.sh "$PR_NUMBER" "" "implementation,priority/high" || echo "Falha ao comentar no PR"

echo ""

###############################################################################
# 7) Criar issue de incidente se houver falhas críticas
###############################################################################
echo "=== Passo 7: Verificando falhas críticas ==="

CRITICAL_WORKFLOWS=("TypeScript Guardian" "Docker Builder")
HAS_FAILURES=false

for wf in "${CRITICAL_WORKFLOWS[@]}"; do
  run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 5 --json databaseId,conclusion,headBranch --jq '.[] | select(.headBranch=="'"$BRANCH"'") | select(.conclusion=="failure") | .databaseId' | head -n1)
  if [ -n "$run_id" ]; then
    echo "Workflow crítico falhou: $wf (run_id: $run_id)"
    HAS_FAILURES=true
  fi
done

if [ "$HAS_FAILURES" = "true" ]; then
  echo "Criando issue de incidente..."
  gh issue create \
    --title "🚨 Falha crítica em workflows - Branch $BRANCH" \
    --body "Workflows críticos falharam na branch $BRANCH (PR #$PR_NUMBER). Verifique os logs em Actions." \
    --label "bug,priority/high,ci-failure" || echo "Falha ao criar issue de incidente"
fi

echo ""

###############################################################################
# 8) Auto-merge (se habilitado)
###############################################################################
if [ "$AUTO_MERGE" = "true" ]; then
  echo "=== Passo 8: Tentando auto-merge ==="
  ./scripts/agent/auto-merge-if-ready.sh "$PR_NUMBER" "squash" || echo "Auto-merge não autorizado ou falhou"
else
  echo "=== Passo 8: Auto-merge desabilitado (AUTO_MERGE=$AUTO_MERGE) ==="
fi

echo ""

###############################################################################
# Finalização
###############################################################################
echo "=== Deploy completo ==="
echo "Branch: $BRANCH"
echo "PR: #$PR_NUMBER"
echo "URL: $(gh pr view "$PR_NUMBER" --json url --jq '.url')"
echo ""
echo "Para acompanhar:"
echo "  gh run list --branch $BRANCH --limit 10"
echo "  gh pr view $PR_NUMBER --comments"
echo "  gh pr checks $PR_NUMBER"
echo ""
echo "✅ Fast Deploy Agents finalizado com sucesso!"
