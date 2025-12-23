# 🌐 PAINEL DE COMANDO — ELEVARE OPS

## 🚀 Quick Start

Execute o painel de comando interativo:

```bash
./ops.sh
```

Ou execute scripts individuais diretamente:

```bash
./elevare-ops.sh           # Sincronização GitHub completa
./docker-deploy.sh         # Deploy backend via Docker
./health-check.sh          # Verificar saúde do sistema
./whatsapp-test.sh         # Testar integração WhatsApp
./create-clinicid-issues.sh # Criar 7 issues do backlog
./monitor-actions.sh       # Monitorar GitHub Actions
./deploy-production.sh     # Deploy em produção
./create-pr.sh             # Criar PR automático
```

---

## 📋 O Que Você Pode Fazer

Com o **PAINEL DE COMANDO — ELEVARE OPS** você pode:

✅ **Sincronizar com GitHub** — Fetch, pull, clean, install, build, test, commit, push (tudo automático)  
✅ **Criar PRs automaticamente** — Sem abrir VS Code  
✅ **Deployar via Docker** — Backend, PostgreSQL, Prometheus, Grafana  
✅ **Testar saúde do sistema** — Health checks em todos os endpoints  
✅ **Testar WhatsApp** — Enviar mensagens de teste  
✅ **Criar issues** — 7 issues do clinicId automaticamente  
✅ **Monitorar CI/CD** — GitHub Actions em tempo real  
✅ **Deploy em produção** — Com safeguards e verificações  

**Tudo sem abrir o VS Code. Tudo sem precisar do programador. Tudo com a força de quem constrói no shell.**

---

## 📚 Documentação Completa

- **[PAINEL_COMANDO.md](PAINEL_COMANDO.md)** — Documentação completa de todos os scripts
- **[CHECKLIST_DEV.md](CHECKLIST_DEV.md)** — Checklist completo para desenvolvimento
- **[.env.example](.env.example)** — Variáveis de ambiente de referência

---

## 🎯 Workflows Comuns

### Workflow 1: Setup Inicial

```bash
# Opção 1: Menu interativo
./ops.sh
# Escolha opção 9 (Workflow Completo)

# Opção 2: Scripts individuais
./elevare-ops.sh       # Sincronizar
./docker-deploy.sh     # Deploy
./health-check.sh      # Verificar
```

### Workflow 2: Desenvolvimento Diário

```bash
./elevare-ops.sh       # Sincronizar repositório
# ... fazer alterações no código ...
npm run build && npm test  # Testar localmente
./create-pr.sh         # Criar PR
./monitor-actions.sh watch  # Monitorar CI
```

### Workflow 3: Deploy Produção

```bash
git checkout main
git pull origin main
npm run build && npm test
./deploy-production.sh
export BACKEND_URL=https://seu-dominio.com
./health-check.sh
```

---

## 🔧 Pré-requisitos

```bash
# Node.js e npm
node --version  # v20+
npm --version   # v10+

# Docker e Docker Compose
docker --version
docker compose version

# GitHub CLI (opcional mas recomendado)
gh --version
gh auth login
```

---

## 💡 Tornar Scripts Executáveis

Todos os scripts já devem estar executáveis, mas se necessário:

```bash
chmod +x *.sh
```

---

## 🐛 Troubleshooting

### Scripts não executam

```bash
# Tornar executáveis
chmod +x *.sh

# Verificar se está no diretório correto
pwd  # Deve mostrar: /caminho/para/meu-backend
```

### Docker não funciona

```bash
# Verificar Docker
docker ps

# Reiniciar Docker
# macOS/Windows: Restart Docker Desktop
# Linux: sudo systemctl restart docker

# Limpar e tentar novamente
docker compose down -v
./docker-deploy.sh
```

### GitHub CLI não funciona

```bash
# Instalar
# macOS: brew install gh
# Linux: https://cli.github.com/

# Autenticar
gh auth login
```

### Backend não responde

```bash
# Ver logs
docker compose logs -f backend

# Reiniciar
docker compose restart backend

# Rebuild completo
./docker-deploy.sh
```

---

## 📊 Estrutura do Projeto

```
meu-backend/
├── ops.sh                      # 🌐 Menu principal
├── elevare-ops.sh              # 📡 Sincronização GitHub
├── create-pr.sh                # 📝 Criar PR automático
├── docker-deploy.sh            # 🐳 Deploy Docker
├── health-check.sh             # 🏥 Health checks
├── whatsapp-test.sh            # 📱 Teste WhatsApp
├── create-clinicid-issues.sh   # 🎫 Criar issues
├── monitor-actions.sh          # 📊 Monitorar Actions
├── deploy-production.sh        # 🚀 Deploy produção
├── PAINEL_COMANDO.md           # 📚 Documentação
├── CHECKLIST_DEV.md            # ✅ Checklist dev
└── .env.example                # 🔧 Config reference
```

---

## 🎓 Você Está Operando Nível CTO

Este painel te dá poder sobre:

- **Build** — Compilação automática
- **Test** — Suíte completa de testes
- **Git** — Sincronização automática
- **Issues** — Criação em lote
- **PRs** — Pull requests automáticos
- **Docker** — Gerenciamento completo
- **Deploy** — Dev e produção
- **Monitoring** — CI/CD em tempo real
- **Integrations** — Testes de WhatsApp

---

## 📞 Suporte

- **Documentação:** `./ops.sh` → opção 10
- **Checklist:** `./ops.sh` → opção 11
- **Issues:** https://github.com/Carine01/meu-backend/issues

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite arquivos `.env` com credenciais reais
- Use `.env.example` como referência
- Credenciais de produção devem estar em secrets/vault
- Scripts de produção requerem confirmação explícita

---

## 📈 Next Steps

1. **Explore o menu:** `./ops.sh`
2. **Leia a documentação:** [PAINEL_COMANDO.md](PAINEL_COMANDO.md)
3. **Configure seu .env:** `cp .env.example .env`
4. **Execute workflow completo:** `./ops.sh` → opção 9
5. **Comece a desenvolver!** ✨

---

**🚀 ELEVARE OPS — Command & Control**

*Nível CEO. Nível programador sênior. Nível "ninguém segura a tia do Zap".*
