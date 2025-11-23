# meu-backend

Backend NestJS com integração Firebase.

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

## Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start:prod` — inicia em modo produção
- `npm run test` — executa os testes

## Documentação

### 📚 Documentação Técnica
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)

### 🚀 Automação e CI/CD
- **[GUIA_AUTOMACAO_COMPLETA.md](GUIA_AUTOMACAO_COMPLETA.md)** - Guia completo de automação GitHub (scripts, workflows, comandos)
- **[scripts/comandos-rapidos.sh](scripts/comandos-rapidos.sh)** - Comandos rápidos prontos para copy/paste
- **[COMANDOS_GITHUB.md](COMANDOS_GITHUB.md)** - Comandos para criação de issues e PRs

### 🔧 Scripts de Automação Disponíveis

```bash
# Configurar secrets no GitHub
./scripts/configure-secrets.sh

# Aplicar patches automaticamente
./scripts/apply-patches.sh

# Disparar todos os workflows de agentes
./scripts/agent/run-agents-all.sh <branch> [pr_number]

# Monitorar workflows e criar issues automaticamente
./scripts/agent/monitor-and-report.sh <branch> [pr_number]

# Ver comandos rápidos
./scripts/comandos-rapidos.sh
```

### 📋 Workflows GitHub Actions

- **Agent Orchestrator** - Orquestra todos os workflows em sequência
- **TypeScript Guardian** - Verificação de tipos TypeScript
- **Register Fila Fallback (AST)** - Registro de fallbacks
- **WhatsApp Monitor** - Monitoramento de integração WhatsApp (executa a cada 6h)
- **Docker Builder** - Build e publicação de imagens Docker
- **CI** - Testes e integração contínua
- **Deploy** - Deploy automático para Cloud Run

Para mais detalhes, veja o [GUIA_AUTOMACAO_COMPLETA.md](GUIA_AUTOMACAO_COMPLETA.md).

---

> Projeto criado por Carine01
