# 🤖 AGENT_INSTRUCTIONS.md - COMANDOS EXECUTÁVEIS

**Última atualização:** 22/11/2025  
**Stack:** NestJS 10 + PostgreSQL 15 + TypeORM + Docker Compose + WhatsApp (Baileys)  
**Progresso:** 75-80% completo → Meta: 100% em 2-3 dias

---

## 🛠️ COMANDOS EMERGÊNCIA (Copie e cole)

### Corrigir todos erros TypeScript:
```bash
npm ci && npm run build
```

### Adicionar clinicId em queries vulneráveis:
```bash
# Procurar queries sem filtro
grep -r "\.find()\|\.findOne()" src/modules/ --include="*.ts" | grep -v "where"

# Adicionar clinicId manualmente em cada arquivo listado
# Exemplo: .find() → .find({ where: { clinicId: req.user.clinicId } })
```

### Rodar testes críticos:
```bash
npm run test -- --coverage
```

### Deploy rápido:
```bash
docker-compose down && docker-compose up -d --build
```

---

## 📋 CHECKLIST PRÉ-COMMIT (Validar SEMPRE)

Rode este comando antes de cada commit:
```bash
npm run build && \
npm run test && \
! grep -r "console.log" src/ && \
! grep -r "\.find()" src/modules/ | grep -v "where" && \
echo "✅ Pronto para commit"
```

**Se falhar, NÃO commite.**

### Checklist manual:
- [ ] `npm run build` → 0 erros
- [ ] `npm run test` → todos passam
- [ ] Nenhum `console.log` em src/
- [ ] Nenhum `.find()` sem `where: { clinicId }`
- [ ] Todos DTOs têm `@ApiProperty()` e validadores
- [ ] Endpoints têm `@UseGuards(AuthGuard)`

---

## 🔥 COMANDOS DE ROLLBACK

### Reverter última migration:
```bash
npm run typeorm:rollback
```

### Limpar Docker completamente:
```bash
docker-compose down -v
docker system prune -af --volumes
docker-compose up -d
```

### Reverter mudanças em entities:
```bash
git checkout HEAD -- src/modules/*/entities/*.entity.ts
```

### Rollback git (último commit):
```bash
git reset --soft HEAD~1
```

---

## 🎯 TAREFAS PENDENTES (CRÍTICAS)

### 1. Integrar WhatsApp na Fila (4-6h)
**Arquivo:** `src/modules/fila/fila.service.ts`

**Código exato a adicionar:**
```typescript
// No construtor:
constructor(
  @InjectRepository(Fila)
  private filaRepository: Repository<Fila>,
  private whatsappService: WhatsAppService,  // ← ADICIONAR
  private readonly logger: Logger,
) {}

// No método processarMensagem:
async processarMensagem(id: string) {
  const mensagem = await this.filaRepository.findOne({ where: { id } });
  
  try {
    // SUBSTITUIR simulação por:
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

**Testar:**
```bash
curl -X POST http://localhost:3000/fila/enviar \
  -H "Content-Type: application/json" \
  -d '{"telefone":"5511999999999","texto":"Teste"}'
