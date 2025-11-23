# Scripts de Automação

Este diretório contém scripts para automatizar tarefas comuns de desenvolvimento e CI/CD.

## 📁 Estrutura

```
scripts/
├── agent/                          # Scripts de orquestração de agentes
│   ├── run-agents-all.sh          # Orquestrador principal - dispara todos os workflows
│   └── monitor-and-report.sh      # Monitor de workflows - cria issues em falhas
├── configure-secrets.sh            # Configura secrets no GitHub
├── apply-patches.sh                # Aplica patches automaticamente
├── comandos-rapidos.sh             # Referência rápida de comandos
├── exemplo-fluxo-completo.sh       # Exemplo de fluxo completo passo a passo
├── criar-issues-gh.ps1             # Cria 7 issues de multitenancy (PowerShell)
├── criar-issues-gh.sh              # Cria 7 issues de multitenancy (Bash)
└── ... (outros scripts existentes)
```

## 🚀 Scripts Principais

### 1. configure-secrets.sh

Configura todos os secrets necessários no GitHub via CLI interativa.

**Uso:**
```bash
./scripts/configure-secrets.sh
```

**O que faz:**
- Verifica se `gh` está instalado e autenticado
- Solicita valores para cada secret
- Configura secrets via GitHub API
- Mostra link para verificação

**Secrets configurados:**
- `DB_URL` - URL do banco PostgreSQL
- `WHATSAPP_PROVIDER_TOKEN` - Token WhatsApp
- `WHATSAPP_PROVIDER_API_URL` - URL API WhatsApp
- `JWT_SECRET` - Secret para JWT
- `DOCKER_REGISTRY_USER` - Usuário Docker registry
- `DOCKER_REGISTRY_PASS` - Senha Docker registry

---

### 2. apply-patches.sh

Aplica patches de código automaticamente (clinicId filters + workflows).

**Uso:**
```bash
./scripts/apply-patches.sh
```

**O que faz:**
- Verifica se patches existem
- Tenta aplicar cada patch
- Cria commit automaticamente se houver mudanças
- Pergunta se deve fazer push

**Patches aplicados:**
- `patch-clinicId-filters.patch` - Filtros de multitenancy
- `patch-agent-workflows.patch` - Workflows dos agentes

---

### 3. agent/run-agents-all.sh

Orquestrador principal que dispara todos os workflows de agentes em sequência.

**Uso:**
```bash
./scripts/agent/run-agents-all.sh <branch> [pr_number] [auto_merge]
```

**Exemplos:**
```bash
# Auto-detectar PR
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters

# Com PR específico
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123

# Com auto-merge desabilitado (padrão)
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 false
```

**O que faz:**
- Dispara workflows: TypeScript Guardian, Register Fila Fallback, Docker Builder, WhatsApp Monitor
- Lista runs recentes
- Posta comentário de resumo no PR (se fornecido)
- Mostra links para monitoramento

---

### 4. agent/monitor-and-report.sh

Monitor que verifica status dos workflows e cria issues automaticamente em caso de falhas.

**Uso:**
```bash
./scripts/agent/monitor-and-report.sh <branch> [pr_number]
```

**Exemplo:**
```bash
./scripts/agent/monitor-and-report.sh feat/whatsapp-clinicid-filters 123
```

**O que faz:**
- Lista runs recentes da branch
- Detecta workflows que falharam
- Cria issue automaticamente para cada falha
- Posta comentário no PR com resumo
- Marca issues com labels: `incident`, `priority/high`, `ci`

---

### 5. comandos-rapidos.sh

Referência rápida com todos os comandos prontos para copy/paste.

**Uso:**
```bash
./scripts/comandos-rapidos.sh
```

**O que mostra:**
- Comandos para configurar secrets
- Comandos para aplicar patches
- Comandos para disparar workflows
- Comandos de monitoramento
- Comandos para criar issues/PRs
- Fluxo completo resumido

---

### 6. exemplo-fluxo-completo.sh

Demonstração passo a passo do fluxo completo de desenvolvimento.

