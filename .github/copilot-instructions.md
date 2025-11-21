# Copilot Instructions for meu-backend

## Project Overview

This is a NestJS backend application with Firebase integration for the Elevare Atendimento platform. The application provides REST APIs for managing leads, authentication, and health checks.

**Technology Stack:**
- **Framework:** NestJS (TypeScript)
- **Runtime:** Node.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Logging:** Pino (nestjs-pino)
- **Testing:** Jest with ts-jest
- **Validation:** class-validator, class-transformer

## Code Style and Conventions

### TypeScript
- Use **strict mode** enabled (tsconfig.json)
- Always use **explicit types** for function parameters and return values
- Use **interfaces** for DTOs and data structures
- Enable **decorators** (experimentalDecorators, emitDecoratorMetadata)
- Target: ES2020, module: commonjs

### NestJS Patterns
- Use **dependency injection** via constructors
- Apply **decorators** for controllers (@Controller, @Post, @Get, etc.)
- Organize code by **feature modules** (e.g., leads/, health/, firestore/)
- Use **DTOs** for request/response validation
- Implement **services** for business logic
- Use **guards** for authentication/authorization

### File Naming
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- Tests: `*.spec.ts`
- Interfaces: `*.interface.ts`
- Guards: `*.guard.ts`

### Code Organization
- Keep related files together in feature directories (e.g., `src/leads/`)
- Separate concerns: controllers handle HTTP, services contain business logic
- Place shared configuration in `src/config/`
- Use barrel exports where appropriate

### Comments
- Use Portuguese for comments when they explain business logic (e.g., `// SEGURANÇA: Helmet - protege contra vulnerabilidades conhecidas`)
- Use English for technical/standard patterns
- Add comments for security-critical code
- Document complex business logic

## Security Guidelines

### Critical Security Practices
1. **Never commit secrets** - use environment variables via .env
2. **Always validate inputs** - use ValidationPipe with DTOs
3. **Use helmet** middleware for HTTP security headers
4. **Enable CORS** restrictively - only allow specified origins
5. **Use Firebase Auth** for authentication
6. **Implement rate limiting** using @nestjs/throttler
7. **Sanitize user inputs** - whitelist and forbidNonWhitelisted in ValidationPipe

### Authentication
- Use `FirebaseAuthGuard` for protected routes
- Validate JWT tokens from Firebase
- Never expose service account credentials
- Use `@UseGuards(FirebaseAuthGuard)` decorator on protected controllers/routes

### Environment Variables
- Always use `ConfigService` to access environment variables
- Validate environment variables using Joi schema in `src/config/config.schema.ts`
- Reference `.env.example` for all required variables
- Never hardcode sensitive values

## Testing Expectations

### Test Structure
- Place tests alongside the files they test (e.g., `leads.service.spec.ts` next to `leads.service.ts`)
- Use Jest with ts-jest preset
- Follow the pattern: describe → it/test blocks
- Mock external dependencies (Firebase, HTTP clients)

### Test Naming
- Use descriptive test names in Portuguese or English
- Structure: "should [expected behavior] when [condition]"
- Example: `it('should create lead successfully', ...)`

### Coverage
- Aim for testing business logic in services
- Test error handling paths
- Mock Firebase Admin SDK calls
- Test validation logic in DTOs

### Running Tests
```bash
npm test
```

## Development Workflow

### Build Process
```bash
# Build TypeScript to JavaScript
npm run build

# Output directory: dist/
```

### Development Server
```bash
# Build and watch for changes
npm run start:dev
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in Firebase credentials and configuration
3. Set appropriate ALLOWED_ORIGINS for CORS
4. Configure LOG_LEVEL for debugging

### Dependencies
- Use `npm install` to add new dependencies
- Check for security vulnerabilities before adding packages
- Keep dependencies updated but test thoroughly

## Common Patterns

### Creating a New Feature Module
1. Create a directory: `src/feature-name/`
2. Add module: `feature-name.module.ts`
3. Add controller: `feature-name.controller.ts`
4. Add service: `feature-name.service.ts`
5. Add DTOs/interfaces as needed
6. Add tests: `*.spec.ts` files
7. Import module in `app.module.ts`

### Error Handling
```typescript
try {
  // Business logic
} catch (error: any) {
  throw new HttpException(
    error?.message || 'Default error message',
    error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

### Logging
```typescript
// Inject PinoLogger in constructor
constructor(private readonly logger: PinoLogger) {}

// Use throughout service
this.logger.log('Information message');
this.logger.error('Error message', error);
this.logger.warn('Warning message');
```

### Firebase Integration
```typescript
// Import Firebase Admin
import * as admin from 'firebase-admin';

// Access Firestore
const db = admin.firestore();
const collection = db.collection('collection-name');

// Always handle Firebase errors
```

### DTOs and Validation
```typescript
// Use interfaces for simple DTOs
interface CreateLeadDto {
  nome: string;
  phone: string;
  clinicId?: string;
  origem?: string;
}

// Use class-validator for complex validation
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nome: string;
  
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
}
```

## API Response Format

### Success Response
```typescript
return {
  success: true,
  data: result,
};
```

### Error Response
- Use `HttpException` with appropriate status codes
- Provide meaningful error messages
- Log errors for debugging

## Deployment

- Application is containerized (see `Dockerfile`)
- Deployed to Google Cloud Run
- See `CHECKLIST_DEPLOY.md` and `GUIA_DEPLOY_COMPLETO.md` for deployment procedures
- Use `cloudbuild.yml` for CI/CD

## Documentation Files

- **README.md** - Main project documentation
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policies
- **CHECKLIST_DEPLOY.md** - Deployment checklist
- **GUIA_DEPLOY_COMPLETO.md** - Complete deployment guide
- **README_DEV.md** - Developer-specific documentation

## Best Practices for Copilot Tasks

### Suitable Tasks
- Adding new API endpoints following existing patterns
- Writing tests for existing services/controllers
- Improving error handling
- Adding validation to DTOs
- Updating documentation
- Fixing bugs with clear reproduction steps
- Adding logging statements
- Refactoring for code quality

### Tasks Requiring Human Review
- Security-critical changes (authentication, authorization)
- Firebase configuration changes
- Environment variable changes
- Deployment configuration
- Major architectural changes
- Database schema changes

### Before Making Changes
1. Understand the existing patterns in the codebase
2. Check for similar implementations
3. Follow NestJS best practices
4. Ensure changes don't break existing functionality
5. Add or update tests as needed
6. Update documentation if adding new features

## Project-Specific Notes

- **Service Name:** elevare-atendimento-backend (referenced in logger base config)
- **Default Port:** 3000 (configurable via PORT env var)
- **Main Entry Point:** `src/main.ts`
- **Health Check:** Available at `/health` endpoint
- **CORS:** Configured to allow specific origins from ALLOWED_ORIGINS env var
- **Graceful Shutdown:** Implemented with SIGTERM handler

## When in Doubt

- Follow existing patterns in the codebase
- Check NestJS documentation: https://docs.nestjs.com/
- Reference Firebase Admin SDK docs: https://firebase.google.com/docs/admin/setup
- Ask for clarification on business logic requirements
- Prioritize security and validation
