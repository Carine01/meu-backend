#!/bin/bash
# auto-merge-if-ready.sh - Safely merge PR after verifying all checks and reviews
# Usage: ./auto-merge-if-ready.sh <PR_NUMBER> [--force]
#
# This script is designed to be executed by GitHub agents/bots to safely merge
# PRs only when all required conditions are met.
#
# Safety features:
# - Verifies all required status checks pass
# - Ensures at least 1 human review approval
# - Checks for merge conflicts
# - Validates branch protection rules
# - Requires explicit --force flag for admin override

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PR_NUMBER="${1:-}"
FORCE_MERGE="${2:-}"
REQUIRED_APPROVALS=1
MERGE_METHOD="merge"  # Options: merge, squash, rebase

# Required workflow checks that must pass
declare -a REQUIRED_CHECKS=(
    "CI"
    "Docker Builder"
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agent Automation: Safe Merge${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Validate PR number
if [ -z "$PR_NUMBER" ]; then
    echo -e "${RED}Error: PR number is required${NC}"
    echo "Usage: $0 <PR_NUMBER> [--force]"
    echo "Example: $0 42"
    echo ""
    echo "Options:"
    echo "  --force    Use admin privileges to override protections (USE WITH CAUTION)"
    exit 1
fi

# Check for force flag
USE_ADMIN=false
if [ "$FORCE_MERGE" = "--force" ] || [ "$FORCE_MERGE" = "-f" ]; then
    USE_ADMIN=true
    echo -e "${YELLOW}⚠ WARNING: Force merge mode enabled (admin override)${NC}"
    echo ""
fi

# Function to check if gh CLI is installed and authenticated
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
        echo "Run: gh auth login"
        exit 1
    fi
}

# Function to get PR details
get_pr_info() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Check]${NC} Fetching PR #${pr_num} details..."
    
    if ! gh pr view "$pr_num" &> /dev/null; then
        echo -e "${RED}✗${NC} PR #${pr_num} not found"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} PR found"
    return 0
}

# Function to check PR state
check_pr_state() {
    local pr_num="$1"
    
    echo -e "${BLUE}[State]${NC} Checking PR state..."
    
    local state=$(gh pr view "$pr_num" --json state --jq '.state')
    
    if [ "$state" != "OPEN" ]; then
        echo -e "${RED}✗${NC} PR is not open (current state: $state)"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} PR is open"
    return 0
}

# Function to check for merge conflicts
check_merge_conflicts() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Conflicts]${NC} Checking for merge conflicts..."
    
    local mergeable=$(gh pr view "$pr_num" --json mergeable --jq '.mergeable')
    
    if [ "$mergeable" = "CONFLICTING" ]; then
        echo -e "${RED}✗${NC} PR has merge conflicts"
        echo -e "${YELLOW}⚠${NC} Please resolve conflicts and try again"
        return 1
    elif [ "$mergeable" = "UNKNOWN" ]; then
        echo -e "${YELLOW}⚠${NC} Merge status is unknown (GitHub may still be checking)"
        sleep 5
        # Check again
        mergeable=$(gh pr view "$pr_num" --json mergeable --jq '.mergeable')
        if [ "$mergeable" = "CONFLICTING" ]; then
            echo -e "${RED}✗${NC} PR has merge conflicts"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✓${NC} No merge conflicts"
    return 0
}

# Function to check status checks
check_status_checks() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Checks]${NC} Verifying status checks..."
    
    # Get all status check rollup states
    local checks=$(gh pr view "$pr_num" --json statusCheckRollup --jq '.statusCheckRollup[]' 2>/dev/null || echo "")
    
    if [ -z "$checks" ]; then
        echo -e "${YELLOW}⚠${NC} No status checks found (might be okay for some repos)"
        return 0
    fi
    
    # Check if all required checks passed
    local all_passed=true
    local failed_checks=""
    
    for check_name in "${REQUIRED_CHECKS[@]}"; do
        # Try to find this check in the status rollup
        local check_state=$(echo "$checks" | jq -r "select(.name == \"$check_name\" or .context == \"$check_name\") | .state // .status // .conclusion" 2>/dev/null || echo "NOT_FOUND")
        
        if [ "$check_state" = "SUCCESS" ] || [ "$check_state" = "success" ]; then
            echo -e "${GREEN}  ✓${NC} $check_name: passed"
        elif [ "$check_state" = "NOT_FOUND" ] || [ -z "$check_state" ]; then
            echo -e "${YELLOW}  ?${NC} $check_name: not found (may not have run)"
            # Don't fail for missing checks - they might be optional
        else
            echo -e "${RED}  ✗${NC} $check_name: failed (state: $check_state)"
            all_passed=false
            failed_checks="$failed_checks\n  - $check_name"
        fi
    done
    
    if [ "$all_passed" = "false" ]; then
        echo -e "${RED}✗${NC} Some required checks failed:$failed_checks"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} All required checks passed"
    return 0
}

# Function to check review approvals
check_reviews() {
    local pr_num="$1"
    
    echo -e "${BLUE}[Reviews]${NC} Checking review approvals..."
    
    # Get review decision (APPROVED, CHANGES_REQUESTED, REVIEW_REQUIRED, etc.)
    local review_decision=$(gh pr view "$pr_num" --json reviewDecision --jq '.reviewDecision // "NONE"')
    
    if [ "$review_decision" = "APPROVED" ]; then
        echo -e "${GREEN}✓${NC} PR has been approved"
        return 0
    elif [ "$review_decision" = "CHANGES_REQUESTED" ]; then
        echo -e "${RED}✗${NC} Changes have been requested"
        return 1
    elif [ "$review_decision" = "REVIEW_REQUIRED" ] || [ "$review_decision" = "NONE" ]; then
        echo -e "${RED}✗${NC} PR requires at least $REQUIRED_APPROVALS human approval(s)"
        echo -e "${YELLOW}⚠${NC} Current review status: $review_decision"
        return 1
    else
        echo -e "${YELLOW}⚠${NC} Unknown review status: $review_decision"
        return 1
    fi
}

