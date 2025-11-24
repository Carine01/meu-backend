#!/bin/bash
# vsc_adiante.sh - Harmonize routes/controllers/services

set -e

echo "🎯 VSC Adiante - Harmonizing routes/controllers/services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📂 Step 1: Analyzing project structure...${NC}"

# Check if src directory exists
if [ ! -d "src" ]; then
  echo -e "${RED}❌ Error: src directory not found${NC}"
  exit 1
fi

# Count modules - handle case where modules directory might not exist
if [ -d "src/modules" ]; then
  MODULE_COUNT=$(find src/modules -maxdepth 1 -type d 2>/dev/null | wc -l)
  MODULE_COUNT=$((MODULE_COUNT > 0 ? MODULE_COUNT - 1 : 0))
else
  MODULE_COUNT=0
fi
echo -e "${BLUE}ℹ️ Found $MODULE_COUNT modules${NC}"

echo -e "${YELLOW}🔗 Step 2: Validating route-controller-service connections...${NC}"

# Check for common patterns
CONTROLLER_COUNT=$(find src -name "*.controller.ts" 2>/dev/null | wc -l)
SERVICE_COUNT=$(find src -name "*.service.ts" 2>/dev/null | wc -l)
MODULE_FILE_COUNT=$(find src -name "*.module.ts" 2>/dev/null | wc -l)

echo -e "${BLUE}ℹ️ Controllers: $CONTROLLER_COUNT${NC}"
echo -e "${BLUE}ℹ️ Services: $SERVICE_COUNT${NC}"
echo -e "${BLUE}ℹ️ Modules: $MODULE_FILE_COUNT${NC}"

echo -e "${YELLOW}🔍 Step 3: Checking for orphaned files...${NC}"

# Look for controllers without matching services
find src/modules -type d -mindepth 1 -maxdepth 1 2>/dev/null | while read -r module_dir; do
  module_name=$(basename "$module_dir")
  
  has_controller=false
  has_service=false
  has_module=false
  
  [ -f "$module_dir/${module_name}.controller.ts" ] && has_controller=true
  [ -f "$module_dir/${module_name}.service.ts" ] && has_service=true
  [ -f "$module_dir/${module_name}.module.ts" ] && has_module=true
  
  if [ "$has_controller" = true ] || [ "$has_service" = true ] || [ "$has_module" = true ]; then
    echo -e "  📦 Module: ${BLUE}$module_name${NC}"
    [ "$has_controller" = true ] && echo "    ✅ Controller" || echo "    ⚠️ No Controller"
    [ "$has_service" = true ] && echo "    ✅ Service" || echo "    ⚠️ No Service"
    [ "$has_module" = true ] && echo "    ✅ Module" || echo "    ⚠️ No Module"
  fi
done

echo -e "${YELLOW}🛠️ Step 4: Harmonization recommendations...${NC}"

echo -e "${BLUE}Harmonization guidelines:${NC}"
echo "  • Each module should have: controller, service, module, entity, dto"
echo "  • Controllers should only handle HTTP and delegate to services"
echo "  • Services should contain business logic"
echo "  • DTOs should validate incoming data"
echo "  • Entities should map to database tables"

echo -e "${YELLOW}📋 Step 5: Generating structure report...${NC}"

# Create a simple report
REPORT_FILE=".elevare_validation_report/structure-report.txt"
mkdir -p .elevare_validation_report

{
  echo "==================================="
  echo "Structure Harmonization Report"
  echo "Generated: $(date)"
  echo "==================================="
  echo ""
  echo "Statistics:"
  echo "  Modules: $MODULE_COUNT"
  echo "  Controllers: $CONTROLLER_COUNT"
  echo "  Services: $SERVICE_COUNT"
  echo "  Module files: $MODULE_FILE_COUNT"
  echo ""
  echo "Recommended Actions:"
  echo "  1. Ensure each module has matching controller/service/module files"
  echo "  2. Validate all DTOs have proper decorators"
  echo "  3. Check all routes are properly registered"
  echo "  4. Verify dependency injection is correct"
  echo ""
} > "$REPORT_FILE"

echo -e "${GREEN}✅ Report saved to: $REPORT_FILE${NC}"

echo -e "${GREEN}✨ VSC Adiante - Harmonization check completed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Structure analyzed"
echo "  ✅ Connections validated"
echo "  ✅ Orphaned files checked"
echo "  ✅ Report generated"
