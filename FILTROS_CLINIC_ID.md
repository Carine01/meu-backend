# 🔐 Guia de Implementação: Filtros por clinicId

## ⚠️ CRÍTICO: Isolamento de Dados entre Clínicas

**Problema:** Atualmente, todos os repositories buscam dados sem filtrar por `clinicId`, permitindo que:
- Clínica A veja leads da Clínica B
- Indicações sejam contabilizadas entre clínicas diferentes
- Agendamentos apareçam em dashboards errados

**Solução:** Adicionar `clinicId` como parâmetro obrigatório em TODOS os métodos dos services.

---

## 📋 Checklist de Refatoração

### Services que PRECISAM ser modificados:
- [ ] `src/modules/indicacoes/indicacoes.service.ts` (CRÍTICO)
- [ ] `src/modules/bi/bi.service.ts` (CRÍTICO - métricas vazam)
- [ ] `src/modules/fila/fila.service.ts` (CRÍTICO - mensagens erradas)
- [ ] `src/modules/agendamentos/agendamentos.service.ts`
- [ ] `src/modules/agendamentos/bloqueios.service.ts`
- [ ] `src/modules/leads/leads-score.service.ts`
- [ ] `src/modules/eventos/events.service.ts`

---

## 🔧 Exemplo Prático: IndicacoesService

### ❌ ANTES (INSEGURO):
```typescript
async registrarIndicacao(
  indicadorId: string,
  dados: DadosIndicacao,
): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
  // PROBLEMA: Qualquer clínica pode indicar para qualquer lead
  const indicacao = this.indicacaoRepo.create({
    indicadorId,
    nomeIndicado: dados.nome,
    // ...
  });
  
  // PROBLEMA: Busca recompensa sem filtrar
  let recompensa = await this.recompensaRepo.findOne({
    where: { leadId: indicadorId },
  });
}
```

### ✅ DEPOIS (SEGURO):
```typescript
async registrarIndicacao(
  indicadorId: string,
  clinicId: string, // <-- NOVO PARÂMETRO
  dados: DadosIndicacao,
): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
  // 1. Validar que indicador pertence à clínica
  const indicador = await this.leadRepo.findOne({
    where: { id: indicadorId, clinicId },
  });
  
  if (!indicador) {
    throw new NotFoundException('Lead não encontrado nesta clínica');
  }
  
  // 2. Criar indicação com clinicId
  const indicacao = this.indicacaoRepo.create({
    indicadorId,
    clinicId, // <-- GRAVAR CLINIC_ID
    nomeIndicado: dados.nome,
    // ...
  });
  
  // 3. Buscar recompensa COM filtro
  let recompensa = await this.recompensaRepo.findOne({
    where: { 
      leadId: indicadorId, 
      clinicId, // <-- FILTRO CRÍTICO
    },
  });
  
  // 4. Criar recompensa COM clinicId se não existir
  if (!recompensa) {
    recompensa = this.recompensaRepo.create({
      leadId: indicadorId,
      clinicId, // <-- NOVO CAMPO
      pontosAcumulados: 0,
      // ...
    });
  }
}
```

---

## 🎯 Padrão de Modificação

### TODOS os métodos devem seguir este padrão:

```typescript
// ❌ ANTES
async metodoQualquer(leadId: string) {
  return this.repo.findOne({ where: { leadId } });
}

// ✅ DEPOIS
async metodoQualquer(leadId: string, clinicId: string) {
  return this.repo.findOne({ 
    where: { leadId, clinicId } // <-- SEMPRE AMBOS
  });
}
```

---

## 🔥 Controllers: Extrair clinicId do Token JWT

### ❌ ANTES:
```typescript
@Post()
async criar(@Body() dados: any) {
  return this.service.criar(dados);
}
```

### ✅ DEPOIS:
```typescript
@Post()
@UseGuards(JwtAuthGuard)
async criar(@Body() dados: any, @Req() req: any) {
  const clinicId = req.user.clinicId; // <-- Extrair do JWT
  return this.service.criar(dados, clinicId);
}
```

---

## 📊 BiService: Exemplo Completo

### ❌ ANTES (MÉTRICAS VAZAM ENTRE CLÍNICAS):
```typescript
async getDashboardMetrics(): Promise<any> {
  const leads30d = await this.leadRepo.count({
    where: { createdAt: MoreThan(thirtyDaysAgo) },
  });
  // PROBLEMA: Conta leads de TODAS as clínicas
}
```

### ✅ DEPOIS:
```typescript
async getDashboardMetrics(clinicId: string): Promise<any> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const leads30d = await this.leadRepo.count({
    where: { 
      createdAt: MoreThan(thirtyDaysAgo),
      clinicId, // <-- FILTRO CRÍTICO
    },
  });
  
  const agendados30d = await this.agendamentoRepo.count({
    where: { 
      createdAt: MoreThan(thirtyDaysAgo),
      clinicId, // <-- FILTRO CRÍTICO
    },
  });
  
  // TODAS as queries precisam do filtro
  return { leads30d, agendados30d /* ... */ };
}
```

