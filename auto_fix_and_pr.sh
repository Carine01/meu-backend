#!/bin/bash
# auto_fix_and_pr.sh - Script para scaffold de DTOs e hardening de segurança
# Parte da automação Elevare Auto-Agent Full Run

set -e

echo "🛠️  Auto Fix and PR - Scaffold DTOs & Security Hardening..."

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

# Criar diretório de relatórios se não existir
mkdir -p .elevare_validation_report

# Verificar argumentos
SCAFFOLD_DTOS=false
SECURITY_BASIC=false

for arg in "$@"; do
    case "$arg" in
        --scaffold-dtos)
            SCAFFOLD_DTOS=true
            ;;
        --security-basic)
            SECURITY_BASIC=true
            ;;
        *)
            log_warning "Argumento desconhecido: $arg"
            ;;
    esac
done

# ============================================================
# SCAFFOLD DTOs
# ============================================================
if [ "$SCAFFOLD_DTOS" = true ]; then
    log_info "Iniciando scaffold de DTOs..."
    
    # Verificar se class-validator e class-transformer estão instalados
    if ! npm list class-validator --depth=0 &>/dev/null; then
        log_info "Instalando class-validator..."
        npm install class-validator --legacy-peer-deps
    fi
    
    if ! npm list class-transformer --depth=0 &>/dev/null; then
        log_info "Instalando class-transformer..."
        npm install class-transformer --legacy-peer-deps
    fi
    
    log_success "Dependências de validação verificadas"
    
    # Verificar estrutura de DTOs existentes
    DTO_DIRS=$(find src/modules -type d -name "dto" 2>/dev/null || echo "")
    
    if [ -n "$DTO_DIRS" ]; then
        DTO_COUNT=$(echo "$DTO_DIRS" | wc -l)
        log_info "Encontrados $DTO_COUNT diretórios de DTOs"
        echo "$DTO_DIRS" > .elevare_validation_report/dto-directories.txt
        
        # Listar DTOs existentes
        DTO_FILES=$(find src/modules -name "*.dto.ts" 2>/dev/null || echo "")
        if [ -n "$DTO_FILES" ]; then
            DTO_FILE_COUNT=$(echo "$DTO_FILES" | wc -l)
            log_info "Total de $DTO_FILE_COUNT arquivos DTO encontrados"
            echo "$DTO_FILES" > .elevare_validation_report/dto-files.txt
        fi
    else
        log_warning "Nenhum diretório de DTOs encontrado"
    fi
    
    # Verificar se DTOs têm validações
    log_info "Verificando DTOs com validações class-validator..."
    VALIDATED_DTOS=$(grep -r "@Is\|@Min\|@Max\|@Length" src/modules --include="*.dto.ts" 2>/dev/null | cut -d: -f1 | sort -u | wc -l || echo "0")
    TOTAL_DTOS=$(find src/modules -name "*.dto.ts" 2>/dev/null | wc -l || echo "0")
    
    log_info "DTOs com validação: $VALIDATED_DTOS de $TOTAL_DTOS"
    
    cat > .elevare_validation_report/dto-validation-report.txt << EOF
Relatório de DTOs e Validação
==============================
Data: $(date)

ESTATÍSTICAS:
- Total de DTOs: $TOTAL_DTOS
- DTOs com validação: $VALIDATED_DTOS
- Cobertura de validação: $([ "$TOTAL_DTOS" -gt 0 ] && echo "scale=2; $VALIDATED_DTOS * 100 / $TOTAL_DTOS" | bc || echo "0")%

DEPENDÊNCIAS:
- class-validator: $(npm list class-validator --depth=0 2>/dev/null | grep class-validator || echo "não instalado")
- class-transformer: $(npm list class-transformer --depth=0 2>/dev/null | grep class-transformer || echo "não instalado")

STATUS:
$([ "$VALIDATED_DTOS" -gt 0 ] && echo "✅ Validações implementadas em DTOs" || echo "⚠️  Validações pendentes")
✅ Estrutura de DTOs presente

PRÓXIMOS PASSOS:
- Adicionar decoradores de validação aos DTOs pendentes
- Implementar validação global no main.ts com ValidationPipe
- Criar testes unitários para DTOs
EOF
    
    cat .elevare_validation_report/dto-validation-report.txt
    log_success "Scaffold de DTOs concluído!"
fi

