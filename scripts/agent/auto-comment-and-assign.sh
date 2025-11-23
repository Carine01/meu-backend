#!/usr/bin/env bash
set -euo pipefail

# scripts/agent/auto-comment-and-assign.sh
# Uso:
#   ./auto-comment-and-assign.sh <PR_NUMBER> "<REVIEWER1,REVIEWER2>" "label1,label2"
# Se PR_NUMBER vazio, tenta detectar PR da branch atual.
PR_NUMBER=${1:-""}
REVIEWERS=${2:-""}
LABELS=${3:-"implementation,priority/high"}

COMMENT_BODY=$(cat <<'EOF'
Automação: iniciando checks automáticos.

Checklist (automático):
- [ ] TypeScript Guardian (build + tests)
- [ ] Quality Gate (no console.log / secrets)
- [ ] register-fallback aplicado (AST)
- [ ] Docker Builder (build + smoke)
- [ ] Testes unitários (coverage)
- [ ] Revisão humana obrigatória

Por favor, revisem com foco em: clinicId filters, FilaService (fallback), e segredos no código.
EOF
)

# Detect PR number if not informado
if [ -z "$PR_NUMBER" ]; then
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  PR_NUMBER=$(gh pr list --state open --json number,headRefName --jq --arg branch "$current_branch" '.[] | select(.headRefName==$branch) | .number' || true)
  if [ -z "$PR_NUMBER" ]; then
    echo "PR_NUMBER não fornecido e não foi possível detectar PR da branch atual."
    exit 1
  fi
fi

echo "Operando no PR #$PR_NUMBER"

# Comment
gh pr comment "$PR_NUMBER" --body "$COMMENT_BODY"
echo "Comentário adicionado."

# Add labels
IFS=',' read -ra LAB_ARR <<< "$LABELS"
for l in "${LAB_ARR[@]}"; do
  gh pr edit "$PR_NUMBER" --add-label "$l" || echo "Falha ao adicionar label $l (verificar permissões)."
done
echo "Labels aplicadas: $LABELS"

# Add reviewers
if [ -n "$REVIEWERS" ]; then
  # reviewers separados por vírgula
  gh pr edit "$PR_NUMBER" --add-reviewer "$REVIEWERS" || echo "Falha ao adicionar reviewers: $REVIEWERS"
  echo "Reviewers solicitados: $REVIEWERS"
fi

echo "Pronto — comentário, labels e reviewers configurados."
