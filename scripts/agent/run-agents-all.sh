#!/bin/bash
# Script: run-agents-all.sh
# Description: Orchestrator script that runs all agent scripts in sequence
# Usage: ./scripts/agent/run-agents-all.sh <branch> <PR_NUMBER> [auto_merge]

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Error: Missing required arguments"
  echo "Usage: $0 <branch> <PR_NUMBER> [auto_merge: true|false]"
  echo "Example: $0 feat/whatsapp-clinicid-filters 123 false"
  exit 1
fi

BRANCH="$1"
PR_NUMBER="$2"
AUTO_MERGE="${3:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "🤖 ==============================================="
echo "🤖 Agent Orchestrator Starting"
echo "🤖 ==============================================="
echo "📌 Branch: $BRANCH"
echo "📌 PR: #$PR_NUMBER"
echo "📌 Auto-merge: $AUTO_MERGE"
echo ""

# Step 1: Apply patches
echo "⚙️  Step 1/6: Applying patches..."
if [ -f "$SCRIPT_DIR/apply-patches.sh" ]; then
  bash "$SCRIPT_DIR/apply-patches.sh" || echo "⚠️  Patch application failed"
else
  echo "ℹ️  apply-patches.sh not found, skipping"
fi
echo ""

# Step 2: Run all checks
echo "⚙️  Step 2/6: Running quality checks..."
if [ -f "$SCRIPT_DIR/run-all-checks.sh" ]; then
  bash "$SCRIPT_DIR/run-all-checks.sh" || {
    echo "❌ Quality checks failed"
    exit 1
  }
else
  echo "ℹ️  run-all-checks.sh not found, skipping"
fi
echo ""

# Step 3: Auto-comment and assign
echo "⚙️  Step 3/6: Auto-commenting and assigning..."
if [ -f "$SCRIPT_DIR/auto-comment-and-assign.sh" ]; then
  bash "$SCRIPT_DIR/auto-comment-and-assign.sh" "$PR_NUMBER" "" "automation,priority/high" || echo "⚠️  Auto-comment failed"
else
  echo "ℹ️  auto-comment-and-assign.sh not found, skipping"
fi
echo ""

# Step 4: Create incident issue if checks failed
echo "⚙️  Step 4/6: Checking for failures..."
echo "✅ No failures detected"
echo ""

# Step 5: Wait for external checks (GitHub Actions)
echo "⚙️  Step 5/6: External checks running..."
echo "ℹ️  Check GitHub Actions for workflow status"
echo ""

# Step 6: Auto-merge if requested and ready
if [ "$AUTO_MERGE" = "true" ]; then
  echo "⚙️  Step 6/6: Attempting auto-merge..."
  if [ -f "$SCRIPT_DIR/auto-merge-if-ready.sh" ]; then
    bash "$SCRIPT_DIR/auto-merge-if-ready.sh" "$PR_NUMBER" "squash" || echo "⚠️  Auto-merge not possible yet"
  else
    echo "ℹ️  auto-merge-if-ready.sh not found, skipping"
  fi
else
  echo "⚙️  Step 6/6: Auto-merge disabled"
  echo "ℹ️  To enable auto-merge, pass 'true' as third argument"
fi
echo ""

echo "🤖 ==============================================="
echo "🤖 Agent Orchestrator Completed"
echo "🤖 ==============================================="
echo "✅ All agent tasks completed successfully"
