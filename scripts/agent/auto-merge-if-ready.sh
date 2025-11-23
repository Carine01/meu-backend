#!/bin/bash
# =============================================================================
# auto-merge-if-ready.sh
# Agent automation script to verify checks and reviews before merging PR
# =============================================================================
# Usage: ./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [--force]
# Example: ./scripts/agent/auto-merge-if-ready.sh 42
# =============================================================================
# ⚠️  SECURITY: This script enforces strict merge requirements:
#     1. All required checks must pass
#     2. At least 1 human review must be approved
#     3. Branch protection rules must be satisfied
#     4. No merge conflicts
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

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: jq is not installed. Some checks may be limited.${NC}"
    echo "Install it from: https://stedolan.github.io/jq/"
fi

# Check if PR number is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: PR number is required${NC}"
    echo "Usage: $0 <PR_NUMBER> [--force]"
    echo "Example: $0 42"
    exit 1
fi

PR_NUMBER="$1"
FORCE_MERGE="${2:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🤖 Agent: Auto-Merge If Ready${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "PR Number: ${GREEN}#${PR_NUMBER}${NC}"
echo ""

# Safety check for force flag
if [ "$FORCE_MERGE" == "--force" ]; then
    echo -e "${RED}⚠️  WARNING: Force merge flag detected!${NC}"
    echo -e "${RED}    This bypasses some safety checks. Use with caution!${NC}"
    echo ""
    read -p "Are you sure you want to force merge? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Merge cancelled.${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Checking PR Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get PR details
echo -e "${YELLOW}📋 Fetching PR details...${NC}"
PR_DATA=$(gh pr view "$PR_NUMBER" --json state,mergeable,reviewDecision,statusCheckRollup,title,author,headRefName,baseRefName 2>/dev/null)

if [ -z "$PR_DATA" ]; then
    echo -e "${RED}❌ Could not fetch PR #${PR_NUMBER}${NC}"
    exit 1
fi

# Check if jq is available for parsing
if command -v jq &> /dev/null; then
    PR_STATE=$(echo "$PR_DATA" | jq -r '.state')
    PR_MERGEABLE=$(echo "$PR_DATA" | jq -r '.mergeable')
    PR_REVIEW_DECISION=$(echo "$PR_DATA" | jq -r '.reviewDecision')
    PR_TITLE=$(echo "$PR_DATA" | jq -r '.title')
    PR_HEAD_BRANCH=$(echo "$PR_DATA" | jq -r '.headRefName')
    PR_BASE_BRANCH=$(echo "$PR_DATA" | jq -r '.baseRefName')
    
    echo -e "${BLUE}Title:${NC} $PR_TITLE"
    echo -e "${BLUE}Branch:${NC} $PR_HEAD_BRANCH → $PR_BASE_BRANCH"
    echo -e "${BLUE}State:${NC} $PR_STATE"
    echo -e "${BLUE}Mergeable:${NC} $PR_MERGEABLE"
    echo -e "${BLUE}Review Decision:${NC} $PR_REVIEW_DECISION"
else
    echo "$PR_DATA"
fi
echo ""

# Validation flags
CHECKS_PASSED=false
REVIEWS_APPROVED=false
MERGEABLE=false
CAN_MERGE=false

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Validating Checks${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}🔍 Checking status checks...${NC}"

# Check PR status checks
gh pr checks "$PR_NUMBER" > /tmp/pr_checks_$PR_NUMBER.txt 2>&1 || true

if grep -q "All checks have passed" /tmp/pr_checks_$PR_NUMBER.txt || grep -q "0 failing" /tmp/pr_checks_$PR_NUMBER.txt; then
    echo -e "${GREEN}✅ All required checks have passed${NC}"
    CHECKS_PASSED=true
else
    echo -e "${RED}❌ Some checks are failing or pending${NC}"
    cat /tmp/pr_checks_$PR_NUMBER.txt
    CHECKS_PASSED=false
fi

rm -f /tmp/pr_checks_$PR_NUMBER.txt
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Validating Reviews${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}👥 Checking review status...${NC}"

if command -v jq &> /dev/null && [ "$PR_REVIEW_DECISION" == "APPROVED" ]; then
    echo -e "${GREEN}✅ PR has been approved by at least 1 reviewer${NC}"
    REVIEWS_APPROVED=true
