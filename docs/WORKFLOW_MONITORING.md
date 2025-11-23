# GitHub Actions Workflow Monitor

Scripts to easily monitor and watch GitHub Actions workflow runs using the GitHub CLI.

## Prerequisites

1. **GitHub CLI (gh) installed**
   ```bash
   # Install on macOS
   brew install gh
   
   # Install on Linux
   sudo apt install gh
   
   # Install on Windows
   winget install GitHub.cli
   # or
   choco install gh
   ```

2. **Authenticate with GitHub**
   ```bash
   gh auth login
   ```

## Available Scripts

### Bash Script (Linux/macOS)

**Location:** `scripts/watch-workflow.sh`

#### Usage

```bash
# Watch the latest workflow run (default)
./scripts/watch-workflow.sh

# List recent workflow runs
./scripts/watch-workflow.sh list

# Watch a specific workflow run by ID
./scripts/watch-workflow.sh watch 123456

# Show help
./scripts/watch-workflow.sh help
```

### PowerShell Script (Windows/Cross-platform)

**Location:** `scripts/watch-workflow.ps1`

#### Usage

```powershell
# Watch the latest workflow run (default)
.\scripts\watch-workflow.ps1

# List recent workflow runs
.\scripts\watch-workflow.ps1 list

# Watch a specific workflow run by ID
.\scripts\watch-workflow.ps1 watch 123456

# Show help
.\scripts\watch-workflow.ps1 help
```

## Commands Explained

### List Recent Runs
Lists the 10 most recent workflow runs with their status, conclusion, and timing.

```bash
./scripts/watch-workflow.sh list
```

Output example:
```
📋 Recent Workflow Runs:

STATUS  NAME              WORKFLOW        BRANCH  EVENT  ID          ELAPSED  AGE
✓       CI               CI              main    push   1234567890  1m30s    2m
*       Deploy to Cloud  Deploy          main    push   1234567891  -        1m
```

### Watch Latest Run (Auto)
Automatically finds and watches the most recent workflow run in real-time.

```bash
./scripts/watch-workflow.sh auto
# or simply
./scripts/watch-workflow.sh
```

This command:
1. Fetches the latest workflow run ID
2. Starts watching it in real-time
3. Shows live progress updates
4. Exits when the workflow completes

### Watch Specific Run
Watch a specific workflow run by providing its ID.

```bash
./scripts/watch-workflow.sh watch 1234567890
```

## Workflow Integration

These scripts are useful for:

- **CI/CD Monitoring**: Watch deployments and builds in real-time
- **Debugging**: Monitor failing workflows as they run
- **Automation**: Integrate into other scripts to wait for workflow completion
- **Development**: Quick feedback loop during development

## Example Workflow

```bash
# 1. Push changes
git push

# 2. Immediately start watching the triggered workflow
./scripts/watch-workflow.sh

# The script will automatically:
# - Find the workflow run triggered by your push
# - Show you real-time progress
# - Display the final status when complete
```

## Troubleshooting

### "gh: command not found"
Install GitHub CLI from https://cli.github.com/

### "not authenticated"
Run `gh auth login` and follow the prompts

### "No workflow runs found"
Check that:
- You're in the correct repository
- The repository has GitHub Actions workflows
- At least one workflow has been triggered

## Related Files

- `.github/workflows/ci.yml` - Continuous Integration workflow
- `.github/workflows/deploy.yml` - Deployment workflow
- `.github/workflows/docker-builder.yml` - Docker build workflow

## Advanced Usage

### Combined with Git Operations

```bash
# Push and watch in one go
git push && ./scripts/watch-workflow.sh
```

### Get Run ID for Scripting

```bash
# Get the latest run ID
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
echo "Latest run ID: $RUN_ID"

# Watch it
./scripts/watch-workflow.sh watch $RUN_ID
```

### Filter by Workflow

```bash
# List runs for a specific workflow
gh run list --workflow ci.yml

# Watch the latest CI workflow
RUN_ID=$(gh run list --workflow ci.yml --limit 1 --json databaseId --jq '.[0].databaseId')
./scripts/watch-workflow.sh watch $RUN_ID
```

## Contributing

Feel free to enhance these scripts with additional features like:
- Filtering by workflow name
- Notification on completion
- Multiple run monitoring
- Export to log files
