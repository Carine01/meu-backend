# Instruções para Backend API (NestJS)

## Arquitetura do Backend

### Estrutura de Módulos NestJS
```
src/
├── modules/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── users.service.spec.ts
│   └── [outros módulos]
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
├── shared/
│   ├── interfaces/
│   ├── types/
│   └── constants/
└── config/
```

## Padrões de Desenvolvimento

### 1. Controllers

**Responsabilidade**: Gerenciar requisições HTTP e respostas

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query() queryDto: PaginationDto,
  ): Promise<PaginatedResponse<User>> {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
```

### 2. Services

**Responsabilidade**: Lógica de negócio

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(queryDto: PaginationDto): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10 } = queryDto;
    const [items, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
```

### 3. DTOs (Data Transfer Objects)

**Responsabilidade**: Validação e transformação de dados

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 4. Entities

**Responsabilidade**: Modelagem de dados do banco

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

## Guards e Autenticação

### JWT Auth Guard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

### Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## Interceptors

### Logging Interceptor
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
```

## Error Handling

### Custom Exception Filter
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }
}
```

## Boas Práticas

### 1. Validação
- **SEMPRE** valide entradas com class-validator
- Use pipes de validação em controllers
- Crie validações customizadas quando necessário

### 2. Segurança
- Use Guards para autenticação e autorização
- Sanitize inputs para prevenir SQL injection
- Implemente rate limiting
- Use Helmet para headers HTTP seguros
- Nunca exponha senhas ou dados sensíveis

### 3. Performance
- Use caching (Redis) para dados frequentemente acessados
- Implemente paginação em listas
- Use índices apropriados no banco de dados
- Lazy loading para relações grandes

### 4. Logging
- Use logger estruturado (pino)
- Log erros com contexto adequado
- Não logue informações sensíveis
- Configure níveis de log apropriados

### 5. TypeORM
- Use migrations para mudanças no schema
- Evite queries N+1 com joins apropriados
- Use transactions para operações múltiplas
- Implemente soft deletes quando apropriado

**Exemplo de prevenção N+1:**
```typescript
// ❌ N+1 Problem
const users = await userRepository.find();
for (const user of users) {
  user.posts = await postRepository.find({ where: { userId: user.id } });
}

// ✅ Solution with JOIN
const users = await userRepository.find({
  relations: ['posts'],
});
```

**Exemplo de Transaction:**
```typescript
await this.dataSource.transaction(async (manager) => {
  const user = await manager.save(User, userData);
  const profile = await manager.save(Profile, { ...profileData, userId: user.id });
  await manager.save(Audit, { action: 'USER_CREATED', userId: user.id });
});
```

### 6. Documentação API
- Use decorators do Swagger (@ApiProperty, @ApiOperation)
- Documente todos os endpoints
- Inclua exemplos de requisição/resposta
- Mantenha documentação atualizada

## Testes

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Mais testes...
});
```

## Checklist de Desenvolvimento

- [ ] Controller implementado com decorators corretos
- [ ] Service contém lógica de negócio
- [ ] DTOs com validações apropriadas
- [ ] Entity mapeada corretamente para banco
- [ ] Guards aplicados para autenticação
- [ ] Error handling implementado
- [ ] Logging estruturado usado
- [ ] Testes unitários criados
- [ ] Documentação Swagger adicionada
- [ ] Migration criada se necessário
