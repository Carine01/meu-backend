#!/bin/bash
# elevare_auto_fix.sh - Script para deduplicação e remoção automática de dependências não utilizadas
# Parte da automação Elevare Auto-Agent Full Run

set -e

echo "🔧 Elevare Auto Fix - Iniciando análise de dependências..."

# Criar diretório de relatórios se não existir
mkdir -p .elevare_validation_report

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

log_error() {
    echo "❌ $1"
}

# Verificar se depcheck está instalado
if ! npm list depcheck --depth=0 &>/dev/null; then
    log_info "Instalando depcheck..."
    npm install --save-dev depcheck --legacy-peer-deps
fi

# Executar análise de dependências
log_info "Executando análise com depcheck..."
npx depcheck --json > .elevare_validation_report/depcheck.json 2>/dev/null || {
    log_warning "depcheck encontrou problemas, mas continuando..."
    echo "{}" > .elevare_validation_report/depcheck.json
}

# Verificar se deve remover dependências não utilizadas
AUTO_REMOVE=false
for arg in "$@"; do
    if [ "$arg" == "--auto-remove-unused" ]; then
        AUTO_REMOVE=true
        break
    fi
done

if [ "$AUTO_REMOVE" = true ]; then
    log_info "Modo auto-remove ativado - analisando dependências não utilizadas..."
    
    # Extrair dependências não utilizadas do relatório
    UNUSED_DEPS=$(cat .elevare_validation_report/depcheck.json | grep -o '"dependencies":\[.*\]' | sed 's/"dependencies":\[//' | sed 's/\]//' | sed 's/"//g' | tr ',' '\n' 2>/dev/null || echo "")
    
    if [ -n "$UNUSED_DEPS" ] && [ "$UNUSED_DEPS" != "[]" ]; then
        log_info "Dependências não utilizadas encontradas:"
        echo "$UNUSED_DEPS"
        
        # NOTA: Por segurança, não removemos automaticamente.
        # Apenas registramos no relatório para revisão manual.
        log_warning "Dependências não utilizadas detectadas - revise o relatório em .elevare_validation_report/depcheck.json"
    else
        log_success "Nenhuma dependência não utilizada detectada!"
    fi
fi

# Executar deduplicação de dependências
log_info "Executando deduplicação de dependências..."
npm dedupe --legacy-peer-deps 2>&1 | tee .elevare_validation_report/dedupe.log || {
    log_warning "npm dedupe teve alguns avisos, mas continuando..."
}

log_success "Análise de dependências concluída!"
log_info "Relatório salvo em: .elevare_validation_report/depcheck.json"

exit 0
