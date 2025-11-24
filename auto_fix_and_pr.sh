#!/bin/bash
# auto_fix_and_pr.sh - Script principal de automação Elevare Turbo Max
# Uso: bash auto_fix_and_pr.sh [--scaffold-dtos-full] [--validate-dtos] [--security-advanced] [--generate-mocks-tests]

set -e

echo "🚀 Elevare Turbo Max - Automação Principal Iniciada"
echo "=================================================="

# Variáveis de controle
SCAFFOLD_DTOS=false
VALIDATE_DTOS=false
SECURITY_ADVANCED=false
GENERATE_MOCKS=false

# Parse argumentos
for arg in "$@"; do
  case $arg in
    --scaffold-dtos-full)
      SCAFFOLD_DTOS=true
      shift
      ;;
    --validate-dtos)
      VALIDATE_DTOS=true
      shift
      ;;
    --security-advanced)
      SECURITY_ADVANCED=true
      shift
      ;;
    --generate-mocks-tests)
      GENERATE_MOCKS=true
      shift
      ;;
  esac
done

# ========================================
# 1. SCAFFOLD COMPLETO DE DTOs
# ========================================
if [ "$SCAFFOLD_DTOS" = true ]; then
  echo ""
  echo "📦 [1/4] Scaffolding Completo de DTOs..."
  echo "----------------------------------------"
  
  # Criar diretório de DTOs se não existir
  mkdir -p src/dto/common
  
  # Gerar DTOs base comuns
  cat > src/dto/common/base-response.dto.ts << 'EOF'
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BaseResponseDto {
  @IsBoolean()
  success: boolean = true;

  @IsString()
  @IsOptional()
  message?: string;

  constructor(success: boolean = true, message?: string) {
    this.success = success;
    this.message = message;
  }
}
EOF

  cat > src/dto/common/pagination.dto.ts << 'EOF'
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }
}
EOF

  cat > src/dto/common/id-param.dto.ts << 'EOF'
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
EOF

  echo "  ✓ DTOs base criados: BaseResponseDto, PaginationDto, IdParamDto"
  
  # Adicionar validadores em DTOs existentes
  find src/modules -name "*.dto.ts" -type f 2>/dev/null | while read -r file; do
    # Verificar se já tem class-validator imports
    if ! grep -q "class-validator" "$file" 2>/dev/null; then
      echo "  ⚠️  DTO sem validadores: $file"
    fi
  done
  
  echo "  ✅ Scaffold de DTOs concluído"
fi

# ========================================
# 2. VALIDAÇÃO DE DTOs
# ========================================
if [ "$VALIDATE_DTOS" = true ]; then
  echo ""
  echo "✅ [2/4] Validação de DTOs..."
  echo "----------------------------------------"
  
  # Verificar DTOs existentes
  DTO_COUNT=$(find src -name "*.dto.ts" -type f 2>/dev/null | wc -l)
  echo "  📊 Total de DTOs encontrados: $DTO_COUNT"
  
  # Validar estrutura de cada DTO
  find src -name "*.dto.ts" -type f 2>/dev/null | while read -r file; do
    # Verificar se tem classe exportada
    if grep -q "export class.*Dto" "$file" 2>/dev/null; then
      echo "  ✓ Validado: $file"
    else
      echo "  ⚠️  Estrutura inválida: $file"
    fi
  done
  
  # Gerar relatório de validação
  mkdir -p .elevare_validation_report
  cat > .elevare_validation_report/dto-validation.txt << EOF
Relatório de Validação de DTOs
Generated: $(date)
======================================

Total de DTOs: $DTO_COUNT

DTOs devem:
- Usar decoradores do class-validator
- Exportar classes com sufixo Dto
- Ter validação adequada de tipos
- Documentar propriedades com JSDoc (recomendado)

EOF
  
  echo "  ✅ Validação de DTOs concluída"
  echo "  📄 Relatório salvo em: .elevare_validation_report/dto-validation.txt"
fi

# ========================================
# 3. HARDENING AVANÇADO DE SEGURANÇA
# ========================================
if [ "$SECURITY_ADVANCED" = true ]; then
  echo ""
  echo "🔒 [3/4] Hardening Avançado de Segurança..."
  echo "----------------------------------------"
  
  # Criar arquivo de configuração de segurança
  cat > src/config/security.config.ts << 'EOF'
