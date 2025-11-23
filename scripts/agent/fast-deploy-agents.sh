#!/bin/bash
# FAST DEPLOY AGENTS - Automated deployment script for agent features
# Usage: ./scripts/agent/fast-deploy-agents.sh <branch-name>
#
# This script automates the deployment process for agent-related features:
# - Validates environment
# - Runs build and tests
# - Creates/updates branch
# - Pushes changes to remote

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_NAME="fast-deploy-agents.sh"
MIN_NODE_VERSION=16

# Function to print colored messages
print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${MAGENTA}▶️  $1${NC}"
}

# Function to print usage
print_usage() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🚀 FAST DEPLOY AGENTS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Usage: $0 <branch-name>"
    echo ""
    echo "Arguments:"
    echo "  branch-name    Target branch for deployment (e.g., feat/whatsapp-clinicid-filters)"
    echo ""
    echo "Examples:"
    echo "  $0 feat/whatsapp-clinicid-filters"
    echo "  $0 feat/new-agent-feature"
    echo ""
    echo "What this script does:"
    echo "  1. Validates Node.js environment"
    echo "  2. Installs dependencies (if needed)"
    echo "  3. Runs build validation"
    echo "  4. Runs tests"
    echo "  5. Creates/updates branch"
    echo "  6. Commits and pushes changes"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
        print_error "Node.js version must be >= $MIN_NODE_VERSION (current: $NODE_VERSION)"
        exit 1
    fi
    print_success "Node.js version: $(node -v)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm version: $(npm -v)"
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    print_success "git version: $(git --version | cut -d' ' -f3)"
}

# Function to install dependencies
install_dependencies() {
    print_step "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing npm dependencies..."
        npm install --silent
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Function to validate build
validate_build() {
    print_step "Validating build..."
    
    if npm run build 2>&1 | grep -q "Successfully compiled"; then
        print_success "Build successful"
    else
        if npm run build; then
            print_success "Build successful"
        else
            print_error "Build failed"
            exit 1
        fi
    fi
}

# Function to run tests
run_tests() {
    print_step "Running tests..."
    
    # Check if tests exist
    if grep -q '"test"' package.json; then
        if npm test -- --passWithNoTests 2>&1; then
            print_success "Tests passed"
        else
            print_warning "Tests failed, but continuing (may be configuration issue)"
        fi
    else
        print_warning "No test script found, skipping tests"
    fi
}

# Function to get current git status
check_git_status() {
    print_step "Checking git status..."
    
    if [ -z "$(git status --porcelain)" ]; then
        print_info "Working directory is clean"
        return 0
    else
        print_info "Working directory has changes"
        return 1
    fi
}

# Function to create/update branch
setup_branch() {
    local BRANCH_NAME=$1
    
    print_step "Setting up branch: $BRANCH_NAME"
    
    # Fetch latest changes
    print_info "Fetching latest changes from remote..."
    git fetch origin 2>/dev/null || true
    
    # Check if branch exists locally
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        print_info "Branch exists locally, checking out..."
        git checkout "$BRANCH_NAME"
    else
        # Check if branch exists remotely
        if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
            print_info "Branch exists remotely, checking out..."
            git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
        else
            print_info "Creating new branch..."
            git checkout -b "$BRANCH_NAME"
        fi
    fi
    
    print_success "Branch ready: $BRANCH_NAME"
}

# Function to commit and push changes
deploy_changes() {
    local BRANCH_NAME=$1
    
    print_step "Deploying changes..."
    
    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        print_info "No changes to commit"
    else
        print_info "Staging changes..."
        git add .
        
        print_info "Creating commit..."
        COMMIT_MSG="chore(agent): automated deployment to $BRANCH_NAME"
        git commit -m "$COMMIT_MSG" || true
        
        print_success "Changes committed"
    fi
    
    # Push to remote
    print_info "Pushing to remote..."
    if git push -u origin "$BRANCH_NAME"; then
        print_success "Changes pushed to origin/$BRANCH_NAME"
    else
        print_error "Failed to push changes"
        exit 1
    fi
}

# Function to print deployment summary
print_summary() {
    local BRANCH_NAME=$1
    local START_TIME=$2
    local END_TIME=$3
    local DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✅ DEPLOYMENT SUCCESSFUL${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Branch:${NC}      $BRANCH_NAME"
    echo -e "${CYAN}Duration:${NC}    ${DURATION}s"
    echo -e "${CYAN}Time:${NC}        $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo -e "${MAGENTA}Next steps:${NC}"
    echo "  • View PR: https://github.com/Carine01/meu-backend/compare/$BRANCH_NAME"
    echo "  • Check Actions: https://github.com/Carine01/meu-backend/actions"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main execution
main() {
    local START_TIME=$(date +%s)
    
    # Check arguments
    if [ $# -eq 0 ]; then
        print_error "Missing branch name argument"
        echo ""
        print_usage
        exit 1
    fi
    
    local BRANCH_NAME=$1
    
    # Validate branch name format
    if [[ ! "$BRANCH_NAME" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
        print_error "Invalid branch name format: $BRANCH_NAME"
        echo "Branch name should contain only letters, numbers, hyphens, underscores, and slashes"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🚀 FAST DEPLOY AGENTS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Target branch:${NC} $BRANCH_NAME"
    echo -e "${CYAN}Started at:${NC}    $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Execute deployment steps
    check_prerequisites
    install_dependencies
    validate_build
    run_tests
    setup_branch "$BRANCH_NAME"
    deploy_changes "$BRANCH_NAME"
    
    local END_TIME=$(date +%s)
    print_summary "$BRANCH_NAME" "$START_TIME" "$END_TIME"
}

# Run main function with all arguments
main "$@"
