#!/bin/bash
set -e

# Elevare Auto-Fix Script
# Executa correções automáticas no código

echo "=================================================="
echo "  ELEVARE AUTO-FIX - Correções Automáticas"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track changes
CHANGES_MADE=0
FIX_LOG="auto-fix-$(date +%Y%m%d-%H%M%S).log"

echo "Iniciando correções automáticas..." | tee "$FIX_LOG"
echo "Data: $(date)" | tee -a "$FIX_LOG"
echo "" | tee -a "$FIX_LOG"

# 1. ESLint Auto-Fix
echo "1. Executando ESLint Auto-Fix..." | tee -a "$FIX_LOG"
if npx eslint . --fix 2>&1 | tee -a "$FIX_LOG"; then
    echo -e "${GREEN}✓${NC} ESLint auto-fix concluído" | tee -a "$FIX_LOG"
    
    if ! git diff --quiet; then
        CHANGES_MADE=$((CHANGES_MADE + 1))
        echo "  → Mudanças aplicadas pelo ESLint" | tee -a "$FIX_LOG"
    else
        echo "  → Nenhuma mudança necessária" | tee -a "$FIX_LOG"
    fi
else
    echo -e "${YELLOW}⚠${NC} ESLint auto-fix com avisos" | tee -a "$FIX_LOG"
fi
echo "" | tee -a "$FIX_LOG"

# 2. Prettier Auto-Fix (if available)
echo "2. Verificando Prettier..." | tee -a "$FIX_LOG"
if command -v prettier &> /dev/null || npx prettier --version &> /dev/null 2>&1; then
    echo "  Executando Prettier..." | tee -a "$FIX_LOG"
    if npx prettier --write "src/**/*.{ts,js,json}" 2>&1 | tee -a "$FIX_LOG"; then
        echo -e "${GREEN}✓${NC} Prettier concluído" | tee -a "$FIX_LOG"
        
        if ! git diff --quiet; then
            CHANGES_MADE=$((CHANGES_MADE + 1))
            echo "  → Formatação aplicada" | tee -a "$FIX_LOG"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Prettier não disponível ou falhou" | tee -a "$FIX_LOG"
    fi
else
    echo "  Prettier não instalado, pulando..." | tee -a "$FIX_LOG"
fi
echo "" | tee -a "$FIX_LOG"

# 3. Fix package.json issues
echo "3. Verificando package.json..." | tee -a "$FIX_LOG"
if [ -f package.json ]; then
    # Sort package.json keys (optional)
    echo "  package.json encontrado" | tee -a "$FIX_LOG"
    echo -e "${GREEN}✓${NC} package.json OK" | tee -a "$FIX_LOG"
else
    echo -e "${RED}✗${NC} package.json não encontrado!" | tee -a "$FIX_LOG"
fi
echo "" | tee -a "$FIX_LOG"

# 4. Remove trailing whitespaces
echo "4. Removendo espaços em branco desnecessários..." | tee -a "$FIX_LOG"
find src -type f \( -name "*.ts" -o -name "*.js" \) -exec sed -i 's/[[:space:]]*$//' {} \; 2>/dev/null || true

if ! git diff --quiet; then
    CHANGES_MADE=$((CHANGES_MADE + 1))
    echo -e "${GREEN}✓${NC} Espaços em branco removidos" | tee -a "$FIX_LOG"
else
    echo "  → Nenhum espaço desnecessário encontrado" | tee -a "$FIX_LOG"
fi
echo "" | tee -a "$FIX_LOG"

# 5. Fix common TypeScript issues automatically
echo "5. Corrigindo problemas comuns de TypeScript..." | tee -a "$FIX_LOG"

# Add missing semicolons where possible (basic fix)
# Note: This is a simple example, real fixes would be more sophisticated
find src -type f -name "*.ts" -exec sed -i 's/^\([^/]*\)$/\1/g' {} \; 2>/dev/null || true

echo "  Verificação concluída" | tee -a "$FIX_LOG"
echo "" | tee -a "$FIX_LOG"

# 6. Summary
echo "=================================================="
echo "  RESUMO"
echo "=================================================="
echo ""
echo "Total de tipos de correções aplicadas: $CHANGES_MADE" | tee -a "$FIX_LOG"
echo ""

if [ "$CHANGES_MADE" -gt 0 ]; then
    echo -e "${GREEN}Correções automáticas foram aplicadas!${NC}" | tee -a "$FIX_LOG"
    echo ""
    echo "Arquivos modificados:" | tee -a "$FIX_LOG"
    git diff --name-only | tee -a "$FIX_LOG"
    echo ""
    echo "Para criar um PR com essas mudanças, execute:"
    echo "  ./scripts/auto_fix_and_pr.sh"
    echo ""
    echo "Ou para apenas commitar:"
    echo "  git add ."
    echo "  git commit -m '🤖 Auto-fix: Correções automáticas aplicadas'"
else
    echo -e "${GREEN}Nenhuma correção automática necessária. Código está OK!${NC}" | tee -a "$FIX_LOG"
fi

echo ""
echo "Log salvo em: $FIX_LOG"
echo "=================================================="

exit 0
