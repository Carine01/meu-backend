# meu-backend

Backend NestJS com integração Firebase.

## ✨ Novidades!

Este backend agora inclui funcionalidades profissionais de nível enterprise:
- 📚 **Documentação Swagger/OpenAPI** - Acesse `/api/docs` para documentação interativa
- 📊 **Endpoint de Métricas** - Monitoramento em tempo real com `/metrics`
- ✅ **Validação Automática** - DTOs com validação robusta
- 🛡️ **Respostas Padronizadas** - Erros consistentes e informativos
- 📝 **Logging Avançado** - Rastreamento completo de requisições
- 🤖 **CI/CD Automático** - Deploy, testes e monitoramento automatizados

📖 **Leia mais**: [NOVAS_FUNCIONALIDADES.md](./NOVAS_FUNCIONALIDADES.md)

## 🤖 Automação GitHub Actions

Este projeto possui 3 workflows automatizados:

1. **🚀 Deploy Automático** - Deploy no servidor via SSH quando fizer push na `main`
2. **✅ Testes e Build** - Impede merge de PRs se testes falharem
3. **🩺 Monitoramento WhatsApp** - Verifica conexão a cada 30 minutos e envia alertas

📘 **Configuração**: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)  
🔐 **Secrets**: [SECRETS_REFERENCE.md](./SECRETS_REFERENCE.md)

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
4. Acesse a documentação: http://localhost:3000/api/docs

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

## Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start:prod` — inicia em modo produção
- `npm run test` — executa os testes

## Endpoints Principais

### 📚 Documentação
- `GET /api/docs` - Interface Swagger interativa

### 💚 Saúde e Monitoramento
- `GET /health` - Verificação de prontidão
- `GET /health/liveness` - Verificação de vivacidade
- `GET /metrics` - Métricas em formato Prometheus
- `GET /metrics/json` - Métricas em formato JSON

### 👥 Leads
- `POST /leads` - Criar novo lead (com validação automática)

### 🗄️ Firestore
- `POST /firestore/:collection` - Criar documento
- `GET /firestore/:collection/:id` - Obter documento
- `GET /firestore/:collection` - Listar documentos
- `PUT /firestore/:collection/:id` - Atualizar documento
- `DELETE /firestore/:collection/:id` - Remover documento

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Swagger/OpenAPI](https://swagger.io/docs/)

---

> Projeto criado por Carine01
