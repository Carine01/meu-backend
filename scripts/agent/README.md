# Agent Automation Scripts

Este diretório contém scripts de automação para gerenciar workflows do GitHub Actions e PRs.

## Requisitos

- `gh` CLI (https://cli.github.com/)
- `jq` (JSON processor)
- `GITHUB_TOKEN` no ambiente (fornecido automaticamente no GitHub Actions)

Para uso local:
```bash
export GITHUB_TOKEN="$(gh auth token)"
```

## Scripts Disponíveis

### 1. run-all-checks.sh

Dispara workflows principais e aguarda suas conclusões.

**Workflows disparados:**
- TypeScript Guardian
- Register Fila Fallback (AST)
- Docker Builder
- WhatsApp Monitor

**Uso:**
```bash
# Usar branch atual (HEAD)
./run-all-checks.sh

# Usar branch específica
./run-all-checks.sh main
./run-all-checks.sh feature/my-branch
```

**Comportamento:**
- Dispara cada workflow sequencialmente
- Aguarda conclusão de cada workflow (polling a cada 8 segundos)
- Exibe status e conclusão final
- Continua mesmo se algum workflow falhar

### 2. auto-comment-and-assign.sh

Adiciona comentário automático, labels e reviewers em PRs.

**Uso:**
```bash
# Detectar PR da branch atual automaticamente
./auto-comment-and-assign.sh

# Especificar PR number
./auto-comment-and-assign.sh 123

# Com reviewers
./auto-comment-and-assign.sh 123 "user1,user2"

# Com reviewers e labels customizados
./auto-comment-and-assign.sh 123 "user1,user2" "bug,priority/high"
```

**Labels padrão:** `implementation,priority/high`

**Comentário adicionado:**
- Checklist automático com itens importantes
- Foco em: clinicId filters, FilaService (fallback), segredos no código

### 3. auto-merge-if-ready.sh

Verifica aprovações e checks antes de fazer merge automático.

**Verificações obrigatórias:**
1. Pelo menos 1 aprovação humana
2. Todos os checks devem estar OK (sem FAILURE, CANCELLED, TIMED_OUT, etc.)

**Uso:**
```bash
# Merge com squash (padrão)
./auto-merge-if-ready.sh 123

# Merge com método específico
./auto-merge-if-ready.sh 123 merge
./auto-merge-if-ready.sh 123 rebase
```

**Comportamento seguro:**
- Aborta se não houver aprovação
- Aborta se houver checks com problemas
- Deleta branch após merge bem-sucedido
- Usa flag `--admin` para bypass de proteções (requer permissões)

## Uso em CI/CD

Exemplo de workflow que usa os scripts:

```yaml
name: PR Automation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  automate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Add PR comment and assign reviewers
        run: |
          chmod +x scripts/agent/*.sh
          ./scripts/agent/auto-comment-and-assign.sh "" "reviewer1,reviewer2"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Notas Importantes

1. **run-all-checks.sh**: 
   - Os nomes dos workflows devem corresponder exatamente aos nomes no repositório
   - Ajuste o array `WORKFLOWS` se necessário
   - O workflow deve suportar `workflow_dispatch` trigger

2. **auto-comment-and-assign.sh**:
   - Requer permissões para adicionar comentários, labels e reviewers
   - Labels devem existir no repositório

3. **auto-merge-if-ready.sh**:
   - **USE COM CUIDADO** em produção
   - Teste em PRs de staging primeiro
   - Requer permissões elevadas para merge automático
   - A flag `--admin` pode bypass branch protections

## Testes Locais

Antes de usar em produção, teste localmente:

```bash
# Tornar scripts executáveis
chmod +x scripts/agent/*.sh

# Testar sintaxe
bash -n scripts/agent/run-all-checks.sh
bash -n scripts/agent/auto-comment-and-assign.sh
bash -n scripts/agent/auto-merge-if-ready.sh

# Testar em PR de desenvolvimento
./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER_DE_TESTE>
```

## Segurança

- Nunca exponha `GITHUB_TOKEN` em logs
- Use branch protections para PRs importantes
- Configure regras de aprovação obrigatória
- Revise sempre os resultados dos merges automáticos
