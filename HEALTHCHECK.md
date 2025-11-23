# Health Check Report

**Data/Hora:** $(date '+%Y-%m-%d %H:%M:%S %Z')

## 🏥 Status dos Endpoints de Saúde

### Endpoint Principal: `/health`

**URL:** `http://localhost:3000/health`

**Status:** ⚠️ Não Testado (Aplicação requer configuração do Firebase)

**Observação:**  
A aplicação requer credenciais válidas do Firebase Admin SDK para inicializar corretamente. 
Os seguintes endpoints de saúde estão implementados no código:

1. **GET /health** - Health check principal (readiness probe)
   - Retorna: `{ "status": "ok", "timestamp": "<ISO-8601>" }`
   - Uso: Kubernetes/Cloud Run readiness probe

2. **GET /health/liveness** - Liveness probe
   - Retorna: `{ "status": "alive" }`
   - Uso: Kubernetes/Cloud Run liveness probe

---

### Endpoint WhatsApp: `/whatsapp/health`

**URL:** `http://localhost:3000/whatsapp/health`

**Status:** ❌ Não Disponível

**Observação:**  
Não há um endpoint `/whatsapp/health` implementado no código atual.

Os endpoints disponíveis no módulo WhatsApp são:
- `POST /whatsapp/send` - Enviar mensagem (requer autenticação JWT)
- `POST /whatsapp/webhook` - Receber webhooks do WhatsApp Business API
- `GET /whatsapp/webhook` - Verificação do webhook (Meta)
- `GET /whatsapp/check/:phoneNumber` - Verificar se número tem WhatsApp (requer JWT)

---

## 🐳 Docker Compose

**Status:** ⚠️ Build Iniciado (Não Completado)

### Serviços Configurados:

1. **postgres** (PostgreSQL 15) - Porta 5432
2. **backend** (NestJS) - Porta 3000
3. **prometheus** (Métricas) - Porta 9090
4. **grafana** (Dashboards) - Porta 3001
5. **pgadmin** (Gerenciamento DB - opcional, perfil dev) - Porta 5050

### Observações Docker:

- O build do container de produção leva tempo considerável devido à instalação de dependências
- Dockerfile foi atualizado com stages nomeados (development, production)
- Comando de produção configurado: `node dist/main.js`

---

## 🔧 Requisitos para Execução

Para executar a aplicação com sucesso, são necessárias as seguintes configurações:

### Variáveis de Ambiente Críticas:

```bash
# Firebase Admin SDK (obrigatório)
FIREBASE_PROJECT_ID=<seu-projeto-id>
FIREBASE_PRIVATE_KEY="<sua-chave-privada>"
FIREBASE_CLIENT_EMAIL=<seu-service-account-email>

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/elevare_iara

# JWT
JWT_SECRET=<secret-seguro>

# WhatsApp (se usar)
WHATSAPP_API_KEY=<sua-api-key>
WHATSAPP_API_URL=<url-da-api>
```

---

## ✅ Testes Manuais Recomendados

Uma vez que a aplicação esteja rodando com as credenciais corretas:

1. **Health Check Principal:**
   ```bash
   curl http://localhost:3000/health
   ```
   Deve retornar: `{"status":"ok","timestamp":"..."}`

2. **Liveness Probe:**
   ```bash
   curl http://localhost:3000/health/liveness
   ```
   Deve retornar: `{"status":"alive"}`

3. **Prometheus Metrics (se habilitado):**
   ```bash
   curl http://localhost:3000/metrics
   ```

---

*Gerado automaticamente pela rotina de automação - $(date -Iseconds)*
