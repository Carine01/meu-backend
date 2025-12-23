# 🚀 Pacote Completo de Automação GitHub - Guia de Uso

Este documento contém todos os comandos e scripts necessários para automatizar o fluxo completo de CI/CD, agents e workflows do projeto.

## 📋 Índice

1. [Configuração Inicial](#1-configuração-inicial)
2. [Aplicar Patches](#2-aplicar-patches)
3. [Disparar Orquestrador](#3-disparar-orquestrador)
4. [Monitorar Runs](#4-monitorar-runs)
5. [Criar Issues/PRs Automáticos](#5-criar-issuesprs-automáticos)
6. [Comandos de Monitoramento](#6-comandos-de-monitoramento)
7. [Comandos Auxiliares](#7-comandos-auxiliares)
8. [Workflows Disponíveis](#8-workflows-disponíveis)
9. [Segurança e Recomendações](#9-segurança-e-recomendações)

---

## 1. Configuração Inicial

### ✅ 1.1 Configurar Secrets Essenciais

**Opção A: Via Script Interativo (Recomendado)**

```bash
./scripts/configure-secrets.sh
```

O script irá perguntar cada valor de forma interativa e configurar automaticamente.

**Opção B: Via Comandos Diretos**

```bash
# Substitua pelos valores reais
gh secret set DB_URL --body "postgresql://user:pass@host:5432/dbname"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "seu_token_whatsapp"
gh secret set WHATSAPP_PROVIDER_API_URL --body "https://api.gateway.whatsapp"
gh secret set JWT_SECRET --body "seu_jwt_secret"
gh secret set DOCKER_REGISTRY_USER --body "user"
gh secret set DOCKER_REGISTRY_PASS --body "pass"
```

**Opção C: Via GitHub UI**

Acesse: `Settings → Secrets and variables → Actions → New repository secret`

---

## 2. Aplicar Patches

### ✅ 2.1 Aplicar Patches Automaticamente

```bash
./scripts/apply-patches.sh
```

Este script:
- Aplica `patch-clinicId-filters.patch` (filtros de multitenancy)
- Aplica `patch-agent-workflows.patch` (workflows dos agents)
- Cria commit automaticamente se houver mudanças
- Pergunta se deve fazer push

### ✅ 2.2 Aplicar Patches Manualmente

```bash
git apply patch-clinicId-filters.patch || echo "patch já aplicado"
git apply patch-agent-workflows.patch || echo "patch já aplicado"
git add .
git commit -m "chore: apply clinicId filters + agent workflows"
git push origin HEAD
```

---

## 3. Disparar Orquestrador

### ✅ 3.1 Comando Autodetect (Recomendado)

Detecta automaticamente a branch e PR:

```bash
BRANCH="feat/whatsapp-clinicid-filters"
export GITHUB_TOKEN="$(gh auth token)"

# Autodetecta PR da branch
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)

echo "Branch: $BRANCH  | Detected PR: ${PR_NUMBER:-none}"

./scripts/agent/run-agents-all.sh "$BRANCH" "${PR_NUMBER:-}" false
```

**Parâmetros:**
- `$1` - Branch (obrigatório)
- `$2` - PR number (opcional, autodetecta se vazio)
- `$3` - Auto merge (opcional, padrão: `false`)

### ✅ 3.2 Via Workflow (GitHub Actions UI)

```bash
export GITHUB_TOKEN="$(gh auth token)"
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" \
  --ref feat/whatsapp-clinicid-filters
```

Ou acesse: `Actions → Agent Orchestrator → Run workflow`

---

## 4. Monitorar Runs

### ✅ 4.1 Listar Runs Recentes

```bash
gh run list --branch feat/whatsapp-clinicid-filters --limit 10
```

### ✅ 4.2 Ver Log de um Run Específico

```bash
# Substitua <RUN_ID> pelo ID do run
gh run view <RUN_ID> --log --exit-status
```

### ✅ 4.3 Monitorar em Tempo Real

```bash
gh run watch <RUN_ID>
```

### ✅ 4.4 Monitorar e Reportar Falhas Automaticamente

```bash
./scripts/agent/monitor-and-report.sh feat/whatsapp-clinicid-filters 123
```

Este script:
- Lista todos os runs recentes da branch
- Detecta falhas automaticamente
- Cria issues para cada falha
- Posta comentário no PR com resumo

---

## 5. Criar Issues/PRs Automáticos

### ✅ 5.1 Criar Issue Automaticamente (Falha em Check)

```bash
gh issue create \
  --title "Smoke fail: feat/whatsapp-clinicid-filters" \
  --body "Workflow X falhou. Logs: (ver Actions). Prioridade: alta. Favor investigar." \
  --label "incident,priority/high"
```

### ✅ 5.2 Criar as 7 Issues de Multitenancy

**PowerShell:**

```powershell
pwsh ./scripts/criar-issues-gh.ps1 -DevUsername "Carine01"
```

**Bash:**

```bash
./scripts/criar-issues-gh.sh
```

### ✅ 5.3 Criar PR Automaticamente

```bash
gh pr create \
  --base main \
  --head feat/whatsapp-clinicid-filters \
  --title "feat: whatsapp + clinicId" \
  --body-file RELATORIO_PROGRAMADOR.md
```

---

## 6. Comandos de Monitoramento

### ✅ 6.1 Ver Comentários no PR

```bash
gh pr view <PR_NUMBER> --comments
```

### ✅ 6.2 Ver Status dos PRs

```bash
gh pr status
```

### ✅ 6.3 Listar Issues Abertas

```bash
gh issue list --label "incident" --state open
```

### ✅ 6.4 Ver Workflows Disponíveis

```bash
gh workflow list
```

---

## 7. Comandos Auxiliares

### ✅ 7.1 Instalar Dependências e Rodar Testes

```bash
npm ci
npm run test
npm run build
```

### ✅ 7.2 Subir Docker Compose (Local)

```bash
docker compose up --build -d
```

### ✅ 7.3 Testar Health Endpoints

```bash
# Health do WhatsApp
curl -sS http://localhost:3000/whatsapp/health | jq .

# Health geral
curl -sS http://localhost:3000/health | jq .
```

### ✅ 7.4 Ver Logs Docker

```bash
docker compose logs -f --tail=100
```

---

## 8. Workflows Disponíveis

### 📋 Lista de Workflows

1. **Agent Orchestrator** - Orquestra todos os workflows em sequência
   - Dispara automaticamente todos os outros workflows
   - Monitora e reporta falhas
   - Posta comentários no PR

2. **TypeScript Guardian** - Verificação de tipos TypeScript
   - Executa `tsc --noEmit`
   - Detecta erros de tipos

3. **Register Fila Fallback (AST)** - Registro de fallbacks
   - Executa script de registro via AST
   - Valida build

4. **WhatsApp Monitor** - Monitoramento de integração WhatsApp
   - Verifica arquivos de integração
   - Executa health checks
   - Roda a cada 6 horas (scheduled)

5. **Docker Builder** - Build de imagem Docker
   - Constrói e publica imagem
   - Push para GHCR

6. **CI** - Integração contínua
   - Instala dependências
   - Roda testes

7. **Deploy** - Deploy para Cloud Run
   - Build e deploy automático
   - Apenas em push para `main`

### ✅ 8.1 Disparar Workflows Individualmente

```bash
# TypeScript Guardian
gh workflow run "TypeScript Guardian" --ref feat/whatsapp-clinicid-filters

# Register Fila Fallback
gh workflow run "Register Fila Fallback (AST)" --ref feat/whatsapp-clinicid-filters

# Docker Builder
gh workflow run "Docker Builder" --ref feat/whatsapp-clinicid-filters

# WhatsApp Monitor
gh workflow run "WhatsApp Monitor" --ref feat/whatsapp-clinicid-filters
```

### ✅ 8.2 Disparar Via GitHub UI

1. Acesse: `Actions`
2. Selecione o workflow
3. Clique em `Run workflow`
4. Escolha a branch
5. Clique em `Run workflow` (verde)

---

## 9. Segurança e Recomendações

### 🔒 Segurança

1. **Nunca exponha secrets em arquivos do repo**
   - Use somente GitHub Secrets
   - Não commite `.env` ou arquivos com credenciais

2. **Mantenha auto-merge desligado**
   - Auto-merge só após pelo menos 1 review humano
   - Configure branch protection rules

3. **Execute scripts em ambiente confiável**
   - Preferencialmente em GitHub Actions runner
   - Ou máquina local com `gh` autenticado

4. **Revise logs de falhas**
   - Sempre verifique os últimos 200 linhas de logs
   - Cole trechos relevantes em issues/PRs

### ✅ Checklist de Segurança

- [ ] Secrets configurados no GitHub (nunca no código)
- [ ] Auto-merge desabilitado
- [ ] Branch protection rules ativas em `main`
- [ ] Pelo menos 1 reviewer obrigatório
- [ ] Status checks obrigatórios antes de merge
- [ ] Dependências atualizadas (sem vulnerabilidades)

### 📊 Boas Práticas

1. **Sempre revise mudanças antes de mergear**
2. **Execute testes localmente antes de push**
3. **Use branches feature (`feat/`) para novas funcionalidades**
4. **Mantenha PRs pequenos e focados**
5. **Documente mudanças significativas**
6. **Responda a issues de falhas rapidamente**

---

## 🎯 Fluxo Completo Recomendado

### Passo a Passo Completo

```bash
# 1. Configurar secrets (uma vez)
./scripts/configure-secrets.sh

# 2. Aplicar patches (uma vez)
./scripts/apply-patches.sh

# 3. Disparar orquestrador (a cada PR/branch)
BRANCH="feat/whatsapp-clinicid-filters"
./scripts/agent/run-agents-all.sh "$BRANCH"

# 4. Aguardar 2-3 minutos e monitorar
sleep 180
./scripts/agent/monitor-and-report.sh "$BRANCH"

# 5. Ver status geral
gh run list --branch "$BRANCH" --limit 10

# 6. Se tudo passar, criar/atualizar PR
gh pr create --base main --head "$BRANCH" \
  --title "feat: whatsapp + clinicId" \
  --body-file RELATORIO_PROGRAMADOR.md

# 7. Aguardar review e mergear
gh pr merge <PR_NUMBER> --squash --delete-branch
```

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/Carine01/meu-backend
- **Actions:** https://github.com/Carine01/meu-backend/actions
- **Issues:** https://github.com/Carine01/meu-backend/issues
- **Pull Requests:** https://github.com/Carine01/meu-backend/pulls
- **Secrets:** https://github.com/Carine01/meu-backend/settings/secrets/actions

---

## 📞 Troubleshooting

### Erro: "gh: command not found"

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# macOS
brew install gh

# Windows
winget install GitHub.cli
```

### Erro: "not authenticated"

```bash
gh auth login
# Escolha: GitHub.com → HTTPS → Login via browser
```

### Erro: "workflow not found"

Verifique se o workflow existe:

```bash
gh workflow list
```

Se não existir, verifique se os arquivos `.github/workflows/*.yml` foram commitados.

---

## 🎉 Pronto!

Você agora tem um pacote completo de automação para:
- ✅ Configurar secrets
- ✅ Aplicar patches
- ✅ Disparar workflows em sequência
- ✅ Monitorar e reportar falhas
- ✅ Criar issues/PRs automaticamente
- ✅ Mergear com segurança

**Qualquer dúvida, consulte este guia ou abra uma issue!**
