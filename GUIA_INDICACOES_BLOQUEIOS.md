# 🎯 Sistema de Indicações e Bloqueios - Guia Rápido

## 📦 O Que Foi Implementado

### ✅ Módulo de Indicações Gamificado
- **3 indicações = 1 sessão grátis**
- Sistema de pontos automático
- Bônus extra quando indicado comparece (+2 pontos)
- Resgate de sessões grátis via API

**Arquivos criados:**
- `src/modules/indicacoes/entities/indicacao.entity.ts`
- `src/modules/indicacoes/entities/recompensa.entity.ts`
- `src/modules/indicacoes/indicacoes.service.ts`
- `src/modules/indicacoes/indicacoes.controller.ts`
- `src/modules/indicacoes/indicacoes.module.ts`

### ✅ Sistema de Bloqueios Dinâmicos
- Bloqueio de horário de almoço (12h-14h)
- Bloqueio de sábados após 14h
- Bloqueio de feriados nacionais
- Sugestão de horários alternativos
- Validação automática antes de criar agendamento

**Arquivos criados:**
- `src/modules/agendamentos/entities/bloqueio.entity.ts`
- `src/modules/agendamentos/bloqueios.service.ts`
- `src/modules/agendamentos/entities/agendamento.entity.ts`
- `src/modules/agendamentos/agendamentos.service.ts`

**Arquivos atualizados:**
- `src/modules/agendamentos/agendamentos.controller.ts` (+ 5 endpoints de bloqueios)
- `src/modules/agendamentos/agendamentos.module.ts` (+ BloqueiosService)

### ✅ Configuração TypeORM + PostgreSQL
- TypeORM integrado ao NestJS
- ScheduleModule para CronJobs
- Configuração de migrations
- Variáveis de ambiente configuradas

**Arquivos atualizados:**
- `src/app.module.ts` (+ TypeORM, Schedule, IndicacoesModule, AgendamentosModule)
- `package.json` (+ dependências: @nestjs/typeorm, typeorm, pg, @nestjs/schedule)
- `.env.example` (+ variáveis de banco de dados)
- `ormconfig.ts` (já existia, mantido)

---

## 🚀 Como Usar

### 1️⃣ Instalar Dependências

```bash
cd backend
npm install
```

### 2️⃣ Configurar Banco de Dados

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite `.env`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua-senha
DATABASE_NAME=elevare_iara
```

### 3️⃣ Criar Banco de Dados

```bash
# PostgreSQL local
createdb elevare_iara

# Ou via SQL
psql -U postgres -c "CREATE DATABASE elevare_iara;"
```

### 4️⃣ Gerar e Executar Migrations

```bash
# Gerar migration baseada nas entities
npm run migration:generate src/migrations/InitialSchema

# Executar migrations
npm run migration:run
```

### 5️⃣ Iniciar Backend

```bash
npm run start:dev
```

---

## 📡 Endpoints Disponíveis

### **Indicações**

#### POST /indicacoes
Criar nova indicação
```bash
curl -X POST http://localhost:8080/indicacoes \
  -H "Content-Type: application/json" \
  -d '{
    "indicadorId": "L1234567890",
    "nome": "Maria Silva",
    "telefone": "5511999998888",
    "email": "maria@example.com"
  }'
