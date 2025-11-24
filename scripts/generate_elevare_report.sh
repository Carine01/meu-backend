#!/bin/bash
set -e

# Generate Elevare Git Agent Report
# Executa todos os checks e gera relatório completo

echo "=================================================="
echo "  ELEVARE GIT AGENT - Gerador de Relatório"
echo "=================================================="
echo ""

REPORT_FILE="ELEVARE_GIT_AGENT_REPORT.md"
REPORT_DIR="reports"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Create reports directory
mkdir -p "$REPORT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Gerando relatório completo do Elevare Git Agent..."
echo "Timestamp: $TIMESTAMP"
echo ""

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# ELEVARE GIT AGENT REPORT

---

EOF

echo "**Data de Execução:** $TIMESTAMP" >> "$REPORT_FILE"
echo "**Branch:** $(git rev-parse --abbrev-ref HEAD)" >> "$REPORT_FILE"
echo "**Commit SHA:** $(git rev-parse HEAD)" >> "$REPORT_FILE"
echo "**Autor:** $(git config user.name)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Track results
TOTAL_CHECKS=0
PASSED_CHECKS=0
declare -A CHECK_STATUS

# 1. Installation Check
echo -e "${BLUE}[1/7]${NC} Verificando instalação de dependências..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if npm ci --legacy-peer-deps > "$REPORT_DIR/install.log" 2>&1 || npm install --legacy-peer-deps > "$REPORT_DIR/install.log" 2>&1; then
    echo -e "${GREEN}✓${NC} Instalação OK"
    CHECK_STATUS[install]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} Instalação falhou"
    CHECK_STATUS[install]="❌ FAILED"
fi

# 2. Lint Check
echo -e "${BLUE}[2/7]${NC} Executando ESLint..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

LINT_ERRORS=0
LINT_WARNINGS=0

if npx eslint . --format=json --output-file="$REPORT_DIR/eslint.json" 2>&1; then
    echo -e "${GREEN}✓${NC} Lint OK"
    CHECK_STATUS[lint]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    LINT_ERRORS=$(cat "$REPORT_DIR/eslint.json" 2>/dev/null | grep -o '"errorCount":[0-9]*' | awk -F: '{sum+=$2} END {print sum}' || echo "0")
    LINT_WARNINGS=$(cat "$REPORT_DIR/eslint.json" 2>/dev/null | grep -o '"warningCount":[0-9]*' | awk -F: '{sum+=$2} END {print sum}' || echo "0")
    LINT_ERRORS=${LINT_ERRORS:-0}
    LINT_WARNINGS=${LINT_WARNINGS:-0}
    echo -e "${RED}✗${NC} Lint com erros: $LINT_ERRORS erros, $LINT_WARNINGS avisos"
    CHECK_STATUS[lint]="❌ FAILED"
fi

# 3. TypeScript Check
echo -e "${BLUE}[3/7]${NC} Verificando TypeScript..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

TSC_ERRORS=0

if npx tsc --noEmit > "$REPORT_DIR/tsc.log" 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript OK"
    CHECK_STATUS[tsc]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    TSC_ERRORS=$(grep -c "error TS" "$REPORT_DIR/tsc.log" 2>/dev/null || echo "0")
    TSC_ERRORS=${TSC_ERRORS:-0}
    echo -e "${RED}✗${NC} TypeScript com erros: $TSC_ERRORS"
    CHECK_STATUS[tsc]="❌ FAILED"
fi

# 4. Tests
echo -e "${BLUE}[4/7]${NC} Executando testes..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

TEST_FAILED=0

if npm test > "$REPORT_DIR/test.log" 2>&1; then
    echo -e "${GREEN}✓${NC} Testes OK"
    CHECK_STATUS[test]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    TEST_FAILED=$(grep -c "FAIL" "$REPORT_DIR/test.log" 2>/dev/null || echo "0")
    TEST_FAILED=${TEST_FAILED:-0}
    echo -e "${RED}✗${NC} Testes falharam: $TEST_FAILED"
    CHECK_STATUS[test]="❌ FAILED"
fi

# 5. Security Check
echo -e "${BLUE}[5/7]${NC} Verificação de segurança..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

SECURITY_ISSUES=0

# Initialize security log
echo "# Security Check Report" > "$REPORT_DIR/security.log"
echo "Generated: $(date -u)" >> "$REPORT_DIR/security.log"
echo "" >> "$REPORT_DIR/security.log"

