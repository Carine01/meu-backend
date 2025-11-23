# 🚀 Quick Reference - Agent Automation

Quick command reference for all automation workflows and scripts.

## 📋 Common Commands

### Trigger Workflows (GitHub CLI)

```bash
# Run full orchestrator
gh workflow run "Agent Orchestrator" \
  -f branch=feat/whatsapp-clinicid-filters \
  -f pr_number=123 \
  -f auto_merge=false

# Run TypeScript Guardian
gh workflow run "TypeScript Guardian" \
  -f ref=feat/whatsapp-clinicid-filters

# Run Docker Builder
gh workflow run "Docker Builder"

# Run Quality Gate
gh workflow run "Quality Gate" \
  -f ref=feat/whatsapp-clinicid-filters

# Run Auto Documentation
gh workflow run "Auto Documentation"

# Run WhatsApp Monitor (manual check)
gh workflow run "WhatsApp Monitor"
```

### Run Scripts Locally

```bash
# Set token (required for some scripts)
export GITHUB_TOKEN=$(gh auth token)

# Apply patches
./scripts/agent/apply-patches.sh

# Run all quality checks
./scripts/agent/run-all-checks.sh

# Run full orchestrator
./scripts/agent/run-agents-all.sh feat/my-feature 123 false

# Auto-comment on PR
./scripts/agent/auto-comment-and-assign.sh 123 "reviewer1,reviewer2" "label1,label2"

# Auto-merge if ready (with approval check)
./scripts/agent/auto-merge-if-ready.sh 123 squash

# Generate documentation
./scripts/generate-docs.sh
```

### View Workflow Status

```bash
# List recent runs
gh run list --limit 10

# List failed runs
gh run list --status failure

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>

# Watch workflow in real-time
gh run watch
```

## 🔐 Required Secrets

Configure in: **Settings → Secrets and variables → Actions**

```bash
DB_URL=postgresql://user:pass@host:5432/db
WHATSAPP_PROVIDER_TOKEN=your_token
JWT_SECRET=your_secret
SLACK_WEBHOOK=https://hooks.slack.com/... (optional)
WHATSAPP_HEALTH_URL=https://api.com/health (optional)
```

## 🛡️ Security Rules

- ✅ Auto-merge requires ≥1 human approval
- ✅ All status checks must pass
- ✅ No merge conflicts allowed
- ✅ Branch protection on `main`
- ✅ Secret scanning enabled

## 📊 Workflow Matrix

| Workflow | When | Duration | Priority |
|----------|------|----------|----------|
| TypeScript Guardian | push/PR | 5-10 min | 🔴 High |
| Agent Orchestrator | manual | 10-15 min | 🔴 High |
| Quality Gate | PR | 2-5 min | 🔴 High |
| Test Blocker | PR | 5-10 min | 🔴 High |
| Docker Builder | push/PR | 10-15 min | 🔴 High |
| Auto Documentation | push to main | 3-5 min | 🟡 Medium |
| WhatsApp Monitor | hourly | 1-2 min | 🟡 Medium |

## 🚨 Emergency Commands

```bash
# Create security incident
gh issue create \
  --title "🚨 SECURITY: [Description]" \
  --body "Details..." \
  --label "security,priority/critical"

# Force-stop workflow
gh run cancel <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed

# View logs quickly
gh run view --log
```

## 🔍 Troubleshooting

```bash
# Check workflow syntax
yamllint .github/workflows/*.yml

# Make scripts executable
chmod +x scripts/agent/*.sh

# Test script locally
bash -x ./scripts/agent/apply-patches.sh

# Validate GitHub token
gh auth status
```

## 📝 Quick Setup Checklist

- [ ] Configure all required secrets
- [ ] Enable branch protection on `main`
- [ ] Enable Dependabot
- [ ] Enable secret scanning
- [ ] Enable push protection
- [ ] Test TypeScript Guardian workflow
- [ ] Test Agent Orchestrator workflow
- [ ] Configure notification webhook (optional)

## 📚 Full Documentation

- [Complete Automation Guide](../docs/AUTOMATION_GUIDE.md)
- [Security Configuration](../docs/SECURITY_CONFIG.md)
- [Agent Scripts README](./README.md)

---

*Keep this file handy for quick access to common commands!*
