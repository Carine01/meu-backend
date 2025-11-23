# 🚀 Script Ultra-Ferrari de Execução Automática

Este script automatiza todas as etapas necessárias para configurar e executar o backend do projeto Elevare.

## 📋 Funcionalidades

O script `automacao-ultraferrari.sh` executa automaticamente as seguintes etapas:

1. **Merge do PR de documentação** - Faz merge do PR de documentação usando GitHub CLI
2. **Instalação de dependências** - Executa `npm ci` ou `npm install` se necessário
3. **Build e testes** - Compila o código TypeScript e executa os testes
4. **Aplicação de patches** - Aplica patches de clinicId e workflows
5. **Docker Compose** - Sobe o backend com Docker Compose em modo detached
6. **Validação de saúde** - Testa os endpoints `/health` e `/whatsapp/health`
7. **Monitoramento de workflows** - Lista e monitora runs do GitHub Actions

## 🔧 Pré-requisitos

### Obrigatórios
- **Node.js** (v14 ou superior)
- **npm** (vem com Node.js)
- **Git**

### Opcionais (mas recomendados)
- **Docker** e **Docker Compose** - Para executar os serviços em containers
- **GitHub CLI (gh)** - Para merge de PRs e monitoramento de workflows
  - Instalação: https://cli.github.com/
  - Autenticação: `gh auth login`
- **jq** - Para formatação JSON dos endpoints de saúde
  - Ubuntu/Debian: `sudo apt-get install jq`
  - macOS: `brew install jq`
  - Windows: Baixar de https://stedolan.github.io/jq/

## 📝 Como usar

### 1. Dar permissão de execução

```bash
chmod +x automacao-ultraferrari.sh
```

### 2. Configurar variáveis de ambiente (opcional)

Antes de executar, você pode configurar variáveis de ambiente:

```bash
# ID do PR de documentação (opcional)
export DOCS_PR_ID=123

# Outras variáveis que podem ser úteis
export NODE_ENV=development
export PORT=3000
```

Se `DOCS_PR_ID` não estiver definida, o script pulará automaticamente o merge do PR.

### 3. Executar o script

#### No Linux/macOS:
```bash
./automacao-ultraferrari.sh
```

#### Com PR de documentação:
```bash
DOCS_PR_ID=123 ./automacao-ultraferrari.sh
```

#### No Windows (usando Git Bash):
```bash
bash automacao-ultraferrari.sh
```

#### Com logs detalhados:
```bash
./automacao-ultraferrari.sh 2>&1 | tee automacao-log.txt
```

## 📊 Entendendo a saída

O script usa emojis para indicar o progresso:

- 🚦 Início da execução
- 🔹 Etapa em execução
- ✅ Sucesso
- ⚠️ Aviso (não crítico)
- ❌ Erro (se `set -e` não estiver ativo)

### Exemplo de saída esperada:

```
🚦 Iniciando execução automática completa...
🔹 Merge do PR de documentação
⚠️ Substitua <PR_ID_DOCUMENTACAO> pelo ID real do PR de documentação
🔹 Instalando dependências npm
...
✅ Execução automática completa! Todos os agentes configurados.
```

## 🔍 Troubleshooting

### Erro: "gh: command not found"
**Solução**: Instale o GitHub CLI:
- Ubuntu/Debian: `sudo apt install gh`
- macOS: `brew install gh`
- Windows: Baixe de https://cli.github.com/

### Erro: "docker: command not found"
**Solução**: Instale o Docker:
- https://docs.docker.com/get-docker/

### Erro: "Permission denied"
**Solução**: Certifique-se de que o script tem permissão de execução:
```bash
chmod +x automacao-ultraferrari.sh
```

### Erro: "npm ci failed"
**Solução**: O script automaticamente tenta `npm install` como fallback. Se ainda falhar, verifique sua conexão com a internet e o arquivo `package.json`.

### Erro: "Build falhou"
**Solução**: Verifique os erros do TypeScript. Algumas falhas de build podem ser pré-existentes e não impedem a execução.

### Endpoints de saúde não respondem
**Solução**: 
1. Aguarde mais tempo (o script espera 30 segundos)
2. Verifique se o Docker Compose iniciou corretamente: `docker compose ps`
3. Verifique os logs: `docker compose logs backend`

## 🛠️ Personalização

### Alterar tempo de espera para Docker
Edite a linha 55 do script:
```bash
sleep 30  # Altere para 60 para aguardar mais tempo
```

### Adicionar verificações personalizadas
Adicione suas verificações antes da mensagem final:
```bash
# Antes da linha "echo '✅ Execução automática completa!'"
echo "🔹 Verificação personalizada"
# Seu código aqui
```

### Desabilitar etapas específicas
Comente (com `#`) as linhas das etapas que não deseja executar:
```bash
# npm run test || echo "⚠️ Testes falharam. Continuando..."
```

## 📁 Estrutura de diretórios

Após a execução, você terá:

```
meu-backend/
├── automacao-ultraferrari.sh  (Este script)
├── patches/
│   ├── patch-clinicId-filters.patch
│   └── patch-agent-workflows.patch
├── node_modules/
├── dist/                      (Gerado pelo build)
└── ...
```

## 🔄 Integração com CI/CD

O script pode ser integrado em pipelines de CI/CD:

### GitHub Actions exemplo:
```yaml
- name: Run Ultra-Ferrari automation
  run: |
    chmod +x automacao-ultraferrari.sh
    ./automacao-ultraferrari.sh
```

### GitLab CI exemplo:
```yaml
automation:
  script:
    - chmod +x automacao-ultraferrari.sh
    - ./automacao-ultraferrari.sh
```

## 🤝 Contribuindo

Se encontrar bugs ou tiver sugestões de melhorias:

1. Abra uma issue no GitHub
2. Descreva o problema ou sugestão
3. Se possível, inclua logs de erro

## 📄 Licença

Este script faz parte do projeto Elevare e segue a mesma licença do projeto principal.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação do projeto em `/docs`

---

**Última atualização**: 2025-11-23
**Versão**: 1.0.0
