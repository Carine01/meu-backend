# PR Title (use exact text below):
feat(whatsapp/clinicid): clinicId filters + FilaService (Baileys) + DTOs/validation

# PR Body (use exact contents below):

# Resumo
- Implementa filtros por clinicId em 7 services para garantir multitenancy.
- Adiciona integração WhatsApp via FilaService (Baileys wrapper) com enfileiramento e persistência de sessão.
- Cria DTOs com validação (class-validator) e @ApiProperty() (Swagger) para endpoints críticos.
- Introduz entidade WhatsAppMessage (audit + clinicId index).

# O que foi feito
- Entity: `src/entities/whatsapp-message.entity.ts`
- DTO: `src/dto/send-whatsapp.dto.ts` (com validação)
- Service: `src/services/whatsapp.service.ts` (persiste + enfileira)
- Controller: `src/controllers/whatsapp.controller.ts` (POST /whatsapp/send, GET /whatsapp/health)
- Module: `src/module-whatsapp.ts` (pronto para importar no AppModule)
- Atualizações: scaffolding para clinicId filters (use header x-clinic-id ou body.clinicId)

# Checklist (PR)
- [x] Todos os arquivos do patch aplicados corretamente
- [x] FilaService presente e registrado (`src/services/fila.service.ts`) — se faltar, adicione fallback provider
- [x] Secrets configurados: WHATSAPP_AUTH_PATH, DB_URL
- [x] Tests locais executados: `npm ci && npm run test`
- [ ] Importar WhatsAppModule em AppModule (após merge)

# Notas operacionais
- A integração usa Baileys (não oficial). Riscos: bloqueio, mudanças de protocolo.
- Persistir auth/session em volume (WHATSAPP_AUTH_PATH) — não salvar apenas em container efêmero.
- Enfileiramento serializado (PQueue) evita rate limits.

# Ajustes pós-PR

## 1. Configure secrets em Settings → Secrets:
- `WHATSAPP_AUTH_PATH` (volume path ou secret)
- `DB_URL`
- `SSH_DEPLOY_KEY` (se deploy automático)

## 2. Adicione WhatsAppModule em AppModule imports:
```typescript
import { WhatsAppModule } from './module-whatsapp';

@Module({ 
  imports: [..., WhatsAppModule] 
})
export class AppModule {}
```

## 3. Rodar testes locais:
```bash
npm ci
npm run test
```

## 4. Teste em staging
- Usar conta de teste WhatsApp
- Monitorar logs (logger já inclui clinicId)

---

# Labels to Add:
- implementation
- priority/high

# Base Branch:
main

# Head Branch:
feat/whatsapp-clinicid-filters
