#!/bin/bash

# 🚀 Script de Instalação Completa - Elevare IARA
# Tempo estimado: 5 minutos

set -e

echo "🎯 ELEVARE IARA - Instalação Automática"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar dependências
echo -e "${BLUE}[1/6]${NC} Verificando dependências..."
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js não instalado${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker não instalado${NC}"; exit 1; }
echo -e "${GREEN}✅ Dependências OK${NC}"

# 2. Instalar dependências
echo ""
echo -e "${BLUE}[2/6]${NC} Instalando dependências..."
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 3. Configurar variáveis de ambiente
echo ""
echo -e "${BLUE}[3/6]${NC} Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    echo -e "${BLUE}⚠️  ATENÇÃO: Edite o .env com suas credenciais:${NC}"
    echo "   - DATABASE_URL"
    echo "   - FIREBASE_CREDENTIALS"
    echo "   - MAKE_WEBHOOK_URL"
    echo ""
    read -p "Pressione ENTER após editar o .env..."
else
    echo -e "${GREEN}✅ .env já existe${NC}"
fi

# 4. Subir banco de dados
echo ""
echo -e "${BLUE}[4/6]${NC} Iniciando PostgreSQL..."
docker-compose up -d postgres
echo -e "${GREEN}✅ PostgreSQL rodando${NC}"

# Aguardar banco inicializar
echo "⏳ Aguardando banco de dados (10s)..."
sleep 10

# 5. Executar migrations
echo ""
echo -e "${BLUE}[5/6]${NC} Executando migrations..."
npm run migration:run
echo -e "${GREEN}✅ Migrations executadas${NC}"

# 6. Inicializar dados básicos
echo ""
echo -e "${BLUE}[6/6]${NC} Inicializando dados..."
npm run seed
echo -e "${GREEN}✅ Dados iniciais criados${NC}"

# Resumo
echo ""
echo "========================================"
echo -e "${GREEN}🎉 INSTALAÇÃO CONCLUÍDA!${NC}"
echo "========================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Iniciar backend:"
echo "   ${BLUE}npm run start:dev${NC}"
echo ""
echo "2. Testar endpoints:"
echo "   ${BLUE}curl http://localhost:3000/health${NC}"
echo ""
echo "3. Acessar Prometheus:"
echo "   ${BLUE}http://localhost:9090${NC}"
echo ""
echo "4. Ver métricas:"
echo "   ${BLUE}http://localhost:3000/bi/metrics${NC}"
echo ""
echo "5. Rodar testes:"
echo "   ${BLUE}npm test${NC}"
echo ""
