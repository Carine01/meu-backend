#!/bin/bash
# Script to list and watch GitHub Actions workflow runs
# Usage: ./watch-workflow.sh [list|watch|auto]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Function to list recent workflow runs
list_runs() {
    echo -e "${BLUE}📋 Recent Workflow Runs:${NC}\n"
    gh run list --limit 10
}

# Function to watch a specific run
watch_run() {
    local run_id=$1
    if [ -z "$run_id" ]; then
        echo -e "${RED}Error: Run ID is required${NC}"
        exit 1
    fi
    echo -e "${YELLOW}👀 Watching workflow run #${run_id}...${NC}\n"
    gh run watch "$run_id"
}

# Function to automatically watch the latest run
watch_latest() {
    echo -e "${BLUE}🔍 Finding latest workflow run...${NC}"
    
    # Get the latest run ID
    local latest_run_id=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
    
    if [ -z "$latest_run_id" ]; then
        echo -e "${RED}Error: No workflow runs found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Found latest run: #${latest_run_id}${NC}\n"
    echo -e "${YELLOW}👀 Watching workflow run...${NC}\n"
    gh run watch "$latest_run_id"
}

# Main script logic
case "${1:-auto}" in
    list)
        list_runs
        ;;
    watch)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please provide a run ID${NC}"
            echo "Usage: $0 watch <run_id>"
            exit 1
        fi
        watch_run "$2"
        ;;
    auto|latest)
        watch_latest
        ;;
    help|--help|-h)
        echo "GitHub Actions Workflow Monitor"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  list              List recent workflow runs"
        echo "  watch <run_id>    Watch a specific workflow run"
        echo "  auto              Watch the latest workflow run (default)"
        echo "  latest            Same as auto"
        echo "  help              Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                # Watch latest run"
        echo "  $0 list           # List recent runs"
        echo "  $0 watch 123456   # Watch specific run"
        ;;
    *)
        echo -e "${RED}Error: Unknown command '${1}'${NC}"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
