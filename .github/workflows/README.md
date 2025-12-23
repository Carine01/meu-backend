# Workflows do GitHub Actions - Referência Rápida

## Visão Geral dos Workflows

| Workflow | Trigger | Duração Aprox. | Propósito |
|----------|---------|----------------|-----------|
| `ci.yml` | Push, PR | ~2-5 min | CI básico (lint, tsc, tests) |
| `elevare-validate.yml` | Push, PR, Manual | ~3-7 min | Validação completa com relatório |
| `elevare-security.yml` | Push, PR, Manual | ~2-4 min | Scan de segurança |
| `elevare-hygiene.yml` | Push, PR, Manual | ~3-5 min | Higienização do código |
| `elevare-auto-fix.yml` | Manual, Agendado | ~4-8 min | Correções automáticas + PR |
| `elevare-master-report.yml` | Push, PR, Manual | ~5-10 min | Relatório master completo |
| `deploy.yml` | Push (main), Manual | ~10-15 min | Deploy para Cloud Run |
| `docker-builder.yml` | Push, PR | ~5-10 min | Build de imagem Docker |

## Workflows Detalhados

### 1. CI (Continuous Integration)

**Arquivo:** `.github/workflows/ci.yml`

**Quando executa:**
- Push em qualquer branch
- Pull Request

**O que faz:**
- ✅ Instala dependências
- ✅ Executa lint
- ✅ Verifica TypeScript
- ✅ Roda testes
- ✅ Upload de resultados

**Bloqueia PR:** Sim (se falhar)

**Como executar manualmente:**
```bash
gh workflow run ci.yml
```

---

### 2. Elevare Validate

**Arquivo:** `.github/workflows/elevare-validate.yml`

**Quando executa:**
- Push em qualquer branch
- Pull Request
- Manual

**O que faz:**
- ✅ Validação completa (install, depcheck, lint, tsc, tests)
- ✅ Gera relatório com % de integridade
- ✅ Upload de artifacts (logs completos)
- ✅ Atualiza step summary

**Critério de Aprovação:**
- Instalação OK
- Lint 0 erros
- TSC sem falhas
- Testes passando

**Bloqueia PR:** Sim

**Artifacts gerados:**
- `validation-logs-{sha}` (30 dias)

**Como executar manualmente:**
```bash
gh workflow run elevare-validate.yml
```

---

### 3. Elevare Security

**Arquivo:** `.github/workflows/elevare-security.yml`

**Quando executa:**
- Push em qualquer branch
- Pull Request
- Manual

**O que faz:**
- 🔒 Scan de segredos
- 🔒 Verifica arquivos .env
- 🔒 Detecta credenciais Firebase
- 🔒 Detecta credenciais hardcoded
- 🔒 NPM audit

**Bloqueadores:**
- Arquivos .env no repo
- Credenciais hardcoded
- Vulnerabilidades critical/high

**Bloqueia PR:** Sim (se encontrar bloqueadores)

**Artifacts gerados:**
- `security-report-{sha}` (90 dias)

**Como executar manualmente:**
```bash
gh workflow run elevare-security.yml
```

---

### 4. Elevare Hygiene

**Arquivo:** `.github/workflows/elevare-hygiene.yml`

**Quando executa:**
- Push em qualquer branch
- Pull Request
- Manual

**O que faz:**
- 📁 Detecta arquivos órfãos
- 📦 Lista dependências não usadas
- ⚠️ Verifica avisos TypeScript
- 🔗 Detecta imports quebrados
- 🔄 Identifica código duplicado
- 📝 Lista TODOs/FIXMEs

**Bloqueia PR:** Não (apenas avisa)

**Artifacts gerados:**
- `hygiene-report-{sha}` (30 dias)

**Como executar manualmente:**
```bash
gh workflow run elevare-hygiene.yml
```

---

### 5. Elevare Auto-Fix

**Arquivo:** `.github/workflows/elevare-auto-fix.yml`

**Quando executa:**
- Manual
- Agendado (diariamente às 2h UTC)

**Requer permissões:**
- `contents: write`
- `pull-requests: write`
- `issues: write`

**O que faz:**
1. Executa ESLint auto-fix
2. **Se houver mudanças:**
   - Cria branch `auto-fix/corrections-{timestamp}`
   - Commita mudanças
   - Push da branch
   - Cria PR com labels `auto-fix`, `bot`
3. **Se não houver mudanças mas há erros:**
   - Cria Issue com label `BLOCKER`, `manual-required`

**Não bloqueia:** Workflow informativo

**Artifacts gerados:**
- `auto-fix-report-{sha}` (30 dias)

