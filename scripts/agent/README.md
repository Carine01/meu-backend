# Agent Scripts Documentation

This directory contains automation scripts for the meu-backend repository. These scripts are used by GitHub Actions workflows and can also be run manually.

## 📋 Table of Contents

- [Priority High Scripts](#priority-high-scripts)
- [Priority Medium Scripts](#priority-medium-scripts)
- [Usage Examples](#usage-examples)
- [Security Considerations](#security-considerations)

## Priority High Scripts

### 1. apply-patches.sh

**Purpose:** Automatically applies patch files if they exist.

**Usage:**
```bash
./scripts/agent/apply-patches.sh
```

**What it does:**
- Applies `patch-clinicId-filters.patch` if present
- Applies `patch-agent-workflows.patch` if present
- Commits and pushes changes automatically
- Safe to run multiple times (idempotent)

**Workflow Integration:** Used by `agent-orchestrator.yml`

---

### 2. run-all-checks.sh

**Purpose:** Runs comprehensive quality checks on the codebase.

**Usage:**
```bash
./scripts/agent/run-all-checks.sh
```

**What it does:**
- Installs dependencies if needed
- Runs linting
- Builds the project
- Runs tests
- Generates coverage reports

**Workflow Integration:** Used by `agent-orchestrator.yml` and `typescript-guardian.yml`

---

### 3. run-agents-all.sh

**Purpose:** Main orchestrator script that runs all agent tasks in sequence.

**Usage:**
```bash
./scripts/agent/run-agents-all.sh <branch> <PR_NUMBER> [auto_merge]

# Example:
./scripts/agent/run-agents-all.sh feat/new-feature 123 false
```

**Parameters:**
- `branch`: Git branch name
- `PR_NUMBER`: Pull request number
- `auto_merge`: Enable auto-merge (true/false, default: false)

**What it does:**
1. Applies patches
2. Runs quality checks
3. Auto-comments on PR
4. Checks for failures
5. Optionally auto-merges if ready

**Workflow Integration:** Can trigger workflows via `agent-orchestrator.yml`

---

## Priority Medium Scripts

### 4. auto-comment-and-assign.sh

**Purpose:** Automatically comments on PRs and assigns reviewers/labels.

**Usage:**
```bash
./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER> [reviewers] [labels]

# Examples:
./scripts/agent/auto-comment-and-assign.sh 123
./scripts/agent/auto-comment-and-assign.sh 123 "user1,user2" "bug,priority/high"
```

**Parameters:**
- `PR_NUMBER`: Pull request number (required)
- `reviewers`: Comma-separated list of GitHub usernames (optional)
- `labels`: Comma-separated list of labels (optional)

**What it does:**
- Posts standardized comment on PR
- Assigns specified reviewers
- Adds specified labels
- Requires GitHub CLI (`gh`)

**Workflow Integration:** Used by `agent-orchestrator.yml`

---

### 5. auto-merge-if-ready.sh

**Purpose:** Conditionally merges PR if all requirements are met.

**Usage:**
```bash
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [merge_method]

# Examples:
./scripts/agent/auto-merge-if-ready.sh 123
./scripts/agent/auto-merge-if-ready.sh 123 squash
```

**Parameters:**
- `PR_NUMBER`: Pull request number (required)
- `merge_method`: merge|squash|rebase (default: squash)

**Security Requirements:**
- ✅ PR must be open
- ✅ At least 1 human approval required
- ✅ All status checks must pass
- ✅ PR must be mergeable (no conflicts)

**What it does:**
- Validates PR state and approvals
- Checks all status checks passed
- Verifies PR is mergeable
- Performs merge if all conditions met

**⚠️ SECURITY:** Never auto-merges without human approval.

**Workflow Integration:** Used by `agent-orchestrator.yml` (optional)

---

## Additional Scripts

### generate-docs.sh

**Purpose:** Generates TypeScript documentation using typedoc.

**Usage:**
```bash
./scripts/generate-docs.sh
```

**What it does:**
- Installs typedoc if needed
- Creates typedoc.json configuration
- Generates documentation in `./docs`

**Workflow Integration:** Used by `auto-docs.yml`

---

## Usage Examples

### Manual Orchestration

Run the full automation suite manually:

```bash
# Set environment variables
export GITHUB_TOKEN="your_token"

# Run orchestrator
./scripts/agent/run-agents-all.sh feat/my-feature 123 false
```

### Workflow Dispatch

Trigger via GitHub CLI:

```bash
# Trigger orchestrator workflow
gh workflow run "Agent Orchestrator" \
  -f branch=feat/my-feature \
  -f pr_number=123 \
  -f auto_merge=false

# Trigger TypeScript Guardian
gh workflow run "TypeScript Guardian" \
  -f ref=feat/my-feature

# Trigger Docker Builder
gh workflow run "Docker Builder"
```

### Local Testing

Test scripts locally before committing:

```bash
# Make scripts executable
chmod +x ./scripts/agent/*.sh

# Test patch application
./scripts/agent/apply-patches.sh

# Test quality checks
./scripts/agent/run-all-checks.sh

# Test documentation generation
./scripts/generate-docs.sh
```

---

## Security Considerations

### 🔒 Required Secrets

Configure these in GitHub Settings → Secrets:

```bash
# Database
DB_URL=postgresql://user:pass@host:5432/db

# WhatsApp
WHATSAPP_PROVIDER_TOKEN=your_token

# JWT
JWT_SECRET=your_secret

# Docker (if using private registry)
DOCKER_USERNAME=username
DOCKER_PASSWORD=password

# Notifications (optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# WhatsApp Monitor (optional)
WHATSAPP_HEALTH_URL=https://your-api.com/whatsapp/health
```

### 🛡️ Security Rules

1. **Never auto-merge without approval:** Scripts enforce at least 1 human review
2. **Secrets only via GitHub Secrets:** Never commit secrets in code
3. **Branch protection:** Enable on `main` branch to require checks
4. **Token scoping:** Use tokens with minimum required permissions
5. **Audit logs:** All automation actions are logged in workflow runs

### 📝 Best Practices

1. **Test locally first:** Always test scripts locally before pushing
2. **Review automation changes:** Monitor workflow runs regularly
3. **Update dependencies:** Keep actions and dependencies up to date
4. **Use semantic versioning:** Tag action versions explicitly
5. **Document changes:** Update this README when adding new scripts

---

## Workflow Reference

| Workflow | Trigger | Purpose | Priority |
|----------|---------|---------|----------|
| TypeScript Guardian | push, PR, manual | Build, test, lint | High |
| Agent Orchestrator | manual | Run all automation | High |
| Quality Gate | PR | Check code quality | High |
| Test Blocker | PR | Block if tests fail | High |
| Docker Builder | push, PR | Build Docker image | High |
| Auto Documentation | push to main | Generate docs | Medium |
| WhatsApp Monitor | schedule (hourly) | Health checks | Medium |

---

## Troubleshooting

### Script not executable

```bash
chmod +x ./scripts/agent/*.sh
```

### GitHub CLI not authenticated

```bash
gh auth login
```

### Patches already applied

The scripts are idempotent - running them multiple times is safe.

### Workflow not found

Ensure workflow files exist in `.github/workflows/` and are committed.

### Permission denied

Check that `GITHUB_TOKEN` has required permissions in workflow settings.

---

## Contributing

When adding new automation scripts:

1. Add to appropriate priority section above
2. Document usage and parameters
3. Include security considerations
4. Update workflow reference table
5. Test thoroughly before merging

---

*Last updated: 2025-11-23*
