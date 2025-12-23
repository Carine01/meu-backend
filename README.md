# meu-backend

Backend NestJS com integração Firebase.

## 🏎️ Automação Full Ferrari

Workflow automatizado completo para harmonização, linting, segurança e relatórios do backend:

```bash
# Trigger via GitHub Actions UI ou CLI
gh workflow run full-ferrari.yml
```

**Features:**
- ✅ Backup automático antes das mudanças
- ✅ Linting e formatação (ESLint/Prettier)
- ✅ Harmonização de rotas/controllers/services
- ✅ Scaffold de DTOs com validação
- ✅ Security hardening básico
- ✅ Build de produção
- ✅ Relatórios detalhados
- ✅ PR automático com checklist

📖 **Documentação completa:** [`docs/FULL_FERRARI_WORKFLOW.md`](docs/FULL_FERRARI_WORKFLOW.md)  
⚡ **Quick Reference:** [`docs/FULL_FERRARI_QUICK_REF.md`](docs/FULL_FERRARI_QUICK_REF.md)

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
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

## Scripts de automação
- `bash scripts/elevare_auto_fix.sh` — fix imports, dedupe packages
- `bash scripts/vsc_adiante.sh` — harmoniza estrutura modules
- `bash scripts/auto_fix_and_pr.sh --scaffold-dtos --security-basic` — DTOs e segurança

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Full Ferrari Workflow](docs/FULL_FERRARI_WORKFLOW.md)

---

> Projeto criado por Carine01