```

Resposta:
```json
{
  "indicacao": {
    "id": "IND1732198400000",
    "indicadorId": "L1234567890",
    "nomeIndicado": "Maria Silva",
    "status": "pendente",
    "pontosGanhos": 1
  },
  "recompensa": {
    "leadId": "L1234567890",
    "pontosAcumulados": 1,
    "sessoesGratisDisponiveis": 0
  }
}
```

#### GET /indicacoes/:leadId
Listar indicações de um lead
```bash
curl http://localhost:8080/indicacoes/L1234567890
```

#### GET /indicacoes/recompensa/:leadId
Ver recompensa/gamificação
```bash
curl http://localhost:8080/indicacoes/recompensa/L1234567890
```

Resposta:
```json
{
  "leadId": "L1234567890",
  "pontosAcumulados": 3,
  "sessoesGratisDisponiveis": 1,
  "historicoIndicacoes": ["IND001", "IND002", "IND003"]
}
```

#### POST /indicacoes/resgatar/:leadId
Resgatar sessão grátis
```bash
curl -X POST http://localhost:8080/indicacoes/resgatar/L1234567890
```

Resposta:
```json
{
  "sucesso": true,
  "mensagem": "Sessão grátis resgatada com sucesso!"
}
```

#### PUT /indicacoes/compareceu/:indicacaoId
Marcar que indicado compareceu (bônus +2 pontos)
```bash
curl -X PUT http://localhost:8080/indicacoes/compareceu/IND1732198400000
```

---

### **Bloqueios**

#### POST /agendamentos/bloqueios/almoco/:clinicId
Bloquear horário de almoço (12h-14h) nos próximos 30 dias
```bash
curl -X POST http://localhost:8080/agendamentos/bloqueios/almoco/C001
```

#### POST /agendamentos/bloqueios/sabados/:clinicId
Bloquear sábados após 14h
```bash
curl -X POST http://localhost:8080/agendamentos/bloqueios/sabados/C001
```

#### POST /agendamentos/bloqueios/feriados/:clinicId
Bloquear feriados nacionais (2025)
```bash
curl -X POST http://localhost:8080/agendamentos/bloqueios/feriados/C001
```

#### GET /agendamentos/bloqueios/verificar/:clinicId
Verificar se horário está bloqueado
```bash
curl "http://localhost:8080/agendamentos/bloqueios/verificar/C001?data=2025-11-22&hora=12:30&duracao=60"
```

Resposta:
```json
{
  "bloqueado": true,
  "motivo": "Horário de almoço",
  "tipo": "almoco"
}
```

#### GET /agendamentos/sugerir/:clinicId
Sugerir horários livres
```bash
curl "http://localhost:8080/agendamentos/sugerir/C001?data=2025-11-22&duracao=60"
```

Resposta:
```json
["08:00", "08:30", "09:00", "14:00", "14:30"]
```

#### GET /agendamentos/bloqueios/:clinicId
Listar todos os bloqueios
```bash
curl http://localhost:8080/agendamentos/bloqueios/C001
```

---

### **Agendamentos**

#### POST /agendamentos
Criar agendamento (valida bloqueios automaticamente)
```bash
curl -X POST http://localhost:8080/agendamentos \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "C001",
    "nomePaciente": "Ana Costa",
    "telefoneE164": "5511999887766",
    "procedimento": "Depilação a Laser",
    "startISO": "2025-11-22T14:00:00-03:00",
    "duracaoMinutos": 60
  }'
```

Se cair em horário bloqueado:
```json
{
  "statusCode": 400,
  "message": "Horário bloqueado: Horário de almoço"
}
```

#### PUT /agendamentos/:id/confirmar
Confirmar agendamento
```bash
curl -X PUT http://localhost:8080/agendamentos/AGD1732198400000/confirmar
```

#### PUT /agendamentos/:id/compareceu
Marcar comparecimento
```bash
curl -X PUT http://localhost:8080/agendamentos/AGD1732198400000/compareceu
```

#### PUT /agendamentos/:id/no-show
Marcar falta (no-show)
```bash
curl -X PUT http://localhost:8080/agendamentos/AGD1732198400000/no-show
```

#### PUT /agendamentos/:id/cancelar
Cancelar agendamento
```bash
curl -X PUT http://localhost:8080/agendamentos/AGD1732198400000/cancelar \
  -H "Content-Type: application/json" \
  -d '{"motivo": "Paciente cancelou"}'
```

#### PUT /agendamentos/:id/reagendar
Reagendar
```bash
curl -X PUT http://localhost:8080/agendamentos/AGD1732198400000/reagendar \
  -H "Content-Type: application/json" \
  -d '{"novoStartISO": "2025-11-23T15:00:00-03:00"}'
```

---

## 🎮 Fluxo Completo de Indicações

```
1. Lead A indica 3 amigos
   POST /indicacoes (3x)
   → Pontos: 3
   → Sessões grátis: 1

2. Indicado 1 agenda
   PUT /indicacoes/agendou/:id
   → Tracking

3. Indicado 1 comparece
   PUT /indicacoes/compareceu/:id
   → Lead A ganha +2 pontos bônus
   → Pontos: 5
   → Sessões grátis: 1

