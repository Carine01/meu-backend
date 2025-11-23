#!/bin/bash
# Script to set up GitHub Secrets (Fase 1)
# This script creates all necessary secrets for the IARA backend

set -e

echo "🔐 Setting up GitHub Secrets for IARA Backend"
echo "=============================================="
echo ""
echo "This script will create the following secrets:"
echo "  - DB_URL"
echo "  - JWT_SECRET"
echo "  - WHATSAPP_API_KEY"
echo "  - WHATSAPP_PHONE_ID"
echo "  - WHATSAPP_BUSINESS_ID"
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

echo "📝 Please provide the following values:"
echo ""

# Read DB_URL
read -p "Database URL (postgres://usuario:senha@host:5432/elevare): " DB_URL
if [ -z "$DB_URL" ]; then
    DB_URL="postgres://usuario:senha@host:5432/elevare"
fi

# Generate JWT_SECRET
echo ""
echo "🔑 Generating JWT_SECRET..."
JWT_SECRET=$(openssl rand -hex 32)
echo "Generated JWT_SECRET: $JWT_SECRET"

# Read WhatsApp credentials
echo ""
read -p "WhatsApp API Key: " WHATSAPP_API_KEY
read -p "WhatsApp Phone ID: " WHATSAPP_PHONE_ID
read -p "WhatsApp Business ID: " WHATSAPP_BUSINESS_ID

echo ""
echo "📤 Creating secrets in GitHub..."

# Create secrets
gh secret set DB_URL --body "$DB_URL"
echo "✅ DB_URL created"

gh secret set JWT_SECRET --body "$JWT_SECRET"
echo "✅ JWT_SECRET created"

if [ ! -z "$WHATSAPP_API_KEY" ]; then
    gh secret set WHATSAPP_API_KEY --body "$WHATSAPP_API_KEY"
    echo "✅ WHATSAPP_API_KEY created"
fi

if [ ! -z "$WHATSAPP_PHONE_ID" ]; then
    gh secret set WHATSAPP_PHONE_ID --body "$WHATSAPP_PHONE_ID"
    echo "✅ WHATSAPP_PHONE_ID created"
fi

if [ ! -z "$WHATSAPP_BUSINESS_ID" ]; then
    gh secret set WHATSAPP_BUSINESS_ID --body "$WHATSAPP_BUSINESS_ID"
    echo "✅ WHATSAPP_BUSINESS_ID created"
fi

echo ""
echo "🎉 All secrets have been created successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: npm ci"
echo "  2. Run: npm run lint:fix"
echo "  3. Run: npm run test"
echo "  4. Run: npm run build"
