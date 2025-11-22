# 🔐 Configuração de Secrets

Este guia explica como configurar os secrets necessários para os workflows do GitHub Actions.

## 📋 Secrets Necessários

### Obrigatórios (para Deploy Master)
Se você quer deploy automático, configure estes:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SERVER_SSH_KEY` | Chave SSH privada para acessar o servidor | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SERVER_HOST` | IP ou hostname do servidor | `192.168.1.100` ou `server.example.com` |
| `SERVER_USER` | Usuário SSH | `ubuntu` ou `root` |
| `PROJECT_PATH` | Caminho do projeto no servidor | `/home/ubuntu/meu-backend` |

### Opcionais (para WhatsApp Monitor)
Para receber alertas quando WhatsApp desconectar:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `API_URL` | URL base da sua API | `https://api.elevare.com.br` |
| `DISCORD_WEBHOOK` | Webhook do Discord para alertas | `https://discord.com/api/webhooks/...` |
| `SLACK_WEBHOOK` | Webhook do Slack para alertas | `https://hooks.slack.com/services/...` |

---

## 🚀 Como Configurar Secrets

### Passo 1: Acessar configurações
1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### Passo 2: Adicionar um secret
1. Clique no botão **New repository secret**
2. Digite o nome do secret (ex: `SERVER_SSH_KEY`)
3. Cole o valor no campo **Secret**
4. Clique em **Add secret**

---

## 🔑 Como Gerar Chave SSH

### No seu computador local:

```bash
# 1. Gerar nova chave SSH
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/deploy_key

# 2. Copiar chave PÚBLICA para o servidor
ssh-copy-id -i ~/.ssh/deploy_key.pub usuario@servidor

# Ou manualmente:
# ssh usuario@servidor
# mkdir -p ~/.ssh
# echo "sua-chave-publica" >> ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys

# 3. Copiar chave PRIVADA para usar no GitHub
cat ~/.ssh/deploy_key
# Copie TODO o conteúdo (incluindo BEGIN e END)
# Cole como secret SERVER_SSH_KEY
```

---

## 📱 Como Criar Webhook do Discord

### Passo 1: Criar webhook
1. Abra o Discord
2. Vá nas configurações do servidor
3. **Integrações** → **Webhooks**
4. Clique em **Novo Webhook**
5. Configure nome e canal
6. Clique em **Copiar URL do Webhook**

### Passo 2: Adicionar ao GitHub
1. Vá em Settings → Secrets → Actions
2. Crie novo secret: `DISCORD_WEBHOOK`
3. Cole a URL copiada
4. Salve

**Exemplo de mensagem que será enviada:**
> @here 🚨 WhatsApp desconectado! Verificação necessária.

---

## 💬 Como Criar Webhook do Slack

### Passo 1: Criar webhook
1. Vá para https://api.slack.com/apps
2. Clique em **Create New App** → **From scratch**
3. Dê um nome (ex: "GitHub Monitor")
4. Escolha o workspace
5. Em **Features**, clique em **Incoming Webhooks**
6. Ative **Activate Incoming Webhooks**
7. Clique em **Add New Webhook to Workspace**
8. Escolha o canal
9. Copie a **Webhook URL**

### Passo 2: Adicionar ao GitHub
1. Vá em Settings → Secrets → Actions
2. Crie novo secret: `SLACK_WEBHOOK`
3. Cole a URL copiada
4. Salve

---

## ✅ Verificar Configuração

### Testar Deploy Master
1. Configure os secrets SSH
2. Faça um commit em `main`
3. Vá em Actions → Deploy Master
4. Verifique os logs

### Testar WhatsApp Monitor
1. Configure `API_URL` e um webhook
2. Vá em Actions → WhatsApp Monitor
3. Clique em **Run workflow**
4. Verifique se recebeu alerta (se WhatsApp estiver off)

---

## 🔒 Segurança

### Boas práticas:
- ✅ Use chaves SSH dedicadas para deploy (não reutilize chaves pessoais)
- ✅ Limite permissões da chave no servidor (apenas pull, build, restart)
- ✅ Rotacione chaves periodicamente
- ✅ Não compartilhe secrets
- ✅ Use secrets do GitHub (nunca commit secrets no código)

### Em caso de vazamento:
1. **Revogue imediatamente** o secret vazado
2. Gere novos secrets
3. Atualize no GitHub
4. Investigue como vazou

---

## 🐛 Troubleshooting

### Deploy Master não conecta via SSH
**Problema:** Permission denied  
**Solução:**
```bash
# No servidor, verifique:
cat ~/.ssh/authorized_keys  # A chave pública está aqui?
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Teste conexão manual:
ssh -i ~/.ssh/deploy_key usuario@servidor
```

### WhatsApp Monitor não envia alertas
**Problema:** Webhook não funciona  
**Solução:**
```bash
# Teste o webhook manualmente:
curl -X POST "https://discord.com/api/webhooks/..." \
  -H "Content-Type: application/json" \
  -d '{"content":"Teste de webhook!"}'
```

### Secret não é reconhecido
**Problema:** Workflow não enxerga o secret  
**Solução:**
- Verifique se o nome está correto (case-sensitive)
- Verifique se está em "Repository secrets" (não "Environment secrets")
- Re-run o workflow após adicionar secret

---

## 📚 Referências

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
