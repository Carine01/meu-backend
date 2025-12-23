#!/bin/bash
# ===================================
# 🎫 CRIAR 7 ISSUES CLINICID
# ===================================
# Cria automaticamente as 7 issues do filtro clinicId
# Escopo mapeado. Nada esquecido.
#
# Uso: ./create-clinicid-issues.sh

set -e

echo "🎫 ====================================="
echo "🎫 CRIAR 7 ISSUES CLINICID — ELEVARE"
echo "🎫 ====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo -e "${BLUE}📝 Criando 7 issues para filtros clinicId...${NC}"
echo ""

# Array com as issues
declare -a ISSUES=(
    "Filtro clinicId #1: Mensagens Service|Implementar validação e filtragem por clinicId no serviço de mensagens.\n\n**Tarefas:**\n- [ ] Adicionar where clause clinicId\n- [ ] Criar testes unitários\n- [ ] Criar testes E2E\n\n**Estimativa:** 4h"
    
    "Filtro clinicId #2: Campanhas Service|Implementar filtro clinicId no serviço de campanhas.\n\n**Tarefas:**\n- [ ] Adicionar filtro TypeORM where clinicId\n- [ ] Criar testes unitários\n- [ ] Validar scheduler\n\n**Estimativa:** 3.5h"
    
    "Filtro clinicId #3: Leads Controller|Adicionar filtro clinicId no controller de leads.\n\n**Tarefas:**\n- [ ] Implementar query parameter clinicId\n- [ ] Validar entrada com class-validator\n- [ ] Criar testes E2E\n\n**Estimativa:** 3h"
    
    "Filtro clinicId #4: Profile Service|Implementar segregação por clinicId no serviço de perfis.\n\n**Tarefas:**\n- [ ] Adicionar filtro em queries\n- [ ] Atualizar métodos CRUD\n- [ ] Criar testes unitários\n\n**Estimativa:** 3h"
    
    "Filtro clinicId #5: Indicações Service|Adicionar filtro clinicId no serviço de indicações.\n\n**Tarefas:**\n- [ ] Implementar filtro nas queries\n- [ ] Validar cálculo de recompensas por clínica\n- [ ] Criar testes unitários e E2E\n\n**Estimativa:** 4h"
    
    "Filtro clinicId #6: WhatsApp Integration|Segregar envios de WhatsApp por clinicId.\n\n**Tarefas:**\n- [ ] Adicionar validação clinicId\n- [ ] Configurar instâncias por clínica\n- [ ] Criar testes de integração\n\n**Estimativa:** 4.5h"
    
    "Filtro clinicId #7: Relatórios e Analytics|Implementar filtros clinicId em todos os relatórios.\n\n**Tarefas:**\n- [ ] Adicionar filtro em queries de relatório\n- [ ] Atualizar dashboards\n- [ ] Criar testes de validação\n\n**Estimativa:** 3.5h"
)

# Criar issues
SUCCESS=0
for i in "${!ISSUES[@]}"; do
    IFS='|' read -r title body <<< "${ISSUES[$i]}"
    
    echo -e "${BLUE}Criando issue $((i+1))/7: $title${NC}"
    
    if gh issue create \
        --title "$title" \
        --body "$body" \
        --label "clinicId,implementation,priority:high" 2>/dev/null; then
        echo -e "${GREEN}✓ Issue $((i+1)) criada com sucesso${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${YELLOW}⚠️  Falha ao criar issue $((i+1))${NC}"
    fi
    echo ""
    
    # Pequena pausa para não sobrecarregar a API
    sleep 1
done

echo "============================================"
if [ $SUCCESS -eq 7 ]; then
    echo -e "${GREEN}✨ TODAS AS 7 ISSUES CRIADAS COM SUCESSO!${NC}"
else
    echo -e "${YELLOW}⚠️  $SUCCESS/7 issues criadas${NC}"
fi
echo "============================================"
echo ""

echo -e "${BLUE}📊 Para ver as issues criadas:${NC}"
echo "   gh issue list --label clinicId"
echo ""
echo -e "${BLUE}🌐 Ou acesse:${NC}"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues"
echo ""
