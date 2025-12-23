# Production Deployment Guide

**Last Updated:** 2025-12-22  
**Repository:** Carine01/meu-backend  
**Target Environment:** Production

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [PR Conflict Resolution Order](#pr-conflict-resolution-order)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Manual Conflict Resolution Examples](#manual-conflict-resolution-examples)
5. [Testing Procedures](#testing-procedures)
6. [Production Deployment Steps](#production-deployment-steps)
7. [Smoke Test Commands](#smoke-test-commands)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Deployment Monitoring](#post-deployment-monitoring)
10. [Emergency Contacts](#emergency-contacts)

---

## Pre-Deployment Checklist

Before starting the deployment process, ensure the following:

- [ ] All stakeholders have been notified of the deployment window
- [ ] Database backup has been created and verified
- [ ] Current production version is documented
- [ ] Rollback plan is reviewed and understood
- [ ] All required GitHub secrets are configured
- [ ] Staging environment tests have passed
- [ ] Code freeze is in effect
- [ ] Monitoring dashboards are accessible
- [ ] On-call engineer is available

---

## PR Conflict Resolution Order

Resolve and merge PRs in the following strict order to minimize conflicts:

### Order of Operations

```
PR #110 → PR #99 → PR #103 → PR #98 → PR #107 → PR #118
```

### Detailed Merge Sequence

#### 1. PR #110 (First Priority)
```bash
# Checkout and update main
git checkout main
git pull origin main

# Fetch PR #110
git fetch origin pull/110/head:pr-110
git checkout pr-110

# Rebase on main
git rebase main

# Run tests
npm test

# Push and merge via GitHub UI
git push origin pr-110 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Verify CI/CD pipeline passes
- [ ] Check for new conflicts in remaining PRs
- [ ] Update PR #99 branch with latest main

---

#### 2. PR #99 (Second Priority)
```bash
# Update local main
git checkout main
git pull origin main

# Fetch PR #99
git fetch origin pull/99/head:pr-99
git checkout pr-99

# Rebase on updated main
git rebase main

# Resolve conflicts if any (see conflict resolution section)
# Run tests
npm test
npm run test:integration

# Push and merge
git push origin pr-99 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Verify database migrations run successfully
- [ ] Check API endpoint compatibility
- [ ] Update PR #103 branch with latest main

---

#### 3. PR #103 (Third Priority)
```bash
# Update local main
git checkout main
git pull origin main

# Fetch PR #103
git fetch origin pull/103/head:pr-103
git checkout pr-103

# Rebase on updated main
git rebase main

# Run full test suite
npm test
npm run test:e2e

# Push and merge
git push origin pr-103 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Verify authentication flows
- [ ] Test JWT token generation
- [ ] Update PR #98 branch with latest main

---

#### 4. PR #98 (Fourth Priority)
```bash
# Update local main
git checkout main
git pull origin main

# Fetch PR #98
git fetch origin pull/98/head:pr-98
git checkout pr-98

# Rebase on updated main
git rebase main

# Run tests
npm test

# Push and merge
git push origin pr-98 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Verify WhatsApp integration
- [ ] Test message sending/receiving
- [ ] Update PR #107 branch with latest main

---

#### 5. PR #107 (Fifth Priority)
```bash
# Update local main
git checkout main
git pull origin main

# Fetch PR #107
git fetch origin pull/107/head:pr-107
git checkout pr-107

# Rebase on updated main
git rebase main

# Run full test suite
npm test
npm run test:integration
npm run test:e2e

# Push and merge
git push origin pr-107 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Verify all integrated features work together
- [ ] Check performance metrics
- [ ] Update PR #118 branch with latest main

---

#### 6. PR #118 (Final Priority)
```bash
# Update local main
git checkout main
git pull origin main

# Fetch PR #118
git fetch origin pull/118/head:pr-118
git checkout pr-118

# Rebase on updated main
git rebase main

# Run complete test suite
npm test
npm run test:integration
npm run test:e2e
npm run test:performance

# Push and merge
git push origin pr-118 --force-with-lease
```

**Post-Merge Actions:**
- [ ] Final verification of all features
- [ ] Complete smoke test suite
- [ ] Tag release version
- [ ] Prepare deployment artifacts

---

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository before deployment:

### Navigation Path
`Repository → Settings → Secrets and variables → Actions → New repository secret`

### Required Secrets

#### 1. DB_URL
**Description:** PostgreSQL/MongoDB database connection string  
**Format:** 
```
postgresql://username:password@host:port/database?ssl=true
# OR
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true
```
**Example:**
```
postgresql://prod_user:SecureP@ssw0rd@db.production.com:5432/meu_backend_prod?ssl=true&sslmode=require
```
**Validation:**
```bash
# Test connection
psql $DB_URL -c "SELECT version();"
```

---

#### 2. JWT_SECRET
**Description:** Secret key for JWT access token signing  
**Format:** Random string, minimum 32 characters  
**Generation:**
```bash
# Generate secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# OR
openssl rand -hex 32
```
**Example:**
```
a7f3c9e1b2d4f6a8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4
```

---

#### 3. JWT_REFRESH_SECRET
**Description:** Secret key for JWT refresh token signing (must differ from JWT_SECRET)  
**Format:** Random string, minimum 32 characters  
**Generation:**
```bash
# Generate different secret from JWT_SECRET
openssl rand -hex 32
```
**Example:**
```
d8e4b2f6c8a0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8d1
```

---

#### 4. WHATSAPP_API_KEY
**Description:** WhatsApp Business API authentication key  
**Format:** API key from WhatsApp Business Platform  
**Acquisition:**
1. Log in to [Meta for Developers](https://developers.facebook.com/)
2. Navigate to WhatsApp → Configuration
3. Generate/Copy System User Token
**Example:**
```
EAABsbCS1iHgBO7ZCKZCjxQPZBGZAZAzqxExample1234567890KeyFromMeta
```
**Validation:**
```bash
curl -X GET "https://graph.facebook.com/v18.0/me" \
  -H "Authorization: Bearer $WHATSAPP_API_KEY"
```

---

#### 5. FIREBASE_SERVICE_ACCOUNT
**Description:** Firebase Admin SDK service account JSON  
**Format:** Complete JSON object (minified, single line)  
**Acquisition:**
1. Go to Firebase Console → Project Settings
2. Navigate to Service Accounts
3. Click "Generate new private key"
4. Download JSON file
**Minification:**
```bash
# Minify JSON to single line
cat firebase-service-account.json | jq -c . > firebase-minified.json
```
**Example Structure:**
```json
{"type":"service_account","project_id":"your-project","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40your-project.iam.gserviceaccount.com"}
```

---

### Secrets Verification Checklist

After adding all secrets:

- [ ] DB_URL - Test database connection
- [ ] JWT_SECRET - Verify length (≥32 chars)
- [ ] JWT_REFRESH_SECRET - Verify length and uniqueness
- [ ] WHATSAPP_API_KEY - Test API call
- [ ] FIREBASE_SERVICE_ACCOUNT - Validate JSON format
- [ ] All secrets are visible in GitHub Actions (not expired)
- [ ] Secrets are not exposed in logs

---

## Manual Conflict Resolution Examples

### Common Conflict Scenarios

#### Scenario 1: Package.json Conflicts

**Conflict Example:**
```json
<<<<<<< HEAD
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0"
  }
}
=======
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.1.0",
    "jsonwebtoken": "^9.0.0"
  }
}
>>>>>>> pr-branch
```

**Resolution:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.1.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

**Post-Resolution:**
```bash
# Remove package-lock.json and reinstall
rm package-lock.json
npm install
npm audit fix
git add package.json package-lock.json
git rebase --continue
```

---

#### Scenario 2: Route Handler Conflicts

**Conflict Example:**
```javascript
<<<<<<< HEAD
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
=======
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});
>>>>>>> pr-branch
```

**Resolution Strategy:**
1. Keep the more feature-complete version (with auth middleware)
2. Maintain consistent response format
3. Preserve security enhancements

```javascript
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Post-Resolution:**
```bash
git add src/routes/users.js
npm test -- users.test.js
git rebase --continue
```