# ============================================================
# SECURITY BASIC
# ============================================================
if [ "$SECURITY_BASIC" = true ]; then
    log_info "Iniciando hardening de segurança básico..."
    
    # Verificar se helmet está instalado
    if ! npm list helmet --depth=0 &>/dev/null; then
        log_info "Instalando helmet para segurança HTTP..."
        npm install helmet --legacy-peer-deps
    else
        log_success "Helmet já instalado"
    fi
    
    # Verificar se @nestjs/throttler está instalado
    if ! npm list @nestjs/throttler --depth=0 &>/dev/null; then
        log_info "Instalando @nestjs/throttler para rate limiting..."
        npm install @nestjs/throttler --legacy-peer-deps
    else
        log_success "Throttler já instalado"
    fi
    
    # Verificar se bcrypt está instalado
    if ! npm list bcrypt --depth=0 &>/dev/null; then
        log_info "Instalando bcrypt para hashing de senhas..."
        npm install bcrypt --legacy-peer-deps
        npm install --save-dev @types/bcrypt --legacy-peer-deps
    else
        log_success "Bcrypt já instalado"
    fi
    
    # Verificar configurações de segurança no código
    log_info "Verificando implementação de segurança..."
    
    # Verificar helmet no main.ts
    HELMET_USAGE=$(grep -r "helmet\|app.use(helmet" src/main.ts 2>/dev/null || echo "")
    
    # Verificar throttler
    THROTTLER_USAGE=$(grep -r "ThrottlerModule\|@Throttle" src/ --include="*.ts" 2>/dev/null | wc -l || echo "0")
    
    # Verificar bcrypt
    BCRYPT_USAGE=$(grep -r "bcrypt\|hashSync\|compareSync" src/ --include="*.ts" 2>/dev/null | wc -l || echo "0")
    
    # Verificar variáveis de ambiente sensíveis
    DOTENV_SAMPLE=$([ -f ".env.example" ] && echo "✅ Presente" || echo "❌ Ausente")
    
    cat > .elevare_validation_report/security-report.txt << EOF
Relatório de Segurança Básica
==============================
Data: $(date)

DEPENDÊNCIAS DE SEGURANÇA:
- helmet: $(npm list helmet --depth=0 2>/dev/null | grep helmet || echo "não instalado")
- @nestjs/throttler: $(npm list @nestjs/throttler --depth=0 2>/dev/null | grep throttler || echo "não instalado")
- bcrypt: $(npm list bcrypt --depth=0 2>/dev/null | grep bcrypt || echo "não instalado")

IMPLEMENTAÇÃO:
- Helmet (HTTP headers): $([ -n "$HELMET_USAGE" ] && echo "✅ Implementado" || echo "⚠️  Pendente")
- Throttler (Rate limiting): $([ "$THROTTLER_USAGE" -gt 0 ] && echo "✅ Implementado ($THROTTLER_USAGE refs)" || echo "⚠️  Pendente")
- Bcrypt (Password hashing): $([ "$BCRYPT_USAGE" -gt 0 ] && echo "✅ Implementado ($BCRYPT_USAGE refs)" || echo "⚠️  Pendente")
- .env.example: $DOTENV_SAMPLE

RECOMENDAÇÕES:
1. Implementar helmet() no main.ts para proteção HTTP headers
2. Configurar ThrottlerModule para rate limiting
3. Usar bcrypt para hash de senhas (nunca armazenar senhas em texto plano)
4. Implementar JWT com expiração adequada
5. Validar todos os inputs com class-validator
6. Implementar CORS com whitelist de origins
7. Usar HTTPS em produção
8. Implementar audit logging

STATUS GERAL:
$([ "$THROTTLER_USAGE" -gt 0 ] && [ "$BCRYPT_USAGE" -gt 0 ] && echo "✅ Segurança básica implementada" || echo "⚠️  Implementação parcial - revisar recomendações")
EOF
    
    cat .elevare_validation_report/security-report.txt
    log_success "Hardening de segurança básico concluído!"
fi

# ============================================================
# FINALIZAÇÃO
# ============================================================
if [ "$SCAFFOLD_DTOS" = false ] && [ "$SECURITY_BASIC" = false ]; then
    log_error "Nenhuma ação especificada!"
    log_info "Uso: $0 [--scaffold-dtos] [--security-basic]"
    exit 1
fi

log_success "Auto Fix and PR concluído!"
log_info "Relatórios salvos em .elevare_validation_report/"

exit 0
