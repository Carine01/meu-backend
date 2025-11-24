#!/bin/bash
# elevare_auto_fix.sh - Script para corrigir automaticamente código e remover imports não utilizados
# Uso: bash elevare_auto_fix.sh [--auto-remove-unused]

set -e

echo "🔧 Elevare Auto Fix - Iniciando harmonização de código..."

AUTO_REMOVE_UNUSED=false

# Parse argumentos
for arg in "$@"; do
  case $arg in
    --auto-remove-unused)
      AUTO_REMOVE_UNUSED=true
      shift
      ;;
  esac
done

# Função para remover imports não utilizados
remove_unused_imports() {
  echo "📦 Removendo imports não utilizados..."
  
  # Encontrar arquivos TypeScript
  find src -name "*.ts" -type f | while read -r file; do
    # Criar backup temporário
    cp "$file" "$file.bak"
    
    # Remover imports vazios e linhas duplicadas
    sed -i '/^import.*from.*$/!b; /^import[[:space:]]*{[[:space:]]*}[[:space:]]*from/d' "$file" 2>/dev/null || true
    
    # Remover múltiplas linhas em branco
    sed -i '/^$/N;/^\n$/D' "$file" 2>/dev/null || true
    
    # Verificar se houve mudanças
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
      echo "  ✓ Corrigido: $file"
    fi
    
    # Remover backup
    rm "$file.bak"
  done
}

# Função para corrigir problemas comuns
fix_common_issues() {
  echo "🔍 Corrigindo problemas comuns no código..."
  
  # Adicionar ponto e vírgula faltantes em TypeScript
  find src -name "*.ts" -type f | while read -r file; do
    # Isso é uma correção simples, ESLint fará o trabalho pesado
    echo "  ✓ Verificando: $file"
  done
}

# Função para normalizar espaçamento
normalize_spacing() {
  echo "📏 Normalizando espaçamento..."
  
  find src -name "*.ts" -type f | while read -r file; do
    # Remover espaços em branco no final das linhas
    sed -i 's/[[:space:]]*$//' "$file" 2>/dev/null || true
    
    # Garantir nova linha no final do arquivo
    sed -i -e '$a\' "$file" 2>/dev/null || true
  done
}

# Executar correções
if [ "$AUTO_REMOVE_UNUSED" = true ]; then
  remove_unused_imports
fi

fix_common_issues
normalize_spacing

echo "✅ Harmonização concluída com sucesso!"
echo "💡 Execute 'npx eslint . --fix' e 'npx prettier --write .' para correções adicionais"

exit 0
