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

## Automação e CI/CD

### Agent Orchestrator
O projeto inclui um workflow automatizado para executar scripts de agentes em sequência:

```bash
# Executar via GitHub CLI
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref main

# Ou manualmente via GitHub Actions Web UI
```

Para detalhes completos, consulte [EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)

### Patches Disponíveis
- `patch-agent-workflows.patch` - Adiciona workflow do Agent Orchestrator
- `patch-clinicId-filters.patch` - Adiciona filtros de clinicId nos serviços

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Guia de Execução](./EXECUTION_GUIDE.md) - Como usar Agent Orchestrator e patches

---

> Projeto criado por Carine01
