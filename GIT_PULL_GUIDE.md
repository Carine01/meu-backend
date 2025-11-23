# 🔄 Git Pull - Guia de Uso

**Última atualização:** 2025-11-23  
**Propósito:** Documentação sobre como usar git pull neste repositório

---

## 📖 O que é Git Pull?

`git pull` é um comando que:
1. **Busca** (fetch) as últimas alterações do repositório remoto
2. **Mescla** (merge) essas alterações com sua branch local atual

É equivalente a executar:
```bash
git fetch origin
git merge origin/<sua-branch>
```

---

## ✅ Quando Usar Git Pull

Use `git pull` quando:
- ✅ Você quer atualizar sua branch local com as últimas alterações do remoto
- ✅ Outros desenvolvedores fizeram commits que você quer incorporar
- ✅ Você quer sincronizar antes de começar a trabalhar
- ✅ Você quer resolver divergências entre local e remoto

---

## 🚀 Como Usar Git Pull

### Método 1: Linha de Comando (Recomendado)

```bash
# Atualizar a branch atual
git pull

# Ou especificar o remoto e a branch
git pull origin main
git pull origin feat/sua-branch
```

### Método 2: VS Code Interface

1. Abra o **Source Control** (Ctrl+Shift+G)
2. Clique nos **três pontos** (...) no topo
3. Selecione **"Pull"** ou **"Pull from..."**
4. Se solicitado, escolha o remoto (geralmente `origin`)

### Método 3: PowerShell (Windows)

```powershell
# Ir para a pasta do projeto
cd C:\caminho\para\seu-projeto

# Executar pull
git pull
```

---

## ⚙️ Configuração Atual

Este repositório está configurado com:

```
pull.rebase = false
```

Isso significa que `git pull` irá:
- ✅ Usar estratégia **"fast-forward or merge"** (padrão)
- ✅ Fazer merge automático quando possível
- ✅ Criar commit de merge quando houver divergências
- ❌ NÃO fazer rebase automático

Esta é a configuração recomendada no arquivo `PASSO_A_PASSO_GIT.md`.

---

## 🔍 Verificar Status Antes de Pull

**Sempre verifique o status antes de fazer pull:**

```bash
# Ver status da branch
git status

# Ver diferenças com o remoto
git fetch
git log HEAD..origin/main --oneline

# Ou use nosso script de verificação
./scripts/verify-git-status.sh       # Linux/Mac
.\scripts\verify-git-status.ps1      # Windows
```

---

## ⚠️ Problemas Comuns

### Problema 1: "Your local changes would be overwritten"

**Erro:**
```
error: Your local changes to the following files would be overwritten by merge:
    src/arquivo.ts
```

**Solução:**
```bash
# Opção A: Salvar alterações temporariamente
git stash
git pull
git stash pop

# Opção B: Commit suas alterações primeiro
git add .
git commit -m "feat: minhas alterações"
git pull
```

---

### Problema 2: "Authentication failed"

**Erro:**
```
fatal: Authentication failed for 'https://github.com/...'
```

**Solução:**
```bash
# Use Personal Access Token (PAT) em vez de senha
# Crie um PAT em: https://github.com/settings/tokens

# Configure credenciais
git config --global credential.helper store

# Na próxima vez que pedir senha, use o PAT
```

Ver mais detalhes em: `PASSO_A_PASSO_GIT.md` (seção "CRIAR PERSONAL ACCESS TOKEN")

---

### Problema 3: "Merge conflict"

**Erro:**
```
Auto-merging src/arquivo.ts
CONFLICT (content): Merge conflict in src/arquivo.ts
```

**Solução:**
```bash
# 1. Ver arquivos em conflito
git status

# 2. Editar cada arquivo e resolver conflitos manualmente
# Procure por marcadores: <<<<<<<, =======, >>>>>>>

# 3. Adicionar arquivos resolvidos
git add src/arquivo.ts

# 4. Completar o merge
git commit -m "merge: resolve conflicts"
```

---

### Problema 4: "You have divergent branches"

**Erro:**
```
Your branch and 'origin/main' have diverged,
and have 3 and 2 different commits each, respectively.
```

**Solução:**
```bash
# Opção A: Merge (mantém histórico completo)
git pull --no-rebase

# Opção B: Rebase (histórico linear)
git pull --rebase

# Opção C: Forçar atualização (CUIDADO: perde alterações locais)
git fetch origin
git reset --hard origin/main
```

---

## 🛡️ Boas Práticas

### ✅ Faça Pull Regularmente

```bash
# No início do dia
git pull

# Antes de começar nova feature
git checkout -b feat/nova-feature
git pull origin main

# Antes de fazer push
git pull
git push
```

### ✅ Verifique Status Primeiro

```bash
# Sempre verifique antes de pull
git status
git fetch
git log HEAD..origin/main --oneline
```

### ✅ Commit Antes de Pull

```bash
# Commit suas alterações antes de pull
git add .
git commit -m "feat: work in progress"
git pull
```

### ✅ Use Branch Específica

```bash
# Específico é melhor que genérico
git pull origin main
# Em vez de apenas:
git pull
```

---

## 🔄 Git Pull vs Git Fetch

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `git fetch` | Apenas baixa alterações, não mescla | Quando quer revisar antes de mesclar |
| `git pull` | Baixa E mescla automaticamente | Quando quer atualizar imediatamente |

**Exemplo de workflow seguro:**
```bash
# 1. Buscar alterações sem mesclar
git fetch origin

# 2. Ver o que mudou
git log HEAD..origin/main --oneline
git diff HEAD..origin/main

# 3. Se estiver OK, mesclar
git merge origin/main

# Ou simplesmente:
git pull  # Faz tudo de uma vez
```

---

## 🧪 Testar Configuração

Execute nossos scripts de verificação:

### Linux/Mac:
```bash
./scripts/verify-git-status.sh
```

### Windows:
```powershell
.\scripts\verify-git-status.ps1
```

**O script irá mostrar:**
- ✅ Branch atual
- ✅ Status do repositório
- ✅ Configuração de pull
- ✅ Comparação com remoto
- ✅ Últimos commits

---

## 📞 Recursos Adicionais

- **Documentação Git oficial:** https://git-scm.com/docs/git-pull
- **GitHub Docs:** https://docs.github.com/en/get-started/using-git
- **Guia local:** `PASSO_A_PASSO_GIT.md`
- **Comandos GitHub:** `COMANDOS_GITHUB.md`

---

## 🎯 Resumo Rápido

```bash
# Comando mais comum
git pull

# Verificar antes
git status
./scripts/verify-git-status.sh

# Se houver conflitos
git status
# [resolver conflitos manualmente]
git add .
git commit -m "merge: resolve conflicts"

# Se houver problemas
git stash        # Salvar alterações
git pull         # Atualizar
git stash pop    # Restaurar alterações
```

---

**✅ Para verificar o status atual do repositório, execute:**
```bash
# Linux/Mac
./scripts/verify-git-status.sh

# Windows
.\scripts\verify-git-status.ps1
```
