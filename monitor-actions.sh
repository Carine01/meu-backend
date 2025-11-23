#!/bin/bash
# ===================================
# 📊 MONITORAR GITHUB ACTIONS
# ===================================
# Se você quiser ver a máquina trabalhando enquanto toma café
#
# Uso: ./monitor-actions.sh [watch]
# Adicione 'watch' para monitoramento em tempo real

set -e

echo "📊 ====================================="
echo "📊 MONITORAR GITHUB ACTIONS — ELEVARE"
echo "📊 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado!"
    echo "Instale com: brew install gh (macOS) ou https://cli.github.com/"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI não está autenticado!"
    echo "Execute: gh auth login"
    exit 1
fi

# Modo watch ou lista única
MODE="${1:-list}"

if [ "$MODE" = "watch" ]; then
    echo -e "${BLUE}👀 Modo Watch ativado - Monitoramento em tempo real${NC}"
    echo -e "${YELLOW}   Pressione Ctrl+C para sair${NC}"
    echo ""
    
    # Obter ID do último run
    LATEST_RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
    
    if [ -z "$LATEST_RUN_ID" ]; then
        echo -e "${RED}❌ Nenhum workflow encontrado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📡 Monitorando workflow run #$LATEST_RUN_ID${NC}"
    echo ""
    
    gh run watch "$LATEST_RUN_ID"
else
    echo -e "${BLUE}📋 Listando workflows recentes...${NC}"
    echo ""
    
    gh run list --limit 10
    
    echo ""
    echo "============================================"
    echo -e "${BLUE}💡 Comandos úteis:${NC}"
    echo ""
    echo "  ./monitor-actions.sh watch"
    echo "    → Monitorar último workflow em tempo real"
    echo ""
    echo "  gh run list --limit 20"
    echo "    → Listar últimos 20 workflows"
    echo ""
    echo "  gh run view [RUN_ID]"
    echo "    → Ver detalhes de um workflow específico"
    echo ""
    echo "  gh run view [RUN_ID] --log"
    echo "    → Ver logs de um workflow"
    echo ""
    echo "  gh run rerun [RUN_ID]"
    echo "    → Re-executar um workflow"
    echo ""
    echo "  gh run cancel [RUN_ID]"
    echo "    → Cancelar um workflow em execução"
    echo "============================================"
    echo ""
    
    # Mostrar status resumido
    echo -e "${BLUE}📊 Status resumido:${NC}"
    echo ""
    
    COMPLETED=$(gh run list --json status --jq '[.[] | select(.status=="completed")] | length')
    IN_PROGRESS=$(gh run list --json status --jq '[.[] | select(.status=="in_progress")] | length')
    QUEUED=$(gh run list --json status --jq '[.[] | select(.status=="queued")] | length')
    
    echo -e "  ${GREEN}Completos:${NC} $COMPLETED"
    echo -e "  ${YELLOW}Em progresso:${NC} $IN_PROGRESS"
    echo -e "  ${BLUE}Na fila:${NC} $QUEUED"
    echo ""
fi
