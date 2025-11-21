# 🔑 Como Atualizar o Secret GCP_SA_KEY no GitHub

Este guia explica passo a passo como atualizar o secret `GCP_SA_KEY` nas configurações do GitHub Actions.

## 📋 Pré-requisitos

Antes de começar, você precisa:
- ✅ Acesso de **admin** ou **maintainer** ao repositório GitHub
- ✅ O arquivo JSON da Service Account do Google Cloud Platform
- ✅ Navegador web com acesso ao GitHub

---

## 🎯 Passo a Passo

### 1. Acessar o Repositório

Vá para: **https://github.com/Carine01/meu-backend**

### 2. Abrir as Configurações

No menu superior do repositório, clique em **"Settings"** (Configurações)

> ⚠️ **Nota:** Se você não visualizar a aba "Settings", significa que você não tem permissões de administrador no repositório. Entre em contato com o proprietário para solicitar acesso.

### 3. Navegar para Secrets

No menu lateral esquerdo:
1. Clique em **"Secrets and variables"**
2. Depois clique em **"Actions"**

### 4. Localizar o Secret GCP_SA_KEY

Na lista de secrets, procure por **`GCP_SA_KEY`**

### 5. Atualizar o Secret

1. Clique no secret **`GCP_SA_KEY`**
2. Clique no botão **"Update"** (Atualizar)
3. Cole o conteúdo completo do arquivo JSON da Service Account
4. Clique em **"Update secret"** para salvar

---

## 📝 Formato do JSON da Service Account

O conteúdo do secret deve ser um JSON válido no seguinte formato:

```json
{
  "type": "service_account",
  "project_id": "lucresia-74987923-59ce3",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "nome@lucresia-74987923-59ce3.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### ⚠️ Pontos Importantes

- **Cole o JSON completo** - desde o `{` inicial até o `}` final
- **Não remova as quebras de linha (`\n`)** na chave privada
- **Não adicione espaços extras** antes ou depois do JSON
- **Verifique se é um JSON válido** usando um validador online se necessário

---

## 🔍 Como Obter o JSON da Service Account

Se você precisa gerar um novo arquivo JSON da Service Account:

### Opção 1: Através do Console do Google Cloud

1. Acesse: **https://console.cloud.google.com/iam-admin/serviceaccounts**
2. Selecione o projeto: **`lucresia-74987923-59ce3`**
3. Encontre a Service Account usada para o deploy
4. Clique nos três pontos (⋮) → **"Manage keys"**
5. Clique em **"Add Key"** → **"Create new key"**
6. Selecione **"JSON"** e clique em **"Create"**
7. O arquivo JSON será baixado automaticamente

### Opção 2: Através do gcloud CLI

```bash
# Autenticar no GCP
gcloud auth login

# Configurar o projeto
gcloud config set project lucresia-74987923-59ce3

# Listar service accounts
gcloud iam service-accounts list

# Criar nova chave para a service account
gcloud iam service-accounts keys create key.json \
  --iam-account=SERVICE_ACCOUNT_EMAIL
```

---

## ✅ Validação

Após atualizar o secret, você pode validar se está funcionando:

### 1. Testar o Deploy Automático

Faça um pequeno commit no repositório para acionar o GitHub Actions:

```bash
# Criar uma mudança trivial
echo "# Test" >> README.md

# Commit e push
git add README.md
git commit -m "test: validar secret atualizado"
git push origin main
```

### 2. Monitorar a Execução

Vá para: **https://github.com/Carine01/meu-backend/actions**

- ✅ Se o workflow executar com sucesso, o secret está correto
- ❌ Se falhar na etapa "Authenticate to Google Cloud", o secret pode estar incorreto

### 3. Verificar os Logs

Se o deploy falhar, clique no workflow com erro e procure por mensagens como:

```
❌ "Error: google-github-actions/auth failed with: invalid_grant"
   → O JSON está malformatado ou inválido

❌ "Error: Service account does not have permission"
   → A service account precisa de permissões adicionais no GCP

