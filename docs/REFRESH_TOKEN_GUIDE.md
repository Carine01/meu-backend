# Refresh Token Implementation Guide

## Overview

This guide explains how to use the refresh token functionality implemented in the Elevare backend and frontend.

## Backend Implementation (NestJS)

### Configuration

Add the following environment variable to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production
```

### Authentication Flow

#### 1. Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "senha": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nome": "User Name",
    "clinicId": "clinic-01",
    "roles": ["user"]
  }
}
```

- **access_token**: Short-lived token (15 minutes) for API authentication
- **refresh_token**: Long-lived token (7 days) for renewing access tokens

#### 2. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Security Features

1. **Token Expiration:**
   - Access Token: 15 minutes
   - Refresh Token: 7 days

2. **User Validation:**
   - The refresh token endpoint validates that the user still exists and is active

3. **Separate Secrets:**
   - Access tokens and refresh tokens use different secrets for added security

## Frontend Implementation (React)

### Hooks

#### useRefreshToken

Manages refresh token logic:

```typescript
import { useRefreshToken } from './hooks/useRefreshToken';

const refreshToken = useRefreshToken();

// Call when access token expires
const newAccessToken = await refreshToken();
```

#### useAuth

Complete authentication management with automatic refresh:

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { token, login, logout, getValidToken } = useAuth();

  const handleLogin = async () => {
    await login('user@example.com', 'password123');
  };

  const makeAuthenticatedRequest = async () => {
    const validToken = await getValidToken();
    // Use validToken for API requests
  };

  return (
    <div>
      {token ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

#### useRole

Extract and use role information from JWT:

```typescript
import { useRole } from './hooks/useRole';

function AdminPanel() {
  const roles = useRole();
  
  if (!roles || !roles.includes('admin')) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin panel content</div>;
}
```

## Role-Based Access Control (RBAC)

### Backend Guards

The system includes role-based access control using decorators and guards:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles('admin')
  getAdminData() {
    return { secret: 'admin only' };
  }
}
```

### Available Roles

- `user`: Standard user access
- `admin`: Administrator access
- `manager`: Manager access (custom role)

## Monitoring with Grafana

A Grafana dashboard configuration is provided at:
`observabilidade/grafana-dashboard-auth-rbac.json`

### Dashboard Features

1. **Login Attempts Tracking:** Monitor total login attempts over time
2. **Login Failures:** Track failed login attempts with alerting
3. **Refresh Token Usage:** Monitor refresh token requests and failures
4. **HTTP Request Duration:** P95 latency metrics by route
5. **Login Success Rate:** Percentage of successful logins
6. **Active Users:** Count of active users in the last 24 hours
7. **RBAC Access Denied:** Track unauthorized access attempts

### Import Dashboard

1. Open Grafana UI
2. Go to "Dashboards" → "Import"
3. Upload the JSON file or paste its contents
4. Select your Prometheus data source
5. Click "Import"

## Best Practices

1. **Token Storage:**
   - Store tokens in localStorage (for web apps)
   - Consider httpOnly cookies for enhanced security in production

2. **Token Refresh:**
   - Implement automatic refresh before token expiration
   - Handle refresh failures gracefully (redirect to login)

3. **Logout:**
   - Always clear both access and refresh tokens
   - Consider implementing token blacklisting for enhanced security

4. **Error Handling:**
   - Catch and handle token expiration errors
   - Provide clear user feedback

## Security Considerations

1. **HTTPS Only:** Always use HTTPS in production
2. **Secure Storage:** Consider more secure storage mechanisms than localStorage
3. **Token Blacklisting:** Implement token revocation for logout
4. **Rate Limiting:** Add rate limiting to authentication endpoints
5. **Monitoring:** Regularly monitor authentication logs for suspicious activity

## Testing

Run the test suite:

```bash
npm test
```

Test refresh token functionality:

```bash
npm test -- auth.service.spec.ts
```

## Troubleshooting

### Common Issues

1. **"Invalid refresh token" error:**
   - Verify JWT_REFRESH_SECRET is correctly set
   - Check token hasn't expired (7 days default)
   - Ensure user is still active in database

2. **"No refresh token" error:**
   - Verify login flow stores refresh_token in localStorage
   - Check token wasn't cleared by logout or browser action

3. **CORS errors:**
   - Ensure frontend API proxy is configured correctly
   - Check ALLOWED_ORIGINS in backend .env

## API Endpoint Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | User login | No |
| `/auth/refresh` | POST | Refresh access token | No |
| `/auth/register` | POST | Register new user | Yes (admin) |
| `/auth/me` | GET | Get current user info | Yes |

## Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
