#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# fast-deploy-agents.sh — Tudo-em-um seguro para deploy e orquestração
# ==============================================================================
# Uso:
#   ./scripts/agent/fast-deploy-agents.sh [BRANCH] [PR_NUMBER] [AUTO_MERGE]
#
# Exemplo:
#   ./scripts/agent/fast-deploy-agents.sh "feat/whatsapp-clinicid-filters"
#   ./scripts/agent/fast-deploy-agents.sh "feat/whatsapp-clinicid-filters" "123" "false"
#
# O que faz:
#   1. Aplica patches se existirem
#   2. Commit + push de mudanças
#   3. Cria PR se não existir
#   4. Configura GitHub Secrets (se env vars estiverem definidas)
#   5. Dispara workflows críticos
#   6. Aguarda conclusão
#   7. Comenta no PR
#   8. Cria issue de incidente se houver falha
#   9. (Opcional) Tenta auto-merge se habilitado
# ==============================================================================

BRANCH=${1:-"feat/whatsapp-clinicid-filters"}
PR_NUMBER=${2:-""}
AUTO_MERGE=${3:-"false"}
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || echo "")

echo "=========================================="
echo "Fast Deploy Agents"
echo "=========================================="
echo "Branch: $BRANCH"
echo "PR Number: ${PR_NUMBER:-auto-detect}"
echo "Auto-merge: $AUTO_MERGE"
echo "Repository: ${REPO:-unknown}"
echo "=========================================="

# ==============================================================================
# 1. Aplicar patches (se existirem)
# ==============================================================================
echo ""
echo "[1/9] Aplicando patches..."
PATCHES=("patch-clinicId-filters.patch" "patch-agent-workflows.patch" "patch-agent-workflows-2.patch")
for patch in "${PATCHES[@]}"; do
  if [ -f "$patch" ]; then
    echo "  Aplicando $patch..."
    git apply --check "$patch" 2>/dev/null && git apply "$patch" || echo "    Patch $patch já aplicado ou não necessário"
  else
    echo "  Patch $patch não encontrado, ignorando."
  fi
done

# ==============================================================================
# 2. Commit + push
# ==============================================================================
echo ""
echo "[2/9] Verificando mudanças para commit..."
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "chore: apply patches and agent automation setup [agent-deploy]" || echo "Nada para commitar"
  git push origin "$BRANCH" || { echo "Erro ao fazer push"; exit 1; }
  echo "  Mudanças commitadas e enviadas."
else
  echo "  Nenhuma mudança para commitar."
fi

# ==============================================================================
# 3. Criar PR se não existir
# ==============================================================================
echo ""
echo "[3/9] Verificando PR..."
if [ -z "$PR_NUMBER" ]; then
  PR_NUMBER=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || true)
  if [ -z "$PR_NUMBER" ]; then
    echo "  Criando novo PR..."
    gh pr create --title "feat: WhatsApp clinicId filters + agent automation" \
      --body "Implementação de filtros clinicId para WhatsApp e automação de agents.

Checklist:
- [x] Patches aplicados
- [ ] Tests passing
- [ ] Docker build ok
- [ ] Review necessária

Este PR foi criado automaticamente pelo fast-deploy-agents.sh" \
      --base main --head "$BRANCH" || { echo "Erro ao criar PR"; exit 1; }
    PR_NUMBER=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number')
    echo "  PR #$PR_NUMBER criado."
  else
    echo "  PR #$PR_NUMBER já existe."
  fi
else
  echo "  Usando PR #$PR_NUMBER fornecido."
fi

# ==============================================================================
# 4. Configurar GitHub Secrets (se definidos como env vars)
# ==============================================================================
echo ""
echo "[4/9] Configurando GitHub Secrets..."
SECRETS=(
  "DB_URL"
  "WHATSAPP_PROVIDER_TOKEN"
  "WHATSAPP_PROVIDER_API_URL"
  "JWT_SECRET"
  "DOCKER_REGISTRY_USER"
  "DOCKER_REGISTRY_PASS"
)

for secret in "${SECRETS[@]}"; do
  if [ -n "${!secret:-}" ]; then
    echo "  Configurando secret $secret..."
    gh secret set "$secret" --body "${!secret}" || echo "    Falha ao configurar $secret (pode já existir)"
  else
    echo "  Secret $secret não definido como env var, ignorando."
  fi
done

# ==============================================================================
# 5. Disparar workflows críticos
# ==============================================================================
echo ""
echo "[5/9] Disparando workflows críticos..."
WORKFLOWS=("CI" "Docker Builder" "Agent Orchestrator - run agent scripts in sequence (robust)")

