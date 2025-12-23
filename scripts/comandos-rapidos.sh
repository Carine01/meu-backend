#!/bin/bash
# Quick Commands Reference - Comandos rápidos para copy/paste
# Este arquivo contém todos os comandos prontos para copiar e colar

echo "🚀 COMANDOS RÁPIDOS - AUTOMAÇÃO GITHUB"
echo "======================================"
echo ""

# SEÇÃO 1: CONFIGURAÇÃO
cat << 'EOF'

## 1️⃣ CONFIGURAR SECRETS (executar UMA VEZ)

# Via script interativo:
./scripts/configure-secrets.sh

# OU via comandos diretos (substitua valores):
gh secret set DB_URL --body "postgresql://user:pass@host:5432/dbname"
gh secret set WHATSAPP_PROVIDER_TOKEN --body "seu_token_whatsapp"
gh secret set WHATSAPP_PROVIDER_API_URL --body "https://api.gateway.whatsapp"
gh secret set JWT_SECRET --body "seu_jwt_secret"
gh secret set DOCKER_REGISTRY_USER --body "user"
gh secret set DOCKER_REGISTRY_PASS --body "pass"

EOF

# SEÇÃO 2: PATCHES
cat << 'EOF'

## 2️⃣ APLICAR PATCHES

# Via script:
./scripts/apply-patches.sh

# OU manualmente:
git apply patch-clinicId-filters.patch || echo "já aplicado"
git apply patch-agent-workflows.patch || echo "já aplicado"
git add .
git commit -m "chore: apply patches"
git push origin HEAD

EOF

# SEÇÃO 3: DISPARAR ORQUESTRA
cat << 'EOF'

## 3️⃣ DISPARAR ORQUESTRADOR (EXECUTAR AGORA)

# Comando autodetect (recomendado):
BRANCH="feat/whatsapp-clinicid-filters"
export GITHUB_TOKEN="$(gh auth token)"
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || true)
echo "Branch: $BRANCH  | PR: ${PR_NUMBER:-none}"
./scripts/agent/run-agents-all.sh "$BRANCH" "${PR_NUMBER:-}" false

# OU via workflow:
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" \
  --ref feat/whatsapp-clinicid-filters

EOF

# SEÇÃO 4: WORKFLOWS INDIVIDUAIS
cat << 'EOF'

## 4️⃣ DISPARAR WORKFLOWS INDIVIDUAIS

gh workflow run "TypeScript Guardian" --ref feat/whatsapp-clinicid-filters
gh workflow run "Register Fila Fallback (AST)" --ref feat/whatsapp-clinicid-filters
gh workflow run "Docker Builder" --ref feat/whatsapp-clinicid-filters
gh workflow run "WhatsApp Monitor" --ref feat/whatsapp-clinicid-filters

EOF

# SEÇÃO 5: MONITORAMENTO
cat << 'EOF'

## 5️⃣ MONITORAR RUNS

# Listar runs recentes:
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# Ver log de um run (substitua <RUN_ID>):
gh run view <RUN_ID> --log --exit-status

# Monitorar em tempo real:
gh run watch <RUN_ID>

# Monitorar e criar issues automaticamente:
./scripts/agent/monitor-and-report.sh feat/whatsapp-clinicid-filters

EOF

# SEÇÃO 6: ISSUES E PRS
cat << 'EOF'

## 6️⃣ CRIAR ISSUES/PRS AUTOMATICAMENTE

# Criar issue de falha:
gh issue create \
  --title "Smoke fail: feat/whatsapp-clinicid-filters" \
  --body "Workflow X falhou. Ver Actions. Prioridade alta." \
  --label "incident,priority/high"

# Criar as 7 issues de multitenancy:
pwsh ./scripts/criar-issues-gh.ps1 -DevUsername "Carine01"

# Criar PR:
gh pr create \
  --base main \
  --head feat/whatsapp-clinicid-filters \
  --title "feat: whatsapp + clinicId" \
  --body-file RELATORIO_PROGRAMADOR.md

EOF

# SEÇÃO 7: VERIFICAÇÃO
cat << 'EOF'

## 7️⃣ COMANDOS DE VERIFICAÇÃO

# Ver comentários no PR:
gh pr view <PR_NUMBER> --comments

# Ver status dos PRs:
gh pr status

# Listar issues:
gh issue list --label "incident" --state open

# Ver workflows disponíveis:
gh workflow list

EOF

# SEÇÃO 8: TESTES LOCAIS
cat << 'EOF'

## 8️⃣ TESTES LOCAIS

# Instalar e testar:
npm ci
npm run test
npm run build

# Docker Compose:
docker compose up --build -d

# Health checks:
curl -sS http://localhost:3000/whatsapp/health | jq .
curl -sS http://localhost:3000/health | jq .

EOF

# SEÇÃO 9: MERGE SEGURO
cat << 'EOF'

## 9️⃣ MERGE SEGURO (só após revisão)

# Mergear PR (substitua <PR_NUMBER>):
gh pr merge <PR_NUMBER> --squash --delete-branch

# ⚠️ NÃO faça merge sem pelo menos 1 revisão humana!

EOF

# SEÇÃO 10: RESUMO FLUXO COMPLETO
cat << 'EOF'

## 🎯 FLUXO COMPLETO (copy/paste tudo)

# 1. Configurar (uma vez)
./scripts/configure-secrets.sh
./scripts/apply-patches.sh

# 2. Para cada branch/PR
BRANCH="feat/whatsapp-clinicid-filters"
export GITHUB_TOKEN="$(gh auth token)"
./scripts/agent/run-agents-all.sh "$BRANCH"

# 3. Aguardar e monitorar
sleep 180
./scripts/agent/monitor-and-report.sh "$BRANCH"

# 4. Ver status
gh run list --branch "$BRANCH" --limit 10

# 5. Criar/atualizar PR
gh pr create --base main --head "$BRANCH" \
  --title "feat: whatsapp + clinicId" \
  --body-file RELATORIO_PROGRAMADOR.md

# 6. Mergear (após review)
# gh pr merge <PR_NUMBER> --squash --delete-branch

EOF

echo ""
echo "✅ Comandos prontos para uso!"
echo "📖 Para mais detalhes, veja: GUIA_AUTOMACAO_COMPLETA.md"
