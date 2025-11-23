#!/bin/bash
# =============================================================================
# run-all-checks.sh
# Agent automation script to run all GitHub workflow checks on a PR branch
# =============================================================================
# Usage: ./scripts/agent/run-all-checks.sh <BRANCH_NAME>
# Example: ./scripts/agent/run-all-checks.sh feat/whatsapp-clinicid-filters
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if branch name is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Branch name is required${NC}"
    echo "Usage: $0 <BRANCH_NAME>"
    echo "Example: $0 feat/whatsapp-clinicid-filters"
    exit 1
fi

BRANCH="$1"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🤖 Agent: Running All Checks${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Branch: ${GREEN}${BRANCH}${NC}"
echo ""

# Function to trigger a workflow
trigger_workflow() {
    local workflow_name="$1"
    local workflow_file="$2"
    
    echo -e "${YELLOW}⏳ Triggering: ${workflow_name}${NC}"
    
    if gh workflow run "$workflow_file" --ref "$BRANCH" 2>/dev/null; then
        echo -e "${GREEN}✅ Successfully triggered: ${workflow_name}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Could not trigger ${workflow_name} (may not have workflow_dispatch)${NC}"
        return 1
    fi
}

# Function to check workflow status
check_workflow_status() {
    local workflow_name="$1"
    echo -e "${BLUE}📊 Checking status: ${workflow_name}${NC}"
    
    # Get the latest workflow runs for this branch
    gh run list --workflow="$workflow_name" --branch="$BRANCH" --limit=5 --json status,conclusion,name,displayTitle,createdAt || {
        echo -e "${YELLOW}⚠️  Could not check status for: ${workflow_name}${NC}"
    }
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Triggering Workflows${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# List of workflows to trigger
# Note: Only workflows with workflow_dispatch can be triggered manually

# 1. TypeScript Guardian (build + test)
echo -e "${YELLOW}1. TypeScript Guardian (CI)${NC}"
trigger_workflow "CI" "ci.yml"
echo ""

# 2. Docker Builder (build image + smoke test)
echo -e "${YELLOW}2. Docker Builder${NC}"
trigger_workflow "Docker Builder" "docker-builder.yml"
echo ""

# 3. Quality Gate (console.log detection)
echo -e "${YELLOW}3. Quality Gate${NC}"
trigger_workflow "Quality Gate" "quality-gate.yml"
echo ""

# 4. Register Fila Fallback (AST script)
echo -e "${YELLOW}4. Register Fila Fallback (AST)${NC}"
trigger_workflow "Register Fila Fallback (AST)" "register-fallback.yml"
echo ""

# 5. WhatsApp Monitor (optional health check)
echo -e "${YELLOW}5. WhatsApp Monitor${NC}"
trigger_workflow "WhatsApp Monitor" "whatsapp-monitor.yml"
echo ""

# 6. Deploy (only if configured with workflow_dispatch)
echo -e "${YELLOW}6. Deploy Workflow (optional)${NC}"
trigger_workflow "Deploy to Cloud Run" "deploy.yml"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Monitoring Workflow Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Run this after a few minutes to check status:${NC}"
echo ""
echo -e "  gh run list --branch $BRANCH --limit 10"
echo ""
echo -e "${YELLOW}Or check individual workflow status:${NC}"
echo ""

# Check status for each workflow
check_workflow_status "CI"
echo ""
check_workflow_status "Docker Builder"
echo ""
check_workflow_status "Quality Gate"
echo ""
check_workflow_status "Register Fila Fallback (AST)"
echo ""
check_workflow_status "WhatsApp Monitor"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Useful Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}View workflow logs:${NC}"
echo "  gh run list --branch $BRANCH"
echo "  gh run view <RUN_ID> --log"
echo ""
echo -e "${YELLOW}Watch workflow in browser:${NC}"
echo "  gh run watch"
echo ""
echo -e "${YELLOW}Check PR checks status:${NC}"
echo "  gh pr checks <PR_NUMBER>"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All checks have been triggered!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  Note: This script only triggers workflows that have 'workflow_dispatch' enabled.${NC}"
echo -e "${YELLOW}    Workflows triggered by 'pull_request' events will run automatically when PR is opened.${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Monitor workflow status with: gh run list --branch $BRANCH"
echo "  2. Once checks pass, use auto-comment-and-assign.sh to add PR comment"
echo "  3. After review approval, use auto-merge-if-ready.sh to merge"
echo ""
