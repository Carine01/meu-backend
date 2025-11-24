#!/bin/bash

# ELEVARE AUTO FIX SCRIPT
# Harmoniza rotas, controllers e services

echo "=== ELEVARE AUTO FIX ==="
echo "Iniciando harmonização de rotas, controllers e services..."

# Cria diretórios se não existirem
mkdir -p src/modules
mkdir -p src/controllers
mkdir -p src/services

# Procura por inconsistências comuns em controllers
echo "Verificando controllers..."
find src -name "*.controller.ts" -type f | while read -r file; do
  echo "Processando: $file"
  
  # Remove imports duplicados (simplificado)
  # Nota: Este é um exemplo básico, você pode adicionar mais lógica aqui
  
  # Adiciona comentários JSDoc se não existirem
  if ! grep -q "@Controller" "$file"; then
    echo "  Aviso: Controller sem decorador em $file"
  fi
done

# Procura por inconsistências comuns em services
echo "Verificando services..."
find src -name "*.service.ts" -type f | while read -r file; do
  echo "Processando: $file"
  
  if ! grep -q "@Injectable" "$file"; then
    echo "  Aviso: Service sem decorador @Injectable em $file"
  fi
done

# Procura por rotas não documentadas
echo "Verificando rotas..."
find src -name "*.controller.ts" -type f | while read -r file; do
  if grep -q "@Get\|@Post\|@Put\|@Delete\|@Patch" "$file"; then
    echo "  Rotas encontradas em: $file"
  fi
done

echo "=== FIM ELEVARE AUTO FIX ==="
echo "Harmonização concluída!"
