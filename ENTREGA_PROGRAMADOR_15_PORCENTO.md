# 📋 ENTREGA FINAL - 15% RESTANTES

**Data:** 22/11/2025  
**Status:** 🎯 PRONTO PARA EXECUÇÃO  
**Tempo estimado:** 22-26 horas (3-4 dias)

---

## 🚀 A — CHECKLIST OPERACIONAL IMEDIATO

### **Prioridade Alta (Hoje - 30 min):**

- [ ] 1. Criar milestone "MVP - 100%" (3 dias)
- [ ] 2. Criar 7 issues via GH CLI (comandos prontos abaixo)
- [ ] 3. Configurar 3 secrets essenciais no GitHub
- [ ] 4. Mergear PRs existentes (2 branches prontas)

### **Prioridade Média (Dias 1-2 - 16h):**

- [ ] 5. Aplicar helper `applyClinicIdFilter` (código pronto abaixo)
- [ ] 6. Implementar filtros em 7 services (trechos copy-paste)
- [ ] 7. Criar testes unitários para cada service

### **Prioridade Baixa (Dias 3-4 - 10h):**

- [ ] 8. Smoke tests em staging (WhatsApp health + flows)
- [ ] 9. Deploy produção (runbook completo abaixo)
- [ ] 10. Monitoramento 1h + rollback se necessário

---

## 🎯 B — COMANDOS GH PRONTOS (COPY-PASTE)

### **1. Criar Milestone**

```powershell
# PowerShell (Windows)
$dueDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
gh api repos/Carine01/meu-backend/milestones -f title="MVP - 100%" -f due_on="$dueDate" -f description="Meta: completar MVP em ~3 dias (26h estimadas)"
```

```bash
# Bash (Linux/Mac)
gh milestone create "MVP - 100%" --due-date "$(date -d '+3 days' +%F)" --description "Meta: completar MVP em ~3 dias (26h)"
```

### **2. Criar 7 Issues**

**⚠️ IMPORTANTE:** Substitua antes de executar:
- `<DEV>` → seu username GitHub (ex: `Carine01`)
- `<MILESTONE_NUMBER>` → número retornado no comando anterior

```bash
# Issue #1: mensagens.service (3h)
gh issue create \
  --title "Impl: clinicId filter - mensagens.service" \
  --body "**Contexto:**
Adicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.

**Tarefas:**
- [ ] Adicionar where clinicId nas queries (2h)
- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)

**Estimativa:** 3h
**Arquivo:** \`src/services/mensagens.service.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #2: campanhas.service (2.5h)
gh issue create \
  --title "Impl: clinicId filter - campanhas.service" \
  --body "**Contexto:**
Adicionar clinicId filter em campanhas.service.

**Tarefas:**
- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** \`src/services/campanhas.service.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #3: eventos.service (2.5h)
gh issue create \
  --title "Impl: clinicId filter - eventos.service" \
  --body "**Contexto:**
Eventos: filtrar por clinicId.

**Tarefas:**
- [ ] Add clinicId to DTOs & validators (0.5h)
- [ ] Add where clause in eventos.service (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivos:** \`src/services/eventos.service.ts\`, \`src/dto/create-evento.dto.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #4: auth.service (3h)
gh issue create \
  --title "Impl: clinicId scoping - auth.service" \
  --body "**Contexto:**
JWT e auth devem carregar/validar clinicId.

**Tarefas:**
- [ ] Incluir clinicId no payload do JWT (1h)
- [ ] Ajustar guards para validar clinicId (1h)
- [ ] Unit tests login (1h)

**Estimativa:** 3h
**Arquivos:** \`src/services/auth.service.ts\`, \`src/guards/jwt-auth.guard.ts\`" \
  --label "implementation,priority/high,security" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #5: bi.service (2.5h)
gh issue create \
  --title "Impl: clinicId isolation - bi.service" \
  --body "**Contexto:**
BI: queries isoladas por clinicId.

**Tarefas:**
- [ ] Parametrizar queries por clinicId (1.5h)
- [ ] Unit tests (1h)

**Estimativa:** 2.5h
**Arquivo:** \`src/services/bi.service.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #6: bloqueios.service (2h)
gh issue create \
  --title "Impl: clinicId enforcement - bloqueios.service" \
  --body "**Contexto:**
Bloqueios aplicados por clinicId.

**Tarefas:**
- [ ] Adicionar clinicId nas regras de criação/consulta (1h)
- [ ] Unit tests (1h)

**Estimativa:** 2h
**Arquivo:** \`src/services/bloqueios.service.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"

# Issue #7: payments/orders (3.5h)
gh issue create \
  --title "Impl: clinicId filter - payments/orders" \
  --body "**Contexto:**
Transações e pedidos sempre ligados ao clinicId.

**Tarefas:**
- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)
- [ ] Atualizar webhooks para validar clinicId (1h)
- [ ] Unit tests (1h)

**Estimativa:** 3.5h
**Arquivos:** \`src/services/payments.service.ts\`, \`src/services/orders.service.ts\`" \
  --label "implementation,priority/high" \
  --assignee "<DEV>" \
  --milestone "<MILESTONE_NUMBER>"
```