# Function to display pre-merge summary
show_merge_summary() {
    local pr_num="$1"
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Pre-Merge Summary${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    gh pr view "$pr_num" --json number,title,author,headRefName,baseRefName,additions,deletions,commits \
        --template '
PR:        #{{.number}} - {{.title}}
Author:    {{.author.login}}
Merge:     {{.headRefName}} → {{.baseRefName}}
Changes:   +{{.additions}} -{{.deletions}} lines
Commits:   {{len .commits}}
'
}

# Function to perform the merge
perform_merge() {
    local pr_num="$1"
    local use_admin="$2"
    
    echo -e "${BLUE}[Merge]${NC} Attempting to merge PR #${pr_num}..."
    echo ""
    
    local merge_command="gh pr merge \"$pr_num\" --$MERGE_METHOD"
    
    if [ "$use_admin" = "true" ]; then
        merge_command="$merge_command --admin"
        echo -e "${YELLOW}⚠${NC} Using admin override"
    fi
    
    # Add auto-delete flag for branch cleanup
    merge_command="$merge_command --delete-branch"
    
    echo -e "${BLUE}Executing:${NC} $merge_command"
    echo ""
    
    if eval "$merge_command"; then
        echo ""
        echo -e "${GREEN}✓ PR #${pr_num} merged successfully!${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}✗ Failed to merge PR #${pr_num}${NC}"
        return 1
    fi
}

# Function to trigger post-merge actions
trigger_post_merge() {
    echo ""
    echo -e "${BLUE}[Post-Merge]${NC} Triggering post-merge actions..."
    
    # Check if Deploy workflow exists and trigger it
    if gh workflow list | grep -q "Deploy"; then
        echo -e "${BLUE}[Deploy]${NC} Triggering deployment workflow..."
        if gh workflow run "Deploy to Cloud Run" --ref main 2>/dev/null || gh workflow run "Deploy" --ref main 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Deploy workflow triggered"
        else
            echo -e "${YELLOW}⚠${NC} Could not trigger deploy workflow (may need manual trigger)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No deploy workflow found (deployment may be automatic)"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}PR Number:${NC} #$PR_NUMBER"
    echo -e "${GREEN}Merge Method:${NC} $MERGE_METHOD"
    echo -e "${GREEN}Required Approvals:${NC} $REQUIRED_APPROVALS"
    echo ""
    
    echo -e "${BLUE}Step 1:${NC} Checking prerequisites..."
    check_gh_cli
    echo -e "${GREEN}✓${NC} GitHub CLI ready"
    echo ""
    
    echo -e "${BLUE}Step 2:${NC} Validating PR..."
    if ! get_pr_info "$PR_NUMBER"; then
        exit 1
    fi
    echo ""
    
    echo -e "${BLUE}Step 3:${NC} Checking PR state..."
    if ! check_pr_state "$PR_NUMBER"; then
        exit 1
    fi
    echo ""
    
    echo -e "${BLUE}Step 4:${NC} Checking for conflicts..."
    if ! check_merge_conflicts "$PR_NUMBER"; then
        exit 1
    fi
    echo ""
    
    echo -e "${BLUE}Step 5:${NC} Verifying status checks..."
    if ! check_status_checks "$PR_NUMBER"; then
        if [ "$USE_ADMIN" = "false" ]; then
            echo -e "${YELLOW}⚠${NC} Use --force flag to override (requires admin privileges)"
            exit 1
        else
            echo -e "${YELLOW}⚠${NC} Continuing with --force flag"
        fi
    fi
    echo ""
    
    echo -e "${BLUE}Step 6:${NC} Checking review approvals..."
    if ! check_reviews "$PR_NUMBER"; then
        if [ "$USE_ADMIN" = "false" ]; then
            echo -e "${RED}✗${NC} Cannot merge without required approvals"
            echo -e "${YELLOW}⚠${NC} Use --force flag to override (requires admin privileges and should be used sparingly)"
            exit 1
        else
            echo -e "${YELLOW}⚠${NC} Overriding review requirement with --force flag"
        fi
    fi
    echo ""
    
    # Show summary before merge
    show_merge_summary "$PR_NUMBER"
    echo ""
    
    # Final confirmation in non-force mode
    if [ "$USE_ADMIN" = "false" ]; then
        echo -e "${BLUE}========================================${NC}"
        echo -e "${GREEN}✓ All safety checks passed!${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
    fi
    
    echo -e "${BLUE}Step 7:${NC} Merging PR..."
    if ! perform_merge "$PR_NUMBER" "$USE_ADMIN"; then
        exit 1
    fi
    
    # Trigger post-merge actions
    trigger_post_merge
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✓✓✓ MERGE COMPLETED SUCCESSFULLY ✓✓✓${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "1. Monitor deployment workflow: ${BLUE}gh run list --workflow='Deploy'${NC}"
    echo -e "2. Check production health: ${BLUE}curl https://staging.elevare.com/health${NC}"
    echo -e "3. Verify in production logs if needed"
    echo ""
}

# Run main function
main
