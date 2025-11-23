# Quick Reference - Agents System

## 🚀 Comando Mais Usado

```bash
# Deploy completo com uma linha
./scripts/agent/fast-deploy-agents.sh "feat/sua-branch"
```

## 📋 Comandos Essenciais

### Setup Inicial (uma vez)
```bash
# 1. Autenticar
gh auth login

# 2. Tornar scripts executáveis
chmod +x scripts/agent/*.sh
```

### Operações Comuns

#### Deploy Completo
```bash
./scripts/agent/fast-deploy-agents.sh "feat/sua-branch"
```

#### Apenas Disparar Workflows
```bash
./scripts/agent/run-all-checks.sh "feat/sua-branch"
```

#### Comentar em PR
```bash
./scripts/agent/auto-comment-and-assign.sh <PR_NUMBER>
```

#### Auto-Merge (com aprovação)
```bash
./scripts/agent/auto-merge-if-ready.sh <PR_NUMBER> squash
```

### Monitoramento

#### Ver runs recentes
```bash
gh run list --branch feat/sua-branch --limit 10
```

#### Ver log de um run
```bash
gh run view <RUN_ID> --log
```

#### Ver PR completo
```bash
gh pr view <PR_NUMBER>
```

#### Ver checks do PR
```bash
gh pr checks <PR_NUMBER>
```

#### Ver comentários
```bash
gh pr view <PR_NUMBER> --comments
```

### Secrets

#### Configurar secret individual
```bash
gh secret set SECRET_NAME --body "valor"
```

#### Listar secrets
```bash
gh secret list
```

## 🎯 Workflows Disponíveis

```bash
# Listar todos os workflows
gh workflow list

# Disparar workflow manualmente
gh workflow run "Nome do Workflow"

# Ver runs de um workflow específico
gh run list --workflow "Nome do Workflow"
```

## 🔧 Troubleshooting Rápido

### gh não encontrado
```bash
sudo apt install gh
```

### Não autenticado
```bash
gh auth login
```

### Scripts sem permissão
```bash
chmod +x scripts/agent/*.sh
```

### Ver erros em tempo real
```bash
gh run watch <RUN_ID>
```

## 📚 Documentação Completa

- **Scripts:** `scripts/agent/README.md`
- **Guia de Uso:** `GUIA_USO_AGENTS.md`
- **Implementação:** `IMPLEMENTACAO_AGENTS.md`

## ⚡ Atalhos Úteis

```bash
# Criar alias no .bashrc/.zshrc
alias agent-deploy='./scripts/agent/fast-deploy-agents.sh'
alias agent-check='./scripts/agent/run-all-checks.sh'
alias pr-view='gh pr view'
alias run-list='gh run list --limit 10'

# Usar:
agent-deploy "feat/minha-feature"
agent-check "main"
pr-view 42
run-list
```

## 🎨 Exemplos Práticos

### Deploy de Feature
```bash
# 1. Checkout na branch
git checkout -b feat/nova-feature

# 2. Fazer mudanças...
# ...

# 3. Deploy completo
./scripts/agent/fast-deploy-agents.sh "feat/nova-feature"
```

### Debug de Workflow Falhado
```bash
# 1. Listar runs com falha
gh run list --status failure --limit 5

# 2. Ver log do run
gh run view <RUN_ID> --log

# 3. Baixar artifact se houver
gh run download <RUN_ID>
```

### Merge Rápido (após aprovação)
```bash
# 1. Verificar checks
gh pr checks 42

# 2. Auto-merge
./scripts/agent/auto-merge-if-ready.sh 42 squash
```

## 🔐 Segurança

### Nunca commite:
- ❌ Passwords
- ❌ API tokens
- ❌ Database URLs com credenciais
- ❌ Private keys

### Use sempre:
- ✅ GitHub Secrets
- ✅ Environment variables
- ✅ .env files (no .gitignore)
- ✅ Vault/Secret managers

## 💡 Dicas Pro

1. **Use tab completion:**
   ```bash
   gh <TAB><TAB>
   ```

2. **Formato JSON para parsing:**
   ```bash
   gh pr view 42 --json url,title,state
   ```

3. **Watch em tempo real:**
   ```bash
   gh run watch <RUN_ID>
   ```

4. **Filter runs:**
   ```bash
   gh run list --status completed --limit 5
   gh run list --workflow "TypeScript Guardian"
   ```

5. **Rerun failed jobs:**
   ```bash
   gh run rerun <RUN_ID> --failed
   ```

## 📞 Suporte

- Issues: Abra issue no repositório
- Docs: Ver arquivos na raiz do projeto
- Logs: Sempre anexe logs ao reportar problemas

---

**Versão:** 1.0.0  
**Atualizado:** 2025-11-23
