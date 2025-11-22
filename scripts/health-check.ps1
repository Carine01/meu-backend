# ============================================
# HEALTH CHECK COMPLETO DO SISTEMA
# ============================================
# Verifica saúde de todos os componentes

$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🏥 HEALTH CHECK - SISTEMA COMPLETO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$healthScore = 0
$maxScore = 8

# ============================================
# 1. DOCKER ENGINE
# ============================================
Write-Host "[1/8] 🐳 Docker Engine..." -ForegroundColor Yellow

try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>$null
    if ($dockerVersion) {
        Write-Host "   ✅ Docker rodando (v$dockerVersion)" -ForegroundColor Green
        $healthScore++
    } else {
        Write-Host "   ❌ Docker não está rodando" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Docker não disponível" -ForegroundColor Red
}

# ============================================
# 2. CONTAINERS ATIVOS
# ============================================
Write-Host "[2/8] 📦 Containers..." -ForegroundColor Yellow

try {
    $containers = docker ps --format "{{.Names}}" 2>$null
    if ($containers) {
        $containerList = $containers -split "`n"
        Write-Host "   ✅ $($containerList.Count) container(s) ativo(s)" -ForegroundColor Green
        foreach ($container in $containerList) {
            Write-Host "      - $container" -ForegroundColor Gray
        }
        $healthScore++
    } else {
        Write-Host "   ⚠️  Nenhum container rodando" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Não foi possível listar containers" -ForegroundColor Red
}

# ============================================
# 3. POSTGRESQL
# ============================================
Write-Host "[3/8] 🐘 PostgreSQL..." -ForegroundColor Yellow

try {
    $pgStatus = docker exec -it $(docker ps -qf "name=postgres") pg_isready 2>$null
    if ($pgStatus -match "accepting connections") {
        Write-Host "   ✅ PostgreSQL aceitando conexões" -ForegroundColor Green
        $healthScore++
    } else {
        Write-Host "   ❌ PostgreSQL não responde" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  PostgreSQL não encontrado ou inacessível" -ForegroundColor Yellow
}

# ============================================
# 4. REDIS
# ============================================
Write-Host "[4/8] 🔴 Redis..." -ForegroundColor Yellow

try {
    $redisStatus = docker exec -it $(docker ps -qf "name=redis") redis-cli ping 2>$null
    if ($redisStatus -match "PONG") {
        Write-Host "   ✅ Redis respondendo (PONG)" -ForegroundColor Green
        $healthScore++
    } else {
        Write-Host "   ❌ Redis não responde" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Redis não encontrado ou inacessível" -ForegroundColor Yellow
}

# ============================================
# 5. BACKEND BUILD
# ============================================
Write-Host "[5/8] 📦 Backend Build..." -ForegroundColor Yellow

if (Test-Path "dist/main.js") {
    $distFiles = (Get-ChildItem -Path "dist" -Recurse -File).Count
    Write-Host "   ✅ Build OK ($distFiles arquivos)" -ForegroundColor Green
    $healthScore++
} else {
    Write-Host "   ❌ Build não encontrado (execute: npm run build)" -ForegroundColor Red
}

# ============================================
# 6. DEPENDÊNCIAS NODE
# ============================================
Write-Host "[6/8] 📚 Dependências Node..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $nodeModulesSize = (Get-ChildItem -Path "node_modules" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   ✅ node_modules OK ($([math]::Round($nodeModulesSize, 2)) MB)" -ForegroundColor Green
    $healthScore++
} else {
    Write-Host "   ❌ node_modules não encontrado (execute: npm install)" -ForegroundColor Red
}

# ============================================
# 7. SERVIDOR BACKEND
# ============================================
Write-Host "[7/8] 🌐 Servidor Backend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Servidor respondendo (Status: $($healthData.status))" -ForegroundColor Green
        $healthScore++
    } else {
        Write-Host "   ⚠️  Servidor retornou status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Servidor não está rodando (inicie com: npm run start:dev)" -ForegroundColor Yellow
}

# ============================================
# 8. VARIÁVEIS DE AMBIENTE
# ============================================
Write-Host "[8/8] 🔧 Variáveis de Ambiente..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("DATABASE_HOST", "FIREBASE_PROJECT_ID", "JWT_SECRET")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "   ✅ Variáveis críticas configuradas" -ForegroundColor Green
        $healthScore++
    } else {
        Write-Host "   ⚠️  Variáveis faltando: $($missingVars -join ', ')" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env não encontrado" -ForegroundColor Red
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DO HEALTH CHECK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$healthPercentage = [math]::Round(($healthScore / $maxScore) * 100, 2)

Write-Host "🎯 Score: $healthScore / $maxScore ($healthPercentage%)" -ForegroundColor White
Write-Host ""

if ($healthScore -eq $maxScore) {
    Write-Host "🎉 SISTEMA 100% SAUDÁVEL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Todos os componentes estão funcionando perfeitamente" -ForegroundColor Green
} elseif ($healthScore -ge ($maxScore * 0.75)) {
    Write-Host "✅ SISTEMA SAUDÁVEL (alguns avisos)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Alguns componentes precisam de atenção" -ForegroundColor Yellow
} elseif ($healthScore -ge ($maxScore * 0.50)) {
    Write-Host "⚠️  SISTEMA PARCIALMENTE FUNCIONAL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vários componentes precisam ser iniciados" -ForegroundColor Yellow
} else {
    Write-Host "❌ SISTEMA COM PROBLEMAS CRÍTICOS" -ForegroundColor Red
    Write-Host ""
    Write-Host "A maioria dos componentes não está funcionando" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# ============================================
# AÇÕES RECOMENDADAS
# ============================================
Write-Host ""
Write-Host "💡 AÇÕES RECOMENDADAS:" -ForegroundColor Yellow
Write-Host ""

if ($healthScore -lt $maxScore) {
    if (-not (docker ps 2>$null)) {
        Write-Host "1. Inicie o Docker Desktop" -ForegroundColor White
    }
    
    if (-not (docker ps --format "{{.Names}}" | Select-String "postgres|redis")) {
        Write-Host "2. Suba os containers:" -ForegroundColor White
        Write-Host "   docker-compose up -d" -ForegroundColor Gray
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "3. Instale dependências:" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor Gray
    }
    
    if (-not (Test-Path "dist/main.js")) {
        Write-Host "4. Compile o projeto:" -ForegroundColor White
        Write-Host "   npm run build" -ForegroundColor Gray
    }
    
    if (-not (Test-Path ".env")) {
        Write-Host "5. Configure variáveis de ambiente:" -ForegroundColor White
        Write-Host "   Copy-Item .env.example .env" -ForegroundColor Gray
    }
    
    try {
        Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    } catch {
        Write-Host "6. Inicie o servidor:" -ForegroundColor White
        Write-Host "   npm run start:dev" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ Tudo funcionando! Nenhuma ação necessária." -ForegroundColor Green
}

Write-Host ""

# ============================================
# TIMING
# ============================================
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "⏱️  Verificação concluída em: $($duration.Seconds)s" -ForegroundColor Gray
Write-Host ""

# Retorna código de saída baseado no score
if ($healthScore -ge ($maxScore * 0.75)) {
    exit 0  # Sucesso
} elseif ($healthScore -ge ($maxScore * 0.50)) {
    exit 1  # Aviso
} else {
    exit 2  # Erro crítico
}
