#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/fast-orchestrator.sh
# Uso:
#   ./scripts/agent/fast-orchestrator.sh [branch] [auto_merge:true|false]
# Exemplo:
#   ./scripts/agent/fast-orchestrator.sh feat/whatsapp-clinicid-filters false
#
# O script:
# 1) checa ambiente (gh, git)
# 2) aplica patches se existirem (não sobrescreve arquivos já alterados)
# 3) commit + push (se houver mudanças)
# 4) detecta PR associado à branch
# 5) dispara Agent Orchestrator workflow (ou o script local run-agents-all.sh se existir)
# 6) aguarda os principais workflows terminarem e coleta conclusões
# 7) comenta no PR com resumo e cria issue se falha crítica encontrada
#
# Segurança:
# - AUTO_MERGE está desligado por padrão. Para habilitar, passe 'true' como 2º argumento
# - Não manipula GitHub Secrets

BRANCH="${1:-feat/whatsapp-clinicid-filters}"
AUTO_MERGE="${2:-false}"

# Workflows prioritários que vamos monitorar (nomes exatos devem existir no repo)
WORKFLOWS=("Agent Orchestrator - run agent scripts in sequence (robust)" "TypeScript Guardian" "Register Fila Fallback (AST)" "Docker Builder" "WhatsApp Monitor")

echo "Fast Orchestrator - branch=${BRANCH} auto_merge=${AUTO_MERGE}"
echo "Verificando ambiente..."

# checar gh e git
if ! command -v gh >/dev/null 2>&1; then
  echo "ERRO: gh CLI não encontrado. Faça 'gh auth login' no runner antes de rodar."
  exit 2
fi
if ! command -v git >/dev/null 2>&1; then
  echo "ERRO: git não encontrado."
  exit 2
fi

# garantir estar na raiz do repo (heurística: existir .git)
if [ ! -d ".git" ]; then
  echo "ERRO: .git não encontrado. Rode este script na raiz do repositório."
  exit 3
fi

# 1) Aplicar patches se existirem (safe apply)
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
    echo "Patch não encontrado (pulando): $PATCH"
  fi
}

# Lista de patches esperados (ajuste nomes se o repo usar outros)
PATCHES=("patch-clinicId-filters.patch" "patch-agent-workflows.patch" "patch-agent-workflows-2.patch")

for p in "${PATCHES[@]}"; do
  apply_patch_if_exists "$p"
done

# 2) Commit + push se houver mudanças
if [ -n "$(git status --porcelain)" ]; then
  echo "Mudanças detectadas. Commitando e pushando na branch atual..."
  git add -A
  git commit -m "chore(ci): apply patches and prepare orchestrator run [auto]" || true
  # push to target branch
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "Branch atual é $CURRENT_BRANCH; criando/updating branch alvo $BRANCH"
    git checkout -B "$BRANCH"
  fi
  git push -u origin "$BRANCH" || echo "Push falhou — verifique permissões"
else
  echo "Nenhuma mudança local para commitar."
fi

# 3) Detectar PR associado (se houver)
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)
if [ -n "$PR_NUMBER" ]; then
  echo "PR detectado: #$PR_NUMBER para branch $BRANCH"
else
  echo "Nenhum PR aberto detectado para branch $BRANCH"
fi

# 4) Disparar agent orchestrator workflow se existir, senão chamar script run-agents-all.sh
echo "Disparando Agent Orchestrator workflow (ou run-agents-all.sh se disponível)..."

# preferir workflow dispatch
WORKFLOW_NAME="Agent Orchestrator - run agent scripts in sequence (robust)"
WF_EXISTS=$(gh workflow list --limit 200 --json name --jq ".[] | select(.name==\"$WORKFLOW_NAME\") | .name" 2>/dev/null || true)

if [ -n "$WF_EXISTS" ]; then
  echo "Workflow '$WORKFLOW_NAME' encontrado. Disparando..."
  gh workflow run "$WORKFLOW_NAME" --ref "$BRANCH" || echo "Falha ao disparar workflow; continuando"
else
  echo "Workflow '$WORKFLOW_NAME' não encontrado. Verificando script local ./scripts/agent/run-agents-all.sh..."
  if [ -x "./scripts/agent/run-agents-all.sh" ]; then
    echo "Script run-agents-all.sh encontrado - executando localmente (vai disparar workflows e comentar PR se detectado)..."
    ./scripts/agent/run-agents-all.sh "$BRANCH" "${PR_NUMBER:-}" "$AUTO_MERGE" || echo "run-agents-all.sh retornou com erro; continuar para monitoramento dos workflows."
  else
    echo "Nenhum orquestrador encontrado (workflow ou script). Abortando."
    exit 4
  fi
fi

