# 🚀 GUIA DE INSTALAÇÃO RÁPIDA - 5 MINUTOS

## Pré-requisitos

- **Node.js 18+** ([Baixar](https://nodejs.org))
- **Docker Desktop** ([Baixar](https://www.docker.com/products/docker-desktop))
- **Git** ([Baixar](https://git-scm.com))

---

## ⚡ Instalação Automática

### Linux/Mac
```bash
# Clone o repositório
git clone https://github.com/Carine01/meu-backend.git
cd meu-backend

# Execute o script de setup
npm run setup
```

### Windows
```powershell
# Clone o repositório
git clone https://github.com/Carine01/meu-backend.git
cd meu-backend

# Execute o script de setup
npm run setup:windows
```

**O script irá:**
1. ✅ Instalar todas as dependências
2. ✅ Criar arquivo `.env` (você precisará editar)
3. ✅ Subir PostgreSQL via Docker
4. ✅ Executar migrations do banco
5. ✅ Criar dados iniciais (bloqueios, feriados)

---

## 🔧 Configuração Manual (se preferir)

### PASSO 1: Instalar Dependências
```bash
npm install --legacy-peer-deps
```

### PASSO 2: Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
# Banco de Dados
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui
DATABASE_NAME=elevare_iara

# Firebase
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Webhooks
MAKE_WEBHOOK_URL=https://hook.us1.make.com/seu-webhook
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/seu-webhook

# WhatsApp API (opcional)
WHATSAPP_API_TOKEN=seu_token_aqui
WHATSAPP_PHONE_ID=seu_phone_id

# Aplicação
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### PASSO 3: Subir Banco de Dados
```bash
docker-compose up -d postgres
```

Aguarde 10 segundos para o banco inicializar.

### PASSO 4: Executar Migrations
```bash
npm run migration:run
```

### PASSO 5: Inicializar Dados
```bash
npm run seed
```

---

## 🎯 Testar a Instalação

### 1. Iniciar o Backend
```bash
npm run start:dev
```

### 2. Testar Health Check
```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-21T..."
}
```

### 3. Criar um Lead de Teste
```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Teste",
    "telefone": "+5511999999999",
    "email": "maria@teste.com",
    "origem": "site",
    "clickedWhatsapp": true,
    "interesse": "depilacao"
  }'
```

### 4. Verificar Fila de Mensagens
```bash
curl http://localhost:3000/fila/pending
```

### 5. Ver Métricas Prometheus
```bash
curl http://localhost:3000/bi/metrics
```

---

## 📊 Acessar Interfaces Web

- **Backend API:** http://localhost:3000
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)
- **PgAdmin:** http://localhost:5050 (admin@elevare.com/admin) - apenas em dev

---

## 🧪 Rodar Testes

### Testes Unitários
```bash
npm test
```

### Testes com Coverage
```bash
npm run test:cov
```

### Testes E2E
```bash
npm run test:e2e
```

---

## 🐳 Comandos Docker Úteis

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do PostgreSQL
docker-compose logs -f postgres

# Parar todos os containers
docker-compose down

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d

# Acessar shell do PostgreSQL
docker exec -it elevare-postgres psql -U postgres -d elevare_iara
```

---

## 🔄 Migrations

### Gerar nova migration
```bash
npm run migration:generate -- src/migrations/NomeDaMigration
```

### Executar migrations pendentes
```bash
npm run migration:run
```

### Reverter última migration
```bash
npm run migration:revert
```

---

## 🛠️ Troubleshooting

### Erro: "Port 5432 already in use"
```bash
# Parar PostgreSQL local
sudo service postgresql stop  # Linux
brew services stop postgresql # Mac
net stop postgresql-x64-15    # Windows
```

### Erro: "Cannot connect to database"
```bash
# Verificar se container está rodando
docker ps | grep postgres

# Verificar logs
docker-compose logs postgres

# Reiniciar container
docker-compose restart postgres
```

### Erro: "Module not found"
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Erro ao executar migrations
```bash
# Verificar conexão com banco
npm run typeorm -- schema:log

# Forçar drop e recriar (CUIDADO: apaga dados!)
npm run typeorm -- schema:drop
npm run migration:run
npm run seed
```

---

## 📝 Próximos Passos

1. **Integrar WhatsApp Real**
   - Configurar WhatsApp Business API
   - Substituir Make.com por webhook direto

2. **Deploy em Produção**
   - Configurar GitHub Actions
   - Deploy na AWS/Heroku/Railway

3. **Frontend React**
   - Dashboard com gráficos
   - CRUD de leads
   - Calendário de agendamentos

4. **Observabilidade**
   - Configurar alertas no Prometheus
   - Importar dashboards no Grafana

---

## 📚 Documentação Adicional

- [DOCKER.md](./DOCKER.md) - Comandos Docker detalhados
- [RESUMO_IMPLEMENTACAO.md](./RESUMO_IMPLEMENTACAO.md) - Resumo das tarefas implementadas
- [API.md](./API.md) - Documentação completa da API (a criar)

---

## 💡 Dicas

- Use `npm run start:dev` para desenvolvimento (hot-reload)
- Use `npm start` para produção
- Configure `LOG_LEVEL=debug` no `.env` para ver mais detalhes
- Rode `npm run test:cov` antes de fazer commit

---

## 🆘 Suporte

Em caso de dúvidas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a [documentação completa](./RESUMO_IMPLEMENTACAO.md)
3. Abra uma issue no GitHub

---

**Tempo total de instalação: ~5 minutos** ⚡
