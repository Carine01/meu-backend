# Prometheus Alert Queries - Quick Reference

Este documento contém as queries PromQL customizadas implementadas para monitoramento de autenticação e performance do RBAC.

## 🔐 Alertas de Autenticação

### 1. Alerta de Tentativas de Login Excessivas

**Nome:** `ExcessiveLoginAttempts`  
**Severidade:** Warning  
**Categoria:** Security

```promql
sum(increase(login_attempts_total[5m])) by (user) > 10
```

**Descrição:** Alerta se algum usuário fez mais de 10 tentativas de login em 5 minutos.

**Quando usar:** Para detectar possíveis ataques de força bruta ou comportamento suspeito de usuários.

**Ação sugerida:**
1. Verificar logs de acesso do usuário
2. Investigar origem dos requests (IP, geolocalização)
3. Considerar bloqueio temporário se confirmado ataque

---

### 2. Alerta de Falhas de Login

**Nome:** `HighLoginFailureRate`  
**Severidade:** Warning  
**Categoria:** Security

```promql
sum(increase(login_failures_total[5m])) by (user) > 5
```

**Descrição:** Alerta se algum usuário teve mais de 5 falhas de login em 5 minutos.

**Quando usar:** Para detectar tentativas de acesso não autorizado ou problemas de autenticação.

**Ação sugerida:**
1. Verificar se é um problema legítimo (usuário esqueceu senha)
2. Investigar padrões de tentativas (horário, origem)
3. Implementar CAPTCHA ou desafios adicionais se necessário

---

## 🚀 Alertas de Performance

### 3. Alerta de Latência Alta em Rotas Protegidas por RBAC

**Nome:** `HighRBACRouteLatency`  
**Severidade:** Warning  
**Categoria:** Performance

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{route=~"/admin.*"}[5m])) by (le, route)) > 500
```

**Descrição:** Alerta se o p95 da latência das rotas `/admin*` passar de 500ms.

**Rotas monitoradas:**
- `/admin`
- `/admin/users`
- `/admin/settings`
- `/admin/reports`
- Todas as rotas que começam com `/admin`

**Quando usar:** Para monitorar a performance de rotas críticas que requerem verificação de roles.

**Ação sugerida:**
1. Verificar carga atual do sistema
2. Analisar queries de banco de dados lentas
3. Revisar lógica de verificação de roles/permissões
4. Considerar implementar cache de permissões

---

## 🔑 Alertas de Tokens

### 4. Alerta de Ausência de Refresh Tokens Válidos

**Nome:** `RefreshTokenFailures`  
**Severidade:** Critical  
**Categoria:** Security

```promql
sum(increase(refresh_token_failures_total[10m])) > 0
```

**Descrição:** Alerta se houve falha ao validar refresh tokens nos últimos 10 minutos.

**Quando usar:** Para detectar problemas no sistema de renovação de tokens ou tentativas de uso de tokens inválidos.

**Ação sugerida:**
1. Verificar integridade do serviço de autenticação
2. Validar se há problema com armazenamento de tokens (Redis, DB)
3. Investigar se usuários estão sendo forçados a re-autenticar desnecessariamente
4. Verificar logs de erro do serviço de refresh token

---

## 📊 Métricas Necessárias

Para que as queries funcionem, o backend deve exportar as seguintes métricas no formato Prometheus:

### Counters (Contadores)
```typescript
// Tentativas totais de login por usuário
login_attempts_total{user="user@example.com"}

// Falhas totais de login por usuário
login_failures_total{user="user@example.com"}

// Falhas na validação de refresh tokens
refresh_token_failures_total
```

### Histograms (Histogramas)
```typescript
// Duração das requisições HTTP em milissegundos
http_request_duration_ms_bucket{route="/admin/users", le="100"}
http_request_duration_ms_bucket{route="/admin/users", le="500"}
http_request_duration_ms_bucket{route="/admin/users", le="1000"}
http_request_duration_ms_bucket{route="/admin/users", le="+Inf"}
```

---

## 🔧 Configuração

### Habilitar Alertas

1. Certifique-se de que o arquivo `prometheus_alerts.yml` está no diretório de configuração
2. O `prometheus.yml` deve referenciar o arquivo de alertas:

```yaml
rule_files:
  - 'prometheus_alerts.yml'
```

3. Reinicie o Prometheus ou execute reload:

```bash
# Via Docker Compose
docker-compose restart prometheus

# Via API (se --web.enable-lifecycle está habilitado)
curl -X POST http://localhost:9090/-/reload
```

### Verificar Alertas Ativos

Acesse a UI do Prometheus:
```
http://localhost:9090/alerts
```

---

## 📈 Queries para Dashboard

### Tentativas de Login por Usuário (últimas 24h)
```promql
sum(increase(login_attempts_total[24h])) by (user)
```

### Taxa de Falhas de Login (%)
```promql
(sum(rate(login_failures_total[5m])) / sum(rate(login_attempts_total[5m]))) * 100
```

### Latência Média das Rotas Admin
```promql
rate(http_request_duration_ms_sum{route=~"/admin.*"}[5m]) / rate(http_request_duration_ms_count{route=~"/admin.*"}[5m])
```

### Top 5 Usuários com Mais Tentativas de Login
```promql
topk(5, sum(increase(login_attempts_total[1h])) by (user))
```

---

## 🚨 Níveis de Severidade

| Severidade | Descrição | Ação Imediata |
|------------|-----------|---------------|
| **Critical** | Problema sério que afeta disponibilidade ou segurança | Investigação e resolução imediata |
| **Warning** | Problema potencial que requer atenção | Investigar dentro de 1-2 horas |
| **Info** | Notificação informativa | Revisar quando conveniente |

---

## 📝 Notas Importantes

1. **Thresholds Ajustáveis:** Os valores de threshold (10, 5, 500ms, etc.) devem ser ajustados conforme o perfil de uso do sistema.

2. **False Positives:** Considere adicionar `for: Xm` nas regras para evitar alertas em picos momentâneos.

3. **Granularidade:** Os intervalos de tempo (`[5m]`, `[10m]`) podem ser ajustados conforme a necessidade de detecção rápida vs. redução de ruído.

4. **Integração com Alertmanager:** Configure o Alertmanager para enviar notificações via Slack, email, PagerDuty, etc.

---

**Data de Criação:** 2025-11-23  
**Versão:** 1.0.0  
**Autor:** Sistema de Monitoramento Elevare
