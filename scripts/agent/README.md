# 🤖 Agent Automation Scripts

## Overview

This directory contains three automation scripts designed to be executed by GitHub agents/bots to manage the PR workflow with safety and efficiency. These scripts ensure that all required checks pass, reviews are obtained, and merges are performed safely.

## Scripts

### 1. `run-all-checks.sh` - Workflow Execution & Monitoring

**Purpose:** Execute all required GitHub workflows and monitor their completion status.

**Usage:**
```bash
./run-all-checks.sh <BRANCH_NAME> [PR_NUMBER]
```

**Example:**
```bash
./run-all-checks.sh feat/whatsapp-clinicid-filters 42
```

**What it does:**
- ✅ Triggers TypeScript Guardian (build + tests)
- ✅ Triggers Docker Builder (image build + smoke test)
- ✅ Optionally triggers register-fallback (AST script)
- ✅ Optionally triggers WhatsApp Monitor (health check)
- ⏱️ Monitors workflow execution (up to 10 minutes per workflow)
- 📊 Reports success/failure status
- 📝 Fetches logs for failed workflows

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

---

### 2. `auto-comment-and-assign.sh` - PR Review Setup

**Purpose:** Add standardized QA checklist comment and assign reviewers to PRs.

**Usage:**
```bash
./auto-comment-and-assign.sh <PR_NUMBER> [REVIEWER_LIST]
```

**Example:**
```bash
./auto-comment-and-assign.sh 42 "user1,user2"
```

**What it does:**
- 💬 Adds comprehensive QA checklist comment to PR
- 🏷️ Adds labels: `implementation`, `priority/high`
- 👤 Assigns PR to default assignee (Carine01)
- 👥 Requests review from specified reviewers
- 📋 Displays PR summary

**Checklist includes:**
- Required checks (TypeScript Guardian, Docker Builder, etc.)
- Security validations (clinicId filters, no hardcoded secrets)
- Human review requirements
- Next steps guidance

---

### 3. `auto-merge-if-ready.sh` - Safe Merge Automation

**Purpose:** Safely merge PRs only when all safety conditions are met.

**Usage:**
```bash
./auto-merge-if-ready.sh <PR_NUMBER> [--force]
```

**Example:**
```bash
# Normal mode (with all safety checks)
./auto-merge-if-ready.sh 42

# Force mode (admin override - USE WITH CAUTION)
./auto-merge-if-ready.sh 42 --force
```

**Safety checks:**
1. ✅ PR exists and is open
2. ✅ No merge conflicts
3. ✅ All required status checks pass (CI, Docker Builder)
4. ✅ At least 1 human review approval
5. ✅ Branch protection rules respected

**What it does:**
- 🔍 Validates all safety conditions
- 📊 Shows pre-merge summary
- 🔀 Performs merge (default: merge commit)
- 🗑️ Auto-deletes merged branch
- 🚀 Triggers deployment workflow (if available)
- 📢 Provides post-merge guidance

**Options:**
- `--force` or `-f` - Use admin privileges to override protections (requires admin access)

**Exit codes:**
- `0` - Merge completed successfully
- `1` - Merge failed or conditions not met

---

## Complete Workflow

### Recommended Agent Workflow (Step by Step)

When a PR is opened or synchronized:

```bash
# Step 1: Run all checks (10-15 minutes)
cd scripts/agent
./run-all-checks.sh feat/my-feature 42

# Step 2: Add QA checklist and request review (30 seconds)
./auto-comment-and-assign.sh 42 "reviewer1,reviewer2"

# Step 3: Wait for human approval
# (Agent should monitor PR for approval status)

# Step 4: Merge when ready (30 seconds)
./auto-merge-if-ready.sh 42
```

---

## Prerequisites

### Required Tools

1. **GitHub CLI** (`gh`)
   ```bash
   # Check if installed
   gh --version
   
   # Install (choose one):
   # - Ubuntu/Debian
   sudo apt install gh
   
   # - macOS
   brew install gh
   
   # - Windows
   winget install GitHub.cli
   ```

2. **Authentication**
   ```bash
   # Authenticate with GitHub
   gh auth login
   
   # Verify authentication
   gh auth status
   ```

3. **Repository Access**
   - Scripts must be run from the repository root or with proper context
   - Token must have permissions for:
     - Reading PR details
     - Triggering workflows
     - Adding comments
     - Requesting reviews
     - Merging PRs (admin for --force)

---

## Configuration

### Customizing Scripts

You can modify the following variables at the top of each script:

**`run-all-checks.sh`:**
```bash
MAX_WAIT_TIME=600      # Maximum wait time per workflow (seconds)
POLL_INTERVAL=10       # Status check interval (seconds)
WORKFLOWS=(...)        # Required workflows
OPTIONAL_WORKFLOWS=(...) # Optional workflows
```

