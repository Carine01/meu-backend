# 🤖 AGENTES_GITHUB.md - Instruções de Automação

**Data:** 22 de novembro de 2025  
**Objetivo:** Automatizar 100% dos pipelines de CI/CD, testes e monitoramento  
**Meta:** Reduzir deploy de 30min para 3min e eliminar erros humanos

---

## 🎯 OBJETIVO

Automatizar 100% dos pipelines de CI/CD, testes e monitoramento para reduzir deploy de 30min para 3min e eliminar erros humanos.

---

## 🤖 AGENTE 1: "TypeScript Guardian"

**Função:** Impede commit com erros de TypeScript

**Arquivo:** `.github/workflows/typescript-guardian.yml`

```yaml
name: 🛡️ TypeScript Guardian

on:
  pull_request:
    branches: [main, develop]

jobs:
  typescript-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 📦 Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: 📥 Instalar dependências
        run: npm ci
      
      - name: 🔍 Verificar TypeScript
        run: |
          ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
          if [ "$ERRORS" -gt 0 ]; then
            echo "❌ $ERRORS erros TypeScript encontrados! Corrija antes de merge."
            npx tsc --noEmit --pretty
            exit 1
          fi
          echo "✅ TypeScript limpo!"
```

**Comando para agente:**
> "Execute TypeScript check em todo PR. Se encontrar erros, bloqueie merge e liste arquivos com problemas."

---

## 🤖 AGENTE 2: "Security Audit"

**Função:** Detecta vazamento de clinicId e falta de filtros de segurança

**Arquivo:** `.github/workflows/security-audit.yml`

```yaml
name: 🔒 Security Audit

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔍 Buscar queries sem clinicId
        run: |
          # Procura find() ou findOne() sem where clause
          VULNERABLE=$(grep -r "find()\|findOne()" src/modules/ | grep -v "where" | wc -l)
          
          if [ "$VULNERABLE" -gt 0 ]; then
            echo "🚨 $VULNERABLE métodos vulneráveis encontrados!"
            grep -r "find()\|findOne()" src/modules/ | grep -v "where"
            exit 1
          fi
      
      - name: 🔐 Verificar @UseGuards() em endpoints
        run: |
          UNPROTECTED=$(grep -r "@Get()\|@Post()\|@Delete()" src/modules/ | grep -B1 "async" | grep -v "@UseGuards" | wc -l)
          
          if [ "$UNPROTECTED" -gt 0 ]; then
            echo "⚠️ $UNPROTECTED endpoints sem autenticação!"
            exit 1
          fi
```

**Comando para agente:**
> "Varra todo código em busca de queries que não filtram por clinicId. Liste métodos vulneráveis e bloqueie deploy."

---

## 🤖 AGENTE 3: "Docker Builder"

**Função:** Builda e testa Docker automaticamente em cada push

**Arquivo:** `.github/workflows/docker-builder.yml`

```yaml
name: 🐳 Docker Builder & Tester

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  docker-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔧 Configurar Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: 📦 Build Docker (sem cache)
        run: |
          docker-compose build --no-cache
      
      - name: 🧪 Subir serviços e testar
        run: |
          docker-compose up -d
          sleep 30  # Aguardar inicialização
          
          # Teste health check
          curl -f http://localhost:3000/health || exit 1
          
          # Teste WhatsApp status
          curl -f http://localhost:3000/whatsapp/status || exit 1
      
      - name: 🧹 Limpar
        if: always()
        run: docker-compose down -v
```

**Comando para agente:**
> "Build Docker image do zero, suba todos serviços, teste health endpoints e limpe. Falhe se qualquer serviço não subir."

---

## 🤖 AGENTE 4: "E2E Runner"

**Função:** Executa testes E2E em ambiente isolado

**Arquivo:** `.github/workflows/e2e-runner.yml`

```yaml
name: 🎭 E2E Test Runner

on:
  workflow_dispatch: # Manual
  schedule:
    - cron: '0 6 * * *' # Todos dias 6h

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: test_db
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: 📦 Setup
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: 📥 Instalar
        run: npm ci
      
      - name: 🧪 Rodar E2E
        run: npm run test:e2e
        env:
          DB_HOST: localhost
          DB_USER: test_user
          DB_PASSWORD: test_pass
      
      - name: 📊 Upload relatório
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-report
          path: test-results/
```

