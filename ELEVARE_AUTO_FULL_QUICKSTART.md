# Elevare Super-Agent Auto-Full - Quick Start

## 🚀 Execução Rápida

### Opção 1: GitHub Actions (Recomendado)

1. Vá para a aba **Actions** no GitHub
2. Selecione **Elevare Super-Agent Auto-Full**
3. Clique em **Run workflow**
4. Selecione a branch desejada
5. Clique em **Run workflow**

✅ O workflow irá:
- Criar backup automático
- Executar lint e formatação
- Corrigir imports e dependências
- Validar DTOs e segurança
- Gerar relatórios completos
- Fazer commit e push automaticamente

📊 **Relatórios disponíveis em**: Actions → Workflow executado → Artifacts → "elevare-validation-reports"

### Opção 2: Execução Local

```bash
# 1. Instalar dependências (se necessário)
npm install --legacy-peer-deps

# 2. Executar todos os scripts
bash elevare_auto_fix.sh --auto-remove-unused
bash vsc_adiante.sh
bash auto_fix_and_pr.sh --scaffold-dtos
bash auto_fix_and_pr.sh --security-basic

# 3. (Opcional) Gerar relatórios locais
mkdir -p .elevare_validation_report
ESLINT_USE_FLAT_CONFIG=false npx eslint . -f json > .elevare_validation_report/eslint.json
npx depcheck --json > .elevare_validation_report/depcheck.json
npx tsc --noEmit > .elevare_validation_report/tsc.out 2>&1
npm test -- --passWithNoTests > .elevare_validation_report/test.out 2>&1
```

## 📋 Scripts Disponíveis

### `elevare_auto_fix.sh`
**Correção de dependências e imports**
```bash
bash elevare_auto_fix.sh --auto-remove-unused
```
- ✓ Verifica dependências não utilizadas
- ✓ Deduplica dependências npm
- ✓ Gera relatório de análise

### `vsc_adiante.sh`
**Harmonização de estrutura NestJS**
```bash
bash vsc_adiante.sh
```
- ✓ Valida estrutura de módulos
- ✓ Verifica controllers e services
- ✓ Lista componentes faltantes

### `auto_fix_and_pr.sh`
**Validação e segurança**
```bash
# Validar DTOs
bash auto_fix_and_pr.sh --scaffold-dtos

# Verificar segurança
bash auto_fix_and_pr.sh --security-basic

# Ambos
bash auto_fix_and_pr.sh --scaffold-dtos --security-basic
```
- ✓ Valida decorators de validação em DTOs
- ✓ Verifica configurações de segurança
- ✓ Detecta possíveis secrets hardcoded
- ✓ Analisa vulnerabilidades SQL

## 🎯 Comandos Úteis

```bash
# Lint e formatação manual
ESLINT_USE_FLAT_CONFIG=false npx eslint . --fix
npx prettier --write .

# Build do projeto
npm run build

# Executar testes
npm test

# Verificar dependências vulneráveis
npm audit
```

## 📊 Status do Projeto

Após executar os scripts, você verá:
- ✅ **Integridade**: ~75%
- 📝 **Relatórios**: Gerados em `.elevare_validation_report/`
- 🔒 **Segurança**: Verificações aplicadas
- 🧪 **Testes**: Executados com status

## ⚠️ Pendências Conhecidas

- [ ] DTOs completos com Zod/Yup
- [ ] Tratamento de erros centralizado
- [ ] Testes reais (Stripe, Firebase)
- [ ] Cobertura de testes >80%
- [ ] Documentação Swagger completa
- [ ] Revisão de segurança final

## 🆘 Troubleshooting

### ESLint não funciona
```bash
ESLINT_USE_FLAT_CONFIG=false npx eslint .
```

### npm install falha
```bash
npm install --legacy-peer-deps
```

### Build falha
✅ Normal - revise `.elevare_validation_report/tsc.out`

## 📚 Documentação Completa

Consulte `ELEVARE_AUTO_FULL_DOCUMENTATION.md` para detalhes completos.
