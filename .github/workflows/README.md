# GitHub Actions Workflows

Este diretório contém 8 workflows automatizados para garantir qualidade, segurança e deploy automático.

## 📋 Workflows Disponíveis

### 1. 🛡️ TypeScript Guardian
**Arquivo:** `typescript-guardian.yml`  
**Quando executa:** Push/PR para main e develop  
**O que faz:**
- Verifica erros de TypeScript em todo o código
- Bloqueia merge se encontrar erros
- Mostra mensagens de erro detalhadas

**Como funciona:**
```bash
npx tsc --noEmit
```

---

### 2. 🔒 Security Audit
**Arquivo:** `security-audit.yml`  
**Quando executa:** Push/PR para main e develop  
**O que faz:**
- Detecta queries sem filtro `clinicId`
- Avisa sobre endpoints sem `@UseGuards()`
- Detecta secrets hardcoded no código

**Verificações:**
- ✅ Queries com `where` clause
- ✅ Endpoints protegidos com guards
- ✅ Sem passwords ou API keys no código

---

### 3. 🐳 Docker Builder & Tester
**Arquivo:** `docker-builder.yml`  
**Quando executa:** Push/PR para main, develop, feat/*  
**O que faz:**
- Builda a imagem Docker
- Sobe os serviços (postgres + backend)
- Testa health endpoint
- Publica no GHCR (GitHub Container Registry)

**Requisitos:**
- Docker
- docker-compose

---

### 4. 🎭 E2E Test Runner
**Arquivo:** `e2e-runner.yml`  
**Quando executa:** Diariamente às 6h UTC ou manual  
**O que faz:**
- Cria banco PostgreSQL limpo
- Roda testes E2E
- Salva relatórios de teste

**Como executar manualmente:**
1. Vá em Actions
2. Selecione "E2E Test Runner"
3. Clique em "Run workflow"

---

### 5. 🚀 Deploy Master
**Arquivo:** `deploy-master.yml`  
**Quando executa:** Push para main (exceto docs e .md)  
**O que faz:**
- Conecta via SSH no servidor
- Para serviços
- Puxa código novo
- Builda e sobe novamente
- Verifica health check
- Limpa imagens antigas

**Secrets necessários:**
- `SERVER_SSH_KEY`: Chave SSH privada
- `SERVER_HOST`: IP/hostname do servidor
- `SERVER_USER`: Usuário SSH
- `PROJECT_PATH`: Caminho do projeto (opcional, padrão: ~/meu-backend)

**Como configurar:**
1. Vá em Settings → Secrets and variables → Actions
2. Adicione os secrets acima
3. O workflow executará automaticamente no próximo push para main

---

### 6. 📱 WhatsApp Monitor
**Arquivo:** `whatsapp-monitor.yml`  
**Quando executa:** A cada 10 minutos  
**O que faz:**
- Checa `/whatsapp/status`
- Se desconectado, envia alerta
- Suporta Discord e Slack

**Secrets opcionais:**
- `API_URL`: URL da API (padrão: https://sua-api.com)
- `DISCORD_WEBHOOK`: Webhook do Discord
- `SLACK_WEBHOOK`: Webhook do Slack

**Como configurar alertas:**
```bash
# Discord
1. Vá em Server Settings → Integrations → Webhooks
2. Crie um webhook
3. Adicione a URL no secret DISCORD_WEBHOOK

# Slack
1. Vá em Slack API → Incoming Webhooks
2. Crie um webhook
3. Adicione a URL no secret SLACK_WEBHOOK
```

---

### 7. 🚧 Quality Gate
**Arquivo:** `quality-gate.yml`  
**Quando executa:** Em todos os PRs  
**O que faz:**
- Limita PR a 15 arquivos
- Verifica formato de commits (feat:, fix:, etc.)
- Bloqueia `console.log`
- Avisa sobre TODOs

**Regras:**
- ❌ PR com mais de 15 arquivos → FAIL
- ❌ console.log no código → FAIL
- ⚠️ Commits sem prefixo → WARNING
- ⚠️ TODOs no código → WARNING

---

### 8. ⚡ Performance Alert
**Arquivo:** `performance-alert.yml`  
**Quando executa:** A cada 6 horas, em PRs ou manual  
**O que faz:**
- Detecta queries sem paginação
- Identifica N+1 queries (loops com find)
- Verifica falta de índices
- Detecta operações síncronas (readFileSync)

**O que analisa:**
- Queries com `.find()` sem `take`/`skip`
- Loops com queries dentro
- Entities sem `@Index()`
- I/O síncrono

---

## 🚀 Como Ativar

### Já Ativo Automaticamente
Estes workflows executam automaticamente:
- ✅ TypeScript Guardian (em PRs)
- ✅ Security Audit (em PRs)
- ✅ Docker Builder (em pushes)
- ✅ Quality Gate (em PRs)
- ✅ E2E Runner (diariamente)
- ✅ Performance Alert (a cada 6h)
- ✅ WhatsApp Monitor (a cada 10min)

### Precisam de Configuração
- 🚀 Deploy Master → Configure secrets SSH
- 📱 WhatsApp Monitor → Configure webhook para alertas

---

## 📊 Dashboard

Acesse: `https://github.com/Carine01/meu-backend/actions`

Você verá todos os workflows e seus status:
- 🟢 Verde = Passou
- 🔴 Vermelho = Falhou
- 🟡 Amarelo = Em execução
- ⚪ Cinza = Não executado

---

## 🔧 Manutenção

### Desabilitar um workflow
1. Vá em Actions
2. Selecione o workflow
3. Clique em "..." → "Disable workflow"

### Executar manualmente
1. Vá em Actions
2. Selecione o workflow
3. Clique em "Run workflow"

### Ver logs de execução
1. Vá em Actions
2. Clique na execução desejada
3. Clique no job para ver logs

---

## 🐛 Troubleshooting

### TypeScript Guardian falha
**Problema:** Encontrou erros TypeScript  
**Solução:**
```bash
# Localmente, rode:
npm install
npx tsc --noEmit
# Corrija os erros e commit
```

### Docker Builder falha
**Problema:** Build Docker falhou  
**Solução:**
```bash
# Teste localmente:
docker-compose build
docker-compose up
# Verifique logs e corrija
```

### Deploy Master não executa
**Problema:** Secrets não configurados  
**Solução:** Configure os secrets necessários (veja seção Deploy Master)

### WhatsApp Monitor sempre falha
**Problema:** API não responde ou URL incorreta  
**Solução:** Configure o secret `API_URL` com a URL correta

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

## 🎯 Prioridades

### Agora (Essencial)
1. TypeScript Guardian
2. Security Audit
3. Quality Gate

### Depois (Importante)
4. Docker Builder
5. E2E Runner

### Futuro (Opcional)
6. Deploy Master (requer configuração)
7. WhatsApp Monitor (requer configuração)
8. Performance Alert (informativo)