# 5) Aguardar execuções dos workflows listados e coletar conclusões
echo "Aguardando conclusão dos workflows principais (isso pode levar alguns minutos)..."

declare -A WORKFLOW_CONCLUSIONS
for wf in "${WORKFLOWS[@]}"; do
  echo "Procurando runs recentes do workflow: $wf"
  # pegar último run para a branch
  # list -> pegar databaseId do primeiro que tenha headBranch=BRANCH
  run_id=$(gh run list --workflow "$wf" --branch "$BRANCH" --limit 20 --json databaseId,headBranch,status,conclusion --jq '.[] | select(.headBranch=="'"$BRANCH"'") | .databaseId' 2>/dev/null | head -n1 || true)
  if [ -z "$run_id" ]; then
    echo "Nenhum run encontrado para workflow $wf na branch $BRANCH (pulando)"
    WORKFLOW_CONCLUSIONS["$wf"]="not_found"
    continue
  fi
  echo "Run id encontrado ($wf): $run_id — aguardando conclusão..."
  # poll
  while true; do
    sleep 6
    stat="$(gh run view "$run_id" --json status,conclusion --jq '.status + "|" + (.conclusion // "")' 2>/dev/null || true)"
    if [ -z "$stat" ]; then
      echo "Não consegui obter status para run $run_id; repetindo..."
      continue
    fi
    echo "  status = $stat"
    if [[ "$stat" =~ "completed" ]]; then
      concl=$(echo "$stat" | cut -d'|' -f2)
      WORKFLOW_CONCLUSIONS["$wf"]="$concl"
      echo "  conclusão do $wf -> $concl"
      break
    fi
  done
done

# 6) Construir resumo para comentar no PR (ou exibir)
SUMMARY="🔁 Orquestrador automático executado para branch \`$BRANCH\`.\n\nResultados dos workflows:\n"
CRITICAL_FAILURE=false
for wf in "${WORKFLOWS[@]}"; do
  concl="${WORKFLOW_CONCLUSIONS[$wf]}"
  if [ -z "$concl" ] || [ "$concl" = "not_found" ]; then
    SUMMARY+="- $wf : (no run found)\n"
  else
    SUMMARY+="- $wf : $concl\n"
    # considerar failed/timed_out/cancelled como crítica
    if [[ "$concl" =~ "failure|cancelled|timed_out|action_required" ]]; then
      CRITICAL_FAILURE=true
    fi
  fi
done

# 7) Postar comentário no PR se detectado
if [ -n "$PR_NUMBER" ]; then
  echo -e "Comentando PR #$PR_NUMBER com resumo..."
  gh pr comment "$PR_NUMBER" --body "$SUMMARY" || echo "Falha ao comentar no PR"
else
  echo -e "Resumo (sem PR):\n$SUMMARY"
fi

# 8) Se falha crítica: criar issue automática com artefato de aviso
if [ "$CRITICAL_FAILURE" = "true" ]; then
  ISSUE_TITLE="INCIDENT: workflows falharam para $BRANCH"
  ISSUE_BODY="Orquestrador automático detectou falha em pelo menos um workflow para branch \`$BRANCH\`.\n\nResumo:\n$SUMMARY\n\nAção sugerida: abrir PR #$PR_NUMBER para investigação e anexar logs do run (Actions → run → logs)."
  echo "Falha crítica detectada. Criando issue de incidente..."
  gh issue create --title "$ISSUE_TITLE" --body "$ISSUE_BODY" --label "incident,priority/high" || echo "Falha ao criar issue (verifique permissões)"
fi

# 9) Auto-merge (opcional; só se auto_merge=true)
if [ "$AUTO_MERGE" = "true" ] && [ -n "$PR_NUMBER" ]; then
  echo "AUTO_MERGE=true — verificando condições para merge automático no PR #$PR_NUMBER..."
  # checar aprovação humana
  approvals=$(gh pr review --list --pr "$PR_NUMBER" --json state,author --jq '.[] | select(.state=="APPROVED") | .author.login' 2>/dev/null || true)
  if [ -z "$approvals" ]; then
    echo "Nenhuma aprovação humana detectada. Abortando auto-merge."
  else
    # checar checks conclusion global (simplified)
    conclusion=$(gh pr checks "$PR_NUMBER" --json conclusion --jq '.conclusion' 2>/dev/null || true)
    if [ "$conclusion" = "SUCCESS" ] || [ "$conclusion" = "success" ]; then
      echo "Checks OK e aprovação presente — realizando merge squash e deletando branch..."
      gh pr merge "$PR_NUMBER" --squash --delete-branch || echo "Falha no merge automático"
    else
      echo "Checks não estão com conclusão SUCCESS ($conclusion). Abortando auto-merge."
    fi
  fi
fi

echo "Fast Orchestrator finalizado."
