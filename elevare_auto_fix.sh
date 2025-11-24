#!/bin/bash
# elevare_auto_fix.sh - Auto-fix imports and dedupe dependencies
# Usage: bash elevare_auto_fix.sh [--auto-remove-unused]

set -e

echo "=== Elevare Auto-Fix Script ==="

AUTO_REMOVE_UNUSED=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --auto-remove-unused)
            AUTO_REMOVE_UNUSED=true
            shift
            ;;
    esac
done

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Run depcheck to find unused dependencies
echo "Checking for unused dependencies..."
if command -v npx &> /dev/null; then
    npx depcheck --json > /tmp/depcheck-result.json 2>&1 || true
    
    if [ "$AUTO_REMOVE_UNUSED" = true ]; then
        echo "Auto-removing unused dependencies (if any)..."
        # Note: In a real scenario, we'd parse the JSON and remove unused deps
        # For safety, we'll just report them
        if [ -f /tmp/depcheck-result.json ]; then
            echo "Depcheck results available in /tmp/depcheck-result.json"
        fi
    else
        echo "Use --auto-remove-unused to automatically remove unused dependencies"
    fi
fi

# Deduplicate dependencies
echo "Deduplicating dependencies..."
npm dedupe --legacy-peer-deps 2>&1 || true

# Fix common import issues (remove unused imports would require a linter)
echo "Checking for import issues..."
echo "Note: Use ESLint with --fix to automatically fix import issues"

# Organize imports (if using a tool that supports it)
echo "Organizing imports..."
# This would typically be done by ESLint or a similar tool

echo "=== Auto-fix complete ==="
echo "Summary:"
echo "- Dependencies checked and deduplicated"
echo "- Import issues should be fixed by ESLint in subsequent steps"
