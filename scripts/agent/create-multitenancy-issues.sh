#!/usr/bin/env bash
set -e
issues=(
"mensagens.service - aplicar clinicId filter|4h"
"campanhas.service - aplicar clinicId filter|3.5h"
"eventos.service - aplicar clinicId filter|2.5h"
"auth.service - validar clinicId via JWT|3h"
"bi.service - aplicar clinicId filter|3h"
"bloqueios.service - aplicar clinicId filter|2h"
"payments/orders - aplicar clinicId filter|4h"
)
for i in "${issues[@]}"; do
  title=$(echo $i | cut -d'|' -f1)
  body=$(echo $i | cut -d'|' -f2)
  gh issue create --title "$title" --body "Estimativa: $body" --label "todo,multitenancy,priority/high" || echo "Issue já existe ou falhou"
done
echo "Issues de multitenancy criadas (ou já existentes)."
