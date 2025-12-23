#!/bin/bash
# ===================================
# 🌐 ELEVARE OPS - MENU PRINCIPAL
# ===================================
# Painel de comando unificado
# Acesso a todas as operações em um só lugar
#
# Uso: ./ops.sh

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ███████╗██╗     ███████╗██╗   ██╗ █████╗ ██████╗     ║
║     ██╔════╝██║     ██╔════╝██║   ██║██╔══██╗██╔══██╗    ║
║     █████╗  ██║     █████╗  ██║   ██║███████║██████╔╝    ║
║     ██╔══╝  ██║     ██╔══╝  ╚██╗ ██╔╝██╔══██║██╔══██╗    ║
║     ███████╗███████╗███████╗ ╚████╔╝ ██║  ██║██║  ██║    ║
║     ╚══════╝╚══════╝╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝    ║
║                                                           ║
║              🌐 PAINEL DE COMANDO — OPS                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Nível CEO. Nível programador sênior. Nível \"ninguém segura a tia do Zap\".${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Menu principal
echo -e "${GREEN}Escolha uma operação:${NC}"
echo ""
echo -e "${CYAN}  1)${NC} 📡 Sincronização GitHub (fetch, pull, install, build, test, push)"
echo -e "${CYAN}  2)${NC} 📝 Criar PR Automático"
echo -e "${CYAN}  3)${NC} 🐳 Deploy Backend via Docker"
echo -e "${CYAN}  4)${NC} 🏥 Health Check Total"
echo -e "${CYAN}  5)${NC} 📱 Teste de Envio WhatsApp"
echo -e "${CYAN}  6)${NC} 🎫 Criar 7 Issues clinicId"
echo -e "${CYAN}  7)${NC} 📊 Monitorar GitHub Actions"
echo -e "${CYAN}  8)${NC} 🚀 Deploy Full Produção"
echo ""
echo -e "${CYAN}  9)${NC} 🔄 Workflow Completo (1+3+4+5)"
echo -e "${CYAN} 10)${NC} 📚 Ver Documentação"
echo -e "${CYAN} 11)${NC} 📋 Ver Checklist Dev"
echo ""
echo -e "${CYAN}  0)${NC} ❌ Sair"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
read -p "Digite sua escolha [0-11]: " choice
echo ""

case $choice in
    1)
        echo -e "${BLUE}📡 Executando Sincronização GitHub...${NC}"
        echo ""
        ./elevare-ops.sh
        ;;
    2)
        echo -e "${BLUE}📝 Criando PR Automático...${NC}"
        echo ""
        ./create-pr.sh
        ;;
    3)
        echo -e "${BLUE}🐳 Executando Deploy Docker...${NC}"
        echo ""
        ./docker-deploy.sh
        ;;
    4)
        echo -e "${BLUE}🏥 Executando Health Check...${NC}"
        echo ""
        ./health-check.sh
        ;;
    5)
        echo -e "${BLUE}📱 Testando WhatsApp...${NC}"
        echo ""
        read -p "Número do telefone (padrão: 5511999999999): " phone
        read -p "Mensagem (Enter para padrão): " message
        if [ -z "$phone" ]; then
            ./whatsapp-test.sh
        elif [ -z "$message" ]; then
            ./whatsapp-test.sh "$phone"
        else
            ./whatsapp-test.sh "$phone" "$message"
        fi
        ;;
    6)
        echo -e "${BLUE}🎫 Criando Issues clinicId...${NC}"
        echo ""
        ./create-clinicid-issues.sh
        ;;
    7)
        echo -e "${BLUE}📊 Monitorando GitHub Actions...${NC}"
        echo ""
        read -p "Modo watch? (s/n): " watch_mode
        if [ "$watch_mode" = "s" ] || [ "$watch_mode" = "S" ]; then
            ./monitor-actions.sh watch
        else
            ./monitor-actions.sh
        fi
        ;;
    8)
        echo -e "${RED}⚠️  ATENÇÃO: DEPLOY DE PRODUÇÃO${NC}"
        echo ""
        read -p "Tem certeza? Esta operação afeta PRODUÇÃO! (sim/não): " confirm
        if [ "$confirm" = "sim" ]; then
            ./deploy-production.sh
        else
            echo "Deploy cancelado."
        fi
        ;;
    9)
        echo -e "${BLUE}🔄 Executando Workflow Completo...${NC}"
        echo ""
        echo -e "${CYAN}[1/4] Sincronização GitHub...${NC}"
        ./elevare-ops.sh
        echo ""
        echo -e "${CYAN}[2/4] Deploy Docker...${NC}"
        ./docker-deploy.sh
        echo ""
        echo -e "${CYAN}[3/4] Health Check...${NC}"
        ./health-check.sh
        echo ""
        echo -e "${CYAN}[4/4] Teste WhatsApp...${NC}"
        ./whatsapp-test.sh
        echo ""
        echo -e "${GREEN}✨ Workflow completo finalizado!${NC}"
        ;;
    10)
        echo -e "${BLUE}📚 Abrindo Documentação...${NC}"
        echo ""
        if [ -f "PAINEL_COMANDO.md" ]; then
            if command -v less &> /dev/null; then
                less PAINEL_COMANDO.md
            else
                cat PAINEL_COMANDO.md
            fi
        else
            echo -e "${RED}❌ Arquivo PAINEL_COMANDO.md não encontrado${NC}"
        fi
        ;;
    11)
        echo -e "${BLUE}📋 Abrindo Checklist Dev...${NC}"
        echo ""
        if [ -f "CHECKLIST_DEV.md" ]; then
            if command -v less &> /dev/null; then
                less CHECKLIST_DEV.md
            else
                cat CHECKLIST_DEV.md
            fi
        else
            echo -e "${RED}❌ Arquivo CHECKLIST_DEV.md não encontrado${NC}"
        fi
        ;;
    0)
        echo -e "${GREEN}👋 Até logo!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opção inválida!${NC}"
        echo ""
        echo "Execute ./ops.sh novamente e escolha uma opção válida."
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Operação concluída!${NC}"
echo ""
echo -e "${BLUE}Execute ${CYAN}./ops.sh${BLUE} novamente para acessar o menu.${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
