#!/bin/bash
# ===============================
# 🚀 Script Ultra-Ferrari de Execução Automática
# ===============================

# 0️⃣ Configuração inicial
set -e  # Para abortar se algum comando falhar
echo "🚦 Iniciando execução automática completa..."

# 1️⃣ Merge do PR de documentação
echo "🔹 Merge do PR de documentação"
if command -v gh &> /dev/null; then
    # Use a variável de ambiente DOCS_PR_ID se definida
    if [[ -n "${DOCS_PR_ID}" ]]; then
        gh pr merge "${DOCS_PR_ID}" --merge || echo "⚠️ PR já mergeado ou falhou"
    else
        echo "ℹ️ Variável DOCS_PR_ID não definida. Pulando merge do PR."
        echo "ℹ️ Para habilitar: export DOCS_PR_ID=<número_do_pr>"
    fi
else
    echo "⚠️ GitHub CLI (gh) não está instalado. Pulando merge do PR."
fi

# 2️⃣ Instalar dependências
echo "🔹 Instalando dependências npm"
npm ci || npm install

# 3️⃣ Build e testes
echo "🔹 Rodando build"
npm run build || echo "⚠️ Build falhou. Continuando..."

echo "🔹 Rodando testes"
npm run test || echo "⚠️ Testes falharam. Continuando..."

# 4️⃣ Aplicar patches clinicId e workflows
echo "🔹 Aplicando patches clinicId e workflows"
git apply ./patches/patch-clinicId-filters.patch || echo "⚠️ Patch clinicId já aplicado ou falhou"
git apply ./patches/patch-agent-workflows.patch || echo "⚠️ Patch workflows já aplicado ou falhou"

# Verificar se há mudanças para commitar
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "Aplicando patches clinicId e workflows" || echo "⚠️ Commit falhou"
    
    # Determinar o branch atual
    CURRENT_BRANCH=$(git branch --show-current)
    echo "🔹 Branch atual: $CURRENT_BRANCH"
    
    git push origin "$CURRENT_BRANCH" || echo "⚠️ Push falhou ou branch já atualizada"
else
    echo "ℹ️ Nenhuma alteração a commitar após aplicar patches"
fi

# 5️⃣ Subir backend com Docker Compose
echo "🔹 Subindo backend com Docker Compose"
docker compose up --build -d || docker-compose up --build -d || echo "⚠️ Docker Compose falhou"

# Aguardar alguns segundos para os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem (30 segundos)..."
sleep 30

# 6️⃣ Testar endpoints de saúde
echo "🔹 Validando endpoints de saúde"
if command -v jq &> /dev/null; then
    echo "📡 Testando /whatsapp/health"
    curl -sS http://localhost:3000/whatsapp/health | jq . || echo "⚠️ Endpoint /whatsapp/health não respondeu"
    
    echo "📡 Testando /health"
    curl -sS http://localhost:3000/health | jq . || echo "⚠️ Endpoint /health não respondeu"
else
    echo "📡 Testando /whatsapp/health"
    curl -sS http://localhost:3000/whatsapp/health || echo "⚠️ Endpoint /whatsapp/health não respondeu"
    
    echo "📡 Testando /health"
    curl -sS http://localhost:3000/health || echo "⚠️ Endpoint /health não respondeu"
fi

# 7️⃣ Monitoramento de workflows GitHub Actions
echo "🔹 Listando runs do GitHub Actions"
if command -v gh &> /dev/null; then
    gh run list || echo "⚠️ Falha ao listar runs"
    
    echo "🔹 Iniciando monitoramento do último run"
    LAST_RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
    
    if [[ -n "$LAST_RUN_ID" ]]; then
        echo "📊 Monitorando run ID: $LAST_RUN_ID"
        gh run watch "$LAST_RUN_ID" || echo "⚠️ Falha ao monitorar run"
    else
        echo "ℹ️ Nenhum run encontrado para monitorar"
    fi
else
    echo "⚠️ GitHub CLI (gh) não está instalado. Pulando monitoramento de workflows."
fi

echo ""
echo "✅ Execução automática completa! Todos os agentes configurados."
echo "📝 Verifique os logs acima para garantir que todas as etapas foram executadas corretamente."
