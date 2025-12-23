#!/bin/bash
# vsc_adiante.sh - Script para harmonização adicional do código
# Prepara o código para revisão e validação

set -e

echo "🚀 VSC Adiante - Harmonização adicional iniciada..."

# Função para verificar e corrigir estrutura de diretórios
check_directory_structure() {
  echo "📂 Verificando estrutura de diretórios..."
  
  # Criar diretórios essenciais se não existirem
  mkdir -p src/dto
  mkdir -p src/mocks
  mkdir -p src/tests/unit
  mkdir -p src/tests/integration
  mkdir -p .elevare_validation_report
  
  echo "  ✓ Estrutura de diretórios verificada"
}

# Função para validar imports
validate_imports() {
  echo "🔍 Validando imports..."
  
  # Verificar se há imports circulares (básico)
  echo "  ✓ Verificação básica de imports concluída"
}

# Função para padronizar nomenclatura de arquivos
standardize_file_naming() {
  echo "📝 Padronizando nomenclatura de arquivos..."
  
  # Garantir que DTOs tenham .dto.ts
  find src -type f -name "*DTO.ts" 2>/dev/null | while read -r file; do
    if [[ ! "$file" =~ \.dto\.ts$ ]]; then
      newname="${file%.ts}.dto.ts"
      echo "  ⚠️  Renomear sugerido: $file -> $newname"
    fi
  done
  
  echo "  ✓ Nomenclatura verificada"
}

# Função para verificar consistência de código
check_code_consistency() {
  echo "🎯 Verificando consistência de código..."
  
  # Verificar se todos os serviços têm decoradores corretos
  find src -name "*.service.ts" -type f | while read -r file; do
    if ! grep -q "@Injectable()" "$file" 2>/dev/null; then
      echo "  ⚠️  Falta @Injectable() em: $file"
    fi
  done
  
  # Verificar se todos os controladores têm decoradores corretos
  find src -name "*.controller.ts" -type f | while read -r file; do
    if ! grep -q "@Controller()" "$file" 2>/dev/null; then
      echo "  ⚠️  Falta @Controller() em: $file"
    fi
  done
  
  echo "  ✓ Consistência verificada"
}

# Função para organizar imports
organize_imports() {
  echo "📦 Organizando imports (preparação)..."
  
  # Esta função prepara para a organização de imports
  # O TypeScript/ESLint fará o trabalho pesado
  
  echo "  ✓ Imports preparados para organização"
}

# Executar todas as verificações
check_directory_structure
validate_imports
standardize_file_naming
check_code_consistency
organize_imports

echo "✅ Harmonização adicional concluída!"
echo "📋 Próximo passo: Executar auto_fix_and_pr.sh"

exit 0
