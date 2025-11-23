# Agent Automation Scripts

This directory contains automation scripts for GitHub PR workflow management. These scripts are designed to be executed by automated agents or CI/CD systems to manage the complete lifecycle of pull requests.

## 📋 Overview

The agent automation workflow consists of three main scripts that work together to automate PR checks, reviews, and merges:

1. **run-all-checks.sh** - Trigger all required GitHub Actions workflows
2. **auto-comment-and-assign.sh** - Add PR comments and assign reviewers
3. **auto-merge-if-ready.sh** - Safely merge PR when all requirements are met

## 🚀 Quick Start

### Prerequisites

- [GitHub CLI (gh)](https://cli.github.com/) installed and authenticated
- `jq` command-line JSON processor (optional, but recommended)
- Appropriate permissions to trigger workflows and merge PRs

### Installation

1. Ensure scripts are executable:
```bash
chmod +x scripts/agent/*.sh
```

2. Install GitHub CLI if not already installed:
```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
winget install --id GitHub.cli
```

3. Authenticate with GitHub:
```bash
gh auth login
```

## ⚙️ Configuration

### Environment Variables

The scripts support configuration through environment variables:

#### auto-comment-and-assign.sh
- `REPO_OWNER`: Repository owner username (default: `Carine01`)
  ```bash
  export REPO_OWNER="your-username"
  ./scripts/agent/auto-comment-and-assign.sh 42
  ```

#### auto-merge-if-ready.sh
- `MERGE_METHOD`: Merge strategy - `merge`, `squash`, or `rebase` (default: `merge`)
  ```bash
  export MERGE_METHOD=squash
  ./scripts/agent/auto-merge-if-ready.sh 42
  ```

- `MERGE_ADMIN`: Use admin privileges to bypass branch protection (default: `false`)
  ```bash
  export MERGE_ADMIN=true
  ./scripts/agent/auto-merge-if-ready.sh 42
  ```

#### whatsapp-monitor.yml workflow
- `HEALTH_ENDPOINT_STAGING`: Staging health endpoint URL (default: `https://staging.elevare.com/health`)
- `HEALTH_ENDPOINT_WHATSAPP`: WhatsApp health endpoint URL (default: `https://staging.elevare.com/whatsapp/health`)

To configure these, add repository variables in GitHub Settings → Secrets and variables → Variables.

## 📖 Script Documentation

### 1. run-all-checks.sh

**Purpose:** Trigger all required GitHub Actions workflows for a specific branch.

**Usage:**
```bash
./scripts/agent/run-all-checks.sh <BRANCH_NAME>
```

**Example:**
```bash
./scripts/agent/run-all-checks.sh feat/whatsapp-clinicid-filters
```

**What it does:**
- Triggers TypeScript Guardian (CI) workflow
- Triggers Docker Builder workflow
- Triggers Deploy workflow (if configured)
- Displays workflow status
- Provides commands to monitor progress

**Note:** Only workflows with `workflow_dispatch` trigger can be manually triggered. Workflows triggered by `pull_request` events run automatically when PR is opened.

---

### 2. auto-comment-and-assign.sh

**Purpose:** Add standardized QA checklist comment to PR and assign reviewers/labels.

**Usage:**
```bash
./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER> [REVIEWERS]
```

**Examples:**
```bash
# With specific reviewers
./scripts/agent/auto-comment-and-assign.sh 42 "devuser1,devuser2"

# Default reviewer (repository owner)
./scripts/agent/auto-comment-and-assign.sh 42
```

**What it does:**
- Posts comprehensive QA checklist comment to PR
- Adds labels: `implementation`, `priority/high`, `automated`
- Assigns repository owner (Carine01)
- Adds specified reviewers
- Displays PR status summary

**Checklist includes:**
- TypeScript Guardian (build + tests)
- Docker Builder (image + smoke tests)
- Quality Gate (console.log detection)
- register-fallback verification
- Unit test coverage
- Security configuration
- Human review approval

---

### 3. auto-merge-if-ready.sh

**Purpose:** Safely merge PR after validating all requirements are met.

**Usage:**
```bash
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [--force]
```

**Examples:**
```bash
# Normal merge (with safety checks)
./scripts/agent/auto-merge-if-ready.sh 42

# Force merge (bypass some checks - use with caution)
./scripts/agent/auto-merge-if-ready.sh 42 --force
```

**What it does:**
- ✅ Validates all status checks are passing
- ✅ Confirms at least 1 human review approval
- ✅ Checks for merge conflicts
- ✅ Verifies branch protection rules
- 🚀 Executes merge if all requirements met
- 📊 Provides post-merge monitoring commands

**Safety features:**
- Requires explicit confirmation before merge
- Enforces strict merge requirements
- Provides detailed validation feedback
- Supports multiple merge methods (merge, squash, rebase)

**Environment variables:**
- `MERGE_METHOD`: Set merge strategy (default: `merge`)
  - Options: `merge`, `squash`, `rebase`

---

## 🔄 Complete Workflow Example

Here's how to use all three scripts together for a complete PR workflow:

```bash
# 1. When PR is opened or synchronized
BRANCH="feat/whatsapp-clinicid-filters"
PR_NUMBER=42

# 2. Trigger all checks
./scripts/agent/run-all-checks.sh $BRANCH

# 3. Add comment and assign reviewers
./scripts/agent/auto-comment-and-assign.sh $PR_NUMBER "devuser1,devuser2"

# 4. Wait for checks to complete and review approval
# Monitor status:
gh pr checks $PR_NUMBER
gh run list --branch $BRANCH

# 5. When ready, merge the PR
./scripts/agent/auto-merge-if-ready.sh $PR_NUMBER

# 6. Monitor deployment
gh run list --branch main --limit 5

# 7. Check health endpoints
curl -sS https://staging.elevare.com/health | jq .
curl -sS https://staging.elevare.com/whatsapp/health | jq .
```

## 🔐 Security Requirements

These scripts enforce the following security requirements:

1. **Branch Protection:**
   - Main branch must have protection rules enabled
   - Required status checks must pass
   - At least 1 review approval required

2. **Merge Requirements:**
   - All required checks must be in "success" state
   - At least 1 human review must be "APPROVED"
   - No merge conflicts
   - PR must be in "OPEN" state

3. **No Auto-merge Without:**
   - Human review approval
   - All checks passing
   - Explicit confirmation (unless using `--force`)

## 🛠️ Troubleshooting

### Script won't execute
```bash
# Make sure scripts are executable
chmod +x scripts/agent/*.sh
```

### GitHub CLI not authenticated
```bash
# Login to GitHub
gh auth login

# Check authentication status
gh auth status
```

### Workflows won't trigger
- Ensure workflow has `workflow_dispatch:` trigger
- Check that you have permission to trigger workflows
- Verify branch name is correct

### Labels don't exist
```bash
# Create missing labels in repository
gh label create "implementation" --color "0E8A16"
gh label create "priority/high" --color "D93F0B"
gh label create "automated" --color "1D76DB"
```

### Merge fails with permissions error
- Ensure you have write permissions to the repository
- Check if branch protection rules are blocking the merge
- Use `--admin` flag if you have admin permissions

## 📚 Additional Resources

### GitHub CLI Documentation
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [gh pr commands](https://cli.github.com/manual/gh_pr)
- [gh workflow commands](https://cli.github.com/manual/gh_workflow)

### Useful Commands

```bash
# View all open PRs
gh pr list --state open

# View specific PR
gh pr view 42

# Check PR status
gh pr checks 42

# List workflow runs
gh run list --branch feat/branch-name

# View workflow run logs
gh run view <RUN_ID> --log

# Watch workflow in real-time
gh run watch

# List all workflows
gh workflow list

# View workflow details
gh workflow view "CI"
```

## 🔄 Integration with CI/CD

These scripts can be integrated into GitHub Actions workflows:

```yaml
name: Agent PR Workflow

on:
  pull_request:
    types: [opened, synchronize]
    branches:
      - main

jobs:
  auto-setup-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          chmod +x scripts/agent/*.sh
          ./scripts/agent/run-all-checks.sh ${{ github.head_ref }}
          ./scripts/agent/auto-comment-and-assign.sh ${{ github.event.pull_request.number }}
```

## ⚠️ Important Notes

1. **Force Merge:** Use `--force` flag only when absolutely necessary and with caution
2. **Permissions:** Scripts require appropriate GitHub permissions (write access, admin for merge)
3. **Rate Limits:** Be aware of GitHub API rate limits when running scripts frequently
4. **Branch Protection:** Ensure branch protection rules are properly configured before relying on auto-merge
5. **Human Review:** Always require at least one human review approval before merging

## 📝 Maintenance

These scripts should be reviewed and updated when:
- New workflows are added to `.github/workflows/`
- Branch protection rules change
- Merge requirements change
- Label names change
- Team structure changes

## 🤝 Contributing

When modifying these scripts:
1. Test thoroughly in a non-production branch
2. Document any new flags or options
3. Update this README with changes
4. Ensure backward compatibility when possible
5. Follow existing code style and structure

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0  
**Maintainer:** Automated Agents Team