---

#### Scenario 3: Environment Configuration Conflicts

**Conflict Example:**
```javascript
<<<<<<< HEAD
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL
};
=======
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET
};
>>>>>>> pr-branch
```

**Resolution:**
```javascript
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  whatsappApiKey: process.env.WHATSAPP_API_KEY
};

// Validate required env vars
const required = ['DB_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
required.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = config;
```

---

#### Scenario 4: Database Migration Conflicts

**Conflict Example:**
```javascript
<<<<<<< HEAD
// Migration 001_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('email').notNullable();
  });
};
=======
// Migration 001_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
  });
};
>>>>>>> pr-branch
```

**Resolution:**
```javascript
// Keep the more complete schema
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

**Post-Resolution:**
```bash
# Test migration
npm run migrate:latest
npm run migrate:rollback
npm run migrate:latest
git add migrations/
git rebase --continue
```

---

#### Scenario 5: Middleware Stack Conflicts

**Conflict Example:**
```javascript
<<<<<<< HEAD
app.use(express.json());
app.use(cors());
app.use('/api', routes);
=======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use('/api', routes);
>>>>>>> pr-branch
```

**Resolution:**
```javascript
// Security and parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);
```

---

## Testing Procedures

### PR #110 Testing

```bash
# Unit tests
npm test -- --coverage

