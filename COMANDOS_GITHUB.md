# 🚀 COMANDOS GITHUB - Setup Completo

## 📋 Pré-requisitos

```powershell
# Verificar se gh CLI está instalado
gh --version

# Autenticar (se necessário)
gh auth login
```

---

## 1️⃣ Criar Labels

```powershell
# Labels úteis
gh label create "implementation" --color B60205 --description "Tarefas de implementação" 
gh label create "priority/high" --color FF0000 --description "Alta prioridade" 
gh label create "ci" --color 0E8A16 --description "Related to CI/CD" 
gh label create "security" --color F9D0C4 --description "Security issues" 
gh label create "doc" --color 1E90FF --description "Documentação" 
```

---

## 2️⃣ Criar Milestone

```powershell
# Cria milestone com due date em 3 dias
$due = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
gh milestone create "MVP - 100%" --due-date $due --description "Meta: completar MVP em ~3 dias (26h)"
```

**IMPORTANTE:** Guarde o número do milestone retornado (ex.: `#12`)

---

## 3️⃣ Criar 7 Issues Críticas

**⚠️ ANTES DE EXECUTAR:**
- Substitua `<DEV>` pelo seu GitHub username (ex: `Carine01`)
- Substitua `<MILESTONE_NUMBER>` pelo ID do milestone criado (ex: `12`)

```powershell
# 1. Mensagens Service
gh issue create --title "Impl: clinicId filter - mensagens.service" --body @'
Contexto:
Adicionar validação/filtragem clinicId em mensagens.service para garantir multitenancy.

Tarefas:
- [ ] Adicionar guard/where clause para clinicId nas queries (2h)
- [ ] Cobrir com unit tests (mensagens.service.spec) (1h)
- [ ] E2E quick-check (mock WhatsApp) (1h)

Estimativa: 4h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 2. Campanhas Service
gh issue create --title "Impl: clinicId filter - campanhas.service" --body @'
Contexto:
Adicionar clinicId filter em campanhas.service para evitar vazamento de dados entre clínicas.

Tarefas:
- [ ] Atualizar repositório TypeORM com where clinicId (1.5h)
- [ ] Unit tests (1h)
- [ ] Validar integração com scheduler/campanhas (1h)

Estimativa: 3.5h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 3. Eventos Service
gh issue create --title "Impl: clinicId filter - eventos.service" --body @'
Contexto:
Eventos devem ser sempre filtrados por clinicId.

Tarefas:
- [ ] Add clinicId to DTOs & validators (0.5h)
- [ ] Add where clause in eventos.service (1h)
- [ ] Unit tests + mock repository (1h)

Estimativa: 2.5h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 4. Auth Service (SEGURANÇA)
gh issue create --title "Impl: clinicId scoping - auth.service" --body @'
Contexto:
As credenciais/refresh tokens devem estar associadas ao clinicId; login deve validar escopo.

Tarefas:
- [ ] Adicionar clinicId ao payload do JWT e validar (1h)
- [ ] Ajustar guards/policies para checar clinicId (1h)
- [ ] Unit tests para fluxo de login (1h)

Estimativa: 3h
Labels: implementation, priority/high, security
'@ --label "implementation","priority/high","security" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 5. BI Service
gh issue create --title "Impl: clinicId isolation - bi.service (reports/metrics)" --body @'
Contexto:
BI deve agregar métricas por clinicId; queries precisam receber filtro explícito.

Tarefas:
- [ ] Parametrizar queries por clinicId (1.5h)
- [ ] Adicionar unit tests que confirmem isolamento (1h)
- [ ] Smoke tests em staging (0.5h)

Estimativa: 3h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 6. Bloqueios Service
gh issue create --title "Impl: clinicId enforcement - bloqueios.service" --body @'
Contexto:
Bloqueios devem ser aplicados por clinicId; evitar aplicação global indevida.

Tarefas:
- [ ] Adicionar clinicId nas regras de criação/consulta (1h)
- [ ] Unit tests (1h)

Estimativa: 2h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"

# 7. Pagamentos/Pedidos
gh issue create --title "Impl: clinicId filter - pagamentos/pedidos (payments/orders service)" --body @'
Contexto:
Garantir que transações e pedidos estejam sempre ligadas ao clinicId e que gateway não cruze dados.

Tarefas:
- [ ] Adicionar clinicId em Order/Payment dtos & DB queries (1.5h)
- [ ] Atualizar webhooks para validar clinicId (1h)
- [ ] Unit tests + integration smoke (1.5h)

Estimativa: 4h
Labels: implementation, priority/high
'@ --label "implementation","priority/high" --assignee "<DEV>" --milestone "<MILESTONE_NUMBER>"
```

