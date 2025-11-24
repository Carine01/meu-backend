# Scripts de Automação Elevare

Este diretório contém scripts para automação do repositório.

## Scripts Disponíveis

### 1. `elevare_auto_fix.sh`

Executa correções automáticas no código.

**Uso:**
```bash
./scripts/elevare_auto_fix.sh
```

**O que faz:**
- Executa ESLint auto-fix
- Aplica Prettier (se disponível)
- Remove trailing whitespaces
- Corrige problemas comuns de formatação

**Saída:**
- Log em `auto-fix-YYYYMMDD-HHMMSS.log`
- Lista de arquivos modificados

### 2. `auto_fix_and_pr.sh`

Executa correções e cria PR automaticamente.

**Uso:**
```bash
./scripts/auto_fix_and_pr.sh
```

**Pré-requisitos:**
- GitHub CLI (`gh`) instalado
- Autenticado no GitHub (`gh auth login`)

**O que faz:**
1. Executa `elevare_auto_fix.sh`
2. Cria nova branch `auto-fix/corrections-TIMESTAMP`
3. Commita mudanças
4. Faz push da branch
5. Cria Pull Request no GitHub

**Labels aplicadas:**
- `auto-fix`
- `automated`
- `bot`

### 3. `generate_elevare_report.sh`

Gera relatório completo do estado do repositório.

**Uso:**
```bash
./scripts/generate_elevare_report.sh
```

**O que faz:**
- Executa todos os checks (install, lint, tsc, tests, security, deps, warnings)
- Calcula % de integridade da branch
- Gera `ELEVARE_GIT_AGENT_REPORT.md`
- Salva logs detalhados em `reports/`

**Checks executados:**
1. Instalação de dependências
2. ESLint
3. TypeScript compilation
4. Testes
5. Security scan (secrets, .env, vulnerabilities)
6. Dependências não usadas
7. Avisos críticos

**Exit codes:**
- `0`: Integridade >= 80%
- `1`: Integridade < 80%

**Arquivos gerados:**
- `ELEVARE_GIT_AGENT_REPORT.md` - Relatório principal
- `reports/install.log` - Log de instalação
- `reports/eslint.json` - Resultado ESLint
- `reports/tsc.log` - Erros TypeScript
- `reports/test.log` - Resultado dos testes
- `reports/security.log` - Problemas de segurança
- `reports/audit.json` - NPM audit
- `reports/depcheck.json` - Dependências

### Scripts Legados

Os seguintes scripts existem mas são específicos para outras finalidades:

- `setup.sh` - Setup inicial do projeto
- `automacao-completa.sh` - Automação completa antiga
- `criar-issues-gh.sh` - Cria issues no GitHub
- `criar-todos-prs.sh` - Cria múltiplos PRs

## Integração com CI/CD

Os scripts são usados pelos workflows do GitHub Actions:

- **elevare-validate.yml** - Usa lógica similar ao `generate_elevare_report.sh`
- **elevare-auto-fix.yml** - Usa `elevare_auto_fix.sh` para correções automáticas
- **elevare-master-report.yml** - Gera relatório completo

## Permissões

Todos os scripts executáveis têm permissão `755`:

```bash
chmod +x scripts/*.sh
```

## Troubleshooting

### "Permission denied"
```bash
chmod +x scripts/elevare_auto_fix.sh
```

### "gh: command not found"
Instale GitHub CLI:
- Linux: `sudo apt install gh` ou via https://cli.github.com
- macOS: `brew install gh`
- Windows: `winget install --id GitHub.cli`

### "npm ci failed"
Use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### Script não encontra arquivos
Certifique-se de executar da raiz do projeto:
```bash
cd /path/to/meu-backend
./scripts/script-name.sh
```

## Boas Práticas

1. **Sempre execute auto-fix antes de commitar:**
   ```bash
   ./scripts/elevare_auto_fix.sh
   git add .
   git commit -m "feat: sua mudança"
   ```

2. **Gere relatório antes de abrir PR:**
   ```bash
   ./scripts/generate_elevare_report.sh
   ```

3. **Use auto_fix_and_pr.sh para PRs automáticos:**
   ```bash
   ./scripts/auto_fix_and_pr.sh
   ```

4. **Revise logs gerados:**
   - `auto-fix-*.log` - Logs de correção
   - `reports/*` - Logs detalhados de checks

## Contribuindo

Para adicionar novos scripts:

1. Crie o script em `scripts/`
2. Torne-o executável: `chmod +x scripts/seu-script.sh`
3. Documente no README
4. Adicione ao workflow apropriado se necessário

## Suporte

Para problemas ou sugestões, abra uma issue no GitHub.

---

**Elevare Automation System**
*Scripts para automação completa do repositório*