# Integration tests
npm run test:integration

# Specific feature tests
npm test -- test/feature-110.test.js

# Manual verification
curl -X GET http://localhost:3000/api/health
```

**Expected Results:**
- [ ] All unit tests pass (100% of test suite)
- [ ] Code coverage ≥ 80%
- [ ] No regression in existing features
- [ ] Health endpoint returns 200 OK

---

### PR #99 Testing

```bash
# Database migration tests
npm run migrate:latest
npm run seed:test

# CRUD operations
npm test -- test/crud.test.js

# API endpoint tests
npm run test:api

# Manual testing
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Expected Results:**
- [ ] Migrations run without errors
- [ ] CRUD operations work correctly
- [ ] Data validation is enforced
- [ ] Error handling is proper

---

### PR #103 Testing

```bash
# Authentication tests
npm test -- test/auth.test.js

# JWT token tests
npm test -- test/jwt.test.js

# Authorization tests
npm test -- test/authorization.test.js

# Manual testing
# 1. Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'

# 3. Access protected route
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer <token>"
```

**Expected Results:**
- [ ] User registration works
- [ ] Login returns valid JWT tokens
- [ ] Protected routes require authentication
- [ ] Token refresh works correctly
- [ ] Invalid tokens are rejected

---

### PR #98 Testing

```bash
# WhatsApp integration tests
npm test -- test/whatsapp.test.js

# Message sending tests
npm test -- test/messaging.test.js

# Manual testing
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"to":"+1234567890","message":"Test message"}'
```

**Expected Results:**
- [ ] WhatsApp API connection successful
- [ ] Messages send successfully
- [ ] Webhook handlers work
- [ ] Error handling for failed messages

---

### PR #107 Testing

```bash
# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Load testing
npm run test:load
```

**Expected Results:**
- [ ] All integrated features work together
- [ ] No performance degradation
- [ ] System handles expected load
- [ ] Memory leaks are absent

---

### PR #118 Testing

```bash
# Full test suite
npm run test:all

# Security tests
npm audit
npm run test:security

# Final smoke tests
npm run test:smoke

# Production-like environment test
NODE_ENV=production npm start
```

**Expected Results:**
- [ ] Complete test suite passes
- [ ] No security vulnerabilities
- [ ] Application starts in production mode
- [ ] All features functional

---

## Production Deployment Steps

### Step 1: Pre-Deployment Preparation

```bash
# 1. Create deployment branch
git checkout main
git pull origin main
git checkout -b deployment-$(date +%Y%m%d)

# 2. Tag the release
git tag -a v1.0.0 -m "Production release $(date +%Y-%m-%d)"
git push origin v1.0.0

# 3. Build production artifacts
npm run build
npm run build:docker

# 4. Run pre-deployment tests
npm run test:all
npm run test:security
```

---

### Step 2: Database Backup

```bash
# PostgreSQL backup
pg_dump $DB_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql

# Upload to secure storage
aws s3 cp backup_*.sql s3://your-backup-bucket/

# MongoDB backup (if applicable)
mongodump --uri="$DB_URL" --out=backup_$(date +%Y%m%d_%H%M%S)
```

---

### Step 3: Deploy to Production

#### Option A: Docker Deployment

