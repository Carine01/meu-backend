#!/bin/bash
# Script: auto-merge-if-ready.sh
# Description: Conditionally auto-merge PR if all checks pass and has approval
# Usage: ./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [merge_method]
# SECURITY: Only runs if checks pass AND has at least 1 human approval

set -e

if [ -z "$1" ]; then
  echo "❌ Error: PR number required"
  echo "Usage: $0 <PR_NUMBER> [merge_method: merge|squash|rebase]"
  exit 1
fi

PR_NUMBER="$1"
MERGE_METHOD="${2:-squash}"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is not installed"
  exit 1
fi

echo "🔍 Checking if PR #$PR_NUMBER is ready for auto-merge..."

# Get PR status
PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")

if [ "$PR_STATE" != "OPEN" ]; then
  echo "❌ PR is not open (state: $PR_STATE)"
  exit 1
fi

# Check if PR has approvals
APPROVALS=$(gh pr view "$PR_NUMBER" --json reviews --jq '[.reviews[] | select(.state == "APPROVED")] | length' 2>/dev/null || echo "0")

if [ "$APPROVALS" -lt 1 ]; then
  echo "❌ PR does not have required approvals (found: $APPROVALS, required: 1)"
  echo "🔒 SECURITY: Auto-merge requires at least 1 human approval"
  exit 1
fi

echo "✅ PR has $APPROVALS approval(s)"

# Check if all status checks passed
CHECKS_STATE=$(gh pr view "$PR_NUMBER" --json statusCheckRollup --jq '.statusCheckRollup[] | select(.status != "COMPLETED" or .conclusion != "SUCCESS")' 2>/dev/null)

if [ -n "$CHECKS_STATE" ]; then
  echo "❌ Not all checks have passed"
  echo "$CHECKS_STATE"
  exit 1
fi

echo "✅ All checks have passed"

# Check if PR is mergeable
MERGEABLE=$(gh pr view "$PR_NUMBER" --json mergeable --jq '.mergeable' 2>/dev/null || echo "UNKNOWN")

if [ "$MERGEABLE" != "MERGEABLE" ]; then
  echo "❌ PR is not mergeable (state: $MERGEABLE)"
  exit 1
fi

echo "✅ PR is mergeable"

# Perform the merge
echo "🔀 Merging PR with method: $MERGE_METHOD"

if gh pr merge "$PR_NUMBER" --"$MERGE_METHOD" --auto 2>/dev/null; then
  echo "✅ PR #$PR_NUMBER merged successfully"
else
  echo "❌ Failed to merge PR"
  exit 1
fi

echo "✅ Auto-merge completed successfully"
