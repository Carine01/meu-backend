# 🚀 Fast Deploy Agents - Guia Rápido

## Execução em 3 Passos

### 1. Preparar (uma vez)

```bash
# Dar permissão de execução
chmod +x scripts/agent/fast-deploy-agents.sh

# Autenticar GitHub CLI (se local)
gh auth login
```

### 2. (Opcional) Exportar Secrets

```bash
export DB_URL="postgresql://user:pass@host:5432/db"
export WHATSAPP_PROVIDER_TOKEN="seu_token"
export WHATSAPP_PROVIDER_API_URL="https://api.whatsapp.com"
export JWT_SECRET="seu_secret"
```

### 3. Executar

```bash
# Usar branch padrão
./scripts/agent/fast-deploy-agents.sh

# OU especificar branch
./scripts/agent/fast-deploy-agents.sh sua-branch-aqui
```

## 📖 Documentação Completa

Veja [scripts/agent/README.md](scripts/agent/README.md) para documentação detalhada.

## ⚡ Exemplo Completo

```bash
# 1. Autenticar
gh auth login

# 2. Definir secrets (opcional)
export DB_URL="postgresql://localhost:5432/elevare"
export JWT_SECRET="my-jwt-secret"

# 3. Executar
./scripts/agent/fast-deploy-agents.sh feat/minha-feature
```

## 🔐 Segurança

- ✅ Secrets configurados via variáveis de ambiente (seguro)
- ✅ Auto-merge desligado por padrão
- ✅ Requer autenticação gh
- ❌ Nunca coloque secrets no script

## 🎯 O que o Script Faz

1. Aplica patches disponíveis
2. Commit + push das mudanças
3. Cria/verifica PR
4. Configura secrets do GitHub (se variáveis definidas)
5. Dispara workflows
6. Monitora execução
7. Comenta resultados no PR
8. Cria issue se houver falhas
9. (Opcional) Auto-merge com aprovação

## 📊 Resultado

O script gera:
- ✅ PR criado/atualizado automaticamente
- ✅ Comentário no PR com status dos workflows
- ✅ Issue de incidente (se falhas críticas)
- ✅ Logs detalhados no terminal

---

**Made with ⚡ by Programador Fantasma**
