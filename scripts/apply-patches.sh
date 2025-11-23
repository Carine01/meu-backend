#!/bin/bash
# Script para aplicar patches (clinicId filters + agent workflows)
# Uso: ./scripts/apply-patches.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔧 Aplicando Patches no Repositório"
echo ""

# Verificar se patches existem
CLINICID_PATCH="patch-clinicId-filters.patch"
AGENT_WORKFLOWS_PATCH="patch-agent-workflows.patch"

apply_patch() {
    local patch_file=$1
    
    if [ ! -f "$patch_file" ]; then
        echo "⚠️  Patch não encontrado: $patch_file"
        return 1
    fi
    
    echo "📄 Aplicando patch: $patch_file"
    
    # Verificar se patch já foi aplicado (reverse check)
    if git apply --reverse --check "$patch_file" 2>/dev/null; then
        echo "   ℹ️  Patch já aplicado: $patch_file"
        return 2
    fi
    
    # Tentar aplicar o patch
    if git apply --check "$patch_file" 2>/dev/null; then
        git apply "$patch_file"
        echo "   ✅ Patch aplicado com sucesso: $patch_file"
        return 0
    else
        echo "   ⚠️  Não é possível aplicar patch (conflitos ou já aplicado): $patch_file"
        echo "   💡 Para mais detalhes: git apply --check $patch_file"
        return 2
    fi
}

# Aplicar patch clinicId
echo "1️⃣ Aplicando patch de filtros clinicId..."
if apply_patch "$CLINICID_PATCH"; then
    CLINICID_APPLIED=true
else
    CLINICID_APPLIED=false
fi
echo ""

# Aplicar patch agent workflows (se existir)
echo "2️⃣ Aplicando patch de agent workflows..."
if apply_patch "$AGENT_WORKFLOWS_PATCH"; then
    WORKFLOWS_APPLIED=true
else
    WORKFLOWS_APPLIED=false
fi
echo ""

# Commitar mudanças se houver
if [ "$CLINICID_APPLIED" = true ] || [ "$WORKFLOWS_APPLIED" = true ]; then
    echo "📦 Preparando commit com patches aplicados..."
    
    git add .
    
    if git diff --staged --quiet; then
        echo "   ℹ️  Nenhuma mudança para commitar"
    else
        git commit -m "chore: apply clinicId filters + agent workflows patches" || echo "   ⚠️  Commit falhou ou já existe"
        echo "   ✅ Commit criado"
    fi
    echo ""
    
    # Perguntar se deve fazer push
    read -p "🚀 Fazer push das mudanças? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git push origin HEAD
        echo "   ✅ Push realizado com sucesso"
    else
        echo "   ℹ️  Push cancelado (você pode fazer manualmente depois)"
    fi
else
    echo "ℹ️  Nenhum patch foi aplicado (já aplicados ou não necessários)"
fi

echo ""
echo "✅ Processo de aplicação de patches concluído!"
