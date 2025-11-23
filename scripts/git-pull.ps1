# Script para fazer git pull de forma segura no Windows PowerShell
# Salva alterações locais, faz pull e restaura alterações

param(
    [string]$Branch = "",
    [switch]$NoRebase,
    [switch]$Help
)

# Mostrar ajuda
if ($Help) {
    Write-Host @"
📥 Git Pull Seguro - Script PowerShell

USO:
    .\git-pull.ps1 [opções]

OPÇÕES:
    -Branch <nome>    Especifica a branch para fazer pull (padrão: branch atual)
    -NoRebase         Usa merge em vez de rebase
    -Help             Mostra esta mensagem de ajuda

EXEMPLOS:
    .\git-pull.ps1                    # Pull da branch atual com rebase
    .\git-pull.ps1 -Branch main       # Pull da branch main
    .\git-pull.ps1 -NoRebase          # Pull com merge em vez de rebase

"@ -ForegroundColor Cyan
    exit 0
}

Write-Host "🔄 Iniciando pull seguro do repositório..." -ForegroundColor Cyan
Write-Host ""

# Função para mensagens coloridas
function Write-Success { param($msg) Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Error-Message { param($msg) Write-Host "✗ $msg" -ForegroundColor Red }

# Verificar se estamos em um repositório git
try {
    $null = git rev-parse --git-dir 2>&1
} catch {
    Write-Error-Message "Este diretório não é um repositório Git"
    exit 1
}

# Verificar branch atual
$currentBranch = git branch --show-current
if ([string]::IsNullOrEmpty($Branch)) {
    $Branch = $currentBranch
}

Write-Info "📍 Branch: $Branch"

# Verificar se há alterações não commitadas
$stashed = $false
$status = git status --porcelain
if ($status) {
    Write-Warning "💾 Salvando alterações locais temporariamente..."
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git stash push -m "Auto-stash before pull at $timestamp"
    
    if ($LASTEXITCODE -eq 0) {
        $stashed = $true
        Write-Success "Alterações salvas"
    } else {
        Write-Error-Message "Falha ao salvar alterações"
        exit 1
    }
}

# Verificar conexão com remoto
Write-Info "🔍 Verificando conexão com remoto..."
try {
    $null = git ls-remote --exit-code origin 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Falha na conexão"
    }
} catch {
    Write-Error-Message "Não foi possível conectar ao repositório remoto"
    if ($stashed) {
        Write-Warning "🔄 Restaurando alterações locais..."
        git stash pop
    }
    exit 1
}

# Fazer fetch primeiro
Write-Info "📥 Verificando alterações no remoto..."
git fetch origin

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Falha ao buscar alterações do remoto"
    if ($stashed) {
        Write-Warning "🔄 Restaurando alterações locais..."
        git stash pop
    }
    exit 1
}

# Verificar se há alterações remotas
$local = git rev-parse "@"
$remote = git rev-parse "@{u}"
$base = git merge-base "@" "@{u}"

if ($local -eq $remote) {
    Write-Success "Repositório já está atualizado"
} elseif ($local -eq $base) {
    Write-Info "📥 Baixando alterações remotas..."
    
    if ($NoRebase) {
        git pull origin $Branch
    } else {
        git pull --rebase origin $Branch
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Pull realizado com sucesso"
    } else {
        Write-Error-Message "Erro durante git pull"
        if ($stashed) {
            Write-Warning "🔄 Restaurando alterações locais..."
            git stash pop
        }
        exit 1
    }
} elseif ($remote -eq $base) {
    Write-Warning "Você tem commits locais que não foram enviados ao remoto"
    Write-Info "💡 Use 'git push' para enviar suas alterações"
} else {
    Write-Warning "Branches divergiram. Fazendo pull..."
    
    if ($NoRebase) {
        git pull origin $Branch
    } else {
        git pull --rebase origin $Branch
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Pull realizado com sucesso"
    } else {
        Write-Error-Message "Conflitos detectados"
        Write-Warning "📝 Resolva os conflitos e execute:"
        Write-Host "   git rebase --continue" -ForegroundColor White
        Write-Host "   ou" -ForegroundColor White
        Write-Host "   git rebase --abort (para cancelar)" -ForegroundColor White
        exit 1
    }
}

# Restaurar alterações se foram salvas
if ($stashed) {
    Write-Info "🔄 Restaurando alterações locais..."
    git stash pop
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Alterações restauradas"
    } else {
        Write-Error-Message "Conflitos ao restaurar alterações"
        Write-Warning "📝 Resolva os conflitos manualmente"
        exit 1
    }
}

# Verificar se é um projeto Node.js e se package.json foi alterado
if (Test-Path "package.json") {
    try {
        $changedFiles = git diff --name-only HEAD@{1} HEAD 2>$null
        if ($changedFiles -match "package\.json|package-lock\.json") {
            Write-Info "📦 package.json foi alterado. Instalando dependências..."
            npm install
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Dependências instaladas"
            } else {
                Write-Warning "Falha ao instalar dependências. Execute 'npm install' manualmente."
            }
        }
    } catch {
        # Ignorar erros ao verificar arquivos alterados
    }
}

Write-Host ""
Write-Success "Operação concluída com sucesso!"
Write-Host ""
Write-Info "📊 Próximos passos recomendados:"
Write-Host "   npm run build    # Compilar o projeto" -ForegroundColor White
Write-Host "   npm test         # Executar testes" -ForegroundColor White
Write-Host ""
