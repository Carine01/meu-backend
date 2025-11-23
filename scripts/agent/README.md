# Agent Automation Scripts

Este diretório contém scripts de automação para orquestração de workflows e gerenciamento de PRs.

## Scripts Disponíveis

### 1. fast-deploy-agents.sh
Script tudo-em-um para deploy completo e orquestração de agents.

**Uso:**
```bash
./scripts/agent/fast-deploy-agents.sh [BRANCH] [PR_NUMBER] [AUTO_MERGE]
```

**Exemplo:**
```bash
./scripts/agent/fast-deploy-agents.sh "feat/whatsapp-clinicid-filters"
./scripts/agent/fast-deploy-agents.sh "feat/whatsapp-clinicid-filters" "123" "false"
```

**Funcionalidades:**
- Aplica patches automaticamente
- Commit e push de mudanças
- Cria PR se não existir
- Configura GitHub Secrets
- Dispara workflows críticos
- Aguarda conclusão dos workflows
- Comenta no PR com resumo
- Cria issue de incidente em caso de falha
- (Opcional) Auto-merge se habilitado

### 2. run-all-checks.sh
Dispara workflows principais e aguarda conclusão.

**Uso:**
```bash
./scripts/agent/run-all-checks.sh [REF]
```

**Exemplo:**
```bash
./scripts/agent/run-all-checks.sh "feat/my-branch"
```

### 3. auto-comment-and-assign.sh
Adiciona comentário automático, labels e solicita reviewers no PR.

**Uso:**
```bash
./scripts/agent/auto-comment-and-assign.sh [PR_NUMBER] [REVIEWERS] [LABELS]
```

**Exemplo:**
```bash
./scripts/agent/auto-comment-and-assign.sh "123" "dev1,dev2" "implementation,priority/high"
```

### 4. auto-merge-if-ready.sh
Realiza merge automático se PR tiver aprovações e todos os checks passarem.

**Uso:**
```bash
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [MERGE_METHOD]
```

**Exemplo:**
```bash
./scripts/agent/auto-merge-if-ready.sh "123" "squash"
```

**Verificações:**
- Pelo menos uma aprovação
- Todos os checks com status SUCCESS
- Branch pode ser mesclado

### 5. run-agents-all.sh
Orquestrador local que executa todos os workflows e gera relatório.

**Uso:**
```bash
./scripts/agent/run-agents-all.sh [BRANCH] [PR_NUMBER] [AUTO_MERGE]
```

**Exemplo:**
```bash
./scripts/agent/run-agents-all.sh "feat/my-feature" "123" "false"
```

## Pré-requisitos

Todos os scripts requerem:
- GitHub CLI (`gh`) instalado e autenticado
- Git configurado
- `jq` para processamento JSON
- Permissões adequadas no repositório

### Instalação do GitHub CLI

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install gh

# macOS
brew install gh

# Autenticação
gh auth login
```

## Configuração de Secrets

Para que o `fast-deploy-agents.sh` configure secrets automaticamente, exporte as variáveis de ambiente:

```bash
export DB_URL="postgresql://user:pass@host:5432/dbname"
export WHATSAPP_PROVIDER_TOKEN="seu_token"
export WHATSAPP_PROVIDER_API_URL="https://api.gateway.whatsapp"
export JWT_SECRET="seu_jwt_secret"
export DOCKER_REGISTRY_USER="user"
export DOCKER_REGISTRY_PASS="pass"
```

Ou configure manualmente via GitHub UI:
1. Settings → Secrets → Actions
2. Adicione cada secret necessário

## Workflows Associados

Os scripts trabalham em conjunto com os seguintes workflows:
- `agent-orchestrator.yml` - Orquestração principal
- `agent-reviewer.yml` - Automação de revisão
- `agent-auto-docs.yml` - Geração de documentação
- `agent-tests-blocker.yml` - Validação de testes

## Boas Práticas

1. **Sempre revise** o código antes de usar auto-merge
2. **Configure secrets** antes de executar o fast-deploy
3. **Monitore os logs** dos workflows no GitHub Actions
4. **Use branches** para testar mudanças
5. **Mantenha aprovação humana** habilitada

## Troubleshooting

### Erro: "gh not found"
```bash
# Instale o GitHub CLI
sudo apt install gh
gh auth login
```

### Erro: "Permission denied"
```bash
# Torne os scripts executáveis
chmod +x scripts/agent/*.sh
```

### Erro: "Failed to create PR"
```bash
# Verifique se você tem permissão no repositório
gh auth status
```

## Suporte

Para problemas ou dúvidas, consulte:
- Logs dos workflows em GitHub Actions
- Issues criadas automaticamente em caso de falha
- Comentários automáticos nos PRs
