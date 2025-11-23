# Organização de Testes no Monorepo - Princípios SOLID

## Estrutura de Diretórios

### Backend (API - NestJS)
```
src/
├── modules/
│   ├── auth/
│   │   ├── __tests__/           # Testes do módulo de autenticação
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── auth.controller.spec.ts
│   │   │   └── jwt-auth.guard.spec.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   │
│   ├── rbac/                     # Role-Based Access Control
│   │   ├── __tests__/
│   │   │   ├── rbac.service.spec.ts
│   │   │   └── rbac.guard.spec.ts
│   │   ├── rbac.service.ts
│   │   └── rbac.guard.ts
│   │
│   ├── users/
│   │   ├── __tests__/
│   │   │   └── users.service.spec.ts
│   │   └── users.service.ts
│   │
│   └── bi/                       # Business Intelligence
│       ├── __tests__/
│       │   └── bi.service.spec.ts
│       └── bi.service.ts
│
└── integrations/
    ├── prometheus/
    │   ├── __tests__/
    │   │   └── prometheus.service.spec.ts
    │   └── prometheus.service.ts
    └── webhook/
        ├── __tests__/
        └── webhook.service.ts
```

### Frontend (Web - React)
```
apps/frontend/src/
├── hooks/
│   ├── __tests__/               # Testes de hooks customizados
│   │   ├── useAuth.spec.ts
│   │   ├── useRBAC.spec.ts
│   │   └── usePermissions.spec.ts
│   ├── useAuth.ts
│   └── useRBAC.ts
│
└── components/
    ├── Auth/
    │   ├── __tests__/
    │   │   └── LoginForm.spec.tsx
    │   └── LoginForm.tsx
    └── Admin/
        ├── __tests__/
        └── AdminPanel.tsx
```

## Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- Cada teste tem uma única responsabilidade
- Separe testes unitários de testes de integração
- Um arquivo de teste por serviço/componente

**Exemplo:**
```typescript
// ✅ BOM - Teste focado em uma única responsabilidade
describe('AuthService - login', () => {
  it('deve retornar token JWT válido para credenciais corretas', async () => {
    // teste específico
  });
});

// ❌ RUIM - Teste com múltiplas responsabilidades
describe('AuthService', () => {
  it('deve fazer login, refresh token e logout', async () => {
    // teste muito abrangente
  });
});
```

### 2. Open/Closed Principle (OCP)
- Use interfaces para serviços que podem ter múltiplas implementações
- Crie mocks reutilizáveis

**Exemplo:**
```typescript
// Interface para PrometheusService
export interface IPrometheusService {
  incrementLoginAttempts(user: string): void;
  incrementLoginFailures(user: string): void;
  recordLatency(route: string, duration: number): void;
}

// Mock nos testes
const mockPrometheusService: IPrometheusService = {
  incrementLoginAttempts: jest.fn(),
  incrementLoginFailures: jest.fn(),
  recordLatency: jest.fn(),
};
```

### 3. Liskov Substitution Principle (LSP)
- Mocks devem ser substituíveis pelos serviços reais
- Mantenha a mesma interface entre mock e implementação real

### 4. Interface Segregation Principle (ISP)
- Crie interfaces específicas para cada contexto de teste
- Não force dependências desnecessárias nos testes

### 5. Dependency Inversion Principle (DIP)
- Dependa de abstrações (interfaces), não de implementações concretas
- Use injeção de dependência nos testes

**Exemplo:**
```typescript
// ✅ BOM - Usando injeção de dependência
class AuthService {
  constructor(
    private readonly prometheusService: IPrometheusService,
    private readonly jwtService: JwtService,
  ) {}
}

// No teste
const service = new AuthService(mockPrometheusService, mockJwtService);
```

## Métricas Customizadas com Prometheus

### Backend - Exportando Métricas

```typescript
// src/integrations/prometheus/prometheus.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class PrometheusService {
  private loginAttempts: Counter;
  private loginFailures: Counter;
  private httpDuration: Histogram;
  private refreshTokenFailures: Counter;

  constructor() {
    this.loginAttempts = new Counter({
      name: 'login_attempts_total',
      help: 'Total de tentativas de login',
      labelNames: ['user'],
    });

    this.loginFailures = new Counter({
      name: 'login_failures_total',
      help: 'Total de falhas de login',
      labelNames: ['user'],
    });

    this.httpDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duração das requisições HTTP em ms',
      labelNames: ['route', 'method', 'status'],
      buckets: [50, 100, 200, 500, 1000, 2000, 5000],
    });

    this.refreshTokenFailures = new Counter({
      name: 'refresh_token_failures_total',
      help: 'Total de falhas no refresh token',
    });
  }

  incrementLoginAttempts(user: string): void {
    this.loginAttempts.inc({ user });
  }

  incrementLoginFailures(user: string): void {
    this.loginFailures.inc({ user });
  }

  recordLatency(route: string, duration: number): void {
    this.httpDuration.observe({ route }, duration);
  }

  incrementRefreshTokenFailures(): void {
    this.refreshTokenFailures.inc();
  }

  getMetrics(): Promise<string> {
    return register.metrics();
  }
}
```

