# ELEVARE SUPER-AGENT 🚀

Workflow automatizado completo para upgrade e manutenção do backend.

## Visão Geral

O ELEVARE SUPER-AGENT é um sistema de automação completo que executa múltiplas tarefas de manutenção, validação, e melhoria do código de forma automatizada através do GitHub Actions.

## Como Usar

### Execução Manual

1. Acesse a aba **Actions** no GitHub
2. Selecione o workflow **ELEVARE-SUPER-AGENT**
3. Clique em **Run workflow**
4. Selecione a branch (normalmente `main`)
5. Clique em **Run workflow**

### Execução Automática

O workflow é executado automaticamente em cada push para a branch `main`.

## O Que o Workflow Faz

### 1. 🔧 Preparação
- Cria uma nova branch com nome único: `elevare-auto-YYYYMMDD-HHMMSS`
- Instala todas as dependências do projeto

### 2. 🎨 Formatação e Linting
- Executa ESLint com correção automática
- Executa Prettier para formatação consistente
- Remove duplicatas de dependências

### 3. 📦 Gerenciamento de Dependências
- Identifica dependências não utilizadas
- Remove dependências desnecessárias de forma conservadora
- Gera relatório de dependências

### 4. 🏗️ Harmonização de Código
- Valida estrutura de controllers
- Verifica decoradores em services
- Identifica rotas não documentadas
- Executa verificações adicionais de qualidade

### 5. 📝 Geração de DTOs
- Analisa todas as entidades TypeORM
- Gera DTOs automaticamente com validações apropriadas
- Usa decoradores específicos por tipo:
  - `@IsString()` para strings
  - `@IsNumber()` para números
  - `@IsBoolean()` para booleans
  - `@IsArray()` para arrays
  - `@IsDateString()` para datas
  - `@IsObject()` para objetos

### 6. 🔒 Hardening de Segurança
- Verifica presença de arquivo `.env` no repositório
- Valida `.gitignore` para secrets
- Detecta credenciais hardcoded
- Verifica presença de Helmet middleware
- Valida configuração CORS
- Verifica rate limiting
- Gera relatório de segurança detalhado

### 7. 📚 Documentação Swagger
- Analisa todos os controllers
- Extrai rotas automaticamente
- Gera especificação OpenAPI 3.0 completa
- Cria documentação Markdown
- Documenta:
  - Métodos HTTP (GET, POST, PUT, DELETE, PATCH)
  - Paths e parâmetros
  - Request bodies
  - Response schemas

### 8. 🏭 Build de Produção
- Tenta compilar o projeto com TypeScript
- Identifica erros de compilação
- Inclui resultado no relatório

### 9. 📊 Relatório de Integridade
- Compila todas as informações coletadas
- Gera relatório final em `.elevare_validation_report/final_report.txt`
- Inclui:
  - Timestamp da execução
  - Problemas de lint
  - Status de dependências
  - Resumo de segurança
  - Estimativa de conclusão automatizada (75-80%)

### 10. 🔄 Pull Request Automático
- Comita todas as alterações
- Push para a nova branch
- Cria Pull Request automaticamente
- Inclui descrição completa das mudanças

## Estrutura de Arquivos

```
.
├── .github/
│   └── workflows/
│       └── elevare-super-agent.yml          # Workflow principal
├── scripts/
│   ├── generate-dtos.js                      # Gerador de DTOs
│   ├── security-hardening.js                 # Verificações de segurança
│   └── generate-swagger.js                   # Gerador de Swagger
├── elevare_auto_fix.sh                       # Harmonização de código
└── vsc_adiante.sh                            # Verificações adicionais
```

## Arquivos Gerados

### Durante a Execução

```
.elevare_validation_report/
├── final_report.txt                          # Relatório principal
└── security-report.txt                       # Relatório de segurança

src/
├── docs/
│   ├── swagger.json                          # Especificação OpenAPI 3.0
│   └── API.md                                # Documentação em Markdown
└── modules/
    └── */dto/
        └── create-*.dto.ts                   # DTOs auto-gerados

.depcheck.json                                # Análise de dependências
.elevare_current_auto_branch                  # Nome da branch atual
```

