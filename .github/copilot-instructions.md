# Instruções do Projeto - Elevare Atendimento Backend

Este é um projeto Node.js/TypeScript com NestJS backend e React frontend.

## Stack Tecnológica

- **Backend**: NestJS, TypeScript, TypeORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Firebase Auth, JWT
- **Cache**: Redis (IORedis)
- **Mensageria**: WhatsApp (Baileys)
- **Frontend**: React (localizado em `/frontend`)

## Antes de cada commit

```bash
npm run build
npm test
```

## Fluxo de Desenvolvimento

### Build
```bash
npm run build
```

### Testes
```bash
npm test                # Executar todos os testes
npm run test:watch      # Modo watch
npm run test:cov        # Com cobertura
npm run test:e2e        # Testes end-to-end
```

### Desenvolvimento
```bash
npm run start:dev       # Ambiente de desenvolvimento
npm start               # Produção
```

### Migrações de Banco de Dados
```bash
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

### Seeds
```bash
npm run seed            # Seed geral
npm run seed:admin      # Seed de admin
```

## Padrões de Código

### Estrutura de Diretórios
- `/src/modules/*` - Módulos funcionais da aplicação
- `/src/core/*` - Funcionalidades core (auth, guards, interceptors)
- `/src/shared/*` - Componentes compartilhados
- `/src/migrations/*` - Migrações do banco de dados
- `/test/*` - Testes unitários e e2e

### Nomenclatura
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Testes**: `*.spec.ts` ou `*.e2e-spec.ts`

### Práticas Recomendadas

1. **Use TypeScript estrito**: Evite `any`, prefira tipos específicos
2. **Validação de DTOs**: Use decorators do `class-validator`
3. **Guards e Interceptors**: Para autenticação e transformação de dados
4. **Error Handling**: Use `@nestjs/common` HttpException ou custom exceptions
5. **Logging**: Use logger estruturado (nestjs-pino) ao invés de console.log
6. **Documentação**: Documente métodos públicos com JSDoc
7. **Testes**: Mantenha cobertura de testes para funcionalidades críticas

## Segurança

- Nunca commitar credenciais ou tokens
- Use variáveis de ambiente (arquivo `.env`)
- Valide todas as entradas do usuário
- Implemente rate limiting onde apropriado
- Use Helmet para headers HTTP seguros

## Contribuindo

1. Crie uma branch a partir de `main`
2. Faça suas alterações
3. Execute testes e build
4. Abra um Pull Request
5. Aguarde revisão de código

## Links Úteis

- [Documentação NestJS](https://docs.nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Firebase Admin](https://firebase.google.com/docs/admin/setup)
