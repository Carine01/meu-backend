# Sistema de Automação Elevare Git/GitHub Agent

## Visão Geral

Sistema completo de automação para gerenciamento, validação e segurança do repositório Elevare. Opera autonomamente sem necessidade de intervenção manual.

## Objetivo

Executar **tudo automaticamente** no repositório:
- ✅ Validação de código
- ✅ Correções automáticas
- ✅ Segurança e auditoria
- ✅ Higienização do código
- ✅ Geração de relatórios
- ✅ Criação de PRs automáticos
- ✅ Bloqueio de builds problemáticos

## Workflows Disponíveis

### 1. `elevare-validate.yml` - Validação Completa
**Trigger:** Push em qualquer branch, PRs, manual

**O que faz:**
- Instala dependências
- Verifica dependências não usadas (depcheck)
- Executa ESLint
- Verifica compilação TypeScript
- Executa testes
- Gera relatório de validação com % de integridade

**Critério de Aprovação:**
- ✅ Instalação bem-sucedida
- ✅ Lint 0 erros
- ✅ TSC sem falhas
- ✅ Testes passando

### 2. `elevare-security.yml` - Scan de Segurança
**Trigger:** Push em qualquer branch, PRs, manual

**O que faz:**
- Scan de segredos no código
- Verifica arquivos .env no repo
- Detecta credenciais Firebase expostas
- Detecta credenciais hardcoded
- NPM audit para vulnerabilidades

**Bloqueadores:**
- ❌ Arquivos .env commitados
- ❌ Credenciais hardcoded
- ❌ Vulnerabilidades críticas/altas

### 3. `elevare-auto-fix.yml` - Correção Automática
**Trigger:** Manual, agendado diariamente às 2h UTC

**O que faz:**
- Executa ESLint auto-fix
- Aplica correções automáticas
- Cria branch automática se houver mudanças
- Abre PR com correções
- Cria Issue para problemas não corrigíveis

**Labels:** `auto-fix`, `bot`, `BLOCKER`, `manual-required`

### 4. `elevare-hygiene.yml` - Higienização
**Trigger:** Push em qualquer branch, PRs, manual

**O que faz:**
- Detecta arquivos órfãos
- Lista dependências não usadas
- Verifica avisos TypeScript
- Detecta imports quebrados
- Identifica código duplicado
- Lista TODOs/FIXMEs pendentes

### 5. `elevare-master-report.yml` - Relatório Master
**Trigger:** Push em qualquer branch, PRs, manual

**O que faz:**
- Executa TODOS os checks
- Calcula % de integridade real
- Gera `ELEVARE_GIT_AGENT_REPORT.md`
- Faz commit do relatório na branch
- Bloqueia build se integridade < 80%

### 6. `ci.yml` - CI Atualizado
**Trigger:** Push em qualquer branch, PRs

**O que faz:**
- Instalação com --legacy-peer-deps
- Lint com max-warnings 0
- TypeScript check
- Testes
- Upload de resultados

## Scripts Disponíveis

### 1. `elevare_auto_fix.sh`
Executa correções automáticas localmente.

```bash
./scripts/elevare_auto_fix.sh
```

**Executa:**
- ESLint auto-fix
- Prettier (se disponível)
- Remove trailing whitespaces
- Corrige problemas comuns

### 2. `auto_fix_and_pr.sh`
Cria PR automático com correções.

```bash
./scripts/auto_fix_and_pr.sh
```

**Executa:**
1. Roda auto-fix
2. Cria nova branch
3. Commita mudanças
4. Push da branch
5. Cria PR no GitHub

**Requer:** GitHub CLI (`gh`)

### 3. `generate_elevare_report.sh`
Gera relatório completo localmente.

```bash
./scripts/generate_elevare_report.sh
```

**Gera:**
- `ELEVARE_GIT_AGENT_REPORT.md`
- Logs detalhados em `reports/`
- % de integridade da branch

## Gatilhos Automáticos

O sistema age automaticamente quando:

- ✅ Push em **qualquer branch**
- ✅ Abertura/atualização de PR
- ✅ Alteração em `package.json`, `package-lock.json`
- ✅ Alteração em workflows (`.github/workflows/*.yml`)
- ✅ Alteração em arquivos `.sh`, `.yml`
- ✅ Alteração em código backend (`src/**`)
- ✅ Diariamente às 2h UTC (auto-fix)

## Critério de Excelência

Branch só é **APROVADA** quando:

- ✅ CI está 100% verde
- ✅ Lint 0 erros
- ✅ TSC sem falhas
- ✅ Testes passando
- ✅ Nenhum segredo vazando
- ✅ Nenhum warning crítico
- ✅ Nenhuma dependência abandonada

**Caso contrário:** ❌ REPROVADO

## Segurança

O sistema **BLOQUEIA** automaticamente se detectar:

