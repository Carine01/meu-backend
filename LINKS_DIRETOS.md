# 🎯 LINKS DIRETOS - ABRA NO NAVEGADOR

## ✅ AÇÃO IMEDIATA: CRIAR 2 PRs

### PR #1: CI/Tests/Logs/Cron
**🔗 CLIQUE AQUI:**
```
https://github.com/Carine01/meu-backend/compare/main...feat/ci-tests-logs-cron?expand=1&title=feat%3A%20Add%20CI%2FCD%20scripts%2C%20tests%2C%20logger%2C%20cron%20system&labels=ci%2Cimplementation%2Cdoc
```

**Descrição:** Cole conteúdo de `PR_BODY.md`

---

### PR #2: WhatsApp + clinicId
**🔗 CLIQUE AQUI:**
```
https://github.com/Carine01/meu-backend/compare/main...feat/whatsapp-clinicid-filters?expand=1&title=feat(whatsapp%2FclinicId)%3A%20clinicId%20filters%20%2B%20FilaService%20(Baileys)%20%2B%20DTOs%2Fvalidation&labels=implementation%2Cpriority%2Fhigh
```

**Descrição:** Cole conteúdo de `PR_WHATSAPP_BODY.md`

---

## 📊 DASHBOARDS GITHUB

### Branches
```
https://github.com/Carine01/meu-backend/branches
```

### Pull Requests
```
https://github.com/Carine01/meu-backend/pulls
```

### Issues
```
https://github.com/Carine01/meu-backend/issues
```

### Actions (CI/CD)
```
https://github.com/Carine01/meu-backend/actions
```

### Settings - Secrets
```
https://github.com/Carine01/meu-backend/settings/secrets/actions
```

---

## 🎫 CRIAR ISSUES MANUALMENTE (se script falhar)

### Issue #1: mensagens.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20filter%20-%20mensagens.service&labels=implementation,priority/high
```

### Issue #2: campanhas.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20filter%20-%20campanhas.service&labels=implementation,priority/high
```

### Issue #3: eventos.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20filter%20-%20eventos.service&labels=implementation,priority/high
```

### Issue #4: auth.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20scoping%20-%20auth.service&labels=implementation,priority/high,security
```

### Issue #5: bi.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20isolation%20-%20bi.service&labels=implementation,priority/high
```

### Issue #6: bloqueios.service
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20enforcement%20-%20bloqueios.service&labels=implementation,priority/high
```

### Issue #7: payments/orders
```
https://github.com/Carine01/meu-backend/issues/new?title=Impl:%20clinicId%20filter%20-%20pagamentos/pedidos&labels=implementation,priority/high
```

---

## 🔧 EXECUTAR AUTOMAÇÃO

### Opção 1: PowerShell (Windows)
```powershell
cd backend
.\scripts\automacao-completa.ps1
```

### Opção 2: Bash (Linux/Mac)
```bash
cd backend
chmod +x scripts/automacao-completa.sh
./scripts/automacao-completa.sh
```

---

## ⚡ COMANDOS RÁPIDOS

### Instalar dependências
```bash
npm install pino pino-pretty uuid node-cron p-retry @whiskeysockets/baileys @hapi/boom p-queue
npm install --save-dev @types/uuid @types/node-cron
```

### Build e Testes
```bash
npm run build
npm run test:ci
npm run test:coverage
```

### Ver PRs pendentes
```bash
gh pr list
```

### Ver issues
```bash
gh issue list --milestone "MVP - 100%"
```

---

## 📦 SECRETS A CONFIGURAR

Acesse: https://github.com/Carine01/meu-backend/settings/secrets/actions

**Adicionar:**
- `WHATSAPP_AUTH_PATH` = `./auth_info_baileys`
- `DB_URL` = `postgresql://user:pass@host:5432/elevare`
- `FIREBASE_PROJECT_ID` = `seu-projeto-id`
- `FIREBASE_PRIVATE_KEY` = `"-----BEGIN PRIVATE KEY-----\n..."`
- `JWT_SECRET` = `your-super-secret-key`
- `SSH_DEPLOY_KEY` = `"-----BEGIN OPENSSH PRIVATE KEY-----\n..."`

---

**🎉 TODOS OS LINKS PRONTOS! BASTA CLICAR E EXECUTAR!**
