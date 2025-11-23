# Health Check Endpoints

This document describes the health check endpoints available in the application.

## Endpoints

### 1. Main Health Check
**Endpoint:** `GET /health`  
**Description:** Health check endpoint for the main application - Readiness probe  
**Authentication:** Not required (public endpoint)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T17:52:40.584Z"
}
```

**Example:**
```bash
curl -s http://localhost:3000/health
```

**Usage:** This endpoint is used by Kubernetes/Cloud Run to verify if the service is ready and responding.

---

### 2. WhatsApp Service Health Check
**Endpoint:** `GET /whatsapp/health`  
**Description:** Health check endpoint for the WhatsApp service  
**Authentication:** Not required (public endpoint)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T17:52:40.584Z"
}
```

**Example:**
```bash
curl -s http://localhost:3000/whatsapp/health
```

**Usage:** This endpoint can be used to specifically verify that the WhatsApp service module is loaded and responding.

---

### 3. Liveness Probe
**Endpoint:** `GET /health/liveness`  
**Description:** Liveness probe for container health  
**Authentication:** Not required (public endpoint)

**Response:**
```json
{
  "status": "alive"
}
```

**Example:**
```bash
curl -s http://localhost:3000/health/liveness
```

**Usage:** This endpoint is used by Kubernetes/Cloud Run to check if the container is alive. If it returns an error, the container will be restarted.

---

## Implementation Details

### Health Controller
The main health endpoints are implemented in `src/health/health.controller.ts`:
- `/health` - Readiness probe
- `/health/liveness` - Liveness probe

### WhatsApp Controller
The WhatsApp health endpoint is implemented in `src/modules/whatsapp/whatsapp.controller.ts`:
- `/whatsapp/health` - WhatsApp service health check

### Module Integration
The WhatsAppModule is imported in `src/app.module.ts` to enable the `/whatsapp/*` routes.

## Testing

Unit tests are provided for both controllers:
- `src/health/health.controller.spec.ts` - Tests for main health endpoints
- `src/modules/whatsapp/whatsapp.controller.spec.ts` - Tests for WhatsApp health endpoint

Run the tests with:
```bash
npm test -- src/health/health.controller.spec.ts
npm test -- src/modules/whatsapp/whatsapp.controller.spec.ts
```
