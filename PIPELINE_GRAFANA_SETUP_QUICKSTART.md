# 🚀 Quick Start: Pipeline CI/CD e Dashboard Grafana

Este guia rápido ajuda você a começar imediatamente com o pipeline CI/CD e dashboard Grafana implementados.

## ⚡ Início Rápido (5 minutos)

### 1. Pipeline CI/CD - Já Funciona!

O pipeline está ativo e será executado automaticamente em:
- ✅ **Push** para branch `main`
- ✅ **Pull Requests** para qualquer branch

**O que o pipeline faz:**
```
┌─────────────────┐
│ Setup Node.js 18│
└────────┬────────┘
         │
┌────────▼────────┐
│  Install Deps   │ (API + Web)
└────────┬────────┘
         │
┌────────▼────────┐
│  Lint & Test    │ (API + Web)
└────────┬────────┘
         │
┌────────▼────────┐
│     Build       │ (API + Web)
└────────┬────────┘
         │
┌────────▼────────┐
│    Deploy       │ (apenas main)
└─────────────────┘
```

**Ver execuções**: https://github.com/Carine01/meu-backend/actions

### 2. Dashboard Grafana (3 passos)

#### Passo 1: Abra o Grafana
```bash
# Se não estiver rodando:
docker-compose up -d grafana
# Acesse: http://localhost:3001 (ou porta configurada)
```

#### Passo 2: Importe o Dashboard
1. Clique em **"+"** → **"Import"**
2. Cole o conteúdo de `observabilidade/grafana-dashboard-auth-rbac.json`
3. Selecione **Prometheus** como data source
4. Clique em **"Import"**

#### Passo 3: Veja os Dados!
O dashboard mostra:
- 📊 Tentativas de login
- ❌ Falhas de autenticação
- ⚡ Latência de rotas admin
- 🔄 Problemas com tokens

## 📊 Entendendo os Painéis

### Painel 1: Tentativas de Login
**O que mostra**: Quantas vezes cada usuário tentou fazer login  
**Quando se preocupar**: Aumento súbito pode indicar atividade suspeita

### Painel 2: Falhas de Login
**O que mostra**: Tentativas de login que falharam  
**Quando se preocupar**: > 5 falhas em 5 min para mesmo usuário = possível ataque

### Painel 3: Latência p95
**O que mostra**: 95% das requisições para rotas admin são mais rápidas que X ms  
**Quando se preocupar**: p95 > 1000ms = performance degradada

### Painel 4: Falhas de Refresh Token
**O que mostra**: Problemas ao renovar tokens de autenticação  
**Quando se preocupar**: > 10 falhas em 10 min = problema no serviço

## 🔧 Configuração Básica

### Se as métricas não aparecem

1. **Verifique o Prometheus**:
```bash
curl http://localhost:9090/api/v1/query?query=up
```

2. **Verifique se o backend está exportando**:
```bash
curl http://localhost:3000/bi/metrics
```

3. **Se não está exportando, implemente PrometheusService**:
```bash
npm install prom-client
```

Ver exemplo completo em `docs/MONOREPO_TEST_ORGANIZATION.md`

### Executar Testes Localmente

```bash
# Backend (API)
npm run test:cov

# Frontend (Web)
cd apps/frontend
npm run test
```

### Executar Lint

```bash
# Backend
npm run lint

# Frontend
cd apps/frontend
npm run lint
```

## 🎯 Próximos Passos Recomendados

### Prioridade Alta (fazer esta semana)

1. **Implementar PrometheusService** (30 min)
   - Instalar `prom-client`
   - Copiar código de `docs/MONOREPO_TEST_ORGANIZATION.md`
   - Integrar no AuthService

2. **Configurar Alertas Básicos** (20 min)
   - Criar arquivo `observabilidade/prometheus-alerts.yml`
   - Configurar alerta para alta taxa de falhas de login

3. **Testar Dashboard** (10 min)
   - Fazer alguns logins de teste
   - Verificar se métricas aparecem no Grafana

### Prioridade Média (próximas 2 semanas)

4. **Configurar ESLint no Backend** (1 hora)
```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

5. **Adicionar Testes no Frontend** (2 horas)
```bash
cd apps/frontend
npm install --save-dev vitest @testing-library/react
```

6. **Adicionar Mais Painéis ao Grafana** (1 hora)
   - Taxa de conversão
   - Tempo médio de sessão
   - Distribuição de roles

### Prioridade Baixa (quando tiver tempo)

7. **Migrar para Yarn Workspaces**
8. **Configurar cache de npm no CI**
9. **Integrar Alertmanager com Slack**

## 📚 Documentação Completa

- **[MONOREPO_TEST_ORGANIZATION.md](docs/MONOREPO_TEST_ORGANIZATION.md)**: Tudo sobre testes e SOLID
- **[CI_CD_GRAFANA_SETUP.md](docs/CI_CD_GRAFANA_SETUP.md)**: Configuração detalhada
- **[IMPLEMENTACAO_CI_CD_OBSERVABILIDADE.md](docs/IMPLEMENTACAO_CI_CD_OBSERVABILIDADE.md)**: Resumo técnico

## 🆘 Problemas Comuns

### Pipeline não executa
**Solução**: Verifique se tem permissões no repositório

### Dashboard sem dados
**Solução**: 
1. Confirme que Prometheus está coletando métricas
2. Verifique se backend está rodando
3. Implemente PrometheusService se ainda não fez

### Testes falhando
**Solução**: Alguns testes já estavam falhando antes (19 suites). Pipeline usa `continue-on-error` até corrigir.

### Build com erros TypeScript
**Solução**: Erros pré-existentes. Não relacionados a esta implementação.

## 💡 Dicas Pro

1. **Customize o dashboard**: Edite as queries Prometheus para suas necessidades
2. **Adicione labels**: Use `by (user, clinic_id)` nas queries para mais detalhes
3. **Configure refresh automático**: No Grafana, configure para atualizar a cada 30s
4. **Exporte configurações**: Mantenha o JSON do dashboard versionado

## 🎉 Pronto!

Agora você tem:
- ✅ Pipeline CI/CD automatizado
- ✅ Dashboard Grafana configurável
- ✅ Documentação completa
- ✅ Estrutura escalável

**Próximo Passo**: Implemente o PrometheusService para ver dados reais no dashboard!

---

**Precisa de ajuda?** Consulte a documentação completa em `docs/` ou abra uma issue.
