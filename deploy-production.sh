#!/bin/bash
# ===================================
# 🚀 DEPLOY FULL PRODUÇÃO
# ===================================
# Quando estiver pronta para empurrar a Elevação ao mundo
# Deploy completo em produção
#
# Uso: ./deploy-production.sh

set -e

echo "🚀 ====================================="
echo "🚀 DEPLOY FULL PRODUÇÃO — ELEVARE"
echo "🚀 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se estamos na branch main
# Use rev-parse for better compatibility with older Git versions
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ ATENÇÃO: Você não está na branch main!${NC}"
    echo "   Branch atual: $CURRENT_BRANCH"
    echo ""
    echo "   O deploy de produção deve ser feito a partir da main."
    echo "   Execute: git checkout main && git pull origin main"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATENÇÃO: DEPLOY DE PRODUÇÃO${NC}"
echo ""
echo "Este comando irá:"
echo "  • Usar configuração de produção"
echo "  • Buildar imagens otimizadas"
echo "  • Subir em modo produção"
echo ""
echo -e "${YELLOW}Deseja continuar? (s/n)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Deploy cancelado."
    exit 0
fi

echo ""

# Verificar se arquivo de deploy existe
if [ ! -f "deploy/docker-compose.yml" ]; then
    echo -e "${RED}❌ Arquivo deploy/docker-compose.yml não encontrado!${NC}"
    echo ""
    echo "Usando docker-compose.yml padrão com NODE_ENV=production..."
    COMPOSE_FILE="docker-compose.yml"
    export NODE_ENV=production
else
    echo -e "${BLUE}✓ Usando configuração de produção: deploy/docker-compose.yml${NC}"
    COMPOSE_FILE="deploy/docker-compose.yml"
fi

echo ""

# 1. PARAR CONTAINERS
echo -e "${BLUE}🛑 1/5 - Parando containers de produção...${NC}"
docker compose -f "$COMPOSE_FILE" down --remove-orphans
echo -e "${GREEN}✓ Containers parados${NC}"
echo ""

# 2. LIMPAR VOLUMES ANTIGOS (CUIDADO!)
echo -e "${YELLOW}⚠️  Deseja limpar volumes antigos? (s/n)${NC}"
echo "   (Isso irá APAGAR dados locais do banco - use com cuidado!)"
read -r CLEAN_VOLUMES

if [ "$CLEAN_VOLUMES" = "s" ] || [ "$CLEAN_VOLUMES" = "S" ]; then
    echo -e "${BLUE}🧹 Limpando volumes...${NC}"
    docker compose -f "$COMPOSE_FILE" down -v
    echo -e "${GREEN}✓ Volumes limpos${NC}"
fi
echo ""

# 3. PULL IMAGENS
echo -e "${BLUE}📥 2/5 - Atualizando imagens...${NC}"
docker compose -f "$COMPOSE_FILE" pull 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Algumas imagens não puderam ser atualizadas${NC}"
}
echo -e "${GREEN}✓ Imagens atualizadas${NC}"
echo ""

# 4. BUILD PRODUÇÃO
echo -e "${BLUE}🔨 3/5 - Building para produção...${NC}"
docker compose -f "$COMPOSE_FILE" build --no-cache
echo -e "${GREEN}✓ Build de produção concluído${NC}"
echo ""

# 5. SUBIR SERVIÇOS
echo -e "${BLUE}🚀 4/5 - Subindo serviços de produção...${NC}"
docker compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✓ Serviços iniciados${NC}"
echo ""

# 6. AGUARDAR INICIALIZAÇÃO
echo -e "${BLUE}⏳ 5/5 - Aguardando inicialização (30s)...${NC}"
sleep 30
echo -e "${GREEN}✓ Aguardado${NC}"
echo ""

# 7. VERIFICAR STATUS
echo -e "${BLUE}📊 Verificando status dos containers...${NC}"
docker compose -f "$COMPOSE_FILE" ps
echo ""

# 8. HEALTH CHECK
echo -e "${BLUE}🏥 Executando health check...${NC}"
echo ""

# Tentar health check básico
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
if curl -s --max-time 10 "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend está respondendo!${NC}"
else
    echo -e "${RED}✗ Backend não está respondendo (pode estar inicializando)${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✨ DEPLOY DE PRODUÇÃO CONCLUÍDO!${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}📊 Informações:${NC}"
echo "  • Configuração: $COMPOSE_FILE"
echo "  • Modo: PRODUÇÃO"
echo "  • Backend: $BACKEND_URL"
echo ""
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo "  • ./health-check.sh          - Verificar saúde completa"
echo "  • docker compose -f $COMPOSE_FILE logs -f  - Ver logs"
echo "  • docker compose -f $COMPOSE_FILE ps       - Ver status"
echo ""
echo -e "${YELLOW}💡 Dica:${NC}"
echo "   Monitore os logs por alguns minutos para garantir estabilidade:"
echo "   docker compose -f $COMPOSE_FILE logs -f backend"
echo ""