❌ "Error: credentials_json is not valid JSON"
   → Verifique se copiou o JSON completo
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE - Proteção do Secret

- **NUNCA** commite o arquivo JSON no código do repositório
- **NUNCA** compartilhe o secret em canais públicos (Slack, Discord, etc.)
- **NUNCA** cole o secret em logs ou screenshots
- **SEMPRE** use GitHub Secrets para armazenar credenciais sensíveis
- **REVOGUE** chaves antigas após criar novas

### Revogar uma Chave Antiga

Se você suspeitar que uma chave foi comprometida:

```bash
# Listar chaves da service account
gcloud iam service-accounts keys list \
  --iam-account=SERVICE_ACCOUNT_EMAIL

# Deletar chave específica
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=SERVICE_ACCOUNT_EMAIL
```

---

## 🛠️ Troubleshooting

### Problema: "Não consigo ver a aba Settings"

**Solução:** Você precisa de permissões de admin no repositório. Solicite acesso ao proprietário.

### Problema: "O secret não aparece na lista"

**Solução:** O secret pode não ter sido criado ainda. Crie um novo:

1. Em "Secrets and variables" → "Actions"
2. Clique em **"New repository secret"**
3. Nome: `GCP_SA_KEY`
4. Value: Cole o JSON completo
5. Clique em **"Add secret"**

### Problema: "Deploy falha após atualizar o secret"

**Soluções possíveis:**

1. **Verificar formato do JSON:**
   - Use um validador JSON online
   - Certifique-se de copiar o arquivo completo

2. **Verificar permissões da Service Account:**
   ```bash
   gcloud projects get-iam-policy lucresia-74987923-59ce3 \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:SERVICE_ACCOUNT_EMAIL"
   ```

3. **Verificar se a chave não expirou:**
   - Chaves de service account podem ser desabilitadas no GCP
   - Gere uma nova chave se necessário

### Problema: "Invalid_grant error"

**Solução:** Geralmente indica que:
- O JSON está malformatado (faltam aspas, vírgulas, etc.)
- A chave privada está incompleta
- A service account foi deletada no GCP

**Ações:**
1. Copie novamente o JSON do arquivo original
2. Verifique se não há caracteres extras
3. Se persistir, gere uma nova chave

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [GitHub Actions - Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud - Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)

### Arquivos Relacionados no Projeto

- `.github/workflows/deploy.yml` - Workflow que usa o secret
- `GUIA_DEPLOY_COMPLETO.md` - Guia completo de deploy
- `SECURITY.md` - Política de segurança

---

## ✅ Checklist de Atualização

Use esta checklist para garantir que tudo foi feito corretamente:

- [ ] Tenho o arquivo JSON da Service Account
- [ ] Validei que o JSON é válido (usando validador)
- [ ] Acessei GitHub → Settings → Secrets and variables → Actions
- [ ] Encontrei o secret `GCP_SA_KEY`
- [ ] Cliquei em Update
- [ ] Colei o JSON completo (do `{` ao `}`)
- [ ] Cliquei em "Update secret"
- [ ] Fiz um commit de teste para validar
- [ ] O workflow do GitHub Actions executou com sucesso
- [ ] O deploy no Cloud Run foi concluído
- [ ] Revoquei a chave antiga (se aplicável)

---

## 📞 Suporte

Se você seguiu todos os passos e ainda está com problemas:

1. **Verifique os logs do GitHub Actions:**
   - https://github.com/Carine01/meu-backend/actions
   - Copie a mensagem de erro completa

2. **Consulte outros guias do projeto:**
   - `GUIA_DEPLOY_COMPLETO.md`
   - `RELATORIO_STATUS_PROGRAMADOR.md`

3. **Abra uma issue no GitHub:**
   - Descreva o problema
   - Inclua os logs (SEM o secret!)
   - Mencione as etapas já tentadas

---

**Última atualização:** 21/11/2025  
**Versão:** 1.0

---

## 🔄 Histórico de Alterações

| Data | Versão | Mudanças |
|------|--------|----------|
| 21/11/2025 | 1.0 | Criação inicial do guia |

