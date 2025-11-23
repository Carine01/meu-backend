# Guia de Uso: Automação de Agents e Workflows

Este guia fornece instruções para usar o sistema de automação completo implementado neste repositório.

## 🚀 Início Rápido (30 segundos)

### Pré-requisitos

1. **Autenticação GitHub CLI:**
```bash
gh auth login
```

2. **Tornar scripts executáveis (uma vez):**
```bash
chmod +x scripts/agent/*.sh
```

### Comando Único para Deploy Completo

```bash
# Substitua pela sua branch (ou use main como padrão)
BRANCH="feat/whatsapp-clinicid-filters"

# Execute o script de deploy rápido
./scripts/agent/fast-deploy-agents.sh "$BRANCH"
```

**Nota:** Se não especificar a branch, o padrão é `main`.

Este comando único irá:
- ✅ Aplicar patches (se existirem)
- ✅ Fazer commit e push das mudanças
- ✅ Criar/detectar PR automaticamente
- ✅ Disparar todos os workflows críticos
- ✅ Adicionar comentário com checklist no PR
- ✅ Criar issue de incidente se houver falhas
- ✅ (Opcional) Tentar auto-merge se habilitado

## 📁 Estrutura de Arquivos

```
.
├── scripts/agent/                    # Scripts de automação
│   ├── README.md                     # Documentação detalhada
│   ├── run-all-checks.sh            # Dispara workflows
│   ├── auto-comment-and-assign.sh   # Comenta e atribui no PR
│   ├── auto-merge-if-ready.sh       # Merge automático
│   ├── run-agents-all.sh            # Orquestrador local
│   └── fast-deploy-agents.sh        # ⭐ Script completo
│
└── .github/workflows/                # GitHub Actions
    ├── agent-orchestrator.yml        # Orquestrador principal
    ├── agent-reviewer.yml            # Auto-comentário
    ├── agent-auto-docs.yml           # Docs automáticos
    ├── agent-tests-blocker.yml       # Bloqueio por testes
    ├── typescript-guardian.yml       # Build + Tests + QA
    ├── register-fila-fallback.yml    # Fallback AST
    └── whatsapp-monitor.yml          # Monitor WhatsApp
```

## 🎯 Cenários de Uso

### Cenário 1: Deploy Básico (Recomendado)

Para um deploy seguro sem auto-merge:

```bash
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/fast-deploy-agents.sh "$BRANCH" false false
```

### Cenário 2: Deploy com Auto-Merge

⚠️ **Use com cuidado!** Só habilite se tiver aprovação humana:

```bash
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/fast-deploy-agents.sh "$BRANCH" true false
```

### Cenário 3: Deploy com Criação de Secrets

Para configurar secrets automaticamente:

```bash
# Exporte as variáveis de ambiente
export DB_URL="postgresql://user:pass@host:5432/dbname"
export WHATSAPP_PROVIDER_TOKEN="seu_token"
export WHATSAPP_PROVIDER_API_URL="https://api.gateway.whatsapp"
export JWT_SECRET="seu_jwt_secret"
export DOCKER_REGISTRY_USER="user"
export DOCKER_REGISTRY_PASS="pass"

# Execute com CREATE_SECRETS=true
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/fast-deploy-agents.sh "$BRANCH" false true
```

### Cenário 4: Executar Apenas Checks

Se você só quer disparar os workflows sem commit/PR:

```bash
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/run-all-checks.sh "$BRANCH"
```

### Cenário 5: Comentar em PR Existente

Para adicionar checklist a um PR já existente:

```bash
PR_NUMBER=42
./scripts/agent/auto-comment-and-assign.sh "$PR_NUMBER" "" "implementation,priority/high"
```

### Cenário 6: Auto-Merge Manual

Para tentar merge automático em um PR específico:

```bash
PR_NUMBER=42
./scripts/agent/auto-merge-if-ready.sh "$PR_NUMBER" squash
```

## 📊 Acompanhamento

### Verificar Status dos Workflows

```bash
# Listar runs recentes
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# Ver detalhes de um run específico
gh run view <RUN_ID> --log

# Ver apenas runs com falha
gh run list --status failure --limit 5
```

### Verificar Status do PR

```bash
# Ver informações do PR
gh pr view 42

# Ver comentários
gh pr view 42 --comments

# Ver status dos checks
gh pr checks 42

# Ver reviews
gh pr review 42 --list
```

### Monitorar Artefatos

```bash
# Listar artifacts de um run
gh run view <RUN_ID> --artifacts

# Download de artifact
gh run download <RUN_ID> --name pr-42-test-log
```

## 🔧 Patches (Opcional)

Os scripts procuram e aplicam automaticamente os seguintes patches se existirem:

