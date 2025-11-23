#!/bin/bash
# Script to create GitHub Issues for clinicId filters (Fase 6)
# Creates 7 issues for implementing clinicId filters across different modules

set -e

echo "🎫 Creating GitHub Issues for clinicId Filters"
echo "==============================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Array of modules that need clinicId filters
modules=(
    "Atendimento:Apply clinicId filter in attendance controller and service methods"
    "Agendamentos:Apply clinicId filter in scheduling controller and service methods"
    "Clientes:Apply clinicId filter in clients controller and service methods"
    "Leads:Apply clinicId filter in leads controller and service methods"
    "Pagamentos:Apply clinicId filter in payments controller and service methods"
    "Usuários:Apply clinicId filter in users controller and service methods"
    "Logs:Apply clinicId filter in logs controller and service methods"
)

echo "Creating issues for ${#modules[@]} modules..."
echo ""

issue_count=0

for module_info in "${modules[@]}"; do
    IFS=':' read -r module_name module_desc <<< "$module_info"
    
    echo "📝 Creating issue for: $module_name"
    
    # Create the issue
    gh issue create \
        --title "Filtro clinicId – $module_name" \
        --body "## Objetivo
Implementar filtro de clinicId no controller de $module_name para garantir isolamento de dados entre clínicas.

## Descrição
$module_desc

## Tarefas
- [ ] Adicionar parâmetro clinicId em métodos do controller
- [ ] Validar clinicId em todas as operações de leitura
- [ ] Validar clinicId em todas as operações de escrita
- [ ] Adicionar testes unitários para validação do filtro
- [ ] Atualizar documentação da API

## Critérios de Aceitação
- Todos os endpoints do módulo validam clinicId
- Não é possível acessar dados de outras clínicas
- Testes cobrem cenários de acesso inválido
- Documentação Swagger atualizada

## Labels
multitenancy, security, priority/high" \
        --label "implementation,priority/high"
    
    ((issue_count++))
    echo "✅ Issue $issue_count created: Filtro clinicId – $module_name"
    echo ""
done

echo "🎉 Successfully created $issue_count issues!"
echo ""
echo "View all issues: gh issue list"
echo "View issues with label: gh issue list --label priority/high"
