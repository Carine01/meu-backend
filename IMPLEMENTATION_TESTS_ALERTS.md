# Implementação de Testes RBAC e Alertas Prometheus

Este documento descreve a implementação dos testes Jest para RBAC (Role-Based Access Control) e as queries customizadas do Prometheus para alertas.

## 📋 Sumário

1. [Testes Backend (NestJS)](#testes-backend-nestjs)
2. [Testes Frontend (React)](#testes-frontend-react)
3. [Alertas Prometheus](#alertas-prometheus)

## 🔐 Testes Backend (NestJS)

### RolesGuard - `src/modules/auth/roles.guard.spec.ts`

Implementa testes para o guard de autorização baseado em roles:

```typescript
✓ permite acesso se não há roles requeridas
✓ permite acesso se usuário tem role requerida
✓ nega acesso se usuário não tem role requerida
```

**Como executar:**
```bash
npm test -- roles.guard.spec.ts
```

### Estrutura do Guard

O guard implementado verifica se o usuário possui as roles necessárias através do decorator `@Roles()`:

- Se não há roles requeridas, permite acesso
- Se o usuário possui pelo menos uma das roles requeridas, permite acesso
- Caso contrário, nega o acesso

## ⚛️ Testes Frontend (React)

### Hook useRole - `apps/web/src/hooks/useRole.tsx`

Hook React que extrai a role do usuário a partir do JWT token armazenado no localStorage.

**Testes (`apps/web/src/hooks/tests/useRole.spec.tsx`):**
```typescript
✓ retorna null se não há token
✓ retorna o role do token JWT
✓ retorna null se token é inválido
```

**Uso:**
```tsx
const role = useRole();
if (role === 'admin') {
  // Mostrar funcionalidades de admin
}
```

### Hook useRefreshToken - `apps/web/src/hooks/useRefreshToken.tsx`

Hook React que gerencia a renovação de tokens de autenticação.

**Testes (`apps/web/src/hooks/tests/useRefreshToken.spec.tsx`):**
```typescript
✓ lança erro se não há refresh_token
✓ faz refresh e salva novo token
✓ lança erro se refresh falha
```

**Uso:**
```tsx
const refreshToken = useRefreshToken();

try {
  const newToken = await refreshToken();
  // Token renovado com sucesso
} catch (error) {
  // Erro ao renovar token
}
```

### Executar Testes Frontend

```bash
cd apps/web
npm test
```

## 📊 Alertas Prometheus

### Arquivo de Configuração - `observabilidade/prometheus_alerts.yml`

Implementa 4 alertas customizados para monitoramento de segurança e performance:

#### 1. ExcessiveLoginAttempts (Tentativas de Login Excessivas)

```promql
sum(increase(login_attempts_total[5m])) by (user) > 10
```

**Acionado quando:** Um usuário faz mais de 10 tentativas de login em 5 minutos.

**Severidade:** Warning  
**Categoria:** Security

#### 2. HighLoginFailureRate (Taxa Alta de Falhas de Login)

```promql
sum(increase(login_failures_total[5m])) by (user) > 5
```

**Acionado quando:** Um usuário teve mais de 5 falhas de login em 5 minutos.

**Severidade:** Warning  
**Categoria:** Security

#### 3. HighRBACRouteLatency (Latência Alta em Rotas RBAC)

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{route=~"/admin.*"}[5m])) by (le, route)) > 500
```

**Acionado quando:** O percentil 95 (p95) da latência das rotas `/admin*` ultrapassa 500ms.

**Severidade:** Warning  
**Categoria:** Performance

#### 4. RefreshTokenFailures (Falhas no Refresh Token)

```promql
sum(increase(refresh_token_failures_total[10m])) > 0
```

**Acionado quando:** Houve falhas ao validar refresh tokens nos últimos 10 minutos.

**Severidade:** Critical  
**Categoria:** Security

### Ativação dos Alertas

Os alertas foram configurados no arquivo `observabilidade/prometheus.yml`:

```yaml
rule_files:
  - 'prometheus_alerts.yml'
```

Para carregar os alertas no Prometheus, reinicie o serviço ou execute um reload:

```bash
# Via Docker Compose
docker-compose restart prometheus

# Ou via API (se configured)
curl -X POST http://localhost:9090/-/reload
```

## 🧪 Resumo dos Testes

### Backend (NestJS)
- **Total:** 3 testes
- **Status:** ✅ Todos passando
- **Arquivo:** `src/modules/auth/roles.guard.spec.ts`

### Frontend (React)
- **Total:** 6 testes
- **Status:** ✅ Todos passando
- **Arquivos:**
  - `apps/web/src/hooks/tests/useRole.spec.tsx` (3 testes)
  - `apps/web/src/hooks/tests/useRefreshToken.spec.tsx` (3 testes)

### Alertas Prometheus
- **Total:** 4 alertas customizados
- **Categorias:** Security (3), Performance (1)
- **Arquivo:** `observabilidade/prometheus_alerts.yml`

## 📦 Dependências Adicionadas

### Frontend (apps/web)
- `@testing-library/react` - Para testes de hooks React
- `@testing-library/jest-dom` - Matchers adicionais para Jest
- `jest-environment-jsdom` - Ambiente de DOM para testes

Nenhuma dependência adicional foi necessária no backend, pois o NestJS já possui suporte completo para testes com Jest.

## 🔍 Métricas Esperadas

Para que os alertas funcionem corretamente, o backend deve exportar as seguintes métricas:

- `login_attempts_total` - Contador de tentativas de login por usuário
- `login_failures_total` - Contador de falhas de login por usuário
- `http_request_duration_ms_bucket` - Histograma de latência das requisições HTTP
- `refresh_token_failures_total` - Contador de falhas ao validar refresh tokens

Estas métricas devem ser implementadas no backend usando bibliotecas como `prom-client` ou similar.

## 🎯 Próximos Passos

1. ✅ Implementar métricas de autenticação no backend
2. ✅ Configurar Alertmanager para envio de notificações
3. ✅ Criar dashboards no Grafana para visualização dos alertas
4. ✅ Documentar procedimentos de resposta a incidentes

---

**Data de Implementação:** 2025-11-23  
**Versão:** 1.0.0
