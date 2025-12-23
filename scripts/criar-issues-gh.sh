#!/bin/bash
# Script Bash para criar milestone + 7 issues automaticamente
# Uso: ./criar-issues-gh.sh <DevUsername>

set -e

if [ -z "$1" ]; then
    echo "❌ Erro: Username obrigatório"
    echo "Uso: ./criar-issues-gh.sh <DevUsername>"
    exit 1
fi

DEV_USERNAME="$1"

echo "🚀 Criando Milestone + 7 Issues para MVP - 100%"
echo ""

# 1. Criar Milestone
echo "📅 Criando milestone..."
DUE_DATE=$(date -d '+3 days' +%F 2>/dev/null || date -v+3d +%F)
MILESTONE_JSON=$(gh api repos/Carine01/meu-backend/milestones \
    -f title="MVP - 100%" \
    -f due_on="$DUE_DATE" \
    -f description="Meta: completar MVP em ~3 dias (26h estimadas)")

MILESTONE_NUMBER=$(echo "$MILESTONE_JSON" | jq -r '.number')
echo "✅ Milestone criada: #$MILESTONE_NUMBER"
echo ""

# Array de issues
declare -a ISSUES=(
    "Impl: clinicId filter - mensagens.service|**Contexto:**
Adicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.

**Tarefas:**
- [ ] Adicionar where clinicId nas queries (2h)
- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)

**Estimativa:** 3h
**Arquivo:** \`src/services/mensagens.service.ts\`|implementation,priority/high|3h"
    
    "Impl: clinicId filter - campanhas.service|**Contexto:**
Adicionar clinicId filter em campanhas.service.

**Tarefas:**
- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** \`src/services/campanhas.service.ts\`|implementation,priority/high|2.5h"
    
    "Impl: clinicId filter - eventos.service|**Contexto:**
Eventos: filtrar por clinicId.

**Tarefas:**
- [ ] Add clinicId to DTOs & validators (0.5h)
- [ ] Add where clause in eventos.service (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivos:** \`src/services/eventos.service.ts\`, \`src/dto/create-evento.dto.ts\`|implementation,priority/high|2.5h"
    
    "Impl: clinicId scoping - auth.service|**Contexto:**
JWT e auth devem carregar/validar clinicId.

**Tarefas:**
- [ ] Incluir clinicId no payload do JWT (1h)
- [ ] Ajustar guards para validar clinicId (1h)
- [ ] Unit tests login (1h)

**Estimativa:** 3h
**Arquivos:** \`src/services/auth.service.ts\`, \`src/guards/jwt-auth.guard.ts\`|implementation,priority/high,security|3h"
    
    "Impl: clinicId isolation - bi.service|**Contexto:**
BI: queries isoladas por clinicId.

**Tarefas:**
- [ ] Parametrizar queries por clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** \`src/services/bi.service.ts\`|implementation,priority/high|2.5h"
    
    "Impl: clinicId enforcement - bloqueios.service|**Contexto:**
Bloqueios aplicados por clinicId.

**Tarefas:**
- [ ] Adicionar clinicId nas regras de criação/consulta (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2h
**Arquivo:** \`src/services/bloqueios.service.ts\`|implementation,priority/high|2h"
    
    "Impl: clinicId filter - payments/orders|**Contexto:**
Transações e pedidos sempre ligados ao clinicId.

**Tarefas:**
- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)
- [ ] Atualizar webhooks para validar clinicId (1h)
- [ ] Unit tests (1h)

**Estimativa:** 3.5h
**Arquivos:** \`src/services/payments.service.ts\`, \`src/services/orders.service.ts\`|implementation,priority/high|3.5h"
)

# Criar issues
ISSUE_NUM=1
for issue_data in "${ISSUES[@]}"; do
    IFS='|' read -r title body labels estimate <<< "$issue_data"
    
    echo "📝 Criando issue $ISSUE_NUM/7: $title"
    
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --assignee "$DEV_USERNAME" \
        --milestone "$MILESTONE_NUMBER"
    
    echo "   ✅ Issue criada - Estimativa: $estimate"
    ((ISSUE_NUM++))
done

echo ""
echo "🎉 CONCLUÍDO!"
echo ""
echo "📊 Resumo:"
echo "   • Milestone: MVP - 100% (#$MILESTONE_NUMBER)"
echo "   • Issues criadas: 7"
echo "   • Assignee: $DEV_USERNAME"
echo "   • Estimativa total: 19h"
echo ""
echo "🔗 Ver no GitHub:"
echo "   https://github.com/Carine01/meu-backend/milestone/$MILESTONE_NUMBER"
echo ""
