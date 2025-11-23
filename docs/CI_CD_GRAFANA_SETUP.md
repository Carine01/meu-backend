# Configuração CI/CD e Dashboard Grafana

## 📋 Visão Geral

Este documento descreve a configuração do pipeline CI/CD para o monorepo e a integração com o dashboard Grafana para observabilidade de autenticação e RBAC.

## 🔄 Pipeline CI/CD

### Arquivo de Configuração

O pipeline está configurado em `.github/workflows/ci-cd.yml` e executa automaticamente em:
- **Push** para a branch `main`
- **Pull Requests** para qualquer branch

### Etapas do Pipeline

#### 1. Setup
```yaml
- Setup Node.js 18
- Checkout do código
```

#### 2. Instalação de Dependências
```yaml
- Install dependencies - API (root)
- Install dependencies - Web (apps/frontend)
```

#### 3. Linting
```yaml
- Lint API (NestJS)
- Lint Web (React)
```
**Nota**: Lint API tem `continue-on-error: true` até que ESLint seja configurado.

#### 4. Testes
```yaml
- Test API (NestJS RBAC) com cobertura
- Test Web (React hooks)
```

Variáveis de ambiente:
- `NODE_ENV=test`

#### 5. Build
```yaml
- Build API (TypeScript → JavaScript)
- Build Web (React + Vite)
```

#### 6. Deploy
```yaml
- Deploy (apenas em main)
```
**Nota**: Atualmente é um placeholder. Configure conforme sua infraestrutura.

### Como Executar Localmente

#### Backend (API)
```bash
# Instalar dependências
npm install

# Lint
npm run lint

# Testes
npm run test

# Testes com cobertura
npm run test:cov

# Build
npm run build
```

#### Frontend (Web)
```bash
# Navegar para o diretório
cd apps/frontend

# Instalar dependências
npm install

# Lint
npm run lint

# Testes
npm run test

# Build
npm run build
```

### Estrutura de Testes

O pipeline executa:

**API (NestJS)**
- Testes unitários de serviços (Auth, RBAC, BI)
- Testes de guards (JWT, Firebase)
- Testes de integração
- Cobertura de código com Jest

**Web (React)**
- Testes de hooks customizados (useAuth, useRBAC)
- Testes de componentes
- Testes de integração

## 📊 Dashboard Grafana

### Descrição

O dashboard "Auth & RBAC Observability" fornece visibilidade em tempo real sobre:
- Tentativas e falhas de login
- Performance de rotas protegidas
- Problemas com refresh tokens

### Painéis

#### 1. Tentativas de Login por Usuário
**Métrica**: `login_attempts_total`
**Query Prometheus**:
```promql
sum(increase(login_attempts_total[5m])) by (user)
```
**Visualização**: Gráfico de linha mostrando tentativas por usuário nos últimos 5 minutos

#### 2. Falhas de Login por Usuário
**Métrica**: `login_failures_total`
**Query Prometheus**:
```promql
sum(increase(login_failures_total[5m])) by (user)
```
**Visualização**: Gráfico de linha mostrando falhas por usuário

**Alertas sugeridos**:
- Mais de 5 falhas em 5 minutos para o mesmo usuário
- Pode indicar tentativa de invasão

#### 3. Latência p95 Rotas Protegidas (RBAC)
**Métrica**: `http_request_duration_ms`
**Query Prometheus**:
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{route=~"/admin.*"}[5m])) by (le, route))
```
**Visualização**: Gráfico mostrando percentil 95 de latência para rotas admin

**Alertas sugeridos**:
- p95 > 1000ms (1 segundo)
- Indica degradação de performance

#### 4. Falhas de Refresh Token
**Métrica**: `refresh_token_failures_total`
**Query Prometheus**:
```promql
sum(increase(refresh_token_failures_total[10m]))
```
**Visualização**: Contador de falhas nos últimos 10 minutos

**Alertas sugeridos**:
- Mais de 10 falhas em 10 minutos
- Pode indicar problema no serviço de auth

### Como Importar o Dashboard

#### Método 1: Via UI

1. Acesse o Grafana
2. Clique no ícone "+" no menu lateral
3. Selecione "Import"
4. Cole o conteúdo do arquivo `observabilidade/grafana-dashboard-auth-rbac.json`
5. Selecione a fonte de dados Prometheus
6. Clique em "Import"

#### Método 2: Via API

```bash
curl -X POST http://grafana:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
  -d @observabilidade/grafana-dashboard-auth-rbac.json
```

#### Método 3: Via Arquivo (Provisioning)

```yaml
# grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'Default'
    folder: 'Observability'
    type: file
    options:
      path: /etc/grafana/provisioning/dashboards