```bash
# 1. Build Docker image
docker build -t meu-backend:latest .
docker tag meu-backend:latest meu-backend:v1.0.0

# 2. Push to registry
docker push your-registry/meu-backend:v1.0.0

# 3. Deploy to production
docker pull your-registry/meu-backend:v1.0.0
docker stop meu-backend-old
docker run -d \
  --name meu-backend \
  -p 3000:3000 \
  -e DB_URL=$DB_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET \
  -e WHATSAPP_API_KEY=$WHATSAPP_API_KEY \
  -e FIREBASE_SERVICE_ACCOUNT=$FIREBASE_SERVICE_ACCOUNT \
  your-registry/meu-backend:v1.0.0

# 4. Verify deployment
docker ps
docker logs meu-backend
```

#### Option B: PM2 Deployment

```bash
# 1. Pull latest code
cd /var/www/meu-backend
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Run migrations
npm run migrate:latest

# 4. Restart application
pm2 restart meu-backend
pm2 save

# 5. Monitor startup
pm2 logs meu-backend
```

#### Option C: Kubernetes Deployment

```bash
# 1. Update deployment manifest
kubectl set image deployment/meu-backend \
  meu-backend=your-registry/meu-backend:v1.0.0

# 2. Monitor rollout
kubectl rollout status deployment/meu-backend

# 3. Verify pods
kubectl get pods -l app=meu-backend

# 4. Check logs
kubectl logs -f deployment/meu-backend
```

---

### Step 4: Run Database Migrations

```bash
# Connect to production (use caution!)
export NODE_ENV=production

# Run migrations
npm run migrate:latest

# Verify migrations
npm run migrate:status

# Check database state
psql $DB_URL -c "\dt"
```

---

## Smoke Test Commands

Execute these commands immediately after deployment to verify system health.

### 1. Health Check

```bash
# Basic health check
curl -X GET https://api.production.com/health

# Expected response:
# {"status":"healthy","timestamp":"2025-12-22T23:47:12Z","version":"1.0.0"}
```

---

### 2. Database Connectivity

```bash
# Test database connection
curl -X GET https://api.production.com/api/health/db

# Expected response:
# {"database":"connected","latency_ms":15}
```

---

### 3. Authentication Flow

```bash
# Register new user
curl -X POST https://api.production.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke-test@example.com","password":"Test123!@#"}'

# Login
TOKEN=$(curl -X POST https://api.production.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke-test@example.com","password":"Test123!@#"}' \
  | jq -r '.token')

# Verify token
curl -X GET https://api.production.com/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user data
```

---

### 4. Protected Endpoints

```bash
# Test protected route
curl -X GET https://api.production.com/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: User profile data
```

---

### 5. WhatsApp Integration

```bash
# Send test message
curl -X POST https://api.production.com/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"to":"+1234567890","message":"Production deployment test"}'

# Expected: {"success":true,"messageId":"wamid.xxx"}
```

---

### 6. Firebase Integration

```bash
# Test Firebase notification
curl -X POST https://api.production.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":"test-user","title":"Test","body":"Deployment test"}'

# Expected: {"success":true,"notificationId":"xxx"}
```

---

### 7. Performance Baseline

```bash
# Response time test
time curl -X GET https://api.production.com/api/health

# Load test (using Apache Bench)
ab -n 1000 -c 10 https://api.production.com/api/health

# Expected: Avg response time < 200ms
```

---

### 8. Error Handling

```bash
# Test 404
curl -X GET https://api.production.com/api/nonexistent

# Test 401
curl -X GET https://api.production.com/api/protected

# Test 400
curl -X POST https://api.production.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'

# All should return proper error responses
```

---

### Automated Smoke Test Script

```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://api.production.com"
RESULTS_FILE="smoke-test-results-$(date +%Y%m%d_%H%M%S).log"

echo "Starting smoke tests..." | tee $RESULTS_FILE

# Test 1: Health Check
echo "Test 1: Health Check" | tee -a $RESULTS_FILE
if curl -s -f "$BASE_URL/health" > /dev/null; then
  echo "✅ PASS" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL" | tee -a $RESULTS_FILE
  exit 1
fi

# Test 2: Database
echo "Test 2: Database Connection" | tee -a $RESULTS_FILE
if curl -s -f "$BASE_URL/api/health/db" > /dev/null; then
  echo "✅ PASS" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL" | tee -a $RESULTS_FILE
  exit 1
fi

# Test 3: Authentication
echo "Test 3: Authentication" | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}')
  
if echo $RESPONSE | jq -e '.token' > /dev/null; then
  echo "✅ PASS" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL" | tee -a $RESULTS_FILE
  exit 1
fi

echo "All smoke tests passed! ✅" | tee -a $RESULTS_FILE
```

