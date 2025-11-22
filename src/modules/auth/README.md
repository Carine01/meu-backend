# 🔐 Módulo de Autenticação

Sistema de autenticação baseado em Firebase + JWT para controle de acesso.

---

## 📋 Funcionalidades

### ✅ Autenticação
- Login com email/senha (Firebase)
- Registro de novos usuários (apenas admins)
- Verificação de token JWT
- Refresh de token
- Multi-tenancy (isolamento por clinicId)
- Sistema de roles (admin, user)

---

## 🎯 Endpoints Principais

### POST `/auth/login`
Autenticar usuário

```typescript
POST /auth/login
{
  "email": "admin@elevare.com",
  "password": "senha123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "user": {
    "email": "admin@elevare.com",
    "clinicId": "elevare-01",
    "roles": ["admin"]
  }
}
```

### POST `/auth/register`
Registrar novo usuário (requer role admin)

```typescript
POST /auth/register
Authorization: Bearer <admin_token>
{
  "email": "novo@elevare.com",
  "password": "senha456",
  "clinicId": "elevare-02",
  "roles": ["user"]
}
```

### GET `/auth/me`
Obter dados do usuário autenticado

```typescript
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "userId": "abc123",
  "email": "user@elevare.com",
  "clinicId": "elevare-01",
  "roles": ["user"]
}
```

---

## 🏗️ Arquitetura

```
auth/
├── entities/
│   └── usuario.entity.ts        # Entidade de usuário
├── dto/
│   └── auth.dto.ts              # DTOs de login/registro
├── guards/
│   ├── jwt-auth.guard.ts        # Guard de autenticação
│   └── roles.guard.ts           # Guard de roles
├── decorators/
│   └── roles.decorator.ts       # Decorator @Roles()
├── auth.controller.ts           # Endpoints REST
├── auth.service.ts              # Lógica de negócio
├── jwt.strategy.ts              # Estratégia Passport JWT
└── auth.module.ts               # Módulo NestJS
```

---

## 💾 Entidade Usuario

```typescript
{
  id: string;
  email: string;
  passwordHash: string;
  clinicId: string;              // Isolamento multi-tenancy
  roles: string[];               // ['admin', 'user', 'manager']
  ativo: boolean;
  ultimoLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔒 Sistema de Roles

### Roles Disponíveis

| Role | Permissões |
|------|------------|
| **admin** | Acesso total, criar usuários, configurações |
| **manager** | Gestão de agendamentos, relatórios |
| **user** | Acesso básico, criar leads, agendar |

### Usando Roles em Controllers

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // Apenas admins podem acessar
}
```

---

## 🔄 Fluxo de Autenticação

```mermaid
graph TD
    A[Cliente envia email/senha] --> B[Validar no Firebase]
    B -->|Inválido| C[Retornar 401 Unauthorized]
    B -->|Válido| D[Buscar usuário no PostgreSQL]
    D -->|Não encontrado| E[Criar usuário automático]
    D -->|Encontrado| F[Gerar JWT token]
    E --> F
    F --> G[Retornar token + dados user]
    G --> H[Cliente guarda token]
    H --> I[Cliente usa token em requests]
    I --> J[JwtAuthGuard valida token]
    J -->|Válido| K[Processa request]
    J -->|Inválido| L[Retornar 401]
```

---

## 🛡️ Segurança

### JWT
- **Algoritmo:** HS256
- **Expiração:** 7 dias (configurável)
- **Secret:** Variável de ambiente `JWT_SECRET`

### Firebase
- **Autenticação:** Firebase Authentication
- **Admin SDK:** Validação server-side
- **MFA:** Suportado (configurar no Firebase Console)

### Boas Práticas Implementadas
- ✅ Senha nunca retornada na API
- ✅ Tokens com expiração
- ✅ Isolamento por clinicId (multi-tenancy)
- ✅ Rate limiting configurável
- ✅ CORS restrito
- ✅ Logs de tentativas de login

---

## 🧪 Testes

```bash
# Rodar testes unitários
npm run test -- auth

# Rodar testes E2E
npm run test:e2e -- auth.e2e-spec.ts
```

---

## 📊 Logs Estruturados

```json
{
  "message": "✅ Login",
  "context": {
    "email": "user@elevare.com",
    "clinicId": "elevare-01",
    "timestamp": "2025-11-22T01:00:00Z"
  }
}
```

---

## 🔗 Integração com Outros Módulos

Todos os módulos protegidos usam `@UseGuards(JwtAuthGuard)`:

```typescript
@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  // Endpoints protegidos
}
```

---

## 🛠️ Configuração

### Variáveis de Ambiente

```env
# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_min_32_chars
JWT_EXPIRATION=7d

# Firebase
FIREBASE_PROJECT_ID=elevare-iara
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@elevare-iara.iam.gserviceaccount.com
```

---

## 🔧 Como Usar

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elevare.com","password":"senha123"}'
```

### 2. Usar Token
```bash
curl http://localhost:3000/api/agendamentos \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Verificar Token
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🚀 Seed de Usuário Admin

Para criar usuário admin inicial:

```bash
curl -X POST http://localhost:3000/api/auth/seed-admin
```

Credenciais padrão:
- **Email:** admin@elevare.com
- **Senha:** Elevare@2025
- **Roles:** ["admin"]

⚠️ **IMPORTANTE:** Trocar senha após primeiro login em produção!

---

## 📝 Próximos Passos

- [ ] Implementar refresh token
- [ ] OAuth2 (Google, Facebook)
- [ ] MFA obrigatório para admins
- [ ] Auditoria de logins suspeitos
- [ ] Bloqueio após N tentativas falhas
- [ ] Logout de todas as sessões

---

## 🐛 Troubleshooting

### Problema: "Token expirado"
**Causa:** Token JWT passou de 7 dias  
**Solução:** Fazer login novamente

### Problema: "Forbidden - role insuficiente"
**Causa:** Usuário não tem a role necessária  
**Solução:** Admin deve atualizar roles do usuário

### Problema: "Firebase error"
**Causa:** Credenciais Firebase inválidas  
**Solução:** Verificar variáveis de ambiente FIREBASE_*

---

## 📚 Documentação Adicional

- [Swagger API](/api#/auth)
- [Firebase Console](https://console.firebase.google.com)
- [JWT.io](https://jwt.io) - Debugar tokens
