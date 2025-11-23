# 🌐 PAINEL DE COMANDO — ELEVARE OPS

O cockpit oficial da IARA, da Elevare e do seu MVP.
**Nível CEO. Nível programador sênior. Nível "ninguém segura a tia do Zap".**

---

## 📋 Visão Geral

Este painel oferece controle total sobre o backend Elevare através de scripts automatizados. Execute operações complexas com um único comando, sem necessidade de abrir VS Code ou conhecimento técnico profundo.

---

## 🚀 Scripts Disponíveis

### 1. 📡 Sincronização GitHub — `elevare-ops.sh`

**"Atualiza, limpa, instala, testa, builda, envia."**

O coração da operação. Sincroniza tudo com o GitHub automaticamente.

```bash
./elevare-ops.sh
```

**O que faz:**
- ✓ Fetch e pull da branch main
- ✓ Limpa node_modules, dist, .cache
- ✓ Instala dependências (npm ci)
- ✓ Build do TypeScript
- ✓ Executa testes
- ✓ Git add, commit e push

**Quando usar:** Antes de qualquer operação importante, para garantir que está sincronizado.

---

### 2. 📝 Criar PR Automático — `create-pr.sh`

**Sem abrir VS Code. Sem tocar em branch. Executou → PR criado.**

```bash
./create-pr.sh
```

**O que faz:**
- ✓ Verifica branch atual
- ✓ Cria nova branch se necessário
- ✓ Cria PR com descrição automática
- ✓ Define base como main

**Quando usar:** Após fazer alterações e querer criar PR para revisão.

---

### 3. 🐳 Deploy Backend Docker — `docker-deploy.sh`

**É aqui que a máquina respira.**

```bash
./docker-deploy.sh
```

**O que faz:**
- ✓ Para containers existentes
- ✓ Atualiza imagens Docker
- ✓ Sobe containers com build
- ✓ Mostra status de todos os serviços

**Serviços iniciados:**
- Backend (porta 3000)
- PostgreSQL (porta 5432)
- Prometheus (porta 9090)
- Grafana (porta 3001)

**Quando usar:** Para subir o ambiente completo localmente ou em servidor.

---

### 4. 🏥 Health Check Total — `health-check.sh`

**Verifica se a IARA acordou.**

```bash
./health-check.sh
```

**O que testa:**
- ✓ Health principal (/)
- ✓ WhatsApp health (/whatsapp/health)
- ✓ API root
- ✓ Endpoints de leads

**Quando usar:** Após deploy ou quando algo não parece estar funcionando.

---

### 5. 📱 Teste WhatsApp — `whatsapp-test.sh`

**É aqui que você olha e fala: "Sim, eu controlo uma integração de ponta."**

```bash
# Uso padrão (número e mensagem padrão)
./whatsapp-test.sh

# Com número e mensagem customizados
./whatsapp-test.sh 5511999999999 "Teste Elevare"
```

**O que faz:**
- ✓ Envia mensagem de teste via API
- ✓ Mostra resposta detalhada
- ✓ Valida integração WhatsApp

**Quando usar:** Para testar se a integração WhatsApp está funcionando.

---

### 6. 🎫 Criar Issues clinicId — `create-clinicid-issues.sh`

**Escopo mapeado. Nada esquecido.**

```bash
./create-clinicid-issues.sh
```

**O que faz:**
- ✓ Cria 7 issues no GitHub
- ✓ Cada issue com escopo detalhado
- ✓ Labels automáticas (clinicId, implementation, priority:high)
- ✓ Estimativas de tempo incluídas

**Issues criadas:**
1. Filtro clinicId #1: Mensagens Service
2. Filtro clinicId #2: Campanhas Service
3. Filtro clinicId #3: Leads Controller
4. Filtro clinicId #4: Profile Service
5. Filtro clinicId #5: Indicações Service
6. Filtro clinicId #6: WhatsApp Integration
7. Filtro clinicId #7: Relatórios e Analytics

**Quando usar:** Para criar backlog completo de implementação clinicId.

---

### 7. 📊 Monitorar GitHub Actions — `monitor-actions.sh`

**Se você quiser ver a máquina trabalhando enquanto toma café.**

```bash
# Listar workflows recentes
./monitor-actions.sh

# Monitorar último workflow em tempo real
./monitor-actions.sh watch
```

**O que faz:**
- ✓ Lista workflows recentes
- ✓ Mostra status (completo, em progresso, na fila)
- ✓ Modo watch para monitoramento em tempo real

**Quando usar:** Para acompanhar execução de CI/CD.

---

### 8. 🚀 Deploy Full Produção — `deploy-production.sh`

**Quando estiver pronta para empurrar a Elevação ao mundo.**

```bash
./deploy-production.sh
```

**O que faz:**
- ✓ Verifica se está na branch main
- ✓ Para containers de produção
- ✓ Build otimizado (sem cache)
- ✓ Sobe em modo produção
- ✓ Health check automático

**⚠️ ATENÇÃO:** Este é o deploy de PRODUÇÃO. Use com cuidado!

**Quando usar:** Quando tiver tudo testado e pronto para produção.