**`auto-comment-and-assign.sh`:**
```bash
REVIEWERS="Carine01"   # Default reviewers (comma-separated)
DEFAULT_LABELS=(...)   # Labels to add
DEFAULT_ASSIGNEE="..." # Default assignee
QA_CHECKLIST="..."     # Checklist template
```

**`auto-merge-if-ready.sh`:**
```bash
REQUIRED_APPROVALS=1   # Minimum approvals needed
MERGE_METHOD="merge"   # Options: merge, squash, rebase
REQUIRED_CHECKS=(...)  # Status checks that must pass
```

---

## Security & Best Practices

### 🔒 Security Rules

1. **NEVER** auto-merge to `main` without:
   - ✅ All required checks passing (TypeScript Guardian + CI)
   - ✅ At least 1 human review approval
   - ✅ Branch protection rules active

2. **ALWAYS** verify:
   - No hardcoded secrets in code
   - clinicId filters properly applied
   - No console.log in production code

3. **USE CAUTION** with `--force` flag:
   - Only for emergency situations
   - Requires admin privileges
   - Should be logged and audited

### 🎯 Best Practices

1. **Agent Execution:**
   - Run scripts in order (checks → comment → merge)
   - Wait for checks to complete before merging
   - Monitor for failures and report

2. **Error Handling:**
   - All scripts provide clear error messages
   - Exit codes indicate success/failure
   - Failed workflows show logs for debugging

3. **Documentation:**
   - QA checklist guides reviewers
   - Comments include next steps
   - Scripts provide helpful output

---

## Troubleshooting

### Common Issues

**1. "gh: command not found"**
```bash
# Solution: Install GitHub CLI
# See Prerequisites section above
```

**2. "Not authenticated with GitHub CLI"**
```bash
# Solution: Authenticate
gh auth login
```

**3. "Failed to trigger workflow"**
```bash
# Possible causes:
# - Workflow name doesn't match exactly
# - Workflow doesn't have workflow_dispatch trigger
# - Insufficient permissions

# Check available workflows:
gh workflow list

# View workflow file:
cat .github/workflows/ci.yml
```

**4. "PR has merge conflicts"**
```bash
# Solution: Resolve conflicts first
git fetch origin main
git merge origin/main
# Fix conflicts, commit, push
```

**5. "Cannot merge without required approvals"**
```bash
# Solutions:
# - Wait for human reviewer to approve
# - Use --force flag (admin only, use sparingly)
```

---

## Examples

### Example 1: Complete PR Automation

```bash
#!/bin/bash
# Complete automation workflow

PR_NUMBER=42
BRANCH="feat/new-feature"
REVIEWERS="user1,user2"

echo "Starting automated PR workflow..."

# Step 1: Run checks
./run-all-checks.sh "$BRANCH" "$PR_NUMBER"
if [ $? -ne 0 ]; then
    echo "❌ Checks failed - stopping"
    exit 1
fi

# Step 2: Setup review
./auto-comment-and-assign.sh "$PR_NUMBER" "$REVIEWERS"

# Step 3: Wait for approval (agent would monitor this)
echo "⏳ Waiting for human approval..."
echo "   When approved, run: ./auto-merge-if-ready.sh $PR_NUMBER"
```

### Example 2: Emergency Merge (with caution)

```bash
#!/bin/bash
# Emergency hotfix merge (requires admin)

PR_NUMBER=99

echo "⚠️  EMERGENCY MERGE MODE"
echo "   Bypassing some checks with admin privileges"
echo ""

# Still run basic validations
./auto-merge-if-ready.sh "$PR_NUMBER" --force

if [ $? -eq 0 ]; then
    echo "✅ Emergency merge completed"
    echo "📝 Remember to document this in incident log"
fi
```

### Example 3: Monitoring Mode

```bash
#!/bin/bash
# Monitor workflow status without merging

BRANCH="feat/my-feature"

# Just run checks and report
./run-all-checks.sh "$BRANCH"

# Exit with check status
exit $?
```

---

## Integration with GitHub Actions

These scripts can also be called from GitHub Actions workflows:

```yaml
name: Agent PR Workflow

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  automated-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run all checks
        run: |
          ./scripts/agent/run-all-checks.sh ${{ github.head_ref }} ${{ github.event.pull_request.number }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Add QA checklist
        if: success()
        run: |
          ./scripts/agent/auto-comment-and-assign.sh ${{ github.event.pull_request.number }} "reviewer1,reviewer2"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Maintenance

### Regular Updates

- Review and update checklist templates periodically
- Adjust timeout values based on CI performance
- Update required checks list as workflows change
- Keep reviewer lists current

### Monitoring

Monitor script execution for:
- Success/failure rates
- Average execution times
- Common error patterns
- Security compliance

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check repository workflow configurations
4. Verify permissions and authentication

---

## License

These scripts are part of the Elevare backend repository and follow the same license.

---

**Last Updated:** 2025-11-23
**Version:** 1.0.0
**Maintainer:** Elevare Team
