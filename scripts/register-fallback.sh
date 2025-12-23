#!/bin/bash
set -e

TARGET="src/modules/whatsapp/whatsapp.module.ts"
PROVIDER_LINE="    FallbackWhatsAppProvider,"

if grep -q "FallbackWhatsAppProvider" "$TARGET"; then
  echo "[skip] Fallback provider já registrado."
  exit 0
fi

sed -i "/providers: \[/ a\ $PROVIDER_LINE" $TARGET
echo "[ok] FallbackWhatsAppProvider registrado no whatsapp.module.ts"
