# meu-backend

Backend NestJS com integração Firebase.

## 📊 Relatório de Progresso dos Agentes

**Novo!** Veja o [Relatório Consolidado dos Agentes](RELATORIO_AGENTES.md) para entender tudo que já foi realizado automaticamente no projeto (70-85% concluído).

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

### Documentação do Projeto
- **[RELATORIO_AGENTES.md](RELATORIO_AGENTES.md)** - Relatório consolidado de tudo que os agentes já fizeram
- **[AGENTES_GITHUB.md](AGENTES_GITHUB.md)** 🤖 - 8 Agentes de automação CI/CD (TypeScript Guardian, Security Audit, etc.)
- **[RELATORIO_STATUS_PROGRAMADOR.md](RELATORIO_STATUS_PROGRAMADOR.md)** - Status atual para programadores (85% pronto)
- **[COMANDOS_PROGRAMADOR.md](COMANDOS_PROGRAMADOR.md)** - Comandos prontos para executar
- **[GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)** - Guia completo de deploy
- **[CHECKLIST_DEPLOY.md](CHECKLIST_DEPLOY.md)** - Checklist pré-deploy
- **[SECURITY.md](SECURITY.md)** - Política de segurança

### Documentação Externa
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)

---

> Projeto criado por Carine01
