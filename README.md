# meu-backend

Backend NestJS com integração Firebase.

## 🚀 Automação Elevare

Este projeto inclui **automação completa** para desenvolvimento automatizado do backend (~70-75%).

### Quick Start - Automação

```bash
# Execute toda a automação em um comando
bash elevare-auto-agent-full-run.sh

# Visualize os resultados
cat .elevare_validation_report/FINAL_SUMMARY.md
```

**O que a automação faz:**
- ✅ Instala dependências e configura ferramentas
- ✅ Executa lint (ESLint) e formatação (Prettier)
- ✅ Analisa e otimiza dependências
- ✅ Harmoniza estrutura de rotas, serviços e logs
- ✅ Valida DTOs e scaffolding
- ✅ Verifica segurança básica (helmet, throttler, bcrypt)
- ✅ Compila projeto para produção
- ✅ Gera relatórios de integridade

📚 **Documentação da Automação:**
- [ELEVARE_AUTOMATION_README.md](./ELEVARE_AUTOMATION_README.md) - Guia completo
- [QUICK_START.md](./QUICK_START.md) - Referência rápida
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Detalhes de implementação

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

## Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start:prod` — inicia em modo produção
- `npm run test` — executa os testes

## Automação Scripts
- `bash elevare-auto-agent-full-run.sh` — executa automação completa
- `bash elevare_auto_fix.sh` — análise de dependências
- `bash vsc_adiante.sh` — harmonização de estrutura
- `bash auto_fix_and_pr.sh --scaffold-dtos` — scaffolding de DTOs
- `bash auto_fix_and_pr.sh --security-basic` — hardening de segurança
- `bash test-automation.sh` — testa todos os scripts

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)

---

> Projeto criado por Carine01
