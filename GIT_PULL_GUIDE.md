# 📥 Git Pull - Guia Completo

Este guia explica como manter seu repositório local sincronizado com o repositório remoto no GitHub.

---

## 🎯 O que é Git Pull?

`git pull` é um comando que combina dois comandos:
1. `git fetch` - Baixa as alterações do repositório remoto
2. `git merge` - Mescla essas alterações na sua branch local

---

## 🚀 Comandos Básicos

### Pull Simples
```bash
# Atualiza a branch atual com as alterações do remoto
git pull
```

### Pull com Rebase
```bash
# Reaplica seus commits locais sobre as alterações remotas
git pull --rebase
```

### Pull de uma Branch Específica
```bash
# Pull de uma branch específica do remoto
git pull origin main
git pull origin develop
```

---

## 📋 Fluxo de Trabalho Recomendado

### 1. Antes de Começar a Trabalhar
```bash
# 1. Verificar status atual
git status

# 2. Verificar branch atual
git branch

# 3. Atualizar branch local
git pull origin main
```

### 2. Durante o Desenvolvimento
```bash
# Periodicamente, sincronize com o remoto
git fetch origin
git status  # Verificar se há alterações remotas

# Se houver alterações remotas
git pull --rebase origin main
```

### 3. Antes de Fazer Push
```bash
# Sempre pull antes de push para evitar conflitos
git pull --rebase origin main

# Resolver conflitos se houver (veja seção abaixo)

# Depois, fazer push
git push origin main
```

---

## ⚠️ Resolver Conflitos de Merge

### Quando há conflitos após git pull:

```bash
# 1. Identificar arquivos com conflito
git status

# 2. Abrir arquivos e resolver marcadores de conflito
# Procure por <<<<<<< HEAD, =======, e >>>>>>>

# 3. Após resolver, adicionar arquivos
git add <arquivo-resolvido>

# 4. Continuar o merge/rebase
git merge --continue
# ou
git rebase --continue

# Se quiser cancelar
git merge --abort
# ou
git rebase --abort
```

---

## 🔧 Troubleshooting

### Erro: "Your local changes would be overwritten"

```bash
# Opção 1: Salvar suas alterações temporariamente
git stash
git pull
git stash pop

# Opção 2: Commitar suas alterações primeiro
git add .
git commit -m "WIP: alterações em progresso"
git pull
```

### Erro: "divergent branches"

```bash
# Opção 1: Merge (cria commit de merge)
git pull --no-rebase origin main

# Opção 2: Rebase (histórico linear)
git pull --rebase origin main
```

### Erro: "Authentication failed"

```bash
# Verificar se está autenticado
gh auth status

# Autenticar novamente
gh auth login

# Ou configurar token de acesso pessoal
git config --global credential.helper cache
```

---

## 📊 Verificações Pós-Pull

Após fazer pull, sempre execute:

```bash
# 1. Verificar se há alterações nos arquivos
git status

# 2. Verificar diferenças locais (se houver)
git diff

# 3. Instalar novas dependências (se houver)
npm install

# 4. Executar build
npm run build

# 5. Executar testes
npm test
```

---

## 🎯 Boas Práticas

### ✅ FAÇA:
- ✅ Pull antes de começar a trabalhar
- ✅ Pull frequentemente durante o dia
- ✅ Pull antes de fazer push
- ✅ Use `--rebase` para manter histórico limpo
- ✅ Resolva conflitos imediatamente

### ❌ NÃO FAÇA:
- ❌ Não force push sem necessidade (`git push --force`)
- ❌ Não ignore conflitos de merge
- ❌ Não faça pull sem commitar/stash alterações locais
- ❌ Não trabalhe por dias sem sincronizar

---

## 🔄 Scripts Automatizados

### Script para Pull Seguro (PowerShell)

```powershell
# save-and-pull.ps1
Write-Host "🔄 Iniciando pull seguro..." -ForegroundColor Cyan

# Verificar se há alterações não commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Salvando alterações locais..." -ForegroundColor Yellow
    git stash
    $stashed = $true
}

# Fazer pull
Write-Host "📥 Baixando alterações..." -ForegroundColor Cyan
git pull --rebase origin main

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Erro durante git pull"
    if ($stashed) {
        Write-Host "🔄 Restaurando alterações locais..." -ForegroundColor Yellow
        git stash pop
    }
    exit 1
}

# Restaurar alterações se foram salvas
if ($stashed) {
    Write-Host "🔄 Restaurando alterações locais..." -ForegroundColor Yellow
    git stash pop
}

# Instalar dependências se necessário
if (Test-Path "package.json") {
    Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan
    npm install
}

Write-Host "✅ Pull concluído com sucesso!" -ForegroundColor Green
```

### Script para Pull Seguro (Bash)

```bash
#!/bin/bash
# save-and-pull.sh

echo "🔄 Iniciando pull seguro..."

# Verificar se há alterações não commitadas
if [[ -n $(git status --porcelain) ]]; then
    echo "💾 Salvando alterações locais..."
    git stash
    STASHED=true
fi

# Fazer pull
echo "📥 Baixando alterações..."
git pull --rebase origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro durante git pull"
    if [ "$STASHED" = true ]; then
        echo "🔄 Restaurando alterações locais..."
        git stash pop
    fi
    exit 1
fi

# Restaurar alterações se foram salvas
if [ "$STASHED" = true ]; then
    echo "🔄 Restaurando alterações locais..."
    git stash pop
fi

# Instalar dependências se necessário
if [ -f "package.json" ]; then
    echo "📦 Verificando dependências..."
    npm install
fi

echo "✅ Pull concluído com sucesso!"
```

---

## 🔗 Links Úteis

- [Git Pull Documentation](https://git-scm.com/docs/git-pull)
- [GitHub CLI](https://cli.github.com/)
- [Resolving Merge Conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)

---

## 📞 Suporte

Se encontrar problemas:
1. Consulte o arquivo `COMANDOS_GITHUB.md`
2. Consulte o arquivo `AGENT_INSTRUCTIONS.md`
3. Verifique os logs com `git log --oneline -10`

---

**📝 Última atualização:** 2025-11-23  
**✅ Status:** Pronto para uso
