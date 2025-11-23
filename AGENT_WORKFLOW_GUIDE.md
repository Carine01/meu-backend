# 🤖 AGENT_WORKFLOW_GUIDE.md

## Quick Reference for GitHub Agents

This guide provides a quick reference for GitHub agents/bots to execute the automated PR workflow.

---

## 📋 Complete Workflow (Copy & Paste)

### When PR is opened or synchronized:

```bash
# Set variables
export PR_NUMBER=<PR_NUMBER>
export BRANCH=<BRANCH_NAME>
export REVIEWERS="Carine01,reviewer2"

# Navigate to agent scripts
cd scripts/agent

# Step 1: Run all checks (10-15 min)
./run-all-checks.sh "$BRANCH" "$PR_NUMBER"

# Step 2: Add QA checklist and request review (30 sec)
./auto-comment-and-assign.sh "$PR_NUMBER" "$REVIEWERS"

# Step 3: Wait for human approval
echo "⏳ Waiting for human review approval..."
echo "   Monitor PR status: gh pr view $PR_NUMBER"

# Step 4: Merge when all conditions met (30 sec)
./auto-merge-if-ready.sh "$PR_NUMBER"
```

---

## 🚨 Emergency Workflow (Admin Override)

Use **ONLY** in emergencies when normal process is blocked:

```bash
# Set variables
export PR_NUMBER=<PR_NUMBER>

cd scripts/agent

# Force merge (bypasses some checks - USE WITH CAUTION)
./auto-merge-if-ready.sh "$PR_NUMBER" --force

# Document the emergency merge
gh issue create --title "Emergency merge: PR #$PR_NUMBER" \
  --body "Emergency merge executed. Reason: [EXPLAIN]. Merged PR: #$PR_NUMBER" \
  --label "incident"
```

---

## 📊 Manual Workflow Commands

### Individual GitHub CLI Commands

If scripts fail, use these manual commands:

#### 1. Trigger Workflows
```bash
gh workflow run "CI" --ref <BRANCH>
gh workflow run "Docker Builder" --ref <BRANCH>
gh workflow run "Register Fila Fallback (AST)" --ref <BRANCH>
gh workflow run "WhatsApp Monitor" --ref <BRANCH>
```

#### 2. Check Workflow Status
```bash
# List recent runs
gh run list --branch <BRANCH> --limit 5

# View specific run
gh run view <RUN_ID>

# Get run logs
gh run view <RUN_ID> --log-failed
```

#### 3. Add PR Comment
```bash
gh pr comment <PR_NUMBER> --body "Automação: checks disparados. Aguardando resultados..."
```

#### 4. Add Labels and Reviewers
```bash
gh pr edit <PR_NUMBER> --add-label "implementation" --add-label "priority/high"
gh pr edit <PR_NUMBER> --add-reviewer "user1,user2"
gh pr edit <PR_NUMBER> --add-assignee "Carine01"
```

#### 5. Check PR Status
```bash
# View PR details
gh pr view <PR_NUMBER>

# Check PR checks
gh pr checks <PR_NUMBER>

# View PR diff
gh pr diff <PR_NUMBER>
```

#### 6. Merge PR
```bash
# Normal merge
gh pr merge <PR_NUMBER> --merge --delete-branch

# Admin override merge
gh pr merge <PR_NUMBER> --merge --admin --delete-branch

# Squash merge
gh pr merge <PR_NUMBER> --squash --delete-branch
```

---

## ✅ Pre-Merge Checklist

Before merging, verify:

- [ ] **Build passes**: TypeScript Guardian workflow successful
- [ ] **Tests pass**: CI workflow shows all tests passing
- [ ] **Docker builds**: Docker Builder workflow successful
- [ ] **No conflicts**: PR can be merged cleanly
- [ ] **Review approved**: At least 1 human approval
- [ ] **No console.log**: Quality gate checks pass
- [ ] **Secrets configured**: Environment variables set
- [ ] **clinicId filters**: Multitenancy properly implemented

---

## 🔍 Monitoring & Verification

### Check Workflow Status
```bash
# All workflows for a branch
gh run list --branch feat/my-feature

# Specific workflow
gh run list --workflow "CI" --limit 5

# Watch real-time
gh run watch <RUN_ID>
```

### Check PR Health
```bash
# PR summary
gh pr view <PR_NUMBER>

# PR checks status
gh pr checks <PR_NUMBER>

# PR review status
gh pr view <PR_NUMBER> --json reviewDecision,statusCheckRollup
```

