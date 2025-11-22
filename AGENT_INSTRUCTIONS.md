# 🤖 AGENT_INSTRUCTIONS.md
**Versão:** 2.0 | **Atualizado:** 2025-11-22 | **Tipo:** Comandos Executáveis

---

## 🔥 COMANDOS EMERGÊNCIA (Copie e Cole)

### Fix TypeScript (1 min)
```powershell
# Corrige entities + catch blocks
npx ts-node scripts/fix-entities.ts
Get-ChildItem -Path src -Recurse -Filter *.ts | ForEach-Object { (Get-Content $_.FullName) -replace 'catch \(error\)', 'catch (error: any)' | Set-Content $_.FullName }
npm run build
```

### Add clinicId (2 min)
```powershell
npx ts-node scripts/add-clinicid.ts
npm run migration:run
```

### Test E2E (30s)
```powershell
npm run test:e2e -- --testNamePattern="Fluxo Mínimo"
```

### Deploy Manual
```powershell
git add . && git commit -m "fix: automated fixes" && git push origin main
```

---

## ✅ CHECKLIST PRÉ-PUSH (Valide SEMPRE)

Execute antes de qualquer `git push`:

```powershell
# 1. Build passa?
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build falhou"; exit 1 }

# 2. Testes passam?
npm test -- --passWithNoTests
if ($LASTEXITCODE -ne 0) { Write-Error "Testes falharam"; exit 1 }

# 3. Sem clinicId vazando?
$leaks = Select-String -Path "src/modules/**/*.service.ts" -Pattern "\.find\(\s*\{" | Where-Object { $_ -notmatch "clinicId" }
if ($leaks) { Write-Error "Filtros clinicId faltando"; $leaks; exit 1 }

# 4. Swagger em DTOs?
$missingSwagger = Select-String -Path "src/modules/**/dto/*.dto.ts" -Pattern "export class.*Dto" | Where-Object { (Get-Content $_.Path) -notmatch "@ApiProperty" }
if ($missingSwagger) { Write-Warning "DTOs sem @ApiProperty encontrados" }
```

---

## 🎯 PADRÕES OBRIGATÓRIOS (Para Agentes de Código)

### Criar Módulo
```powershell
# Template de geração:
$MODULE_NAME = "nome-do-modulo"
nest g module modules/$MODULE_NAME
nest g service modules/$MODULE_NAME
nest g controller modules/$MODULE_NAME

# Entity template:
@Entity('nome_tabela')
export class NomeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;
  
  @Column()
  campo!: string;
  
  @CreateDateColumn()
  createdAt!: Date;
}

# Service template:
async findAll(clinicId: string) {
  return this.repo.find({ where: { clinicId } });
}

# Controller template:
@Get()
async findAll(@Req() req: any) {
  return this.service.findAll(req.user.clinicId);
}
```

### Integrar WhatsApp
```typescript
// No construtor do service:
constructor(private whatsappService: WhatsAppService) {}

// No método de envio:
try {
  const { messageId } = await this.whatsappService.sendMessage(telefone, mensagem);
  return { status: 'enviado', messageId };
} catch (error: any) {
  this.logger.error(`WhatsApp falhou: ${error.message}`);
  throw new ServiceUnavailableException('WhatsApp indisponível');
}
```

---

## 🔄 ROLLBACK RÁPIDO

### Reverter Migration
```powershell
npm run migration:revert
```

### Reverter Código
```powershell
git reset --hard HEAD~1
git push --force origin main  # ⚠️ Use com cuidado
```

### Limpar Docker
```powershell
docker-compose down -v
docker system prune -af --volumes
docker-compose up -d
```

### Restaurar Banco
```powershell
# Restaurar último backup
docker exec -i elevare-postgres psql -U elevare elevare_iara < backup/elevare_$(Get-Date -Format "yyyyMMdd").sql
```

---

## 🚨 VALIDAÇÕES AUTOMÁTICAS

### Pre-commit Hook (Copie para `.git/hooks/pre-commit`)
```bash
#!/bin/sh
npm run build || exit 1
npm test -- --passWithNoTests || exit 1
echo "✅ Pre-commit checks passed"
```

### GitHub Actions (Já configurado em `.github/workflows/`)
- ✅ `test.yml` - Roda testes em PRs
- ✅ `deploy.yml` - Deploy automático na main
- ✅ `health-check.yml` - Monitora WhatsApp a cada 30min

---

## 📞 ALERTAS CONFIGURADOS

| Tipo | Quando | Canal | Ação |
|------|--------|-------|------|
| 🚨 Crítico | Build falha | GitHub Email | Rollback manual |
| ⚠️ Warning | Coverage < 80% | GitHub Actions | Ignorar por ora |
| 📱 Info | WhatsApp down | Discord #alerts | Escanear QR Code |
| 🔴 Erro 500 | Produção | Telegram @bot | Verificar logs Grafana |

**Discord Webhook:** `${{ secrets.DISCORD_WEBHOOK }}`  
**Telegram Bot:** `@elevare_monitor_bot`

---

## 🛠️ SCRIPTS DISPONÍVEIS (em `/scripts`)

| Script | Tempo | Uso |
|--------|-------|-----|
| `fix-entities.ts` | 30s | Corrige erros TypeScript |
| `add-clinicid.ts` | 1min | Adiciona clinicId às entities |
| `seed-admin.ts` | 5s | Cria usuário admin@elevare.com |
| `validate-security.ts` | 10s | Valida filtros clinicId |

**Executar:**
```powershell
npx ts-node scripts/nome-do-script.ts
```

---

## 📊 MÉTRICAS CRÍTICAS

### Performance
- Endpoint response time: **< 200ms** (p95)
- Database queries: **< 100ms**
- Docker build: **< 5min**

### Qualidade
- Test coverage: **> 80%**
- Erros TypeScript: **0**
- Vulnerabilities npm audit: **0 high/critical**

### Segurança
- Todos os endpoints protegidos: **JwtAuthGuard**
- Filtros clinicId: **100% dos services**
- Secrets no código: **0**

**Verificar:**
```powershell
# Performance
curl -w "@curl-format.txt" http://localhost:8080/leads

# Qualidade
npm run test:cov

# Segurança
npm audit --production
```

---

## 🎯 REGRAS DE OURO

1. **NUNCA** commit sem `npm run build` passar
2. **SEMPRE** adicione `clinicId` em novas entities
3. **TODO** endpoint público deve ter rate limiting
4. **JAMAIS** use `console.log` (use `this.logger`)
5. **OBRIGATÓRIO** @ApiProperty em DTOs

---

## 🔗 LINKS ÚTEIS

- **Repo:** https://github.com/Carine01/meu-backend
- **Actions:** https://github.com/Carine01/meu-backend/actions
- **Grafana:** http://localhost:3001 (local)
- **Swagger:** http://localhost:8080/docs
- **Prometheus:** http://localhost:9090

---

## 📝 ÚLTIMA VALIDAÇÃO

**Status:** ✅ Tudo configurado  
**Próxima ação:** Execute `npx ts-node scripts/fix-entities.ts`  
**MVP Ready:** Após 4.5h seguindo GUIA_EXECUCAO_RAPIDA.md

---

**Este arquivo contém APENAS comandos executáveis. Para contexto histórico, veja `docs/decisions/`**
