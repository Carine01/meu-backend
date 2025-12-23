#!/bin/bash
# ===================================
# 🏥 HEALTH CHECK TOTAL
# ===================================
# Verifica se a IARA acordou
# Testa todos os endpoints de saúde
#
# Uso: ./health-check.sh

set +e  # Não parar em erros para mostrar todos os resultados

echo "🏥 ====================================="
echo "🏥 HEALTH CHECK TOTAL — ELEVARE"
echo "🏥 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
TIMEOUT=5

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -e "${BLUE}🔍 Testando: $name${NC}"
    echo -e "   URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}   ✓ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}   ✗ FALHOU (HTTP $response)${NC}"
        return 1
    fi
}

# Contador de sucessos
SUCCESS=0
TOTAL=0

echo "Testando endpoints..."
echo ""

# 1. Health principal
TOTAL=$((TOTAL + 1))
if test_endpoint "Health Principal" "$BACKEND_URL/health"; then
    SUCCESS=$((SUCCESS + 1))
fi
echo ""

# 2. WhatsApp Health
TOTAL=$((TOTAL + 1))
if test_endpoint "WhatsApp Health" "$BACKEND_URL/whatsapp/health"; then
    SUCCESS=$((SUCCESS + 1))
fi
echo ""

# 3. API Root
TOTAL=$((TOTAL + 1))
if test_endpoint "API Root" "$BACKEND_URL/"; then
    SUCCESS=$((SUCCESS + 1))
fi
echo ""

# 4. Leads endpoint (deve retornar 401 sem auth, mas significa que está funcionando)
TOTAL=$((TOTAL + 1))
if test_endpoint "Leads Endpoint" "$BACKEND_URL/leads" "401"; then
    SUCCESS=$((SUCCESS + 1))
fi
echo ""

# Resultado final
echo "============================================"
if [ $SUCCESS -eq $TOTAL ]; then
    echo -e "${GREEN}✨ TODOS OS TESTES PASSARAM! ($SUCCESS/$TOTAL)${NC}"
    echo -e "${GREEN}🎉 IARA está acordada e funcionando!${NC}"
else
    echo -e "${YELLOW}⚠️  ALGUNS TESTES FALHARAM ($SUCCESS/$TOTAL)${NC}"
    if [ $SUCCESS -eq 0 ]; then
        echo -e "${RED}❌ Nenhum serviço está respondendo!${NC}"
        echo -e "${YELLOW}💡 Dicas:${NC}"
        echo "   • Verifique se o backend está rodando: docker compose ps"
        echo "   • Veja os logs: docker compose logs backend"
        echo "   • Tente reiniciar: ./docker-deploy.sh"
    else
        echo -e "${YELLOW}💡 Alguns serviços podem estar inicializando...${NC}"
        echo "   Aguarde alguns segundos e tente novamente."
    fi
fi
echo "============================================"
echo ""

# Mostrar logs recentes do backend se houver falhas
if [ $SUCCESS -lt $TOTAL ]; then
    echo -e "${BLUE}📋 Últimas 10 linhas do log do backend:${NC}"
    docker compose logs --tail=10 backend 2>/dev/null || {
        echo "Não foi possível acessar os logs (backend não está rodando no Docker?)"
    }
fi

exit $((TOTAL - SUCCESS))
