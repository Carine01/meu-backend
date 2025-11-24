# ELEVARE SUPER-AGENT - Quick Start Guide

## 🚀 Início Rápido

### Execução com Um Clique

1. Vá para [Actions](../../actions)
2. Selecione "ELEVARE-SUPER-AGENT"
3. Clique em "Run workflow" → "Run workflow"
4. Aguarde 5-10 minutos
5. Revise o PR criado automaticamente

## 📋 O Que Acontece

```
┌─────────────────────────────────────┐
│  1. Cria branch automática          │
│     elevare-auto-YYYYMMDD-HHMMSS    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Instala dependências            │
│     npm ci --legacy-peer-deps       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. Formata código                  │
│     ESLint + Prettier               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. Limpa dependências              │
│     npm dedupe + remove unused      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  5. Harmoniza código                │
│     Controllers + Services          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  6. Gera DTOs                       │
│     Auto-validação por tipo         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  7. Verifica segurança              │
│     Secrets + Config + Middleware   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  8. Gera documentação               │
│     Swagger OpenAPI 3.0             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  9. Testa build                     │
│     npm run build                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 10. Cria PR automático              │
│     Com relatório completo          │
└─────────────────────────────────────┘
```

## 📊 Arquivos Gerados

### ✅ Sempre Gerados

```
src/docs/
├── swagger.json        # OpenAPI 3.0 spec
└── API.md             # Documentação Markdown

.elevare_validation_report/
├── final_report.txt   # Relatório principal
└── security-report.txt # Análise de segurança
```

### ⚡ Se Necessário

```
src/modules/*/dto/
└── create-*.dto.ts    # DTOs com validação
```

## 🎯 Próximos Passos Após Execução

### 1. Revisar o PR Criado

```bash
# O PR será criado automaticamente com título:
# "SUPER-AGENT: Full Automatic Backend Upgrade 🚀"
```

### 2. Verificar Relatórios

```bash
# Ver relatório principal
cat .elevare_validation_report/final_report.txt

# Ver relatório de segurança
cat .elevare_validation_report/security-report.txt
```

### 3. Revisar Mudanças

```bash
git diff main..elevare-auto-YYYYMMDD-HHMMSS
```

### 4. Testar Localmente (Opcional)

```bash
# Fazer checkout da branch criada
git fetch origin
git checkout elevare-auto-YYYYMMDD-HHMMSS

# Instalar e testar
npm install --legacy-peer-deps
npm run build
npm test
```

### 5. Merge do PR

Se tudo estiver OK:
1. Aprovar o PR
2. Fazer merge para `main`
3. Deletar a branch automática

## 🔧 Execução Local dos Scripts

### Testar Scripts Individualmente

```bash
# 1. Harmonização de código
./elevare_auto_fix.sh

# 2. Verificações adicionais
./vsc_adiante.sh

# 3. Gerar DTOs
node scripts/generate-dtos.js

# 4. Verificar segurança
node scripts/security-hardening.js

# 5. Gerar documentação
node scripts/generate-swagger.js
```

### Executar Todos de Uma Vez

```bash
# Sequência completa
npm ci --legacy-peer-deps
npx eslint . --fix
npx prettier --write .
npm dedupe
./elevare_auto_fix.sh
./vsc_adiante.sh
node scripts/generate-dtos.js
node scripts/security-hardening.js
node scripts/generate-swagger.js
npm run build
```

## 📈 Resultados Esperados

### Métricas Típicas

- **Controllers analisados**: ~13
- **Rotas documentadas**: ~56
- **DTOs gerados**: ~10
- **Verificações de segurança**: 5-7 checks
- **Tempo de execução**: 5-10 minutos

### Percentual de Automação

```
███████████████████░░░░░  75-80%
```

**Automatizado**:
- ✅ Formatação
- ✅ Linting
- ✅ DTOs básicos
- ✅ Documentação
- ✅ Segurança básica

**Manual**:
- 🔧 Lógica complexa
- 🔧 Validações avançadas
- 🔧 Correções específicas

## ⚠️ Troubleshooting Rápido

### Problema: Workflow falha

**Solução**: Verifique o log do workflow em Actions

### Problema: Nenhum DTO gerado

**Causa**: DTOs já existem ou entidades sem propriedades válidas

### Problema: Build falha

**Esperado**: Erros TypeScript pré-existentes não impedem o workflow

### Problema: PR não criado

**Verifique**: 
- Permissões do repositório
- Se há mudanças para commitar

## 🎓 Aprenda Mais

- [Documentação completa](./ELEVARE_SUPER_AGENT.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/)

## 💡 Dicas

1. **Execute regularmente**: Semanalmente ou após grandes mudanças
2. **Revise sempre**: O PR é automático mas precisa de review humano
3. **Customize**: Ajuste os scripts conforme suas necessidades
4. **Monitore**: Acompanhe os relatórios de segurança
5. **Teste**: Sempre teste em dev antes de merge

---

**Pronto para começar?** → [Run Workflow](../../actions/workflows/elevare-super-agent.yml)
