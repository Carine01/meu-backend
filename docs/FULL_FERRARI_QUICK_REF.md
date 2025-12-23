# 🏎️ Full Ferrari Quick Reference

## One-Line Commands

### GitHub Actions
```bash
# Trigger workflow via CLI
gh workflow run full-ferrari.yml

# Check workflow status
gh run list --workflow=full-ferrari.yml
```

### Manual Execution
```bash
# Run all automation steps locally
bash scripts/elevare_auto_fix.sh --auto-remove-unused && \
bash scripts/vsc_adiante.sh && \
bash scripts/auto_fix_and_pr.sh --scaffold-dtos --security-basic

# Build and generate reports
npm run build
mkdir -p .elevare_validation_report
npx eslint . --ext .ts,.js -f json > .elevare_validation_report/eslint.json
npx depcheck --json > .elevare_validation_report/depcheck.json
npx tsc --noEmit > .elevare_validation_report/tsc.out 2>&1
```

## Script Arguments

### elevare_auto_fix.sh
- `--auto-remove-unused` - Attempt to remove unused dependencies

### auto_fix_and_pr.sh
- `--scaffold-dtos` - Create DTO templates and check validations
- `--security-basic` - Run basic security hardening checks

### vsc_adiante.sh
- No arguments (automatic structure analysis)

## File Locations

```
.github/workflows/full-ferrari.yml    # Main workflow
scripts/elevare_auto_fix.sh            # Fix imports/dedupe
scripts/vsc_adiante.sh                 # Structure harmonization
scripts/auto_fix_and_pr.sh             # DTOs/security
.elevare_validation_report/            # Generated reports
src/shared/dto/base.dto.ts             # DTO template
```

## Workflow Outputs

| File | Description |
|------|-------------|
| `eslint.json` | Linting issues |
| `depcheck.json` | Dependency analysis |
| `tsc.out` | TypeScript errors |
| `test.out` | Test results |
| `structure-report.txt` | Module structure |
| `security-report.txt` | Security recommendations |

## Common Issues

### "npm install failed"
```bash
npm install --legacy-peer-deps
```

### "Script permission denied"
```bash
chmod +x scripts/*.sh
```

### "Backup branch not created"
```bash
git checkout -b backup-manual-$(date +%Y%m%d%H%M%S)
git push origin backup-manual-$(date +%Y%m%d%H%M%S)
```

## Integrity Targets

- Architecture: 90%
- Services: 80%
- Routes/Controllers: 80%
- Security: 55% → 90%
- Tests: 50% → 80%
- Documentation: 40% → 80%
- Deploy Ready: 80% → 95%

## Next Actions After Workflow

1. Review PR and reports
2. Fix TypeScript errors from `tsc.out`
3. Address ESLint issues from `eslint.json`
4. Complete DTO validations
5. Add missing tests
6. Update documentation
7. Security review
8. Merge and deploy

---

📖 Full documentation: `docs/FULL_FERRARI_WORKFLOW.md`
