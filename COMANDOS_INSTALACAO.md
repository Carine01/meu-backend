# 🚀 Comandos de Instalação - Segurança & Produção

## 1️⃣ Gerar Secrets (EXECUTAR PRIMEIRO)

```powershell
# Gerar JWT_SECRET aleatório
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Add-Content .env "JWT_SECRET=$jwtSecret"

# Gerar CRON_API_KEY
$cronKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object {[char]$_})
Add-Content .env "CRON_API_KEY=$cronKey"

Write-Host "✅ Secrets gerados com sucesso!" -ForegroundColor Green
```

## 2️⃣ Instalar Dependências

```powershell
# Dependências JWT & Auth
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install @types/passport-jwt @types/bcrypt --save-dev

# Redis para cache
npm install ioredis
npm install @types/ioredis --save-dev

Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
```

## 3️⃣ Subir Redis no Docker

```powershell
# Iniciar Redis
docker-compose -f docker-compose.redis.yml up -d

# Verificar se está rodando
docker ps | Select-String "elevare-redis"

# Testar conexão
docker exec elevare-redis redis-cli ping
# Deve retornar: PONG

Write-Host "✅ Redis operacional!" -ForegroundColor Green
```

## 4️⃣ Criar Tabela de Usuários

```powershell
# Rodar migrations (se existir)
npm run migration:run

# OU executar SQL manual:
# Conecte no PostgreSQL e execute:
```

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  clinic_id VARCHAR(50) NOT NULL,
  roles TEXT[] DEFAULT ARRAY['user'],
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_clinic_id ON usuarios(clinic_id);
```

## 5️⃣ Criar Usuário Admin Seed

```powershell
# Iniciar aplicação
npm run start:dev

# Em outro terminal, criar admin:
curl -X POST http://localhost:8080/auth/seed-admin

Write-Host "✅ Admin criado: admin@elevare.com / admin123" -ForegroundColor Yellow
```

## 6️⃣ Testar Autenticação

```powershell
# 1. Fazer login
$response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@elevare.com","senha":"admin123"}'

$token = $response.access_token
Write-Host "Token: $token" -ForegroundColor Cyan

# 2. Testar endpoint protegido
Invoke-RestMethod -Uri "http://localhost:8080/auth/me" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

# 3. Testar endpoint leads (agora protegido)
Invoke-RestMethod -Uri "http://localhost:8080/leads" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body '{"nome":"Teste","phone":"5511999999999","clinicId":"ELEVARE_MAIN"}'

Write-Host "✅ Autenticação funcionando!" -ForegroundColor Green
```

## 7️⃣ Verificar Segurança

```powershell
# Tentar acessar sem token (DEVE FALHAR)
try {
  Invoke-RestMethod -Uri "http://localhost:8080/leads" -Method POST
} catch {
  Write-Host "✅ Endpoint protegido corretamente!" -ForegroundColor Green
}

# Verificar que webhook WhatsApp continua público
Invoke-RestMethod -Uri "http://localhost:8080/whatsapp/webhook" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{}'

Write-Host "✅ Webhook público funcionando!" -ForegroundColor Green
```

## 8️⃣ Comandos Úteis de Produção

```powershell
# Ver logs do Redis
docker logs -f elevare-redis

# Conectar no Redis CLI
docker exec -it elevare-redis redis-cli

# Dentro do Redis CLI:
# AUTH elevare123
# KEYS *
# GET cache:leads
# FLUSHDB  # Limpar cache

# Parar Redis
docker-compose -f docker-compose.redis.yml down

# Resetar tudo (CUIDADO!)
docker-compose -f docker-compose.redis.yml down -v
```

## ✅ Checklist de Validação

- [ ] JWT_SECRET gerado e no .env
- [ ] Dependências instaladas (passport, bcrypt, ioredis)
- [ ] Redis rodando no Docker (porta 6379)
- [ ] Tabela `usuarios` criada no PostgreSQL
- [ ] Admin seed executado (admin@elevare.com)
- [ ] Login retornando token JWT válido
- [ ] Endpoints `/leads`, `/bi`, `/indicacoes` protegidos
- [ ] Webhook `/whatsapp/webhook` público (sem auth)
- [ ] `@UseGuards(JwtAuthGuard)` em todos controllers críticos

## 🔴 Próximos Passos Críticos

1. **Filtrar por clinicId** - Modificar todos os services para aceitar clinicId
2. **Testes E2E** - Validar fluxo completo com autenticação
3. **Rate Limiting por Clínica** - Limites individuais por clínica
4. **Rollback Automático** - Script de volta a versão anterior

## 📞 Troubleshooting

### Erro: "JWT_SECRET não definido"
```powershell
# Verificar se está no .env
Get-Content .env | Select-String "JWT_SECRET"

# Se não existir, gerar novamente (comando do item 1)
```

### Erro: "Redis connection refused"
```powershell
# Verificar se Redis está rodando
docker ps | Select-String "redis"

# Reiniciar
docker restart elevare-redis
```

### Erro: "Unauthorized" mesmo com token válido
```powershell
# Verificar expiração do token (7 dias padrão)
# Fazer login novamente para gerar novo token
```

---

**Autor:** Sistema Elevare IARA  
**Versão:** 1.0.0  
**Data:** 2024
