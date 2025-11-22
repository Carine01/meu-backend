# 📋 INSTRUÇÕES - APLICAR PATCH CLINICID

**Arquivo:** `patch-clinicId-filters.patch`  
**Objetivo:** Aplicar filtros clinicId em 7 services + testes unitários  
**Tempo:** 5 minutos

---

## 🎯 O QUE O PATCH FAZ

### **7 Services Modificados:**
1. ✅ `mensagens.service.ts` - QueryBuilder + applyClinicIdFilter
2. ✅ `campanhas.service.ts` - find({ where: { clinicId }})
3. ✅ `eventos.service.ts` - QueryBuilder + applyClinicIdFilter
4. ✅ `auth.service.ts` - clinicId no JWT payload + validação
5. ✅ `bi.service.ts` - find({ where: { clinicId }})
6. ✅ `bloqueios.service.ts` - find({ where: { clinicId }})
7. ✅ `payments.service.ts` - find({ where: { clinicId }})

### **7 Testes Criados:**
- `src/services/__tests__/mensagens.service.spec.ts`
- `src/services/__tests__/campanhas.service.spec.ts`
- `src/services/__tests__/eventos.service.spec.ts`
- `src/services/__tests__/auth.service.spec.ts`
- `src/services/__tests__/bi.service.spec.ts`
- `src/services/__tests__/bloqueios.service.spec.ts`
- `src/services/__tests__/payments.service.spec.ts`

---

## 🚀 OPÇÃO 1: APLICAR VIA CLI (RECOMENDADO)

### **Passo a Passo:**

```powershell
# 1. Navegar até o backend
cd C:\Users\Carine\Downloads\pacote_final_consolidado_stalkspot\pacote_final_consolidado\backend

# 2. Verificar se o patch está na raiz
ls patch-clinicId-filters.patch

# 3. Aplicar o patch (dry-run primeiro para verificar)
git apply --check patch-clinicId-filters.patch

# 4. Se dry-run passou, aplicar de verdade
git apply patch-clinicId-filters.patch

# 5. Verificar arquivos modificados
git status

# 6. Adicionar todos os arquivos
git add .

# 7. Commitar
git commit -m "fix(multitenancy): apply clinicId filters to 7 services + unit test scaffolds"

# 8. Push
git push
```

---

## 🎨 OPÇÃO 2: APLICAR VIA GITLENS (VS CODE)

### **Passo a Passo Visual:**

1. **Abrir arquivo patch:**
   - No VS Code, abra `patch-clinicId-filters.patch`

2. **Clicar direito no arquivo:**
   - Source Control → Apply Patch

3. **OU usar Command Palette:**
   - `Ctrl+Shift+P`
   - Digite: "GitLens: Apply Patch"
   - Selecione `patch-clinicId-filters.patch`

4. **Verificar mudanças:**
   - Aba Source Control (Ctrl+Shift+G)
   - Ver 14 arquivos modificados (7 services + 7 testes)

5. **Commitar:**
   - Mensagem: `fix(multitenancy): apply clinicId filters to 7 services + unit test scaffolds`
   - Push

---

## ⚠️ SE O PATCH FALHAR

### **Possíveis Problemas:**

#### **1. Arquivos não existem**
```powershell
# Verificar se services existem
ls src/services/*.service.ts

# Se não existir, criar estrutura mínima
mkdir src/services
mkdir src/services/__tests__
```

#### **2. Código diferente do esperado**
O patch assume código base simples. Se seus services já existem com código diferente, você tem 2 opções:

**Opção A: Aplicar manualmente**
- Abra cada service
- Copie as modificações do patch
- Adicione import: `import { applyClinicIdFilter } from '../lib/tenant';`
- Adicione métodos `findAllForClinic()`, etc.

**Opção B: Usar código pronto do documento**
- Abra `ENTREGA_PROGRAMADOR_15_PORCENTO.md`
- Seção C tem código completo copy-paste
- Substitua arquivo inteiro

#### **3. Entities não existem**
```powershell
# Criar entities básicas se necessário
touch src/entities/mensagem.entity.ts
touch src/entities/campanha.entity.ts
touch src/entities/evento.entity.ts
touch src/entities/bloqueio.entity.ts
touch src/entities/order.entity.ts
touch src/entities/metric.entity.ts
```

---

## ✅ VALIDAÇÃO PÓS-APLICAÇÃO

### **1. Verificar arquivos criados:**
```powershell
# Services modificados (7)
ls src/services/*.service.ts

# Testes criados (7)
ls src/services/__tests__/*.spec.ts
```

### **2. Rodar testes:**
```powershell
npm run test -- --testPathPattern="services/__tests__"
```

### **3. Build TypeScript:**
```powershell
npm run build
```

### **4. Verificar import tenant.ts:**
```powershell
# Confirmar que helper existe
cat src/lib/tenant.ts
```

---

## 📊 RESULTADO ESPERADO

### **Git Status:**
```
Mudanças a serem commitadas:
  modified:   src/services/mensagens.service.ts
  new file:   src/services/__tests__/mensagens.service.spec.ts
  modified:   src/services/campanhas.service.ts
  new file:   src/services/__tests__/campanhas.service.spec.ts
  modified:   src/services/eventos.service.ts
  new file:   src/services/__tests__/eventos.service.spec.ts
  modified:   src/services/auth.service.ts
  new file:   src/services/__tests__/auth.service.spec.ts
  modified:   src/services/bi.service.ts
  new file:   src/services/__tests__/bi.service.spec.ts
  modified:   src/services/bloqueios.service.ts
  new file:   src/services/__tests__/bloqueios.service.spec.ts
  modified:   src/services/payments.service.ts
  new file:   src/services/__tests__/payments.service.spec.ts
```

**Total:** 14 arquivos (7 modificados + 7 criados)

---

## 🎯 PRÓXIMOS PASSOS

Após aplicar o patch com sucesso:

1. ✅ **Rodar testes:** `npm run test`
2. ✅ **Build:** `npm run build`
3. ✅ **Commit:** Mensagem já pronta acima
4. ✅ **Push:** `git push`
5. ✅ **Criar PR:** Se necessário
6. ✅ **Marcar issues completas:** No GitHub

---

## 🆘 AJUDA RÁPIDA

### **Patch não aplica:**
```powershell
# Resetar mudanças
git reset --hard HEAD

# Aplicar código manualmente
# Use documento ENTREGA_PROGRAMADOR_15_PORCENTO.md seção C
```

### **Testes falhando:**
```powershell
# Instalar dependências
npm ci

# Rodar teste específico
npm test -- mensagens.service.spec.ts
```

### **Build falhando:**
```powershell
# Limpar node_modules
rm -rf node_modules
npm ci
npm run build
```

---

## 📚 REFERÊNCIAS

- **Documento completo:** `ENTREGA_PROGRAMADOR_15_PORCENTO.md`
- **Helper tenant.ts:** `src/lib/tenant.ts`
- **Testes helper:** `src/lib/tenant.spec.ts`
- **Scripts automação:** `scripts/criar-issues-gh.ps1`

---

**Criado em:** 22/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para aplicação
