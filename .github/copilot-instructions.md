# GitHub Copilot Instructions for meu-backend

## Project Overview

This is the **Elevare Atendimento Backend** (also known as Stalkspot), a NestJS-based backend application with Firebase integration for authentication and Firestore for data storage. The backend provides APIs for lead management and integrates with external services.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18.x
- **Authentication**: Firebase Admin SDK 13.6.0
- **Database**: Firebase Firestore
- **Testing**: Jest 29.x with ts-jest
- **Key Dependencies**:
  - `firebase-admin`: Firebase Admin SDK for authentication and Firestore
  - `axios`: HTTP client for external API calls
  - `helmet`: Security middleware
  - `class-validator` & `class-transformer`: DTO validation
  - `bcrypt`: Password hashing
  - `nestjs-pino`: Logging with Pino
  - `joi`: Environment variable validation

## Commands

### Development
```bash
npm install              # Install dependencies
npm run start:dev        # Start in development mode with auto-reload (compiles and uses nodemon)
npm run build            # Build TypeScript to dist/ folder
npm run start            # Start production server (requires build first)
```

### Testing
```bash
npm run test             # Run all tests with Jest
```

### Linting
- There is no dedicated linting command configured yet. Follow TypeScript strict mode rules.

### Docker
```bash
docker build -t elevare-backend .
docker run -p 3000:3000 elevare-backend
```

## Project Structure

```
meu-backend/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root NestJS module
│   ├── config/                      # Configuration modules
│   ├── firebase-auth.service.ts     # Firebase authentication service
│   ├── firebase-auth.guard.ts       # Auth guard for protected routes
│   ├── firebaseAdmin.ts             # Firebase Admin SDK initialization
│   ├── auth-test.controller.ts      # Test endpoint for authentication
│   ├── firestore/                   # Firestore operations
│   ├── leads/                       # Leads management module
│   ├── health/                      # Health check endpoints
│   └── test/                        # Test setup files
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # CI pipeline (build and test)
│   │   └── deploy.yml               # Deployment pipeline
│   └── copilot-instructions.md      # This file
├── k8s/                             # Kubernetes deployment configs
├── frontend/                        # Frontend static files (if any)
├── .env.example                     # Example environment variables
├── Dockerfile                       # Docker configuration
├── jest.config.js                   # Jest test configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

### Key Files

- **`src/firebaseAdmin.ts`**: Initializes Firebase Admin SDK using service account credentials from environment variables or file path
- **`src/firebase-auth.service.ts`**: Service for verifying Firebase ID tokens
- **`src/firebase-auth.guard.ts`**: Guard to protect routes requiring Firebase authentication
- **`src/leads/leads.service.ts`**: Business logic for lead management with retry mechanism for external API calls
- **`.env.example`**: Template for required environment variables

## Environment Variables

Required environment variables (see `.env.example` for full list):

- `PORT`: Server port (default: 3000)
- `IARA_EDGE_URL`: External IARA service URL (optional)
- `IARA_SECRET`: Secret for IARA service authentication (optional)
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Firebase service account JSON content (as string), OR
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Firebase service account JSON file

**Security Note**: Never commit Firebase service account files or credentials to the repository.

## Code Style and Conventions

### General Guidelines

1. **Follow NestJS conventions**: Use decorators, dependency injection, and modular architecture
2. **TypeScript strict mode**: All code must pass TypeScript strict mode checks
3. **Use DTOs**: Create DTO classes with `class-validator` decorators for request validation
4. **Dependency Injection**: Use NestJS's DI container, avoid manual instantiation
5. **Async/Await**: Use async/await for asynchronous operations, not callbacks
6. **Error Handling**: Use NestJS exception filters and custom exceptions
7. **Logging**: Use the Pino logger (via `nestjs-pino`), not `console.log`

### File Naming

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Guards: `*.guard.ts`
- Modules: `*.module.ts`
- DTOs: `*.dto.ts`
- Tests: `*.spec.ts`

### Code Examples

#### Controller Example
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('protected')
@UseGuards(FirebaseAuthGuard)
export class ProtectedController {
  @Get()
  async getData() {
    return { message: 'Protected data' };
  }
}
```

#### Service Example
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  async findAll() {
    // Implementation
    return [];
  }
}
```

#### DTO Example
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
```

### Commit Messages

Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions or modifications
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

Examples:
- `feat: adicionar endpoint de busca de leads`
- `fix: corrigir validação de token Firebase`
- `docs: atualizar README com instruções de deploy`

## Testing Approach

### Test Structure

- **Unit Tests**: Test services and business logic in isolation
- **Controller Tests**: Test HTTP endpoints with mocked services
- **Test Files**: Co-located with source files as `*.spec.ts`
- **Test Framework**: Jest with ts-jest preset

### Test Guidelines

