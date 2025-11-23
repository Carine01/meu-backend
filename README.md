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
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Sistema Orquestrador de PRs](docs/ORCHESTRATOR.md) - Automação inteligente para Pull Requests

## 🤖 Automação de PRs

Este repositório possui um **Sistema Orquestrador** que automaticamente comenta e gerencia Pull Requests. Quando você abre um PR, o sistema:

- ✅ Posta um comentário informativo sobre o orquestrador
- 🏷️ Aplica labels automaticamente
- 👥 Pode solicitar revisores específicos
- 🔄 Pode habilitar auto-merge quando configurado

Para mais detalhes, veja a [documentação completa do orquestrador](docs/ORCHESTRATOR.md).

---

> Projeto criado por Carine01
