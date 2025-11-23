# Auto-Healing Elevare

This document describes the auto-healing system implemented for the Elevare backend.

## Overview

The auto-healing system automatically monitors the health of backend services and restarts them if they become unresponsive. The system runs every 10 minutes via GitHub Actions.

## Components

### 1. Health Endpoints

#### `/health`
- **Purpose**: Main backend health check
- **Response**: `{ "status": "ok", "timestamp": "2025-11-23T18:00:00.000Z" }`
- **Authentication**: Public (no authentication required)
- **Location**: `src/health/health.controller.ts`

#### `/whatsapp/health`
- **Purpose**: WhatsApp service health check
- **Response**: `{ "status": "ok", "timestamp": "2025-11-23T18:00:00.000Z" }`
- **Authentication**: Public (no authentication required)
- **Location**: `src/modules/whatsapp/whatsapp.controller.ts`

### 2. Auto-Healing Workflow

**File**: `.github/workflows/auto-healing.yml`

**Schedule**: Every 10 minutes (`*/10 * * * *`)

**Process**:
1. Sets up SSH connection to production server
2. Checks `/health` endpoint
   - If check fails: restarts `backend` service
3. Checks `/whatsapp/health` endpoint
   - If check fails: restarts `queue` service

## Setup

### Required GitHub Secrets

Configure the following secrets in your GitHub repository settings:

| Secret | Description | Example |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | Contents of `id_rsa` file |
| `SERVER_USER` | Username for SSH connection | `ubuntu` or `admin` |
| `SERVER_IP` | Server IP address | `203.0.113.1` |

### Setting up SSH Key

1. Generate an SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions@elevare"
   ```

2. Add the public key to your server's `~/.ssh/authorized_keys`

3. Add the private key to GitHub Secrets as `SSH_PRIVATE_KEY`

### Server Requirements

The auto-healing workflow expects the following to be available on the server:

- **curl**: HTTP client for health checks
- **jq**: JSON processor for validating responses
- **docker compose**: For restarting services
- **SSH server**: For remote connection

Install missing dependencies:
```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y curl jq docker-compose
```

## How It Works

### Health Check Logic

```bash
# Check backend health
if ! curl -s --max-time 10 --connect-timeout 5 http://localhost:3000/health | jq -e '.status == "ok"' > /dev/null 2>&1; then
    echo 'Backend health check failed, restarting...'
    docker compose restart backend
fi
```

**Parameters**:
- `--max-time 10`: Maximum 10 seconds for the entire operation
- `--connect-timeout 5`: Maximum 5 seconds to establish connection
- `jq -e '.status == "ok"'`: Validates JSON response structure

### Security Features

1. **SSH Host Key Verification**: Uses `ssh-keyscan` to verify host identity
2. **Private Key Permissions**: Sets correct permissions (600) on SSH key
3. **Timeout Protection**: Prevents hanging connections
4. **Least Privilege**: Minimal GitHub Actions permissions (`contents: read`)
5. **JSON Validation**: Accurate health check with jq instead of grep

## Testing

### Manual Testing

Test the health endpoints locally:

```bash
# Test main backend health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-23T18:00:00.000Z"}

# Test WhatsApp health
curl http://localhost:3000/whatsapp/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-23T18:00:00.000Z"}
```

### Automated Tests

Run the test suite:

```bash
npm test -- whatsapp.controller.spec.ts
```

Expected output:
```
✓ deve estar definido
✓ deve retornar status ok com timestamp
✓ deve retornar timestamp no formato ISO
✓ deve verificar se número tem WhatsApp

Test Suites: 1 passed
Tests: 4 passed
```

## Monitoring

### GitHub Actions

View workflow runs in GitHub:
1. Go to **Actions** tab in your repository
2. Select **Auto Healing Elevare** workflow
3. View execution history and logs

### Expected Behavior

**Normal Operation**:
- Workflow runs every 10 minutes
- Both health checks pass
- No services are restarted

**Service Failure**:
- Workflow detects failed health check
- Logs restart action
- Restarts affected service via docker compose

## Troubleshooting

### Workflow Fails to Connect

**Error**: `Permission denied (publickey)`

**Solution**: 
1. Verify `SSH_PRIVATE_KEY` secret is correctly set
2. Ensure public key is in server's `authorized_keys`
3. Check SSH key permissions on server (should be 600)

### Health Check Always Fails

**Error**: `Backend health check failed, restarting...` (every run)

**Solution**:
1. Verify services are running: `docker compose ps`
2. Check service logs: `docker compose logs backend`
3. Test health endpoint directly: `curl http://localhost:3000/health`
4. Ensure jq is installed: `which jq`

### Service Restarts But Still Fails

**Investigation Steps**:
1. Check service logs: `docker compose logs --tail=100 backend`
2. Verify docker-compose.yml configuration
3. Check resource availability (memory, disk, CPU)
4. Look for application-level errors

## Maintenance

### Adjusting Check Frequency

To change how often the auto-healing runs, edit `.github/workflows/auto-healing.yml`:

```yaml
on:
  schedule:
    - cron: "*/5 * * * *"  # Every 5 minutes
    # - cron: "*/15 * * * *"  # Every 15 minutes
    # - cron: "0 * * * *"     # Every hour
```

### Adding New Health Checks

To monitor additional services:

1. Add a health endpoint to the service
2. Update the workflow in `.github/workflows/auto-healing.yml`:
   ```yaml
   if ! curl -s --max-time 10 --connect-timeout 5 http://localhost:3000/new-service/health | jq -e '.status == "ok"' > /dev/null 2>&1; then
       echo 'New service health check failed, restarting...'
       docker compose restart new-service
   fi
   ```

## Security Considerations

### Best Practices

1. **Rotate SSH Keys Regularly**: Update `SSH_PRIVATE_KEY` secret every 90 days
2. **Use Dedicated SSH Keys**: Don't reuse personal SSH keys
3. **Limit SSH User Permissions**: Use a dedicated user with minimal privileges
4. **Monitor Workflow Logs**: Review for suspicious activity
5. **Keep Secrets Secure**: Never commit secrets to repository

### Permissions

The workflow uses minimal permissions:
- `contents: read` - Only read access to repository content
- No write permissions
- No access to other repositories or resources

## References

- [GitHub Actions Scheduled Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Docker Compose CLI](https://docs.docker.com/compose/reference/)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [curl Documentation](https://curl.se/docs/manpage.html)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review workflow logs in GitHub Actions
3. Check service logs with `docker compose logs`
4. Contact the development team
