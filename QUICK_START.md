# 🚀 Quick Start - Automação GitHub

Este guia rápido mostra como começar a usar o pacote de automação em **5 minutos**.

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Pré-requisitos (1 min)

```bash
# Verificar se gh CLI está instalado
gh --version

# Se não estiver instalado:
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Autenticar
gh auth login
```

### 2️⃣ Configurar Secrets (2 min)

```bash
# Executar script interativo
./scripts/configure-secrets.sh

# OU configurar manualmente via:
gh secret set DB_URL --body "postgresql://user:pass@host:5432/dbname"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "seu_token"
gh secret set JWT_SECRET --body "seu_secret_de_32_chars_ou_mais"
```

### 3️⃣ Aplicar Patches (1 min)

```bash
# Aplicar patches automaticamente
./scripts/apply-patches.sh
```

### 4️⃣ Testar Automação (1 min)

```bash
# Disparar orquestrador para uma branch
BRANCH="feat/minha-feature"
./scripts/agent/run-agents-all.sh "$BRANCH"

# Ver status dos workflows
gh run list --branch "$BRANCH" --limit 10
```

---

## 🎯 Uso Diário

### Para Cada Nova Feature/PR

```bash
# 1. Criar branch e fazer mudanças
git checkout -b feat/minha-feature
# ... fazer mudanças ...
git add .
git commit -m "feat: minha feature"
git push -u origin feat/minha-feature

# 2. Criar PR
gh pr create --base main --head feat/minha-feature \
  --title "feat: Minha Feature" \
  --body "## Descrição\nDescrição das mudanças..."

# 3. Disparar automação
export BRANCH="feat/minha-feature"
./scripts/agent/run-agents-all.sh "$BRANCH"

# 4. Monitorar (após 2-3 min)
sleep 180
./scripts/agent/monitor-and-report.sh "$BRANCH"

# 5. Ver status
gh pr checks "$(gh pr list --head $BRANCH --json number -q '.[0].number')"
```

---

## 📋 Comandos Mais Usados

### Ver Workflows

```bash
# Listar workflows disponíveis
gh workflow list

# Ver runs recentes
gh run list --limit 10

# Ver runs de uma branch específica
gh run list --branch feat/minha-feature --limit 10

# Ver log de um run
gh run view <RUN_ID> --log
```

### Disparar Workflows

```bash
# Via orquestrador (dispara todos)
./scripts/agent/run-agents-all.sh feat/minha-feature

# Individual
gh workflow run "TypeScript Guardian" --ref feat/minha-feature
gh workflow run "Docker Builder" --ref feat/minha-feature
```

### Gerenciar PRs

```bash
# Criar PR
gh pr create --base main --head feat/minha-feature

# Ver PRs abertos
gh pr list

# Ver checks de um PR
gh pr checks 123

# Mergear PR
gh pr merge 123 --squash --delete-branch
```

### Gerenciar Issues

```bash
# Listar issues abertas
gh issue list

# Issues de incidentes (falhas automatizadas)
gh issue list --label "incident" --state open

# Criar issue manualmente
gh issue create --title "Título" --body "Descrição" --label "bug"
```

---

## 🔧 Troubleshooting Rápido

### Workflow falhou?

```bash
# 1. Ver qual falhou
gh run list --branch feat/minha-feature --limit 5

# 2. Ver logs do que falhou
gh run view <RUN_ID> --log

# 3. Ver últimas 50 linhas
gh run view <RUN_ID> --log | tail -50

# 4. Re-executar workflow (se foi erro temporário)
gh run rerun <RUN_ID>
```

### Secret não está funcionando?

```bash
# 1. Listar secrets configurados
gh secret list

# 2. Reconfigurar um secret
gh secret set SECRET_NAME

# 3. Verificar no GitHub
# Acesse: Settings → Secrets and variables → Actions
```

### Patch não aplica?

