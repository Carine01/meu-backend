Resumo
- Implementação completa de filtros clinicId para isolar dados entre clínicas.
- Aplicado em 7 services: Mensagens, Campanhas, Eventos, Auth, BI, Bloqueios, Pagamentos.
- Inclui scaffolds de testes unitários para futura cobertura 100%.

Racional técnico
- applyClinicIdFilter centraliza a lógica e reduz risco de regressão.
- QueryBuilders atualizados garantem multitenancy real e não apenas "por sorte".
- Padronização de retorno e estrutura de DTOs reduce risco de dados cruzados.

Checklist
- [x] Rodar testes: npm ci && npm run test
- [x] Validar helper applyClinicIdFilter em src/lib/tenant.ts
- [x] Revisar imports

Notas finais
Este PR consolida a base de multitenancy. Recomendado merge imediato antes das próximas integrações WhatsApp.
