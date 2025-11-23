# meu-backend

Backend NestJS com integração Firebase e suporte a multitenancy.

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

## Como rodar em produção

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou banco configurado)
- Docker e Docker Compose (opcional)

### Deploy com Docker Compose
1. Configure as variáveis de ambiente em `.env` ou como secrets no CI/CD
2. Execute:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Validação pós-deploy
1. Valide containers:
   ```bash
   docker ps
   ```
2. Verifique os logs:
   ```bash
   docker logs <container-name>
   ```

## Configuração do x-clinic-id (Multitenancy)

Este backend suporta multitenancy através do header HTTP `x-clinic-id`. Cada requisição deve incluir este header para filtrar dados por clínica.

### Exemplo de uso
```bash
curl -H "x-clinic-id: CLINICA_1" http://localhost:3000/pacientes
```

### Módulos com suporte a multitenancy
- **Pacientes**: GET `/pacientes` - Lista pacientes filtrados por `clinicId`

### Frontend
No frontend React, inclua o header em todas as requisições:
```typescript
fetch('/api/pacientes', {
  headers: { 'x-clinic-id': 'CLINICA_1' }
})
```

## Métricas Prometheus

O backend expõe métricas do Prometheus no endpoint `/metrics`.

### Acessar métricas
```bash
curl http://localhost:3000/metrics
```

### Configurar scrape no Prometheus
Adicione ao `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'clinic-backend'
    static_configs:
      - targets: ['backend-service:3000']
```

### Dashboards Grafana
1. Importe dashboards padrão do Prometheus
2. Configure visualizações para:
   - Taxa de requisições HTTP
   - Latência de resposta
   - Status codes (especialmente 4xx e 5xx)

### Alertas
Configure alertas no Prometheus Alertmanager para:
- Status code >= 500 (erros de servidor)
- Latência alta (> 1s)
- Taxa de erro elevada

## Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

### Secrets no GitHub Actions
Configure os seguintes secrets em **Settings > Secrets and variables > Actions**:
- `DATABASE_URL` - URL de conexão do banco de dados
- `API_KEY` - Chave de API do backend
- `PROMETHEUS_PUSHGATEWAY_URL` - URL do Prometheus Pushgateway (opcional)
- `GCP_SA_KEY` - Credenciais do Google Cloud (para deploy no Cloud Run)

## Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start` — inicia em modo produção
- `npm run test` — executa os testes
- `npm run test:watch` — executa testes em modo watch
- `npm run test:cov` — executa testes com cobertura

## Como rodar testes

### Testes unitários
```bash
npm test
```

### Testes em modo watch
```bash
npm run test:watch
```

### Testes com cobertura
```bash
npm run test:cov
```

### Estrutura de testes
Os testes seguem o padrão Jest e estão localizados junto aos arquivos fonte:
- `*.spec.ts` - Testes unitários
- `test/*.spec.ts` - Testes e2e

## Monitoramento e Dashboards

### Onde ver métricas
1. **Prometheus**: Acesse `http://<prometheus-host>:9090`
2. **Grafana**: Configure dashboards em `http://<grafana-host>:3000`
3. **Métricas raw**: `http://localhost:3000/metrics`

### Dashboards recomendados
- **Node.js Application Dashboard**: Métricas gerais do aplicativo
- **HTTP Request Dashboard**: Requisições HTTP, latência, status codes
- **Database Dashboard**: Queries, conexões, latência do banco

### Como configurar alertas
1. Acesse Prometheus Alertmanager
2. Configure regras de alerta em `prometheus.rules.yml`:
```yaml
groups:
  - name: backend-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Alta taxa de erros no backend"
      
      - alert: HighLatency
        expr: http_request_duration_seconds > 1
        for: 5m
        annotations:
          summary: "Latência alta detectada"
```

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

---

> Projeto criado por Carine01
