@echo off
REM 🚀 Script de Instalação Completa - Elevare IARA (Windows)
REM Tempo estimado: 5 minutos

echo ===============================================
echo     ELEVARE IARA - Instalacao Automatica
echo ===============================================
echo.

REM 1. Verificar dependências
echo [1/6] Verificando dependencias...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js nao instalado
    exit /b 1
)
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker nao instalado
    exit /b 1
)
echo ✅ Dependencias OK
echo.

REM 2. Instalar dependências
echo [2/6] Instalando dependencias...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependencias
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

REM 3. Configurar variáveis de ambiente
echo [3/6] Configurando variaveis de ambiente...
if not exist .env (
    copy .env.example .env
    echo ✅ Arquivo .env criado
    echo.
    echo ⚠️  ATENCAO: Edite o .env com suas credenciais:
    echo    - DATABASE_URL
    echo    - FIREBASE_CREDENTIALS
    echo    - MAKE_WEBHOOK_URL
    echo.
    pause
) else (
    echo ✅ .env ja existe
)
echo.

REM 4. Subir banco de dados
echo [4/6] Iniciando PostgreSQL...
docker-compose up -d postgres
echo ✅ PostgreSQL rodando
echo.

REM Aguardar banco inicializar
echo ⏳ Aguardando banco de dados (10s)...
timeout /t 10 /nobreak >nul
echo.

REM 5. Executar migrations
echo [5/6] Executando migrations...
call npm run migration:run
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Aviso: Erro ao executar migrations (pode ser normal se já rodou antes)
)
echo ✅ Migrations executadas
echo.

REM 6. Inicializar dados básicos
echo [6/6] Inicializando dados...
call npm run seed
echo ✅ Dados iniciais criados
echo.

REM Resumo
echo ===============================================
echo     🎉 INSTALACAO CONCLUIDA!
echo ===============================================
echo.
echo Proximos passos:
echo.
echo 1. Iniciar backend:
echo    npm run start:dev
echo.
echo 2. Testar endpoints:
echo    curl http://localhost:3000/health
echo.
echo 3. Acessar Prometheus:
echo    http://localhost:9090
echo.
echo 4. Ver metricas:
echo    http://localhost:3000/bi/metrics
echo.
echo 5. Rodar testes:
echo    npm test
echo.
pause
