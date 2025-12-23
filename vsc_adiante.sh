#!/bin/bash

# VSC ADIANTE SCRIPT
# Script complementar para melhorias adicionais

echo "=== VSC ADIANTE ==="
echo "Executando melhorias adicionais..."

# Remove arquivos temporários e de cache
echo "Limpando arquivos temporários..."
find . -type f -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null || true
find . -type f -name ".DS_Store" -not -path "./node_modules/*" -delete 2>/dev/null || true

# Verifica se existe configuração de ESLint
if [ ! -f ".eslintrc.js" ] && [ ! -f ".eslintrc.json" ] && [ ! -f "eslint.config.js" ]; then
  echo "Aviso: Nenhuma configuração ESLint encontrada"
fi

# Verifica se existe configuração de Prettier
if [ ! -f ".prettierrc" ] && [ ! -f ".prettierrc.json" ] && [ ! -f "prettier.config.js" ]; then
  echo "Aviso: Nenhuma configuração Prettier encontrada"
fi

# Lista módulos que podem precisar de atenção
echo "Verificando estrutura de módulos..."
if [ -d "src/modules" ]; then
  MODULE_COUNT=$(find src/modules -maxdepth 1 -type d | wc -l)
  echo "Encontrados $MODULE_COUNT módulos em src/modules"
fi

# Verifica se há testes
echo "Verificando testes..."
TEST_COUNT=$(find . -name "*.spec.ts" -o -name "*.test.ts" | grep -v node_modules | wc -l)
echo "Encontrados $TEST_COUNT arquivos de teste"

# Verifica arquivos de configuração importantes
echo "Verificando arquivos de configuração..."
for config in "tsconfig.json" "package.json" "nest-cli.json"; do
  if [ -f "$config" ]; then
    echo "  ✓ $config encontrado"
  else
    echo "  ✗ $config não encontrado"
  fi
done

echo "=== FIM VSC ADIANTE ==="
echo "Melhorias adicionais concluídas!"