```

Copie o arquivo JSON para o diretório de provisioning.

### Configuração do Prometheus

O Prometheus já está configurado em `observabilidade/prometheus.yml` para coletar métricas do backend:

```yaml
scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/bi/metrics'
    scrape_interval: 30s
```

### Métricas Exportadas

O backend deve exportar as seguintes métricas via endpoint `/bi/metrics`:

```typescript
// Métricas de autenticação
login_attempts_total{user="email@example.com"}
login_failures_total{user="email@example.com"}
refresh_token_failures_total

// Métricas de performance
http_request_duration_ms_bucket{route="/admin/users", method="GET", status="200", le="50"}
http_request_duration_ms_bucket{route="/admin/users", method="GET", status="200", le="100"}
...
```

### Implementação das Métricas

#### Passo 1: Instalar prom-client

```bash
npm install prom-client
```

#### Passo 2: Criar PrometheusService

Veja exemplo completo em `docs/MONOREPO_TEST_ORGANIZATION.md`

#### Passo 3: Integrar no AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly prometheusService: PrometheusService,
  ) {}

  async login(loginDto: LoginDto) {
    this.prometheusService.incrementLoginAttempts(loginDto.email);
    
    try {
      // lógica de login
      return token;
    } catch (error) {
      this.prometheusService.incrementLoginFailures(loginDto.email);
      throw error;
    }
  }
}
```

#### Passo 4: Expor endpoint de métricas

```typescript
@Controller('bi')
export class BiController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get('metrics')
  async getMetrics() {
    const metrics = await this.prometheusService.getMetrics();
    return metrics;
  }
}
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente

#### Backend
```env
NODE_ENV=production
PROMETHEUS_ENABLED=true
METRICS_ENDPOINT=/bi/metrics
```

#### Prometheus
```env
PROMETHEUS_SCRAPE_INTERVAL=30s
PROMETHEUS_EVALUATION_INTERVAL=15s
```

#### Grafana
```env
GF_SECURITY_ADMIN_PASSWORD=admin
GF_INSTALL_PLUGINS=grafana-piechart-panel
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PROMETHEUS_ENABLED=true

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./observabilidade/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./observabilidade/grafana-dashboard-auth-rbac.json:/etc/grafana/provisioning/dashboards/auth-rbac.json
      - ./observabilidade/grafana-datasources.yml:/etc/grafana/provisioning/datasources/prometheus.yml
```

## 📈 Alertas Recomendados

### 1. Taxa Alta de Falhas de Login

```yaml
- alert: HighLoginFailureRate
  expr: rate(login_failures_total[5m]) > 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Taxa alta de falhas de login"
    description: "Taxa de falhas: {{ $value }} por segundo"
```

### 2. Latência Alta em Rotas Admin

```yaml
- alert: HighAdminLatency
  expr: histogram_quantile(0.95, rate(http_request_duration_ms_bucket{route=~"/admin.*"}[5m])) > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Latência alta em rotas admin"
    description: "p95: {{ $value }}ms"
```

### 3. Falhas de Refresh Token

```yaml
- alert: HighRefreshTokenFailures
  expr: increase(refresh_token_failures_total[10m]) > 10
  labels:
    severity: critical
  annotations:
    summary: "Muitas falhas no refresh token"
    description: "{{ $value }} falhas nos últimos 10 minutos"
```

## 🧪 Testando o Pipeline

### Teste Local

```bash
# Simular o pipeline localmente
./scripts/ci-local.sh
```

### Teste com Act (GitHub Actions localmente)

```bash
# Instalar act
brew install act  # macOS
# ou
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Executar workflow
act -W .github/workflows/ci-cd.yml
```

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [NestJS Metrics](https://docs.nestjs.com/openapi/introduction)
- [prom-client](https://github.com/siimon/prom-client)

## 🆘 Troubleshooting

### Pipeline CI/CD

**Problema**: Testes falhando no CI mas passando localmente
**Solução**: 
- Verifique variáveis de ambiente
- Confirme versão do Node.js
- Limpe cache: `npm ci` ao invés de `npm install`

**Problema**: Build timeout
**Solução**:
- Aumente timeout no workflow
- Otimize dependências
- Use cache de npm

### Grafana

**Problema**: Dashboard não carrega dados
**Solução**:
- Verifique conexão com Prometheus
- Confirme que métricas estão sendo exportadas: `curl http://localhost:3000/bi/metrics`
- Verifique queries do Prometheus

**Problema**: Métricas não aparecem
**Solução**:
- Verifique se PrometheusService está registrado no módulo
- Confirme que prom-client está instalado
- Verifique logs do backend

## 🔐 Segurança

- **Não** exponha o endpoint `/metrics` publicamente em produção
- Use autenticação para Grafana
- Configure CORS apropriadamente
- Use HTTPS em produção
- Rotacione credenciais regularmente
