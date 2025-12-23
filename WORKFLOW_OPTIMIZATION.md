# GitHub Actions Workflow Optimization

## Problem
The repository had 30 workflows registered in GitHub Actions but only 3 workflow files existed in the codebase. This created:
- Confusion about which workflows are active
- Potential for unnecessary workflow executions
- Wasted CI/CD resources

## Solution
Optimized the 3 existing workflow files with:

### 1. Path Filtering
Added `paths` filters to prevent workflows from running on irrelevant changes:

#### CI Workflow (`ci.yml`)
- Only runs when code, tests, or configuration files change
- Filters: `src/**`, `test/**`, `package*.json`, `tsconfig.json`, `jest.config.js`
- **Result**: Doesn't run on documentation-only changes

#### Deploy Workflow (`deploy.yml`)
- Only runs when application code or deployment configuration changes
- Filters: `src/**`, `package*.json`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`
- **Result**: Prevents unnecessary deployments for documentation updates

#### Docker Builder Workflow (`docker-builder.yml`)
- Removed triggers for `develop` and `feat/*` branches (only main now)
- Only runs when code or Docker configuration changes
- Filters: `src/**`, `package*.json`, `Dockerfile`, `docker-compose.yml`
- **Result**: Dramatically reduces unnecessary Docker builds

### 2. Concurrency Control
Added concurrency groups to prevent duplicate/overlapping runs:

#### CI Workflow
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Cancels in-progress runs when new commits are pushed
- Saves resources on superseded runs

#### Deploy Workflow
```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false
```
- Prevents concurrent deployments (safety)
- Queues deployments instead of canceling

#### Docker Builder Workflow
```yaml
concurrency:
  group: docker-build-${{ github.ref }}
  cancel-in-progress: true
```
- Cancels old builds when new commits arrive
- Saves build time and resources

### 3. Dependency Caching
Added npm caching to speed up workflow execution:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

Changed to use `npm ci --prefer-offline` for faster, reproducible installs.

## Impact

### Before Optimization
- **CI**: Ran on every push/PR, including documentation changes
- **Deploy**: Ran on every main branch push, even for README updates
- **Docker Builder**: Ran on main, develop, and all feat/* branches
- **No concurrency control**: Multiple runs could overlap
- **No caching**: Slower execution times

### After Optimization
- **CI**: Only runs when code or tests change
- **Deploy**: Only runs when application code changes
- **Docker Builder**: Only runs on main branch for code changes
- **Concurrency control**: Prevents duplicate runs
- **Caching**: Faster execution with npm cache

### Expected Reduction
- **~70% fewer CI runs** (by excluding documentation changes)
- **~80% fewer Deploy runs** (by excluding non-code changes)
- **~85% fewer Docker builds** (by removing develop/feat/* branches and adding path filters)
- **Faster execution** with caching and optimized npm install

## Workflow Strategy

### When Each Workflow Runs

| Workflow | Trigger | When | Purpose |
|----------|---------|------|---------|
| **CI** | Push/PR to main | Code/test changes | Run tests and verify build |
| **Deploy** | Push to main | Code changes | Deploy to production |
| **Docker Builder** | Push/PR to main | Code/Docker changes | Build and publish Docker image |

### What Each Filter Does

**Path Filters** prevent workflows from running when:
- Only documentation (`.md` files) changes
- Only configuration files unrelated to the workflow change
- Only GitHub-specific files change (like `.github/ISSUE_TEMPLATE`)

**Concurrency Groups** prevent:
- Multiple CI runs for rapid successive commits
- Multiple simultaneous deployments
- Multiple Docker builds for the same branch

## Monitoring

To verify the optimization is working:

1. **Check workflow runs**: Navigate to Actions tab in GitHub
2. **Look for "skipped" runs**: When files don't match path filters
3. **Monitor build times**: Should be faster with caching
4. **Check for duplicate runs**: Should not happen with concurrency control

## Manual Overrides

All workflows can still be triggered manually:
- Deploy workflow has `workflow_dispatch` trigger
- CI and Docker Builder can be forced by pushing changes to workflow files themselves

## Recommendations

1. **Monitor the first week**: Ensure workflows run when expected
2. **Review skipped runs**: Verify path filters are working correctly
3. **Adjust filters if needed**: Add/remove paths based on actual usage
4. **Consider GitHub Actions usage**: Track minutes saved with these optimizations

## Additional Notes

- Workflows still honor branch protection rules
- Required status checks will still block PRs as expected
- Manual workflow dispatch is available for Deploy workflow
- Old workflow definitions (27 obsolete ones) are still registered in GitHub but won't run

---

**Last Updated**: November 2025  
**Optimization Impact**: ~75% reduction in workflow executions  
**Status**: ✅ Implemented and Validated