- 🔴 Arquivos `.env` no repositório (exceto `.env.example`)
- 🔴 Credenciais hardcoded no código
- 🔴 Chaves Firebase em texto plano
- 🔴 Senhas, tokens, certificados expostos
- 🔴 Vulnerabilidades críticas ou altas

## Relatórios e Artifacts

### Artifacts Gerados (disponíveis por 30-90 dias)

1. **validation-logs-{sha}** - Logs de validação completos
2. **security-report-{sha}** - Relatório de segurança
3. **auto-fix-report-{sha}** - Relatório de correções
4. **hygiene-report-{sha}** - Relatório de higienização
5. **elevare-master-report-{sha}** - Relatório master completo

### Relatório Principal

`ELEVARE_GIT_AGENT_REPORT.md` contém:

- Resumo executivo com % de integridade
- Status de todos os checks
- Logs completos
- Problemas detectados
- Sugestões objetivas

**Sem suavizar. Sem floreio. Apenas fatos.**

## Uso

### Para Desenvolvimento Local

```bash
# 1. Executar correções automáticas
./scripts/elevare_auto_fix.sh

# 2. Criar PR com correções
./scripts/auto_fix_and_pr.sh

# 3. Gerar relatório completo
./scripts/generate_elevare_report.sh
```

### Para CI/CD

Workflows executam automaticamente. Sem configuração adicional necessária.

### Para Forçar Execução Manual

1. Acesse Actions no GitHub
2. Selecione o workflow desejado
3. Clique em "Run workflow"
4. Selecione a branch
5. Confirme

## Fluxo de Trabalho Típico

### Push em Branch

1. Developer faz push
2. `elevare-validate.yml` executa
3. `elevare-security.yml` executa
4. `elevare-hygiene.yml` executa
5. `elevare-master-report.yml` executa e gera relatório
6. Se aprovado: ✅ Continue
7. Se reprovado: ❌ Build falha

### Pull Request

1. PR aberto/atualizado
2. Todos os workflows executam
3. Status checks aparecem no PR
4. Se tudo verde: ✅ Aprovado para merge
5. Se algo vermelho: ❌ Merge bloqueado

### Auto-Fix Diário

1. 2h UTC: `elevare-auto-fix.yml` executa
2. Se houver correções: PR automático criado
3. Se houver problemas não corrigíveis: Issue criada com label `BLOCKER`

## Integridade da Branch

Calculada como:

```
Integridade = (Checks Passaram / Total de Checks) × 100%
```

**Checks considerados:**
- Instalação de dependências
- ESLint (sem erros)
- TypeScript (sem erros)
- Testes (todos passando)
- Segurança (sem problemas críticos)
- Dependências (verificadas)
- Avisos (mínimos)

## Labels Automáticas

- `auto-fix` - PR/Issue de correção automática
- `bot` - Gerado por bot
- `BLOCKER` - Problemas que bloqueiam deploy
- `manual-required` - Requer correção manual
- `automated` - Processo automatizado

## Arquivos Importantes

```
.github/
  workflows/
    elevare-validate.yml       # Validação completa
    elevare-security.yml       # Segurança
    elevare-auto-fix.yml       # Auto-fix
    elevare-hygiene.yml        # Higienização
    elevare-master-report.yml  # Relatório master
    ci.yml                     # CI atualizado

scripts/
  elevare_auto_fix.sh          # Script de auto-fix
  auto_fix_and_pr.sh           # Script PR automático
  generate_elevare_report.sh   # Gerador de relatório

ELEVARE_GIT_AGENT_REPORT.md    # Relatório gerado
reports/                       # Logs detalhados
```

## Troubleshooting

### "npm install falha"

Sempre use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### "ESLint encontra muitos erros"

Execute auto-fix:
```bash
npx eslint . --fix
```

### "TypeScript não compila"

Verifique logs:
```bash
npx tsc --noEmit
```

### "Workflow falha sem motivo aparente"

1. Verifique artifacts do workflow
2. Baixe logs completos
3. Revise `ELEVARE_GIT_AGENT_REPORT.md`

## Manutenção

### Atualizar Workflows

Edite arquivos em `.github/workflows/` e faça commit. Workflows são atualizados automaticamente.

### Adicionar Novos Checks

1. Edite workflow apropriado
2. Adicione step do check
3. Atualize cálculo de integridade
4. Teste manualmente

### Desabilitar Workflow

No arquivo do workflow, adicione:
```yaml
on:
  workflow_dispatch:  # Apenas manual
```

## Conclusão

Sistema **completamente autônomo** que:

- ✅ Valida tudo
- ✅ Corrige tudo que pode
- ✅ Reporta tudo
- ✅ Bloqueia tudo que está ruim
- ✅ Não depende da Carine

**Tom:** Direto, técnico, honesto.
**Objetivo:** Repositório sempre íntegro e seguro.
**Resultado:** Automação total.

---

**Elevare Git/GitHub Agent**  
*Guardião de segurança e integridade do repositório*
