# 🛡️ Configuração de Proteção da Branch Main

Este guia fornece instruções passo a passo para configurar a proteção da branch `main` e integrar completamente o Elevare Agent como guardião do repositório.

## 📋 Pré-requisitos

Antes de configurar a proteção:

1. ✅ Workflows do Elevare Agent estão instalados
2. ✅ Pelo menos uma execução bem-sucedida dos workflows
3. ✅ Permissões de administrador no repositório
4. ✅ CI/CD básico funcionando

## 🔧 Configuração Passo a Passo

### 1. Acessar Configurações de Branch

1. Navegue até o repositório no GitHub
2. Clique em **Settings** (⚙️)
3. No menu lateral, clique em **Branches**
4. Em "Branch protection rules", clique em **Add rule**

### 2. Configurar Regra para Main

#### 2.1 Branch Name Pattern

```
main
```

#### 2.2 Protect Matching Branches

Marque as seguintes opções:

**Require a pull request before merging**
- ✅ Habilitar
- Required approvals: `1` (ou mais, conforme necessário)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (se aplicável)

**Require status checks to pass before merging**
- ✅ Habilitar
- ✅ Require branches to be up to date before merging
- Status checks required (selecione os seguintes):
  - `🤖 Elevare Agent - Validação Completa`
  - `CI` (se você tem um workflow de CI separado)
  - Qualquer outro check importante para seu projeto

**Require conversation resolution before merging**
- ✅ Habilitar (recomendado)

**Require signed commits** (opcional)
- ⚠️ Habilitar se sua equipe usa commits assinados

**Require linear history** (opcional)
- ⚠️ Habilitar se você quer forçar rebase ao invés de merge commits

**Require deployments to succeed before merging** (opcional)
- ⚠️ Habilitar se você tem ambientes de staging

**Lock branch** (não recomendado para main)
- ❌ Manter desabilitado

**Do not allow bypassing the above settings**
- ✅ Habilitar
- ⚠️ Include administrators (recomendado para máxima proteção)

**Restrict who can push to matching branches** (opcional)
- ⚠️ Configure se você quer limitar quem pode fazer push direto

### 3. Salvar Configuração

1. Role até o final da página
2. Clique em **Create** ou **Save changes**
3. Confirme as alterações

## ✅ Validação da Configuração

### Teste 1: Tentar Push Direto

```bash
# Isso deve falhar
git checkout main
echo "test" >> README.md
git commit -am "test direct push"
git push origin main
```

**Resultado esperado**: ❌ Push rejeitado

### Teste 2: PR sem Validação

1. Crie um branch com código quebrado
2. Abra um PR para main
3. Tente fazer merge antes do Elevare validar

**Resultado esperado**: ❌ Merge bloqueado até validação passar

### Teste 3: PR com Validação Bem-sucedida

1. Crie um branch com código válido
2. Abra um PR para main
3. Aguarde Elevare Agent validar
4. Após aprovação, faça merge

**Resultado esperado**: ✅ Merge permitido após validação e aprovação

## 🔍 Status Checks Requeridos

### Checks Obrigatórios do Elevare

Certifique-se de que os seguintes checks estão habilitados:

| Check | Descrição | Obrigatório |
|-------|-----------|-------------|
| `🤖 Elevare Agent - Validação Completa` | Validação principal do PR | ✅ Sim |

### Checks Adicionais Recomendados

| Check | Descrição | Recomendado |
|-------|-----------|-------------|
| `CI / build-and-test` | Build e testes | ✅ Sim |
| `CI / lint` | Linting | ⚠️ Se configurado |
| `Deploy / preview` | Deploy de preview | ⚠️ Se aplicável |

## 📊 Monitoramento

### Verificar se Proteção está Ativa

1. Vá em **Settings** → **Branches**
2. Confirme que há uma regra ativa para `main`
3. Verifique o ícone de escudo 🛡️ ao lado do nome da branch

