# Instruções para Testes

## Filosofia de Testes

Escreva testes que:
- **Validam comportamento**, não implementação
- **São legíveis** e auto-explicativos
- **São mantíveis** e não frágeis
- **Cobrem casos edge** e cenários de erro

## Estrutura de Testes

### Organização
```
test/
├── e2e/                 # Testes end-to-end
│   └── *.e2e-spec.ts
├── setup.ts             # Configuração global
└── [outras specs]

src/
└── **/*.spec.ts         # Testes unitários próximos ao código
```

## Tipos de Testes

### 1. Testes Unitários

**Objetivo**: Testar unidades isoladas (funções, métodos, classes)

```typescript
describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a profile by id', async () => {
      const mockProfile = { id: '1', name: 'Test' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProfile as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProfile);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when profile not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 2. Testes de Integração

**Objetivo**: Testar interação entre múltiplos componentes

```typescript
describe('AuthController (integration)', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/login (POST) should return JWT token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(typeof res.body.access_token).toBe('string');
      });
  });
});
```

### 3. Testes End-to-End (E2E)

**Objetivo**: Testar fluxos completos da aplicação

```typescript
describe('Lead Management (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obter token de autenticação
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    
    authToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, retrieve, update and delete a lead', async () => {
    // CREATE
    const createResponse = await request(app.getHttpServer())
      .post('/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Lead', phone: '1234567890' })
      .expect(201);

    const leadId = createResponse.body.id;

    // READ
    await request(app.getHttpServer())
      .get(`/leads/${leadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Test Lead');
      });

    // UPDATE
    await request(app.getHttpServer())
      .patch(`/leads/${leadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Lead' })
      .expect(200);

    // DELETE
    await request(app.getHttpServer())
      .delete(`/leads/${leadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

## Boas Práticas

### Nomenclatura
- **describe**: Nome da classe/componente sendo testado
- **it/test**: Deve completar a frase "it should..."
- **Seja específico**: "should return 404 when user not found"

### AAA Pattern (Arrange-Act-Assert)
```typescript
it('should calculate total correctly', () => {
  // Arrange - Preparar dados
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act - Executar ação
  const total = calculateTotal(items);
  
  // Assert - Verificar resultado
  expect(total).toBe(30);
});
```

### Mocks e Stubs
- **Mock**: Substitui dependências externas
- **Spy**: Observa chamadas de função
- **Stub**: Retorna valores fixos

```typescript
// Mock
const mockRepository = {
  find: jest.fn().mockResolvedValue([]),
};

// Spy
const spy = jest.spyOn(service, 'method');

// Stub
jest.spyOn(repository, 'find').mockResolvedValue(mockData);
```

### Cleanup
```typescript
afterEach(() => {
  jest.clearAllMocks();  // Limpa contadores de chamadas
});

afterAll(async () => {
  await app.close();  // Fecha conexões
  await connection.close();
});
```

## Cobertura de Testes

### Objetivos
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Gerar Relatório
```bash
npm run test:cov
```

### O Que Testar

✅ **SEMPRE TESTE**:
- Lógica de negócio
- Validações e transformações
- Casos de erro e exceções
- Regras de autorização
- Cálculos e algoritmos

❌ **NÃO PRECISA TESTAR**:
- Getters/setters simples
- Código gerado automaticamente
- Configurações estáticas
- Código de terceiros

## Testes Assíncronos

```typescript
// Promises
it('should fetch data', async () => {
  const data = await service.fetchData();
  expect(data).toBeDefined();
});

// Callbacks
it('should call callback', (done) => {
  service.doSomething((result) => {
    expect(result).toBe(true);
    done();
  });
});

// Timers
jest.useFakeTimers();
it('should delay execution', () => {
  const callback = jest.fn();
  service.delayedAction(callback);
  
  jest.runAllTimers();
  expect(callback).toHaveBeenCalled();
});
```

## Depuração de Testes

```typescript
// Debug individual test
it.only('should debug this test', () => {
  // Seu teste aqui
});

// Skip test
it.skip('should skip this test', () => {
  // Teste temporariamente desabilitado
});

// Aumentar timeout
it('should handle long operation', async () => {
  // Teste longo
}, 10000); // 10 segundos
```

## Checklist de Testes

- [ ] Testes cobrem casos de sucesso
- [ ] Testes cobrem casos de erro
- [ ] Testes cobrem edge cases
- [ ] Nomes de testes são descritivos
- [ ] Mocks são utilizados apropriadamente
- [ ] Testes são independentes entre si
- [ ] Testes são rápidos (< 5s para unitários)
- [ ] Setup e cleanup estão corretos
- [ ] Cobertura atinge os objetivos
- [ ] Testes passam no CI/CD
