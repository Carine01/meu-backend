# 🚫 CANCELAR WORKFLOWS GITHUB

Script PowerShell para cancelar automaticamente todos os workflows do GitHub em andamento no repositório.

## 📋 Pré-requisitos

1. **GitHub CLI (gh)** instalado
2. **Autenticação** configurada no GitHub CLI
3. **PowerShell** (Windows PowerShell ou PowerShell Core)

## 🔧 Instalação do GitHub CLI

### Windows

**Opção 1: Via winget**
```powershell
winget install GitHub.cli
```

**Opção 2: Via Chocolatey**
```powershell
choco install gh
```

### Linux/Mac

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Mac (Homebrew):**
```bash
brew install gh
```

## 🔐 Autenticação

Antes de usar o script, autentique-se no GitHub:

```powershell
gh auth login
```

Escolha as opções:
- GitHub.com
- HTTPS
- Login via browser

## 📁 Localização do Script

O script está disponível em dois locais:

1. **Raiz do projeto:** `cancelar_workflows_github.ps1`
2. **Pasta scripts:** `scripts/cancelar_workflows_github.ps1`

## 🚀 Como Usar

### Opção 1: Executar da Raiz do Projeto

```powershell
# Navegue até a pasta do projeto
cd C:\caminho\para\meu-backend

# Execute o script
powershell -ExecutionPolicy Bypass -File cancelar_workflows_github.ps1
```

### Opção 2: Executar da Pasta Scripts

```powershell
# Navegue até a pasta do projeto
cd C:\caminho\para\meu-backend

# Execute o script da pasta scripts
powershell -ExecutionPolicy Bypass -File scripts\cancelar_workflows_github.ps1
```

### Opção 3: PowerShell Core (Linux/Mac/Windows)

```bash
# Navegue até a pasta do projeto
cd /caminho/para/meu-backend

# Execute o script
pwsh -File cancelar_workflows_github.ps1
```

## 📊 O Que o Script Faz

O script executa 4 etapas principais:

1. **[1/4] Verifica GitHub CLI**
   - Confirma se o comando `gh` está disponível
   - Exibe a versão instalada

2. **[2/4] Verifica Autenticação**
   - Confirma se você está autenticado no GitHub
   - Sugere executar `gh auth login` se não estiver autenticado

3. **[3/4] Lista Workflows em Andamento**
   - Busca workflows com status `in_progress` ou `queued`
   - Exibe lista com ID, nome, status e branch de cada workflow

4. **[4/4] Cancela Workflows**
   - Cancela cada workflow encontrado individualmente
   - Exibe progresso em tempo real
   - Adiciona pequeno delay entre cancelamentos para evitar rate limiting

## 📋 Exemplo de Saída

```
============================================
🚫 CANCELAR WORKFLOWS GITHUB
============================================

[1/4] 📦 Verificando GitHub CLI...
   ✅ gh version 2.83.0 (2025-11-04)
[2/4] 🔐 Verificando autenticação...
   ✅ Autenticado no GitHub
[3/4] 📋 Listando workflows em andamento...
   ✅ Encontrados 3 workflow(s)

   Workflows encontrados:
      • ID: 123456789 - CI [in_progress] - Branch: main
      • ID: 123456790 - Deploy [queued] - Branch: develop
      • ID: 123456791 - Tests [in_progress] - Branch: feature/test

[4/4] 🚫 Cancelando workflows...

   Cancelando: CI (ID: 123456789)... ✅
   Cancelando: Deploy (ID: 123456790)... ✅
   Cancelando: Tests (ID: 123456791)... ✅

============================================
📊 RESUMO
============================================

Total de workflows encontrados: 3
✅ Cancelados com sucesso: 3

============================================
✅ TODOS OS WORKFLOWS FORAM CANCELADOS COM SUCESSO!
============================================
```

## ⚠️ Situações Especiais

### Nenhum Workflow em Andamento

Se não houver workflows em andamento, o script exibirá:

```
[3/4] 📋 Listando workflows em andamento...
   ℹ️  Nenhum workflow em andamento

============================================
✅ CONCLUÍDO
============================================
```

### Erro de Autenticação

Se não estiver autenticado:

```
[2/4] 🔐 Verificando autenticação...
   ❌ Não autenticado no GitHub

Execute:
   gh auth login
```

### GitHub CLI Não Instalado

Se o GitHub CLI não estiver instalado:

```
[1/4] 📦 Verificando GitHub CLI...
   ❌ GitHub CLI não encontrado

Para instalar o GitHub CLI:
   winget install GitHub.cli
   ou
   choco install gh
```

## 🛠️ Troubleshooting

### Erro: "Execution Policy"

Se receber erro sobre política de execução no Windows:

```powershell
# Execute como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Ou use o bypass:

```powershell
powershell -ExecutionPolicy Bypass -File cancelar_workflows_github.ps1
```

### Erro: "Rate Limit"

Se receber erro de rate limit do GitHub:

- O script já inclui delay de 200ms entre cancelamentos
- Aguarde alguns minutos e tente novamente
- Verifique seu limite em: https://github.com/settings/rate-limits

### Verificar Workflows Manualmente

```powershell
# Listar workflows em andamento
gh run list --status in_progress

# Listar workflows na fila
gh run list --status queued

# Cancelar workflow específico
gh run cancel <workflow-id>
```

## 🔗 Links Úteis

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Workflows Documentation](https://docs.github.com/en/actions/using-workflows)
- [Repositório](https://github.com/Carine01/meu-backend)

## 📝 Notas

- O script cancela **TODOS** os workflows em andamento (in_progress e queued)
- Não afeta workflows que já foram concluídos (completed, success, failure)
- É seguro executar múltiplas vezes - apenas afeta workflows ativos
- Requer permissões apropriadas no repositório para cancelar workflows

## 🆘 Suporte

Em caso de problemas:

1. Verifique se o GitHub CLI está instalado: `gh --version`
2. Verifique autenticação: `gh auth status`
3. Verifique permissões no repositório
4. Consulte a documentação do GitHub CLI: `gh run cancel --help`