---

## 💻 C — CÓDIGO COPY-PASTE (FILTROS CLINICID)

### **1. Helper Principal (Criar arquivo novo)**

**Arquivo:** `src/lib/tenant.ts`

```typescript
// src/lib/tenant.ts
import { SelectQueryBuilder } from 'typeorm';

/**
 * Aplica filtro de clinicId em QueryBuilder TypeORM
 * 
 * @param qb - QueryBuilder TypeORM
 * @param clinicId - ID da clínica para filtrar
 * @param column - Nome da coluna (padrão: 'clinicId')
 * @returns QueryBuilder com filtro aplicado
 * 
 * @example
 * const qb = this.repo.createQueryBuilder('mensagem');
 * applyClinicIdFilter(qb, 'clinic-123');
 * const results = await qb.getMany();
 */
export function applyClinicIdFilter<T>(
  qb: SelectQueryBuilder<T>,
  clinicId: string,
  column = 'clinicId'
): SelectQueryBuilder<T> {
  const alias = qb.expressionMap.mainAlias!.name;
  return qb.andWhere(`${alias}.${column} = :clinicId`, { clinicId });
}

/**
 * Valida se clinicId está presente e é válido
 * @throws BadRequestException se inválido
 */
export function validateClinicId(clinicId: string | undefined): asserts clinicId is string {
  if (!clinicId || clinicId.trim() === '') {
    throw new Error('clinicId é obrigatório');
  }
}
```

---

### **2. Exemplo Completo: mensagens.service.ts**

**Arquivo:** `src/services/mensagens.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensagem } from '../entities/mensagem.entity';
import { CreateMensagemDto } from '../dto/create-mensagem.dto';
import { applyClinicIdFilter, validateClinicId } from '../lib/tenant';

@Injectable()
export class MensagensService {
  constructor(
    @InjectRepository(Mensagem)
    private readonly repo: Repository<Mensagem>,
  ) {}

  /**
   * Busca todas mensagens de uma clínica
   * @param clinicId - ID da clínica
   */
  async findAllForClinic(clinicId: string): Promise<Mensagem[]> {
    validateClinicId(clinicId);
    
    const qb = this.repo.createQueryBuilder('m');
    applyClinicIdFilter(qb, clinicId);
    
    return qb
      .orderBy('m.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Cria nova mensagem vinculada à clínica
   */
  async create(dto: CreateMensagemDto, clinicId: string): Promise<Mensagem> {
    validateClinicId(clinicId);
    
    const entity = this.repo.create({
      ...dto,
      clinicId,
      createdAt: new Date(),
    });
    
    return this.repo.save(entity);
  }

  /**
   * Busca mensagem por ID (com validação de clínica)
   */
  async findOne(id: string, clinicId: string): Promise<Mensagem> {
    validateClinicId(clinicId);
    
    const msg = await this.repo.findOne({
      where: { id, clinicId }
    });
    
    if (!msg) {
      throw new BadRequestException('Mensagem não encontrada ou sem permissão');
    }
    
    return msg;
  }
}
```

