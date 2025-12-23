# 🤖 Comandos de Orquestração de Agentes

Este documento consolida todos os comandos necessários para executar o sistema de orquestração de agentes.

---

## 📋 Pré-requisitos

Antes de executar qualquer comando, certifique-se de que:

1. **GitHub CLI está instalado e autenticado:**
   ```bash
   gh --version
   gh auth login
   ```

2. **Token do GitHub está exportado:**
   ```bash
   export GITHUB_TOKEN="$(gh auth token)"
   ```

   Para tornar permanente, adicione ao seu `.bashrc` ou `.zshrc`:
   ```bash
   echo 'export GITHUB_TOKEN="$(gh auth token)"' >> ~/.bashrc
   source ~/.bashrc
   ```

---

## 🚀 Comandos Principais

### 1) Comando (rápido) — Disparar orquestrador (SÓ executa os agents)

```bash
export GITHUB_TOKEN="$(gh auth token)"
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref feat/whatsapp-clinicid-filters
```

**Use esta se só quer disparar os agentes e acompanhar pelos Actions.**

---

### 2) Comando (com PR) — Disparar orquestrador, comentar no PR e sem auto-merge

**(Substitua `<PR_NUMBER>` pelo número do PR)**

```bash
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters <PR_NUMBER> false
```

**Este comando:**
- dispara todos os workflows (TypeScript Guardian, Register Fila Fallback, Docker Builder, WhatsApp Monitor, Agent Orchestrator),
- aguarda a conclusão de cada um,
- posta um comentário resumo no PR `<PR_NUMBER>`,
- **NÃO** tenta merge (seguro).

**Exemplo:**
```bash
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 42 false
```

---

### 3) Comando (com PR) + tentativa de AUTO-MERGE (uso com cautela)

**(Apenas use se tiver pelo menos 1 aprovação humana e confiança nos checks.)**

```bash
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters <PR_NUMBER> true
```

**Esse tenta merge automático no final (squash) se os checks passarem e houver aprovação.**

⚠️ **ATENÇÃO:** Este comando fará merge automático se todas as condições forem atendidas. Use com responsabilidade!

---

## 🔍 Como monitorar rapidamente após rodar (copiar/colar)

### Listar runs recentes da branch:

```bash
gh run list --branch feat/whatsapp-clinicid-filters --limit 10
```

### Ver logs de um run (substitua `<RUN_ID>`):

```bash
gh run view <RUN_ID> --log --exit-status
```

### Ver comentários do PR:

```bash
gh pr view <PR_NUMBER> --comments
```

### Descobrir o número do PR:

Se você não souber o número do PR, rode primeiro:

```bash
gh pr list --state open --head feat/whatsapp-clinicid-filters
```

---

## 📊 Fluxo Completo Recomendado

Aqui está um exemplo de fluxo de trabalho típico:

```bash
# 1. Descobrir o número do PR
gh pr list --state open --head feat/whatsapp-clinicid-filters

# Output exemplo: #42  feat: Add WhatsApp clinicId filters  feat/whatsapp-clinicid-filters

# 2. Exportar token (se ainda não fez)
export GITHUB_TOKEN="$(gh auth token)"

# 3. Executar os agentes com integração ao PR (modo seguro)
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 42 false

# 4. Acompanhar o progresso
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# 5. Ver logs detalhados se necessário
gh run view <RUN_ID> --log

# 6. Verificar o comentário no PR
gh pr view 42 --comments

# 7. Se tudo passar e houver aprovação, fazer merge manual
gh pr merge 42 --squash
```

---

## 🤖 Agentes Disponíveis

O sistema executa os seguintes agentes automaticamente:

1. **TypeScript Guardian** - Verifica compilação TypeScript e linting
2. **Register Fila Fallback** - Valida sistema de fila com verificações de fallback
3. **Docker Builder** - Constrói e valida imagens Docker
4. **WhatsApp Monitor** - Verifica integração WhatsApp e filtros clinicId
5. **Agent Orchestrator** - Workflow mestre que executa todos os checks em sequência

---

## 🚨 Observações Finais (Importante — Leia)

1. **Execute esses comandos no ambiente com `gh` autenticado** (se local, rode `gh auth login` antes).

2. **Preferência de segurança:** use a opção `false` (sem auto-merge) para revisar manualmente antes do merge.

