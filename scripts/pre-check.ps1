# ============================================
# PRÉ-CHECAGEM - ANTES DO SETUP
# ============================================
# Verifica se o ambiente está pronto

$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🔍 PRÉ-CHECAGEM DO AMBIENTE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$warnings = @()
$errors = @()

# ============================================
# 1. VERIFICA NODE.JS
# ============================================
Write-Host "[1/8] 📦 Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $versionNumber = $nodeVersion -replace 'v', ''
        $majorVersion = [int]($versionNumber.Split('.')[0])
        
        if ($majorVersion -ge 18) {
            Write-Host "   ✅ Node.js $nodeVersion instalado" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Node.js $nodeVersion (recomendado: v18+)" -ForegroundColor Yellow
            $warnings += "Node.js versão antiga detectada"
        }
    } else {
        Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
        $errors += "Instale Node.js 18+: https://nodejs.org"
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
    $errors += "Instale Node.js 18+: https://nodejs.org"
    $allGood = $false
}

# ============================================
# 2. VERIFICA NPM
# ============================================
Write-Host "[2/8] 📦 Verificando npm..." -ForegroundColor Yellow

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "   ✅ npm $npmVersion instalado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ npm não encontrado" -ForegroundColor Red
        $errors += "npm não encontrado (deveria vir com Node.js)"
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ npm não encontrado" -ForegroundColor Red
    $errors += "npm não encontrado (deveria vir com Node.js)"
    $allGood = $false
}

# ============================================
# 3. VERIFICA DOCKER
# ============================================
Write-Host "[3/8] 🐳 Verificando Docker..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "   ✅ $dockerVersion" -ForegroundColor Green
        
        # Verifica se está rodando
        $dockerPs = docker ps 2>$null
        if ($?) {
            Write-Host "   ✅ Docker Engine rodando" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Docker instalado mas não está rodando" -ForegroundColor Yellow
            $warnings += "Inicie o Docker Desktop"
        }
    } else {
        Write-Host "   ⚠️  Docker não encontrado" -ForegroundColor Yellow
        $warnings += "Docker não instalado (opcional, mas recomendado)"
    }
} catch {
    Write-Host "   ⚠️  Docker não encontrado" -ForegroundColor Yellow
    $warnings += "Docker não instalado (opcional, mas recomendado)"
}

# ============================================
# 4. VERIFICA DOCKER COMPOSE
# ============================================
Write-Host "[4/8] 🐳 Verificando Docker Compose..." -ForegroundColor Yellow

try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-Host "   ✅ $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Docker Compose não encontrado" -ForegroundColor Yellow
        $warnings += "Docker Compose não instalado"
    }
} catch {
    Write-Host "   ⚠️  Docker Compose não encontrado" -ForegroundColor Yellow
    $warnings += "Docker Compose não instalado"
}

# ============================================
# 5. VERIFICA PACKAGE.JSON
# ============================================
Write-Host "[5/8] 📄 Verificando package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
    
    # Verifica node_modules
    if (Test-Path "node_modules") {
        Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  node_modules não encontrado" -ForegroundColor Yellow
        $warnings += "Execute: npm install"
    }
} else {
    Write-Host "   ❌ package.json não encontrado" -ForegroundColor Red
    $errors += "Execute este script na pasta backend/"
    $allGood = $false
}

# ============================================
# 6. VERIFICA .ENV
# ============================================
Write-Host "[6/8] 🔧 Verificando variáveis de ambiente..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "   ✅ .env encontrado" -ForegroundColor Green
    
    # Verifica variáveis críticas
    $envContent = Get-Content ".env" -Raw
    $criticalVars = @("DATABASE_HOST", "FIREBASE_PROJECT_ID", "JWT_SECRET")
    $missingVars = @()
    
    foreach ($var in $criticalVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "   ⚠️  Variáveis faltando: $($missingVars -join ', ')" -ForegroundColor Yellow
        $warnings += "Configure variáveis no .env"
    }
} else {
    Write-Host "   ⚠️  .env não encontrado" -ForegroundColor Yellow
    $warnings += "Copie .env.example para .env e configure"
}

# ============================================
# 7. VERIFICA DOCKER-COMPOSE.YML
# ============================================
Write-Host "[7/8] 🐳 Verificando docker-compose.yml..." -ForegroundColor Yellow

if (Test-Path "docker-compose.yml") {
    Write-Host "   ✅ docker-compose.yml encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  docker-compose.yml não encontrado" -ForegroundColor Yellow
    $warnings += "docker-compose.yml não encontrado"
}

# ============================================
# 8. VERIFICA PORTAS
# ============================================
Write-Host "[8/8] 🔌 Verificando portas..." -ForegroundColor Yellow

$ports = @(3000, 5432, 6379)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet 2>$null
    if ($connection) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "   ⚠️  Portas em uso: $($portsInUse -join ', ')" -ForegroundColor Yellow
    $warnings += "Portas em uso (pode causar conflito)"
} else {
    Write-Host "   ✅ Portas disponíveis" -ForegroundColor Green
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DA PRÉ-CHECAGEM" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood -and $errors.Count -eq 0) {
    Write-Host "✅ AMBIENTE PRONTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pode executar:" -ForegroundColor White
    Write-Host "   .\scripts\setup-amanha.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ PROBLEMAS ENCONTRADOS" -ForegroundColor Red
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "🚨 ERROS CRÍTICOS:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "   - $err" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  AVISOS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Retorna código de saída
if ($allGood -and $errors.Count -eq 0) {
    exit 0
} else {
    exit 1
}
