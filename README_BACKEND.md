# 🚀 Elevare Iara - Backend NestJS

Backend completo do sistema IARA (Inteligência Artificial de Relacionamento e Agendamento) com:
- **119 mensagens humanizadas** WhatsApp
- **35+ regras de negócio** (scoring, stages, etiquetas)
- **Fila inteligente** com retry automático
- **Agenda semanal** Segunda-Domingo
- **BI Dashboard** + Prometheus metrics

---

## 📦 Tecnologias

- **NestJS 10** (framework backend)
- **TypeORM** (ORM para PostgreSQL)
- **PostgreSQL 15** (banco de dados)
- **@nestjs/schedule** (CronJobs)
- **Axios** (HTTP client para webhooks)
- **Prometheus** (métricas de observabilidade)
- **Jest** (testes unitários)

---

## 🏗️ Estrutura de Módulos

```
src/
├── modules/
│   ├── config/          # Configurações de clínica
│   ├── leads/           # Gestão de leads (score, stages, etiquetas)
│   ├── agendamentos/    # CRUD de agendamentos
│   ├── mensagens/       # Biblioteca de 119 mensagens + resolver
│   ├── fila/            # Fila de envio WhatsApp com retry
│   ├── bi/              # Dashboard e métricas Prometheus
│   ├── campanhas/       # Agenda semanal automatizada
│   └── events/          # Log de eventos
├── cron/                # CronJobs (processar fila + executar agenda)
├── app.module.ts        # Módulo raiz
└── main.ts              # Bootstrap da aplicação
```

---

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais reais
```

**Variáveis obrigatórias:**
```env
DATABASE_URL=postgresql://elevare:elevare123@localhost:5432/elevare_iara
WEBHOOK_MAKE_URL=https://hook.us1.make.com/xxxxxx
MAKE_TOKEN=seu-token-make
```

### 3. Subir banco PostgreSQL (Docker)

```bash
docker run -d \
  --name elevare-postgres \
  -e POSTGRES_USER=elevare \
  -e POSTGRES_PASSWORD=elevare123 \
  -e POSTGRES_DB=elevare_iara \
  -p 5432:5432 \
  postgres:15-alpine
```

### 4. Rodar migrations (criar tabelas)

```bash
npm run migration:run
```

### 5. Iniciar servidor em desenvolvimento

```bash
npm run start:dev
```

**Servidor rodando em:** `http://localhost:3000`

---

## 📡 Endpoints API

### Leads
```http
POST   /leads                  # Criar lead novo
GET    /leads?etiqueta=Quente  # Buscar por etiqueta
GET    /leads/:id              # Buscar por ID
POST   /leads/:id/etiqueta     # Adicionar etiqueta
```

### Agendamentos
```http
POST   /agendamentos                  # Criar agendamento
PUT    /agendamentos/:id/confirmar   # Confirmar
PUT    /agendamentos/:id/compareceu  # Marcar comparecimento
PUT    /agendamentos/:id/no-show     # Marcar no-show
PUT    /agendamentos/:id/reagendar   # Reagendar
```

### Fila de Envio
```http
GET    /fila/processar?batch=10  # Processar fila manualmente
GET    /fila/pending             # Listar mensagens pendentes
POST   /fila/reprocessar         # Reprocessar falhas
```

### BI Dashboard
```http
GET    /bi/dashboard              # Métricas completas 30d/7d/hoje
GET    /bi/metrics                # Prometheus metrics (text/plain)
GET    /bi/leads-by-stage         # Distribuição frio/morno/quente
GET    /bi/conversao-por-origem   # Performance por origem
```

### Campanhas
```http
POST   /campanhas/executar-agenda?dia=Segunda  # Executar agenda manual
GET    /campanhas/regras-semanais              # Ver regras Segunda-Domingo
```

---

## 🤖 CronJobs Automáticos

### 1. Processar Fila (a cada 1 minuto)
```typescript
@Cron(CronExpression.EVERY_MINUTE)
async processarFila() {
  await this.filaService.processarFila(10);
}
```

**O que faz:**
- Busca até 10 mensagens `pending` com `scheduledFor <= agora`
- Envia via webhook Make.com/Zapier
- Atualiza status para `sent` ou `failed`
- Retry automático (até 3 tentativas)

### 2. Executar Agenda Semanal (9h todo dia)
```typescript
@Cron('0 9 * * *')
async executarAgendaSemanal() {
  await this.agendaSemanalService.executarAgendaDoDia();
}
```

**O que faz:**
- Identifica dia da semana (Segunda-Domingo)
- Busca leads por etiquetas conforme regras
- Adiciona mensagens na fila com horário agendado
- Exemplo Segunda: repescagem leads frios + reativação D+15

