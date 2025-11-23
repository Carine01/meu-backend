# Agent Automation - Usage Examples

This document provides complete, real-world examples of using the agent automation scripts for managing PR workflows.

## 📋 Table of Contents

- [Complete PR Workflow Example](#complete-pr-workflow-example)
- [Individual Script Examples](#individual-script-examples)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting Examples](#troubleshooting-examples)
- [CI/CD Integration](#cicd-integration)

---

## Complete PR Workflow Example

This example shows the complete lifecycle of a PR from opening to merging using agent automation.

### Scenario: New Feature Branch for WhatsApp Filters

```bash
# ============================================================================
# STEP 1: Create and push feature branch
# ============================================================================

# On your local machine
git checkout -b feat/whatsapp-clinicid-filters
# ... make your code changes ...
git add .
git commit -m "feat: add clinicId filters to WhatsApp service"
git push -u origin feat/whatsapp-clinicid-filters

# ============================================================================
# STEP 2: Create Pull Request
# ============================================================================

# Create PR via GitHub CLI
gh pr create \
  --title "feat: Add clinicId filters to WhatsApp integration" \
  --body "Implements clinicId filtering for multi-tenant WhatsApp service" \
  --base main \
  --head feat/whatsapp-clinicid-filters

# Note the PR number returned (e.g., #42)
PR_NUMBER=42

# ============================================================================
# STEP 3: Run All Checks (Agent Action)
# ============================================================================

# Agent triggers all workflows
./scripts/agent/run-all-checks.sh feat/whatsapp-clinicid-filters

# Output:
# ========================================
# 🤖 Agent: Running All Checks
# ========================================
# Branch: feat/whatsapp-clinicid-filters
#
# ========================================
# Step 1: Triggering Workflows
# ========================================
#
# 1. TypeScript Guardian (CI)
# ✅ Successfully triggered: CI
#
# 2. Docker Builder
# ✅ Successfully triggered: Docker Builder
#
# 3. Quality Gate
# ✅ Successfully triggered: Quality Gate
#
# ... etc ...

# ============================================================================
# STEP 4: Add Comment and Assign Reviewers (Agent Action)
# ============================================================================

# Agent adds standardized comment and assigns reviewers
./scripts/agent/auto-comment-and-assign.sh $PR_NUMBER "devuser1,devuser2"

# Output:
# ========================================
# 🤖 Agent: Auto-Comment and Assign
# ========================================
# PR Number: #42
#
# ========================================
# Step 1: Adding PR Comment
# ========================================
#
# 📝 Posting QA checklist comment...
# ✅ Comment posted successfully
#
# ========================================
# Step 2: Adding Labels
# ========================================
#
# 🏷️  Adding labels...
# ✅ Added label: implementation
# ✅ Added label: priority/high
# ✅ Added label: automated
#
# ... etc ...

# ============================================================================
# STEP 5: Monitor Progress (Manual or Automated)
# ============================================================================

# Check PR status
gh pr view $PR_NUMBER

# Check workflow runs
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# Watch specific workflow
gh run watch

# Check PR checks status
gh pr checks $PR_NUMBER

# ============================================================================
# STEP 6: Wait for Reviews
# ============================================================================

# Human reviewer approves the PR
# This can be done via GitHub UI or CLI:
gh pr review $PR_NUMBER --approve --body "LGTM! Code looks good."

# ============================================================================
# STEP 7: Auto-Merge When Ready (Agent Action)
# ============================================================================

# Agent checks if PR is ready and merges
./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER

# Output:
# ========================================
# 🤖 Agent: Auto-Merge If Ready
# ========================================
# PR Number: #42
#
# ========================================
# Step 1: Checking PR Status
# ========================================
#
# 📋 Fetching PR details...
# Title: feat: Add clinicId filters to WhatsApp integration
# Branch: feat/whatsapp-clinicid-filters → main
# State: OPEN
# Mergeable: MERGEABLE
# Review Decision: APPROVED
#
# ========================================
# Step 2: Validating Checks
# ========================================
#
# 🔍 Checking status checks...
# ✅ All required checks have passed
#
# ========================================
# Step 3: Validating Reviews
# ========================================
#
# 👥 Checking review status...
# ✅ PR has been approved by at least 1 reviewer
#
# ========================================
# Step 4: Checking Merge Conflicts
# ========================================
#
# 🔄 Checking for merge conflicts...
# ✅ No merge conflicts detected
#
# ========================================
# Step 5: Merge Decision
# ========================================
#
# ✅ All merge requirements satisfied!
#
# ========================================
# Step 6: Executing Merge
# ========================================
#
# 🚀 Preparing to merge...
# Merge method: merge
#
# ⚠️  About to merge PR #42
# Continue with merge? (yes/no): yes
#
# Executing merge...
# ✅ PR merged successfully (merge commit)
#
# ========================================
# ✅ Merge Completed Successfully!
# ========================================

# ============================================================================
# STEP 8: Monitor Deployment
# ============================================================================

# Check deployment workflow
gh run list --branch main --limit 5

# View deployment logs
gh run view <RUN_ID> --log

# Check health endpoints
curl -sS https://staging.elevare.com/health | jq .
curl -sS https://staging.elevare.com/whatsapp/health | jq .
```

---

## Individual Script Examples

### Example 1: run-all-checks.sh

#### Basic Usage
```bash
# Trigger all checks for a feature branch
./scripts/agent/run-all-checks.sh feat/new-feature

# Trigger checks for main branch
./scripts/agent/run-all-checks.sh main

# Trigger checks for develop branch
./scripts/agent/run-all-checks.sh develop
```

#### With Monitoring
```bash
# Trigger checks and monitor in real-time
./scripts/agent/run-all-checks.sh feat/my-feature && \
  gh run watch
```

#### Error Handling
```bash
# If no branch name provided
./scripts/agent/run-all-checks.sh
# Output: ❌ Error: Branch name is required
```

---

### Example 2: auto-comment-and-assign.sh

#### Basic Usage
```bash
# Add comment with default reviewer
./scripts/agent/auto-comment-and-assign.sh 42

# Add comment with specific reviewers
./scripts/agent/auto-comment-and-assign.sh 42 "alice,bob,charlie"

# Add comment for multiple PRs (batch operation)
for pr in 42 43 44; do
  ./scripts/agent/auto-comment-and-assign.sh $pr "reviewer1,reviewer2"
done
```

#### Custom Reviewer Lists
```bash
# Senior developers for critical PRs
./scripts/agent/auto-comment-and-assign.sh 42 "senior-dev1,senior-dev2,tech-lead"

# Team-specific reviewers
FRONTEND_REVIEWERS="frontend-dev1,frontend-dev2"
BACKEND_REVIEWERS="backend-dev1,backend-dev2"

./scripts/agent/auto-comment-and-assign.sh 42 "$BACKEND_REVIEWERS"
```

---

### Example 3: auto-merge-if-ready.sh

#### Basic Usage
```bash
# Normal merge with safety checks
./scripts/agent/auto-merge-if-ready.sh 42

# Force merge (use with extreme caution)
./scripts/agent/auto-merge-if-ready.sh 42 --force
```

#### With Custom Merge Strategy
```bash
# Squash merge
MERGE_METHOD=squash ./scripts/agent/auto-merge-if-ready.sh 42

# Rebase merge
MERGE_METHOD=rebase ./scripts/agent/auto-merge-if-ready.sh 42

# Regular merge commit (default)
MERGE_METHOD=merge ./scripts/agent/auto-merge-if-ready.sh 42
```

#### Automated Merge Loop
```bash
# Check and merge multiple PRs if ready
for pr in 42 43 44; do
  echo "Checking PR #$pr..."
  ./scripts/agent/auto-merge-if-ready.sh $pr || echo "PR #$pr not ready"
done
```

---

## Common Scenarios

### Scenario 1: Emergency Hotfix

```bash
# Fast-track a critical hotfix
BRANCH="hotfix/critical-security-fix"
PR_NUMBER=99

# 1. Trigger all checks
./scripts/agent/run-all-checks.sh $BRANCH

# 2. Skip reviewer assignment for emergency (manual review by tech lead)
gh pr edit $PR_NUMBER --add-label "hotfix" --add-label "priority/critical"

# 3. Watch for check completion
gh run watch

# 4. After tech lead approval, merge immediately
./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER

# 5. Verify deployment
gh run list --branch main --limit 1
```

### Scenario 2: Batch PR Processing

```bash
# Process multiple PRs from a sprint
SPRINT_PRS=(42 43 44 45 46)

for pr in "${SPRINT_PRS[@]}"; do
  echo "======================================"
  echo "Processing PR #$pr"
  echo "======================================"
  
  # Get PR branch name
  BRANCH=$(gh pr view $pr --json headRefName -q .headRefName)
  
  # Trigger checks
  ./scripts/agent/run-all-checks.sh $BRANCH
  
  # Add comment and assign
  ./scripts/agent/auto-comment-and-assign.sh $pr "sprint-reviewer"
  
  echo "PR #$pr setup complete"
  echo ""
done
```

### Scenario 3: Re-running Failed Checks

```bash
PR_NUMBER=42
BRANCH=$(gh pr view $PR_NUMBER --json headRefName -q .headRefName)

# Re-run all checks after fixing issues
./scripts/agent/run-all-checks.sh $BRANCH

# Check status
sleep 60  # Wait for workflows to start
gh pr checks $PR_NUMBER

# If still failing, view logs
gh run list --branch $BRANCH --limit 5
gh run view <FAILED_RUN_ID> --log
```

### Scenario 4: Handling Merge Conflicts

```bash
PR_NUMBER=42

# Try to merge
./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER

# If merge conflicts detected:
# Output: ❌ PR has merge conflicts
#         Resolve conflicts before merging

# Resolve conflicts locally
gh pr checkout $PR_NUMBER
git fetch origin main
git merge origin/main
# ... resolve conflicts ...
git add .
git commit -m "chore: resolve merge conflicts"
git push

# Trigger checks again
BRANCH=$(git rev-parse --abbrev-ref HEAD)
./scripts/agent/run-all-checks.sh $BRANCH

# Retry merge
./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER
```

### Scenario 5: Monitoring WhatsApp Service

```bash
# Manually trigger WhatsApp health check
gh workflow run "WhatsApp Monitor"

# Wait and view results
sleep 30
gh run list --workflow="WhatsApp Monitor" --limit 1

# Check if incident was created
gh issue list --label incident,whatsapp --state open

# View health check logs
RUN_ID=$(gh run list --workflow="WhatsApp Monitor" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $RUN_ID --log
```

---

## Troubleshooting Examples

### Problem: GitHub CLI Not Authenticated

```bash
# Check authentication status
gh auth status

# If not authenticated
gh auth login

# Verify authentication
gh api user
```

### Problem: Workflows Won't Trigger

```bash
# Check if workflow has workflow_dispatch trigger
cat .github/workflows/ci.yml | grep workflow_dispatch

# If missing, add it to the workflow file:
# on:
#   workflow_dispatch:
#   pull_request:
#     branches: [main]

# List all workflows
gh workflow list

# Check workflow state
gh workflow view "CI"
```

### Problem: Labels Don't Exist

```bash
# Create missing labels
gh label create "implementation" --color "0E8A16" --description "Implementation work"
gh label create "priority/high" --color "D93F0B" --description "High priority"
gh label create "automated" --color "1D76DB" --description "Automated PR"
gh label create "incident" --color "B60205" --description "Incident tracking"
gh label create "whatsapp" --color "128A0C" --description "WhatsApp related"

# List all labels
gh label list
```

### Problem: Merge Fails with Permission Error

```bash
# Check branch protection rules
gh api repos/:owner/:repo/branches/main/protection

# If you have admin rights, use --admin flag
./scripts/agent/auto-merge-if-ready.sh 42

# Or enable auto-merge and let GitHub handle it
gh pr merge 42 --auto --merge
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/pr-automation.yml`:

```yaml
name: PR Automation

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main

jobs:
  setup-pr:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup GitHub CLI
        run: |
          type -p gh >/dev/null || (
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
          )
      
      - name: Authenticate GitHub CLI
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
      
      - name: Make scripts executable
        run: chmod +x scripts/agent/*.sh
      
      - name: Run all checks
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          ./scripts/agent/run-all-checks.sh ${{ github.head_ref }}
      
      - name: Add comment and assign reviewers
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          ./scripts/agent/auto-comment-and-assign.sh ${{ github.event.pull_request.number }} "reviewer1,reviewer2"
```

### Auto-Merge Workflow

Create `.github/workflows/auto-merge.yml`:

```yaml
name: Auto-Merge

on:
  pull_request_review:
    types: [submitted]
  check_suite:
    types: [completed]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: |
      github.event_name == 'pull_request_review' && github.event.review.state == 'approved' ||
      github.event_name == 'check_suite' && github.event.check_suite.conclusion == 'success'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup GitHub CLI
        run: |
          curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
          echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
          sudo apt update
          sudo apt install gh jq -y
      
      - name: Authenticate
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
      
      - name: Make scripts executable
        run: chmod +x scripts/agent/*.sh
      
      - name: Attempt auto-merge
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MERGE_METHOD: squash
        run: |
          PR_NUMBER="${{ github.event.pull_request.number }}"
          if [ -z "$PR_NUMBER" ]; then
            echo "Could not determine PR number"
            exit 0
          fi
          
          ./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER || echo "PR not ready for merge"
```

---

## Quick Reference

### Essential Commands

```bash
# Trigger all checks
./scripts/agent/run-all-checks.sh <BRANCH>

# Setup PR
./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER> [REVIEWERS]

# Merge when ready
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER>

# Monitor workflows
gh run list --branch <BRANCH>
gh pr checks <PR_NUMBER>

# View PR
gh pr view <PR_NUMBER>
gh pr view <PR_NUMBER> --web
```

### Environment Variables

```bash
# Set merge method (merge, squash, rebase)
export MERGE_METHOD=squash

# GitHub token (if not using gh auth)
export GH_TOKEN=<your_token>
```

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0
