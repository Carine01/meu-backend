# 🔐 Secrets Configuration - Quick Reference

## Secrets para Configurar no GitHub

Vá em: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Descrição | Exemplo / Como Obter | Usado em |
|-------------|-----------|---------------------|----------|
| `SERVER_HOST` | IP ou domínio do servidor | `192.168.1.100` ou `meuservidor.com.br` | deploy.yml |
| `SERVER_USER` | Usuário SSH | `ubuntu`, `root` (use `whoami` no servidor) | deploy.yml |
| `SERVER_SSH_KEY` | Chave privada SSH | Execute no seu PC: `cat ~/.ssh/id_rsa` | deploy.yml |
| `ALERT_WEBHOOK` | URL do Discord/Telegram webhook | **Discord**: Server Settings → Integrations<br>**Telegram**: Use @BotFather | health-check.yml |

## ✏️ Configurações Adicionais nos Arquivos

### 1. Caminho do Projeto no Servidor
**Arquivo**: `.github/workflows/deploy.yml`

Edite a linha 27:
```yaml
cd /caminho/do/projeto  # ← ALTERAR AQUI
```

Substitua por:
```yaml
cd /home/ubuntu/meu-backend  # ou o caminho real no seu servidor
```

### 2. URL da API WhatsApp
**Arquivo**: `.github/workflows/health-check.yml`

Edite a linha 13:
```yaml
STATUS=$(curl -s https://suaapi.com/whatsapp/status | jq -r '.connected')
                    ↑ ALTERAR AQUI
```

Substitua por:
```yaml
STATUS=$(curl -s https://meudominio.com/whatsapp/status | jq -r '.connected')
```

## 🧪 Como Testar

### Testar Conexão SSH (antes de configurar o workflow):
```bash
ssh -i ~/.ssh/id_rsa usuario@servidor-ip
```

### Testar Webhook Discord/Telegram:
```bash
# Discord
curl -X POST "sua-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{"content":"🧪 Teste de notificação"}'

# Telegram
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>&text=🧪 Teste de notificação"
```

### Testar API WhatsApp:
```bash
curl -s https://sua-api.com/whatsapp/status | jq
```

Deve retornar algo como:
```json
{
  "connected": true,
  "status": "ok"
}
```

## 📋 Checklist de Configuração

- [ ] Adicionar secret `SERVER_HOST`
- [ ] Adicionar secret `SERVER_USER`
- [ ] Adicionar secret `SERVER_SSH_KEY`
- [ ] Adicionar secret `ALERT_WEBHOOK`
- [ ] Editar caminho do projeto em `deploy.yml`
- [ ] Editar URL da API em `health-check.yml`
- [ ] Testar conexão SSH manualmente
- [ ] Testar webhook manualmente
- [ ] Fazer um push na main e verificar deploy
- [ ] Abrir um PR e verificar se testes rodam
- [ ] Verificar se health check roda (ou executar manualmente)

---

**Dica**: Mantenha este arquivo atualizado conforme adicionar novos secrets ou workflows!
