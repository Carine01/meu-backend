#!/bin/bash
# Script to verify git repository status and pull configuration
# Usage: ./scripts/verify-git-status.sh

echo "🔍 Git Repository Status Verification"
echo "======================================="
echo ""

# Check current branch
echo "📍 Current Branch:"
git branch --show-current
echo ""

# Check git status
echo "📊 Git Status:"
git status --short --branch
echo ""

# Check remote configuration
echo "🌐 Remote Configuration:"
git remote -v
echo ""

# Check pull configuration
echo "⚙️  Git Pull Configuration:"
echo "  pull.rebase: $(git config --get pull.rebase || echo 'not set (default: false)')"
echo ""

# Check if there are changes to pull
echo "🔄 Checking for remote changes..."
git fetch --dry-run 2>&1 || echo "Note: Fetch may fail due to authentication in some environments"
echo ""

# Show last 5 commits
echo "📝 Recent Commits:"
git log --oneline -5
echo ""

# Compare with remote
echo "🔍 Comparing with remote branch..."
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
BASE=$(git merge-base @ @{u} 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Repository is up-to-date with remote"
elif [ "$LOCAL" = "$BASE" ]; then
    echo "⬇️  Need to pull - remote has new commits"
elif [ "$REMOTE" = "$BASE" ]; then
    echo "⬆️  Need to push - local has new commits"
else
    echo "🔀 Branches have diverged - may need to merge or rebase"
fi

echo ""
echo "======================================="
echo "✅ Verification complete!"
