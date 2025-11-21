# 📘 Documentação do Backend Elevare - Produção

**Data de Deploy:** 21 de novembro de 2025  
**Status:** ✅ Em produção e operacional  
**Responsável:** Carine Marques

---

## 🌐 Informações de Acesso

### URLs do Backend
```
URL Base:        https://elevare-backend-1027004140986.us-central1.run.app
Health Check:    https://elevare-backend-1027004140986.us-central1.run.app/health
```

### Teste Rápido
```bash
curl https://elevare-backend-1027004140986.us-central1.run.app/health
# Resposta esperada: {"status":"ok","timestamp":"2025-11-21T..."}
```

---

## 🏗️ Infraestrutura Google Cloud

### Projeto GCP
- **ID do Projeto:** elevare-iara
- **Região:** us-central1 (Iowa, USA)
- **Plataforma:** Google Cloud Run (serverless)

### Service Accounts
1. **Deploy (CI/CD):**
   - Email: `elevare@elevare-iara.iam.gserviceaccount.com`
   - Funções: Cloud Run Admin, Artifact Registry Admin, Secret Manager Admin

2. **Runtime (Container):**
   - Email: `1027004140986-compute@developer.gserviceaccount.com`
   - Funções: Secret Manager Secret Accessor

### Recursos do Container
- **Memória:** 512Mi
- **CPU:** 1 vCPU
- **Timeout:** 300 segundos (5 minutos)
- **Max Instâncias:** 10
- **Min Instâncias:** 0 (scale to zero)
- **Porta:** 8080

### Secrets Configurados
- **firebase-sa-key:** Credenciais do Firebase Admin SDK (Secret Manager)
  - Acessível pelo container via variável de ambiente `FIREBASE_SERVICE_ACCOUNT_JSON`

---

## 🔧 Stack Tecnológica

### Backend
- **Framework:** NestJS 10.0.0
- **Runtime:** Node.js 20 (Alpine Linux)
- **Linguagem:** TypeScript 5.0
- **Servidor HTTP:** Express (via @nestjs/platform-express)

### Dependências Principais
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/config": "^4.0.2",
  "@nestjs/axios": "^3.1.3",
  "@nestjs/throttler": "^6.4.0",
  "firebase-admin": "^13.6.0",
  "helmet": "^8.1.0",
  "nestjs-pino": "^4.4.1",
  "class-validator": "^0.14.2",
  "bcrypt": "^6.0.0"
}
```

### Firebase
- **Projeto Firebase:** elevare-iara
- **Autenticação:** Firebase Authentication
- **Banco de Dados:** Cloud Firestore
- **Credenciais:** Injetadas via GCP Secret Manager

---

## 📡 Endpoints Disponíveis

### Health Check
```http
GET /health
Response: {"status":"ok","timestamp":"2025-11-21T..."}
```

### API de Leads
```http
POST   /api/leads              # Criar novo lead
GET    /api/leads              # Listar leads
GET    /api/leads/:id          # Obter lead específico
PATCH  /api/leads/:id          # Atualizar lead
DELETE /api/leads/:id          # Deletar lead
```

### Autenticação
```http
POST   /api/auth/login         # Login com Firebase
POST   /api/auth/register      # Registro de novo usuário
GET    /api/auth/me            # Obter usuário atual (requer token)
```

### Firestore (Testes)
```http
POST   /firestore/test         # Testar conexão Firestore
GET    /firestore/users        # Listar usuários (teste)
```

**Nota:** Todos os endpoints (exceto /health) requerem autenticação via Firebase JWT no header:
```
Authorization: Bearer <firebase-jwt-token>
```

---

## 🔐 Segurança

### Proteções Implementadas
- ✅ **Helmet:** Content Security Policy, XSS, clickjacking
- ✅ **CORS:** Configurado para origens autorizadas
- ✅ **Firebase Auth:** Autenticação JWT obrigatória
- ✅ **Validation Pipes:** Validação de entrada com class-validator
- ✅ **Rate Limiting:** ThrottlerModule (configurável)
- ✅ **HTTPS:** Forçado pelo Cloud Run
- ✅ **Non-root Container:** Executa como usuário nodejs

### Firestore Security Rules
⚠️ **PENDENTE:** Deploy das regras de segurança do Firestore

```bash
# Quando disponível, executar:
cd backend
firebase deploy --only firestore:rules --project elevare-iara
```

**Arquivo:** `firestore.rules` (já existe no repositório)

---

## 🚀 CI/CD e Deploy

### Repositório
- **GitHub:** https://github.com/Carine01/meu-backend
- **Branch Principal:** main
- **Último Commit:** 1ed0b89 (fix: tornar variaveis IARA opcionais)

### Pipeline Automático
**Trigger:** Push para branch `main`

**Etapas:**
1. ✅ Checkout do código
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (npm ci com fallback para npm install)
4. ✅ Run tests (7 testes unitários)
5. ✅ Build Docker image
6. ✅ Push para Artifact Registry (us-central1-docker.pkg.dev)
7. ✅ Delete serviço anterior (clean deploy)
8. ✅ Setup Firebase secret no Secret Manager
9. ✅ Deploy para Cloud Run

**Workflows:**
- `.github/workflows/ci.yml` - Testes e validação
- `.github/workflows/deploy.yml` - Deploy automático

### Artifact Registry
```
Repositório: us-central1-docker.pkg.dev/elevare-iara/elevare-backend/elevare-backend
Tags: 
  - latest
  - <commit-sha> (cada deploy)
