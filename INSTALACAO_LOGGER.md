# 🚀 INSTALAÇÃO - Logger Estruturado

## ⚡ Instalação Rápida

```bash
cd backend
npm install
```

Se houver erro, instalar manualmente:

```bash
npm install pino@9.5.0 --save
npm install pino-pretty@11.5.0 --save
npm install uuid@11.0.3 --save
npm install @types/uuid@10.0.0 --save-dev
```

## ✅ Verificar Instalação

```bash
node -e "console.log(require('pino'))"
node -e "console.log(require('uuid'))"
```

Deve aparecer objetos sem erro.

## 🧪 Testar Logger

```bash
# Rodar backend em modo dev com debug
$env:LOG_LEVEL="debug"; npm run start:dev
```

Você deve ver logs coloridos com emojis e correlationId.

## 🔍 Verificar Erros de Compilação

```bash
npm run build
```

Se houver erros de TypeScript, verificar:
- `tsconfig.json` (strict mode)
- Imports corretos em `main.ts`
- Tipos corretos no `logger.service.ts`

## 📦 Dependências Instaladas

Após `npm install`, verificar `package-lock.json`:

```bash
grep "pino" package-lock.json
grep "uuid" package-lock.json
```

Deve aparecer as versões:
- `pino@9.5.0`
- `pino-pretty@11.5.0`
- `uuid@11.0.3`

## 🎯 Próximos Passos

1. **Rodar testes:**
   ```bash
   npm run test
   ```

2. **Rodar em dev:**
   ```bash
   npm run start:dev
   ```

3. **Fazer uma requisição de teste:**
   ```bash
   # Obter token JWT primeiro
   $token = "seu_token_aqui"
   
   # POST /leads
   Invoke-RestMethod -Method POST `
     -Uri "http://localhost:3000/leads" `
     -Headers @{
       "Authorization" = "Bearer $token"
       "Content-Type" = "application/json"
     } `
     -Body '{"nome":"Teste Logger","phone":"+5511999999999"}'
   ```

4. **Verificar logs:**
   - Deve aparecer `📨 POST /leads` com `correlationId`
   - Deve aparecer `✅ Lead criado` com contexto estruturado
   - Todos os logs devem estar coloridos (pino-pretty em dev)

## 🐛 Troubleshooting

### Erro: "Cannot find module 'pino'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Module not found: @shared/logger"
Verificar que existe:
- `src/shared/logger/index.ts`
- Imports corretos em `main.ts` e `cron.service.ts`

### Logs não aparecem coloridos
Verificar `.env`:
```bash
NODE_ENV=development
LOG_LEVEL=debug
```

### CorrelationId não aparece
Verificar `main.ts`:
```typescript
import { CorrelationInterceptor } from './shared/logger';
app.useGlobalInterceptors(new CorrelationInterceptor());
```

## 📚 Documentação

Ler guia completo: `backend/GUIA_LOGGER_ESTRUTURADO.md`

## ✅ Checklist Final

- [ ] `npm install` executado sem erros
- [ ] `npm run build` compila sem erros
- [ ] `npm run start:dev` inicia sem erros
- [ ] Logs aparecem coloridos com emojis
- [ ] CorrelationId aparece nos logs HTTP
- [ ] Testes passam (`npm run test`)
- [ ] Cron jobs logam corretamente
- [ ] PII está sendo redactado

---

**Tudo OK? Sistema de logger pronto! 🎉**
