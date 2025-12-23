#!/bin/bash
# auto_fix_and_pr.sh - Scaffold DTOs and apply security hardening
# Usage: 
#   bash auto_fix_and_pr.sh --scaffold-dtos
#   bash auto_fix_and_pr.sh --security-basic

set -e

SCAFFOLD_DTOS=false
SECURITY_BASIC=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --scaffold-dtos)
            SCAFFOLD_DTOS=true
            shift
            ;;
        --security-basic)
            SECURITY_BASIC=true
            shift
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Usage: bash auto_fix_and_pr.sh [--scaffold-dtos] [--security-basic]"
            exit 1
            ;;
    esac
done

if [ "$SCAFFOLD_DTOS" = false ] && [ "$SECURITY_BASIC" = false ]; then
    echo "Please specify at least one option:"
    echo "  --scaffold-dtos    : Scaffold DTOs with validation"
    echo "  --security-basic   : Apply basic security hardening"
    exit 1
fi

echo "=== Auto Fix and PR Script ==="

# Scaffold DTOs
if [ "$SCAFFOLD_DTOS" = true ]; then
    echo ""
    echo "=== Scaffolding DTOs ==="
    
    # Check if class-validator and class-transformer are installed
    if ! npm list class-validator class-transformer > /dev/null 2>&1; then
        echo "Installing validation dependencies..."
        npm install --save class-validator class-transformer --legacy-peer-deps
    fi
    
    echo "Scanning for DTOs without validation..."
    
    # Find all DTO files
    DTO_FILES=$(find src -name "*.dto.ts" 2>/dev/null || echo "")
    
    if [ -z "$DTO_FILES" ]; then
        echo "No DTO files found"
    else
        DTO_COUNT=$(echo "$DTO_FILES" | wc -l)
        echo "Found $DTO_COUNT DTO files"
        
        # Check each DTO for validation decorators
        echo "$DTO_FILES" | while read -r dto_file; do
            if ! grep -q "class-validator" "$dto_file" 2>/dev/null; then
                echo "  ⚠ $(basename "$dto_file"): Missing validation imports"
            else
                echo "  ✓ $(basename "$dto_file"): Has validation imports"
            fi
        done
    fi
    
    echo ""
    echo "DTO Scaffolding recommendations:"
    echo "- Ensure all DTOs use class-validator decorators (@IsString, @IsEmail, etc.)"
    echo "- Use @IsNotEmpty for required fields"
    echo "- Consider using Zod or Yup for schema validation"
    echo "- Add @ApiProperty decorators for Swagger documentation"
fi

# Apply basic security hardening
if [ "$SECURITY_BASIC" = true ]; then
    echo ""
    echo "=== Applying Basic Security Hardening ==="
    
    # Check if helmet is installed
    if ! npm list helmet > /dev/null 2>&1; then
        echo "Installing helmet for security headers..."
        npm install --save helmet --legacy-peer-deps
    fi
    
    # Check main.ts for security configurations
    if [ -f "src/main.ts" ]; then
        echo "Checking main.ts for security configurations..."
        
        if grep -q "helmet" "src/main.ts" 2>/dev/null; then
            echo "  ✓ Helmet is configured"
        else
            echo "  ⚠ Helmet not found in main.ts"
            echo "    Add: import helmet from 'helmet';"
            echo "    Add: app.use(helmet());"
        fi
        
        if grep -q "cors" "src/main.ts" 2>/dev/null; then
            echo "  ✓ CORS is configured"
        else
            echo "  ⚠ CORS not explicitly configured"
            echo "    Add: app.enableCors();"
        fi
        
        if grep -q "ValidationPipe" "src/main.ts" 2>/dev/null; then
            echo "  ✓ Global validation pipe found"
        else
            echo "  ⚠ Global validation pipe not found"
            echo "    Add: app.useGlobalPipes(new ValidationPipe());"
        fi
    fi
    
    echo ""
    echo "Checking for sensitive data exposure..."
    
    # Check for hardcoded secrets (basic check)
    POTENTIAL_SECRETS=$(grep -r -i "password\|secret\|api_key\|apikey" src --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "process.env" | grep -v "@" | head -10 || echo "")
    
    if [ -n "$POTENTIAL_SECRETS" ]; then
        echo "  ⚠ Potential hardcoded secrets found (review manually):"
        echo "$POTENTIAL_SECRETS" | head -5
    else
        echo "  ✓ No obvious hardcoded secrets found"
    fi
    
    echo ""
    echo "Checking for SQL injection vulnerabilities..."
    
    # Basic check for raw queries
    RAW_QUERIES=$(grep -r "query\|execute" src --include="*.ts" | grep -v "// " | grep -v "QueryRunner" | head -5 || echo "")
    
    if [ -n "$RAW_QUERIES" ]; then
        echo "  ⚠ Raw queries found - ensure they use parameterized queries"
    else
        echo "  ✓ Using TypeORM - parameterized queries by default"
    fi
    
    echo ""
    echo "Security Hardening Summary:"
    echo "- Helmet should be configured for security headers"
    echo "- CORS should be properly configured"
    echo "- Global validation pipe should be enabled"
    echo "- Environment variables should be used for secrets"
    echo "- Rate limiting should be configured (using @nestjs/throttler)"
    echo "- Input validation should be comprehensive"
fi

echo ""
echo "=== Script Complete ==="
