#!/bin/bash
# Script: auto-comment-and-assign.sh
# Description: Automatically adds comment to PR and assigns reviewers and labels
# Usage: ./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER> "reviewer1,reviewer2" "label1,label2"

set -e

if [ -z "$1" ]; then
  echo "❌ Error: PR number required"
  echo "Usage: $0 <PR_NUMBER> [reviewers] [labels]"
  exit 1
fi

PR_NUMBER="$1"
REVIEWERS="${2:-}"
LABELS="${3:-}"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is not installed"
  exit 1
fi

echo "🤖 Auto-commenting and assigning PR #$PR_NUMBER..."

# Add comment to PR
COMMENT="🚀 **Agentes: Orquestrador executado**

Checks disparados:
- ✅ TypeScript Guardian (build, test, lint)
- ✅ Docker Builder
- ✅ Quality Gate (console.log, secrets, large PRs)
- ✅ Test Blocker

📊 **Próximos passos:**
- Verifique Actions → Artifacts (coverage / logs)
- Se algo falhar, será criada issue automática
- Aguarde aprovação dos reviewers

---
*Comentário gerado automaticamente pelo agent*"

echo "Adding comment to PR..."
if gh pr comment "$PR_NUMBER" --body "$COMMENT" 2>/dev/null; then
  echo "✅ Comment added successfully"
else
  echo "⚠️  Could not add comment to PR"
fi

# Assign reviewers if provided
if [ -n "$REVIEWERS" ]; then
  echo "Assigning reviewers: $REVIEWERS"
  IFS=',' read -ra REVIEWER_ARRAY <<< "$REVIEWERS"
  for reviewer in "${REVIEWER_ARRAY[@]}"; do
    if gh pr edit "$PR_NUMBER" --add-reviewer "$reviewer" 2>/dev/null; then
      echo "✅ Reviewer $reviewer assigned"
    else
      echo "⚠️  Could not assign reviewer $reviewer"
    fi
  done
fi

# Add labels if provided
if [ -n "$LABELS" ]; then
  echo "Adding labels: $LABELS"
  IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"
  for label in "${LABEL_ARRAY[@]}"; do
    if gh pr edit "$PR_NUMBER" --add-label "$label" 2>/dev/null; then
      echo "✅ Label $label added"
    else
      echo "⚠️  Could not add label $label"
    fi
  done
fi

echo "✅ Auto-comment and assign completed"
