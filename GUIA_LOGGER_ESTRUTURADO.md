# 📋 Guia de Logger Estruturado - Pino

> **Sistema de logs profissional com correlationId e JSON estruturado**  
> Implementação completa baseada em pino para produção em larga escala.

---

## 🎯 **Visão Geral**

Este guia documenta o sistema de logging estruturado implementado no backend Elevare, usando **pino** para logs JSON performáticos e rastreamento de requisições via **correlationId**.

### **Arquivos do Sistema:**
```
src/shared/logger/
├── logger.service.ts          # CustomLoggerService (wrapper do pino)
├── correlation.interceptor.ts # Adiciona correlationId em todas as requisições
├── correlation.decorator.ts   # @CorrelationId() para controllers
└── index.ts                   # Barrel export
```

---

## 🚀 **Como Usar no Seu Código**

### **1. Em Services (Dependency Injection)**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { getLogger } from '../shared/logger';

@Injectable()
export class LeadsService {
  private readonly logger = getLogger('leads'); // Nome do serviço

  async criarLead(dados: CreateLeadDto) {
    const startTime = Date.now();
    
    // Log estruturado com contexto
    this.logger.log('Criando lead', {
      nome: dados.nome,
      origem: dados.origem,
      clinicId: dados.clinicId
    });

    try {
      const lead = await this.repository.save(dados);
      
      const durationMs = Date.now() - startTime;
      this.logger.log('✅ Lead criado', {
        leadId: lead.id,
        durationMs,
        phone: dados.phone.substring(0, 6) + '***' // PII redaction
      });

      return lead;
    } catch (error) {
      this.logger.error('❌ Erro ao criar lead', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        dados: CustomLoggerService.redact(dados, ['password', 'token'])
      });
      throw error;
    }
  }
}
```

### **2. Em Controllers (com CorrelationId)**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { getLogger, CorrelationId } from '../shared/logger';

@Controller('leads')
export class LeadsController {
  private readonly logger = getLogger('leads-controller');

  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async criar(
    @Body() dados: CreateLeadDto,
    @CorrelationId() correlationId: string // Injetado automaticamente
  ) {
    const logger = this.logger.withCorrelation(correlationId);
    
    logger.log('📨 POST /leads', {
      origem: dados.origem,
      hasPhone: !!dados.phone
    });

    const result = await this.leadsService.criarLead(dados);

    logger.log('✅ Lead criado com sucesso', {
      leadId: result.id
    });

    return { success: true, data: result };
  }
}
```

### **3. Em Cron Jobs**

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getLogger } from '../shared/logger';

@Injectable()
export class CronService {
  private readonly logger = getLogger('cron');

  @Cron('*/10 * * * *') // A cada 10 minutos
  async processarFila() {
    const correlationId = `cron-fila-${Date.now()}`;
    const logger = this.logger.withCorrelation(correlationId);
    const startTime = Date.now();

    logger.log('🔄 Iniciando processamento da fila');

    try {
      const resultado = await this.filaService.processarFila();
      
      const durationMs = Date.now() - startTime;
      logger.log('✅ Fila processada', {
        sent: resultado.sent,
        failed: resultado.failed,
        durationMs,
        batchSize: resultado.total
      });
    } catch (error) {
      logger.error('❌ Erro ao processar fila', {
        error: (error as Error).message,
        durationMs: Date.now() - startTime
      });
    }
  }
}
```

---

## 🔐 **Redação de Dados Sensíveis (PII)**

**SEMPRE** remova informações sensíveis antes de logar:

```typescript
import { CustomLoggerService } from '../shared/logger';

// ❌ NUNCA FAÇA ISSO:
logger.log('Usuário logado', {
  email: 'maria@email.com',
  password: 'senha123',
  cpf: '123.456.789-00'
});

// ✅ FAÇA ISSO:
const dadosRedacted = CustomLoggerService.redact(usuario, [
  'password',
  'token',
  'cpf',
  'creditCard'
]);

