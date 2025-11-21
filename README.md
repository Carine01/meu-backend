# meu-backend

[![CI](https://github.com/Carine01/meu-backend/workflows/CI/badge.svg)](https://github.com/Carine01/meu-backend/actions/workflows/ci.yml)
[![Deploy](https://github.com/Carine01/meu-backend/workflows/Deploy%20to%20Cloud%20Run/badge.svg)](https://github.com/Carine01/meu-backend/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Backend NestJS com integração Firebase para o sistema Elevare Atendimento.

## 🚀 Features

- 🔐 Autenticação Firebase
- 📊 Firestore para persistência de dados
- 🛡️ Segurança com Helmet e rate limiting
- 📝 Logging estruturado com Pino
- ✅ Validação de dados com class-validator
- 🐳 Deploy automatizado para Google Cloud Run
- 🧪 Testes unitários com Jest
- 🎨 Padronização de código com ESLint e Prettier

## 🛠️ Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend):
   ```bash
   cp .env.example .env
   ```

3. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run start:dev
   ```

O servidor estará disponível em `http://localhost:3000`

## 📋 Scripts disponíveis

- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm start` — inicia em modo produção
- `npm test` — executa os testes
- `npm run test:cov` — executa os testes com cobertura
- `npm run lint` — verifica problemas de código
- `npm run lint:fix` — corrige problemas de código automaticamente
- `npm run format` — formata o código
- `npm run format:check` — verifica formatação

## 🚀 Deploy

O deploy é automático via GitHub Actions quando há push na branch `main`. 

Para deploy manual, veja o arquivo `CHECKLIST_DEPLOY.md` para instruções detalhadas.

## 🔐 Variáveis de ambiente

Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

Variáveis principais:
- `PORT` - Porta do servidor (padrão: 3000)
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Credenciais do Firebase Admin
- `IARA_EDGE_URL` - URL da API IARA
- `IARA_SECRET` - Secret para autenticação IARA

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:cov

# Executar testes em modo watch
npm run test:watch
```

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

## 📚 Documentação

- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Documentação completa do backend](DOCUMENTACAO_BACKEND_PRODUCAO.md)

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

> Projeto criado por [Carine01](https://github.com/Carine01)

