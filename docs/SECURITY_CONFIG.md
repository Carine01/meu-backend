# Security Configuration Guide

This document outlines security best practices and configuration requirements for the automation workflows.

## 🔐 Required GitHub Secrets

Configure these secrets in: **Settings → Secrets and variables → Actions**

### Database Configuration

```bash
DB_URL=postgresql://username:password@hostname:5432/database_name
```

### WhatsApp Integration

```bash
WHATSAPP_PROVIDER_TOKEN=your_whatsapp_provider_token
```

### Authentication

```bash
JWT_SECRET=your_jwt_secret_key_min_32_characters
```

### Docker Registry (if using private registry)

```bash
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
```

### Notifications (Optional)

```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR/WEBHOOK
```

### Monitoring (Optional)

```bash
WHATSAPP_HEALTH_URL=https://your-api.com/whatsapp/health
```

## 🛡️ Security Rules

### 1. Auto-Merge Safety

The `auto-merge-if-ready.sh` script enforces:
- ✅ At least **1 human approval** required
- ✅ All status checks must pass
- ✅ PR must be mergeable (no conflicts)
- ✅ PR must be in OPEN state

**Never bypass these checks.**

### 2. Branch Protection

Configure branch protection for `main`:

```yaml
Required checks:
  - TypeScript Guardian
  - Test Blocker
  - Quality Gate

Required approvals: 1
Dismiss stale reviews: true
Require review from code owners: true
Restrict who can push: true
```

**To configure:**
1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Enable all required checks

### 3. Token Permissions

#### GITHUB_TOKEN (default)
- ✅ Read repository contents
- ✅ Write pull requests
- ✅ Write issues
- ✅ Create comments
- ⚠️ Cannot force-push or modify branch protection

#### Personal Access Token (if needed)
Only create PAT if you need:
- Complex merge operations
- Branch protection rule modifications

**Minimum scopes required:**
- `repo` (for private repositories)
- `workflow` (to trigger workflows)

### 4. Secret Scanning

Enable GitHub's built-in security features:

**Enable in:** Settings → Security → Code security and analysis

- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Secret scanning
- ✅ Push protection (prevents committing secrets)

### 5. Workflow Security

#### Secure Workflow Practices

```yaml
# ✅ GOOD: Use specific versions
uses: actions/checkout@v4

# ❌ BAD: Use moving tags
uses: actions/checkout@main

# ✅ GOOD: Limit permissions
permissions:
  contents: read
  pull-requests: write

# ✅ GOOD: Validate inputs
run: |
  if [ -z "${{ github.event.inputs.pr_number }}" ]; then
    echo "PR number required"
    exit 1
  fi
```

## 🚨 Incident Response

### Automated Incident Creation

Workflows automatically create issues for:
- ❌ Docker build failures
- ❌ WhatsApp service health failures
- ❌ Test suite failures
- ❌ Secret detection

**Labels applied:**
- `incident`
- `priority/high`
- `automated`
- Service-specific labels

### Manual Incident Creation

Use GitHub CLI to create incident issues:

```bash
gh issue create \
  --title "🚨 Incident: [Brief Description]" \
  --body "$(cat incident-template.md)" \
  --label "incident,priority/high"
```

### Notification Channels

Configure for critical alerts:

```bash
# Slack
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Discord  
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

Workflows will automatically notify on:
- WhatsApp service failures
- Docker build failures
- Critical security issues

## 🔍 Audit & Monitoring

### View Workflow Runs

```bash
# List recent workflow runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# Download logs
gh run download <run-id>
```

### Monitor Secret Usage

- Review Actions logs for secret exposure
- Enable push protection to prevent commits
- Rotate secrets regularly (quarterly recommended)

### Audit Automation Actions

Review weekly:
1. Workflow success/failure rates
2. Auto-merge frequency
3. Incident creation patterns
4. Secret scanning alerts

## 🔒 Security Checklist

Before deploying to production:

- [ ] All required secrets configured
- [ ] Branch protection enabled on `main`
- [ ] Secret scanning enabled
- [ ] Dependabot enabled
- [ ] Push protection enabled
- [ ] Workflow permissions minimal
- [ ] All actions use pinned versions
- [ ] Token scopes are minimal
- [ ] Notification webhooks configured
- [ ] Incident response plan documented

## 📊 Security Metrics

Track these metrics monthly:

| Metric | Target | Current |
|--------|--------|---------|
| Auto-merge with approval | 100% | - |
| Secret scanning alerts | 0 | - |
| Critical vulnerabilities | 0 | - |
| Incident response time | < 1hr | - |
| Failed deployments | < 5% | - |

## 🚫 Prohibited Actions

**Never do these:**

1. ❌ Commit secrets in code
2. ❌ Disable branch protection temporarily
3. ❌ Auto-merge without human approval
4. ❌ Share personal access tokens
5. ❌ Use wildcards for action versions (e.g., `@main`)
6. ❌ Disable security features "temporarily"
7. ❌ Store sensitive data in workflow files
8. ❌ Bypass required checks

## 📝 Security Update Process

When security vulnerabilities are found:

1. **Assess severity** (use GitHub Advisory Database)
2. **Create incident issue** (automatically done by workflows)
3. **Patch immediately** for critical vulnerabilities
4. **Test patches** in development environment
5. **Deploy to production** with expedited review
6. **Document** in security changelog

### Emergency Hotfix Process

For critical security issues:

```bash
# Create hotfix branch
git checkout -b hotfix/security-patch main

# Apply fix
# ... make changes ...

# Push and create PR
git push origin hotfix/security-patch
gh pr create --title "🚨 SECURITY: [Description]" \
  --label "security,priority/critical"

# Request emergency review
# Merge immediately after approval
```

## 🔗 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

---

## Contact

For security concerns or questions:
- Create a private security advisory on GitHub
- Do not discuss security vulnerabilities in public issues

---

*Last updated: 2025-11-23*