```

---

## ⚙️ Variáveis de Ambiente

### Configuradas no Deploy
```bash
NODE_ENV=production
FIREBASE_SERVICE_ACCOUNT_JSON=<secret:firebase-sa-key>  # Via Secret Manager
PORT=8080  # Injetada automaticamente pelo Cloud Run
```

### Pendentes de Configuração
⚠️ **Integração IARA (opcional):**
```bash
IARA_EDGE_URL=<URL da API IARA>
IARA_SECRET=<Token/chave da IARA>
```

**Como adicionar:**
1. Ir em: https://github.com/Carine01/meu-backend/settings/secrets/actions
2. Adicionar secrets: `IARA_EDGE_URL` e `IARA_SECRET`
3. Modificar `.github/workflows/deploy.yml`:
```yaml
--set-env-vars "NODE_ENV=production,IARA_EDGE_URL=${{ secrets.IARA_EDGE_URL }},IARA_SECRET=${{ secrets.IARA_SECRET }}"
```

---

## 📊 Monitoramento e Logs

### Cloud Run Console
```
https://console.cloud.google.com/run?project=elevare-iara
```

### Logs do Container
```bash
# Via gcloud CLI
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=elevare-backend" \
  --limit=100 \
  --project=elevare-iara \
  --format="table(timestamp,severity,textPayload)"

# Via Console
https://console.cloud.google.com/logs/query?project=elevare-iara
```

### Métricas
- **Requests/s:** Cloud Run Metrics
- **Latência:** Response time tracking
- **Erros:** Error rate monitoring
- **Escalamento:** Instâncias ativas

Acesse: https://console.cloud.google.com/run/detail/us-central1/elevare-backend/metrics?project=elevare-iara

---

## 🧪 Testes

### Suite de Testes
```bash
# Rodar localmente
npm test

# Testes incluídos:
# - Firebase Authentication
# - Leads Service
# - Firestore Integration
# - Health Check
# Total: 7 testes passando
```

### Coverage
- **Objetivo:** 80% de cobertura (atual: ~40%)
- **Áreas prioritárias:** 
  - firebaseAdmin.ts
  - firebase-auth.service.ts
  - leads.service.ts

---

## 🔄 Comandos Úteis

### Deploy Manual
```bash
# Via gcloud CLI
gcloud run deploy elevare-backend \
  --image us-central1-docker.pkg.dev/elevare-iara/elevare-backend/elevare-backend:latest \
  --region us-central1 \
  --project elevare-iara
```

### Ver Revisões
```bash
gcloud run revisions list \
  --service elevare-backend \
  --region us-central1 \
  --project elevare-iara
```

### Rollback
```bash
gcloud run services update-traffic elevare-backend \
  --to-revisions=elevare-backend-00001-xxx=100 \
  --region us-central1 \
  --project elevare-iara
