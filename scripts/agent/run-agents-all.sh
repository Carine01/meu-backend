#!/bin/bash

################################################################################
# run-agents-all.sh - Master script to orchestrate all agent workflows
#
# Usage:
#   ./scripts/agent/run-agents-all.sh <branch> <pr_number> <auto_merge>
#
# Arguments:
#   branch       - Branch name (e.g., feat/whatsapp-clinicid-filters)
#   pr_number    - PR number (e.g., 123) - optional
#   auto_merge   - true/false - whether to attempt auto-merge (default: false)
#
# Example:
#   ./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 false
#
# Requirements:
#   - gh CLI installed and authenticated
#   - GITHUB_TOKEN environment variable set
################################################################################

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate arguments
if [ $# -lt 1 ]; then
    log_error "Usage: $0 <branch> [pr_number] [auto_merge]"
    echo ""
    echo "Examples:"
    echo "  $0 feat/whatsapp-clinicid-filters"
    echo "  $0 feat/whatsapp-clinicid-filters 123 false"
    echo "  $0 feat/whatsapp-clinicid-filters 123 true"
    exit 1
fi

BRANCH=$1
PR_NUMBER=${2:-""}
AUTO_MERGE=${3:-"false"}

log_info "Starting Agent Orchestration"
log_info "Branch: $BRANCH"
log_info "PR: ${PR_NUMBER:-"None"}"
log_info "Auto-merge: $AUTO_MERGE"

# Validate gh CLI is installed
if ! command -v gh &> /dev/null; then
    log_error "gh CLI is not installed. Install with: https://cli.github.com/"
    exit 1
fi

# Validate gh is authenticated
if ! gh auth status &> /dev/null; then
    log_error "gh CLI is not authenticated. Run: gh auth login"
    exit 1
fi

# Function to trigger a workflow and return run ID
trigger_workflow() {
    local workflow_name=$1
    local workflow_file=$2
    
    log_info "Triggering workflow: $workflow_name"
    
    # Trigger the workflow
    gh workflow run "$workflow_file" --ref "$BRANCH" -f branch="$BRANCH" 2>&1
    
    # Wait a bit for the workflow to be created
    sleep 5
    
    # Get the most recent run ID for this workflow
    local run_id=$(gh run list --workflow="$workflow_file" --branch="$BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId')
    
    if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
        log_warning "Could not get run ID for $workflow_name, will check status later"
        echo ""
    else
        log_success "Started $workflow_name (Run ID: $run_id)"
        echo "$run_id"
    fi
}

# Function to wait for a workflow run to complete
wait_for_run() {
    local run_id=$1
    local workflow_name=$2
    local max_wait=600  # 10 minutes
    local elapsed=0
    
    if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
        log_warning "No run ID for $workflow_name, skipping wait"
        return 0
    fi
    
    log_info "Waiting for $workflow_name (Run ID: $run_id)..."
    
    while [ $elapsed -lt $max_wait ]; do
        local status=$(gh run view "$run_id" --json status,conclusion --jq '.status')
        local conclusion=$(gh run view "$run_id" --json status,conclusion --jq '.conclusion')
        
        if [ "$status" = "completed" ]; then
            if [ "$conclusion" = "success" ]; then
                log_success "$workflow_name completed successfully"
                return 0
            else
                log_error "$workflow_name failed with conclusion: $conclusion"
                return 1
            fi
        fi
        
        sleep 10
        elapsed=$((elapsed + 10))
        echo -n "."
    done
    
    echo ""
    log_warning "$workflow_name timed out after ${max_wait}s"
    return 1
}

# Array to store workflow results
declare -A workflow_results
declare -A workflow_run_ids

# List of workflows to run
declare -a workflows=(
    "TypeScript Guardian:agent-typescript-guardian.yml"
    "Register Fila Fallback:agent-register-fila-fallback.yml"
    "Docker Builder:docker-builder.yml"
    "WhatsApp Monitor:agent-whatsapp-monitor.yml"
    "Agent Orchestrator:agent-orchestrator.yml"
)

# Trigger all workflows
log_info "Triggering all workflows..."
echo ""

for workflow in "${workflows[@]}"; do
    IFS=':' read -r name file <<< "$workflow"
    run_id=$(trigger_workflow "$name" "$file")
    workflow_run_ids["$name"]=$run_id
    sleep 2  # Small delay between triggers
done

echo ""
log_info "All workflows triggered. Waiting for completion..."
echo ""

# Wait for all workflows to complete
failed_count=0
success_count=0

for workflow in "${workflows[@]}"; do
    IFS=':' read -r name file <<< "$workflow"
    run_id=${workflow_run_ids["$name"]}
    
    if wait_for_run "$run_id" "$name"; then
        workflow_results["$name"]="✅ Success"
        success_count=$((success_count + 1))
    else
        workflow_results["$name"]="❌ Failed"
        failed_count=$((failed_count + 1))
    fi
    echo ""
done

# Generate summary
log_info "Generating summary..."
echo ""
echo "=========================================="
echo "🤖 Agent Orchestration Summary"
echo "=========================================="
echo "Branch: $BRANCH"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Results:"
for workflow in "${workflows[@]}"; do
    IFS=':' read -r name file <<< "$workflow"
    echo "  ${workflow_results[$name]} $name"
done
echo ""
echo "Summary: $success_count succeeded, $failed_count failed"
echo "=========================================="

# Post comment to PR if PR number is provided
if [ -n "$PR_NUMBER" ]; then
    log_info "Posting summary comment to PR #$PR_NUMBER"
    
    # Create comment body
    comment_body="## 🤖 Agent Orchestration Results

**Branch:** \`$BRANCH\`
**Run Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Triggered by:** @$GITHUB_ACTOR

### Workflow Results:

"
    
    for workflow in "${workflows[@]}"; do
        IFS=':' read -r name file <<< "$workflow"
        run_id=${workflow_run_ids["$name"]}
        result=${workflow_results[$name]}
        
        if [ -n "$run_id" ] && [ "$run_id" != "null" ]; then
            run_url="https://github.com/$GITHUB_REPOSITORY/actions/runs/$run_id"
            comment_body+="- $result **$name** ([View logs]($run_url))
"
        else
            comment_body+="- $result **$name**
"
        fi
    done
    
    comment_body+="
### Summary

✅ **Success:** $success_count workflows
❌ **Failed:** $failed_count workflows

---

<details>
<summary>📋 Monitoring Commands</summary>

\`\`\`bash
# List recent runs for this branch
gh run list --branch $BRANCH --limit 10

# View logs for a specific run
gh run view <RUN_ID> --log --exit-status

# View this PR
gh pr view $PR_NUMBER --comments
\`\`\`

</details>
"
    
    # Post comment
    echo "$comment_body" | gh pr comment "$PR_NUMBER" --body-file -
    
    log_success "Comment posted to PR #$PR_NUMBER"
fi

# Attempt auto-merge if enabled and all checks passed
if [ "$AUTO_MERGE" = "true" ] && [ "$failed_count" -eq 0 ] && [ -n "$PR_NUMBER" ]; then
    log_info "Auto-merge enabled and all checks passed. Checking merge eligibility..."
    
    # Check if PR is mergeable
    pr_mergeable=$(gh pr view "$PR_NUMBER" --json mergeable --jq '.mergeable')
    pr_state=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
    
    if [ "$pr_state" = "OPEN" ] && [ "$pr_mergeable" = "MERGEABLE" ]; then
        log_info "Attempting auto-merge (squash)..."
        
        if gh pr merge "$PR_NUMBER" --squash --auto; then
            log_success "Auto-merge enabled for PR #$PR_NUMBER"
            echo "The PR will be merged automatically when all required checks pass and approvals are met."
        else
            log_warning "Failed to enable auto-merge. Check PR requirements (approvals, branch protection, etc.)"
        fi
    else
        log_warning "PR is not in a mergeable state (state: $pr_state, mergeable: $pr_mergeable)"
        log_info "Manual merge required"
    fi
elif [ "$AUTO_MERGE" = "true" ] && [ "$failed_count" -gt 0 ]; then
    log_warning "Auto-merge enabled but $failed_count workflow(s) failed. Skipping merge."
fi

echo ""
if [ "$failed_count" -eq 0 ]; then
    log_success "All workflows completed successfully! 🎉"
    exit 0
else
    log_error "Some workflows failed. Please check the logs above."
    exit 1
fi