### Monitorar Tentativas de Bypass

1. Verifique logs de audit: **Settings** → **Audit log**
2. Filtre por ações relacionadas a branch protection
3. Revise qualquer tentativa de bypass

## 🚨 Troubleshooting

### Problema: Status Check Não Aparece

**Causa**: Workflow ainda não executou nenhuma vez

**Solução**:
1. Abra um PR de teste
2. Aguarde workflow executar
3. Após primeira execução, status check aparecerá na lista
4. Volte nas configurações e selecione o check

### Problema: Administradores Podem Bypass

**Causa**: Opção "Include administrators" não está marcada

**Solução**:
1. Vá em **Settings** → **Branches**
2. Edite a regra para `main`
3. Em "Do not allow bypassing", marque "Include administrators"
4. Salve as alterações

### Problema: PRs Antigos Não Validam

**Causa**: Workflows foram adicionados após PR ser aberto

**Solução**:
1. Feche e reabra o PR, ou
2. Faça um commit vazio: `git commit --allow-empty -m "trigger CI"`
3. Faça push para re-executar validações

## 🎯 Melhores Práticas

### 1. Configuração Gradual

**Fase 1: Avisos** (1-2 semanas)
- Habilite workflows
- Não force status checks
- Deixe equipe se acostumar

**Fase 2: Soft Enforcement** (2-4 semanas)
- Habilite status checks requeridos
- Permita bypass para administradores
- Monitore e ajuste

**Fase 3: Full Enforcement**
- Remova bypass para administradores
- Todos os checks obrigatórios
- Zero tolerância

### 2. Comunicação com a Equipe

Antes de habilitar proteção:

1. 📢 Anuncie mudanças com antecedência
2. 📚 Compartilhe documentação do Elevare Agent
3. 🎓 Faça treinamento sobre o novo processo
4. 💬 Crie canal para dúvidas e feedback

### 3. Exceções e Hotfixes

Para situações de emergência:

**Opção 1: Branch Temporária**
```bash
# Crie branch de emergência sem proteção
git checkout -b hotfix-emergency
# ... faça as correções
# Abra PR, mas com revisão express
```

**Opção 2: Bypass Temporário** (não recomendado)
1. Administrador pode temporariamente desabilitar regra
2. Faça o hotfix
3. **IMEDIATAMENTE** reabilite a regra
4. Documente o incidente

### 4. Revisão Regular

**Mensal:**
- Revise regras de proteção
- Verifique se novos checks devem ser adicionados
- Analise métricas do Elevare Agent

**Trimestral:**
- Avalie efetividade das regras
- Ajuste configurações baseado em feedback
- Atualize documentação

## 📋 Checklist de Configuração

Use este checklist para garantir configuração completa:

- [ ] Regra de proteção criada para `main`
- [ ] Require pull request before merging habilitado
- [ ] Mínimo de 1 aprovação requerida
- [ ] Dismiss stale approvals habilitado
- [ ] Require status checks habilitado
- [ ] `Elevare Agent - Validação Completa` como check obrigatório
- [ ] Require branches to be up to date habilitado
- [ ] Require conversation resolution habilitado
- [ ] Do not allow bypassing habilitado
- [ ] Include administrators habilitado (para máxima proteção)
- [ ] Configuração testada com PR de teste
- [ ] Equipe notificada sobre mudanças
- [ ] Documentação compartilhada

## 🔗 Recursos Adicionais

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Elevare Agent Documentation](.github/ELEVARE_AGENT_DOCUMENTATION.md)
- [Elevare Agent Report](.github/ELEVARE_AGENT_REPORT.md)

## 📞 Suporte

Para problemas com configuração:

1. Verifique logs dos workflows em **Actions**
2. Consulte troubleshooting acima
3. Abra issue com label `elevare-agent` + `configuration`

---

**Importante**: Estas configurações são críticas para segurança do projeto. Não desabilite proteções sem documentar a razão e obter aprovação apropriada.