logger.log('Usuário logado', dadosRedacted);
```

**Campos comuns para redação:**
- `password`, `senha`
- `token`, `accessToken`, `refreshToken`
- `cpf`, `rg`, `ssn`
- `creditCard`, `cardNumber`
- `apiKey`, `secret`

---

## 🎯 **12 Regras de Ouro para Logs em Produção**

### **1. Use Níveis Corretos**

```typescript
// ✅ BOM:
logger.debug('Detalhes internos', { query: sql }); // Apenas em dev
logger.log('Lead criado', { leadId });              // Eventos importantes
logger.warn('Rate limit próximo', { count: 95 });  // Atenção
logger.error('Falha crítica', { error });          // Erros

// ❌ RUIM:
logger.log('SELECT * FROM users'); // Muito verboso
logger.error('Lead criado');        // Nível errado
```

### **2. Logs Estruturados (JSON)**

```typescript
// ✅ BOM:
logger.log('Pagamento processado', {
  orderId: '123',
  amount: 150.00,
  method: 'pix',
  durationMs: 234
});

// ❌ RUIM:
logger.log('Pagamento 123 de R$150.00 via pix em 234ms');
```

### **3. Sempre Adicione Contexto**

```typescript
// ✅ BOM:
logger.error('Erro ao salvar', {
  error: err.message,
  stack: err.stack,
  leadId: lead.id,
  clinicId: lead.clinicId,
  operation: 'create'
});

// ❌ RUIM:
logger.error('Erro ao salvar'); // Sem contexto útil
```

### **4. Meça Duração de Operações**

```typescript
async minhaOperacao() {
  const startTime = Date.now();
  
  try {
    const result = await this.processarAlgo();
    
    const durationMs = Date.now() - startTime;
    logger.log('Operação concluída', {
      durationMs,
      recordCount: result.length
    });
    
    // Alertar se demorar muito
    if (durationMs > 5000) {
      logger.warn('⚠️ Operação lenta detectada', { durationMs });
    }
  } catch (error) {
    logger.error('Erro', {
      error: (error as Error).message,
      durationMs: Date.now() - startTime
    });
  }
}
```

### **5. Use CorrelationId para Rastreamento**

```typescript
// Já injetado automaticamente pelo interceptor!
// Todas as requisições HTTP ganham x-correlation-id

// Em controllers:
async metodo(@CorrelationId() id: string) {
  const logger = this.logger.withCorrelation(id);
  // Todos os logs terão o mesmo correlationId
}

// Em serviços chamados:
async processarLead(leadId: string, correlationId: string) {
  const logger = this.logger.withCorrelation(correlationId);
  // Rastreamento end-to-end
}
```

### **6. Evite Logs em Loops**

```typescript
// ❌ RUIM (vai gerar 10.000 logs):
leads.forEach(lead => {
  logger.log('Processando lead', { leadId: lead.id });
  this.processar(lead);
});

// ✅ BOM:
logger.log('Processando batch de leads', {
  count: leads.length,
  clinicId: leads[0].clinicId
});

const resultados = await Promise.all(
  leads.map(lead => this.processar(lead))
);

logger.log('Batch concluído', {
  total: leads.length,
  sucesso: resultados.filter(r => r.ok).length,
  erros: resultados.filter(r => !r.ok).length
});
```

### **7. Padronize Emojis para Fácil Busca**

```typescript
// Use emojis consistentes para facilitar grep/busca

