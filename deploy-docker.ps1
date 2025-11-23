# Docker Compose Deployment Script (PowerShell)
# This script stops, pulls, rebuilds, and starts Docker services
# Usage: .\deploy-docker.ps1 [compose-file]
# Example: .\deploy-docker.ps1
# Example: .\deploy-docker.ps1 deploy\docker-compose.yml

param(
    [string]$ComposeFile = "docker-compose.yml"
)

# Set error action preference
$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor, $Message) {
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

Write-ColorOutput Yellow "=== Docker Compose Deployment ==="
Write-Output "Using compose file: $ComposeFile"
Write-Output ""

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
    Write-ColorOutput Red "Error: Compose file '$ComposeFile' not found"
    exit 1
}

# Step 1: Stop and remove containers
Write-ColorOutput Yellow "Step 1/4: Stopping containers and removing orphans..."
try {
    docker compose -f $ComposeFile down --remove-orphans
    Write-ColorOutput Green "✓ Containers stopped"
} catch {
    Write-ColorOutput Red "Error stopping containers: $_"
    exit 1
}
Write-Output ""

# Step 2: Pull latest images
Write-ColorOutput Yellow "Step 2/4: Pulling latest images..."
try {
    docker compose -f $ComposeFile pull
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✓ Images pulled"
    } else {
        Write-ColorOutput Yellow "Warning: Some images may not have remote versions to pull"
    }
} catch {
    Write-ColorOutput Yellow "Warning: Some images may not have remote versions to pull"
}
Write-Output ""

# Step 3: Build and start containers
Write-ColorOutput Yellow "Step 3/4: Building and starting containers..."
try {
    docker compose -f $ComposeFile up -d --build
    Write-ColorOutput Green "✓ Containers started"
} catch {
    Write-ColorOutput Red "Error starting containers: $_"
    exit 1
}
Write-Output ""

# Step 4: Show container status
Write-ColorOutput Yellow "Step 4/4: Checking container status..."
docker compose -f $ComposeFile ps
Write-Output ""

Write-ColorOutput Green "=== Deployment Complete ==="
Write-Output ""
Write-Output "Useful commands:"
Write-Output "  View logs: docker compose -f $ComposeFile logs -f"
Write-Output "  Stop services: docker compose -f $ComposeFile down"
Write-Output "  Restart services: docker compose -f $ComposeFile restart"