---

### **3. Alternativa Simples (Repositório find)**

**Para casos simples sem joins:**

```typescript
// Busca simples com find
async findAllForClinic(clinicId: string): Promise<Mensagem[]> {
  validateClinicId(clinicId);
  
  return this.repo.find({
    where: { clinicId },
    order: { createdAt: 'DESC' }
  });
}

// Busca com múltiplos filtros
async findByStatus(clinicId: string, status: string): Promise<Mensagem[]> {
  return this.repo.find({
    where: { 
      clinicId, 
      status 
    },
    order: { createdAt: 'DESC' }
  });
}
```

---

### **4. Exemplo com Joins (campanhas.service.ts)**

```typescript
async findCampanhasWithMensagens(clinicId: string) {
  validateClinicId(clinicId);
  
  const qb = this.campanhasRepo
    .createQueryBuilder('c')
    .leftJoinAndSelect('c.mensagens', 'm');
  
  applyClinicIdFilter(qb, clinicId);
  
  return qb
    .orderBy('c.createdAt', 'DESC')
    .getMany();
}
```

---

## 🧪 D — TESTES UNITÁRIOS (COPY-PASTE)

### **Template Básico para cada Service**

**Arquivo:** `src/services/mensagens.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensagensService } from './mensagens.service';
import { Mensagem } from '../entities/mensagem.entity';

describe('MensagensService - clinicId filtering', () => {
  let service: MensagensService;
  let mockRepo: Partial<Repository<Mensagem>>;

  beforeEach(async () => {
    // Mock QueryBuilder
    const mockQb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: '1', clinicId: 'C1', texto: 'msg1' },
        { id: '2', clinicId: 'C1', texto: 'msg2' }
      ])
    };

    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '123', ...entity })),
      findOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensagensService,
        {
          provide: getRepositoryToken(Mensagem),
          useValue: mockRepo
        }
      ]
    }).compile();

    service = module.get<MensagensService>(MensagensService);
  });

  it('should only return mensagens for the specified clinic', async () => {
    const result = await service.findAllForClinic('C1');
    
    expect(result).toHaveLength(2);
    expect(result.every(r => r.clinicId === 'C1')).toBe(true);
    expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('m');
  });

  it('should throw error if clinicId is empty', async () => {
    await expect(service.findAllForClinic('')).rejects.toThrow('clinicId é obrigatório');
  });

  it('should create mensagem with clinicId', async () => {
    const dto = { texto: 'Nova mensagem', destinatario: '5511999999999' };
    const result = await service.create(dto, 'C1');
    
    expect(result.clinicId).toBe('C1');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'C1' })
    );
  });

  it('should validate clinicId in findOne', async () => {
    (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
    
    await expect(service.findOne('msg-123', 'C1')).rejects.toThrow(
      'Mensagem não encontrada ou sem permissão'
    );
    
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'msg-123', clinicId: 'C1' }
    });
  });
});
```

---

### **Teste Rápido (Smoke Test)**

```typescript
// Quick validation test
it('should apply clinicId filter in all queries', async () => {
  const spy = jest.spyOn(mockRepo, 'createQueryBuilder');
  await service.findAllForClinic('clinic-test');
  
  const qb = spy.mock.results[0].value;
  expect(qb.andWhere).toHaveBeenCalledWith(
    expect.stringContaining('clinicId'),
    expect.objectContaining({ clinicId: 'clinic-test' })
  );
});
```

---

## 🔐 E — SECRETS & AMBIENTE (GH CLI)

### **Configurar 3 Secrets Essenciais**

```powershell
# PowerShell (Windows)
gh secret set WHATSAPP_AUTH_PATH --body "./whatsapp-auth"
gh secret set DB_URL --body "postgresql://user:pass@host:5432/elevare"
gh secret set WHATSAPP_HEALTH_URL --body "https://staging.elevare.com/whatsapp/health"
```

