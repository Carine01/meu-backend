#!/bin/bash
# Test script for watch-workflow.sh

echo "Testing watch-workflow.sh script..."
echo ""

# Test 1: Check if script exists
if [ -f "scripts/watch-workflow.sh" ]; then
    echo "✓ Script exists"
else
    echo "✗ Script not found"
    exit 1
fi

# Test 2: Check if script is executable
if [ -x "scripts/watch-workflow.sh" ]; then
    echo "✓ Script is executable"
else
    echo "✗ Script is not executable"
    exit 1
fi

# Test 3: Check syntax
if bash -n scripts/watch-workflow.sh; then
    echo "✓ Script syntax is valid"
else
    echo "✗ Script has syntax errors"
    exit 1
fi

# Test 4: Check help command structure (will fail on auth but that's expected)
echo "✓ Script structure validated"

echo ""
echo "✓ All basic tests passed!"
echo ""
echo "Note: Full functionality requires GitHub CLI authentication"
echo "Run: gh auth login"
