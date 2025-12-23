#!/bin/bash
# setup-github-issues.sh
# Script para criar labels, milestone e issues automaticamente

set -e

echo "🚀 Setup GitHub Issues - Backend Elevare"
echo ""

# Variáveis (CONFIGURE AQUI)
DEV_USERNAME="Carine01"  # ⚠️ ALTERE para seu GitHub username
MILESTONE_DAYS=3

echo "📋 Configuração:"
echo "   Dev: $DEV_USERNAME"
echo "   Milestone: $MILESTONE_DAYS dias"
echo ""

# 1. Criar Labels
echo "1️⃣ Criando labels..."
gh label create "implementation" --color B60205 --description "Tarefas de implementação" || echo "  ⚠️ Label 'implementation' já existe"
gh label create "priority/high" --color FF0000 --description "Alta prioridade" || echo "  ⚠️ Label 'priority/high' já existe"
gh label create "ci" --color 0E8A16 --description "Related to CI/CD" || echo "  ⚠️ Label 'ci' já existe"
gh label create "security" --color F9D0C4 --description "Security issues" || echo "  ⚠️ Label 'security' já existe"
gh label create "doc" --color 1E90FF --description "Documentação" || echo "  ⚠️ Label 'doc' já existe"
echo "✅ Labels criadas"
echo ""

# 2. Criar Milestone
echo "2️⃣ Criando milestone..."
DUE_DATE=$(date -d "+${MILESTONE_DAYS} days" +%F)
MILESTONE_OUTPUT=$(gh milestone create "MVP - 100%" --due-date "$DUE_DATE" --description "Meta: completar MVP em ~3 dias (26h)" 2>&1)
MILESTONE_NUMBER=$(echo "$MILESTONE_OUTPUT" | grep -oP '\d+' | head -1)

if [ -z "$MILESTONE_NUMBER" ]; then
    echo "⚠️ Não foi possível criar milestone (pode já existir)"
    echo "   Listando milestones existentes:"
    gh milestone list
    read -p "   Digite o número do milestone a usar: " MILESTONE_NUMBER
else
    echo "✅ Milestone criado: #$MILESTONE_NUMBER"
fi
echo ""

# 3. Criar Issues
echo "3️⃣ Criando 7 issues..."

# Issue 1: mensagens.service
gh issue create --title "Impl: clinicId filter - mensagens.service" \
  --body $'Contexto:\nAdicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.\n\nTarefas:\n- [ ] Adicionar guard/where clause para clinicId nas queries (2h)\n- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)\n- [ ] E2E quick-check (mock WhatsApp) (1h)\n\nEstimativa: 4h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #1 criada: mensagens.service"

# Issue 2: campanhas.service
gh issue create --title "Impl: clinicId filter - campanhas.service" \
  --body $'Contexto:\nAdicionar clinicId filter em campanhas.service para evitar vazamento de dados entre clínicas.\n\nTarefas:\n- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)\n- [ ] Unit tests (1h)\n- [ ] Validar integração com scheduler/campanhas (1h)\n\nEstimativa: 3.5h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #2 criada: campanhas.service"

# Issue 3: eventos.service
gh issue create --title "Impl: clinicId filter - eventos.service" \
  --body $'Contexto:\nEventos devem ser sempre filtrados por clinicId.\n\nTarefas:\n- [ ] Add clinicId to DTOs & validators (0.5h)\n- [ ] Add where clause in eventos.service (1h)\n- [ ] Unit tests + mock repository (1h)\n\nEstimativa: 2.5h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #3 criada: eventos.service"

# Issue 4: auth.service
gh issue create --title "Impl: clinicId scoping - auth.service" \
  --body $'Contexto:\nAs credenciais/refresh tokens devem estar associadas ao clinicId; login deve validar escopo.\n\nTarefas:\n- [ ] Adicionar clinicId ao payload do JWT e validar (1h)\n- [ ] Ajustar guards/policies para checar clinicId (1h)\n- [ ] Unit tests para fluxo de login (1h)\n\nEstimativa: 3h\nLabels: implementation, priority/high, security\n' \
  --label "implementation","priority/high","security" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #4 criada: auth.service (security)"

# Issue 5: bi.service
gh issue create --title "Impl: clinicId isolation - bi.service (reports/metrics)" \
  --body $'Contexto:\nBI deve agregar métricas por clinicId; queries precisam receber filtro explícito.\n\nTarefas:\n- [ ] Parametrizar queries por clinicId (1.5h)\n- [ ] Adicionar unit tests que confirmem isolamento (1h)\n- [ ] Smoke tests em staging (0.5h)\n\nEstimativa: 3h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #5 criada: bi.service"

# Issue 6: bloqueios.service
gh issue create --title "Impl: clinicId enforcement - bloqueios.service" \
  --body $'Contexto:\nBloqueios devem ser aplicados por clinicId; evitar aplicação global indevida.\n\nTarefas:\n- [ ] Adicionar clinicId nas regras de criação/consulta (1h)\n- [ ] Unit tests (1h)\n\nEstimativa: 2h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #6 criada: bloqueios.service"

# Issue 7: payments/orders
gh issue create --title "Impl: clinicId filter - pagamentos/pedidos (payments/orders service)" \
  --body $'Contexto:\nGarantir que transações e pedidos estejam sempre ligadas ao clinicId e que gateway não cruze dados.\n\nTarefas:\n- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)\n- [ ] Atualizar webhooks para validar clinicId (1h)\n- [ ] Unit tests + integration smoke (1.5h)\n\nEstimativa: 4h\nLabels: implementation, priority/high\n' \
  --label "implementation","priority/high" --assignee "$DEV_USERNAME" --milestone "$MILESTONE_NUMBER"
echo "  ✅ Issue #7 criada: payments/orders"

echo ""
echo "✅ Setup completo!"
echo ""
echo "📊 Resumo:"
echo "   - 5 labels criadas"
echo "   - 1 milestone criado (#$MILESTONE_NUMBER)"
echo "   - 7 issues criadas"
echo ""
echo "🔍 Ver issues:"
echo "   gh issue list --milestone \"MVP - 100%\""
echo ""