---

## 📊 Métricas Prometheus

**Endpoint:** `http://localhost:3000/bi/metrics`

**Exemplo de métricas expostas:**
```
# HELP elevare_leads_total Total de leads (30 dias)
# TYPE elevare_leads_total gauge
elevare_leads_total{periodo="30d", tipo="total"} 150
elevare_leads_total{periodo="30d", tipo="qualificados"} 42

# HELP elevare_conversao_percentual Taxa de conversão (%)
# TYPE elevare_conversao_percentual gauge
elevare_conversao_percentual 28.5

# HELP elevare_no_show_percentual Taxa de no-show (%)
# TYPE elevare_no_show_percentual gauge
elevare_no_show_percentual 8.2
```

**Configurar scraping no Prometheus:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'elevare-backend'
    scrape_interval: 60s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/bi/metrics'
```

---

## 🧪 Testes

### Rodar todos os testes
```bash
npm run test
```

### Rodar com coverage
```bash
npm run test:cov
```

### Watch mode (desenvolvimento)
```bash
npm run test:watch
```

**Exemplo de teste (LeadsService):**
```typescript
it('deve criar lead com score 80 quando clica WhatsApp', async () => {
  const leadData = {
    nome: 'Maria Teste',
    telefone: '5511999999999',
    origem: 'WhatsApp',
    clickedWhatsapp: true,
    timeOnPage: 150,
  };

  const result = await service.criarLead(leadData);

  expect(result.score).toBe(80);
  expect(result.stage).toBe('quente');
});
```

---

## 🐳 Docker (Produção)

### Build da imagem
```bash
docker build -t elevare-backend:latest .
```

### Rodar container
```bash
docker run -d \
  --name elevare-backend \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e WEBHOOK_MAKE_URL=https://... \
  elevare-backend:latest
```

### Docker Compose (backend + postgres + prometheus)
```bash
docker-compose up -d
```

---

## 📚 Documentação Completa

- **[IARA_SISTEMA_COMPLETO.md](./IARA_SISTEMA_COMPLETO.md)** - Documentação master (12k palavras)
  - 119 mensagens detalhadas
  - 35+ regras de scoring
  - Fluxograma de fila
  - Regras semanais Segunda-Domingo
  - Casos de uso completos

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev     # Servidor com hot-reload
npm run start:debug   # Servidor com debugger

# Build
npm run build         # Compilar TypeScript

# Produção
npm run start:prod    # Rodar compilado (dist/)

# Banco de dados
npm run migration:generate  # Gerar nova migration
npm run migration:run       # Executar migrations pendentes
npm run migration:revert    # Reverter última migration

# Testes
npm run test          # Rodar testes Jest
npm run test:watch    # Testes em watch mode
npm run test:cov      # Coverage report

# Linting
npm run lint          # ESLint
npm run format        # Prettier
```

---

## 🎯 Próximos Passos

### Prioridade P1 (Esta Sprint)
- [x] CronService para processar fila + executar agenda
- [x] Integração completa de módulos
- [ ] Testar fluxo completo local
- [ ] Deploy Cloud Run / Heroku
- [ ] Configurar webhook Make.com real

### Prioridade P2 (Próxima Sprint)
- [ ] Frontend Admin React para gerenciar mensagens
- [ ] Editor visual de regras semanais
- [ ] Dashboard React com gráficos (Chart.js)
- [ ] Exportar relatórios CSV/PDF
- [ ] Notificações Telegram para admin

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Testar conexão manual
psql postgresql://elevare:elevare123@localhost:5432/elevare_iara
```

### Erro: "Webhook failed (ECONNREFUSED)"
```bash
# Verificar se WEBHOOK_MAKE_URL está configurado
echo $WEBHOOK_MAKE_URL

# Testar webhook manualmente
curl -X POST $WEBHOOK_MAKE_URL \
  -H "Content-Type: application/json" \
  -d '{"phone":"+5511999999999","message":"Teste"}'
```

### CronJob não está executando
```bash
# Verificar logs do NestJS
npm run start:dev

# Logs devem mostrar:
# [CronService] 🔄 Processando fila de envio...
# [CronService] 📅 Executando agenda semanal do dia...
```

---

## 📞 Suporte

**Equipe:** Elevare Tech Team  
**Email:** tech@elevare.com.br  
**Documentação:** [IARA_SISTEMA_COMPLETO.md](./IARA_SISTEMA_COMPLETO.md)

---

**Desenvolvido com 💜 por GitHub Copilot (Claude Sonnet 4.5)**  
**Para:** Elevare Estética - Carine Marques  
**Versão:** 1.0.0 (21/11/2025)
