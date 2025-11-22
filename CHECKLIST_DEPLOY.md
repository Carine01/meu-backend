# Checklist de Deploy — meu-backend

## ✅ Pré-requisitos (JÁ CONCLUÍDOS)

- [x] Dependências instaladas (`npm install`)
- [x] Testes passando (`npm test`)
- [x] Build funcionando (`npm run build`)
- [x] Segurança implementada (Helmet, CORS, ValidationPipe)
- [x] Vulnerabilidade RCE corrigida no firebaseAdmin.ts
- [x] DTOs com validação criados
- [x] GitHub Actions configurados (CI/CD)
- [x] Dockerfile otimizado e seguro

## 🚀 Deploy para Produção (Google Cloud Run)

### Automático via GitHub Actions (RECOMENDADO)

1. **Configurar Secrets no GitHub:**
   - `GCP_SA_KEY`: Conteúdo completo da service account key (JSON)
   - Já deve estar configurado se o repositório foi criado corretamente

2. **Push para a branch main:**
   ```bash
   git push origin main
   ```
   
3. **Aguardar deploy automático:**
   - O GitHub Actions irá:
     - Instalar dependências
     - Executar testes
     - Fazer build do Docker
     - Fazer push para Artifact Registry
     - Fazer deploy no Cloud Run
   - Tempo estimado: 8-10 minutos

4. **Verificar o status:**
   - GitHub: Aba "Actions"
   - Cloud Run: Console GCP > Cloud Run > elevare-backend

### Manual (se necessário)

1. **Preencha o arquivo `.env` com as variáveis reais (baseado em `.env.example`).**
2. **Escolha o provedor de cloud (ex: Heroku, Render, Railway, AWS, GCP, Azure).**
3. **Crie o ambiente de produção e configure as variáveis de ambiente.**
4. **Faça o build do projeto:**
   ```bash
   npm run build
   ```
5. **Rode as migrações (se houver):**
   ```bash
   npm run migration:run  # Se aplicável
   ```
6. **Inicie o servidor:**
   ```bash
   npm run start:prod
   ```
7. **Teste os endpoints principais:**
   - Health check: `GET /health`
   - Leads: `POST /leads`

8. **Configure monitoramento e alertas (opcional).**
9. **Documente endpoints e credenciais de acesso.**

## 🔍 Verificação Pós-Deploy

1. **Health Check:**
   ```bash
   curl https://SEU-DOMINIO/health
   ```
   Deve retornar: `{"status":"ok","timestamp":"..."}`

2. **Logs:**
   - Cloud Run: Console GCP > Cloud Run > Logs
   - Local: `docker logs <container_id>`

3. **Testes de Carga (opcional):**
   ```bash
   # Instalar hey (ferramenta de benchmark)
   # Testar endpoint
   hey -n 1000 -c 10 https://SEU-DOMINIO/health
   ```

## 📋 Variáveis de Ambiente Necessárias

Veja o arquivo `.env.example` para lista completa. As principais são:

- `NODE_ENV=production`
- `PORT=8080` (Cloud Run usa 8080)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON completo da service account)
- `ALLOWED_ORIGINS` (domínios permitidos para CORS)
- `IARA_EDGE_URL` (URL da API IARA)
- `IARA_SECRET` (Secret para autenticação IARA)

## 🆘 Troubleshooting

### Erro: "Cannot find module"
**Solução:** Verificar se todas as dependências foram instaladas:
```bash
npm install
npm run build
```

### Erro: "Firebase initialization failed"
**Solução:** Verificar se `FIREBASE_SERVICE_ACCOUNT_JSON` está configurado corretamente no Secret Manager

### Erro: "Port already in use"
**Solução:** Cloud Run sempre usa porta 8080. Localmente, mude a porta em `.env`

---

**Dúvidas?** Consulte o README ou abra uma issue no GitHub.
