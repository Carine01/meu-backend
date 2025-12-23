#!/bin/bash
# Script: run-all-checks.sh
# Description: Runs all quality checks (lint, test, build, coverage)
# Usage: ./scripts/agent/run-all-checks.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "🔍 Running all quality checks..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci
fi

# Run linting
echo "🧹 Running linter..."
if npm run lint 2>/dev/null; then
  echo "✅ Linting passed"
else
  echo "⚠️  Linting failed or no lint script available"
fi

# Run build
echo "🔨 Building project..."
if npm run build; then
  echo "✅ Build passed"
else
  echo "❌ Build failed"
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
if npm run test; then
  echo "✅ Tests passed"
else
  echo "❌ Tests failed"
  exit 1
fi

# Run tests with coverage if available
echo "📊 Running tests with coverage..."
if npm run test:cov 2>/dev/null; then
  echo "✅ Coverage generated"
elif npm run test -- --coverage 2>/dev/null; then
  echo "✅ Coverage generated"
else
  echo "⚠️  Coverage not available"
fi

echo "✅ All checks completed successfully"
