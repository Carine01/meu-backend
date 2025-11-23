#!/bin/bash
# run-all-checks.sh - Execute all GitHub workflows and monitor their status
# Usage: ./run-all-checks.sh <BRANCH_NAME> [PR_NUMBER]
#
# This script is designed to be executed by GitHub agents/bots to run all
# required checks on a PR branch.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH="${1:-feat/whatsapp-clinicid-filters}"
PR_NUMBER="${2:-}"
MAX_WAIT_TIME=600  # 10 minutes max wait per workflow
POLL_INTERVAL=10   # Check status every 10 seconds

# Workflow names (must match exact names in .github/workflows/)
declare -a WORKFLOWS=(
    "CI"
    "Docker Builder"
)

# Optional workflows (won't fail if they don't exist)
declare -a OPTIONAL_WORKFLOWS=(
    "Register Fila Fallback (AST)"
    "WhatsApp Monitor"
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agent Automation: Running All Checks${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Branch:${NC} $BRANCH"
if [ -n "$PR_NUMBER" ]; then
    echo -e "${GREEN}PR Number:${NC} #$PR_NUMBER"
fi
echo ""

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
        echo "Run: gh auth login"
        exit 1
    fi
}

# Function to trigger a workflow
trigger_workflow() {
    local workflow_name="$1"
    local is_optional="${2:-false}"
    
    echo -e "${BLUE}[Workflow]${NC} Triggering: ${workflow_name}"
    
    # Try to run the workflow
    if gh workflow run "$workflow_name" --ref "$BRANCH" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Workflow triggered successfully"
        return 0
    else
        if [ "$is_optional" = "true" ]; then
            echo -e "${YELLOW}⚠${NC} Optional workflow not found or failed to trigger (continuing)"
            return 0
        else
            echo -e "${RED}✗${NC} Failed to trigger workflow"
            return 1
        fi
    fi
}

# Function to wait for workflow run to complete
wait_for_workflow() {
    local workflow_name="$1"
    local max_wait="$2"
    local start_time=$(date +%s)
    
    echo -e "${BLUE}[Monitor]${NC} Waiting for workflow: ${workflow_name}"
    
    local elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        # Get the latest run for this workflow on the branch
        local run_status=$(gh run list --workflow="$workflow_name" --branch="$BRANCH" --limit=1 --json status,conclusion --jq '.[0] | "\(.status)|\(.conclusion)"' 2>/dev/null || echo "not_found|")
        
        if [ "$run_status" = "not_found|" ] || [ -z "$run_status" ]; then
            echo -e "${YELLOW}⏳${NC} No runs found yet for $workflow_name (waiting...)"
        else
            local status=$(echo "$run_status" | cut -d'|' -f1)
            local conclusion=$(echo "$run_status" | cut -d'|' -f2)
            
            if [ "$status" = "completed" ]; then
                if [ "$conclusion" = "success" ]; then
                    echo -e "${GREEN}✓${NC} Workflow completed successfully: ${workflow_name}"
                    return 0
                else
                    echo -e "${RED}✗${NC} Workflow failed: ${workflow_name} (conclusion: ${conclusion})"
                    return 1
                fi
            else
                echo -e "${YELLOW}⏳${NC} Workflow in progress: ${workflow_name} (status: ${status})"
            fi
        fi
        
        sleep $POLL_INTERVAL
        elapsed=$(($(date +%s) - start_time))
        
        if [ $elapsed -ge $max_wait ]; then
            echo -e "${RED}✗${NC} Timeout waiting for workflow: ${workflow_name}"
            return 1
        fi
    done
}

# Function to get workflow run logs
get_workflow_logs() {
    local workflow_name="$1"
    
    echo -e "${BLUE}[Logs]${NC} Fetching logs for: ${workflow_name}"
    
    local run_id=$(gh run list --workflow="$workflow_name" --branch="$BRANCH" --limit=1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || echo "")
    
    if [ -n "$run_id" ] && [ "$run_id" != "null" ]; then
        gh run view "$run_id" --log-failed || echo -e "${YELLOW}⚠${NC} Could not fetch logs"
    else
        echo -e "${YELLOW}⚠${NC} No run ID found for $workflow_name"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Step 1:${NC} Checking prerequisites..."
    check_gh_cli
    echo -e "${GREEN}✓${NC} GitHub CLI ready"
    echo ""
    
    echo -e "${BLUE}Step 2:${NC} Triggering required workflows..."
    local all_triggered=true
    
    for workflow in "${WORKFLOWS[@]}"; do
        if ! trigger_workflow "$workflow" "false"; then
            all_triggered=false
            echo -e "${RED}✗${NC} Failed to trigger required workflow: $workflow"
        fi
        echo ""
    done
    
    echo -e "${BLUE}Step 3:${NC} Triggering optional workflows..."
    for workflow in "${OPTIONAL_WORKFLOWS[@]}"; do
        trigger_workflow "$workflow" "true"
        echo ""
    done
    
    if [ "$all_triggered" = "false" ]; then
        echo -e "${RED}✗${NC} Some required workflows failed to trigger"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} All workflows triggered successfully"
    echo ""
    
    # Give workflows a moment to start
    echo -e "${BLUE}Step 4:${NC} Waiting for workflows to start..."
    sleep 5
    echo ""
    
    echo -e "${BLUE}Step 5:${NC} Monitoring workflow execution..."
    local all_passed=true
    
    for workflow in "${WORKFLOWS[@]}"; do
        if ! wait_for_workflow "$workflow" "$MAX_WAIT_TIME"; then
            all_passed=false
            get_workflow_logs "$workflow"
        fi
        echo ""
    done
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Execution Summary${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    if [ "$all_passed" = "true" ]; then
        echo -e "${GREEN}✓ All required checks passed!${NC}"
        echo ""
        echo -e "Next steps:"
        echo -e "1. Run ${BLUE}./auto-comment-and-assign.sh $PR_NUMBER${NC} to add review checklist"
        echo -e "2. Wait for human review approval"
        echo -e "3. Run ${BLUE}./auto-merge-if-ready.sh $PR_NUMBER${NC} when ready to merge"
        exit 0
    else
        echo -e "${RED}✗ Some checks failed${NC}"
        echo ""
        echo -e "Action required:"
        echo -e "1. Review failed workflow logs above"
        echo -e "2. Fix issues and push updates"
        echo -e "3. Re-run this script"
        exit 1
    fi
}

# Run main function
main
