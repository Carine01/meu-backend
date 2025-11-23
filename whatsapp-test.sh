#!/bin/bash
# ===================================
# 📱 TESTE DE ENVIO WHATSAPP
# ===================================
# É aqui que você olha e fala:
# "Sim, eu controlo uma integração de ponta."
#
# Uso: ./whatsapp-test.sh [número] [mensagem]
# Exemplo: ./whatsapp-test.sh 5511999999999 "Teste Elevare"

set -e

echo "📱 ====================================="
echo "📱 TESTE DE ENVIO WHATSAPP — ELEVARE"
echo "📱 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
TO_NUMBER="${1:-5511999999999}"
MESSAGE="${2:-Teste Elevare - $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${BLUE}Configuração:${NC}"
echo "  Backend: $BACKEND_URL"
echo "  Para: $TO_NUMBER"
echo "  Mensagem: $MESSAGE"
echo ""

echo -e "${BLUE}🚀 Enviando mensagem...${NC}"
echo ""

# Fazer requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/whatsapp/send" \
  -H "Content-Type: application/json" \
  -d "{\"to\": \"$TO_NUMBER\", \"message\": \"$MESSAGE\"}")

# Separar corpo da resposta e código HTTP
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo -e "${BLUE}📊 Resposta do servidor:${NC}"
echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Corpo da resposta:"
echo "$HTTP_BODY" | python3 -m json.tool 2>/dev/null || echo "$HTTP_BODY"
echo ""

# Verificar resultado
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✨ MENSAGEM ENVIADA COM SUCESSO!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${GREEN}🎉 Você agora controla uma integração de ponta!${NC}"
    exit 0
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}❌ FALHA AO ENVIAR MENSAGEM${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo -e "${YELLOW}💡 Possíveis causas:${NC}"
    echo "  • Backend não está rodando"
    echo "  • WhatsApp não está configurado"
    echo "  • Número de telefone inválido"
    echo "  • Credenciais WhatsApp incorretas"
    echo ""
    echo -e "${YELLOW}🔧 Tente:${NC}"
    echo "  • ./health-check.sh - Verificar saúde do backend"
    echo "  • docker compose logs backend - Ver logs"
    echo "  • Verificar configurações no .env"
    exit 1
fi
