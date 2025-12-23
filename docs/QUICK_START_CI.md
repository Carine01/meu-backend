# 🚀 Quick Start - Elevare CI/CD

## Para Desenvolvedores

### 1. Executar CI/CD Localmente (Antes de Push)

```bash
npm run elevare:ci-local
```

Este comando:
- ✅ Executa auto-fix
- ✅ Compila o código
- ✅ Roda testes
- ✅ Valida TypeScript
- ✅ Verifica segurança
- ✅ Gera relatório em `artifacts/ELEVARE_CI_REPORT.md`

### 2. Executar Apenas Auto-Fix

```bash
npm run elevare:autofix
```

Corrige automaticamente:
- Dependências
- Vulnerabilidades
- Formatação
- Arquivos temporários

### 3. Verificar TypeScript

```bash
npm run typecheck
```

### 4. Build

```bash
npm run build
```

### 5. Testes

```bash
npm run test              # Testes normais
npm run test:cov          # Com cobertura
npm run test:watch        # Modo watch
```

## O Que Acontece no Push

Quando você faz push para o GitHub, automaticamente:

1. 🔧 **Auto-Fix** - Correções automáticas
2. 🔨 **Build** - Compilação TypeScript
3. 🎨 **Lint/TypeCheck** - Validação de código
4. 🧪 **Tests** - Testes unitários
5. 🔒 **Security** - Análise de segurança (CodeQL + npm audit)
6. 📦 **Dependencies** - Verificação de deps
7. 📊 **Report** - Gera ELEVARE_CI_REPORT.md
8. 🔄 **Auto PR** - Se houver correções
9. 🚨 **Issue** - Se houver falhas
10. 🚀 **Deploy** - Se branch main e tudo OK

## Ver Resultados

### No GitHub Actions
1. Vá para a aba "Actions"
2. Clique no workflow run
3. Veja os jobs e logs
4. Download dos artefatos:
   - `elevare-ci-report` - Relatório completo
   - `coverage-report` - Cobertura de testes
   - `security-reports` - Relatórios de segurança

### Localmente
```bash
# Ver relatório local
cat artifacts/ELEVARE_CI_REPORT.md

# Ver cobertura
open coverage/lcov-report/index.html  # Mac
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## Fluxo de Trabalho Recomendado

```bash
# 1. Fazer mudanças
vim src/...

# 2. Rodar CI local
npm run elevare:ci-local

# 3. Se passar, commit
git add .
git commit -m "feat: minha feature"

# 4. Push
git push

# 5. Verificar Actions no GitHub
# 6. Se falhar, revisar issue criada automaticamente
# 7. Se houver correções, revisar PR criado automaticamente
```

## Manutenção Automática

O sistema roda automaticamente **todos os dias às 3h AM UTC**:
- Limpeza de cache
- Atualização de dependências patch
- Verificação de deps desatualizadas
- Geração de relatório de manutenção

## Troubleshooting

### CI Local Falhou
```bash
# Ver detalhes no relatório
cat artifacts/ELEVARE_CI_REPORT.md

# Ver erros TypeScript
npm run typecheck

# Ver testes falhando
npm run test
```

### CI Remoto Falhou
1. Veja a issue criada automaticamente
2. Clique no link para logs
3. Corrija os problemas
4. Push novamente

### Deploy Bloqueado
Deploy é bloqueado se:
- ❌ Security scan falhar
- ❌ Build falhar
- ❌ Tests falharem

Corrija os problemas e push novamente.

## Configuração Avançada

Ver documentação completa: [docs/ELEVARE_CI_CD.md](./docs/ELEVARE_CI_CD.md)

## Comandos Úteis

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Ver dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Dicas

1. **Sempre rode CI local antes de push**
   ```bash
   npm run elevare:ci-local
   ```

2. **Commits pequenos e frequentes** são melhores

3. **Revisar PRs automáticos** antes de fazer merge

4. **Não ignorar issues automáticas** - elas indicam problemas reais

5. **Ver artefatos do CI** para análises detalhadas

## Suporte

- 📖 [Documentação Completa](./docs/ELEVARE_CI_CD.md)
- 🐛 Issues automáticas para falhas
- 📊 Relatórios técnicos em artifacts/

---

**Happy Coding! 🚀**
