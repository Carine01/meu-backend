# 🤖 Elevare Agent - Documentação Completa

## 📋 Visão Geral

O **Elevare Agent** é um sistema automatizado de revisão de código e gerenciamento de qualidade que atua como um revisor senior para o projeto. Ele garante que apenas código de alta qualidade seja integrado à branch principal.

## 🎯 Filosofia do Agente

O Elevare Agent trabalha com os seguintes princípios:

- **Frio**: Análise objetiva baseada em métricas concretas
- **Direto**: Feedback claro e sem ambiguidades
- **Técnico**: Foco em qualidade de código e padrões
- **Criterioso**: Zero tolerância para defeitos críticos

## ✅ Critérios de Aprovação

Para um PR ser aprovado, **TODOS** os critérios devem ser atendidos:

| Critério | Descrição | Obrigatório |
|----------|-----------|-------------|
| 🧪 Testes | 100% dos testes devem passar | ✅ Sim |
| 🔍 Lint | 0 erros de linting | ⚠️ Recomendado* |
| 📘 TypeScript | Compilação sem erros | ✅ Sim |
| 🟢 CI | Todos os checks do CI verdes | ✅ Sim |
| 🔒 Segurança | Sem vazamento de segredos | ✅ Sim |
| ⚠️ Warnings | Sem warnings críticos | ⚠️ Recomendado |

*_Se ESLint estiver configurado no projeto_

## 🔄 Workflows Automáticos

### 1. Validação de PRs (`elevare-pr-validation.yml`)

**Quando executa:**
- Quando um PR é aberto
- Quando novos commits são adicionados ao PR
- Quando um PR é reaberto

**O que faz:**
1. ✅ Verifica vazamento de segredos no diff
2. ✅ Compila TypeScript
3. ✅ Executa todos os testes
4. ✅ Calcula cobertura de testes
5. ✅ Executa ESLint (se configurado)
6. ✅ Verifica warnings críticos
7. ✅ Gera relatório detalhado
8. ✅ Comenta no PR com os resultados

**Resultado:**
- ✅ **Aprovado**: PR atende a todos os critérios
- ❌ **Rejeitado**: PR tem falhas críticas

### 2. Milestones Semanais (`elevare-weekly-milestone.yml`)

**Quando executa:**
- Toda segunda-feira às 00:00 UTC
- Manualmente via workflow_dispatch

**O que faz:**
1. 📅 Cria milestone para a semana atual
2. 🏷️ Atribui issues prioritárias ao milestone
3. 📝 Define objetivos da semana
4. 📊 Organiza trabalho semanal

**Benefícios:**
- Organização automática do trabalho
- Visibilidade do progresso semanal
- Priorização automática de issues

### 3. Análise de Issues (`elevare-issue-analysis.yml`)

**Quando executa:**
- Quando uma issue é aberta
- Quando uma issue recebe labels
- Diariamente às 06:00 UTC
- Manualmente via workflow_dispatch

**O que faz:**
1. 🔍 Analisa todas as issues abertas
2. 🏷️ Auto-labela issues sem classificação
3. 📊 Agrupa issues por categoria
4. 🎯 Identifica causas raízes comuns
5. 📝 Cria relatório de análise (diariamente)

**Categorias de Issues:**
- 🐛 Bugs
- 🔒 Segurança
- 🧪 Testes
- 📦 Dependências
- 📝 Documentação
- ✨ Features
- 📋 Outras

### 4. Atualizações Automáticas (`elevare-auto-updates.yml`)

**Quando executa:**
- Toda sexta-feira às 10:00 UTC
- Manualmente via workflow_dispatch

**O que faz:**
1. 🔍 Verifica pacotes desatualizados
2. 🔒 Executa audit de segurança
3. 🚨 Cria issues para vulnerabilidades críticas
4. 📦 Cria issues para atualizações disponíveis

**Tipos de Issues Criadas:**
- 🚨 **Segurança Crítica**: Vulnerabilidades high/critical
- 📦 **Atualizações**: Dependências desatualizadas

### 5. Atualização de Relatórios (`elevare-report-update.yml`)

**Quando executa:**
- Quando PRs são fechados
- Quando issues são criadas/fechadas
- Após validação de PRs
- Diariamente à meia-noite UTC
- Manualmente via workflow_dispatch

**O que faz:**
1. 📊 Coleta estatísticas dos últimos 30 dias
2. 📝 Atualiza arquivo `.github/ELEVARE_AGENT_REPORT.md`
3. 📈 Calcula métricas de qualidade
4. 🔄 Registra atividades recentes
5. 💾 Commita alterações automaticamente

## 📊 Relatórios e Métricas

### Relatório Principal

Localização: `.github/ELEVARE_AGENT_REPORT.md`

**Conteúdo:**
- Estatísticas de PRs (analisados, aprovados, rejeitados)
- Issues criadas pelo agente
- Taxa de aprovação
- Histórico de atividades recentes
- Operações automáticas realizadas

### Métricas Rastreadas

- **PRs Analisados**: Total de PRs que passaram pela validação
- **Taxa de Aprovação**: % de PRs aprovados vs. total
- **Issues Criadas**: Quantidade de issues geradas automaticamente
- **Validações Executadas**: Número de execuções do workflow
- **Vulnerabilidades Detectadas**: Problemas de segurança encontrados

## 🔧 Configuração

### Pré-requisitos

O Elevare Agent funciona out-of-the-box, mas alguns recursos requerem:

1. **Testes configurados**: Script `npm test` funcionando
2. **Build configurado**: Script `npm run build` funcionando
3. **ESLint (opcional)**: Para validação de lint
4. **Permissões GitHub**: Workflows têm permissões adequadas

