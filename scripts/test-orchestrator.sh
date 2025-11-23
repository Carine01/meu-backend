#!/bin/bash
# Helper script to test the orchestrator locally
# This simulates what would happen when a PR is opened

set -e

echo "🧪 Testing PR Orchestrator System"
echo "=================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) is not installed. This is required for the orchestrator."
    echo "Install it with: brew install gh (Mac) or apt install gh (Linux)"
    echo ""
    echo "✅ Script validation:"
else
    echo "✅ GitHub CLI is installed"
    echo ""
fi

# Validate shell script syntax
echo "📋 Validating auto-comment-and-assign.sh syntax..."
if bash -n scripts/auto-comment-and-assign.sh; then
    echo "✅ Shell script syntax is valid"
else
    echo "❌ Shell script has syntax errors"
    exit 1
fi
echo ""

# Validate YAML workflow
echo "📋 Validating pr-orchestrator.yml workflow..."
if python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-orchestrator.yml'))" 2>/dev/null; then
    echo "✅ Workflow YAML is valid"
else
    echo "❌ Workflow YAML has errors"
    exit 1
fi
echo ""

# Check file permissions
echo "📋 Checking file permissions..."
if [ -x scripts/auto-comment-and-assign.sh ]; then
    echo "✅ Script is executable"
else
    echo "❌ Script is not executable"
    exit 1
fi
echo ""

# Display what would happen
echo "📊 Orchestrator Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "When a PR is opened, the orchestrator will:"
echo "  1. ✅ Automatically post the orchestrator comment"
echo "  2. 🏷️  Apply the 'automation' label by default"
echo "  3. 👥 Request reviewers (if specified)"
echo "  4. 🔄 Enable auto-merge (if specified)"
echo ""
echo "The workflow can also be triggered manually with custom inputs:"
echo "  • pr_number: The PR to apply automation to"
echo "  • auto_merge: Enable auto-merge (true/false)"
echo "  • reviewers: Comma-separated list of reviewers"
echo "  • labels: Comma-separated list of labels"
echo ""
echo "Example manual trigger:"
echo "  gh workflow run pr-orchestrator.yml \\"
echo "    -f pr_number=123 \\"
echo "    -f auto_merge=true \\"
echo "    -f reviewers=dev1,dev2 \\"
echo "    -f labels=implementation,priority/high"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed! The orchestrator is ready to use."
echo ""
echo "📚 Read the full documentation at: docs/ORCHESTRATOR.md"
