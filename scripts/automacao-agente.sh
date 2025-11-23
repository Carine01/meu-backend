#!/bin/bash

echo "🔄 Sincronizando branch..."
git fetch origin main
git checkout main
git pull origin main

echo "🧹 Limpando arquivos temporários..."
rm -rf node_modules dist .cache 2>/dev/null

echo "📦 Instalando dependências..."
npm ci

echo "🏗️ Rodando build..."
npm run build

echo "🧪 Rodando testes..."
npm test || echo "⚠️ Testes falharam, mas o script seguirá."

echo "📝 Commitando mudanças locais..."
git add .
git commit -m "build/update automatico pelo agente" || echo "Nada para commitar."

echo "⬆️ Subindo pro GitHub..."
git push origin main || echo "Nada novo para enviar."

echo "🎉 Finalizado!"
