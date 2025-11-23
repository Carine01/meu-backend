# 🤖 PR Orchestrator - Quick Reference

## Auto-Comment and Assign Script

### Basic Usage

```bash
# Post orchestrator comment on PR #123
./scripts/auto-comment-and-assign.sh 123

# With all options
./scripts/auto-comment-and-assign.sh <PR_NUMBER> <AUTO_MERGE> <REVIEWERS> <LABELS>
```

### Examples

```bash
# Simple comment only
./scripts/auto-comment-and-assign.sh 123

# With labels
./scripts/auto-comment-and-assign.sh 123 false "" "implementation,priority/high"

# With reviewers
./scripts/auto-comment-and-assign.sh 123 false "dev1,dev2" "feature"

# Full automation with auto-merge
./scripts/auto-comment-and-assign.sh 123 true "carine01" "hotfix,priority/critical"
```

### Using Environment Variables

```bash
export PR_NUMBER=123
export AUTO_MERGE=true
export REVIEWERS="dev1,dev2"
export LABELS="implementation,priority/high"
./scripts/auto-comment-and-assign.sh
```

## GitHub Workflow Triggers

### Automatic (on PR open/reopen)

The workflow automatically runs when:
- A new PR is opened
- An existing PR is reopened

Default behavior:
- Posts the orchestrator comment
- Applies `automation` label

### Manual (workflow_dispatch)

```bash
# Via GitHub CLI
gh workflow run pr-orchestrator.yml \
  -f pr_number=123 \
  -f auto_merge=true \
  -f reviewers=dev1,dev2 \
  -f labels=implementation,priority/high

# Via GitHub UI
# Go to Actions → PR Orchestrator → Run workflow
```

## Testing

```bash
# Run validation tests
./scripts/test-orchestrator.sh
```

This validates:
- Shell script syntax
- YAML workflow syntax
- File permissions
- GitHub CLI availability

## Commented Message Preview

The orchestrator posts this message:

```
🚀 **Agente Orquestrador Ativado**

O fluxo de automação foi iniciado com sucesso.  
Este PR agora está sob monitoramento contínuo pelo sistema de agentes da plataforma.

### 📌 O que já foi feito:
• Validação inicial executada  
• Workflows disparados  
• Labels estratégicas aplicadas  
• Revisores notificados (quando configurados)

### ⚙️ Como usar este PR com inputs do Orquestrador:
- `auto_merge=true` → habilita tentativa automática de merge assim que:
  ✓ todos os checks passarem  
  ✓ houver pelo menos 1 aprovação  
- `reviewers=dev1,dev2` → solicita revisores automaticamente
- `labels=implementation,priority/high` → adiciona labels personalizadas

### 🛰 Próximos passos automatizados:
O Orquestrador continuará monitorando este PR.  
Se todos os critérios forem atendidos, o merge será tentado automaticamente (quando `auto_merge=true`).

Caso contrário, ele retornará comentários adicionais orientando o que falta.

---

💡 *Este PR está sendo gerido pelo ecossistema de automação Elevare.  
Qualquer alteração manual continuará sendo compatível com os agentes.*
```

## Common Labels

Suggested labels for the orchestrator:

- `automation` - Automated process
- `implementation` - Implementation task
- `priority/high` - High priority
- `priority/critical` - Critical priority
- `feature` - New feature
- `bugfix` - Bug fix
- `hotfix` - Urgent fix
- `documentation` - Documentation changes
- `ci` - CI/CD related
- `security` - Security related

## Troubleshooting

### Script fails with "gh CLI not installed"
**Solution**: Install GitHub CLI
```bash
# macOS
brew install gh

# Linux
apt install gh

# Windows
winget install GitHub.cli
```

### "Permission denied" when running script
**Solution**: Make script executable
```bash
chmod +x scripts/auto-comment-and-assign.sh
```

### Auto-merge not working
**Possible causes**:
1. Insufficient permissions (need maintainer role)
2. Repository settings don't allow auto-merge
3. Branch protection rules not configured

**Solution**: Enable auto-merge in repository settings and configure branch protection

### Labels/reviewers not applied
**Possible causes**:
1. Labels don't exist in the repository
2. Reviewers have invalid usernames
3. Token permissions insufficient

**Solution**: 
- Create labels first: `gh label create "label-name" --color XXXXXX`
- Verify reviewer usernames exist
- Check token has `pull-requests: write` permission

## Next Steps

After the orchestrator runs:
1. ✅ Check the PR comment was posted
2. ✅ Verify labels were applied
3. ✅ Confirm reviewers were requested (if specified)
4. ✅ Monitor CI/CD workflows
5. ✅ Watch for auto-merge (if enabled)

## Full Documentation

For comprehensive documentation, see: [docs/ORCHESTRATOR.md](../docs/ORCHESTRATOR.md)

---

🚀 **Happy automating!**