- `patch-clinicId-filters.patch` - Filtros de clinicId
- `patch-agent-workflows.patch` - Workflows de agentes (parte 1)
- `patch-agent-workflows-2.patch` - Workflows de agentes (parte 2)

Se você não tem esses arquivos, os scripts simplesmente os ignoram.

## 🔑 Configuração de Secrets

### Opção 1: Via Script (Automático)

```bash
export DB_URL="..."
export WHATSAPP_PROVIDER_TOKEN="..."
# ... outras variáveis

./scripts/agent/fast-deploy-agents.sh "$BRANCH" false true
```

### Opção 2: Via CLI (Manual)

```bash
gh secret set DB_URL --body "postgresql://user:pass@host:5432/dbname"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "seu_token"
gh secret set WHATSAPP_PROVIDER_API_URL --body "https://api.gateway"
gh secret set JWT_SECRET --body "seu_jwt_secret"
gh secret set DOCKER_REGISTRY_USER --body "user"
gh secret set DOCKER_REGISTRY_PASS --body "pass"
```

### Opção 3: Via GitHub UI

1. Vá para Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret individualmente

## 📋 Workflows Disponíveis

### Agent Orchestrator
**Trigger:** PR (opened, reopened, synchronize), workflow_dispatch  
**Função:** Orquestra todos os scripts de agente em sequência

### TypeScript Guardian
**Trigger:** Push, PR, workflow_dispatch  
**Função:** Compila TypeScript, executa testes, quality gates (console.log, secrets)

### Register Fila Fallback
**Trigger:** Push, PR, workflow_dispatch  
**Função:** Aplica e verifica fallback no FilaService

### WhatsApp Monitor
**Trigger:** Push, PR, workflow_dispatch  
**Função:** Verifica arquivos WhatsApp e filtros clinicId

### Docker Builder
**Trigger:** Push para main/develop/feat/*, PR  
**Função:** Constrói e publica imagem Docker

### Agent Reviewer
**Trigger:** PR events  
**Função:** Adiciona checklist e solicita reviewers

### Agent Auto-Docs
**Trigger:** Push para main (docs/, src/, .github/)  
**Função:** Gera documentação automaticamente

### Agent Tests Blocker
**Trigger:** PR (opened, synchronize, reopened)  
**Função:** Executa testes e bloqueia merge em caso de falha

## ⚠️ Troubleshooting

### gh CLI não está instalado
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y gh

# macOS
brew install gh

# Outras plataformas: https://cli.github.com/
```

### gh não está autenticado
```bash
gh auth login
# Siga as instruções interativas
```

### Permission denied ao executar scripts
```bash
chmod +x scripts/agent/*.sh
```

### Workflow não encontrado
```bash
# Listar workflows disponíveis
gh workflow list

# Verificar se o nome está correto (case-sensitive)
```

### PR não foi criado automaticamente
Verifique se:
1. Você tem permissões para criar PRs
2. A branch existe no remoto (`git push origin <branch>`)
3. Não há conflitos com a branch base

### Auto-merge falhou
Possíveis causas:
- Nenhuma aprovação humana
- Checks não passaram 100%
- Conflitos de merge
- Faltam permissões admin

## 🔒 Segurança

### Boas Práticas

✅ **FAÇA:**
- Use GitHub Secrets para informações sensíveis
- Revise o código antes de habilitar auto-merge
- Sempre exija aprovação humana em PRs críticos
- Monitore issues de incidentes criadas automaticamente

❌ **NÃO FAÇA:**
- Commitar secrets no código
- Habilitar auto-merge sem revisão
- Ignorar alertas de quality gates
- Compartilhar tokens em logs ou outputs

### Quality Gates Implementados

1. **Console.log Detection:** Detecta `console.log` no código
2. **Secret Detection:** Procura por secrets hardcoded
3. **Test Blocker:** Bloqueia merge se testes falharem
4. **Build Validation:** Verifica compilação TypeScript

## 📚 Documentação Adicional

- **Scripts detalhados:** `scripts/agent/README.md`
- **Workflows individuais:** `.github/workflows/`
- **Problemas conhecidos:** GitHub Issues

## 💡 Dicas

1. **Use o comando único:** `fast-deploy-agents.sh` é o mais completo
2. **Monitore os logs:** Use `gh run list` e `gh run view` frequentemente
3. **Revise antes de auto-merge:** Sempre tenha aprovação humana
4. **Aproveite os artifacts:** Logs de teste são anexados automaticamente
5. **Crie labels personalizadas:** Modifique scripts para suas necessidades

## 🆘 Suporte

Para problemas, sugestões ou dúvidas:
1. Abra uma issue no repositório
2. Inclua logs relevantes (`gh run view <RUN_ID> --log`)
3. Descreva o comportamento esperado vs. observado

---

**Versão:** 1.0.0  
**Última atualização:** 2025-11-23