---

## Rollback Procedures

### Quick Rollback Decision Matrix

| Issue | Severity | Action | Time to Rollback |
|-------|----------|--------|------------------|
| Critical security vulnerability | P0 | Immediate rollback | < 5 minutes |
| Database corruption | P0 | Immediate rollback + restore | < 15 minutes |
| Complete service outage | P0 | Immediate rollback | < 5 minutes |
| Feature malfunction | P1 | Feature flag disable | < 2 minutes |
| Performance degradation >50% | P1 | Rollback | < 10 minutes |
| Minor bug affecting <5% users | P2 | Hotfix next release | N/A |

---

### Rollback Procedure - Docker

```bash
# 1. Identify current and previous versions
docker ps | grep meu-backend
docker images | grep meu-backend

# 2. Stop current container
docker stop meu-backend
docker rename meu-backend meu-backend-failed

# 3. Start previous version
docker run -d \
  --name meu-backend \
  -p 3000:3000 \
  -e DB_URL=$DB_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET \
  -e WHATSAPP_API_KEY=$WHATSAPP_API_KEY \
  -e FIREBASE_SERVICE_ACCOUNT=$FIREBASE_SERVICE_ACCOUNT \
  your-registry/meu-backend:v0.9.0

# 4. Verify rollback
curl https://api.production.com/health

# 5. Check logs
docker logs -f meu-backend

# Rollback time: ~3-5 minutes
```

---

### Rollback Procedure - PM2

```bash
# 1. Check current version
cd /var/www/meu-backend
git log --oneline -5

# 2. Checkout previous version
git checkout v0.9.0

# 3. Reinstall dependencies
npm ci --production

# 4. Rollback database migrations (if needed)
npm run migrate:rollback

# 5. Restart application
pm2 restart meu-backend

# 6. Verify
pm2 logs meu-backend
curl https://api.production.com/health

# Rollback time: ~8-10 minutes
```

---

### Rollback Procedure - Kubernetes

```bash
# 1. Check deployment history
kubectl rollout history deployment/meu-backend

# 2. Rollback to previous version
kubectl rollout undo deployment/meu-backend

# 3. Monitor rollback
kubectl rollout status deployment/meu-backend

# 4. Verify pods
kubectl get pods -l app=meu-backend

# 5. Check logs
kubectl logs -f deployment/meu-backend

# Alternative: Rollback to specific revision
kubectl rollout undo deployment/meu-backend --to-revision=2

# Rollback time: ~2-4 minutes (automatic)
```

---

### Database Rollback Procedure

```bash
# 1. Stop application
pm2 stop meu-backend
# OR
docker stop meu-backend

# 2. Identify backup
ls -lt /backups/*.sql | head -n 5

# 3. Restore database (CAUTION!)
psql $DB_URL -c "DROP SCHEMA public CASCADE;"
psql $DB_URL -c "CREATE SCHEMA public;"
psql $DB_URL < /backups/backup_20251222_230000.sql

# 4. Verify restoration
psql $DB_URL -c "\dt"
psql $DB_URL -c "SELECT COUNT(*) FROM users;"

# 5. Restart application with previous code version
pm2 start meu-backend

# Database rollback time: ~15-30 minutes (depends on DB size)
```

---

### Emergency Hotfix Procedure

If a critical bug is found post-deployment:

```bash
# 1. Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Make minimal fix
# ... edit code ...

# 3. Test thoroughly
npm test
npm run test:integration

# 4. Commit and push
git add .
git commit -m "hotfix: Fix critical bug"
git push origin hotfix/critical-bug-fix

# 5. Create and merge PR immediately
gh pr create --title "HOTFIX: Critical Bug" --body "Emergency fix"
gh pr merge --admin --squash

# 6. Deploy hotfix
git checkout main
git pull origin main
# Follow normal deployment steps

# Hotfix deployment time: ~20-30 minutes
```

