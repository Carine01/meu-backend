# 🚀 GUIA DE EXECUÇÃO RÁPIDA - Correções Críticas

**Tempo estimado:** 4.5 horas  
**Prioridade:** CRÍTICA - Execute HOJE

---

## ✅ CHECKLIST DE EXECUÇÃO

### FASE 1: Corrigir 93 Erros TypeScript (1.5h)

#### Passo 1: Corrigir Entities (15min)
```powershell
# No terminal do VS Code (Ctrl+`)
cd backend
npx ts-node scripts/fix-entities.ts
```

**Resultado esperado:**
```
✅ Corrigido: src/modules/leads/entities/lead.entity.ts
✅ Corrigido: src/modules/indicacoes/entities/indicacao.entity.ts
...
🎉 Total de arquivos corrigidos: 12
```

#### Passo 2: Corrigir Catch Blocks (5min)
```powershell
# PowerShell (Windows)
Get-ChildItem -Path src -Recurse -Filter *.ts | ForEach-Object {
    (Get-Content $_.FullName) -replace 'catch \(error\)', 'catch (error: any)' -replace 'catch \(err\)', 'catch (err: any)' | Set-Content $_.FullName
}

Write-Host "✅ Catch blocks corrigidos" -ForegroundColor Green
```

#### Passo 3: Verificar Build (5min)
```powershell
npm run build
```

**Critério de sucesso:** `✔ Successfully compiled`

**Se falhar:** Anote o erro e continue - voltaremos depois.

---

### FASE 2: Adicionar Filtros clinicId (2h)

#### Passo 1: Adicionar clinicId às Entities (30min)
```powershell
npx ts-node scripts/add-clinicid.ts
```

**Resultado esperado:**
```
✅ Adicionado clinicId: src/modules/indicacoes/entities/indicacao.entity.ts
✅ Adicionado clinicId: src/modules/agendamentos/entities/agendamento.entity.ts
...
📦 Gerando migration...
✅ Migration criada com sucesso!
```

#### Passo 2: Atualizar Services (1h 15min)

**IMPORTANTE:** Faça isso manualmente com cuidado. Use Ctrl+Shift+F no VS Code.

**Busque por:** `async findAll(`

**Substitua cada ocorrência:**

```typescript
// ANTES (INSEGURO)
async findAll(filtros?: any) {
  return this.repository.find({ where: filtros });
}

// DEPOIS (SEGURO)
async findAll(clinicId: string, filtros?: any) {
  this.logger.log(`🔍 Buscando registros - clinicId: ${clinicId}`);
  return this.repository.find({ 
    where: { clinicId, ...filtros } 
  });
}
```

**Services a modificar (7 no total):**
- [ ] `bi.service.ts` (5 métodos)
- [ ] `indicacoes.service.ts` (8 métodos)
- [ ] `fila.service.ts` (6 métodos)
- [ ] `agendamentos.service.ts` (7 métodos)
- [ ] `bloqueios.service.ts` (5 métodos)
- [ ] `events.service.ts` (4 métodos)
- [ ] `leads-score.service.ts` (3 métodos)

#### Passo 3: Atualizar Controllers (15min)

**Busque por:** `@Get(` e `@Post(`

**Adicione extração de clinicId:**

```typescript
// ANTES
@Get()
async findAll() {
  return this.service.findAll();
}

// DEPOIS
@Get()
async findAll(@Req() req: any) {
  const clinicId = req.user?.clinicId || 'ELEVARE_MAIN'; // Fallback temporário
  return this.service.findAll(clinicId);
}
```

---

### FASE 3: Instalar Docker (15min)

#### Windows com WSL2:
```powershell
# Baixe e instale Docker Desktop:
# https://www.docker.com/products/docker-desktop/

# Após instalar, verifique:
docker --version
docker-compose --version
```

#### Testar Docker:
```powershell
cd backend
docker-compose up -d postgres redis
docker ps
```

**Resultado esperado:** 2 containers rodando (postgres, redis)

---

### FASE 4: Executar Testes E2E (30min)

#### Passo 1: Subir Banco de Teste
```powershell
docker-compose -f docker-compose.test.yml up -d
```

#### Passo 2: Rodar Testes
```powershell
npm run test:e2e
```

**Se não existir `test:e2e`:**
```powershell
# Adicione ao package.json:
# "test:e2e": "jest --config ./test/jest-e2e.json"

npm test -- test/e2e
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Erro: "Cannot find module 'glob'"
```powershell
npm install -D glob @types/glob
```

### Erro: "ts-node not found"
```powershell
npm install -D ts-node
```

### Erro: "Migration já existe"
```powershell
# Delete a migration duplicada:
Remove-Item src/migrations/*AddClinicId* -Force
# Execute novamente
```

### Build ainda falha após correções
```powershell
# Limpe cache e node_modules:
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

---

## ✅ VALIDAÇÃO FINAL

Execute estes testes manuais:

### 1. Build funciona
```powershell
npm run build
# Deve mostrar: ✔ Successfully compiled
```

### 2. Segurança clinicId
```powershell
# Inicie o servidor
npm run start:dev

# Em outro terminal, teste isolamento:
curl -X POST http://localhost:8080/leads `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer SEU_TOKEN" `
  -d '{"nome":"Teste Clínica A","telefone":"5511999999999"}'

# Verifique que apenas leads da mesma clínica são retornados
curl http://localhost:8080/leads `
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Testes passam
```powershell
npm test
# Deve mostrar: Tests: XX passed
```

---

## 📊 PRÓXIMOS PASSOS (Após 4.5h)

Depois de concluir as 4 fases acima:

1. **Commit e Push**
   ```powershell
   git add .
   git commit -m "fix: corrige erros TypeScript + implementa filtros clinicId"
   git push origin main
   ```

2. **Monitorar Deploy**
   - Vá em GitHub → Actions
   - Aguarde deploy automático concluir
   - Verifique health check produção

3. **Teste em Produção**
   ```powershell
   curl https://sua-api.com/health
   # Deve retornar: {"status":"healthy"}
   ```

---

## 🎯 CRITÉRIOS DE SUCESSO

Você terminou quando:

- ✅ `npm run build` passa sem erros
- ✅ Todos os services têm filtro `clinicId`
- ✅ Controllers extraem `clinicId` do token JWT
- ✅ Docker está instalado e rodando
- ✅ Pelo menos 1 teste E2E passa
- ✅ Deploy automático funciona no GitHub Actions

---

**Tempo total:** 4.5 horas  
**MVP pronto para produção:** SIM  
**Próxima ação:** Execute `npx ts-node scripts/fix-entities.ts` AGORA
