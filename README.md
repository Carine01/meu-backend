# meu-backend

Backend NestJS com integração Firebase.

## 🚀 CI/CD Autônomo

Este projeto possui **CI/CD totalmente autônomo** com Elevare Platform.

### Quick Start CI/CD
```bash
# Executar CI completo localmente (antes de push)
npm run elevare:ci-local

# Executar apenas correções automáticas
npm run elevare:autofix

# Verificar TypeScript
npm run typecheck
```

📖 **Documentação Completa:**
- [Quick Start CI/CD](docs/QUICK_START_CI.md) - Guia rápido
- [Elevare CI/CD](docs/ELEVARE_CI_CD.md) - Documentação completa

O CI/CD roda automaticamente em:
- ✅ Push (qualquer branch)
- ✅ Pull Requests
- ✅ Merges
- ✅ Releases
- ✅ Diariamente às 3h AM (manutenção)

**Features:**
- 🔧 Auto-fix automático
- 🔨 Build validation
- 🧪 Tests com cobertura
- 🔒 Security scanning (CodeQL + npm audit)
- 🔄 Criação automática de PRs
- 🚨 Issues automáticas em falhas
- 🚫 Deploy blocking em riscos
- 📊 Relatórios técnicos

---

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
- `npm run elevare:ci-local` — executa CI completo localmente
- `npm run elevare:autofix` — aplica correções automáticas

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)

---

> Projeto criado por Carine01
