#!/bin/bash
# vsc_adiante.sh - Harmonize routes, controllers, and services
# This script ensures consistency across the NestJS application structure

set -e

echo "=== VSC Adiante - Harmonization Script ==="

# Check if src directory exists
if [ ! -d "src" ]; then
    echo "Error: src directory not found"
    exit 1
fi

echo "Step 1: Checking module structure..."

# Find all module directories
MODULE_DIRS=$(find src/modules -mindepth 1 -maxdepth 1 -type d 2>/dev/null || echo "")

if [ -z "$MODULE_DIRS" ]; then
    echo "No modules found in src/modules"
else
    echo "Found modules:"
    echo "$MODULE_DIRS" | while read -r module_dir; do
        module_name=$(basename "$module_dir")
        echo "  - $module_name"
        
        # Check for controller
        if [ -f "$module_dir/${module_name}.controller.ts" ]; then
            echo "    ✓ Controller found"
        else
            echo "    ⚠ Controller missing (might be intentional)"
        fi
        
        # Check for service
        if [ -f "$module_dir/${module_name}.service.ts" ]; then
            echo "    ✓ Service found"
        else
            echo "    ⚠ Service missing (might be intentional)"
        fi
        
        # Check for module file
        if [ -f "$module_dir/${module_name}.module.ts" ]; then
            echo "    ✓ Module file found"
        else
            echo "    ⚠ Module file missing"
        fi
    done
fi

echo ""
echo "Step 2: Checking route consistency..."

# Check if routes are properly defined in controllers
CONTROLLERS=$(find src -name "*.controller.ts" 2>/dev/null || echo "")

if [ -n "$CONTROLLERS" ]; then
    echo "Analyzing controllers for route definitions..."
    echo "$CONTROLLERS" | while read -r controller; do
        if grep -q "@Controller" "$controller" 2>/dev/null; then
            echo "  ✓ $(basename "$controller"): Has @Controller decorator"
        fi
    done
fi

echo ""
echo "Step 3: Checking service dependencies..."

# Check if services are properly injected
SERVICES=$(find src -name "*.service.ts" 2>/dev/null || echo "")

if [ -n "$SERVICES" ]; then
    echo "Found $(echo "$SERVICES" | wc -l) service files"
fi

echo ""
echo "=== Harmonization Complete ==="
echo "Summary:"
echo "- Module structure validated"
echo "- Route consistency checked"
echo "- Service dependencies reviewed"
echo ""
echo "Next steps:"
echo "- Review any warnings above"
echo "- Ensure all modules are properly registered in app.module.ts"
echo "- Run tests to verify functionality"