**Como executar manualmente:**
```bash
gh workflow run elevare-auto-fix.yml
```

---

### 6. Elevare Master Report

**Arquivo:** `.github/workflows/elevare-master-report.yml`

**Quando executa:**
- Push em qualquer branch
- Pull Request
- Manual

**O que faz:**
- 🎯 Executa **TODOS** os checks
- 📊 Calcula % de integridade
- 📄 Gera `ELEVARE_GIT_AGENT_REPORT.md`
- 💾 Commita relatório na branch (se não for main)
- 🚫 Bloqueia se integridade < 80%

**Checks executados:**
1. Instalação
2. Lint
3. TypeScript
4. Testes
5. Segurança
6. Dependências

**Integridade:**
- 100% = Todos os checks passaram
- < 80% = Build bloqueado

**Artifacts gerados:**
- `elevare-master-report-{sha}` (90 dias)

**Como executar manualmente:**
```bash
gh workflow run elevare-master-report.yml
```

---

### 7. Deploy to Cloud Run

**Arquivo:** `.github/workflows/deploy.yml`

**Quando executa:**
- Push na branch `main`
- Manual

**Requer:**
- Secret `GCP_SA_KEY`

**O que faz:**
1. Instala dependências
2. Roda testes
3. Build Docker image
4. Push para Artifact Registry
5. Deploy para Cloud Run

**Não bloqueia:** Workflow de deploy

---

### 8. Docker Builder

**Arquivo:** `.github/workflows/docker-builder.yml`

**Quando executa:**
- Push em `main`, `develop`, `feat/*`
- Pull Request para `main`

**O que faz:**
- Build de imagem Docker
- Push para GitHub Container Registry

**Não bloqueia:** Workflow informativo

---

## Comandos Úteis

### Listar workflows
```bash
gh workflow list
```

### Ver status de workflow
```bash
gh workflow view elevare-validate.yml
```

### Ver runs de um workflow
```bash
gh run list --workflow=elevare-validate.yml
```

### Ver logs de um run
```bash
gh run view {run-id} --log
```

### Baixar artifacts
```bash
gh run download {run-id}
```

### Cancelar workflow
```bash
gh run cancel {run-id}
```

### Re-executar workflow falhado
```bash
gh run rerun {run-id}
```

## Ordem de Execução Recomendada

Para validação completa antes de merge:

1. `elevare-validate.yml` - Validação básica
2. `elevare-security.yml` - Segurança
3. `elevare-hygiene.yml` - Higienização
4. `elevare-master-report.yml` - Relatório final

Todos executam automaticamente em PRs.

## Troubleshooting

### Workflow não executa

Verifique:
- Branch está no trigger?
- Workflow está habilitado?
- Tem permissões necessárias?

```bash
gh workflow enable elevare-validate.yml
```

### Build falha com dependências

Use `--legacy-peer-deps`:
```yaml
run: npm ci --legacy-peer-deps
```

### Artifacts não aparecem

Verifique:
- Step de upload executou?
- Retention days não expirou?
- Path está correto?

### PR não é criado (auto-fix)

Verifique:
- Token tem permissão?
- Branch já existe?
- PR já foi criado?

## Status Badges

Adicione ao README.md:

```markdown
![CI](https://github.com/Carine01/meu-backend/workflows/CI/badge.svg)
![Validation](https://github.com/Carine01/meu-backend/workflows/Elevare%20-%20Validação%20Completa/badge.svg)
![Security](https://github.com/Carine01/meu-backend/workflows/Elevare%20-%20Segurança/badge.svg)
```

## Boas Práticas

1. **Sempre execute localmente antes de push:**
   ```bash
   npm run lint
   npm run test
   npx tsc --noEmit
   ```

2. **Use auto-fix antes de commitar:**
   ```bash
   ./scripts/elevare_auto_fix.sh
   ```

3. **Revise artifacts antes de merge:**
   - Baixe e revise relatórios
   - Verifique logs de falhas

4. **Não force push após workflow começar:**
   - Cancele workflow atual primeiro
   - Force push
   - Re-execute workflow

## Permissões Necessárias

Para workflows que criam PRs/Issues:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

## Segredos Necessários

No repositório GitHub:

- `GCP_SA_KEY` - Service account key para GCP (deploy)
- `GITHUB_TOKEN` - Gerado automaticamente

## Conclusão

Sistema completo de workflows para:
- ✅ Validação contínua
- ✅ Segurança automática
- ✅ Correções automáticas
- ✅ Relatórios detalhados
- ✅ Deploy automatizado

**Sem intervenção manual necessária.**

---

**Elevare Automation System**
*Workflows para automação completa do repositório*
