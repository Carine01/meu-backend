# 🚀 Elevare Agent - Guia Rápido

> Referência rápida para desenvolvedores e mantenedores

## 📋 Para Desenvolvedores

### Antes de Abrir um PR

```bash
# 1. Execute testes localmente
npm test

# 2. Compile TypeScript
npm run build

# 3. Se houver ESLint configurado
npx eslint . --ext .ts,.js

# 4. Verifique se não há segredos
git diff origin/main | grep -i "password\|secret\|token\|key"
```

### Interpretando o Relatório do Elevare

| Símbolo | Significado | Ação |
|---------|-------------|------|
| ✅ OK | Passou na validação | Nenhuma ação necessária |
| ❌ FALHA | Falhou na validação | **Correção obrigatória** |
| ⚠️ ATENÇÃO | Aviso não-bloqueante | Correção recomendada |
| ⚠️ N/A | Não aplicável | Nenhuma ação necessária |

### PR Rejeitado - Como Corrigir

1. **Leia o relatório completo** no comentário do PR
2. **Identifique as falhas** (marcadas com ❌)
3. **Corrija localmente**:
   ```bash
   # Para erros de TypeScript
   npm run build
   
   # Para testes falhando
   npm test
   
   # Para segredos
   # Remova as linhas com segredos e use variáveis de ambiente
   ```
4. **Faça commit e push** para re-executar validação

### Comandos Úteis

```bash
# Ver status dos testes
npm test -- --verbose

# Cobertura de testes
npm run test:cov

# Build com detalhes
npm run build -- --listEmittedFiles

# Instalar dependências (se houver conflitos)
npm install --legacy-peer-deps
```

## 🛡️ Para Mantenedores

### Revisando PRs

**Checklist de Revisão:**
- [ ] Elevare Agent aprovou (✅)
- [ ] Código revisado humanamente
- [ ] Testes adequados incluídos
- [ ] Documentação atualizada (se necessário)
- [ ] Sem breaking changes não documentadas

### Issues do Elevare Agent

**Labels Importantes:**

| Label | Prioridade | Ação |
|-------|------------|------|
| `security` + `elevare-agent` | 🚨 CRÍTICA | Resolver imediatamente |
| `high-priority` + `elevare-agent` | ⚠️ ALTA | Resolver esta semana |
| `dependencies` + `elevare-agent` | 📦 MÉDIA | Revisar e planejar |
| `analysis` + `elevare-agent` | 📊 BAIXA | Informativo |

### Comandos de Manutenção

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências menores
npm update

# Verificar pacotes desatualizados
npm outdated

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📊 Workflows - Resumo

| Workflow | Quando | O que faz |
|----------|--------|-----------|
| **PR Validation** | Ao abrir/atualizar PR | Valida código, testes, TS |
| **Weekly Milestone** | Segundas 00:00 | Cria milestone semanal |
| **Issue Analysis** | Diário 06:00 | Analisa e agrupa issues |
| **Auto Updates** | Sextas 10:00 | Verifica atualizações |
| **Report Update** | Diário 00:00 | Atualiza estatísticas |

## 🔍 Troubleshooting Rápido

### Workflow Não Executa
```bash
# Verificar sintaxe YAML
yamllint .github/workflows/*.yml

# Verificar permissões
# Settings → Actions → General → Workflow permissions
```

### Testes Falhando no CI
```bash
# Comparar versões
node --version  # Local
# vs Node 18 no CI

# Testar com mesma configuração do CI
docker run -v $(pwd):/app -w /app node:18 npm test
```

### Relatório Não Atualiza
```bash
# Executar workflow manualmente
# Actions → Elevare Report Update → Run workflow
```

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `.github/ELEVARE_AGENT_REPORT.md` | Relatório principal |
| `.github/ELEVARE_AGENT_DOCUMENTATION.md` | Documentação completa |
| `.github/BRANCH_PROTECTION_GUIDE.md` | Guia de proteção |
| `.github/workflows/elevare-*.yml` | Workflows do agente |

## 🎯 Critérios de Aprovação

```
✅ Testes: 100% passando
✅ TypeScript: 0 erros
✅ Segredos: 0 vazamentos
⚠️ Lint: 0 erros (se configurado)
⚠️ Warnings: Mínimo possível
```

## 📞 Obtendo Ajuda

1. **Documentação**: `.github/ELEVARE_AGENT_DOCUMENTATION.md`
2. **Issues**: Abra com label `elevare-agent` + `question`
3. **Logs**: Actions tab → selecione workflow → view logs

## 🔗 Links Rápidos

- [Ver Relatório Atual](.github/ELEVARE_AGENT_REPORT.md)
- [Documentação Completa](.github/ELEVARE_AGENT_DOCUMENTATION.md)
- [Configurar Proteção](.github/BRANCH_PROTECTION_GUIDE.md)
- [Actions Dashboard](../../actions)
- [Branch Protection](../../settings/branches)

---

**Dica**: Mantenha este guia aberto durante o desenvolvimento! 📌
