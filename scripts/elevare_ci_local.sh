#!/bin/bash
# ELEVARE CI/CD - Local Report Generator
# Gera relatório técnico localmente

set -e

echo "📊 Gerando Relatório CI/CD Local..."
echo "=================================================="

# Create artifacts directory
mkdir -p artifacts

# Create temp directory in project
TEMP_DIR="$(pwd)/.elevare-temp"
mkdir -p "$TEMP_DIR"

# Run auto-fix first
echo "🔧 Executando auto-fix..."
bash scripts/elevare_auto_fix.sh

# Check build
echo ""
echo "🔨 Verificando build..."
BUILD_STATUS="success"
if npm run build 2>&1 | tee "$TEMP_DIR/build.log"; then
    echo "✓ Build: SUCCESS"
else
    BUILD_STATUS="failure"
    echo "✗ Build: FAILURE"
fi

# Check typecheck
echo ""
echo "📝 Verificando TypeScript..."
TYPECHECK_STATUS="success"
if npx tsc --noEmit 2>&1 | tee "$TEMP_DIR/typecheck.log"; then
    echo "✓ TypeCheck: SUCCESS"
else
    TYPECHECK_STATUS="failure"
    echo "✗ TypeCheck: FAILURE"
fi

# Check tests
echo ""
echo "🧪 Executando testes..."
TEST_STATUS="success"
if npm run test -- --ci 2>&1 | tee "$TEMP_DIR/test.log"; then
    echo "✓ Tests: SUCCESS"
else
    TEST_STATUS="failure"
    echo "✗ Tests: FAILURE"
fi

# Check security
echo ""
echo "🔒 Verificando segurança..."
SECURITY_STATUS="success"
npm audit --production --audit-level=high --json > artifacts/npm-audit.json 2>/dev/null || {
    SECURITY_STATUS="warning"
    echo "⚠ Security: WARNINGS"
}

# Check dependencies
echo ""
echo "📦 Verificando dependências..."
npm outdated --json > artifacts/outdated-deps.json 2>/dev/null || true

# Generate comprehensive report
cat > artifacts/ELEVARE_CI_REPORT.md << EOF
# 🚀 ELEVARE CI/CD - RELATÓRIO TÉCNICO LOCAL

**Data:** $(date '+%Y-%m-%d %H:%M:%S')
**Sistema:** $(uname -s)
**Node Version:** $(node --version)
**NPM Version:** $(npm --version)

---

## 📋 RESUMO EXECUTIVO

| Etapa | Status |
|-------|--------|
| 🔧 Auto Fix | ✅ success |
| 🔨 Build | $([ "$BUILD_STATUS" = "success" ] && echo "✅ success" || echo "❌ failure") |
| 📝 TypeCheck | $([ "$TYPECHECK_STATUS" = "success" ] && echo "✅ success" || echo "❌ failure") |
| 🧪 Tests | $([ "$TEST_STATUS" = "success" ] && echo "✅ success" || echo "❌ failure") |
| 🔒 Security | $([ "$SECURITY_STATUS" = "success" ] && echo "✅ success" || echo "⚠️ warning") |

---

## 🔧 AUTO FIX

Script elevare_auto_fix.sh executado com sucesso.

**Ações realizadas:**
- ✓ Dependências verificadas e instaladas
- ✓ Vulnerabilidades verificadas
- ✓ Build anterior limpo
- ✓ TypeScript validado
- ✓ Arquivos temporários removidos

EOF

# Add build details
if [ "$BUILD_STATUS" = "failure" ]; then
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ❌ BUILD - FALHOU

\`\`\`
$(tail -20 "$TEMP_DIR/build.log")
\`\`\`

**Ações necessárias:**
- Corrigir erros de compilação TypeScript
- Verificar configuração tsconfig.json
- Revisar imports e dependências

EOF
else
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ✅ BUILD - SUCESSO

Build compilado com sucesso. Artefatos disponíveis em \`dist/\`.

EOF
fi

# Add typecheck details
if [ "$TYPECHECK_STATUS" = "failure" ]; then
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ❌ TYPECHECK - FALHOU

\`\`\`
$(tail -20 "$TEMP_DIR/typecheck.log")
\`\`\`

**Ações necessárias:**
- Corrigir erros de tipos TypeScript
- Verificar definições de tipos
- Atualizar @types/* packages se necessário

EOF
else
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ✅ TYPECHECK - SUCESSO

Código TypeScript sem erros de tipo.

EOF
fi

# Add test details
if [ "$TEST_STATUS" = "failure" ]; then
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ❌ TESTS - FALHARAM

\`\`\`
$(tail -30 "$TEMP_DIR/test.log")
\`\`\`

**Ações necessárias:**
- Corrigir testes quebrados
- Atualizar mocks/fixtures se necessário
- Verificar ambiente de teste

EOF
else
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## ✅ TESTS - SUCESSO

Todos os testes passaram. Relatório de cobertura disponível em \`coverage/\`.

EOF
fi

# Add security details
cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## 🔒 SEGURANÇA

Análise de vulnerabilidades executada. Veja \`artifacts/npm-audit.json\` para detalhes.

EOF

if [ "$SECURITY_STATUS" = "warning" ]; then
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

**⚠️ Vulnerabilidades detectadas**

Execute:
\`\`\`bash
npm audit fix
\`\`\`

Para mais detalhes:
\`\`\`bash
npm audit
\`\`\`

EOF
fi

# Add dependencies info
cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

## 📦 DEPENDÊNCIAS

Análise de dependências completa. Veja \`artifacts/outdated-deps.json\` para detalhes.

Para atualizar dependências patch/minor:
\`\`\`bash
npm update
\`\`\`

Para ver dependências desatualizadas:
\`\`\`bash
npm outdated
\`\`\`

---

## 🎯 PRÓXIMOS PASSOS

EOF

# Add recommendations based on failures
if [ "$BUILD_STATUS" = "failure" ] || [ "$TYPECHECK_STATUS" = "failure" ] || [ "$TEST_STATUS" = "failure" ]; then
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

### ⚠️ Ações Urgentes

1. **Corrigir falhas identificadas acima**
2. Executar \`npm run elevare:ci-local\` novamente
3. Commit apenas após todos os checks passarem

EOF
else
    cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

### ✅ Tudo OK!

O código está pronto para commit/push:

1. Revisar mudanças: \`git status\`
2. Commit: \`git commit -m "your message"\`
3. Push: \`git push\`

O CI/CD remoto executará automaticamente todos os checks.

EOF
fi

cat >> artifacts/ELEVARE_CI_REPORT.md << EOF

---

**Relatório gerado localmente pelo Elevare CI/CD**
EOF

# Display report
echo ""
echo "=================================================="
echo "📊 RELATÓRIO GERADO: artifacts/ELEVARE_CI_REPORT.md"
echo "=================================================="
echo ""
cat artifacts/ELEVARE_CI_REPORT.md

# Cleanup temp files
rm -rf "$TEMP_DIR"

# Exit with appropriate code
if [ "$BUILD_STATUS" = "failure" ] || [ "$TEST_STATUS" = "failure" ]; then
    echo ""
    echo "❌ Alguns checks falharam. Revise o relatório acima."
    exit 1
else
    echo ""
    echo "✅ Todos os checks principais passaram!"
    exit 0
fi
