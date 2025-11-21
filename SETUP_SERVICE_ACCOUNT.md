# Configuração da Service Account do Google Cloud

Este documento descreve como configurar de forma segura as credenciais da Service Account do Google Cloud para o backend Elevare.

## ⚠️ AVISO DE SEGURANÇA

**NUNCA** commite credenciais da service account no repositório Git. As credenciais devem ser armazenadas apenas como GitHub Secrets ou variáveis de ambiente seguras.

## 1. Configuração no GitHub (Produção)

### 1.1. Adicionar Secret no GitHub

1. Vá para o repositório no GitHub: `https://github.com/Carine01/meu-backend`
2. Clique em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Nome do secret: `GCP_SA_KEY`
5. Valor: Cole o JSON completo da service account (fornecido pelo administrador do projeto)

Exemplo do formato JSON:
```json
{
  "type": "service_account",
  "project_id": "lucresia-74987923-59ce3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@lucresia-74987923-59ce3.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

### 1.2. Como o Deploy Funciona

O workflow `.github/workflows/deploy.yml` automaticamente:
1. Usa `secrets.GCP_SA_KEY` para autenticar com Google Cloud
2. Faz build da imagem Docker
3. Faz push para Google Container Registry
4. Deploy no Cloud Run com a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_JSON`

## 2. Configuração Local (Desenvolvimento)

Para desenvolvimento local, você tem duas opções:

### Opção A: Arquivo JSON (Recomendado para desenvolvimento)

1. Obtenha o arquivo JSON da service account do administrador do projeto
2. Salve como `firebase-service-account.json` na raiz do projeto
3. Configure a variável de ambiente no seu `.env`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

**IMPORTANTE**: O arquivo `firebase-service-account.json` está no `.gitignore` e não será commitado.

### Opção B: Variável de Ambiente JSON

1. Configure a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_JSON` com o JSON completo:

```bash
# No seu arquivo .env (não commitado)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'
```

## 3. Verificação da Configuração

### 3.1. Verificar .gitignore

Confirme que o `.gitignore` inclui:
```
*.serviceAccount.json
service-account.json
*.firebase-admin.json
*.credentials.json
firebase-service-account.json
```

### 3.2. Verificar Código de Inicialização

O arquivo `src/firebaseAdmin.ts` implementa a inicialização segura do Firebase Admin SDK:

1. **Primeira prioridade**: Variável de ambiente `FIREBASE_SERVICE_ACCOUNT_JSON` (usado em Cloud Run)
2. **Segunda prioridade**: Arquivo via `GOOGLE_APPLICATION_CREDENTIALS` (desenvolvimento local)
3. **Terceira prioridade**: Application Default Credentials (ambientes GCP)

### 3.3. Testar Localmente

```bash
# Instalar dependências
npm install

# Compilar
npm run build

# Executar
npm start
```

Verifique os logs para confirmar:
```
[Firebase] Inicializado via FIREBASE_SERVICE_ACCOUNT_JSON
```
ou
```
[Firebase] Inicializado via arquivo de credenciais
```

## 4. Troubleshooting

### Erro: "Falha ao inicializar Firebase Admin SDK"

**Causa**: Credenciais não configuradas ou inválidas

**Solução**:
1. Verifique se o secret `GCP_SA_KEY` está configurado no GitHub
2. Para local, verifique se o arquivo `firebase-service-account.json` existe
3. Verifique se as variáveis de ambiente estão corretas

### Erro: "GOOGLE_APPLICATION_CREDENTIALS deve apontar para arquivo .json"

**Causa**: Arquivo de credenciais com extensão incorreta ou caminho inválido

**Solução**:
1. Certifique-se de que o arquivo termina com `.json`
2. Use caminho absoluto ou relativo correto

### Deploy falha com erro de autenticação

**Causa**: Secret `GCP_SA_KEY` não configurado ou inválido

**Solução**:
1. Verifique se o secret existe em Settings > Secrets and variables > Actions
2. Confirme que o JSON está completo e válido
3. Re-crie o secret se necessário

## 5. Boas Práticas de Segurança

✅ **FAÇA**:
- Armazene credenciais como GitHub Secrets
- Use variáveis de ambiente para credenciais
- Mantenha arquivos de credenciais no `.gitignore`
- Rotacione credenciais periodicamente
- Use service accounts com permissões mínimas necessárias

❌ **NÃO FAÇA**:
- Commitar credenciais no Git
- Compartilhar credenciais em mensagens/emails
- Fazer log de credenciais
- Usar credenciais pessoais para produção
- Dar permissões excessivas à service account

## 6. Referências

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
