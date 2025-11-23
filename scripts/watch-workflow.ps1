# PowerShell script to list and watch GitHub Actions workflow runs
# Usage: .\watch-workflow.ps1 [list|watch|auto] [run_id]

param(
    [Parameter(Position=0)]
    [string]$Command = "auto",
    
    [Parameter(Position=1)]
    [string]$RunId
)

# Check if gh CLI is installed
function Test-GhInstalled {
    try {
        $null = gh --version
        return $true
    } catch {
        return $false
    }
}

# Check if authenticated
function Test-GhAuthenticated {
    try {
        $null = gh auth status 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# List recent workflow runs
function Get-WorkflowRuns {
    Write-Host "`n📋 Recent Workflow Runs:" -ForegroundColor Blue
    Write-Host ""
    gh run list --limit 10
}

# Watch a specific run
function Watch-WorkflowRun {
    param([string]$Id)
    
    if ([string]::IsNullOrEmpty($Id)) {
        Write-Host "Error: Run ID is required" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n👀 Watching workflow run #$Id..." -ForegroundColor Yellow
    Write-Host ""
    gh run watch $Id
}

# Watch the latest run
function Watch-LatestRun {
    Write-Host "`n🔍 Finding latest workflow run..." -ForegroundColor Blue
    
    # Get the latest run ID
    $latestRunId = gh run list --limit 1 --json databaseId --jq '.[0].databaseId'
    
    if ([string]::IsNullOrEmpty($latestRunId)) {
        Write-Host "Error: No workflow runs found" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Found latest run: #$latestRunId" -ForegroundColor Green
    Write-Host ""
    Write-Host "👀 Watching workflow run..." -ForegroundColor Yellow
    Write-Host ""
    gh run watch $latestRunId
}

# Show help
function Show-Help {
    Write-Host "GitHub Actions Workflow Monitor" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\watch-workflow.ps1 [command] [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  list              List recent workflow runs"
    Write-Host "  watch <run_id>    Watch a specific workflow run"
    Write-Host "  auto              Watch the latest workflow run (default)"
    Write-Host "  latest            Same as auto"
    Write-Host "  help              Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\watch-workflow.ps1                # Watch latest run"
    Write-Host "  .\watch-workflow.ps1 list           # List recent runs"
    Write-Host "  .\watch-workflow.ps1 watch 123456   # Watch specific run"
}

# Main script execution
if (-not (Test-GhInstalled)) {
    Write-Host "Error: GitHub CLI (gh) is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/"
    exit 1
}

if (-not (Test-GhAuthenticated)) {
    Write-Host "Error: Not authenticated with GitHub CLI" -ForegroundColor Red
    Write-Host "Please run: gh auth login"
    exit 1
}

switch ($Command.ToLower()) {
    "list" {
        Get-WorkflowRuns
    }
    "watch" {
        if ([string]::IsNullOrEmpty($RunId)) {
            Write-Host "Error: Please provide a run ID" -ForegroundColor Red
            Write-Host "Usage: .\watch-workflow.ps1 watch <run_id>"
            exit 1
        }
        Watch-WorkflowRun -Id $RunId
    }
    { $_ -in "auto", "latest" } {
        Watch-LatestRun
    }
    { $_ -in "help", "--help", "-h", "/?" } {
        Show-Help
    }
    default {
        Write-Host "Error: Unknown command '$Command'" -ForegroundColor Red
        Write-Host "Run '.\watch-workflow.ps1 help' for usage information"
        exit 1
    }
}