---

## 📦 Configuração Inicial

### Pré-requisitos

```bash
# 1. Node.js e npm
node --version  # v20+
npm --version   # v10+

# 2. Docker e Docker Compose
docker --version
docker compose version

# 3. GitHub CLI (opcional, mas recomendado)
gh --version

# Se não tiver, instale:
# macOS: brew install gh
# Linux: https://cli.github.com/
```

### Autenticação GitHub CLI

```bash
gh auth login
```

### Tornar scripts executáveis

```bash
chmod +x elevare-ops.sh
chmod +x create-pr.sh
chmod +x docker-deploy.sh
chmod +x health-check.sh
chmod +x whatsapp-test.sh
chmod +x create-clinicid-issues.sh
chmod +x monitor-actions.sh
chmod +x deploy-production.sh
```

---

## 🎯 Workflows Comuns

### Workflow 1: Setup Completo (Primeira Vez)

```bash
# 1. Sincronizar repositório
./elevare-ops.sh

# 2. Subir ambiente Docker
./docker-deploy.sh

# 3. Verificar saúde
./health-check.sh

# 4. Testar WhatsApp
./whatsapp-test.sh

# 5. Criar issues do backlog
./create-clinicid-issues.sh
```

### Workflow 2: Deploy Diário

```bash
# 1. Sincronizar
./elevare-ops.sh

# 2. Subir/Atualizar containers
./docker-deploy.sh

# 3. Health check
./health-check.sh
```

### Workflow 3: Criar Feature

```bash
# 1. Sincronizar
./elevare-ops.sh

# 2. Fazer alterações no código
# ... editar arquivos ...

# 3. Testar localmente
npm run build
npm test

# 4. Criar PR
./create-pr.sh

# 5. Monitorar CI
./monitor-actions.sh watch
```

### Workflow 4: Deploy Produção

```bash
# 1. Garantir que está na main
git checkout main
git pull origin main

# 2. Executar testes
npm run build
npm test

# 3. Deploy
./deploy-production.sh

# 4. Verificar saúde
export BACKEND_URL=https://seu-dominio.com
./health-check.sh

# 5. Testar WhatsApp em produção
export BACKEND_URL=https://seu-dominio.com
./whatsapp-test.sh
```

---

## 🔧 Variáveis de Ambiente

Todos os scripts respeitam variáveis de ambiente para customização:

```bash
# URL do backend (padrão: http://localhost:3000)
export BACKEND_URL=https://api.elevare.com

# Executar scripts
./health-check.sh
./whatsapp-test.sh
```

---

## 📊 Checklist Padrão Dev

Entrega limpa, sem desculpas, sem ruído:

- [ ] Atualizou branch main (`git pull origin main`)
- [ ] Instalou dependências (`npm ci`)
- [ ] Rodou build (`npm run build`)
- [ ] Executou testes (`npm test`)
- [ ] Aplicou patches clinicId (se necessário)
- [ ] Subiu backend com Docker Compose (`./docker-deploy.sh`)
- [ ] Validou endpoints de saúde (`./health-check.sh`)
- [ ] Testou WhatsApp (`./whatsapp-test.sh`)
- [ ] Logs revisados (GitHub Actions: `./monitor-actions.sh`)
- [ ] PR criado e checkado (`./create-pr.sh`)

---

## 🐛 Troubleshooting

### Backend não responde após deploy

```bash
# Ver logs
docker compose logs -f backend

# Reiniciar serviço
docker compose restart backend

# Rebuild completo
./docker-deploy.sh
```

### Testes falhando

```bash
# Limpar e reinstalar
rm -rf node_modules dist
npm ci
npm run build
npm test
```

### GitHub CLI não funciona

```bash
# Verificar autenticação
gh auth status

# Re-autenticar se necessário
gh auth login
```

### WhatsApp não envia

```bash
# 1. Verificar logs do backend
docker compose logs backend | grep -i whatsapp

# 2. Verificar configurações .env
cat .env | grep WHATSAPP

# 3. Testar health específico
curl http://localhost:3000/whatsapp/health
```

---

## 🎓 Você agora está operando nível CTO

Com essa caixa de ferramentas você consegue:

✅ **Buildar** — Compilar TypeScript automaticamente  
✅ **Testar** — Executar suíte completa de testes  
✅ **Sincronizar** — Git fetch, pull, commit, push automático  
✅ **Criar issues** — Backlog completo com um comando  
✅ **Criar PR** — Pull requests automáticos com descrição  
✅ **Deployar** — Produção e desenvolvimento com Docker  
✅ **Monitorar** — GitHub Actions em tempo real  
✅ **Testar WhatsApp** — Validar integração instantaneamente  
✅ **Gerenciar Docker** — Controle completo dos containers  

**Tudo sem abrir o VS Code.**  
**Tudo sem precisar do programador.**  
**Tudo com a força de quem constrói no shell.**

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte os logs: `docker compose logs -f`
- Verifique status: `docker compose ps`
- Health check: `./health-check.sh`
- Issues: https://github.com/Carine01/meu-backend/issues

---

**🚀 ELEVARE OPS — Command & Control**
