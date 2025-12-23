# meu-backend

Backend NestJS com integração Firebase.

## 🚀 Quick Start

### Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

### Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## 📜 Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start:prod` — inicia em modo produção
- `npm run test` — executa os testes

## 🤖 Automation

Este repositório possui **automação completa** com GitHub Actions e scripts de agentes.

### 🎯 Quick Commands

```bash
# Rodar todos os checks automaticamente
gh workflow run "Agent Orchestrator" -f branch=main -f pr_number=123

# Aplicar patches
./scripts/agent/apply-patches.sh

# Executar checks de qualidade
./scripts/agent/run-all-checks.sh
```

### 📚 Documentação de Automação

- **[Automation Cheatsheet](AUTOMATION_CHEATSHEET.md)** - Comandos rápidos
- **[Automation Guide](docs/AUTOMATION_GUIDE.md)** - Guia completo de workflows
- **[Security Config](docs/SECURITY_CONFIG.md)** - Configuração de segurança
- **[Agent Scripts](scripts/agent/README.md)** - Documentação dos scripts

### 🛡️ Workflows Disponíveis

| Workflow | Quando | Descrição |
|----------|--------|-----------|
| TypeScript Guardian | push/PR | Build, test, lint, coverage |
| Agent Orchestrator | manual | Executa todos os checks |
| Quality Gate | PR | Detecta console.log, secrets, PRs grandes |
| Test Blocker | PR | Bloqueia se testes falharem |
| Docker Builder | push/PR | Build de imagem + smoke tests |
| Auto Documentation | push to main | Gera documentação TypeDoc |
| WhatsApp Monitor | a cada hora | Health check do WhatsApp |

### 🔐 Secrets Necessários

Configure em: **Settings → Secrets and variables → Actions**

- `DB_URL` - URL do banco de dados PostgreSQL
- `WHATSAPP_PROVIDER_TOKEN` - Token do provedor WhatsApp
- `JWT_SECRET` - Secret para JWT
- `SLACK_WEBHOOK` (opcional) - Para notificações
- `WHATSAPP_HEALTH_URL` (opcional) - Para monitoramento

## 📋 Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

## 📚 Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

> Projeto criado por Carine01