```

---

### 2. Implementar JWT + Refresh Tokens (4-6h)
**Arquivos a criar:**

**`src/modules/auth/auth.service.ts`:**
```typescript
async login(dto: LoginDto) {
  const user = await this.validateUser(dto.email, dto.password);
  
  const payload = { sub: user.id, email: user.email, clinicId: user.clinicId };
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
  
  await this.saveRefreshToken(user.id, refreshToken);
  
  return { accessToken, refreshToken };
}
```

**Instalar pacotes:**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

---

### 3. Testes E2E Fluxo Crítico (6-8h)
**Arquivo:** `test/e2e/fluxo-critico.e2e-spec.ts`

```typescript
describe('Fluxo: Lead → Indicação → Pontuação', () => {
  it('deve completar fluxo', async () => {
    // 1. Criar lead
    const lead = await request(app).post('/leads').send({
      nome: 'Test Lead',
      telefone: '5511999999999',
    });
    expect(lead.status).toBe(201);
    
    // 2. Criar indicação
    const indicacao = await request(app).post('/indicacoes').send({
      leadId: lead.body.id,
      indicadoNome: 'Indicado Test',
    });
    expect(indicacao.status).toBe(201);
    
    // 3. Verificar pontuação
    const pontuacao = await request(app).get(`/pontuacao/${lead.body.id}`);
    expect(pontuacao.body.pontos).toBe(100);
  });
});
```

**Rodar:**
```bash
npm run test:e2e
```

---

## 🚨 REGEX PARA BUSCAR E CORRIGIR

### Encontrar console.log:
```bash
grep -rn "console.log" src/
```

### Encontrar queries sem where:
```bash
grep -rn "\.find()" src/modules/ | grep -v "where"
```

### Encontrar endpoints sem guard:
```bash
grep -rn "@Get()\|@Post()" src/modules/ -A 1 | grep -v "@UseGuards"
```

### Encontrar DTOs sem validação:
```bash
grep -rn "export class.*Dto" src/ -A 5 | grep -v "@Is"
```

---

## 📊 MÉTRICAS DE QUALIDADE (Validar)

### Cobertura de testes:
```bash
npm run test:cov
# MÍNIMO: 85%
```

### Performance endpoints:
```bash
# Prometheus: http://localhost:9090
# Query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
# MÁXIMO: 200ms (p95)
```

### Vulnerabilidades:
```bash
npm audit
# MÁXIMO: 0 critical, 0 high
```

---

## 🔐 SECRETS NECESSÁRIOS (GitHub)

Configure em: `Settings → Secrets → Actions`

```bash
# Copie estes valores:
SERVER_HOST=seu-vps.com
SERVER_USER=deploy
SERVER_SSH_KEY=<sua-chave-privada>
PROJECT_PATH=/var/www/elevare-backend
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

---

## 📱 MONITORAMENTO 24/7

### Health check:
```bash
curl http://localhost:3000/health
# Esperado: {"status":"ok","services":{"database":"up","redis":"up","whatsapp":"connected"}}
```

### WhatsApp status:
```bash
curl http://localhost:3000/whatsapp/status
# Esperado: {"connected":true,"qr":null}
```

### Métricas Prometheus:
```bash
curl http://localhost:3000/metrics
```

---

## 🎯 PRÓXIMA TAREFA (ESCOLHA UMA)

### Hoje (4-6h):
```bash
# Integrar WhatsApp na fila
code src/modules/fila/fila.service.ts
# Siga instruções da seção 1 acima
```

### Amanhã (4-6h):
```bash
# Implementar JWT
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
code src/modules/auth/auth.service.ts
# Siga instruções da seção 2 acima
```

### Esta semana (6-8h):
```bash
# Criar testes E2E
code test/e2e/fluxo-critico.e2e-spec.ts
# Siga instruções da seção 3 acima
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

| Erro | Comando de Fix |
|------|----------------|
| TypeScript errors | `npm ci && npm run build` |
| Tests failing | `npm run test -- --clearCache` |
| Docker não sobe | `docker-compose down -v && docker-compose up -d` |
| WhatsApp desconectado | `docker-compose restart app` |
| Migrations falham | `npm run typeorm:rollback && npm run typeorm:migrate` |
| Port já em uso | `lsof -ti:3000 \| xargs kill -9` |

---

## 📞 ALERTAS CONFIGURADOS

- **Discord #alerts:** WhatsApp desconectado, deploy falhou
- **GitHub Actions:** Falhas de CI/CD via email
- **Prometheus:** Latência > 200ms, erro rate > 5%

---

## 🔗 LINKS RÁPIDOS

- **GitHub Actions:** https://github.com/Carine01/meu-backend/actions
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000
- **Swagger:** http://localhost:3000/docs

---

## ✅ VALIDAÇÃO FINAL PRÉ-DEPLOY

Execute este script completo:
```bash
#!/bin/bash
set -e

echo "🔍 Validando TypeScript..."
npm run build

echo "🧪 Rodando testes..."
npm run test:cov

echo "🔒 Verificando segurança..."
! grep -r "console.log" src/ || (echo "❌ console.log encontrado" && exit 1)
! grep -r "\.find()" src/modules/ | grep -v "where" || (echo "❌ Query sem where encontrada" && exit 1)

echo "🐳 Testando Docker..."
docker-compose down
docker-compose up -d
sleep 30
curl -f http://localhost:3000/health || exit 1

echo "✅ TUDO PRONTO PARA DEPLOY!"
```

---

**REGRA DE OURO:** Se não consegue copiar-colar e executar em < 5 min, não é instrução de agente.

**Documentação detalhada:** `docs/decisions/2025-11-22-architecture-decisions.md`
