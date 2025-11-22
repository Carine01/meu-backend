# 🤖 Configuração de GitHub Actions - Guia Completo

Este documento explica como configurar os 3 workflows automatizados críticos do projeto.

## 📋 Workflows Implementados

### 1. 🚀 Deploy Automático (`deploy.yml`)
**O que faz**: Quando você fizer push na branch `main`, conecta no seu servidor via SSH e executa `docker-compose up -d`

**Arquivo**: `.github/workflows/deploy.yml`

**Como funciona**:
- Detecta push na branch `main`
- Faz build do Docker
- Conecta no servidor via SSH
- Executa `docker-compose pull` e `docker-compose up -d`

### 2. ✅ Testes e Build (`test.yml`)
**O que faz**: Antes de permitir merge de Pull Request, roda todos os testes

**Arquivo**: `.github/workflows/test.yml`

**Como funciona**:
- Detecta Pull Request para branch `main`
- Instala dependências com `npm ci`
- Roda testes unitários
- Tenta rodar testes E2E (se disponíveis)
- Verifica se o build funciona
- **Se qualquer passo falhar, o PR não pode ser mergeado**

### 3. 🩺 Monitoramento WhatsApp (`health-check.yml`)
**O que faz**: A cada 30 minutos, verifica se WhatsApp está conectado

**Arquivo**: `.github/workflows/health-check.yml`

**Como funciona**:
- Executa a cada 30 minutos automaticamente
- Faz uma chamada para `/whatsapp/status`
- Verifica se o campo `connected` é `true`
- Se não estiver conectado, envia alerta para Discord/Telegram
- Também pode ser executado manualmente pela interface do GitHub

---

## 🔐 Configuração de Secrets

Para os workflows funcionarem, você precisa configurar os secrets no GitHub:

### Como Adicionar Secrets:
1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Adicione cada secret abaixo

### Secrets Necessários:

#### Para Deploy Automático (deploy.yml):

| Secret | Descrição | Como Obter |
|--------|-----------|------------|
| `SERVER_HOST` | IP ou domínio do seu servidor | Exemplo: `192.168.1.100` ou `meuservidor.com.br` |
| `SERVER_USER` | Usuário SSH do servidor | Exemplo: `ubuntu`, `root`, ou seu usuário. Use `whoami` no servidor |
| `SERVER_SSH_KEY` | Chave privada SSH | Execute no seu PC: `cat ~/.ssh/id_rsa` e copie todo o conteúdo |

**Importante**: Você também precisa configurar o caminho do projeto no arquivo `deploy.yml`:
- Edite a linha `cd /caminho/do/projeto` 
- Substitua por: `cd /home/usuario/meu-backend` (ou onde seu projeto está no servidor)

#### Para Monitoramento WhatsApp (health-check.yml):

| Secret | Descrição | Como Obter |
|--------|-----------|------------|
| `ALERT_WEBHOOK` | URL do webhook Discord/Telegram | **Discord**: Server Settings → Integrations → Webhooks → New Webhook<br>**Telegram**: Crie um bot com @BotFather e use a URL da API |

**Importante**: Você também precisa atualizar a URL da API no arquivo `health-check.yml`:
- Edite a linha `https://suaapi.com/whatsapp/status`
- Substitua pela URL real da sua API, exemplo: `https://meubackend.com/whatsapp/status`

---

## 🎯 Como Usar

### Deploy Automático
```bash
# Faça suas alterações
git add .
git commit -m "Minha alteração"
git push origin main

# O deploy acontece automaticamente! 🚀
```

### Testes Automáticos em PRs
```bash
# Crie uma branch
git checkout -b minha-feature

# Faça alterações e push
git push origin minha-feature

# Abra um Pull Request no GitHub
# Os testes rodarão automaticamente
# Se falharem, você verá um ❌ vermelho
# Se passarem, você verá um ✅ verde
```

### Monitoramento WhatsApp
- **Automático**: Roda sozinho a cada 30 minutos
- **Manual**: Vá em **Actions** → **🩺 Monitoramento WhatsApp** → **Run workflow**

---

## 📊 Verificando Status dos Workflows

### No GitHub:
1. Vá para a aba **Actions** do repositório
2. Você verá todos os workflows e suas execuções
3. Clique em qualquer execução para ver os logs detalhados

### Badges para README (opcional):
Adicione ao seu README.md:

```markdown
![Deploy](https://github.com/Carine01/meu-backend/workflows/🚀%20Deploy%20Automático/badge.svg)
![Tests](https://github.com/Carine01/meu-backend/workflows/✅%20Testes%20e%20Build/badge.svg)
![Health](https://github.com/Carine01/meu-backend/workflows/🩺%20Monitoramento%20WhatsApp/badge.svg)
```

---

## 🔧 Customização

### Alterar frequência do health check:
Edite `.github/workflows/health-check.yml`:

```yaml
schedule:
  - cron: '*/30 * * * *'  # A cada 30 minutos
  # - cron: '*/15 * * * *'  # A cada 15 minutos
  # - cron: '0 * * * *'     # A cada hora
  # - cron: '0 */6 * * *'   # A cada 6 horas
```

### Adicionar notificações por e-mail:
Adicione no workflow que falha:

```yaml
- name: 📧 Enviar e-mail de alerta
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: '🚨 Alerta: ${{ github.workflow }} falhou'
    body: 'O workflow ${{ github.workflow }} falhou. Verifique em ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
    to: seu-email@exemplo.com
    from: GitHub Actions
```

### Adicionar Slack:
```yaml
- name: 📢 Notificar Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '🚨 Build falhou!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## ❓ Troubleshooting

### Deploy não funciona:
1. Verifique se os secrets estão configurados corretamente
2. Teste a conexão SSH manualmente: `ssh usuario@servidor`
3. Verifique os logs em Actions → Deploy Automático

### Testes falham:
1. Rode `npm test` localmente primeiro
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique os logs em Actions → Testes e Build

### Health check não notifica:
1. Teste a URL manualmente: `curl https://suaapi.com/whatsapp/status`
2. Verifique se o webhook está correto
3. Teste o webhook manualmente:
```bash
curl -X POST "sua-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{"text":"Teste de notificação"}'
```

---

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Generator](https://crontab.guru/)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)

---

**Criado em**: 22 de novembro de 2025  
**Versão**: 1.0.0
