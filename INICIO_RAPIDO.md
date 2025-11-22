# ⚡ INÍCIO RÁPIDO - 5 MINUTOS

> **Para quem quer rodar AGORA sem ler documentação extensa**

---

## 🚀 COMANDO ÚNICO

```powershell
cd C:\Users\Carine\Downloads\pacote_final_consolidado_stalkspot\pacote_final_consolidado\backend
.\scripts\setup-amanha.ps1
```

**Aguarde 5 minutos** → Sistema configurado automaticamente

---

## 📋 PRÉ-REQUISITOS (3 minutos)

### 1️⃣ Instalar Node.js 18+
```powershell
winget install OpenJS.NodeJS.LTS
```

### 2️⃣ Instalar Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Instalar e iniciar

### 3️⃣ Configurar .env
```powershell
# Copiar template
Copy-Item .env.example .env

# Editar (mínimo necessário)
# DATABASE_PASSWORD=postgres
# JWT_SECRET=sua_chave_min_32_caracteres
# FIREBASE_PROJECT_ID=seu-projeto
```

---

## ✅ VERIFICAÇÃO RÁPIDA

```powershell
# Verifica se está tudo OK
.\scripts\pre-check.ps1
```

Se ver **"✅ AMBIENTE PRONTO!"** → Continue

---

## 🎯 EXECUTAR SETUP

```powershell
.\scripts\setup-amanha.ps1
```

### O que acontece:
- ✅ Sobe Docker (PostgreSQL + Redis)
- ✅ Aplica filtros de segurança (clinicId)
- ✅ Integra WhatsApp
- ✅ Instala dependências
- ✅ Compila projeto
- ✅ Roda testes
- ✅ Gera relatório

**Tempo:** 4-5 minutos

---

## 🌐 INICIAR SERVIDOR

```powershell
npm run start:dev
```

### Acesse:
- 🌐 API: http://localhost:3000
- 📚 Swagger: http://localhost:3000/api
- 🏥 Health: http://localhost:3000/health

---

## 📊 VERIFICAR RELATÓRIO

```powershell
code relatorio-final.md
```

### O que verificar:
- ✅ Build: OK
- ✅ Docker: Rodando
- ✅ clinicId: Aplicado
- ✅ WhatsApp: Integrado

---

## 🐛 SE DER ERRO

### Erro: "Docker não está rodando"
```powershell
# Inicie o Docker Desktop manualmente
# Depois execute:
.\scripts\setup-amanha.ps1 -SkipDocker
```

### Erro: "Porta 3000 em uso"
```powershell
# Mate processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Ou use outra porta
$env:PORT=3001; npm run start:dev
```

### Erro: "npm não encontrado"
```powershell
# Instale Node.js e reinicie terminal
winget install OpenJS.NodeJS.LTS
```

### Erro: ".env não encontrado"
```powershell
Copy-Item .env.example .env
# Edite o .env com suas configurações
```

---

## 🧪 TESTAR ENDPOINTS

### Via PowerShell:
```powershell
# Health check
Invoke-WebRequest http://localhost:3000/health

# Login (exemplo)
$body = @{
    email = "admin@elevare.com"
    password = "senha123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

### Via Swagger:
1. Acesse: http://localhost:3000/api
2. Clique em "Authorize"
3. Insira token JWT
4. Teste endpoints

---

## 📁 ESTRUTURA DO PROJETO

```
backend/
├── scripts/
│   ├── setup-amanha.ps1       ← Script mestre
│   ├── clinicid-batch.ps1     ← Segurança
│   ├── whatsapp-integrate.ps1 ← WhatsApp
│   └── pre-check.ps1          ← Verificação
├── src/
│   ├── modules/               ← Módulos do sistema
│   ├── auth/                  ← Autenticação
│   ├── agendamentos/          ← Agendamentos
│   ├── mensagens/             ← Mensagens
│   └── ...
├── .env.example               ← Template de configuração
├── docker-compose.yml         ← Docker
└── INICIO_RAPIDO.md          ← Você está aqui
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Setup executado → Verificar `relatorio-final.md`
2. ✅ Servidor rodando → Testar no Swagger
3. ✅ Endpoints funcionando → Integrar frontend
4. ✅ Tudo OK → Deploy em produção

---

## 💡 DICAS

### Logs em tempo real:
```powershell
npm run start:dev
```

### Reiniciar Docker:
```powershell
docker-compose restart
```

### Limpar e reconstruir:
```powershell
docker-compose down -v
docker-compose up -d
npm run build
```

### Ver logs do Docker:
```powershell
docker-compose logs -f
```

---

## 📞 SUPORTE

### Documentação completa:
- `GUIA_COMPLETO.md` - Guia detalhado
- `INSTRUCOES_AMANHA.md` - Instruções do setup
- `README.md` - Documentação geral

### Relatórios:
- `relatorio-final.md` - Status do setup
- `PROGRESSO_ATUALIZADO.md` - Progresso do projeto

---

## ⏱️ RESUMO - 5 MINUTOS

```powershell
# 1. Verificar (30s)
.\scripts\pre-check.ps1

# 2. Setup automático (4-5min)
.\scripts\setup-amanha.ps1

# 3. Iniciar (10s)
npm run start:dev

# 4. Acessar
# http://localhost:3000/api
```

**Pronto! Sistema rodando.** 🎉

---

<div align="center">

**Criado em 22/11/2025**  
*Para dúvidas, consulte a documentação completa*

</div>
