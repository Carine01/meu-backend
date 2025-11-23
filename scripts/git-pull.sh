#!/bin/bash
# Script para fazer git pull de forma segura
# Salva alterações locais, faz pull e restaura alterações

set -e

echo "🔄 Iniciando pull seguro do repositório..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar se estamos em um repositório git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Este diretório não é um repositório Git${NC}"
    exit 1
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${CYAN}📍 Branch atual: ${CURRENT_BRANCH}${NC}"

# Verificar se há alterações não commitadas
STASHED=false
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}💾 Salvando alterações locais temporariamente...${NC}"
    git stash push -m "Auto-stash before pull at $(date '+%Y-%m-%d %H:%M:%S')"
    STASHED=true
    echo -e "${GREEN}✓ Alterações salvas${NC}"
fi

# Verificar conexão com remoto
echo -e "${CYAN}🔍 Verificando conexão com remoto...${NC}"
if ! git ls-remote --exit-code origin > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao repositório remoto${NC}"
    if [ "$STASHED" = true ]; then
        echo -e "${YELLOW}🔄 Restaurando alterações locais...${NC}"
        git stash pop
    fi
    exit 1
fi

# Fazer fetch primeiro para ver se há alterações
echo -e "${CYAN}📥 Verificando alterações no remoto...${NC}"
git fetch origin

# Verificar se há alterações remotas
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓ Repositório já está atualizado${NC}"
elif [ "$LOCAL" = "$BASE" ]; then
    echo -e "${CYAN}📥 Baixando alterações remotas...${NC}"
    git pull --rebase origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Pull realizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro durante git pull${NC}"
        if [ "$STASHED" = true ]; then
            echo -e "${YELLOW}🔄 Restaurando alterações locais...${NC}"
            git stash pop
        fi
        exit 1
    fi
elif [ "$REMOTE" = "$BASE" ]; then
    echo -e "${YELLOW}⚠️  Você tem commits locais que não foram enviados ao remoto${NC}"
    echo -e "${CYAN}💡 Use 'git push' para enviar suas alterações${NC}"
else
    echo -e "${YELLOW}⚠️  Branches divergiram. Fazendo pull com rebase...${NC}"
    git pull --rebase origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Pull com rebase realizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Conflitos detectados durante o rebase${NC}"
        echo -e "${YELLOW}📝 Resolva os conflitos e execute:${NC}"
        echo -e "   git rebase --continue"
        echo -e "   ou"
        echo -e "   git rebase --abort (para cancelar)"
        exit 1
    fi
fi

# Restaurar alterações se foram salvas
if [ "$STASHED" = true ]; then
    echo -e "${CYAN}🔄 Restaurando alterações locais...${NC}"
    if git stash pop; then
        echo -e "${GREEN}✓ Alterações restauradas${NC}"
    else
        echo -e "${RED}❌ Conflitos ao restaurar alterações${NC}"
        echo -e "${YELLOW}📝 Resolva os conflitos manualmente${NC}"
        exit 1
    fi
fi

# Verificar se é um projeto Node.js e se package.json foi alterado
if [ -f "package.json" ]; then
    CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null || echo "")
    if echo "$CHANGED_FILES" | grep -q "package.json\|package-lock.json"; then
        echo -e "${CYAN}📦 package.json foi alterado. Instalando dependências...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependências instaladas${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Operação concluída com sucesso!${NC}"
echo ""
echo -e "${CYAN}📊 Próximos passos recomendados:${NC}"
echo "   npm run build    # Compilar o projeto"
echo "   npm test         # Executar testes"
echo ""
