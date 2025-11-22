# Quick Reference - New Endpoints

## 📚 API Documentation (Swagger)
```
GET http://localhost:3000/api/docs
```
- Interactive API documentation
- Try endpoints directly from browser
- See all request/response schemas

---

## 📊 Metrics Endpoints

### All Metrics
```bash
GET http://localhost:3000/metrics
```
Response:
```json
{
  "requests": {
    "totalRequests": 100,
    "successfulRequests": 95,
    "failedRequests": 5,
    "lastRequestTime": "2025-01-01T00:00:00.000Z"
  },
  "system": {
    "uptime": 3600,
    "memoryUsage": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000,
      "external": 1000000
    },
    "nodeVersion": "v20.0.0",
    "pid": 1234
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Request Metrics Only
```bash
GET http://localhost:3000/metrics/requests
```

### System Metrics Only
```bash
GET http://localhost:3000/metrics/system
```

---

## ❤️ Health Check Endpoints

### Readiness
```bash
GET http://localhost:3000/health
```

### Liveness
```bash
GET http://localhost:3000/health/liveness
```

---

## 📝 Lead Creation (with auto-sanitization)

```bash
POST http://localhost:3000/leads
Content-Type: application/json

{
  "nome": "João Silva",
  "phone": "+5511999999999",
  "clinicId": "elevare-default",
  "origem": "web-form"
}
```

Response includes `x-request-id` header for tracking.

---

## 🔍 Request ID Tracking

Every response includes:
```
x-request-id: 550e8400-e29b-41d4-a716-446655440000
```

You can also send your own:
```bash
curl -H "x-request-id: my-custom-id-123" http://localhost:3000/health
```

---

## 🧪 Testing

Run all tests (30 passing):
```bash
npm test
```

Build the project:
```bash
npm run build
```

Start development server:
```bash
npm run start:dev
```

---

## 📋 Quick Test Commands

```bash
# Start server
npm run start:dev

# In another terminal:

# View API docs
open http://localhost:3000/api/docs

# Check metrics
curl http://localhost:3000/metrics | jq

# Health check
curl http://localhost:3000/health

# Create a lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test User","phone":"+5511999999999"}'
```
