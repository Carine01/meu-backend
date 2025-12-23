# Agent Orchestration Scripts

Este diretório contém scripts para orquestração de workflows do GitHub Actions.

## Scripts Disponíveis

### run-agents-all.sh

Script principal para disparar e monitorar múltiplos workflows do GitHub Actions em sequência.

**Uso:**
```bash
./scripts/agent/run-agents-all.sh <branch> [pr_number] [auto_merge]
```

**Parâmetros:**
- `branch`: Nome da branch onde os workflows serão executados (padrão: feat/whatsapp-clinicid-filters)
- `pr_number`: Número do PR para comentar o resumo (opcional)
- `auto_merge`: `true` ou `false` para habilitar merge automático (padrão: false)

**Exemplos:**
```bash
# Executar workflows na branch especificada
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters

# Executar workflows e comentar no PR #123
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123

# Executar workflows com auto-merge habilitado
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 true

# Com GITHUB_TOKEN explícito (se não estiver no ambiente)
GITHUB_TOKEN="$(gh auth token)" ./scripts/agent/run-agents-all.sh feat/my-feature
```

**Workflows Orquestrados:**
1. TypeScript Guardian
2. Register Fila Fallback (AST)
3. Docker Builder
4. WhatsApp Monitor
5. Agent Orchestrator - run agent scripts in sequence (robust)

**Funcionalidades:**
- ✅ Dispara workflows em sequência
- ✅ Aguarda conclusão de cada workflow
- ✅ Reporta status de cada execução
- ✅ Comenta resumo no PR (opcional)
- ✅ Suporte a auto-merge (opcional)

### auto-merge-if-ready.sh

Script auxiliar para realizar merge automático de PRs quando todos os requisitos são atendidos.

**Uso:**
```bash
./scripts/agent/auto-merge-if-ready.sh <pr_number> [merge_method]
```

**Parâmetros:**
- `pr_number`: Número do PR para fazer merge
- `merge_method`: Método de merge (`squash`, `merge`, ou `rebase` - padrão: squash)

**Exemplos:**
```bash
# Merge com squash (padrão)
./scripts/agent/auto-merge-if-ready.sh 123

# Merge com método específico
./scripts/agent/auto-merge-if-ready.sh 123 merge
```

**Verificações realizadas:**
- ✅ PR está aberto
- ✅ PR tem aprovação necessária
- ✅ Todos os checks estão passando

## Comandos Manuais Rápidos

Se preferir disparar workflows individualmente:

```bash
# Disparar orquestrador
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref feat/whatsapp-clinicid-filters

# Disparar TypeScript Guardian
gh workflow run "TypeScript Guardian" --ref feat/whatsapp-clinicid-filters

# Disparar Register Fila Fallback (AST)
gh workflow run "Register Fila Fallback (AST)" --ref feat/whatsapp-clinicid-filters

# Disparar Docker Builder
gh workflow run "Docker Builder" --ref feat/whatsapp-clinicid-filters

# Disparar WhatsApp Monitor
gh workflow run "WhatsApp Monitor" --ref feat/whatsapp-clinicid-filters
```

## Monitoramento de Runs

```bash
# Ver detalhes de um run específico
gh run view <run_id>

# Ver logs de um run
gh run view <run_id> --log

# Ver status resumido
gh run view <run_id> --json status,conclusion --jq '.status + " / " + (.conclusion // "")'

# Listar runs recentes de um workflow
gh run list --workflow "Docker Builder" --branch feat/whatsapp-clinicid-filters --limit 5
```

## Requisitos

### GitHub CLI (gh)

Os scripts requerem o GitHub CLI instalado e autenticado:

```bash
# Instalar gh (Ubuntu/Debian)
sudo apt install gh

# Autenticar
gh auth login
```

### GITHUB_TOKEN

O token é automaticamente disponível em GitHub Actions runners. Para uso local:

```bash
# Usar token do gh
export GITHUB_TOKEN="$(gh auth token)"

# Ou definir manualmente
export GITHUB_TOKEN="ghp_seu_token_aqui"
```

## Segurança e Permissões

### GitHub Actions

O `GITHUB_TOKEN` automático do runner tem permissões limitadas. Para algumas operações, você pode precisar configurar permissões no workflow:

```yaml
permissions:
  contents: write
  pull-requests: write
  actions: read
```

### Branch Protection

Se você tiver regras de proteção de branch, certifique-se de que:
- O `GITHUB_TOKEN` ou PAT usado tem permissões adequadas
- As regras permitem bypass para tokens de serviço (se necessário)

### Auto-merge

⚠️ **AVISO**: Não habilite `AUTO_MERGE=true` sem revisar:
- Todos os checks estão configurados corretamente
- As aprovações necessárias estão em vigor
- Você confia nos workflows automatizados

## Troubleshooting

### Workflow não encontrado

Se receber erro "Falha ao disparar workflow":
- Verifique o nome exato do workflow no arquivo `.github/workflows/*.yml`
- Certifique-se de que o workflow existe e está ativo
- Verifique permissões do token

### Run ID não encontrado

Se "Não encontrei run_id":
- O workflow pode ter falhado ao iniciar
- Pode haver delay na API do GitHub (aumente o `sleep`)
- Verifique se a branch existe

### Checks falhando

Se o auto-merge abortar por checks falhando:
- Verifique logs dos workflows no GitHub Actions
- Use `gh run view <run_id> --log` para ver detalhes
- Corrija os problemas e execute novamente

## Exemplos de Uso

### Uso básico em CI/CD

```yaml
# .github/workflows/orchestrate.yml
name: Orchestrate All Agents

on:
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to run on'
        required: true
      pr_number:
        description: 'PR number (optional)'
        required: false

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run orchestration
        run: |
          ./scripts/agent/run-agents-all.sh \
            ${{ github.event.inputs.branch }} \
            ${{ github.event.inputs.pr_number }} \
            false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Uso local para teste

```bash
# Testar na branch atual
BRANCH=$(git branch --show-current)
./scripts/agent/run-agents-all.sh "$BRANCH"

# Com dry-run (você precisaria modificar o script)
# DRY_RUN=true ./scripts/agent/run-agents-all.sh feat/my-feature
```

## Contribuindo

Ao modificar os scripts:

1. **Sempre teste a sintaxe**: `bash -n script.sh`
2. **Mantenha compatibilidade**: Use bash 4.0+ features
3. **Documente mudanças**: Atualize este README
4. **Use `set -euo pipefail`**: Para comportamento seguro
5. **Adicione logs**: Use `echo` para feedback do usuário

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no repositório
- Consulte a documentação do GitHub CLI: https://cli.github.com/manual/
- Verifique logs dos workflows no GitHub Actions
