#!/bin/bash
# Quick test script to verify all automation scripts work

echo "🧪 Testing Elevare Automation Scripts..."
echo ""

# Test 1: elevare_auto_fix.sh
echo "Test 1: elevare_auto_fix.sh"
bash elevare_auto_fix.sh --auto-remove-unused > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: vsc_adiante.sh
echo "Test 2: vsc_adiante.sh"
bash vsc_adiante.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 3: auto_fix_and_pr.sh --scaffold-dtos
echo "Test 3: auto_fix_and_pr.sh --scaffold-dtos"
bash auto_fix_and_pr.sh --scaffold-dtos > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 4: auto_fix_and_pr.sh --security-basic
echo "Test 4: auto_fix_and_pr.sh --security-basic"
bash auto_fix_and_pr.sh --security-basic > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 5: Check reports directory
echo "Test 5: Reports directory exists"
if [ -d ".elevare_validation_report" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 6: Check key report files
echo "Test 6: Key report files exist"
FILES=("FINAL_SUMMARY.md" "eslint.json" "depcheck.json" "security-report.txt")
for file in "${FILES[@]}"; do
    if [ ! -f ".elevare_validation_report/$file" ]; then
        echo "❌ FAIL - Missing $file"
        exit 1
    fi
done
echo "✅ PASS"

echo ""
echo "═══════════════════════════════════════"
echo "✅ ALL TESTS PASSED"
echo "═══════════════════════════════════════"
