# Script to verify git repository status and pull configuration
# Usage: .\scripts\verify-git-status.ps1

Write-Host "🔍 Git Repository Status Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "📍 Current Branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Check git status
Write-Host "📊 Git Status:" -ForegroundColor Yellow
git status --short --branch
Write-Host ""

# Check remote configuration
Write-Host "🌐 Remote Configuration:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Check pull configuration
Write-Host "⚙️  Git Pull Configuration:" -ForegroundColor Yellow
$pullRebase = git config --get pull.rebase
if ([string]::IsNullOrEmpty($pullRebase)) {
    Write-Host "  pull.rebase: not set (default: false)" -ForegroundColor Gray
} else {
    Write-Host "  pull.rebase: $pullRebase" -ForegroundColor Gray
}
Write-Host ""

# Check if there are changes to pull
Write-Host "🔄 Checking for remote changes..." -ForegroundColor Yellow
try {
    git fetch --dry-run 2>&1 | Out-Null
} catch {
    Write-Host "Note: Fetch may fail due to authentication in some environments" -ForegroundColor Gray
}
Write-Host ""

# Show last 5 commits
Write-Host "📝 Recent Commits:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Compare with remote
Write-Host "🔍 Comparing with remote branch..." -ForegroundColor Yellow
try {
    $LOCAL = git rev-parse "@"
    $REMOTE = git rev-parse "@{u}" 2>$null
    $BASE = git merge-base "@" "@{u}" 2>$null

    if ($LOCAL -eq $REMOTE) {
        Write-Host "✅ Repository is up-to-date with remote" -ForegroundColor Green
    } elseif ($LOCAL -eq $BASE) {
        Write-Host "⬇️  Need to pull - remote has new commits" -ForegroundColor Yellow
    } elseif ($REMOTE -eq $BASE) {
        Write-Host "⬆️  Need to push - local has new commits" -ForegroundColor Yellow
    } else {
        Write-Host "🔀 Branches have diverged - may need to merge or rebase" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not compare with remote (possibly not tracking a remote branch)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "✅ Verification complete!" -ForegroundColor Green
