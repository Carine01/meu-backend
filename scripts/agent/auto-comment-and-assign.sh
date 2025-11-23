#!/usr/bin/env bash
set -euo pipefail

PR_NUMBER=${1:-""}
REVIEWERS=${2:-""}
LABELS=${3:-"implementation,priority/high"}

COMMENT_BODY=$(cat <<'EOF'
Automação: iniciando checks automáticos.

Checklist (automático):
- [ ] TypeScript Guardian (build + tests)
- [ ] Quality Gate (no console.log / secrets)
- [ ] register-fallback aplicado (quando aplicável)
- [ ] Docker Builder (quando aplicável)
- [ ] Revisão humana obrigatória

Por favor, revisem com foco em: clinicId filters, FilaService (fallback) e segredos no código.
EOF
)

if [ -z "$PR_NUMBER" ]; then
  PR_NUMBER=$(gh pr list --state open --json number,headRefName --jq ".[] | select(.headRefName==\"$(git rev-parse --abbrev-ref HEAD)\") | .number" || true)
  if [ -z "$PR_NUMBER" ]; then
    echo "PR_NUMBER não fornecido e não foi possível detectar PR da branch atual."
    exit 1
  fi
fi

echo "Operando no PR #$PR_NUMBER"

gh pr comment "$PR_NUMBER" --body "$COMMENT_BODY"
for l in $(echo "$LABELS" | tr ',' ' '); do
  gh pr edit "$PR_NUMBER" --add-label "$l" || echo "Falha ao adicionar label $l"
done

if [ -n "$REVIEWERS" ]; then
  gh pr edit "$PR_NUMBER" --add-reviewer "$REVIEWERS" || echo "Falha ao solicitar reviewers $REVIEWERS"
fi

echo "Comentário, labels e reviewers configurados."
