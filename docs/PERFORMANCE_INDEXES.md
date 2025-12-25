# Database Performance Indexes

## Overview
This document contains recommended database indexes to optimize query performance across the application.

## Firestore Indexes

### Required Composite Indexes

#### 1. fila_envio Collection
**Purpose:** Optimize queue processing queries

```javascript
// Index for processarFila() method in FilaService
{
  collection: 'fila_envio',
  fields: [
    { field: 'status', order: 'ASCENDING' },
    { field: 'scheduledFor', order: 'ASCENDING' }
  ]
}
```

**Query:** `where('status', '==', 'pending').where('scheduledFor', '<=', now).orderBy('scheduledFor', 'asc')`

**Location:** `src/modules/fila/fila.service.ts:165-171`

#### 2. leads Collection - createdAt Index
**Purpose:** Optimize dashboard metrics queries

```javascript
{
  collection: 'leads',
  fields: [
    { field: 'createdAt', order: 'ASCENDING' }
  ]
}
```

**Queries:** Dashboard metrics for 30d, 7d, today filtering
**Location:** `src/modules/bi/bi.service.ts:116-125`

#### 3. agendamentos Collection - Status and CreatedAt
**Purpose:** Optimize appointment filtering by status and date

```javascript
{
  collection: 'agendamentos',
  fields: [
    { field: 'createdAt', order: 'ASCENDING' },
    { field: 'status', order: 'ASCENDING' }
  ]
}
```

**Queries:** Multiple queries filtering by date range and status
**Location:** `src/modules/bi/bi.service.ts:152-190`

#### 4. fila_envio Collection - Status and CreatedAt
**Purpose:** List queue items by status

```javascript
{
  collection: 'fila_envio',
  fields: [
    { field: 'status', order: 'ASCENDING' },
    { field: 'createdAt', order: 'DESCENDING' }
  ]
}
```

**Query:** `where('status', '==', status).orderBy('createdAt', 'desc')`
**Location:** `src/modules/fila/fila.service.ts:358-364`

### Single-Field Indexes

These are typically created automatically by Firestore, but verify they exist:

1. **leads.telefone** - Used for phone number lookups
2. **leads.origem** - Used for source filtering
3. **agendamentos.clinicId** - Used for clinic filtering
4. **agendamentos.telefoneE164** - Used for phone lookups

## PostgreSQL/TypeORM Indexes

### agendamentos Table

```sql
-- Index for filtering by clinic
CREATE INDEX idx_agendamentos_clinic_id ON agendamentos(clinic_id);

-- Index for sorting by start time
CREATE INDEX idx_agendamentos_start_iso ON agendamentos(start_iso);

-- Composite index for clinic + start time queries
CREATE INDEX idx_agendamentos_clinic_start ON agendamentos(clinic_id, start_iso);

-- Index for status filtering
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
```

**Location:** `src/modules/agendamentos/agendamentos.service.ts`

### usuarios Table

```sql
-- Index for email lookups (login)
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);

-- Index for username lookups
CREATE INDEX idx_usuarios_username ON usuarios(username);
```

**Location:** `src/modules/auth/auth.service.ts:29-36`

### indicacoes Table

```sql
-- Index for filtering by indicador
CREATE INDEX idx_indicacoes_indicador_id ON indicacoes(indicador_id);

-- Index for filtering by lead indicado
CREATE INDEX idx_indicacoes_lead_indicado_id ON indicacoes(lead_indicado_id);

-- Index for status filtering
CREATE INDEX idx_indicacoes_status ON indicacoes(status);
```

**Location:** `src/modules/indicacoes/indicacoes.service.ts`

### recompensas Table

```sql
-- Composite index for user + type filtering
CREATE INDEX idx_recompensas_user_type ON recompensas(usuario_id, tipo);

-- Index for status filtering
CREATE INDEX idx_recompensas_status ON recompensas(status);
```

**Location:** `src/modules/indicacoes/indicacoes.service.ts`

## Implementation Instructions

### For Firestore Indexes

1. **Via Firebase Console:**
   - Go to Firebase Console → Firestore → Indexes
   - Click "Create Index"
   - Add the collection and fields as specified above

2. **Via firestore.indexes.json:**
   - Add indexes to `firestore.indexes.json` file
   - Deploy with: `firebase deploy --only firestore:indexes`

3. **Automatically via Error Messages:**
   - Run queries that need indexes
   - Firestore will provide a direct link to create the index
   - Follow the link and confirm index creation

### For PostgreSQL Indexes

1. **Via TypeORM Migration:**
   ```bash
   npm run migration:generate -- CreatePerformanceIndexes
   ```

2. **Manually add to migration file:**
   ```typescript
   export class CreatePerformanceIndexes1234567890 implements MigrationInterface {
     public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`CREATE INDEX idx_agendamentos_clinic_id ON agendamentos(clinic_id)`);
       // ... add other indexes
     }
     
     public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`DROP INDEX idx_agendamentos_clinic_id`);
       // ... drop other indexes
     }
   }
   ```

3. **Run migration:**
   ```bash
   npm run migration:run
   ```

## Performance Impact

### Expected Improvements

- **Queue Processing:** 80-90% faster query time on fila_envio
- **Dashboard Metrics:** 70-80% faster on date-range queries
- **Appointment Lookups:** 60-70% faster for clinic-specific queries
- **User Authentication:** Near-instant login queries with email index

### Monitoring

Monitor query performance using:
- Firestore Console → Usage → Query Performance
- PostgreSQL: `EXPLAIN ANALYZE` on slow queries
- Application logs: Check query execution times in Pino logs

## Maintenance

### Regular Tasks

1. **Monthly:** Review slow query logs
2. **Quarterly:** Analyze index usage and remove unused indexes
3. **On Schema Changes:** Update indexes accordingly

### Index Bloat (PostgreSQL)

Monitor and reindex if needed:
```sql
-- Check index size
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Reindex if needed
REINDEX INDEX idx_agendamentos_clinic_id;
```

## Additional Optimizations

### Caching Strategy
Consider implementing caching for:
- Top etiquetas (TTL: 1 hour)
- Dashboard metrics (TTL: 5 minutes)
- Lead phone-to-origem mapping (in-memory cache)

### Query Optimization Tips
1. Use field selection (.select()) when fetching partial data
2. Implement pagination for large result sets
3. Use batch operations instead of individual queries
4. Cache frequently accessed reference data
