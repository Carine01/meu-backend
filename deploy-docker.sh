#!/bin/bash

# Docker Compose Deployment Script
# This script stops, pulls, rebuilds, and starts Docker services
# Usage: ./deploy-docker.sh [compose-file]
# Example: ./deploy-docker.sh
# Example: ./deploy-docker.sh deploy/docker-compose.yml

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default compose file
COMPOSE_FILE="${1:-docker-compose.yml}"

echo -e "${YELLOW}=== Docker Compose Deployment ===${NC}"
echo -e "Using compose file: ${COMPOSE_FILE}"
echo ""

# Step 1: Stop and remove containers
echo -e "${YELLOW}Step 1/4: Stopping containers and removing orphans...${NC}"
if [ -f "$COMPOSE_FILE" ]; then
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
    echo -e "${GREEN}✓ Containers stopped${NC}"
else
    echo -e "${RED}Error: Compose file '$COMPOSE_FILE' not found${NC}"
    exit 1
fi
echo ""

# Step 2: Pull latest images
echo -e "${YELLOW}Step 2/4: Pulling latest images...${NC}"
docker compose -f "$COMPOSE_FILE" pull || echo -e "${YELLOW}Warning: Some images may not have remote versions to pull${NC}"
echo -e "${GREEN}✓ Images pulled${NC}"
echo ""

# Step 3: Build and start containers
echo -e "${YELLOW}Step 3/4: Building and starting containers...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --build
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 4: Show container status
echo -e "${YELLOW}Step 4/4: Checking container status...${NC}"
docker compose -f "$COMPOSE_FILE" ps
echo ""

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Useful commands:"
echo "  View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  Stop services: docker compose -f $COMPOSE_FILE down"
echo "  Restart services: docker compose -f $COMPOSE_FILE restart"
