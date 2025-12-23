# Agent Scripts

Este diretório contém scripts shell para automação de CI/CD e gerenciamento de PRs.

## Scripts Disponíveis

### 1. `run-all-checks.sh`
Dispara e monitora workflows principais do GitHub Actions.

**Uso:**
```bash
./scripts/agent/run-all-checks.sh [branch/ref]
```

**Workflows monitorados:**
- TypeScript Guardian
- Register Fila Fallback (AST)
- Docker Builder
- WhatsApp Monitor

### 2. `auto-comment-and-assign.sh`
Adiciona comentário automático com checklist no PR e configura labels/reviewers.

**Uso:**
```bash
./scripts/agent/auto-comment-and-assign.sh [PR_NUMBER] [REVIEWERS] [LABELS]
```

**Exemplo:**
```bash
./scripts/agent/auto-comment-and-assign.sh 42 "dev1,dev2" "implementation,priority/high"
```

### 3. `auto-merge-if-ready.sh`
Realiza merge automático do PR se todas as condições forem atendidas.

**Condições:**
- Pelo menos uma aprovação
- Todos os checks com sucesso
- Permissão admin se necessário

**Uso:**
```bash
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> [merge_method]
```

**Exemplo:**
```bash
./scripts/agent/auto-merge-if-ready.sh 42 squash
```

### 4. `run-agents-all.sh`
Orquestrador local que executa todos os workflows e monitora seus resultados.

**Uso:**
```bash
./scripts/agent/run-agents-all.sh [branch] [PR_NUMBER] [AUTO_MERGE]
```

**Exemplo:**
```bash
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 42 false
```

### 5. `fast-deploy-agents.sh` ⭐
Script completo de deploy que executa todas as etapas de automação.

**Funcionalidades:**
- Aplica patches se existirem
- Commit e push de mudanças
- Cria ou detecta PR automaticamente
- Configura GitHub Secrets (opcional)
- Dispara workflows
- Comenta no PR com checklist
- Cria issue de incidente se houver falhas críticas
- Auto-merge (opcional, se habilitado)

**Uso:**
```bash
./scripts/agent/fast-deploy-agents.sh [branch] [AUTO_MERGE] [CREATE_SECRETS]
```

**Exemplo completo:**
```bash
# Deploy básico sem auto-merge
./scripts/agent/fast-deploy-agents.sh feat/whatsapp-clinicid-filters false false

# Deploy com auto-merge habilitado
./scripts/agent/fast-deploy-agents.sh feat/whatsapp-clinicid-filters true false

# Deploy com criação de secrets
export DB_URL="postgresql://user:pass@host:5432/db"
export WHATSAPP_PROVIDER_TOKEN="token"
export JWT_SECRET="secret"
./scripts/agent/fast-deploy-agents.sh feat/whatsapp-clinicid-filters false true
```

## Pré-requisitos

1. **gh CLI instalado e autenticado:**
```bash
gh auth login
```

2. **Scripts executáveis:**
```bash
chmod +x scripts/agent/*.sh
```

3. **Patches (opcionais):**
- `patch-clinicId-filters.patch`
- `patch-agent-workflows.patch`
- `patch-agent-workflows-2.patch`

## Comando Rápido (One-liner)

Para executar tudo de uma vez:

```bash
# Autenticar (primeira vez)
gh auth login

# Tornar scripts executáveis
chmod +x scripts/agent/*.sh

# Executar deploy completo
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/fast-deploy-agents.sh "$BRANCH"
```

## Configuração de Secrets (Opcional)

Para configurar secrets automaticamente, exporte as variáveis de ambiente:

```bash
export DB_URL="postgresql://user:pass@host:5432/dbname"
export WHATSAPP_PROVIDER_TOKEN="seu_token_whatsapp"
export WHATSAPP_PROVIDER_API_URL="https://api.gateway.whatsapp"
export JWT_SECRET="seu_jwt_secret"
export DOCKER_REGISTRY_USER="user"
export DOCKER_REGISTRY_PASS="pass"

# Execute com CREATE_SECRETS=true
./scripts/agent/fast-deploy-agents.sh "$BRANCH" false true
```

Ou configure manualmente via CLI:

```bash
gh secret set DB_URL --body "postgresql://user:pass@host:5432/dbname"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "seu_token"
gh secret set JWT_SECRET --body "seu_jwt_secret"
```

## Acompanhamento

Comandos úteis para acompanhar a execução:

```bash
# Listar runs recentes
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# Ver detalhes de um run
gh run view <RUN_ID> --log --exit-status

# Ver comentários do PR
gh pr view <PR_NUMBER> --comments

# Ver status dos checks
gh pr checks <PR_NUMBER>
```

## Workflows GitHub Actions

Os seguintes workflows foram configurados:

### Agent Orchestrator
Orquestra a execução de todos os scripts de agente em sequência.

**Triggers:**
- Pull request (opened, reopened, synchronize)
- Workflow dispatch manual

### Agent Reviewer
Adiciona checklist automático e solicita reviewers.

**Triggers:**
- Pull request (opened, reopened, synchronize, labeled)

### Agent Auto-Docs
Gera documentação automaticamente quando houver mudanças.

**Triggers:**
- Push para main em docs/, src/, .github/

### Agent Tests Blocker
Executa testes e bloqueia merge se houver falhas.

**Triggers:**
- Pull request (opened, synchronize, reopened)

### TypeScript Guardian
Valida compilação TypeScript, executa testes e quality gates.

**Quality Gates:**
- Nenhum `console.log` no código
- Nenhum secret hardcoded

### Register Fila Fallback
Aplica e verifica implementação de fallback no FilaService.

### WhatsApp Monitor
Verifica arquivos de integração WhatsApp e filtros de clinicId.

### Docker Builder
Constrói e publica imagem Docker para o registry.

## Troubleshooting

### Erro: "gh CLI não está instalado"
```bash
sudo apt update
sudo apt install -y gh
```

### Erro: "gh não está autenticado"
```bash
gh auth login
```

### Erro: "Permission denied" ao executar scripts
```bash
chmod +x scripts/agent/*.sh
```

### Workflow não encontrado
Verifique se o nome do workflow está correto (case-sensitive):
```bash
gh workflow list
```

### PR não detectado
Certifique-se de estar na branch correta ou passe o PR_NUMBER manualmente:
```bash
./scripts/agent/auto-comment-and-assign.sh 42
```

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commite secrets no código
- Use GitHub Secrets para informações sensíveis
- Revise o código antes de habilitar auto-merge
- Sempre exija aprovação humana em PRs críticos

## Suporte

Para problemas ou sugestões, abra uma issue no repositório.