### Personalizando Validação

Edite `.github/workflows/elevare-pr-validation.yml` para:

- Ajustar threshold de cobertura
- Adicionar validações customizadas
- Modificar critérios de aprovação
- Adicionar checks específicos do projeto

### Ajustando Frequências

Modifique os cron schedules nos workflows:

```yaml
on:
  schedule:
    # Formato: minuto hora dia-do-mês mês dia-da-semana
    - cron: '0 0 * * 1'  # Toda segunda às 00:00
```

## 🚀 Uso

### Para Desenvolvedores

1. **Abrindo um PR:**
   - Certifique-se de que testes passam localmente
   - Execute `npm run build` para verificar TypeScript
   - Verifique se não há segredos no código
   - Abra o PR normalmente

2. **Após abrir o PR:**
   - Aguarde o Elevare Agent executar as validações
   - Leia o comentário automático com o relatório
   - Se rejeitado, corrija os problemas apontados
   - Faça novo push para re-executar a validação

3. **Interpretando o Relatório:**
   - ✅ **OK**: Critério atendido
   - ❌ **FALHA**: Corrija antes do merge
   - ⚠️ **ATENÇÃO**: Recomenda-se correção
   - ⚠️ **N/A**: Validação não aplicável

### Para Mantenedores

1. **Revisando PRs:**
   - Verifique o relatório do Elevare Agent
   - PRs com validação ❌ não devem ser mergeados
   - Use o relatório como base para revisão

2. **Gerenciando Issues:**
   - Issues com label `elevare-agent` são automáticas
   - Priorize issues de segurança (`security` + `elevare-agent`)
   - Use milestones semanais para organização

3. **Monitorando Qualidade:**
   - Consulte `.github/ELEVARE_AGENT_REPORT.md` regularmente
   - Acompanhe taxa de aprovação de PRs
   - Revise relatórios de análise de causas raízes

## 🔒 Proteção da Branch Main

### Configuração Recomendada

Para proteção completa da branch `main`, configure no GitHub:

1. Vá em **Settings** → **Branches** → **Branch protection rules**
2. Adicione regra para branch `main`
3. Configure:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks required:
     - `Elevare Agent - Validação Completa`
     - `CI` (se houver)
   - ✅ Require pull request reviews before merging (mínimo 1)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require linear history (opcional)
   - ✅ Include administrators

### Regras Automáticas

O Elevare Agent automaticamente:
- ❌ Falha o check se critérios não são atendidos
- 🔒 Previne merge de PRs com problemas críticos
- 📝 Documenta motivos da rejeição
- 🔄 Re-valida a cada novo commit

## 🐛 Troubleshooting

### Workflow não executa

**Problema**: Workflow do Elevare não executa ao abrir PR

**Soluções**:
1. Verifique se workflows estão habilitados no repositório
2. Confirme que o arquivo YAML está em `.github/workflows/`
3. Valide sintaxe YAML (use linter online)
4. Verifique permissões do GitHub Actions

### Testes falhando no CI mas passam localmente

**Problema**: Testes passam local mas falham no Elevare

**Soluções**:
1. Verifique variáveis de ambiente
2. Confirme versão do Node.js (CI usa Node 18)
3. Execute `npm install --legacy-peer-deps` localmente
4. Verifique dependências de sistema

### Relatório não atualiza

**Problema**: `.github/ELEVARE_AGENT_REPORT.md` não atualiza

**Soluções**:
1. Execute workflow manualmente via Actions tab
2. Verifique permissões de escrita do workflow
3. Confirme que branch default é `main`
4. Verifique logs do workflow `elevare-report-update`

## 📚 Exemplos

### Exemplo de PR Aprovado

```
## 🤖 Elevare Agent - Relatório de Validação

### Status Geral

| Critério | Status | Detalhes |
|----------|--------|----------|
| 🔒 Segredos | ✅ OK | Nenhum segredo detectado |
| 📘 TypeScript | ✅ OK | Compilação limpa |
| 🧪 Testes | ✅ OK | 0 teste(s) falharam |
| 🎨 Lint | ✅ OK | Verificado |
| ⚠️ Warnings | ✅ OK | 0 warning(s) |

### 🎯 Decisão do Agente

✅ **PR APROVADO**

Este PR atende aos critérios de qualidade do Agente Elevare.
```

### Exemplo de PR Rejeitado

```
## 🤖 Elevare Agent - Relatório de Validação

### Status Geral

| Critério | Status | Detalhes |
|----------|--------|----------|
| 🔒 Segredos | ✅ OK | Nenhum segredo detectado |
| 📘 TypeScript | ❌ FALHA | Erros de compilação |
| 🧪 Testes | ❌ FALHA | 3 teste(s) falharam |
| 🎨 Lint | ✅ OK | Verificado |
| ⚠️ Warnings | ⚠️ ATENÇÃO | 5 warning(s) |

### 🎯 Decisão do Agente

❌ **PR REJEITADO**

Este PR não atende aos critérios mínimos de qualidade.

**Ações necessárias:**
- Corrija todos os erros listados acima
- Execute os testes localmente antes de fazer push
```

## 🤝 Contribuindo

Para melhorar o Elevare Agent:

1. Abra uma issue com sugestões
2. Use label `elevare-agent` + `enhancement`
3. Descreva claramente a melhoria proposta
4. Aguarde feedback da equipe

## 📞 Suporte

- **Issues Automáticas**: Label `elevare-agent`
- **Dúvidas**: Abra issue com label `question`
- **Bugs do Agent**: Label `elevare-agent` + `bug`

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-11-24  
**Mantido por**: Elevare Agent System
