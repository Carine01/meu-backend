# Resumo
Aplica filtros multitenancy (clinicId) em 3 services críticos para garantir isolamento entre clínicas. Inclui scaffolds de testes unitários para cada service alterado.

## O que foi alterado

### Services modificados:
- **BloqueiosService**: Novo método `listForClinic(clinicId)` com validação
- **AuthService**: Login aceita `clinicId` opcional e injeta no JWT payload
- **EventsService**: Estrutura preparada para filtros clinicId (scaffold)

### Testes criados:
- `src/modules/agendamentos/__tests__/bloqueios.service.spec.ts`
- `src/modules/auth/__tests__/auth.service.spec.ts`
- `src/modules/eventos/__tests__/events.service.spec.ts`

## Checklist (PR)
- [ ] Rodar testes locais: `npm ci && npm run test`
- [ ] Validar que `applyClinicIdFilter` existe em `src/lib/tenant.ts`
- [ ] Revisar imports/paths (caso seu repo use estrutura diferente)
- [ ] Marcar reviewer e aprovar
- [ ] Completar implementação dos services restantes:
  - MensagensService (mensagem-resolver.service.ts)
  - BiService (bi.service.ts) 
  - Campanhas (agenda-semanal.service.ts)
  - Payments (quando houver service de orders)

## Notas rápidas
- **Implementação parcial**: 3 de 7 services modificados
- Helper `tenant.ts` já existe com funções: `applyClinicIdFilter`, `validateClinicId`, `extractClinicId`
- Testes usam mocks Jest compatíveis com suite atual
- Estimativa para completar 4 services restantes: ~10-12h

## Próximos passos
1. Implementar filtros em:
   - MensagensService/MensagemResolverService
   - BiService (getDashboardMetrics com clinicId)
   - CampanhasService (agenda-semanal)
   - Payments/Orders (quando existir)
2. Adicionar testes E2E
3. Validar em staging
