#!/bin/bash
# ===================================
# 🐳 DEPLOY BACKEND VIA DOCKER
# ===================================
# Sobe o backend completo via Docker Compose
# É aqui que a máquina respira
#
# Uso: ./docker-deploy.sh

set -e

echo "🐳 ====================================="
echo "🐳 DEPLOY BACKEND VIA DOCKER"
echo "🐳 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "Instale em: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está disponível!"
    exit 1
fi

# 1. PARAR CONTAINERS EXISTENTES
echo -e "${BLUE}🛑 1/4 - Parando containers existentes...${NC}"
docker compose down --remove-orphans
echo -e "${GREEN}✓ Containers parados${NC}"
echo ""

# 2. ATUALIZAR IMAGENS
echo -e "${BLUE}📥 2/4 - Atualizando imagens Docker...${NC}"
docker compose pull || {
    echo -e "${YELLOW}⚠️  Algumas imagens não puderam ser atualizadas (normal se construindo localmente)${NC}"
}
echo -e "${GREEN}✓ Imagens atualizadas${NC}"
echo ""

# 3. SUBIR CONTAINERS
echo -e "${BLUE}🚀 3/4 - Subindo containers com build...${NC}"
docker compose up -d --build
echo -e "${GREEN}✓ Containers iniciados${NC}"
echo ""

# 4. VERIFICAR STATUS
echo -e "${BLUE}📊 4/4 - Verificando status dos containers...${NC}"
docker compose ps
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✨ BACKEND DEPLOYADO COM SUCESSO!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "📊 Serviços disponíveis:"
echo -e "  • Backend:     http://localhost:3000"
echo -e "  • PostgreSQL:  localhost:5432"
echo -e "  • Prometheus:  http://localhost:9090"
echo -e "  • Grafana:     http://localhost:3001"
echo ""
echo -e "📝 Próximos passos:"
echo -e "  • ./health-check.sh       - Verificar saúde dos serviços"
echo -e "  • docker compose logs -f  - Ver logs em tempo real"
echo -e "  • docker compose down     - Parar todos os serviços"
echo ""
