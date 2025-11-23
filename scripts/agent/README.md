# 🤖 Agent Orchestration System - Quick Reference

## Overview

This system provides automated workflows (agents) and an orchestration script to run quality checks, builds, and tests across the codebase. It's designed to be run on feature branches before merging to ensure code quality and catch issues early.

---

## 📋 Available Commands

### 1. Command (Quick) — Trigger Orchestrator (Only executes agents)

This command triggers the orchestrator workflow on a specific branch without PR integration.

```bash
export GITHUB_TOKEN="$(gh auth token)"
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref feat/whatsapp-clinicid-filters
```

**Use this when:** You just want to run the agents and monitor via GitHub Actions.

---

### 2. Command (with PR) — Trigger Orchestrator + Comment on PR (No auto-merge)

This command triggers all workflows, waits for completion, and posts a summary comment on the PR.

**Replace `<PR_NUMBER>` with your actual PR number**

```bash
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters <PR_NUMBER> false
```

**What this does:**
- Triggers all workflows (TypeScript Guardian, Register Fila Fallback, Docker Builder, WhatsApp Monitor, Agent Orchestrator)
- Waits for each one to complete
- Posts a summary comment on PR `<PR_NUMBER>`
- Does NOT attempt merge (safe)

**Example:**
```bash
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 42 false
```

---

### 3. Command (with PR) + AUTO-MERGE Attempt (Use with caution)

**Only use if you have at least 1 human approval and confidence in the checks.**

```bash
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters <PR_NUMBER> true
```

**What this does:**
- Same as Command 2, but...
- Attempts automatic merge (squash) at the end if checks pass and PR has approval

**Warning:** This will auto-merge the PR if conditions are met. Use responsibly.

---

## 🔍 Monitoring Commands (Quick Copy/Paste)

### List recent runs for a branch:

```bash
gh run list --branch feat/whatsapp-clinicid-filters --limit 10
```

### View logs for a specific run:

Replace `<RUN_ID>` with the run ID from the list above.

```bash
gh run view <RUN_ID> --log --exit-status
```

### View PR comments:

Replace `<PR_NUMBER>` with your PR number.

```bash
gh pr view <PR_NUMBER> --comments
```

### Find PR number for a branch:

```bash
gh pr list --state open --head feat/whatsapp-clinicid-filters
```

---

## 🤖 Available Agent Workflows

The orchestrator runs these workflows in sequence:

1. **TypeScript Guardian** - Checks TypeScript compilation and linting
2. **Register Fila Fallback** - Validates queue/fila system with fallback checks
3. **Docker Builder** - Builds and validates Docker images
4. **WhatsApp Monitor** - Checks WhatsApp integration and clinicId filters
5. **Agent Orchestrator** - Master workflow that runs all checks in sequence

---

## 🛠️ Setup & Prerequisites

### Install GitHub CLI

If you don't have `gh` installed:

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Windows:**
```powershell
winget install GitHub.cli
# or
choco install gh
```

### Authenticate GitHub CLI

```bash
gh auth login
```

Follow the prompts to authenticate via browser.

### Set GitHub Token

```bash
export GITHUB_TOKEN="$(gh auth token)"
```

Add this to your `~/.bashrc` or `~/.zshrc` for persistence:

```bash
echo 'export GITHUB_TOKEN="$(gh auth token)"' >> ~/.bashrc
source ~/.bashrc
```

---

## 📊 Example Workflow

Here's a typical workflow when working on a feature branch:

```bash
# 1. Find your PR number (if you don't know it)
gh pr list --state open --head feat/whatsapp-clinicid-filters

# Output: #42  feat: Add WhatsApp clinicId filters  feat/whatsapp-clinicid-filters

# 2. Run all agents with PR integration (safe mode)
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 42 false

# 3. Monitor progress
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# 4. View detailed logs if needed
gh run view <RUN_ID> --log

# 5. Check the PR comment for summary
gh pr view 42 --comments

# 6. If all checks pass and you have approval, merge manually
gh pr merge 42 --squash
```

---

## 🚨 Troubleshooting

### Error: "gh: command not found"

**Solution:** Install GitHub CLI (see Setup section above)

### Error: "gh CLI is not authenticated"

**Solution:**
```bash
gh auth login
```

### Error: "Could not get run ID for workflow"

**Cause:** Workflow may not exist or branch name is incorrect

**Solution:**
- Verify branch name: `git branch -a`
- Check workflows exist: `ls .github/workflows/agent-*.yml`
- Try triggering manually via GitHub UI: Actions → Select workflow → Run workflow

### Error: "PR is not in a mergeable state"

**Causes:**
- Branch conflicts with base branch
- Required checks haven't passed
- Insufficient approvals
- Branch protection rules not met

**Solution:**
- Resolve merge conflicts: `git pull origin main` and fix conflicts
- Wait for required checks to pass
- Request reviews/approvals
- Check branch protection settings

### Workflow fails but you can't see why

**Solution:**
```bash
# Get the run ID
gh run list --branch feat/whatsapp-clinicid-filters --limit 5

# View detailed logs
gh run view <RUN_ID> --log

# Or view in browser
gh run view <RUN_ID> --web
```

---

## 🎯 Important Notes (Read This!)

1. **Execution Environment:** Run these commands in an environment where `gh` is authenticated (if local, run `gh auth login` first)

2. **Safety Preference:** Use the `false` option (no auto-merge) to review manually before merging. This is the recommended approach.

3. **Finding PR Number:** If you don't know the PR number, run:
   ```bash
   gh pr list --state open --head feat/whatsapp-clinicid-filters
   ```

4. **Workflow Names:** The workflow name must match exactly: `"Agent Orchestrator - run agent scripts in sequence (robust)"`

5. **Branch Names:** Make sure to use the exact branch name (case-sensitive)

6. **Token Expiry:** If commands fail with authentication errors, refresh your token:
   ```bash
   gh auth refresh
   export GITHUB_TOKEN="$(gh auth token)"
   ```

---

## 📁 File Structure

```
.github/
  workflows/
    agent-orchestrator.yml              # Main orchestrator workflow
    agent-typescript-guardian.yml       # TypeScript checks
    agent-register-fila-fallback.yml    # Queue/fila checks
    agent-whatsapp-monitor.yml          # WhatsApp integration checks
    docker-builder.yml                  # Docker build checks (existing)

scripts/
  agent/
    run-agents-all.sh                   # Master orchestration script
    README.md                           # This file
```

---

## 🔄 Script Behavior

The `run-agents-all.sh` script:

1. ✅ Validates prerequisites (gh CLI, authentication)
2. 🚀 Triggers all agent workflows on the specified branch
3. ⏳ Waits for each workflow to complete (timeout: 10 minutes each)
4. 📊 Collects results from all workflows
5. 💬 Posts a summary comment to the PR (if PR number provided)
6. 🔀 Attempts auto-merge if enabled and all checks pass
7. ✅ Returns exit code 0 if all succeeded, 1 if any failed

---

## 🎉 Success Criteria

You know everything worked when:

- ✅ All 5 workflows complete successfully
- ✅ PR comment shows green checkmarks for all agents
- ✅ No red ❌ symbols in the output
- ✅ Script exits with code 0

---

## 📞 Support

If you encounter issues:

1. Check this README's troubleshooting section
2. View workflow logs: `gh run view <RUN_ID> --log`
3. Check GitHub Actions UI for detailed error messages
4. Ensure all prerequisites are met (gh CLI installed, authenticated, token set)

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0