---

## Post-Deployment Monitoring

### Immediate Monitoring (First 30 Minutes)

#### 1. Application Health

**Metrics to Monitor:**
- [ ] HTTP status codes (aim for <1% 5xx errors)
- [ ] Response times (p50, p95, p99)
- [ ] Request throughput
- [ ] Active connections

**Grafana Dashboard:**
```
https://grafana.production.com/d/app-health/application-health
```

**Prometheus Queries:**
```promql
# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Response time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Request rate
rate(http_requests_total[5m])
```

---

#### 2. Database Performance

**Metrics to Monitor:**
- [ ] Query response times
- [ ] Active connections
- [ ] Connection pool utilization
- [ ] Slow queries (>1s)

**Grafana Dashboard:**
```
https://grafana.production.com/d/database/database-performance
```

**Prometheus Queries:**
```promql
# Active connections
postgresql_database_connections{state="active"}

# Query duration p95
histogram_quantile(0.95, rate(postgresql_query_duration_seconds_bucket[5m]))

# Connection pool saturation
database_connection_pool_used / database_connection_pool_size
```

---

#### 3. System Resources

**Metrics to Monitor:**
- [ ] CPU utilization (<70% average)
- [ ] Memory usage (<80%)
- [ ] Disk I/O
- [ ] Network bandwidth

**Grafana Dashboard:**
```
https://grafana.production.com/d/system/system-resources
```

**Prometheus Queries:**
```promql
# CPU usage
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100
```

---

#### 4. Application-Specific Metrics

**Metrics to Monitor:**
- [ ] Active user sessions
- [ ] WhatsApp message success rate
- [ ] Firebase notification delivery rate
- [ ] JWT token generation/validation rate
- [ ] Authentication success/failure rate

**Grafana Dashboard:**
```
https://grafana.production.com/d/app-metrics/application-metrics
```

**Custom Metrics:**
```promql
# WhatsApp message success rate
rate(whatsapp_messages_sent_total{status="success"}[5m]) / 
rate(whatsapp_messages_sent_total[5m]) * 100

# Auth success rate
rate(auth_attempts_total{result="success"}[5m]) /
rate(auth_attempts_total[5m]) * 100

# Active sessions
auth_active_sessions
```

---

### Extended Monitoring (First 24 Hours)

#### 5. Error Tracking

**Tools:**
- Sentry: `https://sentry.io/organizations/your-org/issues/`
- CloudWatch Logs: `https://console.aws.amazon.com/cloudwatch/`

**Alerts to Configure:**
- [ ] New error types detected
- [ ] Error spike (>10x baseline)
- [ ] Critical errors (security, data corruption)

---

#### 6. Business Metrics

**Metrics to Monitor:**
- [ ] User registration rate
- [ ] Daily active users (DAU)
- [ ] API usage per endpoint
- [ ] Feature adoption rates

**Analytics Dashboard:**
```
https://analytics.production.com/dashboard
```

---

#### 7. Security Monitoring

**Metrics to Monitor:**
- [ ] Failed authentication attempts
- [ ] Invalid token attempts
- [ ] Rate limiting triggers
- [ ] Suspicious activity patterns

**Security Dashboard:**
```
https://grafana.production.com/d/security/security-monitoring
```

**Prometheus Queries:**
```promql
# Failed auth rate
rate(auth_attempts_total{result="failure"}[5m])

# Invalid token attempts
rate(jwt_validation_total{result="invalid"}[5m])

# Rate limit hits
rate(rate_limit_exceeded_total[5m])
```

---

### Monitoring Checklist

#### ✅ 5 Minutes Post-Deployment
- [ ] Application is responding (health check returns 200)
- [ ] No immediate errors in logs
- [ ] Database connections established
- [ ] All pods/containers running (if applicable)

#### ✅ 15 Minutes Post-Deployment
- [ ] Response times within acceptable range (p95 < 500ms)
- [ ] Error rate < 1%
- [ ] CPU/Memory usage stable
- [ ] No memory leaks detected

#### ✅ 30 Minutes Post-Deployment
- [ ] All features tested manually
- [ ] User reports monitored (no spike in support tickets)
- [ ] Third-party integrations working (WhatsApp, Firebase)
- [ ] Background jobs running

