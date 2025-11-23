# Quick Start Guide - Agent Orchestration

## O que foi implementado

Foi criado o script `scripts/agent/run-agents-all.sh` conforme solicitado no problema. Este script orquestra a execução de múltiplos workflows do GitHub Actions.

## Como usar

### 1. Uso Básico (sem PR)

```bash
chmod +x scripts/agent/run-agents-all.sh
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters
```

### 2. Com comentário em PR

```bash
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 false
```

### 3. Com auto-merge (USE COM CUIDADO!)

```bash
./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters 123 true
```

### 4. Local com GITHUB_TOKEN

```bash
GITHUB_TOKEN="$(gh auth token)" ./scripts/agent/run-agents-all.sh feat/whatsapp-clinicid-filters
```

## O que o script faz

1. ✅ **Dispara workflows em sequência:**
   - TypeScript Guardian
   - Register Fila Fallback (AST)
   - Docker Builder
   - WhatsApp Monitor
   - Agent Orchestrator - run agent scripts in sequence (robust)

2. ✅ **Monitora execução:**
   - Aguarda cada workflow terminar
   - Reporta status em tempo real
   - Identifica falhas

3. ✅ **Gera resumo (opcional):**
   - Se PR_NUMBER fornecido
   - Comenta no PR com status de todos workflows

4. ✅ **Auto-merge (opcional):**
   - Se AUTO_MERGE=true
   - Apenas se PR aprovado e checks OK
   - Usa método squash por padrão

## Comandos Manuais Alternativos

Se preferir disparar workflows individualmente:

```bash
# Disparar um workflow específico
gh workflow run "Docker Builder" --ref feat/whatsapp-clinicid-filters

# Ver status de um run
gh run view <run_id>

# Listar runs recentes
gh run list --workflow "Docker Builder" --branch feat/whatsapp-clinicid-filters
```

## Verificação e Testes

### Validar sintaxe
```bash
bash -n scripts/agent/run-agents-all.sh
bash -n scripts/agent/auto-merge-if-ready.sh
```

### Testar em dry-run (modificar script para adicionar)
Você pode adicionar uma flag DRY_RUN no script para testar sem executar.

## Requisitos

- ✅ GitHub CLI (`gh`) instalado e autenticado
- ✅ GITHUB_TOKEN (automático no runner ou via `gh auth token`)
- ✅ Permissões: `actions: read`, `contents: write`, `pull-requests: write`

## Segurança

⚠️ **IMPORTANTE:**
- Não habilite AUTO_MERGE sem revisar todos os checks
- Certifique-se de que os workflows estão configurados corretamente
- Verifique branch protection rules antes de usar
- Use em ambiente controlado primeiro

## Troubleshooting

### "Workflow not found"
- Verifique o nome exato do workflow
- Confirme que o workflow existe em `.github/workflows/`
- Ajuste o array `WORKFLOWS` no script se necessário

### "No run_id found"
- Aumente o sleep inicial (linha 39 do script)
- Verifique se a branch existe
- Confirme permissões do token

### Checks falhando
- Use `gh run view <run_id> --log` para ver detalhes
- Corrija problemas e execute novamente
- Não use auto-merge até checks passarem

## Documentação Completa

Para documentação detalhada, veja:
- `scripts/agent/README.md` - Documentação completa
- `.github/workflows/` - Definições de workflows

## Próximos Passos

1. ✅ Script criado e testado
2. ⏭️ Ajustar nomes de workflows se necessário (editar array WORKFLOWS)
3. ⏭️ Testar em branch de desenvolvimento
4. ⏭️ Configurar permissões apropriadas
5. ⏭️ Habilitar auto-merge apenas após validação completa

## Suporte

Para dúvidas ou problemas:
- Consulte `scripts/agent/README.md`
- Abra uma issue no repositório
- Verifique GitHub Actions logs