for wf in "${WORKFLOWS[@]}"; do
  echo "  Disparando workflow: $wf"
  gh workflow run "$wf" --ref "$BRANCH" 2>/dev/null || echo "    Workflow $wf não encontrado ou erro ao disparar"
  sleep 4
done

# ==============================================================================
# 6. Aguardar conclusão (opcional, com timeout)
# ==============================================================================
echo ""
echo "[6/9] Aguardando conclusão dos workflows (timeout: 10 minutos)..."
MAX_WAIT=600  # 10 minutos
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $MAX_WAIT ]; do
  PENDING_COUNT=0
  for wf in "${WORKFLOWS[@]}"; do
    run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 5 --json databaseId,status --jq '.[] | select(.status!="completed") | .databaseId' | head -n1 || true)
    if [ -n "$run_id" ]; then
      PENDING_COUNT=$((PENDING_COUNT + 1))
    fi
  done
  
  if [ $PENDING_COUNT -eq 0 ]; then
    echo "  Todos os workflows concluídos."
    break
  fi
  
  echo "  Aguardando... ($PENDING_COUNT workflows pendentes, ${ELAPSED}s/${MAX_WAIT}s)"
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "  Timeout atingido. Alguns workflows podem ainda estar executando."
fi

# ==============================================================================
# 7. Comentar no PR
# ==============================================================================
echo ""
echo "[7/9] Comentando no PR..."
SUMMARY="🤖 **Resumo de Execução dos Agents**

Branch: \`$BRANCH\`
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### Status dos Workflows:

"

FAILED_WORKFLOWS=()

for wf in "${WORKFLOWS[@]}"; do
  run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 5 --json databaseId,status,conclusion --jq '.[0] | .databaseId' 2>/dev/null || true)
  if [ -n "$run_id" ]; then
    status_info=$(gh run view "$run_id" --json status,conclusion --jq '.status + " / " + (.conclusion // "pending")' 2>/dev/null || echo "unknown")
    SUMMARY+="- **$wf**: $status_info
"
    
    # Check for failures
    if [[ "$status_info" =~ "failure" ]]; then
      FAILED_WORKFLOWS+=("$wf")
    fi
  else
    SUMMARY+="- **$wf**: não encontrado
"
  fi
done

SUMMARY+="
---
Deploy executado por: fast-deploy-agents.sh
"

gh pr comment "$PR_NUMBER" --body "$SUMMARY" || echo "  Falha ao comentar no PR"

# ==============================================================================
# 8. Criar issue de incidente se houver falhas
# ==============================================================================
echo ""
echo "[8/9] Verificando falhas..."
if [ ${#FAILED_WORKFLOWS[@]} -gt 0 ]; then
  echo "  Detectadas falhas em: ${FAILED_WORKFLOWS[*]}"
  ISSUE_BODY="## 🚨 Incidente: Falha em Workflows

**PR**: #$PR_NUMBER
**Branch**: \`$BRANCH\`
**Data**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### Workflows com Falha:

"
  for failed_wf in "${FAILED_WORKFLOWS[@]}"; do
    ISSUE_BODY+="- $failed_wf
"
  done
  ISSUE_BODY+="
### Ação Necessária:

Por favor, revise os logs dos workflows e corrija os erros antes de tentar merge.
"
  
  gh issue create --title "🚨 Workflow failures on $BRANCH" \
    --body "$ISSUE_BODY" \
    --label "bug,priority/high,incident" || echo "  Falha ao criar issue de incidente"
else
  echo "  Nenhuma falha detectada."
fi

# ==============================================================================
# 9. Auto-merge (opcional e guardado)
# ==============================================================================
echo ""
echo "[9/9] Verificando auto-merge..."
if [ "$AUTO_MERGE" = "true" ]; then
  echo "  Auto-merge habilitado, verificando condições..."
  ./scripts/agent/auto-merge-if-ready.sh "$PR_NUMBER" "squash" || echo "  Auto-merge não autorizado ou falhou"
else
  echo "  Auto-merge desabilitado."
fi

# ==============================================================================
# Finalização
# ==============================================================================
echo ""
echo "=========================================="
echo "Fast Deploy Agents Concluído!"
echo "=========================================="
echo "PR: #$PR_NUMBER"
echo "Visualize: $(gh pr view "$PR_NUMBER" --json url --jq '.url' 2>/dev/null || echo 'N/A')"
echo "=========================================="