#### ✅ 2 Hours Post-Deployment
- [ ] Comprehensive smoke tests complete
- [ ] Performance baseline established
- [ ] All monitoring alerts configured
- [ ] Documentation updated

#### ✅ 24 Hours Post-Deployment
- [ ] Full business metrics reviewed
- [ ] User feedback collected
- [ ] Performance compared to previous version
- [ ] Post-deployment retrospective scheduled

---

### Alert Configuration

#### Critical Alerts (Immediate Response Required)

```yaml
# prometheus-alerts.yml
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up{job="meu-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 5%"

      - alert: DatabaseDown
        expr: postgresql_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection lost"
```

#### Warning Alerts (Response Within 30 Minutes)

```yaml
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p95 response time above 1s"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above 85%"
```

---

### Monitoring URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Grafana Main | `https://grafana.production.com` | Primary monitoring dashboard |
| App Health | `https://grafana.production.com/d/app-health` | Application health metrics |
| Database | `https://grafana.production.com/d/database` | Database performance |
| System Resources | `https://grafana.production.com/d/system` | CPU, Memory, Disk |
| Security | `https://grafana.production.com/d/security` | Security events |
| Prometheus | `https://prometheus.production.com` | Raw metrics and queries |
| AlertManager | `https://alertmanager.production.com` | Alert management |
| Sentry | `https://sentry.io/organizations/your-org` | Error tracking |
| API Health | `https://api.production.com/health` | Live health endpoint |

---

## Emergency Contacts

### On-Call Engineer
- **Primary:** DevOps Team Lead
- **Phone:** +XX XXX-XXX-XXXX
- **Email:** devops-oncall@company.com
- **Slack:** @devops-oncall

### Database Administrator
- **Name:** DBA Team
- **Phone:** +XX XXX-XXX-XXXX
- **Email:** dba@company.com
- **Slack:** @dba-team

### Security Team
- **Phone:** +XX XXX-XXX-XXXX
- **Email:** security@company.com
- **Slack:** @security-team

### Escalation Path
1. On-Call Engineer (Response: 15 minutes)
2. Team Lead (Response: 30 minutes)
3. Engineering Manager (Response: 1 hour)
4. CTO (Response: 2 hours)

---

## Appendix

### A. Useful Commands

```bash
# Check application logs
pm2 logs meu-backend --lines 100

# Monitor in real-time
watch -n 1 'curl -s https://api.production.com/health | jq'

# Database query
psql $DB_URL -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 10;"

# Container stats
docker stats meu-backend

# Kubernetes pod status
kubectl get pods -l app=meu-backend -o wide
```

### B. Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Out of Memory | App crashes, 137 exit code | Increase memory limit or fix memory leak |
| Database connection pool exhausted | Timeouts, connection errors | Increase pool size or fix connection leaks |
| JWT token invalid | 401 errors | Verify JWT_SECRET matches |
| WhatsApp API failure | Message send failures | Check WHATSAPP_API_KEY and API status |
| Rate limiting triggered | 429 errors | Review rate limit configuration |

### C. Version History

| Version | Date | PRs Merged | Notes |
|---------|------|------------|-------|
| v1.0.0 | 2025-12-22 | #110, #99, #103, #98, #107, #118 | Initial production release |

---

## Deployment Sign-Off

**Deployment Date:** ________________  
**Deployment Time:** ________________  
**Deployed Version:** ________________  
**Deployed By:** ________________  

**Sign-Off:**
- [ ] All PRs merged successfully
- [ ] All tests passed
- [ ] Smoke tests completed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Stakeholders notified

**Approved By:** ________________  
**Date:** ________________

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-22  
**Next Review Date:** 2026-01-22

---

## Quick Reference Card

### Emergency Commands
```bash
# Immediate rollback
kubectl rollout undo deployment/meu-backend

# Check health
curl https://api.production.com/health

# View logs
kubectl logs -f deployment/meu-backend

# Check alerts
open https://alertmanager.production.com
```

### Emergency Contacts (Speed Dial)
- **On-Call:** Press 1
- **DBA:** Press 2
- **Security:** Press 3
- **Manager:** Press 4

---

*This guide should be reviewed and updated after each deployment. Feedback and improvements are welcome.*
