#!/bin/bash
# Exemplo de fluxo completo - demonstração passo a passo
# Este script demonstra como usar todas as ferramentas de automação
# NÃO execute este script diretamente - use os comandos individuais

echo "🎯 EXEMPLO DE FLUXO COMPLETO DE AUTOMAÇÃO"
echo "==========================================="
echo ""
echo "Este arquivo demonstra o fluxo completo. Execute os comandos manualmente."
echo ""

# PASSO 1: CONFIGURAÇÃO INICIAL (executar uma vez)
echo "## PASSO 1: Configuração Inicial (executar UMA VEZ)"
echo ""
cat << 'EOF'
# 1.1 Configurar secrets no GitHub
./scripts/configure-secrets.sh

# 1.2 Aplicar patches
./scripts/apply-patches.sh

# 1.3 Verificar que tudo foi configurado
gh secret list
git status
EOF
echo ""

# PASSO 2: TRABALHANDO EM UMA FEATURE
echo "## PASSO 2: Trabalhando em uma Feature"
echo ""
cat << 'EOF'
# 2.1 Criar branch de feature
git checkout -b feat/minha-feature

# 2.2 Fazer mudanças no código
# ... edite os arquivos ...

# 2.3 Commitar mudanças
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push -u origin feat/minha-feature
EOF
echo ""

# PASSO 3: CRIAR PR
echo "## PASSO 3: Criar Pull Request"
echo ""
cat << 'EOF'
# 3.1 Criar PR via GitHub CLI
gh pr create \
  --base main \
  --head feat/minha-feature \
  --title "feat: Minha nova funcionalidade" \
  --body "## Descrição\n\nDescrição das mudanças...\n\n## Checklist\n- [x] Código implementado\n- [ ] Testes adicionados\n- [ ] Documentação atualizada"

# 3.2 Ou criar PR via UI
echo "Acesse: https://github.com/Carine01/meu-backend/compare/main...feat/minha-feature"
EOF
echo ""

# PASSO 4: DISPARAR AUTOMAÇÃO
echo "## PASSO 4: Disparar Automação de Workflows"
echo ""
cat << 'EOF'
# 4.1 Definir variáveis
export BRANCH="feat/minha-feature"
export GITHUB_TOKEN="$(gh auth token)"

# 4.2 Auto-detectar PR
export PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

# 4.3 Disparar orquestrador
./scripts/agent/run-agents-all.sh "$BRANCH" "$PR_NUMBER" false

# OU disparar via workflow
gh workflow run "Agent Orchestrator - run agent scripts in sequence (robust)" --ref "$BRANCH"
EOF
echo ""

# PASSO 5: MONITORAR
echo "## PASSO 5: Monitorar Execução dos Workflows"
echo ""
cat << 'EOF'
# 5.1 Listar runs em execução
gh run list --branch "$BRANCH" --limit 10

# 5.2 Aguardar workflows completarem (2-3 minutos)
echo "Aguardando workflows completarem..."
sleep 180

# 5.3 Monitorar e reportar falhas (cria issues automaticamente)
./scripts/agent/monitor-and-report.sh "$BRANCH" "$PR_NUMBER"

# 5.4 Ver log específico de um run (se necessário)
# gh run view <RUN_ID> --log --exit-status
EOF
echo ""

# PASSO 6: VERIFICAR STATUS
echo "## PASSO 6: Verificar Status Geral"
echo ""
cat << 'EOF'
# 6.1 Ver status do PR
gh pr status

# 6.2 Ver comentários no PR
gh pr view "$PR_NUMBER" --comments

# 6.3 Ver checks do PR
gh pr checks "$PR_NUMBER"

# 6.4 Se algum check falhou, ver detalhes
gh run list --branch "$BRANCH" --json status,conclusion,name
EOF
echo ""

# PASSO 7: CORRIGIR FALHAS (SE NECESSÁRIO)
echo "## PASSO 7: Corrigir Falhas (se algum check falhou)"
echo ""
cat << 'EOF'
# 7.1 Ver issues criadas automaticamente
gh issue list --label "incident" --state open

# 7.2 Ver logs do workflow que falhou
# gh run view <RUN_ID> --log

# 7.3 Fazer correções no código
git add .
git commit -m "fix: corrigir problema X"
git push

# 7.4 Workflows serão executados automaticamente novamente
EOF
echo ""

# PASSO 8: TESTES LOCAIS (OPCIONAL)
echo "## PASSO 8: Testes Locais (opcional, antes do merge)"
echo ""
cat << 'EOF'
# 8.1 Rodar testes localmente
npm ci
npm run test
npm run build

# 8.2 Testar com Docker (opcional)
docker compose up --build -d
curl -sS http://localhost:3000/health | jq .
docker compose down

# 8.3 Se tudo passou, está pronto para merge
EOF
echo ""

# PASSO 9: REVISÃO E MERGE
echo "## PASSO 9: Revisão e Merge"
echo ""
cat << 'EOF'
# 9.1 Aguardar revisão de código (pelo menos 1 reviewer)
echo "Aguardando revisão..."

# 9.2 Depois de aprovado, mergear PR
gh pr merge "$PR_NUMBER" --squash --delete-branch

# 9.3 Verificar que merge foi bem sucedido
gh pr view "$PR_NUMBER"
EOF
echo ""

# PASSO 10: VERIFICAÇÃO PÓS-MERGE
echo "## PASSO 10: Verificação Pós-Merge"
echo ""
cat << 'EOF'
# 10.1 Verificar workflows na branch main
gh run list --branch main --limit 5

# 10.2 Se houver deploy automático, verificar
gh run list --workflow="Deploy to Cloud Run" --limit 5

# 10.3 Voltar para main e atualizar
git checkout main
git pull

# 10.4 Verificar que tudo está OK
git log --oneline -5
EOF
echo ""

# RESUMO
echo "## 📊 RESUMO DO FLUXO"
echo ""
cat << 'EOF'
Fluxo completo em resumo:
1. ⚙️  Configurar secrets (uma vez)
2. 🔧 Aplicar patches (uma vez)
3. 🌿 Criar branch de feature
4. 💻 Desenvolver e commitar
5. 📝 Criar PR
6. 🚀 Disparar automação
7. 👀 Monitorar workflows
8. 🔍 Verificar checks
9. 🐛 Corrigir falhas (se houver)
10. ✅ Revisão e merge
11. 🎉 Verificar pós-merge

Total estimado: 10-30 minutos (dependendo do tamanho da feature)
EOF
echo ""

echo "✅ Para mais detalhes, veja:"
echo "   - GUIA_AUTOMACAO_COMPLETA.md (guia completo)"
echo "   - scripts/comandos-rapidos.sh (comandos prontos)"
echo ""
