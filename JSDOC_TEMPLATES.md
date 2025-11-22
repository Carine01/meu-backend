# 📋 JSDoc Templates para Controllers

## Como Usar

Adicione estes comentários JSDoc **acima de cada método** nos controllers listados abaixo.

---

## 1. auth.controller.ts

```typescript
/**
 * Auth Controller
 * Rota: /auth
 */

/**
 * POST /auth/login
 * Autentica o usuário e retorna token JWT.
 *
 * @param {Request} req - Express/Nest request
 * @param {Object} req.body
 * @param {string} req.body.email - Email do usuário.
 * @param {string} req.body.password - Senha do usuário.
 * @returns {Promise<{accessToken: string}>}
 * 
 * @example
 * POST /auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "senha123"
 * }
 * 
 * Response:
 * {
 *   "accessToken": "eyJhbGc..."
 * }
 */
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // implementação
}
```

---

## 2. user.controller.ts

```typescript
/**
 * User Controller
 * CRUD de usuários
 */

/**
 * GET /users/:id
 * Busca usuário por id.
 *
 * @param {Request} req
 * @param {string} req.params.id - ID do usuário.
 * @returns {Promise<User>}
 * @throws {NotFoundException} Se usuário não for encontrado
 * 
 * @example
 * GET /users/123
 * 
 * Response:
 * {
 *   "id": "123",
 *   "email": "user@example.com",
 *   "name": "João Silva"
 * }
 */
@Get(':id')
async findOne(@Param('id') id: string) {
  // implementação
}

/**
 * POST /users
 * Cria novo usuário.
 *
 * @param {Object} createUserDto - Dados do usuário
 * @param {string} createUserDto.email - Email único
 * @param {string} createUserDto.password - Senha (min 8 chars)
 * @param {string} createUserDto.name - Nome completo
 * @returns {Promise<User>}
 */
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  // implementação
}
```

---

## 3. payment.controller.ts

```typescript
/**
 * Payment Controller
 * Processamento de pagamentos e webhooks
 */

/**
 * POST /payments
 * Inicia cobrança.
 * 
 * @param {Request} req
 * @param {Object} req.body
 * @param {number} req.body.amount - Valor em centavos (ex: 1000 = R$10,00).
 * @param {string} req.body.method - Método de pagamento (pix, credit_card, boleto).
 * @param {string} req.body.customerId - ID do cliente.
 * @returns {Promise<Payment>}
 * 
 * @example
 * POST /payments
 * {
 *   "amount": 15000,
 *   "method": "pix",
 *   "customerId": "cust_123"
 * }
 * 
 * Response:
 * {
 *   "id": "pay_456",
 *   "status": "pending",
 *   "qrCode": "00020126580014..."
 * }
 */
@Post()
async create(@Body() createPaymentDto: CreatePaymentDto) {
  // implementação
}

/**
 * POST /payments/webhook
 * Webhook para notificações de pagamento (Stripe/Mercado Pago).
 * 
 * ⚠️ Este endpoint não deve ter autenticação JWT!
 * 
 * @param {Request} req - Payload do webhook
 * @returns {Promise<{received: boolean}>}
 */
@Post('webhook')
async handleWebhook(@Body() webhookDto: any) {
  // implementação
}
```

---

## 4. order.controller.ts

```typescript
/**
 * Order Controller
 * Cria e consulta pedidos
 */

/**
 * POST /orders
 * Cria um pedido e retorna status.
 * 
 * @param {Object} createOrderDto - Dados do pedido
 * @param {string} createOrderDto.customerId - ID do cliente
 * @param {Array} createOrderDto.items - Lista de itens do pedido
 * @param {number} createOrderDto.items[].productId - ID do produto
 * @param {number} createOrderDto.items[].quantity - Quantidade
 * @returns {Promise<Order>}
 * 
 * @example
 * POST /orders
 * {
 *   "customerId": "cust_123",
 *   "items": [
 *     { "productId": "prod_1", "quantity": 2 },
 *     { "productId": "prod_2", "quantity": 1 }
 *   ]
 * }
 */
@Post()
async create(@Body() createOrderDto: CreateOrderDto) {
  // implementação
}

/**
 * GET /orders/:id
 * Busca pedido por ID.
 * 
 * @param {string} id - ID do pedido
 * @returns {Promise<Order>}
 * @throws {NotFoundException}
 */
@Get(':id')
async findOne(@Param('id') id: string) {
  // implementação
}

/**
 * GET /orders
 * Lista pedidos do usuário autenticado.
 * 
 * @param {Object} query - Filtros
 * @param {string} query.status - Filtrar por status (pending, completed, cancelled)
 * @param {number} query.limit - Limite de resultados (default: 20)
 * @returns {Promise<Order[]>}
 */
@Get()
async findAll(@Query() query: QueryOrderDto) {
  // implementação
}
```

---

## 5. admin.controller.ts

```typescript
/**
 * Admin Controller
 * Operações administrativas (protected)
 * 
 * ⚠️ Todos os endpoints requerem role 'admin'
 */

/**
 * GET /admin/stats
 * Retorna métricas resumidas do sistema.
 * 
 * @returns {Promise<Stats>}
 * 
 * @example
 * GET /admin/stats
 * Authorization: Bearer <admin_token>
 * 
 * Response:
 * {
 *   "totalUsers": 1520,
 *   "totalOrders": 3450,
 *   "revenue": 125000.50,
 *   "activeSubscriptions": 450
 * }
 */
@Get('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async getStats() {
  // implementação
}

/**
 * POST /admin/users/:id/ban
 * Bane um usuário do sistema.
 * 
 * @param {string} id - ID do usuário
 * @param {Object} body
 * @param {string} body.reason - Motivo do banimento
 * @returns {Promise<void>}
 */
@Post('users/:id/ban')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async banUser(@Param('id') id: string, @Body('reason') reason: string) {
  // implementação
}

/**
 * DELETE /admin/cache
 * Limpa cache do sistema.
 * 
 * @returns {Promise<{cleared: boolean}>}
 */
@Delete('cache')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async clearCache() {
  // implementação
}
```

---

## 📝 Checklist de Implementação

- [ ] Adicionar JSDoc em `auth.controller.ts` (método login)
- [ ] Adicionar JSDoc em `user.controller.ts` (findOne, create)
- [ ] Adicionar JSDoc em `payment.controller.ts` (create, webhook)
- [ ] Adicionar JSDoc em `order.controller.ts` (create, findOne, findAll)
- [ ] Adicionar JSDoc em `admin.controller.ts` (getStats, banUser, clearCache)

---

## 🎯 Benefícios

- ✅ **IntelliSense melhorado** - VSCode mostra documentação ao passar o mouse
- ✅ **Documentação automática** - Ferramentas como Swagger podem gerar docs
- ✅ **Onboarding rápido** - Novos devs entendem endpoints rapidamente
- ✅ **Cobertura de código** - Alguns linters contam JSDoc na cobertura

---

## 🔗 Referências

- [JSDoc Official](https://jsdoc.app/)
- [TypeScript JSDoc Support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [NestJS Documentation](https://docs.nestjs.com/)
