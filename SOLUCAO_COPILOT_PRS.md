# Solução para PRs Automatizados do GitHub Copilot

## Problema
O GitHub Copilot estava criando múltiplos Pull Requests automaticamente, gerando confusão e executando workflows desnecessários.

## Solução Implementada

### 1. Filtros de Workflow (`.github/workflows/`)

**CI Workflow (`ci.yml`)**:
- Adicionada condição `if: ${{ !startsWith(github.head_ref, 'copilot/') }}` ao job `build-and-test`
- Isso impede que o workflow de CI execute em PRs originados de branches que começam com `copilot/`
- O workflow ainda funciona normalmente para:
  - Pushes para `main`
  - PRs de branches regulares (feature/, fix/, etc.)

**Deploy Workflow (`deploy.yml`)**:
- Adicionada condição `if: ${{ !startsWith(github.ref, 'refs/heads/copilot/') }}` ao job `deploy`
- Garante que deploys nunca sejam executados de branches do Copilot
- Mantém funcionamento normal para:
  - Pushes para `main`
  - Dispatches manuais

### 2. Instruções para Copilot (`.github/copilot-instructions.md`)

Arquivo criado com diretrizes para o GitHub Copilot:
- Política de não criar PRs automáticos sem revisão
- Convenções de nomenclatura de branches
- Processo de contribuição esperado

### 3. Documentação Atualizada (`CONTRIBUTING.md`)

Adicionada seção sobre Pull Requests Automatizados:
- Explica que branches `copilot/*` são ignoradas
- Orienta contribuidores a usar nomes de branch apropriados
- Reforça a necessidade de revisão manual

## Benefícios

✅ **Redução de Confusão**: Workflows não executam em PRs auto-gerados do Copilot
✅ **Economia de Recursos**: Menos execuções de CI/CD desnecessárias
✅ **Melhor Organização**: Apenas PRs intencionais disparam workflows
✅ **Segurança**: Deploy nunca acontece de branches não intencionadas

## Como Testar

1. Criar uma branch com nome `copilot/test-feature`
2. Fazer commit e push
3. Abrir PR para `main`
4. Verificar que o workflow de CI **não** executa
5. Criar uma branch com nome `feature/test-feature`
6. Fazer commit e push
7. Abrir PR para `main`
8. Verificar que o workflow de CI **executa normalmente**

## Notas Técnicas

- A condição `github.head_ref` é usada em eventos `pull_request` (representa o branch de origem)
- A condição `github.ref` é usada em eventos `push` (representa o branch atual)
- Branches que começam com `copilot/` são o padrão usado pelo GitHub Copilot para PRs automáticos
- Esta solução não impede a criação de PRs, apenas controla quando os workflows executam

## Limitações

⚠️ **Esta solução controla apenas os workflows, não impede a criação de PRs.**

Para desabilitar completamente a criação automática de PRs pelo GitHub Copilot, é necessário:
1. Ir para Settings > Code & automation > Copilot no repositório
2. Ajustar as configurações de "Copilot Pull Requests" (requer permissões de admin)

## Manutenção

Se no futuro você quiser que workflows executem em branches do Copilot:
1. Remova as condições `if` dos jobs nos arquivos de workflow
2. Ou ajuste a condição para permitir branches específicas

---

**Autor**: GitHub Copilot Workspace  
**Data**: Novembro 2025