### Adicionados ao .gitignore

```
.elevare_current_auto_branch
.elevare_validation_report/
.depcheck.json
```

## Scripts Detalhados

### elevare_auto_fix.sh

Valida a estrutura do código:
- Verifica decoradores `@Controller` em controllers
- Verifica decoradores `@Injectable` em services
- Lista rotas encontradas
- Identifica problemas estruturais

### vsc_adiante.sh

Execuções complementares:
- Remove arquivos temporários (*.log, .DS_Store)
- Verifica configurações ESLint e Prettier
- Conta módulos e testes
- Valida arquivos de configuração essenciais

### generate-dtos.js

Geração inteligente de DTOs:
- Encontra todas as entidades TypeORM
- Extrai propriedades e tipos
- Aplica validadores apropriados por tipo
- Pula entidades sem propriedades
- Não sobrescreve DTOs existentes

### security-hardening.js

Verificações de segurança:
- Arquivo .env no repositório (HIGH)
- .env não está no .gitignore (MEDIUM)
- Credenciais hardcoded (HIGH)
- Helmet não instalado (MEDIUM)
- CORS não configurado (MEDIUM)
- Rate limiting não configurado (LOW)

### generate-swagger.js

Documentação automática:
- Parse de todos os controllers
- Extração de rotas e métodos
- Geração de especificação OpenAPI 3.0
- Criação de documentação Markdown
- Agrupamento por tags/controllers

## Percentual de Automação

**75-80%** do trabalho é automatizado:

### ✅ Automatizado (75-80%)
- Formatação de código
- Linting e correções automáticas
- Gerenciamento de dependências
- Geração de DTOs básicos
- Documentação Swagger
- Verificações de segurança
- Build e validação

### 🔧 Necessita Intervenção Manual (20-25%)
- Lógica de negócio complexa
- Validações customizadas nos DTOs
- Correção de erros de compilação específicos
- Implementação de melhorias de segurança
- Testes unitários e de integração
- Review e merge do PR

## Requisitos

- Node.js 20+
- npm
- Git
- Acesso de escrita ao repositório
- Permissões: `contents: write`, `pull-requests: write`

## Limitações e Considerações

1. **Dependências**: O workflow usa `--legacy-peer-deps` devido a conflitos de peer dependencies no projeto
2. **Erros de Build**: O build pode falhar devido a erros TypeScript pré-existentes; isso não impede o workflow
3. **Depcheck**: A remoção de dependências é conservadora para evitar remover pacotes usados dinamicamente
4. **DTOs**: Os DTOs gerados são básicos e podem precisar de refinamento manual
5. **Segurança**: As verificações de segurança são básicas; considere ferramentas adicionais para análise profunda

## Troubleshooting

### Workflow falha na instalação
- Verifique se o `package.json` está válido
- Confirme que as dependências estão disponíveis no npm

### DTOs não são gerados
- Verifique se as entidades têm decoradores TypeORM corretos
- Confirme que as entidades estão em `*/entities/*.entity.ts`

### Build falha
- Isso é esperado se houver erros TypeScript pré-existentes
- Verifique o relatório para detalhes dos erros

### PR não é criado
- Verifique as permissões do repositório
- Confirme que há mudanças para commitar

## Contribuindo

Para melhorar o ELEVARE SUPER-AGENT:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente melhorias nos scripts
4. Teste localmente
5. Submeta um Pull Request

## Suporte

Para questões ou problemas:
- Abra uma issue no GitHub
- Consulte os logs do workflow em Actions
- Revise o relatório gerado em `.elevare_validation_report/`

## Licença

Este projeto segue a mesma licença do repositório principal.

---

**ELEVARE SUPER-AGENT** - Automação inteligente para desenvolvimento ágil 🚀