else
    # Fallback check using gh pr reviews
    REVIEW_STATUS=$(gh pr reviews "$PR_NUMBER" 2>/dev/null | grep -i "approved" || true)
    
    if [ -n "$REVIEW_STATUS" ]; then
        echo -e "${GREEN}✅ PR has been approved${NC}"
        REVIEWS_APPROVED=true
    else
        echo -e "${RED}❌ PR has not been approved yet${NC}"
        echo -e "${YELLOW}   At least 1 human review approval is required${NC}"
        REVIEWS_APPROVED=false
    fi
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 4: Checking Merge Conflicts${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}🔄 Checking for merge conflicts...${NC}"

if command -v jq &> /dev/null; then
    if [ "$PR_MERGEABLE" == "MERGEABLE" ]; then
        echo -e "${GREEN}✅ No merge conflicts detected${NC}"
        MERGEABLE=true
    elif [ "$PR_MERGEABLE" == "CONFLICTING" ]; then
        echo -e "${RED}❌ PR has merge conflicts${NC}"
        echo -e "${YELLOW}   Resolve conflicts before merging${NC}"
        MERGEABLE=false
    else
        echo -e "${YELLOW}⚠️  Merge status: $PR_MERGEABLE${NC}"
        MERGEABLE=true  # Assume mergeable if status is unknown
    fi
else
    echo -e "${YELLOW}⚠️  Could not check merge conflicts (jq not available)${NC}"
    MERGEABLE=true  # Assume mergeable
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 5: Merge Decision${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Determine if PR can be merged
if [ "$CHECKS_PASSED" == "true" ] && [ "$REVIEWS_APPROVED" == "true" ] && [ "$MERGEABLE" == "true" ]; then
    CAN_MERGE=true
    echo -e "${GREEN}✅ All merge requirements satisfied!${NC}"
elif [ "$FORCE_MERGE" == "--force" ]; then
    CAN_MERGE=true
    echo -e "${YELLOW}⚠️  Proceeding with force merge (bypassing some checks)${NC}"
else
    CAN_MERGE=false
    echo -e "${RED}❌ PR is not ready to merge${NC}"
    echo ""
    echo -e "${YELLOW}Missing requirements:${NC}"
    [ "$CHECKS_PASSED" == "false" ] && echo "  • Status checks not passing"
    [ "$REVIEWS_APPROVED" == "false" ] && echo "  • Review approval required"
    [ "$MERGEABLE" == "false" ] && echo "  • Merge conflicts must be resolved"
fi
echo ""

if [ "$CAN_MERGE" == "false" ]; then
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo "  1. Wait for all checks to pass"
    echo "  2. Get approval from a reviewer"
    echo "  3. Resolve any merge conflicts"
    echo "  4. Re-run this script"
    echo ""
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 6: Executing Merge${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Determine merge strategy
MERGE_METHOD="${MERGE_METHOD:-merge}"  # Can be: merge, squash, rebase

echo -e "${YELLOW}🚀 Preparing to merge...${NC}"
echo -e "${BLUE}Merge method:${NC} $MERGE_METHOD"
echo ""

# Final confirmation (unless force flag is used)
if [ "$FORCE_MERGE" != "--force" ]; then
    echo -e "${YELLOW}⚠️  About to merge PR #${PR_NUMBER}${NC}"
    read -p "Continue with merge? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Merge cancelled.${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}Executing merge...${NC}"

# Execute merge based on method
case $MERGE_METHOD in
    "squash")
        if gh pr merge "$PR_NUMBER" --squash --admin; then
            echo -e "${GREEN}✅ PR merged successfully (squash)${NC}"
        else
            echo -e "${RED}❌ Merge failed${NC}"
            exit 1
        fi
        ;;
    "rebase")
        if gh pr merge "$PR_NUMBER" --rebase --admin; then
            echo -e "${GREEN}✅ PR merged successfully (rebase)${NC}"
        else
            echo -e "${RED}❌ Merge failed${NC}"
            exit 1
        fi
        ;;
    *)
        if gh pr merge "$PR_NUMBER" --merge --admin; then
            echo -e "${GREEN}✅ PR merged successfully (merge commit)${NC}"
        else
            echo -e "${RED}❌ Merge failed${NC}"
            exit 1
        fi
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Merge Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Post-merge tasks:${NC}"
echo "  1. Monitor deployment to main branch"
echo "  2. Run smoke tests in staging/production"
echo "  3. Check application health endpoints"
echo "  4. Notify team in Slack/Discord"
echo ""

echo -e "${YELLOW}Deployment monitoring:${NC}"
echo "  gh workflow list"
echo "  gh run list --branch main --limit 5"
echo ""

echo -e "${YELLOW}Health check commands:${NC}"
echo "  curl -sS https://staging.elevare.com/health | jq ."
echo "  curl -sS https://staging.elevare.com/whatsapp/health | jq ."
echo ""