# Check for .env files
if find . -name ".env" -not -path "*/node_modules/*" -not -name ".env.example" 2>/dev/null | grep -q .; then
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    echo "❌ Arquivos .env encontrados no repo" >> "$REPORT_DIR/security.log"
fi

# Check for hardcoded secrets
if grep -r "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | grep -v "\.example\|\.md" | head -1 >> "$REPORT_DIR/security.log" 2>&1; then
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# NPM Audit
npm audit --json > "$REPORT_DIR/audit.json" 2>&1 || true
CRITICAL=$(cat "$REPORT_DIR/audit.json" 2>/dev/null | grep -o '"critical":[0-9]*' | head -1 | awk -F: '{print $2}' || echo "0")
HIGH=$(cat "$REPORT_DIR/audit.json" 2>/dev/null | grep -o '"high":[0-9]*' | head -1 | awk -F: '{print $2}' || echo "0")

# Ensure we have numeric values
CRITICAL=${CRITICAL:-0}
HIGH=${HIGH:-0}

if [ "$CRITICAL" -gt 0 ] 2>/dev/null || [ "$HIGH" -gt 0 ] 2>/dev/null; then
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

if [ "$SECURITY_ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Segurança OK"
    CHECK_STATUS[security]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} Problemas de segurança: $SECURITY_ISSUES (Critical: $CRITICAL, High: $HIGH)"
    CHECK_STATUS[security]="❌ FAILED"
fi

# 6. Dependencies Check
echo -e "${BLUE}[6/7]${NC} Verificando dependências..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

npx depcheck --json > "$REPORT_DIR/depcheck.json" 2>&1 || true
UNUSED_DEPS=0

if [ -f "$REPORT_DIR/depcheck.json" ]; then
    UNUSED_DEPS=$(cat "$REPORT_DIR/depcheck.json" | grep -o '"dependencies":\[.*\]' | grep -c ',' 2>/dev/null || echo "0")
fi

UNUSED_DEPS=${UNUSED_DEPS:-0}

if [ "$UNUSED_DEPS" -gt 0 ] 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} Dependências não usadas: $UNUSED_DEPS"
    CHECK_STATUS[deps]="⚠️ WARNING"
else
    echo -e "${GREEN}✓${NC} Dependências OK"
    CHECK_STATUS[deps]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# 7. Warnings Check
echo -e "${BLUE}[7/7]${NC} Verificando avisos críticos..."
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

CRITICAL_WARNINGS=0

# Check for warnings in TypeScript
if [ -f "$REPORT_DIR/tsc.log" ]; then
    CRITICAL_WARNINGS=$(grep -c "warning" "$REPORT_DIR/tsc.log" 2>/dev/null || echo "0")
fi

# Ensure numeric value
CRITICAL_WARNINGS=${CRITICAL_WARNINGS:-0}

