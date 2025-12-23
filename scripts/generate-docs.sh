#!/bin/bash
# Script: generate-docs.sh
# Description: Generates TypeScript documentation using typedoc
# Usage: ./scripts/generate-docs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "📚 Generating documentation..."

# Check if typedoc is installed
if ! npm list typedoc --depth=0 2>/dev/null; then
  echo "📦 Installing typedoc..."
  npm install --save-dev typedoc
fi

# Create typedoc.json if it doesn't exist
if [ ! -f "typedoc.json" ]; then
  echo "Creating typedoc.json configuration..."
  cat > typedoc.json << 'EOF'
{
  "entryPoints": ["src"],
  "entryPointStrategy": "expand",
  "out": "docs",
  "exclude": [
    "**/node_modules/**",
    "**/*.spec.ts",
    "**/*.test.ts"
  ],
  "excludePrivate": true,
  "excludeProtected": false,
  "readme": "README.md"
}
EOF
fi

# Generate documentation
echo "Generating docs with typedoc..."
npx typedoc

echo "✅ Documentation generated in ./docs"