```bash
# 1. Verificar se já foi aplicado
git apply --reverse --check patch-clinicId-filters.patch

# 2. Ver detalhes do erro
git apply --check patch-clinicId-filters.patch

# 3. Se já aplicado, apenas ignore
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **[GUIA_AUTOMACAO_COMPLETA.md](GUIA_AUTOMACAO_COMPLETA.md)** - Guia completo (10 min de leitura)
- **[scripts/README.md](scripts/README.md)** - Documentação de todos os scripts
- **[scripts/comandos-rapidos.sh](scripts/comandos-rapidos.sh)** - Comandos para copy/paste

---

## 🎓 Exemplos Práticos

### Exemplo 1: Nova Feature Completa

```bash
# Criar branch
git checkout -b feat/nova-api-endpoint

# Desenvolver
# ... editar arquivos ...

# Commit e push
git add .
git commit -m "feat: adicionar endpoint /api/users"
git push -u origin feat/nova-api-endpoint

# Criar PR
gh pr create --base main --head feat/nova-api-endpoint \
  --title "feat: Novo endpoint de usuários" \
  --body "Adiciona endpoint GET /api/users para listar usuários"

# Disparar automação
./scripts/agent/run-agents-all.sh feat/nova-api-endpoint

# Aguardar e monitorar
sleep 180
./scripts/agent/monitor-and-report.sh feat/nova-api-endpoint

# Se tudo passar, mergear (após review)
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Exemplo 2: Corrigir Bug Urgente

```bash
# Criar hotfix
git checkout -b fix/bug-urgente

# Corrigir
# ... editar arquivos ...

# Commit e push
git add .
git commit -m "fix: corrigir bug crítico X"
git push -u origin fix/bug-urgente

# Criar PR de emergência
gh pr create --base main --head fix/bug-urgente \
  --title "🔥 HOTFIX: Corrigir bug crítico" \
  --label "priority/high,bug" \
  --body "**Urgente!** Corrige bug X que está afetando produção."

# Disparar workflows
./scripts/agent/run-agents-all.sh fix/bug-urgente

# Monitorar ativamente
watch -n 10 "gh run list --branch fix/bug-urgente --limit 5"

# Assim que passar, mergear imediatamente
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Exemplo 3: Revisar PR de Outro Desenvolvedor

```bash
# Fazer checkout do PR
gh pr checkout 123

# Disparar workflows para revisar
./scripts/agent/run-agents-all.sh <branch-do-pr>

# Ver checks
gh pr checks 123

# Se aprovado, comentar
gh pr review 123 --approve --body "LGTM! ✅"

# Se precisa mudanças
gh pr review 123 --request-changes --body "Por favor, corrija X e Y"
```

---

## ⚡ Scripts Úteis

### Ver todos os comandos disponíveis

```bash
./scripts/comandos-rapidos.sh
```

### Ver exemplo de fluxo completo

```bash
./scripts/exemplo-fluxo-completo.sh
```

### Configuração inicial (primeira vez)

```bash
# Passo 1: Secrets
./scripts/configure-secrets.sh

# Passo 2: Patches
./scripts/apply-patches.sh

# Passo 3: Testar
./scripts/agent/run-agents-all.sh main
```

---

## 🎯 Checklist de Sucesso

- [ ] `gh` CLI instalado e autenticado
- [ ] Secrets configurados (mínimo: DB_URL, JWT_SECRET)
- [ ] Patches aplicados
- [ ] Consegue disparar workflows
- [ ] Consegue ver logs dos workflows
- [ ] Consegue criar PRs
- [ ] Workflows passam sem erros

Se todos os itens acima estão ✅, você está pronto! 🎉

---

## 💡 Dicas Finais

1. **Sempre revise antes de mergear** - mesmo que workflows passem
2. **Use branches descritivas** - `feat/`, `fix/`, `chore/`
3. **Mantenha PRs pequenos** - mais fácil de revisar
4. **Documente mudanças significativas** - nos comentários do PR
5. **Responda a falhas rapidamente** - issues são criadas automaticamente

---

**🚀 Pronto para automatizar! Boa sorte!**

Para dúvidas: abra uma issue ou consulte a [documentação completa](GUIA_AUTOMACAO_COMPLETA.md).