---

## 4️⃣ Criar Pull Request

```powershell
# Criar branch
git checkout -b feat/ci-tests-logs-cron

# Commitar mudanças (se ainda não fez)
git add .
git commit -m "chore(ci/tests/logs/cron): add scripts, tests, logger, cron, correlation middleware"

# Push
git push -u origin feat/ci-tests-logs-cron

# Criar PR apontando para o arquivo de corpo
gh pr create --title "feat: Add CI/CD scripts, tests, logger, cron system" --body-file ./PR_BODY.md --base main
```

---

## 📊 Resumo Estimativas

| Issue | Serviço | Tempo |
|-------|---------|-------|
| #1 | mensagens.service | 4h |
| #2 | campanhas.service | 3.5h |
| #3 | eventos.service | 2.5h |
| #4 | auth.service | 3h |
| #5 | bi.service | 3h |
| #6 | bloqueios.service | 2h |
| #7 | payments/orders | 4h |
| **TOTAL** | **7 services** | **22h** |

---

## 🔍 Verificação

```powershell
# Listar labels criadas
gh label list

# Listar milestones
gh milestone list

# Listar issues abertas
gh issue list --milestone "MVP - 100%"

# Ver status do PR
gh pr status
```

---

## 🐛 Troubleshooting

### Erro: "gh: command not found"

**Instalar GitHub CLI:**
```powershell
# Via winget
winget install GitHub.cli

# Via chocolatey
choco install gh
```

### Erro: "not authenticated"

```powershell
gh auth login
# Escolha: GitHub.com → HTTPS → Login via browser
```

### Erro: "milestone not found"

```powershell
# Listar milestones existentes
gh milestone list

# Use o número correto ou remova --milestone dos comandos
```

---

## 📝 Versão Bash (Linux/Mac)

Se precisar rodar no Linux/Mac, use:

```bash
# Labels
gh label create "implementation" --color B60205 --description "Tarefas de implementação" || true
gh label create "priority/high" --color FF0000 --description "Alta prioridade" || true
gh label create "ci" --color 0E8A16 --description "Related to CI/CD" || true
gh label create "security" --color F9D0C4 --description "Security issues" || true
gh label create "doc" --color 1E90FF --description "Documentação" || true

# Milestone
gh milestone create "MVP - 100%" --due-date "$(date -d '+3 days' +%F)" --description "Meta: completar MVP em ~3 dias (26h)"

# Issues (use a mesma sintaxe, mas com $'...' em vez de @'...'@)
```

---

## ✅ Checklist de Execução

- [ ] gh CLI instalado e autenticado
- [ ] Labels criadas (5 labels)
- [ ] Milestone criado (guardar número)
- [ ] 7 Issues criadas com assignee e milestone
- [ ] Branch criada (feat/ci-tests-logs-cron)
- [ ] PR aberto com body file
- [ ] Verificar issues no board do GitHub

---

**🎯 Pronto para executar!**

**Comandos rápidos (copy/paste):**
1. Criar labels
2. Criar milestone (guardar #)
3. Substituir `<DEV>` e `<MILESTONE_NUMBER>` 
4. Criar 7 issues
5. Criar PR