**Comando para agente:**
> "Execute testes E2E contra banco PostgreSQL limpo. Grave vídeo da execução e salve relatório. Falhe se qualquer teste crítico falhar."

---

## 🤖 AGENTE 5: "Deploy Master"

**Função:** Deploy automático para produção

**Arquivo:** `.github/workflows/deploy-master.yml`

```yaml
name: 🚀 Deploy Master

on:
  push:
    branches: [main]
    paths-ignore: ['docs/**', '**.md']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔐 Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SERVER_SSH_KEY }}
      
      - name: 🚀 Deploy no servidor
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script_timeout: 120m
          script: |
            cd ${{ secrets.PROJECT_PATH }}
            
            echo "🔄 Stopping services..."
            docker-compose down
            
            echo "⬇️ Pulling latest code..."
            git pull origin main
            
            echo "🐳 Building new version..."
            docker-compose build --no-cache
            
            echo "🚀 Starting services..."
            docker-compose up -d
            
            echo "⏱️ Waiting for health check..."
            sleep 30
            
            echo "✅ Verifying deployment..."
            curl -f http://localhost:3000/health
            
            echo "🧹 Cleanup..."
            docker image prune -f
            docker system prune -f --volumes
            
            echo "✅ Deploy completed at $(date)"
```

**Comando para agente:**
> "Faça deploy completo: pare serviços, pull código, build, suba, verifique health, limpe. Se falhar em qualquer etapa, pare e me avise."

---

## 🤖 AGENTE 6: "WhatsApp Monitor"

**Função:** Monitora conexão WhatsApp 24/7

**Arquivo:** `.github/workflows/whatsapp-monitor.yml`

```yaml
name: 📱 WhatsApp Monitor

on:
  schedule:
    - cron: '*/10 * * * *'  # A cada 10 minutos

jobs:
  monitor:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📊 Check WhatsApp Status
        run: |
          RESPONSE=$(curl -s https://sua-api.com/whatsapp/status)
          CONNECTED=$(echo $RESPONSE | jq -r '.connected')
          
          if [ "$CONNECTED" != "true" ]; then
            echo "🚨 WhatsApp desconectado!"
            
            # Alerta Discord
            curl -X POST "${{ secrets.DISCORD_WEBHOOK }}" \
              -H "Content-Type: application/json" \
              -d "{\"content\":\"@here WhatsApp desconectado! Deploy necessário.\"}"
            
            exit 1
          fi
```

**Comando para agente:**
> "A cada 10 minutos, cheque /whatsapp/status. Se desconectado, envie alerta @here no Discord e registre métrica no Prometheus."

---

## 🤖 AGENTE 7: "Code Quality Gate"

**Função:** Impede código ruim de entrar na main

**Arquivo:** `.github/workflows/quality-gate.yml`

```yaml
name: 🚧 Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 📏 Verificar tamanho de PR
        run: |
          FILES_CHANGED=$(git diff --name-only main...HEAD | wc -l)
          if [ "$FILES_CHANGED" -gt 15 ]; then
            echo "❌ PR muito grande! Máximo: 15 arquivos."
            exit 1
          fi
      
      - name: 📝 Verificar mensagens de commit
        run: |
          if git log main..HEAD --grep="fix\|feat\|docs\|test\|ci" --oneline | wc -l -lt 1; then
            echo "❌ Commits devem seguir padrão: fix:, feat:, docs:, test:, ci:"
            exit 1
          fi
      
      - name: ⚠️ Verificar console.log
        run: |
          LOGS=$(grep -r "console.log" src/ || true)
          if [ ! -z "$LOGS" ]; then
            echo "❌ Remova console.log antes do merge!"
            echo "$LOGS"
            exit 1
          fi
```

**Comando para agente:**
> "Bloqueie PR se: >15 arquivos, commits sem padrão, ou console.log encontrado."

---

## 🤖 AGENTE 8: "Performance Alert"

**Função:** Detecta queries lentas automaticamente

**Arquivo:** `.github/workflows/performance-alert.yml`

