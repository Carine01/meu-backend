# 📋 GUIA DE APLICAÇÃO DO PATCH

## ✅ Arquivo Criado

- `elevare-fix.patch` - Patch com todos os arquivos (scripts, logger, cron, testes)

---

## 🚀 Como Aplicar

### Opção 1: Aplicação Automática com Git (Recomendado)

```powershell
# Na raiz do backend
cd C:\Users\Carine\Downloads\pacote_final_consolidado_stalkspot\pacote_final_consolidado\backend

# Aplicar patch
git apply elevare-fix.patch

# Se der erro, tente com --index
git apply --index elevare-fix.patch

# Adicionar e commitar
git add .
git commit -m "chore(ci/tests/logs/cron): add scripts, tests, logger, cron, correlation middleware"
```

---

### Opção 2: Aplicação Manual (Se git apply falhar)

Como os arquivos já foram criados anteriormente, você pode pular o patch e ir direto para:

```powershell
# Adicionar todos os arquivos criados
git add .

# Commitar
git commit -m "chore(ci/tests/logs/cron): add scripts, tests, logger, cron, correlation middleware"
```

---

## 🧪 Validação

Após aplicar o patch (ou usar os arquivos já criados), execute:

```powershell
# Rodar relatório completo
pwsh ./relatorio-final.ps1
```

**Ou manualmente:**

```powershell
# 1. Instalar dependências
npm ci

# 2. Compilar TypeScript
npm run build

# 3. Rodar testes com cobertura
npm run test:ci

# 4. Ver relatório de cobertura
Start-Process coverage/lcov-report/index.html
```

---

## 🔧 Troubleshooting

### Se `git apply` reclamar de "patch does not apply"

**Causa:** Arquivos já existem (foram criados anteriormente)

**Solução:**
```powershell
# Ignorar o patch e usar os arquivos já criados
git add .
git commit -m "chore(ci/tests/logs/cron): add scripts, tests, logger, cron, correlation middleware"
```

---

### Se houver erros de import (`@/` não resolvido)

**Causa:** Projeto pode não ter alias `@/` configurado

**Solução 1:** Configurar tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Solução 2:** Substituir imports manualmente
```powershell
# Substituir @/ por ../
# Nos arquivos spec.ts, troque:
# import { X } from '@/entities/Y';
# por:
# import { X } from '../entities/Y';
```

---

### Se testes falharem

**Verificar:**

1. **Métodos existem no service?**
   ```typescript
   // Se o teste chama service.findAll() mas o método é list()
   // Ajustar no teste:
   const result = await service.list(); // em vez de findAll()
   ```

2. **Entidades existem?**
   ```typescript
   // Se não existe Mensagem, Campanha, etc.
   // Comentar temporariamente o teste ou criar entidade mock
   ```

3. **Dependências instaladas?**
   ```powershell
   npm ci
   ```

---

## 📊 Arquivos Adicionados pelo Patch

| Arquivo | Descrição |
|---------|-----------|
| `relatorio-final.ps1` | Script robusto CI/CD |
| `src/lib/logger.ts` | Logger Pino estruturado |
| `src/middleware/correlation.middleware.ts` | Middleware correlationId |
| `src/services/cron.service.ts` | Scheduler com retry |
| `src/services/indicacoes.service.spec.ts` | Teste (corrigido) |
| `src/services/mensagens.service.spec.ts` | Teste |
| `src/services/campanhas.service.spec.ts` | Teste |
| `src/services/eventos.service.spec.ts` | Teste |
| `src/services/auth.service.spec.ts` | Teste |
| `src/services/bi.service.spec.ts` | Teste |
| `src/services/bloqueios.service.spec.ts` | Teste |

**Total:** 11 arquivos

---

## ✅ Checklist

- [ ] Patch criado (`elevare-fix.patch`)
- [ ] Arquivos aplicados (git apply ou manualmente)
- [ ] Dependências instaladas (`npm ci`)
- [ ] Build compila (`npm run build`)
- [ ] Testes passam (`npm run test:ci`)
- [ ] Commit realizado
- [ ] Cobertura aumentou (verificar em coverage/)

---

## 🎯 Próximos Passos

1. **Validar build:**
   ```powershell
   npm run build
   ```

2. **Verificar cobertura:**
   ```powershell
   npm run test:ci
   ```

3. **Ajustar imports** se necessário (trocar `@/` por `../` se não configurado)

4. **Integrar logger** nos services existentes

5. **Registrar tarefas cron** no main.ts

---

**✅ Patch pronto para aplicação!**

**Nota:** Como os arquivos já foram criados nas etapas anteriores, você pode usar diretamente os arquivos existentes em vez de aplicar o patch. O patch serve como backup/documentação do que foi adicionado.
