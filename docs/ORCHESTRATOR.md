# 🤖 Sistema Orquestrador de PRs - Elevare

## Visão Geral

O Sistema Orquestrador é uma automação inteligente que monitora e gerencia Pull Requests no repositório Elevare. Quando um PR é aberto, o orquestrador automaticamente:

- ✅ Posta um comentário informativo explicando o sistema
- 🏷️ Aplica labels estratégicas
- 👥 Solicita revisores automaticamente
- 🔄 Pode habilitar auto-merge quando configurado

## 🚀 Como Funciona

### Automático (Trigger em PRs)

Quando você abre ou reabre um PR, o workflow `pr-orchestrator.yml` é automaticamente acionado e:

1. Posta o comentário padrão do orquestrador
2. Aplica a label `automation` por padrão
3. Notifica sobre os próximos passos automatizados

### Manual (Workflow Dispatch)

Você também pode executar o orquestrador manualmente com configurações personalizadas:

```bash
# Via GitHub CLI
gh workflow run pr-orchestrator.yml \
  -f pr_number=123 \
  -f auto_merge=true \
  -f reviewers=dev1,dev2 \
  -f labels=implementation,priority/high
```

Ou pela interface do GitHub:
1. Vá em **Actions** → **PR Orchestrator**
2. Clique em **Run workflow**
3. Preencha os inputs desejados

## 📋 Inputs Disponíveis

| Input | Descrição | Padrão | Exemplo |
|-------|-----------|--------|---------|
| `pr_number` | Número do PR | (obrigatório) | `123` |
| `auto_merge` | Habilitar merge automático | `false` | `true` |
| `reviewers` | Lista de revisores separados por vírgula | - | `user1,user2` |
| `labels` | Lista de labels separadas por vírgula | `automation` | `implementation,priority/high` |

## 🛠️ Uso do Script Standalone

O script pode ser executado diretamente via linha de comando:

```bash
# Uso básico
./scripts/auto-comment-and-assign.sh <PR_NUMBER>

# Com todos os parâmetros
./scripts/auto-comment-and-assign.sh 123 true "dev1,dev2" "implementation,priority/high"

# Ou usando variáveis de ambiente
export PR_NUMBER=123
export AUTO_MERGE=true
export REVIEWERS="dev1,dev2"
export LABELS="implementation,priority/high"
./scripts/auto-comment-and-assign.sh
```

## 📌 Comentário Padrão do Orquestrador

O comentário automático inclui:

- **Status**: Confirmação de que o orquestrador foi ativado
- **O que foi feito**: Lista de ações executadas
- **Como usar**: Instruções sobre os inputs disponíveis
- **Próximos passos**: Explicação do monitoramento contínuo

### Exemplo do Comentário

```markdown
🚀 **Agente Orquestrador Ativado**

O fluxo de automação foi iniciado com sucesso.  
Este PR agora está sob monitoramento contínuo pelo sistema de agentes da plataforma.

### 📌 O que já foi feito:
• Validação inicial executada  
• Workflows disparados  
• Labels estratégicas aplicadas  
• Revisores notificados (quando configurados)

### ⚙️ Como usar este PR com inputs do Orquestrador:
- `auto_merge=true` → habilita tentativa automática de merge...
...
```

## 🔧 Configuração

### Pré-requisitos

- GitHub CLI (`gh`) instalado no ambiente de execução
- Token GitHub com permissões:
  - `pull-requests: write`
  - `contents: read`
  - `issues: write`

### Instalação

O sistema já está configurado e pronto para uso. Nenhuma configuração adicional é necessária.

### Personalização

Para personalizar o comentário do orquestrador, edite:

```bash
scripts/auto-comment-and-assign.sh
```

Localize a variável `COMMENT_BODY` e ajuste o texto conforme necessário.

## 📊 Exemplos de Uso

### Exemplo 1: PR com Auto-merge

```bash
gh workflow run pr-orchestrator.yml \
  -f pr_number=456 \
  -f auto_merge=true \
  -f labels=hotfix,priority/critical
```

### Exemplo 2: PR com Revisores Específicos

```bash
gh workflow run pr-orchestrator.yml \
  -f pr_number=789 \
  -f reviewers=carine01,senior-dev \
  -f labels=feature,needs-review
```

### Exemplo 3: Chamada Direta do Script

```bash
cd scripts
./auto-comment-and-assign.sh 101 false "reviewer1" "implementation"
```

## 🔍 Troubleshooting

### Erro: "gh CLI não está instalado"

**Solução**: Instale o GitHub CLI:
- **macOS**: `brew install gh`
- **Linux**: `apt install gh` ou baixe de https://cli.github.com/
- **Windows**: `winget install GitHub.cli`

### Erro: "não foi possível habilitar auto-merge"

**Causa**: Falta de permissões ou repositório não configurado para auto-merge.

**Solução**: 
1. Verifique se você tem permissões de maintainer
2. Habilite auto-merge nas configurações do repositório
3. Configure branch protection rules adequadas

### Labels não aparecem

**Causa**: Labels podem não existir no repositório.

**Solução**: Crie as labels primeiro:
```bash
gh label create "implementation" --color B60205
gh label create "priority/high" --color FF0000
```

## 🔐 Segurança

- O workflow usa `GITHUB_TOKEN` com permissões mínimas necessárias
- Não expõe secrets ou dados sensíveis
- Executa em ambiente isolado do GitHub Actions

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [Automating Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)

## 🤝 Contribuindo

Para contribuir com melhorias no sistema orquestrador:

1. Faça suas alterações em `scripts/auto-comment-and-assign.sh` ou `.github/workflows/pr-orchestrator.yml`
2. Teste localmente com `./scripts/auto-comment-and-assign.sh`
3. Crie um PR com suas melhorias
4. O próprio orquestrador comentará no seu PR! 🎉

---

💡 **Dica**: Use o orquestrador para acelerar o fluxo de revisão e merge de PRs, garantindo consistência e profissionalismo em todos os Pull Requests do projeto.
