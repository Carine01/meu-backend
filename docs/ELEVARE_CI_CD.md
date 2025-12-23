# 🚀 Elevare Autonomous CI/CD

## Visão Geral

Sistema de CI/CD totalmente autônomo para a Plataforma Elevare. Este sistema executa automaticamente:

- ✅ Build
- ✅ Tests
- ✅ Lint & TypeCheck
- ✅ Security Scanning
- ✅ Deploy
- ✅ Validações
- ✅ Criação automática de PRs
- ✅ Limpeza de dependências
- ✅ Manutenção contínua

## 🎯 Eventos Suportados

O CI/CD é executado automaticamente nos seguintes eventos:

- **Push** - Qualquer branch
- **Pull Request** - Qualquer branch
- **Merge** - Merge groups
- **Release** - Criação/edição de releases
- **Cron** - Diariamente às 3h AM UTC (manutenção automática)
- **Manual** - Via workflow_dispatch

## 📋 Workflow Jobs

### 1. 🔧 Auto Fix & Initial Validation
- Executa `elevare_auto_fix.sh`
- Instala/atualiza dependências
- Corrige vulnerabilidades
- Limpa arquivos temporários
- Aplica formatação automática

### 2. 🔨 Build
- Compila TypeScript
- Gera artefatos em `dist/`
- Upload de build artifacts

### 3. 🎨 Lint & TypeCheck
- Validação TypeScript (tsc --noEmit)
- ESLint (se configurado)
- Prettier (se configurado)

### 4. 🧪 Tests
- Executa testes unitários
- Gera relatório de cobertura
- Upload de coverage reports

### 5. 🔒 Security Scan
- npm audit (vulnerabilidades)
- CodeQL (análise estática)
- Upload de security reports

### 6. 📦 Dependency Check
- Verifica dependências não utilizadas (depcheck)
- Identifica dependências desatualizadas
- Gera relatórios

### 7. 📊 Generate Report
- Cria `artifacts/ELEVARE_CI_REPORT.md`
- Consolida resultados de todos os jobs
- Disponibiliza recomendações

### 8. 🔄 Create Auto-Fix PR
- Cria PR automaticamente se houver correções
- Aplica label `automated,ci-fix`
- Inclui descrição detalhada das mudanças

### 9. 🚨 Create Issue on Failure
- Cria issue automaticamente em caso de falha
- Label `bug,ci-failure,priority-high`
- Atribui ao autor do commit
- Inclui links para logs e comparações

### 10. 🚀 Deploy
- **Risk Assessment** - Avalia riscos antes do deploy
- **Bloqueio automático** se houver problemas de segurança
- Deploy apenas na branch `main`
- Requer sucesso em build, tests e security

### 11. 🧹 Cleanup & Maintenance (Cron)
- Limpa cache e dependências antigas
- Atualiza versões patch
- Gera relatório de manutenção

## 🔐 Bloqueio de Deploy

O deploy é **bloqueado automaticamente** se:

- ❌ Security scan falhar
- ❌ Build falhar
- ❌ Tests falharem
- ⚠️ Vulnerabilidades críticas forem detectadas

## 📦 Artefatos Gerados

Todos os artefatos são disponibilizados na aba "Actions" do GitHub:

1. **autofix-report** - Relatório do auto-fix (30 dias)
2. **build-dist** - Build compilado (7 dias)
3. **coverage-report** - Cobertura de testes (30 dias)
4. **security-reports** - Relatórios de segurança (30 dias)
5. **dependency-reports** - Análise de dependências (30 dias)
6. **elevare-ci-report** - Relatório técnico completo (90 dias)
7. **maintenance-report** - Relatório de manutenção (90 dias)

## 🛠️ Scripts Disponíveis

```bash
# Executar auto-fix manualmente
npm run elevare:autofix

# Executar CI completo localmente
npm run elevare:ci-local

# TypeCheck
npm run typecheck

# Build
npm run build

# Tests
npm run test
npm run test:cov
```

## 📝 Script elevare_auto_fix.sh

O script de auto-fix realiza:

1. ✅ Verificação e instalação de dependências
2. ✅ Auditoria de segurança e correção automática
3. ✅ Limpeza de build anterior
4. ✅ Validação TypeScript
5. ✅ Formatação automática (ESLint/Prettier)
6. ✅ Remoção de arquivos temporários
7. ✅ Verificação de configuração (.env)
8. ✅ Geração de relatório

## 🔄 Fluxo de Trabalho

### Push/PR Normal
```
Push → Auto Fix → Build → Tests → Security → Report → Deploy (se main)
```

### Com Correções Automáticas
```
Push → Auto Fix (with changes) → Jobs → Create PR with fixes
```

### Com Falhas
```
Push → Jobs → Failure detected → Create Issue → Notify
```

### Manutenção Agendada
```
Cron (3h AM) → Cleanup → Update deps → Report
```

## 📊 Relatório Técnico

O arquivo `artifacts/ELEVARE_CI_REPORT.md` contém:

- ✅ Resumo executivo de todos os jobs
- ✅ Status de cada etapa
- ✅ Detalhes de build, tests, security
- ✅ Ações necessárias
- ✅ Recomendações
- ✅ Links úteis

## 🚨 Issues Automáticas

Quando há falhas, uma issue é criada automaticamente com:

- 📌 Título descritivo com data
- 📌 Branch e commit afetado
- 📌 Link para workflow run
- 📌 Tabela de status dos jobs
- 📌 Ações necessárias
- 📌 Labels apropriadas
- 📌 Atribuição ao autor

## 🔄 PRs Automáticos

Quando correções são aplicadas, um PR é criado com:

- 📌 Título `🔧 Elevare CI/CD: Automatic Fixes`
- 📌 Lista de correções aplicadas
- 📌 Labels `automated,ci-fix`
- 📌 Instruções de revisão
- 📌 Base branch: main

## ⚙️ Configuração

### Secrets Necessários

- `GITHUB_TOKEN` - Fornecido automaticamente pelo GitHub
- `GCP_SA_KEY` - (Opcional) Para deploy no Google Cloud

### Permissões Necessárias

O workflow requer as seguintes permissões:

- `contents: write` - Para criar branches e commits
- `pull-requests: write` - Para criar PRs
- `issues: write` - Para criar issues
- `security-events: write` - Para CodeQL

### Customização

Para customizar o comportamento, edite `.github/workflows/elevare-autonomous-ci.yml`:

- Ajuste `NODE_VERSION` para mudar versão do Node.js
- Modifique `ARTIFACT_DIR` para mudar diretório de artefatos
- Ajuste cron schedule para mudar frequência de manutenção
- Configure deploy steps no job `deploy`

## 📚 Documentação Adicional

- [GitHub Actions Docs](https://docs.github.com/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## 🤝 Contribuindo

O CI/CD é autônomo, mas você pode:

1. Melhorar o script `elevare_auto_fix.sh`
2. Adicionar novos checks ao workflow
3. Customizar relatórios
4. Ajustar thresholds de segurança

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs do workflow
2. Revise o relatório `ELEVARE_CI_REPORT.md`
3. Verifique issues criadas automaticamente
4. Execute `npm run elevare:ci-local` localmente

---

**Sistema desenvolvido para a Plataforma Elevare**
*Autonomous CI/CD - Versão 1.0*
