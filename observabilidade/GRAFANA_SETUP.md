# Grafana Dashboard Setup Guide

## Overview

This guide explains how to set up and use the Grafana dashboard for monitoring authentication and RBAC in the Elevare backend.

## Prerequisites

1. **Prometheus** - Running and scraping metrics from your application
2. **Grafana** - Installed and accessible
3. **Backend Application** - Configured to expose Prometheus metrics

## Dashboard Installation

### Method 1: Import JSON File

1. Open Grafana web interface (usually http://localhost:3000)
2. Login with your credentials
3. Navigate to **Dashboards** → **Import** (or click the "+" icon and select "Import")
4. Click **Upload JSON file** and select `observabilidade/grafana-dashboard-auth-rbac.json`
5. Select your Prometheus data source from the dropdown
6. Click **Import**

### Method 2: Copy-Paste JSON

1. Open the file `observabilidade/grafana-dashboard-auth-rbac.json`
2. Copy the entire contents
3. In Grafana, go to **Dashboards** → **Import**
4. Paste the JSON content into the text area
5. Click **Load**
6. Select your Prometheus data source
7. Click **Import**

## Dashboard Panels

### 1. Tentativas de Login (Login Attempts)
- **Metric:** `login_attempts_total`
- **Description:** Total number of login attempts over time
- **Use Case:** Monitor user authentication activity

### 2. Falhas de Login (Login Failures)
- **Metric:** `login_failures_total`
- **Description:** Number of failed login attempts
- **Alert:** Configured to alert when failures exceed 10 in a 5-minute window
- **Use Case:** Detect potential security threats or brute force attacks

### 3. Refresh Token Usage
- **Metrics:** 
  - `refresh_token_requests_total` - Total refresh token requests
  - `refresh_token_failures_total` - Failed refresh token attempts
- **Description:** Monitor refresh token functionality
- **Use Case:** Track token refresh patterns and identify issues

### 4. Duração das Requisições HTTP (P95)
- **Metric:** `histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le, route))`
- **Description:** 95th percentile of HTTP request duration by route
- **Use Case:** Identify slow endpoints and performance bottlenecks

### 5. Taxa de Sucesso de Login (Login Success Rate)
- **Metric:** `(sum(login_attempts_total) - sum(login_failures_total)) / sum(login_attempts_total) * 100`
- **Description:** Percentage of successful logins
- **Thresholds:**
  - Red: < 80%
  - Yellow: 80-95%
  - Green: > 95%
- **Use Case:** Quick health check of authentication system

### 6. Usuários Ativos (Active Users - 24h)
- **Metric:** `count(count_over_time(login_attempts_total[24h]))`
- **Description:** Number of unique users who logged in within the last 24 hours
- **Use Case:** Track daily active users

### 7. RBAC - Tentativas de Acesso Negado (Access Denied)
- **Metric:** `rbac_access_denied_total`
- **Description:** Number of access denied events by role and endpoint
- **Use Case:** Monitor unauthorized access attempts and identify misconfigured permissions

## Setting Up Metrics in Your Application

To make the dashboard work, your NestJS application needs to expose these metrics. Here's a basic setup:

### Install Prometheus Client

```bash
npm install prom-client
```

### Create Metrics Service

```typescript
// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Registry, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly register: Registry;
  
  public readonly loginAttempts: Counter;
  public readonly loginFailures: Counter;
  public readonly refreshTokenRequests: Counter;
  public readonly refreshTokenFailures: Counter;
  public readonly rbacAccessDenied: Counter;
  public readonly httpRequestDuration: Histogram;

  constructor() {
    this.register = new Registry();

    this.loginAttempts = new Counter({
      name: 'login_attempts_total',
      help: 'Total number of login attempts',
      registers: [this.register],
    });

    this.loginFailures = new Counter({
      name: 'login_failures_total',
      help: 'Total number of failed login attempts',
      registers: [this.register],
    });

    this.refreshTokenRequests = new Counter({
      name: 'refresh_token_requests_total',
      help: 'Total number of refresh token requests',
      registers: [this.register],
    });

    this.refreshTokenFailures = new Counter({
      name: 'refresh_token_failures_total',
      help: 'Total number of failed refresh token requests',
      registers: [this.register],
    });

    this.rbacAccessDenied = new Counter({
      name: 'rbac_access_denied_total',
      help: 'Total number of RBAC access denied events',
      labelNames: ['role', 'endpoint'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.register],
    });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
```

### Create Metrics Controller

```typescript
// src/metrics/metrics.controller.ts
import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
```

### Instrument AuthService

Update your AuthService to record metrics:

```typescript
@Injectable()
export class AuthService {
  constructor(
    // ... other dependencies
    private metricsService: MetricsService,
  ) {}

  async login(loginDto: LoginDto) {
    this.metricsService.loginAttempts.inc();
    
    try {
      // ... existing login logic
      return result;
    } catch (error) {
      this.metricsService.loginFailures.inc();
      throw error;
    }
  }

  async refreshToken(token: string) {
    this.metricsService.refreshTokenRequests.inc();
    
    try {
      // ... existing refresh logic
      return result;
    } catch (error) {
      this.metricsService.refreshTokenFailures.inc();
      throw error;
    }
  }
}
```

## Prometheus Configuration

Add your application as a scrape target in `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'elevare-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## Dashboard Customization

### Adjusting Time Ranges

1. Click the time picker in the top-right corner
2. Select a predefined range or set a custom one
3. Default is last 6 hours

### Modifying Panels

1. Click the panel title → **Edit**
2. Modify queries, visualization settings, or thresholds
3. Click **Apply** to save changes

### Adding Alerts

1. Edit a panel
2. Go to the **Alert** tab
3. Configure alert conditions
4. Set up notification channels

## Best Practices

1. **Regular Monitoring:** Check the dashboard daily for anomalies
2. **Alert Configuration:** Set up alerts for critical metrics
3. **Retention Policy:** Configure appropriate data retention in Prometheus
4. **Performance:** Adjust scrape intervals based on your needs (15-60 seconds)

## Troubleshooting

### No Data Showing

1. **Check Prometheus:**
   - Verify Prometheus is running
   - Check `http://localhost:9090/targets` to see if your app is being scraped
   
2. **Check Metrics Endpoint:**
   - Access `http://localhost:8080/metrics` directly
   - Verify metrics are being exposed

3. **Check Data Source:**
   - In Grafana, go to Configuration → Data Sources
   - Test the Prometheus connection

### Incorrect Values

1. Verify metric names match exactly in your code
2. Check that counters are incrementing properly
3. Look for errors in application logs

### Permission Issues

- Ensure Grafana has permission to access Prometheus
- Check firewall settings if running on different servers

## Additional Features

### Annotations

Add annotations to mark important events:
- Deployments
- Configuration changes
- Incidents

### Variables

Create dashboard variables for:
- Environment (dev, staging, prod)
- Clinic ID
- Time ranges

### Export and Share

1. **Export:** Click dashboard settings → JSON Model
2. **Share:** Generate a shareable link or embed in wiki

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
- [NestJS Metrics](https://docs.nestjs.com/recipes/terminus)

## Support

For issues or questions about the dashboard:
1. Check application logs
2. Verify Prometheus is collecting metrics
3. Review Grafana documentation
4. Contact the development team
