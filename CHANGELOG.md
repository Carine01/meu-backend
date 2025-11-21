# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- ESLint e Prettier para padronização de código
- Pre-commit hooks com Husky e lint-staged
- Dependabot para atualizações automáticas de dependências
- Cobertura de testes no pipeline CI
- Testes em múltiplas versões do Node.js (18, 20)
- Cache de dependências no workflow CI
- CONTRIBUTING.md expandido com guia completo
- CHANGELOG.md para rastreamento de mudanças
- Badges no README (CI, Deploy, Licença)
- Scripts de lint e format no package.json

### Alterado
- README.md melhorado com documentação completa
- Workflow CI separado em jobs de lint e testes
- .gitignore expandido com mais padrões
- Código formatado seguindo padrão Prettier

### Corrigido
- Tipos TypeScript melhorados (menos uso de `any`)
- Imports corrigidos em testes
- Formatação de código consistente

## [1.0.0] - 2025-11-21

### Adicionado
- Backend NestJS com integração Firebase
- Autenticação Firebase
- Módulo Firestore para persistência
- Módulo de Leads com integração IARA
- Health checks (/health, /health/liveness)
- Logging estruturado com Pino
- Segurança com Helmet
- Rate limiting com Throttler
- Validação de DTOs com class-validator
- Dockerfile otimizado multi-stage
- Deploy automático para Google Cloud Run
- CI/CD com GitHub Actions
- Documentação completa de produção
- Testes unitários com Jest
- Configuração de ambiente com Joi
- Graceful shutdown

### Segurança
- Firebase Admin SDK inicialização segura
- Validação de entrada global
- CORS configurável
- Helmet para proteção de headers
- Rate limiting
- Usuário não-root no Docker
- Secrets gerenciados pelo Google Secret Manager

[Não Lançado]: https://github.com/Carine01/meu-backend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Carine01/meu-backend/releases/tag/v1.0.0