### Teste do PrometheusService

```typescript
// src/integrations/prometheus/__tests__/prometheus.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusService } from '../prometheus.service';

describe('PrometheusService', () => {
  let service: PrometheusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrometheusService],
    }).compile();

    service = module.get<PrometheusService>(PrometheusService);
  });

  it('deve incrementar tentativas de login', () => {
    expect(() => service.incrementLoginAttempts('user@test.com')).not.toThrow();
  });

  it('deve retornar métricas', async () => {
    const metrics = await service.getMetrics();
    expect(metrics).toContain('login_attempts_total');
  });
});
```

## CI/CD Pipeline

### Estrutura do Workflow

O arquivo `.github/workflows/ci-cd.yml` executa:

1. **Lint**: Verifica código nas duas aplicações
2. **Testes**: 
   - API: Testes Jest com cobertura para RBAC, autenticação
   - Web: Testes Jest para hooks React
3. **Build**: Compila API e Web
4. **Deploy**: Deploy condicional (apenas na branch main)

### Variáveis de Ambiente

```yaml
env:
  NODE_ENV: test
```

## Grafana Dashboard

### Importando o Dashboard

1. No Grafana, clique em "+" → Import
2. Cole o conteúdo de `observabilidade/grafana-dashboard-auth-rbac.json`
3. Selecione a fonte de dados Prometheus
4. Salve o dashboard

### Painéis Disponíveis

1. **Tentativas de Login por Usuário**: Monitora tentativas de autenticação
2. **Falhas de Login**: Identifica problemas de autenticação
3. **Latência p95 Rotas Protegidas**: Performance de rotas com RBAC
4. **Falhas de Refresh Token**: Problemas na renovação de tokens

## Boas Práticas

### 1. Nomenclatura
- Arquivos de teste: `*.spec.ts` (backend) ou `*.test.tsx` (frontend)
- Diretório de testes: `__tests__/` próximo ao código fonte

### 2. Cobertura de Código
- Mantenha cobertura mínima de 80% para código crítico (auth, RBAC)
- Configure thresholds no `jest.config.js`

### 3. Mocks
- Crie mocks reutilizáveis em `__mocks__/`
- Use factories para criar dados de teste

### 4. Testes de Integração
- Separe testes unitários de testes de integração
- Use banco de dados em memória ou containers para testes de integração

### 5. Continuous Integration
- Execute testes em todos os PRs
- Bloqueie merge se testes falharem
- Gere relatórios de cobertura

## Comandos Úteis

```bash
# Backend (API)
npm run test              # Executar todos os testes
npm run test:cov          # Testes com cobertura
npm run test:watch        # Modo watch

# Frontend (Web)
cd apps/frontend
npm run test              # Executar testes do frontend
npm run lint              # Linting

# Monorepo (com Yarn Workspaces)
yarn test                 # Testa todos os workspaces
yarn workspace @myorg/api test
yarn workspace @myorg/web test
```

## Exemplo: Teste RBAC Avançado

```typescript
// src/modules/rbac/__tests__/rbac.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RBACService } from '../rbac.service';

describe('RBACService', () => {
  let service: RBACService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RBACService],
    }).compile();

    service = module.get<RBACService>(RBACService);
  });

  describe('hasPermission', () => {
    it('deve permitir acesso para admin em qualquer recurso', () => {
      const user = { role: 'admin', id: '1' };
      expect(service.hasPermission(user, 'users', 'delete')).toBe(true);
    });

    it('deve negar acesso para user comum em recurso admin', () => {
      const user = { role: 'user', id: '2' };
      expect(service.hasPermission(user, 'admin/settings', 'read')).toBe(false);
    });

    it('deve permitir acesso para recurso próprio', () => {
      const user = { role: 'user', id: '3' };
      expect(service.hasPermission(user, 'profile/3', 'update')).toBe(true);
    });
  });
});
```

## Referências

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Prometheus Client](https://github.com/siimon/prom-client)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