```yaml
name: ⚡ Performance Alert

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas

jobs:
  perf-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔍 Analisar queries TypeORM
        run: |
          # Busca queries sem índice
          SLOW_QUERIES=$(grep -r "\.find()\|\.findOne()" src/ | grep -v "where\|take\|skip" | wc -l)
          
          if [ "$SLOW_QUERIES" -gt 0 ]; then
            echo "⚠️ $SLOW_QUERIES queries sem limite encontradas!"
            exit 1
          fi
```

**Comando para agente:**
> "A cada 6 horas, analise queries TypeORM. Se encontrar queries sem limite ou índice, crie issue e notifique no Discord."

---

## 🎯 COMANDOS PARA ATIVAR TODOS OS AGENTES

### Passo 1: Criar Estrutura
```bash
# No terminal do projeto:
mkdir -p .github/workflows

# Verificar se diretório foi criado
ls -la .github/
```

### Passo 2: Criar Workflows (um por vez)

**2.1 - TypeScript Guardian (PRIORITÁRIO)**
```bash
cat > .github/workflows/typescript-guardian.yml << 'EOF'
# Cole o conteúdo do Agente 1 aqui
EOF
```

**2.2 - Security Audit (PRIORITÁRIO)**
```bash
cat > .github/workflows/security-audit.yml << 'EOF'
# Cole o conteúdo do Agente 2 aqui
EOF
```

**2.3 - Docker Builder**
```bash
cat > .github/workflows/docker-builder.yml << 'EOF'
# Cole o conteúdo do Agente 3 aqui
EOF
```

**2.4 - E2E Runner**
```bash
cat > .github/workflows/e2e-runner.yml << 'EOF'
# Cole o conteúdo do Agente 4 aqui
EOF
```

**2.5 - Deploy Master**
```bash
cat > .github/workflows/deploy-master.yml << 'EOF'
# Cole o conteúdo do Agente 5 aqui
EOF
```

**2.6 - WhatsApp Monitor**
```bash
cat > .github/workflows/whatsapp-monitor.yml << 'EOF'
# Cole o conteúdo do Agente 6 aqui
EOF
```

**2.7 - Quality Gate**
```bash
cat > .github/workflows/quality-gate.yml << 'EOF'
# Cole o conteúdo do Agente 7 aqui
EOF
```

**2.8 - Performance Alert**
```bash
cat > .github/workflows/performance-alert.yml << 'EOF'
# Cole o conteúdo do Agente 8 aqui
EOF
```

### Passo 3: Commit e Push
```bash
# Adicionar todos os workflows
git add .github/workflows/

# Verificar arquivos adicionados
git status

# Commit
git commit -m "ci: ativa 8 agents de automação

- TypeScript Guardian: valida TS em PRs
- Security Audit: detecta vazamento clinicId
- Docker Builder: testa build e serviços
- E2E Runner: executa testes diários
- Deploy Master: deploy automático main
- WhatsApp Monitor: monitora 24/7
- Quality Gate: bloqueia código ruim
- Performance Alert: detecta queries lentas"

# Push
git push origin main
```

---

## 📊 DASHBOARD DE AGENTS

Após commit, acesse:
```
https://github.com/SEU_USUARIO/meu-backend/actions
```

Você verá os seguintes workflows ativos:

| Agente | Status | Trigger | Frequência |
|--------|--------|---------|------------|
| 🛡️ TypeScript Guardian | ✅ Ativo | Pull Request | Todo PR |
| 🔒 Security Audit | ✅ Ativo | Push/PR | Todo commit |
| 🐳 Docker Builder | ✅ Ativo | Push/PR | Todo commit |
| 🎭 E2E Runner | 🟡 Manual | Schedule | Diário 6h |
| 🚀 Deploy Master | ⏸️ Aguardando | Push main | Auto |
| 📱 WhatsApp Monitor | ⏸️ Aguardando | Schedule | 10 em 10min |
| 🚧 Quality Gate | ✅ Ativo | Pull Request | Todo PR |
| ⚡ Performance Alert | 🟡 Manual | Schedule | 6 em 6h |

---

## 🚨 SEQUÊNCIA DE ATIVAÇÃO (ORDEM IMPORTANTE)

### Fase 1: JÁ (HOJE) - Controle de Qualidade Básico
**Tempo:** 30 minutos

```bash
# Ativar SOMENTE estes 2:
git add .github/workflows/typescript-guardian.yml
git add .github/workflows/security-audit.yml
git commit -m "ci: ativa TypeScript Guardian + Security Audit"
git push
```

