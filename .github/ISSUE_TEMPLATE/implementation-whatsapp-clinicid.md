---
name: Implementação WhatsApp + clinicId + E2E
about: Tarefas de código após merge do PR de documentação
title: 'feat: implementar WhatsApp integration, filtros clinicId e testes E2E'
labels: enhancement, high-priority
assignees: ''
---

## 🎯 Contexto

Após merge do PR de documentação (#XX), implementar as 3 tarefas críticas documentadas no `AGENT_INSTRUCTIONS.md`.

**Progresso atual:** 75-80% → **Meta:** 100% MVP funcional

---

## 📋 Tarefas

### 1. Integração WhatsApp no FilaService (30-60 min) 🔴 CRÍTICO

**Objetivo:** Substituir simulação por integração real com WhatsApp Business API (Baileys)

**Arquivos a modificar:**
- `src/modules/fila/fila.service.ts`

**Implementação:**
```typescript
// No construtor, adicionar:
constructor(
  @InjectRepository(Fila)
  private filaRepository: Repository<Fila>,
  private whatsappService: WhatsAppService,  // ← ADICIONAR
  private readonly logger: Logger,
) {}

// No método processarMensagem():
async processarMensagem(id: string) {
  const mensagem = await this.filaRepository.findOne({ where: { id } });
  
  try {
    const result = await this.whatsappService.sendMessage(
      mensagem.telefone,
      mensagem.texto
    );
    
    await this.filaRepository.update(id, {
      status: 'enviado',
      messageId: result.messageId,
    });
    
    this.logger.log(`✅ Mensagem ${id} enviada`);
  } catch (error) {
    this.logger.error(`❌ Erro: ${error.message}`);
    
    // Retry com backoff
    if (mensagem.tentativas < 3) {
      await this.filaRepository.update(id, {
        status: 'pendente',
        tentativas: mensagem.tentativas + 1,
      });
    } else {
      await this.filaRepository.update(id, { status: 'falhou' });
    }
  }
}
```

**Teste:**
```bash
curl -X POST http://localhost:3000/fila/enviar \
  -H "Content-Type: application/json" \
  -d '{"telefone":"5511999999999","texto":"Teste"}'
```

**Checklist:**
- [ ] WhatsAppService injetado no construtor
- [ ] Método sendMessage() com try/catch
- [ ] Atualização de status (pendente → enviado/falhou)
- [ ] Retry automático (3 tentativas, backoff exponencial)
- [ ] Log detalhado de cada envio
- [ ] Teste manual via curl

---

### 2. Filtros clinicId nos Services (2-3 horas) 🟡 IMPORTANTE

**Objetivo:** Adicionar filtros `clinicId` em todas as queries para isolamento de dados

**Arquivos a modificar (7 services):**
- `src/modules/leads/leads.service.ts`
- `src/modules/agendamentos/agendamentos.service.ts`
- `src/modules/fila/fila.service.ts`
- `src/modules/indicacoes/indicacoes.service.ts`
- `src/modules/pontuacao/pontuacao.service.ts`
- `src/modules/recompensas/recompensas.service.ts`
- `src/modules/usuarios/usuarios.service.ts`

**Padrão a aplicar:**

**Antes (VULNERÁVEL):**
```typescript
async findAll() {
  return this.repository.find();
}
```

**Depois (SEGURO):**
```typescript
async findAll(clinicId: string) {
  return this.repository.find({ 
    where: { clinicId } 
  });
}
```

**Regex para buscar queries vulneráveis:**
```bash
grep -rn "\.find()" src/modules/ | grep -v "where"
```

**Checklist:**
- [ ] Leads: `find()` → `find({ where: { clinicId } })`
- [ ] Agendamentos: adicionar filtro clinicId
- [ ] Fila: adicionar filtro clinicId
- [ ] Indicações: adicionar filtro clinicId
- [ ] Pontuação: adicionar filtro clinicId
- [ ] Recompensas: adicionar filtro clinicId
- [ ] Usuários: adicionar filtro clinicId
- [ ] Teste: verificar isolamento de dados

---

### 3. Testes E2E Fluxo Crítico (6-8 horas) 🟢 NECESSÁRIO

**Objetivo:** Criar testes E2E para validar fluxos completos end-to-end

**Arquivo a criar:**
- `test/e2e/fluxo-critico.e2e-spec.ts`

**Implementação:**
```typescript
describe('Fluxo: Lead → Indicação → Pontuação → Recompensa', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve completar fluxo com sucesso', async () => {
    // 1. Criar lead
    const lead = await request(app.getHttpServer())
      .post('/leads')
      .send({
        nome: 'Test Lead',
        telefone: '5511999999999',
      });
    expect(lead.status).toBe(201);
    
    // 2. Criar indicação
    const indicacao = await request(app.getHttpServer())
      .post('/indicacoes')
      .send({
        leadId: lead.body.id,
        indicadoNome: 'Indicado Test',
      });
    expect(indicacao.status).toBe(201);
    
    // 3. Verificar pontuação
    const pontuacao = await request(app.getHttpServer())
      .get(`/pontuacao/${lead.body.id}`);
    expect(pontuacao.body.pontos).toBe(100);
    
    // 4. Resgatar recompensa
    const recompensa = await request(app.getHttpServer())
      .post('/recompensas/resgatar')
      .send({ leadId: lead.body.id });
    expect(recompensa.status).toBe(200);
  });
});
```

**Fluxos a testar:**
1. Lead → Indicação → Pontuação → Recompensa
2. Agendamento → Bloqueio → Sugestão alternativa
3. Mensagem → Fila → Envio → Status tracking

**Comando:**
```bash
npm run test:e2e
```

**Checklist:**
- [ ] Teste fluxo Lead → Indicação → Pontuação
- [ ] Teste fluxo Agendamento → Bloqueio
- [ ] Teste fluxo Mensagem → Fila → WhatsApp
- [ ] Cobertura E2E > 3 fluxos críticos
- [ ] Todos testes passando

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Meta | Status |
|---------|-------|------|--------|
| WhatsApp | Simulado | Real | ⏳ |
| Segurança clinicId | 0/7 services | 7/7 services | ⏳ |
| Testes E2E | 0 fluxos | 3 fluxos | ⏳ |
| Cobertura testes | 53% | 85% | ⏳ |
| MVP Completo | 75-80% | 100% | ⏳ |

---

## 🚀 Sequência Recomendada

1. **Hoje (4-6h):**
   - [ ] Task 1: WhatsApp Integration (maior impacto)
   - [ ] Task 2: Filtros clinicId (segurança crítica)

2. **Amanhã (6-8h):**
   - [ ] Task 3: Testes E2E (validação completa)
   - [ ] Verificação final e ajustes

---

## 📝 Notas

- **Branch:** `feat/whatsapp-integration`
- **Base:** Após merge do PR de documentação
- **Referência:** `AGENT_INSTRUCTIONS.md` para código completo
- **Padrões:** Seguir `this.logger` com emojis, DTOs com `@ApiProperty()`, try/catch em tudo

---

## 🔗 Links Relacionados

- AGENT_INSTRUCTIONS.md - Comandos executáveis
- AGENTES_GITHUB.md - 8 agents de automação CI/CD
- docs/decisions/2025-11-22-architecture-decisions.md - Context histórico
