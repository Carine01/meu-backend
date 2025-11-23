# Execution Guide - Agent Orchestrator and Patches

## Automatic Execution (Agents/Runner)

### Running the Agent Orchestrator Workflow

The Agent Orchestrator workflow runs agent scripts in sequence automatically.

#### Via GitHub CLI:

```bash
# Set GitHub token
export GITHUB_TOKEN="$(gh auth token)"

# Trigger the workflow on feat/whatsapp-clinicid-filters branch
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref feat/whatsapp-clinicid-filters

# Monitor progress:
gh run list --branch feat/whatsapp-clinicid-filters --limit 10

# View specific run details (replace <RUN_ID> with actual ID from above):
gh run view <RUN_ID> --log --exit-status
```

#### Via GitHub Web UI:

1. Go to: https://github.com/Carine01/meu-backend/actions/workflows/agent-orchestrator.yml
2. Click "Run workflow"
3. Select branch (e.g., `feat/whatsapp-clinicid-filters`)
4. Click "Run workflow"

---

## Manual Execution (VS Code / Terminal)

### Applying Patches

Two patch files are available:
1. `patch-clinicId-filters.patch` - Adds clinicId filters to services
2. `patch-agent-workflows.patch` - Adds Agent Orchestrator workflow

#### Apply the Agent Workflows Patch:

```bash
# Apply the patch
git apply patch-agent-workflows.patch

# If conflicts occur, use --reject to see conflicts:
git apply --reject patch-agent-workflows.patch

# Stage changes
git add .github/workflows/agent-orchestrator.yml

# Commit
git commit -m "chore: add Agent Orchestrator workflow"

# Push to your branch
git push origin HEAD
```

#### Apply the ClinicId Filters Patch:

> **Note:** The `patch-clinicId-filters.patch` uses a custom documentation format.
> Services need to be manually updated according to the patch guidelines.

Refer to the patch file for specific changes needed in each service:
- `src/modules/mensagens/` - Add clinicId filtering
- `src/modules/campanhas/` - Add clinicId filtering
- `src/modules/eventos/` - Add clinicId filtering
- `src/modules/auth/` - Add clinicId to JWT payload
- `src/modules/bi/` - Add clinicId filtering
- `src/modules/agendamentos/bloqueios.service.ts` - Add clinicId filtering
- `src/modules/payments/` - Add clinicId filtering

### Full Manual Setup:

```bash
# 1. Apply patches
git apply patch-agent-workflows.patch
# (Manually apply clinicId changes per patch documentation)

# 2. Install dependencies
npm ci

# 3. Run tests
npm run test

# 4. Build the project
npm run build

# 5. Start with Docker (optional)
docker compose up --build -d

# 6. Health check (if running locally)
curl -sS http://localhost:3000/whatsapp/health | jq .
```

---

## Monitoring and Review

### View Workflow Runs:

```bash
# List recent runs
gh run list --limit 10

# View specific run with logs
gh run view <RUN_ID> --log --exit-status

# Download artifacts
gh run download <RUN_ID>
```

### View Pull Request:

```bash
# View PR details with comments
gh pr view <PR_NUMBER> --comments

# View PR status checks
gh pr checks <PR_NUMBER>
```

### View Artifacts via Web:

1. Go to Actions tab: https://github.com/Carine01/meu-backend/actions
2. Click on a workflow run
3. Scroll to "Artifacts" section at the bottom
4. Download `agent-execution-report` for detailed execution logs

---

## What the Agent Orchestrator Does

The Agent Orchestrator workflow:
1. ✅ Checks out the specified branch
2. ✅ Installs Node.js 18 and dependencies
3. ✅ Runs `fix-entities.ts` script (if exists)
4. ✅ Runs `add-clinicid.ts` script (if exists)
5. ✅ Builds TypeScript
6. ✅ Runs tests
7. ✅ Generates execution report
8. ✅ Uploads report as artifact

---

## Troubleshooting

### If workflow fails:

1. Check the logs: `gh run view <RUN_ID> --log`
2. Download the execution report artifact
3. Look for specific step failures
4. Re-run the workflow if it was a transient issue

### If patch application fails:

```bash
# Check what conflicts exist
git apply --check patch-agent-workflows.patch

# Apply with 3-way merge
git apply -3 patch-agent-workflows.patch

# Or manually copy the workflow file
cp .github/workflows/agent-orchestrator.yml /path/to/your/repo/.github/workflows/
```

### If tests fail:

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test.spec.ts

# Check test coverage
npm test -- --coverage
```

---

## Environment Variables

The Agent Orchestrator workflow uses:
- `NODE_VERSION: '18'` - Node.js version

For local development, you may need:
- `GITHUB_TOKEN` - For GitHub CLI operations
- Database connection strings
- WhatsApp API credentials
- Firebase credentials

---

## Next Steps

After running the Agent Orchestrator:
1. Review the execution report artifact
2. Check if all steps passed
3. Verify build artifacts
4. Review test results
5. Deploy if all checks pass

---

**Last Updated:** 2025-11-23
**Workflow File:** `.github/workflows/agent-orchestrator.yml`
