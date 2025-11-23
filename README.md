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

## Funcionalidades

### 🔐 Autenticação e Autorização
- **Refresh Token**: Sistema de tokens dual (access + refresh) para sessões seguras e longas
- **RBAC (Role-Based Access Control)**: Controle de acesso baseado em roles/funções
- **Guards e Decorators**: Proteção de rotas com `@Roles()` decorator
- Para mais detalhes, veja [REFRESH_TOKEN_GUIDE.md](./docs/REFRESH_TOKEN_GUIDE.md)

### 📊 Monitoramento
- **Grafana Dashboard**: Dashboard pré-configurado para monitorar autenticação e RBAC
- **Métricas**: Login attempts, failures, refresh token usage, latência HTTP
- **Alertas**: Notificações para falhas de login suspeitas
- Para configuração, veja [GRAFANA_SETUP.md](./observabilidade/GRAFANA_SETUP.md)

### 🎯 Frontend React Hooks
- `useAuth`: Hook completo para autenticação com refresh automático
- `useRefreshToken`: Gerenciamento de renovação de tokens
- `useRole`: Controle de UI baseado em roles do usuário

## Documentação Adicional
- [REFRESH_TOKEN_GUIDE.md](./docs/REFRESH_TOKEN_GUIDE.md) - Guia completo de uso do refresh token
- [AUTH_IMPLEMENTATION_SUMMARY.md](./docs/AUTH_IMPLEMENTATION_SUMMARY.md) - Resumo da implementação
- [GRAFANA_SETUP.md](./observabilidade/GRAFANA_SETUP.md) - Setup do dashboard Grafana
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)

---

> Projeto criado por Carine01