### Post-Merge Validation
```bash
# Check if deployment started
gh run list --workflow "Deploy" --limit 1

# Health check endpoints
curl -sS https://staging.elevare.com/health | jq .
curl -sS https://staging.elevare.com/whatsapp/health | jq .
```

---

## 🛡️ Security Rules (MANDATORY)

### Never Merge Without:

1. ✅ **All checks pass** (TypeScript Guardian + CI + Docker Builder)
2. ✅ **Human review** (minimum 1 approval)
3. ✅ **Branch protection** (rules active on main)
4. ✅ **No conflicts** (clean merge possible)

### Always Verify:

- 🔒 No hardcoded secrets in code
- 🔒 clinicId filters on all database queries
- 🔒 No console.log in production code
- 🔒 Proper error handling (no exposed error details)
- 🔒 Input validation on all endpoints

### Admin Override (`--force` flag):

- ⚠️ Use ONLY in emergencies
- ⚠️ Requires admin privileges
- ⚠️ Must be documented in incident log
- ⚠️ Should trigger post-merge audit

---

## 📞 Troubleshooting

### Common Issues & Solutions

**Issue: Workflow fails to trigger**
```bash
# Check workflow exists
gh workflow list

# Check workflow file
cat .github/workflows/ci.yml

# Verify branch name
git branch --show-current
```

**Issue: PR has conflicts**
```bash
# Agent should notify and stop - human intervention needed
gh pr comment <PR_NUMBER> --body "⚠️ Merge conflicts detected. Please resolve manually."
```

**Issue: Checks timeout**
```bash
# Check workflow logs
gh run list --branch <BRANCH> --limit 1
gh run view <RUN_ID> --log-failed

# May need to re-trigger
gh workflow run "CI" --ref <BRANCH>
```

**Issue: No review approval**
```bash
# Verify reviewer status
gh pr view <PR_NUMBER> --json reviewDecision

# Ping reviewers
gh pr comment <PR_NUMBER> --body "@reviewer1 @reviewer2 Review requested - please approve when ready"
```

---

## 📈 Success Metrics

Track these metrics for agent performance:

- **Check Success Rate**: % of PRs where all checks pass first time
- **Review Wait Time**: Average time from checks pass to approval
- **Merge Time**: Average time from approval to merge completion
- **Failure Rate**: % of merges that fail or require rollback
- **Emergency Merges**: Count of --force merges (should be minimal)

---

## 🔗 Quick Links

- **Scripts Location**: `/scripts/agent/`
- **Detailed Docs**: `/scripts/agent/README.md`
- **Workflow Files**: `/.github/workflows/`
- **Actions Dashboard**: `https://github.com/<OWNER>/<REPO>/actions` (replace with your repo)

---

## 📝 Example Agent Implementation

### Pseudo-code for agent logic:

```python
def handle_pr_event(pr_number, branch, event_type):
    """Handle PR opened or synchronized event"""
    
    if event_type in ['opened', 'synchronize']:
        # Step 1: Run checks
        result = run_command(f"./scripts/agent/run-all-checks.sh {branch} {pr_number}")
        if result.failed:
            comment_pr(pr_number, "❌ Automated checks failed. Please review logs.")
            return
        
        # Step 2: Add checklist and assign
        run_command(f"./scripts/agent/auto-comment-and-assign.sh {pr_number} 'Carine01'")
        
        # Step 3: Monitor for approval
        wait_for_approval(pr_number)
        
        # Step 4: Auto-merge when ready
        result = run_command(f"./scripts/agent/auto-merge-if-ready.sh {pr_number}")
        if result.success:
            comment_pr(pr_number, "✅ Automated merge completed successfully!")
        else:
            comment_pr(pr_number, "⚠️ Automated merge failed. Manual intervention required.")

def wait_for_approval(pr_number):
    """Poll PR until it has required approval"""
    while True:
        pr = get_pr_status(pr_number)
        if pr.review_decision == "APPROVED":
            return True
        if pr.review_decision == "CHANGES_REQUESTED":
            return False
        sleep(60)  # Check every minute
```

---

## 🎯 Key Takeaways

1. **Always follow the complete workflow** (checks → comment → wait → merge)
2. **Never skip human review** unless emergency with --force
3. **Monitor workflow execution** and respond to failures
4. **Document all emergency merges** in incident log
5. **Validate post-merge** with health checks

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0  
**For detailed documentation:** See `scripts/agent/README.md`