3. **Se não souber o número do PR**, rode primeiro:
   ```bash
   gh pr list --state open --head feat/whatsapp-clinicid-filters
   ```

4. **Nomes de workflow devem ser exatos:** O nome do workflow deve corresponder exatamente: `"Agent Orchestrator - run agent scripts in sequence (robust)"`

5. **Nomes de branch são case-sensitive:** Certifique-se de usar o nome exato da branch.

6. **Se comandos falharem com erros de autenticação**, atualize seu token:
   ```bash
   gh auth refresh
   export GITHUB_TOKEN="$(gh auth token)"
   ```

---

## 🛠️ Troubleshooting Rápido

### Erro: "gh: command not found"

**Solução:** Instale o GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update && sudo apt install gh
```

**Windows:**
```powershell
winget install GitHub.cli
```

### Erro: "gh CLI is not authenticated"

**Solução:**
```bash
gh auth login
```

### Erro: "Could not get run ID for workflow"

**Possíveis causas:**
- Nome da branch incorreto
- Workflow não existe
- Problemas de permissão

**Solução:**
- Verificar nome da branch: `git branch -a`
- Verificar workflows: `ls .github/workflows/agent-*.yml`
- Tentar via UI do GitHub: Actions → Selecionar workflow → Run workflow

### Erro: "PR is not in a mergeable state"

**Causas possíveis:**
- Conflitos de merge com a branch base
- Checks obrigatórios não passaram
- Aprovações insuficientes
- Regras de proteção de branch não atendidas

**Solução:**
- Resolver conflitos: `git pull origin main` e corrigir
- Aguardar checks passarem
- Solicitar reviews/aprovações
- Verificar configurações de proteção de branch

---

## 📁 Estrutura de Arquivos

```
.github/
  workflows/
    agent-orchestrator.yml              # Workflow orquestrador principal
    agent-typescript-guardian.yml       # Checks TypeScript
    agent-register-fila-fallback.yml    # Checks fila/queue
    agent-whatsapp-monitor.yml          # Checks WhatsApp
    docker-builder.yml                  # Checks Docker (existente)

scripts/
  agent/
    run-agents-all.sh                   # Script mestre de orquestração
    README.md                           # Documentação detalhada em inglês
    
COMANDOS_AGENTES.md                     # Este arquivo (comandos em português)
```

---

## ✅ Critérios de Sucesso

Você sabe que tudo funcionou quando:

- ✅ Todos os 5 workflows completam com sucesso
- ✅ Comentário no PR mostra checkmarks verdes para todos os agentes
- ✅ Nenhum símbolo vermelho ❌ na saída
- ✅ Script sai com código 0

---

## 📞 Documentação Adicional

Para documentação mais detalhada em inglês, consulte:
- `scripts/agent/README.md` - Guia completo com mais detalhes técnicos

---

## 🎯 Exemplo de Saída Esperada

Quando você executar o comando 2 ou 3, verá algo como:

```
ℹ️  Starting Agent Orchestration
ℹ️  Branch: feat/whatsapp-clinicid-filters
ℹ️  PR: 42
ℹ️  Auto-merge: false

ℹ️  Triggering all workflows...

ℹ️  Triggering workflow: TypeScript Guardian
✅ Started TypeScript Guardian (Run ID: 12345)
ℹ️  Triggering workflow: Register Fila Fallback
✅ Started Register Fila Fallback (Run ID: 12346)
...

ℹ️  All workflows triggered. Waiting for completion...

ℹ️  Waiting for TypeScript Guardian (Run ID: 12345)...
✅ TypeScript Guardian completed successfully

...

==========================================
🤖 Agent Orchestration Summary
==========================================
Branch: feat/whatsapp-clinicid-filters
Date: 2025-11-23 15:45:00

Results:
  ✅ Success TypeScript Guardian
  ✅ Success Register Fila Fallback
  ✅ Success Docker Builder
  ✅ Success WhatsApp Monitor
  ✅ Success Agent Orchestrator

Summary: 5 succeeded, 0 failed
==========================================

ℹ️  Posting summary comment to PR #42
✅ Comment posted to PR #42

✅ All workflows completed successfully! 🎉
```

---

**Data de Atualização:** 2025-11-23  
**Versão:** 1.0.0
