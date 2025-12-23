#!/bin/bash
# Script: apply-patches.sh
# Description: Automatically applies patches if they exist
# Usage: ./scripts/agent/apply-patches.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "🔧 Applying patches..."

# Apply clinicId filters patch
if [ -f "patch-clinicId-filters.patch" ]; then
  echo "Applying patch-clinicId-filters.patch..."
  if git apply patch-clinicId-filters.patch 2>/dev/null; then
    echo "✅ patch-clinicId-filters.patch applied successfully"
  else
    echo "⚠️  patch-clinicId-filters.patch already applied or error occurred"
  fi
else
  echo "ℹ️  patch-clinicId-filters.patch not found"
fi

# Apply agent workflows patch
if [ -f "patch-agent-workflows.patch" ]; then
  echo "Applying patch-agent-workflows.patch..."
  if git apply patch-agent-workflows.patch 2>/dev/null; then
    echo "✅ patch-agent-workflows.patch applied successfully"
  else
    echo "⚠️  patch-agent-workflows.patch already applied or error occurred"
  fi
else
  echo "ℹ️  patch-agent-workflows.patch not found"
fi

# Stage and commit changes if any
if [ -n "$(git status --porcelain)" ]; then
  echo "Staging changes..."
  git add .
  
  if git commit -m "chore: apply clinicId & agent workflows patches" 2>/dev/null; then
    echo "✅ Changes committed"
    
    # Push changes if we have permission
    if git push origin HEAD 2>/dev/null; then
      echo "✅ Changes pushed successfully"
    else
      echo "⚠️  Could not push changes (may need manual push)"
    fi
  else
    echo "ℹ️  Nothing to commit"
  fi
else
  echo "ℹ️  No changes to commit"
fi

echo "✅ Patch application completed"