**Uso:**
```bash
./scripts/exemplo-fluxo-completo.sh
```

**O que demonstra:**
- Configuração inicial
- Criação de feature branch
- Criação de PR
- Disparo de automação
- Monitoramento
- Correção de falhas
- Merge e verificação pós-merge

---

## 🎯 Fluxo Recomendado

### Primeira Vez (Setup)

```bash
# 1. Configurar secrets
./scripts/configure-secrets.sh

# 2. Aplicar patches
./scripts/apply-patches.sh
```

### Para Cada Feature/PR

```bash
# 1. Definir branch
export BRANCH="feat/minha-feature"

# 2. Disparar orquestrador
./scripts/agent/run-agents-all.sh "$BRANCH"

# 3. Aguardar workflows (2-3 min)
sleep 180

# 4. Monitorar e reportar
./scripts/agent/monitor-and-report.sh "$BRANCH"

# 5. Ver status
gh run list --branch "$BRANCH" --limit 10
```

---

## 📋 Pré-requisitos

Todos os scripts requerem:

- **GitHub CLI (`gh`)** instalado e autenticado
  ```bash
  # Verificar
  gh --version
  gh auth status
  
  # Instalar (Ubuntu/Debian)
  sudo apt install gh
  
  # Autenticar
  gh auth login
  ```

- **Git** configurado
  ```bash
  git config --global user.name "Seu Nome"
  git config --global user.email "seu@email.com"
  ```

- **Bash** (Linux/Mac/WSL/Git Bash)
  ```bash
  bash --version
  ```

Scripts PowerShell (`.ps1`) requerem:
- **PowerShell 7+** (Windows/Linux/Mac)

---

## 🔒 Segurança

**IMPORTANTE:**

1. **Nunca commite secrets** - use apenas GitHub Secrets
2. **Não exponha tokens** - use variáveis de ambiente
3. **Revise antes de executar** - leia os scripts antes de rodar
4. **Mantenha auto-merge desligado** - até ter revisão humana

---

## 🐛 Troubleshooting

### Erro: "gh: command not found"

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install gh

# macOS
brew install gh

# Windows
winget install GitHub.cli
```

### Erro: "not authenticated"

```bash
gh auth login
# Escolha: GitHub.com → HTTPS → Login via browser
```

### Erro: "Permission denied"

```bash
chmod +x scripts/*.sh
chmod +x scripts/agent/*.sh
```

### Script falha com "patch already applied"

Isso é normal se o patch já foi aplicado. Ignore o erro ou:

```bash
git apply --check patch-clinicId-filters.patch
# Se retornar erro, patch já está aplicado
```

---

## 📚 Documentação Adicional

- **[GUIA_AUTOMACAO_COMPLETA.md](../GUIA_AUTOMACAO_COMPLETA.md)** - Guia completo com todos os detalhes
- **[COMANDOS_GITHUB.md](../COMANDOS_GITHUB.md)** - Comandos para issues e PRs
- **[README.md](../README.md)** - README principal do projeto

---

## 🤝 Contribuindo

Ao adicionar novos scripts:

1. Siga o padrão de nomenclatura (`kebab-case.sh`)
2. Adicione cabeçalho com descrição e uso
3. Torne o script executável: `chmod +x script.sh`
4. Documente no README.md
5. Teste em ambiente limpo antes de commitar

---

## ✅ Checklist de Uso

Para nova pessoa no projeto:

- [ ] Instalar e autenticar `gh` CLI
- [ ] Executar `./scripts/configure-secrets.sh`
- [ ] Executar `./scripts/apply-patches.sh`
- [ ] Ler `./scripts/comandos-rapidos.sh`
- [ ] Ler `GUIA_AUTOMACAO_COMPLETA.md`
- [ ] Testar disparo de workflow com `run-agents-all.sh`
- [ ] Verificar que workflows estão rodando no GitHub Actions

---

**🎉 Pronto para automação!**

Para dúvidas, consulte o [GUIA_AUTOMACAO_COMPLETA.md](../GUIA_AUTOMACAO_COMPLETA.md) ou abra uma issue.