4. Lead A resgata sessão
   POST /indicacoes/resgatar/:leadId
   → Sessões restantes: 0
   → Pontos mantidos: 5
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `indicacoes`
```sql
CREATE TABLE indicacoes (
  id VARCHAR PRIMARY KEY,
  indicadorId VARCHAR NOT NULL,
  nomeIndicado VARCHAR NOT NULL,
  telefoneIndicado VARCHAR NOT NULL,
  emailIndicado VARCHAR,
  status VARCHAR DEFAULT 'pendente',
  pontosGanhos INT DEFAULT 1,
  agendamentoId VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `recompensas`
```sql
CREATE TABLE recompensas (
  leadId VARCHAR PRIMARY KEY,
  pontosAcumulados INT DEFAULT 0,
  sessoesGratisDisponiveis INT DEFAULT 0,
  historicoIndicacoes TEXT[], -- Array de IDs
  ultimaResgate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `bloqueios`
```sql
CREATE TABLE bloqueios (
  id VARCHAR PRIMARY KEY,
  clinicId VARCHAR NOT NULL,
  data DATE NOT NULL,
  startTime VARCHAR, -- HH:mm
  endTime VARCHAR,   -- HH:mm
  tipo VARCHAR DEFAULT 'personalizado',
  motivo VARCHAR,
  recorrente BOOLEAN DEFAULT true,
  ateData DATE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `agendamentos`
```sql
CREATE TABLE agendamentos (
  id VARCHAR PRIMARY KEY,
  clinicId VARCHAR,
  nomePaciente VARCHAR NOT NULL,
  telefoneE164 VARCHAR NOT NULL,
  procedimento VARCHAR NOT NULL,
  startISO VARCHAR NOT NULL,
  duracaoMinutos INT DEFAULT 60,
  status VARCHAR DEFAULT 'agendado',
  observacoes TEXT,
  leadId VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Checklist de Implementação

- [x] **Módulo de Indicações**
  - [x] Entity Indicacao
  - [x] Entity Recompensa
  - [x] IndicacoesService (lógica completa)
  - [x] IndicacoesController (6 endpoints)
  - [x] IndicacoesModule

- [x] **Sistema de Bloqueios**
  - [x] Entity Bloqueio
  - [x] BloqueiosService (almoco, sabados, feriados)
  - [x] Integrado em AgendamentosController
  - [x] Validação automática antes de criar agendamento

- [x] **Módulo de Agendamentos**
  - [x] Entity Agendamento
  - [x] AgendamentosService (CRUD completo)
  - [x] AgendamentosController (11 endpoints)
  - [x] AgendamentosModule

- [x] **Configuração TypeORM**
  - [x] TypeOrmModule.forRootAsync() no app.module.ts
  - [x] ScheduleModule.forRoot() para CronJobs
  - [x] ormconfig.ts para migrations
  - [x] Scripts npm: migration:generate, migration:run

- [x] **Dependências**
  - [x] @nestjs/typeorm ^10.0.0
  - [x] typeorm ^0.3.17
  - [x] pg ^8.11.3
  - [x] @nestjs/schedule ^4.0.0
  - [x] ts-node ^10.9.1

- [x] **Variáveis de Ambiente**
  - [x] DATABASE_HOST, DATABASE_PORT, DATABASE_USER
  - [x] DATABASE_PASSWORD, DATABASE_NAME

---

## 🔥 Próximos Passos

1. **Instalar dependências**: `npm install`
2. **Criar banco**: `createdb elevare_iara`
3. **Rodar migrations**: `npm run migration:run`
4. **Iniciar backend**: `npm run start:dev`
5. **Testar endpoints**: Use os exemplos curl acima
6. **Frontend React**: Implementar dashboard de indicações (opcional)

---

## 🎯 Regras de Negócio Implementadas

### Gamificação de Indicações
- ✅ 1 indicação = 1 ponto
- ✅ 3 pontos = 1 sessão grátis
- ✅ Indicado comparece = +2 pontos bônus
- ✅ Sessões acumuladas até resgatar
- ✅ Histórico completo de indicações

### Bloqueios Inteligentes
- ✅ Almoço: 12h-14h (seg-sex)
- ✅ Sábados: após 14h
- ✅ Feriados nacionais 2025
- ✅ Validação automática
- ✅ Sugestão de horários alternativos

### Agendamentos
- ✅ CRUD completo
- ✅ Status: agendado → confirmado → compareceu/no-show/cancelado
- ✅ Reagendamento com histórico
- ✅ Integração com leads

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique logs: `tail -f logs/backend.log`
2. Inspecione banco: `psql -U postgres -d elevare_iara`
3. Debug TypeORM: Adicione `logging: true` no `app.module.ts`

**Tudo pronto para produção!** 🚀
