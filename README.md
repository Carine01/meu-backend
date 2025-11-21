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

## Guias e Tutoriais
- [Como atualizar o secret GCP_SA_KEY](COMO_ATUALIZAR_GCP_SA_KEY.md) - Passo a passo para atualizar credenciais do GitHub Actions
- [Checklist de Deploy](CHECKLIST_DEPLOY.md) - Lista de verificação para deploy
- [Guia Completo de Deploy](GUIA_DEPLOY_COMPLETO.md) - Documentação detalhada do processo de deploy

---

> Projeto criado por Carine01
