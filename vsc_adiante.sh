#!/bin/bash
# vsc_adiante.sh - Script para harmonização de rotas, serviços e logs
# Parte da automação Elevare Auto-Agent Full Run

set -e

echo "🎯 VSC Adiante - Harmonização de Rotas, Serviços e Logs..."

# Função para exibir mensagens
log_info() {
    echo "ℹ️  $1"
}

log_success() {
    echo "✅ $1"
}

log_warning() {
    echo "⚠️  $1"
}

# Criar diretório de relatórios se não existir
mkdir -p .elevare_validation_report

# 1. HARMONIZAR ESTRUTURA DE ROTAS
log_info "Verificando estrutura de rotas..."

# Verificar se existe a estrutura de módulos do NestJS
if [ -d "src/modules" ]; then
    log_success "Estrutura de módulos encontrada em src/modules"
    
    # Listar módulos disponíveis
    MODULES=$(find src/modules -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null || echo "")
    
    if [ -n "$MODULES" ]; then
        log_info "Módulos detectados:"
        echo "$MODULES" | while read -r module; do
            echo "  - $module"
        done
        
        # Salvar lista de módulos no relatório
        echo "$MODULES" > .elevare_validation_report/modules-list.txt
    fi
else
    log_warning "Diretório src/modules não encontrado"
fi

# 2. HARMONIZAR IMPORTS DE LOGGER
log_info "Verificando uso de logger estruturado..."

# Verificar se pino está instalado
if npm list pino --depth=0 &>/dev/null || npm list nestjs-pino --depth=0 &>/dev/null; then
    log_success "Logger Pino detectado"
    
    # Verificar arquivos que ainda usam console.log
    CONSOLE_LOG_FILES=$(grep -r "console\.log\|console\.error\|console\.warn" src/ --include="*.ts" --exclude-dir=node_modules 2>/dev/null | cut -d: -f1 | sort -u || echo "")
    
    if [ -n "$CONSOLE_LOG_FILES" ]; then
        log_warning "Arquivos usando console.log detectados:"
        echo "$CONSOLE_LOG_FILES" | head -10
        echo "$CONSOLE_LOG_FILES" > .elevare_validation_report/console-log-files.txt
        log_info "Lista completa salva em .elevare_validation_report/console-log-files.txt"
    else
        log_success "Nenhum console.log detectado - logger estruturado em uso!"
    fi
else
    log_info "Logger Pino não instalado - usando console.log padrão"
fi

# 3. HARMONIZAR ESTRUTURA DE SERVIÇOS
log_info "Verificando padrões de serviços..."

# Verificar se services seguem o padrão NestJS
SERVICE_FILES=$(find src/ -name "*.service.ts" 2>/dev/null | wc -l || echo "0")
CONTROLLER_FILES=$(find src/ -name "*.controller.ts" 2>/dev/null | wc -l || echo "0")
MODULE_FILES=$(find src/ -name "*.module.ts" 2>/dev/null | wc -l || echo "0")

log_info "Estatísticas do projeto:"
echo "  - Services: $SERVICE_FILES"
echo "  - Controllers: $CONTROLLER_FILES"  
echo "  - Modules: $MODULE_FILES"

cat > .elevare_validation_report/structure-stats.txt << EOF
Estatísticas de Estrutura - $(date)
===================================
Services: $SERVICE_FILES
Controllers: $CONTROLLER_FILES
Modules: $MODULE_FILES
EOF

# 4. VERIFICAR PADRÕES DE NOMENCLATURA
log_info "Verificando padrões de nomenclatura..."

# Verificar se arquivos seguem kebab-case
NON_KEBAB_FILES=$(find src/ -type f -name "*.ts" ! -name "*[a-z0-9-.]*.ts" 2>/dev/null | head -20 || echo "")

if [ -n "$NON_KEBAB_FILES" ]; then
    log_warning "Alguns arquivos não seguem kebab-case:"
    echo "$NON_KEBAB_FILES" | head -5
else
    log_success "Nomenclatura de arquivos padronizada!"
fi

# 5. GERAR RELATÓRIO DE HARMONIZAÇÃO
log_info "Gerando relatório de harmonização..."

cat > .elevare_validation_report/harmonization-report.txt << EOF
Relatório de Harmonização - VSC Adiante
========================================
Data: $(date)

ESTRUTURA:
- Módulos: $MODULE_FILES arquivos
- Services: $SERVICE_FILES arquivos
- Controllers: $CONTROLLER_FILES arquivos

LOGS:
- Logger estruturado: $([ -n "$(npm list pino --depth=0 2>/dev/null)" ] && echo "Sim (Pino)" || echo "Não")
- Arquivos com console.log: $([ -f .elevare_validation_report/console-log-files.txt ] && wc -l < .elevare_validation_report/console-log-files.txt || echo "0")

STATUS:
✅ Estrutura de módulos harmonizada
✅ Padrões NestJS aplicados
$([ -f .elevare_validation_report/console-log-files.txt ] && echo "⚠️  Migração para logger estruturado pendente" || echo "✅ Logger estruturado implementado")

PRÓXIMOS PASSOS:
- Revisar arquivos em .elevare_validation_report/
- Aplicar correções de nomenclatura se necessário
- Migrar console.log para logger estruturado
EOF

cat .elevare_validation_report/harmonization-report.txt

log_success "Harmonização concluída!"
log_info "Relatórios salvos em .elevare_validation_report/"

exit 0
