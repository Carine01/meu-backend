# Fast Deploy Agents - Automação GitHub

Script profissional de automação para finalização de deploys e workflows do GitHub sem intervenção manual.

## 🎯 O que o script faz

O `fast-deploy-agents.sh` é um script bash completo que automatiza todo o processo de deploy, incluindo:

1. **Checagens de Segurança**: Valida presença de `gh`, `git` e execução na raiz do repositório
2. **Aplicação de Patches**: Aplica patches de forma segura sem sobrescrever arquivos já modificados
3. **Commit e Push**: Commita e faz push automático das mudanças
4. **Criação de PR**: Cria Pull Request automaticamente se não existir
5. **Configuração de Secrets**: Define GitHub Secrets a partir de variáveis de ambiente
6. **Disparo de Workflows**: Inicia workflows do GitHub Actions
7. **Monitoramento**: Aguarda conclusão dos workflows e coleta resultados
8. **Comentários no PR**: Adiciona resumo dos resultados no Pull Request
9. **Gestão de Incidentes**: Cria issues automáticas em caso de falhas críticas
10. **Auto-merge (Opcional)**: Pode fazer merge automático com aprovações

## 🔐 Segurança

### ⚠️ IMPORTANTE - Leia antes de executar

- **Não coloque secrets diretamente no script**
- Secrets são configurados **apenas** via variáveis de ambiente
- Auto-merge está **desabilitado por padrão**
- Execute apenas em ambiente confiável (Actions runner ou máquina pessoal)
- Requer autenticação prévia com `gh auth login`

## 📋 Pré-requisitos

- **gh CLI**: GitHub CLI instalado e autenticado (`gh auth login`)
- **git**: Git instalado e configurado
- **bash**: Shell bash (disponível por padrão em Linux/macOS)
- **Permissões**: Acesso de escrita ao repositório e permissão para gerenciar secrets

## 🚀 Instalação e Preparação

### 1. Garantir permissões de execução

```bash
chmod +x scripts/agent/fast-deploy-agents.sh
```

### 2. Autenticar GitHub CLI (se local)

```bash
gh auth login
```

### 3. (Opcional) Exportar variáveis de ambiente para secrets

Se você deseja que o script configure automaticamente os secrets do GitHub:

```bash
export DB_URL="postgresql://user:pass@host:5432/dbname"
export WHATSAPP_PROVIDER_TOKEN="seu_token_aqui"
export WHATSAPP_PROVIDER_API_URL="https://api.gateway.whatsapp"
export JWT_SECRET="seu_jwt_secret"
export DOCKER_REGISTRY_USER="seu_usuario"
export DOCKER_REGISTRY_PASS="sua_senha"
```

**⚠️ Segurança**: Estas variáveis existem apenas na sessão do terminal. Não as adicione em arquivos versionados.

## 📖 Uso

### Uso Básico

Executar com branch padrão (`feat/whatsapp-clinicid-filters`):

```bash
./scripts/agent/fast-deploy-agents.sh
```

### Especificar Branch

```bash
./scripts/agent/fast-deploy-agents.sh sua-branch-aqui
```

### Com Auto-merge (NÃO RECOMENDADO sem revisão)

```bash
export AUTO_MERGE="true"
./scripts/agent/fast-deploy-agents.sh feat/whatsapp-clinicid-filters
```

### Exemplo Completo com Secrets

```bash
# 1. Autenticar (se necessário)
gh auth login

# 2. Exportar secrets como variáveis de ambiente
export DB_URL="postgresql://user:pass@host:5432/dbname"
export WHATSAPP_PROVIDER_TOKEN="token123"
export WHATSAPP_PROVIDER_API_URL="https://api.whatsapp.com"
export JWT_SECRET="my-secret-key"

# 3. Executar script (auto-merge desligado por padrão)
./scripts/agent/fast-deploy-agents.sh feat/minha-feature
```

## 🔧 Configuração

### Workflows Monitorados

O script monitora os seguintes workflows (editável no script):

- Agent Orchestrator - run agent scripts in sequence (robust)
- TypeScript Guardian
- Register Fila Fallback (AST)
- Docker Builder
- WhatsApp Monitor

### Patches Aplicados

O script tenta aplicar os seguintes patches (se existirem):

- `patch-clinicId-filters.patch`
- `patch-agent-workflows.patch`
- `patch-agent-workflows-2.patch`

### Secrets Configuráveis

Secrets que podem ser definidos via variáveis de ambiente:

