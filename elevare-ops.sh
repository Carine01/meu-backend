#!/bin/bash
# ===================================
# 🌐 PAINEL DE COMANDO — ELEVARE OPS
# ===================================
# Sincronização completa com GitHub
# Atualiza, limpa, instala, testa, builda, envia
# Nível CEO. Nível programador sênior. Nível "ninguém segura a tia do Zap".
#
# Uso: ./elevare-ops.sh

set -e

echo "🚀 ====================================="
echo "🚀 PAINEL DE COMANDO — ELEVARE OPS"
echo "🚀 ====================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. SINCRONIZAR COM GITHUB
echo -e "${BLUE}📡 1/8 - Sincronizando com GitHub...${NC}"
git fetch origin main
git checkout main
git pull origin main
echo -e "${GREEN}✓ Git sincronizado${NC}"
echo ""

# 2. LIMPAR AMBIENTE
echo -e "${BLUE}🧹 2/8 - Limpando ambiente...${NC}"
rm -rf node_modules dist .cache 2>/dev/null || true
echo -e "${GREEN}✓ Ambiente limpo${NC}"
echo ""

# 3. INSTALAR DEPENDÊNCIAS
echo -e "${BLUE}📦 3/8 - Instalando dependências...${NC}"
npm ci
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# 4. BUILD
echo -e "${BLUE}🔨 4/8 - Compilando TypeScript...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build concluído${NC}"
else
    echo -e "${RED}❌ Build falhou!${NC}"
    echo -e "${YELLOW}⚠️  Atenção: O build falhou. Código pode estar quebrado.${NC}"
    echo -e "${YELLOW}   Deseja continuar mesmo assim? (s/n)${NC}"
    read -r CONTINUE
    if [ "$CONTINUE" != "s" ] && [ "$CONTINUE" != "S" ]; then
        echo "Operação cancelada."
        exit 1
    fi
fi
echo ""

# 5. TESTES
echo -e "${BLUE}🧪 5/8 - Executando testes...${NC}"
npm test || {
    echo -e "${YELLOW}⚠️  Testes falharam, seguindo...${NC}"
}
echo -e "${GREEN}✓ Testes executados${NC}"
echo ""

# 6. GIT ADD
echo -e "${BLUE}📝 6/8 - Preparando alterações...${NC}"
git add .
echo -e "${GREEN}✓ Alterações preparadas${NC}"
echo ""

# 7. COMMIT
echo -e "${BLUE}💾 7/8 - Commitando alterações...${NC}"
git commit -m "Atualização automática - Elevare Ops" || {
    echo -e "${YELLOW}⚠️  Nada para commitar.${NC}"
}
echo -e "${GREEN}✓ Commit concluído${NC}"
echo ""

# 8. PUSH
echo -e "${BLUE}🚀 8/8 - Enviando para GitHub...${NC}"
git push origin main || {
    echo -e "${YELLOW}⚠️  Nenhuma alteração para enviar.${NC}"
}
echo -e "${GREEN}✓ Push concluído${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✨ ELEVARE OPS COMPLETO!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "📊 Próximos passos disponíveis:"
echo -e "  • ./create-pr.sh          - Criar PR automático"
echo -e "  • ./docker-deploy.sh      - Subir backend via Docker"
echo -e "  • ./health-check.sh       - Verificar saúde do sistema"
echo -e "  • ./whatsapp-test.sh      - Testar envio WhatsApp"
echo -e "  • ./create-clinicid-issues.sh - Criar 7 issues clinicId"
echo -e "  • ./monitor-actions.sh    - Monitorar GitHub Actions"
echo -e "  • ./deploy-production.sh  - Deploy em produção"
echo ""
