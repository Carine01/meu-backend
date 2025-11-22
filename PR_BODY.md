# Resumo
- Substitui narrativa por instruções executáveis (AGENT_INSTRUCTIONS.md)
- Adiciona 8 GitHub Actions automation agents (AGENTES_GITHUB.md)
- Adiciona ISSUE_TEMPLATE para implementação crítica
- Relatório de evolução do projeto (RELATORIO_EVOLUCAO_PROJETO.md)

# Checklist (PR)
- [ ] Documentos colocados em /docs e raiz
- [ ] Workflows .github/workflows estão válidos
- [ ] Secrets necessários configurados (SSH_DEPLOY_KEY, WHATSAPP_API_KEY, DB_URL, DOCKER_REGISTRY_*)
- [ ] Issue de implementação criada a partir do template

# Runbook rápido
- Para iniciar implementação: criar issue a partir do template `implementation-whatsapp-clinicid.md`
- Para rodar testes locais: `npm ci && npm run test:ci`

# Secrets necessários (ex.: GitHub Secrets → Settings → Secrets)
- SSH_DEPLOY_KEY
- WHATSAPP_API_KEY
- DB_URL (postgres connection string)
- DOCKER_REGISTRY_USER / DOCKER_REGISTRY_PASS
- SENTRY_DSN (opcional)