1. **Mock External Dependencies**: Mock Firebase Admin SDK, external APIs, and Firestore
2. **Test Coverage**: Aim for comprehensive coverage of business logic
3. **Test Naming**: Use descriptive test names that explain what is being tested
4. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification phases

### Test Example

```typescript
describe('LeadsService', () => {
  let service: LeadsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should create a lead successfully', async () => {
    // Arrange
    const dto = { name: 'Test', email: 'test@example.com' };
    
    // Act
    const result = await service.createLead(dto);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Running Tests

```bash
npm run test           # Run all tests
npm run test -- --coverage  # Run with coverage report
```

## Git Workflow

### Branch Strategy

- **`main`**: Production branch, protected
- **Feature branches**: Create from `main` using descriptive names
  - Format: `feature/description` or `fix/description` or `copilot/description`
  
### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, atomic commits
3. Ensure all tests pass locally
4. Push to your branch and open a Pull Request
5. PR must pass CI checks (build and tests) before merging
6. Get code review approval
7. Merge to `main` (typically using squash merge)

### CI/CD

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs on PRs and pushes to `main`
  - Installs dependencies
  - Runs tests
  - Uses Node.js 18.x
  
- **Deploy Pipeline** (`.github/workflows/deploy.yml`): Handles deployment to production

## Security and Boundaries

### Security Best Practices

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Firebase Service Account**: Store service account JSON in secure secret managers, not in code
3. **Environment Variables**: Use `.env` files locally (gitignored), secrets in production
4. **Input Validation**: Always validate user input with `class-validator` decorators
5. **Authentication**: Protect sensitive routes with `FirebaseAuthGuard`
6. **Helmet**: Security headers are configured via `helmet` middleware
7. **Rate Limiting**: Throttling is configured via `@nestjs/throttler`

### Files and Directories to Avoid Changing

- **DO NOT modify or delete**:
  - `.git/`: Git internal files
  - `node_modules/`: Dependencies (managed by npm)
  - `dist/`: Build output (generated by TypeScript compiler)
  - `coverage/`: Test coverage reports (generated by Jest)
  - Firebase service account JSON files (should not exist in repo)

- **Modify with caution**:
  - `package.json`: Only add/update dependencies when necessary
  - `tsconfig.json`: TypeScript configuration is well-tuned
  - `jest.config.js`: Test configuration is working correctly
  - `.github/workflows/`: CI/CD pipelines are production-critical
  - `Dockerfile`: Docker configuration for production deployment
  - `k8s/`: Kubernetes manifests for production infrastructure

### What to Avoid

- ❌ Don't commit `.env` files with real credentials
- ❌ Don't commit `node_modules/` or `dist/` folders
- ❌ Don't use `console.log()` for logging (use Pino logger)
- ❌ Don't make breaking changes to authentication mechanisms
- ❌ Don't modify Firebase Admin SDK initialization without testing thoroughly
- ❌ Don't remove or disable security middleware (helmet, throttler)
- ❌ Don't expose internal errors to API responses (use proper exception handling)

## Additional Documentation

- Main README: `README.md` - Basic setup and usage
- Developer Guide: `README_DEV.md` - Detailed development setup, especially Firebase
- Contributing Guide: `CONTRIBUTING.md` - How to contribute
- Deployment Guide: `CHECKLIST_DEPLOY.md` - Production deployment checklist
- Full Deployment Guide: `GUIA_DEPLOY_COMPLETO.md` - Complete deployment instructions

## Common Tasks for Copilot

### Adding a New Endpoint

1. Create or update a controller in the appropriate module
2. Add DTOs for request/response validation
3. Implement business logic in a service
4. Add guard if authentication is required
5. Write unit tests for the service and controller
6. Update documentation if needed

### Adding a New Module

1. Create a new directory under `src/`
2. Create module file: `*.module.ts`
3. Create service: `*.service.ts` with business logic
4. Create controller: `*.controller.ts` with HTTP endpoints
5. Create DTOs: `*.dto.ts` for validation
6. Write tests: `*.spec.ts` for service and controller
7. Import module in `app.module.ts`

### Debugging Authentication Issues

1. Check Firebase service account credentials are properly set in environment
2. Verify `firebaseAdmin.ts` initialization logs
3. Test with `/auth-test` endpoint using a valid Firebase ID token
4. Check token format: `Authorization: Bearer <ID_TOKEN>`
5. Ensure token is not expired
6. Review `firebase-auth.service.ts` for token verification logic

### Working with External APIs

- Check `leads.service.ts` for retry mechanism examples
- Use `@nestjs/axios` for HTTP requests
- Implement proper error handling and retry logic
- Mock external APIs in tests

---

## Questions or Issues?

If you encounter any issues or have questions:
1. Check the documentation files in the repository root
2. Review existing code for patterns and examples
3. Ensure environment variables are properly configured
4. Check CI/CD pipeline logs for build/test failures
5. Contact: Carine01 (@Carine01)
