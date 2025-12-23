# meu-backend

Backend NestJS com integração Firebase.

> 🤖 **Protegido pelo Elevare Agent** - Sistema automatizado de revisão de código e garantia de qualidade

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

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [🤖 Elevare Agent](.github/ELEVARE_AGENT_DOCUMENTATION.md) - Sistema de revisão automatizada

## 🤖 Elevare Agent

Este repositório é protegido pelo **Elevare Agent**, um sistema automatizado que:

- ✅ Valida automaticamente todos os PRs
- 🔒 Previne merge de código com problemas
- 🐛 Cria issues automáticas para problemas detectados
- 📊 Gera relatórios de qualidade
- 📅 Organiza trabalho em milestones semanais

**Para desenvolvedores**: Consulte o [Guia Rápido](.github/ELEVARE_QUICK_REFERENCE.md) antes de abrir PRs.

**Para mantenedores**: Veja a [Documentação Completa](.github/ELEVARE_AGENT_DOCUMENTATION.md) e o [Guia de Proteção](.github/BRANCH_PROTECTION_GUIDE.md).

### Status do Projeto

Consulte o [Relatório do Elevare Agent](.github/ELEVARE_AGENT_REPORT.md) para métricas atualizadas de qualidade.

---

> Projeto criado por Carine01
