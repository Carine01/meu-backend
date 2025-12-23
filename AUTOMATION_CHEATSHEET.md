# 🤖 Automation Commands Cheatsheet

Quick copy-paste commands for all automation tasks.

## 🚀 Trigger All Automation

```bash
gh workflow run "Agent Orchestrator" \
  -f branch=feat/whatsapp-clinicid-filters \
  -f pr_number=YOUR_PR_NUMBER \
  -f auto_merge=false
```

## 📦 Run Specific Workflows

```bash
# TypeScript Guardian (build, test, lint)
gh workflow run "TypeScript Guardian" --ref feat/whatsapp-clinicid-filters

# Docker Builder
gh workflow run "Docker Builder"

# Quality Gate
gh workflow run "Quality Gate" --ref feat/whatsapp-clinicid-filters

# Auto Documentation
gh workflow run "Auto Documentation"

# WhatsApp Monitor
gh workflow run "WhatsApp Monitor"
```

## 🛠️ Run Scripts Locally

```bash
# Apply patches
./scripts/agent/apply-patches.sh

# Run all checks
./scripts/agent/run-all-checks.sh

# Full orchestration
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters YOUR_PR_NUMBER false

# Auto-comment on PR
./scripts/agent/auto-comment-and-assign.sh YOUR_PR_NUMBER "dev1,dev2" "label1,label2"

# Generate docs
./scripts/generate-docs.sh
```

## 🔐 Configure Secrets

Go to: **Settings → Secrets and variables → Actions**

```bash
gh secret set DB_URL --body "postgresql://user:pass@host:5432/db"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "your_token"
gh secret set JWT_SECRET --body "your_secret"
```

## 📊 Monitor Workflows

```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view RUN_ID

# Download artifacts
gh run download RUN_ID
```

## 🆘 Need Help?

- Full documentation: [docs/AUTOMATION_GUIDE.md](docs/AUTOMATION_GUIDE.md)
- Quick reference: [scripts/agent/QUICK_REFERENCE.md](scripts/agent/QUICK_REFERENCE.md)
- Security guide: [docs/SECURITY_CONFIG.md](docs/SECURITY_CONFIG.md)
- Scripts README: [scripts/agent/README.md](scripts/agent/README.md)

---

**Replace** `YOUR_PR_NUMBER` and branch names with actual values when using these commands.
