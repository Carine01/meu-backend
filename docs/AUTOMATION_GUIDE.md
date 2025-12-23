# Automation Workflows Guide

Complete guide for all automation workflows in the meu-backend repository.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Workflow Overview](#workflow-overview)
3. [Priority High Workflows](#priority-high-workflows)
4. [Priority Medium Workflows](#priority-medium-workflows)
5. [Priority Low Workflows](#priority-low-workflows)
6. [Manual Execution](#manual-execution)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### First-Time Setup

1. **Configure Secrets** (Settings → Secrets and variables → Actions)
   ```bash
   DB_URL=postgresql://user:pass@host:5432/db
   WHATSAPP_PROVIDER_TOKEN=your_token
   JWT_SECRET=your_secret
   ```

2. **Enable Branch Protection** (Settings → Branches)
   - Require pull request reviews: 1
   - Require status checks: TypeScript Guardian, Test Blocker, Quality Gate

3. **Enable Security Features** (Settings → Security)
   - Dependabot alerts ✅
   - Secret scanning ✅
   - Push protection ✅

4. **Test Workflows**
   ```bash
   gh workflow run "TypeScript Guardian"
   gh workflow run "Agent Orchestrator" -f branch=main -f pr_number=1 -f auto_merge=false
   ```

---

## Workflow Overview

| Priority | Workflow | Trigger | Purpose |
|----------|----------|---------|---------|
| 🔴 High | TypeScript Guardian | push, PR, manual | Build, test, lint, coverage |
| 🔴 High | Agent Orchestrator | manual | Run all automation in sequence |
| 🔴 High | Quality Gate | PR | Check console.log, secrets, PR size |
| 🔴 High | Test Blocker | PR | Block PR if tests fail |
| 🔴 High | Docker Builder | push, PR | Build image + smoke tests |
| 🟡 Medium | Auto Documentation | push to main, manual | Generate TypeDoc docs |
| 🟡 Medium | WhatsApp Monitor | schedule (hourly) | Health check + alerts |

---

## Priority High Workflows

### 1. TypeScript Guardian

**Purpose:** Comprehensive CI pipeline for build, test, lint, and coverage.

**Triggers:**
- Push to `main`, `develop`, or `feat/*` branches
- Pull requests to `main` or `develop`
- Manual dispatch

**What it does:**
1. ✅ Installs dependencies
2. ✅ Runs linter (if available)
3. ✅ Builds TypeScript project
4. ✅ Runs test suite
5. ✅ Generates coverage report
6. ✅ Uploads artifacts
7. ✅ Comments on PR with results

**Manual Trigger:**
```bash
gh workflow run "TypeScript Guardian"

# Or with specific ref:
gh workflow run "TypeScript Guardian" -f ref=feat/my-feature
```

**Artifacts:**
- `coverage-report` (30 days)
- `build-output` (7 days)

**Expected Duration:** 5-10 minutes

---

### 2. Agent Orchestrator

**Purpose:** Master orchestrator that runs all agent automation tasks in sequence.

**Triggers:**
- Manual dispatch only (for safety)

**What it does:**
1. ✅ Applies patches (if available)
2. ✅ Runs quality checks
3. ✅ Auto-comments on PR
4. ✅ Triggers other workflows
5. ✅ (Optional) Auto-merges if ready

**Manual Trigger:**
```bash
gh workflow run "Agent Orchestrator" \
  -f branch=feat/my-feature \
  -f pr_number=123 \
  -f auto_merge=false
```

**Parameters:**
- `branch` (required): Branch to run on
- `pr_number` (optional): PR to comment on
- `auto_merge` (optional): Enable auto-merge (default: false)

**Security:**
- Auto-merge requires ≥1 human approval
- All checks must pass
- No conflicts allowed

**Expected Duration:** 10-15 minutes

---

### 3. Quality Gate

**Purpose:** Automated code quality checks to catch common issues.

**Triggers:**
- Pull requests to `main` or `develop`
- Manual dispatch

**Checks:**
1. 🔍 Console.log statements
2. 🔍 Potential secrets (passwords, tokens, keys)
3. 🔍 Large files (>500 lines changed)
4. 🔍 Large PRs (>1000 lines total)

**Actions:**
- Comments on PR with findings
- ❌ **FAILS** if secrets detected (security risk)
- ⚠️ Warns for other issues (non-blocking)

**Manual Trigger:**
```bash
gh workflow run "Quality Gate" -f ref=feat/my-feature
```

**Expected Duration:** 2-5 minutes

---

### 4. Test Blocker

**Purpose:** Prevents merging PRs with failing tests.

**Triggers:**
- Pull requests to `main` or `develop`

**What it does:**
1. Runs full test suite
2. If tests **pass**: Adds `tests-passed` label
3. If tests **fail**: 
   - Adds `tests-failed` and `needs-fix` labels
   - Comments on PR
   - ❌ Blocks merge

**No manual trigger** - runs automatically on PRs.

**Artifacts:**
- `test-results` (14 days)

**Expected Duration:** 5-10 minutes

---

### 5. Docker Builder

**Purpose:** Builds Docker image and runs smoke tests.

**Triggers:**
- Push to `main`, `develop`, or `feat/*` branches
- Pull requests to `main`

**What it does:**
1. ✅ Builds Docker image
2. ✅ Pushes to GHCR
3. ✅ Runs smoke tests (container starts, health check)
4. ✅ Creates incident if fails

**Manual Trigger:**
```bash
gh workflow run "Docker Builder"
```

**Image Location:**
```
ghcr.io/carine01/meu-backend/elevare-backend:latest
```

**Expected Duration:** 10-15 minutes

---

## Priority Medium Workflows

### 6. Auto Documentation

**Purpose:** Automatically generates TypeScript documentation.

**Triggers:**
- Push to `main` branch
- Manual dispatch

**What it does:**
1. ✅ Generates TypeDoc documentation
2. ✅ Uploads as artifact
3. ✅ (Optional) Deploys to GitHub Pages

**Manual Trigger:**
```bash
gh workflow run "Auto Documentation"
```

**Artifacts:**
- `documentation` (90 days)

**View Documentation:**
- Download from Actions artifacts
- Or visit GitHub Pages (if enabled)

**Expected Duration:** 3-5 minutes

---

### 7. WhatsApp Monitor

**Purpose:** Monitors WhatsApp service health and creates alerts.

**Triggers:**
- Schedule: Every hour
- Manual dispatch

**What it does:**
1. ✅ Checks health endpoint
2. ✅ Creates incident issue if unhealthy
3. ✅ Sends Slack notification (if configured)
4. ✅ Adds comments to existing incidents

**Manual Trigger:**
```bash
gh workflow run "WhatsApp Monitor"
```

**Configuration Required:**
```bash
# In GitHub Secrets:
WHATSAPP_HEALTH_URL=https://your-api.com/whatsapp/health

# Optional for notifications:
SLACK_WEBHOOK=https://hooks.slack.com/...
```

**Expected Duration:** 1-2 minutes

---

## Manual Execution

### Using GitHub CLI

```bash
# List all workflows
gh workflow list

# View workflow runs
gh run list --workflow="TypeScript Guardian"

# Trigger workflow
gh workflow run "TypeScript Guardian"

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

### Using Scripts Directly

```bash
# Run orchestrator locally
export GITHUB_TOKEN=$(gh auth token)
./scripts/agent/run-agents-all.sh feat/my-feature 123 false

# Apply patches
./scripts/agent/apply-patches.sh

# Run quality checks
./scripts/agent/run-all-checks.sh

# Auto-comment on PR
./scripts/agent/auto-comment-and-assign.sh 123 "reviewer1,reviewer2" "label1,label2"

# Generate docs
./scripts/generate-docs.sh
```

### Using GitHub Web UI

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Fill in parameters (if required)
5. Click **Run workflow**

---

## Troubleshooting

### Common Issues

#### 1. Workflow not triggering

**Check:**
- Workflow file syntax (use YAML validator)
- Branch name matches trigger pattern
- Workflow has correct `on:` triggers

**Fix:**
```bash
# Validate YAML
yamllint .github/workflows/your-workflow.yml

# Manually trigger
gh workflow run "Your Workflow"
```

#### 2. Secrets not available

**Check:**
- Secret is configured in repository settings
- Secret name matches exactly (case-sensitive)
- Secret is accessible to workflow (not organization-level only)

**Fix:**
1. Go to Settings → Secrets and variables → Actions
2. Add or update secret
3. Re-run workflow

#### 3. Permissions denied

**Check:**
- `GITHUB_TOKEN` has required permissions
- Workflow has `permissions:` block if needed

**Fix:**
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

#### 4. Script not executable

**Fix:**
```bash
chmod +x ./scripts/agent/*.sh
git add .
git commit -m "chore: make scripts executable"
git push
```

#### 5. Build failing

**Check:**
- Dependencies installed correctly
- TypeScript compilation errors
- Test failures

**Fix:**
```bash
# Local testing
npm ci
npm run build
npm run test

# Check workflow logs
gh run view --log
```

---

## Best Practices

### 1. Test Locally First

Before pushing changes that affect workflows:

```bash
# Test scripts
./scripts/agent/apply-patches.sh
./scripts/agent/run-all-checks.sh

# Validate workflow files
yamllint .github/workflows/*.yml
```

### 2. Monitor Workflow Runs

```bash
# Check recent runs
gh run list --limit 10

# View failures
gh run list --status failure

# Watch in real-time
gh run watch
```

### 3. Use Dry-Run Mode

For sensitive operations:

```bash
# Don't actually merge
./scripts/agent/auto-merge-if-ready.sh 123 squash --dry-run
```

### 4. Review Automation Regularly

Weekly checklist:
- [ ] Review workflow success rates
- [ ] Check for new security alerts
- [ ] Verify auto-merge is working correctly
- [ ] Review incident issues created
- [ ] Update dependencies

---

## Notification Setup

### Slack Integration

1. Create Slack webhook
2. Add to GitHub Secrets as `SLACK_WEBHOOK`
3. Workflows will automatically notify on failures

### Discord Integration

1. Create Discord webhook
2. Add to GitHub Secrets as `DISCORD_WEBHOOK`
3. Modify workflows to use Discord format

---

## Performance Metrics

Track these metrics:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Build Success Rate | >95% | `gh run list --status success` |
| Average Build Time | <10 min | Check Actions tab |
| Test Coverage | >80% | Download coverage artifact |
| Auto-merge Rate | Variable | Review orchestrator runs |
| Incident Response | <1 hour | Check incident issues |

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Best Practices](./SECURITY_CONFIG.md)
- [Agent Scripts README](../scripts/agent/README.md)

---

*For questions or issues with automation, create an issue with label `automation`.*

*Last updated: 2025-11-23*
