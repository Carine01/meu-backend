#!/bin/bash

# GitHub Secrets Configuration Script
# This script guides users through setting up required GitHub secrets for the meu-backend repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed."
        echo "Please install it from: https://cli.github.com/"
        exit 1
    fi
    print_success "GitHub CLI (gh) is installed"
}

# Function to check if user is authenticated
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "You are not authenticated with GitHub CLI."
        echo "Please run: gh auth login"
        exit 1
    fi
    print_success "GitHub CLI is authenticated"
}

# Function to check if openssl is installed
check_openssl() {
    if ! command -v openssl &> /dev/null; then
        print_error "OpenSSL is not installed."
        echo "Please install OpenSSL to generate secure JWT secrets."
        exit 1
    fi
    print_success "OpenSSL is installed"
}

# Function to generate secure random string
generate_secure_secret() {
    local length=${1:-64}
    openssl rand -base64 "$length" | tr -d '\n'
}

# Function to validate URL format
validate_url() {
    local url=$1
    if [[ $url =~ ^(https?|postgresql|mongodb(\+srv)?):// ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate non-empty string
validate_non_empty() {
    local value=$1
    if [[ -n "$value" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate Firebase service account JSON
validate_firebase_json() {
    local json=$1
    if echo "$json" | jq empty 2>/dev/null; then
        # Check for required Firebase fields
        if echo "$json" | jq -e '.project_id and .private_key and .client_email' > /dev/null 2>&1; then
            return 0
        else
            print_warning "JSON is valid but missing required Firebase fields (project_id, private_key, client_email)"
            return 1
        fi
    else
        return 1
    fi
}

# Function to set GitHub secret
set_github_secret() {
    local secret_name=$1
    local secret_value=$2
    local repo=${3:-"Carine01/meu-backend"}
    
    print_info "Setting secret: $secret_name"
    
    if echo "$secret_value" | gh secret set "$secret_name" --repo "$repo"; then
        print_success "Secret $secret_name set successfully"
        return 0
    else
        print_error "Failed to set secret $secret_name"
        return 1
    fi
}

# Function to prompt for secret with validation
prompt_for_secret() {
    local secret_name=$1
    local description=$2
    local validator=$3
    local allow_generate=${4:-false}
    
    echo ""
    print_info "Configuring: $secret_name"
    echo "Description: $description"
    
    while true; do
        if [[ "$allow_generate" == "true" ]]; then
            echo -e "\nOptions:"
            echo "  1) Enter value manually"
            echo "  2) Generate secure random value"
            read -p "Choose option [1/2]: " option
            
            if [[ "$option" == "2" ]]; then
                local generated_value=$(generate_secure_secret 64)
                echo -e "\n${GREEN}Generated secure value:${NC}"
                echo "$generated_value"
                echo ""
                read -p "Use this generated value? [Y/n]: " confirm
                if [[ "$confirm" =~ ^[Yy]$ ]] || [[ -z "$confirm" ]]; then
                    echo "$generated_value"
                    return 0
                fi
            fi
        fi
        
        read -sp "Enter value for $secret_name: " value
        echo ""
        
        if [[ -z "$value" ]]; then
            print_error "Value cannot be empty. Please try again."
            continue
        fi
        
        # Run validation
        case $validator in
            "url")
                if validate_url "$value"; then
                    echo "$value"
                    return 0
                else
                    print_error "Invalid URL format. Please enter a valid URL (e.g., postgresql://..., https://...)"
                fi
                ;;
            "json")
                if validate_firebase_json "$value"; then
                    echo "$value"
                    return 0
                else
                    print_error "Invalid JSON or missing required Firebase fields. Please try again."
                fi
                ;;
            "non_empty")
                if validate_non_empty "$value"; then
                    echo "$value"
                    return 0
                else
                    print_error "Value cannot be empty. Please try again."
                fi
                ;;
            *)
                echo "$value"
                return 0
                ;;
        esac
    done
}

# Function to check if jq is installed (for JSON validation)
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Firebase JSON validation will be skipped."
        return 1
    fi
    return 0
}

# Main script
main() {
    print_header "GitHub Secrets Configuration Script"
    
    print_info "This script will help you configure all required GitHub secrets for meu-backend"
    echo ""
    
    # Check prerequisites
    print_header "Checking Prerequisites"
    check_gh_cli
    check_gh_auth
    check_openssl
    local has_jq=false
    if check_jq; then
        has_jq=true
        print_success "jq is installed (JSON validation enabled)"
    fi
    
    # Get repository name (allow override)
    echo ""
    read -p "Enter repository name [Carine01/meu-backend]: " repo_name
    repo_name=${repo_name:-"Carine01/meu-backend"}
    print_info "Using repository: $repo_name"
    
    # Confirm before proceeding
    echo ""
    print_warning "This script will configure the following secrets:"
    echo "  - DB_URL: Database connection URL"
    echo "  - JWT_SECRET: JWT token secret"
    echo "  - JWT_REFRESH_SECRET: JWT refresh token secret"
    echo "  - WHATSAPP_API_KEY: WhatsApp API key"
    echo "  - FIREBASE_SERVICE_ACCOUNT: Firebase service account JSON"
    echo ""
    read -p "Do you want to proceed? [Y/n]: " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        print_info "Configuration cancelled."
        exit 0
    fi
    
    # Array to track configured secrets
    declare -a configured_secrets
    declare -a failed_secrets
    
    # Configure DB_URL
    print_header "1/5: Database URL (DB_URL)"
    DB_URL=$(prompt_for_secret "DB_URL" "Database connection URL (e.g., postgresql://user:pass@host:port/dbname)" "url" false)
    if set_github_secret "DB_URL" "$DB_URL" "$repo_name"; then
        configured_secrets+=("DB_URL")
    else
        failed_secrets+=("DB_URL")
    fi
    
    # Configure JWT_SECRET
    print_header "2/5: JWT Secret (JWT_SECRET)"
    JWT_SECRET=$(prompt_for_secret "JWT_SECRET" "Secret key for signing JWT tokens (can be auto-generated)" "non_empty" true)
    if set_github_secret "JWT_SECRET" "$JWT_SECRET" "$repo_name"; then
        configured_secrets+=("JWT_SECRET")
    else
        failed_secrets+=("JWT_SECRET")
    fi
    
    # Configure JWT_REFRESH_SECRET
    print_header "3/5: JWT Refresh Secret (JWT_REFRESH_SECRET)"
    JWT_REFRESH_SECRET=$(prompt_for_secret "JWT_REFRESH_SECRET" "Secret key for signing JWT refresh tokens (can be auto-generated)" "non_empty" true)
    if set_github_secret "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "$repo_name"; then
        configured_secrets+=("JWT_REFRESH_SECRET")
    else
        failed_secrets+=("JWT_REFRESH_SECRET")
    fi
    
    # Configure WHATSAPP_API_KEY
    print_header "4/5: WhatsApp API Key (WHATSAPP_API_KEY)"
    WHATSAPP_API_KEY=$(prompt_for_secret "WHATSAPP_API_KEY" "API key for WhatsApp integration" "non_empty" false)
    if set_github_secret "WHATSAPP_API_KEY" "$WHATSAPP_API_KEY" "$repo_name"; then
        configured_secrets+=("WHATSAPP_API_KEY")
    else
        failed_secrets+=("WHATSAPP_API_KEY")
    fi
    
    # Configure FIREBASE_SERVICE_ACCOUNT
    print_header "5/5: Firebase Service Account (FIREBASE_SERVICE_ACCOUNT)"
    echo "You can paste the entire JSON content here."
    echo "Tip: Copy the content from your Firebase service account JSON file."
    if [[ "$has_jq" == true ]]; then
        FIREBASE_SERVICE_ACCOUNT=$(prompt_for_secret "FIREBASE_SERVICE_ACCOUNT" "Firebase service account JSON (entire JSON object)" "json" false)
    else
        FIREBASE_SERVICE_ACCOUNT=$(prompt_for_secret "FIREBASE_SERVICE_ACCOUNT" "Firebase service account JSON (entire JSON object)" "non_empty" false)
    fi
    if set_github_secret "FIREBASE_SERVICE_ACCOUNT" "$FIREBASE_SERVICE_ACCOUNT" "$repo_name"; then
        configured_secrets+=("FIREBASE_SERVICE_ACCOUNT")
    else
        failed_secrets+=("FIREBASE_SERVICE_ACCOUNT")
    fi
    
    # Summary
    print_header "Configuration Summary"
    
    echo -e "${GREEN}Successfully configured secrets (${#configured_secrets[@]}/5):${NC}"
    for secret in "${configured_secrets[@]}"; do
        echo "  ✓ $secret"
    done
    
    if [[ ${#failed_secrets[@]} -gt 0 ]]; then
        echo ""
        echo -e "${RED}Failed to configure secrets (${#failed_secrets[@]}/5):${NC}"
        for secret in "${failed_secrets[@]}"; do
            echo "  ✗ $secret"
        done
        echo ""
        print_error "Some secrets failed to configure. Please check the errors above and try again."
        exit 1
    else
        echo ""
        print_success "All secrets have been successfully configured!"
        echo ""
        print_info "You can view your secrets at:"
        echo "  https://github.com/$repo_name/settings/secrets/actions"
        echo ""
        print_info "Your GitHub Actions workflows can now access these secrets."
    fi
}

# Run main function
main