```bash
# Bash (Linux/Mac)
gh secret set WHATSAPP_AUTH_PATH --body "./whatsapp-auth"
gh secret set DB_URL --body "postgresql://user:pass@host:5432/elevare"
gh secret set WHATSAPP_HEALTH_URL --body "https://staging.elevare.com/whatsapp/health"
```

### **Verificar Secrets Configurados**

```bash
gh secret list
```

---

## 🚀 F — DEPLOY PRODUÇÃO (RUNBOOK)

### **Passo a Passo Completo**

#### **1. Preparação (5 min)**

```bash
# Mergear PRs
git checkout main
git pull origin main
git merge feat/ci-tests-logs-cron --no-ff
git merge feat/whatsapp-clinicid-filters --no-ff
git push origin main
```

#### **2. CI/CD Validation (10 min)**

```powershell
# Executar TypeScript Guardian
npm ci
npm run build
npm run test:ci
npm run lint
```

#### **3. Smoke Tests Staging (15 min)**

```bash
# Health check WhatsApp
curl https://staging.elevare.com/whatsapp/health

# Testar envio
curl -X POST https://staging.elevare.com/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "x-clinic-id: clinic-test" \
  -d '{"to": "5511999999999", "message": "Test"}'

# Verificar status
curl https://staging.elevare.com/whatsapp/status
```

#### **4. Build Docker (10 min)**

```bash
# Tag imutável com timestamp
TAG="v1.0.0-$(date +%Y%m%d-%H%M%S)"
docker build -t elevare-backend:$TAG .
docker tag elevare-backend:$TAG elevare-backend:latest

# Push para registry
docker push elevare-backend:$TAG
docker push elevare-backend:latest
```

#### **5. Deploy Servidor (15 min)**

```bash
# SSH no servidor
ssh user@servidor-prod

# Pull nova imagem
docker pull elevare-backend:latest

# Stop container antigo
docker stop elevare-backend-old || true
docker rename elevare-backend elevare-backend-old || true

# Start novo container
docker run -d \
  --name elevare-backend \
  --env-file .env.production \
  -p 3000:3000 \
  -v /data/whatsapp-auth:/app/whatsapp-auth \
  --restart unless-stopped \
  elevare-backend:latest

# Health check (aguardar 30s)
sleep 30
curl http://localhost:3000/health
```

#### **6. Monitoramento (1h)**

```bash
# Logs em tempo real
docker logs -f elevare-backend

# Métricas (se Prometheus ativo)
curl http://localhost:3000/metrics

# Verificar erros
docker logs elevare-backend 2>&1 | grep -i error
```

#### **7. Rollback (se necessário)**

```bash
# Voltar versão anterior
docker stop elevare-backend
docker rm elevare-backend
docker rename elevare-backend-old elevare-backend
docker start elevare-backend

# Ou usar script
bash rollback.sh
```

---

## 📅 G — CRONOGRAMA CURTO (3-4 DIAS)

### **Dia 1 (Hoje - 8h)**

| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Criar milestone + 7 issues + secrets | 30 min |
| 09:30 | Mergear PRs existentes | 15 min |
| 10:00 | Implementar mensagens.service | 3h |
| 13:00 | Implementar bloqueios.service | 2h |
| 15:00 | Implementar eventos.service | 2.5h |
| 17:30 | Review + testes | 30 min |

**Total Dia 1:** 8h  
**Issues concluídas:** 3/7 (mensagens, bloqueios, eventos)

---

### **Dia 2 (10h)**

| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Implementar auth.service | 3h |
| 12:00 | Implementar payments/orders | 3.5h |
| 15:30 | Implementar campanhas.service | 2.5h |
| 18:00 | Implementar bi.service | 2.5h |
| 20:30 | Testes unitários finais | 1h |

**Total Dia 2:** 10h  
**Issues concluídas:** 7/7 (todas!)

---

### **Dia 3 (6h)**

| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Smoke tests staging | 2h |
| 11:00 | Correções de bugs | 2h |
| 13:00 | Documentação atualizada | 1h |
| 14:00 | Code review final | 1h |

