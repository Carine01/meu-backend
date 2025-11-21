# 🚀 COMANDOS PARA O PROGRAMADOR EXECUTAR

## ⚠️ IMPORTANTE: Execute na ordem exata!

### 1️⃣ CORRIGIR DEPENDÊNCIAS (CRÍTICO)
```bash
# Remover pacote vulnerável
npm uninstall firebase

# Instalar dependências de segurança
npm install helmet @nestjs/throttler class-validator class-transformer bcrypt

# Instalar tipos TypeScript
npm install -D @types/bcrypt

# Atualizar Firebase Admin SDK (segurança)
npm install firebase-admin@latest
```

### 2️⃣ VERIFICAR INSTALAÇÃO
```bash
npm list helmet @nestjs/throttler class-validator
```

**✅ Deve mostrar:**
```
├── helmet@7.x.x
├── @nestjs/throttler@5.x.x
├── class-validator@0.14.x
└── class-transformer@0.5.x
```

### 3️⃣ TESTAR BUILD
```bash
npm run build
```

**✅ Se compilar sem erros = SUCESSO!**

---

## 📋 O QUE JÁ FOI CORRIGIDO AUTOMATICAMENTE:

✅ **firebaseAdmin.ts** - Vulnerabilidade RCE eliminada
✅ **main.ts** - Helmet, CORS, ValidationPipe adicionados
✅ **.env.example** - Configuração completa criada

---

## ⏰ TEMPO ESTIMADO:
- Comandos acima: **15-20 minutos**
- Próximos passos (DTOs, testes): **2-3 dias**

---

## 🆘 SE DER ERRO:

### Erro: "Cannot find module 'helmet'"
**Solução:** Executar novamente `npm install helmet`

### Erro: "peer dependency"
**Solução:** Adicionar flag `--legacy-peer-deps`
```bash
npm install helmet --legacy-peer-deps
```

### Erro no build do TypeScript
**Solução:** Limpar cache e rebuildar
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 📞 PRÓXIMA AÇÃO APÓS INSTALAR:
1. Executar: `npm run build`
2. Se sucesso: Commitar código
3. Push para GitHub (vai disparar CI/CD automático)
