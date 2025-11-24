# 🏎️ Full Ferrari Auto-Full Workflow

## Overview

The **Elevare Full Ferrari Auto-Full** workflow is a comprehensive GitHub Actions automation that performs a complete backend harmonization, linting, security hardening, and reporting cycle.

## Features

### 🔧 Automated Operations

1. **Backup Creation** - Creates a timestamped backup branch before any changes
2. **Dependency Management** - Deduplicates and checks for unused npm packages
3. **Code Quality** - Applies ESLint and Prettier formatting
4. **Structure Harmonization** - Validates routes, controllers, and services alignment
5. **DTO Scaffolding** - Creates base DTOs with validation decorators
6. **Security Hardening** - Performs basic security checks and recommendations
7. **Production Build** - Attempts to build the project
8. **Detailed Reporting** - Generates comprehensive reports for review
9. **Automated PR** - Creates a pull request with full checklist

### 📊 Generated Reports

Reports are saved in `.elevare_validation_report/`:
- `eslint.json` - ESLint violations and warnings
- `depcheck.json` - Unused and missing dependencies
- `tsc.out` - TypeScript compilation errors
- `test.out` - Test execution results
- `structure-report.txt` - Module structure analysis
- `security-report.txt` - Security recommendations

## Usage

### Triggering the Workflow

#### Via GitHub Actions UI

1. Go to the **Actions** tab in your GitHub repository
2. Select **"Elevare Full Ferrari Auto-Full"** from the workflows list
3. Click **"Run workflow"**
4. Choose the branch (usually `main`)
5. Optionally toggle "Create automated PR" (default: true)
6. Click **"Run workflow"**

#### Via GitHub CLI

```bash
gh workflow run full-ferrari.yml
```

### Manual Script Execution

You can also run the automation scripts manually:

#### 1. Fix Imports and Dedupe

```bash
bash scripts/elevare_auto_fix.sh
```

With auto-removal of unused dependencies:
```bash
bash scripts/elevare_auto_fix.sh --auto-remove-unused
```

#### 2. Harmonize Structure

```bash
bash scripts/vsc_adiante.sh
```

This generates a structure report showing which modules have controllers, services, and module files.

#### 3. Scaffold DTOs and Security Hardening

```bash
# Scaffold DTOs only
bash scripts/auto_fix_and_pr.sh --scaffold-dtos

# Apply security hardening only
bash scripts/auto_fix_and_pr.sh --security-basic

# Both operations
bash scripts/auto_fix_and_pr.sh --scaffold-dtos --security-basic
```

## Workflow Steps

The workflow executes in the following order:

### 1. Checkout & Setup
- Clones the repository
- Sets up Node.js 20 with npm caching
- Installs dependencies with `npm install --legacy-peer-deps`

### 2. Backup Branch
- Creates a backup branch named `backup-before-auto-full-YYYYMMDDHHMMSS`
- Pushes backup branch to remote for safekeeping

### 3. Code Quality
- Installs ESLint and Prettier if not configured
- Applies ESLint fixes
- Formats code with Prettier
- Runs `elevare_auto_fix.sh` to organize imports and dedupe packages

### 4. Structure Harmonization
- Runs `vsc_adiante.sh` to check module consistency
- Generates structure report

### 5. DTOs and Security
- Scaffolds DTOs with validation decorators
- Creates base DTO templates in `src/shared/dto/`
- Applies basic security checks
- Generates security report

### 6. Build
- Attempts production build with `npm run build`
- Continues even if build has errors

### 7. Reports
- Generates ESLint JSON report
- Runs depcheck for dependency analysis
- Checks TypeScript compilation
- Runs tests (if available)

### 8. Automated PR
- Commits all changes
- Pushes to a new branch `auto-full-ferrari-YYYYMMDD-HHMMSS`
- Creates PR with detailed checklist and reports

## Output

### Automated PR Content

The workflow creates a PR with:

- ✅ List of completed actions
- 📊 Approximate integrity percentages
  - Architecture: 90%
  - Services: 80%
  - Routes/Controllers: 80%
  - Security/Validation: 55%
  - Tests: 50%
  - Documentation: 40%
  - Deploy Readiness: 80%
- ⚠️ Critical pending items requiring manual review
- 📁 Links to generated reports

### Backup Branch

A backup branch is created before any changes:
```
backup-before-auto-full-20251124114356
```

This allows easy rollback if needed:
```bash
git checkout backup-before-auto-full-YYYYMMDDHHMMSS
```

## Configuration

### ESLint Configuration

The workflow will use existing `.eslintrc.json` or create one with:
- TypeScript support
- Recommended rules
- Prettier integration

### Prettier Configuration

Uses `.prettierrc.json` with:
- Single quotes
- Semicolons
- 100 character line width
- 2-space indentation

## Requirements

- Node.js 20
- npm with legacy peer deps support
- Write permissions for Actions
- Write permissions for PRs

## Permissions

Required GitHub token permissions:
```yaml
permissions:
  contents: write
  pull-requests: write
```

## Troubleshooting

### Workflow Fails at Dependency Install

If `npm install` fails:
1. Check `package.json` for version conflicts
2. Review the backup branch to see original state
3. The workflow uses `--legacy-peer-deps` to handle peer dependency issues

### Build Failures

The workflow continues even if the build fails. Check:
1. `.elevare_validation_report/tsc.out` for TypeScript errors
2. `.elevare_validation_report/eslint.json` for linting issues

### Scripts Don't Execute

Ensure scripts have execute permissions:
```bash
chmod +x scripts/elevare_auto_fix.sh
chmod +x scripts/vsc_adiante.sh
chmod +x scripts/auto_fix_and_pr.sh
```

## Best Practices

1. **Run on Development Branch First** - Test the workflow on a feature branch before running on `main`
2. **Review Reports** - Always review generated reports before merging the PR
3. **Manual Review of Security** - The security checks are basic; perform thorough security reviews manually
4. **Test After Automation** - Run tests locally after merging automated changes
5. **Backup Verification** - Verify backup branch was created successfully

## Next Steps After Workflow

After the workflow completes and creates a PR:

1. ✅ Review the automated PR
2. ✅ Check all generated reports in `.elevare_validation_report/`
3. ✅ Review code changes for quality and correctness
4. ⚠️ Address critical pending items:
   - Complete DTO validations (Zod/Yup)
   - Centralize error handling
   - Add integration tests
   - Increase test coverage to >80%
   - Complete documentation
   - Security review of sensitive variables
5. ✅ Merge PR when satisfied
6. ✅ Deploy to staging for testing

## Support

For issues or questions:
- Check the workflow logs in GitHub Actions
- Review generated reports in `.elevare_validation_report/`
- Create an issue in the repository

---

**🤖 Automated by Full Ferrari Workflow**