```

### Escalar Manualmente
```bash
gcloud run services update elevare-backend \
  --max-instances=20 \
  --min-instances=1 \
  --region us-central1 \
  --project elevare-iara
```

---

## 🐛 Troubleshooting

### Container não inicia
1. Verificar logs do container:
```bash
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50 --project=elevare-iara
```

2. Verificar Secret Manager:
```bash
gcloud secrets versions access latest --secret=firebase-sa-key --project=elevare-iara
```

3. Testar imagem localmente:
```bash
docker pull us-central1-docker.pkg.dev/elevare-iara/elevare-backend/elevare-backend:latest
docker run -p 8080:8080 -e NODE_ENV=production <image-id>
```

### Erros de Permissão
- Verificar IAM roles dos service accounts
- Validar acesso ao Secret Manager
- Confirmar permissões do Artifact Registry

### Performance Lenta
- Aumentar CPU/memória no Cloud Run
- Verificar cold start (considerar min-instances=1)
- Analisar logs de latência

---

## 📞 Informações de Suporte

### Credenciais de Acesso
- **Service Account Key:** `elevare-iara-cd2144e47078.json` (local)
- **GitHub Secrets:** Configurados em: https://github.com/Carine01/meu-backend/settings/secrets

### Contatos
- **Responsável Técnico:** Carine Marques
- **Repositório:** https://github.com/Carine01/meu-backend
- **Projeto GCP:** elevare-iara

### Links Importantes
- [Cloud Run Dashboard](https://console.cloud.google.com/run?project=elevare-iara)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=elevare-iara)
- [Artifact Registry](https://console.cloud.google.com/artifacts?project=elevare-iara)
- [GitHub Actions](https://github.com/Carine01/meu-backend/actions)
- [Firebase Console](https://console.firebase.google.com/project/elevare-iara)

---

## 📅 Histórico de Deploys

### Deploy #30 - ✅ SUCESSO (21/11/2025 20:08 UTC)
- **Commit:** 1ed0b89
- **Mudança:** Variáveis IARA tornadas opcionais
- **Duração:** 4min 11s
- **Status:** Produção ativa

### Deploys Anteriores
- **#29:** Fallback npm install (falhou - IARA required)
- **#28:** @nestjs/platform-express adicionado (falhou - IARA required)
- **#27:** Service deletion strategy (falhou - MODULE_NOT_FOUND)
- **#1-26:** Correções de permissões, dependências, portas

**Total de tentativas:** 30 deploys até o sucesso final

---

## ✅ Checklist de Próximos Passos

### Imediato
- [x] Backend em produção
- [x] Health check funcionando
- [x] Firebase configurado
- [x] Documentação criada

### Curto Prazo (1-2 semanas)
- [ ] Deploy Firestore Security Rules
- [ ] Configurar variáveis IARA (quando disponíveis)
- [ ] Aumentar cobertura de testes para 80%
- [ ] Implementar monitoramento de erros (Sentry/Cloud Error Reporting)
- [ ] Configurar alertas de uptime

### Médio Prazo (1 mês)
- [ ] Adicionar DTOs com validação completa
- [ ] Implementar rate limiting por IP
- [ ] Configurar CI/CD para staging + production
- [ ] Documentação API com Swagger/OpenAPI
- [ ] Logging estruturado com Cloud Logging

### Melhorias Futuras
- [ ] Implementar cache com Redis/Memorystore
- [ ] Adicionar métricas customizadas
- [ ] Configurar backup automatizado do Firestore
- [ ] Implementar feature flags
- [ ] Adicionar testes E2E

---

**Documentação gerada em:** 21 de novembro de 2025  
**Versão do Backend:** 1.0.0  
**Última atualização:** Deploy #30 (commit 1ed0b89)

---

## 🎉 Conclusão

O backend Elevare está **100% operacional em produção** no Google Cloud Run. 

Todas as funcionalidades core estão disponíveis:
- ✅ API REST funcional
- ✅ Autenticação Firebase
- ✅ Integração Firestore
- ✅ CI/CD automatizado
- ✅ Segurança configurada
- ✅ Logs centralizados

**Próximo passo:** Integrar com o frontend e configurar credenciais IARA quando disponíveis.

**Contato para dúvidas:** Carine Marques / GitHub: @Carine01
