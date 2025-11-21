# meu-backend

Backend NestJS com integração Firebase.

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. **Configure as credenciais do Firebase** - veja [SETUP_SERVICE_ACCOUNT.md](SETUP_SERVICE_ACCOUNT.md)
4. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Configuração de Segurança
**IMPORTANTE**: Para configurar as credenciais da Google Cloud Service Account de forma segura, consulte:
- [SETUP_SERVICE_ACCOUNT.md](SETUP_SERVICE_ACCOUNT.md) - Guia completo de configuração

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
- [Configuração da Service Account](SETUP_SERVICE_ACCOUNT.md)

---

> Projeto criado por Carine01