---

## 🚨 FilaService: Caso Crítico

### PROBLEMA:
- Fila pode enviar mensagens para leads de outra clínica
- WhatsApp da clínica A envia para lead da clínica B

### SOLUÇÃO:
```typescript
// ❌ ANTES
async adicionarNaFila(leadId: string, mensagemKey: string) {
  const lead = await this.leadsService.findById(leadId);
  // ...
}

// ✅ DEPOIS
async adicionarNaFila(
  leadId: string, 
  mensagemKey: string,
  clinicId: string, // <-- OBRIGATÓRIO
) {
  // Validar que lead pertence à clínica
  const lead = await this.leadsService.findById(leadId, clinicId);
  
  if (!lead) {
    throw new NotFoundException('Lead não encontrado nesta clínica');
  }
  
  // Criar item com clinicId
  const itemFila = this.filaRepo.create({
    leadId,
    clinicId, // <-- GRAVAR
    mensagemKey,
    // ...
  });
}
```

---

## 🗄️ Migrations: Adicionar Colunas

```sql
-- 1. Adicionar clinic_id às tabelas
ALTER TABLE indicacoes ADD COLUMN clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
ALTER TABLE recompensas ADD COLUMN clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
ALTER TABLE fila_envios ADD COLUMN clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
ALTER TABLE eventos ADD COLUMN clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';

-- 2. Criar índices compostos para performance
CREATE INDEX idx_indicacoes_clinic_indicador ON indicacoes(clinic_id, indicador_id);
CREATE INDEX idx_recompensas_clinic_lead ON recompensas(clinic_id, lead_id);
CREATE INDEX idx_fila_clinic_status ON fila_envios(clinic_id, status);
CREATE INDEX idx_eventos_clinic_lead ON eventos(clinic_id, lead_id);

-- 3. Adicionar constraints
ALTER TABLE indicacoes ADD CONSTRAINT fk_indicacoes_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinicas(id);
-- Repetir para outras tabelas
```

---

## ✅ Teste de Validação

### Criar 2 clínicas e testar isolamento:

```typescript
// Criar usuários de 2 clínicas diferentes
const userA = await authService.register({
  email: 'userA@clinicaA.com',
  senha: 'senha123',
  nome: 'User A',
  clinicId: 'CLINICA_A',
});

const userB = await authService.register({
  email: 'userB@clinicaB.com',
  senha: 'senha123',
  nome: 'User B',
  clinicId: 'CLINICA_B',
});

// User A cria lead
const leadA = await leadsService.criarLead({ nome: 'Lead A' }, 'CLINICA_A');

// User B NÃO DEVE VER lead A
const result = await leadsService.findById(leadA.id, 'CLINICA_B');
// Deve retornar null ou lançar NotFoundException

// User A pode ver seu próprio lead
const leadEncontrado = await leadsService.findById(leadA.id, 'CLINICA_A');
// Deve retornar leadA
```

---

## 🚀 Ordem de Implementação Recomendada

### Prioridade 1 (HOJE - 2h):
1. **BiService** - Evitar vazamento de métricas
2. **IndicacoesService** - Evitar gamificação entre clínicas
3. **FilaService** - Evitar mensagens erradas

### Prioridade 2 (AMANHÃ - 1h):
4. **AgendamentosService** - Isolamento de agendas
5. **BloqueiosService** - Bloqueios por clínica
6. **EventsService** - Timeline isolada

### Prioridade 3 (DEPOIS - 30min):
7. **LeadsScoreService** - Scoring isolado
8. Adicionar migrations para clinic_id
9. Testes E2E de isolamento

---

## 🔍 Como Verificar se Está Seguro

```bash
# Buscar todos os findOne/find sem clinicId
grep -r "findOne({" src/modules/**/*.service.ts | grep -v "clinicId"

# Deve retornar NADA (ou apenas findByEmail em AuthService)
```

---

## 📝 Exemplo de PR Review Checklist

- [ ] Todos os métodos recebem `clinicId` como parâmetro
- [ ] Controllers extraem `clinicId` do `req.user`
- [ ] Todas as queries TypeORM incluem `{ where: { ..., clinicId } }`
- [ ] Entidades têm coluna `clinicId` com valor padrão
- [ ] Índices compostos criados para performance
- [ ] Testes E2E validam isolamento entre clínicas
- [ ] Documentação atualizada com novos parâmetros

---

**Status:** 🔴 CRÍTICO - Implementar ANTES de produção  
**Tempo Estimado:** 3-4 horas  
**Risco sem isso:** Vazamento de dados entre clínicas (violação LGPD)