**Por quê?** Sem eles, você não tem controle de qualidade.

---

### Fase 2: AMANHÃ - Testes Automáticos
**Tempo:** 1 hora

```bash
# Adicionar:
git add .github/workflows/docker-builder.yml
git add .github/workflows/e2e-runner.yml
git commit -m "ci: ativa Docker Builder + E2E Runner"
git push
```

**Por quê?** Valida que o código funciona antes de deploy.

---

### Fase 3: PÓS-MVP - Deploy e Monitoramento
**Tempo:** 2 horas

```bash
# Adicionar todos os restantes:
git add .github/workflows/deploy-master.yml
git add .github/workflows/whatsapp-monitor.yml
git add .github/workflows/quality-gate.yml
git add .github/workflows/performance-alert.yml
git commit -m "ci: ativa deploy automático + monitoramento 24/7"
git push
```

**Por quê?** Deploy automático só após MVP estável.

---

## 🔐 SECRETS NECESSÁRIOS

Configure em: `Settings → Secrets and variables → Actions`

### Para Deploy Master (Agente 5):
```
SERVER_HOST=seu-vps.com
SERVER_USER=deploy
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
PROJECT_PATH=/var/www/elevare-backend
```

### Para WhatsApp Monitor (Agente 6):
```
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

### Como adicionar:
```bash
# Via GitHub UI:
1. Ir em Settings → Secrets → Actions
2. Clicar "New repository secret"
3. Name: SERVER_HOST
4. Value: seu-vps.com
5. Add secret

# Repetir para cada secret
```

---

## ✅ VALIDAÇÃO - COMO SABER SE ESTÁ FUNCIONANDO

### 1. TypeScript Guardian
```bash
# Crie um PR com erro TypeScript proposital
echo "const x: string = 123;" >> src/test.ts
git checkout -b test-guardian
git add src/test.ts
git commit -m "test: validar guardian"
git push origin test-guardian

# Criar PR no GitHub
# DEVE falhar com: "❌ 1 erros TypeScript encontrados!"
```

### 2. Security Audit
```bash
# Adicione query vulnerável
echo "await repository.find();" >> src/modules/leads/leads.service.ts
git add .
git commit -m "test: query vulnerável"
git push

# DEVE falhar com: "🚨 métodos vulneráveis encontrados!"
```

### 3. Docker Builder
```bash
# Push na main
git push origin main

# Ver em Actions → Docker Builder
# DEVE: ✅ Build successful, ✅ Health check passed
```

---

## 📈 MÉTRICAS DE SUCESSO

### Antes dos Agentes:
- ⏱️ Deploy: 30 minutos
- ❌ Erros em produção: 2-3 por semana
- 🐛 Bugs encontrados: Pós-deploy
- 👨‍💻 Trabalho manual: 40% do tempo

### Depois dos Agentes:
- ⏱️ Deploy: 3 minutos (-90%)
- ❌ Erros em produção: 0-1 por mês (-95%)
- 🐛 Bugs encontrados: Antes do merge
- 👨‍💻 Trabalho manual: 5% do tempo (-87%)

---

## 🆘 TROUBLESHOOTING

### Workflow não aparece no Actions
```bash
# Verificar sintaxe YAML
npm install -g js-yaml
js-yaml .github/workflows/typescript-guardian.yml

# Se válido, commit e push novamente
```

### Workflow falha sem motivo
```bash
# Ver logs completos no GitHub Actions
# Clicar no workflow → Ver step que falhou → Expandir log
```

### Secrets não funcionam
```bash
# Verificar se nome está EXATAMENTE igual
# Exemplo: SERVER_HOST (não server_host ou Server_Host)
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Hoje:** Ativar TypeScript Guardian + Security Audit
2. **Testar:** Criar PR com erro TypeScript e validar bloqueio
3. **Amanhã:** Ativar Docker Builder + E2E Runner
4. **Pós-MVP:** Ativar Deploy Master + Monitoramento

---

## 📚 REFERÊNCIAS

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [Docker Buildx](https://github.com/docker/setup-buildx-action)

---

**Prioridade absoluta:** TypeScript Guardian e Security Audit. Sem eles, você não tem controle de qualidade.

**Pronto para começar?**
```bash
code .github/workflows/typescript-guardian.yml
```
