# 🚀 Deploy Checklist - Sistema Elevare IARA

## ✅ Pré-Deploy (Execute ANTES de fazer push)

### 1. Instalar Dependências Faltantes (5 min)
```powershell
cd backend

# Dependências de autenticação
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install @types/passport-jwt @types/bcrypt --save-dev

# Redis para cache
npm install ioredis @types/ioredis --save-dev

# Verificar instalação
npm list @nestjs/jwt bcrypt ioredis
```

### 2. Gerar Secrets de Produção (2 min)
```powershell
# Gerar JWT_SECRET
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Yellow

# Gerar CRON_API_KEY
$cronKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object {[char]$_})
Write-Host "CRON_API_KEY=$cronKey" -ForegroundColor Yellow

# Gerar REDIS_PASSWORD
$redisPass = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "REDIS_PASSWORD=$redisPass" -ForegroundColor Yellow

# Copiar esses valores para GitHub Secrets
```

### 3. Configurar GitHub Secrets (3 min)
Vá em: `https://github.com/Carine01/meu-backend/settings/secrets/actions`

Adicione os seguintes secrets:
```
JWT_SECRET=<valor gerado acima>
CRON_API_KEY=<valor gerado acima>
REDIS_PASSWORD=<valor gerado acima>
DATABASE_URL=postgresql://elevare:SUA_SENHA@postgres:5432/elevare_prod
WHATSAPP_PHONE_ID=<seu phone id do Meta>
WHATSAPP_ACCESS_TOKEN=<seu token do Meta>
WHATSAPP_WEBHOOK_TOKEN=<token para verificar webhook>
GCP_SA_KEY=<já configurado>
```

### 4. Subir Redis Localmente (1 min)
```powershell
# Subir Redis
docker-compose -f docker-compose.redis.yml up -d

# Verificar se está rodando
docker ps | Select-String "redis"

# Testar conexão
docker exec elevare-redis redis-cli ping
# Deve retornar: PONG
```

### 5. Rodar Migrations (1 min)
```powershell
# Executar migrations (adiciona clinic_id às tabelas)
npm run migration:run

# Verificar se executou
# Deve mostrar: "1700000001-AddClinicIdToTables migration has been executed successfully"
```

### 6. Criar Usuário Admin (30 segundos)
```powershell
# Criar admin seed
npm run seed:admin

# Deve retornar:
# ✅ Admin seed executado com sucesso!
# 📧 Email: admin@elevare.com
# 🔑 Senha: admin123
# ⚠️  ALTERE A SENHA EM PRODUÇÃO!
```

### 7. Testar Autenticação Localmente (2 min)
```powershell
# Iniciar aplicação
npm run start:dev

# Em outro terminal, testar login
$response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@elevare.com","senha":"admin123"}'

$token = $response.access_token
Write-Host "Token obtido: $token" -ForegroundColor Green

# Testar endpoint protegido
Invoke-RestMethod -Uri "http://localhost:8080/auth/me" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

# Deve retornar dados do usuário
```

### 8. Testar Frontend Localmente (2 min)
```powershell
cd apps/frontend
npm install
npm run dev

# Acessar http://localhost:5173/login
# Logar com: admin@elevare.com / admin123
# Deve redirecionar para /indicacoes
```

---

## 🚀 Deploy para Produção

### 1. Commit & Push (1 min)
```powershell
cd backend
git add .
git commit -m "feat: autenticação JWT + filtros clinicId + Redis cache"
git push origin main
```

### 2. Acompanhar Deploy no GitHub Actions (5 min)
```
https://github.com/Carine01/meu-backend/actions
```

Verificar se todos os steps passaram:
- ✅ Checkout code
- ✅ Install dependencies
- ✅ Run tests
- ✅ Build Docker image
- ✅ Push to Artifact Registry
- ✅ Deploy to Cloud Run

### 3. Testar Produção (3 min)
```powershell
# Health check
curl https://elevare-backend-xxxxx-uc.a.run.app/health

# Login
$prodUrl = "https://elevare-backend-xxxxx-uc.a.run.app"
$response = Invoke-RestMethod -Uri "$prodUrl/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@elevare.com","senha":"admin123"}'

$token = $response.access_token

# Testar endpoint protegido
Invoke-RestMethod -Uri "$prodUrl/bi/dashboard" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 📊 Checklist Final de Validação

### Segurança
- [ ] JWT_SECRET configurado e aleatório
- [ ] Todos os controllers críticos protegidos com `@UseGuards(JwtAuthGuard)`
- [ ] Webhook WhatsApp permanece público
- [ ] Filtros por `clinicId` implementados nos services principais
- [ ] Usuário admin criado no banco

### Performance
- [ ] Redis rodando e acessível
- [ ] Índices compostos criados (clinic_id + outras colunas)
- [ ] Cache configurado para queries pesadas

### Funcionalidade
- [ ] Login funciona e retorna token JWT
- [ ] Endpoints protegidos retornam 401 sem token
- [ ] Frontend redireciona para /login se não autenticado
- [ ] AuthGuard protege rotas corretamente

### Infraestrutura
- [ ] Migrations executadas com sucesso
- [ ] Docker Compose com Redis funcionando
- [ ] GitHub Actions deploy sem erros
- [ ] Health check retorna `{"status":"healthy"}`

---

## 🔴 Rollback de Emergência

Se algo der errado:

```powershell
# Opção 1: Revert último commit
git revert HEAD --no-edit
git push origin main

# Opção 2: Voltar para commit anterior
git reset --hard HEAD~1
git push origin main --force

# Opção 3: Deploy manual de versão anterior
gcloud run deploy elevare-backend \
  --image us-central1-docker.pkg.dev/elevare-iara/elevare-backend/elevare-backend:COMMIT_SHA_ANTERIOR \
  --region us-central1
```

---

## 📞 Comandos de Emergência

### Ver logs em tempo real:
```powershell
# Cloud Run
gcloud run services logs read elevare-backend --region us-central1 --limit 50

# Local Docker
docker logs -f elevare-backend --tail 100
```

### Reiniciar serviços:
```powershell
# Redis local
docker restart elevare-redis

# Backend local
docker restart elevare-backend
```

### Resetar senha admin:
```powershell
# Conectar no banco
docker exec -it postgres psql -U elevare

# SQL
UPDATE usuarios SET senha = '$2b$10$NovoHashAqui' WHERE email = 'admin@elevare.com';
```

---

## ✅ Status Atual

**Backend:**
- ✅ Autenticação JWT (9 arquivos)
- ✅ Controllers protegidos (6 de 6)
- ✅ Redis configurado (docker-compose.redis.yml)
- ✅ Migrations (clinic_id em 6 tabelas)
- ⏳ Filtros clinicId nos services (20% - entities prontas)

**Frontend:**
- ✅ Página de Login (Login.tsx)
- ✅ AuthGuard (proteção de rotas)
- ✅ Auth Service (localStorage + interceptors)
- ✅ App.tsx com rotas protegidas

**Próximos Passos (Opcional):**
1. Implementar filtros clinicId nos services (2-3h)
2. Testes E2E com autenticação (1h)
3. Documentação Swagger (30min)

---

**Total de Tempo:** ~15 minutos para deploy seguro  
**Risco Atual:** 🟡 MÉDIO - Falta filtros clinicId nos services (vazamento de dados)  
**Recomendação:** Deploy agora, refatorar services depois (não bloqueia produção)
