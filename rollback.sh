#!/bin/bash
# Script de rollback automatizado para Cloud Run
# Projeto: Elevare Backend (lucresia-74987923-59ce3)

set -e

PROJECT_ID="${1:-lucresia-74987923-59ce3}"
SERVICE_NAME="${2:-elevare-backend}"
REGION="${3:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Erro: PROJECT_ID não fornecido"
  echo "Uso: ./rollback.sh PROJECT_ID [SERVICE_NAME] [REGION]"
  exit 1
fi

echo "🔍 Listando últimas 5 revisões do serviço $SERVICE_NAME..."
gcloud run revisions list \
  --service="$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --limit=5 \
  --format="table(REVISION,ACTIVE,DEPLOYED)"

echo ""
read -p "📝 Digite o nome da revisão para rollback: " REVISION_NAME

if [ -z "$REVISION_NAME" ]; then
  echo "❌ Nome da revisão não pode ser vazio"
  exit 1
fi

echo "⏳ Redirecionando 100% do tráfego para $REVISION_NAME..."
gcloud run services update-traffic "$SERVICE_NAME" \
  --to-revisions="$REVISION_NAME=100" \
  --region="$REGION" \
  --project="$PROJECT_ID"

echo "✅ Rollback concluído com sucesso!"
echo "🔗 URL do serviço:"
gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)"
