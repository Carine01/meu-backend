# Agent Scripts

This directory contains scripts for automated agent deployments and operations.

## fast-deploy-agents.sh

A comprehensive deployment script that automates the process of deploying agent-related features to a specified branch.

### Usage

```bash
./scripts/agent/fast-deploy-agents.sh <branch-name>
```

### Arguments

- `branch-name` - Target branch for deployment (e.g., `feat/whatsapp-clinicid-filters`)

### Examples

```bash
# Deploy to a feature branch
./scripts/agent/fast-deploy-agents.sh feat/whatsapp-clinicid-filters

# Deploy to a new agent feature branch
./scripts/agent/fast-deploy-agents.sh feat/new-agent-feature
```

### What the script does

1. **Validates prerequisites** - Checks Node.js, npm, and git installation and versions
2. **Installs dependencies** - Ensures npm packages are installed (if needed)
3. **Validates build** - Runs `npm run build` to ensure code compiles
4. **Runs tests** - Executes test suite (continues even if tests fail)
5. **Sets up branch** - Creates or checks out the target branch
6. **Commits changes** - Stages and commits any pending changes
7. **Pushes to remote** - Attempts to push changes to origin (requires authentication)

### Features

- **Colored output** - Clear, color-coded terminal messages for better visibility
- **Error handling** - Graceful handling of failures with informative error messages
- **Progress tracking** - Step-by-step progress indicators
- **Deployment summary** - Summary with timing information and next steps
- **Branch validation** - Validates branch name format

### Prerequisites

- **Node.js** - Version 16 or higher
- **npm** - Package manager
- **git** - Version control system

### Exit Codes

- `0` - Success
- `1` - Failure (invalid arguments, failed prerequisites, or failed build)

### Notes

- The script will create a new branch if it doesn't exist
- If the branch exists locally or remotely, it will check it out
- Tests that fail won't stop the deployment (warning only)
- Git authentication is required for pushing to remote

### Troubleshooting

#### Authentication Failed

If you see "Authentication failed" when pushing, ensure you have:
- Valid GitHub credentials configured
- Proper SSH keys set up (if using SSH)
- Personal Access Token configured (if using HTTPS)

#### Build Failed

If the build fails:
1. Check for TypeScript errors in the output
2. Ensure all dependencies are installed
3. Review recent code changes for syntax errors

#### Tests Failed

Test failures won't stop deployment, but you should:
1. Review the failing tests
2. Fix issues in the code
3. Run tests locally before deploying
