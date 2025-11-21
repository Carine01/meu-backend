# Instruções para GitHub Copilot

## Política de Pull Requests

**IMPORTANTE**: NÃO crie Pull Requests automaticamente sem revisão manual prévia.

Este repositório requer que todas as mudanças sejam:
1. Revisadas manualmente antes de criar um PR
2. Testadas localmente
3. Aprovadas por um mantenedor

## Diretrizes de Contribuição

- Consulte o arquivo CONTRIBUTING.md antes de fazer alterações
- Execute testes localmente antes de submeter código: `npm test`
- Siga os padrões de código existentes no projeto
- Documente mudanças significativas

## Branches

- `main`: Branch de produção (protegida)
- Branches de feature devem seguir o padrão: `feature/nome-descritivo`
- Branches de correção devem seguir o padrão: `fix/nome-descritivo`

## Workflows

Os workflows de CI/CD estão configurados para:
- Executar testes em PRs para `main`
- Fazer deploy automático apenas em pushes para `main`
- **Ignorar branches que começam com `copilot/`**

---

Para mais informações, consulte [CONTRIBUTING.md](../CONTRIBUTING.md)
