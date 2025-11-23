#!/bin/bash
# Script para configurar secrets essenciais no GitHub
# Uso: ./scripts/configure-secrets.sh

set -e

echo "🔐 Configurando Secrets Essenciais no GitHub"
echo ""
echo "⚠️  IMPORTANTE: Substitua os valores abaixo pelos seus dados reais!"
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI (gh) não está instalado"
    echo "   Instale em: https://cli.github.com/"
    exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    echo "❌ Erro: Você não está autenticado no GitHub CLI"
    echo "   Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI autenticado"
echo ""

# Função para configurar um secret
configure_secret() {
    local secret_name=$1
    local secret_description=$2
    local default_value=$3
    
    echo "📝 Configurando: $secret_name"
    echo "   Descrição: $secret_description"
    
    # Verificar se valor padrão existe
    if [ -n "$default_value" ]; then
        read -p "   Valor [$default_value]: " secret_value
        secret_value=${secret_value:-$default_value}
    else
        read -sp "   Valor: " secret_value
        echo ""
    fi
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name" --body -
        echo "   ✅ Secret '$secret_name' configurado com sucesso"
    else
        echo "   ⚠️  Secret '$secret_name' pulado (valor vazio)"
    fi
    echo ""
}

echo "🚀 Iniciando configuração de secrets..."
echo ""

# Configurar cada secret
configure_secret "DB_URL" "URL de conexão do banco PostgreSQL" "postgresql://user:pass@host:5432/dbname"
configure_secret "WHATSAPP_PROVIDER_TOKEN" "Token do provedor WhatsApp" ""
configure_secret "WHATSAPP_PROVIDER_API_URL" "URL da API do provedor WhatsApp" "https://api.gateway.whatsapp"
configure_secret "JWT_SECRET" "Secret para geração de tokens JWT" ""
configure_secret "DOCKER_REGISTRY_USER" "Usuário do registry Docker" ""
configure_secret "DOCKER_REGISTRY_PASS" "Senha do registry Docker" ""

echo "✅ Configuração de secrets concluída!"
echo ""
echo "📋 Para verificar os secrets configurados, acesse:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo ""
echo "💡 Dica: Você também pode configurar secrets manualmente via:"
echo "   GitHub → Settings → Secrets and variables → Actions"