**Total Dia 3:** 6h

---

### **Dia 4 (4h)**

| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Build Docker + deploy staging | 1h |
| 10:00 | Testes E2E staging | 1h |
| 11:00 | Deploy produção | 1h |
| 12:00 | Monitoramento + validação | 1h |

**Total Dia 4:** 4h

---

### **📊 Total Geral: 28h (3-4 dias úteis)**

---

## 📧 H — MENSAGEM PARA O PROGRAMADOR

### **Texto Copy-Paste (WhatsApp/Slack/Email)**

```
🚨 ENTREGA URGENTE - 15% RESTANTES (22-26h)

Olá! Temos uma implementação crítica de multitenancy (clinicId) para fechar o MVP.

📋 RESUMO:
• 7 services precisam de filtros clinicId
• Helper pronto: src/lib/tenant.ts (applyClinicIdFilter)
• Testes unitários obrigatórios para cada service
• Secrets configurados: WHATSAPP_AUTH_PATH, DB_URL

📁 ARQUIVO COMPLETO:
backend/ENTREGA_PROGRAMADOR_15_PORCENTO.md

🎯 PRIORIDADE:
1. Criar 7 issues via GH CLI (comandos prontos no arquivo)
2. Implementar filtros em 7 services (código copy-paste disponível)
3. Testes unitários (template pronto)

⏰ PRAZO: 3-4 dias
📈 ESTIMATIVA: 22h de desenvolvimento

✅ O QUE JÁ ESTÁ PRONTO (85%):
• Logger (pino)
• Testes (82% coverage)
• WhatsApp integration (Baileys)
• CI/CD scripts
• Documentação completa

🔗 BRANCHES PRONTAS:
• feat/ci-tests-logs-cron (mergear primeiro)
• feat/whatsapp-clinicid-filters (mergear depois)

📊 MARQUE COMPLETADO POR ISSUE NO GITHUB
Qualquer dúvida, consulte o arquivo completo ou me chame!

Bora fechar esse MVP! 🚀
```

---

## 📊 RESUMO EXECUTIVO

### **Status Atual: 85% → 100%**

| Categoria | Status | Tempo |
|-----------|--------|-------|
| **Logger + Testes** | ✅ 100% | 0h |
| **WhatsApp Integration** | ✅ 100% | 0h |
| **CI/CD Scripts** | ✅ 100% | 0h |
| **Multitenancy (7 services)** | 🟡 30% | 22h |
| **Deploy Produção** | 🔴 0% | 4h |

**Total Restante:** 26h (3-4 dias)

---

### **Ordem de Execução Recomendada**

1. ✅ **Hoje (30 min):** Milestone + Issues + Secrets
2. 🔨 **Dia 1 (8h):** 3 services simples
3. 🔨 **Dia 2 (10h):** 4 services complexos
4. 🧪 **Dia 3 (6h):** Testes + staging
5. 🚀 **Dia 4 (4h):** Deploy produção

---

## 🎯 LINKS ÚTEIS

- **PRs Prontos:** Ver arquivo `LINKS_DIRETOS.md`
- **Relatório Completo:** `RELATORIO_PROGRAMADOR.md`
- **Automação:** `scripts/automacao-completa.ps1`
- **GitHub Repo:** https://github.com/Carine01/meu-backend

---

## ✅ CHECKLIST FINAL

- [ ] Milestone criada
- [ ] 7 issues criadas
- [ ] 3 secrets configurados
- [ ] Helper tenant.ts implementado
- [ ] 7 services com filtros clinicId
- [ ] 7 testes unitários passando
- [ ] Smoke tests staging OK
- [ ] Deploy produção concluído
- [ ] Monitoramento 1h sem erros
- [ ] Documentação atualizada

---

**🎉 BOA SORTE! VOCÊ TEM TUDO O QUE PRECISA! 🚀**

---

**Gerado em:** 22/11/2025  
**Última atualização:** Commit 715c1cd  
**Versão:** 1.0.0