if [ "$CRITICAL_WARNINGS" -eq 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Sem avisos críticos"
    CHECK_STATUS[warnings]="✅ SUCCESS"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠${NC} Avisos encontrados: $CRITICAL_WARNINGS"
    CHECK_STATUS[warnings]="⚠️ WARNING"
fi

echo ""

# Calculate integrity percentage
INTEGRITY=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

# Generate report content
cat >> "$REPORT_FILE" << EOF
## RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Integridade da Branch** | **${INTEGRITY}%** |
| Checks Passaram | $PASSED_CHECKS / $TOTAL_CHECKS |
| Erros de Lint | $LINT_ERRORS |
| Erros TypeScript | $TSC_ERRORS |
| Testes Falhados | $TEST_FAILED |
| Problemas de Segurança | $SECURITY_ISSUES |
| Dependências Não Usadas | $UNUSED_DEPS |
| Avisos Críticos | $CRITICAL_WARNINGS |

---

## CHECKS EXECUTADOS

| Check | Status |
|-------|--------|
| Instalação | ${CHECK_STATUS[install]} |
| ESLint | ${CHECK_STATUS[lint]} |
| TypeScript | ${CHECK_STATUS[tsc]} |
| Testes | ${CHECK_STATUS[test]} |
| Segurança | ${CHECK_STATUS[security]} |
| Dependências | ${CHECK_STATUS[deps]} |
| Avisos | ${CHECK_STATUS[warnings]} |

---

## LOGS COMPLETOS

### 1. Instalação de Dependências

\`\`\`
$(tail -50 "$REPORT_DIR/install.log" 2>/dev/null || echo "Log não disponível")
\`\`\`

### 2. ESLint

\`\`\`json
$(head -100 "$REPORT_DIR/eslint.json" 2>/dev/null || echo "{}")
\`\`\`

### 3. TypeScript Compilation

\`\`\`
$(head -100 "$REPORT_DIR/tsc.log" 2>/dev/null || echo "Nenhum erro")
\`\`\`

### 4. Testes

\`\`\`
$(tail -100 "$REPORT_DIR/test.log" 2>/dev/null || echo "Log não disponível")
\`\`\`

### 5. Segurança

\`\`\`
$(cat "$REPORT_DIR/security.log" 2>/dev/null || echo "Nenhum problema crítico")
\`\`\`

### 6. NPM Audit

\`\`\`json
$(head -100 "$REPORT_DIR/audit.json" 2>/dev/null || echo "{}")
\`\`\`

---

## PORCENTAGEM REAL DE INTEGRIDADE DA BRANCH

**${INTEGRITY}%**

EOF

# Approval section
if [ "$INTEGRITY" -eq 100 ]; then
    cat >> "$REPORT_FILE" << 'EOF'
## CRITÉRIO DE EXCELÊNCIA

### ✅ APROVADO

Todos os checks críticos passaram:

- ✅ CI está 100% verde
- ✅ Lint 0 erros
- ✅ TSC sem falhas
- ✅ Testes passando
- ✅ Nenhum segredo vazando
- ✅ Nenhum warning crítico
- ✅ Nenhuma dependência abandonada

**Status:** Branch aprovada para merge/deploy.

EOF
else
    cat >> "$REPORT_FILE" << EOF
## CRITÉRIO DE EXCELÊNCIA

### ❌ REPROVADO

Branch não atende aos critérios mínimos.

**Problemas Detectados:**

EOF

    [ "${LINT_ERRORS:-0}" -gt 0 ] 2>/dev/null && echo "- ❌ $LINT_ERRORS erros de lint" >> "$REPORT_FILE"
    [ "${TSC_ERRORS:-0}" -gt 0 ] 2>/dev/null && echo "- ❌ $TSC_ERRORS erros TypeScript" >> "$REPORT_FILE"
    [ "${TEST_FAILED:-0}" -gt 0 ] 2>/dev/null && echo "- ❌ $TEST_FAILED testes falhados" >> "$REPORT_FILE"
    [ "${SECURITY_ISSUES:-0}" -gt 0 ] 2>/dev/null && echo "- ❌ $SECURITY_ISSUES problemas de segurança" >> "$REPORT_FILE"
    [ "${UNUSED_DEPS:-0}" -gt 0 ] 2>/dev/null && echo "- ⚠️ $UNUSED_DEPS dependências não usadas" >> "$REPORT_FILE"
    [ "${CRITICAL_WARNINGS:-0}" -gt 0 ] 2>/dev/null && echo "- ⚠️ $CRITICAL_WARNINGS avisos críticos" >> "$REPORT_FILE"
    
    cat >> "$REPORT_FILE" << 'EOF'

**Status:** Reprovar até correções serem aplicadas.

EOF
fi

# Suggestions
cat >> "$REPORT_FILE" << 'EOF'
---

## SUGESTÕES OBJETIVAS

1. Execute auto-fix: `./scripts/elevare_auto_fix.sh`
2. Crie PR automático: `./scripts/auto_fix_and_pr.sh`
3. Revise logs completos no diretório `reports/`
4. Corrija problemas que não podem ser automatizados
5. Re-execute este script após correções

---

**Fim do Relatório**

EOF

# Display summary
echo "=================================================="
echo "  RELATÓRIO GERADO"
echo "=================================================="
echo ""
echo -e "Integridade da Branch: ${BLUE}${INTEGRITY}%${NC}"
echo ""
echo "Checks executados: $TOTAL_CHECKS"
echo "Checks passaram: $PASSED_CHECKS"
echo ""

if [ "$INTEGRITY" -eq 100 ]; then
    echo -e "${GREEN}✅ APROVADO${NC} - Branch pronta para merge/deploy"
else
    echo -e "${RED}❌ REPROVADO${NC} - Correções necessárias"
fi

echo ""
echo "Relatório salvo em: $REPORT_FILE"
echo "Logs detalhados em: $REPORT_DIR/"
echo ""
echo "=================================================="

# Return exit code based on integrity
if [ "$INTEGRITY" -ge 80 ]; then
    exit 0
else
    exit 1
fi
