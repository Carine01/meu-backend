# ✅ CHECKLIST - Pull Request

## 📋 Antes de Abrir o PR

### Código
- [ ] Código testado localmente (`npm run test:ci`)
- [ ] Build TypeScript sem erros (`npm run build`)
- [ ] Lint passou sem erros (`npm run lint`)
- [ ] Sem `console.log()` ou código comentado desnecessário
- [ ] Imports organizados e sem duplicados

### Segurança
- [ ] **Sem secrets no código** (API keys, passwords, tokens)
- [ ] Secrets movidos para `.env` ou GitHub Secrets
- [ ] Arquivo `.env.example` atualizado com novas variáveis
- [ ] Validação de entrada em todos endpoints públicos
- [ ] Rate limiting configurado onde necessário

### Testes
- [ ] Unit tests adicionados para novas funcionalidades
- [ ] Coverage mantido acima de 80% (`npm run test:coverage`)
- [ ] Testes E2E para fluxos críticos
- [ ] Testes passando em CI/CD

### Documentação
- [ ] README.md atualizado (se aplicável)
- [ ] JSDoc/comentários adicionados em funções complexas
- [ ] CHANGELOG.md atualizado (se existir)
- [ ] Documentação de APIs atualizada (Swagger/OpenAPI)

### Git
- [ ] Commits atômicos e descritivos
- [ ] Mensagens de commit seguem padrão: `type(scope): message`
  - Exemplos: `feat(auth):`, `fix(api):`, `chore(deps):`, `docs:`
- [ ] Branch atualizada com `main` (sem conflitos)
- [ ] `.gitignore` atualizado (se adicionou novos arquivos gerados)

### Database
- [ ] Migrations criadas (se alterou schema)
- [ ] Rollback testado
- [ ] Seeds atualizados (se aplicável)
- [ ] Índices adicionados para queries pesadas

### CI/CD
- [ ] Pipeline CI passou (build, test, lint)
- [ ] Docker build funcionando (se aplicável)
- [ ] Variáveis de ambiente configuradas no CI
- [ ] Health checks adicionados/atualizados

---

## 📝 Descrição do PR (Template)

```markdown
## 📌 Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentação
- [ ] 🔧 Configuração/Infra
- [ ] ♻️ Refatoração

## 📖 Descrição
Breve resumo do que foi implementado e por quê.

## 🎯 Issue Relacionada
Closes #123

## 🧪 Como Testar
1. Passo a passo para reproduzir/testar
2. Comandos necessários
3. Resultados esperados

## 📸 Screenshots (se aplicável)
[Adicionar imagens/videos]

## ⚠️ Breaking Changes
[Listar mudanças que quebram compatibilidade]

## 📋 Checklist
- [x] Código testado localmente
- [x] Sem secrets no código
- [x] Documentação atualizada
- [x] Commits atômicos
- [x] Tests passando
```

---

## 🔍 Revisão de Código (Para Reviewers)

### Checklist do Reviewer
- [ ] Código segue padrões do projeto
- [ ] Lógica de negócio está correta
- [ ] Não introduz vulnerabilidades de segurança
- [ ] Performance adequada (queries otimizadas, sem N+1)
- [ ] Tratamento de erros adequado
- [ ] Logs estruturados adicionados
- [ ] Testes cobrem casos edge
- [ ] Documentação clara e suficiente

### Perguntas para o Autor
- [ ] Por que essa abordagem foi escolhida?
- [ ] Existem alternativas consideradas?
- [ ] Qual o impacto em produção?
- [ ] Precisa de feature flag?
- [ ] Precisa de rollback plan?

---

## 🚀 Deploy Checklist

### Pré-Deploy
- [ ] Backup do banco de dados
- [ ] Migrations testadas em staging
- [ ] Secrets configurados no ambiente
- [ ] Monitoramento configurado (Sentry, logs)
- [ ] Rollback plan documentado

### Pós-Deploy
- [ ] Health checks passando
- [ ] Smoke tests executados
- [ ] Logs sem erros críticos
- [ ] Métricas monitoradas (latência, erros, throughput)
- [ ] Comunicação ao time sobre deploy

---

## 🏷️ Labels Sugeridas

- `priority/high` - Alta prioridade
- `priority/medium` - Média prioridade
- `priority/low` - Baixa prioridade
- `implementation` - Implementação de feature
- `bug` - Correção de bug
- `security` - Relacionado a segurança
- `ci` - CI/CD
- `doc` - Documentação
- `refactor` - Refatoração
- `breaking-change` - Mudança que quebra compatibilidade

---

## 📚 Referências

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