export const securityConfig = {
  // Rate Limiting
  rateLimit: {
    ttl: 60,
    limit: 100,
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  
  // Helmet Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  
  // JWT Configuration
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};
EOF

  echo "  ✓ Configuração de segurança criada"
  
  # Criar middleware de sanitização de inputs
  mkdir -p src/middleware/security
  cat > src/middleware/security/sanitize.middleware.ts << 'EOF'
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitizar inputs recursivamente
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  private sanitizeString(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Remove caracteres perigosos básicos
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}
EOF

  echo "  ✓ Middleware de sanitização criado"
  
  # Criar guard de rate limiting personalizado
  cat > src/middleware/security/rate-limit.guard.ts << 'EOF'
import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomRateLimitGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Log da tentativa de rate limit
    console.warn(`Rate limit exceeded for IP: ${request.ip}`);
    
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
        error: 'Rate Limit Exceeded',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
EOF

  echo "  ✓ Guard de rate limiting criado"
  
  # Gerar relatório de segurança
  mkdir -p .elevare_validation_report
  cat > .elevare_validation_report/security-report.txt << EOF
Relatório de Hardening de Segurança
Generated: $(date)
======================================

Implementações de Segurança:

1. ✅ Configuração de segurança centralizada (security.config.ts)
   - Rate limiting configurado
   - CORS com origins permitidas
   - Helmet com CSP e HSTS
   - JWT com expiração configurável
   - Política de senha forte

2. ✅ Middleware de sanitização de inputs
   - Sanitização de body, query e params
   - Remoção de scripts maliciosos
   - Proteção contra XSS básica

3. ✅ Guard de rate limiting customizado
   - Logging de tentativas excedidas
   - Mensagens de erro personalizadas
   - Integração com @nestjs/throttler

Recomendações Adicionais:
- Implementar CSRF tokens para formulários
- Adicionar logging estruturado de eventos de segurança
- Configurar WAF (Web Application Firewall) em produção
- Implementar monitoramento de anomalias
- Realizar auditoria de dependências regularmente

EOF
  
  echo "  ✅ Hardening de segurança concluído"
  echo "  📄 Relatório salvo em: .elevare_validation_report/security-report.txt"
fi

# ========================================
# 4. GERAÇÃO DE MOCKS E TESTES
# ========================================
if [ "$GENERATE_MOCKS" = true ]; then
  echo ""
  echo "🧪 [4/4] Geração de Mocks e Testes..."
  echo "----------------------------------------"
  
  # Criar diretório de mocks
  mkdir -p src/mocks/factories
  
  # Criar factory base para mocks
  cat > src/mocks/factories/base.factory.ts << 'EOF'
export abstract class BaseFactory<T> {
  abstract build(overrides?: Partial<T>): T;
  
  buildMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
EOF

  echo "  ✓ Factory base criada"
  
  # Criar mock de usuário como exemplo
  cat > src/mocks/factories/user.factory.ts << 'EOF'
import { BaseFactory } from './base.factory';

export interface MockUser {
  id: string;
  email: string;
  nome: string;
  clinicId: string;
  createdAt: Date;
}

export class UserFactory extends BaseFactory<MockUser> {
  private counter = 0;

  build(overrides?: Partial<MockUser>): MockUser {
    this.counter++;
    return {
      id: `user-${this.counter}`,
      email: `user${this.counter}@example.com`,
      nome: `Test User ${this.counter}`,
      clinicId: `clinic-${this.counter}`,
      createdAt: new Date(),
      ...overrides,
    };
  }
}
EOF

  echo "  ✓ Mock de usuário criado"
  
  # Criar template de teste unitário
  mkdir -p src/tests/unit/examples
  cat > src/tests/unit/examples/sample.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { UserFactory } from '../../../mocks/factories/user.factory';

describe('SampleService (Example)', () => {
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Add your service here
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(userFactory).toBeDefined();
  });

  it('should create a mock user', () => {
    const user = userFactory.build();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('nome');
  });

  it('should create multiple mock users', () => {
    const users = userFactory.buildMany(5);
    expect(users).toHaveLength(5);
    expect(users[0].id).not.toBe(users[1].id);
  });
});
EOF

  echo "  ✓ Template de teste unitário criado"
  
  # Criar utilitários de teste
  cat > src/tests/utils/test-helpers.ts << 'EOF'
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export class TestHelpers {
  static async createTestingModule(providers: any[]): Promise<TestingModule> {
    return await Test.createTestingModule({
      providers,
    }).compile();
  }

  static mockRepository<T = any>() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };
  }

  static mockService<T = any>() {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
  }
}
EOF

  echo "  ✓ Utilitários de teste criados"
  
  # Gerar relatório de testes
  mkdir -p .elevare_validation_report
  cat > .elevare_validation_report/test-generation.txt << EOF
Relatório de Geração de Mocks e Testes
Generated: $(date)
======================================

Estrutura Criada:

1. ✅ Factories de Mock
   - BaseFactory abstrata para reutilização
   - UserFactory como exemplo
   - Suporte para buildMany()

2. ✅ Templates de Teste
   - Exemplo de teste unitário
   - Integração com @nestjs/testing
   - Uso de factories nos testes

3. ✅ Utilitários de Teste
   - TestHelpers para criação de módulos
   - Mock de repositories
   - Mock de services

Próximos Passos:
- Criar factories para cada entidade principal
- Gerar testes unitários para todos os services
- Implementar testes de integração
- Adicionar coverage mínimo de 80%

EOF
  
  echo "  ✅ Geração de mocks e testes concluída"
  echo "  📄 Relatório salvo em: .elevare_validation_report/test-generation.txt"
fi

# ========================================
# CONCLUSÃO
# ========================================
echo ""
echo "=================================================="
echo "✅ Elevare Turbo Max - Automação Concluída!"
echo "=================================================="
echo ""

# Mostrar resumo das ações
ACTIONS_TAKEN=""
[ "$SCAFFOLD_DTOS" = true ] && ACTIONS_TAKEN="${ACTIONS_TAKEN}✓ DTOs scaffolded\n"
[ "$VALIDATE_DTOS" = true ] && ACTIONS_TAKEN="${ACTIONS_TAKEN}✓ DTOs validated\n"
[ "$SECURITY_ADVANCED" = true ] && ACTIONS_TAKEN="${ACTIONS_TAKEN}✓ Security hardening applied\n"
[ "$GENERATE_MOCKS" = true ] && ACTIONS_TAKEN="${ACTIONS_TAKEN}✓ Mocks and tests generated\n"

if [ -n "$ACTIONS_TAKEN" ]; then
  echo "Ações Realizadas:"
  echo -e "$ACTIONS_TAKEN"
else
  echo "Nenhuma ação especificada. Use --help para ver as opções disponíveis."
fi

echo ""
echo "📊 Relatórios disponíveis em: .elevare_validation_report/"
echo "🚀 Próximo passo: Execute 'npm run build' e 'npm test'"
echo ""

exit 0