logger.log('📨 Mensagem recebida', { ... });    // Entrada
logger.log('🔄 Processando', { ... });          // Em progresso
logger.log('✅ Concluído', { ... });            // Sucesso
logger.warn('⚠️ Atenção', { ... });             // Warning
logger.error('❌ Erro crítico', { ... });       // Erro
logger.debug('🔍 Debug', { ... });              // Debug
logger.log('🧹 Limpeza', { ... });              // Cleanup
logger.log('📊 Estatísticas', { ... });         // Stats
```

### **8. Log de Erro Completo**

```typescript
try {
  await operacaoPerigosa();
} catch (error: any) {
  const err = error as Error;
  
  logger.error('❌ Falha na operação', {
    error: err.message,
    stack: err.stack,
    code: err['code'],           // Códigos de erro específicos
    context: {
      leadId,
      clinicId,
      operation: 'processamento'
    },
    timestamp: new Date().toISOString()
  });
  
  throw error; // Re-throw se necessário
}
```

### **9. Não Logue Tudo (Performance)**

```typescript
// ❌ RUIM (overhead desnecessário):
logger.log('Iniciando função');
logger.log('Variável x = ', x);
logger.log('Entrando no if');
logger.log('Saindo do if');
logger.log('Retornando resultado');

// ✅ BOM (apenas eventos importantes):
logger.log('Processamento iniciado', { leadCount: leads.length });
// ... código ...
logger.log('Processamento concluído', {
  processed: results.length,
  durationMs
});
```

### **10. Use debug() para Detalhes Internos**

```typescript
// Ativa apenas com LOG_LEVEL=debug

this.logger.debug('Query executada', {
  sql: query.getSql(),
  params: query.getParameters(),
  rows: results.length
});

this.logger.debug('Cache hit', {
  key: cacheKey,
  ttl: 300
});

// Em produção, LOG_LEVEL=info ignora todos os debug()
```

### **11. Logs de Segurança**

```typescript
// Sempre logue tentativas de acesso
logger.warn('🔒 Tentativa de acesso negada', {
  userId: req.user?.id,
  path: req.path,
  method: req.method,
  ip: req.ip,
  reason: 'missing_permission'
});

// Rate limiting
logger.warn('⚠️ Rate limit atingido', {
  userId: req.user?.id,
  ip: req.ip,
  endpoint: req.path,
  attempts: 100
});

// Ações administrativas
logger.log('🔐 Usuário criado', {
  adminId: admin.id,
  newUserId: newUser.id,
  roles: newUser.roles
});
```

### **12. Logs de Startup e Shutdown**

```typescript
// No main.ts ou módulos principais
async onModuleInit() {
  this.logger.log('🚀 Módulo inicializado', {
    module: 'LeadsModule',
    config: {
      queueEnabled: this.config.queueEnabled,
      batchSize: this.config.batchSize
    }
  });
}

async onModuleDestroy() {
  this.logger.log('🛑 Módulo sendo encerrado', {
    module: 'LeadsModule',
    activeConnections: this.getActiveCount()
  });
}
```

---

## 🔍 **Busca e Análise de Logs**

### **Buscar por CorrelationId**

```bash
# Rastrear toda uma requisição
grep "abc123-456-789" logs/app.log

# No CloudWatch/Grafana:
fields @timestamp, @message, correlationId, error
| filter correlationId = "abc123-456-789"
| sort @timestamp asc
```

### **Buscar Erros Críticos**

```bash
# Logs locais
grep "❌" logs/app.log | grep "error"

# CloudWatch
fields @timestamp, error.message, error.stack
| filter level = "error"
| stats count() by error.message
```

### **Análise de Performance**

```bash
# Operações lentas
fields @timestamp, @message, durationMs
| filter durationMs > 5000
| sort durationMs desc
```

---

## 📦 **Configuração de Ambiente**

### **.env**

```bash
# Nível de log (debug, info, warn, error)
LOG_LEVEL=info

# Em produção, sempre info ou warn
# Em desenvolvimento, pode usar debug
```

### **Formato de Saída**

```typescript
// logger.service.ts já configura automaticamente:

// Desenvolvimento: pino-pretty (logs coloridos e legíveis)
// Produção: JSON puro (para CloudWatch, Elasticsearch, etc)

const isDevelopment = process.env.NODE_ENV !== 'production';

const pinoConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
};
```

---

## 🛠 **Instalação de Dependências**

Dependências já adicionadas no `package.json`:

```json
{
  "dependencies": {
    "pino": "^9.5.0",
    "pino-http": "^10.5.0",
    "pino-pretty": "^11.5.0",
    "uuid": "^11.0.3"
  },
  "devDependencies": {
    "@types/uuid": "^10.0.0"
  }
}
```

**Instalar:**

```bash
npm install
```

---

## 🧪 **Testando o Sistema**

### **1. Verificar Logs em Dev**

```bash
# Rodar com debug ativado
LOG_LEVEL=debug npm run start:dev

# Fazer uma requisição
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nome": "Maria Silva",
    "phone": "+5511999999999",
    "origem": "site"
  }'

# Verificar logs com correlationId
# Deve aparecer algo como:
# [INFO] 📨 POST /leads {"correlationId":"req-1234567890","origem":"site"}
# [INFO] ✅ Lead criado {"correlationId":"req-1234567890","leadId":"lead123"}
```

### **2. Verificar Redação de PII**

```typescript
// No código de teste:
const dados = {
  nome: 'João',
  cpf: '123.456.789-00',
  password: 'senha123'
};

const redacted = CustomLoggerService.redact(dados, ['cpf', 'password']);
console.log(redacted);
// { nome: 'João', cpf: '[REDACTED]', password: '[REDACTED]' }
```

### **3. Testar CorrelationId**

```bash
# Enviar com correlation ID customizado
curl -X POST http://localhost:3000/leads \
  -H "x-correlation-id: meu-teste-123" \
  -H "Authorization: Bearer <token>" \
  -d '{ ... }'

# Buscar nos logs
grep "meu-teste-123" logs/app.log
```

---

## 📊 **Exemplo de Log Estruturado Completo**

```json
{
  "level": 30,
  "time": "2025-11-25T14:32:15.234Z",
  "pid": 12345,
  "hostname": "backend-pod-1",
  "correlationId": "req-1732544535234",
  "serviceName": "leads",
  "msg": "✅ Lead criado",
  "leadId": "lead-abc123",
  "clinicId": "elevare-01",
  "origem": "site",
  "durationMs": 234,
  "phone": "+55119***",
  "context": {
    "operation": "create",
    "userId": "user-456"
  }
}
```

**Benefícios:**
- ✅ Fácil de buscar por qualquer campo
- ✅ Agregação e análise automática
- ✅ Rastreamento end-to-end via correlationId
- ✅ PII protegido (telefone parcialmente oculto)
- ✅ Performance medida (durationMs)

---

## 🎓 **Resumo - Checklist Rápido**

Antes de fazer commit, certifique-se:

- [ ] Usei `getLogger(serviceName)` em vez de `new Logger()`
- [ ] Adicionei contexto estruturado (objeto JSON) aos logs importantes
- [ ] Removi PII com `CustomLoggerService.redact()` quando necessário
- [ ] Usei `@CorrelationId()` em controllers para rastreamento
- [ ] Medi duração de operações críticas (`durationMs`)
- [ ] Logs de erro incluem `error.message` e `error.stack`
- [ ] Não coloquei logs dentro de loops (batch em vez de item-por-item)
- [ ] Usei emojis padronizados (📨, ✅, ❌, ⚠️)
- [ ] Configurei `LOG_LEVEL=info` em produção
- [ ] Testei que os logs aparecem corretamente em dev

---

## 📚 **Referências**

- [Pino Documentation](https://getpino.io/)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
- [12-Factor App - Logs](https://12factor.net/logs)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

---

**✅ Sistema implementado e pronto para uso!**

Se tiver dúvidas, consulte os exemplos em:
- `src/cron/cron.service.ts` (logs em cron jobs)
- `src/modules/fila/fila.service.ts` (logs em serviços)
- `src/leads/leads.controller.ts` (logs em controllers)