| Secret | Variável de Ambiente | Descrição |
|--------|---------------------|-----------|
| `DB_URL` | `DB_URL` | URL de conexão do banco de dados |
| `WHATSAPP_PROVIDER_TOKEN` | `WHATSAPP_PROVIDER_TOKEN` | Token do provedor WhatsApp |
| `WHATSAPP_PROVIDER_API_URL` | `WHATSAPP_PROVIDER_API_URL` | URL da API WhatsApp |
| `JWT_SECRET` | `JWT_SECRET` | Chave secreta JWT |
| `DOCKER_REGISTRY_USER` | `DOCKER_REGISTRY_USER` | Usuário do registry Docker |
| `DOCKER_REGISTRY_PASS` | `DOCKER_REGISTRY_PASS` | Senha do registry Docker |

## 📊 Comportamento

### Fluxo de Execução

```
1. Validar pré-requisitos (gh, git, .git)
   ↓
2. Aplicar patches disponíveis
   ↓
3. Commit + push (se houver mudanças)
   ↓
4. Criar/verificar PR
   ↓
5. Configurar secrets (se variáveis definidas)
   ↓
6. Disparar workflows
   ↓
7. Aguardar conclusão (polling a cada 6s)
   ↓
8. Comentar PR com resultados
   ↓
9. Criar issue se falhas críticas
   ↓
10. Auto-merge (se AUTO_MERGE=true)
```

### Tratamento de Erros

- **Patches não aplicáveis**: Pulados silenciosamente
- **Push falhou**: Aviso exibido, continua execução
- **PR já existe**: Reutiliza PR existente
- **Workflow não encontrado**: Tenta script local `run-agents-all.sh`
- **Falhas em workflows**: Issue automática criada

## 🔄 Auto-merge

O auto-merge só é executado se **TODAS** as condições forem atendidas:

1. `AUTO_MERGE=true` explicitamente definido
2. PR existe
3. PR tem pelo menos uma aprovação humana
4. Todos os checks estão com conclusão SUCCESS

**⚠️ AVISO**: Use auto-merge apenas se você confia completamente nos checks automatizados e tem aprovação humana.

## 📝 Exemplos de Uso

### Cenário 1: Deploy Rápido sem Secrets

```bash
# Executar na raiz do repositório
./scripts/agent/fast-deploy-agents.sh feat/nova-feature
```

### Cenário 2: Deploy com Configuração de Secrets

```bash
# Definir secrets
export DB_URL="postgresql://localhost:5432/mydb"
export JWT_SECRET="super-secret"

# Executar
./scripts/agent/fast-deploy-agents.sh feat/config-update
```

### Cenário 3: CI/CD no GitHub Actions

```yaml
name: Fast Deploy
on:
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to deploy'
        required: true
        default: 'main'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup GitHub CLI
        run: |
          gh auth login --with-token <<< "${{ secrets.GITHUB_TOKEN }}"
      
      - name: Run Fast Deploy
        env:
          DB_URL: ${{ secrets.DB_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          WHATSAPP_PROVIDER_TOKEN: ${{ secrets.WHATSAPP_PROVIDER_TOKEN }}
        run: |
          ./scripts/agent/fast-deploy-agents.sh ${{ github.event.inputs.branch }}
```

## 🐛 Troubleshooting

### Erro: "gh CLI não encontrado"

**Solução**: Instalar GitHub CLI
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# macOS
brew install gh
```

### Erro: ".git não encontrado"

**Solução**: Executar o script na raiz do repositório git
```bash
cd /caminho/para/meu-backend
./scripts/agent/fast-deploy-agents.sh
```

### Erro: "Falha ao criar PR automaticamente"

**Possíveis causas**:
- Branch já mergeada
- Sem permissões suficientes
- Conflitos com branch base

**Solução**: Criar PR manualmente:
```bash
gh pr create --base main --head sua-branch --title "Título" --body "Descrição"
```

### Workflow não encontrado

Se o workflow "Agent Orchestrator" não existir, o script tenta executar `./scripts/agent/run-agents-all.sh`. Certifique-se que um dos dois está disponível.

## 📚 Recursos Adicionais

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🤝 Contribuindo

Para modificar o script:

1. Edite `scripts/agent/fast-deploy-agents.sh`
2. Teste em ambiente seguro
3. Verifique sintaxe: `bash -n scripts/agent/fast-deploy-agents.sh`
4. Commit e crie PR

## 📄 Licença

Este script faz parte do projeto meu-backend e segue a mesma licença do repositório.

---

**💡 Dica do Programador Fantasma**: Use este script com confiança, mas sempre revise os logs e resultados. A automação acelera o processo, mas a responsabilidade final é sempre humana.
